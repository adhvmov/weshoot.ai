/**
 * Routes Index
 * Combines all route modules
 */
const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const productsRoutes = require('./products');
const generatorRoutes = require('./generator');
const plansRoutes = require('./plans');
const paymentsRoutes = require('./payments');
const dashboardRoutes = require('./dashboard');
const adminRoutes = require('./admin');
const uploadRoutes = require('./upload');
const webhookRoutes = require('./webhook');
const galleryRoutes = require('./gallery');
const contactRoutes = require('./contact');
const supportRoutes = require('./support');


// Mount routes
router.use('/auth', authRoutes);
router.use('/products', productsRoutes);
router.use('/generator', generatorRoutes);
router.use('/plans', plansRoutes);
router.use('/payments', paymentsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);
router.use('/webhook', webhookRoutes);
router.use('/gallery', galleryRoutes);
router.use('/contact', contactRoutes);
router.use('/support', supportRoutes);


// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;
