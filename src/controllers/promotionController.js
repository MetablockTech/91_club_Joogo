import moment from "moment";
import connection from "../config/connectDB.js";
import {
  REWARD_STATUS_TYPES_MAP,
  REWARD_TYPES_MAP,
} from "../constants/reward_types.js";
import { PaymentStatusMap } from "./paymentController.js";
import {
  getStartOfWeekTimestamp,
  getTodayStartTime,
  monthTime,
  yesterdayTime,
} from "../helpers/games.js";
import userStatsHelper from "../helpers/userStats.js";

function getOrdinal(n) {
  let s = ["th", "st", "nd", "rd"],
    v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const getSubordinateDataByPhone = async (phone, startTime = null, endTime = null) => {
  let rechargeWhere = "WHERE `phone` = ? AND `status` = ?";
  let rechargeParams = [phone, PaymentStatusMap.SUCCESS];

  if (startTime && endTime) {
    rechargeWhere += " AND `time` BETWEEN ? AND ?";
    rechargeParams.push(startTime, endTime);
  }

  const [[row_1]] = await connection.execute(
    `SELECT COUNT(*) AS \`count\` FROM \`recharge\` ${rechargeWhere}`,
    rechargeParams,
  );
  const rechargeQuantity = row_1.count;
  const [[row_2]] = await connection.execute(
    `SELECT SUM(money) AS \`sum\` FROM \`recharge\` ${rechargeWhere}`,
    rechargeParams,
  );
  const rechargeAmount = row_2.sum || 0;

  const [[row_3]] = await connection.execute(
    `SELECT SUM(money) AS \`sum\` FROM \`recharge\` ${rechargeWhere} ORDER BY id LIMIT 1`,
    rechargeParams,
  );
  const firstRechargeAmount = row_3.sum || 0;

  // Use centralized helper for betting statistics
  const stats = await userStatsHelper.getBettingStats(phone, startTime, endTime);

  return {
    rechargeQuantity,
    rechargeAmount,
    firstRechargeAmount,
    bettingAmount: stats.totalAmount,
  };
};


const getSubordinateDataByPhoneFiltered = async (phone, startTime = null, endTime = null) => {
  let rechargeQuery = "SELECT COUNT(*) AS `count`, SUM(money) AS `sum` FROM `recharge` WHERE `phone` = ? AND `status` = ?";
  let params = [phone, PaymentStatusMap.SUCCESS];

  if (startTime && endTime) {
    rechargeQuery += " AND `time` BETWEEN ? AND ?";
    params.push(startTime, endTime);
  }

  const [[row_recharge]] = await connection.execute(rechargeQuery, params);

  return {
    rechargeQuantity: row_recharge.count || 0,
    rechargeAmount: row_recharge.sum || 0,
  };
};

const getUserTurnoverByTime = async (phone, startTime, endTime) => {
  const stats = await userStatsHelper.getBettingStats(phone, startTime, endTime);
  return stats.totalAmount;
};


const getSubordinatesListDataByCode = async (code, startDate, endDate) => {
  let sql = "SELECT `code`, `phone`, `id_user`, `rebet_level`, `time` FROM `users` WHERE `invite` = ?";
  let params = [code];

  if (startDate && endDate) {
    sql += " AND time BETWEEN ? AND ?";
    params.push(startDate, endDate);
  } else if (startDate) {
    sql += " AND time <= ?";
    params.push(startDate);
  }

  let [subordinatesList] = await connection.execute(sql, params);


  let subordinatesCount = subordinatesList.length;
  let subordinatesRechargeQuantity = 0;
  let subordinatesRechargeAmount = 0;
  let subordinatesWithDepositCount = 0;
  let subordinatesFirstDepositAmount = 0;
  let subordinatesWithBettingCount = 0;
  let subordinatesBettingAmount = 0;

  for (let index = 0; index < subordinatesList.length; index++) {
    const subordinate = subordinatesList[index];
    const {
      rechargeQuantity,
      rechargeAmount,
      bettingAmount,
      firstRechargeAmount,
    } = await getSubordinateDataByPhone(subordinate.phone, startDate, endDate);


    subordinatesRechargeQuantity += parseInt(rechargeQuantity) || 0;
    subordinatesRechargeAmount += parseInt(rechargeAmount) || 0;
    subordinatesList[index]["rechargeQuantity"] =
      parseInt(rechargeQuantity) || 0;
    subordinatesList[index]["rechargeAmount"] = parseInt(rechargeAmount) || 0;
    subordinatesList[index]["bettingAmount"] = parseInt(bettingAmount) || 0;
    subordinatesList[index]["firstRechargeAmount"] =
      parseInt(firstRechargeAmount) || 0;
    subordinatesList[index]["rebet_level"] = subordinatesList[index]["rebet_level"] || 0;
    subordinatesList[index]["commission"] =
      subordinatesList[index]["commission"] || 0;
    subordinatesWithBettingCount += parseInt(bettingAmount) > 0 ? 1 : 0;
    subordinatesBettingAmount += parseInt(bettingAmount);
    subordinatesFirstDepositAmount += parseInt(firstRechargeAmount) || 0;

    if (rechargeAmount > 0) {
      subordinatesWithDepositCount++;
    }
  }

  return {
    subordinatesList,
    subordinatesCount,
    subordinatesRechargeQuantity,
    subordinatesRechargeAmount,
    subordinatesWithDepositCount,
    subordinatesWithBettingCount,
    subordinatesBettingAmount,
    subordinatesFirstDepositAmount,
  };
};

const getOneLevelTeamSubordinatesData = async (directSubordinatesList) => {
  let oneLevelTeamSubordinatesCount = 0;
  let oneLevelTeamSubordinatesRechargeQuantity = 0;
  let oneLevelTeamSubordinatesRechargeAmount = 0;
  let oneLevelTeamSubordinatesWithDepositCount = 0;
  let oneLevelTeamSubordinatesList = [];

  for (const directSubordinate of directSubordinatesList) {
    const indirectSubordinatesData = await getSubordinatesListDataByCode(
      directSubordinate.code,
    );
    oneLevelTeamSubordinatesList = [
      ...oneLevelTeamSubordinatesList,
      ...indirectSubordinatesData.subordinatesList,
    ];
    oneLevelTeamSubordinatesCount += indirectSubordinatesData.subordinatesCount;
    oneLevelTeamSubordinatesRechargeQuantity +=
      indirectSubordinatesData.subordinatesRechargeQuantity;
    oneLevelTeamSubordinatesRechargeAmount +=
      indirectSubordinatesData.subordinatesRechargeAmount;
    oneLevelTeamSubordinatesWithDepositCount +=
      indirectSubordinatesData.subordinatesWithDepositCount;
  }

  return {
    oneLevelTeamSubordinatesCount,
    oneLevelTeamSubordinatesRechargeQuantity,
    oneLevelTeamSubordinatesRechargeAmount,
    oneLevelTeamSubordinatesWithDepositCount,
    oneLevelTeamSubordinatesList,
  };
};

// const subordinatesDataAPI = async (req, res) => {
//   try {
//       const authToken = req.cookies.auth;
//       const [userRow] = await connection.execute("SELECT `code`, `invite` FROM `users` WHERE `token` = ? AND `veri` = 1", [authToken]);
//       const user = userRow?.[0];

//       if (!user) {
//          return res.status(401).json({ message: "Unauthorized" });
//       }

//       const directSubordinatesData = await getSubordinatesListDataByCode(user.code);

//       let directSubordinatesCount = directSubordinatesData.subordinatesCount;
//       let directSubordinatesRechargeQuantity = directSubordinatesData.subordinatesRechargeQuantity;
//       let directSubordinatesRechargeAmount = directSubordinatesData.subordinatesRechargeAmount;
//       let directSubordinatesWithDepositCount = directSubordinatesData.subordinatesWithDepositCount;

//       const directSubordinatesList = directSubordinatesData.subordinatesList;

//       let teamSubordinatesCount = directSubordinatesCount;
//       let teamSubordinatesRechargeQuantity = directSubordinatesRechargeQuantity;
//       let teamSubordinatesRechargeAmount = directSubordinatesRechargeAmount;
//       let teamSubordinatesWithDepositCount = directSubordinatesWithDepositCount;

//       let tempSubordinatesList = directSubordinatesList;

//       for (let index = 0; index < 10; index++) {
//          const element = await getOneLevelTeamSubordinatesData(tempSubordinatesList);

//          tempSubordinatesList = element.oneLevelTeamSubordinatesList;
//          teamSubordinatesCount += element.oneLevelTeamSubordinatesCount;
//          teamSubordinatesRechargeQuantity += element.oneLevelTeamSubordinatesRechargeQuantity;
//          teamSubordinatesRechargeAmount += element.oneLevelTeamSubordinatesRechargeAmount;
//          teamSubordinatesWithDepositCount += element.oneLevelTeamSubordinatesWithDepositCount;
//       }

//       return res.status(200).json({
//          data: {
//             directSubordinatesCount,
//             directSubordinatesRechargeQuantity,
//             directSubordinatesRechargeAmount,
//             directSubordinatesWithDepositCount,
//             teamSubordinatesCount,
//             teamSubordinatesRechargeQuantity,
//             teamSubordinatesRechargeAmount,
//             teamSubordinatesWithDepositCount,
//          },
//       });
//   } catch (error) {
//       return res.status(500).json({ message: error.message });
//   }
// };
const createInviteMap = (rows) => {
  const inviteMap = {};
  rows.forEach((user) => {
    if (!inviteMap[user.invite]) {
      inviteMap[user.invite] = [];
    }
    inviteMap[user.invite].push(user);
  });
  return inviteMap;
};

const getLevelUsers = (inviteMap, userCode, currentLevel, maxLevel) => {
  if (currentLevel > maxLevel) return [];

  const levelUsers = inviteMap[userCode] || [];
  if (levelUsers.length === 0) return [];
  return levelUsers.flatMap((user) => [
    { ...user, user_level: currentLevel },
    ...getLevelUsers(inviteMap, user.code, currentLevel + 1, maxLevel),
  ]);
};

const getUserLevels = (rows, userCode, maxLevel = 7) => {
  const inviteMap = createInviteMap(rows);
  const usersByLevels = getLevelUsers(inviteMap, userCode, 1, maxLevel);

  return { usersByLevels, level1Referrals: inviteMap[userCode] };
};

const userStats = async (startTime, endTime, phone = "") => {
  const [rows] = await connection.query(
    `
    SELECT
        u.phone,
        u.invite,
        u.code,
        u.time,
        u.id_user,
        COALESCE(r.total_deposit_amount, 0) AS total_deposit_amount,
        COALESCE(r.total_deposit_number, 0) AS total_deposit_number,
        COALESCE(m.total_bet_amount, 0) AS total_bet_amount,
        COALESCE(m.total_bets, 0) AS total_bets,
        COALESCE(c.total_commission, 0) AS total_commission,
        -- 🔹 Real-time Stats from turn_over table
        COALESCE(to_table.daily_deposit, 0) AS today_deposit,
        COALESCE(to_table.total_deposit, 0) AS lifetime_deposit,
        COALESCE(to_table.daily_turn_over, 0) AS today_turnover,
        COALESCE(to_table.total_turn_over, 0) AS lifetime_turnover

    FROM users u

    -- 🔹 Real-time Stats from turn_over
    LEFT JOIN turn_over to_table ON u.phone = to_table.phone

    -- 🔹 Recharge
    LEFT JOIN (
        SELECT
            phone AS phone,
            SUM(CASE WHEN status = 1 THEN COALESCE(money, 0) ELSE 0 END) AS total_deposit_amount,
            COUNT(CASE WHEN status = 1 THEN phone ELSE NULL END) AS total_deposit_number
        FROM recharge
        WHERE time >= ? AND time <= ?
        GROUP BY phone
    ) r ON u.phone = r.phone

    -- 🔹 All Games Betting
    LEFT JOIN (
        SELECT 
            phone,
            SUM(total_bet_amount) AS total_bet_amount,
            SUM(total_bets) AS total_bets
        FROM (
            SELECT 
                phone AS phone,
                SUM(money + fee) AS total_bet_amount,
                COUNT(*) AS total_bets
            FROM minutes_1
            WHERE time >= ? AND time <= ?
            GROUP BY phone

            UNION ALL

            SELECT 
                phone AS phone,
                SUM(money + fee) AS total_bet_amount,
                COUNT(*) AS total_bets
            FROM trx_wingo_bets
            WHERE time >= ? AND time <= ?
            GROUP BY phone

            UNION ALL

            SELECT 
                phone AS phone,
                SUM(price + fee) AS total_bet_amount,
                COUNT(*) AS total_bets
            FROM result_k3
            WHERE time >= ? AND time <= ?
            GROUP BY phone

            UNION ALL

            SELECT 
                phone AS phone,
                SUM(price + fee) AS total_bet_amount,
                COUNT(*) AS total_bets
            FROM result_5d
            WHERE time >= ? AND time <= ?
            GROUP BY phone

            UNION ALL

            SELECT 
                phone AS phone,
                SUM(betAmount) AS total_bet_amount,
                COUNT(*) AS total_bets
            FROM jilliebethistory
            WHERE today BETWEEN FROM_UNIXTIME(?/1000) AND FROM_UNIXTIME(?/1000)
            GROUP BY phone

            UNION ALL

            SELECT 
                phone AS phone,
                SUM(deposit_amount) AS total_bet_amount,
                COUNT(*) AS total_bets
            FROM spribetransaction
            WHERE today BETWEEN FROM_UNIXTIME(?/1000) AND FROM_UNIXTIME(?/1000)
            GROUP BY phone

            UNION ALL

            SELECT 
                u.phone AS phone,
                SUM(wc.amount) AS total_bet_amount,
                COUNT(*) AS total_bets
            FROM wc_api_transactions wc
            JOIN users u ON wc.user_id = u.id_user
            WHERE wc.type = 'debit' AND wc.is_cancel = 0 AND wc.created_at BETWEEN FROM_UNIXTIME(?/1000) AND FROM_UNIXTIME(?/1000)
            GROUP BY u.phone

        ) combined
        GROUP BY phone
    ) m ON u.phone = m.phone

    -- 🔹 Commission + Roses
    LEFT JOIN (
        SELECT 
            phone,
            SUM(commission_money) + SUM(roses_money) AS total_commission
        FROM (

            SELECT 
                from_user_phone AS phone,
                money AS commission_money,
                0 AS roses_money
            FROM commissions
            WHERE time >= ? AND time <= ?

            UNION ALL

            SELECT 
                phone AS phone,
                0 AS commission_money,
                (COALESCE(f1,0)+COALESCE(f2,0)+COALESCE(f3,0)+COALESCE(f4,0)+COALESCE(f5,0)+COALESCE(f6,0)+COALESCE(f7,0)) AS roses_money
            FROM roses
            WHERE time >= ? AND time <= ?

        ) combined
        GROUP BY phone
    ) c ON u.phone = c.phone

    GROUP BY u.phone
    ORDER BY u.time DESC;
    `,
    [
      startTime, endTime,   // recharge

      startTime, endTime,   // minutes_1
      startTime, endTime,   // trx_wingo
      startTime, endTime,   // result_k3
      startTime, endTime,   // result_5d

      startTime, endTime,   // jili
      startTime, endTime,   // spribe
      startTime, endTime,   // wc

      startTime, endTime,   // commissions
      startTime, endTime    // roses
    ]
  );

  return rows;
};


const userStats2 = async (startTime, endTime, phone = "") => {



  const [rows] = await connection.query(
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
        COALESCE(c.total_commission, 0) AS total_commission
    FROM users u

    LEFT JOIN (
        SELECT
            phone,
            SUM(CASE WHEN status = 1 THEN COALESCE(money, 0) ELSE 0 END) AS total_deposit_amount,
            COUNT(CASE WHEN status = 1 THEN phone END) AS total_deposit_number
        FROM recharge
        WHERE time BETWEEN ? AND ?
        GROUP BY phone
    ) r ON u.phone = r.phone

    LEFT JOIN (
        SELECT 
            phone,
            SUM(total_bet_amount) AS total_bet_amount,
            SUM(total_bets) AS total_bets
        FROM (
            SELECT 
                phone,
                SUM(money + fee) AS total_bet_amount,
                COUNT(*) AS total_bets
            FROM minutes_1
            WHERE time BETWEEN ? AND ?
            GROUP BY phone

            UNION ALL

            SELECT 
                phone,
                SUM(money + fee) AS total_bet_amount,
                COUNT(*) AS total_bets
            FROM trx_wingo_bets
            WHERE time BETWEEN ? AND ?
            GROUP BY phone

            UNION ALL

            SELECT 
                phone,
                SUM(betAmount) AS total_bet_amount,
                COUNT(*) AS total_bets
            FROM jilliebethistory
            WHERE today BETWEEN FROM_UNIXTIME(?/1000) AND FROM_UNIXTIME(?/1000)
            GROUP BY phone

            UNION ALL

            SELECT 
                phone,
                SUM(deposit_amount) AS total_bet_amount,
                COUNT(*) AS total_bets
            FROM spribetransaction
            WHERE today BETWEEN FROM_UNIXTIME(?/1000) AND FROM_UNIXTIME(?/1000)
            GROUP BY phone

            UNION ALL

            SELECT 
                user_id AS phone,
                SUM(amount) AS total_bet_amount,
                COUNT(*) AS total_bets
            FROM wc_api_transactions
            WHERE type = 'debit' AND is_cancel = 0 AND created_at BETWEEN FROM_UNIXTIME(?/1000) AND FROM_UNIXTIME(?/1000)
            GROUP BY user_id
        ) combined
        GROUP BY phone
    ) m ON u.phone = m.phone

    LEFT JOIN (
        SELECT
            from_user_phone AS phone,
            SUM(money) AS total_commission
        FROM commissions
        WHERE time BETWEEN ? AND ?
        GROUP BY from_user_phone
    ) c ON u.phone = c.phone

    WHERE 
        u.time BETWEEN ? AND ?
        AND (? = '' OR u.phone = ?)
        AND (
            r.phone IS NOT NULL 
            OR m.phone IS NOT NULL 
            OR c.phone IS NOT NULL
        )

    ORDER BY u.time DESC;
    `,
    [
      startTime, endTime, // recharge
      startTime, endTime, // minutes_1
      startTime, endTime, // trx_wingo
      startTime, endTime, // jili
      startTime, endTime, // spribe
      startTime, endTime, // wc
      startTime, endTime, // commission
      startTime, endTime, // users filter
      phone, phone        // phone filter
    ]
  );

  return rows;
};

const getCommissionStatsByTime = async (time, phone) => {
  const { startOfYesterdayTimestamp, endOfYesterdayTimestamp } =
    yesterdayTime();


  const [commissionRow] = await connection.execute(
    `
      SELECT
          time,
          SUM(COALESCE(c.money, 0)) AS total_commission,
          SUM(CASE 
              WHEN c.time >= ? 
              THEN COALESCE(c.money, 0)
              ELSE 0 
          END) AS last_week_commission,
          SUM(CASE 
              WHEN c.time > ? AND c.time <= ?
              THEN COALESCE(c.money, 0)
              ELSE 0 
          END) AS yesterday_commission
      FROM
          commissions c
      WHERE
          c.phone = ?
      `,
    [time, startOfYesterdayTimestamp, endOfYesterdayTimestamp, phone],
  );

  return commissionRow?.[0] || {};
};

const getCommissionStatsByTime2 = async (time, phone) => {
  const { startOfYesterdayTimestamp, endOfYesterdayTimestamp } =
    yesterdayTime();
  const [commissionRow] = await connection.execute(
    `
      SELECT
          time,
          SUM(COALESCE(c.money, 0)) AS total_commission,
          SUM(CASE 
              WHEN c.time >= ? 
              THEN COALESCE(c.money, 0)
              ELSE 0 
          END) AS last_week_commission,
          SUM(CASE 
              WHEN c.time > ? AND c.time <= ?
              THEN COALESCE(c.money, 0)
              ELSE 0 
          END) AS yesterday_commission
      FROM
          commissions c
      WHERE
          c.from_user_phone = ?
      `,
    [time, startOfYesterdayTimestamp, endOfYesterdayTimestamp, phone],
  );
  return commissionRow?.[0] || {};
};

const subordinatesDataAPI = async (req, res) => {
  try {
    const authToken = req.cookies.auth;

    const startOfWeek = getStartOfWeekTimestamp();
    const { startOfYesterdayTimestamp, endOfYesterdayTimestamp } =
      yesterdayTime();

    const [userRow] = await connection.execute(
      "SELECT * FROM `users` WHERE `token` = ? AND `veri` = 1",
      [authToken],
    );

    const user = userRow?.[0];

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ============================
    // 🔹 USER STATS + HIERARCHY
    // ============================
    const userStatsData = await userStats(
      startOfYesterdayTimestamp,
      endOfYesterdayTimestamp,
    );

    const { usersByLevels = [], level1Referrals = [] } = getUserLevels(
      userStatsData,
      user.code,
    );

    // 🔹 level map
    const levelMap = {};
    usersByLevels.forEach(u => {
      levelMap[u.phone] = u.user_level;
    });

    // ============================
    // 🔥 COMMISSIONS TABLE
    // ============================
    const [commissionRows] = await connection.query(
      `
      SELECT 
        from_user_phone,
        money as amount,
        time
      FROM commissions
      WHERE phone = ?
      `,
      [user.phone]
    );

    // ============================
    // 🔹 MAP बनाना
    // ============================
    const myCommissionMap = {};

    commissionRows.forEach(row => {
      myCommissionMap[row.from_user_phone] =
        Number(myCommissionMap[row.from_user_phone] || 0) +
        Number(row.amount || 0);
    });

    // ============================
    // 🔥 ROSES TABLE (LEVEL BASED)
    // ============================
    const downlinePhones = usersByLevels.map(u => u.phone);
    let rosesRows = [];

    if (downlinePhones.length > 0) {
      const [rows] = await connection.query(
        `
  SELECT phone, invite, f1, f2, f3, f4, f5, f6, f7, time
  FROM roses
  WHERE phone IN (?)
  `,
        [downlinePhones]
      );
      rosesRows = rows;
    }

    rosesRows.forEach(row => {
      const bettor = row.phone;

      const level = levelMap[bettor];


      if (!level) return;

      let value = 0;

      if (level === 1) value = Number(row.f1) || 0;
      else if (level === 2) value = Number(row.f2) || 0;
      else if (level === 3) value = Number(row.f3) || 0;
      else if (level === 4) value = Number(row.f4) || 0;
      else if (level === 5) value = Number(row.f5) || 0;
      else if (level === 6) value = Number(row.f6) || 0;
      else if (level === 7) value = Number(row.f7) || 0;


      myCommissionMap[bettor] =
        Number(myCommissionMap[bettor] || 0) + value;
    });

    // ============================
    // 🔥 TOTAL CALCULATIONS
    // ============================

    let totalCommissions = 0;
    let totalCommissionsThisWeek = 0;
    let totalCommissionsYesterday = 0;

    // commissions table split
    commissionRows.forEach(row => {
      const amount = Number(row.amount || 0);
      const t = Number(row.time || 0);

      totalCommissions += amount;

      if (t >= startOfWeek) {
        totalCommissionsThisWeek += amount;
      }

      if (t > startOfYesterdayTimestamp && t <= endOfYesterdayTimestamp) {
        totalCommissionsYesterday += amount;
      }
    });

    // roses split
    rosesRows.forEach(row => {
      const bettor = row.phone;
      const level = levelMap[bettor];

      if (!level) return;

      let value = 0;

      if (level === 1) value = Number(row.f1) || 0;
      else if (level === 2) value = Number(row.f2) || 0;
      else if (level === 3) value = Number(row.f3) || 0;
      else if (level === 4) value = Number(row.f4) || 0;
      else if (level === 5) value = Number(row.f5) || 0;
      else if (level === 6) value = Number(row.f6) || 0;
      else if (level === 7) value = Number(row.f7) || 0;

      const t = Number(row.time || 0);

      totalCommissions += value;

      if (t >= startOfWeek) {
        totalCommissionsThisWeek += value;
      }

      if (t > startOfYesterdayTimestamp && t <= endOfYesterdayTimestamp) {
        totalCommissionsYesterday += value;
      }
    });

    // ============================
    // 🔹 बाकी existing stats
    // ============================

    const directSubordinatesCount = level1Referrals.length;

    const noOfRegisteredSubordinates = level1Referrals.filter(
      (user) =>
        user?.time >= startOfYesterdayTimestamp &&
        user?.time <= endOfYesterdayTimestamp,
    ).length;

    const directSubordinatesRechargeQuantity = level1Referrals.reduce(
      (acc, curr) => acc + curr.total_deposit_number,
      0,
    );

    const directSubordinatesRechargeAmount = level1Referrals.reduce(
      (acc, curr) => acc + +curr.total_deposit_amount,
      0,
    );

    const directSubordinatesWithDepositCount = level1Referrals.filter(
      (user) => user.total_deposit_number === 1,
    ).length;

    const teamSubordinatesCount = usersByLevels.length;

    const noOfRegisterAllSubordinates = usersByLevels.filter(
      (user) =>
        user?.time >= startOfYesterdayTimestamp &&
        user?.time <= endOfYesterdayTimestamp,
    ).length;

    const teamSubordinatesRechargeQuantity = usersByLevels.reduce(
      (acc, curr) => acc + curr.total_deposit_number,
      0,
    );

    const teamSubordinatesRechargeAmount = usersByLevels.reduce(
      (acc, curr) => acc + +curr.total_deposit_amount,
      0,
    );

    const teamSubordinatesWithDepositCount = usersByLevels.filter(
      (user) => user.total_deposit_number === 1,
    ).length;

    // ============================
    // 🔥 FINAL RESPONSE
    // ============================

    return res.status(200).json({
      data: {
        directSubordinatesCount,
        noOfRegisteredSubordinates,
        directSubordinatesRechargeQuantity,
        directSubordinatesRechargeAmount,
        directSubordinatesWithDepositCount,
        teamSubordinatesCount,
        noOfRegisterAllSubordinates,
        teamSubordinatesRechargeQuantity,
        teamSubordinatesRechargeAmount,
        teamSubordinatesWithDepositCount,

        totalCommissions: Number(totalCommissions || 0).toFixed(3),
        totalCommissionsThisWeek: Number(totalCommissionsThisWeek || 0).toFixed(3),
        totalCommissionsYesterday: Number(totalCommissionsYesterday || 0).toFixed(3),
      },
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

// const subordinatesDataByTimeAPI = async (req, res) => {
//    try {
//       const authToken = req.cookies.auth;
//       const [userRow] = await connection.execute("SELECT `code`, `invite` FROM `users` WHERE `token` = ? AND `veri` = 1", [authToken]);
//       const user = userRow?.[0];
//       const startDate = req.query.startDate;

//       if (!user) {
//          return res.status(401).json({ message: "Unauthorized" });
//       }

//       const directSubordinatesData = await getSubordinatesListDataByCode(user.code, startDate);

//       let directSubordinatesCount = directSubordinatesData.subordinatesCount;
//       let directSubordinatesRechargeQuantity = directSubordinatesData.subordinatesRechargeQuantity;
//       let directSubordinatesRechargeAmount = directSubordinatesData.subordinatesRechargeAmount;
//       let directSubordinatesWithDepositCount = directSubordinatesData.subordinatesWithDepositCount;
//       let directSubordinatesWithBettingCount = directSubordinatesData.subordinatesWithBettingCount;
//       let directSubordinatesBettingAmount = directSubordinatesData.subordinatesBettingAmount;
//       let directSubordinatesFirstDepositAmount = directSubordinatesData.subordinatesFirstDepositAmount;

//       const directSubordinatesList = directSubordinatesData.subordinatesList;

//       res.status(200).json({
//          status: true,
//          data: {
//             directSubordinatesCount,
//             directSubordinatesRechargeQuantity,
//             directSubordinatesRechargeAmount,
//             directSubordinatesWithDepositCount,
//             directSubordinatesWithBettingCount,
//             directSubordinatesBettingAmount,
//             directSubordinatesFirstDepositAmount,
//             directSubordinatesList,
//          },
//          message: "Successfully fetched subordinates data",
//       });
//    } catch (error) {
//       console.log(error);
//       res.status(500).json({
//          message: "Something went wrong!",
//          error,
//       });
//    }
// };

const subordinatesDataByTimeAPI = async (req, res) => {
  try {
    const authToken = req.cookies.auth;
    const [userRow] = await connection.execute(
      "SELECT `code`, phone, `invite` FROM `users` WHERE `token` = ? AND `veri` = 1",
      [authToken],
    );
    const user = userRow?.[0];
    const startDate = Number(req.query.startDate); // Temporary: +1 day for testing
    // const { startOfYesterdayTimestamp, endOfYesterdayTimestamp } = await yesterdayTime();
    // const endDate = endOfYesterdayTimestamp;
    const ONE_DAY = 24 * 60 * 60 * 1000 - 1;
    const endDate = startDate + ONE_DAY;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const searchFromUid = req.query.id || "";
    const levelFilter = req.query.level;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const userStatsData = await userStats(startDate, endDate, user.phone);

    //harsh 
    const [myCommission] = await connection.query(
      `
  SELECT 
    from_user_phone,
    SUM(money) as my_commission
  FROM commissions
  WHERE phone = ? 
    AND time >= ? 
    AND time <= ?
  GROUP BY from_user_phone
  `,
      [user.phone, startDate, endDate]
    );




    // map bana
    const myCommissionMap = {};
    myCommission.forEach((item) => {
      myCommissionMap[item.from_user_phone] = item.my_commission;
    });


    const { usersByLevels = [], level1Referrals = [] } = getUserLevels(userStatsData, user.code);

    const levelMap = {};
    usersByLevels.forEach(u => {
      levelMap[u.phone] = u.user_level;
    });

    const [rosesData] = await connection.query(
      `
  SELECT phone, invite, f1, f2, f3, f4, f5, f6, f7
  FROM roses
  WHERE time >= ? AND time <= ?
  `,
      [startDate, endDate]
    );

    rosesData.forEach((row) => {
      const bettor = row.phone; // jisne bet lagayi

      const level = usersByLevels.find(u => u.phone === bettor)?.user_level;
      if (!level) return;

      let value = 0;

      if (level === 1) value = Number(row.f1) || 0;
      else if (level === 2) value = Number(row.f2) || 0;
      else if (level === 3) value = Number(row.f3) || 0;
      else if (level === 4) value = Number(row.f4) || 0;
      else if (level === 5) value = Number(row.f5) || 0;
      else if (level === 6) value = Number(row.f6) || 0;
      else if (level === 7) value = Number(row.f7) || 0;


      myCommissionMap[bettor] =
        Number(myCommissionMap[bettor] || 0) + Number(value);
    });

    // Team Subordinates
    const filteredUsers = usersByLevels.filter(
      (user) =>
        user.id_user.includes(searchFromUid) &&
        (levelFilter !== "All" ? user.user_level === +levelFilter : true),
    );

    const usersFilterByPositiveData = filteredUsers.filter(
      (user) =>
        user.total_deposit_number > 0 ||
        user.total_deposit_amount > 0 ||
        user.total_bets > 0,
    );

    const subordinatesRechargeQuantity = filteredUsers.reduce(
      (acc, curr) => acc + curr.total_deposit_number,
      0,
    );
    const subordinatesRechargeAmount = filteredUsers.reduce(
      (acc, curr) => acc + +curr.total_deposit_amount,
      0,
    );

    const subordinatesWithBetting = filteredUsers.filter(
      (user) => user.total_bets > 0,
    );
    const subordinatesWithBettingCount = subordinatesWithBetting.length;
    const subordinatesBettingAmount = subordinatesWithBetting.reduce(
      (acc, curr) => acc + +curr.total_bet_amount,
      0,
    ).toFixed();

    const subordinatesWithFirstDeposit = filteredUsers.filter(
      (user) => user.total_deposit_number === 1,
    );
    const subordinatesWithFirstDepositCount = subordinatesWithFirstDeposit.length;
    const subordinatesWithFirstDepositAmount = subordinatesWithFirstDeposit.reduce(
      (acc, curr) => acc + +curr.total_deposit_amount,
      0,
    );

    const paginatedUsers = usersFilterByPositiveData.slice(offset, offset + limit);

    const updatedTeamUsers = paginatedUsers.map(user => ({
      ...user,
      myCommission: myCommissionMap[user.phone] || 0
    }));

    const totalUsers = usersFilterByPositiveData.length;
    const totalPages = Math.ceil(totalUsers / limit);

    // Direct Subordinates
    const filteredDirectUsers = level1Referrals.filter(
      (user) =>
        user.id_user.includes(searchFromUid) &&
        (levelFilter !== "All" ? user.user_level === +levelFilter : true),
    );

    const directUsersFilterByPositiveData = filteredDirectUsers.filter(
      (user) =>
        user.total_deposit_number > 0 ||
        user.total_deposit_amount > 0 ||
        user.total_bets > 0,
    );
    //     const updatedDirectUsers = directUsersFilterByPositiveData.map(user => ({
    //   ...user,
    //   myCommission: myCommissionMap[user.phone] || 0
    // }));

    const directSubordinatesRechargeQuantity = filteredDirectUsers.reduce(
      (acc, curr) => acc + curr.total_deposit_number,
      0,
    );

    const directSubordinatesRechargeAmount = filteredDirectUsers.reduce(
      (acc, curr) => acc + +curr.total_deposit_amount,
      0,
    );

    const directSubordinatesWithFirstDepositCount = filteredDirectUsers.filter(
      (user) => user.total_deposit_number === 1,
    ).length;

    const directSubordinatesWithFirstDepositAmount = filteredDirectUsers
      .filter((user) => user.total_deposit_number === 1)
      .reduce((acc, curr) => acc + +curr.total_deposit_amount, 0);

    const directSubordinatesWithBettingCount = filteredDirectUsers.filter(
      (user) => user.total_bets > 0,
    ).length;

    const directSubordinatesBettingAmount = filteredDirectUsers
      .reduce((acc, curr) => acc + +curr.total_bet_amount, 0)
      .toFixed();

    // Final Response
    res.json({
      status: true,
      meta: {
        totalPages,
        currentPage: page,
      },
      data: {
        // Team data
        usersByLevels: updatedTeamUsers,
        subordinatesRechargeQuantity,
        subordinatesRechargeAmount,
        subordinatesWithBettingCount,
        subordinatesBettingAmount,
        subordinatesWithFirstDepositCount,
        subordinatesWithFirstDepositAmount,

        // Direct data
        directUsersByLevels: directUsersFilterByPositiveData,
        directSubordinatesRechargeQuantity,
        directSubordinatesRechargeAmount,
        directSubordinatesWithFirstDepositCount,
        directSubordinatesWithFirstDepositAmount,
        directSubordinatesWithBettingCount,
        directSubordinatesBettingAmount,
      },
      message: "Successfully fetched subordinates data",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

const subordinatesAPI = async (req, res) => {
  try {
    const authToken = req.cookies.auth;
    const [userRow] = await connection.execute(
      "SELECT `code`,phone, `invite` FROM `users` WHERE `token` = ? AND `veri` = 1",
      [authToken],
    );
    const type = req.query.type || "today";

    const { startOfYesterdayTimestamp, endOfYesterdayTimestamp } =
      yesterdayTime();
    const { startOfMonthTimestamp, endOfMonthTimestamp } = monthTime();

    const startDate =
      type === "today"
        ? getTodayStartTime()
        : type === "yesterday"
          ? startOfYesterdayTimestamp
          : type === "this month"
            ? startOfMonthTimestamp
            : "";
    const endDate =
      type === "today"
        ? new Date().getTime()
        : type === "yesterday"
          ? endOfYesterdayTimestamp
          : type === "this month"
            ? endOfMonthTimestamp
            : "";

    const user = userRow?.[0];

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userStatsData = await userStats(startDate, endDate, user.phone);
    // console.time('getUserLevels'); // Start the timer
    const { level1Referrals } = getUserLevels(userStatsData, user.code);

    //need to fileter 
    const users = level1Referrals.map(user => {
      const { phone, id_user: uid, time } = user
      const phoneFormat = phone.slice(0, 3) + '****' + phone.slice(7);
      const timeUtc = new Date(parseInt(time)).toLocaleString();
      if (user.time >= startDate && user.time <= endDate)
        return { phone: phoneFormat, uid, time: timeUtc }
      else return null
    }).filter(Boolean)

    res.status(200).json({
      status: true,
      type,
      users,
      message: "Successfully fetched subordinates data",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

const getInvitationBonus = async (req, res) => {
  try {
    const authToken = req.cookies.auth;
    const [userRow] = await connection.execute(
      "SELECT `code`, `invite`, `phone` FROM `users` WHERE `token` = ? AND `veri` = 1",
      [authToken],
    );
    const user = userRow?.[0];

    if (!user) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }

    // Fetch active missions from DB
    const [missions] = await connection.execute(
      "SELECT * FROM `invitation_bonus_config` WHERE `status` = 1 ORDER BY number_invited ASC"
    );

    const [claimedRewardsRow] = await connection.execute(
      "SELECT * FROM `claimed_rewards` WHERE `type` = ? AND `phone` = ?",
      [REWARD_TYPES_MAP.INVITATION_BONUS, user.phone],
    );

    const invitationBonusData = [];

    // Cache lifetime data to avoid multiple heavy queries
    const lifetimeData = await getSubordinatesListDataByCode(user.code);

    const currentTime = new Date().getTime();

    for (const item of missions) {
      let currentCount = 0;
      let currentDepositors = 0;
      const isExpired = item.end_time ? (currentTime > Number(item.end_time)) : false;

      if (item.start_time && item.end_time) {
        // Event specific subordinates
        const eventData = await getSubordinatesListDataByCode(user.code, item.start_time, item.end_time);
        currentCount = eventData.subordinatesCount;
        currentDepositors = eventData.subordinatesList.filter(sub => sub.rechargeAmount >= item.amount_recharge).length;
      } else {
        // Lifetime subordinates
        currentCount = lifetimeData.subordinatesCount;
        currentDepositors = lifetimeData.subordinatesList.filter(sub => sub.rechargeAmount >= item.amount_recharge).length;
      }

      invitationBonusData.push({
        id: item.id,
        isFinished: currentCount >= item.number_invited && currentDepositors >= item.number_deposits,
        isClaimed: claimedRewardsRow.some(cr => cr.reward_id === item.id),
        isExpired: isExpired,
        required: {
          numberOfInvitedMembers: item.number_invited,
          numberOfDeposits: item.number_deposits,
          amountOfRechargePerPerson: item.amount_recharge,
        },
        current: {
          numberOfInvitedMembers: Math.min(currentCount, item.number_invited),
          numberOfDeposits: Math.min(currentDepositors, item.number_deposits),
          amountOfRechargePerPerson: item.amount_recharge,
        },
        bonusAmount: item.bonus_amount,
        start_time: item.start_time,
        end_time: item.end_time
      });
    }

    return res.status(200).json({
      data: invitationBonusData,
      status: true,
      message: "Successfully fetched invitation bonus data",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

const claimInvitationBonus = async (req, res) => {
  try {
    const authToken = req.cookies.auth;
    const invitationBonusId = req.body.id;

    const [userRow] = await connection.execute(
      "SELECT `code`, `invite`, `phone` FROM `users` WHERE `token` = ? AND `veri` = 1",
      [authToken],
    );
    const user = userRow?.[0];

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const [missionRow] = await connection.execute(
      "SELECT * FROM `invitation_bonus_config` WHERE `id` = ? AND `status` = 1",
      [invitationBonusId]
    );
    const item = missionRow?.[0];

    if (!item) {
      return res.status(404).json({ status: false, message: "Mission not found" });
    }

    // Expiry Check
    const currentTime = new Date().getTime();
    if (item.end_time && currentTime > Number(item.end_time)) {
      return res.status(400).json({ status: false, message: "This event has already expired!" });
    }

    // Check if already claimed
    const [checkClaimed] = await connection.execute(
      "SELECT * FROM `claimed_rewards` WHERE `type` = ? AND `phone` = ? AND `reward_id` = ?",
      [REWARD_TYPES_MAP.INVITATION_BONUS, user.phone, invitationBonusId],
    );

    if (checkClaimed.length > 0) {
      return res.status(400).json({ status: false, message: "Bonus already claimed" });
    }

    let currentCount = 0;
    let currentDepositors = 0;

    if (item.start_time && item.end_time) {
      const eventData = await getSubordinatesListDataByCode(user.code, item.start_time, item.end_time);
      currentCount = eventData.subordinatesCount;
      currentDepositors = eventData.subordinatesList.filter(sub => sub.rechargeAmount >= item.amount_recharge).length;
    } else {
      const lifetimeData = await getSubordinatesListDataByCode(user.code);
      currentCount = lifetimeData.subordinatesCount;
      currentDepositors = lifetimeData.subordinatesList.filter(sub => sub.rechargeAmount >= item.amount_recharge).length;
    }

    if (currentCount < item.number_invited || currentDepositors < item.number_deposits) {
      return res.status(400).json({
        status: false,
        message: "You do not meet the requirements to claim this reward!",
      });
    }

    const time = new Date().getTime();

    await connection.execute(
      "UPDATE `users` SET `money` = `money` + ?, `total_money` = `total_money` + ?, `invitation_reward_bonus` = `invitation_reward_bonus` + ? WHERE `phone` = ?",
      [item.bonus_amount, item.bonus_amount, item.bonus_amount, user.phone],
    );

    await connection.execute(
      "INSERT INTO `claimed_rewards` (`reward_id`, `type`, `phone`, `amount`, `status`, `time`) VALUES (?, ?, ?, ?, ?, ?)",
      [
        invitationBonusId,
        REWARD_TYPES_MAP.INVITATION_BONUS,
        user.phone,
        item.bonus_amount,
        REWARD_STATUS_TYPES_MAP.SUCCESS,
        time,
      ],
    );

    return res.status(200).json({
      status: true,
      message: "Successfully claimed invitation bonus",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getInvitedMembers = async (req, res) => {
  try {
    const authToken = req.cookies.auth;
    const [userRow] = await connection.execute(
      "SELECT `code`, `invite`, `phone` FROM `users` WHERE `token` = ? AND `veri` = 1",
      [authToken],
    );
    const user = userRow?.[0];

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let [invitedMembers] = await connection.execute(
      "SELECT `phone`, `time`, `id_user`, `id_user`, `name_user` FROM `users` WHERE `invite` = ?",
      [user.code],
    );

    for (let index = 0; index < invitedMembers.length; index++) {
      const invitedMember = invitedMembers[index];

      const { rechargeQuantity, rechargeAmount } =
        await getSubordinateDataByPhone(invitedMember.phone);

      invitedMembers[index]["rechargeAmount"] = rechargeAmount;
    }

    return res.status(200).json({
      data: invitedMembers.map((invitedMember) => ({
        uid: invitedMember.id_user,
        phone: invitedMember.phone,
        create_time: moment
          .unix(invitedMember.time)
          .format("YYYY-MM-DD HH:mm:ss"),
        amount: invitedMember.rechargeAmount,
        username: invitedMember.name_user,
      })),
      status: true,
      message: "Successfully fetched invited members",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getDailyRechargeReword = async (req, res) => {
  try {
    const authToken = req.cookies.auth;
    const [userRow] = await connection.execute(
      "SELECT `phone` FROM `users` WHERE `token` = ? AND `veri` = 1",
      [authToken],
    );
    const user = userRow?.[0];

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const todayStart = moment().startOf("day").valueOf();
    const todayEnd = moment().endOf("day").valueOf();
    const weekStart = moment().startOf("week").valueOf();
    const weekEnd = moment().endOf("week").valueOf();

    // Get today's recharge
    const [todayRechargeRow] = await connection.execute(
      "SELECT SUM(money) AS `sum` FROM `recharge` WHERE `phone` = ? AND `status` = ? AND `time` >= ?",
      [user.phone, PaymentStatusMap.SUCCESS, todayStart],
    );
    const todayRecharge = parseFloat(todayRechargeRow[0].sum) || 0;

    // Get this week's recharge
    const [weekRechargeRow] = await connection.execute(
      "SELECT SUM(money) AS `sum` FROM `recharge` WHERE `phone` = ? AND `status` = ? AND `time` >= ?",
      [user.phone, PaymentStatusMap.SUCCESS, weekStart],
    );
    const weekRecharge = parseFloat(weekRechargeRow[0].sum) || 0;

    // Get Turnovers
    const todayTurnover = await getUserTurnoverByTime(user.phone, todayStart, todayEnd);
    const weekTurnover = await getUserTurnoverByTime(user.phone, weekStart, weekEnd);

    const [claimedRewardsRow] = await connection.execute(
      "SELECT * FROM `claimed_rewards` WHERE `type` = ? AND `phone` = ? AND `time` >= ?",
      [REWARD_TYPES_MAP.DAILY_RECHARGE_BONUS, user.phone, todayStart],
    );

    const [weekClaimedRow] = await connection.execute(
      "SELECT * FROM `claimed_rewards` WHERE `type` = ? AND `phone` = ? AND `time` >= ?",
      [REWARD_TYPES_MAP.WEEKLY_MISSION_BONUS, user.phone, weekStart],
    );

    const [missions] = await connection.execute("SELECT * FROM missions_config WHERE status = 1");

    const missionList = missions.map((item) => {
      const isDaily = item.category === 'daily';
      const userRecharge = isDaily ? todayRecharge : weekRecharge;
      const userTurnover = isDaily ? todayTurnover : weekTurnover;
      const claimedList = isDaily ? claimedRewardsRow : weekClaimedRow;

      let isFinished = false;
      if (item.target_type === 'deposit') {
        isFinished = userRecharge >= item.required_deposit;
      } else if (item.target_type === 'bet') {
        isFinished = userTurnover >= item.required_bet;
      } else {
        isFinished = userRecharge >= item.required_deposit && userTurnover >= item.required_bet;
      }

      return {
        id: item.id,
        category: item.category,
        target_type: item.target_type,
        rechargeAmount: Math.min(userRecharge, item.required_deposit),
        requiredRechargeAmount: item.required_deposit,
        betAmount: Math.min(userTurnover, item.required_bet),
        requiredBetAmount: item.required_bet,
        bonusAmount: item.bonus_amount,
        description: item.description,
        isFinished: isFinished,
        isClaimed: claimedList.some(
          (claimed) => claimed.reward_id == item.id,
        ),
      };
    });

    return res.status(200).json({
      data: missionList,
      status: true,
      message: "Successfully fetched missions data",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


const claimDailyRechargeReword = async (req, res) => {
  try {
    const authToken = req.cookies.auth;
    const missionId = req.body.id;
    const [userRow] = await connection.execute(
      "SELECT `phone`, `money`, `total_money` FROM `users` WHERE `token` = ? AND `veri` = 1",
      [authToken],
    );
    const user = userRow?.[0];

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const [missionRow] = await connection.execute("SELECT * FROM missions_config WHERE id = ?", [missionId]);
    const mission = missionRow?.[0];

    if (!mission) {
      return res.status(400).json({ status: false, message: "Mission not found!" });
    }

    const isDaily = mission.category === 'daily';
    const startTime = isDaily ? moment().startOf("day").valueOf() : moment().startOf("week").valueOf();
    const endTime = isDaily ? moment().endOf("day").valueOf() : moment().endOf("week").valueOf();
    const rewardType = isDaily ? REWARD_TYPES_MAP.DAILY_RECHARGE_BONUS : REWARD_TYPES_MAP.WEEKLY_MISSION_BONUS;

    const [alreadyClaimed] = await connection.execute(
      "SELECT * FROM `claimed_rewards` WHERE `reward_id` = ? AND `phone` = ? AND `type` = ? AND `time` >= ?",
      [missionId, user.phone, rewardType, startTime],
    );

    if (alreadyClaimed.length > 0) {
      return res.status(400).json({ status: false, message: "Already claimed for this period!" });
    }

    // Check progress
    const [rechargeRow] = await connection.execute(
      "SELECT SUM(money) AS `sum` FROM `recharge` WHERE `phone` = ? AND `status` = ? AND `time` >= ?",
      [user.phone, PaymentStatusMap.SUCCESS, startTime],
    );
    const userRecharge = parseFloat(rechargeRow[0].sum) || 0;
    const userTurnover = await getUserTurnoverByTime(user.phone, startTime, endTime);

    let isFinished = false;
    if (mission.target_type === 'deposit') {
      isFinished = userRecharge >= mission.required_deposit;
    } else if (mission.target_type === 'bet') {
      isFinished = userTurnover >= mission.required_bet;
    } else {
      isFinished = userRecharge >= mission.required_deposit && userTurnover >= mission.required_bet;
    }

    if (!isFinished) {
      return res.status(400).json({ status: false, message: "Mission requirements not met!" });
    }

    const time = new Date().getTime();
    const bonusAmount = parseFloat(mission.bonus_amount);

    await connection.execute(
      "UPDATE `users` SET `money` = `money` + ?, `total_money` = `total_money` + ?, `activity_reward_bonus` = `activity_reward_bonus` + ? WHERE `phone` = ?",
      [bonusAmount, bonusAmount, bonusAmount, user.phone],
    );

    await connection.execute(
      "INSERT INTO `claimed_rewards` (`reward_id`, `type`, `phone`, `amount`, `status`, `time`) VALUES (?, ?, ?, ?, ?, ?)",
      [missionId, rewardType, user.phone, bonusAmount, REWARD_STATUS_TYPES_MAP.SUCCESS, time],
    );

    return res.status(200).json({
      status: true,
      message: `Successfully claimed ${mission.category} mission bonus`,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const dailyRechargeRewordRecord = async (req, res) => {
  try {
    const authToken = req.cookies.auth;
    const [userRow] = await connection.execute(
      "SELECT `phone` FROM `users` WHERE `token` = ? AND `veri` = 1",
      [authToken],
    );
    const user = userRow?.[0];

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const [claimedRewardsRow] = await connection.execute(
      "SELECT cr.*, mc.category, mc.required_deposit, mc.required_bet FROM `claimed_rewards` cr LEFT JOIN missions_config mc ON cr.reward_id = mc.id WHERE (cr.type = ? OR cr.type = ?) AND cr.phone = ? ORDER BY cr.id DESC",
      [REWARD_TYPES_MAP.DAILY_RECHARGE_BONUS, REWARD_TYPES_MAP.WEEKLY_MISSION_BONUS, user.phone],
    );

    const claimedRewardsData = claimedRewardsRow.map((claimedReward) => {
      return {
        id: claimedReward.reward_id,
        category: claimedReward.category || claimedReward.type,
        amount: claimedReward.amount,
        required_deposit: claimedReward.required_deposit || 0,
        required_bet: claimedReward.required_bet || 0,
        status: claimedReward.status,
        time: moment(Number(claimedReward.time)).format("YYYY-MM-DD HH:mm:ss"),
      };
    });
    return res.status(200).json({
      data: claimedRewardsData,
      status: true,
      message: "Successfully fetched mission records",
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Something went wrong" });
  }
};


const firstRechargeBonusList = [
  // {
  //   id: 1,
  //   rechargeAmount: 100000,
  //   bonusAmount: 5888,
  //   agentBonus: 9999,
  // },
  // {
  //   id: 2,
  //   rechargeAmount: 50000,
  //   bonusAmount: 2888,
  //   agentBonus: 6888,
  // },
  {
    id: 3,
    rechargeAmount: 20000,
    bonusAmount: 400,
    agentBonus: 508,
  },
  {
    id: 4,
    rechargeAmount: 10000,
    bonusAmount: 200,
    agentBonus: 408,
  },
  {
    id: 5,
    rechargeAmount: 5000,
    bonusAmount: 100,
    agentBonus: 208,
  },
  {
    id: 6,
    rechargeAmount: 3000,
    bonusAmount: 60,
    agentBonus: 120,
  },
  {
    id: 7,
    rechargeAmount: 1000,
    bonusAmount: 40,
    agentBonus: 48,
  },
  {
    id: 8,
    rechargeAmount: 500,
    bonusAmount: 20,
    agentBonus: 20,
  },
];

const getFirstRechargeRewords = async (req, res) => {
  try {
    const authToken = req.cookies.auth;
    const [userRow] = await connection.execute(
      "SELECT `phone` FROM `users` WHERE `token` = ? AND `veri` = 1",
      [authToken],
    );
    const user = userRow?.[0];

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const [claimedRewardsRow] = await connection.execute(
      "SELECT * FROM `claimed_rewards` WHERE `type` = ? AND `phone` = ?",
      [REWARD_TYPES_MAP.FIRST_RECHARGE_BONUS, user.phone],
    );
    const [rechargeRow] = await connection.execute(
      "SELECT * FROM `recharge` WHERE `phone` = ? AND `status` = ? ORDER BY id DESC LIMIT 1 ",
      [user.phone, PaymentStatusMap.SUCCESS],
    );
    const firstRecharge = rechargeRow?.[0];

    const firstRechargeRewordList = firstRechargeBonusList.map(
      (item, index) => {
        const currentRechargeAmount = firstRecharge?.money || 0;
        return {
          id: item.id,
          currentRechargeAmount: Math.min(
            item.rechargeAmount,
            currentRechargeAmount,
          ),
          requiredRechargeAmount: item.rechargeAmount,
          bonusAmount: item.bonusAmount,
          agentBonus: item.agentBonus,
          isFinished:
            index === 0
              ? currentRechargeAmount >= item.rechargeAmount
              : currentRechargeAmount >= item.rechargeAmount &&
              firstRechargeBonusList[index - 1]?.rechargeAmount >
              currentRechargeAmount,
          isClaimed: claimedRewardsRow.some(
            (claimedReward) => claimedReward.reward_id === item.id,
          ),
        };
      },
    );

    return res.status(200).json({
      data: firstRechargeRewordList,
      isExpired: firstRechargeRewordList.some(
        (item) => item.isFinished && item.isClaimed,
      ),
      status: true,
      message: "Successfully fetched first recharge bonus data",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const claimFirstRechargeReword = async (req, res) => {
  try {
    const authToken = req.cookies.auth;
    const firstRechargeRewordId = req.body.id;
    const [userRow] = await connection.execute(
      "SELECT * FROM `users` WHERE `token` = ? AND `veri` = 1",
      [authToken],
    );
    const user = userRow?.[0];

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const [claimedRewardsRow] = await connection.execute(
      "SELECT * FROM `claimed_rewards` WHERE `type` = ? AND `phone` = ?",
      [REWARD_TYPES_MAP.FIRST_RECHARGE_BONUS, user.phone],
    );
    const [rechargeRow] = await connection.execute(
      "SELECT * FROM `recharge` WHERE `phone` = ? AND `status` = ? ORDER BY id DESC LIMIT 1 ",
      [user.phone, PaymentStatusMap.SUCCESS],
    );
    const firstRecharge = rechargeRow?.[0];

    const firstRechargeRewordList = firstRechargeBonusList.map(
      (item, index) => {
        const currentRechargeAmount = firstRecharge?.money || 0;
        return {
          id: item.id,
          currentRechargeAmount: Math.min(
            item.rechargeAmount,
            currentRechargeAmount,
          ),
          requiredRechargeAmount: item.rechargeAmount,
          bonusAmount: item.bonusAmount,
          agentBonus: item.agentBonus,
          isFinished:
            index === 0
              ? currentRechargeAmount >= item.rechargeAmount
              : currentRechargeAmount >= item.rechargeAmount &&
              firstRechargeBonusList[index - 1]?.rechargeAmount >
              currentRechargeAmount,
          isClaimed: claimedRewardsRow.some(
            (claimedReward) => claimedReward.reward_id === item.id,
          ),
        };
      },
    );

    const claimableBonusData = firstRechargeRewordList.filter(
      (item) => item.isFinished,
    );

    if (claimableBonusData.length === 0) {
      return res.status(400).json({
        status: false,
        message: "You does not meet the requirements to claim this reword!",
      });
    }

    const isExpired = firstRechargeRewordList.some(
      (item) => item.isFinished && item.isClaimed,
    );

    if (isExpired) {
      return res.status(400).json({
        status: false,
        message: "Bonus already claimed",
      });
    }

    const claimedBonusData = claimableBonusData?.find(
      (item) => item.id === firstRechargeRewordId,
    );

    const time = new Date().getTime();

    await connection.execute(
      "UPDATE `users` SET `money` = `money` + ?, `total_money` = `total_money` + ? WHERE `phone` = ?",
      [claimedBonusData.bonusAmount, claimedBonusData.bonusAmount, user.phone],
    );

    await connection.execute(
      "INSERT INTO `claimed_rewards` (`reward_id`, `type`, `phone`, `amount`, `status`, `time`) VALUES (?, ?, ?, ?, ?, ?)",
      [
        claimedBonusData.id,
        REWARD_TYPES_MAP.FIRST_RECHARGE_BONUS,
        user.phone,
        claimedBonusData.bonusAmount,
        REWARD_STATUS_TYPES_MAP.SUCCESS,
        time,
      ],
    );
    return res.status(200).json({
      status: true,
      message: "Successfully claimed first recharge bonus",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAttendanceBonusList = async () => {
  const [rows] = await connection.execute("SELECT * FROM attendance_config ORDER BY day ASC");
  return rows.map(item => ({
    id: item.id,
    day: item.day,
    days: item.day,
    bonusAmount: item.bonus_amount,
    requiredAmount: item.required_recharge
  }));
};

const getAttendanceBonus = async (req, res) => {
  try {
    const authToken = req.cookies.auth;
    const [userRow] = await connection.execute(
      "SELECT `phone` FROM `users` WHERE `token` = ? AND `veri` = 1",
      [authToken],
    );
    const user = userRow?.[0];

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const [claimedRewardsRow] = await connection.execute(
      "SELECT * FROM `claimed_rewards` WHERE `type` = ? AND `phone` = ?",
      [REWARD_TYPES_MAP.ATTENDANCE_BONUS, user.phone],
    );

    let attendanceBonusId = 0;

    if (claimedRewardsRow.length === 0) {
      attendanceBonusId = 0;
    } else {
      const lastClaimedReword =
        claimedRewardsRow?.[claimedRewardsRow.length - 1];
      const lastClaimedRewordTime = lastClaimedReword?.time || 0;

      const lastClaimedRewordDate = moment
        .unix(lastClaimedRewordTime)
        .startOf("day");
      const today = moment().startOf("day");

      if (today.diff(lastClaimedRewordDate, "days") < 1) {
        attendanceBonusId = lastClaimedReword.reward_id;
      } else if (today.diff(lastClaimedRewordDate, "days") >= 2) {
        attendanceBonusId = 0;
      } else {
        attendanceBonusId = lastClaimedReword.reward_id;
      }
    }

    const AttendanceBonusList = await getAttendanceBonusList();
    const claimedBonusData = AttendanceBonusList.find(
      (item) => item.id === attendanceBonusId,
    );

    return res.status(200).json({
      status: true,
      data: {
        id: claimedBonusData?.id || 0,
        days: claimedBonusData?.days || 0,
        bonusAmount: claimedBonusData?.bonusAmount || 0,
      },
      message: "Successfully fetched attendance bonus data",
    });
  } catch (error) {
    return res.status(500).json({
      status: true,
      message: error.message,
    });
  }
};

const claimAttendanceBonus = async (req, res) => {
  try {
    const authToken = req.cookies.auth;
    const [userRow] = await connection.execute(
      "SELECT `phone` FROM `users` WHERE `token` = ? AND `veri` = 1",
      [authToken],
    );
    const user = userRow?.[0];

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const [claimedRewardsRow] = await connection.execute(
      "SELECT * FROM `claimed_rewards` WHERE `type` = ? AND `phone` = ?",
      [REWARD_TYPES_MAP.ATTENDANCE_BONUS, user.phone],
    );

    if (claimedRewardsRow.map((item) => item.reward_id).includes(7)) {
      return res.status(400).json({
        status: false,
        message: "You have already claimed the attendance bonus for 7 days",
      });
    }

    let attendanceBonusId = 0;

    if (claimedRewardsRow.length === 0) {
      attendanceBonusId = 1;
    } else {
      const lastClaimedReword =
        claimedRewardsRow?.[claimedRewardsRow.length - 1];
      const lastClaimedRewordTime = lastClaimedReword?.time || 0;

      const lastClaimedRewordDate = moment
        .unix(lastClaimedRewordTime)
        .startOf("day");
      const today = moment().startOf("day");

      if (today.diff(lastClaimedRewordDate, "days") < 1) {
        return res.status(400).json({
          status: false,
          message: "You have already claimed the attendance bonus today",
        });
      } else if (today.diff(lastClaimedRewordDate, "days") >= 2) {
        attendanceBonusId = 1;
      } else {
        attendanceBonusId = lastClaimedReword.reward_id + 1;
      }
    }

    const AttendanceBonusList = await getAttendanceBonusList();
    const claimedBonusData = AttendanceBonusList.find(
      (item) => item.id === attendanceBonusId,
    );

    const todayStart = moment().startOf("day").valueOf();
    const [rechargeTotal] = await connection.query(
      "SELECT SUM(money) AS total_recharge FROM recharge WHERE status = 1 AND phone = ? AND time >= ?",
      [user.phone, todayStart],
    );
    const totalRecharge = +rechargeTotal[0].total_recharge || 0;

    const check = totalRecharge >= claimedBonusData.requiredAmount;

    if (!check)
      return res.status(400).json({
        status: false,
        message: "Total Recharge amount doesn't met the Required Amount !",
      });

    const time = new Date().getTime();

    await connection.execute(
      "UPDATE `users` SET `money` = `money` + ?, `total_money` = `total_money` + ?, `attendance_bonus` = `attendance_bonus` + ? WHERE `phone` = ?",
      [claimedBonusData.bonusAmount, claimedBonusData.bonusAmount, claimedBonusData.bonusAmount, user.phone],
    );

    await connection.execute(
      "INSERT INTO `claimed_rewards` (`reward_id`, `type`, `phone`, `amount`, `status`, `time`) VALUES (?, ?, ?, ?, ?, ?)",
      [
        claimedBonusData.id,
        REWARD_TYPES_MAP.ATTENDANCE_BONUS,
        user.phone,
        claimedBonusData.bonusAmount,
        REWARD_STATUS_TYPES_MAP.SUCCESS,
        time,
      ],
    );

    return res.status(200).json({
      status: true,
      message: `Successfully claimed attendance bonus for ${getOrdinal(claimedBonusData.days)} day`,
    });
  } catch (error) {
    return res.status(500).json({
      status: true,
      message: error.message,
    });
  }
};

const getAttendanceBonusRecord = async (req, res) => {
  try {
    const authToken = req.cookies.auth;
    const [userRow] = await connection.execute(
      "SELECT `phone` FROM `users` WHERE `token` = ? AND `veri` = 1",
      [authToken],
    );
    const user = userRow?.[0];

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const [claimedRewardsRow] = await connection.execute(
      "SELECT * FROM `claimed_rewards` WHERE `type` = ? AND `phone` = ?",
      [REWARD_TYPES_MAP.ATTENDANCE_BONUS, user.phone],
    );

    const AttendanceBonusList = await getAttendanceBonusList();
    const claimedRewardsData = claimedRewardsRow.map((claimedReward) => {
      const currentAttendanceBonus = AttendanceBonusList.find(
        (item) => item?.id === claimedReward?.reward_id,
      );
      return {
        id: claimedReward.reward_id,
        days: currentAttendanceBonus?.days || 0,
        amount: claimedReward.amount,
        status: claimedReward.status,
        time: moment.unix(claimedReward.time).format("YYYY-MM-DD HH:mm:ss"),
      };
    });

    return res.status(200).json({
      data: claimedRewardsData,
      status: true,
      message: "Successfully fetched attendance bonus record",
    });
  } catch (error) {
    return res.status(500).json({
      status: true,
      message: error.message,
    });
  }
};


// const GetCommissionDetails = async (req,res) =>{
//   try {
//     const authToken = req.cookies.auth;
//     const [userRow] = await connection.execute(
//       "SELECT `code`,phone, `invite` FROM `users` WHERE `token` = ? AND `veri` = 1",
//       [authToken],
//     );
//     const user = userRow?.[0];
//     const startDate = req.query.startDate;
//     const endDate = new Date().getTime();


//     if (!user) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }



//     const userStatsData = await userStats(startDate, endDate, user.phone);
//     // console.time('getUserLevels'); // Start the timer
//     const { usersByLevels = [] } = getUserLevels(userStatsData, user.code);
//     // console.timeEnd('getUserLevels'); //
//     // const filteredUsers = usersByLevels.filter(user => user.time >= startDate && user.id_user.includes(searchFromUid) && (levelFilter !== "All" ? user.user_level === +levelFilter : true));
//     const filteredUsers = usersByLevels;


//     const commissions = await getCommissionStatsByTime(startDate, user.phone);

//     const subordinatesWithTotalCommissions = commissions?.total_commission || 0;


//     /**********************for bets ********************************** */
//     const subordinatesWithBetting = filteredUsers.filter(
//       (user) => user.total_bets > 0,
//     );
//     const subordinatesWithBettingCount = subordinatesWithBetting.length;
//     const subordinatesBettingAmount = subordinatesWithBetting
//       .reduce((acc, curr) => acc + +curr.total_bet_amount, 0)
//       .toFixed();


//     res.json({
//       status: true,
//       data: {
//         subordinatesWithBettingCount,
//         subordinatesBettingAmount,
//         subordinatesWithTotalCommissions,
//       },
//       message: "Successfully fetched subordinates data",
//     });
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// }

const GetCommissionDetails = async (req, res) => {
  try {
    // Retrieve the authentication token from cookies
    const authToken = req.cookies.auth;

    // Fetch user details from the database
    const [userRow] = await connection.execute(
      "SELECT `code`, `phone`, `invite` FROM `users` WHERE `token` = ? AND `veri` = 1",
      [authToken]
    );

    const user = userRow?.[0];

    // If no user found, return unauthorized
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { phone, code } = user;
    // = req.query.startDate ? Number(req.query.startDate) : 0; // Default to 0 if no startDate provided
    // const endDate = new Date().getTime(); // Use current time

    // const { startOfYesterdayTimestamp, endOfYesterdayTimestamp } = await yesterdayTime(); 
    //  const startDate = startOfYesterdayTimestamp;
    // const endDate = endOfYesterdayTimestamp;


    const startDate = Number(req.query.startDate);
    const ONE_DAY = 24 * 60 * 60 * 1000 - 1;
    const endDate = startDate + ONE_DAY;

    // Fetch user stats data
    const userStatsData = await userStats(startDate, endDate, phone);

    // Retrieve user levels based on user stats data
    const { usersByLevels = [] } = getUserLevels(userStatsData, code);
    const filteredUsers = usersByLevels; // Apply any additional filters if needed here

    /********************** Commission Calculation ***********************/
    let totalCommissions = 0; // Variable to hold the total commission sum

    // Fetch commissions for the selected date range
    const [commissionRows] = await connection.query(
      `SELECT SUM(money) as amount FROM commissions WHERE phone = ? AND time >= ? AND time <= ?`,
      [user.phone, startDate, endDate]
    );
    totalCommissions = commissionRows[0]?.amount || 0;


    /********************** For Bets ********************************** */
    const subordinatesWithBetting = filteredUsers.filter(user => user.total_bets > 0);

    // Count subordinates with bets and calculate total bet amounts
    const subordinatesWithBettingCount = subordinatesWithBetting.length;
    const subordinatesBettingAmount = subordinatesWithBetting
      .reduce((acc, curr) => acc + Number(curr.total_bet_amount), 0)
      .toFixed(2); // Fixed to 2 decimal places for consistency

    // Send success response with calculated data
    return res.json({
      status: true,
      data: {
        subordinatesWithBettingCount,
        subordinatesBettingAmount,
        subordinatesWithTotalCommissions: parseFloat(parseFloat(totalCommissions).toFixed(2)),

      },
      message: "Successfully fetched subordinates data",
    });
  } catch (error) {
    console.error('Error fetching commission details:', error); // Log error to server console
    return res.status(500).json({ message: error.message || "An error occurred while fetching commission details." });
  }
};


const promotionController = {
  subordinatesDataAPI,
  subordinatesAPI,
  getInvitationBonus,
  claimInvitationBonus,
  getInvitedMembers,
  getDailyRechargeReword,
  claimDailyRechargeReword,
  dailyRechargeRewordRecord,
  getFirstRechargeRewords,
  claimFirstRechargeReword,
  claimAttendanceBonus,
  getAttendanceBonusRecord,
  getAttendanceBonus,
  subordinatesDataByTimeAPI,
  GetCommissionDetails,
};

export default promotionController;
