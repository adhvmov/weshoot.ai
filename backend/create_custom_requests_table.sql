-- Create custom_requests table
CREATE TABLE IF NOT EXISTS custom_requests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    user_type VARCHAR(50), -- 'company', 'freelance', 'other'
    credits_needed VARCHAR(100),
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'contacted', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries on status
CREATE INDEX IF NOT EXISTS idx_custom_requests_status ON custom_requests(status);
