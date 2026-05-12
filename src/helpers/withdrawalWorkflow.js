import connection from "../config/connectDB.js";
import userStatsHelper from "../helpers/userStats.js";

const evaluateFormula = (formula, variables) => {
    try {
        // Replace variables {{name}} with their values
        let processed = formula;
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            processed = processed.replace(regex, value);
        }

        // Safety check: Only allow math and comparison characters
        // We use a safe eval-like approach or just a simple math evaluator
        // For simplicity and power, we use a basic Function constructor but WITH SANITIZATION
        if (/[^0-9\+\-\*\/\(\)\s\.\>\<\=\!\&\|]/.test(processed)) {
            // If there are letters left after replacement, something is wrong
            console.error("Unsafe characters in formula:", processed);
            return false;
        }

        // Evaluate the boolean expression
        return !!(new Function(`return ${processed}`)());
    } catch (e) {
        console.error("Formula Evaluation Error:", e, formula);
        return false;
    }
};

const getWithdrawalDecision = async (phone, amount) => {
    try {
        const [flowRows] = await connection.query("SELECT flow_json FROM withdrawal_flow WHERE status = 1 ORDER BY id DESC LIMIT 1");
        if (!flowRows.length) return { allowed: true };

        const flow = JSON.parse(flowRows[0].flow_json);
        const [user] = await connection.query("SELECT * FROM users WHERE phone = ?", [phone]);
        if (!user.length) return { allowed: false, message: "User not found" };

        const todayStart = new Date().setHours(0, 0, 0, 0);
        const depositStats = await userStatsHelper.getDepositStats(phone);
        const depositStatsToday = await userStatsHelper.getDepositStats(phone, todayStart, Date.now());
        const bettingStats = await userStatsHelper.getBettingStats(phone);

        // Fetch Commission, Bonus (total and by type), Salary
        const [commRows] = await connection.query("SELECT SUM(money) as total FROM commissions WHERE phone = ?", [phone]);

        const [bonusTotalRows] = await connection.query("SELECT SUM(amount) as total FROM claimed_rewards WHERE phone = ? AND status = 1", [phone]);
        const [bonusTypeRows] = await connection.query("SELECT type, SUM(amount) as total FROM claimed_rewards WHERE phone = ? AND status = 1 GROUP BY type", [phone]);

        const bonusByType = {};
        bonusTypeRows.forEach(row => {
            const key = `bonus_amount_${row.type.replace(/_bonus$/, '')}`;
            bonusByType[key] = parseFloat(row.total) || 0;
        });

        const [salaryRows] = await connection.query("SELECT SUM(amount) as total FROM salary WHERE phone = ?", [phone]);

        // Today's withdrawal count and amount (Counting Pending + Success)
        const [wdTodayRows] = await connection.query("SELECT COUNT(*) as count, SUM(money) as totalAmount FROM withdraw WHERE phone = ? AND time >= ? AND status != 2", [phone, todayStart]);

        // Lifetime withdrawal count and amount
        const [wdTotalRows] = await connection.query("SELECT COUNT(*) as count, SUM(money) as totalAmount FROM withdraw WHERE phone = ? AND status != 2", [phone]);
        const [wdSuccessTotalRows] = await connection.query("SELECT SUM(money) as totalAmount FROM withdraw WHERE phone = ? AND status = 1", [phone]);

        // Rejected stats
        const [wdRejectedTodayRows] = await connection.query("SELECT COUNT(*) as count, SUM(money) as totalAmount FROM withdraw WHERE phone = ? AND time >= ? AND status = 2", [phone, todayStart]);
        const [wdRejectedTotalRows] = await connection.query("SELECT COUNT(*) as count, SUM(money) as totalAmount FROM withdraw WHERE phone = ? AND status = 2", [phone]);

        // Map all variables with consistent naming
        const variables = {
            // Deposits
            deposit_amount_lifetime: depositStats.totalAmount,
            deposit_count_lifetime: depositStats.totalCount,
            deposit_amount_today: depositStatsToday.totalAmount,
            deposit_count_today: depositStatsToday.totalCount,

            // Current Request
            amount: parseFloat(amount),
            withdraw_amount_current: parseFloat(amount),

            // User Info
            balance: parseFloat(user[0].money) || 0,
            money: parseFloat(user[0].money) || 0,
            addMoneyByAdmin: parseFloat(user[0].addMoneyByAdmin) || 0,
            minusMoneyByAdmin: parseFloat(user[0].minusMoneyByAdmin) || 0,
            level: parseInt(user[0].level) || 0,
            vip_level: parseInt(user[0].vip_level) || 0,
            rank: parseInt(user[0].rank) || 0,
            status: parseInt(user[0].status) || 0,

            // Withdrawals (Pending + Success)
            wd_count_today: wdTodayRows[0]?.count || 0,
            wd_amount_today: parseFloat(wdTodayRows[0]?.totalAmount) || 0,
            wd_count_lifetime: wdTotalRows[0]?.count || 0,
            wd_amount_lifetime: parseFloat(wdSuccessTotalRows[0]?.totalAmount) || 0,

            // Withdrawals (Rejected)
            wd_count_today_rejected: wdRejectedTodayRows[0]?.count || 0,
            wd_amount_today_rejected: parseFloat(wdRejectedTodayRows[0]?.totalAmount) || 0,
            wd_count_lifetime_rejected: wdRejectedTotalRows[0]?.count || 0,
            wd_amount_lifetime_rejected: parseFloat(wdRejectedTotalRows[0]?.totalAmount) || 0,

            // Other Stats
            bet: bettingStats.totalAmount,
            bet_amount_lifetime: bettingStats.totalAmount,
            winning: bettingStats.totalWinAmount,
            winning_amount_lifetime: bettingStats.totalWinAmount,
            commission_amount_lifetime: parseFloat(commRows[0]?.total) || 0,
            bonus_amount_lifetime: parseFloat(bonusTotalRows[0]?.total) || 0,
            salary_amount_lifetime: parseFloat(salaryRows[0]?.total) || 0,
            ...bonusByType,

            // Legacy/Identifiers
            phone: user[0].phone,
            id_user: user[0].id_user,
            code: user[0].code,
            invite: user[0].invite
        };

        // Traverse the flow
        let currentNode = flow.nodes.find(n => n.type === 'trigger');
        let requirements = [];

        if (!currentNode) return { allowed: true };

        // Simple traversal (assuming single path for now)
        while (currentNode) {
            if (currentNode.type === 'action') {
                return {
                    allowed: currentNode.action === 'allow',
                    audit: currentNode.action === 'audit',
                    message: currentNode.message || "Withdrawal criteria not met.",
                    requirements
                };
            }

            if (currentNode.type === 'condition') {
                const result = evaluateFormula(currentNode.formula, variables);

                // If admin provided a description, show it as a requirement
                if (currentNode.description) {
                    requirements.push({
                        label: currentNode.description,
                        status: result ? 'Passed' : 'Failed'
                    });
                } else if (currentNode.formula.includes('wd_today')) {
                    requirements.push({ label: "Daily Limit Condition", status: result ? 'Passed' : 'Failed' });
                }

                const edge = flow.edges.find(e => e.from === currentNode.id && e.type === (result ? 'true' : 'false'));
                if (!edge) break;
                currentNode = flow.nodes.find(n => n.id === edge.to);
                continue;
            }

            // For trigger or other types, just follow the first edge
            const edge = flow.edges.find(e => e.from === currentNode.id);
            if (!edge) break;
            currentNode = flow.nodes.find(n => n.id === edge.to);
        }

        return { allowed: true, requirements }; // Default to allow if flow ends abruptly
    } catch (error) {
        console.error("Workflow Evaluation Failed:", error);
        return { allowed: true }; // Safety: allow if system fails
    }
};

export default {
    getWithdrawalDecision
};
