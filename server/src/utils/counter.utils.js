// src/utils/counter.utils.js
const mongoose = require('mongoose');

/**
 * Tạo số thứ tự tự tăng cho contractNo, invoiceNo, v.v.
 * Dùng MongoDB findOneAndUpdate với atomic increment để tránh trùng.
 */

const counterSchema = new mongoose.Schema({
  _id:     { type: String, required: true }, // e.g. "contractNo"
  seq:     { type: Number, default: 0 },
});
const Counter = mongoose.model('Counter', counterSchema);

/**
 * @param {string} name  - tên counter (e.g. 'contractNo')
 * @param {string} prefix - tiền tố (e.g. 'HD')
 * @param {number} padLength - độ dài số (e.g. 5 → HD00001)
 * @returns {string}
 */
const nextCode = async (name, prefix = '', padLength = 5) => {
  const result = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `${prefix}${String(result.seq).padStart(padLength, '0')}`;
};

module.exports = { nextCode };
