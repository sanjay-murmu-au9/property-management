// PostgreSQL connection test script
const { Client } = require('pg');
require('dotenv').config();

console.log('=== PostgreSQL Connection Test ===');

// Connection details from environment variables
const config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    }
};

console.log('Attempting to connect with these parameters:');
console.log({
    host: config.host,
    port: config.port,
    user: config.user,
    password: '******', // Masked for security
    database: config.database
});

// Create a new client
const client = new Client(config);

// Connect to the database
client.connect()
    .then(() => {
        console.log('Successfully connected to PostgreSQL database!');

        // Test query
        return client.query('SELECT version()');
    })
    .then(result => {
        console.log('PostgreSQL Version:', result.rows[0].version);

        // Close the connection
        return client.end();
    })
    .then(() => {
        console.log('Connection closed successfully.');
    })
    .catch(err => {
        console.error('Error connecting to PostgreSQL:', err.message);

        // Always try to close the connection
        client.end().catch(() => { });
    });