require('dotenv').config();
/**
 * Create early_access_whitelist table
 * Run with: node create_whitelist_table.js
 */
const { Client } = require('pg');

const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'app_ai',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD
});

async function createTable() {
    try {
        await client.connect();
        console.log('Connected to database');

        // Create table
        await client.query(`
      CREATE TABLE IF NOT EXISTS early_access_whitelist (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        added_by_admin_id UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✓ Table early_access_whitelist created');

        // Create index
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_early_access_email ON early_access_whitelist(email);
    `);
        console.log('✓ Index created');

        console.log('\nTable creation successful!');
    } catch (error) {
        console.error('Error creating table:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

createTable();
