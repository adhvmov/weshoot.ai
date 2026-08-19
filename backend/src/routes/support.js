const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { optionalAuth } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Public/User Routes
router.post('/session', optionalAuth, supportController.startSession);
router.post('/chat', optionalAuth, supportController.handleChat);

// Admin Routes
router.get('/admin/sessions', adminAuth, supportController.getAdminChats);
router.get('/admin/sessions/:sessionId/messages', adminAuth, supportController.getSessionMessages);

module.exports = router;
