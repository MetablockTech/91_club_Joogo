import moment from "moment";
import connection from "../config/connectDB.js";
import userStatsHelper from "../helpers/userStats.js";
import {
  REWARD_STATUS_TYPES_MAP,
  REWARD_TYPES_MAP,
} from "../constants/reward_types.js";

export const VIP_REWORDS_LIST = [
  {
    level: 0,
    expRequired: 0,
    levelUpReward: 0,
    monthlyReward: 0,
    safePercentage: 0,
    rebateRate: 0,
  },
  {
    level: 1,
    expRequired: 3_000,
    levelUpReward: 60,
    monthlyReward: 30,
    safePercentage: 0.2,
    rebateRate: 0.05,
  },
  {
    level: 2,
    expRequired: 30_000,
    levelUpReward: 180,
    monthlyReward: 90,
    safePercentage: 0.2,
    rebateRate: 0.05,
  },
  {
    level: 3,
    expRequired: 500_000,
    levelUpReward: 600,
    monthlyReward: 280,
    safePercentage: 0.2,
    rebateRate: 0.1,
  },
  {
    level: 4,
    expRequired: 5_000_000,
    levelUpReward: 1600,
    monthlyReward: 600,
    safePercentage: 0.3,
    rebateRate: 0.1,
  },
  {
    level: 5,
    expRequired: 10_000_000,
    levelUpReward: 4000,
    monthlyReward: 1600,
    safePercentage: 0.3,
    rebateRate: 0.1,
  },
  {
    level: 6,
    expRequired: 80_000_000,
    levelUpReward: 16000,
    monthlyReward: 4000,
    safePercentage: 0.3,
    rebateRate: 0.15,
  },
  {
    level: 7,
    expRequired: 300_000_000,
    levelUpReward: 65000,
    monthlyReward: 16000,
    safePercentage: 0.4,
    rebateRate: 0.15,
  },
  {
    level: 8,
    expRequired: 1_000_000_000,
    levelUpReward: 170000,
    monthlyReward: 65000,
    safePercentage: 0.4,
    rebateRate: 0.15,
  },
  {
    level: 9,
    expRequired: 5_000_000_000,
    levelUpReward: 700000,
    monthlyReward: 170000,
    safePercentage: 0.4,
    rebateRate: 0.2,
  },
  {
    level: 10,
    expRequired: 9_999_999_999,
    levelUpReward: 1700000,
    monthlyReward: 700000,
    safePercentage: 0.7,
    rebateRate: 0.3,
  },
];

// helpers ---------------------------------------------------------------------
const getSubordinateDataByPhone = async (phone) => {
  const stats = await userStatsHelper.getBettingStats(phone);
  return {
    bettingAmount: stats.totalAmount,
  };
};

const insertRewordClaim = async ({
  rewardId,
  rewardType,
  phone,
  amount,
  status,
  time,
}) => {
  await connection.execute(
    "INSERT INTO `claimed_rewards` (`reward_id`, `type`, `phone`, `amount`, `status`, `time`) VALUES (?, ?, ?, ?, ?, ?)",
    [rewardId, rewardType, phone, amount, status, time],
  );
};
// ------------------------------------------------------------------------------

// controllers -----------------------------------------------------------------
const releaseVIPLevel = async () => {
  try {
    // let lastMonth1st2amUnix = moment().subtract(1, "months").startOf("month").add(2, "hours").unix();
    // let lastMonth1st2am = moment(lastMonth1st2amUnix * 1000).format("YYYY-MM-DD HH:mm:ss");
    const [users] = await connection.query(
      "SELECT `vip_level`, `phone`, `money` FROM `users`",
    );

    for (let user of users) {
      const { phone, money, vip_level: lastVipLevel } = user;
      const { bettingAmount: expPoint } =
        await getSubordinateDataByPhone(phone);

      const currentVipLevel = VIP_REWORDS_LIST.find((vip, index) => {
        if (VIP_REWORDS_LIST?.[index + 1]) {
          return (
            expPoint >= vip.expRequired &&
            expPoint < VIP_REWORDS_LIST[index + 1].expRequired
          );
        } else {
          return expPoint >= vip.expRequired;
        }
      });

      if (currentVipLevel.level === 0) {
        continue;
      }

      if (currentVipLevel.level > lastVipLevel) {
        // Update user's VIP level and Insert levelUpReward
        await connection.execute(
          "UPDATE users SET vip_level = ?, money = money + ?, total_money = total_money + ?, vip_level_up_reward = vip_level_up_reward + ? WHERE phone = ?",
          [
            currentVipLevel.level,
            currentVipLevel.levelUpReward,
            currentVipLevel.levelUpReward,
            currentVipLevel.levelUpReward,
            phone,
          ],
        );

        await insertRewordClaim({
          rewardId: currentVipLevel.level,
          rewardType: REWARD_TYPES_MAP.VIP_LEVEL_UP_BONUS,
          phone,
          amount: currentVipLevel.levelUpReward,
          status: REWARD_STATUS_TYPES_MAP.SUCCESS,
          time: moment().unix(),
        });
      } else {
        await connection.execute(
          "UPDATE users SET vip_level = ? WHERE phone = ?",
          [currentVipLevel.level, phone],
        );
      }

      // Insert monthly reward
      await insertRewordClaim({
        rewardId: currentVipLevel.level,
        rewardType: REWARD_TYPES_MAP.VIP_MONTHLY_REWARD,
        phone,
        amount: currentVipLevel.monthlyReward,
        status: REWARD_STATUS_TYPES_MAP.SUCCESS,
        time: moment().unix(),
      });
      await connection.execute(
        "UPDATE users SET money = money + ?, vip_monthly_reward = vip_monthly_reward + ? WHERE phone = ?",
        [currentVipLevel.monthlyReward, currentVipLevel.monthlyReward, phone],
      );
    }
  } catch (error) {
    console.log(error);
  }
};

// releaseVIPLevel();

const getMyVIPLevelInfo = async (req, res) => {
  try {
    const authToken = req.cookies.auth;

    if (!authToken) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }

    const [users] = await connection.execute(
      "SELECT `phone`, `vip_level` FROM `users` WHERE `token` = ?",
      [authToken],
    );
    const phone = users[0].phone;
    const vipLevel = users[0].vip_level;

    const { bettingAmount: expPoint } = await getSubordinateDataByPhone(phone);

    const payoutDaysLeft = moment()
      .startOf("month")
      .add(1, "month")
      .add(2, "hours")
      .diff(moment(), "days");

    res.status(200).json({
      status: true,
      data: {
        expPoint: expPoint,
        vipLevel: vipLevel,
        payoutDaysLeft: payoutDaysLeft,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

const getVIPHistory = async (req, res) => {
  try {
    const authToken = req.cookies.auth;

    if (!authToken) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }

    const [users] = await connection.execute(
      "SELECT `phone` FROM `users` WHERE `token` = ?",
      [authToken],
    );
    const phone = users[0].phone;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const [countRows] = await connection.execute(
      "SELECT COUNT(*) as total FROM `claimed_rewards` WHERE `phone` = ? AND (type = ? OR type = ? OR type = ?)",
      [
        phone,
        REWARD_TYPES_MAP.VIP_LEVEL_UP_BONUS,
        REWARD_TYPES_MAP.VIP_MONTHLY_REWARD,
        REWARD_TYPES_MAP.VIP_REBATE,
      ],
    );
    const totalCount = countRows[0].total;

    // Get paginated rewards
    const [claimedRewards] = await connection.execute(
      "SELECT * FROM `claimed_rewards` WHERE `phone` = ? AND (type = ? OR type = ? OR type = ?) ORDER BY id DESC LIMIT ? OFFSET ?",
      [
        phone,
        REWARD_TYPES_MAP.VIP_LEVEL_UP_BONUS,
        REWARD_TYPES_MAP.VIP_MONTHLY_REWARD,
        REWARD_TYPES_MAP.VIP_REBATE,
        String(limit),
        String(offset),
      ],
    );

    return res.status(200).json({
      message: "Get VIP history successfully",
      status: true,
      data: claimedRewards,
      pagination: {
        total: totalCount,
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

const getRebateRate = (level) => {
  const vip = VIP_REWORDS_LIST.find((v) => v.level === level);
  return vip ? vip.rebateRate : 0;
};

const payoutRealTimeRebate = async (phone, betAmount) => {
  try {
    const [userRows] = await connection.query("SELECT vip_level FROM users WHERE phone = ?", [phone]);
    if (userRows.length > 0) {
      const vipLevel = userRows[0].vip_level;
      const rebateRate = getRebateRate(vipLevel);
      if (rebateRate > 0) {
        const rebateAmount = (betAmount * rebateRate) / 100;
        if (rebateAmount > 0) {
          // Update User Balance and Accumulate Reward
          await connection.execute(
            "UPDATE users SET money = money + ?, vip_rebet_extra_income = vip_rebet_extra_income + ? WHERE phone = ?",
            [rebateAmount, rebateAmount, phone]
          );

          // Record in claimed_rewards
          await connection.execute(
            "INSERT INTO claimed_rewards (reward_id, type, phone, amount, status, time) VALUES (?, ?, ?, ?, ?, ?)",
            [vipLevel, REWARD_TYPES_MAP.VIP_REBATE, phone, rebateAmount, REWARD_STATUS_TYPES_MAP.SUCCESS, moment().unix()]
          );
          return rebateAmount;
        }
      }
    }
    return 0;
  } catch (error) {
    console.error("Error in payoutRealTimeRebate:", error);
    return 0;
  }
};

const vipController = {
  releaseVIPLevel,
  getMyVIPLevelInfo,
  getVIPHistory,
  getRebateRate,
  payoutRealTimeRebate,
};

export default vipController;
