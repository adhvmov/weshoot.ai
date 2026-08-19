/**
 * Contact Controller
 * Handles contact form submissions and management
 */
const db = require('../config/database');

/**
 * Submit a contact message
 */
const submitMessage = async (req, res) => {
    try {
        const { name, email, phone, company, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and message are required.'
            });
        }

        const result = await db.query(
            `INSERT INTO contact_messages (name, email, phone, company, subject, message) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [name, email, phone || null, company || null, subject || null, message]
        );

        res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully. We will contact you soon!',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Submit contact message error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while sending your message. Please try again later.'
        });
    }
};

/**
 * Get all contact messages (Admin only)
 */
const getMessages = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let queryText = 'SELECT * FROM contact_messages';
        const params = [];
        let paramIndex = 1;

        if (status) {
            queryText += ` WHERE status = $${paramIndex++}`;
            params.push(status);
        }

        queryText += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(parseInt(limit), offset);

        const result = await db.query(queryText, params);

        // Get total count for pagination
        const countResult = await db.query(
            status ? 'SELECT COUNT(*) FROM contact_messages WHERE status = $1' : 'SELECT COUNT(*) FROM contact_messages',
            status ? [status] : []
        );

        res.json({
            success: true,
            data: {
                messages: result.rows,
                pagination: {
                    total: parseInt(countResult.rows[0].count),
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Get contact messages error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Update message status (Admin only)
 */
const updateMessageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['unread', 'read', 'archived'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const result = await db.query(
            'UPDATE contact_messages SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Update message status error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Delete a message (Admin only)
 */
const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM contact_messages WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        res.json({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    submitMessage,
    getMessages,
    updateMessageStatus,
    deleteMessage,

    /**
     * Submit a custom credit request
     */
    submitCustomRequest: async (req, res) => {
        try {
            const { name, email, phone, company, userType, creditsNeeded, message } = req.body;

            if (!name || !email || !userType || !creditsNeeded) {
                return res.status(400).json({
                    success: false,
                    message: 'Name, email, user type, and credits needed are required.'
                });
            }

            const result = await db.query(
                `INSERT INTO custom_requests (name, email, phone, company, user_type, credits_needed, message) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                [name, email, phone || null, company || null, userType, creditsNeeded, message || null]
            );

            res.status(201).json({
                success: true,
                message: 'Your custom request has been submitted successfully. We will be in touch!',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Submit custom request error:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while submitting your request. Please try again later.'
            });
        }
    },

    /**
     * Get all custom requests (Admin only)
     */
    getCustomRequests: async (req, res) => {
        try {
            const { status, page = 1, limit = 20 } = req.query;
            const offset = (page - 1) * limit;

            let queryText = 'SELECT * FROM custom_requests';
            const params = [];
            let paramIndex = 1;

            if (status) {
                queryText += ` WHERE status = $${paramIndex++}`;
                params.push(status);
            }

            queryText += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
            params.push(parseInt(limit), offset);

            const result = await db.query(queryText, params);

            // Get total count for pagination
            const countResult = await db.query(
                status ? 'SELECT COUNT(*) FROM custom_requests WHERE status = $1' : 'SELECT COUNT(*) FROM custom_requests',
                status ? [status] : []
            );

            res.json({
                success: true,
                data: {
                    requests: result.rows,
                    pagination: {
                        total: parseInt(countResult.rows[0].count),
                        page: parseInt(page),
                        limit: parseInt(limit)
                    }
                }
            });
        } catch (error) {
            console.error('Get custom requests error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
};
