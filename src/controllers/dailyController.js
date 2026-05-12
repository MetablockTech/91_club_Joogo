import connection from "../config/connectDB.js";
import moment from "moment-timezone";

let timeNow = new Date().getTime();

const dailyPage = async (req, res) => {
  return res.render("daily/statistical.ejs", { activePage: 'dashboard' });
};

const giftHistoryPage = async (req, res) => {
  return res.render("daily/giftHistory.ejs", { activePage: 'gift-history' });
};

const adjustHistoryPage = async (req, res) => {
  return res.render("daily/adjustHistory.ejs", { activePage: 'adjust-history' });
};

const listMeber = async (req, res) => {
  return res.render("daily/members.ejs", { activePage: 'members' });
};

const profileMember = async (req, res) => {
  return res.render("daily/profileMember.ejs");
};

const settingPage = async (req, res) => {
  return res.render("daily/settings.ejs");
};

const listRecharge = async (req, res) => {
  return res.render("daily/listRecharge.ejs", { activePage: 'recharge' });
};

const listWithdraw = async (req, res) => {
  return res.render("daily/listWithdraw.ejs", { activePage: 'withdraw' });
};

const listGiftHistory = async (req, res) => {
  let auth = req.cookies.auth;
  let { pageno, limit, startDate, endDate } = req.body;
  pageno = Number(pageno) || 0;
  limit = Number(limit) || 20;

  const [user] = await connection.query("SELECT phone FROM users WHERE token = ?", [auth]);
  if (user.length == 0) return res.status(200).json({ message: "Error", status: false });
  let phone = user[0].phone;

  let params = [phone];
  let filterSql = "";
  if (startDate) { filterSql += " AND DATE(FROM_UNIXTIME(time/1000)) >= ?"; params.push(startDate); }
  if (endDate) { filterSql += " AND DATE(FROM_UNIXTIME(time/1000)) <= ?"; params.push(endDate); }

  const [totalRes] = await connection.query(`SELECT COUNT(*) as total FROM redenvelopes_used WHERE phone = ?${filterSql}`, params);
  params.push(pageno, limit);
  const [list] = await connection.query(`SELECT * FROM redenvelopes_used WHERE phone = ?${filterSql} ORDER BY id DESC LIMIT ?, ?`, params);

  return res.status(200).json({ status: true, datas: list, page_total: Math.ceil(totalRes[0].total / limit) });
};

const listAdjustmentHistory = async (req, res) => {
  let auth = req.cookies.auth;
  let { pageno, limit, startDate, endDate } = req.body;
  pageno = Number(pageno) || 0;
  limit = Number(limit) || 20;

  const [user] = await connection.query("SELECT phone FROM users WHERE token = ?", [auth]);
  if (user.length == 0) return res.status(200).json({ message: "Error", status: false });
  let phone = user[0].phone;

  let params = [phone];
  let filterSql = "";
  if (startDate) { filterSql += " AND DATE(FROM_UNIXTIME(time/1000)) >= ?"; params.push(startDate); }
  if (endDate) { filterSql += " AND DATE(FROM_UNIXTIME(time/1000)) <= ?"; params.push(endDate); }

  const [totalRes] = await connection.query(`SELECT COUNT(*) as total FROM financial_details WHERE phone = ?${filterSql}`, params);
  params.push(pageno, limit);
  const [list] = await connection.query(`SELECT * FROM financial_details WHERE phone = ?${filterSql} ORDER BY id DESC LIMIT ?, ?`, params);

  return res.status(200).json({ status: true, datas: list, page_total: Math.ceil(totalRes[0].total / limit) });
};

const pageInfo = async (req, res) => {
  let phone = req.params.phone;
  return res.render("daily/profileMember.ejs", { phone });
};

const giftPage = async (req, res) => {
  let auth = req.cookies.auth;
  const [rows] = await connection.execute(
    "SELECT `ctv_gift_wallet`, `ctv_adjustment_wallet` FROM `users` WHERE `token` = ? AND veri = 1",
    [auth],
  );
  let money = 0;
  let money2 = 0;
  if (rows.length != 0) {
    money = rows[0].ctv_gift_wallet;
    money2 = rows[0].ctv_adjustment_wallet;
  }
  return res.render("daily/giftPage.ejs", { money, money2, activePage: 'gifts' });
};

const support = async (req, res) => {
  return res.render("daily/support.ejs");
};

const settings = async (req, res) => {
  let auth = req.cookies.auth;
  let type = req.body.type;
  let value = req.body.value;

  const [rows] = await connection.execute(
    "SELECT `phone` FROM `users` WHERE `token` = ? AND veri = 1",
    [auth],
  );
  if (rows.length == 0) {
    return res.status(200).json({
      message: "Error",
      status: false,
    });
  }
  if (!type) {
    const [settings] = await connection.execute(
      "SELECT `telegram` FROM `admin_ac`",
    );
    let telegram = settings[0].telegram;
    let telegram2 = rows[0].ctv_telegram;
    return res.status(200).json({
      message: "Get success",
      status: true,
      telegram: telegram,
      telegram2: telegram2,
    });
  } else {
    await connection.execute(
      "UPDATE `users` SET ctv_telegram = ? WHERE token = ?",
      [value, auth],
    );
    return res.status(200).json({
      message: "Successfully edited",
      status: true,
    });
  }
};

// xác nhận admin
const middlewareDailyController = async (req, res, next) => {
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
      if (rows[0].level == 2) {
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

const statistical = async (req, res) => {
  const auth = req.cookies.auth;

  const [user] = await connection.query(
    "SELECT * FROM users WHERE token = ? ",
    [auth],
  );

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

  // const [recharge] = await connection.query('SELECT SUM(`money`) as total FROM recharge WHERE phone = ? AND status = 1 ', [phone]);
  // const [withdraw] = await connection.query('SELECT SUM(`money`) as total FROM withdraw WHERE phone = ? AND status = 1 ', [phone]);
  // const [bank_user] = await connection.query('SELECT * FROM user_bank WHERE phone = ? ', [phone]);
  return res.status(200).json({
    message: "Success",
    status: true,
    datas: user,
    f1: f1s.length,
    f2: f2,
    f3: f3,
    f4: f4,
  });
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
  let phone = req.params.phone;
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
  let { token, password, otp, level, ...userD } = user[0];

  if (auths[0].phone != userD.ctv) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  // Calculate F1-F7 using BFS
  let teamStats = new Array(7).fill(0);
  let currentLevelCodes = [userD.code];

  for (let i = 0; i < 7; i++) {
    if (currentLevelCodes.length === 0) break;
    const [rows] = await connection.query(
      "SELECT code FROM users WHERE invite IN (?)",
      [currentLevelCodes]
    );
    teamStats[i] = rows.length;
    currentLevelCodes = rows.map(r => r.code);
  }

  const [rechargeTotal] = await connection.query(
    "SELECT SUM(`money`) as total FROM recharge WHERE phone = ? AND status = 1 ",
    [phone],
  );
  const [withdrawTotal] = await connection.query(
    "SELECT SUM(`money`) as total FROM withdraw WHERE phone = ? AND status = 1 ",
    [phone],
  );
  const [bank_user] = await connection.query(
    "SELECT * FROM user_bank WHERE phone = ? ",
    [phone],
  );
  const [total_commission] = await connection.query(
    "SELECT SUM(`money`) as total FROM commissions WHERE phone = ?",
    [phone],
  );
  const [total_claimed] = await connection.query(
    "SELECT SUM(`amount`) as total FROM claimed_rewards WHERE phone = ? AND status = 1",
    [phone],
  );
  const [ng_moi] = await connection.query(
    "SELECT `phone` FROM users WHERE code = ? ",
    [userD.invite],
  );

  // Aggregated Total Bet Calculation (Internal + API Games)
  const [internalBets] = await connection.query(
    `SELECT (
      (SELECT IFNULL(SUM(money), 0) FROM minutes_1 WHERE phone = ?) +
      (SELECT IFNULL(SUM(money), 0) FROM result_k3 WHERE phone = ?) +
      (SELECT IFNULL(SUM(money), 0) FROM result_5d WHERE phone = ?) +
      (SELECT IFNULL(SUM(money), 0) FROM trx_wingo_bets WHERE phone = ?)
    ) as total`,
    [phone, phone, phone, phone]
  );

  const [apiBets] = await connection.query(
    `SELECT (
      (SELECT IFNULL(SUM(betAmount), 0) FROM jilliebethistory WHERE phone = ?) +
      (SELECT IFNULL(SUM(deposit_amount), 0) FROM spribetransaction WHERE phone = ? AND type = 0) +
      (SELECT IFNULL(SUM(amount), 0) FROM wc_api_transactions WHERE user_id = ? AND type = 'debit' AND is_cancel = 0)
    ) as total`,
    [phone, phone, userD.id_user]
  );

  const calculatedTotalBet = (Number(internalBets[0]?.total) || 0) + (Number(apiBets[0]?.total) || 0);

  return res.status(200).json({
    message: "Success",
    status: true,
    datas: userD,
    total_r: rechargeTotal,
    total_w: withdrawTotal,
    f1: teamStats[0],
    f2: teamStats[1],
    f3: teamStats[2],
    f4: teamStats[3],
    f5: teamStats[4],
    f6: teamStats[5],
    f7: teamStats[6],
    bank_user: bank_user,
    total_commission: total_commission[0]?.total || 0,
    total_claimed_rewards: total_claimed[0]?.total || 0,
    inviter_phone: ng_moi[0]?.phone || null,
    total_recharge: rechargeTotal[0]?.total || 0,
    total_withdraw: withdrawTotal[0]?.total || 0,
    total_bet_amount: calculatedTotalBet,
  });
};

const infoCtv = async (req, res) => {
  const auth = req.cookies.auth;

  const [user] = await connection.query("SELECT * FROM users WHERE token = ?", [auth]);
  if (user.length == 0) return res.status(200).json({ message: "Error", status: false });

  let userInfo = user[0];
  let phone = userInfo.phone;
  let code = userInfo.code;

  // Optimized Member Counts (Total Team BFS)
  const [teamStats] = await connection.query(`
    SELECT COUNT(*) as total FROM users WHERE ctv = ?
    `, [phone]);

  const stats = teamStats[0];
  const totalTeam = stats.total;

  // Financial Aggregates (All Subordinates)
  const [financials] = await connection.query(`
    SELECT 
      IFNULL(SUM(CASE WHEN r.status = 1 THEN r.money ELSE 0 END), 0) as total_recharge,
      IFNULL(SUM(CASE WHEN r.status = 1 AND DATE(FROM_UNIXTIME(r.time/1000)) = CURDATE() THEN r.money ELSE 0 END), 0) as today_recharge,
      IFNULL((SELECT SUM(money) FROM withdraw WHERE status = 1 AND phone IN (SELECT phone FROM users WHERE ctv = ?)), 0) as total_withdraw,
      IFNULL((SELECT SUM(money) FROM withdraw WHERE status = 1 AND DATE(FROM_UNIXTIME(time/1000)) = CURDATE() AND phone IN (SELECT phone FROM users WHERE ctv = ?)), 0) as today_withdraw,
      IFNULL((SELECT SUM(money) FROM commissions WHERE phone = ?), 0) as total_comm,
      IFNULL((SELECT SUM(money) FROM commissions WHERE phone = ? AND DATE(FROM_UNIXTIME(time/1000)) = CURDATE()), 0) as today_comm,
      IFNULL((SELECT SUM(money) FROM commissions WHERE phone = ? AND level = 1), 0) as f1_comm,
      IFNULL((SELECT SUM(money) FROM commissions WHERE phone = ? AND level > 1), 0) as team_comm
    FROM recharge r JOIN users u ON r.phone = u.phone
    WHERE u.ctv = ?
  `, [phone, phone, phone, phone, phone, phone, phone, phone]);

  const fin = financials[0];

  // Betting Stats (Today Only - Optimized)
  // We'll sum up Internal Games and API Games for the entire team
  const subPhones = `SELECT phone FROM users WHERE ctv = ?`;
  const subUserIds = `SELECT id_user FROM users WHERE ctv = ?`;

  const [betting] = await connection.query(`
    SELECT 
      (SELECT IFNULL(SUM(money), 0) FROM minutes_1 WHERE DATE(FROM_UNIXTIME(time/1000)) = CURDATE() AND phone IN (${subPhones})) as wingo_bet,
      (SELECT IFNULL(SUM(money), 0) FROM result_k3 WHERE DATE(FROM_UNIXTIME(time/1000)) = CURDATE() AND phone IN (${subPhones})) as k3_bet,
      (SELECT IFNULL(SUM(money), 0) FROM result_5d WHERE DATE(FROM_UNIXTIME(time/1000)) = CURDATE() AND phone IN (${subPhones})) as game5d_bet,
      (SELECT IFNULL(SUM(money), 0) FROM trx_wingo_bets WHERE DATE(FROM_UNIXTIME(time/1000)) = CURDATE() AND phone IN (${subPhones})) as trx_bet,
      (SELECT IFNULL(SUM(betAmount), 0) FROM jilliebethistory WHERE DATE(FROM_UNIXTIME(time/1000)) = CURDATE() AND phone IN (${subPhones})) as jili_bet,
      (SELECT IFNULL(SUM(deposit_amount), 0) FROM spribetransaction WHERE DATE(FROM_UNIXTIME(time/1000)) = CURDATE() AND phone IN (${subPhones}) AND type = 0) as spribe_bet,
      (SELECT IFNULL(SUM(amount), 0) FROM wc_api_transactions WHERE DATE(created_at) = CURDATE() AND user_id IN (${subUserIds}) AND type = 'debit' AND is_cancel = 0) as wc_bet,
      
      (SELECT IFNULL(SUM(get), 0) FROM minutes_1 WHERE DATE(FROM_UNIXTIME(time/1000)) = CURDATE() AND status = 1 AND phone IN (${subPhones})) as wingo_win,
      (SELECT IFNULL(SUM(get), 0) FROM result_k3 WHERE DATE(FROM_UNIXTIME(time/1000)) = CURDATE() AND status = 1 AND phone IN (${subPhones})) as k3_win,
      (SELECT IFNULL(SUM(get), 0) FROM result_5d WHERE DATE(FROM_UNIXTIME(time/1000)) = CURDATE() AND status = 1 AND phone IN (${subPhones})) as game5d_win,
      (SELECT IFNULL(SUM(get), 0) FROM trx_wingo_bets WHERE DATE(FROM_UNIXTIME(time/1000)) = CURDATE() AND status = 1 AND phone IN (${subPhones})) as trx_win,
      (SELECT IFNULL(SUM(winAmount), 0) FROM jilliebethistory WHERE DATE(FROM_UNIXTIME(time/1000)) = CURDATE() AND phone IN (${subPhones})) as jili_win,
      (SELECT IFNULL(SUM(deposit_amount), 0) FROM spribetransaction WHERE DATE(FROM_UNIXTIME(time/1000)) = CURDATE() AND phone IN (${subPhones}) AND type = 1) as spribe_win,
      (SELECT IFNULL(SUM(amount), 0) FROM wc_api_transactions WHERE DATE(created_at) = CURDATE() AND user_id IN (${subUserIds}) AND type = 'credit' AND is_cancel = 0) as wc_win
  `, [phone, phone, phone, phone, phone, phone, phone, phone, phone, phone, phone, phone, phone, phone]);

  const bet = betting[0] || {};
  const todayBet = (Number(bet.wingo_bet) || 0) + (Number(bet.k3_bet) || 0) + (Number(bet.game5d_bet) || 0) + 
                   (Number(bet.trx_bet) || 0) + (Number(bet.jili_bet) || 0) + (Number(bet.spribe_bet) || 0) + (Number(bet.wc_bet) || 0);
  const todayWin = (Number(bet.wingo_win) || 0) + (Number(bet.k3_win) || 0) + (Number(bet.game5d_win) || 0) + 
                   (Number(bet.trx_win) || 0) + (Number(bet.jili_win) || 0) + (Number(bet.spribe_win) || 0) + (Number(bet.wc_win) || 0);

  // Lifetime Team Betting (Optimized)
  const [lifetimeBetting] = await connection.query(`
    SELECT 
      (SELECT IFNULL(SUM(money), 0) FROM minutes_1 WHERE phone IN (${subPhones})) +
      (SELECT IFNULL(SUM(money), 0) FROM result_k3 WHERE phone IN (${subPhones})) +
      (SELECT IFNULL(SUM(money), 0) FROM result_5d WHERE phone IN (${subPhones})) +
      (SELECT IFNULL(SUM(money), 0) FROM trx_wingo_bets WHERE phone IN (${subPhones})) +
      (SELECT IFNULL(SUM(betAmount), 0) FROM jilliebethistory WHERE phone IN (${subPhones})) +
      (SELECT IFNULL(SUM(deposit_amount), 0) FROM spribetransaction WHERE phone IN (${subPhones}) AND type = 0) +
      (SELECT IFNULL(SUM(amount), 0) FROM wc_api_transactions WHERE user_id IN (${subUserIds}) AND type = 'debit' AND is_cancel = 0) as total_bet,
      
      (SELECT IFNULL(SUM(get), 0) FROM minutes_1 WHERE status = 1 AND phone IN (${subPhones})) +
      (SELECT IFNULL(SUM(get), 0) FROM result_k3 WHERE status = 1 AND phone IN (${subPhones})) +
      (SELECT IFNULL(SUM(get), 0) FROM result_5d WHERE status = 1 AND phone IN (${subPhones})) +
      (SELECT IFNULL(SUM(get), 0) FROM trx_wingo_bets WHERE status = 1 AND phone IN (${subPhones})) +
      (SELECT IFNULL(SUM(winAmount), 0) FROM jilliebethistory WHERE phone IN (${subPhones})) +
      (SELECT IFNULL(SUM(deposit_amount), 0) FROM spribetransaction WHERE phone IN (${subPhones}) AND type = 1) +
      (SELECT IFNULL(SUM(amount), 0) FROM wc_api_transactions WHERE user_id IN (${subUserIds}) AND type = 'credit' AND is_cancel = 0) as total_win
  `, [phone, phone, phone, phone, phone, phone, phone, phone, phone, phone, phone, phone, phone, phone]);

  const life = lifetimeBetting[0] || {};
  const totalBet_life = (Number(life.total_bet) || 0);
  const totalWin_life = (Number(life.total_win) || 0);

  // Recent Activity Data
  const [recentMems] = await connection.query(`
    SELECT u1.id_user, u1.phone, u1.money, u1.ip_address, u1.time, u2.phone as phone_invite 
    FROM users u1 
    LEFT JOIN users u2 ON u1.invite = u2.code 
    WHERE u1.ctv = ? 
    ORDER BY u1.id DESC LIMIT 10
  `, [phone]);

  return res.status(200).json({
    message: "Success",
    status: true,
    datas: user,
    total_team: totalTeam,
    total_recharge: fin.total_recharge,
    total_recharge_today: fin.today_recharge,
    total_withdraw: fin.total_withdraw,
    total_withdraw_today: fin.today_withdraw,
    total_comm: fin.total_comm,
    today_comm: fin.today_comm,
    f1_comm: fin.f1_comm,
    team_comm: fin.team_comm,
    bet_today: todayBet,
    win_today: todayWin,
    total_bet: totalBet_life,
    total_win: totalWin_life,
    list_mems: recentMems,
    moneyCTV: userInfo.ctv_gift_wallet
  });
};

const infoCtv2 = async (req, res) => {
  const auth = req.cookies.auth;
  const timeDate = req.body.timeDate;

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

  const [user] = await connection.query(
    "SELECT * FROM users WHERE token = ? ",
    [auth],
  );

  if (user.length == 0) {
    return res.status(200).json({
      message: "Phone Error",
      status: false,
    });
  }
  let userInfo = user[0];

  let phone = userInfo.phone;
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
      const [phone_invites] = await connection.query(
        "SELECT `phone` FROM users WHERE code = ? ",
        [list_mem_today[i].invite],
      );
      let phone_invite = phone_invites[0].phone;
      let data = {
        ...list_mem_today[i],
        phone_invite: phone_invite,
      };
      list_mems.push(data);
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

const createBonus = async (req, res) => {
  const randomString = (length) => {
    var result = "";
    var characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
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
  const d = new Date();
  const time = d.getTime();
  let auth = req.cookies.auth;
  let money = req.body.money;

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
  if (userInfo.ctv_gift_wallet - money >= 0) {
    let id_redenvelops = randomString(24);
    await connection.execute(
      "UPDATE `users` SET ctv_gift_wallet = ctv_gift_wallet - ?, ctc_giftcard_creation = ctc_giftcard_creation + ? WHERE token = ?",
      [money, money, auth],
    );
    let sql = `INSERT INTO redenvelopes SET id_redenvelope = ?, phone = ?, money = ?, used = ?, amount = ?, status = ?, time = ?`;
    await connection.query(sql, [
      id_redenvelops,
      userInfo.phone,
      money,
      1,
      1,
      0,
      time,
    ]);
    const [updatedUser] = await connection.query(
      "SELECT `ctv_gift_wallet` FROM users WHERE token = ? ",
      [auth],
    );
    return res.status(200).json({
      message: "Successful gift creation",
      status: true,
      id: id_redenvelops,
      money: updatedUser[0].ctv_gift_wallet,
    });
  } else {
    return res.status(200).json({
      message: "The balance is not enough to create gifts",
      status: false,
    });
  }
};

const listRedenvelops = async (req, res) => {
  let auth = req.cookies.auth;
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
  let [redenvelopes] = await connection.query(
    "SELECT * FROM redenvelopes WHERE phone = ? ORDER BY id DESC",
    [userInfo.phone],
  );
  return res.status(200).json({
    message: "Successful change",
    status: true,
    redenvelopes: redenvelopes,
  });
};

const listMember = async (req, res) => {
  let auth = req.cookies.auth;
  let { pageno, limit, search } = req.body;
  const offset = (pageno - 1) * limit;

  let [checkInfo] = await connection.execute("SELECT * FROM users WHERE token = ?", [auth]);
  if (checkInfo.length == 0) return res.status(200).json({ code: 0, msg: "No more data", status: false });
  let userInfo = checkInfo[0];

  if (!pageno || !limit) return res.status(200).json({ code: 0, msg: "No more data", status: false });

  // 1. Time Ranges (IST)
  const todayStart = moment().tz("Asia/Kolkata").startOf('day').valueOf();
  const todayEnd = moment().tz("Asia/Kolkata").endOf('day').valueOf();
  const yesterdayStart = moment().tz("Asia/Kolkata").subtract(1, 'days').startOf('day').valueOf();
  const yesterdayEnd = moment().tz("Asia/Kolkata").subtract(1, 'days').endOf('day').valueOf();

  // 2. Fetch Users
  let sql = `SELECT id_user, phone, money, status, time, totalBetAmount, totalWinningAmount FROM users WHERE veri = 1 AND level = 0 AND ctv = ?`;
  let countSql = `SELECT COUNT(*) as total FROM users WHERE veri = 1 AND level = 0 AND ctv = ?`;
  let params = [userInfo.phone];
  let countParams = [userInfo.phone];

  if (search) {
    sql += ` AND (phone LIKE ? OR id_user LIKE ?)`;
    countSql += ` AND (phone LIKE ? OR id_user LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
    countParams.push(`%${search}%`, `%${search}%`);
  }

  sql += ` ORDER BY id DESC LIMIT ?, ?`;
  params.push(offset, Number(limit));

  const [users] = await connection.query(sql, params);
  const [total_filtered] = await connection.query(countSql, countParams);

  if (users.length > 0) {
    const phones = users.map(u => u.phone);
    const idUsers = users.map(u => u.id_user);

    // Aggregations helper
    const getAgg = async (table, col, timeCol, phones) => {
      const [t] = await connection.query(`SELECT phone, SUM(${col}) as total FROM ${table} WHERE phone IN (?) AND status = 1 AND ${timeCol} BETWEEN ? AND ? GROUP BY phone`, [phones, todayStart, todayEnd]);
      const [y] = await connection.query(`SELECT phone, SUM(${col}) as total FROM ${table} WHERE phone IN (?) AND status = 1 AND ${timeCol} BETWEEN ? AND ? GROUP BY phone`, [phones, yesterdayStart, yesterdayEnd]);
      const [tot] = await connection.query(`SELECT phone, SUM(${col}) as total FROM ${table} WHERE phone IN (?) AND status = 1 GROUP BY phone`, [phones]);
      return { t, y, tot };
    };

    // Financials
    const recharges = await getAgg('recharge', 'money', 'time', phones);
    const withdraws = await getAgg('withdraw', 'money', 'time', phones);

    // Internal Game Bets (Today & Yesterday)
    const games = [
      { table: 'minutes_1', bet: 'money+fee', win: 'get' },
      { table: 'result_k3', bet: 'money', win: 'get' },
      { table: 'result_5d', bet: 'money', win: 'get' },
      { table: 'trx_wingo_bets', bet: 'money+fee', win: 'get' }
    ];

    const gameStats = {};
    for(const g of games) {
        const [gt] = await connection.query(`SELECT phone, SUM(${g.bet}) as bet, SUM(${g.win}) as win FROM ${g.table} WHERE phone IN (?) AND time BETWEEN ? AND ? GROUP BY phone`, [phones, todayStart, todayEnd]);
        const [gy] = await connection.query(`SELECT phone, SUM(${g.bet}) as bet, SUM(${g.win}) as win FROM ${g.table} WHERE phone IN (?) AND time BETWEEN ? AND ? GROUP BY phone`, [phones, yesterdayStart, yesterdayEnd]);
        gameStats[g.table] = { gt, gy };
    }

    // External API Games (Today & Yesterday)
    const jilliT = await connection.query(`SELECT phone, SUM(betAmount) as bet, SUM(winAmount) as win FROM jilliebethistory WHERE phone IN (?) AND today BETWEEN FROM_UNIXTIME(?/1000) AND FROM_UNIXTIME(?/1000) GROUP BY phone`, [phones, todayStart, todayEnd]);
    const jilliY = await connection.query(`SELECT phone, SUM(betAmount) as bet, SUM(winAmount) as win FROM jilliebethistory WHERE phone IN (?) AND today BETWEEN FROM_UNIXTIME(?/1000) AND FROM_UNIXTIME(?/1000) GROUP BY phone`, [phones, yesterdayStart, yesterdayEnd]);
    const jilliTot = await connection.query(`SELECT phone, SUM(betAmount) as bet, SUM(winAmount) as win FROM jilliebethistory WHERE phone IN (?) GROUP BY phone`, [phones]);

    const spribeT = await connection.query(`SELECT phone, SUM(deposit_amount) as bet, SUM(withdrawal_amount) as win FROM spribetransaction WHERE phone IN (?) AND today BETWEEN FROM_UNIXTIME(?/1000) AND FROM_UNIXTIME(?/1000) GROUP BY phone`, [phones, todayStart, todayEnd]);
    const spribeY = await connection.query(`SELECT phone, SUM(deposit_amount) as bet, SUM(withdrawal_amount) as win FROM spribetransaction WHERE phone IN (?) AND today BETWEEN FROM_UNIXTIME(?/1000) AND FROM_UNIXTIME(?/1000) GROUP BY phone`, [phones, yesterdayStart, yesterdayEnd]);
    const spribeTot = await connection.query(`SELECT phone, SUM(deposit_amount) as bet, SUM(withdrawal_amount) as win FROM spribetransaction WHERE phone IN (?) GROUP BY phone`, [phones]);

    const wcT = await connection.query(`SELECT user_id, SUM(amount) as bet FROM wc_api_transactions WHERE user_id IN (?) AND type='debit' AND is_cancel=0 AND created_at BETWEEN FROM_UNIXTIME(?/1000) AND FROM_UNIXTIME(?/1000) GROUP BY user_id`, [idUsers, todayStart, todayEnd]);
    const wcY = await connection.query(`SELECT user_id, SUM(amount) as bet FROM wc_api_transactions WHERE user_id IN (?) AND type='debit' AND is_cancel=0 AND created_at BETWEEN FROM_UNIXTIME(?/1000) AND FROM_UNIXTIME(?/1000) GROUP BY user_id`, [idUsers, yesterdayStart, yesterdayEnd]);
    const wcTot = await connection.query(`SELECT user_id, SUM(amount) as bet FROM wc_api_transactions WHERE user_id IN (?) AND type='debit' AND is_cancel=0 GROUP BY user_id`, [idUsers]);

    const wcWinT = await connection.query(`SELECT user_id, SUM(amount) as win FROM wc_api_transactions WHERE user_id IN (?) AND type='credit' AND is_cancel=0 AND created_at BETWEEN FROM_UNIXTIME(?/1000) AND FROM_UNIXTIME(?/1000) GROUP BY user_id`, [idUsers, todayStart, todayEnd]);
    const wcWinY = await connection.query(`SELECT user_id, SUM(amount) as win FROM wc_api_transactions WHERE user_id IN (?) AND type='credit' AND is_cancel=0 AND created_at BETWEEN FROM_UNIXTIME(?/1000) AND FROM_UNIXTIME(?/1000) GROUP BY user_id`, [idUsers, yesterdayStart, yesterdayEnd]);
    const wcWinTot = await connection.query(`SELECT user_id, SUM(amount) as win FROM wc_api_transactions WHERE user_id IN (?) AND type='credit' AND is_cancel=0 GROUP BY user_id`, [idUsers]);

    // Map stats to users
    users.forEach(u => {
      const parseVal = (v) => parseFloat(v || 0);
      const find = (arr, key, val) => parseVal(arr.find(x => x[key] == val)?.total);
      const findG = (arr, key, val, type) => parseVal(arr.find(x => x[key] == val)?.[type]);

      u.stats = {
        recharge: { t: find(recharges.t, 'phone', u.phone), y: find(recharges.y, 'phone', u.phone), tot: find(recharges.tot, 'phone', u.phone) },
        withdraw: { t: find(withdraws.t, 'phone', u.phone), y: find(withdraws.y, 'phone', u.phone), tot: find(withdraws.tot, 'phone', u.phone) },
        bet: { 
          t: 0, 
          y: 0, 
          tot: parseVal(u.totalBetAmount) + findG(jilliTot[0], 'phone', u.phone, 'bet') + findG(spribeTot[0], 'phone', u.phone, 'bet') + findG(wcTot[0], 'user_id', u.id_user, 'bet') 
        },
        win: { 
          t: 0, 
          y: 0, 
          tot: parseVal(u.totalWinningAmount) + findG(jilliTot[0], 'phone', u.phone, 'win') + findG(spribeTot[0], 'phone', u.phone, 'win') + findG(wcWinTot[0], 'user_id', u.id_user, 'win') 
        }
      };

      // Sum Today/Yesterday Bets/Wins
      for(const g of games) {
        u.stats.bet.t += findG(gameStats[g.table].gt, 'phone', u.phone, 'bet');
        u.stats.bet.y += findG(gameStats[g.table].gy, 'phone', u.phone, 'bet');
        u.stats.win.t += findG(gameStats[g.table].gt, 'phone', u.phone, 'win');
        u.stats.win.y += findG(gameStats[g.table].gy, 'phone', u.phone, 'win');
      }
      u.stats.bet.t += findG(jilliT[0], 'phone', u.phone, 'bet') + findG(spribeT[0], 'phone', u.phone, 'bet') + findG(wcT[0], 'user_id', u.id_user, 'bet');
      u.stats.bet.y += findG(jilliY[0], 'phone', u.phone, 'bet') + findG(spribeY[0], 'phone', u.phone, 'bet') + findG(wcY[0], 'user_id', u.id_user, 'bet');
      u.stats.win.t += findG(jilliT[0], 'phone', u.phone, 'win') + findG(spribeT[0], 'phone', u.phone, 'win') + findG(wcWinT[0], 'user_id', u.id_user, 'win');
      u.stats.win.y += findG(jilliY[0], 'phone', u.phone, 'win') + findG(spribeY[0], 'phone', u.phone, 'win') + findG(wcWinY[0], 'user_id', u.id_user, 'win');
    });
  }

  // Global Stats for top cards
  const [global] = await connection.query(`
    SELECT 
      (SELECT SUM(money) FROM recharge WHERE status=1 AND phone IN (SELECT phone FROM users WHERE ctv=?)) as recharge_tot,
      (SELECT SUM(money) FROM withdraw WHERE status=1 AND phone IN (SELECT phone FROM users WHERE ctv=?)) as withdraw_tot,
      (SELECT SUM(money) FROM recharge WHERE status=1 AND phone IN (SELECT phone FROM users WHERE ctv=?) AND time BETWEEN ? AND ?) as recharge_today,
      (SELECT SUM(money) FROM withdraw WHERE status=1 AND phone IN (SELECT phone FROM users WHERE ctv=?) AND time BETWEEN ? AND ?) as withdraw_today
  `, [userInfo.phone, userInfo.phone, userInfo.phone, todayStart, todayEnd, userInfo.phone, todayStart, todayEnd]);

  return res.status(200).json({
    message: "Success",
    status: true,
    datas: users,
    global: global[0],
    page_total: Math.ceil(total_filtered[0].total / limit)
  });
};

const listRechargeP = async (req, res) => {
  let auth = req.cookies.auth;
  let { phone, id_order, status, pageno, limit } = req.body;

  pageno = Number(pageno) || 0;
  limit = Number(limit) || 20;

  const [user] = await connection.query(
    "SELECT phone FROM users WHERE token = ? ",
    [auth],
  );

  if (user.length == 0) {
    return res.status(200).json({ message: "Failed", status: false });
  }
  let collaboratorPhone = user[0].phone;

  let params = [collaboratorPhone];
  let filterSql = "";

  if (phone) {
    filterSql += " AND r.phone LIKE ?";
    params.push(`%${phone}%`);
  }
  if (id_order) {
    filterSql += " AND (r.id_order LIKE ? OR r.transaction_id LIKE ? OR r.utr LIKE ?)";
    params.push(`%${id_order}%`, `%${id_order}%`, `%${id_order}%`);
  }
  if (status !== undefined && status !== "") {
    filterSql += " AND r.status = ?";
    params.push(status);
  }
  if (req.body.startDate) {
    filterSql += " AND DATE(FROM_UNIXTIME(r.time/1000)) >= ?";
    params.push(req.body.startDate);
  }
  if (req.body.endDate) {
    filterSql += " AND DATE(FROM_UNIXTIME(r.time/1000)) <= ?";
    params.push(req.body.endDate);
  }

  // Count total for pagination
  const [totalResult] = await connection.query(
    `SELECT COUNT(*) as total FROM recharge r JOIN users u ON r.phone = u.phone WHERE u.ctv = ?${filterSql}`,
    params
  );
  let total = totalResult[0].total;

  // Fetch data
  params.push(pageno, limit);
  const [list] = await connection.query(
    `SELECT r.* FROM recharge r JOIN users u ON r.phone = u.phone WHERE u.ctv = ?${filterSql} ORDER BY r.id DESC LIMIT ?, ?`,
    params
  );

  return res.status(200).json({
    message: "Success",
    status: true,
    list_recharge_news: list,
    page_total: Math.ceil(total / limit),
    total: total
  });
};

const listWithdrawP = async (req, res) => {
  let auth = req.cookies.auth;
  let { phone, id_order, status, pageno, limit } = req.body;

  pageno = Number(pageno) || 0;
  limit = Number(limit) || 20;

  const [user] = await connection.query(
    "SELECT phone FROM users WHERE token = ? ",
    [auth],
  );

  if (user.length == 0) {
    return res.status(200).json({ message: "Failed", status: false });
  }
  let collaboratorPhone = user[0].phone;

  let params = [collaboratorPhone];
  let filterSql = "";

  if (phone) {
    filterSql += " AND w.phone LIKE ?";
    params.push(`%${phone}%`);
  }
  if (id_order) {
    filterSql += " AND w.id_order LIKE ?";
    params.push(`%${id_order}%`);
  }
  if (status !== undefined && status !== "") {
    filterSql += " AND w.status = ?";
    params.push(status);
  }
  if (req.body.startDate) {
    filterSql += " AND DATE(FROM_UNIXTIME(w.time/1000)) >= ?";
    params.push(req.body.startDate);
  }
  if (req.body.endDate) {
    filterSql += " AND DATE(FROM_UNIXTIME(w.time/1000)) <= ?";
    params.push(req.body.endDate);
  }

  // Count total for pagination
  const [totalResult] = await connection.query(
    `SELECT COUNT(*) as total FROM withdraw w JOIN users u ON w.phone = u.phone WHERE u.ctv = ?${filterSql}`,
    params
  );
  let total = totalResult[0].total;

  // Fetch data
  params.push(pageno, limit);
  const [list] = await connection.query(
    `SELECT w.* FROM withdraw w JOIN users u ON w.phone = u.phone WHERE u.ctv = ?${filterSql} ORDER BY w.id DESC LIMIT ?, ?`,
    params
  );

  return res.status(200).json({
    message: "Success",
    status: true,
    list_withdraw_news: list,
    page_total: Math.ceil(total / limit),
    total: total
  });
};

const listRechargeMem = async (req, res) => {
  let auth = req.cookies.auth;
  let phone = req.params.phone;
  let pageno = Number(req.body.pageno) || 0;
  let limit = Number(req.body.limit) || 15;

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

  if (auths[0].phone != userInfo.ctv) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

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
  let pageno = Number(req.body.pageno) || 0;
  let limit = Number(req.body.limit) || 15;

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

  if (auths[0].phone != userInfo.ctv) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

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
  let pageno = Number(req.body.pageno) || 0;
  let limit = Number(req.body.limit) || 15;

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

  if (auths[0].phone != userInfo.ctv) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

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

const listBet = async (req, res) => {
  let auth = req.cookies.auth;
  let phone = req.params.phone;
  let pageno = Number(req.body.pageno) || 0;
  let limit = Number(req.body.limit) || 15;

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

  if (auths[0].phone != userInfo.ctv) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

  const [listBet] = await connection.query(
    `(SELECT id, CONVERT(phone USING utf8mb4) COLLATE utf8mb4_unicode_ci as phone, CONVERT(stage USING utf8mb4) COLLATE utf8mb4_unicode_ci as stage, amount, status, 
        CONVERT(CASE 
            WHEN game = 'wingo' THEN 'Wingo 1Min'
            WHEN game = 'wingo3' THEN 'Wingo 3Min'
            WHEN game = 'wingo5' THEN 'Wingo 5Min'
            WHEN game = 'wingo10' THEN 'Wingo 10Min'
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

  const [totalRecords] = await connection.query(
    `SELECT (
        (SELECT COUNT(*) FROM minutes_1 WHERE phone = ? AND status != 0) +
        (SELECT COUNT(*) FROM result_k3 WHERE phone = ? AND status != 0) +
        (SELECT COUNT(*) FROM result_5d WHERE phone = ? AND status != 0) +
        (SELECT COUNT(*) FROM trx_wingo_bets WHERE phone = ? AND status != 0)
    ) as total`,
    [phone, phone, phone, phone]
  );

  return res.status(200).json({
    message: "Success",
    status: true,
    datas: listBet,
    page_total: Math.ceil(totalRecords[0].total / limit),
  });
};

const apiListBet = async (req, res) => {
  let auth = req.cookies.auth;
  let phone = req.params.phone;
  let { pageno, limit } = req.body;
  pageno = Number(pageno) || 0;
  limit = Number(limit) || 15;

  if (!phone) return res.status(200).json({ message: "Failed", status: false });

  const [user] = await connection.query("SELECT * FROM users WHERE phone = ?", [phone]);
  const [auths] = await connection.query("SELECT * FROM users WHERE token = ?", [auth]);

  if (user.length === 0 || auths.length === 0 || auths[0].phone != user[0].ctv) {
    return res.status(200).json({ message: "Failed", status: false });
  }

  const userId = user[0].id_user;

  const [listAPI] = await connection.query(
    `(SELECT 'WC' as platform, txn_id, round_id, game_id, table_id, prd_id, is_cancel,
      CASE WHEN type = 'debit' THEN amount ELSE 0 END as bet,
      CASE WHEN type = 'credit' THEN amount ELSE 0 END as win,
      UNIX_TIMESTAMP(created_at) * 1000 as time,
      UNIX_TIMESTAMP(resettlement_time) * 1000 as resettle_time
      FROM wc_api_transactions WHERE user_id = ?)
     UNION ALL
     (SELECT 'JILI' as platform, round as txn_id, round as round_id, gameCode as game_id, '' as table_id, '' as prd_id, 0 as is_cancel,
      betAmount as bet, winAmount as win,
      UNIX_TIMESTAMP(time) * 1000 as time,
      NULL as resettle_time
      FROM jilliebethistory WHERE phone = ?)
     UNION ALL
     (SELECT 'SPRIBE' as platform, provider_tx_id as txn_id, action_id as round_id, game as game_id, '' as table_id, '' as prd_id, 0 as is_cancel,
      deposit_amount as bet, withdrawal_amount as win,
      UNIX_TIMESTAMP(time) * 1000 as time,
      NULL as resettle_time
      FROM spribetransaction WHERE phone = ?)
     ORDER BY time DESC LIMIT ?, ?`,
    [userId, phone, phone, pageno, limit]
  );

  const [totalRecords] = await connection.query(
    `SELECT (
        (SELECT COUNT(*) FROM wc_api_transactions WHERE user_id = ?) +
        (SELECT COUNT(*) FROM jilliebethistory WHERE phone = ?) +
        (SELECT COUNT(*) FROM spribetransaction WHERE phone = ?)
    ) as total`,
    [userId, phone, phone]
  );

  return res.status(200).json({
    message: "Success",
    status: true,
    data: listAPI,
    page_total: Math.ceil(totalRecords[0].total / limit),
  });
};

const listCommission = async (req, res) => {
  let auth = req.cookies.auth;
  let phone = req.params.phone;
  let { pageno, limit } = req.body;
  pageno = Number(pageno) || 0;
  limit = Number(limit) || 15;

  const [user] = await connection.query("SELECT * FROM users WHERE phone = ?", [phone]);
  const [auths] = await connection.query("SELECT * FROM users WHERE token = ?", [auth]);

  if (user.length === 0 || auths.length === 0 || auths[0].phone != user[0].ctv) {
    return res.status(200).json({ message: "Failed", status: false });
  }

  const [commissions] = await connection.query(
    'SELECT * FROM commissions WHERE phone = ? ORDER BY id DESC LIMIT ?, ?',
    [phone, pageno, limit]
  );
  const [total] = await connection.query('SELECT COUNT(*) as count FROM commissions WHERE phone = ?', [phone]);

  return res.status(200).json({
    status: true,
    datas: commissions,
    page_total: Math.ceil(total[0].count / limit)
  });
};

const listRewards = async (req, res) => {
  let auth = req.cookies.auth;
  let phone = req.params.phone;
  let { pageno, limit } = req.body;
  pageno = Number(pageno) || 0;
  limit = Number(limit) || 15;

  const [user] = await connection.query("SELECT * FROM users WHERE phone = ?", [phone]);
  const [auths] = await connection.query("SELECT * FROM users WHERE token = ?", [auth]);

  if (user.length === 0 || auths.length === 0 || auths[0].phone != user[0].ctv) {
    return res.status(200).json({ message: "Failed", status: false });
  }

  const [rewards] = await connection.query(
    'SELECT * FROM claimed_rewards WHERE phone = ? AND status = 1 ORDER BY id DESC LIMIT ?, ?',
    [phone, pageno, limit]
  );
  const [total] = await connection.query('SELECT COUNT(*) as count FROM claimed_rewards WHERE phone = ? AND status = 1', [phone]);

  return res.status(200).json({
    status: true,
    datas: rewards,
    page_total: Math.ceil(total[0].count / limit)
  });
};

const buffMoney = async (req, res) => {
  let auth = req.cookies.auth;
  let phone = req.body.username;
  let select = req.body.select;
  let money = req.body.money;

  if (!phone || !select || !money) {
    return res.status(200).json({
      message: "Fail",
      status: false,
    });
  }

  const [users] = await connection.query(
    "SELECT * FROM users WHERE phone = ? ",
    [phone],
  );
  const [auths] = await connection.query(
    "SELECT * FROM users WHERE token = ? ",
    [auth],
  );

  if (users.length == 0) {
    return res.status(200).json({
      message: "Account does not exist",
      status: false,
    });
  }
  let userInfo = users[0];
  let authInfo = auths[0];

  let check = authInfo.ctv_adjustment_wallet;

  if (select == "1") {
    if (check - money >= 0) {
      const d = new Date();
      const time = d.getTime();
      await connection.query(
        "UPDATE users SET money = money + ? WHERE phone = ? ",
        [money, userInfo.phone],
      );
      await connection.query(
        "UPDATE users SET ctv_adjustment_wallet = ctv_adjustment_wallet - ? WHERE token = ? ",
        [money, auth],
      );
      let sql =
        "INSERT INTO financial_details SET phone = ?, phone_used = ?, money = ?, type = ?, time = ?";
      await connection.query(sql, [
        authInfo.phone,
        userInfo.phone,
        money,
        "1",
        time,
      ]);

      const [moneyN] = await connection.query(
        "SELECT `ctv_adjustment_wallet` FROM users WHERE token = ? ",
        [auth],
      );
      return res.status(200).json({
        message: "Success",
        status: true,
        money: moneyN[0].ctv_adjustment_wallet,
      });
    } else {
      return res.status(200).json({
        message: "Insufficient balance",
        status: false,
      });
    }
  } else {
    const d = new Date();
    const time = d.getTime();
    await connection.query(
      "UPDATE users SET money = money - ? WHERE phone = ? ",
      [money, userInfo.phone],
    );
    await connection.query(
      "UPDATE point_list SET money = money + ? WHERE phone = ? ",
      [money, authInfo.phone],
    );
    let sql =
      "INSERT INTO financial_details SET phone = ?, phone_used = ?, money = ?, type = ?, time = ?";
    await connection.query(sql, [
      authInfo.phone,
      userInfo.phone,
      money,
      "2",
      time,
    ]);
    return res.status(200).json({
      message: "Success",
      status: true,
    });
  }
};

const dailyController = {
  buffMoney,
  dailyPage,
  giftHistoryPage,
  adjustHistoryPage,
  middlewareDailyController,
  userInfo,
  statistical,
  listMeber,
  profileMember,
  infoCtv,
  infoCtv2,
  settingPage,
  giftPage,
  support,
  settings,
  createBonus,
  listRedenvelops,
  listMember,
  listRecharge,
  listWithdraw,
  listRechargeP,
  listWithdrawP,
  listGiftHistory,
  listAdjustmentHistory,
  pageInfo,
  listRechargeMem,
  listWithdrawMem,
  listRedenvelope,
  listBet,
  apiListBet,
  listCommission,
  listRewards,
};

export default dailyController;
