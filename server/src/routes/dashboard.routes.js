// src/routes/dashboard.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboard.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);
router.get('/', ctrl.getOverview);

module.exports = router;
