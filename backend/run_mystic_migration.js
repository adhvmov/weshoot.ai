/**
 * Run Mystic Database Migration
 * Adds mystic_task_id and mystic_status columns to operations_history table
 */
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'app_ai',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password'
});

async function runMigration() {
    const client = await pool.connect();

    try {
        console.log('Starting Mystic database migration...');

        await client.query('BEGIN');

        // Add mystic_task_id column
        await client.query(`
            ALTER TABLE operations_history 
            ADD COLUMN IF NOT EXISTS mystic_task_id VARCHAR(100)
        `);
        console.log('✓ Added mystic_task_id column');

        // Add mystic_status column
        await client.query(`
            ALTER TABLE operations_history 
            ADD COLUMN IF NOT EXISTS mystic_status VARCHAR(20) DEFAULT 'CREATED'
        `);
        console.log('✓ Added mystic_status column');

        // Add index
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_operations_mystic_task_id 
            ON operations_history(mystic_task_id)
        `);
        console.log('✓ Added index on mystic_task_id');

        await client.query('COMMIT');
        console.log('✅ Migration completed successfully!');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
