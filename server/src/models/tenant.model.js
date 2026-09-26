// src/models/tenant.model.js
const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Họ tên là bắt buộc'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Số điện thoại là bắt buộc'],
      trim: true,
    },
    dateOfBirth: { type: Date },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
    },
    identityNumber: {
      type: String,
      trim: true,
      // CCCD 12 số hoặc CMND 9 số
    },
    identityIssueDate:  { type: Date },
    identityIssuePlace: { type: String, trim: true },
    identityFrontImg:   { type: String }, // URL ảnh CCCD mặt trước
    identityBackImg:    { type: String }, // URL ảnh CCCD mặt sau

    hometown:         { type: String, trim: true },
    permanentAddress: { type: String, trim: true },
    zalo:             { type: String, trim: true },
    vehiclePlate:     { type: String, trim: true },
    email:            { type: String, trim: true, lowercase: true },
    documents:        [{ type: String }], // Array of document URLs
    note:             { type: String },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index tìm kiếm theo tên / SĐT / CCCD
tenantSchema.index({ phone: 1 });
tenantSchema.index({ identityNumber: 1 });
tenantSchema.index({ fullName: 'text' });

module.exports = mongoose.model('Tenant', tenantSchema);
