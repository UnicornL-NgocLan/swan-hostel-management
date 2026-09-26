// src/services/floor.service.js
const Floor = require('../models/floor.model');
const Room = require('../models/room.model');

/**
 * Lấy danh sách tầng của một property
 */
const getByProperty = async (propertyId) => {
  return Floor.find({ propertyId, isActive: true }).sort({ sortOrder: 1, name: 1 });
};

/**
 * Tạo tầng
 */
const create = async (propertyId, data) => {
  return Floor.create({ ...data, propertyId });
};

/**
 * Sửa tầng
 */
const update = async (id, data) => {
  const floor = await Floor.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
  if (!floor) {
    const err = new Error('Tầng không tồn tại.'); err.statusCode = 404; throw err;
  }
  return floor;
};

/**
 * Xóa tầng (chỉ khi không còn phòng active)
 */
const remove = async (id) => {
  const roomCount = await Room.countDocuments({ floorId: id, isActive: true });
  if (roomCount > 0) {
    const err = new Error(`Tầng này còn ${roomCount} phòng. Vui lòng chuyển phòng sang tầng khác trước.`);
    err.statusCode = 400;
    throw err;
  }
  await Floor.findByIdAndUpdate(id, { isActive: false });
};

module.exports = { getByProperty, create, update, remove };
