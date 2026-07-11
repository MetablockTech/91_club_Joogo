import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function checkDb() {
  const connection = await mysql.createConnection({
    host: process.env.DEV_DB_HOST,
    user: process.env.DEV_DB_USER,
    password: process.env.DEV_DB_PASS,
    database: process.env.DEV_DB_NAME
  });

  try {
    const [columns] = await connection.query(`SHOW COLUMNS FROM users LIKE 'total_distributed_salary'`);
    console.log('Columns:', columns);
  } catch (err) {
    console.error('Query error:', err.message);
  }

  await connection.end();
}

checkDb().catch(console.error);
