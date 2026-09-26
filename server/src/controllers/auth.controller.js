// src/controllers/auth.controller.js
const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response.utils');

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  const { username, password } = req.body;
  const result = await authService.login(username, password);
  return successResponse(res, result, 'Login successful');
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  const user = await authService.getMe(req.user._id);
  return successResponse(res, user, 'User profile');
};

/**
 * POST /api/auth/logout
 * JWT là stateless nên logout chỉ thông báo phía server
 * Frontend sẽ xóa token ở local storage
 */
const logout = async (req, res) => {
  return successResponse(res, null, 'Logged out successfully');
};

module.exports = { login, getMe, logout };
