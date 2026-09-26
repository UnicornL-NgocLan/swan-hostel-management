// src/routes/tenant.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/tenant.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createTenantValidator, updateTenantValidator } = require('../validators/tenant.validator');

router.use(authenticate);

router.get('/',    ctrl.getAll);
router.post('/',   createTenantValidator, validate, ctrl.create);
router.get('/:id', ctrl.getById);
router.put('/:id', updateTenantValidator, validate, ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
