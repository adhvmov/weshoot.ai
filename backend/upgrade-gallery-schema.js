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
        console.log('Adding likes_count to prompt_gallery...');
        await pool.query(`
            ALTER TABLE prompt_gallery ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
        `);

        console.log('Creating gallery_likes table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS gallery_likes (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                prompt_id UUID REFERENCES prompt_gallery(id) ON DELETE CASCADE,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(prompt_id, user_id)
            );
        `);
        console.log('Migration successful!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

run();
