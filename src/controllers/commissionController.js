import connection from "../config/connectDB.js";
import { generateCommissionId } from "../helpers/games.js";

/**
 * Centralized Commission Referral System
 * Handles multi-level commission payouts based on the beneficiary's agency rank.
 */

const rosesPlus = async (phone, amount, gameType, timeNow = Date.now()) => {
    try {
        // 1. Get transaction user info (who placed the bet)
        const [userResult] = await connection.query(
            "SELECT `phone`, `code`, `invite` FROM users WHERE (phone = ? OR token = ?) AND veri = 1 LIMIT 1",
            [phone, phone]
        );
        const userInfo = userResult[0];
        if (!userInfo) return;

        let currentUplineInviteCode = userInfo.invite;
        
        // Fetch all levels at once to avoid repeated queries
        const [allLevels] = await connection.query("SELECT * FROM level");
        const levelMap = new Map(allLevels.map(l => [l.level, l]));

        // Iterate up to 7 referral levels
        for (let i = 1; i <= 7; i++) {
            if (!currentUplineInviteCode) break;

            // Find the upline (Beneficiary)
            const [uplineResult] = await connection.query(
                "SELECT phone, rebet_level, invite FROM users WHERE code = ? AND veri = 1 LIMIT 1",
                [currentUplineInviteCode]
            );
            const upline = uplineResult[0];
            if (!upline) break;

            // Get commission % for this specific upline's rank (L0, L1, etc.)
            const rankData = levelMap.get(upline.rebet_level) || levelMap.get(0); // Fallback to L0 if rank not found
            const commissionRate = rankData[`f${i}`] || 0; // f1, f2, f3... depending on recursion depth

            if (commissionRate > 0) {
                const commissionMoney = (amount * commissionRate) / 100;
                const commissionId = generateCommissionId();

                // Update Upline Balance and Statistics
                // Note: We use roses_f1, roses_f2 etc. columns if they exist, or just general roses_f
                await connection.execute(
                    `UPDATE users SET 
                        money = money + ?, 
                        roses_f = roses_f + ?, 
                        roses_today = roses_today + ?,
                        promotion_commisions = promotion_commisions + ? 
                     WHERE phone = ?`,
                    [commissionMoney, commissionMoney, commissionMoney, commissionMoney, upline.phone]
                );

                // Insert into commissions record table
                await connection.execute(
                    "INSERT INTO commissions (commission_id, phone, from_user_phone, money, level, time) VALUES (?, ?, ?, ?, ?, ?)",
                    [commissionId, upline.phone, userInfo.phone, commissionMoney, i, timeNow]
                );
            }

            // Move to the next level up
            currentUplineInviteCode = upline.invite;
        }

    } catch (error) {
        console.error("Error in Centralized rosesPlus:", error);
    }
};

const updateTurnover = async (phone, amount, code, invite) => {
    try {
        const [rows] = await connection.query("SELECT daily_turn_over, date_time FROM turn_over WHERE phone = ?", [phone]);
        let dailyTurnover = amount;
        
        if (rows.length > 0) {
            const lastDate = new Date(rows[0].date_time).toDateString();
            const today = new Date().toDateString();
            if (lastDate !== today) {
                // If it's a new day, reset daily stats (daily_deposit is handled in updateDeposit but we can reset both for consistency)
                await connection.execute("UPDATE turn_over SET daily_turn_over = 0, daily_deposit = 0 WHERE phone = ?", [phone]);
                dailyTurnover = amount;
            } else {
                dailyTurnover = parseFloat(rows[0].daily_turn_over) + amount;
            }
        }

        await connection.execute(
            `INSERT INTO turn_over (phone, code, invite, daily_turn_over, total_turn_over, date_time) 
             VALUES (?, ?, ?, ?, ?, NOW()) 
             ON DUPLICATE KEY UPDATE 
             daily_turn_over = ?, 
             total_turn_over = total_turn_over + ?,
             date_time = NOW()`,
            [phone, code, invite, amount, amount, dailyTurnover, amount]
        );
    } catch (error) {
        console.error("Error in updateTurnover:", error);
    }
};

const updateDeposit = async (phone, amount) => {
    try {
        const [userRows] = await connection.query("SELECT code, invite FROM users WHERE phone = ?", [phone]);
        if (userRows.length === 0) return;
        const { code, invite } = userRows[0];

        const [rows] = await connection.query("SELECT daily_deposit, date_time FROM turn_over WHERE phone = ?", [phone]);
        let dailyDeposit = amount;
        
        if (rows.length > 0) {
            const lastDate = new Date(rows[0].date_time).toDateString();
            const today = new Date().toDateString();
            if (lastDate !== today) {
                await connection.execute("UPDATE turn_over SET daily_turn_over = 0, daily_deposit = 0 WHERE phone = ?", [phone]);
                dailyDeposit = amount;
            } else {
                dailyDeposit = parseFloat(rows[0].daily_deposit) + amount;
            }
        }

        await connection.execute(
            `INSERT INTO turn_over (phone, code, invite, daily_turn_over, total_turn_over, daily_deposit, total_deposit, date_time) 
             VALUES (?, ?, ?, 0, 0, ?, ?, NOW()) 
             ON DUPLICATE KEY UPDATE 
             daily_deposit = ?, 
             total_deposit = total_deposit + ?,
             date_time = NOW()`,
            [phone, code, invite, amount, amount, dailyDeposit, amount]
        );
    } catch (error) {
        console.error("Error in updateDeposit:", error);
    }
};

export default {
    rosesPlus,
    updateTurnover,
    updateDeposit
};
