// Advanced MySQL connection test with multiple configurations
const mysql = require('mysql2');
const dns = require('dns');
const net = require('net');
require('dotenv').config();

console.log('=== MySQL Connection Diagnostic Tool ===');

// Configuration from environment
const config = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

console.log('Current configuration:');
console.log({
    host: config.host,
    port: config.port,
    user: config.user,
    password: '******', // Masked for security
    database: config.database
});

// Step 1: Check if hostname is an IP address or domain
console.log('\n=== Step 1: DNS Resolution ===');
const isIP = net.isIP(config.host);
if (isIP) {
    console.log(`Host ${config.host} is an IP address. Skipping DNS resolution.`);
} else {
    console.log(`Host ${config.host} is a domain name. Attempting DNS resolution...`);
    dns.lookup(config.host, (err, address, family) => {
        if (err) {
            console.error(`DNS resolution failed: ${err.message}`);
        } else {
            console.log(`DNS resolution successful. IP: ${address}, IP version: IPv${family}`);
        }
    });
}

// Step 2: Check if port is open
console.log('\n=== Step 2: Port Test ===');
const socket = new net.Socket();
const timeout = 5000; // 5 seconds

socket.setTimeout(timeout);

socket.on('connect', () => {
    console.log(`Port ${config.port} on ${config.host} is OPEN`);
    socket.destroy();
});

socket.on('timeout', () => {
    console.log(`Port ${config.port} on ${config.host} connection TIMED OUT`);
    socket.destroy();
});

socket.on('error', (err) => {
    console.log(`Port ${config.port} on ${config.host} is CLOSED or unreachable: ${err.message}`);
});

console.log(`Testing if port ${config.port} is open on ${config.host}...`);
socket.connect(config.port, config.host);

// Step 3: Try MySQL connection with different options
console.log('\n=== Step 3: MySQL Connection Attempts ===');

// Basic connection
console.log('\nAttempt 1: Basic connection');
tryConnection({
    ...config,
    connectTimeout: 10000
}, 'Basic connection');

// With SSL
setTimeout(() => {
    console.log('\nAttempt 2: With SSL');
    tryConnection({
        ...config,
        ssl: {
            rejectUnauthorized: false
        },
        connectTimeout: 10000
    }, 'With SSL');
}, 3000);

// With different port (default MySQL port)
setTimeout(() => {
    console.log('\nAttempt 3: Default MySQL port (3306)');
    tryConnection({
        ...config,
        port: 3306,
        ssl: {
            rejectUnauthorized: false
        },
        connectTimeout: 10000
    }, 'Default MySQL port');
}, 6000);

// Function to try connections
function tryConnection(connectionConfig, description) {
    const connection = mysql.createConnection(connectionConfig);

    connection.connect((err) => {
        if (err) {
            console.error(`Failed to connect (${description}):`);
            console.error(`  Error: ${err.message}`);
            console.error(`  Code: ${err.code}`);
            if (err.errno) console.error(`  Errno: ${err.errno}`);
            return;
        }

        console.log(`Successfully connected to MySQL (${description})!`);

        connection.query('SELECT VERSION() as version', (err, results) => {
            if (err) {
                console.error(`Error querying database: ${err.message}`);
            } else {
                console.log(`MySQL Version: ${results[0].version}`);
            }
            connection.end();
        });
    });
}