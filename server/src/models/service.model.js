// src/models/service.model.js
const mongoose = require('mongoose');
const { BILLING_TYPE } = require('../constants');

const serviceSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    name:         { type: String, required: true, trim: true }, // VD: "WiFi", "Giữ xe", "Rác"
    code:         { type: String, trim: true, uppercase: true },
    defaultPrice: { type: Number, required: true, min: 0 },
    billingType: {
      type: String,
      enum: Object.values(BILLING_TYPE),
      default: BILLING_TYPE.FIXED,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

serviceSchema.index({ propertyId: 1, isActive: 1 });

module.exports = mongoose.model('Service', serviceSchema);
