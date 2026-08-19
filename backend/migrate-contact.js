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
        console.log('--- Starting Migration: Create contact_messages table ---');

        await pool.query(`
            -- Create Table
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

            -- Create Indexes
            CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
            CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
        `);

        console.log('--- Migration Successful: contact_messages table created ---');
        process.exit(0);
    } catch (err) {
        console.error('--- Migration Failed ---');
        console.error(err.message);
        process.exit(1);
    }
};

migrate();
