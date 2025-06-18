const mysql = require('mysql2/promise'); 
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'recycle_waste_webapp',
    waitForConnections: true,
    connectionLimit: 10, 
    queueLimit: 0
});

const verifyConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to MySQL database:', process.env.DB_NAME || 'recycle_waste_webapp');
        connection.release();
    } catch (error) {
        console.error('Error connecting to MySQL:', error);
        process.exit(1); 
    }
};

verifyConnection();

module.exports = pool;