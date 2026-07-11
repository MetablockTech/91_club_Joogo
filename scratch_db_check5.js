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
          u.invite,
          u.code,
          u.time,
          u.id_user,
          COALESCE(r.total_deposit_amount, 0) AS total_deposit_amount,
          COALESCE(r.total_deposit_number, 0) AS total_deposit_number,
          COALESCE(m.total_bets, 0) AS total_bets,
          COALESCE(m.total_bet_amount, 0) AS total_bet_amount,
          IF(ub.phone IS NOT NULL, 1, 0) AS has_bank_account
      FROM
          users u
      LEFT JOIN
          (
              SELECT
                  phone,
                  SUM(CASE WHEN status = 1 THEN COALESCE(money, 0) ELSE 0 END) AS total_deposit_amount,
                  COUNT(CASE WHEN status = 1 THEN phone ELSE NULL END) AS total_deposit_number
              FROM
                  recharge
              WHERE
                  time > ? AND time < ?
              GROUP BY
                  phone
          ) r ON u.phone = r.phone
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
          u.phone
      ORDER BY
          u.time DESC;
      `,
    [
      startOfYesterdayTimestamp,
      now,
      startOfYesterdayTimestamp,
      now,
      startOfYesterdayTimestamp,
      now,
      startOfYesterdayTimestamp,
      now,
    ],
  );

  console.log('Total users fetched:', userStatsData.length);
  const eligibleStats = userStatsData.filter(u => u.total_bet_amount >= 500 && u.has_bank_account);
  console.log('Users with bet >= 500 and bank account:', eligibleStats.length);
  if (eligibleStats.length > 0) {
      console.log('Sample eligible:', eligibleStats[0]);
  }

  await connection.end();
}

testEligibility().catch(console.error);
