/**
 * Admin Controller
 * Handles Business Control Center logic
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Generate Admin JWT
const generateAdminToken = (admin) => {
    return jwt.sign(
        {
            id: admin.id,
            username: admin.username,
            type: 'admin'
        },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '24h' }
    );
};

/**
 * Admin Login
 */
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password required' });
        }

        const result = await db.query(
            `SELECT a.*, r.name as role_name 
             FROM admin_users a 
             JOIN admin_roles r ON a.role_id = r.id 
             WHERE a.username = $1`,
            [username]
        );

        const admin = result.rows[0];
        if (!admin || admin.status !== 'active') {
            return res.status(401).json({ success: false, message: 'Invalid credentials or inactive account' });
        }

        const isValid = await bcrypt.compare(password, admin.password_hash);
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateAdminToken(admin);

        // Update last login
        await db.query('UPDATE admin_users SET last_login = NOW() WHERE id = $1', [admin.id]);

        // Log action
        await db.query(
            'INSERT INTO admin_logs (admin_id, action, details, ip_address) VALUES ($1, $2, $3, $4)',
            [admin.id, 'login', JSON.stringify({ device: req.headers['user-agent'] }), req.ip]
        );

        res.json({
            success: true,
            data: {
                token,
                admin: {
                    id: admin.id,
                    username: admin.username,
                    full_name: admin.full_name,
                    role: admin.role_name
                }
            }
        });
    } catch (error) {
        console.error('Admin Login Error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
};

/**
 * Get Dashboard KPIs
 */
const getDashboardKPIs = async (req, res) => {
    try {
        const stats = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '24 hours') as new_users_24h,
                (SELECT COUNT(*) FROM operations_history WHERE created_at > NOW() - INTERVAL '24 hours') as generations_24h,
                (SELECT COALESCE(SUM(credits_cost), 0) FROM operations_history WHERE created_at > NOW() - INTERVAL '24 hours') as credits_24h
        `);

        res.json({ success: true, data: stats.rows[0] });
    } catch (error) {
        console.error('Admin Stats Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
};

/**
 * Get All Users
 */
const getUsers = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                u.id, u.email, u.full_name, u.is_verified, u.is_blocked,
                COALESCE(uc.total_credits, 0) as total_credits,
                COALESCE(uc.used_credits, 0) as used_credits,
                u.created_at,
                'User' as role,
                COALESCE(p.name, 'Free') as plan_name,
                (SELECT COUNT(*) FROM operations_history WHERE user_id = u.id) as total_generations,
                (SELECT MAX(COALESCE(last_active, created_at)) FROM user_sessions WHERE user_id = u.id) as last_active,
                (SELECT ip_address FROM user_sessions WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) as last_ip
            FROM users u
            LEFT JOIN user_credits uc ON u.id = uc.user_id
            LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
            LEFT JOIN plans p ON s.plan_id = p.id
            
            UNION ALL
            
            SELECT 
                a.id, a.username as email, a.full_name, true as is_verified, false as is_blocked,
                99999 as total_credits, 
                0 as used_credits,
                a.created_at,
                r.name as role,
                'Lifetime' as plan_name,
                0 as total_generations,
                a.last_login as last_active,
                NULL as last_ip
            FROM admin_users a
            JOIN admin_roles r ON a.role_id = r.id
            
            ORDER BY created_at DESC
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Fetch users error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
};

/**
 * Get User Detail by ID
 */
const getUserDetail = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Fetch User Info with Plan Name & Sub details
        const userResult = await db.query(`
            SELECT u.*, uc.total_credits, uc.used_credits, uc.updated_at as credits_updated_at,
                   COALESCE(p.name, 'Free') as plan_name,
                   p.monthly_price_cents, s.current_period_end, s.status as sub_status
            FROM users u
            LEFT JOIN user_credits uc ON u.id = uc.user_id
            LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
            LEFT JOIN plans p ON s.plan_id = p.id
            WHERE u.id = $1`,
            [id]
        );

        if (userResult.rows.length === 0) {
            // Check if it's an admin user
            const adminRes = await db.query(`
                SELECT a.id, a.username as email, a.full_name, a.created_at, r.name as role, 'Lifetime' as plan_name,
                       99999 as total_credits, 0 as used_credits, false as is_blocked,
                       0 as monthly_price_cents, NULL as current_period_end
                FROM admin_users a
                JOIN admin_roles r ON a.role_id = r.id
                WHERE a.id = $1`, [id]);

            if (adminRes.rows.length > 0) {
                return res.json({
                    success: true,
                    data: {
                        user: { ...adminRes.rows[0], is_verified: true },
                        usage: [],
                        generations: [],
                        sessions: [],
                        stats: { distribution: [], success_rate: 100, total_ops: 0 },
                        velocity: []
                    }
                });
            }
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = userResult.rows[0];

        // 2. Fetch User Specific Stats
        const statsResult = await db.query(`
            SELECT 
                COUNT(*) as total_ops,
                ROUND(((COUNT(*) FILTER (WHERE status = 'success')::float / NULLIF(COUNT(*), 0)::float) * 100)::numeric, 1) as success_rate
            FROM operations_history 
            WHERE user_id = $1`, [id]);

        const distributionResult = await db.query(`
            SELECT tool_name, COUNT(*) as count
            FROM operations_history 
            WHERE user_id = $1
            GROUP BY tool_name
            ORDER BY count DESC`, [id]);

        // 3. User Velocity (Last 7 days)
        const velocityResult = await db.query(`
            WITH date_series AS (
                SELECT generate_series(NOW() - INTERVAL '7 days', NOW(), '1 day'::interval) as series_date
            )
            SELECT 
                TO_CHAR(ds.series_date, 'YYYY-MM-DD') as date_point,
                COUNT(oh.id) as count
            FROM date_series ds
            LEFT JOIN operations_history oh ON TO_CHAR(oh.created_at, 'YYYY-MM-DD') = TO_CHAR(ds.series_date, 'YYYY-MM-DD') AND oh.user_id = $1
            GROUP BY ds.series_date
            ORDER BY ds.series_date`, [id]);

        // 4. Fetch Recent Activity & Assets
        const usageResult = await db.query(`
            SELECT * FROM operations_history 
            WHERE user_id = $1 
            ORDER BY created_at DESC 
            LIMIT 50`,
            [id]
        );

        const generationsResult = await db.query(`
            SELECT * FROM user_generations
            WHERE user_email = $1
            ORDER BY created_at DESC
            LIMIT 20`,
            [user.email]
        );

        const sessionsResult = await db.query(`
            SELECT id, ip_address, device_type, browser, created_at, last_active
            FROM user_sessions
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 10`,
            [id]
        );

        res.json({
            success: true,
            data: {
                user,
                usage: usageResult.rows,
                generations: generationsResult.rows,
                sessions: sessionsResult.rows,
                stats: {
                    ...statsResult.rows[0],
                    distribution: distributionResult.rows
                },
                velocity: velocityResult.rows
            }
        });
    } catch (error) {
        console.error('Get User Detail Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch user details' });
    }
};

/**
 * Ban User
 */
const banUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        await db.query(
            "UPDATE users SET is_blocked = true WHERE id = $1",
            [id]
        );

        await db.query(
            'INSERT INTO admin_logs (admin_id, action, details, ip_address) VALUES ($1, $2, $3, $4)',
            [req.admin.id, 'ban_user', JSON.stringify({ user_id: id, reason }), req.ip]
        );

        res.json({ success: true, message: 'User has been blocked' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to block user' });
    }
};

/**
 * Unban User
 */
const unbanUser = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query(
            "UPDATE users SET is_blocked = false WHERE id = $1",
            [id]
        );

        await db.query(
            'INSERT INTO admin_logs (admin_id, action, details, ip_address) VALUES ($1, $2, $3, $4)',
            [req.admin.id, 'unban_user', JSON.stringify({ user_id: id }), req.ip]
        );

        res.json({ success: true, message: 'User access has been restored' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to restore user access' });
    }
};

// Get System Settings
const getSettings = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM system_settings');
        const settings = {};
        result.rows.forEach(row => {
            settings[row.key] = row.value;
        });
        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch settings' });
    }
};

// Update System Settings
const updateSettings = async (req, res) => {
    try {
        const { key, value } = req.body;
        console.log('=== Updating Settings ===');
        console.log('Key:', key);
        console.log('Value:', JSON.stringify(value, null, 2));

        await db.query(`
            INSERT INTO system_settings (key, value, updated_at)
            VALUES ($1, $2, CURRENT_TIMESTAMP)
            ON CONFLICT (key) DO UPDATE SET 
                value = EXCLUDED.value,
                updated_at = EXCLUDED.updated_at
        `, [key, value]); // Don't stringify - JSONB column handles it

        console.log('Settings saved successfully');

        // Log the action
        await db.query(`
            INSERT INTO admin_logs (admin_id, action, details, ip_address)
            VALUES ($1, $2, $3, $4)
        `, [req.admin.id, 'UPDATE_SETTINGS', JSON.stringify({ key, value }), req.ip]);

        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Update Settings Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update settings' });
    }
};

/**
 * Delete User
 */
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch email first for user_generations cleanup
        const userRes = await db.query('SELECT email FROM users WHERE id = $1', [id]);
        if (userRes.rowCount === 0) return res.status(404).json({ success: false, message: 'User not found' });
        const email = userRes.rows[0].email;

        // Transaction to ensure data integrity
        await db.query('BEGIN');

        await db.query('DELETE FROM user_credits WHERE user_id = $1', [id]);
        await db.query('DELETE FROM operations_history WHERE user_id = $1', [id]);
        await db.query('DELETE FROM user_generations WHERE user_email = $1', [email]);
        await db.query('DELETE FROM users WHERE id = $1', [id]);

        await db.query('COMMIT');

        // Log action
        await db.query(
            'INSERT INTO admin_logs (admin_id, action, details, ip_address) VALUES ($1, $2, $3, $4)',
            [req.admin.id, 'delete_user', JSON.stringify({ user_id: id, email }), req.ip]
        );

        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        await db.query('ROLLBACK');
        res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
};

/**
 * Get Pricing Plans
 */
const getPlans = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM plans ORDER BY monthly_price_cents ASC');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch plans' });
    }
};

/**
 * Create/Update Pricing Plan
 */
const savePlan = async (req, res) => {
    const { id, name, slug, monthly_price_cents, credit_limit_monthly, features, is_active } = req.body;
    try {
        if (id) {
            await db.query(`
                UPDATE plans 
                SET name = $1, slug = $2, monthly_price_cents = $3, 
                    credit_limit_monthly = $4, features = $5, is_active = $6,
                    updated_at = NOW()
                WHERE id = $7`,
                [name, slug, monthly_price_cents, credit_limit_monthly, JSON.stringify(features), is_active, id]
            );
        } else {
            await db.query(`
                INSERT INTO plans (name, slug, monthly_price_cents, credit_limit_monthly, features, is_active)
                VALUES ($1, $2, $3, $4, $5, $6)`,
                [name, slug, monthly_price_cents, credit_limit_monthly, JSON.stringify(features), is_active]
            );
        }
        res.json({ success: true, message: 'Plan saved successfully' });
    } catch (error) {
        console.error('Save Plan Error:', error);
        res.status(500).json({ success: false, message: 'Failed to save plan' });
    }
};

/**
 * Get AI Models
 */
const getModels = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM ai_models ORDER BY name ASC');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch models' });
    }
};

/**
 * Create/Update AI Model
 */
const saveModel = async (req, res) => {
    const { id, name, provider, model_id, cost_per_generation, is_active, type } = req.body;
    try {
        if (id) {
            await db.query(`
                UPDATE ai_models 
                SET name = $1, provider = $2, model_id = $3, 
                    cost_per_generation = $4, is_active = $5, type = $6,
                    updated_at = NOW()
                WHERE id = $7`,
                [name, provider, model_id, cost_per_generation, is_active, type, id]
            );
        } else {
            await db.query(`
                INSERT INTO ai_models (name, provider, model_id, cost_per_generation, is_active, type)
                VALUES ($1, $2, $3, $4, $5, $6)`,
                [name, provider, model_id, cost_per_generation, is_active, type]
            );
        }
        res.json({ success: true, message: 'Model saved successfully' });
    } catch (error) {
        console.error('Save Model Error:', error);
        res.status(500).json({ success: false, message: 'Failed to save model' });
    }
};

/**
 * Get Gallery Items
 */
const getGallery = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM prompt_gallery ORDER BY created_at DESC');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch gallery' });
    }
};

/**
 * Delete Gallery Item
 */
const deleteGalleryItem = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM prompt_gallery WHERE id = $1', [id]);
        res.json({ success: true, message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete item' });
    }
};

/**
 * Get All Templates (Admin)
 */
const getAdminTemplates = async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const templatesDir = path.join(__dirname, '../../../frontend/public/background_templets');

        let allTemplates = [];
        const categoryMap = {
            'Humans': { folder: 'Humans', thumbnail: 'front-view-hand-asking-something.jpg' },
            'Popular': { folder: 'popular', thumbnail: 'mostpopular320thumbnail.jpg' },
            'Nature': { folder: 'nature', thumbnail: 'nature320thumbnail.jpg' },
            'Flatlays': { folder: 'Flatlays', thumbnail: 'Flatlays_8a3199c6-0b82-4a75-8b2d-0a2737c047be.webp' },
            'Minimal': { folder: 'Minimal', thumbnail: 'minimal320thumbnail.jpg' },
            'Platforms': { folder: 'Platforms', thumbnail: 'platforms320thumbnail.jpg' },
            'Stones': { folder: 'stones', thumbnail: 'stones320thumbnail.jpg' },
            'Kitchen': { folder: 'kitchen', thumbnail: 'kitchen_thumbnail512.jpg' },
            'SPA': { folder: 'spa', thumbnail: 'spa_thumbnail320.jpg' },
            'Fabric': { folder: 'fabric', thumbnail: 'fabric320thumbnail.jpg' },
            'City': { folder: 'city', thumbnail: 'city_thumbnail512.jpg' },
            'Walls': { folder: 'walls', thumbnail: 'walls_thumbnail320.jpg' },
            'Interiors': { folder: 'Interiors', thumbnail: 'interiors_thumbnail320.jpg' },
            'Office': { folder: 'office', thumbnail: 'office_thumbnail512.jpg' },
            'Kids': { folder: 'kids', thumbnail: 'kids_thumbnail512.jpg' },
        };

        for (const [category, config] of Object.entries(categoryMap)) {
            const catDir = path.join(templatesDir, config.folder);
            if (fs.existsSync(catDir)) {
                const files = fs.readdirSync(catDir);
                const templates = files
                    .filter(file => file !== config.thumbnail && /\.(jpg|jpeg|png|webp)$/i.test(file))
                    .map(file => ({
                        id: `${category}-${file}`,
                        name: file,
                        // Use a proxy-able URL or full dev URL
                        url: `http://localhost:5173/background_templets/${config.folder}/${file}`,
                        category: category
                    }));
                allTemplates = [...allTemplates, ...templates];
            }
        }

        res.json({ success: true, data: allTemplates });
    } catch (error) {
        console.error('Get Admin Templates error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch templates' });
    }
};

/**
 * Get Admin Logs
 */
const getLogs = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT l.*, a.full_name as admin_name 
            FROM admin_logs l
            JOIN admin_users a ON l.admin_id = a.id
            ORDER BY l.created_at DESC
            LIMIT 100
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch logs' });
    }
};

/**
 * Get System Health
 */
const getSystemHealth = async (req, res) => {
    try {
        // Simple health check
        await db.query('SELECT 1');

        // Mocking some infrastructure stats for the dashboard preview
        const healthData = {
            db_status: 'Operational',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            node_version: process.version
        };

        res.json({ success: true, data: healthData });
    } catch (error) {
        res.status(500).json({ success: false, message: 'System health check failed' });
    }
};

/**
 * Get AI Usage Stats
 */
const getUsageStats = async (req, res) => {
    try {
        const { timeframe = '7d' } = req.query;

        let interval;
        let groupFormat;
        let seriesInterval;
        let limit;

        switch (timeframe) {
            case '24h':
                interval = '24 hours';
                groupFormat = 'YYYY-MM-DD HH24:00:00';
                seriesInterval = '1 hour';
                limit = 24;
                break;
            case '30d':
                interval = '30 days';
                groupFormat = 'YYYY-MM-DD';
                seriesInterval = '1 day';
                limit = 30;
                break;
            case '90d':
                interval = '90 days';
                groupFormat = 'YYYY-MM-DD';
                seriesInterval = '1 day';
                limit = 90;
                break;
            case '7d':
            default:
                interval = '7 days';
                groupFormat = 'YYYY-MM-DD';
                seriesInterval = '1 day';
                limit = 7;
                break;
        }

        // 1. Get Core Metrics
        const metricsResult = await db.query(`
            SELECT 
                COUNT(*) as total_operations,
                COALESCE(SUM(credits_cost), 0) as total_credits,
                COUNT(DISTINCT user_id) as unique_users,
                ROUND(
                    ((COUNT(*) FILTER (WHERE status = 'success')::float / 
                    NULLIF(COUNT(*), 0)::float) * 100)::numeric, 
                1) as success_rate
            FROM operations_history
            WHERE created_at >= NOW() - INTERVAL '${interval}'
        `);

        // 2. Get Velocity Data (Time-series)
        const velocityResult = await db.query(`
            WITH date_series AS (
                SELECT generate_series(
                    NOW() - INTERVAL '${interval}',
                    NOW(),
                    '${seriesInterval}'::interval
                ) as series_date
            )
            SELECT 
                TO_CHAR(ds.series_date, '${groupFormat}') as date_point,
                COUNT(oh.id) as operation_count
            FROM date_series ds
            LEFT JOIN operations_history oh ON TO_CHAR(oh.created_at, '${groupFormat}') = TO_CHAR(ds.series_date, '${groupFormat}')
            GROUP BY ds.series_date
            ORDER BY ds.series_date
            LIMIT ${limit}
        `);

        // 3. Get Model/Tool Distribution
        const distributionResult = await db.query(`
            SELECT 
                tool_name, 
                COUNT(*) as count,
                ROUND(((COUNT(*)::float / NULLIF((SELECT COUNT(*) FROM operations_history WHERE created_at >= NOW() - INTERVAL '${interval}'), 0)::float) * 100)::numeric, 1) as percentage
            FROM operations_history
            WHERE created_at >= NOW() - INTERVAL '${interval}'
            GROUP BY tool_name
            ORDER BY count DESC
        `);

        // 4. Comparison Data (Previous Period) for Trends
        const prevMetricsResult = await db.query(`
            SELECT 
                COUNT(*) as total_operations
            FROM operations_history
            WHERE created_at >= NOW() - INTERVAL '${interval}' * 2
              AND created_at < NOW() - INTERVAL '${interval}'
        `);

        const currentOps = parseInt(metricsResult.rows[0].total_operations);
        const prevOps = parseInt(prevMetricsResult.rows[0].total_operations);
        const change = prevOps > 0 ? ((currentOps - prevOps) / prevOps * 100).toFixed(1) : '100';

        // 5. Get Segment Distribution (Usage by Plan)
        const segmentResult = await db.query(`
            SELECT 
                p.name as plan_name,
                COUNT(oh.id) as count,
                ROUND(((COUNT(oh.id)::float / NULLIF((SELECT COUNT(*) FROM operations_history WHERE created_at >= NOW() - INTERVAL '${interval}'), 0)::float) * 100)::numeric, 1) as percentage
            FROM operations_history oh
            LEFT JOIN users u ON oh.user_id = u.id
            LEFT JOIN subscriptions s ON u.id = s.user_id
            LEFT JOIN plans p ON s.plan_id = p.id
            WHERE oh.created_at >= NOW() - INTERVAL '${interval}'
            GROUP BY p.name
            ORDER BY count DESC
        `);

        // 6. Get Top Active Users
        const topUsersResult = await db.query(`
            SELECT 
                u.email,
                u.full_name,
                COUNT(oh.id) as operation_count,
                COALESCE(SUM(oh.credits_cost), 0) as total_credits
            FROM operations_history oh
            JOIN users u ON oh.user_id = u.id
            WHERE oh.created_at >= NOW() - INTERVAL '${interval}'
            GROUP BY u.id, u.email, u.full_name
            ORDER BY operation_count DESC
            LIMIT 5
        `);

        // 7. Get Peak Usage Hours (Aggregation by hour of day)
        const peakHoursResult = await db.query(`
            SELECT 
                EXTRACT(HOUR FROM created_at) as hour,
                COUNT(*) as count
            FROM operations_history
            WHERE created_at >= NOW() - INTERVAL '${interval}'
            GROUP BY hour
            ORDER BY hour ASC
        `);

        // 8. Get Recent Operations
        const recentOpsResult = await db.query(`
            SELECT 
                oh.id, 
                oh.tool_name, 
                oh.credits_cost, 
                oh.status, 
                oh.created_at,
                u.email as user_email,
                u.full_name as user_name
            FROM operations_history oh
            LEFT JOIN users u ON oh.user_id = u.id
            ORDER BY oh.created_at DESC
            LIMIT 10
        `);

        res.json({
            success: true,
            data: {
                metrics: {
                    ...metricsResult.rows[0],
                    change_percent: change,
                    is_up: currentOps >= prevOps
                },
                velocity: velocityResult.rows,
                distribution: distributionResult.rows,
                segments: segmentResult.rows,
                top_users: topUsersResult.rows,
                peak_hours: peakHoursResult.rows,
                recent_operations: recentOpsResult.rows,
                timeframe
            }
        });
    } catch (error) {
        console.error('Usage Stats Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch usage stats' });
    }
};

/**
 * Update User Credits
 */
const updateUserCredits = async (req, res) => {
    try {
        const { id } = req.params;
        const { total_credits } = req.body;

        if (total_credits === undefined) {
            return res.status(400).json({ success: false, message: 'Total credits required' });
        }

        await db.query(
            "UPDATE user_credits SET total_credits = $1 WHERE user_id = $2",
            [total_credits, id]
        );

        await db.query(
            'INSERT INTO admin_logs (admin_id, action, details, ip_address) VALUES ($1, $2, $3, $4)',
            [req.admin.id, 'update_user_credits', JSON.stringify({ user_id: id, total_credits }), req.ip]
        );

        res.json({ success: true, message: 'Credits updated successfully' });
    } catch (error) {
        console.error('Update credits error:', error);
        res.status(500).json({ success: false, message: 'Failed to update credits' });
    }
};

const getSecurityAudit = async (req, res) => {
    try {
        // 1. Get explicitly blocked users
        const blockedUsers = await db.query(`
            SELECT id, email, full_name, is_blocked, created_at, 'User' as role
            FROM users
            WHERE is_blocked = true
            ORDER BY created_at DESC
        `);

        // 2. Identify potential multi-accounts by IP
        const flaggedGroups = await db.query(`
            WITH ip_groups AS (
                SELECT ip_address, ARRAY_AGG(DISTINCT user_id) as user_ids, COUNT(DISTINCT user_id) as user_count
                FROM user_sessions
                WHERE ip_address IS NOT NULL AND ip_address != '127.0.0.1' AND ip_address != '::1'
                GROUP BY ip_address
                HAVING COUNT(DISTINCT user_id) > 1
            )
            SELECT g.ip_address, g.user_count,
                   (
                       SELECT json_agg(u) 
                       FROM (
                           SELECT id, email, full_name, is_blocked, created_at
                           FROM users
                           WHERE id = ANY(g.user_ids)
                       ) u
                   ) as associated_users
            FROM ip_groups g
            ORDER BY g.user_count DESC
        `);

        res.json({
            success: true,
            data: {
                blocked_users: blockedUsers.rows,
                flagged_groups: flaggedGroups.rows
            }
        });
    } catch (error) {
        console.error('Security Audit Error:', error);
        res.status(500).json({ success: false, message: 'Failed to perform security audit' });
    }
};

/**
 * Update User Subscription Plan (Admin Only)
 */
const updateUserPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { planId, billingCycle = 'monthly' } = req.body;

        if (!planId) {
            return res.status(400).json({ success: false, message: 'Plan ID is required' });
        }

        // Check if plan exists
        const planResult = await db.query('SELECT * FROM plans WHERE id = $1', [planId]);
        if (planResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }

        const plan = planResult.rows[0];

        // Calculate period end
        const periodEnd = new Date();
        if (billingCycle === 'yearly') {
            periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        } else {
            periodEnd.setMonth(periodEnd.getMonth() + 1);
        }

        // Check for existing active subscription
        const existingSub = await db.query(
            'SELECT id FROM subscriptions WHERE user_id = $1 AND status = $2',
            [id, 'active']
        );

        if (existingSub.rows.length > 0) {
            // Update existing subscription
            await db.query(
                `UPDATE subscriptions 
                 SET plan_id = $1, billing_cycle = $2, current_period_end = $3, updated_at = NOW() 
                 WHERE id = $4`,
                [planId, billingCycle, periodEnd, existingSub.rows[0].id]
            );
        } else {
            // Create new subscription
            await db.query(
                `INSERT INTO subscriptions (user_id, plan_id, status, billing_cycle, current_period_end) 
                 VALUES ($1, $2, 'active', $3, $4)`,
                [id, planId, billingCycle, periodEnd]
            );
        }

        // Update user credits based on the new plan
        await db.query(
            'UPDATE user_credits SET total_credits = $1, updated_at = NOW() WHERE user_id = $2',
            [plan.credit_limit_monthly, id]
        );

        // Log action
        await db.query(
            'INSERT INTO admin_logs (admin_id, action, details, ip_address) VALUES ($1, $2, $3, $4)',
            [req.admin.id, 'update_user_plan', JSON.stringify({ user_id: id, plan_id: planId, plan_name: plan.name }), req.ip]
        );

        res.json({
            success: true,
            message: `User plan updated to ${plan.name} successfully`
        });
    } catch (error) {
        console.error('Update user plan error:', error);
        res.status(500).json({ success: false, message: 'Failed to update user plan' });
    }
};

/**
 * Get Early Access Whitelist
 */
const getEarlyAccessWhitelist = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT id, email, created_at 
            FROM early_access_whitelist 
            ORDER BY created_at DESC
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Get whitelist error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch whitelist' });
    }
};

/**
 * Add Email to Whitelist
 */
const addEmailToWhitelist = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !email.includes('@')) {
            return res.status(400).json({ success: false, message: 'Valid email is required' });
        }

        await db.query(
            'INSERT INTO early_access_whitelist (email, added_by_admin_id) VALUES ($1, $2)',
            [email.toLowerCase(), req.admin.id]
        );

        // Log action
        await db.query(
            'INSERT INTO admin_logs (admin_id, action, details, ip_address) VALUES ($1, $2, $3, $4)',
            [req.admin.id, 'add_whitelist_email', JSON.stringify({ email }), req.ip]
        );

        res.json({ success: true, message: 'Email added to whitelist' });
    } catch (error) {
        if (error.code === '23505') { // Unique constraint violation
            return res.status(400).json({ success: false, message: 'Email already in whitelist' });
        }
        console.error('Add to whitelist error:', error);
        res.status(500).json({ success: false, message: 'Failed to add email to whitelist' });
    }
};

/**
 * Remove Email from Whitelist
 */
const removeEmailFromWhitelist = async (req, res) => {
    try {
        const { email } = req.params;

        const result = await db.query(
            'DELETE FROM early_access_whitelist WHERE email = $1 RETURNING id',
            [email.toLowerCase()]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Email not found in whitelist' });
        }

        // Log action
        await db.query(
            'INSERT INTO admin_logs (admin_id, action, details, ip_address) VALUES ($1, $2, $3, $4)',
            [req.admin.id, 'remove_whitelist_email', JSON.stringify({ email }), req.ip]
        );

        res.json({ success: true, message: 'Email removed from whitelist' });
    } catch (error) {
        console.error('Remove from whitelist error:', error);
        res.status(500).json({ success: false, message: 'Failed to remove email from whitelist' });
    }
};

/**
 * Get Early Access Requests
 */
const getAccessRequests = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT id, email, status, created_at 
            FROM early_access_requests 
            ORDER BY created_at DESC
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Get access requests error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch access requests' });
    }
};

/**
 * Submit Early Access Request (Public endpoint)
 */
const submitAccessRequest = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !email.includes('@')) {
            return res.status(400).json({ success: false, message: 'Valid email is required' });
        }

        // Insert or update to pending if already exists
        await db.query(
            `INSERT INTO early_access_requests (email, status, created_at) 
             VALUES ($1, 'pending', NOW()) 
             ON CONFLICT (email) 
             DO UPDATE SET 
                status = 'pending', 
                created_at = NOW(),
                approved_at = NULL,
                approved_by_admin_id = NULL`,
            [email.toLowerCase()]
        );

        res.json({ success: true, message: 'Access request submitted successfully' });
    } catch (error) {
        console.error('Submit access request error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit access request' });
    }
};

/**
 * Approve Access Request (adds to whitelist)
 */
const approveAccessRequest = async (req, res) => {
    try {
        const { email } = req.body;

        // Add to whitelist
        await db.query(
            'INSERT INTO early_access_whitelist (email, added_by_admin_id) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING',
            [email.toLowerCase(), req.admin.id]
        );

        // Update request status
        await db.query(
            'UPDATE early_access_requests SET status = $1, approved_at = NOW(), approved_by_admin_id = $2 WHERE email = $3',
            ['approved', req.admin.id, email.toLowerCase()]
        );

        // Log action
        await db.query(
            'INSERT INTO admin_logs (admin_id, action, details, ip_address) VALUES ($1, $2, $3, $4)',
            [req.admin.id, 'approve_access_request', JSON.stringify({ email }), req.ip]
        );

        res.json({ success: true, message: 'Access request approved' });
    } catch (error) {
        console.error('Approve access request error:', error);
        res.status(500).json({ success: false, message: 'Failed to approve request' });
    }
};

module.exports = {
    login,
    getDashboardKPIs,
    getUsers,
    getUserDetail,
    banUser,
    unbanUser,
    deleteUser,
    updateUserCredits,
    updateUserPlan,
    getSecurityAudit,
    getPlans,
    savePlan,
    getModels,
    saveModel,
    getGallery,
    deleteGalleryItem,
    getAdminTemplates,
    getLogs,
    getSystemHealth,
    getUsageStats,
    getSettings,
    updateSettings,
    getEarlyAccessWhitelist,
    addEmailToWhitelist,
    removeEmailFromWhitelist,
    getAccessRequests,
    approveAccessRequest,
    submitAccessRequest
};
