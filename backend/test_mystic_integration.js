/**
 * Test Freepik Mystic Integration
 * Basic test for text-only generation
 */
const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

// You need to replace this with a valid JWT token from your app
const AUTH_TOKEN = 'YOUR_JWT_TOKEN_HERE';

async function testMysticGeneration() {
    console.log('='.repeat(60));
    console.log('Testing Freepik Mystic Integration');
    console.log('='.repeat(60));

    try {
        // 1. Test LoRA Styles Fetch
        console.log('\n[1] Fetching LoRA Styles...');
        try {
            const loraResponse = await axios.get(`${API_URL}/generator/lora-styles`);
            console.log('✓ LoRA Styles fetched:', loraResponse.data.data?.length || 0, 'styles');
        } catch (error) {
            console.log('✗ LoRA fetch failed:', error.response?.data || error.message);
        }

        // 2. Test Simple Generation
        console.log('\n[2] Starting Mystic Generation (Text-only)...');
        const generatePayload = {
            prompt: 'A modern minimalist living room with natural light, professional interior photography',
            resolution: '2k',
            aspectRatio: 'widescreen_16_9',
            model: 'realism',
            creativeDetailing: 33,
            engine: 'automatic'
        };

        console.log('Payload:', JSON.stringify(generatePayload, null, 2));

        const generateResponse = await axios.post(
            `${API_URL}/generator/mystic-generate`,
            generatePayload,
            {
                headers: {
                    'Authorization': `Bearer ${AUTH_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✓ Generation started!');
        console.log('Response:', JSON.stringify(generateResponse.data, null, 2));

        const taskId = generateResponse.data.data.taskId;
        console.log('\nTask ID:', taskId);

        // 3. Poll for Status
        console.log('\n[3] Polling for status...');
        let attempts = 0;
        const maxAttempts = 30; // 30 attempts * 2 seconds = 1 minute

        while (attempts < maxAttempts) {
            attempts++;

            // Wait 2 seconds between polls
            await new Promise(resolve => setTimeout(resolve, 2000));

            const statusResponse = await axios.get(
                `${API_URL}/generator/mystic-status/${taskId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${AUTH_TOKEN}`
                    }
                }
            );

            const status = statusResponse.data.data.status;
            const imageUrl = statusResponse.data.data.imageUrl;

            console.log(`  [Attempt ${attempts}] Status: ${status}`);

            if (status === 'COMPLETED' && imageUrl) {
                console.log('\n✓ Generation COMPLETED!');
                console.log('Image URL:', imageUrl);
                break;
            } else if (status === 'FAILED') {
                console.log('\n✗ Generation FAILED');
                break;
            }

            if (attempts >= maxAttempts) {
                console.log('\n⚠ Polling timeout (still in progress)');
                console.log('You can continue polling manually with taskId:', taskId);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('Test completed!');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n✗ Test failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

// Instructions for getting TOKEN
if (AUTH_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
    console.log('\n⚠ SETUP REQUIRED ⚠\n');
    console.log('To run this test, you need to:');
    console.log('1. Login to your app and copy your JWT token');
    console.log('2. Replace AUTH_TOKEN in this file with your token');
    console.log('3. Run this script again: node test_mystic_integration.js\n');
    console.log('Alternative: Add token as environment variable:');
    console.log('AUTH_TOKEN="your-token" node test_mystic_integration.js\n');

    // Try to get from environment
    if (process.env.AUTH_TOKEN) {
        console.log('Found AUTH_TOKEN in environment, using that...\n');
        AUTH_TOKEN = process.env.AUTH_TOKEN;
        testMysticGeneration();
    }
} else {
    testMysticGeneration();
}

module.exports = { testMysticGeneration };
