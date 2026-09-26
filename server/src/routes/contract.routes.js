// src/routes/contract.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/contract.controller');
const checkoutCtrl = require('../controllers/checkout.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const {
  createContractValidator, renewValidator, transferValidator, terminateValidator,
} = require('../validators/contract.validator');

router.use(authenticate);

router.get('/',    ctrl.getAll);
router.post('/',   createContractValidator, validate, ctrl.create);
router.get('/:id', ctrl.getById);
router.put('/:id', ctrl.update);

// State machine actions
router.post('/:id/renew',     renewValidator,     validate, ctrl.renew);
router.post('/:id/transfer',  transferValidator,  validate, ctrl.transfer);
router.post('/:id/terminate', terminateValidator, validate, ctrl.terminate);
router.post('/:id/void',      ctrl.voidContract);
router.post('/:id/checkout-preview', checkoutCtrl.preview);
router.post('/:id/checkout',         checkoutCtrl.checkout);

// Deposit của hợp đồng
router.get('/:id/deposit', ctrl.getDeposit);

module.exports = router;
