/**
 * Payments Routes
 * /api/payments
 */
const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/paymentsController');
const { optionalAuth } = require('../middleware/auth');

// All routes require authentication
router.get('/history', optionalAuth, paymentsController.getPaymentHistory);
router.post('/process', optionalAuth, paymentsController.processPayment);
router.get('/methods', optionalAuth, paymentsController.getPaymentMethods);
router.post('/methods', optionalAuth, paymentsController.addPaymentMethod);

module.exports = router;
