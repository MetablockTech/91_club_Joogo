import connection from "../config/connectDB.js";
import commissionController from "./commissionController.js";
import jwt from 'jsonwebtoken';
import md5 from "md5";
import axios from 'axios';
import CryptoJS from 'crypto-js';

// const API_URL = 'https://uat-wb-api4.jlfafafa3.com/';
// const API_URL = 'https://uat-wb-api.jlfafafa2.com/api1/';
// const AGENT_ID = 'goldenlottery_RkWin2';
// const AGENT_KEY = 'd27d1bb3537e21807768a21a6d34c17c73d09254';


// DelightFun_777lotteryslot
// https://uat-wb-api-2.jismk2u.com/api1/
// agentkey - bbaa1e5bca6a94df1f4c4fb0b43c09c1d56aa9d0

// const API_URL = 'https://uat-wb-api-2.jismk2u.com/api1/';
// const AGENT_ID = 'DelightFun_777lotteryslot';
// const AGENT_KEY = 'bbaa1e5bca6a94df1f4c4fb0b43c09c1d56aa9d0';

const API_URL = 'https://wb-api-2.huuykk865s.com/api1/';
const AGENT_ID = 'Delightfun_777lotteryslot';
const AGENT_KEY = '2e2214dc65caf15100d53f37924813ad342f441f';


const jillieAuth = async (req, res) => {
    const { reqId, token } = req.body;
    try {
        // Find the user in the database using the provided token
        const [userRows] = await connection.query('SELECT * FROM users WHERE token = ?', [token]);

        // Check if user exists
        if (!userRows.length) {
            return res.status(404).json({
                errorCode: 4,
                message: 'Token expired or invalid',
            });
        }

        const user = userRows[0];
        const [settingsRows] = await connection.query("SELECT `currency_name` FROM `admin_ac` LIMIT 1");
        const currencyName = settingsRows[0]?.currency_name || "INR";

        // Send a success response with dynamic currency
        const response = {
            errorCode: 0,
            message: 'Success',
            username: user.name_user,
            currency: currencyName, 
            balance: user.money, 
            token: token
        };

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            errorCode: 5,
            message: 'Other errors; see message for detail',
            detail: error.message
        });
    }
};

const jillieBet = async (req, res) => {
    const {
        reqId, token, currency, game, round, wagersTime, 
        betAmount, winloseAmount, isFreeRound, userId, transactionId
    } = req.body;

    console.log(req.body, "jilliebet");

    try {
        // Find the user in the database using the provided token
        const [userRows] = await connection.query('SELECT * FROM users WHERE token = ?', [token]);

        if (!userRows.length) {
            return res.status(404).json({
                errorCode: 4,
                message: 'Token expired or invalid',
            });
        }

        console.log("User found");

        const user = userRows[0];
        const currentBalance = parseFloat(user.money);
        let updatedBalance = currentBalance;

        let winningWalletBalance = parseFloat(user.winning_wallet_balance) || 0;
        let jillieTotalWinningAmount = parseFloat(user.jillie_totalWinningAmount) || 0;
        let totalWinningAmountBalance = parseFloat(user.totalWinningAmount) || 0;

        // Fetch the admin commission percentage (currently hard-coded to 0)
        const adminCommission = 0;
        console.log(adminCommission, "adminCommission");

        let netWinAmount = parseFloat(winloseAmount) || 0;

        // Calculate net win amount after subtracting admin commission
        if (adminCommission > 0) {
            netWinAmount -= (netWinAmount * adminCommission) / 100;
            console.log(netWinAmount, "netWinAmount after admin commission");
        }

        // Ensure the user has enough balance to place the bet
        if (updatedBalance >= betAmount) {
            // Update the balance by subtracting the bet amount and adding the net win amount
            updatedBalance = updatedBalance - parseFloat(betAmount) + netWinAmount;

            // Update winning-related balances
            const newWinningWalletBalance = winningWalletBalance + netWinAmount;
            const newJillieTotalWinningAmount = jillieTotalWinningAmount + netWinAmount;
            const newTotalWinningAmount = totalWinningAmountBalance + netWinAmount;

            console.log(updatedBalance, "updatedBalance");
            console.log(newWinningWalletBalance, "newWinningWalletBalance");
            console.log(newJillieTotalWinningAmount, "newJillieTotalWinningAmount");
            console.log(newTotalWinningAmount, "newTotalWinningAmount");

            // Update user balance in the database
            await connection.query(
                'UPDATE users SET money = ?, winning_wallet_balance = ?, jillie_totalWinningAmount = ?, totalWinningAmount = ? WHERE token = ?',
                [updatedBalance, newWinningWalletBalance, newJillieTotalWinningAmount, newTotalWinningAmount, token]
            );

            console.log("Bet history record start");
            // Insert the bet history
            // await connection.query(
            //     'INSERT INTO jilliebethistory (id_user, phone, token, name_user, gameCode, betAmount, moneyAfterBet, moneyBeforeBet, winAmount, adminCommission, round, wagersTime, today) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            //     [
            //         user.id_user, user.phone, token, user.name_user, game, betAmount,
            //         updatedBalance, currentBalance, winloseAmount, adminCommission,
            //         round, wagersTime, new Date()
            //     ]
            // );

            console.log("Bet history recorded");

            const [settingsRows] = await connection.query("SELECT `currency_name` FROM `admin_ac` LIMIT 1");
            const currencyName = settingsRows[0]?.currency_name || "INR";

            // Respond with success
            return res.status(200).json({
                errorCode: 0,
                message: 'Bet placed successfully',
                username: user.name_user,
                currency: currencyName,
                balance: updatedBalance,
                txId: transactionId,
                token: token
            });
        } else {
            // Insufficient balance
            return res.status(400).json({
                errorCode: 2,
                message: 'Not enough balance',
            });
        }
    } catch (error) {
        console.error("Error processing bet:", error);
        return res.status(500).json({
            errorCode: 5,
            message: 'Other errors; see message for detail',
            detail: error.message,
        });
    }
};

const jillieCancelBet = async (req, res) => {
    const { reqId, currency, game, round, betAmount, winloseAmount, userId, token } = req.body;
    console.log(req.body, "cancelBet")
    try {
        // Find the user in the database using the provided token
        const [userRows] = await connection.query('SELECT * FROM users WHERE token = ?', [token]);

        if (!userRows.length) {
            return res.status(404).json({
                errorCode: 4,
                message: 'Token expired or invalid',
            });
        }

        const user = userRows[0];
        let updatedBalance = parseFloat(user.money) + parseFloat(betAmount) - parseFloat(winloseAmount);

        if (updatedBalance < 0) {
            return res.status(400).json({
                errorCode: 6,
                message: 'Cancel refused: insufficient balance',
            });
        }

        // Update the user balance in the database
        await connection.query('UPDATE users SET money = ? WHERE token = ?', [updatedBalance, token]);

        const [settingsRows] = await connection.query("SELECT `currency_name` FROM `admin_ac` LIMIT 1");
        const currencyName = settingsRows[0]?.currency_name || "INR";

        const response = {
            errorCode: 0,
            message: 'Success',
            username: user.name_user,
            currency: currencyName,
            balance: updatedBalance,
            txId: round // Assuming txId is the same as round for simplicity
        };

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            errorCode: 5,
            message: 'Other errors; see message for detail',
            detail: error.message
        });
    }
};

const jillieSessionBet = async (req, res) => {
    const { 
        reqId, token, currency, game, round, wagersTime, 
        betAmount, winloseAmount, userId, sessionId, type, 
        turnover, preserve 
    } = req.body;

    console.log("session bet");
    try {
        // Find the user in the database using the provided token
        const [userRows] = await connection.query('SELECT * FROM users WHERE token = ?', [token]);

        // Check if user exists
        if (!userRows.length) {
            return res.status(404).json({
                errorCode: 4,
                message: 'Token expired or invalid',
            });
        }

        const user = userRows[0];
        let updatedBalance = parseFloat(user.money);

        // Fetch the admin commission percentage
        const adminCommission = 0; // Replace with actual fetch logic if needed
        console.log(adminCommission, "adminCommission");
        let netWinAmount = parseFloat(winloseAmount);

        if (type === 1) {
            // Bet placement logic
            if (preserve > 0) {
                // With preserve
                if (updatedBalance < preserve) {
                    return res.status(400).json({
                        errorCode: 2,
                        message: 'Insufficient balance',
                    });
                }
                updatedBalance -= preserve;
            } else if (preserve === 0 && betAmount > 0 && winloseAmount === 0) {
                // No preserve
                if (updatedBalance < betAmount) {
                    return res.status(400).json({
                        errorCode: 2,
                        message: 'Insufficient balance',
                    });
                }
                updatedBalance -= betAmount;
            } else {
                return res.status(400).json({
                    errorCode: 3,
                    message: 'Invalid values for bet placement',
                });
            }
        } else if (type === 2) {
            // Bet settlement logic
            if (preserve > 0 && betAmount >= 0 && winloseAmount >= 0) {
                if (adminCommission > 0) {
                    netWinAmount = winloseAmount - (winloseAmount * adminCommission / 100);
                }
                updatedBalance = updatedBalance + preserve - betAmount + netWinAmount;
            } else if (preserve === 0 && betAmount === 0 && winloseAmount >= 0) {
                if (adminCommission > 0) {
                    netWinAmount = winloseAmount - (winloseAmount * adminCommission / 100);
                }
                updatedBalance += parseFloat(netWinAmount);
            } else {
                return res.status(400).json({
                    errorCode: 3,
                    message: 'Invalid values for bet settlement',
                });
            }
        } else {
            return res.status(400).json({
                errorCode: 3,
                message: 'Invalid type value',
            });
        }

        let timeNow = new Date().getTime();
        // Update user balance in the database
        await connection.query(
            `UPDATE users 
             SET 
               money = ?, 
               totalBetAmount = totalBetAmount + ?,
               jillie_totalWinningAmount = jillie_totalWinningAmount + ? 
             WHERE token = ?`,
            [updatedBalance, betAmount, winloseAmount, token]
          );

        // 7-Level Commission Distribution (Only for Bets)
        if (betAmount > 0) {
            await commissionController.rosesPlus(user.phone, betAmount, 'jilli_game');
            // Update Turnover Statistics
            await commissionController.updateTurnover(user.phone, betAmount, user.code, user.invite);
        }
          
        console.log("User balance updated:", updatedBalance);

        // Log the session into `jilliebethistory`
        // await connection.query(
        //     'INSERT INTO jilliebethistory (id_user, phone, token, name_user, gameCode, betAmount, moneyAfterBet, moneyBeforeBet, winAmount, adminCommission, round, wagersTime, today, time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        //     [
        //         user.id_user, user.phone, token, user.name_user, game, 
        //         betAmount, updatedBalance, user.money, winloseAmount, 
        //         adminCommission, round, wagersTime, new Date(), timeNow
        //     ]
        // );
        console.log("Session logged into jilliebethistory");

        const [settingsRows] = await connection.query("SELECT `currency_name` FROM `admin_ac` LIMIT 1");
        const currencyName = settingsRows[0]?.currency_name || "INR";

        const response = {
            errorCode: 0,
            message: type === 1 ? 'Session bet placed successfully' : 'Session bet settled successfully',
            username: user.name_user,
            currency: currencyName,
            balance: updatedBalance,
            token: token
        };

        return res.status(200).json(response);

    } catch (error) {
        console.error("Error processing session bet:", error);
        return res.status(500).json({
            errorCode: 5,
            message: 'Other errors; see message for detail',
            detail: error.message
        });
    }
};

const jillieCancelSessionBet = async (req, res) => {
    const { reqId, currency, game, round, betAmount, winloseAmount, userId, token, sessionId, type, preserve } = req.body;
    console.log("cancelSessionBet")
    try {
        // Find the user in the database using the provided token
        const [userRows] = await connection.query('SELECT * FROM users WHERE token = ?', [token]);

        if (!userRows.length) {
            return res.status(404).json({
                errorCode: 4,
                message: 'Token expired or invalid',
            });
        }

        const user = userRows[0];
        let updatedBalance;

        if (type === 1) {
            // Handle session bet cancellation
            if (preserve) {
                // Calculate balance after cancel with preserve
                updatedBalance = user.money + preserve;
            } else {
                // Calculate balance after cancel without preserve
                updatedBalance = user.money + betAmount;
            }

            if (updatedBalance < 0) {
                return res.status(400).json({
                    errorCode: 6,
                    message: 'Cancel refused: insufficient balance',
                });
            }

            // Update the user balance and reverse betting stats
            await connection.query('UPDATE users SET money = ?, totalBetAmount = totalBetAmount - ? WHERE token = ?', [updatedBalance, betAmount, token]);

            // Reverse Turnover Statistics
            await commissionController.updateTurnover(user.phone, -betAmount, user.code, user.invite);

            const [settingsRows] = await connection.query("SELECT `currency_name` FROM `admin_ac` LIMIT 1");
            const currencyName = settingsRows[0]?.currency_name || "INR";

            const response = {
                errorCode: 0,
                message: 'Session bet canceled successfully',
                username: user.name_user,
                currency: currencyName,
                balance: updatedBalance,
                txId: sessionId // Assuming txId is the same as sessionId for simplicity
            };

            return res.status(200).json(response);
        } else {
            return res.status(400).json({
                errorCode: 5,
                message: 'Cancel refused: only type 1 sessional bets can be cancelled',
            });
        }
    } catch (error) {
        res.status(500).json({
            errorCode: 5,
            message: 'Other errors; see message for detail',
            detail: error.message
        });
    }
};


const getAllJillieGames = async (req, res) => {
    const params = {
        AgentId: AGENT_ID,
        Key: generateKey({ AgentId: AGENT_ID })
    };

    try {
        const response = await axios.post(`${API_URL}GetGameList`, params);
        return res.json(response.data); // Assuming you want to return JSON response
    } catch (error) {
        console.error('Error fetching game list', error);
        return res.status(500).json({ error: 'Error fetching game list' });
    }
};

const playJillieGame = async (req, res) => {
    const { gameId } = req.body; // Extract gameId from request body
    const userToken = req.userToken;
    // console.log(userToken)
    console.log(gameId, "gameId"); // Check if gameId is correctly received
    const params = {
        Token: String(userToken),  // Replace with your actual access token
        GameId: Number(gameId), // Fixed to correctly access gameId
        Lang: 'en-US',
        HomeUrl: (await connection.query("SELECT website_link FROM admin_ac LIMIT 1"))[0][0]?.website_link || 'https://starworldz.com',
        Platform: 'web',
        AgentId: AGENT_ID,
        Key: generateKey({
            Token: String(userToken),
            GameId: String(gameId), // Fixed to correctly access gameId
            Lang: 'en-US',
            AgentId: AGENT_ID
        })
    };

    try {
        const response = await axios.post(`${API_URL}singleWallet/LoginWithoutRedirect`, params);
        console.log(response.data, "response")
        if (response.data && response.data.Data) {
            console.log(response.data.Data)
            return res.json({ Data: response.data.Data });
        } else {
            console.error('Game URL not found');
            return res.status(400).json({ error: 'Game URL not found' });
        }
    } catch (error) {
        console.error('Error playing game', error);
        return res.status(500).json({ error: 'Error playing game' });
    }
};

const generateKey = (params) => {
    const now = new Date();
    const year = (now.getUTCFullYear() % 100).toString().padStart(2, '0');
    const month = (now.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = now.getUTCDate().toString();

    // Determine if the day is single digit (1-9) or double digit (10-31)
    const formattedDay = day.length === 1 ? day : day.slice(-2);

    const formattedDate = `${year}${month}${formattedDay}`;
    console.log(formattedDate)
    const keyG = md5(`${formattedDate}${AGENT_ID}${AGENT_KEY}`);
    const querystring = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');
    const md5string = md5(querystring + keyG);
    const randomText1 = '123456'; // Replace with a random string generator if needed
    const randomText2 = 'abcdef'; // Replace with a random string generator if needed
    return `${randomText1}${md5string}${randomText2}`;
};


const jillieSinglePlayerHistoryPage = async (req, res) => {
    return res.render("gameApis/jillieGameHistory.ejs");
}

const getSinglePlyerBetRecord = async (req, res) => {
    const userToken = req.userToken;

    const params = {
        Token: String(userToken),
        AgentId: AGENT_ID,
        StartTime: "2024-06-15T03:00:00",
        EndTime: "2024-07-03T03:23:00",
        Page: 1,
        PageLimit: 10002,
        Account: "Member51404",
        Key: generateKey({
            Page: 1,
            StartTime: "2024-06-15T03:00:00",
            EndTime: "2024-07-03T03:23:00",
            Account: "Member51404",
            PageLimit: 10002

        })

    };
    try {
        const response = await axios.post(`${API_URL}GetUserBetRecordByTime`, params);
        console.log(response)
        return response.data;
    } catch (error) {
        console.error('Error fetching bet record summary', error);
        throw error;
    }
};


const jilliGameController = {
    jillieAuth,
    jillieBet,
    jillieCancelBet,
    jillieSessionBet,
    jillieCancelSessionBet,
    getAllJillieGames,
    playJillieGame,
    jillieSinglePlayerHistoryPage,
    getSinglePlyerBetRecord
};

export default jilliGameController;
