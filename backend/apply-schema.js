require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function applySchema() {
    const client = await pool.connect();
    try {
        console.log(`🔌 Connected to database: ${process.env.DB_NAME} as ${process.env.DB_USER}`);

        const schemaPath = path.join(__dirname, 'database', 'full_schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('📄 Reading full_schema.sql...');

        // Split complex SQL block to handle potential issues or just run as one block
        // Postgres driver can usually handle multiple statements in one query if simple
        // But for safety with DO blocks, let's try running it all.

        await client.query('BEGIN');

        console.log('🚀 Applying schema...');
        await client.query(schemaSql);

        // Check if admin_users exists now
        const res = await client.query("SELECT to_regclass('public.admin_users')");
        if (res.rows[0].to_regclass) {
            console.log('✅ verification: Table admin_users exists.');
        } else {
            console.error('❌ verification: Table admin_users MISSING after script.');
        }

        await client.query('COMMIT');
        console.log('✅ Schema applied successfully!');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error applying schema:', err);
    } finally {
        client.release();
        pool.end();
    }
}

applySchema();
