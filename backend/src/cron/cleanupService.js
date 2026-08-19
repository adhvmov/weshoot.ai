/**
 * Cleanup Service
 * Scheduled tasks for data maintenance defined by user implementation plan.
 */
const cron = require('node-cron');
const db = require('../config/database');

/**
 * Deletes expired user generations based on subscription plan:
 * - Free: 24 hours
 * - Essentials: 1 month
 * - Pro: 3 months
 */
const runCleanupJob = async () => {
    console.log('[CleanupService] Starting daily asset cleanup...');
    const result = { deleted: 0, errors: [] };

    try {
        // We use a complex delete query to handle the logic in one go for efficiency.
        // Joining user_generations -> users -> subscriptions -> plans
        // Note: Users without an active subscription record are treated as 'Free' fallback if we add a LEFT JOIN,
        // but typically all users should have a subscription (even if free). 
        // Here we assume active subscription exists or they are on free plan.

        const query = `
            DELETE FROM user_generations ug
            WHERE ug.id IN (
                SELECT ug.id
                FROM user_generations ug
                JOIN users u ON ug.user_email = u.email
                JOIN subscriptions s ON u.id = s.user_id
                JOIN plans p ON s.plan_id = p.id
                WHERE s.status = 'active'
                AND (
                    (p.slug = 'free' AND ug.created_at < NOW() - INTERVAL '24 hours') OR
                    (p.slug = 'essentials' AND ug.created_at < NOW() - INTERVAL '1 month') OR
                    (p.slug = 'pro' AND ug.created_at < NOW() - INTERVAL '3 months')
                )
            )
            RETURNING id;
        `;

        const res = await db.query(query);
        result.deleted = res.rowCount;
        console.log(`[CleanupService] Cleanup complete. Deleted ${result.deleted} expired assets.`);

    } catch (error) {
        console.error('[CleanupService] Error during cleanup:', error);
        result.errors.push(error.message);
    }
    return result;
};

const initCronJobs = () => {
    // Run every day at midnight (00:00)
    cron.schedule('0 0 * * *', () => {
        runCleanupJob();
    });

    console.log('[CleanupService] Cron jobs initialized. Scheduled for 00:00 daily.');
};

module.exports = {
    initCronJobs,
    runCleanupJob // Export for manual triggering/testing
};
