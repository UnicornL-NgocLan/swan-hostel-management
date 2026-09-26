// src/routes/index.js
const express = require('express');
const router = express.Router();

const authRoutes     = require('./auth.routes');
const propertyRoutes = require('./property.routes');
const roomRoutes     = require('./room.routes');
const tenantRoutes   = require('./tenant.routes');
const contractRoutes = require('./contract.routes');
const meterRoutes    = require('./meter.routes');
const invoiceRoutes  = require('./invoice.routes');
const dashboardRoutes = require('./dashboard.routes');
const expenseRoutes   = require('./expense.routes');
const paymentRoutes   = require('./payment.routes');
const notificationRoutes = require('./notification.routes');

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Swan Hostel Management API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

router.use('/auth',       authRoutes);
router.use('/properties', propertyRoutes);
router.use('/rooms',      roomRoutes);
router.use('/tenants',    tenantRoutes);
router.use('/contracts',  contractRoutes);
router.use('/meters',     meterRoutes);
router.use('/invoices',   invoiceRoutes);
router.use('/payments',   paymentRoutes);
router.use('/dashboard',  dashboardRoutes);
router.use('/expenses',   expenseRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
