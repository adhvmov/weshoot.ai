const http = require('http');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'photoai',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
});

async function request(path, method, body) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const options = {
            hostname: 'localhost',
            port: 5001,
            path: `/api${path}`,
            method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data ? Buffer.byteLength(data) : 0
            }
        };

        const req = http.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => { responseBody += chunk; });
            res.on('end', () => {
                try {
                    const json = responseBody ? JSON.parse(responseBody) : {};
                    resolve({ statusCode: res.statusCode, body: json });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, body: responseBody });
                }
            });
        });

        req.on('error', (e) => reject(e));
        if (data) req.write(data);
        req.end();
    });
}

async function runTest() {
    const email = `unverified_${Date.now()}@example.com`;
    const password = 'OldPassword123!';
    const newPassword = 'NewPassword999!';

    console.log(`--- Starting Unverified Reset Test for: ${email} ---`);

    // 1. Register (user will be unverified by default)
    console.log('1. Registering...');
    const regRes = await request('/auth/register', 'POST', { email, password, full_name: 'Unverified User' });
    console.log(`   Result: ${regRes.statusCode}`);

    // Check verification status in DB
    let userRes = await pool.query('SELECT is_verified FROM users WHERE email = $1', [email]);
    console.log(`   Is Verified initially: ${userRes.rows[0].is_verified}`);

    // 2. Forgot Password
    console.log('2. Requesting forgot password...');
    await request('/auth/forgot-password', 'POST', { email });
    const resetUserRes = await pool.query('SELECT reset_token FROM users WHERE email = $1', [email]);
    const resetCode = resetUserRes.rows[0].reset_token;
    console.log(`   Retrieved reset code: ${resetCode}`);

    // 3. Reset Password
    console.log('3. Resetting password...');
    const resetRes = await request('/auth/reset-password', 'POST', { email, code: resetCode, newPassword });
    console.log(`   Result: ${resetRes.statusCode}`, resetRes.body.message);

    // Check verification status in DB again
    userRes = await pool.query('SELECT is_verified FROM users WHERE email = $1', [email]);
    console.log(`   Is Verified after reset: ${userRes.rows[0].is_verified}`);

    // 4. Login with New Password
    console.log('4. Logging in with new password...');
    const loginRes = await request('/auth/login', 'POST', { email, password: newPassword });
    console.log(`   Result: ${loginRes.statusCode}`, loginRes.body.success ? 'Success' : 'Failed', loginRes.body.message || '');

    if (userRes.rows[0].is_verified === true && loginRes.body.success === true) {
        console.log('\n✅ TEST PASSED: Unverified user correctly marked as verified and can login after reset!');
    } else {
        console.log('\n❌ TEST FAILED');
    }
      
    pool.end();
}

runTest().catch(console.error);



