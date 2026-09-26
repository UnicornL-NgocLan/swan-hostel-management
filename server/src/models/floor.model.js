// src/models/floor.model.js
const mongoose = require('mongoose');

const floorSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Tên tầng là bắt buộc'],
      trim: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

floorSchema.index({ propertyId: 1, sortOrder: 1 });

module.exports = mongoose.model('Floor', floorSchema);
