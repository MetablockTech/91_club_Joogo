import connection from "../config/connectDB.js";
import userStatsHelper from "../helpers/userStats.js";
import fs from "fs";

const gameStatisticsPage = async (req, res) => {
  return res.render("member/game_statistics.ejs");
};

const gameStatistics = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    let { type, gameType, page = 1, limit = 10, startDate: customStart, endDate: customEnd } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const [user] = await connection.query(
      "SELECT * FROM users WHERE `token` = ? ",
      [auth],
    );
    if (!user.length) {
      return res.status(401).send({
        status: 401,
        message: "Unauthorized",
      });
    }
    const userInfo = user[0];

    let startDate = 0;
    let endDate = new Date().setHours(23, 59, 59, 999);

    if (type === "custom" && customStart && customEnd) {
      startDate = parseInt(customStart);
      endDate = parseInt(customEnd);
    } else if (customStart && customEnd) {
      startDate = parseInt(customStart);
      endDate = parseInt(customEnd);
    } else {
      if (type === "today") {
        // Today range: from 00:00:00 of the current day (server time)
        startDate = new Date().setHours(0, 0, 0, 0);
        endDate = new Date().setHours(23, 59, 59, 999);
        
        // If it's early in the morning, maybe show from yesterday too? 
        // No, let's keep it strict but maybe the user can use the "Yesterday" tab.
      } else if (type === "yesterday") {
        startDate = new Date(
          new Date().setDate(new Date().getDate() - 1),
        ).setHours(0, 0, 0, 0);
        endDate = new Date(new Date().setDate(new Date().getDate() - 1)).setHours(
          23,
          59,
          59,
          999,
        );
      } else if (type === "week") {
        startDate = new Date(
          new Date().setDate(new Date().getDate() - 7),
        ).setHours(0, 0, 0, 0);
        endDate = new Date().setHours(23, 59, 59, 999);
      } else if (type === "month") {
        startDate = new Date(
          new Date().setDate(new Date().getDate() - 30),
        ).setHours(0, 0, 0, 0);
        endDate = new Date().setHours(23, 59, 59, 999);
      } else if (type === "all") {
        startDate = 0;
        endDate = new Date().setHours(23, 59, 59, 999);
      }
    }

    // Use centralized helper for all betting stats
    const stats = await userStatsHelper.getBettingStats(userInfo.phone, startDate, endDate);
    const totalBetAmount = stats.totalAmount;
    const totalBetCount = stats.totalCount;

    // Fetch individual game stats for display cards
    const [wingoStats] = await connection.query("SELECT SUM(money+fee) as bet, SUM(get) as win, COUNT(*) as count FROM minutes_1 WHERE phone = ? AND time BETWEEN ? AND ?", [userInfo.phone, startDate, endDate]);
    const [k3Stats] = await connection.query("SELECT SUM(money) as bet, SUM(get) as win, COUNT(*) as count FROM result_k3 WHERE phone = ? AND time BETWEEN ? AND ?", [userInfo.phone, startDate, endDate]);
    const [g5dStats] = await connection.query("SELECT SUM(money) as bet, SUM(get) as win, COUNT(*) as count FROM result_5d WHERE phone = ? AND time BETWEEN ? AND ?", [userInfo.phone, startDate, endDate]);
    const [trxStats] = await connection.query("SELECT SUM(money+fee) as bet, SUM(get) as win, COUNT(*) as count FROM trx_wingo_bets WHERE phone = ? AND time BETWEEN ? AND ?", [userInfo.phone, startDate, endDate]);
    const [jilliStats] = await connection.query("SELECT SUM(betAmount) as bet, SUM(winAmount) as win, COUNT(*) as count FROM jilliebethistory WHERE phone = ? AND today BETWEEN FROM_UNIXTIME(?/1000) AND FROM_UNIXTIME(?/1000)", [userInfo.phone, startDate, endDate]);
    const [spribeStats] = await connection.query("SELECT SUM(deposit_amount) as bet, SUM(withdrawal_amount) as win, COUNT(*) as count FROM spribetransaction WHERE phone = ? AND today BETWEEN FROM_UNIXTIME(?/1000) AND FROM_UNIXTIME(?/1000)", [userInfo.phone, startDate, endDate]);

    const wingoBet = parseFloat(wingoStats[0].bet || 0), wingoWin = parseFloat(wingoStats[0].win || 0), wingoCount = parseInt(wingoStats[0].count || 0);
    const k3Bet = parseFloat(k3Stats[0].bet || 0), k3Win = parseFloat(k3Stats[0].win || 0), k3Count = parseInt(k3Stats[0].count || 0);
    const g5dBet = parseFloat(g5dStats[0].bet || 0), g5dWin = parseFloat(g5dStats[0].win || 0), g5dCount = parseInt(g5dStats[0].count || 0);
    const trxBet = parseFloat(trxStats[0].bet || 0), trxWin = parseFloat(trxStats[0].win || 0), trxCount = parseInt(trxStats[0].count || 0);
    const jilliBet = parseFloat(jilliStats[0].bet || 0), jilliWin = parseFloat(jilliStats[0].win || 0), jilliCount = parseInt(jilliStats[0].count || 0);
    const spribeBet = parseFloat(spribeStats[0].bet || 0), spribeWin = parseFloat(spribeStats[0].win || 0), spribeCount = parseInt(spribeStats[0].count || 0);

    const totalWinAmount = parseFloat((wingoWin + k3Win + g5dWin + trxWin + jilliWin + spribeWin).toFixed(2));

    // Detailed records for the selected gameType or all
    let records = [];
    let totalItems = 0;
    const offset = (page - 1) * limit;

    const gameTables = {
      wingo: 'minutes_1',
      k3: 'result_k3',
      '5d': 'result_5d',
      trx: 'trx_wingo_bets'
    };

    if (gameType && gameTables[gameType]) {
      const table = gameTables[gameType];
      const isFeeGame = gameType === 'wingo' || gameType === 'trx';
      const [rows] = await connection.query(
        `SELECT CONVERT(id_product USING utf8mb4) COLLATE utf8mb4_unicode_ci as id, ${isFeeGame ? '(money + fee)' : 'money'} as money, get, CONVERT(time USING utf8mb4) COLLATE utf8mb4_unicode_ci as time, fee, ? as game_type FROM ${table} WHERE phone = ? AND time BETWEEN ? AND ? ORDER BY time DESC LIMIT ? OFFSET ?`,
        [gameType, userInfo.phone, startDate, endDate, limit, offset]
      );
      records = rows;

      const [countRow] = await connection.query(
        `SELECT COUNT(*) as total FROM ${table} WHERE phone = ? AND time BETWEEN ? AND ?`,
        [userInfo.phone, startDate, endDate]
      );
      totalItems = countRow[0].total;
    } else {
      // Default to showing all bets combined
      const [rows] = await connection.query(
        `SELECT * FROM (
          SELECT CONVERT(id_product USING utf8mb4) COLLATE utf8mb4_unicode_ci as id, (money + fee) as money, get, CONVERT(time USING utf8mb4) COLLATE utf8mb4_unicode_ci as time, fee, CAST('Wingo' AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_unicode_ci as game_type FROM minutes_1 WHERE phone = ? AND time BETWEEN ? AND ?
          UNION ALL
          SELECT CONVERT(id_product USING utf8mb4) COLLATE utf8mb4_unicode_ci as id, money, get, CONVERT(time USING utf8mb4) COLLATE utf8mb4_unicode_ci as time, fee, CAST('K3' AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_unicode_ci as game_type FROM result_k3 WHERE phone = ? AND time BETWEEN ? AND ?
          UNION ALL
          SELECT CONVERT(id_product USING utf8mb4) COLLATE utf8mb4_unicode_ci as id, money, get, CONVERT(time USING utf8mb4) COLLATE utf8mb4_unicode_ci as time, fee, CAST('5D' AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_unicode_ci as game_type FROM result_5d WHERE phone = ? AND time BETWEEN ? AND ?
          UNION ALL
          SELECT CONVERT(id_product USING utf8mb4) COLLATE utf8mb4_unicode_ci as id, (money + fee) as money, get, CONVERT(time USING utf8mb4) COLLATE utf8mb4_unicode_ci as time, fee, CAST('TRX' AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_unicode_ci as game_type FROM trx_wingo_bets WHERE phone = ? AND time BETWEEN ? AND ?
        ) as combined ORDER BY time DESC LIMIT ? OFFSET ?`,
        [
          userInfo.phone, startDate, endDate,
          userInfo.phone, startDate, endDate,
          userInfo.phone, startDate, endDate,
          userInfo.phone, startDate, endDate,
          limit, offset
        ]
      );
      records = rows;

      const [countRow] = await connection.query(
        `SELECT (
          (SELECT COUNT(*) FROM minutes_1 WHERE phone = ? AND time BETWEEN ? AND ?) +
          (SELECT COUNT(*) FROM result_k3 WHERE phone = ? AND time BETWEEN ? AND ?) +
          (SELECT COUNT(*) FROM result_5d WHERE phone = ? AND time BETWEEN ? AND ?) +
          (SELECT COUNT(*) FROM trx_wingo_bets WHERE phone = ? AND time BETWEEN ? AND ?)
        ) as total`,
        [
          userInfo.phone, startDate, endDate,
          userInfo.phone, startDate, endDate,
          userInfo.phone, startDate, endDate,
          userInfo.phone, startDate, endDate
        ]
      );
      totalItems = countRow[0].total;
    }

    records = records.map(item => ({
      ...item,
      status: item.get > 0 ? 'win' : 'loss'
    }));

    return res.status(200).send({
      status: 200,
      totalBetAmount: parseFloat(totalBetAmount.toFixed(2)),
      totalWinAmount: parseFloat(totalWinAmount.toFixed(2)),
      totalBetCount: totalBetCount,
      list: [
        {
          title: "Wingo",
          totalBetAmount: parseFloat(wingoBet.toFixed(2)),
          numberOfBets: wingoCount,
          totalWinAmount: parseFloat(wingoWin.toFixed(2)),
        },
        {
          title: "K3",
          totalBetAmount: parseFloat(k3Bet.toFixed(2)),
          numberOfBets: k3Count,
          totalWinAmount: parseFloat(k3Win.toFixed(2)),
        },
        {
          title: "5D",
          totalBetAmount: parseFloat(g5dBet.toFixed(2)),
          numberOfBets: g5dCount,
          totalWinAmount: parseFloat(g5dWin.toFixed(2)),
        },
        {
          title: "TRX",
          totalBetAmount: parseFloat(trxBet.toFixed(2)),
          numberOfBets: trxCount,
          totalWinAmount: parseFloat(trxWin.toFixed(2)),
        }
      ],
      data: records,
      page: page,
      limit: limit,
      totalItems: totalItems,
      totalPages: Math.ceil(totalItems / limit),
      message: "Game statistics fetched successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: 500,
      message: "Something went wrong! Please try again later.",
    });
  }
};

const autoCleanOldGames = async () => {
  try {
    const TwoDayAgoUnixMoment = moment().subtract(2, "days").valueOf();

    await connection.execute(
      `DELETE FROM wingo WHERE time < '${TwoDayAgoUnixMoment}'`,
    );
    await connection.execute(
      `DELETE FROM 5d WHERE time < '${TwoDayAgoUnixMoment}'`,
    );
    await connection.execute(
      `DELETE FROM k3 WHERE time < '${TwoDayAgoUnixMoment}'`,
    );
    await connection.execute(
      `DELETE FROM trx_wingo_game WHERE time < '${TwoDayAgoUnixMoment}'`,
    );
  } catch (error) {
    console.log(error);
    console.log("Failed to delete old games table!");
  }
};

const gameController = {
  gameStatistics,
  gameStatisticsPage,
  autoCleanOldGames,
};

export default gameController;
