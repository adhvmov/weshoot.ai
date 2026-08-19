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
    const email = `verified_${Date.now()}@example.com`;
    const password = 'OldPassword123!';
    const newPassword = 'NewPassword789!';

    console.log(`--- Starting Verified Flow Test for: ${email} ---`);

    // 1. Register
    console.log('1. Registering...');
    const regRes = await request('/auth/register', 'POST', { email, password, full_name: 'Verified User' });
    console.log(`   Result: ${regRes.statusCode}`);

    // 2. Get verification code from DB
    const userRes = await pool.query('SELECT id, verification_token FROM users WHERE email = $1', [email]);
    const verifyCode = userRes.rows[0].verification_token;
    console.log(`2. Retrieved verification code: ${verifyCode}`);

    // 3. Verify Email
    console.log('3. Verifying email...');
    const verifyRes = await request('/auth/verify-email', 'POST', { email, code: verifyCode });
    console.log(`   Result: ${verifyRes.statusCode}`, verifyRes.body.message);

    // 4. Login with Old Password
    console.log('4. Logging in with old password...');
    const loginOldRes = await request('/auth/login', 'POST', { email, password });
    console.log(`   Result: ${loginOldRes.statusCode}`, loginOldRes.body.success ? 'Success' : 'Failed');

    // 5. Forgot Password
    console.log('5. Requesting forgot password...');
    await request('/auth/forgot-password', 'POST', { email });
    const resetUserRes = await pool.query('SELECT reset_token FROM users WHERE email = $1', [email]);
    const resetCode = resetUserRes.rows[0].reset_token;
    console.log(`   Retrieved reset code: ${resetCode}`);

    // 6. Reset Password
    console.log('6. Resetting password...');
    const resetRes = await request('/auth/reset-password', 'POST', { email, code: resetCode, newPassword });
    console.log(`   Result: ${resetRes.statusCode}`, resetRes.body.message);

    // 7. Login with New Password
    console.log('7. Logging in with new password...');
    const loginNewRes = await request('/auth/login', 'POST', { email, password: newPassword });
    console.log(`   Result: ${loginNewRes.statusCode}`, loginNewRes.body.success ? 'Success' : 'Failed');

    // 8. Login with Old Password (should fail)
    console.log('8. Logging in with old password (should fail)...');
    const loginFailRes = await request('/auth/login', 'POST', { email, password });
    console.log(`   Result: ${loginFailRes.statusCode}`, loginFailRes.body.message);

    if (loginNewRes.body.success && loginFailRes.statusCode === 401) {
        console.log('\n✅ ALL TESTS PASSED: Password reset correctly hashes and replaces old password!');
    } else {
        console.log('\n❌ TESTS FAILED');
    }

    pool.end();
}

runTest().catch(console.error);
