/**
 * Image Generator Controller
 * Persists generation metadata and assets in PostgreSQL
 */
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const vyroService = require('../services/vyroService');
const freepikService = require('../services/freepikService');
const claidService = require('../services/claidService');
const { checkAndDeductCredits } = require('../utils/creditManager');
const sharp = require('sharp');

/**
 * Internal helper to save generations by email
 */
const saveToHistory = async (email, imageUrl, toolName, prompt, parameters = null) => {
    try {
        if (!email || !imageUrl) {
            console.warn('[saveToHistory] Missing email or imageUrl, skipping');
            return null;
        }

        const result = await db.query(
            'INSERT INTO user_generations (user_email, image_url, tool_name, prompt, parameters) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [email, imageUrl, toolName, prompt || '', parameters ? JSON.stringify(parameters) : null]
        );

        const historyId = result.rows[0].id;
        console.log(`[saveToHistory] Saved ${toolName} image for ${email}, ID: ${historyId}`);
        return historyId;
    } catch (err) {
        console.error('[saveToHistory] Error saving to background history:', err.message);
        return null;
    }
};

/**
 * Generate image (simulated logic, real DB persistence)
 */
const generateImage = async (req, res) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        const userId = req.user.id;
        const { projectId, sourceImageUrl, generationType, backgroundTemplateId, customPrompt } = req.body;

        if (!sourceImageUrl || !generationType) {
            return res.status(400).json({
                success: false,
                message: 'Source image URL and generation type are required.',
            });
        }

        // 2. Processing (Simulation)
        const processingTimeMs = Math.floor(Math.random() * 2000) + 1000;
        const resultImageUrl = `/generated/${uuidv4()}.jpg`; // Mock URL

        // 4. Create Project Asset
        const assetResult = await client.query(
            `INSERT INTO project_assets (project_id, user_id, file_url, type, filename) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [projectId || null, userId, resultImageUrl, 'processed', 'generated_image.jpg']
        );
        const asset = assetResult.rows[0];

        // 5. Log to Operations History
        const historyResult = await client.query(
            `INSERT INTO operations_history (user_id, project_id, asset_id, tool_name, credits_cost, status, parameters) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [
                userId,
                projectId || null,
                asset.id,
                generationType,
                0,
                'success',
                JSON.stringify({ backgroundTemplateId, customPrompt, processingTimeMs })
            ]
        );

        await client.query('COMMIT');

        // Persistent history by email
        const generationId = await saveToHistory(req.user.email, resultImageUrl, generationType, customPrompt, { backgroundTemplateId, customPrompt, processingTimeMs });

        res.status(201).json({
            success: true,
            message: 'Image generated successfully.',
            data: {
                ...asset,
                historyId: historyResult.rows[0].id,
                generationId
            },
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Generate image error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during image generation.',
        });
    } finally {
        client.release();
    }
};

/**
 * Get background templates
 */
const getBackgroundTemplates = async (req, res) => {
    try {
        const { category } = req.query;
        const fs = require('fs');
        const path = require('path');

        // Map categories to folder names (case-insensitive handling by using exact names found)
        // and define their thumbnail files to exclude
        const categoryMap = {
            'Humans': { folder: 'Humans', thumbnail: 'front-view-hand-asking-something.jpg' },
            'Popular': { folder: 'popular', thumbnail: 'mostpopular320thumbnail.jpg' },
            'Nature': { folder: 'nature', thumbnail: 'nature320thumbnail.jpg' },
            'Flatlays': { folder: 'Flatlays', thumbnail: 'Flatlays_8a3199c6-0b82-4a75-8b2d-0a2737c047be.webp' },
            'Minimal': { folder: 'Minimal', thumbnail: 'minimal320thumbnail.jpg' },
            'Platforms': { folder: 'Platforms', thumbnail: 'platforms320thumbnail.jpg' },
            'Stones': { folder: 'stones', thumbnail: 'stones320thumbnail.jpg' },
            'Kitchen': { folder: 'kitchen', thumbnail: 'kitchen_thumbnail512.jpg' },
            'SPA': { folder: 'spa', thumbnail: 'spa_thumbnail320.jpg' },
            'Fabric': { folder: 'fabric', thumbnail: 'fabric320thumbnail.jpg' },
            'City': { folder: 'city', thumbnail: 'city_thumbnail512.jpg' },
            'Walls': { folder: 'walls', thumbnail: 'walls_thumbnail320.jpg' },
            'Interiors': { folder: 'Interiors', thumbnail: 'interiors_thumbnail320.jpg' },
            'Office': { folder: 'office', thumbnail: 'office_thumbnail512.jpg' },
            'Kids': { folder: 'kids', thumbnail: 'kids_thumbnail512.jpg' },
        };

        // Base path to frontend public folder
        // backend/src/controllers -> ../../../frontend/public/background_templets
        const templatesDir = path.join(__dirname, '../../../frontend/public/background_templets');

        if (category) {
            const catConfig = categoryMap[category];
            if (!catConfig) {
                return res.json({ success: true, data: [] });
            }

            const catDir = path.join(templatesDir, catConfig.folder);

            if (!fs.existsSync(catDir)) {
                console.warn(`[getBackgroundTemplates] Directory not found: ${catDir}`);
                return res.json({ success: true, data: [] });
            }

            const files = fs.readdirSync(catDir);
            const templates = files
                .filter(file => {
                    // Filter out the thumbnail and ensure it's an image
                    return file !== catConfig.thumbnail && /\.(jpg|jpeg|png|webp)$/i.test(file);
                })
                .map(file => ({
                    id: file, // Use filename as ID
                    name: file,
                    url: `/background_templets/${catConfig.folder}/${file}`,
                    category: category
                }));

            return res.json({ success: true, data: templates });
        }

        // If no category selected, return the categories list with thumbnails (mocked here or scanned)
        // Ideally we return the list of available categories
        const categories = Object.keys(categoryMap).map(key => ({
            id: key,
            name: key,
            thumbnail: `/background_templets/${categoryMap[key].folder}/${categoryMap[key].thumbnail}`
        }));

        res.json({
            success: true,
            data: categories,
        });

    } catch (error) {
        console.error('Get templates error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred.',
        });
    }
};

/**
 * Generate Background with Realism (Mystic v2.5)
 */
const generateBackgroundRealism = async (req, res) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
    if (!req.files || !req.files['image']) return res.status(400).json({ success: false, message: 'Product image is required' });

    const { prompt, templateUrl, creativity = 'Medium', imageCount = 1 } = req.body;
    const userId = req.user.id;

    // 1. Check and deduct credits first
    const creditResult = await checkAndDeductCredits(userId, 'bg-seedream');
    if (!creditResult.success) {
        return res.status(403).json({ success: false, message: creditResult.message });
    }
    const creditsCost = creditResult.cost;

    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        // 1. Resolve Background (either from file upload or template URL)
        let backgroundBuffer = null;
        let finalTemplatePath = null;

        if (req.files && req.files['background']) {
            backgroundBuffer = req.files['background'][0].buffer;
            console.log('[GeneratorController] Using uploaded custom background');
        } else if (templateUrl) {
            if (templateUrl.includes('..')) {
                throw new Error('Invalid template URL');
            }
            const safePath = templateUrl.startsWith('/') ? templateUrl.slice(1) : templateUrl;
            finalTemplatePath = path.join(__dirname, '../../../frontend/public', safePath);

            if (!fs.existsSync(finalTemplatePath)) {
                throw new Error(`Template file not found: ${finalTemplatePath}`);
            }
            console.log(`[GeneratorController] Using template path: ${finalTemplatePath}`);
        } else {
            throw new Error('No background template or custom background provided');
        }

        // 2. Resolve Product Image
        const productImage = req.files['image'] ? req.files['image'][0].buffer : null;
        if (!productImage) {
            throw new Error('Product image is required');
        }

        const seedreamOptions = {
            num_images: req.body.imageCount || 1,
            prompt: `The first image is the main product image and must remain fully visible.
The first image is already a background-less product image.
Do not edit, redesign, crop, or remove the product.
Do not change the lightness, brightness, or colors of the product.
Never change the color of the product image.
The product must stay exactly as in the first image.
Do not add any shadows, contact shadows, or reflections.
The second image is the background and MUST remain exactly as it is without any modification or redesign.
Place the product naturally onto this exact background from the second image without making any adjustments to the light or shadow of either image.
The background must be 100% identical to the reference image.
Make the final result look natural and realistic.
High-quality commercial product photography.${prompt ? '\n\nAdditional details: ' + prompt : ''}`
        };

        // 4. Call Freepik Service
        const taskResult = await freepikService.generateSeedreamEditImage(
            productImage,
            backgroundBuffer || finalTemplatePath,
            seedreamOptions
        );

        if (!taskResult.taskId) {
            throw new Error('Failed to start seedream edit task');
        }

        // Save initial asset state (processing)
        const assetResult = await client.query(
            `INSERT INTO project_assets(user_id, status, type) VALUES($1, $2, $3) RETURNING *`,
            [userId, 'processing', 'bg-seedream']
        );

        await client.query(
            `INSERT INTO operations_history(user_id, asset_id, tool_name, credits_cost, status, mystic_task_id, mystic_status, parameters)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
            [userId, assetResult.rows[0].id, 'bg-seedream', creditsCost, 'processing', taskResult.taskId, taskResult.status || 'PENDING', JSON.stringify({ creativity, template: templateUrl, endpointType: 'text-to-image/seedream-v4-edit' })]
        );

        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            data: {
                taskId: taskResult.taskId,
                status: taskResult.status || 'PENDING',
                assetId: assetResult.rows[0].id
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('BG Realism error:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        client.release();
    }
};

/**
 * Get generation history from operations_history
 */
const getHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { tool_name, page = 1, limit = 10 } = req.query;

        let query = 'SELECT h.*, a.file_url FROM operations_history h LEFT JOIN project_assets a ON h.asset_id = a.id WHERE h.user_id = $1';
        const params = [userId];

        if (tool_name) {
            query += ' AND h.tool_name = $2';
            params.push(tool_name);
        }

        query += ' ORDER BY h.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
        const offset = (page - 1) * limit;
        params.push(parseInt(limit), offset);

        const result = await db.query(query, params);

        res.json({
            success: true,
            data: {
                images: result.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: result.rowCount,
                }
            }
        });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Get generations for current user by email
 */
const getUserHistory = async (req, res) => {
    try {
        const { onlyFavorites } = req.query;
        const email = req.user?.email || req.query.email;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        let queryText = 'SELECT * FROM user_generations WHERE user_email = $1';
        const queryParams = [email];

        if (onlyFavorites === 'true') {
            queryText += ' AND is_favorite = TRUE';
        }

        queryText += ' ORDER BY created_at DESC';

        const result = await db.query(queryText, queryParams);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('[getUserHistory] Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch history' });
    }
};

/**
 * Get single generated image details
 */
const getImage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const result = await db.query(
            'SELECT h.*, a.file_url FROM operations_history h LEFT JOIN project_assets a ON h.asset_id = a.id WHERE h.id = $1 AND h.user_id = $2',
            [id, userId]
        );
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Toggle favorite status
 */
const toggleFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        const email = req.user?.email;
        if (!email) return res.status(401).json({ success: false, message: 'Auth required' });

        const result = await db.query(
            'UPDATE user_generations SET is_favorite = NOT is_favorite WHERE id = $1 AND user_email = $2 RETURNING is_favorite',
            [id, email]
        );

        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });

        res.json({ success: true, is_favorite: result.rows[0].is_favorite });
    } catch (error) {
        console.error('[toggleFavorite] Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Toggle dislike status
 */
const toggleDislike = async (req, res) => {
    try {
        const { id } = req.params;
        const email = req.user?.email;
        if (!email) return res.status(401).json({ success: false, message: 'Auth required' });

        const result = await db.query(
            'UPDATE user_generations SET is_disliked = NOT is_disliked WHERE id = $1 AND user_email = $2 RETURNING is_disliked',
            [id, email]
        );

        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });

        res.json({ success: true, is_disliked: result.rows[0].is_disliked });
    } catch (error) {
        console.error('[toggleDislike] Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Delete history item
 */
const deleteImage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        await db.query('DELETE FROM operations_history WHERE id = $1 AND user_id = $2', [id, userId]);
        res.json({ success: true, message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Delete user generation item
 */
const deleteUserGeneration = async (req, res) => {
    try {
        const { id } = req.params;
        const email = req.user?.email;
        if (!email) {
            return res.status(401).json({ success: false, message: 'Email required' });
        }

        await db.query('DELETE FROM user_generations WHERE id = $1 AND user_email = $2', [id, email]);
        res.json({ success: true, message: 'Generation deleted' });
    } catch (error) {
        console.error('[deleteUserGeneration] Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Handle direct image upload and save to persistent history
 */
const uploadToHistory = async (req, res) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
    if (!req.file) return res.status(400).json({ success: false, message: 'No image file uploaded' });

    try {
        const filename = `upload_${uuidv4()}${path.extname(req.file.originalname)}`;
        const uploadsDir = path.join(__dirname, '../../uploads/generated');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

        const filepath = path.join(uploadsDir, filename);
        fs.writeFileSync(filepath, req.file.buffer);

        const fileUrl = `/uploads/generated/${filename}`;

        // Save to History helper
        const generationId = await saveToHistory(req.user.email, fileUrl, 'manual-upload', 'User uploaded image');

        res.status(200).json({
            success: true,
            data: {
                url: fileUrl,
                filename: filename,
                generationId: generationId
            }
        });
    } catch (err) {
        console.error('[uploadToHistory] Error:', err.message);
        res.status(500).json({ success: false, message: 'Failed to save upload to history' });
    }
};

/**
 * Generate AI Image from text prompt using Vyro API
 */
const generateAIImage = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { prompt, style, aspectRatio, imageCount = 1, projectId, generationMode, inspirationImage, backgroundImage, swapImage, productImage } = req.body;

    if (!prompt) {
        return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    let sourceImage = null;
    let imageUrl = null;

    if (generationMode === 'Inspiration') imageUrl = inspirationImage;
    else if (generationMode === 'Background') imageUrl = backgroundImage;
    else if (generationMode === 'Product swap') imageUrl = swapImage;
    else if (generationMode === 'Creative') imageUrl = productImage;

    if (!imageUrl && productImage && ['Inspiration', 'Background', 'Product swap'].includes(generationMode)) {
        imageUrl = productImage;
    }

    if (imageUrl && !imageUrl.startsWith('blob:')) {
        const relativeUrl = imageUrl.replace(/^https?:\/\/[^\/]+/, '');
        sourceImage = path.join(__dirname, '../../', relativeUrl.startsWith('/') ? relativeUrl.slice(1) : relativeUrl);
    }

    const userId = req.user.id;

    // 1. Check and deduct credits first
    const creditResult = await checkAndDeductCredits(userId, 'ai-photoshoot');
    if (!creditResult.success) {
        return res.status(403).json({ success: false, message: creditResult.message });
    }
    const creditsCost = creditResult.cost;

    const client = await db.getClient();

    try {
        await client.query('BEGIN');
        const options = { prompt, style, aspectRatio, sourceImage };
        let result;

        if (imageCount > 1) {
            result = await vyroService.generateMultipleImages(options, Math.min(imageCount, 4));
        } else {
            const singleResult = await vyroService.generateImage(options);
            result = { success: true, images: [singleResult], totalGenerated: 1 };
        }

        if (!result.success || result.images.length === 0) {
            throw new Error('AI generation failed');
        }

        const savedAssets = [];
        for (const image of result.images) {
            const assetResult = await client.query(
                `INSERT INTO project_assets (project_id, user_id, file_url, type, filename) 
                 VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [projectId || null, userId, image.url, 'ai_generated', image.filename]
            );

            await client.query(
                `INSERT INTO operations_history (user_id, project_id, asset_id, tool_name, credits_cost, status, parameters) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [userId, projectId || null, assetResult.rows[0].id, 'ai_photoshoot', creditsCost, 'success', JSON.stringify({ prompt, style, aspectRatio, seed: image.seed })]
            );

            // Save to persistent history and get generationId
            const genId = await saveToHistory(req.user.email, image.url, 'ai_photoshoot', prompt, { prompt, style, aspectRatio, seed: image.seed });
            savedAssets.push({ ...assetResult.rows[0], ...image, generationId: genId });
        }

        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            message: `Successfully generated ${savedAssets.length} image(s)`,
            data: { images: savedAssets, creditsUsed: result.totalGenerated }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ success: false, message: error.message });
    } finally {
        client.release();
    }
};

/**
 * Upscale/Enhance Image
 */
const upscaleImage = async (req, res) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
    if (!req.file) return res.status(400).json({ success: false, message: 'No image file uploaded' });

    const { type = 'General', scale = '2x' } = req.body;
    const userId = req.user.id;

    // 1. Check and deduct credits first
    const creditResult = await checkAndDeductCredits(userId, 'upscale', { scale });
    if (!creditResult.success) {
        return res.status(403).json({ success: false, message: creditResult.message });
    }
    const creditsCost = creditResult.cost;

    const client = await db.getClient();

    try {
        await client.query('BEGIN');
        const scaleFactor = scale === '4x' ? 4 : 2;
        const flavorMap = { 'General': 'photo', 'Places': 'photo', 'People': 'photo', 'Digital art': 'sublime', 'Text': 'photo' };

        const upscaleResponse = await freepikService.upscaleImage(req.file.buffer, {
            flavor: req.body.flavor || flavorMap[type] || 'photo',
            scale_factor: parseInt(req.body.scale_factor) || scaleFactor,
            sharpen: req.body.sharpen !== undefined ? parseInt(req.body.sharpen) : 7,
            smart_grain: req.body.smart_grain !== undefined ? parseInt(req.body.smart_grain) : 7,
            ultra_detail: req.body.ultra_detail !== undefined ? parseInt(req.body.ultra_detail) : 30
        });

        const resultData = upscaleResponse.data || upscaleResponse;
        const taskId = resultData.task_id;
        if (!taskId) throw new Error('No task_id returned');

        const assetResult = await client.query(
            `INSERT INTO project_assets(user_id, type, status) VALUES($1, $2, $3) RETURNING *`,
            [userId, 'upscaled', 'processing']
        );

        const operationResult = await client.query(
            `INSERT INTO operations_history(user_id, asset_id, tool_name, credits_cost, status, parameters, mystic_task_id, mystic_status)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [userId, assetResult.rows[0].id, 'upscale', creditsCost, 'processing', JSON.stringify({ ...req.body, task_id: taskId, endpointType: 'image-upscaler-precision-v2' }), taskId, resultData.status || 'PENDING']
        );

        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            data: {
                taskId: taskId,
                status: resultData.status || 'PENDING',
                assetId: assetResult.rows[0].id
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ success: false, message: error.message });
    } finally {
        client.release();
    }
};

/**
 * Remove Background
 */
const removeBackground = async (req, res) => {
    console.log('[Generator] removeBackground called');
    if (!req.user) {
        console.error('[Generator] No user found in request');
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    if (!req.file) {
        console.error('[Generator] No file found in request');
        return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    console.log(`[Generator] File received: ${req.file.originalname}, size: ${req.file.size} bytes`);
    const { mode = 'general', prompt, highResolution = false } = req.body;
    const userId = req.user.id;

    // 1. Check and deduct credits first
    const creditResult = await checkAndDeductCredits(userId, 'remove-bg');
    if (!creditResult.success) {
        return res.status(403).json({ success: false, message: creditResult.message });
    }
    const creditsCost = creditResult.cost;

    const client = await db.getClient();

    try {
        await client.query('BEGIN');
        const taskResult = await freepikService.removeBackground(req.file.buffer);

        // Check if it returned a taskId
        const taskId = taskResult.taskId || taskResult.task_id;
        if (!taskId) {
            throw new Error('Failed to start background removal task');
        }

        let assetStatus = 'processing';
        let fileUrl = null;

        // If synchronous result with URL, download immediately
        if (taskResult.status === 'COMPLETED' && taskResult.url) {
            try {
                const downloadResult = await freepikService.downloadGeneratedImage(taskResult.url);
                fileUrl = downloadResult.url;
                assetStatus = 'completed';
            } catch (dlError) {
                console.error('Failed to download removed background image:', dlError);
                // Fallback to processing if download fails? Or fail?
                // If download fails, the task essentially failed.
                throw new Error('Failed to download generated image');
            }
        }

        const assetResult = await client.query(
            `INSERT INTO project_assets(user_id, status, type) VALUES($1, $2, $3) RETURNING *`,
            [userId, assetStatus, 'remove-bg']
        );

        if (fileUrl) {
            await client.query('UPDATE project_assets SET file_url = $1 WHERE id = $2', [fileUrl, assetResult.rows[0].id]);

            // Save to user_generations for persistence
            const userEmail = req.user?.email || (await client.query('SELECT email FROM users WHERE id=$1', [userId])).rows[0]?.email;
            if (userEmail) {
                await saveToHistory(userEmail, fileUrl, 'remove-bg', null, { endpointType: 'background-remover' });
            }
        }

        await client.query(
            `INSERT INTO operations_history(user_id, asset_id, tool_name, credits_cost, status, mystic_task_id, mystic_status, parameters)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                userId,
                assetResult.rows[0].id,
                'remove-bg',
                creditsCost,
                assetStatus === 'completed' ? 'success' : 'processing',
                taskId,
                taskResult.status || 'PENDING',
                JSON.stringify({ endpointType: 'background-remover' })
            ]
        );

        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            data: {
                taskId: taskId,
                status: taskResult.status || 'PENDING',
                assetId: assetResult.rows[0].id
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ success: false, message: error.message });
    } finally {
        client.release();
    }
};

/**
 * Generate AI Image using Freepik Mystic or Seedream Edit API
 * Handles 5 modes: Precise, Creative, Inspiration, Background, Product Swap
 */
const generateMysticImage = async (req, res) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
    const userId = req.user.id;
    const client = await db.getClient();

    try {
        const {
            prompt,
            projectId,
            mode = 'Precise',
            aspectRatio = 'square_1_1',
            resolution = '2k',
            imageCount = 1,
            inspirationImage,
            backgroundImage,
            swapImage,
            productImage
        } = req.body;

        if (!productImage) return res.status(400).json({ success: false, message: 'Product image is required' });

        // 1. Check and deduct credits first
        const creditResult = await checkAndDeductCredits(userId, 'photoshoot');
        if (!creditResult.success) {
            return res.status(403).json({ success: false, message: creditResult.message });
        }
        const creditsCost = creditResult.cost;

        await client.query('BEGIN');

        // Helper to resolve local path from URL or Data URL
        const ensureLocalPath = (input) => {
            if (!input || typeof input !== 'string') return null;

            // 1. Handle Data URL - save to temporary file
            if (input.startsWith('data:')) {
                try {
                    const base64Data = input.split(',')[1];
                    const buffer = Buffer.from(base64Data, 'base64');
                    const filename = `temp_${uuidv4()}.png`;
                    const uploadsDir = path.join(__dirname, '../../uploads/generated');
                    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
                    const tempPath = path.join(uploadsDir, filename);
                    fs.writeFileSync(tempPath, buffer);
                    console.log(`[Photoshoot] Decoded data URL to: ${tempPath}`);
                    return tempPath;
                } catch (e) {
                    console.error('[Photoshoot] Failed to decode data URL:', e.message);
                    return null;
                }
            }

            if (input.startsWith('blob:')) return null;

            // 2. Resolve local path from URL or relative path
            const relativeUrl = input.replace(/^https?:\/\/[^\/]+/, '');
            const possiblePaths = [
                path.join(__dirname, '../../', relativeUrl.startsWith('/') ? relativeUrl.slice(1) : relativeUrl),
                path.join(__dirname, '../../../frontend/public', relativeUrl.startsWith('/') ? relativeUrl.slice(1) : relativeUrl)
            ];

            for (const p of possiblePaths) {
                if (fs.existsSync(p) && fs.statSync(p).isFile()) {
                    return p;
                }
            }

            return null;
        };

        const productPath = ensureLocalPath(productImage);
        if (!productPath) {
            throw new Error('Product image could not be resolved to a local file. Please ensure it is uploaded or provided as a Data URL.');
        }

        const protectionPrompt = `PROHIBITED: Do not change the product's details, colors, textures, logos, or shape. 
Maintain 100% fidelity to the provided product image. 
Do not add additional shadows, reflections, or highlights to the product itself. 
Keep its original lighting and appearance exactly as uploaded. 
Place it naturally in the scene without any modification to the product's core identity.`;

        let result;
        let endpointType = 'mystic'; // Default to mystic

        // Use Seedream Edit for ALL modes now (Precise, Creative, Inspiration, Background, Product Swap)
        let referencePath = null;
        let modeInstructions = '';

        // Shared prompt instructions for natural results
        const naturalPrompt = `Integrate the product naturally into the scene to be realistic.
Do not change the lighting, brightness, or colors of the product.
Never change the colors or details of the first image (the product).
Do not enhance contrast, saturation, or brightness; avoid gloss, shine, or studio polish.
The product must stay exactly as in the first image.
Do not add any additional shadows or reflections to the product itself.
Do not add any text to the final image.
High-quality professional product photography.`;

        if (mode === 'Precise' || mode === 'Creative') {
            // Precise/Creative now use Seedream with just the product image
            // They don't have a secondary reference image mandatory.
            modeInstructions = `First image: main product. Second image: environment/mockup.
${naturalPrompt}
Place the product in the scene described by the user request.`;
            endpointType = 'seedream';
        } else if (mode === 'Inspiration') {
            referencePath = ensureLocalPath(inspirationImage);
            modeInstructions = `Use the second image ONLY as style and composition inspiration. 
Follow its color palette and environmental layout. 
Position the product (first image) naturally according to the inspiration's flow.
${naturalPrompt}`;
            endpointType = 'seedream';
        } else if (mode === 'Background') {
            referencePath = ensureLocalPath(backgroundImage);
            modeInstructions = `The first image is the main product and must remain fully visible.
The second image is the background and MUST remain exactly as it is.
Place the product naturally onto this exact background from the second image.
${naturalPrompt}`;
            endpointType = 'seedream';
        } else if (mode === 'Product Swap') {
            referencePath = ensureLocalPath(swapImage);
            modeInstructions = `Product swap: Replace the subject of the mockup (second image) with the product (first image). 
${naturalPrompt}`;
            endpointType = 'seedream';
        }

        // Validate reference path only if mode requires it
        if ((mode === 'Inspiration' || mode === 'Background' || mode === 'Product Swap') && !referencePath) {
            throw new Error(`Reference image for ${mode} could not be resolved or is missing`);
        }

        const seedreamPrompt = `${modeInstructions}\n\n[USER REQUEST]: ${prompt || 'Product photography'}\n\n[PRODUCT PROTECTION]: ${protectionPrompt}`;

        // Call Seedream Edit
        // For Precise/Creative, referencePath might be null, which is now handled by service
        result = await freepikService.generateSeedreamEditImage(
            fs.readFileSync(productPath),
            referencePath,
            {
                prompt: seedreamPrompt,
                num_images: imageCount,
                aspect_ratio: aspectRatio
            }
        );

        if (!result.success) throw new Error(`${mode} generation failed at provider`);

        const assetResult = await client.query(
            `INSERT INTO project_assets(project_id, user_id, file_url, type, filename, status) VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
            [projectId || null, userId, '', 'photoshoot_output', `${mode.toLowerCase()}_${result.taskId}.png`, 'processing']
        );

        const historyResult = await client.query(
            `INSERT INTO operations_history(user_id, project_id, asset_id, tool_name, credits_cost, status, mystic_task_id, mystic_status, parameters)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [
                userId,
                projectId || null,
                assetResult.rows[0].id,
                `photoshoot_${mode.toLowerCase()}`,
                creditsCost,
                'pending',
                result.taskId,
                result.status || 'PENDING',
                JSON.stringify({ ...req.body, endpointType })
            ]
        );

        await client.query('COMMIT');
        res.status(201).json({
            success: true,
            data: {
                taskId: result.taskId,
                status: result.status,
                historyId: historyResult.rows[0].id
            }
        });
    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error('Photoshoot Generation Error:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (client) client.release();
    }
};

/**
 * Get Polling Status for Photoshoot Tasks
 * Supports both Mystic and Seedream endpoints
 */
const getMysticStatus = async (req, res) => {
    try {
        const { taskId } = req.params;

        const dbResult = await db.query('SELECT h.*, a.file_url FROM operations_history h LEFT JOIN project_assets a ON h.asset_id = a.id WHERE h.mystic_task_id = $1', [taskId]);
        if (dbResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Task not found' });

        const operation = dbResult.rows[0];
        if (operation.mystic_status === 'COMPLETED' && operation.file_url) {
            // Try to find the associated generation ID from user_generations
            const userEmail = req.user?.email || (await db.query('SELECT email FROM users WHERE id=$1', [operation.user_id])).rows[0]?.email;
            const historyResult = await db.query(
                'SELECT id FROM user_generations WHERE image_url = $1 AND user_email = $2 LIMIT 1',
                [operation.file_url, userEmail]
            );
            const generationId = historyResult.rows[0]?.id;
            console.log(`[getMysticStatus] Already completed. URL: ${operation.file_url}, Found GenID: ${generationId}`);

            return res.json({ success: true, data: { taskId, status: 'COMPLETED', url: operation.file_url, generationId } });
        }

        // Determine which status endpoint to use
        let params = operation.parameters;
        if (typeof params === 'string') {
            try { params = JSON.parse(params); } catch (e) { params = {}; }
        }

        const endpointType = params?.endpointType || 'mystic';
        const provider = params?.provider || 'freepik';

        if (provider === 'claid') {
            const claidResult = await claidService.getTaskStatus(taskId);
            await db.query('UPDATE operations_history SET mystic_status = $1 WHERE mystic_task_id = $2', [claidResult.status, taskId]);

            if ((claidResult.status === 'COMPLETED' || claidResult.status === 'DONE') && claidResult.url) {
                // For Claid, the result is already a public URL we can download
                const downloadResult = await freepikService.downloadGeneratedImage(claidResult.url);
                await db.query('UPDATE project_assets SET file_url = $1, status = $2 WHERE id = $3', [downloadResult.url, 'completed', operation.asset_id]);
                await db.query('UPDATE operations_history SET status = $1 WHERE mystic_task_id = $2', ['success', taskId]);
                const userEmail = req.user?.email || (await db.query('SELECT email FROM users WHERE id=$1', [operation.user_id])).rows[0]?.email;
                const generationId = await saveToHistory(userEmail, downloadResult.url, operation.tool_name, params?.prompt, params);
                return res.json({ success: true, data: { taskId, status: 'COMPLETED', url: downloadResult.url, generationId } });
            }
            return res.json({ success: true, data: { taskId, status: claidResult.status === 'DONE' ? 'COMPLETED' : claidResult.status } });
        }

        let statusEndpoint = null;
        if (endpointType === 'seedream' || endpointType === 'text-to-image/seedream-v4-edit') {
            statusEndpoint = 'text-to-image/seedream-v4-edit';
        } else if (endpointType === 'image-upscaler-precision' || endpointType === 'image-upscaler-precision-v2') {
            statusEndpoint = 'image-upscaler-precision-v2';
        } else if (endpointType === 'image-relight') {
            statusEndpoint = 'image-relight';
        } else if (endpointType === 'image-expand/flux-pro') {
            statusEndpoint = 'image-expand/flux-pro';
        } else if (endpointType === 'image-to-video/kling-v2-5-pro') {
            statusEndpoint = 'image-to-video/kling-v2-5-pro';
        }

        let apiResult;
        if (statusEndpoint) {
            // Seedream v4 Edit uses generic getTaskStatus
            const rawStatus = await freepikService.getTaskStatus(taskId, statusEndpoint);
            apiResult = {
                status: rawStatus.status || rawStatus.data?.status || 'PENDING',
                generated: rawStatus.generated || rawStatus.data?.generated || rawStatus.data?.images || []
            };
        } else {
            // Mystic uses its own status checker
            apiResult = await freepikService.getMysticTaskStatus(taskId);
        }

        await db.query('UPDATE operations_history SET mystic_status = $1 WHERE mystic_task_id = $2', [apiResult.status, taskId]);

        if (apiResult.status === 'COMPLETED' && apiResult.generated?.length > 0) {
            // If multiple generated, we currently just take the first one or loop
            // For simplicity and alignment with current code, we take the first
            const generatedUrl = apiResult.generated[0];
            const downloadResult = await freepikService.downloadGeneratedImage(generatedUrl);

            await db.query('UPDATE project_assets SET file_url = $1, status = $2 WHERE id = $3', [downloadResult.url, 'completed', operation.asset_id]);
            await db.query('UPDATE operations_history SET status = $1 WHERE mystic_task_id = $2', ['success', taskId]);

            // Save to Persistent History (AWAITED)
            const userEmail = req.user?.email || (await db.query('SELECT email FROM users WHERE id=$1', [operation.user_id])).rows[0]?.email;
            console.log(`[getMysticStatus] Saving to history for ${userEmail}. Tool: ${operation.tool_name}, URL: ${downloadResult.url}`);
            const generationId = await saveToHistory(userEmail, downloadResult.url, operation.tool_name, params?.prompt, params);
            console.log(`[getMysticStatus] Saved history. GenID: ${generationId}`);

            return res.json({ success: true, data: { taskId, status: 'COMPLETED', url: downloadResult.url, generationId } });
        }

        res.json({ success: true, data: { taskId, status: apiResult.status } });
    } catch (error) {
        console.error('[getMysticStatus] Error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Available LoRA Styles
 */
const getLoRAStyles = async (req, res) => {
    try {
        const styles = await freepikService.fetchAvailableLoRAs();
        res.json({ success: true, data: styles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * AI Edit (Seedream v4 Edit)
 * Text-guided image editing
 */
const editImage = async (req, res) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
    if (!req.file) return res.status(400).json({ success: false, message: 'Image is required' });

    const { prompt, imageCount = 1 } = req.body;
    const userId = req.user.id;

    // 1. Check and deduct credits first
    const creditResult = await checkAndDeductCredits(userId, 'ai-edit');
    if (!creditResult.success) {
        return res.status(403).json({ success: false, message: creditResult.message });
    }
    const creditsCost = creditResult.cost;

    const client = await db.getClient();
    const freepikService = require('../services/freepikService');

    try {
        await client.query('BEGIN');

        // 1. Call Freepik Service (Seedream Edit)
        // We pass the uploaded file buffer directly as the main reference image
        const taskResult = await freepikService.generateSeedreamEditImage(
            req.file.buffer,
            null, // No separate background template for general edit
            {
                prompt,
                num_images: imageCount
            }
        );

        if (!taskResult.taskId) {
            throw new Error('Failed to start edit task');
        }

        // Save initial asset state (processing)
        const assetResult = await client.query(
            `INSERT INTO project_assets(user_id, status, type) VALUES($1, $2, $3) RETURNING *`,
            [userId, 'processing', 'ai-edit']
        );

        await client.query(
            `INSERT INTO operations_history(user_id, asset_id, tool_name, credits_cost, status, mystic_task_id, mystic_status, parameters)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
            [userId, assetResult.rows[0].id, 'ai-edit', creditsCost, 'processing', taskResult.taskId, taskResult.status || 'PENDING', JSON.stringify({ prompt, endpointType: 'text-to-image/seedream-v4-edit' })]
        );

        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            data: {
                taskId: taskResult.taskId,
                status: taskResult.status || 'PENDING',
                assetId: assetResult.rows[0].id
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('AI Edit error:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        client.release();
    }
};

/**
 * Add Shadows using Freepik Image Relight API
 */
const addShadows = async (req, res) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
    if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });

    const { shadowType = 'Auto', backgroundColor, aspectRatio } = req.body;
    const userId = req.user.id;

    // 1. Check and deduct credits first
    const creditResult = await checkAndDeductCredits(userId, 'add-shadows');
    if (!creditResult.success) {
        return res.status(403).json({ success: false, message: creditResult.message });
    }
    const creditsCost = creditResult.cost;

    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        // Build shadow-specific prompt based on type
        // Seedream v4 Edit needs a clear instruction on what to change while keeping the rest same
        const basePrompt = `Product photography. Keep the product exactly as is. Add a ${shadowType.toLowerCase()} shadow beneath the object. The shadow should be realistic and natural without changing the background of the image. Do not change the object. dont change the product colors or lightness`;

        let shadowPrompt = '';
        if (shadowType === 'Auto') {
            shadowPrompt = `Add a soft, natural shadow beneath the product. ${basePrompt}`;
        } else if (shadowType === 'Front') {
            shadowPrompt = `Add a shadow projecting forward from the product base. ${basePrompt}`;
        } else if (shadowType === 'Flat') {
            shadowPrompt = `Add a flat, contact shadow directly underneath the product. ${basePrompt}`;
        } else {
            shadowPrompt = `Add a natural shadow. ${basePrompt}`;
        }

        console.log(`[Add Shadows] Processing ${shadowType} shadow for user ${userId} using Seedream Edit`);

        // 1. Call Freepik Service (Seedream Edit)
        // We pass the uploaded file buffer directly as the reference image
        const taskResult = await freepikService.generateSeedreamEditImage(
            req.file.buffer,
            null, // No background reference needed for shadow addition
            {
                prompt: shadowPrompt,
                num_images: 1,
                guidance_scale: 2.5, // Lower guidance for better product preservation
                seed: Math.floor(Math.random() * 1000000),
                aspect_ratio: aspectRatio // Ensure aspect ratio is passed
            }
        );

        if (!taskResult.taskId) {
            throw new Error('Failed to start shadow generation task');
        }

        // Save initial asset state (processing)
        const assetResult = await client.query(
            `INSERT INTO project_assets(user_id, status, type) VALUES($1, $2, $3) RETURNING *`,
            [userId, 'processing', 'add-shadows']
        );

        await client.query(
            `INSERT INTO operations_history(user_id, asset_id, tool_name, credits_cost, status, mystic_task_id, mystic_status, parameters)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
            [userId, assetResult.rows[0].id, 'add-shadows', creditsCost, 'processing', taskResult.taskId, taskResult.status || 'PENDING', JSON.stringify({ shadowType, backgroundColor, aspectRatio, endpointType: 'text-to-image/seedream-v4-edit' })]
        );

        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            data: {
                taskId: taskResult.taskId,
                status: taskResult.status || 'PENDING',
                assetId: assetResult.rows[0].id
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Add Shadows error:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        client.release();
    }
};

/**
 * Get AI Fashion Models Assets
 */
const getFashionAssets = async (req, res) => {
    try {
        const { category, modelId } = req.query;
        const fs = require('fs');
        const path = require('path');

        const baseDir = path.join(__dirname, '../../../frontend/public/ai_fashion_models');

        if (!fs.existsSync(baseDir)) {
            return res.status(404).json({ success: false, message: 'Fashion assets directory not found' });
        }

        if (modelId && category) {
            // Get structure images for a specific model
            const modelDir = path.join(baseDir, category, modelId);
            if (!fs.existsSync(modelDir)) return res.json({ success: true, data: [] });

            const files = fs.readdirSync(modelDir);
            const images = files
                .filter(file => /\.(jpg|jpeg|png|webp|jfif)$/i.test(file))
                .map(file => ({
                    id: file,
                    url: `/ai_fashion_models/${category}/${modelId}/${file}`
                }));
            return res.json({ success: true, data: images });
        }

        if (category) {
            const catDir = path.join(baseDir, category);
            if (!fs.existsSync(catDir)) return res.json({ success: true, data: [] });

            // Find category thumbnail to exclude it from the list
            const categories = [
                { id: 'females', thumb: '0a45cb01f42d4f0889f0000c4c8a7c17.jpg' },
                { id: 'males', thumb: '0a45cb01f42d4f0889f0000c4c8a7c17.jpg' },
                { id: 'kids', thumb: '153364efdc4c4bcab131c010ff94cba2.webp' },
                { id: 'plus_size', thumb: 'f01b1a0b20694b5abd5424bf4424629a.webp' },
                { id: 'teens', thumb: 'fd447292f3fa44ce85ef5ee5bde652cf.webp' }
            ];
            const catInfo = categories.find(c => c.id === category);

            const items = fs.readdirSync(catDir);
            const data = items
                .filter(item => {
                    // Supported image formats
                    const isImage = /\.(jpg|jpeg|png|webp|jfif)$/i.test(item);
                    if (!isImage) return false;

                    // Exclude thumbnail image from the model selection list
                    if (catInfo && item === catInfo.thumb) return false;

                    return true;
                })
                .map(item => {
                    // id is filename without the main extension
                    const id = item.replace(/\.[^/.]+$/, "");
                    return {
                        id: id,
                        name: item,
                        url: `/ai_fashion_models/${category}/${item}`,
                        hasStructure: fs.existsSync(path.join(catDir, id)) && fs.lstatSync(path.join(catDir, id)).isDirectory()
                    };
                });
            return res.json({ success: true, data });
        }

        // Return top-level categories
        const categories = [
            { id: 'females', name: 'Females', thumbnail: '/ai_fashion_models/females/0a45cb01f42d4f0889f0000c4c8a7c17.jpg' },
            { id: 'males', name: 'Males', thumbnail: '/ai_fashion_models/males/0a45cb01f42d4f0889f0000c4c8a7c17.jpg' },
            { id: 'kids', name: 'Kids', thumbnail: '/ai_fashion_models/kids/153364efdc4c4bcab131c010ff94cba2.webp' },
            { id: 'plus_size', name: 'Plus Size', thumbnail: '/ai_fashion_models/plus_size/f01b1a0b20694b5abd5424bf4424629a.webp' },
            { id: 'teens', name: 'Teens', thumbnail: '/ai_fashion_models/teens/fd447292f3fa44ce85ef5ee5bde652cf.webp' }
        ];

        res.json({ success: true, data: categories });

    } catch (error) {
        console.error('getFashionAssets error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Generate AI Fashion Model Image
 */
const generateFashionImage = async (req, res) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });

    const {
        productImage,
        topImage,
        bottomImage,
        modelImage,
        modelStructureImage,
        prompt: userPrompt,
        resolution = 'default',
        aspectRatio = '1:1',
        imageCount = 1,
        provider = 'freepik' // 'freepik' or 'claid'
    } = req.body;

    const userId = req.user.id;

    // 1. Check and deduct credits first
    const creditResult = await checkAndDeductCredits(userId, 'ai-fashion');
    if (!creditResult.success) {
        return res.status(403).json({ success: false, message: creditResult.message });
    }
    const creditsCost = creditResult.cost;

    let client;
    try {
        client = await db.getClient();
        await client.query('BEGIN');

        // Resolve paths helper (reused from photosynthesis)
        const ensureLocalPath = (input) => {
            if (!input || typeof input !== 'string') return null;
            if (input.startsWith('data:')) {
                const base64Data = input.split(',')[1];
                const buffer = Buffer.from(base64Data, 'base64');
                const filename = `temp_fashion_${uuidv4()}.png`;
                const uploadsDir = path.join(__dirname, '../../uploads/generated');
                if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
                const tempPath = path.join(uploadsDir, filename);
                fs.writeFileSync(tempPath, buffer);
                return tempPath;
            }
            const relativeUrl = input.replace(/^https?:\/\/[^\/]+/, '');
            const possiblePaths = [
                path.join(__dirname, '../../', relativeUrl.startsWith('/') ? relativeUrl.slice(1) : relativeUrl),
                path.join(__dirname, '../../../frontend/public', relativeUrl.startsWith('/') ? relativeUrl.slice(1) : relativeUrl)
            ];
            for (const p of possiblePaths) {
                if (fs.existsSync(p)) return p;
            }
            return null;
        };

        // Helper to normalize images (resize and convert to JPG) for API stability
        const normalizeImage = async (inputPath) => {
            if (!inputPath) return null;
            try {
                const buffer = fs.readFileSync(inputPath);
                const normalizedBuffer = await sharp(buffer)
                    .resize({ width: 2048, height: 2048, fit: 'inside', withoutEnlargement: true })
                    .flatten({ background: { r: 255, g: 255, b: 255 } })
                    .jpeg({ quality: 90 })
                    .toBuffer();
                return `data:image/jpeg;base64,${normalizedBuffer.toString('base64')}`;
            } catch (err) {
                console.error('[normalizeImage] Error:', err);
                return `data:image/png;base64,${fs.readFileSync(inputPath).toString('base64')}`; // Fallback
            }
        };

        if (provider === 'claid') {
            // Claid Integration
            const claidResult = await claidService.generateFashionImage({
                model: modelStructureImage || modelImage,
                clothing: [productImage, topImage, bottomImage].filter(Boolean),
                prompt: userPrompt,
                aspect_ratio: aspectRatio === 'square_1_1' ? '1:1' : aspectRatio.replace(/^portrait_/, '').replace(/^traditional_/, '').replace(/^social_story_/, '').replace(/^standard_/, '').replace(/^classic_/, '').replace(/^widescreen_/, '').replace(/_/g, ':'),
                number_of_images: parseInt(imageCount) || 1
            });

            if (!claidResult.taskId) throw new Error('Failed to start claid fashion generation task');

            result = claidResult;
        } else {
            // Freepik (Seedream) Integration
            // Collect all reference images
            const referenceImages = [];
            const pPath = ensureLocalPath(productImage);
            if (pPath) referenceImages.push(await normalizeImage(pPath));
            else if (req.files?.['productImage']?.[0]) {
                const tempPath = path.join(__dirname, '../../uploads/temp_' + uuidv4() + '.png');
                fs.writeFileSync(tempPath, req.files['productImage'][0].buffer);
                referenceImages.push(await normalizeImage(tempPath));
                fs.unlinkSync(tempPath);
            }

            if (referenceImages.length === 0) throw new Error('Product image is required');

            const tPath = ensureLocalPath(topImage);
            if (tPath) referenceImages.push(await normalizeImage(tPath));
            else if (req.files?.['topImage']?.[0]) {
                const tempPath = path.join(__dirname, '../../uploads/temp_' + uuidv4() + '.png');
                fs.writeFileSync(tempPath, req.files['topImage'][0].buffer);
                referenceImages.push(await normalizeImage(tempPath));
                fs.unlinkSync(tempPath);
            }

            const bPath = ensureLocalPath(bottomImage);
            if (bPath) referenceImages.push(await normalizeImage(bPath));
            else if (req.files?.['bottomImage']?.[0]) {
                const tempPath = path.join(__dirname, '../../uploads/temp_' + uuidv4() + '.png');
                fs.writeFileSync(tempPath, req.files['bottomImage'][0].buffer);
                referenceImages.push(await normalizeImage(tempPath));
                fs.unlinkSync(tempPath);
            }

            // Always add model as structure reference
            const mPath = ensureLocalPath(modelStructureImage || modelImage);
            if (mPath) referenceImages.push(await normalizeImage(mPath));
            else if (req.files?.['modelImage']?.[0]) referenceImages.push(`data:image/png;base64,${req.files['modelImage'][0].buffer.toString('base64')}`);

            const baseInstructions = `High-end fashion photography. Professional studio lighting, ultra-realistic, commercially appealing, 8k resolution.
[CRITICAL - PRODUCT FIDELITY]: The model MUST be wearing the exact clothing from the provided product images. Preserve every stitch, texture, fabric pattern, logo, and tiny detail of the product.
[CRITICAL - COLOR ACCURACY]: Product colors MUST be vibrant, accurate, and perfectly matched to the reference. Do not desaturate or vary the colors.
[CRITICAL - PERFECT FIT]: The clothing must drape and fit the model's body perfectly and realistically, showing natural folds and creases where appropriate.
[CRITICAL - MODEL REALISM]: Maintain the model's exact facial features, pore-level skin texture, eyes, hair, and body structure from the reference images. The face must be rendered with high-fidelity detail.
[CRITICAL - ENVIRONMENT]: Do not change the background, lighting setup, or overall environment of the original model reference image.
The final image composition, dimensions, and perspective should be identical to the original model structure reference.`;

            const productInstructions = referenceImages.length > 2
                ? `The first images (before the last) are the target product clothing items. The absolute last image provided is the reference model and structure.`
                : `The first image is the target product clothing. The absolute last image is the reference model and structure.`;

            const fullPrompt = `${baseInstructions}\n${productInstructions}\n[USER CUSTOM REQUEST]: ${userPrompt || 'A high-end professional fashion photoshoot'}`;

            const freepikResult = await freepikService.generateSeedreamEditImage(null, null, {
                prompt: fullPrompt,
                reference_images: referenceImages,
                num_images: parseInt(imageCount) || 1,
                aspect_ratio: aspectRatio,
                guidance_scale: 5.5 // Increased from default 2.5 for stronger instruction following
            });

            if (!freepikResult.taskId) throw new Error('Failed to start fashion generation task');
            result = freepikResult;
        }

        // Save to DB and return taskId for polling
        const assetResult = await client.query(
            `INSERT INTO project_assets(user_id, status, type) VALUES($1, $2, $3) RETURNING *`,
            [userId, 'processing', 'fashion_model']
        );

        await client.query(
            `INSERT INTO operations_history(user_id, asset_id, tool_name, credits_cost, status, mystic_task_id, mystic_status, parameters)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
            [userId, assetResult.rows[0].id, 'ai_fashion_models', creditsCost, 'processing', result.taskId, result.status || 'PENDING', JSON.stringify({ ...req.body, provider, endpointType: provider === 'claid' ? 'claid' : 'text-to-image/seedream-v4-edit' })]
        );

        await client.query('COMMIT');

        // Note: Polling will be handled by existing getMysticStatus endpoint
        res.status(200).json({
            success: true,
            data: {
                taskId: result.taskId,
                status: result.status
            }
        });

    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error('generateFashionImage error:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: error.message });
        }
    } finally {
        if (client) client.release();
    }
};

/**
 * Fix Light & Colors using Freepik Relight API
 */
const fixLightColors = async (req, res) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });

    // We expect 'image' (required) and optionally 'referenceImage' (file)
    // Plus body parameters
    const imageFile = req.files['image'] ? req.files['image'][0] : null;
    const referenceFile = req.files['referenceImage'] ? req.files['referenceImage'][0] : null;

    // If no file uploaded, check if we have a URL/DataURI in body (though Frontend usually sends files for active canvas)
    // But consistent with other tools, we might support `req.body.image` if it's a URL/base64?
    // For now, let's assume `image` is required as a file if it comes from the canvas blob.

    if (!imageFile) {
        return res.status(400).json({ success: false, message: 'Image file is required' });
    }

    // Log image info to verify it's different each time
    const imageHash = require('crypto').createHash('md5').update(imageFile.buffer).digest('hex').substring(0, 8);
    console.log('[fixLightColors] Received image:', {
        filename: imageFile.originalname,
        size: imageFile.size,
        mimetype: imageFile.mimetype,
        hash: imageHash,
        timestamp: new Date().toISOString()
    });

    const {
        prompt,
        lightStrength,
        aspectRatio,
        seed
    } = req.body;

    const userId = req.user.id;

    // 1. Check and deduct credits first
    const creditResult = await checkAndDeductCredits(userId, 'fix-light');
    if (!creditResult.success) {
        return res.status(403).json({ success: false, message: creditResult.message });
    }
    const creditsCost = creditResult.cost;

    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        // Properly parse boolean values from FormData (they come as strings 'true' or 'false')
        const parseBoolean = (value) => {
            if (value === true || value === 'true') return true;
            if (value === false || value === 'false') return false;
            return undefined;
        };

        // Map to Seedream v4 Edit API parameters
        // Map lightStrength (0-100) to guidance_scale (0-20)
        // guidance_scale controls how closely output aligns with prompt
        // Higher values = stronger prompt correlation
        const guidanceScale = lightStrength !== undefined && lightStrength !== null
            ? (parseFloat(lightStrength) / 100) * 20 // Map 0-100 to 0-20, default 50% = 10
            : 2.5; // Default guidance_scale

        const options = {
            prompt: prompt || undefined,
            guidance_scale: guidanceScale,
            aspect_ratio: aspectRatio || 'square_1_1', // Default square
            seed: seed !== undefined && seed !== null && seed !== '' ? parseInt(seed) : undefined, // Optional seed for reproducibility
            reference_image: referenceFile ? referenceFile.buffer : undefined,
            endpointType: 'text-to-image/seedream-v4-edit' // For task status polling - matches the actual API endpoint
        };

        const result = await freepikService.relightImage(imageFile.buffer, options);

        if (!result.taskId) {
            throw new Error('Failed to start relight task');
        }

        // Save initial asset state
        const assetResult = await client.query(
            `INSERT INTO project_assets(user_id, status, type) VALUES($1, $2, $3) RETURNING *`,
            [userId, 'processing', 'relight_fix']
        );

        await client.query(
            `INSERT INTO operations_history(user_id, asset_id, tool_name, credits_cost, status, mystic_task_id, mystic_status, parameters)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
            [userId, assetResult.rows[0].id, 'fix_light', creditsCost, 'processing', result.taskId, result.status || 'PENDING', JSON.stringify(options)]
        );

        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            data: {
                taskId: result.taskId,
                status: result.status,
                assetId: assetResult.rows[0].id
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('fixLightColors error:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        client.release();
    }
};

/**
 * Resize & Expand image using Freepik Flux Pro Expand API or standard image processing
 */
const resizeExpand = async (req, res) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });

    const imageFile = req.file || (req.files && req.files['image'] ? req.files['image'][0] : null);
    if (!imageFile) {
        return res.status(400).json({ success: false, message: 'Image file is required' });
    }

    const {
        mode, // 'Crop', 'Resize', 'Outpaint', 'Canvas'
        targetWidth,
        targetHeight,
        prompt, // For Outpaint mode
        left,
        right,
        top,
        bottom,
        originalWidth,
        originalHeight
    } = req.body;

    const userId = req.user.id;

    // 1. Check and deduct credits first
    const creditResult = await checkAndDeductCredits(userId, 'resize-expand');
    if (!creditResult.success) {
        return res.status(403).json({ success: false, message: creditResult.message });
    }
    const creditsCost = creditResult.cost;

    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        // For Outpaint mode, use Freepik Flux Pro Expand API
        if (mode === 'Outpaint') {
            // Calculate expand pixels if not provided
            let expandLeft = left !== undefined && left !== null ? parseInt(left) : null;
            let expandRight = right !== undefined && right !== null ? parseInt(right) : null;
            let expandTop = top !== undefined && top !== null ? parseInt(top) : null;
            let expandBottom = bottom !== undefined && bottom !== null ? parseInt(bottom) : null;

            // If expand values not provided, calculate from target dimensions
            if (originalWidth && originalHeight && targetWidth && targetHeight) {
                const origW = parseInt(originalWidth);
                const origH = parseInt(originalHeight);
                const tgtW = parseInt(targetWidth);
                const tgtH = parseInt(targetHeight);

                // Calculate how much to expand on each side
                const widthDiff = tgtW - origW;
                const heightDiff = tgtH - origH;

                // Distribute expansion evenly (can be customized)
                if (expandLeft === null) expandLeft = Math.max(0, Math.floor(widthDiff / 2));
                if (expandRight === null) expandRight = Math.max(0, Math.ceil(widthDiff / 2));
                if (expandTop === null) expandTop = Math.max(0, Math.floor(heightDiff / 2));
                if (expandBottom === null) expandBottom = Math.max(0, Math.ceil(heightDiff / 2));
            }

            const options = {
                prompt: prompt || undefined,
                left: expandLeft,
                right: expandRight,
                top: expandTop,
                bottom: expandBottom,
                endpointType: 'image-expand/flux-pro'
            };

            const result = await freepikService.expandImage(imageFile.buffer, options);

            if (!result.taskId) {
                throw new Error('Failed to start expand task');
            }

            // Save initial asset state
            const assetResult = await client.query(
                `INSERT INTO project_assets(user_id, status, type) VALUES($1, $2, $3) RETURNING *`,
                [userId, 'processing', 'resize_expand']
            );

            await client.query(
                `INSERT INTO operations_history(user_id, asset_id, tool_name, credits_cost, status, mystic_task_id, mystic_status, parameters)
                VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
                [userId, assetResult.rows[0].id, 'resize_expand', creditsCost, 'processing', result.taskId, result.status || 'PENDING', JSON.stringify({ mode, ...options })]
            );

            await client.query('COMMIT');

            return res.status(200).json({
                success: true,
                data: {
                    taskId: result.taskId,
                    status: result.status,
                    assetId: assetResult.rows[0].id
                }
            });
        }

        // For Crop, Resize, and Canvas modes, use standard image processing
        const tgtW = parseInt(targetWidth);
        const tgtH = parseInt(targetHeight);

        if (!tgtW || !tgtH) {
            throw new Error('Target width and height are required');
        }

        let processedImage;
        const metadata = await sharp(imageFile.buffer).metadata();
        const origW = metadata.width;
        const origH = metadata.height;

        if (mode === 'Crop') {
            // Crop to target dimensions (centered by default, can be customized)
            const scale = Math.max(tgtW / origW, tgtH / origH);
            const scaledW = Math.round(origW * scale);
            const scaledH = Math.round(origH * scale);
            const cropX = Math.max(0, Math.floor((scaledW - tgtW) / 2));
            const cropY = Math.max(0, Math.floor((scaledH - tgtH) / 2));

            processedImage = await sharp(imageFile.buffer)
                .resize(scaledW, scaledH, { fit: 'cover' })
                .extract({ left: cropX, top: cropY, width: tgtW, height: tgtH })
                .toBuffer();
        } else if (mode === 'Resize') {
            // Resize to target dimensions (maintain aspect ratio or stretch)
            processedImage = await sharp(imageFile.buffer)
                .resize(tgtW, tgtH, { fit: 'fill' })
                .toBuffer();
        } else if (mode === 'Canvas') {
            // Create canvas with target size and place image in center
            const scale = Math.min(tgtW / origW, tgtH / origH);
            const scaledW = Math.round(origW * scale);
            const scaledH = Math.round(origH * scale);
            const offsetX = Math.floor((tgtW - scaledW) / 2);
            const offsetY = Math.floor((tgtH - scaledH) / 2);

            processedImage = await sharp({
                create: {
                    width: tgtW,
                    height: tgtH,
                    channels: 4,
                    background: { r: 255, g: 255, b: 255, alpha: 0 }
                }
            })
                .composite([{
                    input: await sharp(imageFile.buffer).resize(scaledW, scaledH).toBuffer(),
                    left: offsetX,
                    top: offsetY
                }])
                .png()
                .toBuffer();
        } else {
            throw new Error(`Unsupported mode: ${mode}`);
        }

        // Save processed image
        const uploadsDir = path.join(__dirname, '../../uploads/generated');
        // Ensure directory exists
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const filename = `resize_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
        const filepath = path.join(uploadsDir, filename);
        await fs.promises.writeFile(filepath, processedImage);

        const fileUrl = `/uploads/generated/${filename}`;

        // Save asset - use file_url column (not image_url)
        const assetResult = await client.query(
            `INSERT INTO project_assets(user_id, status, type, file_url, filename) VALUES($1, $2, $3, $4, $5) RETURNING *`,
            [userId, 'completed', 'resize_expand', fileUrl, filename]
        );

        await client.query('COMMIT');

        // Save to History helper
        const genId = await saveToHistory(req.user.email, fileUrl, 'resize_expand', mode, { mode, targetWidth, targetHeight });

        res.status(200).json({
            success: true,
            data: {
                url: fileUrl,
                generationId: genId
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('resizeExpand error:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        client.release();
    }
};

/**
 * Blur Background using Freepik Seedream v4 Edit API
 * Applies professional blur effects based on type, level, and style
 */
const blurBackground = async (req, res) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
    if (!req.file) return res.status(400).json({ success: false, message: 'Image is required' });

    const { type = 'General', level = 'Medium', style = 'Regular', aspectRatio = 'square_1_1' } = req.body;
    const userId = req.user.id;

    // 1. Check and deduct credits first
    const creditResult = await checkAndDeductCredits(userId, 'blur-background');
    if (!creditResult.success) {
        return res.status(403).json({ success: false, message: creditResult.message });
    }
    const creditsCost = creditResult.cost;

    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        // Build intelligent prompt based on blur type
        let basePrompt = '';
        switch (type) {
            case 'General':
                basePrompt = 'Apply professional natural blur to the background, keeping the main subject sharp and in focus. Create a beautiful depth of field effect that looks natural and elegant.';
                break;
            case 'Product':
                basePrompt = 'Add elegant blur around the product, highlighting it with natural depth of field effect. The product should remain perfectly sharp while the background smoothly transitions to blur. Create a premium, professional look.';
                break;
            case 'Car':
                basePrompt = 'Create dynamic motion blur around the car to emphasize speed and movement. The car should remain sharp while the background shows directional motion blur. Make it look like the car is moving at high speed.';
                break;
            case 'Car Plate':
                basePrompt = 'Apply precise blur only to the car license plate for privacy protection. Keep everything else sharp and unchanged. The blur should be strong enough to make the plate unreadable while looking natural.';
                break;
            default:
                basePrompt = 'Apply professional natural blur to the background, keeping the main subject sharp and in focus.';
        }

        // Enhance prompt with blur level
        let levelModifier = '';
        switch (level) {
            case 'Low':
                levelModifier = 'Apply a subtle, gentle blur effect.';
                break;
            case 'Medium':
                levelModifier = 'Apply a moderate blur effect with good balance.';
                break;
            case 'High':
                levelModifier = 'Apply a strong, pronounced blur effect.';
                break;
        }

        // Enhance prompt with blur style
        let styleModifier = '';
        switch (style) {
            case 'Regular':
                styleModifier = 'Use a smooth, natural gaussian blur style.';
                break;
            case 'Lens':
                styleModifier = 'Use a realistic lens bokeh blur style with circular highlights and smooth transitions, mimicking professional camera optics.';
                break;
        }

        // Combine all prompt elements
        const fullPrompt = `${basePrompt} ${levelModifier} ${styleModifier} The result should look professional, natural, and visually appealing. Maintain high image quality and preserve all details in the sharp areas.`;

        console.log(`[Blur Background] Processing ${type} blur (${level}, ${style}) with ${aspectRatio} ratio for user ${userId}`);

        // Call Freepik Service (Seedream Edit)
        const taskResult = await freepikService.generateSeedreamEditImage(
            req.file.buffer,
            null,
            {
                prompt: fullPrompt,
                num_images: 1,
                guidance_scale: 2.5,
                aspect_ratio: aspectRatio
            }
        );

        if (!taskResult.taskId) {
            throw new Error('Failed to start blur background task');
        }

        // Save initial asset state (processing)
        const assetResult = await client.query(
            `INSERT INTO project_assets(user_id, status, type) VALUES($1, $2, $3) RETURNING *`,
            [userId, 'processing', 'blur-background']
        );

        await client.query(
            `INSERT INTO operations_history(user_id, asset_id, tool_name, credits_cost, status, mystic_task_id, mystic_status, parameters)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
            [userId, assetResult.rows[0].id, 'blur-background', creditsCost, 'processing', taskResult.taskId, taskResult.status || 'PENDING', JSON.stringify({ type, level, style, aspectRatio, endpointType: 'text-to-image/seedream-v4-edit' })]
        );

        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            data: {
                taskId: taskResult.taskId,
                status: taskResult.status || 'PENDING',
                assetId: assetResult.rows[0].id
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Blur Background error:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        client.release();
    }
};

/**
 * Generate Video from Image using Freepik Kling v2.5 Pro
 */
const generateImageToVideo = async (req, res) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
    if (!req.file) return res.status(400).json({ success: false, message: 'No image file uploaded' });

    const { duration = 5, prompt, negative_prompt, cfg_scale = 0.5 } = req.body;
    const userId = req.user.id;

    // 1. Check and deduct credits first
    const creditResult = await checkAndDeductCredits(userId, 'ai-video', { duration: duration + 's' });
    if (!creditResult.success) {
        return res.status(403).json({ success: false, message: creditResult.message });
    }
    const creditsCost = creditResult.cost;

    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        // Validate duration
        if (![5, 10].includes(parseInt(duration))) {
            throw new Error('Duration must be 5 or 10 seconds');
        }

        console.log(`[Image to Video] Starting video generation for user ${userId}`);
        console.log(`[Image to Video] Duration: ${duration}s, Prompt: ${prompt?.substring(0, 50)}...`);

        // Call Freepik service
        const videoResponse = await freepikService.generateImageToVideo(req.file.buffer, {
            duration: parseInt(duration),
            prompt,
            negative_prompt,
            cfg_scale: parseFloat(cfg_scale)
        });

        const taskId = videoResponse.taskId;
        if (!taskId) throw new Error('No task_id returned from video generation');

        console.log(`[Image to Video] Task created: ${taskId}`);

        // Create asset record
        const assetResult = await client.query(
            `INSERT INTO project_assets(user_id, type, status) VALUES($1, $2, $3) RETURNING *`,
            [userId, 'video', 'processing']
        );

        // Create operation history
        const operationResult = await client.query(
            `INSERT INTO operations_history(user_id, asset_id, tool_name, credits_cost, status, parameters, mystic_task_id, mystic_status)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [userId, assetResult.rows[0].id, 'image-to-video', creditsCost, 'processing', JSON.stringify({ duration, prompt, cfg_scale, task_id: taskId, endpointType: 'image-to-video/kling-v2-5-pro' }), taskId, videoResponse.status || 'CREATED']
        );

        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            data: {
                taskId: taskId,
                status: videoResponse.status || 'CREATED',
                assetId: assetResult.rows[0].id
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('[Image to Video] Error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        client.release();
    }
};

/**
 * Add Text to an image using Freepik Seedream v4 Edit API
 */
const addText = async (req, res) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
    if (!req.file) return res.status(400).json({ success: false, message: 'Image is required' });

    const {
        style = 'SHOP NOW',
        fontFamily = 'Inter',
        fontSize = 64,
        fontWeight = 'Bold',
        lineHeight = 1.2,
        letterSpacing = 0,
        align = 'center',
        color = '#000000',
        bold = false,
        italic = false,
        underline = false,
        strikethrough = false,
        borderColor = 'transparent',
        borderWidth = 0,
        bgColor = 'transparent',
        bgOpacity = 100
    } = req.body;

    const userId = req.user.id;

    // 1. Check and deduct credits first
    const creditResult = await checkAndDeductCredits(userId, 'add-text');
    if (!creditResult.success) {
        return res.status(403).json({ success: false, message: creditResult.message });
    }
    const creditsCost = creditResult.cost;

    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        // Construct high-detail typography prompt
        const typographyInstructions = [
            'TASK: Add specific text to this image.',
            `TEXT CONTENT: "${style}"`,
            'TYPOGRAPHY SETTINGS:',
            `- Font Family: ${fontFamily}`,
            `- Font Weight: ${fontWeight}${bold ? ' (Extra Bold/Heavy)' : ''}`,
            `- Font Style: ${italic ? 'Italic' : 'Normal'}`,
            `- Text Color: ${color} (Hex code)`,
            `- Decoration: ${underline ? 'Underlined' : ''} ${strikethrough ? 'Strikethrough' : ''}`,
            `- Alignment: ${align}`,
            `- Line Height: ${lineHeight}`,
            `- Letter Spacing: ${letterSpacing}`,
            `- Border: ${borderWidth > 0 ? `Include a border of color ${borderColor} with width ${borderWidth}px` : 'No border'}`,
            `- Background: ${bgColor !== 'transparent' ? `Add a background box with color ${bgColor} and ${bgOpacity}% opacity behind the text` : 'No background box'}`,
            '',
            'CRITICAL PRESERVATION RULES:',
            '1. Keep the original product exactly as it is (shape, color, detail).',
            '2. Keep the original background exactly as it is.',
            '3. Only modify the image by adding the specified text overlay.',
            '4. The text should look professionally integrated but clearly added as a graphic element.',
            `5. Ensure the text "${style}" is perfectly legible and uses the specified color ${color}.`
        ].join('\n');

        console.log(`[Add Text] Adding text "${style}" for user ${userId}`);

        const taskResult = await freepikService.generateSeedreamEditImage(
            req.file.buffer,
            null,
            {
                prompt: typographyInstructions,
                num_images: 1,
                guidance_scale: 2.5
            }
        );

        if (!taskResult.taskId) {
            throw new Error('Failed to start add text task');
        }

        // Save initial asset state
        const assetResult = await client.query(
            `INSERT INTO project_assets(user_id, status, type) VALUES($1, $2, $3) RETURNING *`,
            [userId, 'processing', 'add-text']
        );

        await client.query(
            `INSERT INTO operations_history(user_id, asset_id, tool_name, credits_cost, status, mystic_task_id, mystic_status, parameters)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
            [userId, assetResult.rows[0].id, 'add-text', creditsCost, 'processing', taskResult.taskId, taskResult.status || 'PENDING', JSON.stringify({ style, fontFamily, fontSize, fontWeight, align, color, endpointType: 'text-to-image/seedream-v4-edit' })]
        );

        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            data: {
                taskId: taskResult.taskId,
                status: taskResult.status || 'PENDING',
                assetId: assetResult.rows[0].id
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('[Add Text Error]:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to add text to image' });
    } finally {
        client.release();
    }
};

/**
 * Improve Prompt using Freepik API
 */
const improvePrompt = async (req, res) => {
    try {
        const { prompt, type } = req.body;

        console.log(`[Improve Prompt] Received request for ${type}: "${prompt?.substring(0, 50)}..."`);

        // Call the improvement service
        const taskResult = await freepikService.improvePrompt(prompt, type || 'image');

        if (!taskResult.success) {
            throw new Error('Failed to improve prompt');
        }

        let improvedPrompt = taskResult.improvedPrompt;
        const taskId = taskResult.taskId;

        // If not immediate result, poll for it
        if (!improvedPrompt && taskId) {
            console.log(`[Improve Prompt] No immediate result, polling for task ${taskId}...`);
            let status = taskResult.status || 'CREATED';
            let attempts = 0;
            const maxAttempts = 30;

            while (attempts < maxAttempts && (status === 'CREATED' || status === 'IN_PROGRESS')) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                attempts++;

                console.log(`[Improve Prompt] Polling attempt ${attempts} for task ${taskId}...`);
                // Research shows the endpoint for improve-prompt status is /v1/ai/improve-prompt/{id}
                const statusResult = await freepikService.getTaskStatus(taskId, 'improve-prompt');
                const data = statusResult.data || statusResult;
                status = data.status;

                if (status === 'COMPLETED') {
                    improvedPrompt = data.improved_prompt || (data.generated && data.generated.length > 0 ? data.generated[0] : null);
                    if (improvedPrompt) {
                        console.log(`[Improve Prompt] Task completed! Result: "${improvedPrompt.substring(0, 50)}..."`);
                    } else {
                        console.error(`[Improve Prompt] Task completed but result not found. Data:`, JSON.stringify(data));
                        throw new Error('Task completed but no result found');
                    }
                } else if (status === 'FAILED') {
                    throw new Error('Freepik AI task failed to improve prompt');
                }
            }

            if (status !== 'COMPLETED' && !improvedPrompt) {
                throw new Error('Task timed out while improving prompt');
            }
        }

        if (!improvedPrompt) {
            throw new Error('Could not get improved prompt from Freepik');
        }

        res.status(200).json({
            success: true,
            improvedPrompt: improvedPrompt
        });

    } catch (error) {
        console.error('[Improve Prompt Error]:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to improve prompt' });
    }
};

module.exports = {
    generateImage,
    getBackgroundTemplates,
    generateBackgroundRealism,
    getHistory,
    getUserHistory,
    getImage,
    toggleFavorite,
    deleteImage,
    deleteUserGeneration,
    generateAIImage,
    upscaleImage,
    removeBackground,
    generateMysticImage,
    getMysticStatus,
    getLoRAStyles,
    editImage,
    addShadows,
    fixLightColors,
    resizeExpand,
    blurBackground,
    getFashionAssets,
    generateFashionImage,
    generateImageToVideo,
    addText,
    improvePrompt,
    uploadToHistory,
    toggleDislike
};
