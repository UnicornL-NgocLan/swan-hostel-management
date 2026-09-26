// src/services/checkout.service.js
const mongoose = require('mongoose');
const Contract = require('../models/contract.model');
const Room = require('../models/room.model');
const Invoice = require('../models/invoice.model');
const Deposit = require('../models/deposit.model');
const Meter = require('../models/meter.model');
const MeterReading = require('../models/meter-reading.model');
const invoiceService = require('./invoice.service');
const meterService = require('./meter.service');
const { CONTRACT_STATUS, ROOM_STATUS, INVOICE_STATUS, DEPOSIT_STATUS, METER_TYPE } = require('../constants');
const dayjs = require('dayjs');

/**
 * Checkout Preview
 * Tính toán các chi phí cuối cùng trước khi chính thức trả phòng.
 * Không ghi vào DB.
 */
const previewCheckout = async (contractId, checkoutDate, finalMeterReadings) => {
  const contract = await Contract.findById(contractId)
    .populate('roomId')
    .populate('propertyId');
    
  if (!contract) throw Object.assign(new Error('Hợp đồng không tồn tại.'), { statusCode: 404 });
  if (contract.status !== CONTRACT_STATUS.ACTIVE) {
    throw Object.assign(new Error('Chỉ có thể trả phòng cho hợp đồng đang hoạt động.'), { statusCode: 400 });
  }

  const date = dayjs(checkoutDate);
  const billingPeriod = date.format('YYYY-MM');
  const property = contract.propertyId;

  // 1. Tiền thuê phòng (Không chia tỷ lệ theo ngày)
  const rentAmount = 0;

  // 2. Tính điện nước (chỉ số cuối cùng do user nhập)
  let electricityCost = 0;
  let waterCost = 0;
  let electricityConsumption = 0;
  let waterConsumption = 0;

  const meters = await Meter.find({ roomId: contract.roomId._id, isActive: true });
  const meterCosts = [];

  for (const meter of meters) {
    const isElec = meter.type === METER_TYPE.ELECTRICITY;
    const finalReading = isElec ? finalMeterReadings.electricity : finalMeterReadings.water;
    
    // Nếu có nhập chỉ số
    if (finalReading !== undefined && finalReading !== null) {
      const previousReading = await meterService.getPreviousReading(meter._id, billingPeriod);
      const consumption = Math.max(0, finalReading - previousReading);
      
      const pricing = isElec ? property.electricityPricing : property.waterPricing;
      const unitPrice = pricing?.fixedPrice || 0;
      const cost = consumption * unitPrice;

      if (isElec) {
        electricityCost = cost;
        electricityConsumption = consumption;
      } else {
        waterCost = cost;
        waterConsumption = consumption;
      }

      meterCosts.push({
        type: isElec ? 'ELECTRICITY' : 'WATER',
        previous: previousReading,
        current: finalReading,
        consumption,
        unitPrice,
        amount: cost
      });
    }
  }

  // 3. Tiền nợ cũ (các hóa đơn chưa thanh toán hết)
  const unpaidInvoices = await Invoice.find({
    contractId: contract._id,
    status: { $in: [INVOICE_STATUS.ISSUED, INVOICE_STATUS.PARTIAL, INVOICE_STATUS.OVERDUE] }
  });
  
  const totalDebt = unpaidInvoices.reduce((sum, inv) => sum + inv.balanceAmount, 0);

  // 4. Tiền cọc đang giữ
  const deposits = await Deposit.find({ contractId: contract._id, status: DEPOSIT_STATUS.HELD });
  const totalDepositHeld = deposits.reduce((sum, d) => sum + d.amount, 0);

  // 5. Tổng kết
  const finalInvoiceSubtotal = rentAmount + electricityCost + waterCost;
  const finalBalance = totalDebt + finalInvoiceSubtotal - totalDepositHeld;

  return {
    contractId: contract._id,
    roomId: contract.roomId._id,
    roomCode: contract.roomId.code,
    checkoutDate,
    rentAmount,
    electricity: { consumption: electricityConsumption, cost: electricityCost },
    water: { consumption: waterConsumption, cost: waterCost },
    meterDetails: meterCosts,
    finalInvoiceSubtotal,
    totalDebt,
    totalDepositHeld,
    finalBalance, // > 0: khách phải đóng thêm; < 0: hoàn trả lại khách
  };
};

/**
 * Thực hiện trả phòng (Settlement)
 */
const performCheckout = async (contractId, data, userId) => {
  const session = await mongoose.startSession();
  // session.startTransaction();

  try {
    const contract = await Contract.findById(contractId).session(session);
    if (!contract) throw Object.assign(new Error('Hợp đồng không tồn tại.'), { statusCode: 404 });
    if (contract.status !== CONTRACT_STATUS.ACTIVE) {
      throw Object.assign(new Error('Chỉ có thể trả phòng cho hợp đồng đang hoạt động.'), { statusCode: 400 });
    }

    const { checkoutDate, finalMeterReadings, deductAmount, refundAmount, note } = data;
    const date = dayjs(checkoutDate);
    const billingPeriod = date.format('YYYY-MM');

    // 1. Chốt điện nước
    await meterService.createReading({
      roomId: contract.roomId,
      billingPeriod,
      electricityReading: finalMeterReadings?.electricity,
      waterReading: finalMeterReadings?.water,
      readingDate: checkoutDate
    });

    // 2. Tính hóa đơn cuối cùng (nếu cần thiết, dựa trên hàm tạo hóa đơn)
    // Để đơn giản, ở đây ta sử dụng invoiceService.createForRoom sau khi đã có meter readings
    // Tuy nhiên, tiền phòng cần tính theo số ngày. CreateForRoom mặc định tính full tháng.
    // Do đó, cần truyền options (hoặc tự build hóa đơn cuối). Ta sẽ tự build Invoice.
    
    // 3. Xử lý tiền cọc
    const deposits = await Deposit.find({ contractId: contract._id, status: DEPOSIT_STATUS.HELD }).session(session);
    for (const deposit of deposits) {
      deposit.status = deductAmount >= deposit.amount ? DEPOSIT_STATUS.DEDUCTED : DEPOSIT_STATUS.REFUNDED;
      // Phân bổ hợp lý (đơn giản hóa)
      deposit.deductedAmount = deductAmount;
      deposit.refundedAmount = refundAmount;
      deposit.refundDate = new Date();
      deposit.refundNote = note;
      await deposit.save({ session });
    }

    // 4. Cập nhật Hợp đồng
    contract.status = CONTRACT_STATUS.TERMINATED; // Đã xong vòng đời
    contract.terminationDate = checkoutDate;
    contract.terminationNote = note;
    await contract.save({ session });

    // 5. Cập nhật Phòng
    await Room.findByIdAndUpdate(contract.roomId, { status: ROOM_STATUS.AVAILABLE }, { session });

    // await session.commitTransaction();
    return contract;
  } catch (err) {
    // await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

module.exports = { previewCheckout, performCheckout };
