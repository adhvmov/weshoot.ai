-- Create support_sessions table
CREATE TABLE IF NOT EXISTS support_sessions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id), -- Changed to UUID to match users table
    status VARCHAR(50) DEFAULT 'open', -- open, closed, needs_attention
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create support_messages table
CREATE TABLE IF NOT EXISTS support_messages (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES support_sessions(id),
    role VARCHAR(20) NOT NULL, -- user, assistant, system
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_support_sessions_user_id ON support_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_session_id ON support_messages(session_id);
