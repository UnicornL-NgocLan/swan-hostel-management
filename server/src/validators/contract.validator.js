// src/validators/contract.validator.js
const { body } = require('express-validator');

const createContractValidator = [
  body('roomId').notEmpty().isMongoId().withMessage('roomId không hợp lệ'),
  body('primaryTenantId').notEmpty().isMongoId().withMessage('primaryTenantId không hợp lệ'),
  body('propertyId').notEmpty().isMongoId().withMessage('propertyId không hợp lệ'),
  body('startDate').notEmpty().isISO8601().withMessage('Ngày bắt đầu không hợp lệ'),
  body('endDate').optional().isISO8601().withMessage('Ngày kết thúc không hợp lệ'),
  body('rentAmount').notEmpty().isFloat({ min: 0 }).withMessage('Giá thuê không hợp lệ'),
  body('depositAmount').optional().isFloat({ min: 0 }),
  body('paymentDueDay').optional().isInt({ min: 1, max: 31 }).withMessage('Ngày đóng tiền phải từ 1-31'),
];

const renewValidator = [
  body('newEndDate').notEmpty().isISO8601().withMessage('Ngày kết thúc mới không hợp lệ'),
  body('newRentAmount').optional().isFloat({ min: 0 }),
];

const transferValidator = [
  body('newRoomId').notEmpty().isMongoId().withMessage('newRoomId không hợp lệ'),
  body('newRentAmount').optional().isFloat({ min: 0 }),
];

const terminateValidator = [
  body('terminationDate').optional().isISO8601(),
  body('terminationNote').optional().isString(),
];

module.exports = { createContractValidator, renewValidator, transferValidator, terminateValidator };
