// src/models/room.model.js
const mongoose = require('mongoose');
const { ROOM_STATUS } = require('../constants');

const roomSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    floorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Floor',
      default: null,
    },
    code: {
      type: String,
      required: [true, 'Mã phòng là bắt buộc'],
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      trim: true,
    },
    area: {
      type: Number, // m²
      min: 0,
    },
    capacity: {
      type: Number, // số người tối đa
      min: 1,
      default: 2,
    },
    rentAmount: {
      type: Number,
      required: [true, 'Giá thuê là bắt buộc'],
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(ROOM_STATUS),
      default: ROOM_STATUS.AVAILABLE,
    },
    note: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Unique: code trong cùng một property
roomSchema.index({ propertyId: 1, code: 1 }, { unique: true });
// Query nhanh theo propertyId + status
roomSchema.index({ propertyId: 1, status: 1 });
roomSchema.index({ floorId: 1 });

module.exports = mongoose.model('Room', roomSchema);
