/**
 * setup-db.js — Run once to create the 'splitwise' database if it doesn't exist.
 * Usage: node setup-db.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function setup() {
  console.log('Connecting to MySQL...');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
  });

  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
  console.log(`✅ Database '${process.env.DB_NAME}' is ready`);
  await conn.end();
}

setup().catch((err) => {
  console.error('❌ Failed:', err.message);
  console.error('\nCheck your DB_USER and DB_PASS in backend/.env');
  process.exit(1);
});
