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
    const [rows] = await connection.query(
      `SELECT 'test' as val WHERE 1 > ? AND 2 < ?`,
      [1, 3, 1, 3] // 4 params, 2 placeholders
    );
    console.log('Query success:', rows);
  } catch (err) {
    console.error('Query error:', err.message);
  }

  await connection.end();
}

checkDb().catch(console.error);
