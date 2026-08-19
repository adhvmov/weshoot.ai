/**
 * Freepik Mystic API Service
 * Handles ultra-realistic, high-resolution AI image generation via Freepik Mystic API
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/generated');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Encode image file to base64
 * @param {string} imagePath - Path to image file
 * @returns {string} Base64 encoded image
 */
const encodeImageToBase64 = (imagePath) => {
    try {
        const imageBuffer = fs.readFileSync(imagePath);
        return imageBuffer.toString('base64');
    } catch (error) {
        console.error('[Freepik] Error encoding image:', error.message);
        throw new Error(`Failed to encode image: ${error.message}`);
    }
};

/**
 * Encode buffer to base64
 * @param {Buffer} buffer - Image buffer
 * @returns {string} Base64 encoded image
 */
const encodeBufferToBase64 = (buffer) => {
    return buffer.toString('base64');
};

/**
 * Generate image using Freepik Mystic API
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} - Generation result with task_id and status
 */
const generateMysticImage = async (options) => {
    const {
        prompt,
        webhookUrl,
        structureReference, // Base64 or file path
        structureStrength = 50,
        styleReference, // Base64 or file path
        adherence = 50,
        hdr = 50,
        resolution = '2k',
        aspectRatio = 'square_1_1',
        model = 'realism',
        creativeDetailing = 33,
        engine = 'automatic',
        fixedGeneration = false,
        filterNsfw = true,
        styling = {}
    } = options;

    if (!prompt) {
        throw new Error('Prompt is required for Mystic image generation');
    }

    const apiKey = process.env.FREEPIK_API_KEY;
    const apiUrl = process.env.FREEPIK_API_URL || 'https://api.freepik.com/v1/ai/mystic';

    if (!apiKey) {
        throw new Error('FREEPIK_API_KEY is not configured');
    }

    try {
        // Build request body
        const requestBody = {
            prompt,
            resolution,
            aspect_ratio: aspectRatio,
            model,
            creative_detailing: creativeDetailing,
            engine,
            fixed_generation: fixedGeneration,
            filter_nsfw: filterNsfw
        };

        // Add webhook URL only if it's a valid public URL (not localhost)
        if (webhookUrl && !webhookUrl.includes('localhost') && !webhookUrl.includes('127.0.0.1')) {
            requestBody.webhook_url = webhookUrl;
            console.log('[Freepik Mystic] Using webhook URL:', webhookUrl);
        } else {
            console.log('[Freepik Mystic] Skipping webhook (localhost detected) - using polling mode');
        }

        console.log('[Freepik Mystic] Sending Payload:', JSON.stringify(requestBody, null, 2));

        // Handle structure reference
        if (structureReference) {
            if (structureReference.startsWith('/') || structureReference.includes('\\')) {
                const b64 = encodeImageToBase64(structureReference);
                requestBody.structure_reference = b64.startsWith('data:') ? b64 : `data:image/png;base64,${b64}`;
            } else {
                requestBody.structure_reference = structureReference.startsWith('data:') ? structureReference : `data:image/png;base64,${structureReference}`;
            }
            requestBody.structure_strength = structureStrength;
        }

        // Handle style reference
        if (styleReference) {
            if (styleReference.startsWith('/') || styleReference.includes('\\')) {
                const b64 = encodeImageToBase64(styleReference);
                requestBody.style_reference = b64.startsWith('data:') ? b64 : `data:image/png;base64,${b64}`;
            } else {
                requestBody.style_reference = styleReference.startsWith('data:') ? styleReference : `data:image/png;base64,${styleReference}`;
            }
            requestBody.adherence = adherence;
            requestBody.hdr = hdr;
        }

        // Add styling options
        if (styling && Object.keys(styling).length > 0) {
            requestBody.styling = {};

            if (styling.styles && styling.styles.length > 0) {
                requestBody.styling.styles = styling.styles;
            }

            if (styling.characters && styling.characters.length > 0) {
                requestBody.styling.characters = styling.characters;
            }

            if (styling.colors && styling.colors.length > 0) {
                requestBody.styling.colors = styling.colors;
            }
        }

        console.log(`[Freepik Mystic] Generating image with prompt: "${prompt.substring(0, 50)}..."`);
        console.log(`[Freepik Mystic] Model: ${model}, Resolution: ${resolution}, Aspect: ${aspectRatio}`);

        // Make the API request
        const response = await axios.post(apiUrl, requestBody, {
            headers: {
                'x-freepik-api-key': apiKey,
                'Content-Type': 'application/json'
            },
            timeout: 120000 // 120 second timeout for image generation
        });

        // Log the full response for debugging
        console.log('[Freepik Mystic] Raw API Response:', JSON.stringify(response.data, null, 2));

        // Freepik API returns data in { data: { task_id, status, ... } } format
        const result = response.data.data || response.data;

        if (!result || !result.task_id) {
            console.error('[Freepik Mystic] Invalid response structure:', response.data);
            throw new Error('Invalid response from Freepik API - missing task_id');
        }

        console.log(`[Freepik Mystic] Task created: ${result.task_id}, Status: ${result.status}`);

        return {
            success: true,
            taskId: result.task_id,
            status: result.status,
            generated: result.generated || [],
            prompt,
            model,
            resolution,
            aspectRatio
        };

    } catch (error) {
        console.error('[Freepik Mystic] Generation error:', error.message);

        if (error.response) {
            const statusCode = error.response.status;
            const errorData = error.response.data;

            console.error(`[Freepik Mystic] API Error (${statusCode}):`, errorData);
            throw new Error(`Freepik API error (${statusCode}): ${JSON.stringify(errorData)}`);
        }

        throw new Error(`Mystic generation failed: ${error.message}`);
    }
};

/**
 * Poll task status from Freepik
 * @param {string} taskId - Mystic task ID
 * @returns {Promise<Object>} - Task status and results
 */
const getMysticTaskStatus = async (taskId) => {
    const apiKey = process.env.FREEPIK_API_KEY;
    const apiUrl = `https://api.freepik.com/v1/ai/mystic/${taskId}`;

    if (!apiKey) {
        throw new Error('FREEPIK_API_KEY is not configured');
    }

    try {
        const response = await axios.get(apiUrl, {
            headers: {
                'x-freepik-api-key': apiKey
            },
            timeout: 10000
        });

        // Handle nested data structure
        const result = response.data.data || response.data;

        console.log(`[Freepik Mystic] Status check for ${taskId}: ${result.status}`);

        return {
            success: true,
            taskId: result.task_id || taskId,
            status: result.status,
            generated: result.generated || []
        };

    } catch (error) {
        console.error('[Freepik Mystic] Status check error:', error.message);

        if (error.response) {
            throw new Error(`Status check failed (${error.response.status}): ${JSON.stringify(error.response.data)}`);
        }

        throw new Error(`Status check failed: ${error.message}`);
    }
};

/**
 * Fetch available LoRA styles from Freepik
 * @returns {Promise<Array>} - List of available LoRA styles
 */
const fetchAvailableLoRAs = async () => {
    const apiKey = process.env.FREEPIK_API_KEY;
    const apiUrl = process.env.FREEPIK_LORA_URL || 'https://api.freepik.com/v1/ai/loras';

    if (!apiKey) {
        throw new Error('FREEPIK_API_KEY is not configured');
    }

    try {
        const response = await axios.get(apiUrl, {
            headers: {
                'x-freepik-api-key': apiKey
            },
            timeout: 15000
        });

        console.log(`[Freepik Mystic] Fetched LoRA styles. Data type: ${typeof response.data}`);

        // Ensure we return an array. Freepik API sometimes wraps in { data: [...] }
        const styles = Array.isArray(response.data)
            ? response.data
            : (response.data && Array.isArray(response.data.data) ? response.data.data : []);

        console.log(`[Freepik Mystic] Returning ${styles.length} styles`);
        return styles;

    } catch (error) {
        console.error('[Freepik Mystic] LoRA fetch error:', error.message);

        if (error.response) {
            throw new Error(`LoRA fetch failed (${error.response.status}): ${JSON.stringify(error.response.data)}`);
        }

        throw new Error(`LoRA fetch failed: ${error.message}`);
    }
};

/**
 * Download generated image from URL and save to local storage
 * @param {string} imageUrl - URL of the generated image
 * @returns {Promise<Object>} - Local file info
 */
const downloadGeneratedImage = async (imageUrl) => {
    try {
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 120000 // 120 seconds for download
        });

        const filename = `mystic_${uuidv4()}.png`;
        const filepath = path.join(uploadsDir, filename);

        fs.writeFileSync(filepath, response.data);

        console.log(`[Freepik Mystic] Image downloaded: ${filepath}`);

        return {
            success: true,
            filename,
            filepath,
            url: `/uploads/generated/${filename}`
        };

    } catch (error) {
        console.error('[Freepik Mystic] Download error:', error.message);
        throw new Error(`Failed to download image: ${error.message}`);
    }
};

/**
 * Remove background using Freepik AI Tools API
 * @param {Buffer} imageBuffer - The image buffer
 * @returns {Promise<Object>} - Result info
 */
const removeBackground = async (imageBuffer) => {
    const apiKey = process.env.FREEPIK_API_KEY;
    const apiUrl = 'https://api.freepik.com/v1/ai/beta/remove-background';

    if (!apiKey) {
        throw new Error('FREEPIK_API_KEY is not configured');
    }

    try {
        console.log(`[Freepik Tools] Requesting background removal`);

        // The Tools API typically accepts a public URL or a file upload (multipart/form-data).
        // Since we have a buffer, we must use FormData.

        const FormData = require('form-data');
        const form = new FormData();

        if (Buffer.isBuffer(imageBuffer)) {
            form.append('image_file', imageBuffer, { filename: 'image.png', contentType: 'image/png' });
        } else {
            // Assume it's a base64 string or similar if not buffer
            const buffer = Buffer.from(imageBuffer, 'base64');
            form.append('image_file', buffer, { filename: 'image.png', contentType: 'image/png' });
        }

        const response = await axios.post(apiUrl, form, {
            headers: {
                'x-freepik-api-key': apiKey,
                ...form.getHeaders()
            },
            timeout: 600000
        });

        // The Tools API is usually synchronous and returns the result immediately.
        // Response format usually: { data: [{ url: "..." }] } or { data: { url: "..." } }
        let resultData = response.data.data || response.data;

        // Handle array response (common in Freepik APIs)
        if (Array.isArray(resultData)) {
            resultData = resultData[0];
        }

        if (!resultData || (!resultData.url && !resultData.image_url)) {
            console.error('[Freepik Tools] Unexpected response format:', JSON.stringify(response.data));
            throw new Error('Invalid response from Background Remover API');
        }

        // Normalize result to look like a task for the controller
        return {
            success: true,
            // Since it's sync, we don't have a real taskId, but we need one for the controller flow.
            // We'll return a fake taskId and the result URLs directly.
            taskId: `sync_remover_${uuidv4()}`,
            status: 'COMPLETED',
            url: resultData.url || resultData.image_url // Adjust based on actual response
        };

    } catch (error) {
        console.error('[Freepik Tools] API Error:', error.message);
        if (error.response?.data) {
            console.error('[Freepik Tools] Response:', JSON.stringify(error.response.data));
        }
        throw new Error(`Background removal failed: ${error.message}`);
    }
};

/**
 * Upscale image using Freepik AI Precision V2
 * @param {Buffer} imageBuffer - Image buffer
 * @param {Object} options - Upscale options
 * @returns {Promise<Object>} - Task info
 */
const upscaleImage = async (imageBuffer, options = {}) => {
    const apiKey = process.env.FREEPIK_API_KEY;
    const apiUrl = 'https://api.freepik.com/v1/ai/image-upscaler-precision-v2';

    if (!apiKey) {
        throw new Error('FREEPIK_API_KEY is not configured');
    }

    try {
        if (!imageBuffer || imageBuffer.length === 0) {
            throw new Error('Empty image buffer provided');
        }

        console.log(`[Freepik Upscale] Requesting upscale with flavor: ${options.flavor || 'photo'}, scale: ${options.scale_factor || 2}`);
        console.log(`[Freepik Upscale] Image buffer size: ${imageBuffer.length} bytes`);

        const base64Image = imageBuffer.toString('base64');
        const dataUri = base64Image.startsWith('data:') ? base64Image : `data:image/png;base64,${base64Image}`;

        const body = {
            image: dataUri,
            sharpen: options.sharpen !== undefined ? options.sharpen : 7,
            smart_grain: options.smart_grain !== undefined ? options.smart_grain : 7,
            ultra_detail: options.ultra_detail !== undefined ? options.ultra_detail : 30,
            flavor: options.flavor || 'photo',
            scale_factor: options.scale_factor || 2
        };

        // Add webhook if available
        if (process.env.FREEPIK_WEBHOOK_URL) {
            body.webhook_url = process.env.FREEPIK_WEBHOOK_URL;
        }

        console.log(`[Freepik Upscale] Sending request to ${apiUrl}`);

        const response = await axios.post(apiUrl, body, {
            headers: {
                'x-freepik-api-key': apiKey,
                'Content-Type': 'application/json'
            },
            timeout: 600000 // Increase to 600 seconds (10 minutes)
        });

        return response.data; // { data: { task_id, status, generated: [] } }
    } catch (error) {
        console.error('[Freepik Upscale] API Error:', error.message);
        if (error.response?.data) {
            console.error('[Freepik Upscale] Response:', JSON.stringify(error.response.data));
        }
        throw error;
    }
};

/**
 * Fix Light & Colors using Freepik Seedream v4 Edit API
 * @param {Buffer} imageBuffer - Image buffer
 * @param {Object} options - Fix light options
 * @returns {Promise<Object>} - Task info
 */
const relightImage = async (imageBuffer, options = {}) => {
    const apiKey = process.env.FREEPIK_API_KEY;
    const apiUrl = 'https://api.freepik.com/v1/ai/text-to-image/seedream-v4-edit';

    if (!apiKey) {
        throw new Error('FREEPIK_API_KEY is not configured');
    }

    try {
        if (!imageBuffer || imageBuffer.length === 0) {
            throw new Error('Empty image buffer provided');
        }

        // Calculate image hash for logging
        const imageHash = crypto.createHash('md5').update(imageBuffer).digest('hex').substring(0, 8);

        console.log(`[Freepik Seedream Edit - Fix Light] Image hash: ${imageHash}, Size: ${imageBuffer.length} bytes`);
        console.log(`[Freepik Seedream Edit - Fix Light] Options:`, JSON.stringify({
            prompt: options.prompt ? options.prompt.substring(0, 100) + '...' : 'None',
            has_reference_image: !!options.reference_image,
            guidance_scale: options.guidance_scale,
            aspect_ratio: options.aspect_ratio,
            seed: options.seed
        }, null, 2));

        const base64Image = imageBuffer.toString('base64');
        const imageContent = base64Image.startsWith('data:') ? base64Image : `data:image/png;base64,${base64Image}`;

        // Build reference_images array - Seedream v4 Edit uses reference_images array
        // The main product image is the first reference
        const referenceImages = [imageContent];

        // Add reference image if provided (for light/color reference)
        if (options.reference_image) {
            let referenceContent = options.reference_image;
            if (Buffer.isBuffer(options.reference_image)) {
                const refBase64 = options.reference_image.toString('base64');
                referenceContent = refBase64.startsWith('data:') ? refBase64 : `data:image/png;base64,${refBase64}`;
            } else if (typeof options.reference_image === 'string') {
                if ((options.reference_image.startsWith('/') || options.reference_image.includes('\\')) && !options.reference_image.startsWith('http')) {
                    const b64 = encodeImageToBase64(options.reference_image);
                    referenceContent = b64.startsWith('data:') ? b64 : `data:image/png;base64,${b64}`;
                } else if (options.reference_image.startsWith('http')) {
                    // If it's a URL, use it directly (API supports URLs)
                    referenceContent = options.reference_image;
                }
            }
            if (referenceContent && referenceContent !== imageContent) {
                referenceImages.push(referenceContent); // Add as second reference for style/light reference
            }
        }

        // Build prompt with instructions to fix light and colors without changing background or product
        // Add unique nonce to prevent caching
        const requestNonce = crypto.randomUUID();
        const imageHashShort = imageHash.substring(0, 8);
        const timestamp = Date.now();

        // Core instruction for fixing light and colors - CRITICAL instructions to preserve background and product
        let basePrompt = `CRITICAL INSTRUCTIONS:
1. ONLY fix and improve the lighting and colors in this image
2. DO NOT change the background - keep it exactly as it is
3. DO NOT change any product details, shapes, logos, textures, or colors of the product itself
4. DO NOT add shadows, reflections, or highlights unless they already existed
5. ONLY adjust: brightness, contrast, color balance, and lighting direction
6. Keep the product appearance identical, just improve the lighting and color correction
7. Maintain all original details and features exactly as they appear`;

        // Add user prompt if provided
        if (options.prompt && options.prompt.trim()) {
            basePrompt = `${basePrompt}\n\nUser request: ${options.prompt}`;
        }

        // Add unique identifiers to break cache - ensures each request is unique
        const finalPrompt = `${basePrompt}\n\n[nonce:${requestNonce}][img:${imageHashShort}][ts:${timestamp}]`;

        // Build body for Seedream v4 Edit API - only supported parameters
        const body = {
            prompt: finalPrompt,
            reference_images: referenceImages,
            guidance_scale: options.guidance_scale !== undefined && options.guidance_scale !== null
                ? Math.max(0, Math.min(20, parseFloat(options.guidance_scale)))
                : 2.5, // Default 2.5, range 0-20
        };

        // Add aspect_ratio if provided (optional)
        if (options.aspect_ratio) {
            const validAspectRatios = ['square_1_1', 'widescreen_16_9', 'social_story_9_16', 'portrait_2_3', 'traditional_3_4', 'standard_3_2', 'classic_4_3'];
            if (validAspectRatios.includes(options.aspect_ratio)) {
                body.aspect_ratio = options.aspect_ratio;
            }
        }

        // Add seed if provided (optional, for reproducibility)
        if (options.seed !== undefined && options.seed !== null) {
            const seedValue = parseInt(options.seed);
            if (seedValue >= 0 && seedValue <= 2147483647) {
                body.seed = seedValue;
            }
        }

        // Add webhook if available (skip localhost webhooks)
        if (process.env.FREEPIK_WEBHOOK_URL && !process.env.FREEPIK_WEBHOOK_URL.includes('localhost')) {
            body.webhook_url = process.env.FREEPIK_WEBHOOK_URL;
        }

        console.log(`[Freepik Seedream Edit - Fix Light] Sending request to ${apiUrl}`);
        console.log(`[Freepik Seedream Edit - Fix Light] Settings:`, {
            has_reference_images: referenceImages.length,
            guidance_scale: body.guidance_scale,
            aspect_ratio: body.aspect_ratio || 'default (square_1_1)',
            seed: body.seed || 'random',
            prompt_length: finalPrompt.length,
            prompt_preview: finalPrompt.substring(0, 200) + '...',
            image_hash: imageHash
        });

        const response = await axios.post(apiUrl, body, {
            headers: {
                'x-freepik-api-key': apiKey,
                'Content-Type': 'application/json'
            },
            timeout: 120000
        });

        const result = response.data.data || response.data;
        return {
            success: true,
            taskId: result.task_id,
            status: result.status,
            generated: result.generated || []
        };
    } catch (error) {
        console.error('[Freepik Seedream Edit - Fix Light] API Error:', error.message);
        if (error.response?.data) {
            const errorData = error.response.data;
            console.error('[Freepik Seedream Edit - Fix Light] Error Response:', JSON.stringify(errorData, null, 2));

            // Log invalid parameters if available
            if (errorData.invalid_params && Array.isArray(errorData.invalid_params)) {
                console.error('[Freepik Seedream Edit - Fix Light] Invalid Parameters:', JSON.stringify(errorData.invalid_params, null, 2));
                const invalidParamsList = errorData.invalid_params.map(p => {
                    if (typeof p === 'string') return p;
                    return `${p.field || p.param || p.name || 'unknown'}: ${p.message || p.reason || 'Invalid'}`;
                }).join(', ');
                throw new Error(`Freepik API validation error: ${errorData.message || 'Validation failed'}. Invalid params: ${invalidParamsList}`);
            }

            throw new Error(`Freepik API error (${error.response.status}): ${errorData.message || JSON.stringify(errorData)}`);
        }
        throw error;
    }
};

/**
 * Generate image using Seedream v4 Edit
 * @param {Buffer} imageBuffer - Product image buffer
 * @param {string} backgroundPath - Path to background template
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} - Task info
 */
const generateSeedreamEditImage = async (imageBuffer, backgroundPath, options = {}) => {
    const apiKey = process.env.FREEPIK_API_KEY;
    const apiUrl = 'https://api.freepik.com/v1/ai/text-to-image/seedream-v4-edit';

    if (!apiKey) {
        throw new Error('FREEPIK_API_KEY is not configured');
    }

    try {
        let referenceImages = [];

        // Support for flexible references (array in options or positional arguments)
        if (options.reference_images && Array.isArray(options.reference_images)) {
            referenceImages = options.reference_images;
        } else {
            if (imageBuffer) {
                const base64Product = Buffer.isBuffer(imageBuffer) ? imageBuffer.toString('base64') : imageBuffer;
                const productContent = base64Product.startsWith('data:') ? base64Product : `data:image/png;base64,${base64Product}`;
                referenceImages.push(productContent);
            }

            if (backgroundPath) {
                let backgroundContent = backgroundPath;
                if (Buffer.isBuffer(backgroundPath)) {
                    const base64Bg = backgroundPath.toString('base64');
                    backgroundContent = base64Bg.startsWith('data:') ? base64Bg : `data:image/png;base64,${base64Bg}`;
                } else if (typeof backgroundPath === 'string' && (backgroundPath.startsWith('/') || backgroundPath.includes('\\'))) {
                    const b64 = encodeImageToBase64(backgroundPath);
                    backgroundContent = b64.startsWith('data:') ? b64 : `data:image/png;base64,${b64}`;
                }
                referenceImages.push(backgroundContent);
            }
        }

        if (referenceImages.length === 0) {
            throw new Error('At least one reference image is required for Seedream Edit');
        }

        const body = {
            prompt: options.prompt,
            reference_images: referenceImages
        };

        if (options.num_images) body.num_images = parseInt(options.num_images);
        if (options.seed) body.seed = parseInt(options.seed);
        if (options.guidance_scale) body.guidance_scale = parseFloat(options.guidance_scale);
        if (options.aspect_ratio) body.aspect_ratio = options.aspect_ratio;

        // Add webhook if available
        if (process.env.FREEPIK_WEBHOOK_URL) {
            body.webhook_url = process.env.FREEPIK_WEBHOOK_URL;
        }

        console.log(`[Freepik Seedream Edit] Requesting generation for: ${apiUrl}`);

        const response = await axios.post(apiUrl, body, {
            headers: {
                'x-freepik-api-key': apiKey,
                'Content-Type': 'application/json'
            },
            timeout: 120000
        });

        const result = response.data.data || response.data;
        return {
            success: true,
            taskId: result.task_id,
            status: result.status,
            generated: result.generated || []
        };
    } catch (error) {
        console.error('[Freepik Seedream Edit] API Error:', error.message);
        if (error.response?.data) {
            console.error('[Freepik Seedream Edit] Response:', JSON.stringify(error.response.data));
        }
        throw error;
    }
};

/**
 * Get generic task status from Freepik
 * @param {string} taskId - Task ID
 * @param {string} customEndpoint - Optional custom endpoint (e.g. 'image-upscaler-precision-v2')
 * @returns {Promise<Object>} - Status info
 */
const getTaskStatus = async (taskId, customEndpoint = null) => {
    const apiKey = process.env.FREEPIK_API_KEY;

    // Default to generic tasks endpoint, or use tool-specific one if provided
    let apiUrl = customEndpoint
        ? `https://api.freepik.com/v1/ai/${customEndpoint}/${taskId}`
        : `https://api.freepik.com/v1/ai/tasks/${taskId}`;

    if (!apiKey) {
        throw new Error('FREEPIK_API_KEY is not configured');
    }

    try {
        console.log(`[Freepik Task] Checking status: ${apiUrl}`);
        const response = await axios.get(apiUrl, {
            headers: {
                'x-freepik-api-key': apiKey
            }
        });
        return response.data;
    } catch (error) {
        // If 404, try the beta task endpoint as a fallback
        if (error.response?.status === 404) {
            const fallbackUrl = customEndpoint
                ? `https://api.freepik.com/v1/ai/beta/${customEndpoint}/${taskId}`
                : `https://api.freepik.com/v1/ai/beta/tasks/${taskId}`;

            console.warn(`[Freepik Task] 404 on endpoint. Trying fallback: ${fallbackUrl}`);
            try {
                const response = await axios.get(fallbackUrl, {
                    headers: {
                        'x-freepik-api-key': apiKey
                    }
                });
                return response.data;
            } catch (fallbackError) {
                console.error(`[Freepik Task] Fallback also failed: ${fallbackError.message}`);
                throw fallbackError;
            }
        }

        console.error(`[Freepik Task] Status Error for ${taskId}: ${error.message}`);
        if (error.response?.data) {
            console.error('[Freepik Task] Response Data:', JSON.stringify(error.response.data));
        }
        throw error;
    }
};

/**
 * Verify webhook signature
 * @param {string} payload - Webhook payload as string
 * @param {string} signature - Signature from header
 * @returns {boolean} - Whether signature is valid
 */
const verifyWebhookSignature = (payload, signature) => {
    const secret = process.env.FREEPIK_WEBHOOK_SECRET;

    if (!secret) {
        console.warn('[Freepik Mystic] FREEPIK_WEBHOOK_SECRET not configured, skipping verification');
        return true;
    }

    // Bypass in development
    if (process.env.NODE_ENV !== 'production') {
        console.log('[Freepik Mystic] Signature check skipped (dev mode)');
        return true;
    }

    try {
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex');

        return signature === expectedSignature;
    } catch (error) {
        console.error('[Freepik Mystic] Signature verification error:', error.message);
        return false;
    }
};

/**
 * Expand image using Freepik Flux Pro Expand API
 * @param {Buffer} imageBuffer - Image buffer
 * @param {Object} options - Expand options
 * @returns {Promise<Object>} - Task info
 */
const expandImage = async (imageBuffer, options = {}) => {
    const apiKey = process.env.FREEPIK_API_KEY;
    const apiUrl = 'https://api.freepik.com/v1/ai/image-expand/flux-pro';

    if (!apiKey) {
        throw new Error('FREEPIK_API_KEY is not configured');
    }

    try {
        if (!imageBuffer || imageBuffer.length === 0) {
            throw new Error('Empty image buffer provided');
        }

        // Calculate image hash for logging
        const imageHash = crypto.createHash('md5').update(imageBuffer).digest('hex').substring(0, 8);

        console.log(`[Freepik Flux Pro Expand] Image hash: ${imageHash}, Size: ${imageBuffer.length} bytes`);
        console.log(`[Freepik Flux Pro Expand] Options:`, JSON.stringify({
            prompt: options.prompt ? options.prompt.substring(0, 100) + '...' : 'None',
            left: options.left,
            right: options.right,
            top: options.top,
            bottom: options.bottom
        }, null, 2));

        const base64Image = imageBuffer.toString('base64');
        const imageContent = base64Image.startsWith('data:') ? base64Image : `data:image/png;base64,${base64Image}`;

        // Build body for Flux Pro Expand API
        const body = {
            image: imageContent
        };

        // Add prompt if provided (optional)
        if (options.prompt && options.prompt.trim()) {
            body.prompt = options.prompt.trim();
        }

        // Add expansion pixels (0-2048 range, can be null)
        if (options.left !== undefined && options.left !== null) {
            body.left = Math.max(0, Math.min(2048, parseInt(options.left)));
        }
        if (options.right !== undefined && options.right !== null) {
            body.right = Math.max(0, Math.min(2048, parseInt(options.right)));
        }
        if (options.top !== undefined && options.top !== null) {
            body.top = Math.max(0, Math.min(2048, parseInt(options.top)));
        }
        if (options.bottom !== undefined && options.bottom !== null) {
            body.bottom = Math.max(0, Math.min(2048, parseInt(options.bottom)));
        }

        // Add webhook if available (skip localhost webhooks)
        if (process.env.FREEPIK_WEBHOOK_URL && !process.env.FREEPIK_WEBHOOK_URL.includes('localhost')) {
            body.webhook_url = process.env.FREEPIK_WEBHOOK_URL;
        }

        console.log(`[Freepik Flux Pro Expand] Sending request to ${apiUrl}`);
        console.log(`[Freepik Flux Pro Expand] Settings:`, {
            has_prompt: !!body.prompt,
            prompt_preview: body.prompt ? body.prompt.substring(0, 150) + '...' : 'None',
            left: body.left ?? null,
            right: body.right ?? null,
            top: body.top ?? null,
            bottom: body.bottom ?? null,
            image_hash: imageHash
        });

        const response = await axios.post(apiUrl, body, {
            headers: {
                'x-freepik-api-key': apiKey,
                'Content-Type': 'application/json'
            },
            timeout: 120000
        });

        const result = response.data.data || response.data;
        return {
            success: true,
            taskId: result.task_id,
            status: result.status,
            generated: result.generated || []
        };
    } catch (error) {
        console.error('[Freepik Flux Pro Expand] API Error:', error.message);
        if (error.response?.data) {
            const errorData = error.response.data;
            console.error('[Freepik Flux Pro Expand] Error Response:', JSON.stringify(errorData, null, 2));

            // Log invalid parameters if available
            if (errorData.invalid_params && Array.isArray(errorData.invalid_params)) {
                console.error('[Freepik Flux Pro Expand] Invalid Parameters:', JSON.stringify(errorData.invalid_params, null, 2));
                const invalidParamsList = errorData.invalid_params.map(p => {
                    if (typeof p === 'string') return p;
                    return `${p.field || p.param || p.name || 'unknown'}: ${p.message || p.reason || 'Invalid'}`;
                }).join(', ');
                throw new Error(`Freepik API validation error: ${errorData.message || 'Validation failed'}. Invalid params: ${invalidParamsList}`);
            }

            throw new Error(`Freepik API error (${error.response.status}): ${errorData.message || JSON.stringify(errorData)}`);
        }
        throw error;
    }
};

/**
 * Generate video from image using Freepik Kling v2.5 Pro API
 * @param {Buffer} imageBuffer - Image buffer
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} - Task info
 */
const generateImageToVideo = async (imageBuffer, options = {}) => {
    const apiKey = process.env.FREEPIK_API_KEY;
    const apiUrl = 'https://api.freepik.com/v1/ai/image-to-video/kling-v2-5-pro';

    if (!apiKey) {
        throw new Error('FREEPIK_API_KEY is not configured');
    }

    try {
        if (!imageBuffer || imageBuffer.length === 0) {
            throw new Error('Empty image buffer provided');
        }

        console.log(`[Freepik Image to Video] Requesting video generation`);
        console.log(`[Freepik Image to Video] Image buffer size: ${imageBuffer.length} bytes`);
        console.log(`[Freepik Image to Video] Options:`, JSON.stringify({
            duration: options.duration,
            has_prompt: !!options.prompt,
            has_negative_prompt: !!options.negative_prompt,
            cfg_scale: options.cfg_scale
        }, null, 2));

        const base64Image = imageBuffer.toString('base64');
        const dataUri = base64Image.startsWith('data:') ? base64Image : `data:image/png;base64,${base64Image}`;

        const body = {
            duration: options.duration ? String(options.duration) : "5", // Must be "5" or "10" (string)
            image: dataUri
        };

        // Add optional parameters
        if (options.prompt) {
            body.prompt = options.prompt;
        }

        if (options.negative_prompt) {
            body.negative_prompt = options.negative_prompt;
        }

        if (options.cfg_scale !== undefined && options.cfg_scale !== null) {
            body.cfg_scale = Math.max(0, Math.min(1, parseFloat(options.cfg_scale)));
        } else {
            body.cfg_scale = 0.5; // Default
        }

        // Add webhook if available (skip localhost webhooks)
        if (process.env.FREEPIK_WEBHOOK_URL && !process.env.FREEPIK_WEBHOOK_URL.includes('localhost')) {
            body.webhook_url = process.env.FREEPIK_WEBHOOK_URL;
        }

        console.log(`[Freepik Image to Video] Sending request to ${apiUrl}`);
        console.log(`[Freepik Image to Video] Settings:`, {
            duration: body.duration,
            cfg_scale: body.cfg_scale,
            prompt_length: body.prompt?.length || 0,
            has_negative_prompt: !!body.negative_prompt
        });

        const response = await axios.post(apiUrl, body, {
            headers: {
                'x-freepik-api-key': apiKey,
                'Content-Type': 'application/json'
            },
            timeout: 120000 // 2 minutes for initial request
        });

        const result = response.data.data || response.data;
        console.log(`[Freepik Image to Video] Task created: ${result.task_id}, Status: ${result.status}`);

        return {
            success: true,
            taskId: result.task_id,
            status: result.status,
            generated: result.generated || []
        };
    } catch (error) {
        console.error('[Freepik Image to Video] API Error:', error.message);
        if (error.response?.data) {
            const errorData = error.response.data;
            console.error('[Freepik Image to Video] Error Response:', JSON.stringify(errorData, null, 2));

            // Log invalid parameters if available
            if (errorData.invalid_params && Array.isArray(errorData.invalid_params)) {
                console.error('[Freepik Image to Video] Invalid Parameters:', JSON.stringify(errorData.invalid_params, null, 2));
                const invalidParamsList = errorData.invalid_params.map(p => {
                    if (typeof p === 'string') return p;
                    return `${p.field || p.param || p.name || 'unknown'}: ${p.message || p.reason || 'Invalid'}`;
                }).join(', ');
                throw new Error(`Freepik API validation error: ${errorData.message || 'Validation failed'}. Invalid params: ${invalidParamsList}`);
            }

            throw new Error(`Freepik API error (${error.response.status}): ${errorData.message || JSON.stringify(errorData)}`);
        }
        throw error;
    }
};

/**
 * Improve prompt using Freepik AI Improve Prompt API
 * @param {string} prompt - Original prompt
 * @param {string} type - Type of generation ('image' or 'video')
 * @returns {Promise<Object>} - Task info
 */
const improvePrompt = async (prompt, type = 'image') => {
    const apiKey = process.env.FREEPIK_API_KEY;
    const apiUrl = 'https://api.freepik.com/v1/ai/improve-prompt';

    if (!apiKey) {
        throw new Error('FREEPIK_API_KEY is not configured');
    }

    try {
        console.log(`[Freepik Improve Prompt] Requesting improvement for ${type}: "${prompt?.substring(0, 50)}..."`);

        const body = {
            prompt: prompt || "",
            type: type,
            language: 'en'
        };

        const response = await axios.post(apiUrl, body, {
            headers: {
                'x-freepik-api-key': apiKey,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        const result = response.data.data || response.data;
        console.log(`[Freepik Improve Prompt] Debug Response Data:`, JSON.stringify(response.data, null, 2));

        return {
            success: true,
            improvedPrompt: result.improved_prompt,
            taskId: result.task_id,
            status: result.status
        };
    } catch (error) {
        console.error('[Freepik Improve Prompt] API Error:', error.message);
        if (error.response?.data) {
            console.error('[Freepik Improve Prompt] Error Response:', JSON.stringify(error.response.data, null, 2));
            throw new Error(`Freepik API error: ${error.response.data.message || JSON.stringify(error.response.data)}`);
        }
        throw error;
    }
};

module.exports = {
    generateMysticImage,
    getMysticTaskStatus,
    fetchAvailableLoRAs,
    removeBackground,
    upscaleImage,
    getTaskStatus,
    downloadGeneratedImage,
    encodeImageToBase64,
    encodeBufferToBase64,
    verifyWebhookSignature,
    relightImage,
    generateSeedreamEditImage,
    expandImage,
    generateImageToVideo,
    improvePrompt
};
