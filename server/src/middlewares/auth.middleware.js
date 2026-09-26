// src/middlewares/auth.middleware.js
const { verifyToken } = require('../utils/jwt.utils');
const { errorResponse } = require('../utils/response.utils');
const User = require('../models/user.model');
const { ROLES } = require('../constants');

/**
 * Middleware xác thực JWT
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Lấy user từ DB để đảm bảo user vẫn còn active
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return errorResponse(res, 'User not found or deactivated.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid token.', 401);
    }
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired.', 401);
    }
    next(error);
  }
};

/**
 * Middleware kiểm tra role
 * @param {...string} roles - các role được phép
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Not authenticated.', 401);
    }
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 'You do not have permission to perform this action.', 403);
    }
    next();
  };
};

/**
 * Shorthand: chỉ ADMIN được phép
 */
const adminOnly = authorize(ROLES.ADMIN);

module.exports = { authenticate, authorize, adminOnly };
