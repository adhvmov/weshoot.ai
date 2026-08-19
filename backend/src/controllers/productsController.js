/**
 * Products (Projects) Controller
 * Handles project CRUD operations with PostgreSQL
 */
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Get all projects (products) for user
 */
const getProducts = async (req, res) => {
    try {
        const { search, page = 1, limit = 10, is_favorite } = req.query;
        const userId = req.user.id;

        let queryText = 'SELECT * FROM projects WHERE user_id = $1';
        const params = [userId];
        let paramIndex = 2;

        if (is_favorite === 'true') {
            queryText += ` AND is_favorite = $${paramIndex++}`;
            params.push(true);
        }

        if (search) {
            queryText += ` AND name ILIKE $${paramIndex++}`;
            params.push(`%${search}%`);
        }

        queryText += ' ORDER BY updated_at DESC';

        // Pagination
        const offset = (page - 1) * limit;
        queryText += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(parseInt(limit), offset);

        const result = await db.query(queryText, params);

        // Count total for pagination
        const countResult = await db.query('SELECT COUNT(*) FROM projects WHERE user_id = $1', [userId]);

        res.json({
            success: true,
            data: {
                products: result.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: parseInt(countResult.rows[0].count),
                    totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
                },
            },
        });
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching projects.',
        });
    }
};

/**
 * Get single project by ID
 */
const getProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await db.query(
            'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Project not found.',
            });
        }

        // Also get assets for this project
        const assetsResult = await db.query(
            'SELECT * FROM project_assets WHERE project_id = $1 ORDER BY created_at DESC',
            [id]
        );

        res.json({
            success: true,
            data: {
                ...result.rows[0],
                assets: assetsResult.rows
            },
        });
    } catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred.',
        });
    }
};

/**
 * Create new project
 */
const createProduct = async (req, res) => {
    try {
        const { name, thumbnail_url } = req.body;
        const userId = req.user.id;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Project name is required.',
            });
        }

        const result = await db.query(
            'INSERT INTO projects (user_id, name, thumbnail_url, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, name, thumbnail_url || null, 'draft']
        );

        res.status(201).json({
            success: true,
            message: 'Project created successfully.',
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while creating project.',
        });
    }
};

/**
 * Update project
 */
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, thumbnail_url, status, is_favorite } = req.body;
        const userId = req.user.id;

        const result = await db.query(
            `UPDATE projects 
             SET name = COALESCE($1, name),
        thumbnail_url = COALESCE($2, thumbnail_url),
        status = COALESCE($3, status),
        is_favorite = COALESCE($4, is_favorite),
        updated_at = NOW()
             WHERE id = $5 AND user_id = $6 RETURNING * `,
            [name, thumbnail_url, status, is_favorite, id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Project not found.',
            });
        }

        res.json({
            success: true,
            message: 'Project updated successfully.',
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while updating project.',
        });
    }
};

/**
 * Delete project
 */
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await db.query(
            'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Project not found.',
            });
        }

        res.json({
            success: true,
            message: 'Project deleted successfully.',
        });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while deleting project.',
        });
    }
};

module.exports = {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
};
