require('dotenv').config({ path: ['.env.local', '.env'] }); // Allow overriding with .env.local
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'app_ai',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
});

async function createAdminUser() {
    try {
        console.log('🔌 Connecting to database...');
        const client = await pool.connect();

        try {
            // 1. Get Super Admin Role ID
            console.log('🔍 Finding Super Admin role...');
            const roleResult = await client.query("SELECT id FROM admin_roles WHERE name = 'Super Admin'");

            if (roleResult.rows.length === 0) {
                throw new Error('Super Admin role not found! Did you run the schema seed?');
            }

            const roleId = roleResult.rows[0].id;
            console.log(`✅ Found Role ID: ${roleId}`);

            // 2. Hash Password
            const password = process.env.ADMIN_PASSWORD;
            if (!password) {
                throw new Error('ADMIN_PASSWORD is not set. Set it in your environment before running this script.');
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            console.log('🔐 Password hashed.');

            // 3. Upsert User
            console.log('👤 Creating/Updating admin user akram...');
            const insertQuery = `
                INSERT INTO admin_users (username, password_hash, role_id, status)
                VALUES ($1, $2, $3, 'active')
                ON CONFLICT (username) DO UPDATE SET
                    password_hash = EXCLUDED.password_hash,
                    role_id = EXCLUDED.role_id,
                    status = 'active'
                RETURNING id;
            `;

            const userResult = await client.query(insertQuery, ['akram', hashedPassword, roleId]);
            console.log(`✅ Admin user 'akram' created/updated with ID: ${userResult.rows[0].id}`);

        } finally {
            client.release();
        }
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await pool.end();
    }
}

createAdminUser();
