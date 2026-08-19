const http = require('http');

const data = JSON.stringify({
    email: 'webify.net1@gmail.com'
});

const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/forgot-password',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('Sending test request to http://localhost:5001/api/auth/forgot-password...');

const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (error) => {
    console.error('Request Error:', error);
});

req.write(data);
req.end();
