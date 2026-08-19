const { pool } = require('../src/config/database');

async function checkSchema() {
    console.log('🔍 Checking database schema...');
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'project_assets'
            ORDER BY ordinal_position;
        `);
        console.log('Columns in project_assets:');
        res.rows.forEach(row => console.log(`- ${row.column_name} (${row.data_type})`));
    } catch (error) {
        console.error('❌ Schema check failed:', error.message);
    } finally {
        await pool.end();
    }
}

checkSchema();
