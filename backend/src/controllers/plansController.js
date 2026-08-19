/**
 * Plans & Pricing Controller
 * Handles subscription plans from PostgreSQL
 */
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Get all plans
 */
const getPlans = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM plans ORDER BY monthly_price_cents ASC');
        res.json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error('Get plans error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred.',
        });
    }
};

/**
 * Get single plan
 */
const getPlan = async (req, res) => {
    try {
        const { slug } = req.params;
        const result = await db.query('SELECT * FROM plans WHERE slug = $1', [slug]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found.',
            });
        }

        res.json({
            success: true,
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Get plan error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred.',
        });
    }
};

/**
 * Subscribe to a plan
 */
const subscribe = async (req, res) => {
    try {
        const { planId, billingCycle = 'monthly' } = req.body;
        const userId = req.user.id;

        // Check if plan exists
        const planResult = await db.query('SELECT * FROM plans WHERE id = $1', [planId]);
        if (planResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found.',
            });
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
            [userId, 'active']
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
                [userId, planId, billingCycle, periodEnd]
            );
        }

        // Update user credits based on the new plan
        await db.query(
            'UPDATE user_credits SET total_credits = $1, updated_at = NOW() WHERE user_id = $2',
            [plan.credit_limit_monthly, userId]
        );

        res.status(201).json({
            success: true,
            message: 'Successfully subscribed to ' + plan.name,
        });
    } catch (error) {
        console.error('Subscribe error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred.',
        });
    }
};

/**
 * Get current subscription
 */
const getCurrentSubscription = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query(
            `SELECT s.*, p.name as plan_name, p.credit_limit_monthly 
             FROM subscriptions s 
             JOIN plans p ON s.plan_id = p.id 
             WHERE s.user_id = $1 AND s.status = 'active'`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.json({
                success: true,
                data: null,
                message: 'No active subscription found.'
            });
        }

        // Get current usage
        const creditResult = await db.query(
            'SELECT total_credits, used_credits FROM user_credits WHERE user_id = $1',
            [userId]
        );

        const subscription = result.rows[0];
        const credits = creditResult.rows[0] || { total_credits: 0, used_credits: 0 };

        res.json({
            success: true,
            data: {
                ...subscription,
                usage: credits
            },
        });
    } catch (error) {
        console.error('Get subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred.',
        });
    }
};

/**
 * Cancel subscription
 */
const cancelSubscription = async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        const userId = req.user.id;

        const result = await db.query(
            'UPDATE subscriptions SET status = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *',
            ['canceled', subscriptionId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found.',
            });
        }

        res.json({
            success: true,
            message: 'Subscription cancelled successfully.',
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred.',
        });
    }
};

module.exports = {
    getPlans,
    getPlan,
    subscribe,
    getCurrentSubscription,
    cancelSubscription,
};
