const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'app_ai',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
});

const run = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('--- Phase 1: Core Admin Tables ---');

        // 1. Admin Roles
        await client.query(`
            CREATE TABLE IF NOT EXISTS admin_roles (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(50) UNIQUE NOT NULL,
                permissions JSONB DEFAULT '[]',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Admin Users
        await client.query(`
            CREATE TABLE IF NOT EXISTS admin_users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                full_name VARCHAR(100),
                role_id UUID REFERENCES admin_roles(id) ON DELETE SET NULL,
                last_login TIMESTAMP WITH TIME ZONE,
                status VARCHAR(20) DEFAULT 'active',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 3. Admin Logs
        await client.query(`
            CREATE TABLE IF NOT EXISTS admin_logs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
                action VARCHAR(100) NOT NULL,
                details JSONB,
                ip_address VARCHAR(45),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('--- Phase 2: System Config Tables ---');

        // 4. AI Models
        await client.query(`
            CREATE TABLE IF NOT EXISTS ai_models (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(100) NOT NULL,
                provider VARCHAR(50) NOT NULL,
                model_key VARCHAR(100) UNIQUE NOT NULL,
                cost_per_gen INTEGER DEFAULT 1,
                is_active BOOLEAN DEFAULT true,
                config JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 5. Pricing Plans (Migrating from hardcoded)
        await client.query(`
            CREATE TABLE IF NOT EXISTS pricing_plans (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(100) NOT NULL,
                slug VARCHAR(50) UNIQUE NOT NULL,
                price_monthly DECIMAL(10,2) NOT NULL,
                price_yearly DECIMAL(10,2) NOT NULL,
                credits_per_month INTEGER NOT NULL,
                features JSONB DEFAULT '[]',
                status VARCHAR(20) DEFAULT 'active',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('--- Phase 3: Monitoring & Moderation ---');

        // 6. Usage Logs
        await client.query(`
            CREATE TABLE IF NOT EXISTS usage_logs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                tool_name VARCHAR(100) NOT NULL,
                model_id UUID REFERENCES ai_models(id),
                credits_used INTEGER DEFAULT 0,
                status VARCHAR(20) NOT NULL,
                error_message TEXT,
                duration_ms INTEGER,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 7. Feedback/Reports
        await client.query(`
            CREATE TABLE IF NOT EXISTS system_reports (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE SET NULL,
                target_type VARCHAR(50), -- 'gallery', 'tool', 'system'
                target_id UUID,
                reason TEXT NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                admin_id UUID REFERENCES admin_users(id),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 8. System Settings
        await client.query(`
            CREATE TABLE IF NOT EXISTS system_settings (
                key VARCHAR(100) PRIMARY KEY,
                value JSONB NOT NULL,
                description TEXT,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('--- Seeding Initial Data ---');

        // Seed Roles
        const superAdminRole = await client.query(`
            INSERT INTO admin_roles (name, permissions) 
            VALUES ('Super Admin', '["all"]') 
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name 
            RETURNING id
        `);
        const roleId = superAdminRole.rows[0].id;

        await client.query(`INSERT INTO admin_roles (name, permissions) VALUES ('Support', '["users", "gallery"]') ON CONFLICT DO NOTHING`);
        await client.query(`INSERT INTO admin_roles (name, permissions) VALUES ('Finance', '["payments", "pricing"]') ON CONFLICT DO NOTHING`);

        // Seed Admin User: akram / $ADMIN_PASSWORD
        if (!process.env.ADMIN_PASSWORD) {
            throw new Error('ADMIN_PASSWORD is not set. Set it in your environment before running this script.');
        }
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
        await client.query(`
            INSERT INTO admin_users (username, password_hash, full_name, role_id) 
            VALUES ($1, $2, $3, $4) 
            ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash
        `, ['akram', hashedPassword, 'Akram Admin', roleId]);

        // Seed default plans
        const defaultPlans = [
            { name: 'Free trial', slug: 'free', monthly: 0, yearly: 0, credits: 50, features: ['50 credits to use', 'All standard tools'] },
            { name: 'Essentials', slug: 'essentials', monthly: 12, yearly: 9, credits: 500, features: ['500 credits', '2K Resolution'] },
            { name: 'Pro Plan', slug: 'pro', monthly: 45, yearly: 35, credits: 2000, features: ['2000 credits', 'Premium Tools', '64 MP Resolution'] }
        ];

        for (const plan of defaultPlans) {
            await client.query(`
                INSERT INTO pricing_plans (name, slug, price_monthly, price_yearly, credits_per_month, features)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (slug) DO NOTHING
            `, [plan.name, plan.slug, plan.monthly, plan.yearly, plan.credits, JSON.stringify(plan.features)]);
        }

        // Seed initial settings
        const initialSettings = [
            { key: 'site_config', value: { site_name: 'WeShoot.ai', support_email: 'support@weshoot.ai', maintenance_mode: false, allow_new_registrations: true, trial_credits: 5, default_language: 'en' } },
            { key: 'branding', value: { primary_color: '#4D96FF', logo_url: '', favicon_url: '' } },
            { key: 'security', value: { max_login_attempts: 5, session_timeout: 3600, forced_2fa: false } }
        ];

        for (const setting of initialSettings) {
            await client.query(`
                INSERT INTO system_settings (key, value)
                VALUES ($1, $2)
                ON CONFLICT (key) DO NOTHING
            `, [setting.key, JSON.stringify(setting.value)]);
        }

        await client.query('COMMIT');
        console.log('Admin migration completed successfully!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Admin migration failed:', err);
    } finally {
        client.release();
        process.exit(0);
    }
};

run();
