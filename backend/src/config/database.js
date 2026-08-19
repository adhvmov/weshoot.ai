/**
 * Database Configuration
 * PostgreSQL connection pool setup
 */
const { Pool } = require('pg');
require('dotenv').config();

// Create connection pool
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'photoai',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    max: 20, // Maximum number of connections in the pool
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Test database connection
pool.on('connect', () => {
    console.log('📦 Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client:', err.message);
    // Don't exit process in development to allow debugging
    if (process.env.NODE_ENV !== 'development') {
        process.exit(-1);
    }
});

// Query helper function
const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text: text.substring(0, 50), duration, rows: result.rowCount });
        return result;
    } catch (error) {
        console.error('Query error:', error);
        throw error;
    }
};

// Get a client from the pool
const getClient = async () => {
    const client = await pool.connect();
    const release = client.release.bind(client);

    // Override release to log
    client.release = () => {
        client.release = release;
        return release();
    };

    return client;
};

module.exports = {
    pool,
    query,
    getClient,
};
