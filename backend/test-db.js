require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function testConnection() {
    try {
        await client.connect();
        console.log('✅ Successfully connected to database:', process.env.DB_NAME);
        const res = await client.query('SELECT NOW()');
        console.log('Database Time:', res.rows[0].now);
        await client.end();
    } catch (err) {
        console.error('❌ Database connection failed:', err);
        process.exit(1);
    }
}

testConnection();
