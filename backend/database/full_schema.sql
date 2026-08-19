-- Database Full Schema for WeShoot.ai
-- Consolidated from all schema and migration files, refined for accuracy with app logic.

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------
-- 1. Clean up existing schema (Reset)
-- ---------------------------------------------------------

DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS system_reports CASCADE;
DROP TABLE IF EXISTS usage_logs CASCADE;
DROP TABLE IF EXISTS gallery_likes CASCADE;
DROP TABLE IF EXISTS prompt_gallery CASCADE;
DROP TABLE IF EXISTS early_access_whitelist CASCADE;
DROP TABLE IF EXISTS early_access_requests CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS ai_models CASCADE;
DROP TABLE IF EXISTS admin_logs CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS admin_roles CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS user_generations CASCADE;
DROP TABLE IF EXISTS brand_presets CASCADE;
DROP TABLE IF EXISTS operations_history CASCADE;
DROP TABLE IF EXISTS project_assets CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS user_credits CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ---------------------------------------------------------
-- 2. Helper Functions
-- ---------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ---------------------------------------------------------
-- 3. General Tables
-- ---------------------------------------------------------

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'user', -- 'user', 'admin'
    is_verified BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    verification_token_expires TIMESTAMP WITH TIME ZONE,
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Plans Table
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    monthly_price_cents INTEGER NOT NULL,
    yearly_price_cents INTEGER NOT NULL,
    credit_limit_monthly INTEGER NOT NULL,
    features JSONB NOT NULL,
    max_upload_size_mb INTEGER DEFAULT 10,
    max_resolution VARCHAR(20) DEFAULT '2K',
    history_preservation_days INTEGER DEFAULT 1,
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions Table (Tracks current billing state)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id),
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'past_due'
    billing_cycle VARCHAR(10) NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    external_subscription_id VARCHAR(100), -- Stripe/PayPal ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Credits Table (Real-time balance)
CREATE TABLE IF NOT EXISTS user_credits (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_credits INTEGER NOT NULL DEFAULT 50,
    used_credits INTEGER NOT NULL DEFAULT 0,
    last_reset_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table (Dashboard items)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    thumbnail_url TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Project Assets Table (Images within projects)
CREATE TABLE IF NOT EXISTS project_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_url TEXT,
    filename VARCHAR(255),
    mime_type VARCHAR(50),
    size_bytes INTEGER,
    width INTEGER,
    height INTEGER,
    type VARCHAR(20) DEFAULT 'original', -- 'original', 'processed', 'mask'
    status VARCHAR(20) DEFAULT 'completed', -- 'processing', 'completed', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Operations History Table (Audit log & Poll tracking)
CREATE TABLE IF NOT EXISTS operations_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    asset_id UUID REFERENCES project_assets(id) ON DELETE SET NULL,
    tool_name VARCHAR(50) NOT NULL,
    credits_cost INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'success', 'failed', 'processing'
    parameters JSONB, 
    mystic_task_id VARCHAR(255), -- Freepik task tracking
    mystic_status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Brand Presets Table
CREATE TABLE IF NOT EXISTS brand_presets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    settings JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Generations (Persistent Creations stream)
CREATE TABLE IF NOT EXISTS user_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    tool_name VARCHAR(50),
    prompt TEXT,
    parameters JSONB,
    is_favorite BOOLEAN DEFAULT FALSE,
    is_disliked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Sessions (Token & Device tracking)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    ip_address VARCHAR(45),
    device_type VARCHAR(20),
    browser VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- 3. Admin & System Tables
-- ---------------------------------------------------------

-- Admin Roles
CREATE TABLE IF NOT EXISTS admin_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    permissions JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(100),
    role_id UUID REFERENCES admin_roles(id) ON DELETE SET NULL,
    last_login TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admin Logs
CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Models (Configurable costs & models)
CREATE TABLE IF NOT EXISTS ai_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    model_id VARCHAR(100) UNIQUE NOT NULL, -- Match controllers expected 'model_id'
    cost_per_generation INTEGER DEFAULT 1, -- Match controllers expected 'cost_per_generation'
    type VARCHAR(50), -- Match controllers expected 'type'
    is_active BOOLEAN DEFAULT TRUE,
    config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System Settings (Dynamic app config)
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Early Access Requests (User interest)
CREATE TABLE IF NOT EXISTS early_access_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by_admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Early Access Whitelist (Granted access)
CREATE TABLE IF NOT EXISTS early_access_whitelist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    added_by_admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Prompt Gallery
CREATE TABLE IF NOT EXISTS prompt_gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    prompt TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Gallery Likes
CREATE TABLE IF NOT EXISTS gallery_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID REFERENCES prompt_gallery(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(prompt_id, user_id)
);

-- Usage Logs (Extended technical audit)
CREATE TABLE IF NOT EXISTS usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tool_name VARCHAR(100) NOT NULL,
    model_id UUID REFERENCES ai_models(id) ON DELETE SET NULL,
    credits_used INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL,
    error_message TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System Reports (Feedback & Moderation)
CREATE TABLE IF NOT EXISTS system_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    target_type VARCHAR(50), -- 'gallery', 'tool', 'system'
    target_id UUID,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    admin_id UUID REFERENCES admin_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contact Us Messages
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    subject VARCHAR(100),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'unread', -- 'unread', 'read', 'archived'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- 4. Indexes
-- ---------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_project_assets_project_id ON project_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_operations_user_id ON operations_history(user_id);
CREATE INDEX IF NOT EXISTS idx_operations_mystic_task_id ON operations_history(mystic_task_id);
CREATE INDEX IF NOT EXISTS idx_user_generations_email ON user_generations(user_email);
CREATE INDEX IF NOT EXISTS idx_user_generations_favorite ON user_generations(user_email, is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_generations_disliked ON user_generations(user_email, is_disliked) WHERE is_disliked = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_early_access_requests_email ON early_access_requests(email);
CREATE INDEX IF NOT EXISTS idx_early_access_requests_status ON early_access_requests(status);
CREATE INDEX IF NOT EXISTS idx_early_access_email ON early_access_whitelist(email);
CREATE INDEX IF NOT EXISTS idx_gallery_likes_prompt ON gallery_likes(prompt_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);

-- ---------------------------------------------------------
-- 5. Triggers
-- ---------------------------------------------------------

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_plans_updated_at') THEN
        CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_subscriptions_updated_at') THEN
        CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_credits_updated_at') THEN
        CREATE TRIGGER update_user_credits_updated_at BEFORE UPDATE ON user_credits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_projects_updated_at') THEN
        CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_project_assets_updated_at') THEN
        CREATE TRIGGER update_project_assets_updated_at BEFORE UPDATE ON project_assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_operations_history_updated_at') THEN
        CREATE TRIGGER update_operations_history_updated_at BEFORE UPDATE ON operations_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_system_settings_updated_at') THEN
        CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ---------------------------------------------------------
-- 6. Seed Data (Updated for latest Pricing & Plans)
-- ---------------------------------------------------------

-- 1. Plans (Reflecting latest PricingPage.jsx updates)
INSERT INTO plans (name, slug, monthly_price_cents, yearly_price_cents, credit_limit_monthly, features, max_upload_size_mb, max_resolution, history_preservation_days, is_popular)
VALUES 
('Free', 'free', 0, 0, 50, 
 '["50 credits to use on any operation", "Standard resolution (up to 2K)", "24 hours history preservation"]', 10, '2K', 1, FALSE),

('Essentials', 'essentials', 1200, 900, 450, 
 '["450 credits to use on any operation", "Standard resolution (up to 2K)", "1 month history preservation"]', 10, '2K', 30, FALSE),

('Pro', 'pro', 2900, 2400, 1400, 
 '["1,400 credits for any operation", "Higher resolution up to 4K", "3 months history preservation", "Premium tools access"]', 20, '4K', 90, TRUE)
ON CONFLICT (slug) DO UPDATE SET
    monthly_price_cents = EXCLUDED.monthly_price_cents,
    yearly_price_cents = EXCLUDED.yearly_price_cents,
    credit_limit_monthly = EXCLUDED.credit_limit_monthly,
    features = EXCLUDED.features,
    max_upload_size_mb = EXCLUDED.max_upload_size_mb,
    max_resolution = EXCLUDED.max_resolution,
    history_preservation_days = EXCLUDED.history_preservation_days,
    is_popular = EXCLUDED.is_popular;

-- 2. Admin Roles (Seed if empty)
INSERT INTO admin_roles (name, permissions) 
SELECT 'Super Admin', '["all"]' WHERE NOT EXISTS (SELECT 1 FROM admin_roles WHERE name = 'Super Admin');
INSERT INTO admin_roles (name, permissions) 
SELECT 'Support', '["users", "gallery"]' WHERE NOT EXISTS (SELECT 1 FROM admin_roles WHERE name = 'Support');
INSERT INTO admin_roles (name, permissions) 
SELECT 'Finance', '["payments", "pricing"]' WHERE NOT EXISTS (SELECT 1 FROM admin_roles WHERE name = 'Finance');

-- 3. Initial System Settings (Seed if empty)
INSERT INTO system_settings (key, value)
VALUES 
('site_config', '{"site_name": "WeShoot.ai", "support_email": "support@weshoot.ai", "maintenance_mode": false, "allow_new_registrations": true, "trial_credits": 50, "default_language": "en", "site_closed": false}'),
('branding', '{"primary_color": "#4D96FF", "logo_url": "", "favicon_url": ""}'),
('security', '{"max_login_attempts": 5, "session_timeout": 3600, "forced_2fa": false}')
ON CONFLICT (key) DO NOTHING;
