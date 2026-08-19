/**
 * Auth Routes
 * /api/auth
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleAuth);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.get('/user-count', authController.getTotalUserCount);

// Password Reset Routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-reset-code', authController.verifyResetCode);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);
router.post('/logout', authenticate, authController.logout);
router.get('/sessions', authenticate, authController.getActiveSessions);
router.delete('/sessions/:id', authenticate, authController.revokeSession);
router.delete('/account', authenticate, authController.deleteAccount);

module.exports = router;
