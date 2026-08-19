require('dotenv').config();
if (!process.env.DB_PASSWORD) {
    throw new Error('DB_PASSWORD is not set. Set it in your environment before running this script.');
}
const { Pool } = require('pg');

// Connect as postgres superuser to template1 or postgres DB
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'weshoot',
    user: 'akram',
    password: process.env.DB_PASSWORD,
});

async function setupDatabase() {
    const client = await pool.connect();
    try {
        console.log('🔌 Connected to postgres database...');

        // 1. Check if user 'akram' exists
        const userRes = await client.query("SELECT 1 FROM pg_roles WHERE rolname='akram'");
        if (userRes.rows.length === 0) {
            console.log('👤 Creating user akram...');
            await client.query(`CREATE USER akram WITH PASSWORD '${process.env.DB_PASSWORD}' SUPERUSER CREATEDB`);
        } else {
            console.log('👤 User akram already exists.');
        }

        // 2. Check if database 'weshoot' exists
        const dbRes = await client.query("SELECT 1 FROM pg_database WHERE datname='weshoot'");
        if (dbRes.rows.length === 0) {
            console.log('📦 Creating database weshoot...');
            await client.query('CREATE DATABASE weshoot OWNER akram');
        } else {
            console.log('📦 Database weshoot already exists.');
        }

        console.log('✅ Database setup complete.');
    } catch (err) {
        console.error('❌ Error setting up database:', err);
    } finally {
        client.release();
        pool.end();
    }
}

setupDatabase();
