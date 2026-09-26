// src/validators/room.validator.js
const { body } = require('express-validator');

const createRoomValidator = [
  body('code').trim().notEmpty().withMessage('Mã phòng là bắt buộc'),
  body('rentAmount')
    .notEmpty().withMessage('Giá thuê là bắt buộc')
    .isFloat({ min: 0 }).withMessage('Giá thuê phải là số không âm'),
  body('area').optional().isFloat({ min: 0 }).withMessage('Diện tích phải là số không âm'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Sức chứa tối thiểu 1 người'),
];

const updateRoomValidator = [
  body('code').optional().trim().notEmpty().withMessage('Mã phòng không được để trống'),
  body('rentAmount').optional().isFloat({ min: 0 }).withMessage('Giá thuê phải là số không âm'),
  body('area').optional().isFloat({ min: 0 }).withMessage('Diện tích không hợp lệ'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Sức chứa tối thiểu 1'),
];

module.exports = { createRoomValidator, updateRoomValidator };
