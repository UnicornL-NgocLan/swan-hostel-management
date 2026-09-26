// src/models/contract.model.js
const mongoose = require('mongoose');
const { CONTRACT_STATUS } = require('../constants');

const occupantSchema = new mongoose.Schema({
  tenantId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  relationship: { type: String, trim: true }, // e.g. "Vợ/Chồng", "Con cái", "Bạn cùng phòng"
}, { _id: false });

const contractSchema = new mongoose.Schema(
  {
    contractNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    primaryTenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
    occupants: [occupantSchema], // Người ở cùng (không phải chủ hợp đồng)
    customFees: [{
      name: { type: String, required: true },
      amount: { type: Number, required: true, min: 0 }
    }], // Định phí cố định (wifi, rác, v.v.)

    startDate: { type: Date, required: true },
    endDate:   { type: Date },           // null = hợp đồng dài hạn không xác định

    // Lưu snapshot tại thời điểm ký — không đổi theo giá phòng hiện tại
    rentAmount:     { type: Number, required: true },
    depositAmount:  { type: Number, default: 0 },
    paymentDueDay:  { type: Number, default: 5, min: 1, max: 31 }, // ngày đóng tiền hàng tháng, 31 = cuối tháng

    status: {
      type: String,
      enum: Object.values(CONTRACT_STATUS),
      default: CONTRACT_STATUS.ACTIVE,
    },

    // Ghi chú khi thanh lý
    terminationDate: { type: Date },
    terminationNote: { type: String },

    note: { type: String },
  },
  { timestamps: true }
);

// Index quan trọng
contractSchema.index({ roomId: 1, status: 1 });
contractSchema.index({ primaryTenantId: 1 });
contractSchema.index({ propertyId: 1, status: 1 });
contractSchema.index({ endDate: 1, status: 1 }); // để query hợp đồng sắp hết hạn

module.exports = mongoose.model('Contract', contractSchema);
