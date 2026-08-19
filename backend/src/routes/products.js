/**
 * Products Routes
 * /api/products
 */
const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
const { authenticate, optionalAuth } = require('../middleware/auth');

// All routes require authentication (using optional for demo)
router.get('/', optionalAuth, productsController.getProducts);
router.get('/:id', optionalAuth, productsController.getProduct);
router.post('/', optionalAuth, productsController.createProduct);
router.put('/:id', optionalAuth, productsController.updateProduct);
router.delete('/:id', optionalAuth, productsController.deleteProduct);

module.exports = router;
