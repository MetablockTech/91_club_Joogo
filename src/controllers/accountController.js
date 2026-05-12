import axios from "axios";
import connection from "../config/connectDB.js";
import jwt from "jsonwebtoken";
import md5 from "md5";
import moment from "moment";
import Joi from "joi";
import bcrypt from "bcrypt";
import _ from "lodash";
import { sendOTP, isOTPEnabled, getOTPExpiry, getOTPCooldown } from "../helpers/smsService.js";
import { generateClaimRewardID } from "../helpers/games.js";

const timeNow = new Date().getTime();
const saltRounds = parseInt(process.env.SALT_ROUNDS || 5);

const loginPage = async (req, res) => {
  res.clearCookie("auth");
  res.clearCookie("token");
  return res.render("account/login.ejs");
};

const registerPage = async (req, res) => {
  return res.render("account/register.ejs");
};

const forgotPage = async (req, res) => {
  return res.render("account/forgot.ejs");
};

const forgotResetPage = async (req, res) => {
  return res.render("account/forgot_reset.ejs");
};

const keFuMenu = async (req, res) => {
  let auth = req.cookies.auth;

  const [users] = await connection.query(
    "SELECT `level`, `ctv` FROM users WHERE token = ?",
    [auth],
  );

  let [settings] = await connection.query(
    "SELECT `telegram`, `cskh`, `whatsapp`, `whatsapp_status`, `telegram_status`, `app_download_status`, `cskh_status` FROM admin_ac LIMIT 1",
  );

  let telegram = settings[0].telegram;
  let cskh = settings[0].cskh;
  let whatsapp = settings[0].whatsapp;
  let whatsapp_status = settings[0].whatsapp_status;
  let telegram_status = settings[0].telegram_status;
  let app_download_status = settings[0].app_download_status;
  let cskh_status = settings[0].cskh_status;

  // If user has a CTV, override telegram if CTV has a specific one
  if (users.length > 0 && users[0].level == 0) {
    const [check] = await connection.query(
      "SELECT `ctv_telegram` FROM users WHERE phone = ?",
      [users[0].ctv],
    );
    if (check.length > 0 && check[0].ctv_telegram) {
      telegram = check[0].ctv_telegram;
    }
  }

  return res.render("keFuMenu.ejs", {
    telegram,
    cskh,
    whatsapp,
    whatsapp_status,
    telegram_status,
    app_download_status,
    cskh_status
  });
};
const memberQuery = async (req, res) => {
  let auth = req.cookies.auth;

  return res.render("memberQuery.ejs", { auth });
};
const myIssueReport = async (req, res) => {
  return res.render("myIssueReport.ejs");
};

const randomNumber = (min, max) => {
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

const isNumber = (params) => {
  let pattern = /^[0-9]*\d$/;
  return pattern.test(params);
}

const login = async (req, res) => {
  const schema = Joi.object({
    username: Joi.string().length(10).required(),
    pwd: Joi.string().min(6).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  console.log(req.body)

  let { username, pwd } = req.body;

  try {
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE phone = ?",
      [username],
    );

    if (_.isEmpty(rows)) {
      return res.status(200).json({
        message: "Incorrect Username or Password",
        status: false,
      });
    }

    const validPassword = await bcrypt.compare(pwd, rows[0].password);

    if (!validPassword) {
      return res.status(400).json({
        status: false,
        message: "Invalid password",
      });
    }

    if (rows[0].status !== 1) {
      return res.status(200).json({
        message: "Account has been locked",
        status: false,
      });
    }

    const { password, money, ip, veri, ip_address, status, time, ...others } =
      rows[0];
    const accessToken = jwt.sign(
      {
        user: { ...others },
        timeNow: timeNow,
      },
      process.env.JWT_ACCESS_TOKEN,
      { expiresIn: "1d" },
    );

    let timeNew = new Date().getTime();

    await connection.execute(
      "UPDATE `users` SET `token` = ?, `loginTime` = ? WHERE `phone` = ? ",
      [md5(accessToken), timeNew, username],
    );
    return res.status(200).json({
      message: "Login Successfully!",
      status: true,
      token: accessToken,
      value: md5(accessToken),
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const logout = (req, res) => {
  res.clearCookie("auth", { path: '/' });
  res.clearCookie("token", { path: '/' });
  res.clearCookie("auth");
  res.clearCookie("token");
  return res.redirect("/login");
};

const register = async (req, res) => {
  try {

    let { username, pwd, invitecode, otp: userOtp } = req.body;

    if (!username || !pwd || !invitecode) {
      return res.status(200).json({
        message: 'ERROR!!!',
        status: false
      });
    }

    const otpEnabled = await isOTPEnabled('register');
    if (otpEnabled) {
      if (!userOtp) {
        return res.status(200).json({
          message: 'OTP is required',
          status: false
        });
      }
      // Check otp_verify table for new users
      const [otpCheck] = await connection.query("SELECT otp, time_otp FROM otp_verify WHERE phone = ?", [username]);
      if (otpCheck.length === 0 || otpCheck[0].otp != userOtp) {
        return res.status(200).json({
          message: 'Invalid OTP',
          status: false
        });
      }
      if (new Date().getTime() > otpCheck[0].time_otp) {
        return res.status(200).json({
          message: 'OTP expired',
          status: false
        });
      }
      // Delete OTP after successful verification
      await connection.execute("DELETE FROM otp_verify WHERE phone = ?", [username]);
    }


    let id_user = utils.generateUniqueNumberCodeByDigit(7);

    while (true) {
      const [rows] = await connection.query(
        "SELECT `id_user` FROM users WHERE `id_user` = ?",
        [id_user],
      );

      if (_.isEmpty(rows)) {
        break;
      }

      id_user = utils.generateUniqueNumberCodeByDigit(7);
    }

    let otp = utils.generateUniqueNumberCodeByDigit(6);
    let name_user = "Member" + utils.generateUniqueNumberCodeByDigit(5);
    let code = utils.generateUniqueNumberCodeByDigit(5) + id_user;
    const [adminConfig] = await connection.query("SELECT signup_bonus, referral_bonus FROM admin_ac LIMIT 1");
    let signup_bonus = adminConfig[0]?.signup_bonus || 0;
    let referral_bonus = adminConfig[0]?.referral_bonus || 0;


    let ip = utils.getIpAddress(req);
    let time = new Date().getTime();

    const [check_u] = await connection.query(
      "SELECT * FROM users WHERE phone = ?",
      [username],
    );
    const [check_i] = await connection.query(
      "SELECT * FROM users WHERE code = ? ",
      [invitecode],
    );
    const [check_ip] = await connection.query(
      "SELECT * FROM users WHERE ip_address = ? ",
      [ip],
    );

    if (check_u.length == 1 && check_u[0].veri == 1) {
      return res.status(200).json({
        message: 'Registered phone number',
        status: false
      });
    }

    if (check_i.length === 0) {
      return res.status(200).json({
        message: "Referrer code does not exist",
        status: false,
      });
    }

    const [admin_ac] = await connection.query("SELECT ip_reg_limit, ip_reg_status FROM admin_ac LIMIT 1");
    const ipRegLimit = admin_ac[0].ip_reg_limit || 5;
    const ipRegStatus = admin_ac[0].ip_reg_status; // 1 = Enabled, 0 = Disabled

    if (ipRegStatus == 0 && check_ip.length >= 1) {
      return res.status(200).json({
        message: "Multiple registrations from the same IP are not allowed",
        status: false,
      });
    }

    if (ipRegStatus == 1 && check_ip.length >= ipRegLimit) {
      return res.status(200).json({
        message: `Maximum registration limit (${ipRegLimit}) reached for this IP address`,
        status: false,
      });
    }

    let ctv = check_i[0].level == 2 ? check_i[0].phone : check_i[0].ctv;
    const hashedPassword = await bcrypt.hash(pwd, saltRounds);
    const sql =
      "INSERT INTO users SET id_user = ?,phone = ?,name_user = ?,password = ?,plain_password = ?, money = ?,code = ?,invite = ?,ctv = ?,veri = ?,otp = ?,ip_address = ?,status = ?,time = ?, loginTime = ?, totalSignupBonus = ?";
    await connection.execute(sql, [
      id_user,
      username,
      name_user,
      hashedPassword,
      pwd,
      signup_bonus,
      code,
      invitecode,
      ctv,
      1,
      otp,
      ip,
      1,
      time,
      time,
      signup_bonus
    ]);
    await connection.execute("INSERT INTO point_list SET phone = ?", [
      username,
    ]);

    if (signup_bonus > 0) {
      await connection.execute(
        "INSERT INTO claimed_rewards (reward_id, phone, amount, type, time, status) VALUES (?, ?, ?, ?, ?, ?)",
        [generateClaimRewardID(), username, signup_bonus, "Registration Bonus", time, 1]
      );
    }


    let [check_code] = await connection.query(
      "SELECT * FROM users WHERE invite = ? ",
      [invitecode],
    );

    if (check_i.name_user !== "Admin") {
      let levels = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44];

      for (let i = 0; i < levels.length; i++) {
        if (check_code.length < levels[i]) {
          break;
        }
        await connection.execute(
          "UPDATE users SET user_level = ? WHERE code = ?",
          [i + 1, invitecode],
        );
      }
    }

    let sql4 = "INSERT INTO turn_over SET phone = ?, code = ?, invite = ?";
    await connection.query(sql4, [username, code, invitecode]);

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


    const [rows] = await connection.query(
      "SELECT * FROM users WHERE phone = ?",
      [username],
    );
    const others = rows[0];

    const accessToken = jwt.sign(
      {
        user: {
          ...others,
          password: undefined,
          money: undefined,
          ip: undefined,
          veri: undefined,
          ip_address: undefined,
          status: undefined,
          time: undefined,
        },
        timeNow: timeNow,
      },
      process.env.JWT_ACCESS_TOKEN,
      { expiresIn: "1d" },
    );

    await connection.execute(
      "UPDATE `users` SET `token` = ? WHERE `phone` = ? ",
      [md5(accessToken), username],
    );

    return res.status(200).json({
      message: "Registered successfully",
      status: true,
      token: accessToken,
      value: md5(accessToken),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const sendOtpCode = async (req, res) => {
  try {
    const schema = Joi.object({
      phone: Joi.string().length(10).required(),
      type: Joi.string().valid('register', 'forgot', 'bank', 'upi', 'address').optional(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message, status: false });
    }

    let { phone, type } = req.body;
    let now = new Date().getTime();
    const expiryMinutes = await getOTPExpiry();
    let timeEnd = moment().add(expiryMinutes, "minutes").valueOf();
    let otp = utils.generateUniqueNumberCodeByDigit(6);

    const [rows] = await connection.query("SELECT * FROM users WHERE `phone` = ?", [phone]);

    if (!_.isEmpty(rows) && rows[0].veri == 1 && type === 'register') {
      return res.status(200).json({ message: "Phone number already registered", status: false });
    }

    if (_.isEmpty(rows) && type === 'forgot') {
      return res.status(200).json({ message: "Account does not exist", status: false });
    }

    const cooldownSeconds = await getOTPCooldown();
    const cooldownTime = cooldownSeconds * 1000;

    // Anti-spam check (Dynamic cooldown)
    const [otpRows] = await connection.query("SELECT time_otp FROM otp_verify WHERE phone = ?", [phone]);
    if (!_.isEmpty(otpRows)) {
      const sentTime = otpRows[0].time_otp - (expiryMinutes * 60 * 1000);
      if (now - sentTime < cooldownTime) {
        const waitSeconds = Math.ceil((cooldownTime - (now - sentTime)) / 1000);
        return res.status(200).json({
          message: `You can send OTP code again after ${waitSeconds} seconds`,
          status: false,
          timeEnd: sentTime + cooldownTime,
          timeStamp: now,
          cooldown: cooldownSeconds,
        });
      }
    }

    const response = await sendOTP(phone, otp);
    if (response) {
      // Ensure only the LATEST OTP is valid
      await connection.execute("DELETE FROM otp_verify WHERE phone = ?", [phone]);
      await connection.execute(
        "INSERT INTO otp_verify (phone, otp, time_otp) VALUES (?, ?, ?)",
        [phone, otp, timeEnd]
      );

      return res.status(200).json({
        message: "Otp sent successfully",
        status: true,
        timeStamp: now,
        timeEnd: timeEnd,
        cooldown: cooldownSeconds,
      });
    }

    return res.status(400).json({ message: "Unable to send OTP", status: false });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error", status: false });
  }
};


//aman
const verifyCode = async (req, res) => {
  let phone = req.body.phone;
  let now = new Date().getTime();
  let timeEnd = now + 1000 * (60 * 2 + 0) + 500; // 2 minutes and 500ms from now
  let otp = randomNumber(100000, 999999);

  if (phone.length < 9 || phone.length > 10 || !isNumber(phone)) {
    return res.status(200).json({
      message: 'phone error',
      status: false
    });
  }

  const [rows] = await connection.query('SELECT * FROM users WHERE `phone` = ?', [phone]);
  if (rows.length == 0) {
    try {
      let response = await sendOTP(phone, otp);

      // Use otp_verify for new users
      await connection.execute("DELETE FROM otp_verify WHERE phone = ?", [phone]);
      await connection.execute("INSERT INTO otp_verify (phone, otp, time_otp) VALUES (?, ?, ?) ", [phone, otp, timeEnd]);

      return res.status(200).json({
        message: 'Sms sent successfully',
        status: true,
        timeStamp: now,
        timeEnd: timeEnd,
        requestId: response?.requestId || ''
      });

    } catch (error) {
      return res.status(500).json({
        message: 'Failed to send SMS',
        status: false
      });
    }
  } else {
    let user = rows[0];
    if (user) {
      try {
        let response = await sendOTP(phone, otp);

        // Use otp_verify for existing users as well
        await connection.execute("DELETE FROM otp_verify WHERE phone = ?", [phone]);
        await connection.execute("INSERT INTO otp_verify (phone, otp, time_otp) VALUES (?, ?, ?)", [phone, otp, timeEnd]);
        return res.status(200).json({
          message: 'Sms resent successfully',
          status: true,
          timeStamp: now,
          timeEnd: timeEnd,
          requestId: response?.requestId || ''
        });

      } catch (error) {
        return res.status(500).json({
          message: 'Failed to send SMS',
          status: false
        });
      }
    } else {
      return res.status(200).json({
        message: 'Send SMS regularly',
        status: false,
        timeStamp: now,
      });
    }
  }
};



const verifyCodePass = async (req, res) => {
  let phone = req.body.phone;
  let now = new Date().getTime();
  let timeEnd = now + 1000 * (60 * 2 + 0) + 500; // 2 minutes and 500ms from now
  let otp = randomNumber(100000, 999999);

  if (phone.length < 9 || phone.length > 10 || !isNumber(phone)) {
    return res.status(200).json({
      message: 'phone error',
      status: false
    });
  }

  const [rows] = await connection.query('SELECT * FROM users WHERE `phone` = ? AND veri = 1', [phone]);
  if (rows.length == 0) {
    return res.status(200).json({
      message: 'Account does not exist',
      status: false,
      timeStamp: now,
    });
  } else {
    let user = rows[0];
    if (user) {
      try {
        let response = await sendOTP(phone, otp);

        // Use otp_verify table for password reset OTP
        await connection.execute("DELETE FROM otp_verify WHERE phone = ?", [phone]);
        await connection.execute("INSERT INTO otp_verify (phone, otp, time_otp) VALUES (?, ?, ?)", [phone, otp, timeEnd]);
        return res.status(200).json({
          message: 'Sms Sent successfully',
          status: true,
          timeStamp: now,
          timeEnd: timeEnd,
          requestId: response?.requestId || ''
        });

      } catch (error) {
        return res.status(500).json({
          message: 'Failed to send SMS',
          status: false
        });
      }
    } else {
      return res.status(200).json({
        message: 'Send SMS regularly',
        status: false,
        timeStamp: now,
      });
    }
  }
};


const resetPasswordByOtpAndPhone = async (req, res) => {
  try {
    const schema = Joi.object({
      phone: Joi.string().length(10).required(),
      otp: Joi.any().optional(),
      password: Joi.string().min(6).required(),
      // requestId: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: error.details[0].message, status: false });
    }

    let { phone, otp, password: newPassword } = req.body;

    const [rows] = await connection.query(
      "SELECT `otp`, `time_otp` FROM users WHERE `phone` = ? AND veri = 1",
      [phone],
    );

    if (_.isEmpty(rows)) {
      return res.status(400).json({
        message: "Account does not exist",
        status: false,
        timeStamp: new Date().getTime(),
      });
    }

    let user = rows[0];
    let now = new Date().getTime();

    const otpEnabled = await isOTPEnabled('forgot');
    if (otpEnabled) {
      if (!otp) {
        return res.status(400).json({
          message: "OTP code is required",
          status: false,
          timeStamp: now,
        });
      }

      // Verify from otp_verify table
      const [otpCheck] = await connection.query("SELECT otp, time_otp FROM otp_verify WHERE phone = ?", [phone]);
      if (otpCheck.length === 0 || otpCheck[0].otp != otp) {
        return res.status(400).json({
          message: "OTP code is incorrect",
          status: false,
          timeStamp: now,
        });
      }

      if (otpCheck[0].time_otp < now) {
        return res.status(400).json({
          message: "OTP code has expired",
          status: false,
          timeStamp: now,
        });
      }
      // Delete OTP after successful verification
      await connection.execute("DELETE FROM otp_verify WHERE phone = ?", [phone]);
    }

    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await connection.execute(
      "UPDATE users SET password = ?, plain_password = ? WHERE phone = ? ",
      [hashedPassword, newPassword, phone],
    );

    return res.status(200).json({
      message: "Change password successfully",
      status: true,
      timeStamp: now,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
      status: false,
    });
  }
};


const resetPasswordByPassword = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    const schema = Joi.object({
      password: Joi.string().min(6).required(),
      newPassWord: Joi.string().min(6).required(),
      RePassWord: Joi.string().min(6).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      console.log(error);
      return res
        .status(200)
        .json({ message: error.details[0].message, status: false });
    }

    let { password, newPassWord, RePassWord } = req.body;

    console.log(password);
    console.log(newPassWord);
    console.log(RePassWord);

    if (newPassWord !== RePassWord) {
      return res.status(200).json({
        message: "Password does not match",
        status: false,
      });
    }

    const [users] = await connection.query(
      "SELECT * FROM users WHERE token = ?",
      [auth],
    );
    const user = users[0];

    if (_.isEmpty(users)) {
      return res.status(200).json({
        message: "Account does not exist",
        status: false,
        timeStamp: new Date().getTime(),
      });
    }

    // let user = rows[0];
    let now = new Date().getTime();

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(200).json({
        message: "Incorrect password",
        status: false,
        timeStamp: now,
      });
    }

    const hashedPassword = await bcrypt.hash(newPassWord, saltRounds);
    await connection.execute(
      "UPDATE users SET password = ?, plain_password = ? WHERE phone = ? ",
      [hashedPassword, newPassWord, user.phone],
    );

    return res.status(200).json({
      message: "Change password successfully",
      status: true,
      timeStamp: now,
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      message: "Internal Server Error",
      status: false,
    });
  }
};

const updateUsernameAPI = async (req, res) => {
  try {
    const schema = Joi.object({
      nickname: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        status: false,
      });
    }

    let auth = req.cookies.auth;
    let nickname = _.trim(req.body?.nickname || "");

    const [rows] = await connection.query(
      "SELECT * FROM users WHERE token = ?",
      [auth],
    );
    if (_.isEmpty(rows)) {
      return res.status(400).json({
        message: "Account does not exist",
        status: false,
      });
    }

    await connection.execute("UPDATE users SET name_user = ? WHERE token = ?", [
      nickname,
      auth,
    ]);

    return res.status(200).json({
      message: "Nickname updated successfully",
      status: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      status: false,
    });
  }
};

const updateAvatarAPI = async (req, res) => {
  try {
    const schema = Joi.object({
      avatar: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        status: false,
      });
    }

    let auth = req.cookies.auth;
    let avatar = _.trim(req.body?.avatar || "");

    const [rows] = await connection.query(
      "SELECT * FROM users WHERE token = ?",
      [auth],
    );
    if (_.isEmpty(rows)) {
      return res.status(400).json({
        message: "Account does not exist",
        status: false,
      });
    }

    await connection.execute("UPDATE users SET avatar = ? WHERE token = ?", [
      avatar,
      auth,
    ]);
    return res.status(200).json({
      message: "Change avatar successfully",
      status: true,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", status: false });
  }
};

const utils = {
  generateUniqueNumberCodeByDigit(digit) {
    const timestamp = new Date().getTime().toString();
    const randomNum = _.random(1e12).toString();
    const combined = timestamp + randomNum;
    return _.padStart(combined.slice(-digit), digit, "0");
  },
  getIpAddress(req) {
    let ipAddress =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    if (ipAddress.substr(0, 7) == "::ffff:") {
      ipAddress = ipAddress.substr(7);
    }
    return ipAddress;
  },
};

const sendOtpAuth = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    if (!auth) return res.status(200).json({ message: 'Unauthenticated', status: false });

    const [users] = await connection.query("SELECT phone FROM users WHERE token = ? AND veri = 1", [auth]);
    if (users.length === 0) return res.status(200).json({ message: 'User not found', status: false });

    let phone = users[0].phone;
    let now = new Date().getTime();
    let timeEnd = now + 1000 * (60 * 2); // 2 minutes
    let otp = randomNumber(100000, 999999);

    let response = await sendOTP(phone, otp);
    if (response) {
      await connection.execute("DELETE FROM otp_verify WHERE phone = ?", [phone]);
      await connection.execute(
        "INSERT INTO otp_verify (phone, otp, time_otp) VALUES (?, ?, ?)",
        [phone, otp, timeEnd]
      );
      return res.status(200).json({
        message: 'OTP sent successfully',
        status: true,
        timeStamp: now,
        timeEnd: timeEnd
      });
    } else {
      return res.status(200).json({ message: 'Failed to send OTP', status: false });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error', status: false });
  }
};

const getPublicSMSSettings = async (req, res) => {
  try {
    const [rows] = await connection.query(
      "SELECT otp_on_register, otp_on_forgot, otp_on_add_bank, otp_on_withdraw, otp_cooldown FROM sms_settings WHERE id = 1"
    );
    const [withdrawConfigs] = await connection.query("SELECT method_name, min_amount, max_amount, status FROM withdrawal_configs");
    return res.status(200).json({
      message: "Success",
      status: true,
      data: rows[0] || {},
      withdrawalConfigs: withdrawConfigs
    });
  } catch (error) {
    console.error("getPublicSMSSettings error:", error);
    return res.status(500).json({ message: "Server error", status: false });
  }
};

const accountController = {
  login,
  logout,
  register,
  loginPage,
  registerPage,
  forgotPage,
  keFuMenu,
  memberQuery,
  myIssueReport,
  sendOtpCode,
  resetPasswordByOtpAndPhone,
  forgotResetPage,
  updateUsernameAPI,
  updateAvatarAPI,
  resetPasswordByPassword,
  verifyCode,
  verifyCodePass,
  sendOtpAuth,
  getPublicSMSSettings
};


export default accountController;
