const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'app_ai',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'adham123',
});

const run = async () => {
    try {
        console.log('Running migration...');
        await pool.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP WITH TIME ZONE;
        `);
        console.log('Migration successful!');

        const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users';");
        console.log('Current columns:', res.rows.map(r => r.column_name).join(', '));

        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

run();
