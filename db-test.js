// Simple MySQL connection test
const mysql = require('mysql2');
require('dotenv').config();

console.log('Attempting to connect to MySQL database with these parameters:');
console.log({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: '******', // Masked for security
    database: process.env.DB_NAME
});

// Create connection with Aiven recommended options
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    },
    connectTimeout: 60000 // 60 seconds
});

// Attempt connection
connection.connect((err) => {
    if (err) {
        console.error('Failed to connect to MySQL database:');
        console.error(err);
        return;
    }

    console.log('Successfully connected to MySQL database!');

    // Get server information
    connection.query('SELECT VERSION() as version', (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            return;
        }

        console.log('MySQL Version:', results[0].version);
        connection.end();
    });
});