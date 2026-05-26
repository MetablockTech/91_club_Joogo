import connection from "../config/connectDB.js";
import axios from "axios";
import moment from "moment";
import querystring from "querystring";
import crypto from "crypto";
import { generateClaimRewardID, getBonuses } from "../helpers/games.js";
import {
  REWARD_STATUS_TYPES_MAP,
  REWARD_TYPES_MAP,
} from "../constants/reward_types.js";
import AppError from "../errors/AppError.js";
import upay from "../helpers/upay.js";
import Joi from "joi";
import adminController from "./adminController.js";
import commissionController from "./commissionController.js";

let timeNow = new Date().getTime();

export const PaymentStatusMap = {
  PENDING: 0,
  SUCCESS: 1,
  CANCELLED: 2,
};

const PaymentMethodsMap = {
  UPI_GATEWAY: "upi_gateway",
  UPI_MANUAL: "upi_manual",
  USDT_MANUAL: "usdt_manual",
  WOW_PAY: "wow_pay",
  RS_PAY: "rs_pay",
  CLOUD_PAY: "cloud_pay",
  USDT: "usdt",
  UPAY: "upay",
  WATCHPAY: "watchpay",
  CCPAYMENT: "ccpayment",
  PAYOK: "payok",
};

const getPaymentConfig = async (gateway) => {
  const [rows] = await connection.query("SELECT * FROM payment_configs WHERE gateway_name = ? AND status = 1", [gateway]);
  return rows[0] || null;
};

const getAllPaymentConfigs = async () => {
  const [rows] = await connection.query("SELECT * FROM payment_configs WHERE status = 1");
  return rows;
};

// UPI Manual Payment Integration --------------
const initiateManualUPIPayment = async (req, res) => {
  const query = req.query;
  const config = await getPaymentConfig('upi_manual');

  const momo = {
    bank_name: "UPI",
    username: config?.app_id || "",
    upi_id: config?.app_secret || "",
    upi_id_qr: config?.qr_code || "",
  };

  return res.render("wallet/manual_payment.ejs", {
    Amount: query?.am,
    UpiId: momo.upi_id,
    upi_id_qr: momo?.upi_id_qr || "",
    instructions: config?.instructions || ""
  });
};

const addManualUPIPaymentRequest = async (req, res) => {
  try {
    const data = req.body;
    let auth = req.cookies.auth;
    let money = parseInt(data.money);
    let utr = data.utr;

    const config = await getPaymentConfig('upi_manual');
    const minimumMoneyAllowed = config ? config.min_recharge : 100;
    const maximumMoneyAllowed = config ? config.max_recharge : 1000000;

    if (!money || money < minimumMoneyAllowed || money > maximumMoneyAllowed) {
      return res.status(400).json({
        message: `Recharge amount must be between ${minimumMoneyAllowed} and ${maximumMoneyAllowed}`,
        status: false,
        timeStamp: timeNow,
      });
    }

    if (!utr || utr.length !== 12) {
      return res.status(400).json({
        message: `UPI Ref No. or UTR is Required And it should be 12 digit long`,
        status: false,
        timeStamp: timeNow,
      });
    }

    const [isUsedUtr] = await connection.query(
      "SELECT * FROM recharge WHERE utr = ? ",
      [utr],
    );
    if (isUsedUtr.length) {
      return res.status(400).json({
        message: `UPI Ref No. or UTR is already used`,
        status: false,
        timeStamp: timeNow,
      });
    }

    const user = await getUserDataByAuthToken(auth);

    const pendingRechargeList = await rechargeTable.getRecordByPhoneAndStatus({
      phone: user.phone,
      status: PaymentStatusMap.PENDING,
      type: PaymentMethodsMap.UPI_GATEWAY,
    });

    if (pendingRechargeList.length !== 0) {
      const deleteRechargeQueries = pendingRechargeList.map((recharge) => {
        return rechargeTable.cancelById(recharge.id);
      });

      await Promise.all(deleteRechargeQueries);
    }

    const orderId = getRechargeOrderId();

    const newRecharge = {
      orderId: orderId,
      transactionId: "NULL",
      utr: utr,
      userId: user.userId,
      phone: user.phone,
      money: money,
      type: PaymentMethodsMap.UPI_MANUAL,
      status: 0,
      today: rechargeTable.getCurrentTimeForTodayField(),
      url: "NULL",
      time: rechargeTable.getCurrentTimeForTimeField(),
    };

    const recharge = await rechargeTable.create(newRecharge);

    return res.status(200).json({
      message:
        "Payment Requested successfully Your Balance will update shortly!",
      recharge: recharge,
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.log("Manual UPI Error:", error);

    res.status(500).json({
      status: false,
      message: error.message || "Something went wrong!",
      timestamp: timeNow,
    });
  }
};
// --------------------------------------------

// USDT Manual Payment Integration ------------
const initiateManualUSDTPayment = async (req, res) => {
  const query = req.query;
  const config = await getPaymentConfig('usdt_manual');

  const momo = {
    bank_name: "USDT (BEP20)",
    username: config?.app_id || "",
    upi_id: config?.app_secret || "",
    usdt_wallet_address: config?.app_id || "",
    usdt_wallet_address_qr: config?.qr_code || "",
  };

  const [adminConfig] = await connection.query("SELECT usdt_exchange_rate, currency_symbol, currency_name FROM admin_ac LIMIT 1");
  const exchangeRate = adminConfig[0]?.usdt_exchange_rate || 92;
  const currencySymbol = adminConfig[0]?.currency_symbol || '₹';
  const currencyName = adminConfig[0]?.currency_name || 'INR';

  return res.render("wallet/usdt_manual_payment.ejs", {
    Amount: query?.am,
    UsdtWalletAddress: momo.usdt_wallet_address,
    usdt_wallet_address_qr: momo.usdt_wallet_address_qr,
    exchangeRate: exchangeRate,
    currencySymbol: currencySymbol,
    currencyName: currencyName,
    instructions: config?.instructions || ""
  });
};

const addManualUSDTPaymentRequest = async (req, res) => {
  try {
    const data = req.body;
    let auth = req.cookies.auth;
    let money_usdt = parseFloat(data.money);

    const [adminConfig] = await connection.query("SELECT usdt_exchange_rate FROM admin_ac LIMIT 1");
    const exchangeRate = adminConfig[0]?.usdt_exchange_rate || 92;

    const config = await getPaymentConfig('usdt_manual');
    const minimumMoneyAllowed = config ? config.min_recharge : 10;
    const maximumMoneyAllowed = config ? config.max_recharge : 100000;

    let money = money_usdt * exchangeRate;
    let utr = data.utr;

    if (!money_usdt || money_usdt < minimumMoneyAllowed || money_usdt > maximumMoneyAllowed) {
      return res.status(400).json({
        message: `Money is Required and it should be USDT ${minimumMoneyAllowed} - ${maximumMoneyAllowed}`,
        status: false,
        timeStamp: timeNow,
      });
    }

    if (!utr) {
      return res.status(400).json({
        message: `Ref No. or UTR is Required`,
        status: false,
        timeStamp: timeNow,
      });
    }

    const user = await getUserDataByAuthToken(auth);

    const pendingRechargeList = await rechargeTable.getRecordByPhoneAndStatus({
      phone: user.phone,
      status: PaymentStatusMap.PENDING,
      type: PaymentMethodsMap.UPI_GATEWAY,
    });

    if (pendingRechargeList.length !== 0) {
      const deleteRechargeQueries = pendingRechargeList.map((recharge) => {
        return rechargeTable.cancelById(recharge.id);
      });

      await Promise.all(deleteRechargeQueries);
    }

    const orderId = getRechargeOrderId();

    const newRecharge = {
      orderId: orderId,
      transactionId: "NULL",
      utr: utr,
      userId: user.userId,
      phone: user.phone,
      money: money,
      type: PaymentMethodsMap.USDT_MANUAL,
      status: 0,
      today: rechargeTable.getCurrentTimeForTodayField(),
      url: "NULL",
      time: rechargeTable.getCurrentTimeForTimeField(),
      usdt_amount: money_usdt,
      exchange_rate: exchangeRate,
    };

    const recharge = await rechargeTable.create(newRecharge);

    return res.status(200).json({
      message:
        "Payment Requested successfully Your Balance will update shortly!",
      recharge: recharge,
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      status: false,
      message: error.message || "Something went wrong!",
      timestamp: timeNow,
    });
  }
};
// --------------------------------------------

// UPI Gateway Payment Integration ------------
const initiateUPIPayment = async (req, res) => {
  const type = PaymentMethodsMap.UPI_GATEWAY;
  let auth = req.cookies.auth;
  let money = parseInt(req.body.money);
  const config = await getPaymentConfig('upi_gateway');
  const [adminConfig] = await connection.query("SELECT site_name, website_link FROM admin_ac LIMIT 1");
  const siteName = adminConfig[0]?.site_name || "Starworldz";
  const appBaseUrl = adminConfig[0]?.website_link || "https://starworldz.com";

  const minAllowed = config ? config.min_recharge : 100;
  const maxAllowed = config ? config.max_recharge : 1000000;

  if (!money || money < minAllowed || money > maxAllowed) {
    return res.status(400).json({
      message: `Recharge amount must be between ₹${minAllowed} and ₹${maxAllowed}`,
      status: false,
      timeStamp: timeNow,
    });
  }

  try {
    const user = await getUserDataByAuthToken(auth);

    const pendingRechargeList = await rechargeTable.getRecordByPhoneAndStatus({
      phone: user.phone,
      status: PaymentStatusMap.PENDING,
      type: PaymentMethodsMap.UPI_GATEWAY,
    });

    if (pendingRechargeList.length !== 0) {
      const deleteRechargeQueries = pendingRechargeList.map((recharge) => {
        return rechargeTable.cancelById(recharge.id);
      });

      await Promise.all(deleteRechargeQueries);
    }

    const orderId = getRechargeOrderId();

    const ekqrResponse = await axios.post(
      "https://api.ekqr.in/api/create_order",
      {
        key: config?.app_secret || '',
        client_txn_id: orderId,
        amount: String(money),
        p_info: "WINGO PAYMENT",
        customer_name: user.username || "User",
        customer_email: user.email || "user@example.com",
        customer_mobile: user.phone,
        redirect_url: config?.return_url || `${appBaseUrl}/wallet/verify/upi`,
        udf1: siteName,
      },
    );

    const ekqrData = ekqrResponse?.data;

    if (ekqrData === undefined || ekqrData.status === false) {
      throw Error(ekqrData?.msg || ekqrData?.message || "Payment Service: Gateway error from ekqr!");
    }

    const newRecharge = {
      orderId: orderId,
      transactionId: ekqrData.data.order_id || "NULL",
      userId: user.userId,
      utr: 0,
      phone: user.phone,
      money: money,
      type: type,
      status: PaymentStatusMap.PENDING,
      today: rechargeTable.getCurrentTimeForTodayField(),
      url: ekqrData.data.payment_url,
      time: rechargeTable.getCurrentTimeForTimeField(),
    };

    const recharge = await rechargeTable.create(newRecharge);

    console.log(ekqrData);

    return res.status(200).json({
      message: "Payment Initiated successfully",
      recharge: recharge,
      urls: {
        web_url: ekqrData.data?.payment_url,
        bhim_link: ekqrData.data?.upi_intent?.bhim_link || "",
        phonepe_link: ekqrData.data?.upi_intent?.phonepe_link || "",
        paytm_link: ekqrData.data?.upi_intent?.paytm_link || "",
        gpay_link: ekqrData.data?.upi_intent?.gpay_link || "",
      },
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      status: false,
      message: error.message || "Something went wrong!",
      timestamp: timeNow,
    });
  }
};

const verifyUPIPayment = async (req, res) => {
  const type = PaymentMethodsMap.UPI_GATEWAY;
  let auth = req.cookies.auth;
  let orderId = req.query.client_txn_id;

  if (!auth || !orderId) {
    return res.status(400).json({
      message: `orderId is Required!`,
      status: false,
      timeStamp: timeNow,
    });
  }
  try {
    const user = await getUserDataByAuthToken(auth);

    const recharge = await rechargeTable.getRechargeByOrderId({ orderId });

    if (!recharge) {
      return res.status(400).json({
        message: `Unable to find recharge with this order id!`,
        status: false,
        timeStamp: timeNow,
      });
    }

    const config = await getPaymentConfig('upi_gateway');

    const ekqrResponse = await axios.post(
      "https://api.ekqr.in/api/check_order_status",
      {
        key: config?.app_secret || '',
        client_txn_id: orderId,
        txn_date: rechargeTable.getDMYDateOfTodayFiled(recharge.today),
      },
    );

    const ekqrData = ekqrResponse?.data;
    console.log("UPI Verification Data:", ekqrData);

    if (ekqrData === undefined || ekqrData.status === false) {
      throw Error("Gateway error from ekqr!");
    }

    if (ekqrData.data.status === "created") {
      return res.status(200).json({
        message: "Your payment request is just created",
        status: false,
        timeStamp: timeNow,
      });
    }

    if (ekqrData.data.status === "scanning") {
      return res.status(200).json({
        message: "Waiting for confirmation",
        status: false,
        timeStamp: timeNow,
      });
    }

    if (ekqrData.data.status === "success") {
      if (
        recharge.status === PaymentStatusMap.PENDING ||
        recharge.status === PaymentStatusMap.CANCELLED
      ) {
        await rechargeTable.setStatusToSuccessByIdAndOrderId({
          id: recharge.id,
          orderId: recharge.orderId,
        });

        await addUserAccountBalance({
          phone: user.phone,
          money: recharge.money,
          code: user.code,
          invite: user.invite,
          rechargeId: recharge.id,
        });
      }

      // return res.status(200).json({
      //     status: true,
      //     message: "Payment verified",
      //     timestamp: timeNow
      // })
      return res.redirect("/wallet/rechargerecord");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: error.message || "Something went wrong!",
      timestamp: timeNow,
    });
  }
};

const upiGatewayWebhook = async (req, res) => {
  const type = PaymentMethodsMap.UPI_GATEWAY;
  let orderId = req.body.client_txn_id || req.query.client_txn_id;
  console.log("UPI Webhook Received for Order:", orderId, "Body:", req.body);

  if (!orderId) {
    return res.status(400).send("client_txn_id is Required!");
  }

  try {
    const recharge = await rechargeTable.getRechargeByOrderId({ orderId });

    if (!recharge) {
      console.log(`Webhook Error: Order ${orderId} not found`);
      return res.status(400).send("Order not found");
    }

    if (recharge.status === PaymentStatusMap.SUCCESS) {
      return res.status(200).send("Order already processed");
    }

    const config = await getPaymentConfig('upi_gateway');

    const ekqrResponse = await axios.post(
      "https://api.ekqr.in/api/check_order_status",
      {
        key: config?.app_secret || '',
        client_txn_id: orderId,
        txn_date: rechargeTable.getDMYDateOfTodayFiled(recharge.today),
      },
    );

    const ekqrData = ekqrResponse?.data;

    if (ekqrData === undefined || ekqrData.status === false) {
      return res.status(400).send("Gateway error");
    }

    if (ekqrData.data.status === "success") {
      const user = await getUserDataByPhoneNumber(recharge.phone);

      await rechargeTable.setStatusToSuccessByIdAndOrderId({
        id: recharge.id,
        orderId: recharge.orderId,
      });

      await addUserAccountBalance({
        phone: user.phone,
        money: recharge.money,
        code: user.code,
        invite: user.invite,
        rechargeId: recharge.id,
      });

      console.log(`Webhook Success: Order ${orderId} confirmed for ${recharge.phone}`);
      return res.status(200).send("success");
    }

    return res.status(200).send("Pending");
  } catch (error) {
    console.log("UPI Webhook Error:", error);
    res.status(500).send("Internal Error");
  }
};
// --------------------------------------------

function generateOrderNumber(phone) {
  let randomNumber = Math.floor(Math.random() * (9999999999 - 1000000000 + 1)) + 1000000000;
  return 'LG' + 'xx' + phone + 'xx' + randomNumber
}

//Lg pau / WOW PAY Payment Integration --------------- Deprecated
const initiateWowPayPayment = async (req, res) => {
  const type = PaymentMethodsMap.WOW_PAY;
  let auth = req.cookies.auth;
  let money = parseInt(req.body.money || req.query.money);

  const config = await getPaymentConfig('wowpay');
  const minAllowed = config ? config.min_recharge : parseInt(process.env.MINIMUM_MONEY_INR);
  const maxAllowed = config ? config.max_recharge : 1000000;

  if (!money || money < minAllowed || money > maxAllowed) {
    return res.status(400).json({
      message: `Recharge amount must be between ₹${minAllowed} and ₹${maxAllowed}`,
      status: false,
      timeStamp: timeNow,
    });
  }

  try {
    const user = await getUserDataByAuthToken(auth);

    const pendingRechargeList = await rechargeTable.getRecordByPhoneAndStatus({
      phone: user.phone,
      status: PaymentStatusMap.PENDING,
      type: PaymentMethodsMap.UPI_GATEWAY,
    });

    if (pendingRechargeList.length !== 0) {
      const deleteRechargeQueries = pendingRechargeList.map((recharge) => {
        return rechargeTable.cancelById(recharge.id);
      });

      await Promise.all(deleteRechargeQueries);
    }

    // const orderId = generateOrderNumber(user.phone);
    const orderId = getRechargeOrderId()
    const config = await getPaymentConfig('wowpay');
    if (!config) throw Error("WowPay configuration not found");

    const merchantId = config.app_id;
    const merchantKey = config.app_secret;

    const [adminConfig] = await connection.query("SELECT website_link FROM admin_ac LIMIT 1");
    const appBaseUrl = adminConfig[0]?.website_link || "https://starworldz.com";

    const params = {
      app_id: merchantId,
      order_sn: orderId,
      trade_type: "INRUPI",
      money: Number(money) * 100,
      notify_url: config?.return_url || `${appBaseUrl}/wallet/verify/wowpay`,
      remark: user.phone,
    };

    params.sign = lgpay.generateSign(params, merchantKey);

    console.log(params);

    const response = await axios({
      method: "post",
      url: "https://www.lg-pay.com/api/order/create",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: querystring.stringify(params),
    });

    const responseData = response?.data;
    if (responseData && responseData.code == 0) {
      const newRechargeParams = {
        orderId: orderId,
        transactionId: orderId,
        utr: 0,
        userId: user.userId,
        phone: user.phone,
        money: Number(money),
        type: type,
        status: PaymentStatusMap.PENDING,
        today: rechargeTable.getCurrentTimeForTodayField(),
        url: responseData.data.pay_url,
        time: rechargeTable.getCurrentTimeForTimeField(),
      };

      await rechargeTable.create(newRechargeParams);

      return res.status(200).json({
        message: "Payment requested Successfully",
        urls: {
          web_url: response.data.data.pay_url
        },
        payment_url: response.data.data.pay_url,
        status: true,
        timeStamp: timeNow,
      });
    } else {
      throw Error(response.data.msg || "Payment Service: Gateway error from WowPay!");
    }

    return res.status(400).json({
      message: "Payment request failed. Please try again Or Wrong Details.",
      status: false,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Something went wrong!",
      timeStamp: timeNow,
    });
  }
};

// const verifyWowPayPayment = async (req, res) => {
//   try {
//       const type = PaymentMethodsMap.WOW_PAY
//       const data = req.body;

//       console.log(data)


//       if (!data.status) {
//           return res.status(400).json({
//                           message: "Payment Failed",
//                           status: false,
//                           timeStamp: timeNow,
//                       })
//         }

//         // Extract values from query parameters
//      // Validate required fields
//       if (!data.order_sn || !data.money ) {
//           return res.status(400).json({
//               message: "Invalid request parameters",
//               status: false,
//               timeStamp: timeNow,
//           });
//       }

//       // Extract phone number from out_trade_no
//           let phone = null;
//           if (data.order_sn.includes('xx')) {
//               const parts = data.order_sn.split('xx');
//               if (parts.length >= 3) {
//                   // Extract the part that is supposed to be the phone number
//                   const potentialPhone = parts[1];
//                   // Ensure it's a 10-digit number
//                   if (/^\d{10}$/.test(potentialPhone)) {
//                       phone = potentialPhone;
//                   }
//               }
//           }

//           // Validate phone number
//           if (!phone) {
//               return res.status(400).json({
//                   message: "Invalid phone number",
//                   status: false,
//                   timeStamp: timeNow,
//               });
//           }

//       const newRechargeParams = {
//           orderId: data.order_sn,
//           transactionId: 'NULL',
//           utr: null,
//           phone: phone,
//           money: Number(data.money) / 100,
//           type: type,
//           status: PaymentStatusMap.SUCCESS,
//           today: rechargeTable.getCurrentTimeForTodayField(),
//           url: 'NULL',
//           time: timeNow,
//       }

//       const [recharge] = await connection.query('SELECT * FROM recharge WHERE id_order = ?', newRechargeParams.orderId);

//       if (recharge.length != 0) {
//           return res.redirect("/wallet/rechargerecord")
//           // return res.status(200).json({status: false, message: "Duplicate order request", data: recharge})
//       }

//       const newRecharge = await rechargeTable.create(newRechargeParams)

//       let [user] =  await connection.query('SELECT `phone`, `code`,`name_user`,`invite` FROM users WHERE `phone` = ? ', [phone]);


//       await addUserAccountBalance({
//           phone: user[0].phone,
//           money: Number(data.money) / 100,
//           code: user[0].code,
//           invite: user[0].invite,
//       })

//       // return res.status(200).json(newRecharge)

//       return res.redirect("/wallet/rechargerecord")
//   } catch (error) {
//       console.log(error)
//       console.log({
//           status: false,
//           message: error.message || "Something went wrong!",
//           timestamp: timeNow
//       })
//       return res.status(500).json({
//           status: false,
//           message: error.message || "Something went wrong!",
//           timestamp: timeNow
//       })
//   }
// }

// -------------------------------------------- Deprecated

// RS PAY Payment integration ---------------
const RS_PAY_PAYMENT_STATE = {
  SUCCESS: 1,
  PROCESSING: 2,
  FAILED: 3,
  PARTIALLY_SUCCESS: 4,
};

const verifyWowPayPayment = async (req, res) => {
  try {

    // const type = PaymentMethodsMap.RS_PAY;
    let data = req.body;


    // 0|rkwin  | data {
    //   0|rkwin  |   order_sn: '2025011062492219549011',
    //   0|rkwin  |   money: '30000',
    //   0|rkwin  |   pay_time: '2025-01-10 23:38:12',
    //   0|rkwin  |   status: '1',
    //   0|rkwin  |   msg: '手动回调, 请人工确认交易真实性',
    //   0|rkwin  |   remark: '7324821534',
    //   0|rkwin  |   sign: 'D860AF272D1ABD9F3E2D0E963F5F99FB'
    //   0|rkwin  | }

    console.log("data", data)
    const config = await getPaymentConfig('wowpay');
    const merchantId = config?.app_id;
    const merchantKey = config?.app_secret;
    const merchantOrderId = data?.order_sn;
    const orderId = data?.order_sn;
    const state = data?.status;
    const amount = (data?.money) / 100;
    const factAmount = (data?.money) / 100;
    const sign = data?.sign;

    if (
      !merchantId ||
      !merchantOrderId ||
      !orderId ||
      !state ||
      !amount ||
      !factAmount ||
      !sign
    ) {
      return res.status(400).send("Invalid Request!");
    }

    // if (merchantId !== process.env.WOWPAY_MERCHANT_KEY) {
    //   return res.status(401).send("failed");
    // }

    const recharge = await rechargeTable.getRechargeByOrderId({
      orderId: merchantOrderId,
    });

    if (!recharge) {
      console.log({
        message: `Not able to find Requested Recharge for lgpay verification!`,
        timeStamp: timeNow,
      });
      return res.status(400).send("failed");
    }

    if (recharge?.status == 1) {
      console.log("recharge", recharge)
      console.log("Rechnage already done")
      return res.redirect("/wallet/rechargerecord")
    }

    if (parseInt(state) === RS_PAY_PAYMENT_STATE.SUCCESS) {
      const user = await getUserDataByPhoneNumber(recharge.phone);

      await rechargeTable.setStatusToSuccessByIdAndOrderId({
        id: recharge.id,
        orderId: recharge.orderId,
        utr: 0,
      });

      await addUserAccountBalance({
        phone: user.phone,
        money: recharge.money,
        code: user.code,
        invite: user.invite,
        rechargeId: recharge.id,
      });

      return res.redirect("/wallet/rechargerecord")
      // return res.status(200).send("success");
    } else if (parseInt(state) === RS_PAY_PAYMENT_STATE.PROCESSING) {
      return res.status(200).send("processing");
    } else if (parseInt(state) === RS_PAY_PAYMENT_STATE.FAILED) {
      await rechargeTable.cancelById(recharge.id);
      return res.status(200).send("failed");
    } else if (parseInt(state) === RS_PAY_PAYMENT_STATE.PARTIALLY_SUCCESS) {
      await rechargeTable.cancelById(recharge.id);
      return res.status(200).send("partially success");
    }

    return res.status(200).send("failed");
  } catch (error) {
    console.log(error);
    return res.status(500).send("failed");
  }
};

const initiateUpayPayment = async (req, res) => {
  try {
    const type = PaymentMethodsMap.UPAY;
    let auth = req.cookies.auth;
    let money = parseInt(req.body.money || req.query.am);

    const config = await getPaymentConfig('upay');
    const minAllowed = config ? config.min_recharge : parseInt(process.env.MINIMUM_MONEY_INR);
    const maxAllowed = config ? config.max_recharge : 1000000;

    if (!money || money < minAllowed || money > maxAllowed) {
      return res.status(400).json({
        message: `Recharge amount must be between ₹${minAllowed} and ₹${maxAllowed}`,
        status: false,
        timeStamp: timeNow,
      });
    }

    const user = await getUserDataByAuthToken(auth);

    let phone = user.phone;

    const [adminConfig] = await connection.query("SELECT website_link, usdt_exchange_rate FROM admin_ac LIMIT 1");
    const appBaseUrl = adminConfig[0]?.website_link || "https://starworldz.com";

    const amount = Number(req.query.am);

    let data = {
      appId: APP_ID,
      merchantOrderNo: getRechargeOrderId(),
      chainType: "1",
      fiatAmount: String(amount),
      fiatCurrency: "USD",
      notifyUrl: config?.return_url || `${appBaseUrl}/wallet/verify/upay`,
    };

    const signature = upay.generateSignature(data, APP_SECRET);

    const response = await axios({
      url: `${API_URL}/v1/api/open/order/apply`,
      method: "POST",
      data: {
        ...data,
        attach: phone,
        productName: "Gaming",
        redirectUrl: `${appBaseUrl}/wallet/rechargerecord`,
        signature,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(response.data);
    const main = response.data.data;

    const newRechargeParams = {
      orderId: main.merchantOrderNo,
      transactionId: main.orderNo,
      utr: 0,
      userId: user.userId,
      phone: phone,
      money: amount * Number(adminConfig[0]?.usdt_exchange_rate || 92),
      type: type,
      status: PaymentStatusMap.PENDING,
      today: rechargeTable.getCurrentTimeForTodayField(),
      url: "",
      time: rechargeTable.getCurrentTimeForTimeField(),
    };

    await rechargeTable.create(newRechargeParams);

    return res.status(200).redirect(response.data.data.payUrl);
  } catch (error) {
    console.log(error);
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const verifyUpayPayment = async (req, res) => {
  try {
    const type = PaymentMethodsMap.UPAY;
    let data = req.body;

    const appId = data?.appId;
    const orderNo = data?.orderNo;
    const merchantOrderNo = data?.merchantOrderNo;
    const chainType = data?.chainType;
    const crypto = data?.crypto;
    const actualCrypto = data?.actualCrypto;
    const poundage = data?.poundage;
    const actualPoundage = data?.actualPoundage;
    const status = Number(data?.status);
    const createdAt = data?.createdAt;
    const completedAt = data?.completedAt;
    const attach = data?.attach;
    const signature = data?.signature;

    if (
      !appId ||
      !orderNo ||
      !merchantOrderNo ||
      !chainType ||
      !crypto ||
      !actualCrypto ||
      !poundage ||
      !actualPoundage ||
      !status ||
      !createdAt ||
      !completedAt ||
      !attach ||
      !signature
    ) {
      return res.status(400).send("Invalid Request!");
    }

    const config = await getPaymentConfig('upay');
    const APP_SECRET = config?.app_secret || process.env.UPAY_APP_SECRET;
    const envAppId = process.env.UPAY_APP_ID;

    if (appId !== (config?.app_id || envAppId)) {
      return res.status(401).send("failed");
    }

    const verifyParams = { ...data };
    delete verifyParams.signature;
    const calculatedSignature = upay.generateSignature(verifyParams, APP_SECRET);

    if (signature !== calculatedSignature) {
      console.log("Upay Signature Mismatch");
      return res.status(401).send("failed");
    }

    const recharge = await rechargeTable.getRechargeByOrderId({
      orderId: merchantOrderNo,
    });

    const user = await getUserDataByPhoneNumber(recharge.phone);

    if (!user) {
      console.log({
        message: `Unable to find this user for upay verification!`,
        timeStamp: timeNow,
      });
      return res.status(400).send("failed");
    }

    if (!recharge) {
      console.log({
        message: `Not able to find Requested Recharge for upay verification!`,
        timeStamp: timeNow,
      });
      return res.status(400).send("failed");
    }

    if (status === 0) {
      await rechargeTable.setRechargeStatusById({
        id: recharge.id,
        status: PaymentStatusMap.PENDING,
      });
      return res.status(200).send("processing");
    }

    if (status === 1) {
      await rechargeTable.setStatusToSuccessByIdAndOrderId({
        id: recharge.id,
        orderId: recharge.orderId,
      });


      await addUserAccountBalance({
        phone: user.phone,
        money: recharge.money,
        code: user.code,
        invite: user.invite,
        rechargeId: recharge.id,
      });

      return res.status(200).send("success");
    }

    if (status === 2) {
      await rechargeTable.setRechargeStatusById({
        id: recharge.id,
        status: PaymentStatusMap.CANCELLED,
      });

      return res.status(200).send("failed");
    }

    if (status === 3) {
      await rechargeTable.setRechargeStatusById({
        id: recharge.id,
        status: PaymentStatusMap.CANCELLED,
      });

      return res.status(200).send("failed");
    }

    return res.status(200).send("failed");
  } catch (error) {
    console.log(error);
    return res.status(500).send("failed");
  }
};

const initiateRspayPayment = async (req, res) => {
  const type = PaymentMethodsMap.RS_PAY;
  let auth = req.cookies.auth;
  let amount = parseInt(req.body.money || req.query.money);

  const config = await getPaymentConfig('rspay');
  const minAllowed = config ? config.min_recharge : parseInt(process.env.MINIMUM_MONEY_INR);
  const maxAllowed = config ? config.max_recharge : 1000000;

  if (!amount || amount < minAllowed || amount > maxAllowed) {
    return res.status(400).json({
      message: `Recharge amount must be between ₹${minAllowed} and ₹${maxAllowed}`,
      status: false,
      timeStamp: timeNow,
    });
  }

  try {
    const user = await getUserDataByAuthToken(auth);

    let phone = user.phone;
    const config = await getPaymentConfig('rspay');
    let merchantId = config?.app_id;
    let merchantKey = config?.app_secret;

    const orderId = getRechargeOrderId();

    const [adminConfig] = await connection.query("SELECT website_link FROM admin_ac LIMIT 1");
    const appBaseUrl = adminConfig[0]?.website_link || "https://starworldz.com";

    let params = {
      amount: amount.toFixed(2),
      ext: "test",
      merchantId: merchantId,
      merchantOrderId: orderId,
      notifyUrl: config?.return_url || `${appBaseUrl}/wallet/verify/rspay`,
      redirectUrl: config?.return_url || `${appBaseUrl}/wallet/rechargerecord`,
      paymentCurrency: "INR",
      type: 2,
      userName: phone,
    };
    params["sign"] = rspay.generateSign(params, merchantKey);

    const response = await axios({
      method: "POST",
      url: "https://api.rs-pay.cc/apii/in/createOrder",
      data: params,
      headers: {
        "content-type": "application/json",
      },
    });

    if (parseInt(response.data.status) === 200) {
      const data = response.data.data;

      const newRechargeParams = {
        orderId: data.merchantOrderId,
        transactionId: data.orderId,
        utr: 0,
        userId: user.userId,
        phone: phone,
        money: data.amount,
        type: type,
        status: PaymentStatusMap.PENDING,
        today: rechargeTable.getCurrentTimeForTodayField(),
        url: data.payUrl,
        time: rechargeTable.getCurrentTimeForTimeField(),
      };

      await rechargeTable.create(newRechargeParams);

      return res.status(200).json({
        message: "Payment requested Successfully",
        payment_url: data.payUrl,
        status: true,
        timeStamp: timeNow,
      });
    }

    console.log(response.data);
    return res
      .status(400)
      .json({
        status: false,
        message: response.data?.message || response.data?.msg || "Something went wrong! Please try again later.",
        timestamp: timeNow
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Something went wrong!",
      timestamp: timeNow,
    });
  }
};

const verifyRspayPayment = async (req, res) => {
  try {
    // const type = PaymentMethodsMap.RS_PAY;
    let data = req.body;

    const merchantId = data?.merchantId;
    const merchantOrderId = data?.merchantOrderId;
    const orderId = data?.orderId;
    const state = data?.state;
    const amount = data?.amount;
    const factAmount = data?.factAmount;
    const ext = data?.ext;
    const utr = data?.utr;
    const sign = data?.sign;

    if (
      !merchantId ||
      !merchantOrderId ||
      !orderId ||
      !state ||
      !amount ||
      !factAmount ||
      !ext ||
      !utr ||
      !sign
    ) {
      return res.status(400).send("Invalid Request!");
    }

    if (merchantId) {
      const config = await getPaymentConfig('rspay');
      const envId = process.env.RSPAY_MERCHANT_ID;
      if (merchantId !== (config?.app_id || envId)) {
        return res.status(401).send("failed");
      }
    }

    const recharge = await rechargeTable.getRechargeByOrderId({
      orderId: merchantOrderId,
    });

    if (!recharge) {
      console.log({
        message: `Not able to find Requested Recharge for rspay verification!`,
        timeStamp: timeNow,
      });
      return res.status(400).send("failed");
    }

    if (recharge?.status == 1) {
      console.log("recharge", recharge)
      console.log("Rechnage already done")
      return res.redirect("/wallet/rechargerecord")
    }

    if (parseInt(state) === RS_PAY_PAYMENT_STATE.SUCCESS) {
      const user = await getUserDataByPhoneNumber(recharge.phone);

      await rechargeTable.setStatusToSuccessByIdAndOrderId({
        id: recharge.id,
        orderId: recharge.orderId,
        utr: utr,
      });

      await addUserAccountBalance({
        phone: user.phone,
        money: recharge.money,
        code: user.code,
        invite: user.invite,
        rechargeId: recharge.id,
      });

      return res.status(200).send("success");
    } else if (parseInt(state) === RS_PAY_PAYMENT_STATE.PROCESSING) {
      return res.status(200).send("processing");
    } else if (parseInt(state) === RS_PAY_PAYMENT_STATE.FAILED) {
      await rechargeTable.cancelById(recharge.id);
      return res.status(200).send("failed");
    } else if (parseInt(state) === RS_PAY_PAYMENT_STATE.PARTIALLY_SUCCESS) {
      await rechargeTable.cancelById(recharge.id);
      return res.status(200).send("partially success");
    }

    return res.status(200).send("failed");
  } catch (error) {
    console.log(error);
    return res.status(500).send("failed");
  }
};

const initiateCloudPayPayment = async (req, res) => {
  const type = PaymentMethodsMap.CLOUD_PAY;
  let auth = req.cookies.auth;
  let amount = parseInt(req.body.money || req.query.money);

  const config = await getPaymentConfig('cloudpay');
  const minAllowed = config ? config.min_recharge : parseInt(process.env.MINIMUM_MONEY_INR);
  const maxAllowed = config ? config.max_recharge : 1000000;

  if (!amount || amount < minAllowed || amount > maxAllowed) {
    return res.status(400).json({
      message: `Recharge amount must be between ₹${minAllowed} and ₹${maxAllowed}`,
      status: false,
      timeStamp: timeNow,
    });
  }

  try {
    const user = await getUserDataByAuthToken(auth);

    let phone = user.phone;
    const config = await getPaymentConfig('cloudpay');
    let merchantId = config?.app_id || "1000000";
    let merchantKey = config?.app_secret || "MIICcwIBADANBgkqhkiG9w0BAQEFAASCAl0wggJZAgEAAoGBALL9kO/hgxZaQyZsve+9o+oXS7rNlxoAKsciOuHNtOunFp0a0jp/a/6OcFwsmqSy1NnBCgRgKY6Xc0iXhlMrU DY6fN0wNw3i+0A5AVqM2G7CJ44uh4ieh2e5mxxZG/iSUJc8jxsjp9k5+Z4wbHiaRg71KHbifuwhfi6D3tbPg6QDAgMBAAECf2id31tfam6Ju6xt9YyvhAJ+WOGBD/+dupKDzh +VEsGzWXFdpC1wX5vR3iZgqVfmSwc0UejnezzAPzlLHmdFSH9afTyppwQkPh1mUT8vEPgGMgXvccNizwV0T6uIx+GZTnSxa1NZFAt0UrmXXN4e3XZ4uerH6KFzCwRhUcaVcUE CQQDy63TvEyzMO/CHEhdgqvMMZAd8udyQb+bhV5+ZHHZnncTbUvqGjOHhzcTEgzVNta55iY0y114Pcp4MFA+k4rqXAkEAvKDfUDhz0Uxu2X8DAxZo/SZsXSt2jBl3xucTkp3p DtAhVcoJP+ZFQsH5YLw/fnJroTDAM1/RMklfRMbWCHsrdQJAGD2+8YysT8U7f38irhbhIj9pL90sUY2ZMKuZ1aGtfzGTT3+8WGj+sZXjKOkfDJ4wxxge6w/q5we9Fd96oC2wC QJAJ+i5ltV626uaQHY5Auw45ma8wrGxcU7qIrE9WOYEK1gp1WbbsiNcQBWeV7M8k9pNn1sbL0N0lXkkqP6QxlaZCQJAGcbWUN0Db4JoabIWRuC5ZIELnW1N+28COMmQjSlyvM 1JtJlcrbXsD/4zlRnDIgAHm+y/tZ0J3srvzCGL7jqM4w==";

    const orderId = getRechargeOrderId();

    const [adminConfig] = await connection.query("SELECT website_link FROM admin_ac LIMIT 1");
    const appBaseUrl = adminConfig[0]?.website_link || "https://starworldz.com";

    let params = {
      order_amount: amount.toFixed(2),
      pay_type_code: "11002",
      mer_no: merchantId,
      order_no: orderId,
      return_url: config?.return_url || `${appBaseUrl}/wallet/verify/cloudpay`,
      page_url: config?.return_url || `${appBaseUrl}/wallet/rechargerecord`,
      currency: "INR",
      pay_name: "xiaoming",
      pay_email: "xiaoming@email.com",
      pay_phone: "1234567890",
    };
    params["sign"] = cloudPay.generateSign(params, merchantKey);

    console.log(params)

    const response = await axios({
      method: "POST",
      url: "https://www.clouds-pay.com/open/api/receive-money",
      data: params,
      headers: {
        "content-type": "application/json",
      },
    });

    if (parseInt(response.data.status) === 200) {
      const data = response.data.data;

      const newRechargeParams = {
        orderId: data.order_no,
        transactionId: data.order_no,
        utr: 0,
        userId: user.userId,
        phone: phone,
        money: data.order_amount,
        type: type,
        status: PaymentStatusMap.PENDING,
        today: rechargeTable.getCurrentTimeForTodayField(),
        url: data.return_url,
        time: rechargeTable.getCurrentTimeForTimeField(),
      };

      await rechargeTable.create(newRechargeParams);

      return res.status(200).json({
        message: "Payment requested Successfully",
        payment_url: data.return_url,
        status: true,
        timeStamp: timeNow,
      });
    }

    console.log(response.data);
    return res
      .status(400)
      .json({
        status: false,
        message: response.data?.message || response.data?.msg || "Something went wrong! Please try again later.",
        timestamp: timeNow
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Something went wrong!",
      timestamp: timeNow,
    });
  }
};

const verifyCloudPayPayment = async (req, res) => {
  try {
    // const type = PaymentMethodsMap.RS_PAY;
    let data = req.body;

    const merchantId = data?.mer_no;
    const merchantOrderId = data?.order_no;
    const orderId = data?.order_no;
    const state = data?.status;
    const amount = data?.order_amount;
    const factAmount = data?.order_amount;
    const ext = data?.order_data;
    const utr = data?.utr || 0;
    const sign = data?.sign;

    if (
      !merchantId ||
      !merchantOrderId ||
      !orderId ||
      !state ||
      !amount ||
      !factAmount ||
      !ext ||
      !utr ||
      !sign
    ) {
      return res.status(400).send("Invalid Request!");
    }

    if (merchantId) {
      const config = await getPaymentConfig('cloudpay');
      const envId = "1000000";
      if (merchantId !== (config?.app_id || envId)) {
        return res.status(401).send("failed");
      }
    }

    const recharge = await rechargeTable.getRechargeByOrderId({
      orderId: merchantOrderId,
    });

    if (!recharge) {
      console.log({
        message: `Not able to find Requested Recharge for rspay verification!`,
        timeStamp: timeNow,
      });
      return res.status(400).send("failed");
    }

    if (recharge?.status == 1) {
      console.log("recharge", recharge)
      console.log("Rechnage already done")
      return res.redirect("/wallet/rechargerecord")
    }

    if (parseInt(state) === RS_PAY_PAYMENT_STATE.SUCCESS) {
      const user = await getUserDataByPhoneNumber(recharge.phone);

      await rechargeTable.setStatusToSuccessByIdAndOrderId({
        id: recharge.id,
        orderId: recharge.orderId,
        utr: utr,
      });

      await addUserAccountBalance({
        phone: user.phone,
        money: recharge.money,
        code: user.code,
        invite: user.invite,
        rechargeId: recharge.id,
      });

      return res.status(200).send("success");
    } else if (parseInt(state) === RS_PAY_PAYMENT_STATE.PROCESSING) {
      return res.status(200).send("processing");
    } else if (parseInt(state) === RS_PAY_PAYMENT_STATE.FAILED) {
      await rechargeTable.cancelById(recharge.id);
      return res.status(200).send("failed");
    } else if (parseInt(state) === RS_PAY_PAYMENT_STATE.PARTIALLY_SUCCESS) {
      await rechargeTable.cancelById(recharge.id);
      return res.status(200).send("partially success");
    }

    return res.status(200).send("failed");
  } catch (error) {
    console.log(error);
    return res.status(500).send("failed");
  }
};
// --------------------------------------------

// Browse Recharge Record ---------------------
const browseRechargeRecord = async (req, res) => {
  try {
    let auth = req.cookies.auth;

    if (!auth) {
      return res.status(200).json({
        message: "Unauthorized",
        status: false,
        timeStamp: timeNow,
      });
    }

    const [recharge] = await connection.query(
      `SELECT * FROM recharge WHERE status = 0 AND (type = '${PaymentMethodsMap.UPI_MANUAL}' OR type = '${PaymentMethodsMap.USDT_MANUAL}')`,
      [],
    );

    return res.status(200).json({
      message: "Success",
      status: true,
      list: recharge,
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
// --------------------------------------------

//out money rs pay-------------

const initiateRspayOutPayment = async (req, res) => {

  // let auth = req.cookies.auth;

  let amount = parseInt(req.query.money);


  try {
    // const user = await getUserDataByAuthToken(auth);

    let merchantId = config?.app_id;
    let merchantKey = config?.app_secret;

    const orderId = getRechargeOrderId();

    //   {
    //     "accountName": "ttp",
    //     "accountNumber": "10093679317",
    //     "amount": 100,
    //     "ext": "payment",
    //     "ifscCode": "IDFB0042761",
    //     "merchantId": "MerchantTest01",
    //     "merchantOrderId": "1669885901065",
    //     "notifyUrl": "http://192.168.1.1/payment/callback",
    //     "sign": "330089de5c172dee96e21def150b9209ee2ef611737e3e57bd91d633ce07e4b7",
    //     "type": 1
    // }

    const [adminConfig] = await connection.query("SELECT website_link FROM admin_ac LIMIT 1");
    const appBaseUrl = adminConfig[0]?.website_link || "https://starworldz.com";

    let params = {
      accountName: req.body.accountName,
      accountNumber: req.body.accountNumber,
      amount: amount.toFixed(2),
      ext: "payment",
      ifscCode: req.body.ifscCode,
      merchantId: merchantId,
      merchantOrderId: orderId,
      notifyUrl: `${appBaseUrl}/`,
      redirectUrl: `${appBaseUrl}/`,
      type: 1,
      paymentCurrency: "INR"
    };
    params["sign"] = rspay.generateSign(params, merchantKey);

    console.log("params", params)

    const response = await axios({
      method: "POST",
      url: "https://api.rs-pay.cc/apii/out/createOrder",
      data: params,
      headers: {
        "content-type": "application/json",
      },
    });

    if (parseInt(response.data.status) === 200) {
      const data = response.data.data;
      console.log(data)
      return res.status(200).json({
        message: "Payment requested Successfully",
        data: data,
        status: true,
        timeStamp: timeNow,
      });
    }

    console.log(response.data);
    return res
      .status(400)
      .json({
        status: false,
        message: response.data?.message || response.data?.msg || "Something went wrong! Please try again later.",
        timestamp: timeNow
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Something went wrong!",
      timestamp: timeNow,
    });
  }
};

// Set Recharge Status ------------------------
const setRechargeStatus = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    let data = {
      id: parseInt(req.body.id),
      status: parseInt(req.body.status),
    };

    if (!auth) {
      return res.status(401).json({
        message: "Unauthorized",
        status: false,
        timeStamp: timeNow,
      });
    }

    if (!data.id || !data.status) {
      return res.status(400).json({
        message: "Invalid Request",
        status: false,
        timeStamp: timeNow,
      });
    }

    const recharge = await rechargeTable.getRechargeById({ id: data.id });

    if (recharge === null) {
      return res.status(400).json({
        message: "Recharge not found!",
        status: false,
        timeStamp: timeNow,
      });
    }

    if (
      recharge.status === PaymentStatusMap.SUCCESS &&
      data.status === PaymentStatusMap.SUCCESS
    ) {
      return res.status(400).json({
        message: "Recharge already verified!",
        status: false,
        timeStamp: timeNow,
      });
    }

    if (
      recharge.status === PaymentStatusMap.CANCELLED &&
      data.status === PaymentStatusMap.CANCELLED
    ) {
      return res.status(400).json({
        message: "Recharge already cancelled!",
        status: false,
        timeStamp: timeNow,
      });
    }

    if (
      [
        PaymentStatusMap.SUCCESS,
        PaymentStatusMap.CANCELLED,
        PaymentStatusMap.PENDING,
      ].includes(data.status) === false
    ) {
      console.log([
        PaymentStatusMap.SUCCESS,
        PaymentStatusMap.CANCELLED,
        PaymentStatusMap.PENDING,
      ]);
      console.log(data.status);
      return res.status(400).json({
        message: "Invalid Status!",
        status: false,
        timeStamp: timeNow,
      });
    }

    if (data.status === PaymentStatusMap.SUCCESS) {
      const user = await getUserDataByPhoneNumber(recharge.phone);

      addUserAccountBalance({
        phone: user.phone,
        money: recharge.money,
        code: user.code,
        invite: user.invite,
        rechargeId: recharge.id,
      });

      await connection.query("UPDATE recharge SET status = 1 WHERE id = ?", [
        data.id,
      ]);

      return res.status(200).json({
        message: "Recharge verified successfully!",
        status: true,
        timeStamp: timeNow,
      });
    } else if (data.status === PaymentStatusMap.CANCELLED) {
      await rechargeTable.setRechargeStatusById({
        id: data.id,
        status: PaymentStatusMap.CANCELLED,
      });
      return res.status(200).json({
        message: "Recharge cancelled successfully!",
        status: true,
        timeStamp: timeNow,
      });
    }

    await rechargeTable.setRechargeStatusById({
      id: data.id,
      status: PaymentStatusMap.PENDING,
    });
    return res.status(200).json({
      message: "Recharge set to waiting successfully!",
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

// helpers ---------------
const getUserDataByAuthToken = async (authToken) => {
  let [users] = await connection.query(
    "SELECT `id`, `phone`, `code`,`name_user`,`invite` FROM users WHERE `token` = ? ",
    [authToken],
  );
  const user = users?.[0];

  if (user === undefined || user === null) {
    throw Error("Unable to get user data!");
  }

  return {
    userId: user.id,
    phone: user.phone,
    code: user.code,
    username: user.name_user,
    invite: user.invite,
  };
};

const getUserDataByPhoneNumber = async (phoneNumber) => {
  let [users] = await connection.query(
    "SELECT `phone`, `code`,`name_user`,`invite` FROM users WHERE `phone` = ? ",
    [phoneNumber],
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

const getUserByInviteCode = async (invite) => {
  const [inviter] = await connection.query(
    "SELECT phone FROM users WHERE `code` = ?",
    [invite],
  );
  return inviter?.[0] || null;
};

const addUserMoney = async (phone, money, actualAmount = 0) => {
  // update user money
  await connection.query(
    "UPDATE users SET money = money + ?, total_money = total_money + ?, actual_total_deposit_amount = actual_total_deposit_amount + ? WHERE `phone` = ?",
    [money, money, actualAmount, phone],
  );
};


const addUserAccountBalance = async ({ phone, money, code, invite, rechargeId }) => {
  try {
    const totalRecharge = await rechargeTable.totalRechargeCount(
      PaymentStatusMap.SUCCESS,
      phone,
    );

    // --- DYNAMIC DEPOSIT BONUS LOGIC ---
    const [currentRecharge] = await connection.query(
      "SELECT status FROM recharge WHERE id = ?",
      [rechargeId]
    );
    const isCurrentSuccess = currentRecharge.length > 0 && currentRecharge[0].status === PaymentStatusMap.SUCCESS;
    const rechargeCount = isCurrentSuccess ? totalRecharge : totalRecharge + 1;

    const [bonusRules] = await connection.execute(
      "SELECT * FROM deposit_bonuses_config WHERE deposit_number = ? AND status = 1 AND min_deposit <= ? ORDER BY min_deposit DESC LIMIT 1",
      [rechargeCount, money]
    );

    let userBonus = 0;
    let inviterBonus = 0;

    let rule = null;
    if (bonusRules.length > 0) {
      rule = bonusRules[0];

      // Calculate User Bonus
      if (rule.user_bonus_type === 'percentage') {
        userBonus = (money * rule.user_bonus) / 100;
      } else {
        userBonus = rule.user_bonus;
      }

      // Calculate Inviter Bonus
      if (rule.referrer_bonus_type === 'percentage') {
        inviterBonus = (money * rule.referrer_bonus) / 100;
      } else {
        inviterBonus = rule.referrer_bonus;
      }
    } else {
      // Fallback to legacy logic
      const bonusPct = await adminController.getBonusPercentages();
      userBonus = totalRecharge === 0 ? (money / 100) * bonusPct.firstDeposit : (money / 100) * bonusPct.dailyDeposit;
      inviterBonus = totalRecharge === 0 ? (money / 100) * bonusPct.referral : 0;
    }

    // Apply User Balance & Commission
    await addUserMoney(phone, money + userBonus, money);
    await commissionController.updateDeposit(phone, money);

    // Update Wagering/Betting Target
    await rechargeTable.updateRemainingBet(phone, money, rechargeId, totalRecharge);

    // Record User Reward
    if (userBonus > 0) {
      const rewardType = rule ? `Deposit #${rule.deposit_number} Bonus` : (totalRecharge === 0 ? REWARD_TYPES_MAP.FIRST_RECHARGE_BONUS : REWARD_TYPES_MAP.DAILY_RECHARGE_BONUS);
      await addUserRewards(phone, userBonus, rewardType);
    }

    // Handle Inviter/Referrer Bonus
    if (inviterBonus > 0) {
      const inviter = await getUserByInviteCode(invite);
      if (inviter) {
        await addUserMoney(inviter.phone, inviterBonus);
        const inviterRewardType = rule ? `Deposit #${rule.deposit_number} Agent Bonus` : (totalRecharge === 0 ? REWARD_TYPES_MAP.FIRST_RECHARGE_AGENT_BONUS : REWARD_TYPES_MAP.DAILY_RECHARGE_AGENT_BONUS);
        await addUserRewards(inviter.phone, inviterBonus, inviterRewardType);
      }
    }
    // --- END DYNAMIC LOGIC ---
  } catch (error) {
    throw new AppError(error.message, 500);
  }
};

const getRechargeOrderId = () => {
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

  return id_time + id_order;
};

const addUserRewards = async (phone, bonus, rewardType) => {
  const reward_id = generateClaimRewardID();
  let timeNow = new Date().getTime();

  await connection.query(
    "INSERT INTO claimed_rewards (reward_id,phone, amount, type, time, status) VALUES (?,?,?,?,?,?)",
    [
      reward_id,
      phone,
      bonus,
      rewardType,
      timeNow,
      REWARD_STATUS_TYPES_MAP.SUCCESS,
    ],
  );
};

const rechargeTable = {
  getRecordByPhoneAndStatus: async ({ phone, status, type }) => {
    if (
      ![
        PaymentStatusMap.SUCCESS,
        PaymentStatusMap.CANCELLED,
        PaymentStatusMap.PENDING,
      ].includes(status)
    ) {
      throw Error("Invalid Payment Status!");
    }

    let recharge;

    if (type) {
      [recharge] = await connection.query(
        "SELECT * FROM recharge WHERE phone = ? AND status = ? AND type = ?",
        [phone, status, type],
      );
    } else {
      [recharge] = await connection.query(
        "SELECT * FROM recharge WHERE phone = ? AND status = ?",
        [phone, status],
      );
    }

    return recharge.map((item) => ({
      id: item.id,
      orderId: item.id_order,
      transactionId: item.transaction_id,
      utr: item.utr,
      phone: item.phone,
      money: item.money,
      type: item.type,
      status: item.status,
      today: item.today,
      url: item.url,
      time: item.time,
    }));
  },
  getRechargeByOrderId: async ({ orderId }) => {
    const [recharge] = await connection.query(
      "SELECT * FROM recharge WHERE id_order = ?",
      [orderId],
    );

    if (recharge.length === 0) {
      return null;
    }

    return recharge.map((item) => ({
      id: item.id,
      orderId: item.id_order,
      transactionId: item.transaction_id,
      utr: item.utr,
      phone: item.phone,
      money: item.money,
      type: item.type,
      status: item.status,
      today: item.today,
      url: item.url,
      time: item.time,
    }))?.[0];
  },
  getRechargeById: async ({ id }) => {
    const [recharge] = await connection.query(
      "SELECT * FROM recharge WHERE id = ? LIMIT 1",
      [id],
    );

    if (recharge.length === 0) {
      return null;
    }

    return recharge.map((item) => ({
      id: item.id,
      orderId: item.id_order,
      transactionId: item.transaction_id,
      utr: item.utr,
      phone: item.phone,
      money: item.money,
      type: item.type,
      status: item.status,
      today: item.today,
      url: item.url,
      time: item.time,
    }))?.[0];
  },
  totalRechargeCount: async (status, phone) => {
    const [totalRechargeRow] = await connection.query(
      "SELECT COUNT(*) as count FROM recharge WHERE phone = ? AND status = ?",
      [phone, status],
    );
    const totalRecharge = totalRechargeRow[0].count || 0;
    return totalRecharge;
  },
  updateRemainingBet: async (phone, money, rechargeId, totalRecharge) => {
    const [previousRecharge] = await connection.query(
      `SELECT remaining_bet FROM recharge WHERE phone = ? AND status = 1 ORDER BY time DESC LIMIT 2`,
      [phone],
    );

    const previousRemainingBet = previousRecharge?.[1]?.remaining_bet || 0;

    const totalRemainingBet =
      totalRecharge === 0 ? money : previousRemainingBet + money;

    await connection.query(
      "UPDATE recharge SET remaining_bet = ? WHERE id = ?",
      [totalRemainingBet, rechargeId],
    );
  },
  cancelById: async (id) => {
    if (typeof id !== "number") {
      throw Error("Invalid Recharge 'id' expected a number!");
    }

    await connection.query("UPDATE recharge SET status = 2 WHERE id = ?", [id]);
  },
  setRechargeStatusById: async ({ id, status }) => {
    if (typeof id !== "number") {
      throw Error("Invalid Recharge 'id' expected a number!");
    }

    if (
      ![
        PaymentStatusMap.SUCCESS,
        PaymentStatusMap.CANCELLED,
        PaymentStatusMap.PENDING,
      ].includes(status)
    ) {
      throw Error("Invalid Payment Status!");
    }

    await connection.query("UPDATE recharge SET status = ? WHERE id = ?", [
      status,
      id,
    ]);
  },
  setStatusToSuccessByIdAndOrderId: async ({ id, orderId, utr }) => {
    if (typeof id !== "number") {
      throw Error("Invalid Recharge 'id' expected a number!");
    }

    if (utr) {
      await connection.query(
        "UPDATE recharge SET status = 1, utr = ? WHERE id = ? AND id_order = ?",
        [utr, id, orderId],
      );
    } else {
      await connection.query(
        "UPDATE recharge SET status = 1 WHERE id = ? AND id_order = ?",
        [id, orderId],
      );
    }
  },
  getCurrentTimeForTimeField: () => {
    return new Date().getTime();
  },
  getCurrentTimeForTodayField: () => {
    return moment().format("YYYY-MM-DD h:mm:ss A");
  },
  getDMYDateOfTodayFiled: (today) => {
    return moment(today, "YYYY-MM-DD h:mm:ss A").format("DD-MM-YYYY");
  },
  create: async (newRecharge) => {
    if (newRecharge.url === undefined || newRecharge.url === null) {
      newRecharge.url = "0";
    }

    await connection.query(
      `INSERT INTO recharge SET id_order = ?, transaction_id = ?, userId = ?, phone = ?, money = ?, type = ?, status = ?, today = ?, url = ?, time = ?, utr = ?, usdt_amount = ?, exchange_rate = ?`,
      [
        newRecharge.orderId,
        newRecharge.transactionId,
        newRecharge.userId,
        newRecharge.phone,
        newRecharge.money,
        newRecharge.type,
        newRecharge.status,
        newRecharge.today,
        newRecharge.url,
        newRecharge.time,
        newRecharge?.utr,
        newRecharge?.usdt_amount || null,
        newRecharge?.exchange_rate || null,
      ],
    );

    const [recharge] = await connection.query(
      "SELECT * FROM recharge WHERE id_order = ?",
      [newRecharge.orderId],
    );

    if (recharge.length === 0) {
      throw Error("Unable to create recharge!");
    }

    return recharge[0];
  },
};

const lgpay = {
  generateSign: (params, key) => {
    const sortedKeys = Object.keys(params).sort();

    let stringA = "";
    sortedKeys.forEach((k) => {
      if (params[k] !== null && params[k] !== "") {
        stringA += `${k}=${params[k]}&`;
      }
    });

    stringA = stringA.slice(0, -1);
    stringA += `&key=${key}`;

    return crypto.createHash("md5").update(stringA).digest("hex").toUpperCase(); // Ensure MD5 and uppercase
  },
};

const rspay = {
  generateSign: (params, key) => {
    const sortedKeys = Object.keys(params).sort();

    let stringA = "";
    sortedKeys.forEach((k) => {
      if (params[k] !== null && params[k] !== "") {
        stringA += `${k}=${params[k]}&`;
      }
    });

    stringA = stringA.slice(0, -1);

    stringA += `&key=${key}`;

    return crypto.createHash("sha256").update(stringA).digest("hex");
  },
};

const cloudPay = {
  generateSign: (params, key) => {
    // Step 1: Sort the parameters by key
    const sortedKeys = Object.keys(params).sort();

    // Step 2: Concatenate parameters in "key=value&" format
    let stringA = "";
    sortedKeys.forEach((k) => {
      // Skip the 'sign' key and include only non-empty values
      if (k !== 'sign' && params[k] !== null && params[k] !== "") {
        stringA += `${k}=${params[k]}&`;
      }
    });

    // Step 3: Remove the last '&' (trailing character)
    stringA = stringA.slice(0, -1);

    // Step 4: Add the merchant key at the end of the string
    stringA += `&key=${key}`;

    // Step 5: Generate the SHA256 hash and return the result in uppercase
    return crypto.createHash("sha256")
      .update(stringA)
      .digest("hex")
      .toUpperCase();
  }
};


// PAYOK Payment Integration
const initiatePayokPayment = async (req, res) => {
  const type = PaymentMethodsMap.PAYOK;
  let auth = req.cookies.auth;
  let money = parseFloat(req.body.money || req.query.money);

  const config = await getPaymentConfig('payok');
  const minAllowed = config ? config.min_recharge : 100;
  const maxAllowed = config ? config.max_recharge : 50000;

  if (!money || money < minAllowed || money > maxAllowed) {
    return res.status(400).json({
      message: `Recharge amount must be between ₹${minAllowed} and ₹${maxAllowed}`,
      status: false,
      timeStamp: timeNow,
    });
  }

  try {
    const user = await getUserDataByAuthToken(auth);

    const pendingRechargeList = await rechargeTable.getRecordByPhoneAndStatus({
      phone: user.phone,
      status: PaymentStatusMap.PENDING,
      type: type,
    });

    if (pendingRechargeList.length !== 0) {
      const deleteRechargeQueries = pendingRechargeList.map((recharge) => {
        return rechargeTable.cancelById(recharge.id);
      });
      await Promise.all(deleteRechargeQueries);
    }

    const orderId = getRechargeOrderId();
    if (!config) throw Error("PAYOK configuration not found");

    const merchantId = config.merchant_id;
    const privateKey = config.private_key;
    const baseUrl = process.env.PAYOK_BASE_URL || "https://api.payok.com";

    const [adminConfig] = await connection.query("SELECT website_link FROM admin_ac LIMIT 1");
    const appBaseUrl = adminConfig[0]?.website_link || "https://starworldz.com";

    const requestTime = new Date().toISOString();

    const requestBody = {
      paymentMethodCode: req.body.paymentMethodCode || "UPI",
      notificationUrl: config.callback_url || `${appBaseUrl}/api/webapi/recharge/payok/callback`,
      returnUrl: config.return_url || `${appBaseUrl}/wallet/rechargerecord`,
      requestTime: requestTime,
      amount: money,
      merchantId: merchantId,
      countryCode: "IN",
      currency: "INR",
      language: "EN",
      merchantOrderId: orderId,
      goodsInfo: {
        price: String(money),
        name: "Recharge",
        id: "1"
      },
      customer: {
        name: user.username || "User",
        email: user.email || "user@example.com",
        phone: user.phone,
        deviceId: orderId,
        ip: req.ip || "127.0.0.1"
      }
    };

    const payloadString = JSON.stringify(requestBody);
    const apiPath = "/api-pay/payment/V3.5/order/create-h5";
    const signString = payloadString + "&" + apiPath;

    const sign = crypto.createSign('RSA-SHA256').update(signString).sign(privateKey, 'base64');

    console.log("=== PAYOK INITIATION DETAILS ===");
    console.log("PAYOK Base URL:", baseUrl);
    console.log("PAYOK API Path:", apiPath);
    console.log("PAYOK Minified Payload:", payloadString);
    console.log("PAYOK Sign String (Concatenated):", signString);
    console.log("PAYOK Generated Signature (Base64):", sign);
    console.log("================================");

    const response = await axios.post(
      `${baseUrl}${apiPath}`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
          'sign': sign
        }
      }
    );

    const responseData = response?.data;
    console.log("PAYOK Response Data:", JSON.stringify(responseData));

    if (responseData && responseData.code === "SUCCESS") {
      const payUrl = responseData.paymentInfo?.content || responseData.data?.content || responseData.data?.payUrl || responseData.payUrl || responseData.data?.pay_url || responseData.pay_url || responseData.data?.url || responseData.url;
      const platformOrderId = responseData.paymentInfo?.platformOrderId || responseData.data?.platformOrderId || responseData.platformOrderId || orderId;

      if (!payUrl) {
        return res.status(200).json({
          status: false,
          message: "payUrl not found in gateway response: " + JSON.stringify(responseData)
        });
      }
      const newRechargeParams = {
        orderId: orderId,
        transactionId: platformOrderId,
        utr: 0,
        userId: user.userId,
        phone: user.phone,
        money: money,
        type: type,
        status: PaymentStatusMap.PENDING,
        today: rechargeTable.getCurrentTimeForTodayField(),
        url: payUrl,
        time: rechargeTable.getCurrentTimeForTimeField(),
      };

      await rechargeTable.create(newRechargeParams);

      return res.status(200).json({
        message: "Payment requested Successfully",
        urls: {
          web_url: payUrl
        },
        payment_url: payUrl,
        status: true,
        timeStamp: timeNow,
      });
    } else {
      throw Error(responseData.message || "Payment Service: Gateway error from PAYOK!");
    }
  } catch (error) {
    console.log("PAYOK Initiate Error:", error.response?.data || error.message);
    return res.status(500).json({
      status: false,
      message: error.response?.data?.message || error.message || "Something went wrong!",
      timeStamp: timeNow,
    });
  }
};

const verifyPayokPayment = async (req, res) => {
  console.log("PAYOK Webhook Received Body:", req.body);
  try {
    const data = req.body;
    const sign = req.headers.sign;

    if (!data || !sign) {
      return res.status(400).send("FAIL");
    }

    const config = await getPaymentConfig('payok');
    if (!config || !config.public_key) {
      return res.status(500).send("Config not found");
    }

    const [adminConfig] = await connection.query("SELECT website_link FROM admin_ac LIMIT 1");
    const appBaseUrl = adminConfig[0]?.website_link || "https://starworldz.com";
    const callbackPath = "/api/webapi/recharge/payok/callback";
    const fullCallbackUrl = config.callback_url || `${appBaseUrl}${callbackPath}`;

    console.log("PAYOK Webhook Headers:", req.headers);

    const sortedData = Object.keys(data).sort().reduce((acc, key) => {
      acc[key] = data[key];
      return acc;
    }, {});

    const sortedStr = JSON.stringify(sortedData);
    const unsortedStr = JSON.stringify(data);

    const rawStr = req.rawBody ? req.rawBody.toString('utf8') : '';
    console.log("PAYOK Webhook Raw Body:", rawStr);

    const sortedKeys = Object.keys(data).sort();
    const queryString = sortedKeys
      .filter(key => data[key] !== undefined && data[key] !== null && data[key] !== '')
      .map(key => `${key}=${data[key]}`)
      .join('&');

    const verify = (str) => {
      if (!str) return false;
      try {
        const isOk = crypto.createVerify('RSA-SHA256').update(str).verify(config.public_key, sign, 'base64');
        if (isOk) {
          console.log("PAYOK Verification MATCHED on string:", str);
        }
        return isOk;
      } catch (e) {
        console.log("PAYOK Verification Attempt Error:", e.message);
        return false;
      }
    };

    const isVerified = verify(rawStr) ||
                       verify(rawStr + "&" + callbackPath) ||
                       verify(rawStr + "&" + fullCallbackUrl) ||
                       verify(sortedStr) || 
                       verify(sortedStr + "&" + callbackPath) || 
                       verify(sortedStr + "&" + fullCallbackUrl) ||
                       verify(unsortedStr) || 
                       verify(unsortedStr + "&" + callbackPath) ||
                       verify(unsortedStr + "&" + fullCallbackUrl) ||
                       verify(queryString) ||
                       verify(queryString + "&" + callbackPath) ||
                       verify(queryString + "&" + fullCallbackUrl);

    if (!isVerified) {
      console.log("PAYOK Webhook Signature Verification Failed");
      console.log("Tried RawBody, JSON & QueryString strategies, none matched.");
      return res.status(400).send("FAIL");
    }

    if (data.status !== "SUCCESS") {
      console.log("PAYOK Order Not Success:", data.merchantOrderId, data.status);
      return res.status(200).send("SUCCESS");
    }

    const orderId = data.merchantOrderId;
    const recharge = await rechargeTable.getRechargeByOrderId({ orderId });
    if (!recharge) {
      return res.status(400).send("FAIL");
    }

    if (recharge.status === PaymentStatusMap.SUCCESS) {
      return res.status(200).send("SUCCESS");
    }

    const user = await getUserDataByPhoneNumber(recharge.phone);

    // Always use paidAmount as requested, update recharge record and variable
    const paidAmount = Number(data.paidAmount);
    if (!isNaN(paidAmount) && paidAmount > 0) {
      await connection.query("UPDATE recharge SET money = ? WHERE id = ?", [paidAmount, recharge.id]);
      recharge.money = paidAmount;
    }

    await rechargeTable.setStatusToSuccessByIdAndOrderId({
      id: recharge.id,
      orderId: recharge.orderId,
    });

    await addUserAccountBalance({
      phone: user.phone,
      money: recharge.money,
      code: user.code,
      invite: user.invite,
      rechargeId: recharge.id,
    });

    console.log(`PAYOK Webhook Success: Order ${orderId} confirmed`);
    return res.status(200).send("SUCCESS");
  } catch (error) {
    console.log("PAYOK Webhook Error:", error);
    return res.status(500).send("FAIL");
  }
};

const initiatePayokPayout = async (withdrawal) => {
  const config = await getPaymentConfig('payok');
  if (!config) {
    throw new Error("Payok config not found");
  }

  const merchantId = config.merchant_id;
  const privateKey = config.private_key;
  const baseUrl = process.env.PAYOK_BASE_URL || "https://api.payok.com";

  const [adminConfig] = await connection.query("SELECT website_link FROM admin_ac LIMIT 1");
  const appBaseUrl = adminConfig[0]?.website_link || "https://starworldz.com";

  const amount = Number(withdrawal.amount);
  const orderId = withdrawal.orderId;

  // Split name for cardHolderInfo
  const nameParts = (withdrawal.recipientName || "User").trim().split(/\s+/);
  const firstName = nameParts[0] || "User";
  const lastName = nameParts.slice(1).join(" ") || "User";

  // Step 1: Account Inquiry
  const inquiryPath = "/api-pay/remit/V3.6/account/inquiry";
  const inquiryBody = {
    requestTime: new Date().toISOString(),
    amount: amount.toFixed(2),
    benificiaryAccountInfo: {
      number: withdrawal.bankAccountNumber,
      holderName: withdrawal.recipientName,
      orgName: withdrawal.bankName,
      orgCode: withdrawal.IFSC,
      orgId: withdrawal.IFSC
    },
    merchantId: merchantId,
    countryCode: "IN",
    currency: "INR",
    language: "EN",
    merchantOrderId: orderId
  };

  console.log("==================================================");
  console.log("Payok Payout - Bank Details Sent to API:");
  console.log("Account Number:", withdrawal.bankAccountNumber);
  console.log("Recipient Name:", withdrawal.recipientName);
  console.log("Bank Name:", withdrawal.bankName);
  console.log("IFSC Code:", withdrawal.IFSC);
  console.log("==================================================");

  const inquiryPayload = JSON.stringify(inquiryBody);
  const inquirySign = crypto.createSign('RSA-SHA256')
    .update(inquiryPayload + "&" + inquiryPath)
    .sign(privateKey, 'base64');

  console.log("=== PAYOK PAYOUT INQUIRY REQUEST ===");
  console.log("Inquiry Body:", inquiryPayload);
  
  const inquiryResponse = await axios.post(
    `${baseUrl}${inquiryPath}`,
    inquiryBody,
    {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'sign': inquirySign
      }
    }
  );

  console.log("Inquiry Response:", inquiryResponse.data);

  if (!inquiryResponse.data || inquiryResponse.data.code !== "SUCCESS") {
    throw new Error(inquiryResponse.data?.message || "Payok Account Inquiry Failed");
  }

  const inquiryToken = inquiryResponse.data.inquiryToken;
  if (!inquiryToken) {
    throw new Error("Payok Account Inquiry did not return inquiryToken");
  }

  // Step 2: Request Payout
  const createPath = "/api-pay/remit/V3.6/order/create";
  const createBody = {
    requestTime: new Date().toISOString(),
    notificationUrl: `${appBaseUrl}/api/webapi/withdraw/payok/callback`,
    inquiryToken: inquiryToken,
    amount: amount.toFixed(2),
    benificiaryAccountInfo: {
      number: withdrawal.bankAccountNumber,
      holderName: withdrawal.recipientName,
      orgName: withdrawal.bankName,
      orgCode: withdrawal.IFSC,
      orgId: withdrawal.IFSC
    },
    merchantId: merchantId,
    countryCode: "IN",
    description: `Payout withdrawal order ${orderId}`,
    currency: "INR",
    language: "EN",
    cardHolderInfo: {
      zip: "110001",
      firstName: firstName,
      lastName: lastName,
      country: "India",
      address: "India",
      city: "New Delhi",
      phone: withdrawal.phoneNumber || "9178200000",
      email: "user@example.com"
    },
    merchantOrderId: orderId
  };

  const createPayload = JSON.stringify(createBody);
  const createSign = crypto.createSign('RSA-SHA256')
    .update(createPayload + "&" + createPath)
    .sign(privateKey, 'base64');

  console.log("=== PAYOK PAYOUT CREATE ORDER REQUEST ===");
  console.log("Create Body:", createPayload);

  const createResponse = await axios.post(
    `${baseUrl}${createPath}`,
    createBody,
    {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'sign': createSign
      }
    }
  );

  console.log("Create Response:", createResponse.data);

  if (!createResponse.data || createResponse.data.code !== "SUCCESS") {
    throw new Error(createResponse.data?.message || "Payok Payout Order Creation Failed");
  }

  return createResponse.data;
};

const verifyPayokPayoutCallback = async (req, res) => {
  console.log("PAYOK Payout Callback Received Body:", req.body);
  try {
    const data = req.body;
    const sign = req.headers.sign;

    if (!data || !sign) {
      return res.status(400).send("FAIL");
    }

    const config = await getPaymentConfig('payok');
    if (!config || !config.public_key) {
      return res.status(500).send("Config not found");
    }

    const [adminConfig] = await connection.query("SELECT website_link FROM admin_ac LIMIT 1");
    const appBaseUrl = adminConfig[0]?.website_link || "https://starworldz.com";
    const callbackPath = "/api/webapi/withdraw/payok/callback";
    const fullCallbackUrl = `${appBaseUrl}${callbackPath}`;

    console.log("PAYOK Payout Webhook Headers:", req.headers);

    const sortedData = Object.keys(data).sort().reduce((acc, key) => {
      acc[key] = data[key];
      return acc;
    }, {});

    const sortedStr = JSON.stringify(sortedData);
    const unsortedStr = JSON.stringify(data);
    const rawStr = req.rawBody ? req.rawBody.toString('utf8') : '';
    console.log("PAYOK Payout Webhook Raw Body:", rawStr);

    const sortedKeys = Object.keys(data).sort();
    const queryString = sortedKeys
      .filter(key => data[key] !== undefined && data[key] !== null && data[key] !== '')
      .map(key => `${key}=${data[key]}`)
      .join('&');

    const verify = (str) => {
      if (!str) return false;
      try {
        const isOk = crypto.createVerify('RSA-SHA256').update(str).verify(config.public_key, sign, 'base64');
        if (isOk) {
          console.log("PAYOK Payout Verification MATCHED on string:", str);
        }
        return isOk;
      } catch (e) {
        console.log("PAYOK Payout Verification Attempt Error:", e.message);
        return false;
      }
    };

    const isVerified = verify(rawStr) ||
                       verify(rawStr + "&" + callbackPath) ||
                       verify(rawStr + "&" + fullCallbackUrl) ||
                       verify(sortedStr) || 
                       verify(sortedStr + "&" + callbackPath) || 
                       verify(sortedStr + "&" + fullCallbackUrl) ||
                       verify(unsortedStr) || 
                       verify(unsortedStr + "&" + callbackPath) ||
                       verify(unsortedStr + "&" + fullCallbackUrl) ||
                       verify(queryString) ||
                       verify(queryString + "&" + callbackPath) ||
                       verify(queryString + "&" + fullCallbackUrl);

    if (!isVerified) {
      console.log("PAYOK Payout Webhook Signature Verification Failed");
      return res.status(400).send("FAIL");
    }

    const orderId = data.merchantOrderId;
    const [withdrawRows] = await connection.query("SELECT * FROM withdraw WHERE id_order = ?", [orderId]);
    if (withdrawRows.length === 0) {
      console.log("PAYOK Payout Webhook: Withdrawal order not found:", orderId);
      return res.status(400).send("FAIL");
    }

    const withdraw = withdrawRows[0];
    if (withdraw.status === 1 || withdraw.status === 2) {
      console.log("PAYOK Payout Webhook: Withdrawal already processed:", orderId, "Status:", withdraw.status);
      return res.status(200).send("SUCCESS");
    }

    if (data.status === "SUCCESS") {
      await connection.query("UPDATE withdraw SET status = 1, remarks = 'Payok Payout Success' WHERE id = ?", [withdraw.id]);

      await connection.query(
        "UPDATE users SET total_withdrawal_amount = total_withdrawal_amount + ? WHERE phone = ?",
        [withdraw.money, withdraw.phone]
      );

      console.log(`PAYOK Payout Webhook SUCCESS: Order ${orderId} confirmed`);
      return res.status(200).send("SUCCESS");
    } else if (data.status === "FAILED") {
      await connection.query("UPDATE withdraw SET status = 2, remarks = 'Payok Payout Failed' WHERE id = ?", [withdraw.id]);

      await connection.query(
        "UPDATE users SET money = money + ?, total_money = total_money + ? WHERE phone = ?",
        [withdraw.money, withdraw.money, withdraw.phone]
      );

      console.log(`PAYOK Payout Webhook FAILED: Order ${orderId} refunded`);
      return res.status(200).send("SUCCESS");
    }

    return res.status(200).send("SUCCESS");
  } catch (error) {
    console.log("PAYOK Payout Webhook Error:", error);
    return res.status(500).send("FAIL");
  }
};

const paymentController = {
  initiateUPIPayment,
  verifyUPIPayment,
  upiGatewayWebhook,
  initiateWowPayPayment,
  verifyWowPayPayment,
  initiateManualUPIPayment,
  addManualUPIPaymentRequest,
  addManualUSDTPaymentRequest,
  initiateManualUSDTPayment,
  initiateRspayPayment,
  verifyRspayPayment,
  browseRechargeRecord,
  setRechargeStatus,
  initiateUpayPayment,
  verifyUpayPayment,
  initiateRspayOutPayment,
  verifyCloudPayPayment,
  initiateCloudPayPayment,
  initiatePayokPayment,
  verifyPayokPayment,
  initiatePayokPayout,
  verifyPayokPayoutCallback
};

export default paymentController;
