// src/models/audit-log.model.js
const mongoose = require('mongoose');
const { AUDIT_ACTIONS } = require('../constants');

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: Object.values(AUDIT_ACTIONS),
      required: true,
    },
    entityType: {
      type: String,
      required: true, // e.g. 'Invoice', 'Payment', 'Contract'
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    before: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    after: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    note: {
      type: String,
    },
  },
  {
    timestamps: true,
    // Chỉ tạo, không update AuditLog
  }
);

// Index để query theo entity
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
