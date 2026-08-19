const { pool } = require('../src/config/database');

async function migrate() {
    console.log('🚀 Starting second migration (adding updated_at)...');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Adding updated_at to project_assets...');
        await client.query(`
            ALTER TABLE project_assets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        `);

        console.log('Adding updated_at to operations_history...');
        await client.query(`
            ALTER TABLE operations_history ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        `);

        await client.query('COMMIT');
        console.log('✅ Migration completed successfully!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
