// src/routes/notification.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notification.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.get('/unread-count', ctrl.getUnreadCount);
router.put('/:id/read', ctrl.markAsRead); // id can be 'all'

module.exports = router;
