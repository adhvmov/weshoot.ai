require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'app_ai',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD
});

async function createRequestsTable() {
    try {
        await client.connect();
        console.log('Connected to database');

        // Create early access requests table
        await client.query(`
      CREATE TABLE IF NOT EXISTS early_access_requests (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP WITH TIME ZONE,
        approved_by_admin_id UUID
      );
    `);
        console.log('✓ Table early_access_requests created');

        // Create index
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_early_access_requests_email ON early_access_requests(email);
      CREATE INDEX IF NOT EXISTS idx_early_access_requests_status ON early_access_requests(status);
    `);
        console.log('✓ Indexes created');

        console.log('\nTable creation successful!');
    } catch (error) {
        console.error('Error creating table:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

createRequestsTable();
