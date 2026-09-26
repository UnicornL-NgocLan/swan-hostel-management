// src/validators/property.validator.js
const { body } = require('express-validator');

const createPropertyValidator = [
  body('name').trim().notEmpty().withMessage('Tên cơ sở là bắt buộc'),
  body('code').trim().notEmpty().withMessage('Mã cơ sở là bắt buộc')
    .matches(/^[A-Z0-9_-]+$/i).withMessage('Mã cơ sở chỉ chứa chữ cái, số, gạch ngang'),
  body('owner.phone').optional().isMobilePhone('vi-VN').withMessage('Số điện thoại không hợp lệ'),
  body('owner.email').optional().isEmail().withMessage('Email không hợp lệ'),
];

const updatePropertyValidator = [
  body('name').optional().trim().notEmpty().withMessage('Tên cơ sở không được để trống'),
  body('owner.phone').optional().isMobilePhone('vi-VN').withMessage('Số điện thoại không hợp lệ'),
  body('owner.email').optional().isEmail().withMessage('Email không hợp lệ'),
];

const createFloorValidator = [
  body('name').trim().notEmpty().withMessage('Tên tầng là bắt buộc'),
  body('sortOrder').optional().isInt({ min: 0 }).withMessage('Thứ tự phải là số nguyên ≥ 0'),
];

module.exports = { createPropertyValidator, updatePropertyValidator, createFloorValidator };
