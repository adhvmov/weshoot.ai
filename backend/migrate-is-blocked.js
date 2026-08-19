const db = require('./src/config/database');

async function run() {
    try {
        console.log('--- Adding is_blocked column to users ---');
        await db.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false
        `);
        console.log('Success: is_blocked column added.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

run();
