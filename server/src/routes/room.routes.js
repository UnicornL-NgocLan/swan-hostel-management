// src/routes/room.routes.js
const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/room.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { updateRoomValidator } = require('../validators/room.validator');

router.use(authenticate);

// CRUD
router.get('/:id',    ctrl.getById);
router.put('/:id',    updateRoomValidator, validate, ctrl.update);
router.delete('/:id', ctrl.remove);

// State machine actions (không cho PUT status trực tiếp)
router.post('/:id/reserve',              ctrl.reserve);
router.post('/:id/cancel-reserve',       ctrl.cancelReserve);
router.post('/:id/maintenance',          ctrl.startMaintenance);
router.post('/:id/maintenance/complete', ctrl.completeMaintenance);

module.exports = router;
