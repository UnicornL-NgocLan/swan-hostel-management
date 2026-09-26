// src/utils/jwt.utils.js
const jwt = require('jsonwebtoken');

/**
 * Tạo JWT token
 * @param {Object} payload - dữ liệu đưa vào token
 * @returns {string} token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Verify JWT token
 * @param {string} token
 * @returns {Object} decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
