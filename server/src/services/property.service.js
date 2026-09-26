// src/services/property.service.js
const Property = require('../models/property.model');
const Floor = require('../models/floor.model');
const Room = require('../models/room.model');

/**
 * Lấy danh sách cơ sở (có tóm tắt phòng)
 */
const getAll = async () => {
  const properties = await Property.find({ isActive: true }).sort({ createdAt: -1 });

  // Đếm phòng theo từng status cho mỗi property
  const propertyIds = properties.map((p) => p._id);
  const roomStats = await Room.aggregate([
    { $match: { propertyId: { $in: propertyIds }, isActive: true } },
    { $group: { _id: { propertyId: '$propertyId', status: '$status' }, count: { $sum: 1 } } },
  ]);

  // Map stats vào từng property
  const statsMap = {};
  for (const s of roomStats) {
    const pid = s._id.propertyId.toString();
    if (!statsMap[pid]) statsMap[pid] = { total: 0, AVAILABLE: 0, OCCUPIED: 0, RESERVED: 0, MAINTENANCE: 0 };
    statsMap[pid][s._id.status] = s.count;
    statsMap[pid].total += s.count;
  }

  return properties.map((p) => ({
    ...p.toObject(),
    roomStats: statsMap[p._id.toString()] || { total: 0, AVAILABLE: 0, OCCUPIED: 0, RESERVED: 0, MAINTENANCE: 0 },
  }));
};

/**
 * Lấy chi tiết 1 cơ sở
 */
const getById = async (id) => {
  const property = await Property.findById(id);
  if (!property || !property.isActive) {
    const err = new Error('Cơ sở không tồn tại.');
    err.statusCode = 404;
    throw err;
  }
  return property;
};

/**
 * Tạo cơ sở
 */
const create = async (data) => {
  const property = await Property.create(data);
  return property;
};

/**
 * Cập nhật cơ sở
 */
const update = async (id, data) => {
  const property = await Property.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  );
  if (!property) {
    const err = new Error('Cơ sở không tồn tại.');
    err.statusCode = 404;
    throw err;
  }
  return property;
};

/**
 * Soft delete
 */
const remove = async (id) => {
  const property = await Property.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!property) {
    const err = new Error('Cơ sở không tồn tại.');
    err.statusCode = 404;
    throw err;
  }
};

module.exports = { getAll, getById, create, update, remove };
