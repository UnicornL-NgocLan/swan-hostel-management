// src/services/room.service.js
const Room = require('../models/room.model');
const { ROOM_STATUS } = require('../constants');

/**
 * Lấy danh sách phòng của một property
 */
const getByProperty = async (propertyId, filters = {}) => {
  const query = { propertyId, isActive: true };
  if (filters.status) {
    const statuses = filters.status.split(',');
    query.status = statuses.length > 1 ? { $in: statuses } : filters.status;
  }
  if (filters.floorId) query.floorId = filters.floorId;

  return Room.find(query)
    .populate('floorId', 'name sortOrder')
    .sort({ 'floorId.sortOrder': 1, code: 1 });
};

/**
 * Lấy chi tiết phòng
 */
const getById = async (id) => {
  const room = await Room.findById(id).populate('floorId', 'name').populate('propertyId', 'name code');
  if (!room || !room.isActive) {
    const err = new Error('Phòng không tồn tại.'); err.statusCode = 404; throw err;
  }
  return room;
};

/**
 * Tạo phòng
 */
const create = async (propertyId, data) => {
  return Room.create({ ...data, propertyId });
};

/**
 * Sửa thông tin phòng (không đổi status)
 */
const update = async (id, data) => {
  // Không cho phép cập nhật status trực tiếp qua đây
  const { status, ...safeData } = data;

  const room = await Room.findByIdAndUpdate(id, { $set: safeData }, { new: true, runValidators: true });
  if (!room) {
    const err = new Error('Phòng không tồn tại.'); err.statusCode = 404; throw err;
  }
  return room;
};

/**
 * Chuyển phòng sang RESERVED
 * Chỉ cho AVAILABLE → RESERVED
 */
const reserve = async (id) => {
  const room = await Room.findById(id);
  if (!room) { const err = new Error('Phòng không tồn tại.'); err.statusCode = 404; throw err; }
  if (room.status !== ROOM_STATUS.AVAILABLE) {
    const err = new Error(`Phòng đang ở trạng thái ${room.status}, không thể giữ chỗ.`);
    err.statusCode = 400; throw err;
  }
  room.status = ROOM_STATUS.RESERVED;
  return room.save();
};

/**
 * Hủy giữ chỗ: RESERVED → AVAILABLE
 */
const cancelReserve = async (id) => {
  const room = await Room.findById(id);
  if (!room) { const err = new Error('Phòng không tồn tại.'); err.statusCode = 404; throw err; }
  if (room.status !== ROOM_STATUS.RESERVED) {
    const err = new Error('Phòng chưa ở trạng thái giữ chỗ.'); err.statusCode = 400; throw err;
  }
  room.status = ROOM_STATUS.AVAILABLE;
  return room.save();
};

/**
 * Chuyển sang bảo trì: AVAILABLE → MAINTENANCE
 */
const startMaintenance = async (id) => {
  const room = await Room.findById(id);
  if (!room) { const err = new Error('Phòng không tồn tại.'); err.statusCode = 404; throw err; }
  if (room.status !== ROOM_STATUS.AVAILABLE) {
    const err = new Error(`Phòng đang ${room.status}, không thể chuyển sang bảo trì.`);
    err.statusCode = 400; throw err;
  }
  room.status = ROOM_STATUS.MAINTENANCE;
  return room.save();
};

/**
 * Hoàn thành bảo trì: MAINTENANCE → AVAILABLE
 */
const completeMaintenance = async (id) => {
  const room = await Room.findById(id);
  if (!room) { const err = new Error('Phòng không tồn tại.'); err.statusCode = 404; throw err; }
  if (room.status !== ROOM_STATUS.MAINTENANCE) {
    const err = new Error('Phòng chưa ở trạng thái bảo trì.'); err.statusCode = 400; throw err;
  }
  room.status = ROOM_STATUS.AVAILABLE;
  return room.save();
};

/**
 * Soft delete phòng (không xóa nếu đang OCCUPIED)
 */
const remove = async (id) => {
  const room = await Room.findById(id);
  if (!room) { const err = new Error('Phòng không tồn tại.'); err.statusCode = 404; throw err; }
  if (room.status === ROOM_STATUS.OCCUPIED) {
    const err = new Error('Không thể xóa phòng đang có người thuê.'); err.statusCode = 400; throw err;
  }
  room.isActive = false;
  return room.save();
};

module.exports = { getByProperty, getById, create, update, reserve, cancelReserve, startMaintenance, completeMaintenance, remove };
