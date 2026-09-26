// src/routes/invoice.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/invoice.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate.middleware');

router.use(authenticate);

router.get('/',    ctrl.getAll);
router.post('/',   [
  body('contractId').notEmpty().isMongoId(),
  body('billingPeriod').notEmpty().matches(/^\d{4}-\d{2}$/).withMessage('billingPeriod phải có dạng YYYY-MM'),
], validate, ctrl.create);
router.post('/bulk', [
  body('propertyId').notEmpty().isMongoId(),
  body('billingPeriod').notEmpty().matches(/^\d{4}-\d{2}$/),
], validate, ctrl.bulkCreate);

router.post('/preview', [
  body('contractId').notEmpty().isMongoId(),
  body('billingPeriod').notEmpty().matches(/^\d{4}-\d{2}$/),
], validate, ctrl.preview);

router.get('/:id',        ctrl.getById);
router.put('/:id',        ctrl.update);
router.post('/:id/pay',   [body('amount').isFloat({ min: 1 }), body('method').optional().isIn(['CASH','TRANSFER'])], validate, ctrl.pay);
router.post('/:id/void',  ctrl.voidInv);
router.get('/:id/pdf',    ctrl.downloadPdf);

module.exports = router;
