import connection from "../config/connectDB.js";
import moment from "moment-timezone";

const userStatsCollaborator = {
    /**
     * Get statistics for multiple users in bulk (Extended version for CTV Team)
     */
    async getBulkTeamStats(phones) {
        if (!phones || phones.length === 0) return {};

        try {
            const results = {};
            const todayStart = moment().tz("Asia/Kolkata").startOf('day').valueOf();
            const todayEnd = moment().tz("Asia/Kolkata").endOf('day').valueOf();
            const yesterdayStart = moment().tz("Asia/Kolkata").subtract(1, 'days').startOf('day').valueOf();
            const yesterdayEnd = moment().tz("Asia/Kolkata").subtract(1, 'days').endOf('day').valueOf();

            phones.forEach(p => {
                results[p] = {
                    deposit: { total: 0, today: 0, yesterday: 0 },
                    bet: { total: 0, today: 0, yesterday: 0 },
                    win: { total: 0, today: 0, yesterday: 0 },
                    withdraw: { total: 0, today: 0, yesterday: 0 },
                    reward: { total: 0, today: 0, yesterday: 0 }
                };
            });

            const runBulkQuery = async (table, valCol, statusCol = null, statusVal = null, timeStart = null, timeEnd = null) => {
                let query = `SELECT phone, SUM(${valCol}) as total FROM ${table} WHERE phone IN (?)`;
                let params = [phones];
                if (statusCol) {
                    query += ` AND ${statusCol} = ?`;
                    params.push(statusVal);
                }
                if (timeStart && timeEnd) {
                    query += ` AND time BETWEEN ? AND ?`;
                    params.push(timeStart, timeEnd);
                }
                query += ` GROUP BY phone`;
                
                try {
                    const [rows] = await connection.query(query, params);
                    return rows;
                } catch (e) { return []; }
            };

            // 1. Deposits
            const [depTotal, depToday, depYest] = await Promise.all([
                runBulkQuery('recharge', 'money', 'status', 1),
                runBulkQuery('recharge', 'money', 'status', 1, todayStart, todayEnd),
                runBulkQuery('recharge', 'money', 'status', 1, yesterdayStart, yesterdayEnd)
            ]);
            depTotal.forEach(r => { if(results[r.phone]) results[r.phone].deposit.total = parseFloat(r.total) || 0; });
            depToday.forEach(r => { if(results[r.phone]) results[r.phone].deposit.today = parseFloat(r.total) || 0; });
            depYest.forEach(r => { if(results[r.phone]) results[r.phone].deposit.yesterday = parseFloat(r.total) || 0; });

            // 2. Withdrawals
            const [wdTotal, wdToday, wdYest] = await Promise.all([
                runBulkQuery('withdraw', 'money', 'status', 1),
                runBulkQuery('withdraw', 'money', 'status', 1, todayStart, todayEnd),
                runBulkQuery('withdraw', 'money', 'status', 1, yesterdayStart, yesterdayEnd)
            ]);
            wdTotal.forEach(r => { if(results[r.phone]) results[r.phone].withdraw.total = parseFloat(r.total) || 0; });
            wdToday.forEach(r => { if(results[r.phone]) results[r.phone].withdraw.today = parseFloat(r.total) || 0; });
            wdYest.forEach(r => { if(results[r.phone]) results[r.phone].withdraw.yesterday = parseFloat(r.total) || 0; });

            // 3. Rewards
            const [rewTotal, rewToday, rewYest] = await Promise.all([
                runBulkQuery('claimed_rewards', 'amount', 'status', 1),
                runBulkQuery('claimed_rewards', 'amount', 'status', 1, todayStart, todayEnd),
                runBulkQuery('claimed_rewards', 'amount', 'status', 1, yesterdayStart, yesterdayEnd)
            ]);
            rewTotal.forEach(r => { if(results[r.phone]) results[r.phone].reward.total = parseFloat(r.total) || 0; });
            rewToday.forEach(r => { if(results[r.phone]) results[r.phone].reward.today = parseFloat(r.total) || 0; });
            rewYest.forEach(r => { if(results[r.phone]) results[r.phone].reward.yesterday = parseFloat(r.total) || 0; });

            // 4. Bets & Wins (Internal Games)
            const gameTables = [
                { table: 'minutes_1', betCol: 'money + fee', winCol: 'get' },
                { table: 'result_k3', betCol: 'money', winCol: 'get' },
                { table: 'result_5d', betCol: 'money', winCol: 'get' },
                { table: 'trx_wingo_bets', betCol: 'money + fee', winCol: 'get' }
            ];

            for (const item of gameTables) {
                const [bT, bToday, bYest] = await Promise.all([
                    runBulkQuery(item.table, item.betCol),
                    runBulkQuery(item.table, item.betCol, null, null, todayStart, todayEnd),
                    runBulkQuery(item.table, item.betCol, null, null, yesterdayStart, yesterdayEnd)
                ]);
                const [wT, wToday, wYest] = await Promise.all([
                    runBulkQuery(item.table, item.winCol),
                    runBulkQuery(item.table, item.winCol, null, null, todayStart, todayEnd),
                    runBulkQuery(item.table, item.winCol, null, null, yesterdayStart, yesterdayEnd)
                ]);

                bT.forEach(r => { if(results[r.phone]) results[r.phone].bet.total += parseFloat(r.total) || 0; });
                bToday.forEach(r => { if(results[r.phone]) results[r.phone].bet.today += parseFloat(r.total) || 0; });
                bYest.forEach(r => { if(results[r.phone]) results[r.phone].bet.yesterday += parseFloat(r.total) || 0; });

                wT.forEach(r => { if(results[r.phone]) results[r.phone].win.total += parseFloat(r.total) || 0; });
                wToday.forEach(r => { if(results[r.phone]) results[r.phone].win.today += parseFloat(r.total) || 0; });
                wYest.forEach(r => { if(results[r.phone]) results[r.phone].win.yesterday += parseFloat(r.total) || 0; });
            }

            // 5. Jili (External)
            try {
                const [jT, jToday, jYest] = await Promise.all([
                    runBulkQuery('jilliebethistory', 'betAmount'),
                    runBulkQuery('jilliebethistory', 'betAmount', null, null, todayStart, todayEnd),
                    runBulkQuery('jilliebethistory', 'betAmount', null, null, yesterdayStart, yesterdayEnd)
                ]);
                const [jwT, jwToday, jwYest] = await Promise.all([
                    runBulkQuery('jilliebethistory', 'winAmount'),
                    runBulkQuery('jilliebethistory', 'winAmount', null, null, todayStart, todayEnd),
                    runBulkQuery('jilliebethistory', 'winAmount', null, null, yesterdayStart, yesterdayEnd)
                ]);
                jT.forEach(r => { if(results[r.phone]) results[r.phone].bet.total += parseFloat(r.total) || 0; });
                jToday.forEach(r => { if(results[r.phone]) results[r.phone].bet.today += parseFloat(r.total) || 0; });
                jYest.forEach(r => { if(results[r.phone]) results[r.phone].bet.yesterday += parseFloat(r.total) || 0; });
                jwT.forEach(r => { if(results[r.phone]) results[r.phone].win.total += parseFloat(r.total) || 0; });
                jwToday.forEach(r => { if(results[r.phone]) results[r.phone].win.today += parseFloat(r.total) || 0; });
                jwYest.forEach(r => { if(results[r.phone]) results[r.phone].win.yesterday += parseFloat(r.total) || 0; });
            } catch (e) {}

            // 6. Spribe (External)
            try {
                const [sT, sToday, sYest] = await Promise.all([
                    runBulkQuery('spribetransaction', 'deposit_amount'),
                    runBulkQuery('spribetransaction', 'deposit_amount', null, null, todayStart, todayEnd),
                    runBulkQuery('spribetransaction', 'deposit_amount', null, null, yesterdayStart, yesterdayEnd)
                ]);
                const [swT, swToday, swYest] = await Promise.all([
                    runBulkQuery('spribetransaction', 'withdrawal_amount'),
                    runBulkQuery('spribetransaction', 'withdrawal_amount', null, null, todayStart, todayEnd),
                    runBulkQuery('spribetransaction', 'withdrawal_amount', null, null, yesterdayStart, yesterdayEnd)
                ]);
                sT.forEach(r => { if(results[r.phone]) results[r.phone].bet.total += parseFloat(r.total) || 0; });
                sToday.forEach(r => { if(results[r.phone]) results[r.phone].bet.today += parseFloat(r.total) || 0; });
                sYest.forEach(r => { if(results[r.phone]) results[r.phone].bet.yesterday += parseFloat(r.total) || 0; });
                swT.forEach(r => { if(results[r.phone]) results[r.phone].win.total += parseFloat(r.total) || 0; });
                swToday.forEach(r => { if(results[r.phone]) results[r.phone].win.today += parseFloat(r.total) || 0; });
                swYest.forEach(r => { if(results[r.phone]) results[r.phone].win.yesterday += parseFloat(r.total) || 0; });
            } catch (e) {}

            // 7. WC (External - uses id_user)
            try {
                const [users] = await connection.query("SELECT phone, id_user FROM users WHERE phone IN (?)", [phones]);
                const idToPhone = {};
                users.forEach(u => idToPhone[u.id_user] = u.phone);
                const userIds = users.map(u => u.id_user);

                if (userIds.length > 0) {
                    const runWCBulk = async (type, tStart = null, tEnd = null) => {
                        let q = `SELECT user_id, SUM(amount) as total FROM wc_api_transactions WHERE user_id IN (?) AND type = ? AND is_cancel = 0`;
                        let p = [userIds, type];
                        if (tStart && tEnd) {
                            q += ` AND created_at BETWEEN FROM_UNIXTIME(?/1000) AND FROM_UNIXTIME(?/1000)`;
                            p.push(tStart, tEnd);
                        }
                        q += ` GROUP BY user_id`;
                        const [rows] = await connection.query(q, p);
                        return rows;
                    };

                    const [wcBT, wcBToday, wcBYest] = await Promise.all([
                        runWCBulk('debit'),
                        runWCBulk('debit', todayStart, todayEnd),
                        runWCBulk('debit', yesterdayStart, yesterdayEnd)
                    ]);
                    const [wcWT, wcWToday, wcWYest] = await Promise.all([
                        runWCBulk('credit'),
                        runWCBulk('credit', todayStart, todayEnd),
                        runWCBulk('credit', yesterdayStart, yesterdayEnd)
                    ]);

                    wcBT.forEach(r => { const p = idToPhone[r.user_id]; if(results[p]) results[p].bet.total += parseFloat(r.total) || 0; });
                    wcBToday.forEach(r => { const p = idToPhone[r.user_id]; if(results[p]) results[p].bet.today += parseFloat(r.total) || 0; });
                    wcBYest.forEach(r => { const p = idToPhone[r.user_id]; if(results[p]) results[p].bet.yesterday += parseFloat(r.total) || 0; });
                    wcWT.forEach(r => { const p = idToPhone[r.user_id]; if(results[p]) results[p].win.total += parseFloat(r.total) || 0; });
                    wcWToday.forEach(r => { const p = idToPhone[r.user_id]; if(results[p]) results[p].win.today += parseFloat(r.total) || 0; });
                    wcWYest.forEach(r => { const p = idToPhone[r.user_id]; if(results[p]) results[p].win.yesterday += parseFloat(r.total) || 0; });
                }
            } catch (e) {}

            return results;
        } catch (error) {
            console.error("getBulkTeamStats error:", error);
            return {};
        }
    }
};

export default userStatsCollaborator;
