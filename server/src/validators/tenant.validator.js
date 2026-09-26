// src/validators/tenant.validator.js
const { body } = require('express-validator');

const createTenantValidator = [
  body('fullName').trim().notEmpty().withMessage('Họ tên là bắt buộc'),
  body('phone').trim().notEmpty().withMessage('Số điện thoại là bắt buộc'),
  body('gender').optional().isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Giới tính không hợp lệ'),
  body('identityNumber').optional().trim(),
  body('email').optional().isEmail().withMessage('Email không hợp lệ'),
];

const updateTenantValidator = [
  body('fullName').optional().trim().notEmpty().withMessage('Họ tên không được để trống'),
  body('phone').optional().trim().notEmpty().withMessage('SĐT không được để trống'),
  body('gender').optional().isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Giới tính không hợp lệ'),
  body('email').optional().isEmail().withMessage('Email không hợp lệ'),
];

module.exports = { createTenantValidator, updateTenantValidator };
