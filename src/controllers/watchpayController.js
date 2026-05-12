import connection from "../config/connectDB.js";
import jwt from 'jsonwebtoken';
import md5 from "md5";
import axios from 'axios';
import moment from "moment-timezone";
import { generateClaimRewardID } from "../helpers/games.js";
import CryptoJS from 'crypto-js';
import adminController from "./adminController.js";
import commissionController from "./commissionController.js";
import {
    REWARD_STATUS_TYPES_MAP,
    REWARD_TYPES_MAP,
} from "../constants/reward_types.js";

const REWARD_TYPES = REWARD_TYPES_MAP;

let SECRET_KEY = "8979d78b437948f18c14628ff1ad5f41";
let MCH_ID = "222887002";

const getPaymentConfig = async (gateway) => {
    const [rows] = await connection.query("SELECT * FROM payment_configs WHERE gateway_name = ? AND status = 1", [gateway]);
    return rows[0] || null;
};

let config = null;

const refreshConfig = async () => {
    config = await getPaymentConfig('watchpay');
    if (config) {
        MCH_ID = config.app_id || config.merchant_id;
        SECRET_KEY = config.app_secret;
    }
};

refreshConfig();

const Domain_Name = "https://api.watchglbpay.com";

const generateSignature = (params) => {
    // Filter out empty values, sign, and sign_type
    const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([key, value]) => value && key !== "sign" && key !== "sign_type")
    );

    // Sort parameters by ASCII order
    const sortedParams = Object.keys(filteredParams)
        .sort()
        .map(key => `${key}=${filteredParams[key]}`)
        .join('&');

    // Append the private key
    const stringToSign = `${sortedParams}&key=${SECRET_KEY}`;

    // Generate the MD5 hash and convert it to lowercase
    return md5(stringToSign).toLowerCase();
};

const generateUniqueTransferId = () => {
    const date = new Date().toISOString().replace(/[-T:.Z]/g, "");  // Get a unique date-based string
    const random = Math.floor(Math.random() * 10000);  // Add a random number to ensure uniqueness
    return `${date}${random}`;
};

const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const watchpay_createOrder = async (req, res) => {
    await refreshConfig();
    const uniqueTransferId = generateUniqueTransferId();
    const amount = parseInt(req.body.trade_amount || req.body.money);
    const minAllowed = config ? config.min_recharge : 10;
    const maxAllowed = config ? config.max_recharge : 1000000;

    if (!amount || amount < minAllowed || amount > maxAllowed) {
        return res.status(400).json({
            status: false,
            message: `Recharge amount must be between ${minAllowed} and ${maxAllowed}`
        });
    }

    const [settings] = await connection.query("SELECT website_link FROM admin_ac LIMIT 1");
    const siteUrl = settings[0]?.website_link || "https://starworldz.com";

    const params = {
        version: "1.0",
        mch_id: MCH_ID,
        notify_url: `${siteUrl}/wallet/verify/watchpay`,
        page_url: siteUrl,
        mch_order_no: uniqueTransferId,
        pay_type: req.body.pay_type || "INR_UPI",
        trade_amount: amount,
        order_date: getCurrentDateTime(),
        goods_name: req.body.goods_name || "Recharge",
        mch_return_msg: "recharge",
        sign_type: "MD5"
    };
    // Generate the sign using the generateSignature function
    params.sign = generateSignature(params);


    const body = new URLSearchParams(params).toString();
    console.log(body, "body")

    try {
        const response = await axios.post(`${Domain_Name}/pay/web`, body, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        console.log("Response Data:", response.data);  // Log the full response

        if (response.data.respCode === "SUCCESS") {
            const responseData = response.data;
            return res.status(200).json({ status: true, msg: responseData.respCode, data: responseData });
        } else {
            console.log("Payment request failed", response.data); // Log failed response
            return res.status(400).json({ error: 'Payment request failed', details: response.data });
        }
    } catch (error) {
        console.error('Error while processing payment request:', error);
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};



const watchpay_verifyOrder = async (req, res) => {
    try {
        const data = req.body;
        console.log("WatchPay Callback Data:", data);

        const { mch_id, mch_order_no, trade_amount, status, sign } = data;

        // Verify Signature
        const signature = generateSignature(data);
        if (signature !== sign) {
            console.error("WatchPay Signature Mismatch!");
            return res.send("fail");
        }

        if (status === "SUCCESS") {
            const [recharge] = await connection.query(
                "SELECT * FROM recharge WHERE order_id = ? AND status = 0",
                [mch_order_no]
            );

            if (recharge.length > 0) {
                const order = recharge[0];
                const [user] = await connection.query(
                    "SELECT * FROM users WHERE phone = ?",
                    [order.phone]
                );

                if (user.length > 0) {
                    const userData = user[0];

                    // Update recharge status
                    await rechargeTable.setStatusToSuccessByIdAndOrderId({
                        id: order.id,
                        orderId: order.order_id
                    });

                    // Add money with bonus logic
                    await addUserAccountBalance({
                        phone: userData.phone,
                        money: order.money,
                        code: userData.code,
                        invite: userData.invite,
                        rechargeId: order.id
                    });

                    return res.send("success");
                }
            }
        }
        return res.send("fail");
    } catch (error) {
        console.error("WatchPay Callback Error:", error);
        return res.send("fail");
    }
};

const getUserByInviteCode = async (inviteCode) => {
    const [rows] = await connection.query("SELECT * FROM users WHERE code = ?", [inviteCode]);
    return rows[0];
};

const addUserRewards = async (phone, bonus, rewardType) => {
    const reward_id = generateClaimRewardID();
    let timeNow = moment().tz("Asia/Kolkata").valueOf();

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

const addUserMoney = async (phone, money, actualAmount = 0) => {
    await connection.query(
        "UPDATE users SET money = money + ?, total_money = total_money + ?, actual_total_deposit_amount = actual_total_deposit_amount + ? WHERE `phone` = ?",
        [money, money, actualAmount, phone]
    );
};

const rechargeTable = {
    totalRechargeCount: async (status, phone) => {
        const [rows] = await connection.query(
            "SELECT COUNT(*) as count FROM recharge WHERE status = ? AND phone = ?",
            [status, phone]
        );
        return rows[0].count;
    },
    setStatusToSuccessByIdAndOrderId: async ({ id, orderId }) => {
        await connection.query(
            "UPDATE recharge SET status = 1 WHERE id = ? AND order_id = ?",
            [id, orderId]
        );
    },
    updateRemainingBet: async (phone, money, rechargeId, totalRecharge) => {
        const betMultiplier = 1; // Default 1x
        const remainingBet = money * betMultiplier;
        await connection.query(
            "UPDATE users SET total_bet = total_bet + ? WHERE phone = ?",
            [remainingBet, phone]
        );
    }
};

const addUserAccountBalance = async ({ phone, money, code, invite, rechargeId }) => {
    try {
        const totalRecharge = await rechargeTable.totalRechargeCount(1, phone);
        const rechargeCount = totalRecharge;

        const [bonusRules] = await connection.execute(
            "SELECT * FROM deposit_bonuses_config WHERE deposit_number = ? AND status = 1 AND min_deposit <= ? ORDER BY min_deposit DESC LIMIT 1",
            [rechargeCount, money]
        );

        let userBonus = 0;
        let inviterBonus = 0;
        let rule = null;

        if (bonusRules.length > 0) {
            rule = bonusRules[0];
            if (rule.user_bonus_type === 'percentage') userBonus = (money * rule.user_bonus) / 100;
            else userBonus = rule.user_bonus;

            if (rule.referrer_bonus_type === 'percentage') inviterBonus = (money * rule.referrer_bonus) / 100;
            else inviterBonus = rule.referrer_bonus;
        } else {
            const bonusPct = await adminController.getBonusPercentages();
            userBonus = totalRecharge === 1 ? (money / 100) * bonusPct.firstDeposit : (money / 100) * bonusPct.dailyDeposit;
            inviterBonus = totalRecharge === 1 ? (money / 100) * bonusPct.referral : 0;
        }

        await addUserMoney(phone, money + userBonus, money);
        await commissionController.updateDeposit(phone, money);
        await rechargeTable.updateRemainingBet(phone, money, rechargeId, totalRecharge);

        if (userBonus > 0) {
            const rewardType = rule ? `Deposit #${rule.deposit_number} Bonus` : (totalRecharge === 1 ? REWARD_TYPES.FIRST_RECHARGE_BONUS : REWARD_TYPES.DAILY_RECHARGE_BONUS);
            await addUserRewards(phone, userBonus, rewardType);
        }

        if (inviterBonus > 0) {
            const inviter = await getUserByInviteCode(invite);
            if (inviter) {
                await addUserMoney(inviter.phone, inviterBonus);
                const inviterRewardType = rule ? `Deposit #${rule.deposit_number} Agent Bonus` : (totalRecharge === 1 ? REWARD_TYPES.FIRST_RECHARGE_AGENT_BONUS : REWARD_TYPES.DAILY_RECHARGE_AGENT_BONUS);
                await addUserRewards(inviter.phone, inviterBonus, inviterRewardType);
            }
        }
    } catch (error) {
        console.error("addUserAccountBalance Error:", error);
    }
};

const watchpayController = {
    watchpay_createOrder,
    watchpay_verifyOrder
};

export default watchpayController;

