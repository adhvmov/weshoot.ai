/**
 * Auth Controller
 * Handles user authentication with PostgreSQL
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { OAuth2Client } = require('google-auth-library');
const emailService = require('../services/emailService');
const axios = require('axios');
const { isDisposableEmail } = require('../utils/emailValidator');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: 'user', // Default role
        },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

/**
 * Internal helper to record user session
 */
const recordSession = async (user, token, req) => {
    try {
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        if (Array.isArray(ip)) ip = ip[0];
        if (ip && ip.includes(',')) ip = ip.split(',')[0].trim();

        const userAgent = req.headers['user-agent'] || '';

        let deviceType = 'Desktop';
        if (/mobile/i.test(userAgent)) deviceType = 'Mobile';
        else if (/tablet/i.test(userAgent)) deviceType = 'Tablet';

        let browser = 'Unknown';
        if (/chrome/i.test(userAgent)) browser = 'Chrome';
        else if (/firefox/i.test(userAgent)) browser = 'Firefox';
        else if (/safari/i.test(userAgent)) browser = 'Safari';
        else if (/edge/i.test(userAgent)) browser = 'Edge';

        console.log(`[recordSession] Recording session for ${user.email} (IP: ${ip})`);

        await db.query(
            'INSERT INTO user_sessions (user_id, token, ip_address, device_type, browser) VALUES ($1, $2, $3, $4, $5)',
            [user.id, token.trim(), ip, deviceType, browser]
        );
    } catch (err) {
        console.error('[recordSession] Error recording session:', err.message);
    }
};

/**
 * Register new user
 */
const register = async (req, res) => {
    try {
        const { email, password, full_name, avatar_url } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.',
            });
        }

        // Check if user exists
        const userCheck = await db.query('SELECT id, is_verified FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists.',
            });
        }

        // Check for disposable email
        if (isDisposableEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Disposable email addresses are not allowed. Please use a permanent email address.',
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate verification code (6 digits)
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour

        // Create user
        const newUserQuery = await db.query(
            'INSERT INTO users (email, password_hash, full_name, avatar_url, is_verified, verification_token, verification_token_expires) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [email, hashedPassword, full_name || '', avatar_url || null, false, verificationCode, expiresAt]
        );
        const newUser = newUserQuery.rows[0];

        // Create default credits for new user
        await db.query(
            'INSERT INTO user_credits (user_id, total_credits, used_credits) VALUES ($1, 50, 0)',
            [newUser.id]
        );

        // Assign default 'Free' plan subscription
        const freePlan = await db.query("SELECT id FROM plans WHERE slug = 'free'");
        if (freePlan.rows.length > 0) {
            const periodEnd = new Date();
            periodEnd.setMonth(periodEnd.getMonth() + 1);

            await db.query(
                `INSERT INTO subscriptions 
                (user_id, plan_id, status, billing_cycle, current_period_end) 
                VALUES ($1, $2, 'active', 'monthly', $3)`,
                [newUser.id, freePlan.rows[0].id, periodEnd]
            );
        }

        // Check if site is closed and add to access requests
        const settingsResult = await db.query(
            "SELECT value FROM system_settings WHERE key = 'site_config'"
        );

        if (settingsResult.rows.length > 0) {
            const siteConfig = settingsResult.rows[0].value;
            if (siteConfig.site_closed) {
                // Add email to access requests automatically
                await db.query(
                    'INSERT INTO early_access_requests (email) VALUES ($1) ON CONFLICT (email) DO NOTHING',
                    [email.toLowerCase()]
                );
            }
        }

        // Send verification email
        const emailSent = await emailService.sendVerificationCode(email, verificationCode);
        if (!emailSent) {
            console.error(`Failed to send verification email to ${email}`);
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email for verification code.',
            data: {
                email: newUser.email,
                requiresVerification: true
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during registration.',
        });
    }
};

/**
 * Login user
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.',
            });
        }

        // Find user
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }

        // Check if blocked
        if (user.is_blocked) {
            return res.status(403).json({
                success: false,
                message: 'User blocked, contact us',
                isBlocked: true
            });
        }

        // Check if verified
        if (!user.is_verified) {
            return res.status(403).json({
                success: false,
                message: 'Email not verified. Please check your inbox.',
                requiresVerification: true,
                email: user.email
            });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }

        // Generate token
        const token = generateToken(user);

        // Record session before sending response to ensure it exists for subsequent requests
        await recordSession(user, token, req);

        res.json({
            success: true,
            message: 'Login successful.',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    avatar_url: user.avatar_url,
                },
                token,
            },
        });
    } catch (error) {
        console.error('[Auth Service] Login error:', error);
        res.status(500).json({
            success: false,
            message: `Login failed: ${error.message}`,
        });
    }
};

/**
 * Google Auth
 * Securely verifies ID token from Google and upserts user
 */
const googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ success: false, message: 'Google credential is required' });
        }

        let email, name, avatar_url;

        // Check if it's a JWT (ID Token) or an Access Token
        // JWTs have 3 segments separated by dots
        if (credential.split('.').length === 3) {
            // Verify Google ID Token
            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            email = payload.email;
            name = payload.name;
            avatar_url = payload.picture;
        } else {
            // It's likely an Access Token (e.g., ya29.xxx)
            // Fetch user info from Google's UserInfo API
            const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${credential}` }
            });
            email = response.data.email;
            name = response.data.name;
            avatar_url = response.data.picture;
        }

        if (!email) {
            return res.status(400).json({ success: false, message: 'Could not retrieve email from Google' });
        }

        // Check for disposable email (rare for Google but possible via Workspace custom domains)
        if (isDisposableEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Disposable email addresses are not allowed. Please use a permanent email address.',
            });
        }

        // Check if user exists
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        let user = result.rows[0];

        if (user) {
            // Check if blocked
            if (user.is_blocked) {
                return res.status(403).json({
                    success: false,
                    message: 'User blocked, contact us',
                    isBlocked: true
                });
            }

            // User exists, update metadata if changed
            await db.query(
                'UPDATE users SET full_name = $1, avatar_url = $2 WHERE id = $3',
                [name || user.full_name, avatar_url || user.avatar_url, user.id]
            );
            // Re-fetch updated user
            const updatedResult = await db.query('SELECT * FROM users WHERE id = $1', [user.id]);
            user = updatedResult.rows[0];
        } else {
            // Register new user with random password
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            const newUserQuery = await db.query(
                'INSERT INTO users (email, password_hash, full_name, avatar_url, is_verified) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [email, hashedPassword, name || '', avatar_url || null, true]
            );
            user = newUserQuery.rows[0];

            // Default credits
            await db.query('INSERT INTO user_credits (user_id, total_credits, used_credits) VALUES ($1, 50, 0)', [user.id]);

            // Default plan
            const freePlan = await db.query("SELECT id FROM plans WHERE slug = 'free'");
            if (freePlan.rows.length > 0) {
                const periodEnd = new Date();
                periodEnd.setMonth(periodEnd.getMonth() + 1);

                await db.query(
                    `INSERT INTO subscriptions 
                    (user_id, plan_id, status, billing_cycle, current_period_end) 
                    VALUES ($1, $2, 'active', 'monthly', $3)`,
                    [user.id, freePlan.rows[0].id, periodEnd]
                );
            }
        }

        const token = generateToken(user);

        // Record session synchronously to avoid race conditions
        await recordSession(user, token, req);

        res.json({
            success: true,
            message: 'Google login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    avatar_url: user.avatar_url,
                },
                token
            }
        });

    } catch (error) {
        console.error('[Auth Service] Google auth error:', error);
        res.status(500).json({ success: false, message: `Google auth failed: ${error.message}` });
    }
};

/**
 * Get current user
 */
const getCurrentUser = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, email, full_name, avatar_url, created_at FROM users WHERE id = $1',
            [req.user.id]
        );
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }

        // Also get credits and plan details
        const creditResult = await db.query(
            `SELECT c.total_credits, c.used_credits, p.name as plan_name, p.slug as plan_slug 
             FROM user_credits c
             LEFT JOIN subscriptions s ON s.user_id = c.user_id AND s.status = 'active'
             LEFT JOIN plans p ON p.id = s.plan_id
             WHERE c.user_id = $1`,
            [user.id]
        );
        const creditData = creditResult.rows[0] || { total_credits: 0, used_credits: 0, plan_name: 'Free', plan_slug: 'free' };

        // Fetch tool usage counts from operations_history
        const usageResult = await db.query(
            `SELECT tool_name, parameters 
             FROM operations_history 
             WHERE user_id = $1 AND status = 'success'`,
            [user.id]
        );

        // Group usage by category to match pricing plan
        const usage = {
            'upscale-2k': 0,
            'upscale-4k': 0,
            'remove-bg': 0,
            'ai-photoshoot': 0,
            'ai-background': 0,
            'ai-fashion': 0,
            'ai-video-5s': 0,
            'ai-video-10s': 0,
            'ai-edit': 0,
            'ai-shadows': 0,
            'fix-light': 0,
            'blur-background': 0
        };

        usageResult.rows.forEach(row => {
            const tool = row.tool_name;
            let params = row.parameters;
            if (typeof params === 'string') {
                try { params = JSON.parse(params); } catch (e) { params = {}; }
            }

            if (tool === 'upscale') {
                // Check resolution in params
                const res = params?.scale || params?.scale_factor || '2';
                if (res === '4' || res === 4 || res === '4x') usage['upscale-4k']++;
                else usage['upscale-2k']++;
            }
            else if (tool === 'remove-bg') usage['remove-bg']++;
            else if (tool === 'ai_photoshoot' || tool === 'photoshoot_precise' || tool === 'photoshoot_creative' || tool === 'photoshoot_inspiration' || tool === 'photoshoot_product swap' || tool === 'photoshoot') {
                usage['ai-photoshoot']++;
            }
            else if (tool === 'bg-seedream' || tool === 'ai-background' || tool === 'photoshoot_background') {
                usage['ai-background']++;
            }
            else if (tool === 'ai-edit') usage['ai-edit']++;
            else if (tool === 'add-shadows' || tool === 'ai-shadows') usage['ai-shadows']++;
            else if (tool === 'fix-light' || tool === 'fix_light') usage['fix-light']++;
            else if (tool === 'ai_fashion' || tool === 'ai_fashion_models' || tool === 'ai-fashion') usage['ai-fashion']++;
            else if (tool === 'ai-video') {
                // Check duration in params
                const duration = params?.duration || 5;
                if (duration === 10 || duration === '10' || duration === '10s') usage['ai-video-10s']++;
                else usage['ai-video-5s']++;
            }
            else if (tool === 'blur-background') usage['blur-background']++;
        });

        res.json({
            success: true,
            data: {
                ...user,
                credits: {
                    total_credits: creditData.total_credits,
                    used_credits: creditData.used_credits
                },
                plan: {
                    name: creditData.plan_name || 'Free',
                    slug: creditData.plan_slug || 'free',
                    usage: usage
                }
            },
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred.',
        });
    }
};

/**
 * Logout user
 */
const logout = async (req, res) => {
    try {
        const token = req.token;
        if (token) {
            await db.query('DELETE FROM user_sessions WHERE token = $1', [token]);
        }
        res.json({
            success: true,
            message: 'Logged out successfully.',
        });
    } catch (err) {
        console.error('Logout error:', err);
        res.status(500).json({ success: false, message: 'Logout failed' });
    }
};

/**
 * Verify Email with Code
 */
const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ success: false, message: 'Email and code are required' });
        }

        const result = await db.query(
            'SELECT * FROM users WHERE email = $1 AND verification_token = $2 AND verification_token_expires > NOW()',
            [email, code]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
        }

        const user = result.rows[0];

        // Update user to verified
        await db.query(
            'UPDATE users SET is_verified = true, verification_token = NULL, verification_token_expires = NULL WHERE id = $1',
            [user.id]
        );

        // Generate token
        const token = generateToken(user);

        // Record session synchronously
        await recordSession(user, token, req);

        res.json({
            success: true,
            message: 'Email verified successfully!',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    avatar_url: user.avatar_url,
                },
                token
            }
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ success: false, message: 'Verification failed' });
    }
};

/**
 * Resend Verification Code
 */
const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = result.rows[0];
        if (user.is_verified) {
            return res.status(400).json({ success: false, message: 'Email is already verified' });
        }

        // Generate new code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 3600000);

        await db.query(
            'UPDATE users SET verification_token = $1, verification_token_expires = $2 WHERE id = $3',
            [verificationCode, expiresAt, user.id]
        );

        await emailService.sendVerificationCode(email, verificationCode);

        res.json({ success: true, message: 'Verification code resent!' });
    } catch (error) {
        console.error('Resend error:', error);
        res.status(500).json({ success: false, message: 'Failed to resend code' });
    }
};

/**
 * Forgot Password - Send Code
 */
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            // For security, don't reveal if user exists. 
            // But usually in small apps, we just say not found. 
            return res.status(404).json({ success: false, message: 'User with this email not found' });
        }

        const user = result.rows[0];

        // Generate 6-digit code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        await db.query(
            'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
            [resetCode, expiresAt, user.id]
        );

        await emailService.sendPasswordResetCode(email, resetCode);

        res.json({ success: true, message: 'Password reset code sent to your email' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, message: 'Failed to process forgot password' });
    }
};

/**
 * Verify Reset Code
 */
const verifyResetCode = async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ success: false, message: 'Email and code are required' });
        }

        const result = await db.query(
            'SELECT * FROM users WHERE email = $1 AND reset_token = $2 AND reset_token_expires > NOW()',
            [email, code]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset code' });
        }

        res.json({ success: true, message: 'Code verified successfully' });
    } catch (error) {
        console.error('Verify reset code error:', error);
        res.status(500).json({ success: false, message: 'Failed to verify reset code' });
    }
};

/**
 * Reset Password
 */
const resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        if (!email || !code || !newPassword) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Verify code again for safety
        const result = await db.query(
            'SELECT * FROM users WHERE email = $1 AND reset_token = $2 AND reset_token_expires > NOW()',
            [email, code]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid session or expired code' });
        }

        const user = result.rows[0];

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password, mark as verified, and clear reset token
        console.log(`Updating user ${user.id} to verified and new password hash...`);
        const updateResult = await db.query(
            'UPDATE users SET password_hash = $1, is_verified = TRUE, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
            [hashedPassword, user.id]
        );
        console.log('Update result rows:', updateResult.rowCount);

        res.json({ success: true, message: 'Password has been reset successfully. You can now login.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Failed to reset password' });
    }
};

/**
 * Delete Account
 * Permanently deletes user account and all associated data
 */
const deleteAccount = async (req, res) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        const userId = req.user.id;

        // 1. Delete support messages related to user's sessions
        // We find sessions belonging to the user and delete their messages locally or via subquery
        await client.query(`
            DELETE FROM support_messages 
            WHERE session_id IN (SELECT id FROM support_sessions WHERE user_id = $1)
        `, [userId]);

        // 2. Delete support sessions
        await client.query('DELETE FROM support_sessions WHERE user_id = $1', [userId]);

        // 3. Delete operations history
        await client.query('DELETE FROM operations_history WHERE user_id = $1', [userId]);

        // 4. Delete project assets
        await client.query('DELETE FROM project_assets WHERE user_id = $1', [userId]);

        // 5. Delete user
        const result = await client.query('DELETE FROM users WHERE id = $1', [userId]);

        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete account'
        });
    } finally {
        client.release();
    }
};

/**
 * Get active sessions for current user
 */
const getActiveSessions = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.query(
            'SELECT id, ip_address, device_type, browser, created_at FROM user_sessions WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get active sessions error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch active sessions' });
    }
};

/**
 * Revoke (delete) a session
 */
const revokeSession = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await db.query(
            'DELETE FROM user_sessions WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        res.json({
            success: true,
            message: 'Session revoked successfully'
        });
    } catch (error) {
        console.error('Revoke session error:', error);
        res.status(500).json({ success: false, message: 'Failed to revoke session' });
    }
};


/**
 * Get total user count
 */
const getTotalUserCount = async (req, res) => {
    try {
        const result = await db.query('SELECT COUNT(*) FROM users');
        const count = parseInt(result.rows[0].count);
        res.json({ success: true, count });
    } catch (error) {
        console.error('Get user count error:', error);
        res.status(500).json({ success: false, message: 'Failed to get user count' });
    }
};

module.exports = {
    register,
    login,
    googleAuth,
    getCurrentUser,
    logout,
    verifyEmail,
    resendVerification,
    forgotPassword,
    verifyResetCode,
    resetPassword,
    deleteAccount,
    getActiveSessions,
    revokeSession,
    getTotalUserCount
};
