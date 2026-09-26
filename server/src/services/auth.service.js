// src/services/auth.service.js
const User = require('../models/user.model');
const { generateToken } = require('../utils/jwt.utils');

/**
 * Login user
 * @param {string} username
 * @param {string} password
 * @returns {{ user, token }}
 */
const login = async (username, password) => {
  // Lấy user kèm passwordHash (bị select: false)
  const user = await User.findOne({ username: username.toLowerCase() }).select('+passwordHash');

  if (!user) {
    const err = new Error('Invalid username or password.');
    err.statusCode = 401;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error('Your account has been deactivated.');
    err.statusCode = 403;
    throw err;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error('Invalid username or password.');
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken({ id: user._id, role: user.role });

  return {
    user: user.toJSON(),
    token,
  };
};

/**
 * Lấy thông tin user hiện tại
 * @param {string} userId
 */
const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

/**
 * Seed admin user nếu chưa có (idempotent — an toàn gọi nhiều lần)
 */
const seedAdmin = async () => {
  try {
    const existing = await User.findOne({ username: 'admin' });
    if (!existing) {
      await User.create({
        username: 'admin',
        passwordHash: 'admin123',
        fullName: 'Quản trị viên',
        role: 'ADMIN',
      });
      console.log('✅ Admin user seeded: admin / admin123');
    }
  } catch (err) {
    // Bỏ qua lỗi duplicate key (11000) — admin đã tồn tại từ lần chạy trước
    if (err.code === 11000) {
      console.log('ℹ️  Admin user đã tồn tại, bỏ qua seed.');
    } else {
      throw err;
    }
  }
};

module.exports = { login, getMe, seedAdmin };
