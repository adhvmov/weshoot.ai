-- Database Schema for WeShoot Clone
-- Based on frontend requirements: Dashboard, Editor, Pricing, Authentication

-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
-- Core user information
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Nullable if using only OAuth
    full_name VARCHAR(100),
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'user', -- 'user', 'admin'
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    verification_token_expires TIMESTAMP WITH TIME ZONE,
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Plans Table
-- Static data defining available subscription tiers (Free, Essentials, Pro)
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE, -- 'free', 'essentials', 'pro'
    slug VARCHAR(50) NOT NULL UNIQUE,
    monthly_price_cents INTEGER NOT NULL,
    yearly_price_cents INTEGER NOT NULL,
    credit_limit_monthly INTEGER NOT NULL,
    features JSONB NOT NULL, -- Store checklist items like '3x history preservation'
    max_upload_size_mb INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default plans based on PricingModal.jsx
INSERT INTO plans (name, slug, monthly_price_cents, yearly_price_cents, credit_limit_monthly, features, max_upload_size_mb) VALUES
('Free', 'free', 0, 0, 50, '["Basic tools", "Standard resolution"]', 10),
('Essentials', 'essentials', 1200, 900, 500, '["500 credits", "Powerful toolset", "Standard resolution"]', 10),
('Pro', 'pro', 4500, 3500, 2000, '["2000 credits", "Premium tools", "4K generation", "3x history", "64MP upload"]', 64);

-- 3. Subscriptions Table
-- Tracks user's current plan and billing cycle
CREATE TABLE subscriptions (
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

-- 4. User Credits Table
-- Real-time credit balance tracking
CREATE TABLE user_credits (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_credits INTEGER NOT NULL DEFAULT 50,
    used_credits INTEGER NOT NULL DEFAULT 0,
    last_reset_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Projects/Files Table
-- Corresponds to "My Files" and "Dashboard"
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    thumbnail_url TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    is_favorite BOOLEAN DEFAULT FALSE, -- For 'Favourites only' filter
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Project Assets (Images) Table
-- The raw and processed images within a project
CREATE TABLE project_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Denormalized for quick access
    file_url TEXT, -- Nullable for async operations
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

-- 7. Operations History Table
-- Audit log of tools used ("History" feature implied by pricing)
CREATE TABLE operations_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    asset_id UUID REFERENCES project_assets(id),
    tool_name VARCHAR(50) NOT NULL, -- e.g., 'remove_bg', 'upscale'
    credits_cost INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'success', 'failed', 'processing'
    parameters JSONB, -- Settings used for the operation
    mystic_task_id VARCHAR(255), -- For polling Freepik Mystic results
    mystic_status VARCHAR(50), -- 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Brand Presets Table
-- For "Brand Presets" sidebar item
CREATE TABLE brand_presets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    settings JSONB NOT NULL, -- Colors, logo URL, font preferences
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_assets_project_id ON project_assets(project_id);
CREATE INDEX idx_operations_user_id ON operations_history(user_id);
