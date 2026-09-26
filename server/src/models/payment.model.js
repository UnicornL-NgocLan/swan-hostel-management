// src/models/payment.model.js
const mongoose = require('mongoose');
const { PAYMENT_METHOD } = require('../constants');

const paymentSchema = new mongoose.Schema(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    invoiceId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice',  required: true },
    roomId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Room',     required: true },
    tenantId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant',   required: true },
    createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true },

    amount:      { type: Number, required: true, min: 1 },
    paymentDate: { type: Date,   required: true, default: Date.now },
    method: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      default: PAYMENT_METHOD.CASH,
    },
    reference: { type: String, trim: true }, // mã GD ngân hàng
    note:      { type: String },
  },
  { timestamps: true }
);

paymentSchema.index({ invoiceId: 1 });
paymentSchema.index({ tenantId: 1 });
paymentSchema.index({ propertyId: 1, paymentDate: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
