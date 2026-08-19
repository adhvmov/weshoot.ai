/**
 * Webhook Routes
 * /api/webhook
 */
const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Freepik Mystic webhook callback
router.post('/freepik-mystic', webhookController.handleFreepikMysticWebhook);

module.exports = router;
