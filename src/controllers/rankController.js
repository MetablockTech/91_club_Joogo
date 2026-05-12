import connection from "../config/connectDB.js";
import { yesterdayTime } from "../helpers/games.js";

// Hardcoded thresholds based on the tutorial page requirements
/**
 * Fetches all rank thresholds from the database
 */
const getAllRankThresholds = async () => {
    const [rows] = await connection.query("SELECT * FROM commissions_rebet_ranks ORDER BY level ASC");
    return rows;
};

/**
 * Calculates Yesterday's stats for all users and updates their Rebate Level (users.rebet_level)
 */
const updateUserRanks = async () => {
    console.log("--- Starting Automatic Rank Update Job ---");
    try {
        // 0. Ensure 'rebet_level' column exists
        try {
            await connection.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS rebet_level INT DEFAULT 0");
        } catch (err) {
            if (!err.message.includes("Duplicate column name")) {
                console.log("Note: rebet_level column check handled.");
            }
        }

        const rankThresholds = await getAllRankThresholds();
        const { startOfYesterdayTimestamp, endOfYesterdayTimestamp } = yesterdayTime();

        // 1. Fetch All Users - Using rebet_level
        const [allUsers] = await connection.query("SELECT phone, code, invite, rebet_level FROM users WHERE veri = 1");

        // 2. Fetch Yesterday's Bets (Turnover) across all games
        const [allBets] = await connection.query(`
            SELECT phone, SUM(amount) as total_bet
            FROM (
                SELECT phone, (money + fee) as amount FROM minutes_1 WHERE time BETWEEN ? AND ?
                UNION ALL
                SELECT phone, (money + fee) as amount FROM trx_wingo_bets WHERE time BETWEEN ? AND ?
                UNION ALL
                SELECT phone, (price + fee) as amount FROM result_k3 WHERE time BETWEEN ? AND ?
                UNION ALL
                SELECT phone, (price + fee) as amount FROM result_5d WHERE time BETWEEN ? AND ?
                UNION ALL
                SELECT phone, betAmount as amount FROM jilliebethistory WHERE today BETWEEN FROM_UNIXTIME(?/1000) AND FROM_UNIXTIME(?/1000)
                UNION ALL
                SELECT phone, deposit_amount as amount FROM spribetransaction WHERE today BETWEEN FROM_UNIXTIME(?/1000) AND FROM_UNIXTIME(?/1000)
                UNION ALL
                SELECT u.phone, wc.amount FROM wc_api_transactions wc JOIN users u ON wc.user_id = u.id_user WHERE wc.type = 'debit' AND wc.is_cancel = 0 AND wc.created_at BETWEEN FROM_UNIXTIME(?/1000) AND FROM_UNIXTIME(?/1000)
            ) as combined_bets
            GROUP BY phone
        `, [
            startOfYesterdayTimestamp, endOfYesterdayTimestamp, // minutes_1
            startOfYesterdayTimestamp, endOfYesterdayTimestamp, // trx_wingo
            startOfYesterdayTimestamp, endOfYesterdayTimestamp, // k3
            startOfYesterdayTimestamp, endOfYesterdayTimestamp, // 5d
            startOfYesterdayTimestamp, endOfYesterdayTimestamp, // jilli
            startOfYesterdayTimestamp, endOfYesterdayTimestamp, // spribe
            startOfYesterdayTimestamp, endOfYesterdayTimestamp  // wc
        ]);

        // 3. Fetch Yesterday's Deposits
        const [allDeposits] = await connection.query(`
            SELECT phone, SUM(money) as total_deposit, COUNT(phone) as deposit_count
            FROM recharge 
            WHERE status = 1 AND time BETWEEN ? AND ?
            GROUP BY phone
        `, [startOfYesterdayTimestamp, endOfYesterdayTimestamp]);

        // 4. Create Maps for fast lookup
        const betMap = new Map(allBets.map(b => [b.phone, Number(b.total_bet) || 0]));
        const depositMap = new Map(allDeposits.map(d => [d.phone, Number(d.total_deposit) || 0]));
        const hasDepositedMap = new Map(allUsers.map(u => [u.phone, false]));

        // To count "Team Members", we usually mean members who have ever deposited (Active users)
        const [lifetimeDepositors] = await connection.query("SELECT DISTINCT phone FROM recharge WHERE status = 1");
        lifetimeDepositors.forEach(d => hasDepositedMap.set(d.phone, true));

        // 5. Build Invitation Map
        const inviteMap = new Map();
        allUsers.forEach(u => {
            if (!inviteMap.has(u.invite)) inviteMap.set(u.invite, []);
            inviteMap.get(u.invite).push(u);
        });

        // 6. Calculate Stats per User Recursively
        const userUpdates = [];

        for (const user of allUsers) {
            let teamCount = 0;
            let teamBetting = 0;
            let teamDeposit = 0;

            const getTeamStats = (parentCode, currentDepth) => {
                if (currentDepth > 7) return;
                const subordinates = inviteMap.get(parentCode) || [];
                for (const sub of subordinates) {
                    if (hasDepositedMap.get(sub.phone)) {
                        teamCount++;
                    }
                    teamBetting += betMap.get(sub.phone) || 0;
                    teamDeposit += depositMap.get(sub.phone) || 0;
                    getTeamStats(sub.code, currentDepth + 1);
                }
            };

            getTeamStats(user.code, 1);

            // Determine correct level
            let newLevel = 0;
            for (let i = rankThresholds.length - 1; i >= 0; i--) {
                const t = rankThresholds[i];
                if (teamCount >= t.min_team && teamBetting >= t.min_betting && teamDeposit >= t.min_deposit) {
                    newLevel = t.level;
                    break;
                }
            }

            if (newLevel !== user.rebet_level) {
                userUpdates.push(connection.query("UPDATE users SET rebet_level = ? WHERE phone = ?", [newLevel, user.phone]));
            }
        }

        if (userUpdates.length > 0) {
            await Promise.all(userUpdates);
            console.log(`--- Rank Update Job Finished. Updated ${userUpdates.length} users. ---`);
        } else {
            console.log("--- Rank Update Job Finished. No updates needed. ---");
        }

    } catch (error) {
        console.error("Error in updateUserRanks:", error);
    }
};

export default {
    updateUserRanks,
    getAllRankThresholds
};
