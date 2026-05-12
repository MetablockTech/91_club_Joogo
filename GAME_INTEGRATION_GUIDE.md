# Game Integration Guide (Centralized Betting Stats)

This guide explains how to integrate a new game provider (API or Internal) into the system so that its betting statistics are accurately reflected in VIP levels, Promotion dashboards, Admin reporting, and Withdrawal eligibility.

## Step 1: Update the Centralized Helper
Add the new game's transaction table to `src/helpers/userStats.js`.
- Function: `getBettingStats`
- Action: Add a new query block to sum `betAmount` and `count` from your new table.
- **Important**: Ensure you use the correct date/time column for filtering (e.g., `today`, `created_at`, or a numeric `time`).

## Step 2: Update Promotion Team Statistics
The Promotion dashboard uses high-performance `UNION ALL` queries to calculate team turnover across 7 levels.
- File: `src/controllers/promotionController.js`
- Function: `userStats` (inner function of `subordinatesDataByPhone`)
- Action: Add your new table to the `UNION ALL` blocks in both `userStats` and `userStats2` (if separate).
- **Tip**: Map your user ID column to `phone` in the SELECT statement for consistent joining.

## Step 3: Update Rank/Leaderboard Logic
Yesterday's betting volume determines user ranks.
- File: `src/controllers/rankController.js`
- Function: `updateUserRanks`
- Action: Add your new table to the `UNION ALL` query that calculates `total_bet` for "Yesterday".

## Step 4: Real-time Turnover Tracking
To ensure the Admin Member List and real-time dashboards stay updated, the game controller must update the `turn_over` table during every bet.
- File: Your new Game Controller (e.g., `src/controllers/NewGameController.js`)
- Action: Call `commissionController.updateTurnover(phone, amount, code, invite)` immediately after a successful bet placement.
- **Reversal**: If a bet is cancelled or rolled back, call it with a negative amount: `updateTurnover(phone, -amount, ...)`.

## Step 5: Commission Distribution
If the game should generate commissions for uplines:
- File: Your new Game Controller.
- Action: Call `commissionController.rosesPlus(phone, amount, 'game_type_name')`.

## Step 6: Admin Statistical Reporting
- File: `src/controllers/gameController.js`
- Function: `gameStatistics`
- Action: Add a specific query for your new game to show it in the Admin Game Statistics page.

---
**Note**: Always use `FROM_UNIXTIME(?/1000)` when filtering by `datetime` or `timestamp` columns if your input is a millisecond timestamp.
