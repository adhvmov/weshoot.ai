const db = require('../config/database');

/**
 * Tool Costs Mapping
 */
const TOOL_COSTS = {
    'upscale': (params) => (params.scale === '4x' || params.scale_factor === 4 ? 18 : 12),
    'remove-bg': 5,
    'ai-photoshoot': 5,
    'bg-seedream': 5,
    'ai-background': 5,
    'ai-edit': 5,
    'add-shadows': 5,
    'fix-light': 10,
    'blur-background': 5,
    'resize-expand': 5,
    'add-text': 5,
    'photoshoot': 5,
    'ai-fashion': 13,
    'ai-video': (params) => {
        // user: "37 Credits for the 5 sec"
        if (params.duration === '10s') return 85; // 10s cost
        return 45;
    }
};

/**
 * Check if user has sufficient credits and deduct them
 */
async function checkAndDeductCredits(userId, toolName, params = {}) {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        // 1. Get cost
        let cost = 0;
        if (typeof TOOL_COSTS[toolName] === 'function') {
            cost = TOOL_COSTS[toolName](params);
        } else {
            cost = TOOL_COSTS[toolName] || 0;
        }

        // 2. Get user credits and plan
        const userRes = await client.query(
            `SELECT c.total_credits, c.used_credits, p.slug as plan_slug 
             FROM user_credits c
             JOIN subscriptions s ON s.user_id = c.user_id
             JOIN plans p ON p.id = s.plan_id
             WHERE c.user_id = $1 AND s.status = 'active'`,
            [userId]
        );

        if (userRes.rows.length === 0) {
            throw new Error('User subscription or credits not found');
        }

        const { total_credits, used_credits, plan_slug } = userRes.rows[0];
        const availableCredits = total_credits - used_credits;

        // 3. Check for specific tool restrictions (e.g., 10s video on Free plan)
        if (toolName === 'ai-video' && params.duration === '10s' && plan_slug === 'free') {
            throw new Error('10s video generation is not available in the Free plan');
        }

        // Limit 'fix-light' to 3 uses for Free plan
        if (toolName === 'fix-light' && plan_slug === 'free') {
            const usageRes = await client.query(
                `SELECT COUNT(*) as count FROM operations_history 
                 WHERE user_id = $1 AND tool_name = 'fix-light' AND status = 'success'`,
                [userId]
            );
            const usageCount = parseInt(usageRes.rows[0].count, 10);
            if (usageCount >= 3) {
                throw new Error('Free plan limit reached for Fix Light & Color (3 uses max). Upgrade to Pro for unlimited access.');
            }
        }

        // Limit 'ai-fashion' to 2 uses for Free plan
        if (toolName === 'ai-fashion' && plan_slug === 'free') {
            const usageRes = await client.query(
                `SELECT COUNT(*) as count FROM operations_history 
                 WHERE user_id = $1 AND tool_name = 'ai-fashion' AND status = 'success'`,
                [userId]
            );
            const usageCount = parseInt(usageRes.rows[0].count, 10);
            if (usageCount >= 2) {
                throw new Error('Free plan limit reached for AI Fashion Models (2 uses max). Upgrade to Pro for unlimited access.');
            }
        }

        if (availableCredits < cost) {
            throw new Error(`Insufficient credits. Required: ${cost}, available: ${availableCredits}`);
        }

        // 4. Deduct credits
        await client.query(
            'UPDATE user_credits SET used_credits = used_credits + $1 WHERE user_id = $2',
            [cost, userId]
        );

        await client.query('COMMIT');
        return { success: true, cost };
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(`[CreditManager] Error: ${err.message}`);
        return { success: false, message: err.message };
    } finally {
        client.release();
    }
}

module.exports = {
    checkAndDeductCredits,
    TOOL_COSTS
};
