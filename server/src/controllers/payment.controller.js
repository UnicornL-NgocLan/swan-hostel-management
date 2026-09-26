// src/controllers/payment.controller.js
const Payment = require('../models/payment.model');
const { successResponse } = require('../utils/response.utils');

const getAll = async (req, res) => {
  const { propertyId, month } = req.query;
  const filter = {};
  if (propertyId) filter.propertyId = propertyId;
  if (month) {
    const start = new Date(`${month}-01`);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59);
    filter.paymentDate = { $gte: start, $lte: end };
  }

  const payments = await Payment.find(filter)
    .populate('invoiceId', 'invoiceNo')
    .populate('roomId', 'code')
    .populate('tenantId', 'fullName phone')
    .populate('createdBy', 'fullName')
    .sort({ paymentDate: -1 });

  successResponse(res, payments);
};

module.exports = { getAll };
