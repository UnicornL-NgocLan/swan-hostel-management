// src/models/meter.model.js
const mongoose = require('mongoose');
const { METER_TYPE } = require('../constants');

const meterSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(METER_TYPE),
      required: true,
    },
    meterCode: { type: String, trim: true },
    initialReading: { type: Number, default: 0, min: 0 },
    installedDate: { type: Date, default: Date.now },
    removedDate: { type: Date },
    isActive: { type: Boolean, default: true },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

meterSchema.index({ roomId: 1, type: 1 });

module.exports = mongoose.model('Meter', meterSchema);
