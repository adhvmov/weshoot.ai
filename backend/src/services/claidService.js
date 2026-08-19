const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const uploadsDir = path.join(__dirname, '../../uploads/generated');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Claid AI API Service
 */
const ClaidService = {
    /**
     * Get Public URL for a local file (via Ngrok)
     */
    getPublicUrl: (filename) => {
        const webhookUrl = process.env.FREEPIK_WEBHOOK_URL; // Reusing this to find the ngrok base URL
        if (webhookUrl) {
            try {
                const urlObj = new URL(webhookUrl);
                return `${urlObj.origin}/uploads/generated/${filename}?ngrok-skip-browser-warning=1`;
            } catch (e) {
                console.error('[Claid] URL Parse error:', e);
            }
        }
        return `http://localhost:5001/uploads/generated/${filename}`;
    },

    /**
     * Resolve image to a URL that Claid can access
     */
    resolveToUrl: async (input) => {
        if (!input) return null;
        const sharp = require('sharp');

        let finalInput = input;
        let buffer;
        let filename = `claid_input_${uuidv4()}.jpg`;

        try {
            // 1. Resolve Input to Buffer
            if (typeof finalInput === 'string' && finalInput.startsWith('data:')) {
                const base64Data = finalInput.split(',')[1];
                buffer = Buffer.from(base64Data, 'base64');
            } else if (typeof finalInput === 'string' && finalInput.startsWith('http')) {
                // If it's a localhost URL, try to find it on disk first for speed and reliable conversion
                if (finalInput.includes('localhost') || finalInput.includes('127.0.0.1')) {
                    const inputUrl = new URL(finalInput);
                    const relativePath = inputUrl.pathname.replace(/^\/uploads\//, 'uploads/');
                    const fullPath = path.join(__dirname, '../../', relativePath);
                    if (fs.existsSync(fullPath)) {
                        buffer = fs.readFileSync(fullPath);
                    }
                }

                // If we couldn't get it from disk or it's a remote URL, fetch it
                if (!buffer) {
                    console.log(`[Claid] Fetching remote asset: ${finalInput}`);
                    const response = await axios.get(finalInput, {
                        responseType: 'arraybuffer',
                        headers: { 'ngrok-skip-browser-warning': '1' }
                    });
                    buffer = Buffer.from(response.data);
                }
            } else {
                // Check for relative paths or full paths
                const relativePath = typeof finalInput === 'string' && finalInput.startsWith('/') ? finalInput.slice(1) : finalInput;
                const possiblePaths = [
                    path.join(__dirname, '../../', relativePath),
                    path.join(__dirname, '../../../frontend/public', relativePath),
                    finalInput
                ];

                let foundPath = null;
                for (const p of possiblePaths) {
                    if (typeof p === 'string' && fs.existsSync(p) && fs.lstatSync(p).isFile()) {
                        foundPath = p;
                        break;
                    }
                }

                if (foundPath) {
                    buffer = fs.readFileSync(foundPath);
                }
            }

            if (!buffer) {
                console.warn(`[Claid] Could not resolve buffer for: ${finalInput}`);
                return finalInput;
            }

            // 2. Convert to Standardized JPG using Sharp
            // This ensures no extension-content mismatch and handles transparency (flatten to white)
            // Also resizes to a max of 2048px to avoid API resolution limits (Error 2002/503)
            const processedBuffer = await sharp(buffer)
                .resize({ width: 2048, height: 2048, fit: 'inside', withoutEnlargement: true })
                .flatten({ background: { r: 255, g: 255, b: 255 } }) // White background for transparency
                .jpeg({ quality: 90 })
                .toBuffer();

            const filepath = path.join(uploadsDir, filename);
            fs.writeFileSync(filepath, processedBuffer);

            // Wait for propagation
            await new Promise(resolve => setTimeout(resolve, 1500));

            const publicUrl = ClaidService.getPublicUrl(filename);
            console.log(`[Claid] Resolved image to JPG: ${publicUrl}`);
            return publicUrl;

        } catch (error) {
            console.error(`[Claid] Resolve Error for ${finalInput}:`, error.message);
            return finalInput; // Fallback to original
        }
    },

    /**
     * Generate Fashion Image
     */
    generateFashionImage: async (options) => {
        const apiKey = process.env.CLAID_API_KEY;
        const apiUrl = 'https://api.claid.ai/v1/image/ai-fashion-models';

        if (!apiKey) throw new Error('CLAID_API_KEY is not configured');

        const {
            model,
            clothing = [],
            prompt = "",
            aspect_ratio = "1:1",
            number_of_images = 1
        } = options;

        // Resolve model and clothing to public URLs
        const modelUrl = await ClaidService.resolveToUrl(model);
        const clothingUrls = await Promise.all(clothing.map(c => ClaidService.resolveToUrl(c)));

        // Map internal aspect ratios to Claid standard formats if needed
        const claidAspectRatio = aspect_ratio.includes(':') ? aspect_ratio : '1:1';

        const payload = {
            input: {
                clothing: clothingUrls.filter(Boolean),
                model: modelUrl
            },
            options: {
                aspect_ratio: claidAspectRatio,
                pose: "use same pose of the model image"
            }
        };

        // User requested to use 'background' instead of 'prompt', and only if not empty
        if (prompt && prompt.trim()) {
            payload.options.background = prompt.trim();
        }

        // Output settings
        payload.output = {
            number_of_images: Math.min(4, Math.max(1, number_of_images))
        };

        console.log('[Claid] Sending Payload:', JSON.stringify(payload, null, 2));

        try {
            const response = await axios.post(apiUrl, payload, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            // Claid returns { data: { task_id, ... } } or similar
            const result = response.data.data || response.data;

            return {
                success: true,
                taskId: result.task_id || result.id,
                status: result.status || 'PENDING'
            };
        } catch (error) {
            console.error('[Claid] Generation Error:', error.response?.data || error.message);
            throw new Error(`Claid API Error: ${JSON.stringify(error.response?.data || error.message)}`);
        }
    },

    /**
     * Get Task Status
     */
    getTaskStatus: async (taskId) => {
        const apiKey = process.env.CLAID_API_KEY;
        // AI Fashion Models has a specialized status endpoint
        const apiUrl = `https://api.claid.ai/v1/image/ai-fashion-models/${taskId}`;

        if (!apiKey) throw new Error('CLAID_API_KEY is not configured');

        try {
            const response = await axios.get(apiUrl, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });

            const result = response.data.data || response.data;
            console.log(`[Claid] Status for ${taskId}:`, result.status);

            // Claid Fashion status: ACCEPTED, PROCESSING, DONE, ERROR
            // Map them to our internal status: PENDING, RUNNING, COMPLETED, FAILED
            let status = 'PENDING';
            let outputUrl = null;

            if (result.status === 'DONE') {
                status = 'COMPLETED';
                console.log('[Claid DEBUG] Full Result for DONE:', JSON.stringify(result, null, 2));
                if (result.result && result.result.output_objects && result.result.output_objects.length > 0) {
                    // Structure seen in logs: result.result.output_objects[0].tmp_url
                    outputUrl = result.result.output_objects[0].tmp_url;
                } else if (result.output && result.output.images && result.output.images.length > 0) {
                    outputUrl = result.output.images[0].url;
                } else if (result.output && result.output.tmp_url) {
                    // Sometimes Claid might return tmp_url at top level of output? Just guessing/fallback
                    outputUrl = result.output.tmp_url;
                }
            } else if (result.status === 'ERROR') {
                status = 'FAILED';
                console.error(`[Claid] Task ${taskId} failed:`, JSON.stringify(result, null, 2));
            } else if (result.status === 'PROCESSING') {
                status = 'RUNNING';
            } else if (result.status === 'ACCEPTED') {
                status = 'PENDING';
            }

            return {
                success: true,
                status,
                url: outputUrl,
                error: result.error
            };
        } catch (error) {
            console.error('[Claid] Status Check Error:', error.response?.data || error.message);
            throw new Error(`Claid Status Error: ${error.message}`);
        }
    }
};

module.exports = ClaidService;
