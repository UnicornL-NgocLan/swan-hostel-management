// src/controllers/notification.controller.js
const Notification = require('../models/notification.model');
const { successResponse } = require('../utils/response.utils');

const getAll = async (req, res) => {
  // Trả về tối đa 50 thông báo gần nhất
  const notifications = await Notification.find()
    .sort({ createdAt: -1 })
    .limit(50);
  successResponse(res, notifications);
};

const getUnreadCount = async (req, res) => {
  const count = await Notification.countDocuments({ isRead: false });
  successResponse(res, { count });
};

const markAsRead = async (req, res) => {
  const { id } = req.params;
  if (id === 'all') {
    await Notification.updateMany({ isRead: false }, { $set: { isRead: true } });
  } else {
    await Notification.findByIdAndUpdate(id, { $set: { isRead: true } });
  }
  successResponse(res, null, 'Đã đánh dấu đã đọc');
};

module.exports = { getAll, getUnreadCount, markAsRead };
