const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const { optionalAuth, authenticate } = require('../middleware/auth');

// Public route to fetch all gallery prompts (with optional auth for likes)
router.get('/', optionalAuth, galleryController.getGalleryPrompts);

// Authenticated route to add a new prompt
router.post('/', authenticate, galleryController.addGalleryPrompt);

// Like toggle (authenticated)
router.post('/:id/like', authenticate, galleryController.toggleLikePrompt);

// Delete prompt (authenticated)
router.delete('/:id', authenticate, galleryController.deletePrompt);

module.exports = router;
