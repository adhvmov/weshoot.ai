-- Migration to add user_generations table
-- This table allows persisting generated images by email

CREATE TABLE IF NOT EXISTS user_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    tool_name VARCHAR(50),
    prompt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_generations_email ON user_generations(user_email);
