const db = require('../config/database');

/**
 * Get all gallery prompts
 */
const getGalleryPrompts = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;
        const { onlyMyCollection } = req.query;

        let query = `
            SELECT pg.*, u.full_name as user_name,
            (SELECT COUNT(*) FROM gallery_likes WHERE prompt_id = pg.id) as likes_count,
            EXISTS(SELECT 1 FROM gallery_likes WHERE prompt_id = pg.id AND user_id = $1) as user_has_liked
            FROM prompt_gallery pg 
            LEFT JOIN users u ON pg.user_id = u.id
        `;

        const queryParams = [userId];

        if (onlyMyCollection === 'true' && userId) {
            query += ' WHERE pg.user_id = $1';
        }

        query += ' ORDER BY pg.created_at DESC';

        const result = await db.query(query, queryParams);
        res.json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        console.error('[GalleryController] Error fetching prompts:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch gallery prompts'
        });
    }
};

/**
 * Add a new prompt to the gallery
 */
const addGalleryPrompt = async (req, res) => {
    try {
        const { prompt, imageUrl } = req.body;
        const userId = req.user ? req.user.id : null;

        console.log('[GalleryController] addGalleryPrompt attempt:', { prompt, imageUrl, userId });

        if (!prompt || !imageUrl) {
            console.warn('[GalleryController] Missing fields:', { prompt: !!prompt, imageUrl: !!imageUrl });
            return res.status(400).json({
                success: false,
                message: 'Prompt and image URL are required',
                debug: { prompt: !!prompt, imageUrl: !!imageUrl }
            });
        }

        const result = await db.query(
            'INSERT INTO prompt_gallery (user_id, image_url, prompt) VALUES ($1, $2, $3) RETURNING *',
            [userId, imageUrl, prompt]
        );

        res.status(201).json({
            success: true,
            message: 'Prompt added to gallery successfully',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('[GalleryController] Error adding prompt:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to add prompt to gallery'
        });
    }
};

/**
 * Toggle like on a prompt
 */
const toggleLikePrompt = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if already liked
        const check = await db.query(
            'SELECT id FROM gallery_likes WHERE prompt_id = $1 AND user_id = $2',
            [id, userId]
        );

        if (check.rows.length > 0) {
            // Unlike
            await db.query(
                'DELETE FROM gallery_likes WHERE prompt_id = $1 AND user_id = $2',
                [id, userId]
            );
            res.json({ success: true, message: 'Unliked', liked: false });
        } else {
            // Like
            await db.query(
                'INSERT INTO gallery_likes (prompt_id, user_id) VALUES ($1, $2)',
                [id, userId]
            );
            res.json({ success: true, message: 'Liked', liked: true });
        }
    } catch (err) {
        console.error('[GalleryController] Error toggling like:', err);
        res.status(500).json({ success: false, message: 'Failed to toggle like' });
    }
};

/**
 * Delete a prompt
 */
const deletePrompt = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Ensure the prompt belongs to the user
        const check = await db.query(
            'SELECT user_id FROM prompt_gallery WHERE id = $1',
            [id]
        );

        if (check.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Prompt not found' });
        }

        if (check.rows[0].user_id !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized to delete this prompt' });
        }

        await db.query('DELETE FROM prompt_gallery WHERE id = $1', [id]);
        res.json({ success: true, message: 'Prompt deleted successfully' });
    } catch (err) {
        console.error('[GalleryController] Error deleting prompt:', err);
        res.status(500).json({ success: false, message: 'Failed to delete prompt' });
    }
};

module.exports = {
    getGalleryPrompts,
    addGalleryPrompt,
    toggleLikePrompt,
    deletePrompt
};
