const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'app_ai',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
});

const migrate = async () => {
    try {
        console.log('--- Starting Refined Migration ---');

        // 1. Ensure contact_messages exists (redundant but safe)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS contact_messages (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(50),
                company VARCHAR(255),
                subject VARCHAR(100),
                message TEXT NOT NULL,
                status VARCHAR(20) DEFAULT 'unread',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
            CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
        `);

        // 2. Refine Plans table (Add missing features/configs)
        await pool.query(`
            ALTER TABLE plans ADD COLUMN IF NOT EXISTS yearly_price_cents INTEGER DEFAULT 0;
            ALTER TABLE plans ADD COLUMN IF NOT EXISTS max_upload_size_mb INTEGER DEFAULT 10;
            ALTER TABLE plans ADD COLUMN IF NOT EXISTS max_resolution VARCHAR(20) DEFAULT '2K';
            ALTER TABLE plans ADD COLUMN IF NOT EXISTS history_preservation_days INTEGER DEFAULT 1;
            ALTER TABLE plans ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
        `);

        // 3. Refine AI Models table
        // We know from adminController that it expects model_id, cost_per_generation, etc.
        await pool.query(`
            ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS model_id VARCHAR(100);
            ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS cost_per_generation INTEGER DEFAULT 1;
            ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS type VARCHAR(50);
            -- Update model_id index if needed
            CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_models_model_id ON ai_models(model_id) WHERE model_id IS NOT NULL;
        `);

        // 4. Refine Projects table
        await pool.query(`
            ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE;
        `);

        // 5. Refine Operations History for Poll tracking
        await pool.query(`
            ALTER TABLE operations_history ADD COLUMN IF NOT EXISTS mystic_task_id VARCHAR(255);
            ALTER TABLE operations_history ADD COLUMN IF NOT EXISTS mystic_status VARCHAR(50) DEFAULT 'PENDING';
        `);

        // 6. User Generations metadata
        await pool.query(`
            ALTER TABLE user_generations ADD COLUMN IF NOT EXISTS parameters JSONB;
            ALTER TABLE user_generations ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE;
            ALTER TABLE user_generations ADD COLUMN IF NOT EXISTS is_disliked BOOLEAN DEFAULT FALSE;
        `);

        // 7. Update seed data for Plans (Ensure they match latest pricing)
        await pool.query(`
            -- Update Essentials
            UPDATE plans SET 
                monthly_price_cents = 1200, 
                yearly_price_cents = 900, 
                credit_limit_monthly = 450,
                max_resolution = '2K',
                history_preservation_days = 30
            WHERE slug = 'essentials';

            -- Update Pro
            UPDATE plans SET 
                monthly_price_cents = 2900, 
                yearly_price_cents = 2400, 
                credit_limit_monthly = 1400,
                max_resolution = '4K',
                history_preservation_days = 90
            WHERE slug = 'pro';
        `);

        console.log('--- Migration Successful: All schema refinements applied ---');
        process.exit(0);
    } catch (err) {
        console.error('--- Migration Failed ---');
        console.error(err.message);
        process.exit(1);
    }
};

migrate();
