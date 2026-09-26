// src/controllers/expense.controller.js
const Expense = require('../models/expense.model');
const { successResponse } = require('../utils/response.utils');

const getAll = async (req, res) => {
  const { propertyId, type, month } = req.query;
  const filter = {};
  if (propertyId) filter.propertyId = propertyId;
  if (type) filter.type = type;
  if (month) {
    const start = new Date(`${month}-01`);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59);
    filter.expenseDate = { $gte: start, $lte: end };
  }

  const expenses = await Expense.find(filter)
    .populate('createdBy', 'fullName')
    .sort({ expenseDate: -1 });
  successResponse(res, expenses);
};

const create = async (req, res) => {
  const expense = await Expense.create({
    ...req.body,
    createdBy: req.user._id,
  });
  successResponse(res, expense, 'Tạo phiếu thu/chi thành công', 201);
};

const remove = async (req, res) => {
  const expense = await Expense.findByIdAndDelete(req.params.id);
  if (!expense) throw Object.assign(new Error('Phiếu không tồn tại'), { statusCode: 404 });
  successResponse(res, null, 'Đã xóa phiếu thu/chi');
};

module.exports = { getAll, create, remove };
