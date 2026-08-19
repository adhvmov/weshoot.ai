const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'photoai',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
});

pool.query('SELECT 1', (err, res) => {
    if (err) {
        console.error('Connection failed:', err.message);
    } else {
        console.log('Connection successful!');
    }
    pool.end();
});
