/**
 * Dashboard Routes
 * /api/dashboard
 */
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const adminController = require('../controllers/adminController');
const { optionalAuth } = require('../middleware/auth');

router.get('/stats', optionalAuth, dashboardController.getDashboardStats);
router.get('/analytics', optionalAuth, dashboardController.getUsageAnalytics);
router.get('/usage-log', optionalAuth, dashboardController.getDetailedUsageLog);
router.get('/site-status', optionalAuth, dashboardController.getSiteStatus);

// Public early access request endpoint
router.post('/early-access/request', adminController.submitAccessRequest);

module.exports = router;
