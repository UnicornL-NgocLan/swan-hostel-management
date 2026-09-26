// src/models/invoice.model.js
const mongoose = require('mongoose');
const { INVOICE_STATUS } = require('../constants');

const lineSchema = new mongoose.Schema({
  type:        { type: String, required: true }, // 'RENT','ELECTRICITY','WATER','SERVICE','OTHER','DISCOUNT'
  name:        { type: String, required: true },
  quantity:    { type: Number, default: 1 },
  unitPrice:   { type: Number, required: true },
  amount:      { type: Number, required: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId }, // meterReadingId / roomServiceId
}, { _id: false });

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNo:  { type: String, required: true, unique: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    roomId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Room',     required: true },
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },
    tenantId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant',   required: true },

    billingPeriod: { type: String, required: true }, // "YYYY-MM"
    issueDate:     { type: Date, required: true, default: Date.now },
    dueDate:       { type: Date, required: true },

    lines: [lineSchema],

    subtotal:      { type: Number, required: true, default: 0 },
    discount:      { type: Number, default: 0 },
    totalAmount:   { type: Number, required: true },
    paidAmount:    { type: Number, default: 0 },
    balanceAmount: { type: Number, default: 0 }, // = totalAmount - paidAmount

    status: {
      type: String,
      enum: Object.values(INVOICE_STATUS),
      default: INVOICE_STATUS.DRAFT,
    },

    note: { type: String },
  },
  { timestamps: true }
);

invoiceSchema.index({ roomId: 1, billingPeriod: 1 });
invoiceSchema.index({ contractId: 1 });
invoiceSchema.index({ tenantId: 1, status: 1 });
invoiceSchema.index({ propertyId: 1, status: 1 });
invoiceSchema.index({ dueDate: 1, status: 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
