/**
 * Plans Routes
 * /api/plans
 */
const express = require('express');
const router = express.Router();
const plansController = require('../controllers/plansController');
const { authenticate, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/', plansController.getPlans);
router.get('/:slug', plansController.getPlan);

// Protected routes
router.post('/subscribe', optionalAuth, plansController.subscribe);
router.get('/subscription/current', optionalAuth, plansController.getCurrentSubscription);
router.post('/subscription/:subscriptionId/cancel', optionalAuth, plansController.cancelSubscription);

module.exports = router;
