/**
 * Dashboard Controller
 * Provides real-time statistics from PostgreSQL
 */
const db = require('../config/database');

/**
 * Get dashboard statistics for current user
 */
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get Project Counts
        const projectResult = await db.query(
            'SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = $1) as active FROM projects WHERE user_id = $2',
            ['active', userId]
        );

        // 2. Get Operation Stats from history (e.g. last 30 days)
        const historyResult = await db.query(
            `SELECT 
                COUNT(*) FILTER (WHERE tool_name = 'background_removal') as removal_count,
                COUNT(*) FILTER (WHERE tool_name = 'background_generation') as generation_count,
                COUNT(*) as total_ops
             FROM operations_history 
             WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days'`,
            [userId]
        );

        // 3. Get User Credits/Subscription
        const creditResult = await db.query(
            `SELECT uc.total_credits, uc.used_credits, p.name as plan_name 
             FROM user_credits uc
             LEFT JOIN subscriptions s ON uc.user_id = s.user_id AND s.status = 'active'
             LEFT JOIN plans p ON s.plan_id = p.id
             WHERE uc.user_id = $1`,
            [userId]
        );

        // 4. Recent Activity
        const recentActivityResult = await db.query(
            `SELECT h.*, p.name as project_name 
             FROM operations_history h
             LEFT JOIN projects p ON h.project_id = p.id
             WHERE h.user_id = $1
             ORDER BY h.created_at DESC
             LIMIT 5`,
            [userId]
        );

        const stats = {
            imagesGenerated: {
                total: parseInt(historyResult.rows[0].total_ops || 0),
                thisMonth: parseInt(historyResult.rows[0].total_ops || 0), // Simplification for MVP
                change: '+0%',
            },
            backgroundsRemoved: {
                total: parseInt(historyResult.rows[0].removal_count || 0),
                thisMonth: parseInt(historyResult.rows[0].removal_count || 0),
                change: '+0%',
            },
            backgroundsGenerated: {
                total: parseInt(historyResult.rows[0].generation_count || 0),
                thisMonth: parseInt(historyResult.rows[0].generation_count || 0),
                change: '+0%',
            },
            productsManaged: {
                total: parseInt(projectResult.rows[0].total || 0),
                active: parseInt(projectResult.rows[0].active || 0),
            },
            subscription: {
                plan: 'Unlimited (Beta)',
                imagesUsed: 0,
                imagesLimit: 999,
            },
            recentActivity: recentActivityResult.rows.map(row => ({
                id: row.id,
                type: row.tool_name,
                productName: row.project_name || 'Unknown Project',
                timestamp: row.created_at
            }))
        };

        res.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred.',
        });
    }
};

/**
 * Get usage analytics
 */
const getUsageAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const { period = '30d' } = req.query;

        // Get daily usage for the last 30 days
        const dailyResult = await db.query(
            `SELECT 
                DATE_TRUNC('day', created_at) as date,
                COUNT(*) as count
             FROM operations_history
             WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days'
             GROUP BY 1
             ORDER BY 1 ASC`,
            [userId]
        );

        // Get usage by type
        const typeResult = await db.query(
            `SELECT 
                tool_name as type,
                COUNT(*) as count
             FROM operations_history
             WHERE user_id = $1
             GROUP BY 1`,
            [userId]
        );

        const total = typeResult.rows.reduce((sum, row) => sum + parseInt(row.count), 0);

        const analytics = {
            period,
            summary: {
                totalImages: total,
                averageProcessingTime: 2.0, // Hardcoded for now
                successRate: 100,
            },
            dailyUsage: dailyResult.rows.map(row => ({
                date: row.date.toISOString().split('T')[0],
                images: parseInt(row.count)
            })),
            byType: typeResult.rows.map(row => ({
                type: row.type,
                count: parseInt(row.count),
                percentage: total > 0 ? Math.round((parseInt(row.count) / total) * 100) : 0
            }))
        };

        res.json({
            success: true,
            data: analytics,
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred.',
        });
    }
};

/**
 * Get detailed usage log
 */
const getDetailedUsageLog = async (req, res) => {
    try {
        const userId = req.user.id;
        const { period = '30d', startDate, endDate } = req.query;

        let dateFilter = '';
        const queryParams = [userId];

        if (startDate && endDate) {
            dateFilter = 'AND h.created_at BETWEEN $2 AND $3';
            queryParams.push(new Date(startDate), new Date(endDate));
        } else if (period === '1d') {
            dateFilter = "AND h.created_at > NOW() - INTERVAL '1 day'";
        } else if (period === '7d') {
            dateFilter = "AND h.created_at > NOW() - INTERVAL '7 days'";
        } else if (period === '30d') {
            dateFilter = "AND h.created_at > NOW() - INTERVAL '30 days'";
        }

        const query = `
            SELECT 
                h.id,
                h.created_at as date,
                h.tool_name as tool,
                h.credits_cost as credits,
                COALESCE(p.name, 'Free') as plan_type
            FROM operations_history h
            LEFT JOIN subscriptions s ON h.user_id = s.user_id AND s.status = 'active'
            LEFT JOIN plans p ON s.plan_id = p.id
            WHERE h.user_id = $1 ${dateFilter}
            ORDER BY h.created_at DESC
        `;

        const result = await db.query(query, queryParams);

        res.json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error('Get usage log error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred.',
        });
    }
};

/**
 * Get site status and user access
 */
const getSiteStatus = async (req, res) => {
    try {
        // Get site_closed setting
        const settingsResult = await db.query(
            "SELECT value FROM system_settings WHERE key = 'site_config'"
        );

        const siteConfig = settingsResult.rows.length > 0
            ? settingsResult.rows[0].value
            : {};

        const isClosed = siteConfig.site_closed || false;
        let hasAccess = !isClosed; // If site is open, everyone has access

        // If site is closed and user is authenticated, check whitelist
        if (isClosed && req.user) {
            const whitelistResult = await db.query(
                'SELECT id FROM early_access_whitelist WHERE email = $1',
                [req.user.email.toLowerCase()]
            );
            hasAccess = whitelistResult.rows.length > 0;
        }

        res.json({
            success: true,
            data: {
                isClosed,
                hasAccess,
                isAuthenticated: !!req.user
            }
        });
    } catch (error) {
        console.error('Get site status error:', error);
        // In case of error, default to open site
        res.json({
            success: true,
            data: {
                isClosed: false,
                hasAccess: true,
                isAuthenticated: !!req.user
            }
        });
    }
};

module.exports = {
    getDashboardStats,
    getUsageAnalytics,
    getDetailedUsageLog,
    getSiteStatus,
};
