import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function testEligibility() {
  const connection = await mysql.createConnection({
    host: process.env.DEV_DB_HOST,
    user: process.env.DEV_DB_USER,
    password: process.env.DEV_DB_PASS,
    database: process.env.DEV_DB_NAME
  });

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
                  GROUP BY phone
                  UNION ALL
                  SELECT 
                      phone,
                      SUM(money + fee) AS total_bet_amount,
                      COUNT(*) AS total_bets
                  FROM trx_wingo_bets
                  GROUP BY phone
              ) AS combined
              GROUP BY phone
          ) m ON u.phone = m.phone
      LEFT JOIN
          user_bank ub ON u.phone = ub.phone
      GROUP BY
          u.phone;
      `
  );

  const eligibleStats = userStatsData.filter(u => u.total_bet_amount >= 500 && u.has_bank_account);
  console.log('Overall users with bet >= 500 and bank account:', eligibleStats.length);
  if (eligibleStats.length > 0) {
      console.log('Sample eligible:', eligibleStats[0]);
  }

  const bettors = userStatsData.filter(u => u.total_bet_amount >= 500);
  console.log('Overall users with bet >= 500:', bettors.length);

  await connection.end();
}

testEligibility().catch(console.error);
