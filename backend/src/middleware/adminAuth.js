/**
 * Admin Auth Middleware
 * Verifies JWT and checks for admin roles
 */
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const adminAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');

        // Check if this is an admin user
        const result = await db.query(
            `SELECT a.*, r.name as role_name, r.permissions 
             FROM admin_users a
             JOIN admin_roles r ON a.role_id = r.id
             WHERE a.id = $1 AND a.status = 'active'`,
            [decoded.id]
        );

        const admin = result.rows[0];
        if (!admin) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // Attach admin info to request
        req.admin = admin;
        next();
    } catch (error) {
        console.error('Admin Auth Middleware Error:', error.message);
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

module.exports = adminAuth;
