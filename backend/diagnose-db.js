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

async function diagnoseSchema() {
    const client = await pool.connect();
    try {
        console.log(`🔌 Connected to database: ${process.env.DB_NAME} as ${process.env.DB_USER}`);

        const schemaPath = path.join(__dirname, 'database', 'full_schema.sql');
        let schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Remove comments to avoid splitting issues
        schemaSql = schemaSql.replace(/--.*$/gm, '');

        // Split by semicolon to run statement by statement
        const statements = schemaSql.split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        console.log(`📄 Found ${statements.length} SQL statements. Executing sequentially...`);

        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i];
            try {
                // Skip empty valid blocks
                if (stmt.length < 5) continue;

                await client.query(stmt);
                console.log(`✅ [${i + 1}/${statements.length}] Success: ${stmt.substring(0, 50)}...`);
            } catch (err) {
                console.error(`❌ [${i + 1}/${statements.length}] FAILED: ${stmt.substring(0, 50)}...`);
                console.error(`   Error: ${err.message}`);
                // Don't stop, try to continue to see full picture, or stop?
                // For diagnosis, let's stop on critical errors.
                if (err.message.includes("does not exist") && stmt.includes("DROP")) {
                    console.log("   (Ignored DROP error)");
                } else {
                    console.log("   ⚠️ Stopping execution to inspect error.");
                    break;
                }
            }
        }

    } catch (err) {
        console.error('❌ Connection/File Error:', err);
    } finally {
        client.release();
        pool.end();
    }
}

diagnoseSchema();
