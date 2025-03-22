// Admin login test script
const axios = require('axios');
require('dotenv').config();

async function testAdminLogin() {
    console.log('=== Testing Admin Login ===');

    const loginData = {
        email: 'admin@property.com',
        password: 'Admin@123'
    };

    console.log('Attempting to login with:', {
        email: loginData.email,
        password: '********' // Masked for security
    });

    try {
        // Attempt login
        const response = await axios.post('http://localhost:3000/api/auth/login', loginData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Login successful!');
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));

        return response.data;
    } catch (error) {
        console.error('Login failed!');

        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Status:', error.response.status);
            console.error('Response data:', error.response.data);
            console.error('Headers:', error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received. Is the server running?');
            console.error(error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up request:', error.message);
        }

        console.error('Full error config:', error.config);
    }
}

// Run the test
testAdminLogin();