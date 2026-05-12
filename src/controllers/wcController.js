import connection from "../config/connectDB.js";
import axios from "axios";
import commissionController from "./commissionController.js";


let agCode = "";
let agToken = "";
let agSecret = "";
const apiEndpoint = "https://ps9games.com";


import gameList from './WC_Api/wb_game_list.json' with { type: 'json' };


const fetchWCGameList = async (req, res) => {
    try {
        const prdId = req.params.prdId; // Get the product ID from the URL parameter

        if (prdId) {
            // Check if the requested product ID exists in the game list
            if (gameList.game_list[prdId]) {
                return res.status(200).json({
                    status: "success",
                    data: gameList.game_list[prdId], // Return only the requested games
                });
            } else {
                return res.status(404).json({
                    status: "error",
                    message: `No games found for product ID: ${prdId}`,
                });
            }
        }

        // If no prdId is provided, return all games
        return res.status(200).json({
            status: "success",
            data: gameList.game_list,
        });
    } catch (error) {
        console.error("Error fetching game list:", error.message);
        return res.status(500).json({
            status: "error",
            message: "Failed to fetch game list",
        });
    }
};

const fetchAllWCGameList = async (req, res) => {
    const prdId = req.params.prdId;
    try {
        // Assuming 'wb_game_list.json' is located in the root directory or adjust path accordingly.

        return res.status(200).json({
            status: "success",
            data: gameList.game_list,
        });
    } catch (error) {
        console.error("Error fetching game list:", error.message);
        return res.status(500).json({
            status: "error",
            message: "Failed to fetch game list",
        });
    }
};




const WbUserAuthentication = async (req, res) => {
    try {
        const { prd } = req.body;
        console.log(req.body, "")

        const userToken = req.userToken;
        const [userRows] = await connection.query('SELECT id_user FROM users WHERE token = ?', [userToken]);

        if (!userRows.length) {
            return res.status(404).json({
                errorCode: 4,
                message: 'User not found or invalid ID',
            });
        }

        const user_code = userRows[0].id_user;



        const [userQuery] = await connection.query(
            "SELECT * FROM users WHERE id_user= ?",
            [user_code]
        );

        if (!userQuery.length) {
            return res.status(404).json({
                errorCode: 4,
                message: 'User not found or invalid ID',
            });
        }

        const user = userQuery[0];


        const [settingsRows] = await connection.query('SELECT website_link, wc_ag_code, wc_ag_token, wc_ag_secret, currency_name FROM admin_ac LIMIT 1');
        const settings = settingsRows[0] || {};
        const home_url = settings.website_link || "https://starworldz.com";
        const currency = settings.currency_name || "INR";
        const currentAgCode = settings.wc_ag_code || agCode;
        const currentAgToken = settings.wc_ag_token || agToken;

        const body = {
            user: {
                id: Number(user_code),
                name: user.name_user,
                balance: user.money,
                language: "en",
                currency: currency,
                home_url: home_url
            },
            prd,
        };
        console.log(body)
        const headers = {
            "Content-Type": "application/json",
            "ag-code": currentAgCode,
            "ag-token": currentAgToken,
        };

        const response = await axios.post(
            `${apiEndpoint}/auth`,
            body,
            { headers }
        );

        console.log(response)
        const responseData = response.data;
        const whiteCliff_userId = responseData.user_id;

        console.log(responseData)

        if (responseData.status === 1) {
            await connection.query(
                "UPDATE users SET whiteCliff_userId = ? WHERE id_user = ?",
                [whiteCliff_userId, user_code]
            );

            return res.status(200).json({
                message: "User authenticated successfully",
                data: responseData,
            });
        } else {
            return res.status(400).json({
                message: "Authentication failed",
                error: responseData.error,
            });
        }
    } catch (error) {
        console.error("Error during user authentication:", error.message);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

const WbUserBalance = async (req, res) => {
    const { user_id, prd_id, sid } = req.body;
    console.log(req.body, "WbUserBalance")

    const secretKey = req.headers['secret-key'];
    console.log(secretKey, "Received Secret Key");

    try {
        // Find the user in the database using the provided token
        // Find the user in the database using the provided token
        const [settingsRows] = await connection.query('SELECT wc_ag_secret FROM admin_ac LIMIT 1');
        const currentAgSecret = settingsRows[0]?.wc_ag_secret || agSecret;

        if (secretKey !== currentAgSecret) {
            return res.status(200).json({
                status: 0,
                error: "ACCESS_DENIED",
            });
        }

        console.log("first2")
        console.log(user_id)
        const [userQuery] = await connection.query("SELECT * FROM users WHERE whiteCliff_userId= ?", [user_id]);
        if (!userQuery.length) {
            return res.status(200).json({
                status: 0,
                error: "INVALID_USER"
            });
        }

        const user = userQuery[0];



        const response = {
            status: 1,
            balance: user.money,
        };
        console.log(response, "balanceResopose")
        return res.status(200).json(response);
    }

    catch (error) {
        return res.status(200).json({
            status: 0,
            error: 'UNKNOWN_ERROR',
        });
    }
};

const WbUserDebit = async (req, res) => {
    const secretKey = req.headers['secret-key'];
    console.log(req.body, "WbUserDebit");
    const { user_id, amount, prd_id, txn_id, round_id, game_id, table_id, debit_time, credit_amount, sid } = req.body;

    try {
        const [settingsRows] = await connection.query('SELECT wc_ag_secret FROM admin_ac LIMIT 1');
        const currentAgSecret = settingsRows[0]?.wc_ag_secret || agSecret;

        // Validate the secret key
        if (secretKey !== currentAgSecret) {
            return res.status(200).json({
                status: 0,
                error: "ACCESS_DENIED",
            });
        }

        // Check if user exists
        const [userQuery] = await connection.query(
            'SELECT * FROM users WHERE whiteCliff_userId = ?',
            [user_id]
        );

        if (!userQuery.length) {
            return res.status(200).json({
                status: 0,
                error: "INVALID_USER",
            });
        }

        const user = userQuery[0];
        const real_userId = user.id_user;

        // Check if txn_id is already processed (to avoid duplicate debits)
        const [txnQuery] = await connection.query(
            'SELECT * FROM wc_api_transactions WHERE txn_id = ? AND type = ?',
            [txn_id, 'debit']
        );

        if (txnQuery.length) {
            return res.status(200).json({
                status: 0,
                error: 'DUPLICATE_DEBIT',
            });
        }

        const currentBalance = parseFloat(user.money) || 0;
        const debitAmount = parseFloat(amount) || 0;
        const creditAmount = parseFloat(credit_amount) || 0;

        if (currentBalance < debitAmount) {
            return res.status(200).json({
                status: 0,
                error: 'INSUFFICIENT_FUNDS',
            });
        }

        // Deduct amount and update balance atomically
        await connection.query(
            'UPDATE users SET money = money - ? + ?, totalBetAmount = totalBetAmount + ? - ?, wcTotalBetAmount = IFNULL(wcTotalBetAmount, 0) + ? - ? WHERE whiteCliff_userId = ?',
            [debitAmount, creditAmount, debitAmount, creditAmount, debitAmount, creditAmount, String(user_id)]
        );

        // Fetch updated balance for response
        const [updatedUser] = await connection.query('SELECT money FROM users WHERE whiteCliff_userId = ?', [user_id]);
        const newBalance = updatedUser[0]?.money || 0;

        // 7-Level Commission Distribution
        await commissionController.rosesPlus(user.phone, debitAmount, 'api_game');
        
        // Update Turnover Statistics
        await commissionController.updateTurnover(user.phone, debitAmount, user.code, user.invite);

        // // Record the transaction
        await connection.query(
            'INSERT INTO wc_api_transactions (txn_id, user_id, currentBalance, amount, type, prd_id, round_id, game_id, table_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
            [txn_id, real_userId, currentBalance, debitAmount, 'debit', prd_id, round_id, game_id, table_id]
        );

        console.log("Debit success");

        return res.status(200).json({
            status: 1,
            balance: newBalance,
        });
    } catch (error) {
        console.error("Error in WbUserDebit:", error.message);
        return res.status(200).json({
            status: 0,
            error: 'UNKNOWN_ERROR',
        });
    }
};


const WbUserCredit = async (req, res) => {
    const secretKey = req.headers['secret-key'];
    const { user_id, amount, prd_id, txn_id, round_id, is_cancel, credit_time, game_id, sid } = req.body;
    let { table_id } = req.body;

    console.log(req.body, "WbUserCredit");

    try {
        const [settingsRows] = await connection.query('SELECT wc_ag_secret FROM admin_ac LIMIT 1');
        const currentAgSecret = settingsRows[0]?.wc_ag_secret || agSecret;

        // Validate the secret key
        if (secretKey !== currentAgSecret) {
            return res.status(200).json({
                status: 0,
                error: "ACCESS_DENIED",
            });
        }

        // Check if user exists
        const [userQuery] = await connection.query(
            'SELECT * FROM users WHERE whiteCliff_userId = ?',
            [user_id]
        );

        if (!userQuery.length) {
            return res.status(200).json({
                status: 0,
                error: "INVALID_USER",
            });
        }

        const user = userQuery[0];
        const real_userId = user.id_user;
        const currentBalance = parseFloat(user.money) || 0;
        const creditAmount = parseFloat(amount) || 0;

        // Check if txn_id is already processed (to avoid duplicate credits)
        const [txnQuery] = await connection.query(
            'SELECT * FROM wc_api_transactions WHERE txn_id = ? AND type = ?',
            [txn_id, 'credit']
        );

        const [txnQuery2] = await connection.query(
            'SELECT * FROM wc_api_transactions WHERE txn_id = ? AND type = ?',
            [txn_id, 'debit']
        );

        if (txnQuery.length) {
            return res.status(200).json({
                status: 0,
                error: 'DUPLICATE_CREDIT',
            });
        }

        if (!txnQuery2.length) {
            return res.status(200).json({
                status: 0,
                error: 'INVALID_DEBIT',
            });
        }

        // Calculate the new balance
        const newBalance = parseFloat((currentBalance + creditAmount).toFixed(2));


        const winAmount = is_cancel ? 0 : creditAmount;

        await connection.query(
            `UPDATE users 
   SET 
     money = money + ?, 
     totalWinningAmount = totalWinningAmount + ?, 
     wc_totalWinningAmount = wc_totalWinningAmount + ?
   WHERE whiteCliff_userId = ?`,
            [creditAmount, winAmount, winAmount, String(user_id)]
        );

        if (is_cancel) {
            await connection.query(
                'UPDATE users SET totalBetAmount = totalBetAmount - ?, wcTotalBetAmount = IFNULL(wcTotalBetAmount, 0) - ? WHERE whiteCliff_userId = ?',
                [creditAmount, creditAmount, String(user_id)]
            );
            await commissionController.updateTurnover(user.phone, -creditAmount, user.code, user.invite);
        }

        // Fallback for table_id
        if (!table_id) {
            table_id = "1demo";
        }

        // Record the transaction
        await connection.query(
            'INSERT INTO wc_api_transactions (txn_id, user_id, currentBalance, amount, type, prd_id, round_id, game_id, table_id, is_cancel, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
            [txn_id, real_userId, currentBalance, creditAmount, 'credit', prd_id, round_id, game_id, table_id, is_cancel]
        );

        console.log("Credit success");

        return res.status(200).json({
            status: 1,
            balance: newBalance,
        });
    } catch (error) {
        console.error("Error in WbUserCredit:", error.message);
        return res.status(200).json({
            status: 0,
            error: 'UNKNOWN_ERROR',
        });
    }
};


const WbUserResettle = async (req, res) => {
    const secretKey = req.headers['secret-key'];
    const { user_id, amount, prd_id, txn_id, resettlement_time, is_cancel } = req.body;

    console.log(req.body, "WbUserResettle");

    try {
        const [settingsRows] = await connection.query('SELECT wc_ag_secret FROM admin_ac LIMIT 1');
        const currentAgSecret = settingsRows[0]?.wc_ag_secret || agSecret;

        // Validate the secret key
        if (secretKey !== currentAgSecret) {
            return res.status(200).json({
                status: 0,
                error: "ACCESS_DENIED",
            });
        }

        // Check if user exists
        const [userQuery] = await connection.query(
            'SELECT * FROM users WHERE whiteCliff_userId = ?',
            [user_id]
        );

        if (!userQuery.length) {
            return res.status(200).json({
                status: 0,
                error: "INVALID_USER",
            });
        }

        const user = userQuery[0];
        const real_userId = user.id_user;
        const creditAmount = parseFloat(amount) || 0;


        // Check if txn_id is already processed (to avoid duplicate resettlements)
        const [txnQuery] = await connection.query(
            'SELECT * FROM wc_api_transactions WHERE txn_id = ? AND type = ?',
            [txn_id, 'resettle']
        );

        const [txnQuery2] = await connection.query(
            'SELECT * FROM wc_api_transactions WHERE txn_id = ? AND type = ?',
            [txn_id, 'debit']
        );

        if (txnQuery.length) {
            return res.status(200).json({
                status: 0,
                error: 'INVALID_CREDIT',
            });
        }

        if (!txnQuery2.length) {
            return res.status(200).json({
                status: 0,
                error: 'INVALID_DEBIT',
            });
        }

        // Add amount and update balance



        const currentBalance = parseFloat(user.money) || 0;
        const newBalance = parseFloat((currentBalance + creditAmount).toFixed(2));

        // await connection.query(
        //     'UPDATE users SET money = ? WHERE whiteCliff_userId = ?',
        //     [newBalance, String(real_userId)]
        // );
        const winAmount = is_cancel ? 0 : creditAmount;
        await connection.query(
            `UPDATE users 
   SET 
     money = money + ?, 
     totalWinningAmount = totalWinningAmount + ?, 
     wc_totalWinningAmount = wc_totalWinningAmount + ?
   WHERE whiteCliff_userId = ?`,
            [creditAmount, winAmount, winAmount, String(user_id)]
        );

        if (is_cancel) {
            await connection.query(
                'UPDATE users SET totalBetAmount = totalBetAmount - ?, wcTotalBetAmount = IFNULL(wcTotalBetAmount, 0) - ? WHERE whiteCliff_userId = ?',
                [creditAmount, creditAmount, String(user_id)]
            );
            await commissionController.updateTurnover(user.phone, -creditAmount, user.code, user.invite);
        }

        // Record the transaction
        await connection.query(
            'INSERT INTO wc_api_transactions (txn_id, user_id,currentBalance, amount, type, prd_id, is_cancel, resettlement_time, created_at) VALUES (?, ?,?, ?, ?, ?, ?, ?, NOW())',
            [txn_id, real_userId, user.money, creditAmount, 'resettle', prd_id, is_cancel, resettlement_time]
        );

        return res.status(200).json({
            status: 1,
            balance: newBalance,
        });
    } catch (error) {
        console.error("Error in WbUserResettle:", error.message);
        return res.status(200).json({
            status: 0,
            error: 'UNKNOWN_ERROR',
        });
    }
};



const WbUserBonus = async (req, res) => {
    const secretKey = req.headers['secret-key'];
    const { user_id, type, amount, prd_id, txn_id, game_id, round_id, sid } = req.body;

    console.log(req.body, "WbUserBonus");

    try {
        const [settingsRows] = await connection.query('SELECT wc_ag_secret FROM admin_ac LIMIT 1');
        const currentAgSecret = settingsRows[0]?.wc_ag_secret || agSecret;

        // Validate the secret key
        if (secretKey !== currentAgSecret) {
            return res.status(200).json({
                status: 0,
                error: "ACCESS_DENIED",
            });
        }

        if (!prd_id) {
            return res.status(200).json({
                status: 0,
                error: "INVALID_PRODUCT",
            });
        }

        // Check if user exists
        const [userQuery] = await connection.query(
            'SELECT * FROM users WHERE whiteCliff_userId = ?',
            [user_id]
        );

        if (!userQuery.length) {
            return res.status(200).json({
                status: 0,
                error: "INVALID_USER",
            });
        }

        const user = userQuery[0];
        const real_userId = user.id_user;
        const creditAmount = parseFloat(amount) || 0;

        // Check if txn_id is already processed (to avoid duplicate bonuses)
        const [txnQuery] = await connection.query(
            'SELECT * FROM wc_api_bonus WHERE txn_id = ?',
            [txn_id]
        );
        if (txnQuery.length) {
            return res.status(200).json({
                status: 0,
                error: 'DUPLICATE_BONUS',
            });
        }



        const currentBalance = parseFloat(user.money) || 0;
        const newBalance = parseFloat((currentBalance + creditAmount).toFixed(2));

        await connection.query(
            'UPDATE users SET money = ? WHERE whiteCliff_userId = ?',
            [newBalance, String(user_id)]
        );

        // Record the transaction
        await connection.query(
            'INSERT INTO wc_api_bonus (user_id, type, amount, prd_id, txn_id, game_id, round_id, sid, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
            [real_userId, type, creditAmount, prd_id, txn_id, game_id, round_id, sid]
        );

        return res.status(200).json({
            status: 1,
            balance: newBalance,
        });
    } catch (error) {
        console.error("Error in WbUserBonus:", error.message);
        return res.status(200).json({
            status: 0,
            error: 'UNKNOWN_ERROR',
        });
    }
};


const wcController = {
    WbUserAuthentication,
    WbUserBalance,
    WbUserDebit,
    WbUserCredit,
    WbUserResettle,
    WbUserBonus,
    fetchWCGameList,
    fetchAllWCGameList
};

export default wcController;

