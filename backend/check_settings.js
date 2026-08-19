require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'app_ai',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD
});

async function checkSettings() {
    try {
        await client.connect();
        console.log('Connected to database');

        const result = await client.query(`SELECT * FROM system_settings WHERE key = 'site_config'`);

        if (result.rows.length > 0) {
            console.log('\n=== Current site_config in database ===');
            console.log(JSON.stringify(result.rows[0], null, 2));

            const value = JSON.parse(result.rows[0].value);
            console.log('\n=== Parsed value ===');
            console.log(JSON.stringify(value, null, 2));
            console.log('\nsite_closed:', value.site_closed);
        } else {
            console.log('No site_config found in database');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.end();
    }
}

checkSettings();
