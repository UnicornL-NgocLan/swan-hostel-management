// src/middlewares/error.middleware.js
const { errorResponse } = require('../utils/response.utils');

/**
 * Global error handler middleware
 * Phải đặt cuối cùng trong app.js
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return errorResponse(res, 'Validation failed', 400, errors);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return errorResponse(res, `${field} already exists.`, 409);
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return errorResponse(res, `Invalid ${err.path}: ${err.value}`, 400);
  }

  // JWT errors (nên đã handle ở middleware, nhưng để fallback)
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid token.', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Token expired.', 401);
  }

  // Default
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  return errorResponse(res, message, statusCode);
};

/**
 * 404 Not Found handler
 */
const notFound = (req, res) => {
  return errorResponse(res, `Route ${req.originalUrl} not found.`, 404);
};

module.exports = { errorHandler, notFound };
