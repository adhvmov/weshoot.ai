/**
 * Generator Routes
 * /api/generator
 */
const express = require('express');
const router = express.Router();
const generatorController = require('../controllers/generatorController');
const { optionalAuth, authenticate } = require('../middleware/auth');
const multer = require('multer');

// Configure upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Generate image (legacy)
router.post('/generate', optionalAuth, generatorController.generateImage);

// AI Generate image (Vyro AI) - requires authentication
router.post('/ai-generate', authenticate, generatorController.generateAIImage);

// Upscale image - requires authentication + file upload
router.post('/upscale', authenticate, upload.single('image'), generatorController.upscaleImage);

// Remove background - requires authentication + file upload
router.post('/remove-background', authenticate, upload.single('image'), generatorController.removeBackground);


// Freepik Mystic API routes (AI Photoshoot only)
router.post('/mystic-generate', authenticate, generatorController.generateMysticImage);
router.get('/mystic-status/:taskId', optionalAuth, generatorController.getMysticStatus);
router.get('/lora-styles', generatorController.getLoRAStyles);


// History routes
router.get('/history', authenticate, generatorController.getHistory);
router.get('/user-history', authenticate, generatorController.getUserHistory);
router.get('/history/:id', authenticate, generatorController.getImage);
router.delete('/history/:id', optionalAuth, generatorController.deleteImage);
router.delete('/user-generations/:id', authenticate, generatorController.deleteUserGeneration);
router.post('/upload-to-history', authenticate, upload.single('image'), generatorController.uploadToHistory);

// Favorites & Dislike
router.patch('/history/:id/favorite', authenticate, generatorController.toggleFavorite);
router.patch('/history/:id/dislike', authenticate, generatorController.toggleDislike);

// Background templates
router.get('/templates', generatorController.getBackgroundTemplates);
router.post('/bg-realism', authenticate, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'background', maxCount: 1 }]), generatorController.generateBackgroundRealism);

// AI Edit (Seedream)
router.post('/edit-image', authenticate, upload.single('image'), generatorController.editImage);

// Add Shadows (Image Relight)
router.post('/add-shadows', authenticate, upload.single('image'), generatorController.addShadows);

// Fix Light & Colors
router.post('/fix-light-colors', authenticate, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'referenceImage', maxCount: 1 }]), generatorController.fixLightColors);

// Resize & Expand
router.post('/resize-expand', authenticate, upload.single('image'), generatorController.resizeExpand);

// Blur Background
router.post('/blur-background', authenticate, upload.single('image'), generatorController.blurBackground);

// AI Fashion Models
router.get('/fashion-assets', optionalAuth, generatorController.getFashionAssets);
router.post('/fashion-generate', authenticate, upload.fields([
    { name: 'productImage', maxCount: 1 },
    { name: 'topImage', maxCount: 1 },
    { name: 'bottomImage', maxCount: 1 },
    { name: 'modelImage', maxCount: 1 }
]), generatorController.generateFashionImage);

// Image to Video
router.post('/image-to-video', authenticate, upload.single('image'), generatorController.generateImageToVideo);

// Add Text
router.post('/add-text', authenticate, upload.single('image'), generatorController.addText);

// Improve Prompt
router.post('/improve-prompt', authenticate, generatorController.improvePrompt);

module.exports = router;

