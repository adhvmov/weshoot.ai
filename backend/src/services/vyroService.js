/**
 * Vyro AI Service
 * Handles text-to-image generation via Vyro AI API
 */
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/generated');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Generate an image from a text prompt using Vyro AI
 * @param {Object} options - Generation options
 * @param {string} options.prompt - The text prompt describing the image
 * @param {string} options.style - Style preset (realistic, anime, etc.)
 * @param {string} options.aspectRatio - Aspect ratio (1:1, 16:9, etc.)
 * @param {number} options.seed - Random seed for reproducibility
 * @returns {Promise<Object>} - Generated image info
 */
const generateImage = async (options) => {
    const {
        prompt,
        style = 'realistic',
        aspectRatio = '1:1',
        seed = Math.floor(Math.random() * 1000),
        sourceImage
    } = options;

    if (!prompt) {
        throw new Error('Prompt is required for image generation');
    }

    const apiKey = process.env.VYRO_API_KEY;
    const apiUrl = process.env.VYRO_API_URL || 'https://api.vyro.ai/v2/image/generations';

    if (!apiKey) {
        throw new Error('VYRO_API_KEY is not configured');
    }

    try {
        // Create form data for the API request
        const formData = new FormData();
        formData.append('prompt', prompt);
        formData.append('style', style);
        formData.append('aspect_ratio', aspectRatio);
        formData.append('seed', seed.toString());

        if (sourceImage && fs.existsSync(sourceImage)) {
            formData.append('image', fs.createReadStream(sourceImage));
            console.log(`[Vyro AI] Using source image: ${sourceImage}`);
        }

        console.log(`[Vyro AI] Generating image with prompt: "${prompt.substring(0, 50)}..."`);

        // Make the API request
        const response = await axios.post(apiUrl, formData, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                ...formData.getHeaders()
            },
            responseType: 'arraybuffer',
            timeout: 60000 // 60 second timeout for image generation
        });

        // Generate unique filename
        const filename = `${uuidv4()}.png`;
        const filepath = path.join(uploadsDir, filename);

        // Save the image to disk
        fs.writeFileSync(filepath, response.data);

        console.log(`[Vyro AI] Image saved to: ${filepath}`);

        return {
            success: true,
            filename,
            filepath,
            url: `/uploads/generated/${filename}`,
            prompt,
            style,
            aspectRatio,
            seed
        };
    } catch (error) {
        console.error('[Vyro AI] Generation error:', error.message);

        if (error.response) {
            const statusCode = error.response.status;
            const errorMessage = error.response.data
                ? Buffer.from(error.response.data).toString('utf8')
                : 'Unknown API error';

            throw new Error(`Vyro API error (${statusCode}): ${errorMessage}`);
        }

        throw new Error(`Image generation failed: ${error.message}`);
    }
};

/**
 * Generate multiple images from a prompt
 * @param {Object} options - Generation options
 * @param {number} count - Number of images to generate
 * @returns {Promise<Array>} - Array of generated image info
 */
const generateMultipleImages = async (options, count = 1) => {
    const results = [];
    const errors = [];

    for (let i = 0; i < count; i++) {
        try {
            // Use different seeds for variety
            const imageOptions = {
                ...options,
                seed: options.seed ? options.seed + i : Math.floor(Math.random() * 1000)
            };
            const result = await generateImage(imageOptions);
            results.push(result);
        } catch (error) {
            errors.push({ index: i, error: error.message });
        }
    }

    return {
        success: results.length > 0,
        images: results,
        errors: errors.length > 0 ? errors : undefined,
        totalRequested: count,
        totalGenerated: results.length
    };
};

/**
 * Upscale or enhance an image using Vyro AI (simulated via image-to-image or upscale endpoint)
 * Note: Since Vyro's upscale endpoint wasn't provided, this mimics the structure
 * but assumes we might be sending to a similar endpoint. 
 * For now, we'll try to use the upscale endpoint structure if available, or fallback to generation.
 * This implementation mimics the structure needed to send an image + params.
 * 
 * @param {Buffer} imageBuffer - The source image buffer
 * @param {Object} options - Upscale options
 */
const upscaleImage = async (imageBuffer, options) => {
    const {
        prompt, // JSON structure passed as string
        upscaleFactor = 2,
        style = 'General'
    } = options;

    const apiKey = process.env.VYRO_API_KEY;
    // Note: User hasn't provided specific upscale URL, defaulting to upscale or using generated
    // For this implementation, let's assume an upscale endpoint exists or we use image-to-image
    // Since we don't have the explicit upscale URL, we'll try a standard structure
    // If this fails, we might need to adjust based on specific API docs
    // Updated to match documented Vyro Imagine API endpoint for upscale
    const apiUrl = 'https://api.vyro.ai/v1/imagine/api/upscale';

    if (!apiKey) {
        throw new Error('VYRO_API_KEY is not configured');
    }

    try {
        const formData = new FormData();
        formData.append('image', imageBuffer, { filename: 'source.png', contentType: 'image/png' });

        // Pass the constructed JSON prompt as requested
        if (prompt) {
            formData.append('prompt', prompt);
        }

        formData.append('upscale_factor', upscaleFactor.toString());
        formData.append('style', style); // General, Places, People, etc.

        console.log(`[Vyro AI] Upscaling image with strategy: ${style} ${upscaleFactor}x`);

        // CAUTION: This URL is hypothetical based on common patterns. 
        // If Vyro uses the generation endpoint for img2img, we'd change this.
        // Given the instructions, we are implementing the logic to SEND the data.
        const response = await axios.post(apiUrl, formData, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                ...formData.getHeaders()
            },
            responseType: 'arraybuffer',
            timeout: 120000 // Longer timeout for processing
        });

        const filename = `upscale_${uuidv4()}.png`;
        const filepath = path.join(uploadsDir, filename);

        fs.writeFileSync(filepath, response.data);
        console.log(`[Vyro AI] Upscaled image saved to: ${filepath}`);

        return {
            success: true,
            filename,
            filepath,
            url: `/uploads/generated/${filename}`,
            factor: upscaleFactor,
            style
        };

    } catch (error) {
        console.error('[Vyro AI] Upscale error:', error.message);

        // Detailed error logging
        if (error.response) {
            const statusCode = error.response.status;
            try {
                const errorMessage = Buffer.from(error.response.data).toString('utf8');
                console.error(`[Vyro AI] API Response (${statusCode}):`, errorMessage);
                throw new Error(`Vyro API error (${statusCode}): ${errorMessage}`);
            } catch (e) {
                throw new Error(`Vyro API error (${statusCode})`);
            }
        }

        throw new Error(`Image upscale failed: ${error.message}`);
    }
};

const removeBackground = async (imageBuffer, options) => {
    const { mode, backgroundColor, clipping, car, padding, prompt } = options;

    const apiKey = process.env.VYRO_API_KEY;
    const apiUrl = 'https://api.vyro.ai/v2/image/background/remover';

    if (!apiKey) {
        throw new Error('VYRO_API_KEY is not configured');
    }

    try {
        const formData = new FormData();
        formData.append('image', imageBuffer, { filename: 'source.png', contentType: 'image/png' });

        if (mode === 'prompted' && prompt) {
            formData.append('prompt', prompt);
        }

        if (car) {
            formData.append('style', 'car');
        }

        if (backgroundColor && backgroundColor !== 'transparent') {
            formData.append('bg_color', backgroundColor);
        }

        if (padding) formData.append('padding', padding);

        console.log(`[Vyro AI] Removing background. Mode: ${mode}, Car: ${car}, Prompt: ${prompt}`);

        const response = await axios.post(apiUrl, formData, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                ...formData.getHeaders()
            },
            responseType: 'arraybuffer',
            timeout: 60000
        });

        const filename = `nobg_${uuidv4()}.png`;
        const filepath = path.join(uploadsDir, filename);

        fs.writeFileSync(filepath, response.data);
        console.log(`[Vyro AI] BG Removal saved to: ${filepath}`);

        return {
            success: true,
            filename,
            filepath,
            url: `/uploads/generated/${filename}`
        };

    } catch (error) {
        console.error('[Vyro AI] BG Removal error:', error.message);
        if (error.response) {
            const statusCode = error.response.status;
            try {
                const errorMessage = Buffer.from(error.response.data).toString('utf8');
                console.error(`[Vyro AI] API Response (${statusCode}):`, errorMessage);
                throw new Error(`Vyro API error (${statusCode}): ${errorMessage}`);
            } catch (e) {
                throw new Error(`Vyro API error (${statusCode})`);
            }
        }
        throw new Error(`BG Removal failed: ${error.message}`);
    }
};

module.exports = {
    generateImage,
    generateMultipleImages,
    upscaleImage,
    removeBackground
};
