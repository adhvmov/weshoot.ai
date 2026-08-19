const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Verify JWT token
const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Authorization denied.',
            });
        }

        // Extract and trim token
        const token = authHeader.split(' ')[1]?.trim();

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token format.',
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');

        // Check if session is still active and user is not blocked
        const sessionCheck = await db.query(`
            SELECT s.id, u.is_blocked 
            FROM user_sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.user_id = $1 AND s.token = $2`,
            [decoded.id, token]
        );

        if (sessionCheck.rows.length === 0) {
            console.log(`[AUTH] Session not found in DB for user ${decoded.id}`);
            return res.status(401).json({
                success: false,
                message: 'Session has been revoked or is no longer active.',
            });
        }

        if (sessionCheck.rows[0].is_blocked) {
            console.log(`[AUTH] Blocked user ${decoded.id} attempted access`);
            return res.status(403).json({
                success: false,
                message: 'User blocked, contact us',
                isBlocked: true
            });
        }

        console.log(`[AUTH] Session verified for user ${decoded.id}`);
        // Add user info to request
        req.user = decoded;
        req.token = token; // Store token for logout/revocation use

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired.',
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Invalid token.',
        });
    }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
            req.user = decoded;
        }

        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.',
        });
    }
    next();
};

module.exports = {
    authenticate,
    optionalAuth,
    requireAdmin,
};
