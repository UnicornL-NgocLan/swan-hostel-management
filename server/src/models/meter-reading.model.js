// src/models/meter-reading.model.js
const mongoose = require('mongoose');

const { METER_TYPE } = require('../constants');

const meterReadingSchema = new mongoose.Schema(
  {
    roomId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Room',     required: true },
    meterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meter',    required: true },
    type:    { type: String, enum: Object.values(METER_TYPE), required: true },

    /**
     * billingPeriod: "2026-09" — kỳ thanh toán (năm-tháng)
     * Dùng để nhóm khi tạo hóa đơn hàng loạt
     */
    billingPeriod:   { type: String, required: true }, // YYYY-MM
    previousReading: { type: Number, required: true, min: 0 },
    currentReading:  { type: Number, required: true, min: 0 },
    consumption:     { type: Number }, // tự tính = current - previous
    readingDate:     { type: Date, default: Date.now },
    imageUrl:        { type: String },
    note:            { type: String },
  },
  { timestamps: true }
);

// Đảm bảo mỗi phòng chỉ có 1 reading/kỳ cho mỗi đồng hồ
meterReadingSchema.index({ meterId: 1, billingPeriod: 1 }, { unique: true });
meterReadingSchema.index({ roomId: 1, billingPeriod: 1 });

// Tự tính consumption trước khi lưu
meterReadingSchema.pre('save', function () {
  this.consumption = Math.max(0, this.currentReading - this.previousReading);
});

module.exports = mongoose.model('MeterReading', meterReadingSchema);
