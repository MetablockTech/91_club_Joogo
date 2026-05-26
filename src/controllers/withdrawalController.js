import moment from "moment";
import connection from "../config/connectDB.js";
import userStatsHelper from "../helpers/userStats.js";
import bcrypt from "bcrypt";
import { isOTPEnabled } from "../helpers/smsService.js";
import withdrawalWorkflow from "../helpers/withdrawalWorkflow.js";
import paymentController from "./paymentController.js";


const WITHDRAWAL_METHODS_MAP = {
  USDT_ADDRESS: "USDT_ADDRESS",
  BANK_CARD: "BANK_CARD",
  UPI_ID: "UPI"
};

const WITHDRAWAL_STATUS_MAP = {
  PENDING: 0,
  APPROVED: 1,
  DENIED: 2,
};

const addBankCardPage = async (req, res) => {
  return res.render("wallet/addbank.ejs");
};

const addUpiPage = async (req, res) => {
  return res.render("wallet/addupi.ejs");
};

const selectBankPage = async (req, res) => {
  return res.render("wallet/selectBank.ejs");
};

const addUSDTAddressPage = async (req, res) => {
  return res.render("wallet/addAddress.ejs");
};

const addBankCard = async (req, res) => {
  let timeNow = new Date().getTime();
  try {
    let auth = req.cookies.auth;

    if (!auth) {
      return res.status(400).json({
        message: "Auth is required to fulfill the request!",
        status: false,
        timeStamp: timeNow,
      });
    }

    let bankName = req.body.bankName;
    let recipientName = req.body.recipientName;
    let bankAccountNumber = req.body.bankAccountNumber;
    let phoneNumber = req.body.phoneNumber;
    let IFSC = req.body.IFSC;
    let userOtp = req.body.otp;

    if (
      !bankName ||
      !recipientName ||
      !bankAccountNumber ||
      !phoneNumber ||
      !IFSC
    ) {
      return res.status(400).json({
        message: "Please fill the required fields",
        status: false,
        timeStamp: timeNow,
      });
    }

    const user = await getUserDataByAuthToken(auth);

    const otpEnabled = await isOTPEnabled('add_bank');
    if (otpEnabled) {
      if (!userOtp) return res.status(400).json({ message: "OTP is required", status: false });
      // Check otp_verify table for latest valid OTP
      const [otpCheck] = await connection.query("SELECT otp, time_otp FROM otp_verify WHERE phone = ?", [user.phone]);
      if (otpCheck.length === 0 || otpCheck[0].otp != userOtp) {
        return res.status(400).json({ message: "Invalid OTP", status: false });
      }
      if (new Date().getTime() > otpCheck[0].time_otp) {
        return res.status(400).json({ message: "OTP expired", status: false });
      }
      // Delete OTP after successful verification to prevent reuse
      await connection.execute("DELETE FROM otp_verify WHERE phone = ?", [user.phone]);
    }


    const account = await AccountDB.getUserBankCard({
      userPhoneNumber: user.phone,
      type: WITHDRAWAL_METHODS_MAP.BANK_CARD,
    });

    if (account.isAvailable) {
      const account = await AccountDB.updateUserBankCard({
        userPhoneNumber: user.phone,
        bankName,
        recipientName,
        bankAccountNumber,
        phoneNumber,
        IFSC,
      });

      return res.status(200).json({
        account,
        message: "Successfully Updated Bank Card",
        status: true,
        timeStamp: timeNow,
      });
    } else {
      const account = await AccountDB.createUserBankCard({
        userPhoneNumber: user.phone,
        bankName,
        recipientName,
        bankAccountNumber,
        phoneNumber,
        IFSC,
      });

      return res.status(200).json({
        account,
        message: "Successfully Created Bank Card",
        status: true,
        timeStamp: timeNow,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.message || "Something went wrong!",
      status: false,
      timeStamp: timeNow,
    });
  }
};

const addUpi = async (req, res) => {
  let timeNow = new Date().getTime();
  try {
    let auth = req.cookies.auth;
    let upiId = req.body.upiId;

    if (!auth || !upiId) {
      return res.status(400).json({
        message: "Auth and upiId are required to fulfill the request!",
        status: false,
        timeStamp: timeNow,
      });
    }

    const user = await getUserDataByAuthToken(auth);
    let userOtp = req.body.otp;

    const otpEnabled = await isOTPEnabled('add_bank'); // Use same toggle for bank/upi
    if (otpEnabled) {
      if (!userOtp) return res.status(400).json({ message: "OTP is required", status: false });
      // Check otp_verify table for latest valid OTP
      const [otpCheck] = await connection.query("SELECT otp, time_otp FROM otp_verify WHERE phone = ?", [user.phone]);
      if (otpCheck.length === 0 || otpCheck[0].otp != userOtp) {
        return res.status(400).json({ message: "Invalid OTP", status: false });
      }
      if (new Date().getTime() > otpCheck[0].time_otp) {
        return res.status(400).json({ message: "OTP expired", status: false });
      }
      // Delete OTP after successful verification to prevent reuse
      await connection.execute("DELETE FROM otp_verify WHERE phone = ?", [user.phone]);
    }

    const account = await AccountDB.getUserBankCard({
      userPhoneNumber: user.phone,
      type: WITHDRAWAL_METHODS_MAP.UPI_ID,
    });

    if (account.isAvailable) {
      const account = await AccountDB.updateUserBankCard({
        userPhoneNumber: user.phone,
        upiId,
      });

      return res.status(200).json({
        account,
        message: "Successfully Updated UPI",
        status: true,
        timeStamp: timeNow,
      });
    } else {
      const account = await AccountDB.createUserBankCard({
        userPhoneNumber: user.phone,
        upiId,
      });

      return res.status(200).json({
        account,
        message: "Successfully Created UPI",
        status: true,
        timeStamp: timeNow,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.message || "Something went wrong!",
      status: false,
      timeStamp: timeNow,
    });
  }
};

const getBankCardInfo = async (req, res) => {
  let timeNow = new Date().getTime();
  try {
    let auth = req.cookies.auth;

    if (!auth) {
      return res.status(400).json({
        message: "Auth is required to fulfill the request!",
        status: false,
        timeStamp: timeNow,
      });
    }

    const user = await getUserDataByAuthToken(auth);

    const account = await AccountDB.getUserBankCard({
      userPhoneNumber: user.phone,
      type: WITHDRAWAL_METHODS_MAP.BANK_CARD,
    });

    return res.status(200).json({
      account,
      message: "Successfully fetched Bank Card",
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.message || "Something went wrong!",
      status: false,
      timeStamp: timeNow,
    });
  }
};

const getUPIIDInfo = async (req, res) => {
  let timeNow = new Date().getTime();
  try {
    let auth = req.cookies.auth;

    if (!auth) {
      return res.status(400).json({
        message: "Auth is required to fulfill the request!",
        status: false,
        timeStamp: timeNow,
      });
    }

    const user = await getUserDataByAuthToken(auth);

    const account = await AccountDB.getUserBankCard({
      userPhoneNumber: user.phone,
      type: WITHDRAWAL_METHODS_MAP.UPI_ID,
    });

    return res.status(200).json({
      account,
      message: "Successfully fetched UPI ID",
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.message || "Something went wrong!",
      status: false,
      timeStamp: timeNow,
    });
  }
};

const addUSDTAddress = async (req, res) => {
  let timeNow = new Date().getTime();
  try {
    let auth = req.cookies.auth;

    if (!auth) {
      return res.status(400).json({
        message: "Auth is required to fulfill the request!",
        status: false,
        timeStamp: timeNow,
      });
    }

    let mainNetwork = req.body.mainNetwork;
    let usdtAddress = req.body.usdtAddress;
    let addressAlias = req.body.addressAlias;

    if (!mainNetwork || !usdtAddress || !addressAlias) {
      return res.status(400).json({
        message: "Please fill the required fields",
        status: false,
        timeStamp: timeNow,
      });
    }

    const user = await getUserDataByAuthToken(auth);

    const account = await AccountDB.getUserUSDTAddress({
      userPhoneNumber: user.phone,
    });

    if (account.isAvailable) {
      const account = await AccountDB.updateUserUSDTAddress({
        userPhoneNumber: user.phone,
        mainNetwork,
        usdtAddress,
        addressAlias,
      });

      return res.status(200).json({
        account,
        message: "Successfully Updated USDT Address",
        status: true,
        timeStamp: timeNow,
      });
    } else {
      const account = await AccountDB.createUserUSDTAddress({
        userPhoneNumber: user.phone,
        mainNetwork,
        usdtAddress,
        addressAlias,
      });

      return res.status(200).json({
        account,
        message: "Successfully Created USDT Address",
        status: true,
        timeStamp: timeNow,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.message || "Something went wrong!",
      status: false,
      timeStamp: timeNow,
    });
  }
};

const getUSDTAddressInfo = async (req, res) => {
  let timeNow = new Date().getTime();
  try {
    let auth = req.cookies.auth;

    if (!auth) {
      return res.status(400).json({
        message: "Auth is required to fulfill the request!",
        status: false,
        timeStamp: timeNow,
      });
    }

    const user = await getUserDataByAuthToken(auth);

    const account = await AccountDB.getUserUSDTAddress({
      userPhoneNumber: user.phone,
    });

    return res.status(200).json({
      account,
      message: "Successfully fetched USDT Address",
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.message || "Something went wrong!",
      status: false,
      timeStamp: timeNow,
    });
  }
};

const createWithdrawalRequest = async (req, res) => {
  let timeNow = new Date().getTime();
  try {
    let auth = req.cookies.auth;

    if (!auth) {
      return res.status(400).json({
        message: "Auth is required to fulfill the request!",
        status: false,
        timeStamp: timeNow,
      });
    }

    let withdrawalMethod = req.body.withdrawalMethod;
    let amount = parseFloat(req.body.amount) || 0;
    let AllowedWithdrawAmount = req.body.AllowedWithdrawAmount || false;
    let totalBetAmountRemaining = req.body.totalBetAmountRemaining || 0;
    let password = req.body.password;
    let userOtp = req.body.otp;

    const user = await getUserDataByAuthToken(auth);

    const otpEnabled = await isOTPEnabled('withdraw');
    if (otpEnabled) {
      if (!userOtp) return res.status(400).json({ message: "OTP is required", status: false });
      const [otpCheck] = await connection.query("SELECT otp, time_otp FROM otp_verify WHERE phone = ?", [user.phone]);
      if (otpCheck.length === 0 || otpCheck[0].otp != userOtp) {
        return res.status(400).json({ message: "Invalid OTP", status: false });
      }
      if (new Date().getTime() > otpCheck[0].time_otp) {
        return res.status(400).json({ message: "OTP expired", status: false });
      }
      // Delete OTP after successful verification to prevent reuse
      await connection.execute("DELETE FROM otp_verify WHERE phone = ?", [user.phone]);
    }


    if (!withdrawalMethod) {
      return res.status(400).json({
        message: "Please select the Withdrawal Method of your choice!",
        status: false,
        timeStamp: timeNow,
      });
    }

    if (
      WITHDRAWAL_METHODS_MAP.BANK_CARD !== withdrawalMethod &&
      WITHDRAWAL_METHODS_MAP.USDT_ADDRESS !== withdrawalMethod
      && WITHDRAWAL_METHODS_MAP.UPI_ID != withdrawalMethod
    ) {
      return res.status(400).json({
        message: "Please select a valid the Withdrawal Method!",
        status: false,
        timeStamp: timeNow,
      });
    }

    // Fetch Withdrawal Config
    const [configRows] = await connection.query("SELECT * FROM withdrawal_configs WHERE method_name = ?", [withdrawalMethod]);
    if (configRows.length === 0) {
      return res.status(400).json({ message: "Withdrawal configuration not found", status: false });
    }
    const config = configRows[0];
    if (config.status == 0) {
      return res.status(400).json({ message: "This withdrawal method is currently disabled", status: false });
    }

    if (amount < config.min_amount) {
      return res.status(400).json({ message: `Minimum withdrawal amount is ${config.min_amount}`, status: false });
    }
    if (amount > config.max_amount) {
      return res.status(400).json({ message: `Maximum withdrawal amount is ${config.max_amount}`, status: false });
    }

    // Fetch user password to verify
    const [userPasswordRecord] = await connection.query(

      "SELECT password FROM users WHERE phone = ?",
      [user.phone]
    );

    if (userPasswordRecord.length === 0) {
      return res.status(400).json({
        message: "User not found!",
        status: false,
        timeStamp: timeNow,
      });
    }

    const validPassword = await bcrypt.compare(password, userPasswordRecord[0].password);

    if (!validPassword) {
      return res.status(400).json({
        message: "Incorrect password!",
        status: false,
        timeStamp: timeNow,
      });
    }

    // const [rechargeRow] = await connection.query(
    //   "SELECT * FROM recharge WHERE phone = ? AND status = 1",
    //   [user.phone],
    // );

    // if (rechargeRow.length === 0) {
    //   return res.status(400).json({
    //     message: "You must deposit first to withdraw",
    //     status: false,
    //     timeStamp: timeNow,
    //   });
    // }

    let account = { isAvailable: false };

    if (WITHDRAWAL_METHODS_MAP.BANK_CARD === withdrawalMethod || WITHDRAWAL_METHODS_MAP.UPI_ID === withdrawalMethod) {
      account = await AccountDB.getUserBankCard({
        userPhoneNumber: user.phone,
        type: withdrawalMethod,
      });
    } else {
      account = await AccountDB.getUserUSDTAddress({
        userPhoneNumber: user.phone,
      });
    }

    if (!account.isAvailable) {
      return res.status(400).json({
        message: "Please add your withdrawal method first!",
        status: false,
        timeStamp: timeNow,
      });
    }

    const [adminConfig] = await connection.query("SELECT usdt_withdraw_rate FROM admin_ac LIMIT 1");
    const globalWithdrawRate = adminConfig[0]?.usdt_withdraw_rate || 90;

    let actualAmount = parseFloat(amount); // amount is now always sent in INR from the frontend

    if (Number(user.money) < Number(actualAmount)) {
      return res.status(400).json({
        message: "The balance is not enough to fulfill the request",
        status: false,
        timeStamp: timeNow,
      });
    }

    // Visual Workflow Evaluation
    const decision = await withdrawalWorkflow.getWithdrawalDecision(user.phone, actualAmount);
    if (!decision.allowed) {
      return res.status(400).json({
        message: decision.message || "Withdrawal criteria not met.",
        status: false,
        timeStamp: timeNow,
      });
    }

    if (decision.audit) {
        // Handle manual audit logic if needed, for now we just flag it or treat as pending
        console.log(`Withdrawal for ${user.phone} flagged for audit.`);
    }

    if (withdrawalMethod === WITHDRAWAL_METHODS_MAP.BANK_CARD || withdrawalMethod === WITHDRAWAL_METHODS_MAP.UPI_ID) {
      const withd = await connection.query(
        "UPDATE users SET money = money - ?, total_money = total_money - ? WHERE `phone` = ? AND money >= ?",
        [amount, amount, user.phone, amount],
      );

      console.log(withd);

      withdrawDB.createBankCardWithdrawalRequest({
        userPhoneNumber: user.phone,
        bankName: account.bankName,
        recipientName: account.recipientName,
        bankAccountNumber: account.bankAccountNumber,
        IFSC: account.IFSC,
        upiId: account.upiId,
        amount: amount,
        method: withdrawalMethod,
      });

      return res.status(200).json({
        message: "Withdrawal request registered Successfully!",
        status: true,
        timeStamp: timeNow,
      });
    }

    if (withdrawalMethod === WITHDRAWAL_METHODS_MAP.USDT_ADDRESS) {
      const withd = await connection.query(
        "UPDATE users SET money = money - ?, total_money = total_money - ? WHERE `phone` = ? AND money >= ?",
        [actualAmount, actualAmount, user.phone, actualAmount],
      );

      console.log(withd);

      withdrawDB.createUSDTWithdrawalRequest({
        userPhoneNumber: user.phone,
        mainNetwork: account.mainNetwork,
        usdtAddress: account.usdtAddress,
        addressAlias: account.addressAlias,
        amount: actualAmount, // Stores INR
        rawUsdt: actualAmount / globalWithdrawRate,      // Convert INR to USDT for recording
        rate: globalWithdrawRate
      });

      return res.status(200).json({
        message: "Withdrawal request registered Successfully!",
        status: true,
        timeStamp: timeNow,
      });
    }

    return res.status(400).json({
      message: "Please select a valid the Withdrawal Method!",
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.message || "Something went wrong!",
      status: false,
      timeStamp: timeNow,
    });
  }
};

const listWithdrawalRequests = async (req, res) => {
  let timeNow = new Date().getTime();
  try {
    let auth = req.cookies.auth;

    if (!auth) {
      return res.status(400).json({
        message: "Auth is required to fulfill the request!",
        status: false,
        timeStamp: timeNow,
      });
    }

    const withdraw = await withdrawDB.getWithdrawalList({
      status: WITHDRAWAL_STATUS_MAP.PENDING,
    });

    return res.status(200).json({
      message: "Withdrawal request fetched!",
      withdrawList: withdraw.isAvailable ? withdraw.withdrawalList : [],
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.message || "Something went wrong!",
      status: false,
      timeStamp: timeNow,
    });
  }
};

const listWithdrawalHistory = async (req, res) => {
  let timeNow = new Date().getTime();
  try {
    let auth = req.cookies.auth;

    if (!auth) {
      return res.status(400).json({
        message: "Auth is required to fulfill the request!",
        status: false,
        timeStamp: timeNow,
      });
    }

    const user = await getUserDataByAuthToken(auth);

    let { fromDate, toDate, status } = req.query;
    let sql = "SELECT * FROM withdraw WHERE phone = ?";
    let params = [user.phone];

    if (fromDate) {
      sql += " AND time >= ?";
      params.push(moment(fromDate).startOf('day').valueOf());
    }
    if (toDate) {
      sql += " AND time <= ?";
      params.push(moment(toDate).endOf('day').valueOf());
    }
    if (status && status !== "All") {
      sql += " AND status = ?";
      params.push(status);
    }

    sql += " ORDER BY id DESC";

    const [withdrawalList] = await connection.query(sql, params);

    // Map the records to the expected format
    const formattedList = withdrawalList.map((item) => {
      return {
        id: item.id,
        orderId: item.id_order,
        phoneNumber: item.phone,
        status: item.status,
        bankName: item.name_bank,
        recipientName: item.name_user,
        bankAccountNumber: item.account_number,
        IFSC: item.ifsc,
        upiId: item.upi_id,
        addressAlias: item.address_alias,
        type: item.method,
        time: item.time,
        today: item.today,
        amount: item.money,
        usdtAmount: item.usdt_amount,
        usdtRate: item.usdt_rate,
        remarks: item.remarks,
      };
    });

    return res.status(200).json({
      message: "Withdrawal request fetched!",
      withdrawList: formattedList,
      status: true,
      timeStamp: timeNow,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.message || "Something went wrong!",
      status: false,
      timeStamp: timeNow,
    });
  }
};

const approveOrDenyWithdrawalRequest = async (req, res) => {
  let timeNow = new Date().getTime();
  try {
    let auth = req.cookies.auth;
    let id = req.body.id;
    let status = req.body.status;
    let remarks = req.body.remarks;
    let payoutMethod = req.body.payoutMethod || "AUTO";

    if (!auth) {
      return res.status(400).json({
        message: "Admin authentication is required!",
        status: false,
        timeStamp: timeNow,
      });
    }

    if (!id || !status) {
      return res.status(400).json({
        message: "Please Provide the required fields!",
        status: false,
        timeStamp: timeNow,
      });
    }

    const withdraw = await withdrawDB.getWithdrawalById(id);

    if (!withdraw.isAvailable) {
      return res.status(400).json({
        message: "Withdrawal request not found!",
        status: false,
        timeStamp: timeNow,
      });
    }

    if (withdraw.withdrawal.status !== WITHDRAWAL_STATUS_MAP.PENDING) {
      return res.status(400).json({
        message: "This withdrawal request has already been processed!",
        status: false,
        timeStamp: timeNow,
      });
    }

    if (status == WITHDRAWAL_STATUS_MAP.APPROVED) {
      // Check if Payok is the active payout gateway and if admin hasn't chosen MANUAL override
      if (payoutMethod !== "MANUAL") {
        const [payokConfig] = await connection.query(
          "SELECT * FROM payment_configs WHERE gateway_name = 'payok' AND status = 1"
        );

      if (payokConfig.length > 0) {
        if (withdraw.withdrawal.type === WITHDRAWAL_METHODS_MAP.BANK_CARD) {
          try {
            await paymentController.initiatePayokPayout(withdraw.withdrawal);

            // Set status to 3 (Processing) and update remarks
            await connection.execute(
              `UPDATE withdraw SET status = 3, remarks = ? WHERE id = ?`,
              [`Sent to Payok (Pending Callback). Remarks: ${remarks || ''}`, id],
            );

            return res.status(200).json({
              message: "Withdrawal approved and sent to Payok for processing!",
              status: true,
              timeStamp: timeNow,
            });
          } catch (payoutError) {
            console.error("Payok Payout Trigger Error:", payoutError);
            return res.status(400).json({
              message: `Payok Payout Error: ${payoutError.message}`,
              status: false,
              timeStamp: timeNow,
            });
          }
        } else if (withdraw.withdrawal.type === WITHDRAWAL_METHODS_MAP.UPI_ID) {
          return res.status(400).json({
            message: "Payok only supports Payout to Bank Card (IFSC) in India. UPI is not supported via Payok payout. Please handle manually or use a different gateway.",
            status: false,
            timeStamp: timeNow,
          });
        }
      }
    }

      await connection.execute(
        `UPDATE withdraw SET status = 1, remarks = ? WHERE id = ?`,
        [remarks, id],
      );

      // Increment total_withdrawal_amount in users table
      await connection.execute(
        "UPDATE users SET total_withdrawal_amount = total_withdrawal_amount + ? WHERE phone = ?",
        [withdraw.withdrawal.amount, withdraw.withdrawal.phoneNumber]
      );

      return res.status(200).json({
        message: "Approved Withdrawal Request!",
        status: true,
        timeStamp: timeNow,
      });
    }

    if (status == WITHDRAWAL_STATUS_MAP.DENIED) {
      const amount = Number(withdraw.withdrawal.amount);

      await connection.query(
        `UPDATE withdraw SET status = 2, remarks = ? WHERE id = ?`,
        [remarks, id],
      );

      await connection.query(
        "UPDATE users SET money = money + ?, total_money = total_money + ? WHERE phone = ? ",
        [amount, amount, withdraw.withdrawal.phoneNumber],
      );

      return res.status(200).json({
        message: "Denied Withdrawal Request!",
        status: true,
        timeStamp: timeNow,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.message || "Something went wrong!",
      status: false,
      timeStamp: timeNow,
    });
  }
};

// helpers ---------------
const getUserDataByAuthToken = async (authToken) => {
  let [users] = await connection.query(
    "SELECT `phone`, `code`,`name_user`,`invite`,`money` FROM users WHERE `token` = ? ",
    [authToken],
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
    money: user.money,
  };
};

const AccountDB = {
  async getUserBankCard({ userPhoneNumber, type }) {
    let [accounts] = await connection.query(
      "SELECT * FROM user_bank WHERE `phone` = ? AND `method` = ?",
      [userPhoneNumber, type],
    );

    const account = accounts?.[0];

    if (account === undefined || account === null) {
      return {
        isAvailable: false,
      };
    }

    return {
      isAvailable: true,
      id: account.id,
      userPhoneNumber: account.phone,
      bankName: account.name_bank,
      recipientName: account.name_user,
      bankAccountNumber: account.account_number,
      phoneNumber: account.bank_phoneNo,
      IFSC: account.ifsc,
      upiId: account.upi_id,
      type,
    };
  },
  async createUserBankCard({
    userPhoneNumber,
    bankName,
    recipientName,
    bankAccountNumber,
    phoneNumber,
    IFSC,
    upiId,
  }) {
    let time = new Date().getTime();
    let type = WITHDRAWAL_METHODS_MAP.BANK_CARD;

    if (upiId) {
      type = WITHDRAWAL_METHODS_MAP.UPI_ID;
    }

    if (type === WITHDRAWAL_METHODS_MAP.UPI_ID) {
        await connection.query(
            "INSERT INTO user_bank SET phone = ?, upi_id = ?, method = ?, time = ?",
            [userPhoneNumber, upiId, type, time]
        );
    } else {
        await connection.query(
            "INSERT INTO user_bank SET phone = ?, name_bank = ?, name_user = ?, account_number = ?, bank_phoneNo = ?, ifsc = ?, method = ?, time = ?",
            [userPhoneNumber, bankName, recipientName, bankAccountNumber, phoneNumber, IFSC, type, time]
        );
    }

    let [accounts] = await connection.query(
      "SELECT * FROM user_bank WHERE `phone` = ? AND `method` = ?",
      [userPhoneNumber, type],
    );

    const account = accounts?.[0];

    if (account === undefined || account === null) {
      return {
        isCreated: false,
      };
    }

    return {
      isCreated: true,
      userPhoneNumber: account.phone,
      bankName: account.name_bank,
      recipientName: account.name_user,
      bankAccountNumber: account.account_number,
      phoneNumber: account.bank_phoneNo,
      IFSC: account.ifsc,
      upiId: account.upi_id,
      type,
    };
  },
  async updateUserBankCard({
    userPhoneNumber,
    bankName,
    recipientName,
    bankAccountNumber,
    phoneNumber,
    IFSC,
    upiId,
  }) {
    let time = new Date().getTime();
    let type = WITHDRAWAL_METHODS_MAP.BANK_CARD;

    if (upiId) {
      type = WITHDRAWAL_METHODS_MAP.UPI_ID;
    }

    if (type === WITHDRAWAL_METHODS_MAP.UPI_ID) {
        await connection.query(
            "UPDATE user_bank SET upi_id = ?, time = ? WHERE phone = ? AND method = ?",
            [upiId, time, userPhoneNumber, type]
        );
    } else {
        // BANK_CARD update
        if (IFSC) {
            await connection.query(
                "UPDATE user_bank SET name_bank = ?, name_user = ?, account_number = ?, bank_phoneNo = ?, ifsc = ?, time = ? WHERE phone = ? AND method = ?",
                [bankName, recipientName, bankAccountNumber, phoneNumber, IFSC, time, userPhoneNumber, type]
            );
        } else {
            await connection.query(
                "UPDATE user_bank SET name_bank = ?, name_user = ?, account_number = ?, bank_phoneNo = ?, time = ? WHERE phone = ? AND method = ?",
                [bankName, recipientName, bankAccountNumber, phoneNumber, time, userPhoneNumber, type]
            );
        }
    }

    let [accounts] = await connection.query(
      "SELECT * FROM user_bank WHERE `phone` = ? AND `method` = ?",
      [userPhoneNumber, type],
    );

    const account = accounts?.[0];

    if (account === undefined || account === null) {
      return {
        isCreated: false,
      };
    }

    return {
      isAvailable: true,
      userPhoneNumber: account.phone,
      bankName: account.name_bank,
      recipientName: account.name_user,
      bankAccountNumber: account.account_number,
      phoneNumber: account.bank_phoneNo,
      IFSC: account.ifsc,
      upiId: account.upi_id,
      type,
    };
  },
  async getUserUSDTAddress({ userPhoneNumber }) {
    const type = WITHDRAWAL_METHODS_MAP.USDT_ADDRESS;
    let [accounts] = await connection.query(
      "SELECT * FROM user_bank WHERE `phone` = ? AND `method` = ?",
      [userPhoneNumber, type],
    );

    const account = accounts?.[0];

    if (account === undefined || account === null) {
      return {
        isAvailable: false,
      };
    }

    return {
      isAvailable: true,
      id: account.id,
      userPhoneNumber: account.phone,
      mainNetwork: account.name_bank,
      usdtAddress: account.account_number,
      addressAlias: account.address_alias,
      type,
    };
  },
  async createUserUSDTAddress({
    userPhoneNumber,
    mainNetwork,
    usdtAddress,
    addressAlias,
  }) {
    let time = new Date().getTime();
    const type = WITHDRAWAL_METHODS_MAP.USDT_ADDRESS;

    await connection.query(
      "INSERT INTO user_bank SET phone = ?, name_bank = ?, account_number = ?, address_alias = ?, method = ?, time = ?",
      [userPhoneNumber, mainNetwork, usdtAddress, addressAlias, type, time]
    );

    let [accounts] = await connection.query(
      "SELECT * FROM user_bank WHERE `phone` = ? AND `method` = ?",
      [userPhoneNumber, type],
    );

    const account = accounts?.[0];

    if (account === undefined || account === null) {
      return {
        isCreated: false,
      };
    }

    return {
      isCreated: true,
      userPhoneNumber: account.phone,
      mainNetwork: account.name_bank,
      usdtAddress: account.account_number,
      addressAlias: account.address_alias,
      type,
    };
  },
  async updateUserUSDTAddress({
    userPhoneNumber,
    mainNetwork,
    usdtAddress,
    addressAlias,
  }) {
    let time = new Date().getTime();
    const type = WITHDRAWAL_METHODS_MAP.USDT_ADDRESS;

    await connection.query(
      "UPDATE user_bank SET name_bank = ?, account_number = ?, address_alias = ?, time = ? WHERE phone = ? AND method = ?",
      [mainNetwork, usdtAddress, addressAlias, time, userPhoneNumber, type]
    );

    let [accounts] = await connection.query(
      "SELECT * FROM user_bank WHERE `phone` = ? AND `method` = ?",
      [userPhoneNumber, type],
    );

    const account = accounts?.[0];

    if (account === undefined || account === null) {
      return {
        isAvailable: false,
      };
    }

    return {
      isAvailable: true,
      userPhoneNumber: account.phone,
      mainNetwork: account.name_bank,
      usdtAddress: account.account_number,
      addressAlias: account.address_alias,
      type,
    };
  },
};

const getTodayString = () => {
  return moment().format("YYYY-MM-DD h:mm:ss A");
};

const getCurrentTimeForTimeField = () => {
  return new Date().getTime();
};
const getCurrentTimeForTodayField = () => {
  return moment().format("YYYY-MM-DD h:mm:ss A");
};


const getOrderId = () => {
  const date = new Date();
  let id_time =
    date.getUTCFullYear() +
    "" +
    date.getUTCMonth() +
    1 +
    "" +
    date.getUTCDate();
  let id_order =
    Math.floor(Math.random() * (99999999999999 - 10000000000000 + 1)) +
    10000000000000;

  return id_time + "" + id_order;
};

const withdrawDB = {
  async getWithdrawalById(id) {
    let [withdrawalList] = await connection.query(
      "SELECT * FROM withdraw WHERE `id` = ?",
      [id],
    );

    if (withdrawalList.length === 0) {
      return {
        isAvailable: false,
      };
    }

    return {
      isAvailable: true,
      withdrawal: withdrawalList.map((item) => {
        if (item.method === WITHDRAWAL_METHODS_MAP.BANK_CARD || item.method === WITHDRAWAL_METHODS_MAP.UPI_ID) {
          return {
            id: item.id,
            orderId: item.id_order,
            phoneNumber: item.phone,
            status: item.status,
            bankName: item.name_bank,
            recipientName: item.name_user,
            bankAccountNumber: item.account_number,
            IFSC: item.ifsc,
            upiId: item.upi_id,
            type: item.method,
            time: item.time,
            today: item.today,
            amount: item.money,
            remarks: item.remarks,
          };
        } else if (item.method === WITHDRAWAL_METHODS_MAP.USDT_ADDRESS) {
          return {
            id: item.id,
            orderId: item.id_order,
            phoneNumber: item.phone,
            status: item.status,
            mainNetwork: item.name_bank,
            usdtAddress: item.account_number,
            addressAlias: item.address_alias,
            type: item.method,
            time: item.time,
            today: item.today,
            amount: item.money,
            usdtAmount: item.usdt_amount,
            usdtRate: item.usdt_rate,
            remarks: item.remarks,
          };
        }
      })?.[0],
    };
  },
  async getWithdrawalList({ userPhoneNumber, status }) {
    let [withdrawalList] =
      status === undefined
        ? await connection.query(
          "SELECT * FROM withdraw WHERE `phone` = ? ORDER BY id DESC",
          [userPhoneNumber]
        )
        : userPhoneNumber
          ? await connection.query(
            "SELECT * FROM withdraw WHERE `phone` = ? AND `status` = ? ORDER BY id DESC",
            [userPhoneNumber, status]
          )
          : await connection.query(
            "SELECT * FROM withdraw WHERE `status` = ? ORDER BY id DESC",
            [status]
          );

    if (withdrawalList.length === 0) {
      return {
        isAvailable: false,
      };
    }

    return {
      isAvailable: true,
      withdrawalList: withdrawalList.map((item) => {
        if (item.method === WITHDRAWAL_METHODS_MAP.BANK_CARD || item.method === WITHDRAWAL_METHODS_MAP.UPI_ID) {
          return {
            id: item.id,
            orderId: item.id_order,
            phoneNumber: item.phone,
            status: item.status,
            bankName: item.name_bank,
            recipientName: item.name_user,
            bankAccountNumber: item.account_number,
            IFSC: item.ifsc,
            upiId: item.upi_id,
            type: item.method,
            time: item.time,
            today: item.today,
            amount: item.money,
            remarks: item.remarks,
          };
        } else if (item.method === WITHDRAWAL_METHODS_MAP.USDT_ADDRESS) {
          return {
            id: item.id,
            orderId: item.id_order,
            phoneNumber: item.phone,
            status: item.status,
            mainNetwork: item.name_bank,
            usdtAddress: item.account_number,
            addressAlias: item.address_alias,
            type: item.method,
            time: item.time,
            today: item.today,
            amount: item.money,
            usdtAmount: item.usdt_amount,
            usdtRate: item.usdt_rate,
            remarks: item.remarks,
          };
        }
      }),
    };
  },
  async createUSDTWithdrawalRequest({
    userPhoneNumber,
    mainNetwork,
    usdtAddress,
    addressAlias,
    amount,
    rawUsdt,
    rate,
  }) {
    let time = new Date().getTime();
    const type = WITHDRAWAL_METHODS_MAP.USDT_ADDRESS;

    await connection.query(
      "INSERT INTO withdraw SET id_order = ?, phone = ?, name_bank = ?, account_number = ?, address_alias = ?, method = ?, time = ?, today = ?, money = ?, usdt_amount = ?, usdt_rate = ?",
      [getOrderId(), userPhoneNumber, mainNetwork || '', usdtAddress || '', addressAlias || '', type, getCurrentTimeForTimeField(), getCurrentTimeForTodayField(), amount, rawUsdt || 0, rate || 0]
    );
  },
  async createBankCardWithdrawalRequest({
    userPhoneNumber,
    bankName,
    recipientName,
    bankAccountNumber,
    IFSC,
    upiId,
    amount,
    method,
  }) {
    let time = new Date().getTime(); //phoneNumber
    const type = method || WITHDRAWAL_METHODS_MAP.BANK_CARD;

    await connection.query(
      "INSERT INTO withdraw SET id_order = ?, phone = ?, name_bank = ?, name_user = ?, account_number = ?, ifsc = ?, upi_id = ?, method = ?, time = ?, today = ?, money = ?",
      [getOrderId(), userPhoneNumber, bankName || '', recipientName || '', bankAccountNumber || '', IFSC || '', upiId || '', type, getCurrentTimeForTimeField(), getCurrentTimeForTodayField(), amount]
    );
  },
  async changeWithdrawalStatus({ status, id }) {
    await connection.query(
      `UPDATE users SET status = '${status}' WHERE id = ${id}`,
    );
  },
};

const gamesDB = {
  async getTotalBettingAmount({ userPhoneNumber }) {
    const stats = await userStatsHelper.getBettingStats(userPhoneNumber);
    return stats.totalAmount;
  },
};

const depositDB = {
  async getTotalDeposit({ userPhoneNumber }) {
    const [deposit] = await connection.query(
      "SELECT SUM(money) as totalDepositAmount FROM recharge WHERE phone = ? AND status = 1",
      [userPhoneNumber],
    );
    const totalDepositAmount = deposit[0].totalDepositAmount;

    return totalDepositAmount;
  },
};

const getWithdrawalConfigs = async (req, res) => {
  try {
    const [withdrawConfigs] = await connection.query("SELECT method_name, min_amount, max_amount, status FROM withdrawal_configs");
    const [adminConfig] = await connection.query("SELECT currency_symbol FROM admin_ac LIMIT 1");
    
    let dailyWithdrawCount = 0;
    let flowVariables = {};
    let auth = req.cookies.auth;
    if (auth) {
        const [users] = await connection.query("SELECT phone FROM users WHERE token = ?", [auth]);
        if (users.length > 0) {
            const phone = users[0].phone;
            
            // Get decision and full context from the workflow engine
            const decision = await withdrawalWorkflow.getWithdrawalDecision(phone, 0);
            flowVariables = {
                ...decision.variables,
                requirements: decision.requirements || []
            };
            dailyWithdrawCount = flowVariables.wd_today || 0;
        }
    }

    return res.status(200).json({
      status: true,
      withdrawalConfigs: withdrawConfigs,
      dailyWithdrawCount: dailyWithdrawCount,
      flowVariables: flowVariables,
      currency_symbol: adminConfig[0]?.currency_symbol || '₹'
    });
  } catch (error) {
    console.error("getWithdrawalConfigs error:", error);
    return res.status(500).json({ message: "Server error", status: false });
  }
};

const withdrawalController = {
  addBankCard,
  addUpi,
  getBankCardInfo,
  getUPIIDInfo,
  addUSDTAddress,
  getUSDTAddressInfo,
  createWithdrawalRequest,
  listWithdrawalRequests,
  listWithdrawalHistory,
  approveOrDenyWithdrawalRequest,
  addBankCardPage,
  addUpiPage,
  addUSDTAddressPage,
  selectBankPage,
  getWithdrawalConfigs
};

export default withdrawalController;
