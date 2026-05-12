import path from 'path';
import { fileURLToPath } from 'url';
import connection from "../config/connectDB.js";
import rankController from "./rankController.js";
import userStatsHelper from "../helpers/userStats.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getAppData = async () => {
  let app = '#';
  let app_status = 1;
  let cskh_status = 1;
  let popup = { image: '', link: '' };
  try {
    const [settings] = await connection.query("SELECT app, apk_link, app_download_status, cskh_status FROM admin_ac LIMIT 1");
    if (settings.length) {
      app = settings[0].apk_link ? '/download/apk' : (settings[0].app || '#');
      app_status = settings[0].app_download_status ?? 1;
      cskh_status = settings[0].cskh_status ?? 1;
    }

    const [banners] = await connection.query("SELECT * FROM banners WHERE type = 'deposit_popup' AND status = 1 ORDER BY id DESC LIMIT 1");
    if (banners.length) {
      popup = { image: banners[0].image, link: banners[0].link };
    }
  } catch (e) {
    console.error('getAppData error:', e.message);
  }
  return { app, app_status, cskh_status, popup };
};

const homePage = async (req, res) => {
  const { app, app_status, cskh_status, popup } = await getAppData();
  return res.render("home/index.ejs", { app, app_status, cskh_status, popup });
};

const downloadApk = async (req, res) => {
  try {
    const [settings] = await connection.query("SELECT apk_link, apk_name FROM admin_ac LIMIT 1");
    if (settings.length && settings[0].apk_link) {
      const relativePath = settings[0].apk_link.startsWith('/') ? settings[0].apk_link.substring(1) : settings[0].apk_link;
      const filePath = path.join(__dirname, '../public', relativePath);
      const fileName = settings[0].apk_name || '91Club.apk';
      const finalName = fileName.toLowerCase().endsWith('.apk') ? fileName : `${fileName}.apk`;
      return res.download(filePath, finalName);
    } else {
      return res.status(404).send("APK file not found or not configured.");
    }
  } catch (error) {
    console.error('downloadApk error:', error);
    return res.status(500).send("Internal server error during download.");
  }
};

const activityPage = async (req, res) => {
  const { app, app_status, cskh_status, popup } = await getAppData();
  return res.render("checkIn/activity.ejs", { app, app_status, cskh_status, popup });
};

const slotjiliPage = async (req, res) => {
  return res.render("jili/slots.ejs");
}

const slotspribePage = async (req, res) => {
  return res.render("spribe/slots.ejs");
}

const supportPage = async (req, res) => {
  let auth = req.cookies.auth;
  const [users] = await connection.query("SELECT `level`, `ctv` FROM users WHERE token = ?", [auth]);

  let telegram = "";
  if (users.length == 0) {
    let [settings] = await connection.query("SELECT `telegram`, `cskh` FROM admin_ac");
    telegram = settings[0].telegram;
  } else {
    if (users[0].level != 0) {
      var [settings] = await connection.query("SELECT * FROM admin_ac");
    } else {
      var [check] = await connection.query("SELECT `ctv_telegram` FROM users WHERE phone = ?", [users[0].ctv]);
      if (check.length == 0 || !check[0].ctv_telegram) {
        var [settings] = await connection.query("SELECT * FROM admin_ac");
      } else {
        telegram = check[0].ctv_telegram;
        return res.render("member/support.ejs", { telegram });
      }
    }
    telegram = settings[0].telegram;
  }
  return res.render("member/support.ejs", { telegram });
};

const attendancePage = async (req, res) => {
  return res.render("checkIn/attendance.ejs");
};
const firstDepositBonusPage = async (req, res) => {
  return res.render("checkIn/firstDepositBonus.ejs");
};
const promotionRebateRatioPage = async (req, res) => {
  const [levels] = await connection.query("SELECT * FROM level");
  return res.render("promotion/rebateRadio.ejs", { data: levels });
};

const rebatePage = async (req, res) => {
  return res.render("checkIn/rebate.ejs");
};

const vipPage = async (req, res) => {
  return res.render("checkIn/vip.ejs");
};

const jackpotPage = async (req, res) => {
  return res.render("checkIn/jackpot.ejs");
};

const dailytaskPage = async (req, res) => {
  return res.render("checkIn/dailytask.ejs");
};

const invibonusPage = async (req, res) => {
  return res.render("checkIn/invibonus.ejs");
};
const invitationRulesPage = async (req, res) => {
  return res.render("checkIn/invitationRules.ejs");
};

const jackpotRulesPage = async (req, res) => {
  return res.render("checkIn/rules.ejs");
};

const aviatorBettingRewardPage = async (req, res) => {
  return res.render("checkIn/aviator_betting_reward.ejs");
};
const socialVideoAwardPagePage = async (req, res) => {
  return res.render("checkIn/social_video_award.ejs");
};

const jackpotWiningStarPage = async (req, res) => {
  return res.render("checkIn/wining_star.ejs");
};

const checkInPage = async (req, res) => {
  return res.render("checkIn/checkIn.ejs");
};

const checkDes = async (req, res) => {
  return res.render("checkIn/checkDes.ejs");
};

const checkRecord = async (req, res) => {
  return res.render("checkIn/checkRecord.ejs");
};

const addBank = async (req, res) => {
  return res.render("wallet/addbank.ejs");
};

const selectBank = async (req, res) => {
  return res.render("wallet/selectBank.ejs");
};
const invitationRecord = async (req, res) => {
  return res.render("checkIn/invitationRecord.ejs");
};
const rechargeAwardCollectionRecord = async (req, res) => {
  return res.render("checkIn/rechargeAwardCollectionRecord.ejs");
};
const attendanceRecordPage = async (req, res) => {
  return res.render("checkIn/attendanceRecord.ejs");
};
const attendanceRulesPage = async (req, res) => {
  const [rows] = await connection.query("SELECT * FROM attendance_config ORDER BY day ASC");
  return res.render("checkIn/attendanceRules.ejs", { attendanceConfig: rows });
};

const changeAvatarPage = async (req, res) => {
  return res.render("member/change_avatar.ejs");
};

// promotion
const promotionPage = async (req, res) => {
  const { app, popup, cskh_status } = await getAppData();
  return res.render("promotion/promotion.ejs", { app, popup, cskh_status });
};

const subordinatesPage = async (req, res) => {
  return res.render("promotion/subordinates.ejs");
};

const promotion1Page = async (req, res) => {
  return res.render("promotion/promotion1.ejs");
};

const promotionmyTeamPage = async (req, res) => {
  return res.render("promotion/myTeam.ejs");
};

const promotionDesPage = async (req, res) => {
  return res.render("promotion/promotionDes.ejs");
};

const comhistoryPage = async (req, res) => {
  return res.render("promotion/comhistory.ejs");
};

const tutorialPage = async (req, res) => {
  const rankThresholds = await rankController.getAllRankThresholds();
  const [levels] = await connection.query("SELECT * FROM level");
  return res.render("promotion/tutorial.ejs", {
    RANK_THRESHOLDS: rankThresholds,
    LEVELS: levels
  });
};

const bonusRecordPage = async (req, res) => {
  return res.render("promotion/bonusrecord.ejs");
};

const promotionPromotionSharePage = async (req, res) => {
  return res.render("promotion/promotionShare.ejs");
};

// wallet

const transactionhistoryPage = async (req, res) => {
  return res.render("wallet/transactionhistory.ejs");
};
const gameHistoryPage = async (req, res) => {
  return res.render("member/game_history.ejs");
};

const claimedRewardsPage = async (req, res) => {
  return res.render("member/claimed_rewards.ejs");
};

const promotionCommissionPage = async (req, res) => {
  return res.render("member/promotion_commission.ejs");
};

const salaryPage = async (req, res) => {
  return res.render("member/salary.ejs");
};

const GetClaimedRewardsAPI = async (req, res) => {
  let { type, startDate, endDate, page } = req.body;
  let auth = req.cookies.auth;
  if (!auth) return res.status(200).json({ message: 'Failed!', status: false });

  const [user] = await connection.query('SELECT `phone` FROM users WHERE `token` = ? LIMIT 1', [auth]);
  if (!user.length) return res.status(200).json({ message: 'Failed!', status: false });

  let userInfo = user[0];
  let limit = 10;
  let offset = (page - 1) * limit;

  if (!startDate) startDate = '0';
  if (!endDate) endDate = Date.now().toString();

  let query = "SELECT * FROM claimed_rewards WHERE phone = ? AND time BETWEEN ? AND ?";
  let params = [userInfo.phone, startDate, endDate];

  if (type && type !== 'all') {
    query += " AND type = ?";
    params.push(type);
  }

  query += " ORDER BY time DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const [records] = await connection.query(query, params);

  let countQuery = "SELECT COUNT(*) as total FROM claimed_rewards WHERE phone = ? AND time BETWEEN ? AND ?";
  let countParams = [userInfo.phone, startDate, endDate];
  if (type && type !== 'all') {
    countQuery += " AND type = ?";
    countParams.push(type);
  }

  const [totalRecords] = await connection.query(countQuery, countParams);
  let total = totalRecords[0].total;

  return res.status(200).json({
    message: 'Success',
    status: true,
    data: records,
    total: total,
    page: page,
    limit: limit
  });
};

const GetPromotionCommissionsAPI = async (req, res) => {
  let { startDate, endDate, page, level, phone } = req.body;
  let auth = req.cookies.auth;
  if (!auth) return res.status(200).json({ message: 'Failed!', status: false });

  const [user] = await connection.query('SELECT `phone` FROM users WHERE `token` = ? LIMIT 1', [auth]);
  if (!user.length) return res.status(200).json({ message: 'Failed!', status: false });

  let userInfo = user[0];
  let limit = 10;
  let offset = (page - 1) * limit;

  if (!startDate) startDate = '0';
  if (!endDate) endDate = Date.now().toString();

  let query = "SELECT * FROM commissions WHERE phone = ? AND time BETWEEN ? AND ?";
  let params = [userInfo.phone, startDate, endDate];

  if (level) {
    query += " AND level = ?";
    params.push(level);
  }
  if (phone) {
    query += " AND from_user_phone LIKE ?";
    params.push(`%${phone}%`);
  }

  query += " ORDER BY time DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const [records] = await connection.query(query, params);

  let countQuery = "SELECT COUNT(*) as total FROM commissions WHERE phone = ? AND time BETWEEN ? AND ?";
  let countParams = [userInfo.phone, startDate, endDate];

  if (level) {
    countQuery += " AND level = ?";
    countParams.push(level);
  }
  if (phone) {
    countQuery += " AND from_user_phone LIKE ?";
    countParams.push(`%${phone}%`);
  }

  const [totalRecords] = await connection.query(countQuery, countParams);
  let total = totalRecords[0].total;

  return res.status(200).json({
    message: 'Success',
    status: true,
    data: records,
    total: total,
    page: page,
    limit: limit
  });
};


const GetSalariesAPI = async (req, res) => {
  let { startDate, endDate, page } = req.body;
  let auth = req.cookies.auth;
  if (!auth) return res.status(200).json({ message: 'Failed!', status: false });

  const [user] = await connection.query('SELECT `phone` FROM users WHERE `token` = ? LIMIT 1', [auth]);
  if (!user.length) return res.status(200).json({ message: 'Failed!', status: false });

  let userInfo = user[0];
  let limit = 10;
  let offset = (page - 1) * limit;

  if (!startDate) startDate = '0';
  if (!endDate) endDate = Date.now().toString();

  let query = "SELECT * FROM salary WHERE phone = ? AND time BETWEEN ? AND ?";
  let params = [userInfo.phone, startDate, endDate];

  query += " ORDER BY time DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const [records] = await connection.query(query, params);

  let countQuery = "SELECT COUNT(*) as total FROM salary WHERE phone = ? AND time BETWEEN ? AND ?";
  let countParams = [userInfo.phone, startDate, endDate];

  const [totalRecords] = await connection.query(countQuery, countParams);
  let total = totalRecords[0].total;

  return res.status(200).json({
    message: 'Success',
    status: true,
    data: records,
    total: total,
    page: page,
    limit: limit
  });
};

const redenvelopeHistoryPage = async (req, res) => {
  return res.render("member/redenvelope_history.ejs");
};

const GetRedEnvelopeHistoryAPI = async (req, res) => {
  let { startDate, endDate, page } = req.body;
  let auth = req.cookies.auth;
  if (!auth) return res.status(200).json({ message: 'Failed!', status: false });

  const [user] = await connection.query('SELECT `phone` FROM users WHERE `token` = ? LIMIT 1', [auth]);
  if (!user.length) return res.status(200).json({ message: 'Failed!', status: false });

  let userInfo = user[0];
  let limit = 10;
  let offset = (page - 1) * limit;

  if (!startDate) startDate = '0';
  if (!endDate) endDate = Date.now().toString();

  let query = "SELECT * FROM redenvelopes_used WHERE phone_used = ? AND time BETWEEN ? AND ?";
  let params = [userInfo.phone, startDate, endDate];

  query += " ORDER BY time DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const [records] = await connection.query(query, params);

  let countQuery = "SELECT COUNT(*) as total FROM redenvelopes_used WHERE phone_used = ? AND time BETWEEN ? AND ?";
  let countParams = [userInfo.phone, startDate, endDate];

  const [totalRecords] = await connection.query(countQuery, countParams);
  let total = totalRecords[0].total;

  return res.status(200).json({
    message: 'Success',
    status: true,
    data: records,
    total: total,
    page: page,
    limit: limit
  });
};

const walletPage = async (req, res) => {
  const { app, app_status, popup, cskh_status } = await getAppData();
  return res.render("wallet/index.ejs", { app, app_status, popup, cskh_status });
};

const rechargePage = async (req, res) => {
  const [paymentConfigs] = await connection.query("SELECT * FROM payment_configs WHERE status = 1");
  const [adminConfig] = await connection.query("SELECT usdt_exchange_rate, currency_symbol FROM admin_ac LIMIT 1");
  const [minInr] = await connection.query("SELECT MIN(min_recharge) as min_inr FROM payment_configs WHERE status = 1 AND category = 'INR'");
  const [minUsdt] = await connection.query("SELECT MIN(min_recharge) as min_recharge FROM payment_configs WHERE status = 1 AND category = 'USDT'");

  return res.render("wallet/recharge.ejs", {
    MINIMUM_MONEY_USDT: minUsdt[0]?.min_recharge || 10,
    MINIMUM_MONEY_INR: minInr[0]?.min_inr || 100,
    paymentConfigs: paymentConfigs,
    usdt_exchange_rate: adminConfig[0]?.usdt_exchange_rate || 92,
    currency_symbol: adminConfig[0]?.currency_symbol || '₹'
  });
};

const rechargerecordPage = async (req, res) => {
  return res.render("wallet/rechargerecord.ejs");
};

const withdrawalPage = async (req, res) => {
  const auth = req.cookies.auth;
  const [userRows] = await connection.query("SELECT phone FROM users WHERE token = ? LIMIT 1", [auth]);
  const userPhone = userRows[0]?.phone;

  let totalDepositAmount = 0;
  let totalBetAmount = 0;
  let totalWinAmount = 0;
  let totalCommission = 0;
  let totalBonus = 0;
  let totalSalary = 0;

  if (userPhone) {
    const depositStats = await userStatsHelper.getDepositStats(userPhone);
    const bettingStats = await userStatsHelper.getBettingStats(userPhone);
    totalDepositAmount = depositStats.totalAmount;
    totalBetAmount = bettingStats.totalAmount;
    totalWinAmount = bettingStats.totalWinAmount;

    const [commissionRows] = await connection.query("SELECT SUM(money) as total FROM commissions WHERE phone = ?", [userPhone]);
    totalCommission = commissionRows[0]?.total || 0;

    const [bonusRows] = await connection.query("SELECT SUM(amount) as total FROM claimed_rewards WHERE phone = ? AND status = 1", [userPhone]);
    totalBonus = bonusRows[0]?.total || 0;

    const [salaryRows] = await connection.query("SELECT SUM(amount) as total FROM salary WHERE phone = ?", [userPhone]);
    totalSalary = salaryRows[0]?.total || 0;
  }

  const [adminConfig] = await connection.query("SELECT usdt_withdraw_rate FROM admin_ac LIMIT 1");
  const usdtWithdrawRate = adminConfig[0]?.usdt_withdraw_rate || 90;

  const [withdrawalConfigs] = await connection.query("SELECT * FROM withdrawal_configs");
  const configMap = withdrawalConfigs.reduce((acc, curr) => ({ ...acc, [curr.method_name]: curr }), {});

  return res.render("wallet/withdrawal.ejs", {
    MINIMUM_MONEY_USDT: configMap['USDT_ADDRESS']?.min_amount || 1000,
    MINIMUM_MONEY_INR: configMap['UPI']?.min_amount || 300,
    MIN_WITHDRAWAL_UPI: configMap['UPI']?.min_amount || 300,
    MAX_WITHDRAWAL_UPI: configMap['UPI']?.max_amount || 50000,
    MIN_WITHDRAWAL_USDT: configMap['USDT_ADDRESS']?.min_amount || 1000,
    MAX_WITHDRAWAL_USDT: configMap['USDT_ADDRESS']?.max_amount || 100000,
    TOTAL_DEPOSIT: totalDepositAmount,
    TOTAL_BET: totalBetAmount,
    TOTAL_WINNING: totalWinAmount,
    TOTAL_COMMISSION: totalCommission,
    TOTAL_BONUS: totalBonus,
    TOTAL_SALARY: totalSalary,
    USDT_WITHDRAW_RATE: usdtWithdrawRate
  });
};

const withdrawalrecordPage = async (req, res) => {
  return res.render("wallet/withdrawalrecord.ejs");
};
const transfer = async (req, res) => {
  return res.render("wallet/transfer.ejs");
};

// member page
const mianPage = async (req, res) => {
  let auth = req.cookies.auth;
  const [user] = await connection.query("SELECT `level` FROM users WHERE `token` = ? ", [auth]);
  const [settings] = await connection.query("SELECT `cskh`, `cskh_status` FROM admin_ac");
  let cskh = settings[0].cskh;
  let cskh_status = settings[0].cskh_status;
  let level = user[0].level;
  const { app, app_status, popup: appPopup } = await getAppData();
  return res.render("member/index.ejs", { level, cskh, cskh_status, app, app_status, popup: appPopup });
};

const settingsPage = async (req, res) => {
  let auth = req.cookies.auth;
  const [user] = await connection.query("SELECT * FROM users WHERE `token` = ? ", [auth]);
  return res.render("member/settings.ejs", {
    NICKNAME: user[0].name_user,
    USER_ID: user[0].id_user,
  });
};

const aboutPage = async (req, res) => {
  return res.render("member/about/index.ejs");
};

const guidePage = async (req, res) => {
  return res.render("member/guide.ejs");
};

const feedbackPage = async (req, res) => {
  return res.render("member/feedback.ejs");
};

const notificationPage = async (req, res) => {
  return res.render("member/notification.ejs");
};

const loginNotificationPage = async (req, res) => {
  return res.render("member/login_notification.ejs");
};

const recordsalary = async (req, res) => {
  return res.render("member/about/recordsalary.ejs");
};

const privacyPolicy = async (req, res) => {
  return res.render("member/about/privacyPolicy.ejs");
};

const newtutorial = async (req, res) => {
  return res.render("member/newtutorial.ejs");
};

const forgot = async (req, res) => {
  let auth = req.cookies.auth;
  const [user] = await connection.query("SELECT `time_otp` FROM users WHERE token = ? ", [auth]);
  let time = user[0].time_otp;
  return res.render("member/forgot.ejs", { time });
};

const redenvelopes = async (req, res) => {
  return res.render("member/redenvelopes.ejs");
};

const riskAgreement = async (req, res) => {
  return res.render("member/about/riskAgreement.ejs");
};

const myProfilePage = async (req, res) => {
  return res.render("member/myProfile.ejs");
};

const getSalaryRecord = async (req, res) => {
  const auth = req.cookies.auth;
  const [rows] = await connection.query(`SELECT * FROM users WHERE token = ?`, [auth]);
  if (!rows.length) return res.status(200).json({ message: "Failed", status: false });
  const [getPhone] = await connection.query(`SELECT * FROM salary WHERE phone = ? ORDER BY time DESC`, [rows[0].phone]);
  return res.status(200).json({ message: "Success", status: true, data: {}, rows: getPhone });
};

const getBannersByType = async (req, res) => {
  const { type } = req.params;
  try {
    const [rows] = await connection.query("SELECT * FROM banners WHERE type = ? AND status = 1 ORDER BY priority ASC, id DESC", [type]);
    return res.status(200).json({ status: true, data: rows });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const homeController = {
  promotionPromotionSharePage,
  slotjiliPage,
  slotspribePage,
  gameHistoryPage,
  homePage,
  checkInPage,
  invibonusPage,
  rebatePage,
  jackpotPage,
  vipPage,
  activityPage,
  dailytaskPage,
  promotionPage,
  subordinatesPage,
  promotion1Page,
  walletPage,
  mianPage,
  myProfilePage,
  promotionmyTeamPage,
  promotionDesPage,
  comhistoryPage,
  tutorialPage,
  bonusRecordPage,
  rechargePage,
  rechargerecordPage,
  withdrawalPage,
  withdrawalrecordPage,
  aboutPage,
  privacyPolicy,
  riskAgreement,
  newtutorial,
  redenvelopes,
  forgot,
  checkDes,
  checkRecord,
  addBank,
  transfer,
  recordsalary,
  getSalaryRecord,
  transactionhistoryPage,
  jackpotRulesPage,
  jackpotWiningStarPage,
  attendancePage,
  firstDepositBonusPage,
  aviatorBettingRewardPage,
  socialVideoAwardPagePage,
  promotionRebateRatioPage,
  settingsPage,
  guidePage,
  feedbackPage,
  notificationPage,
  loginNotificationPage,
  selectBank,
  invitationRecord,
  rechargeAwardCollectionRecord,
  attendanceRecordPage,
  attendanceRulesPage,
  changeAvatarPage,
  invitationRulesPage,
  supportPage,
  getBannersByType,
  downloadApk,
  claimedRewardsPage,
  GetClaimedRewardsAPI,
  promotionCommissionPage,
  salaryPage,
  GetPromotionCommissionsAPI,
  GetSalariesAPI,
  redenvelopeHistoryPage,
  GetRedEnvelopeHistoryAPI,
};

export default homeController;
