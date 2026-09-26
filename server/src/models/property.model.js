// src/models/property.model.js
const mongoose = require('mongoose');
const { PRICING_TYPE } = require('../constants');

const bankAccountSchema = new mongoose.Schema({
  bankCode:      { type: String, required: true },   // e.g. "VCB", "TCB"
  accountNumber: { type: String, required: true },
  accountName:   { type: String, required: true },
  branch:        { type: String },
}, { _id: false });

const tierSchema = new mongoose.Schema({
  from:  { type: Number, required: true }, // kWh / m³ từ
  to:    { type: Number },                 // kWh / m³ đến (null = unlimited)
  price: { type: Number, required: true }, // đơn giá
}, { _id: false });

const pricingSchema = new mongoose.Schema({
  type:       { type: String, enum: Object.values(PRICING_TYPE), default: PRICING_TYPE.FIXED },
  fixedPrice: { type: Number, default: 0 },
  tiers:      [tierSchema],
}, { _id: false });

const propertySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên cơ sở là bắt buộc'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Mã cơ sở là bắt buộc'],
      trim: true,
      uppercase: true,
    },
    address: { type: String, trim: true },
    owner: {
      name:  { type: String, trim: true },
      phone: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
    },
    logo: { type: String }, // URL
    bankAccounts: [bankAccountSchema],
    electricityPricing: { type: pricingSchema, default: () => ({}) },
    waterPricing:       { type: pricingSchema, default: () => ({}) },
    note: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Unique: code trong toàn hệ thống
propertySchema.index({ code: 1 }, { unique: true });

module.exports = mongoose.model('Property', propertySchema);
