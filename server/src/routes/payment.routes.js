// src/routes/payment.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/payment.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);
router.get('/', ctrl.getAll);

module.exports = router;
