import connection from "../config/connectDB.js";

/**
 * Centralized User Stats Helper
 * Aggregates financial data across multiple platforms and gateways.
 */
const userStatsHelper = {
    /**
     * Get total successful deposits across all sources (Recharge + Crypto)
     */
    async getDepositStats(phone, startTime = null, endTime = null) {
        try {
            let timeFilter = "";
            let params = [phone];

            if (startTime && endTime) {
                timeFilter = " AND time BETWEEN ? AND ?";
                params.push(startTime, endTime);
            }

            const [recharge] = await connection.query(
                `SELECT SUM(money) as totalAmount, COUNT(*) as totalCount FROM recharge WHERE phone = ? AND status = 1${timeFilter}`,
                params
            );

            return {
                totalAmount: parseFloat(recharge[0]?.totalAmount) || 0,
                totalCount: parseInt(recharge[0]?.totalCount) || 0
            };
        } catch (error) {
            console.error("getDepositStats error:", error);
            return { totalAmount: 0, totalCount: 0 };
        }
    },

    /**
     * Get total successful withdrawals
     */
    async getWithdrawalStats(phone, startTime = null, endTime = null) {
        try {
            let timeFilter = "";
            let params = [phone];

            if (startTime && endTime) {
                timeFilter = " AND time BETWEEN ? AND ?";
                params.push(startTime, endTime);
            }

            const [withdraw] = await connection.query(
                `SELECT SUM(money) as totalAmount, COUNT(*) as totalCount FROM withdraw WHERE phone = ? AND status = 1${timeFilter}`,
                params
            );

            return {
                totalAmount: parseFloat(withdraw[0]?.totalAmount) || 0,
                totalCount: parseInt(withdraw[0]?.totalCount) || 0
            };
        } catch (error) {
            console.error("getWithdrawalStats error:", error);
            return { totalAmount: 0, totalCount: 0 };
        }
    },

    /**
     * Get total betting statistics across all game platforms
     */
    /**
     * Get total betting statistics across all game platforms
     */
    async getBettingStats(phone, startTime = null, endTime = null) {
        try {
            const [user] = await connection.query("SELECT id_user FROM users WHERE phone = ? LIMIT 1", [phone]);
            if (!user.length) return { totalAmount: 0, totalCount: 0, totalWinAmount: 0, breakdown: {} };
            const userId = user[0].id_user;

            let timeFilter = "", params = [phone];
            if (startTime && endTime) {
                timeFilter = " AND time BETWEEN ? AND ?";
                params.push(startTime, endTime);
            }

            let breakdown = {
                wingo: { bet: 0, win: 0, count: 0 },
                k3: { bet: 0, win: 0, count: 0 },
                game5d: { bet: 0, win: 0, count: 0 },
                trx: { bet: 0, win: 0, count: 0 },
                jilli: { bet: 0, win: 0, count: 0 },
                spribe: { bet: 0, win: 0, count: 0 },
                wc: { bet: 0, win: 0, count: 0 }
            };

            const internalGamesMap = {
                'minutes_1': 'wingo',
                'result_k3': 'k3',
                'result_5d': 'game5d',
                'trx_wingo_bets': 'trx'
            };

            let totalBetAmount = 0;
            let totalWinAmount = 0;
            let totalBetCount = 0;

            const internalGames = [
                { table: 'minutes_1', betCol: 'money + fee', winCol: 'get' },
                { table: 'result_k3', betCol: 'money', winCol: 'get' },
                { table: 'result_5d', betCol: 'money', winCol: 'get' },
                { table: 'trx_wingo_bets', betCol: 'money + fee', winCol: 'get' }
            ];

            for (const item of internalGames) {
                try {
                    const [rows] = await connection.query(`SELECT SUM(${item.betCol}) as totalBet, SUM(${item.winCol}) as totalWin, COUNT(*) as totalCount FROM ${item.table} WHERE phone = ?${timeFilter}`, params);
                    const b = parseFloat(rows[0]?.totalBet) || 0;
                    const w = parseFloat(rows[0]?.totalWin) || 0;
                    const c = parseInt(rows[0]?.totalCount) || 0;
                    
                    totalBetAmount += b;
                    totalWinAmount += w;
                    totalBetCount += c;

                    const key = internalGamesMap[item.table];
                    if (key) {
                        breakdown[key] = { bet: b, win: w, count: c };
                    }
                } catch (e) { /* Table might not exist */ }
            }

            // External / API Games
            try {
                let jilliFilter = startTime && endTime ? " AND today BETWEEN FROM_UNIXTIME(?/1000) AND FROM_UNIXTIME(?/1000)" : "";
                const [jilli] = await connection.query(`SELECT SUM(betAmount) as totalBet, SUM(winAmount) as totalWin, COUNT(*) as totalCount FROM jilliebethistory WHERE phone = ?${jilliFilter}`, startTime && endTime ? [phone, startTime, endTime] : [phone]);
                const b = parseFloat(jilli[0]?.totalBet) || 0;
                const w = parseFloat(jilli[0]?.totalWin) || 0;
                const c = parseInt(jilli[0]?.totalCount) || 0;
                
                totalBetAmount += b;
                totalWinAmount += w;
                totalBetCount += c;
                breakdown.jilli = { bet: b, win: w, count: c };
            } catch (e) {}

            try {
                let spribeFilter = startTime && endTime ? " AND today BETWEEN FROM_UNIXTIME(?/1000) AND FROM_UNIXTIME(?/1000)" : "";
                const [spribe] = await connection.query(`SELECT SUM(deposit_amount) as totalBet, SUM(withdrawal_amount) as totalWin, COUNT(*) as totalCount FROM spribetransaction WHERE phone = ?${spribeFilter}`, startTime && endTime ? [phone, startTime, endTime] : [phone]);
                const b = parseFloat(spribe[0]?.totalBet) || 0;
                const w = parseFloat(spribe[0]?.totalWin) || 0;
                const c = parseInt(spribe[0]?.totalCount) || 0;

                totalBetAmount += b;
                totalWinAmount += w;
                totalBetCount += c;
                breakdown.spribe = { bet: b, win: w, count: c };
            } catch (e) {}

            try {
                let wcTimeFilter = startTime && endTime ? " AND created_at BETWEEN FROM_UNIXTIME(?/1000) AND FROM_UNIXTIME(?/1000)" : "";
                const [wc] = await connection.query(`SELECT SUM(amount) as totalBet FROM wc_api_transactions WHERE user_id = ? AND type = 'debit' AND is_cancel = 0${wcTimeFilter}`, startTime && endTime ? [userId, startTime, endTime] : [userId]);
                const [wcWin] = await connection.query(`SELECT SUM(amount) as totalWin FROM wc_api_transactions WHERE user_id = ? AND type = 'credit' AND is_cancel = 0${wcTimeFilter}`, startTime && endTime ? [userId, startTime, endTime] : [userId]);
                const b = parseFloat(wc[0]?.totalBet) || 0;
                const w = parseFloat(wcWin[0]?.totalWin) || 0;

                totalBetAmount += b;
                totalWinAmount += w;
                breakdown.wc = { bet: b, win: w, count: 0 };
            } catch (e) {}

            return { 
                totalAmount: parseFloat(totalBetAmount.toFixed(2)), 
                totalWinAmount: parseFloat(totalWinAmount.toFixed(2)), 
                totalCount: totalBetCount,
                breakdown
            };
        } catch (error) {
            console.error("getBettingStats error:", error);
            return { totalAmount: 0, totalCount: 0, totalWinAmount: 0 };
        }
    },

    /**
     * Get statistics for multiple users in bulk
     */
    async getBulkUserStats(phones, startTime = null, endTime = null) {
        if (!phones || phones.length === 0) return {};

        try {
            const results = {};
            const moment = (await import('moment')).default; // Import moment if not available
            
            phones.forEach(p => {
                results[p] = {
                    deposit: { total: 0, today: 0, yesterday: 0 },
                    bet: { total: 0, today: 0, yesterday: 0 },
                    withdraw: { total: 0, today: 0, yesterday: 0 }
                };
            });

            const todayStart = moment().startOf('day').valueOf();
            const todayEnd = moment().endOf('day').valueOf();
            const yesterdayStart = moment().subtract(1, 'days').startOf('day').valueOf();
            const yesterdayEnd = moment().subtract(1, 'days').endOf('day').valueOf();

            // Helper for bulk queries
            const runBulkQuery = async (table, phoneCol, valCol, statusCol = null, statusVal = null, timeCol = null, timeStart = null, timeEnd = null) => {
                let query = `SELECT ${phoneCol}, SUM(${valCol}) as total FROM ${table} WHERE ${phoneCol} IN (?)`;
                let params = [phones];
                if (statusCol) {
                    query += ` AND ${statusCol} = ?`;
                    params.push(statusVal);
                }
                if (timeCol && timeStart && timeEnd) {
                    query += ` AND ${timeCol} BETWEEN ? AND ?`;
                    params.push(timeStart, timeEnd);
                }
                query += ` GROUP BY ${phoneCol}`;
                
                try {
                    const [rows] = await connection.query(query, params);
                    return rows;
                } catch (e) { return []; }
            };

            // 1. Deposits
            const [depTotal, depToday, depYest] = await Promise.all([
                runBulkQuery('recharge', 'phone', 'money', 'status', 1),
                runBulkQuery('recharge', 'phone', 'money', 'status', 1, 'time', todayStart, todayEnd),
                runBulkQuery('recharge', 'phone', 'money', 'status', 1, 'time', yesterdayStart, yesterdayEnd)
            ]);

            depTotal.forEach(r => { if(results[r.phone]) results[r.phone].deposit.total = parseFloat(r.total) || 0; });
            depToday.forEach(r => { if(results[r.phone]) results[r.phone].deposit.today = parseFloat(r.total) || 0; });
            depYest.forEach(r => { if(results[r.phone]) results[r.phone].deposit.yesterday = parseFloat(r.total) || 0; });

            // 2. Withdrawals
            const [wdTotal, wdToday, wdYest] = await Promise.all([
                runBulkQuery('withdraw', 'phone', 'money', 'status', 1),
                runBulkQuery('withdraw', 'phone', 'money', 'status', 1, 'time', todayStart, todayEnd),
                runBulkQuery('withdraw', 'phone', 'money', 'status', 1, 'time', yesterdayStart, yesterdayEnd)
            ]);

            wdTotal.forEach(r => { if(results[r.phone]) results[r.phone].withdraw.total = parseFloat(r.total) || 0; });
            wdToday.forEach(r => { if(results[r.phone]) results[r.phone].withdraw.today = parseFloat(r.total) || 0; });
            wdYest.forEach(r => { if(results[r.phone]) results[r.phone].withdraw.yesterday = parseFloat(r.total) || 0; });

            // 3. Bets (Internal Games)
            const betTables = [
                { table: 'minutes_1', betCol: 'money + fee' },
                { table: 'result_k3', betCol: 'money' },
                { table: 'result_5d', betCol: 'money' },
                { table: 'trx_wingo_bets', betCol: 'money + fee' }
            ];

            for (const item of betTables) {
                const [bTotal, bToday, bYest] = await Promise.all([
                    runBulkQuery(item.table, 'phone', item.betCol),
                    runBulkQuery(item.table, 'phone', item.betCol, null, null, 'time', todayStart, todayEnd),
                    runBulkQuery(item.table, 'phone', item.betCol, null, null, 'time', yesterdayStart, yesterdayEnd)
                ]);
                bTotal.forEach(r => { if(results[r.phone]) results[r.phone].bet.total += parseFloat(r.total) || 0; });
                bToday.forEach(r => { if(results[r.phone]) results[r.phone].bet.today += parseFloat(r.total) || 0; });
                bYest.forEach(r => { if(results[r.phone]) results[r.phone].bet.yesterday += parseFloat(r.total) || 0; });
            }

            return results;
        } catch (error) {
            console.error("getBulkUserStats error:", error);
            return {};
        }
    }
};

export default userStatsHelper;
