import mysql from 'mysql2/promise';

async function checkDb() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: '91club'
  });

  const [users] = await connection.query('SELECT time FROM users LIMIT 1');
  console.log('users time:', users[0]?.time, typeof users[0]?.time);

  const [recharge] = await connection.query('SELECT time FROM recharge LIMIT 1');
  console.log('recharge time:', recharge[0]?.time, typeof recharge[0]?.time);

  const [minutes] = await connection.query('SELECT time FROM minutes_1 LIMIT 1');
  console.log('minutes_1 time:', minutes[0]?.time, typeof minutes[0]?.time);

  await connection.end();
}

checkDb().catch(console.error);
