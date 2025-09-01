// File: lib/db.js
import mysql from 'mysql2/promise';

const db = mysql.createPool({
  host: process.env.DB_HOST || 'database-1.cjy4aqyoaaoc.ap-south-1.rds.amazonaws.com',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306, // Added DB_PORT
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'Hello.1180',
  database: process.env.DB_NAME || 'florestawud',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default db;
