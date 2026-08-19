const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Public route to submit messages
router.post('/submit', contactController.submitMessage);
router.post('/custom-request', contactController.submitCustomRequest);

// Admin protected routes
router.get('/messages', adminAuth, contactController.getMessages);
router.get('/custom-requests', adminAuth, contactController.getCustomRequests);
router.patch('/messages/:id/status', adminAuth, contactController.updateMessageStatus);
router.delete('/messages/:id', adminAuth, contactController.deleteMessage);

module.exports = router;
