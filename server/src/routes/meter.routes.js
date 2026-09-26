// src/routes/meter.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/meter.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.post('/',                  ctrl.createReading);
router.post('/bulk',              ctrl.bulkCreateReadings);
router.get('/',                   ctrl.getReadingsTable);
router.get('/room/:roomId',       ctrl.getReadings);

module.exports = router;
