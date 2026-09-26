// src/models/notification.model.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    referenceType: { type: String }, // e.g. 'Invoice', 'Contract', 'Room'
    referenceId: { type: mongoose.Schema.Types.ObjectId },
    dueDate: { type: Date },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
