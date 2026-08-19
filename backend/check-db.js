const db = require('./src/config/database');
async function check() {
    try {
        const tables = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables:', tables.rows.map(r => r.table_name));

        const sub = await db.query("SELECT * FROM information_schema.columns WHERE table_name = 'subscriptions'");
        console.log('Subscription Columns:', sub.rows.map(r => r.column_name));

        const session = await db.query("SELECT * FROM information_schema.columns WHERE table_name = 'user_sessions'");
        console.log('Session Columns:', session.rows.map(r => r.column_name));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
