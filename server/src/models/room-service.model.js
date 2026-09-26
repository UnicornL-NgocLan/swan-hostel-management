// src/models/room-service.model.js
const mongoose = require('mongoose');

/**
 * Dịch vụ gắn với từng phòng cụ thể.
 * Giá có thể khác defaultPrice của service catalog.
 */
const roomServiceSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    price:     { type: Number, required: true, min: 0 },
    startDate: { type: Date, default: Date.now },
    endDate:   { type: Date },
    isActive:  { type: Boolean, default: true },
    note:      { type: String },
  },
  { timestamps: true }
);

roomServiceSchema.index({ roomId: 1, isActive: 1 });
roomServiceSchema.index({ serviceId: 1 });

module.exports = mongoose.model('RoomService', roomServiceSchema);
