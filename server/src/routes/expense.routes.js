// src/routes/expense.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/expense.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate.middleware');

router.use(authenticate);

router.get('/', ctrl.getAll);
router.post('/', [
  body('propertyId').isMongoId(),
  body('type').isIn(['INCOME', 'EXPENSE']),
  body('category').notEmpty(),
  body('amount').isFloat({ min: 0 }),
  body('description').notEmpty(),
], validate, ctrl.create);
router.delete('/:id', ctrl.remove);

module.exports = router;
