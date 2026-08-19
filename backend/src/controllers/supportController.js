const db = require('../config/database');
const { generateAIResponse } = require('../services/aiSupportService');

const supportController = {
    // Start a new chat session
    startSession: async (req, res) => {
        try {
            const userId = req.user ? req.user.id : null; // Can be null for guest

            const result = await db.query(
                'INSERT INTO support_sessions (user_id, status) VALUES ($1, $2) RETURNING id, created_at',
                [userId, 'open']
            );

            res.json({
                success: true,
                sessionId: result.rows[0].id
            });
        } catch (error) {
            console.error('Start Session Error:', error);
            res.status(500).json({ success: false, message: 'Failed to start session' });
        }
    },

    // Handle chat message
    handleChat: async (req, res) => {
        try {
            const { sessionId, message } = req.body;

            if (!sessionId || !message) {
                return res.status(400).json({ success: false, message: 'Missing sessionId or message' });
            }

            // 1. Save User Message
            await db.query(
                'INSERT INTO support_messages (session_id, role, content) VALUES ($1, $2, $3)',
                [sessionId, 'user', message]
            );

            // 2. Fetch History (last 10 messages for context)
            const historyResult = await db.query(
                'SELECT role, content FROM support_messages WHERE session_id = $1 ORDER BY created_at ASC LIMIT 10',
                [sessionId]
            );

            const history = historyResult.rows.map(row => ({
                role: row.role,
                content: row.content
            }));

            // 3. Generate AI Response
            const aiResponseContent = await generateAIResponse(history);

            let finalResponse = aiResponseContent;

            // Fallback if AI fails
            if (!finalResponse) {
                // Determine language based on simple check or default to English
                // For simplicity, we fallback to English here, or could try to detect.
                // Re-using the fallback rule logic from prompt manually if needed, 
                // but the prompt usually handles "I don't know" gracefully.
                // This block is for NETWORK/API failures.
                finalResponse = "Sorry, I am currently experiencing connection issues. Please try again later or contact support directly.";
            }

            // 4. Save Assistant Message
            await db.query(
                'INSERT INTO support_messages (session_id, role, content) VALUES ($1, $2, $3)',
                [sessionId, 'assistant', finalResponse]
            );

            res.json({
                success: true,
                response: finalResponse
            });

        } catch (error) {
            console.error('Handle Chat Error:', error);
            res.status(500).json({ success: false, message: 'Failed to process message' });
        }
    },

    // Get Admin Chat Sessions
    getAdminChats: async (req, res) => {
        try {
            const { status, limit = 20, offset = 0 } = req.query;

            let query = `
                SELECT s.id, s.user_id, s.status, s.created_at, u.email,
                (SELECT content FROM support_messages WHERE session_id = s.id ORDER BY created_at DESC LIMIT 1) as last_message
                FROM support_sessions s
                LEFT JOIN users u ON s.user_id = u.id
            `;
            const params = [];

            if (status) {
                query += ' WHERE s.status = $1';
                params.push(status);
            }

            query += ' ORDER BY s.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
            params.push(limit, offset);

            const result = await db.query(query, params);

            res.json({
                success: true,
                sessions: result.rows
            });
        } catch (error) {
            console.error('Get Admin Chats Error:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch chats' });
        }
    },

    // Get Messages for a specific session (For Admin View)
    getSessionMessages: async (req, res) => {
        try {
            const { sessionId } = req.params;
            const result = await db.query(
                'SELECT * FROM support_messages WHERE session_id = $1 ORDER BY created_at ASC',
                [sessionId]
            );
            res.json({ success: true, messages: result.rows });
        } catch (error) {
            console.error('Get Session Messages Error:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch messages' });
        }
    }
};

module.exports = supportController;
