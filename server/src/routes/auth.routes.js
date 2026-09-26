// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { loginValidator } = require('../validators/auth.validator');
const { validate } = require('../middlewares/validate.middleware');
const rateLimit = require('express-rate-limit');

// Rate limiting for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per `window` (here, per 15 minutes)
  message: {
    status: 'error',
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
// POST /api/auth/login
router.post('/login', loginLimiter, loginValidator, validate, authController.login);

// GET /api/auth/me  (protected)
router.get('/me', authenticate, authController.getMe);

// POST /api/auth/logout (protected)
router.post('/logout', authenticate, authController.logout);

module.exports = router;
