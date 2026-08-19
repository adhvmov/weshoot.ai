const db = require('./src/config/database');

async function debug() {
    try {
        const users = await db.query('SELECT id, email FROM users LIMIT 5');
        console.log('Sample Users:', JSON.stringify(users.rows, null, 2));

        const count = await db.query('SELECT COUNT(*) FROM users');
        console.log('Total Users:', count.rows[0].count);

        process.exit(0);
    } catch (err) {
        console.error('Debug Error:', err);
        process.exit(1);
    }
}

debug();
