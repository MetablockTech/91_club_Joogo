import connection from "../config/connectDB.js";
import md5 from "md5";
import {
  REWARD_STATUS_TYPES_MAP,
  REWARD_TYPES_MAP,
} from "../constants/reward_types.js";
import {
  generateClaimRewardID,
  getBonuses,
  yesterdayTime,
} from "../helpers/games.js";
import e from "express";
import moment from "moment";
import bcrypt from "bcrypt";
import commissionController from "./commissionController.js";
import userStatsHelper from "../helpers/userStats.js";
import userStatsCollaborator from "../helpers/userStatsCollaborator.js";

let timeNow = new Date().getTime();
const saltRounds = parseInt(process.env.SALT_ROUNDS || 5);

const getBonusPercentages = async () => {
  const [rows] = await connection.query("SELECT recharge_bonus as firstDeposit, recharge_bonus_2 as dailyDeposit, referral_bonus as referral FROM admin_ac LIMIT 1");
  const data = rows[0] || {};
  return {
    firstDeposit: Number(data.firstDeposit) || 0,
    dailyDeposit: Number(data.dailyDeposit) || 0,
    referral: Number(data.referral) || 0
  };
};


const adminPage = async (req, res) => {
  return res.render("manage/index.ejs");
};

const adminPage3 = async (req, res) => {
  return res.render("manage/a-index-bet/index3.ejs");
};

const adminPage5 = async (req, res) => {
  return res.render("manage/a-index-bet/index5.ejs");
};

const Dashboard = async (req, res) => {
  return res.render("manage/dashboard.ejs");
};
const Dashboard2 = async (req, res) => {
  return res.render("manage/dashboard2.ejs");
};

const adminPage10 = async (req, res) => {
  return res.render("manage/a-index-bet/index10.ejs");
};

const adminPage5d = async (req, res) => {
  return res.render("manage/5d.ejs");
};

const adminPageK3 = async (req, res) => {
  return res.render("manage/k3.ejs");
};

const adminPageBetHistory = async (req, res) => {
  return res.render("manage/betHistory.ejs");
};

const adminPageApiGamesHistory = async (req, res) => {
  return res.render("manage/apiGamesHistory.ejs");
};

const adminPageTrxHistory = async (req, res) => {
  return res.render("manage/trxHistory.ejs");
};

const ctvProfilePage = async (req, res) => {
  var phone = req.params.phone;
  return res.render("manage/profileCTV.ejs", { phone });
};

const giftPage = async (req, res) => {
  return res.render("manage/giftPage.ejs");
};

const membersPage = async (req, res) => {
  return res.render("manage/members.ejs");
};

const ctvPage = async (req, res) => {
  return res.render("manage/ctv.ejs");
};

const infoMember = async (req, res) => {
  let phone = req.params.id;
  return res.render("manage/profileMember.ejs", { phone });
};

const getMemberTree = async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ message: "Phone is required", status: false });

    // 1. Fetch Root User
    const [userRows] = await connection.query("SELECT code, name_user, id_user, level, phone, invite FROM users WHERE phone = ? LIMIT 1", [phone]);
    if (userRows.length === 0) return res.status(404).json({ message: "User not found", status: false });
    const rootUser = userRows[0];

    // 2. BFS to fetch 7 levels of hierarchy
    let allNodes = [];
    let queue = [{ ...rootUser, depth: 0, parentId: '' }];
    let processedPhones = new Set();

    // We'll fetch in batches to avoid overwhelming the DB
    while (queue.length > 0 && allNodes.length < 20000) { // Increased safety limit to 20,000 nodes
      let current = queue.shift();
      if (processedPhones.has(current.phone)) continue;
      processedPhones.add(current.phone);

      allNodes.push({
        id: current.phone,
        parentId: current.parentId,
        name: current.name_user,
        id_user: current.id_user,
        level: current.level,
        phone: current.phone,
        code: current.code,
        depth: current.depth
      });

      if (current.depth < 7) {
        const [children] = await connection.query("SELECT code, name_user, id_user, level, phone, invite FROM users WHERE invite = ?", [current.code]);
        for (let child of children) {
          queue.push({
            ...child,
            depth: current.depth + 1,
            parentId: current.phone
          });
        }
      }
    }

    // 3. Fetch Stats in Bulk for all collected phones
    const allPhones = allNodes.map(n => n.id);
    const bulkStats = await userStatsHelper.getBulkUserStats(allPhones);

    // 4. Attach stats and children indicators
    const finalNodes = await Promise.all(allNodes.map(async (node) => {
      // We can check for subordinates for each node efficiently
      // To keep it fast, we'll only check if they have any subordinates at all
      const [subCheck] = await connection.query("SELECT phone FROM users WHERE invite = ? LIMIT 1", [node.code]);

      return {
        ...node,
        stats: bulkStats[node.id] || {
          deposit: { total: 0, today: 0, yesterday: 0 },
          bet: { total: 0, today: 0, yesterday: 0 },
          withdraw: { total: 0, today: 0, yesterday: 0 }
        },
        _hasChildren: subCheck.length > 0,
        _directSubordinates: 0 // We'll skip exact count for bulk speed
      };
    }));

    return res.status(200).json({
      status: true,
      data: finalNodes[0], // Root node
      allNodes: finalNodes   // Send the whole tree
    });

  } catch (error) {
    console.error("getMemberTree error:", error);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};
const memberTreePage = async (req, res) => {
  let phone = req.params.id;
  return res.render("manage/memberTree.ejs", { phone });
};
const statistical = async (req, res) => {
  return res.render("manage/statistical.ejs");
};

const rechargePage = async (req, res) => {
  return res.render("manage/recharge.ejs");
};

const rechargeRecord = async (req, res) => {
  return res.render("manage/rechargeRecord.ejs");
};

const withdraw = async (req, res) => {
  return res.render("manage/withdraw.ejs");
};

const levelSetting = async (req, res) => {
  return res.render("manage/levelSetting.ejs");
};

const rebetRankPage = async (req, res) => {
  return res.render("manage/rebetRank.ejs");
};

const attendanceConfigPage = async (req, res) => {
  return res.render("manage/attendanceConfig.ejs");
};

const getRebetRankInfo = async (req, res) => {
  try {
    const [rows] = await connection.query("SELECT * FROM commissions_rebet_ranks ORDER BY level ASC");
    return res.status(200).json({
      message: "Success",
      status: true,
      rows: rows,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching rank info",
      status: false,
    });
  }
};

const updateRebetRank = async (req, res) => {
  const { id, min_team, min_betting, min_deposit } = req.body;
  try {
    await connection.query(
      "UPDATE commissions_rebet_ranks SET min_team = ?, min_betting = ?, min_deposit = ? WHERE id = ?",
      [min_team, min_betting, min_deposit, id]
    );
    return res.status(200).json({
      message: "Rank threshold updated successfully",
      status: true,
    });
  } catch (error) {
    console.error("Update rank error:", error);
    return res.status(500).json({
      message: "Update failed",
      status: false,
    });
  }
};

const getAttendanceConfig = async (req, res) => {
  try {
    const [rows] = await connection.query("SELECT * FROM attendance_config ORDER BY day ASC");
    return res.status(200).json({
      message: "Success",
      status: true,
      rows: rows,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching attendance config",
      status: false,
    });
  }
};

const updateAttendanceConfig = async (req, res) => {
  const { id, bonus_amount, required_recharge } = req.body;
  try {
    await connection.execute(
      "UPDATE attendance_config SET bonus_amount = ?, required_recharge = ? WHERE id = ?",
      [bonus_amount, required_recharge, id],
    );
    return res.status(200).json({ status: true, message: "Updated successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const missionsConfigPage = async (req, res) => {
  return res.render("manage/missionsConfig.ejs");
};

const getMissionsList = async (req, res) => {
  try {
    const [rows] = await connection.execute("SELECT * FROM missions_config ORDER BY category, id ASC");
    return res.status(200).json({ status: true, data: rows });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const addMission = async (req, res) => {
  const { category, target_type, required_deposit, required_bet, bonus_amount, description } = req.body;
  try {
    await connection.execute(
      "INSERT INTO missions_config (category, target_type, required_deposit, required_bet, bonus_amount, description) VALUES (?, ?, ?, ?, ?, ?)",
      [category, target_type, required_deposit || 0, required_bet || 0, bonus_amount, description],
    );
    return res.status(200).json({ status: true, message: "Mission added successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const deleteMission = async (req, res) => {
  const { id } = req.body;
  try {
    await connection.execute("DELETE FROM missions_config WHERE id = ?", [id]);
    return res.status(200).json({ status: true, message: "Mission deleted successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const updateMission = async (req, res) => {
  const { id, category, target_type, required_deposit, required_bet, bonus_amount, description } = req.body;
  try {
    await connection.execute(
      "UPDATE missions_config SET category = ?, target_type = ?, required_deposit = ?, required_bet = ?, bonus_amount = ?, description = ? WHERE id = ?",
      [category, target_type, required_deposit || 0, required_bet || 0, bonus_amount, description, id],
    );
    return res.status(200).json({ status: true, message: "Mission updated successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const invitationBonusConfigPage = async (req, res) => {
  return res.render("manage/invitationBonusConfig.ejs");
};

const getInvitationBonusList = async (req, res) => {
  try {
    const [rows] = await connection.execute("SELECT * FROM invitation_bonus_config ORDER BY id ASC");
    return res.status(200).json({ status: true, data: rows });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const addInvitationBonus = async (req, res) => {
  const { number_invited, number_deposits, amount_recharge, bonus_amount, start_time, end_time } = req.body;
  try {
    await connection.execute(
      "INSERT INTO invitation_bonus_config (number_invited, number_deposits, amount_recharge, bonus_amount, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)",
      [number_invited, number_deposits, amount_recharge, bonus_amount, start_time || null, end_time || null],
    );
    return res.status(200).json({ status: true, message: "Invitation bonus added successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const updateInvitationBonus = async (req, res) => {
  const { id, number_invited, number_deposits, amount_recharge, bonus_amount, start_time, end_time, status } = req.body;
  try {
    await connection.execute(
      "UPDATE invitation_bonus_config SET number_invited = ?, number_deposits = ?, amount_recharge = ?, bonus_amount = ?, start_time = ?, end_time = ?, status = ? WHERE id = ?",
      [number_invited, number_deposits, amount_recharge, bonus_amount, start_time || null, end_time || null, status, id],
    );
    return res.status(200).json({ status: true, message: "Invitation bonus updated successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const deleteInvitationBonus = async (req, res) => {
  const { id } = req.body;
  try {
    await connection.execute("DELETE FROM invitation_bonus_config WHERE id = ?", [id]);
    return res.status(200).json({ status: true, message: "Invitation bonus deleted successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};



const CreatedSalaryRecord = async (req, res) => {
  return res.render("manage/CreatedSalaryRecord.ejs");
};

const DailySalaryEligibility = async (req, res) => {
  return res.render("manage/DailySalaryEligibility.ejs");
};

const withdrawRecord = async (req, res) => {
  return res.render("manage/withdrawRecord.ejs");
};
const settings = async (req, res) => {
  return res.render("manage/settings.ejs");
};

// xác nhận admin
const middlewareAdminController = async (req, res, next) => {
  // xác nhận token
  const auth = req.cookies.auth;
  if (!auth) {
    return res.redirect("/login");
  }
  const [rows] = await connection.execute(
    "SELECT `token`,`level`, `status` FROM `users` WHERE `token` = ? AND veri = 1",
    [auth],
  );
  if (!rows) {
    return res.redirect("/login");
  }
  try {
    if (auth == rows[0].token && rows[0].status == 1) {
      if (rows[0].level == 1) {
        next();
      } else {
        return res.redirect("/home");
      }
    } else {
      return res.redirect("/login");
    }
  } catch (error) {
    return res.redirect("/login");
  }
};

const totalJoin = async (req, res) => {
  let auth = req.cookies.auth;
  let typeid = req.body.typeid;
  if (!typeid) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  let game = "";
  if (typeid == "1") game = "wingo";
  if (typeid == "2") game = "wingo3";
  if (typeid == "3") game = "wingo5";
  if (typeid == "4") game = "wingo10";

  const [rows] = await connection.query(
    "SELECT * FROM users WHERE `token` = ? ",
    [auth],
  );

  if (rows.length > 0) {
    const [wingoall] = await connection.query(
      `SELECT * FROM minutes_1 WHERE game = "${game}" AND status = 0 AND level = 0 ORDER BY id ASC `,
      [auth],
    );
    const [winGo1] = await connection.execute(
      `SELECT * FROM wingo WHERE status = 0 AND game = '${game}' ORDER BY id DESC LIMIT 1 `,
      [],
    );
    const [winGo10] = await connection.execute(
      `SELECT * FROM wingo WHERE status != 0 AND game = '${game}' ORDER BY id DESC LIMIT 10 `,
      [],
    );
    const [setting] = await connection.execute(`SELECT * FROM admin_ac `, []);

    return res.status(200).json({
      message: "Success",
      status: true,
      datas: wingoall,
      lotterys: winGo1,
      list_orders: winGo10,
      setting: setting,
      timeStamp: timeNow,
    });
  } else {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
};

const listMember = async (req, res) => {
  let { pageno, limit, search, status, role, sort } = req.body;
  const offset = (pageno - 1) * limit;

  if (!pageno || !limit) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: { gameslist: [] },
      status: false,
    });
  }

  let startDate = new Date().setHours(0, 0, 0, 0);
  let endDate = new Date().setHours(23, 59, 59, 999);
  let yesterdayStart = startDate - 86400000;
  let yesterdayEnd = endDate - 86400000;

  let sql = `
    SELECT 
      u.*, 
      COALESCE(t.total_deposit, 0) AS total_deposit, 
      COALESCE(t.daily_deposit, 0) AS daily_deposit, 
      COALESCE(t.daily_turn_over, 0) AS today_bet_amount,
      u.promotion_commisions AS total_commission,
      u.total_distributed_salary AS total_salary,
      (SELECT COALESCE(SUM(amount), 0) FROM salary WHERE phone = u.phone AND time BETWEEN ? AND ?) AS today_salary,
      (SELECT COALESCE(SUM(amount), 0) FROM salary WHERE phone = u.phone AND time BETWEEN ? AND ?) AS yesterday_salary,
      u.addmoneybyadmin,
      u.minusMoneybyadmin
    FROM users u 
    LEFT JOIN turn_over t ON u.phone = t.phone 
    WHERE u.veri = 1 AND u.level != 2`;

  let countSql = `
    SELECT COUNT(*) as total 
    FROM users u 
    LEFT JOIN turn_over t ON u.phone = t.phone
    WHERE u.veri = 1 AND u.level != 2`;

  let params = [startDate, endDate, yesterdayStart, yesterdayEnd];
  let countParams = [];

  // 1. Search Filter
  if (search) {
    const searchClause = " AND (u.phone LIKE ? OR u.id_user LIKE ?)";
    sql += searchClause;
    countSql += searchClause;
    params.push(`%${search}%`, `%${search}%`);
    countParams.push(`%${search}%`, `%${search}%`);
  }

  // 2. Status Filter
  if (status) {
    const statusClause = " AND u.status = ?";
    sql += statusClause;
    countSql += statusClause;
    params.push(status);
    countParams.push(status);
  }

  // 3. Role (Level) Filter
  if (role) {
    const roleClause = " AND u.level = ?";
    sql += roleClause;
    countSql += roleClause;
    params.push(role);
    countParams.push(role);
  }

  // 4. Sorting Logic
  let orderBy = " ORDER BY u.id DESC"; // Default: Latest
  if (sort === 'oldest') {
    orderBy = " ORDER BY u.id ASC";
  } else if (sort === 'balance_high') {
    orderBy = " ORDER BY CAST(u.money AS DECIMAL(18,2)) DESC";
  } else if (sort === 'deposit_high') {
    orderBy = " ORDER BY t.total_deposit DESC";
  }

  sql += orderBy;
  sql += " LIMIT ? OFFSET ?";
  params.push(parseInt(limit), parseInt(offset));

  // Execute the query to fetch users
  const [users] = await connection.execute(sql, params);

  // Fetch the TOTAL COUNT for this specific filter (for pagination)
  const [total_filtered] = await connection.query(countSql, countParams);
    const total_count_filtered = total_filtered[0].total || 0;

  // Aggregate Real-Time Stats directly (including API Games and Rewards)
  if (users.length > 0) {
    const phones = users.map(u => u.phone);
    const idUsers = users.map(u => u.id_user);

    // 1. External Game Stats - Lifetime
    const [jilli] = await connection.query("SELECT phone, SUM(betAmount) as bet, SUM(winAmount) as win FROM jilliebethistory WHERE phone IN (?) GROUP BY phone", [phones]);
    const [spribe] = await connection.query("SELECT phone, SUM(deposit_amount) as bet, SUM(withdrawal_amount) as win FROM spribetransaction WHERE phone IN (?) GROUP BY phone", [phones]);
    const [wc] = await connection.query("SELECT user_id, SUM(amount) as total FROM wc_api_transactions WHERE user_id IN (?) AND type = 'debit' AND is_cancel = 0 GROUP BY user_id", [idUsers]);
    const [wcWin] = await connection.query("SELECT user_id, SUM(amount) as total FROM wc_api_transactions WHERE user_id IN (?) AND type = 'credit' AND is_cancel = 0 GROUP BY user_id", [idUsers]);
    
    // 2. External Game Stats - Today
    const [jilliToday] = await connection.query("SELECT phone, SUM(betAmount) as bet, SUM(winAmount) as win FROM jilliebethistory WHERE phone IN (?) AND today >= FROM_UNIXTIME(?/1000) GROUP BY phone", [phones, startDate]);
    const [spribeToday] = await connection.query("SELECT phone, SUM(deposit_amount) as bet, SUM(withdrawal_amount) as win FROM spribetransaction WHERE phone IN (?) AND today >= FROM_UNIXTIME(?/1000) GROUP BY phone", [phones, startDate]);
    const [wcToday] = await connection.query("SELECT user_id, SUM(amount) as total FROM wc_api_transactions WHERE user_id IN (?) AND type = 'debit' AND is_cancel = 0 AND created_at >= FROM_UNIXTIME(?/1000) GROUP BY user_id", [idUsers, startDate]);
    const [wcWinToday] = await connection.query("SELECT user_id, SUM(amount) as total FROM wc_api_transactions WHERE user_id IN (?) AND type = 'credit' AND is_cancel = 0 AND created_at >= FROM_UNIXTIME(?/1000) GROUP BY user_id", [idUsers, startDate]);

    // 3. Rewards & Bonuses
    const [rewards] = await connection.query("SELECT phone, SUM(amount) as total FROM claimed_rewards WHERE phone IN (?) AND status = 1 GROUP BY phone", [phones]);
    const [wcBonus] = await connection.query("SELECT user_id, SUM(amount) as total FROM wc_api_bonus WHERE user_id IN (?) GROUP BY user_id", [idUsers]);

    // Map stats back to users
    users.forEach(u => {
      let extBetTotal = 0;
      let extWinTotal = 0;
      let extBetToday = 0;
      let rewardTotal = 0;

      // Lifetime
      const j = jilli.find(r => r.phone == u.phone);
      if (j) { extBetTotal += parseFloat(j.bet) || 0; extWinTotal += parseFloat(j.win) || 0; }
      const s = spribe.find(r => r.phone == u.phone);
      if (s) { extBetTotal += parseFloat(s.bet) || 0; extWinTotal += parseFloat(s.win) || 0; }
      const w = wc.find(r => r.user_id == u.id_user);
      if (w) { extBetTotal += parseFloat(w.total) || 0; }
      const ww = wcWin.find(r => r.user_id == u.id_user);
      if (ww) { extWinTotal += parseFloat(ww.total) || 0; }

      // Today
      const jt = jilliToday.find(r => r.phone == u.phone);
      if (jt) { extBetToday += parseFloat(jt.bet) || 0; }
      const st = spribeToday.find(r => r.phone == u.phone);
      if (st) { extBetToday += parseFloat(st.bet) || 0; }
      const wt = wcToday.find(r => r.user_id == u.id_user);
      if (wt) { extBetToday += parseFloat(wt.total) || 0; }

      // Rewards
      const r = rewards.find(r => r.phone == u.phone);
      if (r) { rewardTotal += parseFloat(r.total) || 0; }
      const wb = wcBonus.find(r => r.user_id == u.id_user);
      if (wb) { rewardTotal += parseFloat(wb.total) || 0; }

      u.total_deposit = parseFloat(u.total_deposit) || 0;
      u.daily_deposit = parseFloat(u.daily_deposit) || 0;
      
      // Update Today Bet to include API
      u.today_bet_amount = (parseFloat(u.today_bet_amount) || 0) + extBetToday;
      
      // Lifetime Field Names for members.ejs
      u.wcTotalBetAmount = extBetTotal; 
      u.wc_totalWinningAmount = extWinTotal;
      u.totalBetAmount = (parseFloat(u.totalBetAmount) || 0) + extBetTotal; 
      u.totalWinningAmount = (parseFloat(u.totalWinningAmount) || 0) + extWinTotal;
      
      u.total_rewards = rewardTotal;
      u.total_salary = parseFloat(u.total_salary) || 0;
      u.total_commission = parseFloat(u.total_commission) || 0;
    });
  }

  // Fetch Global Stats for the Dashboard Cards
  const [stats] = await connection.query(`
    SELECT 
      COUNT(u.id) as total_count,
      SUM(u.money) as total_balance,
      (SELECT SUM(money) FROM recharge WHERE status = 1 AND time BETWEEN ? AND ?) as total_today_deposit,
      (
        (SELECT COALESCE(SUM(money + fee), 0) FROM minutes_1 WHERE time BETWEEN ? AND ?) +
        (SELECT COALESCE(SUM(money), 0) FROM result_k3 WHERE time BETWEEN ? AND ?) +
        (SELECT COALESCE(SUM(money), 0) FROM result_5d WHERE time BETWEEN ? AND ?) +
        (SELECT COALESCE(SUM(money + fee), 0) FROM trx_wingo_bets WHERE time BETWEEN ? AND ?)
      ) as total_today_bet
    FROM users u
    WHERE u.veri = 1 AND u.level != 2
  `, [startDate, endDate, startDate, endDate, startDate, endDate, startDate, endDate, startDate, endDate]);

  const total_count_global = stats[0].total_count || 0;

  return res.status(200).json({
    message: "Success",
    status: true,
    datas: users,
    currentPage: pageno,
    page_total: Math.ceil(total_count_filtered / limit),
    total_count: total_count_global,
    total_count_filtered: total_count_filtered,
    global_stats: {
      total_balance: stats[0].total_balance || 0,
      today_deposit: stats[0].total_today_deposit || 0,
      today_bet: stats[0].total_today_bet || 0
    }
  });
};

const listCTV = async (req, res) => {
  let { pageno, pageto } = req.body;

  if (pageno === undefined || !pageto) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  let startDate = new Date().setHours(0, 0, 0, 0);
  let endDate = new Date().setHours(23, 59, 59, 999);
  let yesterdayStart = startDate - 86400000;
  let yesterdayEnd = endDate - 86400000;

  try {
    const [wingo] = await connection.query(
      `SELECT 
        u.*, 
        COALESCE(t.total_deposit, 0) AS total_deposit, 
        COALESCE(t.daily_deposit, 0) AS daily_deposit, 
        COALESCE(t.daily_turn_over, 0) AS today_bet_amount,
        u.promotion_commisions AS total_commission,
        u.total_distributed_salary AS total_salary,
        (SELECT COALESCE(SUM(amount), 0) FROM salary WHERE phone = u.phone AND time BETWEEN ? AND ?) AS today_salary,
        (SELECT COALESCE(SUM(amount), 0) FROM salary WHERE phone = u.phone AND time BETWEEN ? AND ?) AS yesterday_salary
      FROM users u 
      LEFT JOIN turn_over t ON u.phone = t.phone 
      WHERE u.veri = 1 AND u.level = 2 
      ORDER BY u.id DESC LIMIT ${pageno}, ${pageto}`,
      [startDate, endDate, yesterdayStart, yesterdayEnd]
    );

    return res.status(200).json({
      message: "Success",
      status: true,
      datas: wingo,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error", status: false });
  }
};

function formateT2(params) {
  let result = params < 10 ? "0" + params : params;
  return result;
}

function timerJoin2(params = "", addHours = 0) {
  let date = "";
  if (params) {
    date = new Date(Number(params));
  } else {
    date = new Date();
  }

  date.setHours(date.getHours() + addHours);

  let years = formateT(date.getFullYear());
  let months = formateT(date.getMonth() + 1);
  let days = formateT(date.getDate());

  let hours = date.getHours() % 12;
  hours = hours === 0 ? 12 : hours;
  let ampm = date.getHours() < 12 ? "AM" : "PM";

  let minutes = formateT(date.getMinutes());
  let seconds = formateT(date.getSeconds());

  return (
    years +
    "-" +
    months +
    "-" +
    days +
    " " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds +
    " " +
    ampm
  );
}

const statistical2 = async (req, res) => {
  try {
    // 1. Get all Collaborator Phones
    const [ctv_users] = await connection.query("SELECT phone FROM users WHERE level = 2");
    const ctvPhones = ctv_users.map(u => u.phone);

    if (ctvPhones.length === 0) {
      return res.status(200).json({ message: "No collaborators", status: true, data: null });
    }

    // 2. Time Ranges (IST)
    const todayStart = moment().tz("Asia/Kolkata").startOf('day').valueOf();
    const todayEnd = moment().tz("Asia/Kolkata").endOf('day').valueOf();
    const yesterdayStart = moment().tz("Asia/Kolkata").subtract(1, 'days').startOf('day').valueOf();
    const yesterdayEnd = moment().tz("Asia/Kolkata").subtract(1, 'days').endOf('day').valueOf();

    const timeframes = [
      { key: 'today', start: todayStart, end: todayEnd },
      { key: 'yesterday', start: yesterdayStart, end: yesterdayEnd },
      { key: 'total', start: null, end: null }
    ];

    const internalGames = [
      { table: 'minutes_1', betCol: 'money + fee', winCol: 'get' },
      { table: 'result_k3', betCol: 'money', winCol: 'get' },
      { table: 'result_5d', betCol: 'money', winCol: 'get' },
      { table: 'trx_wingo_bets', betCol: 'money + fee', winCol: 'get' }
    ];

    const results = {
      today: { collab: { bet: 0, win: 0, recharge: 0, withdraw: 0, reward: 0 }, team: { bet: 0, win: 0, recharge: 0, withdraw: 0, reward: 0 }, combined: { bet: 0, win: 0, recharge: 0, withdraw: 0, reward: 0 } },
      yesterday: { collab: { bet: 0, win: 0, recharge: 0, withdraw: 0, reward: 0 }, team: { bet: 0, win: 0, recharge: 0, withdraw: 0, reward: 0 }, combined: { bet: 0, win: 0, recharge: 0, withdraw: 0, reward: 0 } },
      total: { collab: { bet: 0, win: 0, recharge: 0, withdraw: 0, reward: 0 }, team: { bet: 0, win: 0, recharge: 0, withdraw: 0, reward: 0 }, combined: { bet: 0, win: 0, recharge: 0, withdraw: 0, reward: 0 } }
    };

    // 3. Reusable Stats Aggregator
    const getAggregatedStats = async (phones, startTime, endTime) => {
      let bet = 0, win = 0, recharge = 0, withdraw = 0, reward = 0;
      let timeFilter = (startTime && endTime) ? " AND time BETWEEN ? AND ?" : "";
      let params = (startTime && endTime) ? [phones, startTime, endTime] : [phones];

      // Internal Games
      for (const item of internalGames) {
        const [rows] = await connection.query(`SELECT SUM(${item.betCol}) as bet, SUM(${item.winCol}) as win FROM ${item.table} WHERE phone IN (?) ${timeFilter}`, params);
        bet += parseFloat(rows[0]?.bet) || 0;
        win += parseFloat(rows[0]?.win) || 0;
      }

      // External Jilli & Spribe
      let extTimeFilter = (startTime && endTime) ? " AND today BETWEEN FROM_UNIXTIME(?/1000) AND FROM_UNIXTIME(?/1000)" : "";
      const [jilli] = await connection.query(`SELECT SUM(betAmount) as bet, SUM(winAmount) as win FROM jilliebethistory WHERE phone IN (?) ${extTimeFilter}`, params);
      bet += parseFloat(jilli[0]?.bet) || 0;
      win += parseFloat(jilli[0]?.win) || 0;

      const [spribe] = await connection.query(`SELECT SUM(deposit_amount) as bet, SUM(withdrawal_amount) as win FROM spribetransaction WHERE phone IN (?) ${extTimeFilter}`, params);
      bet += parseFloat(spribe[0]?.bet) || 0;
      win += parseFloat(spribe[0]?.win) || 0;

      // WC (Using created_at)
      const [userIds] = await connection.query("SELECT id_user FROM users WHERE phone IN (?)", [phones]);
      if (userIds.length) {
        const ids = userIds.map(u => u.id_user);
        let wcFilter = (startTime && endTime) ? " AND created_at BETWEEN FROM_UNIXTIME(?/1000) AND FROM_UNIXTIME(?/1000)" : "";
        const [wcBet] = await connection.query(`SELECT SUM(amount) as bet FROM wc_api_transactions WHERE type = 'debit' AND is_cancel = 0 AND user_id IN (?) ${wcFilter}`, (startTime && endTime) ? [ids, startTime, endTime] : [ids]);
        const [wcWin] = await connection.query(`SELECT SUM(amount) as win FROM wc_api_transactions WHERE type = 'credit' AND is_cancel = 0 AND user_id IN (?) ${wcFilter}`, (startTime && endTime) ? [ids, startTime, endTime] : [ids]);
        bet += parseFloat(wcBet[0]?.bet) || 0;
        win += parseFloat(wcWin[0]?.win) || 0;

        // WC Bonus
        const [wcB] = await connection.query(`SELECT SUM(amount) as total FROM wc_api_bonus WHERE user_id IN (?) ${wcFilter}`, (startTime && endTime) ? [ids, startTime, endTime] : [ids]);
        reward += parseFloat(wcB[0]?.total) || 0;
      }

      // Financials (Recharge & Withdraw & Claimed Rewards)
      const [rech] = await connection.query(`SELECT SUM(money) as total FROM recharge WHERE status = 1 AND phone IN (?) ${timeFilter}`, params);
      const [withd] = await connection.query(`SELECT SUM(money) as total FROM withdraw WHERE status = 1 AND phone IN (?) ${timeFilter}`, params);
      const [rew] = await connection.query(`SELECT SUM(amount) as total FROM claimed_rewards WHERE status = 1 AND phone IN (?) ${timeFilter}`, params);
      
      recharge = parseFloat(rech[0]?.total) || 0;
      withdraw = parseFloat(withd[0]?.total) || 0;
      reward += parseFloat(rew[0]?.total) || 0;

      return { bet, win, recharge, withdraw, reward };
    };

    // 4. Group Categorization
    const [team_users] = await connection.query("SELECT phone FROM users WHERE ctv IN (?)", [ctvPhones]);
    const teamPhones = team_users.map(u => u.phone);

    // 5. Run Calculations for each Timeframe & Segment
    for (const tf of timeframes) {
      // Collab Only
      const collabStats = await getAggregatedStats(ctvPhones, tf.start, tf.end);
      results[tf.key].collab = collabStats;

      // Team Only (If team exists)
      if (teamPhones.length > 0) {
        const teamStats = await getAggregatedStats(teamPhones, tf.start, tf.end);
        results[tf.key].team = teamStats;
      }

      // Combined
      results[tf.key].combined.bet = results[tf.key].collab.bet + results[tf.key].team.bet;
      results[tf.key].combined.win = results[tf.key].collab.win + results[tf.key].team.win;
      results[tf.key].combined.recharge = results[tf.key].collab.recharge + results[tf.key].team.recharge;
      results[tf.key].combined.withdraw = results[tf.key].collab.withdraw + results[tf.key].team.withdraw;
      results[tf.key].combined.reward = results[tf.key].collab.reward + results[tf.key].team.reward;
    }

    // 6. Basic User Stats
    const [ctvs] = await connection.query(`SELECT COUNT(id) as total FROM users WHERE level = 2`);
    const [ctvs_active] = await connection.query(`SELECT COUNT(id) as total FROM users WHERE level = 2 AND status = 1`);
    const [ctvs_banned] = await connection.query(`SELECT COUNT(id) as total FROM users WHERE level = 2 AND status = 2`);

    // Recharge/Withdraw for Both (Combined)
    const allPhones = [...ctvPhones, ...teamPhones];
    const [rechargeTotal] = await connection.query(`SELECT SUM(money) as total FROM recharge WHERE status = 1 AND phone IN (?)`, [allPhones]);
    const [withdrawTotal] = await connection.query(`SELECT SUM(money) as total FROM withdraw WHERE status = 1 AND phone IN (?)`, [allPhones]);
    const [rechargeToday] = await connection.query(`SELECT SUM(money) as total FROM recharge WHERE status = 1 AND phone IN (?) AND time BETWEEN ? AND ?`, [allPhones, todayStart, todayEnd]);
    const [withdrawToday] = await connection.query(`SELECT SUM(money) as total FROM withdraw WHERE status = 1 AND phone IN (?) AND time BETWEEN ? AND ?`, [allPhones, todayStart, todayEnd]);

    return res.status(200).json({
      message: "Success", status: true,
      matrix: results,
      totalCollaborators: ctvs[0].total,
      usersOnline: ctvs_active[0].total,
      usersOffline: ctvs_banned[0].total,
      recharges: Math.round((rechargeTotal[0].total || 0) * 100) / 100,
      withdraws: Math.round((withdrawTotal[0].total || 0) * 100) / 100,
      rechargeToday: Math.round((rechargeToday[0].total || 0) * 100) / 100,
      withdrawToday: Math.round((withdrawToday[0].total || 0) * 100) / 100,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error", status: false });
  }
};

const changeAdmin = async (req, res) => {
  let auth = req.cookies.auth;
  let value = req.body.value;
  let type = req.body.type;
  let typeid = req.body.typeid;

  if (!value || !type || !typeid)
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  let game = "";
  let bs = "";
  if (typeid == "1") {
    game = "wingo1";
    bs = "bs1";
  }
  if (typeid == "2") {
    game = "wingo3";
    bs = "bs3";
  }
  if (typeid == "3") {
    game = "wingo5";
    bs = "bs5";
  }
  if (typeid == "4") {
    game = "wingo10";
    bs = "bs10";
  }
  switch (type) {
    case "change-wingo1":
      await connection.query(`UPDATE admin_ac SET ${game} = ? `, [value]);
      return res.status(200).json({
        message: "Editing results successfully",
        status: true,
        timeStamp: timeNow,
      });
      break;
    case "change-win_rate":
      await connection.query(`UPDATE admin_ac SET ${bs} = ? `, [value]);
      return res.status(200).json({
        message: "Editing win rate successfully",
        status: true,
        timeStamp: timeNow,
      });
      break;

    default:
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
      break;
  }
};

function formateT(params) {
  let result = params < 10 ? "0" + params : params;
  return result;
}

function timerJoin(params = "", addHours = 0) {
  let date = "";
  if (params) {
    date = new Date(Number(params));
  } else {
    date = new Date();
  }

  date.setHours(date.getHours() + addHours);

  let years = formateT(date.getFullYear());
  let months = formateT(date.getMonth() + 1);
  let days = formateT(date.getDate());

  let hours = date.getHours() % 12;
  hours = hours === 0 ? 12 : hours;
  let ampm = date.getHours() < 12 ? "AM" : "PM";

  let minutes = formateT(date.getMinutes());
  let seconds = formateT(date.getSeconds());

  return (
    years +
    "-" +
    months +
    "-" +
    days +
    " " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds +
    " " +
    ampm
  );
}

const userInfo = async (req, res) => {
  let auth = req.cookies.auth;
  let phone = req.body.phone;
  if (!phone) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

  const [user] = await connection.query(
    "SELECT * FROM users WHERE phone = ? ",
    [phone],
  );

  if (user.length == 0) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  let userInfo = user[0];
  // direct subordinate all
  const [f1s] = await connection.query(
    "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
    [userInfo.code],
  );

  // cấp dưới trực tiếp hôm nay
  let f1_today = 0;
  for (let i = 0; i < f1s.length; i++) {
    const f1_time = f1s[i].time; // Mã giới thiệu f1
    let check = timerJoin(f1_time) == timerJoin() ? true : false;
    if (check) {
      f1_today += 1;
    }
  }

  // tất cả cấp dưới hôm nay
  let f_all_today = 0;
  for (let i = 0; i < f1s.length; i++) {
    const f1_code = f1s[i].code; // Mã giới thiệu f1
    const f1_time = f1s[i].time; // time f1
    let check_f1 = timerJoin(f1_time) == timerJoin() ? true : false;
    if (check_f1) f_all_today += 1;
    // tổng f1 mời đc hôm nay
    const [f2s] = await connection.query(
      "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
      [f1_code],
    );
    for (let i = 0; i < f2s.length; i++) {
      const f2_code = f2s[i].code; // Mã giới thiệu f2
      const f2_time = f2s[i].time; // time f2
      let check_f2 = timerJoin(f2_time) == timerJoin() ? true : false;
      if (check_f2) f_all_today += 1;
      // tổng f2 mời đc hôm nay
      const [f3s] = await connection.query(
        "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
        [f2_code],
      );
      for (let i = 0; i < f3s.length; i++) {
        const f3_code = f3s[i].code; // Mã giới thiệu f3
        const f3_time = f3s[i].time; // time f3
        let check_f3 = timerJoin(f3_time) == timerJoin() ? true : false;
        if (check_f3) f_all_today += 1;
        const [f4s] = await connection.query(
          "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
          [f3_code],
        );
        // tổng f3 mời đc hôm nay
        for (let i = 0; i < f4s.length; i++) {
          const f4_code = f4s[i].code; // Mã giới thiệu f4
          const f4_time = f4s[i].time; // time f4
          let check_f4 = timerJoin(f4_time) == timerJoin() ? true : false;
          if (check_f4) f_all_today += 1;
          // tổng f3 mời đc hôm nay
        }
      }
    }
  }

  // Compute f2 to f7 efficiently using BFS
  let f_counts = { f2: 0, f3: 0, f4: 0, f5: 0, f6: 0, f7: 0 };
  let current_level_codes = f1s.map(f => f.code).filter(c => c);

  for (let level = 2; level <= 7; level++) {
    if (current_level_codes.length === 0) break;

    let next_level_codes = [];

    for (let i = 0; i < current_level_codes.length; i += 500) {
      let batch = current_level_codes.slice(i, i + 500);
      if (batch.length === 0) continue;
      let placeholders = batch.map(() => '?').join(',');
      const [children] = await connection.query(
        `SELECT code FROM users WHERE invite IN (${placeholders})`,
        batch
      );
      f_counts[`f${level}`] += children.length;
      next_level_codes.push(...children.map(c => c.code).filter(c => c));
    }

    current_level_codes = next_level_codes;
  }

  let f2 = f_counts.f2;
  let f3 = f_counts.f3;
  let f4 = f_counts.f4;
  let f5 = f_counts.f5;
  let f6 = f_counts.f6;
  let f7 = f_counts.f7;

  const [rechargeTotal] = await connection.query(
    "SELECT SUM(`money`) as total FROM recharge WHERE phone = ? AND status = 1 ",
    [phone],
  );
  const [withdrawTotal] = await connection.query(
    "SELECT SUM(`money`) as total FROM withdraw WHERE phone = ? AND status = 1 ",
    [phone],
  );

  // --- Start: Dynamic Total Bet & Win Calculation (Including API Games) ---
  const id_user = userInfo.id_user;
  const [bettingStats] = await connection.query(`
    SELECT 
      (
        (SELECT IFNULL(SUM(money), 0) FROM minutes_1 WHERE phone = ?) +
        (SELECT IFNULL(SUM(money), 0) FROM result_k3 WHERE phone = ?) +
        (SELECT IFNULL(SUM(money), 0) FROM result_5d WHERE phone = ?) +
        (SELECT IFNULL(SUM(money), 0) FROM trx_wingo_bets WHERE phone = ?) +
        (SELECT IFNULL(SUM(betAmount), 0) FROM jilliebethistory WHERE phone = ?) +
        (SELECT IFNULL(SUM(deposit_amount), 0) FROM spribetransaction WHERE phone = ? AND type = 0) +
        (SELECT IFNULL(SUM(amount), 0) FROM wc_api_transactions WHERE user_id = ? AND type = 'debit' AND is_cancel = 0)
      ) as total_bet,
      (
        (SELECT IFNULL(SUM(get), 0) FROM minutes_1 WHERE phone = ? AND status = 1) +
        (SELECT IFNULL(SUM(get), 0) FROM result_k3 WHERE phone = ? AND status = 1) +
        (SELECT IFNULL(SUM(get), 0) FROM result_5d WHERE phone = ? AND status = 1) +
        (SELECT IFNULL(SUM(get), 0) FROM trx_wingo_bets WHERE phone = ? AND status = 1) +
        (SELECT IFNULL(SUM(winAmount), 0) FROM jilliebethistory WHERE phone = ?) +
        (SELECT IFNULL(SUM(deposit_amount), 0) FROM spribetransaction WHERE phone = ? AND type = 1) +
        (SELECT IFNULL(SUM(amount), 0) FROM wc_api_transactions WHERE user_id = ? AND type = 'credit' AND is_cancel = 0)
      ) as total_win
  `, [phone, phone, phone, phone, phone, phone, id_user, phone, phone, phone, phone, phone, phone, id_user]);

  const totalBet = bettingStats[0]?.total_bet || 0;
  const totalWin = bettingStats[0]?.total_win || 0;
  // --- End: Dynamic Calculation ---

  const [bank_user] = await connection.query(
    "SELECT * FROM user_bank WHERE phone = ? ",
    [phone],
  );
  const [ng_moi] = await connection.query(
    "SELECT `phone` FROM users WHERE code = ? ",
    [userInfo.invite],
  );
  const [total_commission] = await connection.query(
    "SELECT SUM(`money`) as total FROM commissions WHERE phone = ?",
    [phone],
  );
  const [total_claimed] = await connection.query(
    "SELECT SUM(`amount`) as total FROM claimed_rewards WHERE phone = ? AND status = 1",
    [phone],
  );
  return res.status(200).json({
    message: "Success",
    status: true,
    datas: user,
    total_r: rechargeTotal,
    total_w: withdrawTotal,
    f1: f1s.length,
    f2: f2,
    f3: f3,
    f4: f4,
    f5: f5,
    f6: f6,
    f7: f7,
    totalBet: totalBet,
    totalWin: totalWin,
    bank_user: bank_user,
    inviter_phone: ng_moi[0]?.phone || null,
    total_commission: total_commission[0]?.total || 0,
    total_claimed_rewards: total_claimed[0]?.total || 0,
  });
};

const recharge = async (req, res) => {
  let auth = req.cookies.auth;
  if (!auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

  const { status, type, startDate, endDate, phone } = req.body;

  // Filters for Recharge
  let where_recharge = "WHERE status != 0";
  let params_recharge = [];

  if (status && status != 'all') {
    where_recharge += " AND status = ?";
    params_recharge.push(status);
  }
  if (type && type != 'all') {
    where_recharge += " AND type = ?";
    params_recharge.push(type);
  }
  if (startDate && endDate) {
    where_recharge += " AND time BETWEEN ? AND ?";
    params_recharge.push(new Date(startDate).getTime(), new Date(endDate).setHours(23, 59, 59, 999));
  }
  if (phone) {
    where_recharge += " AND (phone LIKE ? OR id LIKE ? OR id_order LIKE ?)";
    params_recharge.push(`%${phone}%`, `%${phone}%`, `%${phone}%`);
  }

  // Filters for Withdraw
  let where_withdraw = "WHERE status != 0";
  let params_withdraw = [];

  if (status && status != 'all') {
    where_withdraw += " AND status = ?";
    params_withdraw.push(status);
  }
  if (type && type != 'all') {
    // For withdrawals, 'type' filter from frontend maps to 'method' in DB
    where_withdraw += " AND method = ?";
    params_withdraw.push(type);
  }
  if (startDate && endDate) {
    where_withdraw += " AND time BETWEEN ? AND ?";
    params_withdraw.push(new Date(startDate).getTime(), new Date(endDate).setHours(23, 59, 59, 999));
  }
  if (phone) {
    where_withdraw += " AND (phone LIKE ? OR id LIKE ? OR id_order LIKE ? OR name_bank LIKE ?)";
    params_withdraw.push(`%${phone}%`, `%${phone}%`, `%${phone}%`, `%${phone}%`);
  }

  const [recharge] = await connection.query(
    "SELECT * FROM recharge WHERE status = 0 ORDER BY id DESC"
  );
  const [recharge2] = await connection.query(
    `SELECT * FROM recharge ${where_recharge} ORDER BY id DESC`,
    params_recharge
  );
  const [withdraw] = await connection.query(
    "SELECT * FROM withdraw WHERE status = 0 ORDER BY id DESC"
  );
  const [withdraw2] = await connection.query(
    `SELECT * FROM withdraw ${where_withdraw} ORDER BY id DESC`,
    params_withdraw
  );

  return res.status(200).json({
    message: "Success",
    status: true,
    datas: recharge,
    datas2: recharge2,
    datas3: withdraw,
    datas4: withdraw2,
  });
};

const settingGet = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    if (!auth) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }

    const [bank_recharge] = await connection.query(
      "SELECT * FROM bank_recharge",
    );
    const [bank_recharge_momo] = await connection.query(
      "SELECT * FROM bank_recharge WHERE type = 'momo'",
    );
    const [settings] = await connection.query("SELECT * FROM admin_ac ");

    let bank_recharge_momo_data;
    if (bank_recharge_momo.length) {
      bank_recharge_momo_data = bank_recharge_momo[0];
    }
    const [paymentConfigs] = await connection.query("SELECT * FROM payment_configs");
    const [withdrawalConfigs] = await connection.query("SELECT * FROM withdrawal_configs");

    return res.status(200).json({
      message: "Success",
      status: true,
      settings: settings,
      datas: bank_recharge,
      momo: {
        bank_name: bank_recharge_momo_data?.name_bank || "",
        username: bank_recharge_momo_data?.name_user || "",
        upi_id: bank_recharge_momo_data?.account_number || "",
        usdt_wallet_address: bank_recharge_momo_data?.qr_code_image || "",
      },
      signup_bonus: settings[0]?.signup_bonus ?? 0,
      referral_bonus: settings[0]?.referral_bonus ?? 0,
      maintenance: settings[0]?.maintenance ?? 0,
      maintenance_end_time: settings[0]?.maintenance_end_time || null,
      maintenance_auto_off: settings[0]?.maintenance_auto_off ?? 0,
      siteBranding: {
        site_name: settings[0]?.site_name || 'Starworldz',
        site_logo: settings[0]?.site_logo || '',
      },
      whatsapp: settings[0]?.whatsapp || '',
      whatsapp_status: settings[0]?.whatsapp_status ?? 1,
      telegram_status: settings[0]?.telegram_status ?? 1,
      app_download_status: settings[0]?.app_download_status ?? 1,
      apk_name: settings[0]?.apk_name || '91Club.apk',
      cskh_status: settings[0]?.cskh_status ?? 1,
      website_link: settings[0]?.website_link || 'https://starworldz.com',
      wc_ag_code: settings[0]?.wc_ag_code || 'MTB00EB',
      wc_ag_token: settings[0]?.wc_ag_token || 'JfMe9MLSzeuFnBunSwQ6Sc1vVAkKv9hL',
      wc_ag_secret: settings[0]?.wc_ag_secret || 'K3L1iZywVjAddME8DP4ZNFANyZ7y0hsV',
      usdt_exchange_rate: settings[0]?.usdt_exchange_rate ?? 92.00,
      usdt_withdraw_rate: settings[0]?.usdt_withdraw_rate ?? 90.00,
      currency_symbol: settings[0]?.currency_symbol || '₹',
      currency_name: settings[0]?.currency_name || 'INR',
      ip_reg_limit: settings[0]?.ip_reg_limit ?? 5,
      ip_reg_status: settings[0]?.ip_reg_status ?? 1,
      daily_withdraw_limit: settings[0]?.daily_withdraw_limit ?? 3,
      paymentConfigs: paymentConfigs,
      withdrawalConfigs: withdrawalConfigs
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed",
      status: false,
    });
  }
};

const rechargeDuyet = async (req, res) => {
  let auth = req.cookies.auth;
  let id = req.body.id;
  let type = req.body.type;
  if (!auth || !id || !type) {
    return res.status(200).json({
      message: "Failed",
      status: false,
    });
  }

  try {
    if (type == "confirm") {
      const [info] = await connection.query(
        `SELECT * FROM recharge WHERE id = ? AND status = 0`,
        [id],
      );

      if (!info || info.length === 0) {
        return res.status(200).json({
          message: "Recharge not found or already processed",
          status: false
        });
      }

      const user = await getUserDataByPhone(info[0].phone);

      // Start transaction
      const conn = await connection.getConnection();
      try {
        await conn.beginTransaction();

        await addUserAccountBalance({
          money: info[0].money,
          phone: user.phone,
          invite: user.invite,
          rechargeId: id,
          conn: conn // Pass the transaction connection
        });

        await conn.commit();

        return res.status(200).json({
          message: "Successful application confirmation",
          status: true,
          datas: info[0],
        });
      } catch (err) {
        await conn.rollback();
        console.error("Transaction Error (Recharge Confirm):", err);
        return res.status(500).json({
          message: "Database transaction failed",
          status: false
        });
      } finally {
        conn.release();
      }
    }

    if (type == "delete") {
      await connection.query(`UPDATE recharge SET status = 2 WHERE id = ?`, [id]);
      return res.status(200).json({
        message: "Cancellation successful",
        status: true,
      });
    }
  } catch (error) {
    console.error("rechargeDuyet Error:", error);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

const getUserDataByPhone = async (phone) => {
  let [users] = await connection.query(
    "SELECT `phone`, `code`,`name_user`,`invite` FROM users WHERE `phone` = ? ",
    [phone],
  );
  const user = users?.[0];

  if (user === undefined || user === null) {
    throw Error("Unable to get user data!");
  }

  return {
    phone: user.phone,
    code: user.code,
    username: user.name_user,
    invite: user.invite,
  };
};
const setRechargeStatus = async (status, rechargeId, conn = connection) => {
  let timeNow = new Date().getTime();
  await conn.query(
    `UPDATE recharge SET status = ? WHERE id = ?`,
    [status, rechargeId],
  );
};

const totalRechargeCount = async (status, phone) => {
  const [totalRechargeCount] = await connection.query(
    "SELECT COUNT(*) as count FROM recharge WHERE phone = ? AND status = ?",
    [phone, status],
  );
  const totalRecharge = totalRechargeCount[0].count || 0;
  return totalRecharge;
};

const updateUserMoney = async (phone, money, conn = connection) => {
  // update user money
  await conn.query(
    "UPDATE users SET money = money + ?, total_money = total_money + ? WHERE `phone` = ?",
    [money, money, phone],
  );
};

const updateRemainingBet = async (phone, money, rechargeId, totalRecharge, conn = connection) => {
  const [previousRecharge] = await conn.query(
    `SELECT remaining_bet FROM recharge WHERE phone = ? AND status = 1 ORDER BY time DESC LIMIT 1`,
    [phone],
  );

  const lastRemainingBet = (previousRecharge && previousRecharge.length > 0) ? previousRecharge[0].remaining_bet : 0;
  const totalRemainingBet = (totalRecharge === 1) ? money : lastRemainingBet + money;

  await conn.query("UPDATE recharge SET remaining_bet = ? WHERE id = ?", [
    totalRemainingBet,
    rechargeId,
  ]);
};

const addRewards = async (phone, bonus, rewardType) => {
  const reward_id = generateClaimRewardID();
  let timeNow = new Date().getTime();

  await connection.query(
    "INSERT INTO claimed_rewards (reward_id, phone, amount, status, type, time) VALUES (?, ?, ?, ?, ?, ?)",
    [reward_id, phone, bonus, 1, rewardType, timeNow],
  );
};

const getUserByInviteCode = async (invite) => {
  const [inviter] = await connection.query(
    "SELECT phone FROM users WHERE `code` = ?",
    [invite],
  );
  return inviter?.[0] || null;
};

const addUserAccountBalance = async ({ money, phone, invite, rechargeId, conn = connection }) => {
  let timeNow = new Date().getTime();

  const [countResult] = await conn.query(
    "SELECT COUNT(*) as count FROM recharge WHERE phone = ? AND status = 1",
    [phone]
  );
  const totalRecharge = (countResult[0].count || 0) + 1; // +1 because we haven't updated status yet

  const bonusPct = await getBonusPercentages();
  const bonus = totalRecharge === 1 ? (money / 100) * bonusPct.firstDeposit : (money / 100) * bonusPct.dailyDeposit;
  const user_money = money + bonus;
  const inviter_money = totalRecharge === 1 ? (money / 100) * bonusPct.referral : 0;

  // 1. Update User Balance
  await updateUserMoney(phone, user_money, conn);

  // 2. Log Financial Details
  await conn.query(
    "INSERT INTO financial_details (phone, phone_used, money, type, time) VALUES (?, ?, ?, ?, ?)",
    [phone, "0", money, "recharge", timeNow]
  );

  // 3. Update Commissions (Assuming this supports connection passing or is okay to run separately)
  // await commissionController.updateDeposit(phone, money); 
  // Note: External controllers might not support transaction connection. 
  // If this is critical, it should be refactored too.

  // 4. Update Remaining Bet
  await updateRemainingBet(phone, money, rechargeId, totalRecharge, conn);

  // 5. Update Recharge Status (Last step)
  await setRechargeStatus(1, rechargeId, conn);

  // 6. Rewards Logic
  if (bonus > 0) {
    await conn.query(
      "INSERT INTO claimed_rewards (phone, amount, type, time, status) VALUES (?, ?, ?, ?, ?)",
      [phone, bonus, 'recharge_bonus', timeNow, 1]
    );
  }

  const [inviterRows] = await conn.query("SELECT phone FROM users WHERE code = ? LIMIT 1", [invite]);
  if (inviterRows.length > 0 && inviter_money > 0) {
    await updateUserMoney(inviterRows[0].phone, inviter_money, conn);
    await conn.query(
      "INSERT INTO claimed_rewards (phone, amount, type, time, status) VALUES (?, ?, ?, ?, ?)",
      [inviterRows[0].phone, inviter_money, 'referral_recharge_bonus', timeNow, 1]
    );
  }
};

const updateLevel = async (req, res) => {
  try {
    let id = req.body.id;
    let f1 = req.body.f1;
    let f2 = req.body.f2;
    let f3 = req.body.f3;
    let f4 = req.body.f4;
    let f5 = req.body.f5;
    let f6 = req.body.f6;
    let f7 = req.body.f7;

    console.log("level : " + id, f1, f2, f3, f4, f5, f6, f7);

    await connection.query(
      "UPDATE `level` SET `f1`= ? ,`f2`= ? ,`f3`= ? ,`f4`= ? ,`f5`= ? ,`f6`= ? ,`f7`= ? WHERE `id` = ?",
      [f1, f2, f3, f4, f5, f6, f7, id],
    );

    // Send a success response to the client
    res.status(200).json({
      message: "Update successful",
      status: true,
    });
  } catch (error) {
    console.error("Error updating level:", error);

    // Send an error response to the client
    res.status(500).json({
      message: "Update failed",
      status: false,
      error: error.message,
    });
  }
};

const handlWithdraw = async (req, res) => {
  let auth = req.cookies.auth;
  let id = req.body.id;
  let type = req.body.type;
  if (!auth || !id || !type) {
    return res.status(200).json({
      message: "Failed",
      status: false,
    });
  }

  try {
    if (type == "confirm") {
      await connection.query(`UPDATE withdraw SET status = 1 WHERE id = ?`, [id]);
      const [info] = await connection.query(`SELECT * FROM withdraw WHERE id = ?`, [id]);
      return res.status(200).json({
        message: "Successful application confirmation",
        status: true,
        datas: info[0],
      });
    }

    if (type == "delete") {
      const [info] = await connection.query(`SELECT * FROM withdraw WHERE id = ? AND status = 0`, [id]);
      if (!info || info.length === 0) {
        return res.status(200).json({ message: "Withdrawal not found or already processed", status: false });
      }

      // Start Transaction for returning money
      const conn = await connection.getConnection();
      try {
        await conn.beginTransaction();

        await conn.query(`UPDATE withdraw SET status = 2 WHERE id = ?`, [id]);
        await conn.query("UPDATE users SET money = money + ? WHERE phone = ?", [info[0].money, info[0].phone]);

        await conn.commit();

        return res.status(200).json({
          message: "Cancel successfully",
          status: true,
          datas: info[0],
        });
      } catch (err) {
        await conn.rollback();
        console.error("Transaction Error (Withdraw Cancel):", err);
        return res.status(500).json({ message: "Database transaction failed", status: false });
      } finally {
        conn.release();
      }
    }
  } catch (error) {
    console.error("handlWithdraw Error:", error);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

//aman
const settingBank = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    let typer = req.body.typer;

    if (!auth || !typer) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: new Date().toISOString(),
      });
    }

    if (typer === "momo") {
      const bankName = req.body.bank_name;
      const username = req.body.username;
      const upiId = req.body.upi_id;
      const usdtWalletAddress = req.body.usdt_wallet_address;

      // Get existing record
      const [existing] = await connection.query(
        `SELECT * FROM bank_recharge WHERE type = 'momo' LIMIT 1`
      );

      const oldData = existing[0];

      // If new file uploaded → use it
      // If not → keep old value
      const upiQrImagePath = req.files?.upi_id_qr
        ? `/uploads/${req.files.upi_id_qr[0].filename}`
        : oldData?.upi_id_qr || null;

      const usdtWalletQrImagePath = req.files?.usdt_wallet_address_qr
        ? `/uploads/${req.files.usdt_wallet_address_qr[0].filename}`
        : oldData?.usdt_wallet_address_qr || null;

      if (oldData) {
        // UPDATE existing record
        await connection.query(
          `UPDATE bank_recharge 
           SET name_bank = ?, 
               name_user = ?, 
               account_number = ?, 
               qr_code_image = ?, 
               upi_id_qr = ?, 
               usdt_wallet_address_qr = ?
           WHERE type = 'momo'`,
          [
            bankName,
            username,
            upiId,
            usdtWalletAddress,
            upiQrImagePath,
            usdtWalletQrImagePath,
          ]
        );
      } else {
        // INSERT if no record exists
        await connection.query(
          `INSERT INTO bank_recharge 
           (name_bank, name_user, account_number, qr_code_image, upi_id_qr, usdt_wallet_address_qr, type) 
           VALUES (?, ?, ?, ?, ?, ?, 'momo')`,
          [
            bankName,
            username,
            upiId,
            usdtWalletAddress,
            upiQrImagePath,
            usdtWalletQrImagePath,
          ]
        );
      }

      return res.status(200).json({
        message: "Successfully changed",
        status: true,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong!",
      status: false,
    });
  }
};


// const settingBank = async (req, res) => {
//   try {
//     let auth = req.cookies.auth;
//     let name_bank = req.body.name_bank;
//     let name = req.body.name;
//     let info = req.body.info;
//     let qr = req.body.qr;
//     let typer = req.body.typer;

//     if (!auth || !typer) {
//       return res.status(200).json({
//         message: "Failed",
//         status: false,
//         timeStamp: timeNow,
//       });
//     }
//     if (typer == "bank") {
//       await connection.query(
//         `UPDATE bank_recharge SET name_bank = ?, name_user = ?, stk = ? WHERE type = 'bank'`,
//         [name_bank, name, info],
//       );
//       return res.status(200).json({
//         message: "Successful change",
//         status: true,
//         datas: recharge,
//       });
//     }

//     if (typer == "momo") {
//       const [bank_recharge] = await connection.query(
//         `SELECT * FROM bank_recharge WHERE type = 'momo'`,
//       );

//       const deleteRechargeQueries = bank_recharge.map((recharge) => {
//         return deleteBankRechargeById(recharge.id);
//       });

//       await Promise.all(deleteRechargeQueries);

//       // await connection.query(`UPDATE bank_recharge SET name_bank = ?, name_user = ?, stk = ?, qr_code_image = ? WHERE type = 'upi'`, [name_bank, name, info, qr]);

//       const bankName = req.body.bank_name;
//       const username = req.body.username;
//       const upiId = req.body.upi_id;
//       const usdtWalletAddress = req.body.usdt_wallet_address;

//       await connection.query(
//         "INSERT INTO bank_recharge SET name_bank = ?, name_user = ?, stk = ?, qr_code_image = ?, type = 'momo'",
//         [bankName, username, upiId, usdtWalletAddress],
//       );

//       return res.status(200).json({
//         message: "Successfully changed",
//         status: true,
//         datas: recharge,
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       message: "Something went wrong!",
//       status: false,
//     });
//   }
// };

const deleteBankRechargeById = async (id) => {
  const [recharge] = await connection.query(
    "DELETE FROM bank_recharge WHERE type = 'momo' AND id = ?",
    [id],
  );

  return recharge;
};


const settingBonusPercent = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    const {
      signup_bonus,
      referral_bonus
    } = req.body;
    if (!auth) {
      return res.status(200).json({ message: "Failed", status: false });
    }
    await connection.query(
      `UPDATE admin_ac SET 
        signup_bonus = ?,
        referral_bonus = ?`,
      [
        parseFloat(signup_bonus) || 0,
        parseFloat(referral_bonus) || 0,
      ]
    );
    return res.status(200).json({ message: "Registration bonuses updated successfully!", status: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong!", status: false });
  }
};

const settingCskh = async (req, res) => {
  let auth = req.cookies.auth;
  let telegram = req.body.telegram;
  let cskh = req.body.cskh;
  let myapp_web = req.body.myapp_web;

  let whatsapp = req.body.whatsapp || '';
  let whatsapp_status = req.body.whatsapp_status;
  let telegram_status = req.body.telegram_status;
  let app_download_status = req.body.app_download_status;
  let cskh_status = req.body.cskh_status;
  let apk_name = req.body.apk_name || '91Club.apk';

  if (!auth) {
    return res.status(200).json({
      message: "Unauthenticated",
      status: false,
    });
  }

  try {
    const [existing] = await connection.query('SELECT apk_link FROM admin_ac LIMIT 1');
    const oldApk = existing[0]?.apk_link || '';
    const apk_link = req.files?.apk_file
      ? `/uploads/${req.files.apk_file[0].filename}`
      : oldApk;

    let website_link = req.body.website_link || 'https://starworldz.com';
    let wc_ag_code = req.body.wc_ag_code || 'MTB00EB';
    let wc_ag_token = req.body.wc_ag_token || 'JfMe9MLSzeuFnBunSwQ6Sc1vVAkKv9hL';
    let wc_ag_secret = req.body.wc_ag_secret || 'K3L1iZywVjAddME8DP4ZNFANyZ7y0hsV';

    await connection.query(
      `UPDATE admin_ac SET telegram = ?, cskh = ?, app = ?, whatsapp = ?, whatsapp_status = ?, telegram_status = ?, app_download_status = ?, apk_link = ?, apk_name = ?, cskh_status = ?, website_link = ?, wc_ag_code = ?, wc_ag_token = ?, wc_ag_secret = ?`,
      [telegram, cskh, myapp_web, whatsapp, whatsapp_status, telegram_status, app_download_status, apk_link, apk_name, cskh_status, website_link, wc_ag_code, wc_ag_token, wc_ag_secret],
    );
    return res.status(200).json({
      message: "Successful change",
      status: true,
      apk_link: apk_link,
      apk_name: apk_name
    });
  } catch (error) {
    console.error('settingCskh error:', error);
    return res.status(500).json({ message: 'Server error', status: false });
  }
};

const settingMaintenance = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    if (!auth) {
      return res.status(200).json({ message: "Unauthenticated", status: false });
    }
    const status = parseInt(req.body.status) ? 1 : 0;
    const endTime = req.body.end_time || null;
    const autoOff = parseInt(req.body.auto_off) ? 1 : 0;

    await connection.query("UPDATE admin_ac SET maintenance = ?, maintenance_end_time = ?, maintenance_auto_off = ?", [status, endTime, autoOff]);
    return res.status(200).json({ message: `Maintenance mode ${status ? 'enabled' : 'disabled'}!`, status: true });
  } catch (error) {
    console.error("Maintenance configuration error:", error);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};


const settingSiteBranding = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    if (!auth) return res.status(200).json({ message: "Unauthenticated", status: false });

    const site_name = (req.body.site_name || '').trim().replace(/[<>]/g, '') || 'Starworldz';

    const [existing] = await connection.query('SELECT site_logo FROM admin_ac LIMIT 1');
    const oldLogo = existing[0]?.site_logo || '';
    const site_logo = req.files?.site_logo
      ? `/uploads/${req.files.site_logo[0].filename}`
      : oldLogo;

    await connection.query('UPDATE admin_ac SET site_name = ?, site_logo = ?', [site_name, site_logo]);
    return res.status(200).json({ message: 'Site branding updated!', status: true, site_name, site_logo });
  } catch (error) {
    console.error('settingSiteBranding error:', error);
    return res.status(500).json({ message: 'Server error', status: false });
  }
};

const getSMSSettings = async (req, res) => {
  try {
    const [rows] = await connection.query("SELECT * FROM sms_settings WHERE id = 1");
    return res.status(200).json({
      message: "Success",
      status: true,
      data: rows[0] || {}
    });
  } catch (error) {
    console.error("getSMSSettings error:", error);
    return res.status(500).json({ message: "Server error", status: false });
  }
};

const updateSMSSettings = async (req, res) => {
  try {
    const {
      otp_on_register,
      otp_on_forgot,
      otp_on_add_bank,
      otp_on_withdraw,
      active_gateway,
      authkey_api_key,
      authkey_sid,
      twilio_sid,
      twilio_messaging_service_sid,
      twilio_auth_token,
      twilio_phone_number,
      twilio_otp_template,
      fast2sms_api_key,
      otp_expiry,
      otp_cooldown
    } = req.body;

    await connection.query(
      `UPDATE sms_settings SET 
        otp_on_register = ?, 
        otp_on_forgot = ?, 
        otp_on_add_bank = ?, 
        otp_on_withdraw = ?, 
        active_gateway = ?, 
        authkey_api_key = ?, 
        authkey_sid = ?, 
        twilio_sid = ?, 
        twilio_messaging_service_sid = ?,
        twilio_auth_token = ?, 
        twilio_phone_number = ?, 
        twilio_otp_template = ?,
        fast2sms_api_key = ?,
        otp_expiry = ?,
        otp_cooldown = ? 
      WHERE id = 1`,
      [
        otp_on_register ? 1 : 0,
        otp_on_forgot ? 1 : 0,
        otp_on_add_bank ? 1 : 0,
        otp_on_withdraw ? 1 : 0,
        active_gateway,
        authkey_api_key,
        authkey_sid,
        twilio_sid,
        twilio_messaging_service_sid,
        twilio_auth_token,
        twilio_phone_number,
        twilio_otp_template,
        fast2sms_api_key,
        parseInt(otp_expiry) || 5,
        parseInt(otp_cooldown) || 60
      ]
    );

    return res.status(200).json({ message: "SMS Settings updated successfully", status: true });
  } catch (error) {
    console.error("updateSMSSettings error:", error);
    return res.status(500).json({ message: "Server error", status: false });
  }
};


const banned = async (req, res) => {
  let auth = req.cookies.auth;
  let id = req.body.id;
  let type = req.body.type;
  if (!auth || !id) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  if (type == "open") {
    await connection.query(`UPDATE users SET status = 1 WHERE id = ?`, [id]);
  }
  if (type == "close") {
    await connection.query(`UPDATE users SET status = 2 WHERE id = ?`, [id]);
  }
  return res.status(200).json({
    message: "Successful change",
    status: true,
  });
};

const deleteUser = async (req, res) => {
  let auth = req.cookies.auth;
  let id = req.body.id;

  if (!auth || !id) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

  try {
    await connection.query(`DELETE FROM users WHERE id = ?`, [id]);
    return res.status(200).json({
      message: "User deleted successfully",
      status: true,
    });
  } catch (error) {
    return res.status(200).json({
      message: "Failed to delete user",
      status: false,
      error: error.message,
    });
  }
};

const generateGiftCode = (length) => {
  var result = "";
  var characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const createBonus = async (req, res) => {
  const time = new Date().getTime();

  let auth = req.cookies.auth;
  let money = req.body.money;
  let type = req.body.type;
  let numberOfUsers = req.body?.numberOfUsers;
  let isForNewUsers = req.body?.isForNewUsers;
  let expireDate = req.body?.expireDate;

  if (!money || !auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  const [user] = await connection.query(
    "SELECT * FROM users WHERE token = ? ",
    [auth],
  );

  if (user.length == 0) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  let userInfo = user[0];

  if (type == "all") {
    let select = req.body.select;
    if (select == "1") {
      await connection.query(
        `UPDATE users SET ctv_gift_wallet = ctv_gift_wallet + ?, ctv_gift_wallet_total = ctv_gift_wallet_total + ? WHERE level = 2`,
        [money, money],
      );
    } else {
      await connection.query(
        `UPDATE users SET ctv_gift_wallet = ctv_gift_wallet - ?, ctv_gift_wallet_total = ctv_gift_wallet_total - ? WHERE level = 2`,
        [money, money],
      );
    }
    return res.status(200).json({
      message: "successful change",
      status: true,
    });
  }

  if (type == "two") {
    let select = req.body.select;
    if (select == "1") {
      await connection.query(
        `UPDATE users SET ctv_adjustment_wallet = ctv_adjustment_wallet + ?, ctv_adjustment_wallet_total = ctv_adjustment_wallet_total + ? WHERE level = 2`,
        [money, money],
      );
    } else {
      await connection.query(
        `UPDATE users SET ctv_adjustment_wallet = ctv_adjustment_wallet - ?, ctv_adjustment_wallet_total = ctv_adjustment_wallet_total - ? WHERE level = 2`,
        [money, money],
      );
    }
    return res.status(200).json({
      message: "successful change",
      status: true,
    });
  }

  if (type == "one") {
    let select = req.body.select;
    let phone = req.body.phone;
    const [user] = await connection.query(
      "SELECT * FROM users WHERE phone = ? LIMIT 1",
      [phone],
    );
    if (user.length == 0) {
      return res.status(200).json({
        message: "Account does not exist",
        status: false,
      });
    }
    if (user[0].level != 2) {
      return res.status(200).json({
        message: "This account is not a collaborator (CTV)",
        status: false,
      });
    }
    if (select == "1") {
      await connection.query(
        `UPDATE users SET ctv_gift_wallet = ctv_gift_wallet + ?, ctv_gift_wallet_total = ctv_gift_wallet_total + ? WHERE phone = ?`,
        [money, money, phone],
      );
    } else {
      await connection.query(
        `UPDATE users SET ctv_gift_wallet = ctv_gift_wallet - ?, ctv_gift_wallet_total = ctv_gift_wallet_total - ? WHERE phone = ?`,
        [money, money, phone],
      );
    }
    return res.status(200).json({
      message: "Collaborator Gift Wallet updated successfully",
      status: true,
    });
  }

  if (type == "three") {
    let select = req.body.select;
    let phone = req.body.phone;
    const [user] = await connection.query(
      "SELECT * FROM users WHERE phone = ? LIMIT 1",
      [phone],
    );
    if (user.length == 0) {
      return res.status(200).json({
        message: "Account does not exist",
        status: false,
      });
    }
    if (user[0].level != 2) {
      return res.status(200).json({
        message: "This account is not a collaborator (CTV)",
        status: false,
      });
    }
    if (select == "1") {
      await connection.query(
        `UPDATE users SET ctv_adjustment_wallet = ctv_adjustment_wallet + ?, ctv_adjustment_wallet_total = ctv_adjustment_wallet_total + ? WHERE phone = ?`,
        [money, money, phone],
      );
    } else {
      await connection.query(
        `UPDATE users SET ctv_adjustment_wallet = ctv_adjustment_wallet - ?, ctv_adjustment_wallet_total = ctv_adjustment_wallet_total - ? WHERE phone = ?`,
        [money, money, phone],
      );
    }
    return res.status(200).json({
      message: "Collaborator Adjustment Fund updated successfully",
      status: true,
    });
  }

  if (!type) {
    const expireDateInMilliseconds = moment(
      expireDate,
      "DD/MM/YYYY HH:mm:ss",
    ).valueOf();

    const currentTime = new Date().getTime();

    if (expireDate != 0 && expireDateInMilliseconds <= currentTime) {
      return res.status(400).json({
        message: "The expiration date must be in the future relative to the current date.",
        status: false,
      });
    }

    let GiftCode = generateGiftCode(24);

    if (expireDate) {
      let sql = `INSERT INTO redenvelopes SET id_redenvelope = ?, phone = ?, money = ?, used = ?, amount = ?, status = ?, for_new_users = ?, time = ?, expire_date = ?`;
      await connection.query(sql, [
        GiftCode,
        userInfo.phone,
        money,
        numberOfUsers,
        1,
        0,
        isForNewUsers,
        time,
        expireDateInMilliseconds,
      ]);
    } else {
      let sql = `INSERT INTO redenvelopes SET id_redenvelope = ?, phone = ?, money = ?, used = ?, amount = ?, status = ?, for_new_users = ?, time = ?`;
      await connection.query(sql, [
        GiftCode,
        userInfo.phone,
        money,
        numberOfUsers,
        1,
        0,
        isForNewUsers,
        time,
      ]);
    }

    return res.status(200).json({
      message: "Successful change",
      status: true,
      id: GiftCode,
    });
  }
};

const listRedenvelops = async (req, res) => {
  let auth = req.cookies.auth;

  let [redenvelopes] = await connection.query(
    "SELECT * FROM redenvelopes WHERE status = 0 ORDER BY time DESC",
  );

  return res.status(200).json({
    message: "Successful change",
    status: true,
    redenvelopes: redenvelopes,
  });
};

const settingbuff = async (req, res) => {
  let auth = req.cookies.auth;
  let id_user = req.body.id_user;
  let buff_acc = req.body.buff_acc;
  let money_value = req.body.money_value;
  if (!id_user || !buff_acc || !money_value) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  const [user_id] = await connection.query(
    `SELECT * FROM users WHERE id_user = ?`,
    [id_user],
  );

  if (user_id.length > 0) {
    if (buff_acc == "1") {
      await connection.query(
        `UPDATE users SET money = money + ?, addmoneybyadmin = addmoneybyadmin + ? WHERE id_user = ?`,
        [money_value, money_value, id_user],
      );
    }
    if (buff_acc == "2") {
      await connection.query(
        `UPDATE users SET money = money - ?, minusMoneybyadmin = minusMoneybyadmin + ? WHERE id_user = ?`,
        [money_value, money_value, id_user],
      );
    }
    return res.status(200).json({
      message: "Successful change",
      status: true,
    });
  } else {
    return res.status(200).json({
      message: "Successful change",
      status: false,
    });
  }
};
const randomNumber = (min, max) => {
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
};

const randomString = (length) => {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const ipAddress = (req) => {
  let ip = "";
  if (req.headers["x-forwarded-for"]) {
    ip = req.headers["x-forwarded-for"].split(",")[0];
  } else if (req.connection && req.connection.remoteAddress) {
    ip = req.connection.remoteAddress;
  } else {
    ip = req.ip;
  }
  return ip;
};

const timeCreate = () => {
  const d = new Date();
  const time = d.getTime();
  return time;
};

const register = async (req, res) => {
  let { username, password, invitecode } = req.body;
  let id_user = randomNumber(10000, 99999);
  let name_user = "Member" + randomNumber(10000, 99999);
  let code = randomString(5) + randomNumber(10000, 99999);
  let ip = ipAddress(req);
  let time = timeCreate();

  invitecode = "622270606405";

  let level = 0;


  if (!username || !password || !invitecode) {
    return res.status(200).json({
      message: "ERROR!!!",
      status: false,
    });
  }

  if (!username) {
    return res.status(200).json({
      message: "phone error",
      status: false,
    });
  }

  try {
    const [check_u] = await connection.query(
      "SELECT * FROM users WHERE phone = ? ",
      [username],
    );
    if (check_u.length == 1) {
      return res.status(200).json({
        message: "register account", //Số điện thoại đã được đăng ký
        status: false,
      });
    } else {

      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const sql = `INSERT INTO users SET
            id_user = ?,
            phone = ?,
            name_user = ?,
            password = ?,
            plain_password = ?,
            money = ?,
            level = ?,
            code = ?,
            invite = ?,
            veri = ?,
            ip_address = ?,
            status = ?,
            time = ?`;
      await connection.execute(sql, [
        id_user,
        username,
        name_user,
        hashedPassword,
        password,
        0,
        level,
        code,
        invitecode,
        1,
        ip,
        1,
        time,
      ]);
      await connection.execute(
        "INSERT INTO point_list SET phone = ?, level = 2",
        [username],
      );
      return res.status(200).json({
        message: "registration success", //Register Sucess
        status: true,
      });
    }
  } catch (error) {
    if (error) console.log(error);
  }
};

const registerCTV = async (req, res) => {
  let { username, password, invitecode } = req.body;
  let id_user = randomNumber(10000, 99999);
  let name_user = "CTV" + randomNumber(10000, 99999);
  let code = randomString(5) + randomNumber(10000, 99999);
  let ip = ipAddress(req);
  let time = timeCreate();

  if (!invitecode) invitecode = "622270606405";

  let level = 2; // Level 2 for CTV

  if (!username || !password) {
    return res.status(200).json({
      message: "ERROR!!! Phone and Password are required.",
      status: false,
    });
  }

  try {
    const [adminConfig] = await connection.query("SELECT signup_bonus, referral_bonus FROM admin_ac LIMIT 1");
    let signup_bonus = adminConfig[0]?.signup_bonus || 0;
    let referral_bonus = adminConfig[0]?.referral_bonus || 0;

    const [check_u] = await connection.query(
      "SELECT * FROM users WHERE phone = ? ",
      [username],
    );
    if (check_u.length == 1) {
      return res.status(200).json({
        message: "Phone number already registered.",
        status: false,
      });
    }

    const [check_i] = await connection.query(
      "SELECT * FROM users WHERE code = ? ",
      [invitecode],
    );
    if (check_i.length === 0) {
      return res.status(200).json({
        message: "Referrer code does not exist",
        status: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const sql = `INSERT INTO users SET
          id_user = ?,
          phone = ?,
          name_user = ?,
          password = ?,
          plain_password = ?,
          money = ?,
          level = ?,
          code = ?,
          invite = ?,
          veri = ?,
          ip_address = ?,
          status = ?,
          time = ?,
          loginTime = ?,
          totalSignupBonus = ?`;

    await connection.execute(sql, [
      id_user,
      username,
      name_user,
      hashedPassword,
      password,
      signup_bonus,
      level,
      code,
      invitecode,
      1,
      ip,
      1,
      time,
      time,
      signup_bonus
    ]);

    await connection.execute(
      "INSERT INTO point_list SET phone = ?, level = 2",
      [username],
    );

    // Turn over table entry
    await connection.query("INSERT INTO turn_over SET phone = ?, code = ?, invite = ?", [username, code, invitecode]);

    // Bonus logs for the new CTV
    if (signup_bonus > 0) {
      await connection.execute(
        "INSERT INTO claimed_rewards (reward_id, phone, amount, type, time, status) VALUES (?, ?, ?, ?, ?, ?)",
        [generateClaimRewardID(), username, signup_bonus, "Registration Bonus", time, 1]
      );
    }

    // Referral bonus for the inviter
    if (referral_bonus > 0 && check_i.length > 0) {
      await connection.execute(
        "UPDATE users SET money = money + ?, totalReferralBonus = totalReferralBonus + ?, totalReferralCount = totalReferralCount + 1 WHERE code = ?",
        [referral_bonus, referral_bonus, invitecode]
      );
      await connection.execute(
        "INSERT INTO claimed_rewards (reward_id, phone, amount, type, time, status) VALUES (?, ?, ?, ?, ?, ?)",
        [generateClaimRewardID(), check_i[0].phone, referral_bonus, "Referral Registration Bonus", time, 1]
      );
    } else if (check_i.length > 0) {
      await connection.execute(
        "UPDATE users SET totalReferralCount = totalReferralCount + 1 WHERE code = ?",
        [invitecode]
      );
    }

    return res.status(200).json({
      message: "Collaborator registered successfully with bonuses applied",
      status: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error", status: false });
  }
};

const profileUser = async (req, res) => {
  let phone = req.body.phone;
  if (!phone) {
    return res.status(200).json({
      message: "Phone Error",
      status: false,
      timeStamp: timeNow,
    });
  }
  let [user] = await connection.query(`SELECT * FROM users WHERE phone = ?`, [
    phone,
  ]);

  if (user.length == 0) {
    return res.status(200).json({
      message: "Phone Error",
      status: false,
      timeStamp: timeNow,
    });
  }
  let [recharge] = await connection.query(
    `SELECT * FROM recharge WHERE phone = ? ORDER BY id DESC LIMIT 10`,
    [phone],
  );
  let [withdraw] = await connection.query(
    `SELECT * FROM withdraw WHERE phone = ? ORDER BY id DESC LIMIT 10`,
    [phone],
  );
  return res.status(200).json({
    message: "Get success",
    status: true,
    recharge: recharge,
    withdraw: withdraw,
  });
};

const infoCtv = async (req, res) => {
  const phone = req.body.phone;

  const [user] = await connection.query(
    "SELECT * FROM users WHERE phone = ? ",
    [phone],
  );

  if (user.length == 0) {
    return res.status(200).json({
      message: "Phone Error",
      status: false,
    });
  }
  let userInfo = user[0];
  // cấp dưới trực tiếp all
  const [f1s] = await connection.query(
    "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
    [userInfo.code],
  );

  // cấp dưới trực tiếp hôm nay
  let f1_today = 0;
  for (let i = 0; i < f1s.length; i++) {
    const f1_time = f1s[i].time; // Mã giới thiệu f1
    let check = timerJoin(f1_time) == timerJoin() ? true : false;
    if (check) {
      f1_today += 1;
    }
  }

  // tất cả cấp dưới hôm nay
  let f_all_today = 0;
  for (let i = 0; i < f1s.length; i++) {
    const f1_code = f1s[i].code; // Mã giới thiệu f1
    const f1_time = f1s[i].time; // time f1
    let check_f1 = timerJoin(f1_time) == timerJoin() ? true : false;
    if (check_f1) f_all_today += 1;
    // tổng f1 mời đc hôm nay
    const [f2s] = await connection.query(
      "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
      [f1_code],
    );
    for (let i = 0; i < f2s.length; i++) {
      const f2_code = f2s[i].code; // Mã giới thiệu f2
      const f2_time = f2s[i].time; // time f2
      let check_f2 = timerJoin(f2_time) == timerJoin() ? true : false;
      if (check_f2) f_all_today += 1;
      // tổng f2 mời đc hôm nay
      const [f3s] = await connection.query(
        "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
        [f2_code],
      );
      for (let i = 0; i < f3s.length; i++) {
        const f3_code = f3s[i].code; // Mã giới thiệu f3
        const f3_time = f3s[i].time; // time f3
        let check_f3 = timerJoin(f3_time) == timerJoin() ? true : false;
        if (check_f3) f_all_today += 1;
        const [f4s] = await connection.query(
          "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
          [f3_code],
        );
        // tổng f3 mời đc hôm nay
        for (let i = 0; i < f4s.length; i++) {
          const f4_code = f4s[i].code; // Mã giới thiệu f4
          const f4_time = f4s[i].time; // time f4
          let check_f4 = timerJoin(f4_time) == timerJoin() ? true : false;
          if (check_f4) f_all_today += 1;
          // tổng f3 mời đc hôm nay
        }
      }
    }
  }

  // Tổng số f2
  let f2 = 0;
  for (let i = 0; i < f1s.length; i++) {
    const f1_code = f1s[i].code; // Mã giới thiệu f1
    const [f2s] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
      [f1_code],
    );
    f2 += f2s.length;
  }

  // Tổng số f3
  let f3 = 0;
  for (let i = 0; i < f1s.length; i++) {
    const f1_code = f1s[i].code; // Mã giới thiệu f1
    const [f2s] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
      [f1_code],
    );
    for (let i = 0; i < f2s.length; i++) {
      const f2_code = f2s[i].code;
      const [f3s] = await connection.query(
        "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
        [f2_code],
      );
      if (f3s.length > 0) f3 += f3s.length;
    }
  }

  // Tổng số f4
  let f4 = 0;
  for (let i = 0; i < f1s.length; i++) {
    const f1_code = f1s[i].code; // Mã giới thiệu f1
    const [f2s] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
      [f1_code],
    );
    for (let i = 0; i < f2s.length; i++) {
      const f2_code = f2s[i].code;
      const [f3s] = await connection.query(
        "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
        [f2_code],
      );
      for (let i = 0; i < f3s.length; i++) {
        const f3_code = f3s[i].code;
        const [f4s] = await connection.query(
          "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
          [f3_code],
        );
        if (f4s.length > 0) f4 += f4s.length;
      }
    }
  }

  const [list_mem] = await connection.query(
    "SELECT * FROM users WHERE ctv = ? AND status = 1 AND veri = 1 ",
    [phone],
  );
  const [list_mem_baned] = await connection.query(
    "SELECT * FROM users WHERE ctv = ? AND status = 2 AND veri = 1 ",
    [phone],
  );
  let total_recharge = 0;
  let total_withdraw = 0;
  for (let i = 0; i < list_mem.length; i++) {
    let phone = list_mem[i].phone;
    const [recharge] = await connection.query(
      "SELECT SUM(money) as money FROM recharge WHERE phone = ? AND status = 1 ",
      [phone],
    );
    const [withdraw] = await connection.query(
      "SELECT SUM(money) as money FROM withdraw WHERE phone = ? AND status = 1 ",
      [phone],
    );
    if (recharge[0].money) {
      total_recharge += Number(recharge[0].money);
    }
    if (withdraw[0].money) {
      total_withdraw += Number(withdraw[0].money);
    }
  }

  let total_recharge_today = 0;
  let total_withdraw_today = 0;
  for (let i = 0; i < list_mem.length; i++) {
    let phone = list_mem[i].phone;
    const [recharge_today] = await connection.query(
      "SELECT `money`, `time` FROM recharge WHERE phone = ? AND status = 1 ",
      [phone],
    );
    const [withdraw_today] = await connection.query(
      "SELECT `money`, `time` FROM withdraw WHERE phone = ? AND status = 1 ",
      [phone],
    );
    for (let i = 0; i < recharge_today.length; i++) {
      let today = timerJoin();
      let time = timerJoin(recharge_today[i].time);
      if (time == today) {
        total_recharge_today += recharge_today[i].money;
      }
    }
    for (let i = 0; i < withdraw_today.length; i++) {
      let today = timerJoin();
      let time = timerJoin(withdraw_today[i].time);
      if (time == today) {
        total_withdraw_today += withdraw_today[i].money;
      }
    }
  }

  let win = 0;
  let loss = 0;
  for (let i = 0; i < list_mem.length; i++) {
    let phone = list_mem[i].phone;
    const [wins] = await connection.query(
      "SELECT `money`, `time` FROM minutes_1 WHERE phone = ? AND status = 1 ",
      [phone],
    );
    const [losses] = await connection.query(
      "SELECT `money`, `time` FROM minutes_1 WHERE phone = ? AND status = 2 ",
      [phone],
    );
    for (let i = 0; i < wins.length; i++) {
      let today = timerJoin();
      let time = timerJoin(wins[i].time);
      if (time == today) {
        win += wins[i].money;
      }
    }
    for (let i = 0; i < losses.length; i++) {
      let today = timerJoin();
      let time = timerJoin(losses[i].time);
      if (time == today) {
        loss += losses[i].money;
      }
    }
  }
  let list_mems = [];
  const [list_mem_today] = await connection.query(
    "SELECT * FROM users WHERE ctv = ? AND status = 1 AND veri = 1 ",
    [phone],
  );
  for (let i = 0; i < list_mem_today.length; i++) {
    let today = timerJoin();
    let time = timerJoin(list_mem_today[i].time);
    if (time == today) {
      list_mems.push(list_mem_today[i]);
    }
  }

  const [point_list] = await connection.query(
    "SELECT * FROM point_list WHERE phone = ? ",
    [phone],
  );
  let moneyCTV = point_list[0]?.money;

  let list_recharge_news = [];
  let list_withdraw_news = [];
  for (let i = 0; i < list_mem.length; i++) {
    let phone = list_mem[i].phone;
    const [recharge_today] = await connection.query(
      "SELECT `id`, `status`, `type`,`phone`, `money`, `time` FROM recharge WHERE phone = ? AND status = 1 ",
      [phone],
    );
    const [withdraw_today] = await connection.query(
      "SELECT `id`, `status`,`phone`, `money`, `time` FROM withdraw WHERE phone = ? AND status = 1 ",
      [phone],
    );
    for (let i = 0; i < recharge_today.length; i++) {
      let today = timerJoin();
      let time = timerJoin(recharge_today[i].time);
      if (time == today) {
        list_recharge_news.push(recharge_today[i]);
      }
    }
    for (let i = 0; i < withdraw_today.length; i++) {
      let today = timerJoin();
      let time = timerJoin(withdraw_today[i].time);
      if (time == today) {
        list_withdraw_news.push(withdraw_today[i]);
      }
    }
  }

  const [redenvelopes_used] = await connection.query(
    "SELECT * FROM redenvelopes_used WHERE phone = ? ",
    [phone],
  );
  let redenvelopes_used_today = [];
  for (let i = 0; i < redenvelopes_used.length; i++) {
    let today = timerJoin();
    let time = timerJoin(redenvelopes_used[i].time);
    if (time == today) {
      redenvelopes_used_today.push(redenvelopes_used[i]);
    }
  }

  const [financial_details] = await connection.query(
    "SELECT * FROM financial_details WHERE phone = ? ",
    [phone],
  );
  let financial_details_today = [];
  for (let i = 0; i < financial_details.length; i++) {
    let today = timerJoin();
    let time = timerJoin(financial_details[i].time);
    if (time == today) {
      financial_details_today.push(financial_details[i]);
    }
  }

  return res.status(200).json({
    message: "Success",
    status: true,
    datas: user,
    f1: f1s.length,
    f2: f2,
    f3: f3,
    f4: f4,
    list_mems: list_mems,
    total_recharge: total_recharge,
    total_withdraw: total_withdraw,
    total_recharge_today: total_recharge_today,
    total_withdraw_today: total_withdraw_today,
    list_mem_baned: list_mem_baned.length,
    win: win,
    loss: loss,
    list_recharge_news: list_recharge_news,
    list_withdraw_news: list_withdraw_news,
    moneyCTV: moneyCTV,
    redenvelopes_used: redenvelopes_used_today,
    financial_details_today: financial_details_today,
  });
};

const infoCtv2 = async (req, res) => {
  const phone = req.body.phone;
  const timeDate = req.body.timeDate;

  function timerJoin(params = "", addHours = 0) {
    let date = "";
    if (params) {
      date = new Date(Number(params));
    } else {
      date = new Date();
    }

    date.setHours(date.getHours() + addHours);

    let years = formateT(date.getFullYear());
    let months = formateT(date.getMonth() + 1);
    let days = formateT(date.getDate());

    let hours = date.getHours() % 12;
    hours = hours === 0 ? 12 : hours;
    let ampm = date.getHours() < 12 ? "AM" : "PM";

    let minutes = formateT(date.getMinutes());
    let seconds = formateT(date.getSeconds());

    return (
      years +
      "-" +
      months +
      "-" +
      days +
      " " +
      hours +
      ":" +
      minutes +
      ":" +
      seconds +
      " " +
      ampm
    );
  }

  const [user] = await connection.query(
    "SELECT * FROM users WHERE phone = ? ",
    [phone],
  );

  if (user.length == 0) {
    return res.status(200).json({
      message: "Phone Error",
      status: false,
    });
  }
  let userInfo = user[0];
  const [list_mem] = await connection.query(
    "SELECT * FROM users WHERE ctv = ? AND status = 1 AND veri = 1 ",
    [phone],
  );

  let list_mems = [];
  const [list_mem_today] = await connection.query(
    "SELECT * FROM users WHERE ctv = ? AND status = 1 AND veri = 1 ",
    [phone],
  );
  for (let i = 0; i < list_mem_today.length; i++) {
    let today = timeDate;
    let time = timerJoin(list_mem_today[i].time);
    if (time == today) {
      list_mems.push(list_mem_today[i]);
    }
  }

  let list_recharge_news = [];
  let list_withdraw_news = [];
  for (let i = 0; i < list_mem.length; i++) {
    let phone = list_mem[i].phone;
    const [recharge_today] = await connection.query(
      "SELECT `id`, `status`, `type`,`phone`, `money`, `time` FROM recharge WHERE phone = ? AND status = 1 ",
      [phone],
    );
    const [withdraw_today] = await connection.query(
      "SELECT `id`, `status`,`phone`, `money`, `time` FROM withdraw WHERE phone = ? AND status = 1 ",
      [phone],
    );
    for (let i = 0; i < recharge_today.length; i++) {
      let today = timeDate;
      let time = timerJoin(recharge_today[i].time);
      if (time == today) {
        list_recharge_news.push(recharge_today[i]);
      }
    }
    for (let i = 0; i < withdraw_today.length; i++) {
      let today = timeDate;
      let time = timerJoin(withdraw_today[i].time);
      if (time == today) {
        list_withdraw_news.push(withdraw_today[i]);
      }
    }
  }

  const [redenvelopes_used] = await connection.query(
    "SELECT * FROM redenvelopes_used WHERE phone = ? ",
    [phone],
  );
  let redenvelopes_used_today = [];
  for (let i = 0; i < redenvelopes_used.length; i++) {
    let today = timeDate;
    let time = timerJoin(redenvelopes_used[i].time);
    if (time == today) {
      redenvelopes_used_today.push(redenvelopes_used[i]);
    }
  }

  const [financial_details] = await connection.query(
    "SELECT * FROM financial_details WHERE phone = ? ",
    [phone],
  );
  let financial_details_today = [];
  for (let i = 0; i < financial_details.length; i++) {
    let today = timeDate;
    let time = timerJoin(financial_details[i].time);
    if (time == today) {
      financial_details_today.push(financial_details[i]);
    }
  }

  return res.status(200).json({
    message: "Success",
    status: true,
    datas: user,
    list_mems: list_mems,
    list_recharge_news: list_recharge_news,
    list_withdraw_news: list_withdraw_news,
    redenvelopes_used: redenvelopes_used_today,
    financial_details_today: financial_details_today,
  });
};

const listRechargeMem = async (req, res) => {
  let auth = req.cookies.auth;
  let phone = req.params.phone;
  let { pageno, limit } = req.body;

  if (!pageno || !limit) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  if (pageno < 0 || limit < 0) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  if (!phone) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

  const [user] = await connection.query(
    "SELECT * FROM users WHERE phone = ? ",
    [phone],
  );
  const [auths] = await connection.query(
    "SELECT * FROM users WHERE token = ? ",
    [auth],
  );

  if (user.length == 0 || auths.length == 0) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  let { token, password, otp, level, ...userInfo } = user[0];

  const [recharge] = await connection.query(
    `SELECT * FROM recharge WHERE phone = ? ORDER BY id DESC LIMIT ${pageno}, ${limit} `,
    [phone],
  );
  const [total_users] = await connection.query(
    `SELECT * FROM recharge WHERE phone = ?`,
    [phone],
  );
  return res.status(200).json({
    message: "Success",
    status: true,
    datas: recharge,
    page_total: Math.ceil(total_users.length / limit),
  });
};

const listWithdrawMem = async (req, res) => {
  let auth = req.cookies.auth;
  let phone = req.params.phone;
  let { pageno, limit } = req.body;

  if (!pageno || !limit) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  if (pageno < 0 || limit < 0) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  if (!phone) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

  const [user] = await connection.query(
    "SELECT * FROM users WHERE phone = ? ",
    [phone],
  );
  const [auths] = await connection.query(
    "SELECT * FROM users WHERE token = ? ",
    [auth],
  );

  if (user.length == 0 || auths.length == 0) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  let { token, password, otp, level, ...userInfo } = user[0];

  const [withdraw] = await connection.query(
    `SELECT * FROM withdraw WHERE phone = ? ORDER BY id DESC LIMIT ${pageno}, ${limit} `,
    [phone],
  );
  const [total_users] = await connection.query(
    `SELECT * FROM withdraw WHERE phone = ?`,
    [phone],
  );
  return res.status(200).json({
    message: "Success",
    status: true,
    datas: withdraw,
    page_total: Math.ceil(total_users.length / limit),
  });
};

const listRedenvelope = async (req, res) => {
  let auth = req.cookies.auth;
  let phone = req.params.phone;
  let { pageno, limit } = req.body;

  if (!pageno || !limit) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  if (pageno < 0 || limit < 0) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  if (!phone) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

  const [user] = await connection.query(
    "SELECT * FROM users WHERE phone = ? ",
    [phone],
  );
  const [auths] = await connection.query(
    "SELECT * FROM users WHERE token = ? ",
    [auth],
  );

  if (user.length == 0 || auths.length == 0) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  let { token, password, otp, level, ...userInfo } = user[0];

  const [redenvelopes_used] = await connection.query(
    `SELECT * FROM redenvelopes_used WHERE phone_used = ? ORDER BY id DESC LIMIT ${pageno}, ${limit} `,
    [phone],
  );
  const [total_users] = await connection.query(
    `SELECT * FROM redenvelopes_used WHERE phone_used = ?`,
    [phone],
  );
  return res.status(200).json({
    message: "Success",
    status: true,
    datas: redenvelopes_used,
    page_total: Math.ceil(total_users.length / limit),
  });
};
// Level Setting get

const getLevelInfo = async (req, res) => {
  const [rows] = await connection.query("SELECT * FROM `level`");

  if (!rows) {
    return res.status(200).json({
      message: "Failed",
      status: false,
    });
  }
  console.log("asdasdasd : " + rows);
  return res.status(200).json({
    message: "Success",
    status: true,
    data: {},
    rows: rows,
  });

  // const [recharge] = await connection.query('SELECT * FROM recharge WHERE `phone` = ? AND status = 1', [rows[0].phone]);
  // let totalRecharge = 0;
  // recharge.forEach((data) => {
  //     totalRecharge += data.money;
  // });
  // const [withdraw] = await connection.query('SELECT * FROM withdraw WHERE `phone` = ? AND status = 1', [rows[0].phone]);
  // let totalWithdraw = 0;
  // withdraw.forEach((data) => {
  //     totalWithdraw += data.money;
  // });

  // const { id, password, ip, veri, ip_address, status, time, token, ...others } = rows[0];
  // return res.status(200).json({
  //     message: 'Success',
  //     status: true,
  //     data: {
  //         code: others.code,
  //         id_user: others.id_user,
  //         name_user: others.name_user,
  //         phone_user: others.phone,
  //         money_user: others.money,
  //     },
  //     totalRecharge: totalRecharge,
  //     totalWithdraw: totalWithdraw,
  //     timeStamp: timeNow,
  // });
};

const listBet = async (req, res) => {
  let auth = req.cookies.auth;
  let phone = req.params.phone;
  let { pageno, limit } = req.body;

  if (!pageno || !limit) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  if (pageno < 0 || limit < 0) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  if (!phone) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

  const [user] = await connection.query(
    "SELECT * FROM users WHERE phone = ? ",
    [phone],
  );
  const [auths] = await connection.query(
    "SELECT * FROM users WHERE token = ? ",
    [auth],
  );

  if (user.length == 0 || auths.length == 0) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  let { token, password, otp, level, ...userInfo } = user[0];

  const [listBet] = await connection.query(
    `(SELECT id, CONVERT(phone USING utf8mb4) COLLATE utf8mb4_unicode_ci as phone, CONVERT(stage USING utf8mb4) COLLATE utf8mb4_unicode_ci as stage, amount, status, 
        CONVERT(CASE 
            WHEN game = 'wingo' THEN 'Wingo 1Min'
            WHEN game = 'wingo3' THEN 'Wingo 3Min'
            WHEN game = 'wingo5' THEN 'Wingo 5Min'
            WHEN game = 'wingo10' THEN 'Wingo 10Min'
            ELSE game 
        END USING utf8mb4) COLLATE utf8mb4_unicode_ci as game, 
        CONVERT(bet USING utf8mb4) COLLATE utf8mb4_unicode_ci as bet, 
        CONVERT(result USING utf8mb4) COLLATE utf8mb4_unicode_ci as result, 
        '' as detail,
        CONVERT(time USING utf8mb4) COLLATE utf8mb4_unicode_ci as time FROM minutes_1 WHERE phone = ? AND status != 0)
     UNION ALL
     (SELECT id, CONVERT(phone USING utf8mb4) COLLATE utf8mb4_unicode_ci as phone, CONVERT(stage USING utf8mb4) COLLATE utf8mb4_unicode_ci as stage, amount, status, 
        CONVERT(CASE 
            WHEN game = '1' THEN 'K3 1Min'
            WHEN game = '3' THEN 'K3 3Min'
            WHEN game = '5' THEN 'K3 5Min'
            WHEN game = '10' THEN 'K3 10Min'
            ELSE CONCAT('K3 ', game)
        END USING utf8mb4) COLLATE utf8mb4_unicode_ci as game, 
        CONVERT(bet USING utf8mb4) COLLATE utf8mb4_unicode_ci as bet, 
        CONVERT(result USING utf8mb4) COLLATE utf8mb4_unicode_ci as result, 
        CONVERT(typeGame USING utf8mb4) COLLATE utf8mb4_unicode_ci as detail,
        CONVERT(time USING utf8mb4) COLLATE utf8mb4_unicode_ci as time FROM result_k3 WHERE phone = ? AND status != 0)
     UNION ALL
     (SELECT id, CONVERT(phone USING utf8mb4) COLLATE utf8mb4_unicode_ci as phone, CONVERT(stage USING utf8mb4) COLLATE utf8mb4_unicode_ci as stage, amount, status, 
        CONVERT(CASE 
            WHEN game = '1' THEN '5D 1Min'
            WHEN game = '3' THEN '5D 3Min'
            WHEN game = '5' THEN '5D 5Min'
            WHEN game = '10' THEN '5D 10Min'
            ELSE CONCAT('5D ', game)
        END USING utf8mb4) COLLATE utf8mb4_unicode_ci as game, 
        CONVERT(bet USING utf8mb4) COLLATE utf8mb4_unicode_ci as bet, 
        CONVERT(result USING utf8mb4) COLLATE utf8mb4_unicode_ci as result, 
        CONVERT(join_bet USING utf8mb4) COLLATE utf8mb4_unicode_ci as detail,
        CONVERT(time USING utf8mb4) COLLATE utf8mb4_unicode_ci as time FROM result_5d WHERE phone = ? AND status != 0)
     UNION ALL
     (SELECT b.id, CONVERT(b.phone USING utf8mb4) COLLATE utf8mb4_unicode_ci as phone, CONVERT(b.stage USING utf8mb4) COLLATE utf8mb4_unicode_ci as stage, b.amount, b.status, 
        CONVERT(CASE 
            WHEN b.game = 'trx_wingo' THEN 'TRX Wingo 1Min'
            WHEN b.game = 'trx_wingo3' THEN 'TRX Wingo 3Min'
            WHEN b.game = 'trx_wingo5' THEN 'TRX Wingo 5Min'
            WHEN b.game = 'trx_wingo10' THEN 'TRX Wingo 10Min'
            ELSE b.game 
        END USING utf8mb4) COLLATE utf8mb4_unicode_ci as game, 
        CONVERT(b.bet USING utf8mb4) COLLATE utf8mb4_unicode_ci as bet, 
        CONVERT(b.result USING utf8mb4) COLLATE utf8mb4_unicode_ci as result, 
        CONVERT(IFNULL(g.hash, '') USING utf8mb4) COLLATE utf8mb4_unicode_ci as detail,
        CONVERT(b.time USING utf8mb4) COLLATE utf8mb4_unicode_ci as time FROM trx_wingo_bets b
        LEFT JOIN trx_wingo_game g ON b.stage = g.period AND b.game = g.game
        WHERE b.phone = ? AND b.status != 0)
     ORDER BY time DESC LIMIT ?, ? `,
    [phone, phone, phone, phone, Number(pageno), Number(limit)],
  );
  const [total_bets] = await connection.query(
    `SELECT COUNT(*) as total FROM (
        SELECT id FROM minutes_1 WHERE phone = ? AND status != 0
        UNION ALL
        SELECT id FROM result_k3 WHERE phone = ? AND status != 0
        UNION ALL
        SELECT id FROM result_5d WHERE phone = ? AND status != 0
        UNION ALL
        SELECT id FROM trx_wingo_bets WHERE phone = ? AND status != 0
    ) as combined_bets`,
    [phone, phone, phone, phone],
  );
  return res.status(200).json({
    message: "Success",
    status: true,
    datas: listBet,
    page_total: Math.ceil(total_bets[0].total / limit),
  });
};

const apiListBet = async (req, res) => {

  let auth = req.cookies.auth;
  let phone = req.params.phone;
  let { pageno, limit } = req.body;

  if (!pageno || !limit) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  if (pageno < 0 || limit < 0) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  if (!phone) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: new Date().toISOString(),
    });
  }

  const [user] = await connection.query(
    "SELECT * FROM users WHERE phone = ?",
    [phone]
  );
  const [auths] = await connection.query(
    "SELECT * FROM users WHERE token = ?",
    [auth]
  );

  if (user.length === 0 || auths.length === 0) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: new Date().toISOString(),
    });
  }

  const userId = user[0].id_user;

  // Fetching normalized data from wc_api_transactions with correct txn_id column
  const [listWC] = await connection.query(
    `SELECT 'WC' as platform, 
     txn_id, round_id, game_id, table_id, prd_id, is_cancel,
     CASE WHEN type = 'debit' THEN amount ELSE 0 END as bet,
     CASE WHEN type = 'credit' THEN amount ELSE 0 END as win,
     UNIX_TIMESTAMP(created_at) * 1000 as time,
     UNIX_TIMESTAMP(resettlement_time) * 1000 as resettle_time
     FROM wc_api_transactions 
     WHERE user_id = ? 
     ORDER BY created_at DESC LIMIT ?, ?`,
    [userId, Number(pageno), Number(limit)]
  );

  const [totalRecords] = await connection.query(
    `SELECT COUNT(*) as total FROM wc_api_transactions WHERE user_id = ?`,
    [userId]
  );

  return res.status(200).json({
    message: "Success",
    status: true,
    data: listWC,
    page_total: Math.ceil(totalRecords[0].total / limit),
  });
};

const listOrderOld = async (req, res) => {
  let { gameJoin } = req.body;

  let checkGame = ["1", "3", "5", "10"].includes(String(gameJoin));
  if (!checkGame) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }
  let game = Number(gameJoin);

  let join = "";
  if (game == 1) join = "k5d";
  if (game == 3) join = "k5d3";
  if (game == 5) join = "k5d5";
  if (game == 10) join = "k5d10";

  const [k5d] = await connection.query(
    `SELECT * FROM 5d WHERE status != 0 AND game = '${game}' ORDER BY id DESC LIMIT 10 `,
  );
  const [period] = await connection.query(
    `SELECT period FROM 5d WHERE status = 0 AND game = '${game}' ORDER BY id DESC LIMIT 1 `,
  );
  const [waiting] = await connection.query(
    `SELECT phone, money, price, amount, bet FROM result_5d WHERE status = 0 AND level = 0 AND game = '${game}' ORDER BY id ASC `,
  );
  const [settings] = await connection.query(`SELECT ${join} FROM admin_ac`);
  if (k5d.length == 0) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }
  if (!k5d[0] || !period[0]) {
    return res.status(200).json({
      message: "Error!",
      status: false,
    });
  }
  return res.status(200).json({
    code: 0,
    msg: "Get success",
    data: {
      gameslist: k5d,
    },
    bet: waiting,
    settings: settings,
    join: join,
    period: period[0].period,
    status: true,
  });
};

const listOrderOldK3 = async (req, res) => {
  let { gameJoin } = req.body;

  let checkGame = ["1", "3", "5", "10"].includes(String(gameJoin));
  if (!checkGame) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }
  let game = Number(gameJoin);

  let join = "";
  if (game == 1) join = "k3d";
  if (game == 3) join = "k3d3";
  if (game == 5) join = "k3d5";
  if (game == 10) join = "k3d10";

  const [k5d] = await connection.query(
    `SELECT * FROM k3 WHERE status != 0 AND game = '${game}' ORDER BY id DESC LIMIT 10 `,
  );
  const [period] = await connection.query(
    `SELECT period FROM k3 WHERE status = 0 AND game = '${game}' ORDER BY id DESC LIMIT 1 `,
  );
  const [waiting] = await connection.query(
    `SELECT phone, money, price, typeGame, amount, bet FROM result_k3 WHERE status = 0 AND level = 0 AND game = '${game}' ORDER BY id ASC `,
  );
  const [settings] = await connection.query(`SELECT ${join} FROM admin_ac`);
  if (k5d.length == 0) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }
  if (!k5d[0] || !period[0]) {
    return res.status(200).json({
      message: "Error!",
      status: false,
    });
  }
  return res.status(200).json({
    code: 0,
    msg: "Get Success",
    data: {
      gameslist: k5d,
    },
    bet: waiting,
    settings: settings,
    join: join,
    period: period[0].period,
    status: true,
  });
};

const editResult = async (req, res) => {
  let { game, list } = req.body;

  if (!list || !game) {
    return res.status(200).json({
      message: "ERROR!!!",
      status: false,
    });
  }

  let join = "";
  if (game == 1) join = "k5d";
  if (game == 3) join = "k5d3";
  if (game == 5) join = "k5d5";
  if (game == 10) join = "k5d10";

  const sql = `UPDATE admin_ac SET ${join} = ?`;
  await connection.execute(sql, [list]);
  return res.status(200).json({
    message: "Editing is successful", //Register Sucess
    status: true,
  });
};

const editResult2 = async (req, res) => {
  let { game, list } = req.body;

  if (!list || !game) {
    return res.status(200).json({
      message: "ERROR!!!",
      status: false,
    });
  }

  let join = "";
  if (game == 1) join = "k3d";
  if (game == 3) join = "k3d3";
  if (game == 5) join = "k3d5";
  if (game == 10) join = "k3d10";

  const sql = `UPDATE admin_ac SET ${join} = ?`;
  await connection.execute(sql, [list]);
  return res.status(200).json({
    message: "Editing is successful", //Register Sucess
    status: true,
  });
};

const CreatedSalary = async (req, res) => {
  try {
    const phone = req.body.phone;
    const amount = req.body.amount;
    const type = req.body.type;
    const now = new Date().getTime();

    const formattedTime = now.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    // Check if the phone number is a 10-digit number
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        message:
          "ERROR!!! Invalid phone number. Please provide a 10-digit phone number.",
        status: false,
      });
    }

    // Check if user with the given phone number exists
    const checkUserQuery = "SELECT * FROM `users` WHERE phone = ?";
    const [existingUser] = await connection.execute(checkUserQuery, [phone]);

    if (existingUser.length === 0) {
      // If user doesn't exist, return an error
      return res.status(400).json({
        message: "ERROR!!! User with the provided phone number does not exist.",
        status: false,
      });
    }

    // If user exists, update the 'users' table
    const updateUserQuery =
      "UPDATE `users` SET `money` = `money` + ?, `total_distributed_salary` = `total_distributed_salary` + ? WHERE phone = ?";
    await connection.execute(updateUserQuery, [amount, amount, phone]);

    // Insert record into 'salary' table
    const insertSalaryQuery =
      "INSERT INTO salary (phone, amount, type, time) VALUES (?, ?, ?, ?)";
    await connection.execute(insertSalaryQuery, [phone, amount, type, now]);

    res.status(200).json({ message: "Salary record created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getTodayStartTime = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.getTime();
};

const userStats = async (startTime, endTime) => {
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
      startTime,
      endTime,
      startTime,
      endTime,
      startTime,
      endTime,
      startTime,
      endTime,
    ],
  );

  return rows;
};

const createInviteMapAndLevels = (rows, userCode, maxLevel) => {
  const inviteMap = {};
  const userAllLevels = [];
  let totalRechargeCount = 0;
  const queue = [{ code: userCode, level: 1 }];

  while (queue.length) {
    const { code, level } = queue.shift();
    if (level >= maxLevel) continue;

    if (!inviteMap[code]) {
      inviteMap[code] = [];
    }

    const users = rows.filter((user) => user.invite === code);
    inviteMap[code].push(...users);

    users.forEach((user) => {
      if (
        level !== 1 &&
        user.total_bet_amount >= 500 &&
        user.has_bank_account
      ) {
        userAllLevels.push({ ...user, user_level: level });
        totalRechargeCount += +user.total_deposit_amount;
      }
      queue.push({ code: user.code, level: level + 1 });
    });
  }

  return { inviteMap, userAllLevels, totalRechargeCount };
};

const getUserLevels = (rows, userCode, maxLevel = 10) => {
  const { inviteMap, userAllLevels, totalRechargeCount } =
    createInviteMapAndLevels(rows, userCode, maxLevel);
  const level1Referrals = inviteMap[userCode].filter(
    (user) => user.total_bet_amount >= 500 && user.has_bank_account,
  );
  return { userAllLevels, level1Referrals, totalRechargeCount };
};

const listCheckSalaryEligibility = async (req, res) => {
  const { startOfYesterdayTimestamp, endOfYesterdayTimestamp } =
    yesterdayTime();
  const now = new Date().getTime();

  const userStatsData = await userStats(startOfYesterdayTimestamp, now);

  const users = userStatsData
    .map((user) => {
      const { userAllLevels, level1Referrals, totalRechargeCount } =
        getUserLevels(userStatsData, user.code);
      if (userAllLevels.length > 0 || level1Referrals.length > 0) {
        return {
          phone: user.phone,
          userAllLevelsEligibility: userAllLevels.length,
          level1ReferralsEligibility: level1Referrals.length,
          totalRechargeCount,
        };
      }
    })
    .filter(Boolean);

  return res.status(200).json({
    message: "Success",
    status: true,
    data: {},
    rows: users,
  });
};

const getSalary = async (req, res) => {
  let pageno = parseInt(req.body.page) || parseInt(req.query.page) || 1;
  let limit = parseInt(req.body.limit) || parseInt(req.query.limit) || 20;
  let offset = (pageno - 1) * limit;

  try {
    const [rows] = await connection.query(
      `SELECT * FROM salary ORDER BY time DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [totalCount] = await connection.query(
      `SELECT COUNT(*) as total FROM salary`
    );

    const totalRecords = totalCount[0].total;

    if (!rows) {
      return res.status(200).json({
        message: "Failed",
        status: false,
      });
    }

    return res.status(200).json({
      message: "Success",
      status: true,
      data: {},
      rows: rows,
      page: pageno,
      total: totalRecords,
      page_total: Math.ceil(totalRecords / limit)
    });
  } catch (error) {
    console.error("Error in getSalary:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      status: false
    });
  }
};


const getBetHistory = async (req, res) => {
  let { pageno, limit, search, game, status } = req.body;
  const offset = (pageno - 1) * limit;

  if (!pageno || !limit || pageno < 0 || limit < 0) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  let sql = `
    SELECT m.*, u.id_user
    FROM minutes_1 m
    LEFT JOIN users u ON m.phone = u.phone
    WHERE 1
  `;

  let countSql = `
    SELECT COUNT(*) as total
    FROM minutes_1 m
    LEFT JOIN users u ON m.phone = u.phone
    WHERE 1
  `;

  let params = [];

  if (search) {
    sql += " AND (m.phone LIKE ? OR u.id_user LIKE ? OR m.stage LIKE ?)";
    countSql += " AND (m.phone LIKE ? OR u.id_user LIKE ? OR m.stage LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (game) {
    sql += " AND m.game = ?";
    countSql += " AND m.game = ?";
    params.push(game);
  }

  if (status) {
    sql += " AND m.status = ?";
    countSql += " AND m.status = ?";
    params.push(status);
  }

  sql += " ORDER BY m.id DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  try {
    const [bets] = await connection.execute(sql, params);
    const [total_bets] = await connection.query(countSql, params.slice(0, -2));

    return res.status(200).json({
      message: "Success",
      status: true,
      datas: bets,
      currentPage: pageno,
      page_total: Math.ceil(total_bets[0].total / limit),
    });
  } catch (error) {
    console.error("Error in listIllegalBetHistory:", error);
    return res.status(500).json({
      message: "Server Error",
      status: false,
    });
  }
};


const getTrxHistory = async (req, res) => {
  let { pageno, limit, search, game, status } = req.body;
  const offset = (pageno - 1) * limit;

  if (!pageno || !limit || pageno < 0 || limit < 0) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  let sql = `
    SELECT m.*, u.id_user
    FROM trx_wingo_bets m
    LEFT JOIN users u ON m.phone = u.phone
    WHERE 1
  `;

  let countSql = `
    SELECT COUNT(*) as total
    FROM trx_wingo_bets m
    LEFT JOIN users u ON m.phone = u.phone
    WHERE 1
  `;

  let params = [];

  if (search) {
    sql += " AND (m.phone LIKE ? OR u.id_user LIKE ? OR m.stage LIKE ?)";
    countSql += " AND (m.phone LIKE ? OR u.id_user LIKE ? OR m.stage LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (game) {
    sql += " AND m.game = ?";
    countSql += " AND m.game = ?";
    params.push(game);
  }

  if (status) {
    sql += " AND m.status = ?";
    countSql += " AND m.status = ?";
    params.push(status);
  }

  sql += " ORDER BY m.id DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  try {
    const [bets] = await connection.execute(sql, params);
    const [total_bets] = await connection.query(countSql, params.slice(0, -2));

    return res.status(200).json({
      message: "Success",
      status: true,
      datas: bets,
      currentPage: pageno,
      page_total: Math.ceil(total_bets[0].total / limit),
    });
  } catch (error) {
    console.error("Error in listTrxHistory:", error);
    return res.status(500).json({
      message: "Server Error",
      status: false,
    });
  }
};

const getApiGamesHistory = async (req, res) => {
  let { pageno, limit, search, type, status, prd_id, startDate, endDate } = req.body;
  const offset = (pageno - 1) * limit;

  if (!pageno || !limit || pageno < 0 || limit < 0) {
    return res.status(200).json({ code: 0, msg: "No more data", status: false });
  }

  let sql = `
        SELECT m.*, u.phone, u.id_user as user_id_display
        FROM wc_api_transactions m
        LEFT JOIN users u ON m.user_id = u.id_user
        WHERE 1
    `;
  let countSql = `
        SELECT COUNT(*) as total
        FROM wc_api_transactions m
        LEFT JOIN users u ON m.user_id = u.id_user
        WHERE 1
    `;

  let params = [];

  if (search) {
    sql += " AND (u.phone LIKE ? OR m.user_id LIKE ? OR m.txn_id LIKE ? OR m.round_id LIKE ?)";
    countSql += " AND (u.phone LIKE ? OR m.user_id LIKE ? OR m.txn_id LIKE ? OR m.round_id LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (type && type !== 'all') {
    sql += " AND m.type = ?";
    countSql += " AND m.type = ?";
    params.push(type);
  }

  if (status && status !== 'all') {
    sql += " AND m.is_cancel = ?";
    countSql += " AND m.is_cancel = ?";
    params.push(status);
  }

  if (prd_id) {
    sql += " AND m.prd_id LIKE ?";
    countSql += " AND m.prd_id LIKE ?";
    params.push(`%${prd_id}%`);
  }

  if (startDate && endDate) {
    sql += " AND m.created_at BETWEEN ? AND ?";
    countSql += " AND m.created_at BETWEEN ? AND ?";
    params.push(startDate + " 00:00:00", endDate + " 23:59:59");
  }

  sql += " ORDER BY m.id DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  try {
    const [rows] = await connection.execute(sql, params);
    const [totalRows] = await connection.query(countSql, params.slice(0, -2));

    return res.status(200).json({
      code: 1,
      msg: "success",
      data: rows,
      total: totalRows[0].total,
      status: true
    });
  } catch (error) {
    console.error("Error in getApiGamesHistory:", error);
    return res.status(500).json({ code: 0, msg: "Server error", status: false });
  }
};

const get5dHistory = async (req, res) => {
  let { pageno, limit, search, game, status } = req.body;
  const offset = (pageno - 1) * limit;

  if (!pageno || !limit || pageno < 0 || limit < 0) {
    return res.status(200).json({ code: 0, msg: "No more data", status: false });
  }

  let sql = `
    SELECT m.*, u.id_user
    FROM result_5d m
    LEFT JOIN users u ON m.phone = u.phone
    WHERE 1
  `;
  let countSql = `
    SELECT COUNT(*) as total
    FROM result_5d m
    LEFT JOIN users u ON m.phone = u.phone
    WHERE 1
  `;

  let params = [];

  if (search) {
    sql += " AND (m.phone LIKE ? OR u.id_user LIKE ? OR m.stage LIKE ?)";
    countSql += " AND (m.phone LIKE ? OR u.id_user LIKE ? OR m.stage LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (game) {
    sql += " AND m.game = ?";
    countSql += " AND m.game = ?";
    params.push(game);
  }

  if (status) {
    sql += " AND m.status = ?";
    countSql += " AND m.status = ?";
    params.push(status);
  }

  sql += " ORDER BY m.id DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  try {
    const [bets] = await connection.execute(sql, params);
    const [total_bets] = await connection.query(countSql, params.slice(0, -2));

    return res.status(200).json({
      message: "Success",
      status: true,
      datas: bets,
      currentPage: pageno,
      page_total: Math.ceil(total_bets[0].total / limit),
    });
  } catch (error) {
    console.error("Error in get5dHistory:", error);
    return res.status(500).json({ message: "Server Error", status: false });
  }
};

const getK3History = async (req, res) => {
  let { pageno, limit, search, game, status } = req.body;
  const offset = (pageno - 1) * limit;

  if (!pageno || !limit || pageno < 0 || limit < 0) {
    return res.status(200).json({ code: 0, msg: "No more data", status: false });
  }

  let sql = `
    SELECT m.*, u.id_user
    FROM result_k3 m
    LEFT JOIN users u ON m.phone = u.phone
    WHERE 1
  `;
  let countSql = `
    SELECT COUNT(*) as total
    FROM result_k3 m
    LEFT JOIN users u ON m.phone = u.phone
    WHERE 1
  `;

  let params = [];

  if (search) {
    sql += " AND (m.phone LIKE ? OR u.id_user LIKE ? OR m.stage LIKE ?)";
    countSql += " AND (m.phone LIKE ? OR u.id_user LIKE ? OR m.stage LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (game) {
    sql += " AND m.game = ?";
    countSql += " AND m.game = ?";
    params.push(game);
  }

  if (status) {
    sql += " AND m.status = ?";
    countSql += " AND m.status = ?";
    params.push(status);
  }

  sql += " ORDER BY m.id DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  try {
    const [bets] = await connection.execute(sql, params);
    const [total_bets] = await connection.query(countSql, params.slice(0, -2));

    return res.status(200).json({
      message: "Success",
      status: true,
      datas: bets,
      currentPage: pageno,
      page_total: Math.ceil(total_bets[0].total / limit),
    });
  } catch (error) {
    console.error("Error in getK3History:", error);
    return res.status(500).json({ message: "Server Error", status: false });
  }
};

const adminPage5dHistory = async (req, res) => {
  return res.render("manage/5dHistory.ejs");
};

const adminPageK3History = async (req, res) => {
  return res.render("manage/k3History.ejs");
};




const referralsPage = async (req, res) => {
  return res.render("manage/referrals.ejs");
};

const listReferrals = async (req, res) => {
  let { pageno, limit, search } = req.body;
  const offset = (pageno - 1) * limit;

  if (!pageno || !limit) {
    return res.status(200).json({
      msg: "No more data",
      status: false,
    });
  }

  try {
    let sql = `
      SELECT 
        u.id_user,
        u.phone,
        u.code,
        u.invite,
        u.money,
        u.time AS join_date,
        inviter.phone AS inviter_phone,
        inviter.id_user AS inviter_id,
        (SELECT COUNT(*) FROM users WHERE invite = u.code) AS total_referrals
      FROM users u
      LEFT JOIN users inviter ON u.invite = inviter.code
      WHERE u.veri = 1 AND u.level != 2
    `;
    let countSql = `
      SELECT COUNT(*) as total FROM users u
      WHERE u.veri = 1 AND u.level != 2
    `;
    let params = [];

    if (search) {
      sql += " AND (u.phone LIKE ? OR u.id_user LIKE ? OR u.code LIKE ? OR u.invite LIKE ?)";
      countSql += " AND (u.phone LIKE ? OR u.id_user LIKE ? OR u.code LIKE ? OR u.invite LIKE ?)";
      params = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];
    }

    sql += " ORDER BY u.id DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const [users] = await connection.execute(sql, params);
    const [total_users] = await connection.query(countSql, params.slice(0, -2));

    return res.status(200).json({
      message: "Success",
      status: true,
      datas: users,
      currentPage: pageno,
      page_total: Math.ceil(total_users[0].total / limit),
    });
  } catch (error) {
    console.error("Error in listReferrals:", error);
    return res.status(500).json({
      message: "Server Error",
      status: false,
    });
  }
};

const getReferralTree = async (req, res) => {
  let { phone } = req.body;
  let auth = req.cookies.auth;

  if (!auth || !phone) {
    return res.status(200).json({
      message: "Failed",
      status: false,
    });
  }

  try {
    const [user] = await connection.query(
      "SELECT id_user, phone, code, invite, money, time FROM users WHERE phone = ?",
      [phone]
    );

    if (user.length === 0) {
      return res.status(200).json({ message: "User not found", status: false });
    }

    const userCode = user[0].code;

    // F1 - Direct referrals
    const [f1] = await connection.query(
      "SELECT id_user, phone, code, money, time FROM users WHERE invite = ?",
      [userCode]
    );

    // F2 - Referrals of F1
    let f2 = [];
    if (f1.length > 0) {
      const f1Codes = f1.map((u) => u.code);
      const placeholders = f1Codes.map(() => "?").join(",");
      const [f2Result] = await connection.query(
        `SELECT id_user, phone, code, money, time FROM users WHERE invite IN (${placeholders})`,
        f1Codes
      );
      f2 = f2Result;
    }

    // F3 - Referrals of F2
    let f3 = [];
    if (f2.length > 0) {
      const f2Codes = f2.map((u) => u.code);
      const placeholders = f2Codes.map(() => "?").join(",");
      const [f3Result] = await connection.query(
        `SELECT id_user, phone, code, money, time FROM users WHERE invite IN (${placeholders})`,
        f2Codes
      );
      f3 = f3Result;
    }

    // F4 - Referrals of F3
    let f4 = [];
    if (f3.length > 0) {
      const f3Codes = f3.map((u) => u.code);
      const placeholders = f3Codes.map(() => "?").join(",");
      const [f4Result] = await connection.query(
        `SELECT id_user, phone, code, money, time FROM users WHERE invite IN (${placeholders})`,
        f3Codes
      );
      f4 = f4Result;
    }

    // Get inviter info
    let inviter = null;
    if (user[0].invite && user[0].invite !== "0") {
      const [inviterResult] = await connection.query(
        "SELECT id_user, phone, code FROM users WHERE code = ?",
        [user[0].invite]
      );
      if (inviterResult.length > 0) inviter = inviterResult[0];
    }

    return res.status(200).json({
      message: "Success",
      status: true,
      user: user[0],
      inviter,
      f1,
      f2,
      f3,
      f4,
    });
  } catch (error) {
    console.error("Error in getReferralTree:", error);
    return res.status(500).json({
      message: "Server Error",
      status: false,
    });
  }
};


const walletData = async (req, res) => {
  // const sumdate = timerJoinFun(Date.now())
  let startDate = req.body.startDate ? Number(req.body.startDate) : new Date().setHours(0, 0, 0, 0);
  let endDate = req.body.endDate ? Number(req.body.endDate) : new Date().setHours(23, 59, 59, 999);
  //convert to IST
  startDate = moment(startDate).tz("Asia/Kolkata").valueOf();
  endDate = moment(endDate).tz("Asia/Kolkata").valueOf();
  console.log("startDate: ", startDate);
  console.log("endDate: ", endDate);

  const [users] = await connection.query(
    `SELECT SUM(money) as total FROM users WHERE status = 1 `,
  );
  const [usersTotal] = await connection.query(
    `SELECT COUNT(id) as total FROM users WHERE status = 1 `,
  );
  const [usersToday] = await connection.query(
    `SELECT COUNT(id) as total FROM users WHERE status = 1  AND time BETWEEN ? AND ?;`,
    [startDate, endDate]
  );

  const [recharge] = await connection.query(
    `SELECT SUM(money) as total FROM recharge WHERE status = 1 ;`,
  );
  const [withdraw] = await connection.query(
    `SELECT SUM(money) as total FROM withdraw WHERE status = 1 ;`,
  );

  const [recharge_today] = await connection.query(
    `SELECT SUM(money) as total FROM recharge WHERE status = 1  AND time BETWEEN ? AND ? AND type = 'upi_manual';`,
    [startDate, endDate]
  );
  const [withdraw_today] = await connection.query(
    `SELECT SUM(money) as total FROM withdraw WHERE status = 1  AND time BETWEEN ? AND ?;`,
    [startDate, endDate]
  );


  const [recharge_pending] = await connection.query(
    `SELECT SUM(money) as total FROM recharge WHERE status = 0 AND type = 'upi_manual';`,
  );
  const [withdraw_pending] = await connection.query(
    `SELECT SUM(money) as total FROM withdraw WHERE status = 0 ;`
  );


  let usersWallet = users[0].total;

  let recharges = recharge[0].total;
  let withdraws = withdraw[0].total;
  const [commissions] = await connection.query(
    `SELECT SUM(money) as total FROM commissions;`
  );

  const [claimedRewards] = await connection.query(
    `SELECT SUM(amount) as total FROM claimed_rewards WHERE status = 1;`
  );

  const [bonusesToday] = await connection.query(
    `SELECT SUM(amount) as total FROM claimed_rewards WHERE status = 1 AND time BETWEEN ? AND ?;`,
    [startDate, endDate]
  );

  let yesterdayStart = startDate - 86400000;
  let yesterdayEnd = endDate - 86400000;

  const [commissionsYesterday] = await connection.query(
    `SELECT SUM(money) as total FROM commissions WHERE time BETWEEN ? AND ?;`,
    [yesterdayStart, yesterdayEnd]
  );

  const [rechargeYesterday] = await connection.query(
    `SELECT SUM(money) as total FROM recharge WHERE status = 1 AND time BETWEEN ? AND ?;`,
    [yesterdayStart, yesterdayEnd]
  );

  const [withdrawYesterday] = await connection.query(
    `SELECT SUM(money) as total FROM withdraw WHERE status = 1 AND time BETWEEN ? AND ?;`,
    [yesterdayStart, yesterdayEnd]
  );

  const [bonusesYesterday] = await connection.query(
    `SELECT SUM(amount) as total FROM claimed_rewards WHERE status = 1 AND time BETWEEN ? AND ?;`,
    [yesterdayStart, yesterdayEnd]
  );

  const [usersYesterday] = await connection.query(
    `SELECT COUNT(id) as total FROM users WHERE status = 1 AND time BETWEEN ? AND ?;`,
    [yesterdayStart, yesterdayEnd]
  );

  const [commissionsToday] = await connection.query(
    `SELECT SUM(money) as total FROM commissions WHERE time BETWEEN ? AND ?;`,
    [startDate, endDate]
  );

  const [salaryTotal] = await connection.query(
    `SELECT SUM(amount) as total FROM salary;`
  );
  const [salaryToday] = await connection.query(
    `SELECT SUM(amount) as total FROM salary WHERE time BETWEEN ? AND ?;`,
    [startDate, endDate]
  );
  const [salaryYesterday] = await connection.query(
    `SELECT SUM(amount) as total FROM salary WHERE time BETWEEN ? AND ?;`,
    [yesterdayStart, yesterdayEnd]
  );

  return res.status(200).json({
    message: "Success",
    status: true,
    usersWallet: usersWallet,
    recharges: recharges,
    withdraws: withdraws,
    totalUser: usersTotal[0].total,
    todayUser: usersToday[0].total,
    yesterdayUser: usersYesterday[0].total || 0,
    pRecharge: recharge_pending[0].total,
    pWithdrawal: withdraw_pending[0].total,
    rechargeToday: recharge_today[0].total,
    withdrawToday: withdraw_today[0].total,
    yesterdayRecharge: rechargeYesterday[0].total || 0,
    yesterdayWithdraw: withdrawYesterday[0].total || 0,
    totalCommissions: commissions[0].total || 0,
    todayCommissions: commissionsToday[0].total || 0,
    yesterdayCommissions: commissionsYesterday[0].total || 0,
    totalBonuses: claimedRewards[0].total || 0,
    todayBonuses: bonusesToday[0].total || 0,
    yesterdayBonuses: bonusesYesterday[0].total || 0,
    totalGiftCodes: (await connection.query(`SELECT SUM(money) as total FROM redenvelopes_used;`))[0][0].total || 0,
    todayGiftCodes: (await connection.query(`SELECT SUM(money) as total FROM redenvelopes_used WHERE time BETWEEN ? AND ?;`, [startDate, endDate]))[0][0].total || 0,
    totalGiftCodesCount: (await connection.query(`SELECT COUNT(*) as total FROM redenvelopes_used;`))[0][0].total || 0,
    todayGiftCodesCount: (await connection.query(`SELECT COUNT(*) as total FROM redenvelopes_used WHERE time BETWEEN ? AND ?;`, [startDate, endDate]))[0][0].total || 0,
    bonusBreakdown: (await connection.query(`SELECT type, SUM(amount) as total FROM claimed_rewards WHERE status = 1 GROUP BY type;`))[0],
    todayBonusBreakdown: (await connection.query(`SELECT type, SUM(amount) as total FROM claimed_rewards WHERE status = 1 AND time BETWEEN ? AND ? GROUP BY type;`, [startDate, endDate]))[0],
    totalRechargeCount: (await connection.query(`SELECT COUNT(*) as total FROM recharge WHERE status = 1;`))[0][0].total || 0,
    todayRechargeCount: (await connection.query(`SELECT COUNT(*) as total FROM recharge WHERE status = 1 AND time BETWEEN ? AND ?;`, [startDate, endDate]))[0][0].total || 0,
    salaryTotal: salaryTotal[0].total || 0,
    salaryToday: salaryToday[0].total || 0,
    salaryYesterday: salaryYesterday[0].total || 0,
  });
};

const walletData2 = async (req, res) => {
  let startDate = req.body.startDate ? Number(req.body.startDate) : new Date().setHours(0, 0, 0, 0);
  let endDate = req.body.endDate ? Number(req.body.endDate) : new Date().setHours(23, 59, 59, 999);
  //convert to IST
  startDate = moment(startDate).tz("Asia/Kolkata").valueOf();
  endDate = moment(endDate).tz("Asia/Kolkata").valueOf();
  console.log("startDate: ", startDate);
  console.log("endDate: ", endDate);

  const [users] = await connection.query(
    `SELECT SUM(money) as total FROM users WHERE status = 1  AND time BETWEEN ? AND ?;`,
    [startDate, endDate]
  );

  const [usersTotal] = await connection.query(
    `SELECT COUNT(id) as total FROM users WHERE status = 1  AND time BETWEEN ? AND ?;`,
    [startDate, endDate]
  );

  const [recharge] = await connection.query(
    `SELECT SUM(money) as total FROM recharge WHERE status = 1  AND time BETWEEN ? AND ?;`,
    [startDate, endDate]
  );

  const [withdraw] = await connection.query(
    `SELECT SUM(money) as total FROM withdraw WHERE status = 1  AND time BETWEEN ? AND ?;`,
    [startDate, endDate]
  );

  const [recharge_pending] = await connection.query(
    `SELECT SUM(money) as total FROM recharge WHERE status = 0  AND   time BETWEEN ? AND ?;`,
    [startDate, endDate]
  );

  const [withdraw_pending] = await connection.query(
    `SELECT SUM(money) as total FROM withdraw WHERE status = 0  AND time BETWEEN ? AND ?;`,
    [startDate, endDate]
  );

  const [salary] = await connection.query(
    `SELECT SUM(amount) as total FROM salary WHERE time BETWEEN ? AND ?;`,
    [startDate, endDate]
  );

  const [giftCode] = await connection.query(
    `SELECT SUM(money) as total FROM redenvelopes_used WHERE time BETWEEN ? AND ?;`,
    [startDate, endDate]
  );

  const [commissions] = await connection.query(
    `SELECT SUM(money) as total FROM commissions WHERE time BETWEEN ? AND ?;`,
    [startDate, endDate]
  );

  const [claimedRewards] = await connection.query(
    `SELECT SUM(amount) as total FROM claimed_rewards WHERE status = 1 AND time BETWEEN ? AND ?;`,
    [startDate, endDate]
  );

  const [bonusesToday] = await connection.query(
    `SELECT SUM(amount) as total FROM claimed_rewards WHERE status = 1 AND time BETWEEN ? AND ?;`,
    [startDate, endDate]
  );

  let yesterdayStart = startDate - 86400000;
  let yesterdayEnd = endDate - 86400000;

  const [commissionsYesterday] = await connection.query(
    `SELECT SUM(money) as total FROM commissions WHERE time BETWEEN ? AND ?;`,
    [yesterdayStart, yesterdayEnd]
  );

  const [rechargeYesterday] = await connection.query(
    `SELECT SUM(money) as total FROM recharge WHERE status = 1 AND time BETWEEN ? AND ?;`,
    [yesterdayStart, yesterdayEnd]
  );

  const [withdrawYesterday] = await connection.query(
    `SELECT SUM(money) as total FROM withdraw WHERE status = 1 AND time BETWEEN ? AND ?;`,
    [yesterdayStart, yesterdayEnd]
  );

  const [bonusesYesterday] = await connection.query(
    `SELECT SUM(amount) as total FROM claimed_rewards WHERE status = 1 AND time BETWEEN ? AND ?;`,
    [yesterdayStart, yesterdayEnd]
  );

  const [usersYesterday] = await connection.query(
    `SELECT COUNT(id) as total FROM users WHERE status = 1 AND time BETWEEN ? AND ?;`,
    [yesterdayStart, yesterdayEnd]
  );

  const [usersToday] = await connection.query(
    `SELECT COUNT(id) as total FROM users WHERE status = 1 AND time BETWEEN ? AND ?;`,
    [startDate, endDate]
  );

  const [commissionsToday] = await connection.query(
    `SELECT SUM(money) as total FROM commissions WHERE time BETWEEN ? AND ?;`,
    [startDate, endDate]
  );

  return res.status(200).json({
    message: "Success",
    status: true,
    usersWallet: users[0].total || 0,
    recharges: recharge[0].total || 0,
    withdraws: (withdraw[0].total || 0),
    totalUser: usersTotal[0].total || 0,
    todayUser: usersToday[0].total || 0,
    yesterdayUser: usersYesterday[0].total || 0,
    pRecharge: recharge_pending[0].total || 0,
    pWithdrawal: withdraw_pending[0].total || 0,
    salary: salary[0].total || 0,
    totalCommissions: commissions[0].total || 0,
    todayCommissions: commissionsToday[0].total || 0,
    yesterdayCommissions: commissionsYesterday[0].total || 0,
    totalBonuses: claimedRewards[0].total || 0,
    todayBonuses: bonusesToday[0].total || 0,
    yesterdayBonuses: bonusesYesterday[0].total || 0,
    totalGiftCodes: (await connection.query(`SELECT SUM(money) as total FROM redenvelopes_used;`))[0][0].total || 0,
    todayGiftCodes: (await connection.query(`SELECT SUM(money) as total FROM redenvelopes_used WHERE time BETWEEN ? AND ?;`, [startDate, endDate]))[0][0].total || 0,
    totalGiftCodesCount: (await connection.query(`SELECT COUNT(*) as total FROM redenvelopes_used;`))[0][0].total || 0,
    todayGiftCodesCount: (await connection.query(`SELECT COUNT(*) as total FROM redenvelopes_used WHERE time BETWEEN ? AND ?;`, [startDate, endDate]))[0][0].total || 0,
    bonusBreakdown: (await connection.query(`SELECT type, SUM(amount) as total FROM claimed_rewards WHERE status = 1 GROUP BY type;`))[0],
    todayBonusBreakdown: (await connection.query(`SELECT type, SUM(amount) as total FROM claimed_rewards WHERE status = 1 AND time BETWEEN ? AND ? GROUP BY type;`, [startDate, endDate]))[0],
    yesterdayRecharge: rechargeYesterday[0].total || 0,
    yesterdayWithdraw: withdrawYesterday[0].total || 0,
    totalRechargeCount: (await connection.query(`SELECT COUNT(*) as total FROM recharge WHERE status = 1;`))[0][0].total || 0,
    todayRechargeCount: (await connection.query(`SELECT COUNT(*) as total FROM recharge WHERE status = 1 AND time BETWEEN ? AND ?;`, [startDate, endDate]))[0][0].total || 0,
  });
};

const listCommission = async (req, res) => {
  let phone = req.params.phone;
  let { pageno, limit } = req.body;
  if (!pageno || !limit) return res.status(200).json({ status: false, msg: 'No data' });
  const [commissions] = await connection.query('SELECT * FROM commissions WHERE phone = ? ORDER BY id DESC LIMIT ?, ?', [phone, Number(pageno), Number(limit)]);
  const [total] = await connection.query('SELECT COUNT(*) as count FROM commissions WHERE phone = ?', [phone]);
  return res.status(200).json({ status: true, datas: commissions, page_total: Math.ceil(total[0].count / limit) });
};

const listRewards = async (req, res) => {
  let phone = req.params.phone;
  let { pageno, limit } = req.body;
  if (!pageno || !limit) return res.status(200).json({ status: false, msg: 'No data' });
  const [rewards] = await connection.query('SELECT * FROM claimed_rewards WHERE phone = ? ORDER BY id DESC LIMIT ?, ?', [phone, Number(pageno), Number(limit)]);
  const [total] = await connection.query('SELECT COUNT(*) as count FROM claimed_rewards WHERE phone = ?', [phone]);
  return res.status(200).json({ status: true, datas: rewards, page_total: Math.ceil(total[0].count / limit) });
};

const depositBonusesConfigPage = async (req, res) => {
  return res.render("manage/depositBonusesConfig.ejs");
};

const getDepositBonusesList = async (req, res) => {
  try {
    const [rows] = await connection.execute("SELECT * FROM deposit_bonuses_config ORDER BY deposit_number ASC");
    return res.status(200).json({ status: true, data: rows });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const addDepositBonus = async (req, res) => {
  const { name, deposit_number, min_deposit, user_bonus_type, referrer_bonus_type, user_bonus, referrer_bonus, description } = req.body;
  try {
    await connection.execute(
      "INSERT INTO deposit_bonuses_config (name, deposit_number, min_deposit, user_bonus_type, referrer_bonus_type, user_bonus, referrer_bonus, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [name, deposit_number, min_deposit || 0, user_bonus_type || 'flat', referrer_bonus_type || 'flat', user_bonus || 0, referrer_bonus || 0, description || ''],
    );
    return res.status(200).json({ status: true, message: "Deposit bonus rule added successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const updateDepositBonus = async (req, res) => {
  const { id, name, deposit_number, min_deposit, user_bonus_type, referrer_bonus_type, user_bonus, referrer_bonus, description, status } = req.body;
  try {
    await connection.execute(
      "UPDATE deposit_bonuses_config SET name = ?, deposit_number = ?, min_deposit = ?, user_bonus_type = ?, referrer_bonus_type = ?, user_bonus = ?, referrer_bonus = ?, description = ?, status = ? WHERE id = ?",
      [name, deposit_number, min_deposit || 0, user_bonus_type || 'flat', referrer_bonus_type || 'flat', user_bonus || 0, referrer_bonus || 0, description || '', status, id],
    );
    return res.status(200).json({ status: true, message: "Deposit bonus rule updated successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const deleteDepositBonus = async (req, res) => {
  const { id } = req.body;
  try {
    await connection.query("DELETE FROM deposit_bonuses_config WHERE id = ?", [id]);
    return res.status(200).json({ status: true, message: "Deposit bonus rule deleted successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const getBanners = async (req, res) => {
  try {
    const [rows] = await connection.query("SELECT * FROM banners ORDER BY id DESC");
    return res.status(200).json({ status: true, data: rows });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const addBanner = async (req, res) => {
  const { type, link, priority, content } = req.body;
  const image = req.files && req.files['banner_image'] ? `/uploads/${req.files['banner_image'][0].filename}` : null;

  if (!image) {
    return res.status(400).json({ status: false, message: "Banner image is required" });
  }

  try {
    // If singleton type, deactivate others
    if (type === 'deposit_popup') {
      await connection.query("UPDATE banners SET status = 0 WHERE type = 'deposit_popup'");
    }
    await connection.query("INSERT INTO banners (type, image, link, priority, content) VALUES (?, ?, ?, ?, ?)", [type, image, link, priority || 0, content || null]);
    return res.status(200).json({ status: true, message: "Banner added successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const updateBannerStatus = async (req, res) => {
  const { id, status, type } = req.body;
  try {
    if (status == 1 && type === 'deposit_popup') {
      await connection.query("UPDATE banners SET status = 0 WHERE type = 'deposit_popup'");
    }
    await connection.query("UPDATE banners SET status = ? WHERE id = ?", [status, id]);
    return res.status(200).json({ status: true, message: "Status updated successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const deleteBanner = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ status: false, message: "Banner ID is required" });
  }
  try {
    const [result] = await connection.query("DELETE FROM banners WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: "Banner not found" });
    }
    return res.status(200).json({ status: true, message: "Banner deleted successfully" });
  } catch (error) {
    console.error('deleteBanner error:', error.message);
    return res.status(500).json({ status: false, message: error.message });
  }
};

const updateBanner = async (req, res) => {
  const { id, type, link, priority, content } = req.body;
  const newImage = req.files && req.files['banner_image'] ? `/uploads/${req.files['banner_image'][0].filename}` : null;

  try {
    if (newImage) {
      await connection.query("UPDATE banners SET type = ?, image = ?, link = ?, priority = ?, content = ? WHERE id = ?", [type, newImage, link, priority || 0, content || null, id]);
    } else {
      await connection.query("UPDATE banners SET type = ?, link = ?, priority = ?, content = ? WHERE id = ?", [type, link, priority || 0, content || null, id]);
    }

    // If it's a deposit popup and became active, deactivate others
    if (type === 'deposit_popup') {
      // Note: Usually we check if it's active. Let's assume the user might want to toggle it later.
      // For now, just maintain consistency.
    }

    return res.status(200).json({ status: true, message: "Banner updated successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};


const updateWithdrawalGlobal = async (req, res) => {
  try {
    const { daily_withdraw_limit } = req.body;
    await connection.query("UPDATE admin_ac SET daily_withdraw_limit = ? WHERE id = 1", [daily_withdraw_limit]);
    return res.status(200).json({
      message: "Global withdrawal settings updated",
      status: true
    });
  } catch (error) {
    console.error("updateWithdrawalGlobal error:", error);
    return res.status(500).json({ message: "Server error", status: false });
  }
};

const updateIPRegistrationSettings = async (req, res) => {
  try {
    const { ip_reg_limit, ip_reg_status } = req.body;
    await connection.query("UPDATE admin_ac SET ip_reg_limit = ?, ip_reg_status = ? WHERE id = 1", [ip_reg_limit, ip_reg_status]);
    return res.status(200).json({ status: true, message: "IP Registration settings updated successfully" });
  } catch (error) {
    console.error("updateIPRegistrationSettings error:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

const updatePaymentGateway = async (req, res) => {
  try {
    const { gateway_name, app_id, app_secret, merchant_id, public_key, private_key, callback_url, status, min_recharge, max_recharge, return_url, quick_amounts, exchange_rate, instructions } = req.body;

    let qr_code = null;
    if (req.files && req.files.length > 0) {
      const file = req.files.find(f => f.fieldname === 'qr_code');
      if (file) {
        qr_code = `/uploads/${file.filename}`;
      }
    }

    const category = req.body.category || (gateway_name.includes('usdt') || gateway_name.includes('ccpayment') ? 'USDT' : 'INR');

    if (qr_code) {
      await connection.query(
        "INSERT INTO payment_configs (gateway_name, app_id, app_secret, merchant_id, public_key, private_key, callback_url, status, min_recharge, max_recharge, return_url, quick_amounts, qr_code, exchange_rate, instructions, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE app_id = ?, app_secret = ?, merchant_id = ?, public_key = ?, private_key = ?, callback_url = ?, status = ?, min_recharge = ?, max_recharge = ?, return_url = ?, quick_amounts = ?, qr_code = ?, exchange_rate = ?, instructions = ?, category = ?",
        [gateway_name, app_id, app_secret, merchant_id, public_key, private_key, callback_url, status, min_recharge, max_recharge, return_url, quick_amounts, qr_code, exchange_rate || 1, instructions || '', category, app_id, app_secret, merchant_id, public_key, private_key, callback_url, status, min_recharge, max_recharge, return_url, quick_amounts, qr_code, exchange_rate || 1, instructions || '', category]
      );
    } else {
      await connection.query(
        "INSERT INTO payment_configs (gateway_name, app_id, app_secret, merchant_id, public_key, private_key, callback_url, status, min_recharge, max_recharge, return_url, quick_amounts, exchange_rate, instructions, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE app_id = ?, app_secret = ?, merchant_id = ?, public_key = ?, private_key = ?, callback_url = ?, status = ?, min_recharge = ?, max_recharge = ?, return_url = ?, quick_amounts = ?, exchange_rate = ?, instructions = ?, category = ?",
        [gateway_name, app_id, app_secret, merchant_id, public_key, private_key, callback_url, status, min_recharge, max_recharge, return_url, quick_amounts, exchange_rate || 1, instructions || '', category, app_id, app_secret, merchant_id, public_key, private_key, callback_url, status, min_recharge, max_recharge, return_url, quick_amounts, exchange_rate || 1, instructions || '', category]
      );
    }

    return res.status(200).json({
      message: "Gateway updated successfully",
      status: true
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to update gateway",
      status: false
    });
  }
};

const updateGlobalExchangeRate = async (req, res) => {
  try {
    const { deposit_rate, withdraw_rate } = req.body;
    await connection.query("UPDATE admin_ac SET usdt_exchange_rate = ?, usdt_withdraw_rate = ? LIMIT 1", [deposit_rate, withdraw_rate]);
    return res.status(200).json({ status: true, message: "Global exchange rates updated successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const updateCurrency = async (req, res) => {
  try {
    const { name, symbol } = req.body;
    await connection.query("UPDATE admin_ac SET currency_name = ?, currency_symbol = ? LIMIT 1", [name, symbol]);
    return res.status(200).json({ status: true, message: "Currency settings updated successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const adminController = {
  updatePaymentGateway,
  updateGlobalExchangeRate,
  updateCurrency,
  getBonusPercentages,
  attendanceConfigPage,
  getAttendanceConfig,
  updateAttendanceConfig,
  missionsConfigPage,
  getMissionsList,
  addMission,
  deleteMission,
  updateMission,
  invitationBonusConfigPage,
  getInvitationBonusList,
  addInvitationBonus,
  updateInvitationBonus,
  deleteInvitationBonus,

  rebetRankPage,
  getRebetRankInfo,
  updateRebetRank,
  Dashboard,
  Dashboard2,
  walletData,
  walletData2,
  getBetHistory,
  getTrxHistory,
  adminPage,
  adminPage3,
  adminPage5,
  adminPage10,
  totalJoin,
  middlewareAdminController,
  changeAdmin,
  membersPage,
  listMember,
  infoMember,
  memberTreePage,
  getMemberTree,
  userInfo,
  statistical,
  statistical2,
  rechargePage,
  recharge,
  rechargeDuyet,
  rechargeRecord,
  withdrawRecord,
  withdraw,
  levelSetting,
  handlWithdraw,
  settings,
  editResult2,
  settingBank,
  settingGet,
  settingCskh,
  settingMaintenance,
  settingSiteBranding,
  settingbuff,
  register,
  registerCTV,
  ctvPage,
  listCTV,
  profileUser,
  ctvProfilePage,
  infoCtv,
  infoCtv2,
  giftPage,
  createBonus,
  listRedenvelops,
  banned,
  deleteUser,
  listRechargeMem,
  listWithdrawMem,
  getLevelInfo,
  listRedenvelope,
  listBet,
  apiListBet,
  adminPage5d,
  listOrderOld,
  listOrderOldK3,
  editResult,
  adminPageK3,
  adminPageBetHistory,
  adminPageApiGamesHistory,
  adminPageTrxHistory,
  updateLevel,
  CreatedSalaryRecord,
  CreatedSalary,
  DailySalaryEligibility,
  listCheckSalaryEligibility,
  getSalary,
  settingBonusPercent,
  referralsPage,
  listReferrals,
  getReferralTree,
  get5dHistory,
  getK3History,
  getApiGamesHistory,
  adminPage5dHistory,
  adminPageK3History,
  listCommission,
  listRewards,
  depositBonusesConfigPage,
  getDepositBonusesList,
  addDepositBonus,
  updateDepositBonus,
  deleteDepositBonus,
  getBanners,
  addBanner,
  updateBannerStatus,
  deleteBanner,
  updateBanner,
  getSMSSettings,
  updateSMSSettings,

  claimedRewardsPage: async (req, res) => {
    return res.render("manage/claimedRewards.ejs");
  },
  getClaimedRewardsAPI: async (req, res) => {
    let { pageno, limit, type, phone, startDate, endDate } = req.body;
    pageno = Number(pageno) || 0;
    limit = Number(limit) || 20;

    let params = [];
    let whereClause = "WHERE 1=1";

    if (type) {
      whereClause += " AND type = ?";
      params.push(type);
    }
    if (phone) {
      whereClause += " AND phone LIKE ?";
      params.push(`%${phone}%`);
    }
    if (startDate && endDate) {
      whereClause += " AND time BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    const [rows] = await connection.query(
      `SELECT * FROM claimed_rewards ${whereClause} ORDER BY id DESC LIMIT ?, ?`,
      [...params, pageno * limit, limit]
    );
    const [total] = await connection.query(
      `SELECT COUNT(*) as count FROM claimed_rewards ${whereClause}`,
      params
    );

    const [summary] = await connection.query(
      `SELECT type, SUM(amount) as total_amount FROM claimed_rewards ${whereClause} GROUP BY type`,
      params
    );

    const todayStart = new Date().setHours(0, 0, 0, 0);
    const todayEnd = new Date().setHours(23, 59, 59, 999);

    const [todaySummary] = await connection.query(
      `SELECT type, SUM(amount) as total_amount FROM claimed_rewards WHERE time BETWEEN ? AND ? GROUP BY type`,
      [todayStart, todayEnd]
    );

    const yesterdayStart = todayStart - 86400000;
    const yesterdayEnd = todayStart - 1;
    const [yesterdaySummary] = await connection.query(
      `SELECT type, SUM(amount) as total_amount FROM claimed_rewards WHERE time BETWEEN ? AND ? GROUP BY type`,
      [yesterdayStart, yesterdayEnd]
    );

    const [lifetimeSummary] = await connection.query(
      `SELECT type, SUM(amount) as total_amount FROM claimed_rewards GROUP BY type`
    );

    return res.status(200).json({
      status: true,
      datas: rows,
      page_total: Math.ceil(total[0].count / limit),
      total_count: total[0].count,
      summary: summary,
      today_summary: todaySummary,
      yesterday_summary: yesterdaySummary,
      lifetime_summary: lifetimeSummary
    });
  },
  commissionReportsPage: async (req, res) => {
    return res.render("manage/commissionReports.ejs");
  },
  getCommissionReportsAPI: async (req, res) => {
    let { pageno, limit, phone, startDate, endDate } = req.body;
    pageno = Number(pageno) || 0;
    limit = Number(limit) || 20;

    let params = [];
    let whereClause = "WHERE 1=1";

    if (phone) {
      whereClause += " AND c.phone LIKE ?";
      params.push(`%${phone}%`);
    }
    if (startDate && endDate) {
      whereClause += " AND c.time BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    const [rows] = await connection.query(
      `SELECT c.*, u.id_user as id_sub FROM commissions c 
       LEFT JOIN users u ON c.from_user_phone = u.phone 
       ${whereClause} 
       ORDER BY c.id DESC LIMIT ?, ?`,
      [...params, pageno * limit, limit]
    );
    const [total] = await connection.query(
      `SELECT COUNT(*) as count FROM commissions c ${whereClause}`,
      params
    );

    const [totalSum] = await connection.query(
      `SELECT SUM(money) as total_amount FROM commissions c ${whereClause}`,
      params
    );

    const todayStart = new Date().setHours(0, 0, 0, 0);
    const yesterdayStart = todayStart - 86400000;
    const yesterdayEnd = todayStart - 1;

    const [todaySum] = await connection.query(
      `SELECT SUM(money) as total_amount FROM commissions WHERE time BETWEEN ? AND ?`,
      [todayStart, new Date().setHours(23, 59, 59, 999)]
    );

    const [yesterdaySum] = await connection.query(
      `SELECT SUM(money) as total_amount FROM commissions WHERE time BETWEEN ? AND ?`,
      [yesterdayStart, yesterdayEnd]
    );

    const [lifetimeSum] = await connection.query(
      `SELECT SUM(money) as total_amount FROM commissions`
    );

    return res.status(200).json({
      status: true,
      datas: rows,
      page_total: Math.ceil(total[0].count / limit),
      total_count: total[0].count,
      total_sum: totalSum[0].total_amount || 0,
      today_sum: todaySum[0].total_amount || 0,
      yesterday_sum: yesterdaySum[0].total_amount || 0,
      lifetime_sum: lifetimeSum[0].total_amount || 0
    });
  },
  getWithdrawConfigs: async (req, res) => {
    try {
      const [rows] = await connection.query("SELECT * FROM withdrawal_configs");
      return res.status(200).json({ status: true, data: rows });
    } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
    }
  },
  updateWithdrawConfig: async (req, res) => {
    try {
      const { method_name, min_amount, max_amount, status, instructions } = req.body;
      await connection.query(
        "UPDATE withdrawal_configs SET min_amount = ?, max_amount = ?, status = ?, instructions = ? WHERE method_name = ?",
        [min_amount, max_amount, status, instructions || '', method_name]
      );
      return res.status(200).json({ status: true, message: `${method_name} settings updated successfully` });
    } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
    }
  },
  ctvTeamPage: async (req, res) => {
    const phone = req.params.phone;
    return res.render("manage/ctv_team.ejs", { phone });
  },
  listCtvTeam: async (req, res) => {
    let { pageno, limit, phone, searchPhone } = req.body;
    pageno = Number(pageno) || 0;
    limit = Number(limit) || 20;

    try {
      let whereClause = "WHERE ctv = ?";
      let params = [phone];

      if (searchPhone) {
        whereClause += " AND (phone LIKE ? OR id_user LIKE ?)";
        params.push(`%${searchPhone}%`, `%${searchPhone}%`);
      }

      const [users] = await connection.query(
        `SELECT phone, id_user, name_user, money, total_money, status FROM users ${whereClause} ORDER BY id DESC LIMIT ?, ?`,
        [...params, pageno * limit, limit]
      );
      const [total] = await connection.query(
        `SELECT COUNT(*) as count FROM users ${whereClause}`,
        params
      );
      const total_count = total[0].count;

      if (users.length === 0) {
        return res.status(200).json({ status: true, datas: [], total: 0 });
      }

      const phones = users.map(u => u.phone);
      const stats = await userStatsCollaborator.getBulkTeamStats(phones);

      // Aggregate Global Summary for the team
      let summary = {
        total_deposit: 0, today_deposit: 0, yesterday_deposit: 0,
        total_withdraw: 0, today_withdraw: 0, yesterday_withdraw: 0,
        total_bet: 0, today_bet: 0, yesterday_bet: 0,
        total_win: 0, today_win: 0, yesterday_win: 0,
        total_members: total_count
      };

      const [allTeamPhones] = await connection.query("SELECT phone FROM users WHERE ctv = ?", [phone]);
      const allPhones = allTeamPhones.map(u => u.phone);
      const globalStats = await userStatsCollaborator.getBulkTeamStats(allPhones);

      Object.values(globalStats).forEach(s => {
        summary.total_deposit += s.deposit.total;
        summary.today_deposit += s.deposit.today;
        summary.yesterday_deposit += s.deposit.yesterday;
        summary.total_withdraw += s.withdraw.total;
        summary.today_withdraw += s.withdraw.today;
        summary.yesterday_withdraw += s.withdraw.yesterday;
        summary.total_bet += s.bet.total;
        summary.today_bet += s.bet.today;
        summary.yesterday_bet += s.bet.yesterday;
        summary.total_win += s.win.total;
        summary.today_win += s.win.today;
        summary.yesterday_win += s.win.yesterday;
      });

      const data = users.map(u => ({
        ...u,
        stats: stats[u.phone] || {
          deposit: { total: 0, today: 0, yesterday: 0 },
          withdraw: { total: 0, today: 0, yesterday: 0 },
          bet: { total: 0, today: 0, yesterday: 0 },
          win: { total: 0, today: 0, yesterday: 0 },
          reward: { total: 0, today: 0, yesterday: 0 }
        }
      }));

      return res.status(200).json({
        status: true,
        message: "Success",
        datas: data,
        summary: summary,
        page_total: Math.ceil(total_count / limit),
        total_count: total_count
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: false, message: error.message });
    }
  },
  updateWithdrawalGlobal,
  updateIPRegistrationSettings,

  giftHistoryPage: async (req, res) => {
    return res.render("manage/giftHistory.ejs");
  },

  listGiftHistoryAdmin: async (req, res) => {
    let { pageno, limit, phone, startDate, endDate } = req.body;
    pageno = Number(pageno) || 0;
    limit = Number(limit) || 20;

    let params = [];
    let filterSql = "";

    if (phone) {
      filterSql += " AND (phone LIKE ? OR phone_used LIKE ? OR id_redenvelops LIKE ?)";
      params.push(`%${phone}%`, `%${phone}%`, `%${phone}%`);
    }

    if (startDate) {
      filterSql += " AND DATE(FROM_UNIXTIME(time/1000)) >= ?";
      params.push(startDate);
    }
    if (endDate) {
      filterSql += " AND DATE(FROM_UNIXTIME(time/1000)) <= ?";
      params.push(endDate);
    }

    try {
      const [totalRes] = await connection.query(`SELECT COUNT(*) as total FROM redenvelopes_used WHERE 1=1${filterSql}`, params);
      let total = totalRes[0].total;

      params.push(pageno, limit);
      const [list] = await connection.query(`SELECT * FROM redenvelopes_used WHERE 1=1${filterSql} ORDER BY id DESC LIMIT ?, ?`, params);

      return res.status(200).json({
        status: true,
        datas: list,
        page_total: Math.ceil(total / limit),
        total: total
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: false, message: error.message });
    }
  }
};

export default adminController;
