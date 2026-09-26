// src/models/expense.model.js
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    type: { type: String, enum: ['INCOME', 'EXPENSE'], required: true },
    category: { type: String, required: true }, // VD: Sửa chữa, Vệ sinh, Điện chung, Lãi suất, Khác
    amount: { type: Number, required: true, min: 0 },
    expenseDate: { type: Date, default: Date.now, required: true },
    description: { type: String, required: true },
    paymentMethod: { type: String, enum: ['CASH', 'TRANSFER'], default: 'CASH' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

expenseSchema.index({ propertyId: 1, expenseDate: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
