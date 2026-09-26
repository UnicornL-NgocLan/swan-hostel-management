// src/services/invoice.service.js
const mongoose = require('mongoose');
const Invoice = require('../models/invoice.model');
const Payment = require('../models/payment.model');
const Contract = require('../models/contract.model');
const Room = require('../models/room.model');
const MeterReading = require('../models/meter-reading.model');
const Meter = require('../models/meter.model');
const RoomService = require('../models/room-service.model');
const Property = require('../models/property.model');
const { nextCode } = require('../utils/counter.utils');
const { INVOICE_STATUS, CONTRACT_STATUS, METER_TYPE } = require('../constants');
const dayjs = require('dayjs');

/**
 * Tính số ngày ở thực tế trong tháng
 */
const calculateProratedRatio = (contract, billingPeriod) => {
  const [year, month] = billingPeriod.split('-').map(Number);
  const startOfMonth = dayjs(new Date(year, month - 1, 1)).startOf('day');
  const endOfMonth = startOfMonth.endOf('month').startOf('day');
  const daysInMonth = startOfMonth.daysInMonth();

  const cStart = dayjs(contract.startDate).startOf('day');
  const cEnd = contract.terminationDate ? dayjs(contract.terminationDate).startOf('day') 
             : (contract.endDate ? dayjs(contract.endDate).startOf('day') : null);

  // Nếu hợp đồng bắt đầu sau tháng này -> 0
  if (cStart.isAfter(endOfMonth)) return { ratio: 0, daysStayed: 0, daysInMonth };
  // Nếu hợp đồng kết thúc trước tháng này -> 0
  if (cEnd && cEnd.isBefore(startOfMonth)) return { ratio: 0, daysStayed: 0, daysInMonth };

  // Tính ngày bắt đầu tính tiền trong tháng
  const effectiveStart = cStart.isAfter(startOfMonth) ? cStart : startOfMonth;
  // Tính ngày kết thúc tính tiền trong tháng
  const effectiveEnd = (cEnd && cEnd.isBefore(endOfMonth)) ? cEnd : endOfMonth;

  const daysStayed = effectiveEnd.diff(effectiveStart, 'day') + 1;
  
  if (daysStayed >= daysInMonth) return { ratio: 1, daysStayed: daysInMonth, daysInMonth };
  return { ratio: daysStayed / daysInMonth, daysStayed, daysInMonth };
};

/**
 * Xây dựng các dòng hóa đơn cho một phòng trong kỳ
 */
const buildInvoiceLines = async (contract, billingPeriod) => {
  const lines = [];

  // 1. Tiền phòng (nguyên tháng)
  lines.push({
    type: 'RENT',
    name: `Tiền phòng tháng ${billingPeriod.split('-').reverse().join('/')}`,
    quantity: 1,
    unitPrice: contract.rentAmount,
    amount: contract.rentAmount,
  });

  // 2. Điện nước — lấy MeterReading của kỳ này (theo file thiết kế)
  const property = await Property.findById(contract.propertyId);
  const meters = await Meter.find({ roomId: contract.roomId, isActive: true });
  for (const meter of meters) {
    const reading = await MeterReading.findOne({ meterId: meter._id, billingPeriod });
    if (!reading || reading.consumption === 0) continue;
    const isElec = meter.type === METER_TYPE.ELECTRICITY;
    const label = isElec ? 'Tiền điện' : 'Tiền nước';
    const unit  = isElec ? 'kWh' : 'm³';
    const unitPrice = isElec 
      ? (property?.electricityPricing?.fixedPrice || 0)
      : (property?.waterPricing?.fixedPrice || 0);
    const amount = reading.consumption * unitPrice;
    lines.push({
      type: isElec ? 'ELECTRICITY' : 'WATER',
      name: `${label} tháng ${billingPeriod.split('-').reverse().join('/')} (${reading.previousReading} - ${reading.currentReading} ${unit})`,
      quantity: reading.consumption,
      unitPrice,
      amount,
      referenceId: reading._id,
    });
  }

  // 3. Dịch vụ phòng (nguyên giá)
  const roomServices = await RoomService.find({ roomId: contract.roomId, isActive: true }).populate('serviceId', 'name');
  for (const rs of roomServices) {
    lines.push({
      type: 'SERVICE',
      name: rs.serviceId?.name || 'Dịch vụ',
      quantity: 1,
      unitPrice: rs.price,
      amount: rs.price,
      referenceId: rs._id,
    });
  }

  // 4. Các định phí cố định khác (Wifi, Rác,...)
  if (contract.customFees && contract.customFees.length > 0) {
    for (const fee of contract.customFees) {
      lines.push({
        type: 'OTHER',
        name: fee.name,
        quantity: 1,
        unitPrice: fee.amount,
        amount: fee.amount,
      });
    }
  }

  return lines;
};

/**
 * Tạo hóa đơn cho một phòng (theo kỳ)
 */
const createForRoom = async (contractId, billingPeriod, options = {}) => {
  const contract = await Contract.findById(contractId);
  if (!contract) throw Object.assign(new Error('Hợp đồng không tồn tại.'), { statusCode: 404 });
  if (contract.status !== CONTRACT_STATUS.ACTIVE) {
    throw Object.assign(new Error('Hợp đồng không đang hoạt động.'), { statusCode: 400 });
  }

  // Kiểm tra đã có hóa đơn kỳ này chưa (không phải VOID)
  const existing = await Invoice.findOne({
    contractId,
    billingPeriod,
    status: { $ne: INVOICE_STATUS.VOID },
  });
  if (existing) {
    throw Object.assign(new Error(`Phòng đã có hóa đơn kỳ ${billingPeriod}.`), { statusCode: 409 });
  }

  const lines = options.lines && options.lines.length > 0 
    ? options.lines.map(l => ({ ...l, amount: l.unitPrice * (l.quantity !== undefined && l.quantity !== null ? Number(l.quantity) : 1) }))
    : await buildInvoiceLines(contract, billingPeriod);

  if (lines.length === 0) {
    throw Object.assign(new Error('Hợp đồng không phát sinh chi phí trong kỳ này.'), { statusCode: 400 });
  }
  const subtotal = lines.reduce((sum, l) => sum + l.amount, 0);
  const discount = options.discount || 0;
  const totalAmount = Math.max(0, subtotal - discount);

  // Ngày đến hạn = ngày paymentDueDay của tháng kỳ (kẹp vào cuối tháng nếu vượt quá)
  const [year, month] = billingPeriod.split('-').map(Number);
  let dueDateObj = dayjs(new Date(year, month - 1, 1));
  const daysInMonth = dueDateObj.daysInMonth();
  const actualDay = Math.min(contract.paymentDueDay, daysInMonth);
  const dueDate = dueDateObj.date(actualDay).toDate();

  const invoiceNo = await nextCode('invoiceNo', 'INV', 6);
  const invoice = await Invoice.create({
    invoiceNo,
    propertyId: contract.propertyId,
    roomId: contract.roomId,
    contractId,
    tenantId: contract.primaryTenantId,
    billingPeriod,
    issueDate: options.issueDate || new Date(),
    dueDate,
    lines,
    subtotal,
    discount,
    totalAmount,
    paidAmount: 0,
    balanceAmount: totalAmount,
    status: INVOICE_STATUS.ISSUED,
    note: options.note,
  });

  return invoice;
};

/**
 * Tạo hóa đơn hàng loạt cho tất cả phòng đang thuê của một property
 */
const bulkCreate = async (propertyId, billingPeriod) => {
  const contracts = await Contract.find({
    propertyId,
    status: { $in: [CONTRACT_STATUS.ACTIVE, CONTRACT_STATUS.RENEWED] },
  });

  const results = { success: [], failed: [] };
  for (const contract of contracts) {
    try {
      const inv = await createForRoom(contract._id, billingPeriod);
      results.success.push({ contractId: contract._id, invoiceId: inv._id, invoiceNo: inv.invoiceNo });
    } catch (err) {
      results.failed.push({ contractId: contract._id, reason: err.message });
    }
  }
  return results;
};

/**
 * Lấy danh sách hóa đơn
 */
const getAll = async (filters = {}) => {
  const query = {};
  if (filters.propertyId)   query.propertyId   = filters.propertyId;
  if (filters.roomId)       query.roomId       = filters.roomId;
  if (filters.status === 'OVERDUE') {
    query.$or = [
      { status: INVOICE_STATUS.OVERDUE },
      {
        status: { $in: [INVOICE_STATUS.ISSUED, INVOICE_STATUS.PARTIAL] },
        dueDate: { $lt: new Date() }
      }
    ];
  } else if (filters.status) {
    query.status = filters.status;
  }
  if (filters.billingPeriod) query.billingPeriod = filters.billingPeriod;

  return Invoice.find(query)
    .populate('roomId', 'code name')
    .populate('tenantId', 'fullName phone')
    .populate('contractId', 'contractNo')
    .sort({ createdAt: -1 });
};

/**
 * Lấy chi tiết hóa đơn
 */
const getById = async (id) => {
  const inv = await Invoice.findById(id)
    .populate('roomId', 'code name')
    .populate('tenantId', 'fullName phone identityNumber')
    .populate('contractId', 'contractNo paymentDueDay')
    .populate('propertyId', 'name bankAccounts owner');
  if (!inv) throw Object.assign(new Error('Hóa đơn không tồn tại.'), { statusCode: 404 });
  return inv;
};

/**
 * Thu tiền (ghi nhận thanh toán)
 */
const recordPayment = async (invoiceId, paymentData, userId) => {
  const session = await mongoose.startSession();
  // session.startTransaction();
  try {
    const invoice = await Invoice.findById(invoiceId).session(session);
    if (!invoice) throw Object.assign(new Error('Hóa đơn không tồn tại.'), { statusCode: 404 });
    if (invoice.status === INVOICE_STATUS.VOID) {
      throw Object.assign(new Error('Hóa đơn đã bị hủy.'), { statusCode: 400 });
    }
    if (invoice.status === INVOICE_STATUS.PAID) {
      throw Object.assign(new Error('Hóa đơn đã thanh toán đủ.'), { statusCode: 400 });
    }

    const amount = paymentData.amount;
    if (amount <= 0) throw Object.assign(new Error('Số tiền phải > 0.'), { statusCode: 400 });
    if (amount > invoice.balanceAmount) {
      throw Object.assign(new Error(`Số tiền thanh toán (${amount}) vượt quá số tiền còn lại (${invoice.balanceAmount}).`), { statusCode: 400 });
    }

    await Payment.create(
      [{
        propertyId: invoice.propertyId,
        invoiceId,
        roomId: invoice.roomId,
        tenantId: invoice.tenantId,
        createdBy: userId,
        amount,
        paymentDate: paymentData.paymentDate || new Date(),
        method: paymentData.method || 'CASH',
        reference: paymentData.reference,
        note: paymentData.note,
      }],
      { session }
    );

    invoice.paidAmount    += amount;
    invoice.balanceAmount -= amount;
    invoice.status = invoice.balanceAmount <= 0 ? INVOICE_STATUS.PAID : INVOICE_STATUS.PARTIAL;
    await invoice.save({ session });

    // await session.commitTransaction();
    return invoice;
  } catch (err) {
    // await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

/**
 * Hủy hóa đơn
 */
const voidInvoice = async (invoiceId) => {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) throw Object.assign(new Error('Hóa đơn không tồn tại.'), { statusCode: 404 });
  if (invoice.status === INVOICE_STATUS.PAID) {
    throw Object.assign(new Error('Không thể hủy hóa đơn đã thanh toán.'), { statusCode: 400 });
  }
  invoice.status = INVOICE_STATUS.VOID;
  return invoice.save();
};

/**
 * Cập nhật hóa đơn
 */
const update = async (id, data) => {
  const invoice = await Invoice.findById(id);
  if (!invoice) throw Object.assign(new Error('Hóa đơn không tồn tại.'), { statusCode: 404 });
  if (invoice.status === INVOICE_STATUS.PAID || invoice.status === INVOICE_STATUS.VOID) {
    throw Object.assign(new Error('Không thể sửa hóa đơn đã thanh toán hoặc đã hủy.'), { statusCode: 400 });
  }

  if (data.lines !== undefined) {
    const lines = data.lines.map(l => ({
      ...l,
      amount: l.unitPrice * (l.quantity !== undefined && l.quantity !== null ? Number(l.quantity) : 1)
    }));
    invoice.lines = lines;
    invoice.subtotal = lines.reduce((sum, l) => sum + l.amount, 0);
  }

  if (data.discount !== undefined) {
    invoice.discount = data.discount;
  }

  invoice.totalAmount = Math.max(0, invoice.subtotal - invoice.discount);
  invoice.balanceAmount = invoice.totalAmount - invoice.paidAmount;

  if (invoice.balanceAmount <= 0 && invoice.totalAmount > 0) invoice.status = INVOICE_STATUS.PAID;
  else if (invoice.paidAmount > 0) invoice.status = INVOICE_STATUS.PARTIAL;
  else invoice.status = INVOICE_STATUS.ISSUED;

  if (data.note !== undefined) invoice.note = data.note;
  if (data.dueDate !== undefined) invoice.dueDate = data.dueDate;

  return invoice.save();
};

/**
 * Preview hóa đơn
 */
const previewInvoice = async (contractId, billingPeriod) => {
  const contract = await Contract.findById(contractId);
  if (!contract) throw Object.assign(new Error('Hợp đồng không tồn tại.'), { statusCode: 404 });
  const lines = await buildInvoiceLines(contract, billingPeriod);
  const subtotal = lines.reduce((sum, l) => sum + l.amount, 0);
  return { lines, subtotal };
};

module.exports = { createForRoom, bulkCreate, getAll, getById, recordPayment, voidInvoice, update, buildInvoiceLines, previewInvoice };
