// src/routes/property.routes.js
const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/property.controller');
const roomCtrl = require('../controllers/room.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const {
  createPropertyValidator,
  updatePropertyValidator,
  createFloorValidator,
} = require('../validators/property.validator');
const { createRoomValidator, updateRoomValidator } = require('../validators/room.validator');

// Tất cả routes đều cần đăng nhập
router.use(authenticate);

// ── Properties ──────────────────────────────────────────
router.get('/',    ctrl.getAll);
router.post('/',   createPropertyValidator, validate, ctrl.create);
router.get('/:id', ctrl.getById);
router.put('/:id', updatePropertyValidator, validate, ctrl.update);
router.delete('/:id', ctrl.remove);

// ── Floors (nested under property) ──────────────────────
router.get('/:id/floors',          ctrl.getFloors);
router.post('/:id/floors',         createFloorValidator, validate, ctrl.createFloor);
router.put('/:id/floors/:floorId', ctrl.updateFloor);
router.delete('/:id/floors/:floorId', ctrl.removeFloor);

// ── Rooms (nested under property) ───────────────────────
router.get('/:propertyId/rooms',  roomCtrl.getByProperty);
router.post('/:propertyId/rooms', createRoomValidator, validate, roomCtrl.create);

module.exports = router;
