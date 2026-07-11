import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

export const yesterdayTime = () => {
  const currentDate = new Date();
  const startOfYesterday = new Date(currentDate);
  startOfYesterday.setDate(currentDate.getDate() - 1);
  startOfYesterday.setHours(0, 0, 0, 0);

  const endOfYesterday = new Date(currentDate);
  endOfYesterday.setDate(currentDate.getDate() - 1);
  endOfYesterday.setHours(23, 59, 59, 999);

  return {
    startOfYesterdayTimestamp: startOfYesterday.getTime(),
    endOfYesterdayTimestamp: endOfYesterday.getTime(),
  };
};

async function testEligibility() {
  const connection = await mysql.createConnection({
    host: process.env.DEV_DB_HOST,
    user: process.env.DEV_DB_USER,
    password: process.env.DEV_DB_PASS,
    database: process.env.DEV_DB_NAME
  });

  const { startOfYesterdayTimestamp, endOfYesterdayTimestamp } = yesterdayTime();
  const now = new Date().getTime();

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
      startOfYesterdayTimestamp,
      now,
      startOfYesterdayTimestamp,
      now,
    ],
  );

  const bettors = userStatsData.filter(u => u.total_bet_amount > 0);
  console.log('Users with bet > 0:', bettors.length);
  if (bettors.length > 0) {
      console.log('Sample bettors:', bettors.slice(0, 5));
  }

  const bankers = userStatsData.filter(u => u.has_bank_account === 1);
  console.log('Users with bank account:', bankers.length);

  await connection.end();
}

testEligibility().catch(console.error);
