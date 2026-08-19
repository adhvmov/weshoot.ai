/**
 * AI Service
 * Frontend service for AI image generation and enhancement
 */
import api from './api';

/**
 * Generate an AI image from a text prompt
 * @param {Object} options - Generation options
 * @param {string} options.prompt - The text prompt
 * @param {string} options.style - Style (realistic, anime, etc.)
 * @param {string} options.aspectRatio - Aspect ratio (1:1, 16:9, etc.)
 * @param {number} options.imageCount - Number of images to generate (1-4)
 * @returns {Promise<Object>} - API response with generated images
 */
export const generateAIImage = async ({ prompt, style = 'realistic', aspectRatio = '1:1', imageCount = 1 }) => {
    try {
        const response = await api.post('/generator/ai-generate', {
            prompt,
            style,
            aspectRatio,
            imageCount
        });
        return response.data;
    } catch (error) {
        console.error('AI Generation error:', error);
        throw error.response?.data || { success: false, message: 'Failed to generate image' };
    }
};

/**
 * Upscale/Enhance an image
 * @param {Object} options - Upscale options
 * @param {File|Blob} options.image - The image file/blob to upscale
 * @param {string} options.type - Content type (General, Places, People, etc.)
 * @param {string} options.scale - Scale factor (2x, 4x) (Legacy)
 * @param {number} options.scale_factor - Numeric scale factor (2, 4)
 * @param {string} options.flavor - Upscale flavor (photo, etc.)
 * @param {number} options.sharpen - Sharpen level
 * @param {number} options.smart_grain - Smart grain level
 * @param {number} options.ultra_detail - Ultra detail level
 * @param {string} options.width - Target width (optional)
 * @param {string} options.height - Target height (optional)
 * @param {boolean} options.polish - Whether to apply face polish/enhance
 * @returns {Promise<Object>} - API response with upscaled image
 */
export const upscaleAIImage = async ({
    image,
    type = 'General',
    scale = '2x',
    scale_factor,
    flavor,
    sharpen,
    smart_grain,
    ultra_detail,
    width,
    height,
    polish = false
}) => {
    try {
        const formData = new FormData();
        formData.append('image', image);
        formData.append('type', type);
        formData.append('scale', scale);
        formData.append('polish', polish.toString());

        if (scale_factor) formData.append('scale_factor', scale_factor.toString());
        if (flavor) formData.append('flavor', flavor);
        if (sharpen !== undefined) formData.append('sharpen', sharpen.toString());
        if (smart_grain !== undefined) formData.append('smart_grain', smart_grain.toString());
        if (ultra_detail !== undefined) formData.append('ultra_detail', ultra_detail.toString());

        if (width) formData.append('width', width);
        if (height) formData.append('height', height);

        // Upload header is handled automatically by browser/axios for FormData, but we need to override the default JSON header
        const response = await api.post('/generator/upscale', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Upscale error:', error);
        throw error.response?.data || { success: false, message: 'Failed to upscale image' };
    }
};

/**
 * Get generation history
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - API response with history
 */
export const getGenerationHistory = async (options = {}) => {
    const { page = 1, limit = 10, toolName = null, onlyFavorites = false } = options;
    try {
        const params = { page, limit };
        if (toolName) params.tool_name = toolName;
        if (onlyFavorites) params.onlyFavorites = 'true';
        const response = await api.get('/generator/user-history', { params });
        return response.data;
    } catch (error) {
        console.error('Get history error:', error);
        throw error.response?.data || { success: false, message: 'Failed to get history' };
    }
};

/**
 * Get background templates
 * @param {string} category - Optional category filter
 * @returns {Promise<Object>} - API response with templates
 */
export const getBackgroundTemplates = async (category = null) => {
    try {
        const params = category ? { category } : {};
        const response = await api.get('/generator/templates', { params });
        return response.data;
    } catch (error) {
        console.error('Get templates error:', error);
        throw error.response?.data || { success: false, message: 'Failed to get templates' };
    }
};

/**
 * Remove background from an image
 * @param {Object} options - Removal options
 * @returns {Promise<Object>} - API response
 */
export const removeBackground = async ({ image, mode = 'general', backgroundColor, clipping, car, padding, prompt }) => {
    try {
        const formData = new FormData();
        formData.append('image', image);
        formData.append('mode', mode);

        if (backgroundColor) formData.append('backgroundColor', backgroundColor);
        if (clipping !== undefined) formData.append('clipping', clipping.toString());
        if (car !== undefined) formData.append('car', car.toString());
        if (padding) formData.append('padding', padding);
        if (prompt) formData.append('prompt', prompt);

        const response = await api.post('/generator/remove-background', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Remove BG error:', error);
        throw error.response?.data || { success: false, message: 'Failed to remove background' };
    }
};

export const generateBackgroundRealism = async (options) => {
    const { image, templateUrl, backgroundFile, prompt, creativity, imageCount } = options;
    try {
        const formData = new FormData();
        formData.append('image', image);

        if (backgroundFile) {
            formData.append('background', backgroundFile);
        } else if (templateUrl) {
            formData.append('templateUrl', templateUrl);
        }

        if (prompt) formData.append('prompt', prompt);
        if (creativity) formData.append('creativity', creativity);
        if (imageCount) formData.append('imageCount', imageCount);

        const response = await api.post('/generator/bg-realism', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('BG Realism error:', error);
        throw error.response?.data || { success: false, message: 'Failed to generate background' };
    }
};

/**
 * Add shadows to an image using Freepik Image Relight
 * @param {Object} options - Shadow options
 * @returns {Promise<Object>} - API response
 */
export const addShadows = async ({ image, shadowType = 'Auto', backgroundColor, aspectRatio }) => {
    try {
        const formData = new FormData();
        formData.append('image', image);
        formData.append('shadowType', shadowType);

        if (backgroundColor) formData.append('backgroundColor', backgroundColor);
        if (aspectRatio) formData.append('aspectRatio', aspectRatio);

        const response = await api.post('/generator/add-shadows', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Add Shadows error:', error);
        throw error.response?.data || { success: false, message: 'Failed to add shadows' };
    }
};

/**
 * Fix light and colors using Freepik Seedream v4 Edit
 * @param {Object} options - Seedream Edit options
 * @returns {Promise<Object>} - API response
 */
export const fixLightColors = async ({ image, prompt, referenceImage, lightStrength, aspectRatio, seed }) => {
    try {
        const formData = new FormData();
        formData.append('image', image);

        if (prompt) formData.append('prompt', prompt);
        if (referenceImage) formData.append('referenceImage', referenceImage);
        if (lightStrength !== undefined && lightStrength !== null) formData.append('lightStrength', lightStrength.toString());
        if (aspectRatio) formData.append('aspectRatio', aspectRatio);
        if (seed !== undefined && seed !== null && seed !== '') formData.append('seed', seed.toString());

        console.log('[aiService] Calling fixLightColors API endpoint (Seedream v4 Edit)', {
            hasImage: !!image,
            imageType: image ? image.constructor.name : 'null',
            contentType: 'multipart/form-data',
            settings: { prompt, lightStrength, aspectRatio, seed }
        });

        const response = await api.post('/generator/fix-light-colors', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Fix Light error:', error);
        throw error.response?.data || { success: false, message: 'Failed to fix light and colors' };
    }
};

/**
 * Resize & Expand image
 * @param {Object} options - Resize/Expand options
 * @returns {Promise<Object>} - API response
 */
export const resizeExpand = async ({ image, mode, targetWidth, targetHeight, prompt, left, right, top, bottom, originalWidth, originalHeight }) => {
    try {
        const formData = new FormData();
        formData.append('image', image);
        formData.append('mode', mode);
        formData.append('targetWidth', targetWidth.toString());
        formData.append('targetHeight', targetHeight.toString());

        if (originalWidth) formData.append('originalWidth', originalWidth.toString());
        if (originalHeight) formData.append('originalHeight', originalHeight.toString());

        if (prompt) formData.append('prompt', prompt);
        if (left !== undefined && left !== null) formData.append('left', left.toString());
        if (right !== undefined && right !== null) formData.append('right', right.toString());
        if (top !== undefined && top !== null) formData.append('top', top.toString());
        if (bottom !== undefined && bottom !== null) formData.append('bottom', bottom.toString());

        console.log('[aiService] Calling resizeExpand API endpoint', {
            hasImage: !!image,
            mode,
            targetWidth,
            targetHeight,
            prompt: prompt ? prompt.substring(0, 50) + '...' : 'None'
        });

        const response = await api.post('/generator/resize-expand', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Resize Expand error:', error);
        throw error.response?.data || { success: false, message: 'Failed to resize/expand image' };
    }
};

/**
 * Blur background of an image
 * @param {Object} options - Blur options
 * @returns {Promise<Object>} - API response
 */
export const blurBackground = async ({ image, type = 'General', level = 'Medium', style = 'Regular', aspectRatio = 'square_1_1' }) => {
    try {
        const formData = new FormData();
        formData.append('image', image);
        formData.append('type', type);
        formData.append('level', level);
        formData.append('style', style);
        formData.append('aspectRatio', aspectRatio);

        console.log('[aiService] Calling blurBackground API endpoint', {
            hasImage: !!image,
            type,
            level,
            style
        });

        const response = await api.post('/generator/blur-background', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Blur Background error:', error);
        throw error.response?.data || { success: false, message: 'Failed to blur background' };
    }
};

/**
 * Add text to an image using Freepik Seedream v4 Edit
 * @param {Object} options - Add text options
 * @returns {Promise<Object>} - API response
 */
export const addText = async (options) => {
    try {
        const { image, ...settings } = options;
        const formData = new FormData();
        formData.append('image', image);

        // Append all typography settings
        Object.keys(settings).forEach(key => {
            if (settings[key] !== undefined && settings[key] !== null) {
                formData.append(key, settings[key].toString());
            }
        });

        console.log('[aiService] Calling addText API endpoint', {
            hasImage: !!image,
            settings
        });

        const response = await api.post('/generator/add-text', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Add Text error:', error);
        throw error.response?.data || { success: false, message: 'Failed to add text to image' };
    }
};

/**
 * Improve an AI prompt using the backend endpoint
 * @param {string} prompt - The original prompt
 * @param {string} type - Generation type ('image' or 'video')
 * @returns {Promise<Object>} - API response with improvedPrompt
 */
export const improvePrompt = async (prompt, type = 'image') => {
    try {
        const response = await api.post('/generator/improve-prompt', {
            prompt,
            type
        });
        return response.data;
    } catch (error) {
        console.error('Improve Prompt error:', error);
        throw error.response?.data || { success: false, message: 'Failed to improve prompt' };
    }
};

/**
 * Upload an image from device and save to history
 * @param {File} file - The image file from device
 * @returns {Promise<Object>} - API response with url and id
 */
export const uploadToHistory = async (file) => {
    try {
        const formData = new FormData();
        formData.append('image', file);
        const response = await api.post('/generator/upload-to-history', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        console.error('Upload to history error:', error);
        throw error.response?.data || { success: false, message: 'Failed to upload image' };
    }
};

/**
 * Toggle favorite status for a generation
 * @param {string} id - Generation ID
 * @returns {Promise<Object>} - API response
 */
export const toggleFavorite = async (id) => {
    try {
        const response = await api.patch(`/generator/history/${id}/favorite`);
        return response.data;
    } catch (error) {
        console.error('Toggle favorite error:', error);
        throw error.response?.data || { success: false, message: 'Failed to toggle favorite' };
    }
};

/**
 * Toggle dislike status for a generation
 * @param {string} id - Generation ID
 * @returns {Promise<Object>} - API response
 */
export const toggleDislike = async (id) => {
    try {
        const response = await api.patch(`/generator/history/${id}/dislike`);
        return response.data;
    } catch (error) {
        console.error('Toggle dislike error:', error);
        throw error.response?.data || { success: false, message: 'Failed to toggle dislike' };
    }
};

export default {
    generateAIImage,
    upscaleAIImage,
    getGenerationHistory,
    getBackgroundTemplates,
    removeBackground,
    generateBackgroundRealism,
    addShadows,
    fixLightColors,
    resizeExpand,
    blurBackground,
    addText,
    improvePrompt,
    uploadToHistory,
    toggleFavorite,
    toggleDislike
};
