import connection from "../config/connectDB.js";
import axios from "axios";
import moment from "moment-timezone";
import crypto from "crypto";
import https from 'https';
import {
    REWARD_STATUS_TYPES_MAP,
    REWARD_TYPES_MAP,
} from "../constants/reward_types.js";
import AppError from "../errors/AppError.js";
import { generateClaimRewardID, getBonuses } from "../helpers/games.js";
import adminController from "./adminController.js";
import commissionController from "./commissionController.js";


let timeNow = moment().tz("Asia/Kolkata").valueOf();

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
    USDT: "usdt",
    UPAY: "upay",
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


const rechargeTable = {
    getRecordByPhoneAndStatus: async ({ phone, status, type, remark }) => {
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
        if (!status || !phone)
            throw new AppError("Invalid Status or Phone", 400);

        const [totalRechargeRow] = await connection.query(
            "SELECT COUNT(*) as count FROM recharge WHERE phone = ? AND status = ?",
            [phone, status],
        );
        const totalRecharge = totalRechargeRow[0].count || 0;
        return totalRecharge;
    },
    updateRemainingBet: async (phone, money, rechargeId, totalRecharge) => {

        const [previousRecharge] = await connection.query(
            `SELECT remaining_bet FROM recharge WHERE phone = ? AND status = 1 ORDER BY time_remaining_bet DESC LIMIT 2`,
            [phone],
        );

        const previousRemainingBet = previousRecharge?.[1]?.remaining_bet || 0;

        const totalRemainingBet =
            totalRecharge === 1 ? money : previousRemainingBet + money;

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
    setRechargeStatusById: async ({ id, status, remark }) => {
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

        await connection.query("UPDATE recharge SET status = ? ,remark=? WHERE id = ?", [
            status,
            remark,
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
        return moment().tz("Asia/Kolkata").valueOf(); // IST in ms
    },
    getCurrentTimeForTodayField: () => {
        return moment().tz("Asia/Kolkata").format("YYYY-MM-DD h:mm:ss A"); // IST formatted
    },
    getDMYDateOfTodayFiled: (today) => {
        return moment(today, "YYYY-MM-DD h:mm:ss A").format("DD-MM-YYYY");
    },
    create: async (newRecharge) => {
        if (newRecharge.url === undefined || newRecharge.url === null) {
            newRecharge.url = "0";
        }

        await connection.query(
            `INSERT INTO recharge SET id_order = ?, transaction_id = ?, phone = ?, money = ?, userId = ?, type = ?, status = ?, today = ?, url = ?, time = ?, time_remaining_bet = ?, utr = ?, usdt_amount = ?, exchange_rate = ?`,
            [
                newRecharge.orderId,
                newRecharge.transactionId,
                newRecharge.phone,
                newRecharge.money,
                newRecharge.userId,
                newRecharge.type,
                newRecharge.status,
                newRecharge.today,
                newRecharge.url,
                newRecharge.time,
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

// helpers ---------------
const getUserDataByAuthToken = async (authToken) => {
    let [users] = await connection.query(
        "SELECT  `phone`, `code`,`name_user`,`invite` FROM users WHERE `token` = ? ",
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

export const addUserAccountBalance = async ({ phone, money, code, invite, rechargeId }) => {
    try {
        const totalRecharge = await rechargeTable.totalRechargeCount(
            PaymentStatusMap.SUCCESS,
            phone,
        );
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
            if (rule.user_bonus_type === 'percentage') {
                userBonus = (money * rule.user_bonus) / 100;
            } else {
                userBonus = rule.user_bonus;
            }

            if (rule.referrer_bonus_type === 'percentage') {
                inviterBonus = (money * rule.referrer_bonus) / 100;
            } else {
                inviterBonus = rule.referrer_bonus;
            }
        } else {
            // Fallback to legacy logic
            const bonusPct = await adminController.getBonusPercentages();
            userBonus = 0; // Legacy cc logic had 0 default user bonus
            inviterBonus = totalRecharge === 1 ? (money / 100) * bonusPct.referral : 0;
        }

        const user_money = money + userBonus;

        console.log("--- addUserAccountBalance Debug ---");
        console.log("Money received:", money);
        console.log("User Bonus calculated:", userBonus);
        console.log("Total user_money to add:", user_money);

        await addUserMoney(phone, user_money, money);
        await commissionController.updateDeposit(phone, money);

        console.log(phone, money, rechargeId, totalRecharge);
        await rechargeTable.updateRemainingBet(
            phone,
            money,
            rechargeId,
            totalRecharge,
        );

        // Record User Reward
        if (userBonus > 0) {
            const rewardType = rule ? `Deposit #${rule.deposit_number} Bonus` : (totalRecharge === 1 ? REWARD_TYPES_MAP.FIRST_RECHARGE_BONUS : REWARD_TYPES_MAP.DAILY_RECHARGE_BONUS);
            await addUserRewards(phone, userBonus, rewardType);
        }

        // Handle Inviter/Referrer Bonus
        if (inviterBonus > 0) {
            const inviter = await getUserByInviteCode(invite);
            if (inviter) {
                await addUserMoney(inviter.phone, inviterBonus);
                const inviterRewardType = rule ? `Deposit #${rule.deposit_number} Agent Bonus` : (totalRecharge === 1 ? REWARD_TYPES_MAP.FIRST_RECHARGE_AGENT_BONUS : REWARD_TYPES_MAP.DAILY_RECHARGE_AGENT_BONUS);
                await addUserRewards(inviter.phone, inviterBonus, inviterRewardType);
            }
        }
        // --- END DYNAMIC LOGIC ---
    } catch (error) {
        throw new AppError(error.message, 500);
    }
};


const getPaymentConfig = async (gateway) => {
    const [rows] = await connection.query("SELECT * FROM payment_configs WHERE gateway_name = ? AND status = 1", [gateway]);
    return rows[0] || null;
};

// Ensure `appId` and `appSecret` are defined securely, e.g., from database or environment variables.
let appId = "";
let appSecret = "";

const refreshConfig = async () => {
    const config = await getPaymentConfig('ccpayment');
    if (config) {
        appId = config.app_id;
        appSecret = config.app_secret;
    }
};

// Initialize config
refreshConfig();

// Fetch coin list from CCPayment API
const fetchCoinList = async () => {
    await refreshConfig();
    try {
        const path = "https://ccpayment.com/ccpayment/v2/getCoinList";
        const timestamp = Math.floor(Date.now() / 1000);
        const args = "{}"; // Changed from "" to "{}" to be a valid JSON object
        let signText = appId + timestamp + args;

        console.log("--- fetchCoinList Request ---");
        console.log("Path:", path);
        console.log("AppId:", appId);
        console.log("Timestamp:", timestamp);
        console.log("Args (Body):", `'${args}'`);
        console.log("SignText:", signText);

        // Generate HMAC-SHA256 signature
        const sign = crypto
            .createHmac("sha256", appSecret)
            .update(signText)
            .digest("hex");

        console.log("Generated Sign:", sign);

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Appid": appId,
                "Sign": sign,
                "Timestamp": timestamp.toString(),
            },
            url: path,
            data: args,
        };

        console.log("Request Headers:", JSON.stringify(options.headers, null, 2));

        // Send request to the API
        const response = await axios(options);
        console.log("API Response Status:", response.status);
        console.log("API Response Data:", JSON.stringify(response.data, null, 2));
        return response.data; // Return the coin list data
    } catch (error) {
        console.error("Error fetching coin list:", error.message);
        if (error.response) {
            console.error("API Error Response Data:", JSON.stringify(error.response.data, null, 2));
        }
        throw new Error("Failed to fetch coin list");
    }
};

// Route to get coin details by symbol
const fetchCoinDetails = async (req, res) => {
    const { symbol } = req.body;

    if (!symbol) {
        return res.status(400).send('Symbol is required');
    }

    try {
        // Fetch the list of coins
        const coinList = await fetchCoinList();
        console.log(coinList, "coinList")
        if (!coinList || coinList.code !== 10000) {
            return res.status(500).send('Error fetching coin list');
        }

        // Find the coin with the given symbol
        const coin = coinList.data.coins.find(coin => coin.symbol === symbol);

        if (!coin) {
            return res.status(404).send('Coin not found');
        }

        // Return the coin details
        res.json(coin);
    } catch (error) {
        console.error("Error handling /getCoinDetails route:", error.message);
        return res.status(500).send('Internal server error');
    }
};

// Removed generateOrderId as it was causing numeric column update issues.
// We will use getRechargeOrderId instead.

const createDeposit = async (req, res) => {
    const { money } = req.body;
    console.log(money, "money")
    const userToken = req.userToken;
    // console.log(userToken)
    const [user] = await connection.query('SELECT `id_user`, `phone`, `id_user` FROM users WHERE token = ? LIMIT 1 ', [userToken]);

    let userInfo = user[0];

    const chain = req.body.chainType == "TRC" ? "TRX" : "BSC"
    const coinId = 1280;
    const config = await getPaymentConfig('ccpayment');
    const minAllowed = config?.min_recharge || 10;
    const maxAllowed = config ? config.max_recharge : 1000000;

    if (!money || money < minAllowed || money > maxAllowed) {
        return res.status(400).json({
            message: `Recharge amount must be between ${minAllowed} and ${maxAllowed} USDT`,
            status: false
        });
    }

    const price = String(money)
    const orderId = getRechargeOrderId();
    const generateCheckoutURL = true;

    const [settings] = await connection.query("SELECT website_link FROM admin_ac LIMIT 1");
    const siteUrl = settings[0]?.website_link || "https://starworldz.com";
    const returnUrl = config?.return_url || `${siteUrl}/wallet/rechargerecord`;
    const userid = String(userInfo.id_user);


    // Validate request body
    // if (!coinId || !price || !orderId || !chain || !userid) {
    //     return res.status(400).send('coinId, price, orderId, chain, and userid are required');
    // }

    try {
        // Fetch coin details to validate the provided `coinId`
        const coinList = await fetchCoinList();
        if (!coinList || coinList.code !== 10000) {
            return res.status(500).send('Error fetching coin list');
        }
        console.log(coinList.data.coins)
        const coin = coinList.data.coins.find(coin => coin.coinId === coinId);
        console.log(coin)
        if (!coin) {
            return res.status(404).send('Invalid coinId provided');
        }
        // Create request payload
        const args = JSON.stringify({
            coinId,
            price,
            orderId,
            chain,
            generateCheckoutURL,
            returnUrl,
        });

        const timestamp = Math.floor(Date.now() / 1000);
        const signText = appId + timestamp + args;
        // Generate signature for request
        const sign = crypto
            .createHmac('sha256', appSecret)
            .update(signText)
            .digest('hex');

        console.log("--- createDeposit Request ---");
        console.log("AppId:", appId);
        console.log("Timestamp:", timestamp);
        console.log("Args (Body):", args);
        console.log("SignText:", signText);
        console.log("Generated Sign:", sign);

        // Request options
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Appid': appId,
                'Sign': sign,
                'Timestamp': timestamp.toString(),
            },
            data: args,
            url: 'https://ccpayment.com/ccpayment/v2/createAppOrderDepositAddress',
        };

        console.log("Request Headers:", JSON.stringify(options.headers, null, 2));

        // Make API call to CCPayment
        const response = await axios(options);
        console.log("API Response Status:", response.status);
        console.log("API Response Data:", JSON.stringify(response.data, null, 2));

        const jsonResponse = response.data;
        console.log("CCPayment API Response for createDeposit:", JSON.stringify(jsonResponse, null, 2));

        if (jsonResponse.code === 10000) {
            const { address, amount, memo, checkoutUrl, confirmsNeeded } = jsonResponse.data;

            console.log("User Info:", userInfo)

            const now = moment();

            // const newRecharge = {
            //   orderId: orderId,
            //   transactionId: "NULL",
            //   utr: 0,
            //   phone: userInfo.phone,
            //   userId: userInfo.id_user,
            //   money: Number(money) * 93,
            //   type: "USDT",
            //   status: 0,
            //   today: rechargeTable.getCurrentTimeForTodayField(),
            //   url: "NULL",
            //   time: rechargeTable.getCurrentTimeForTimeField(),
            // };
            const [adminConfig] = await connection.query("SELECT usdt_exchange_rate FROM admin_ac LIMIT 1");
            const globalExchangeRate = adminConfig[0]?.usdt_exchange_rate || 92;
            console.log("--- createDeposit Exchange Rate Check ---");
            console.log("DB usdt_exchange_rate:", adminConfig[0]?.usdt_exchange_rate);
            console.log("globalExchangeRate Used:", globalExchangeRate);
            console.log("Deposit Amount (USDT):", money);
            console.log("Total INR to be credited:", Number(money) * globalExchangeRate);

            const newRecharge = {
                orderId: orderId,
                transactionId: "NULL",
                utr: 0,
                phone: userInfo.phone,
                userId: userInfo.id_user,
                money: Number(money) * globalExchangeRate,
                type: "USDT",
                status: 0,
                today: rechargeTable.getCurrentTimeForTodayField(),
                url: "NULL",
                time: rechargeTable.getCurrentTimeForTimeField(),
                usdt_amount: Number(money),
                exchange_rate: globalExchangeRate,
            };

            await rechargeTable.create(newRecharge);


            // Insert the deposit data into the ccdeposit table
            const query = `
            INSERT INTO ccdeposit
            (userid, coinid, price, orderid, chain, deposit_address, amount, memo, checkout_url, confirms_needed, status, created_at, updated_at)
            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Processing', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        `;

            const values = [userid, coinId, price, orderId, chain, address, amount, memo, checkoutUrl, confirmsNeeded];

            // Execute the query
            await connection.query(query, values);
            console.log(jsonResponse.data, "jsonResponse")
            // Return success message to the client
            res.status(200).json({
                message: 'Deposit address created and saved successfully',
                data: jsonResponse.data,
            });
        } else {
            // Handle CCPayment API errors
            res.status(400).send(`Error: ${jsonResponse.msg}`);
        }
    } catch (error) {
        console.error('Error processing deposit:', error.message);
        res.status(500).send('Internal server error');
    }

};





const withdrawPath = "https://ccpayment.com/ccpayment/v2/applyAppWithdrawToNetwork";

const createWithdrawal = async (req, res) => {
    const { amount, address, chainType, phone } = req.body;
    // const userToken = req.userToken;

    try {
        const [user] = await connection.query('SELECT `id_user`, `phone`,  FROM users WHERE phone = ? LIMIT 1', [phone]);
        const userInfo = user[0];

        const coinId = 1280; // example: USDT
        const orderId = generateOrderId();
        const chain = chainType === "TRC" ? "TRX" : chainType === "MATIC" ? "POLYGON" : "BSC"; // support for different chains

        const argsObj = {
            coinId,
            address,
            orderId,
            chain,
            amount: String(amount),
        };

        const args = JSON.stringify(argsObj);
        const timestamp = Math.floor(Date.now() / 1000);

        let signText = appId + timestamp + args;
        const sign = crypto.createHmac("sha256", appSecret).update(signText).digest("hex");

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Appid": appId,
                "Sign": sign,
                "Timestamp": timestamp.toString(),
            },
            timeout: 15000,
        };

        // Make request to CCPayment
        const requestResult = await makeCCPaymentRequest(withdrawPath, args, options);

        const responseData = JSON.parse(requestResult);

        if (responseData.code === 10000) {
            const now = moment();
            await connection.query(
                `INSERT INTO ccwithdraw
          (userid, coinid, price, orderid, chain, withdraw_address, amount, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'Processing', ?, ?)`,
                [
                    userInfo.id_user,
                    coinId,
                    amount,
                    orderId,
                    chain,
                    address,
                    amount,
                    now.format("YYYY-MM-DD HH:mm:ss"),
                    now.format("YYYY-MM-DD HH:mm:ss"),
                ]
            );

            return res.status(200).json({
                message: "Withdrawal request submitted successfully.",
                data: responseData.data,
            });
        } else {
            return res.status(400).json({ message: responseData.msg || "Withdrawal failed" });
        }

    } catch (error) {
        console.error("Withdrawal Error:", error);
        return res.status(500).send("Internal Server Error");
    }
};

// Helper for request
const makeCCPaymentRequest = (path, args, options, retryCount = 3) => {
    return new Promise((resolve, reject) => {
        const req = https.request(path, options, (res) => {
            let respData = "";
            res.on("data", chunk => respData += chunk);
            res.on("end", () => resolve(respData));
        });

        req.on("error", (err) => {
            if (err.code === "ETIMEDOUT" && retryCount > 0) {
                setTimeout(() => {
                    resolve(makeCCPaymentRequest(path, args, options, retryCount - 1));
                }, 200);
            } else {
                reject(err);
            }
        });

        req.write(args);
        req.end();
    });
};



function verifySignature(content, signature, app_id, app_secret, timestamp) {
    const signText = `${app_id}${timestamp}${content}`;
    const serverSign = crypto.createHmac('sha256', app_secret).update(signText).digest('hex');

    console.log(serverSign);
    console.log(signature);
    return serverSign === signature;
}


const getOrderInfo = async (orderId) => {
    // Check if orderId is provided
    if (!orderId) {
        throw new Error('orderId is required');
    }

    const args = JSON.stringify({ "orderId": orderId });
    const timestamp = Math.floor(Date.now() / 1000);
    const signText = appId + timestamp + args;

    // Generate the sign using HMAC SHA-256
    const sign = crypto
        .createHmac('sha256', appSecret)
        .update(signText)
        .digest('hex');

    try {
        const response = await axios({
            method: 'POST',
            url: 'https://ccpayment.com/ccpayment/v2/getAppOrderInfo',
            headers: {
                'Content-Type': 'application/json',
                'Appid': appId,
                'Sign': sign,
                'Timestamp': timestamp.toString(),
            },
            data: args
        });

        // Return the parsed response data
        return response.data;
    } catch (error) {
        console.error('Error fetching order info:', error.message);
        throw new Error('Failed to fetch order info');
    }
};

const getUSDTtoINR = async () => {
    try {
        const [adminConfig] = await connection.query("SELECT usdt_exchange_rate FROM admin_ac LIMIT 1");
        const exchangeRate = adminConfig[0]?.usdt_exchange_rate || 92;
        console.log("--- getUSDTtoINR Debug ---");
        console.log("DB raw result:", adminConfig[0]);
        console.log("Using Exchange Rate:", exchangeRate);
        return exchangeRate;
    } catch (error) {
        console.error('Error fetching USDT exchange rate in getUSDTtoINR:', error.message);
        return 92; // Default fallback
    }
};

const ccpaymentNotify = async (req, res) => {
    console.log("Received payment notification");

    const timestamp = req.header('Timestamp');
    const sign = req.header('Sign');
    const content = Object.keys(req.body).length === 0 ? "" : JSON.stringify(req.body);

    console.log("Request Body:", req.body);

    // Verify the signature
    if (!verifySignature(content, sign, appId, appSecret, timestamp)) {
        console.log("Invalid Signature");
        return res.status(401).send('Invalid signature');
    }

    const { type, msg } = req.body;
    console.log("Notification Type:", type, "Message:", msg);

    if (type !== 'ApiDeposit') {
        return res.status(200).json({ msg: 'success' });
    }

    const { recordId, orderId, coinId, coinSymbol, status } = msg;

    try {
        console.log("Fetching user for orderId:", orderId);

        const depositQuery = 'SELECT userid FROM ccdeposit WHERE orderid = ? LIMIT 1';
        const [depositResult] = await connection.query(depositQuery, [orderId]);

        if (depositResult.length === 0) {
            console.log(`No matching deposit found for order ID: ${orderId}`);
            return res.status(404).json({ errorCode: 4, message: 'Deposit record not found' });
        }

        const userId = depositResult[0].userid;
        console.log("User ID found:", userId);

        const [userRows] = await connection.query('SELECT * FROM users WHERE id_user = ?', [userId]);

        if (userRows.length === 0) {
            console.log("User not found for ID:", userId);
            return res.status(404).json({ errorCode: 4, message: 'User not found' });
        }

        const user = userRows[0];

        console.log("Fetching order details...");
        const orderInfo = await getOrderInfo(orderId);

        if (!orderInfo?.data?.paidList?.length) {
            console.log("No payments found for this order");
            return res.status(200).json({ message: 'No payments found' });
        }

        console.log("Processing payments...");
        for (const payment of orderInfo.data.paidList) {
            if (payment.status !== 'Success') {
                console.log(`Payment status is ${payment.status} for order ${orderId}`);
                await connection.query(
                    'UPDATE ccdeposit SET status = ?, currentUsdtPrice = ? WHERE orderid = ?',
                    [payment.status, 0, orderId]
                );
                continue;
            }

            console.log("Processing successful payment...");
            const amount = parseFloat(payment.amount);
            const coinSymbolLower = coinSymbol.toLowerCase();

            // Get USDT to INR conversion rate
            const currentUsdtPrice = await getUSDTtoINR();
            if (!currentUsdtPrice) {
                return res.status(500).json({
                    errorCode: 5,
                    message: 'Unable to fetch current USDT to INR price',
                });
            }

            // Ensure deposit is not already processed
            const [isData] = await connection.query(
                'SELECT * FROM ccdeposit WHERE status = ? AND orderid = ?',
                ['Success', orderId]
            );

            if (isData.length > 0) {
                console.log(`Deposit for orderId ${orderId} already processed.`);
                return res.status(200).json({ message: 'Deposit already processed' });
            }

            // Calculate new balance
            const depositAmountInUsdtToInr = amount * currentUsdtPrice;
            console.log("--- ccpaymentNotify Calculation ---");
            console.log("Payment Amount from CCPayment:", amount);
            console.log("Current USDT Price from getUSDTtoINR:", currentUsdtPrice);
            console.log("Resulting INR Amount:", depositAmountInUsdtToInr);

            // Get recharge record before update
            let [rechargeRows] = await connection.query(`SELECT * from recharge where id_order = ?`, [orderId]);
            if (rechargeRows.length === 0) {
                console.log("Recharge record not found for order:", orderId);
                return res.status(404).json({ message: 'Recharge record not found' });
            }
            const rechargeRecord = rechargeRows[0];
            console.log("Recharge record found:", rechargeRecord);

            // 1. Update status to Success FIRST to prevent race conditions and include in count
            await connection.query(
                'UPDATE ccdeposit SET status = ?, currentUsdtPrice = ? WHERE orderid = ?',
                ['Success', currentUsdtPrice, orderId]
            );

            await connection.query(
                'UPDATE recharge SET status = ? WHERE id_order = ?',
                [1, orderId]
            );

            // 2. Then add balance and bonuses
            console.log(`Calling addUserAccountBalance for user ${user.phone} with money ${rechargeRecord.money || depositAmountInUsdtToInr}`);
            await addUserAccountBalance({
                money: rechargeRecord.money || depositAmountInUsdtToInr,
                phone: user.phone,
                invite: user.invite,
                rechargeId: rechargeRecord.id
            });

            console.log(`Successfully processed deposit for user ${userId}`);

            console.log(`Deposit processed successfully for orderId: ${orderId}`);
        }

        res.status(200).send('success');
    } catch (error) {
        console.error('Error handling payment notification:', error.message);
        res.status(500).send('Internal server error');
    }
};
const ccpaymentNotifyWithdraw = async (req, res) => {
    console.log("Received payment notification");

    const timestamp = req.header('Timestamp');
    const sign = req.header('Sign');
    const content = Object.keys(req.body).length === 0 ? "" : JSON.stringify(req.body);

    console.log("Request Body:", req.body);

    // Verify the signature
    if (!verifySignature(content, sign, appId, appSecret, timestamp)) {
        console.log("Invalid Signature");
        return res.status(401).send('Invalid signature');
    }

    const { type, msg } = req.body;
    console.log("Notification Type:", type, "Message:", msg);

    if (type !== 'ApiDeposit') {
        return res.status(200).json({ msg: 'success' });
    }

    const { recordId, orderId, coinId, coinSymbol, status } = msg;

    try {
        console.log("Fetching user for orderId:", orderId);

        const depositQuery = 'SELECT userid FROM ccdeposit WHERE orderid = ? LIMIT 1';
        const [depositResult] = await connection.query(depositQuery, [orderId]);

        if (depositResult.length === 0) {
            console.log(`No matching deposit found for order ID: ${orderId}`);
            return res.status(404).json({ errorCode: 4, message: 'Deposit record not found' });
        }

        const userId = depositResult[0].userid;
        console.log("User ID found:", userId);

        const [userRows] = await connection.query('SELECT * FROM users WHERE id_user = ?', [userId]);

        if (userRows.length === 0) {
            console.log("User not found for ID:", userId);
            return res.status(404).json({ errorCode: 4, message: 'User not found' });
        }

        const user = userRows[0];

        console.log("Fetching order details...");
        const orderInfo = await getOrderInfo(orderId);

        if (!orderInfo?.data?.paidList?.length) {
            console.log("No payments found for this order");
            return res.status(200).json({ message: 'No payments found' });
        }

        console.log("Processing payments...");
        for (const payment of orderInfo.data.paidList) {
            if (payment.status !== 'Success') {
                console.log(`Payment status is ${payment.status} for order ${orderId}`);
                await connection.query(
                    'UPDATE ccdeposit SET status = ?, currentUsdtPrice = ? WHERE orderid = ?',
                    [payment.status, 0, orderId]
                );
                continue;
            }

            console.log("Processing successful payment...");
            const amount = parseFloat(payment.amount);
            const coinSymbolLower = coinSymbol.toLowerCase();

            // Get USDT to INR conversion rate
            const currentUsdtPrice = await getUSDTtoINR();
            if (!currentUsdtPrice) {
                return res.status(500).json({
                    errorCode: 5,
                    message: 'Unable to fetch current USDT to INR price',
                });
            }

            // Ensure deposit is not already processed
            const [isData] = await connection.query(
                'SELECT * FROM ccdeposit WHERE status = ? AND orderid = ?',
                ['Success', orderId]
            );

            if (isData.length > 0) {
                console.log(`Deposit for orderId ${orderId} already processed.`);
                return res.status(200).json({ message: 'Deposit already processed' });
            }

            // Calculate new balance
            const depositAmountInUsdtToInr = amount * currentUsdtPrice;
            const updatedBalance = Number(user.money) + depositAmountInUsdtToInr;
            const updatedDepositBalance = Number(user.actual_total_deposit_amount) + depositAmountInUsdtToInr;

            // Update user balance
            // await connection.query(
            //     'UPDATE users SET money = ?, actual_total_deposit_amount = ? WHERE id_user = ?',
            //     [updatedBalance, updatedDepositBalance, userId]
            // );

            console.log(`Added ${depositAmountInUsdtToInr} INR to user ${userId}`);

            // Update deposit status
            await connection.query(
                'UPDATE ccdeposit SET status = ?, currentUsdtPrice = ? WHERE orderid = ?',
                ['Success', currentUsdtPrice, orderId]
            );

            // Update recharge status
            await connection.query(
                'UPDATE recharge SET status = ? WHERE id_order = ?',
                [1, orderId]
            );

            let [rechargeId] = await connection.query(`SELECT * from recharge where id_order = ?`, [orderId])


            // Add to user account balance tracking
            await addUserAccountBalance({
                phone: user.phone,
                money: rechargeId[0].money || depositAmountInUsdtToInr,
                code: user.code,
                invite: user.invite,
                rechargeId: rechargeId[0].id
            });

            console.log(`Deposit processed successfully for orderId: ${orderId}`);
        }

        res.status(200).send('success');
    } catch (error) {
        console.error('Error handling payment notification:', error.message);
        res.status(500).send('Internal server error');
    }
};

const ccpaymentController = {
    fetchCoinDetails,
    createDeposit,
    ccpaymentNotify,
    createWithdrawal,
    ccpaymentNotifyWithdraw
};

export default ccpaymentController;
