// src/services/dashboard.service.js
const Property = require('../models/property.model');
const Room = require('../models/room.model');
const Contract = require('../models/contract.model');
const Invoice = require('../models/invoice.model');
const Deposit = require('../models/deposit.model');
const { ROOM_STATUS, CONTRACT_STATUS, INVOICE_STATUS, DEPOSIT_STATUS } = require('../constants');

const getOverview = async () => {
  const propertyCount = await Property.countDocuments({ isActive: true });
  const roomCount = await Room.countDocuments({ isActive: true });
  
  const occupiedRoomCount = await Room.countDocuments({ status: ROOM_STATUS.OCCUPIED, isActive: true });
  const availableRoomCount = await Room.countDocuments({ status: ROOM_STATUS.AVAILABLE, isActive: true });
  const maintenanceRoomCount = await Room.countDocuments({ status: ROOM_STATUS.MAINTENANCE, isActive: true });

  const activeContracts = await Contract.countDocuments({ status: { $in: [CONTRACT_STATUS.ACTIVE, CONTRACT_STATUS.RENEWED] } });

  // Doanh thu (hóa đơn PAID hoặc PARTIAL) trong tháng này
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);
  
  const currentMonthInvoices = await Invoice.find({
    issueDate: { $gte: startOfMonth, $lte: endOfMonth },
    status: { $ne: INVOICE_STATUS.VOID }
  });

  const currentMonthRevenue = currentMonthInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const currentMonthExpected = currentMonthInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  // Tổng nợ
  const debtInvoices = await Invoice.find({
    status: { $in: [INVOICE_STATUS.ISSUED, INVOICE_STATUS.PARTIAL, INVOICE_STATUS.OVERDUE] }
  });
  const totalDebt = debtInvoices.reduce((sum, inv) => sum + inv.balanceAmount, 0);

  // Tổng tiền cọc đang giữ
  const heldDeposits = await Deposit.find({ status: DEPOSIT_STATUS.HELD });
  const totalDepositHeld = heldDeposits.reduce((sum, d) => sum + d.amount, 0);

  // Hóa đơn quá hạn (trạng thái là OVERDUE hoặc đã qua ngày hạn mà chưa trả đủ)
  const overdueInvoicesCount = await Invoice.countDocuments({
    $or: [
      { status: INVOICE_STATUS.OVERDUE },
      {
        status: { $in: [INVOICE_STATUS.ISSUED, INVOICE_STATUS.PARTIAL] },
        dueDate: { $lt: new Date() }
      }
    ]
  });

  return {
    propertyCount,
    roomCount,
    occupiedRoomCount,
    availableRoomCount,
    maintenanceRoomCount,
    activeContracts,
    currentMonthRevenue,
    currentMonthExpected,
    totalDebt,
    totalDepositHeld,
    overdueInvoicesCount,
  };
};

module.exports = { getOverview };
