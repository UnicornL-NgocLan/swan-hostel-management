// src/models/deposit.model.js
const mongoose = require('mongoose');
const { DEPOSIT_STATUS } = require('../constants');

const depositSchema = new mongoose.Schema(
  {
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },

    amount:       { type: Number, required: true, min: 0 },
    receivedDate: { type: Date, required: true },

    status: {
      type: String,
      enum: Object.values(DEPOSIT_STATUS),
      default: DEPOSIT_STATUS.HELD,
    },

    // Khi trả phòng
    refundedAmount: { type: Number, default: 0 },
    deductedAmount: { type: Number, default: 0 },
    refundDate:     { type: Date },
    refundNote:     { type: String },

    note: { type: String },
  },
  { timestamps: true }
);

depositSchema.index({ contractId: 1 });
depositSchema.index({ tenantId: 1 });
depositSchema.index({ status: 1 });

module.exports = mongoose.model('Deposit', depositSchema);
