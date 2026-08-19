const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

// Public Admin Routes
router.post('/auth/login', adminController.login);

// Protected Admin Routes
router.use(adminAuth);

router.get('/dashboard/kpis', adminController.getDashboardKPIs);
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetail);
router.post('/users/:id/ban', adminController.banUser);
router.post('/users/:id/unban', adminController.unbanUser);
router.post('/users/:id/credits', adminController.updateUserCredits);
router.post('/users/:id/plan', adminController.updateUserPlan);
router.delete('/users/:id', adminController.deleteUser);

// Security Audit & Banned Users
router.get('/security/audit', adminController.getSecurityAudit);
router.get('/plans', adminController.getPlans);
router.post('/plans', adminController.savePlan);
router.put('/plans/:id', adminController.savePlan);

router.get('/models', adminController.getModels);
router.post('/models', adminController.saveModel);
router.put('/models/:id', adminController.saveModel);

router.get('/gallery', adminController.getGallery);
router.delete('/gallery/:id', adminController.deleteGalleryItem);

router.get('/templates', adminController.getAdminTemplates);
router.get('/logs', adminController.getLogs);
router.get('/health', adminController.getSystemHealth);
router.get('/usage-stats', adminController.getUsageStats);
router.get('/settings', adminController.getSettings);
router.post('/settings', adminController.updateSettings);

// Early Access Whitelist
router.get('/early-access/whitelist', adminController.getEarlyAccessWhitelist);
router.post('/early-access/whitelist', adminController.addEmailToWhitelist);
router.delete('/early-access/whitelist/:email', adminController.removeEmailFromWhitelist);

// Early Access Requests
router.get('/early-access/requests', adminController.getAccessRequests);
router.post('/early-access/approve', adminController.approveAccessRequest);

module.exports = router;
