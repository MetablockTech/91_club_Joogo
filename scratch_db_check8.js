import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function testEligibility8th() {
  const connection = await mysql.createConnection({
    host: process.env.DEV_DB_HOST,
    user: process.env.DEV_DB_USER,
    password: process.env.DEV_DB_PASS,
    database: process.env.DEV_DB_NAME
  });

  const start8th = 1783449000000; // 2026-07-07T18:30:00.000Z
  const end8th = 1783535399999;   // 2026-07-08T18:29:59.999Z

  const [userStatsData] = await connection.query(
    `
      SELECT
          u.phone,
          COALESCE(m.total_bet_amount, 0) AS total_bet_amount,
          IF(ub.phone IS NOT NULL, 1, 0) AS has_bank_account
      FROM
          users u
      LEFT JOIN
          (
              SELECT 
                  phone,
                  COALESCE(SUM(total_bet_amount), 0) AS total_bet_amount,
                  COALESCE(SUM(total_bets), 0) AS total_bets
              FROM (
                  SELECT 
                      phone,
                      SUM(money + fee) AS total_bet_amount,
                      COUNT(*) AS total_bets
                  FROM minutes_1
                  WHERE time > ? AND time < ?
                  GROUP BY phone
                  UNION ALL
                  SELECT 
                      phone,
                      SUM(money + fee) AS total_bet_amount,
                      COUNT(*) AS total_bets
                  FROM trx_wingo_bets
                  WHERE time > ? AND time < ?
                  GROUP BY phone
              ) AS combined
              GROUP BY phone
          ) m ON u.phone = m.phone
      LEFT JOIN
          user_bank ub ON u.phone = ub.phone
      GROUP BY
          u.phone;
      `,
    [
      start8th,
      end8th,
      start8th,
      end8th,
    ],
  );

  const eligibleStats = userStatsData.filter(u => u.total_bet_amount >= 500 && u.has_bank_account);
  console.log('Users with bet >= 500 and bank account on 8th:', eligibleStats.length);
  if (eligibleStats.length > 0) {
      console.log('Sample eligible:', eligibleStats[0]);
  }
  const betStats = userStatsData.filter(u => u.total_bet_amount > 0);
  console.log('Users who placed any bet on 8th:', betStats.length);
  const eligibleBettors = userStatsData.filter(u => u.total_bet_amount >= 500);
  console.log('Users with bet >= 500 on 8th:', eligibleBettors.length);

  await connection.end();
}

testEligibility8th().catch(console.error);
