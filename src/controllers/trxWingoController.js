import moment from "moment";
import connection from "../config/connectDB.js";
import commissionController from "./commissionController.js";
import axios from "axios";
import _ from "lodash";
import GameRepresentationIds from "../constants/game_representation_id.js";
import { generatePeriod } from "../helpers/games.js";
import vipController from "./vipController.js";

export const TRX_WINGO_GAME_STATUS_MAP = {
  PENDING: 0,
  COMPLETED: 1,
};

export const TRX_WINGO_GAME_TYPE_MAP = {
  MIN_1: "trx_wingo",
  MIN_3: "trx_wingo3",
  MIN_5: "trx_wingo5",
  MIN_10: "trx_wingo10",
};

const trxWingoBlockPage = async (req, res) => {
  return res.render("bet/trx_wingo/trx_block.ejs");
};

const trxWingoPage = async (req, res) => {
  return res.render("bet/trx_wingo/win.ejs");
};

const trxWingoPage3 = async (req, res) => {
  return res.render("bet/trx_wingo/win3.ejs");
};

const trxWingoPage5 = async (req, res) => {
  return res.render("bet/trx_wingo/win5.ejs");
};

const trxWingoPage10 = async (req, res) => {
  return res.render("bet/trx_wingo/win10.ejs");
};

const isNumber = (params) => {
  let pattern = /^[0-9]*\d$/;
  return pattern.test(params);
};

function formateT(params) {
  let result = params < 10 ? "0" + params : params;
  return result;
}

function timerJoin(params = "", addHours = 0) {
  let date = "";
  if (params) {
    date = new Date(Number(params));
  } else {
    date = new Date();
  }

  date.setHours(date.getHours() + addHours);

  let years = formateT(date.getFullYear());
  let months = formateT(date.getMonth() + 1);
  let days = formateT(date.getDate());

  let hours = date.getHours() % 12;
  hours = hours === 0 ? 12 : hours;
  let ampm = date.getHours() < 12 ? "AM" : "PM";

  let minutes = formateT(date.getMinutes());
  let seconds = formateT(date.getSeconds());

  return (
    years +
    "-" +
    months +
    "-" +
    days +
    " " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds +
    " " +
    ampm
  );
}

// Local rosesPlus has been replaced by centralized commissionController.rosesPlus

// const rosesPlus = async (auth, money) => {
//   console.log("rosesPlus")
//   const [level] = await connection.query("SELECT * FROM level ");

//   const [user] = await connection.query(
//     "SELECT `phone`, `code`, `invite`, `user_level`, `total_money` FROM users WHERE token = ? AND veri = 1 LIMIT 1 ",
//     [auth],
//   );
//   let userInfo = user[0];
//   const [f1] = await connection.query(
//     "SELECT `phone`, `code`, `invite`, `rank`, `user_level`, `total_money` FROM users WHERE code = ? AND veri = 1 LIMIT 1 ",
//     [userInfo.invite],
//   );

//   if (money >= 10) {
//     if (f1.length > 0) {
//       let infoF1 = f1[0];
//       for (let levelIndex = 1; levelIndex <= 6; levelIndex++) {
//         let rosesF = 0;
//         if (infoF1.user_level >= levelIndex) {
//           rosesF = (money / 100) * level[levelIndex - 1].f1;
//           if (rosesF > 0) {
//             await connection.query(
//               "UPDATE users SET money = money + ?, roses_f = roses_f + ?, roses_today = roses_today + ? WHERE phone = ? ",
//               [rosesF, rosesF, rosesF, infoF1.phone],
//             );
//             let timeNow = new Date().getTime();
//             const sql2 = `INSERT INTO roses SET 
//                             phone = ?,
//                             code = ?,
//                             invite = ?,
//                             f1 = ?,
//                             time = ?`;
//             await connection.query(sql2, [
//               infoF1.phone,
//               infoF1.code,
//               infoF1.invite,
//               rosesF,
//               timeNow,
//             ]);

//             const sql3 = `
//                             INSERT INTO turn_over (phone, code, invite, daily_turn_over, total_turn_over)
//                             VALUES (?, ?, ?, ?, ?)
//                             ON DUPLICATE KEY UPDATE
//                             daily_turn_over = daily_turn_over + VALUES(daily_turn_over),
//                             total_turn_over = total_turn_over + VALUES(total_turn_over)
//                             `;

//             await connection.query(sql3, [
//               infoF1.phone,
//               infoF1.code,
//               infoF1.invite,
//               money,
//               money,
//             ]);
//           }
//         }
//         const [fNext] = await connection.query(
//           "SELECT `phone`, `code`, `invite`, `rank`, `user_level`, `total_money` FROM users WHERE code = ? AND veri = 1 LIMIT 1 ",
//           [infoF1.invite],
//         );
//         if (fNext.length > 0) {
//           infoF1 = fNext[0];
//         } else {
//           break;
//         }
//       }
//     }
//   }
// };


// const rosesPlus = async (auth, money) => {
//     const [level] = await connection.query('SELECT * FROM level ');
//     let level0 = level[0];

//     const [user] = await connection.query('SELECT `phone`, `code`, `invite` FROM users WHERE token = ? AND veri = 1  LIMIT 1 ', [auth]);
//     let userInfo = user[0];
//     const [f1] = await connection.query('SELECT `phone`, `code`, `invite`, `rank` FROM users WHERE code = ? AND veri = 1  LIMIT 1 ', [userInfo.invite]);
//     if (money >= 10000) {
//         if (f1.length > 0) {
//             let infoF1 = f1[0];
//             let rosesF1 = (money / 100) * level0.f1;
//             await connection.query('UPDATE users SET money = money + ?, roses_f1 = roses_f1 + ?, roses_f = roses_f + ?, roses_today = roses_today + ? WHERE phone = ? ', [rosesF1, rosesF1, rosesF1, rosesF1, infoF1.phone]);
//             const [f2] = await connection.query('SELECT `phone`, `code`, `invite`, `rank` FROM users WHERE code = ? AND veri = 1  LIMIT 1 ', [infoF1.invite]);
//             if (f2.length > 0) {
//                 let infoF2 = f2[0];
//                 let rosesF2 = (money / 100) * level0.f2;
//                 await connection.query('UPDATE users SET money = money + ?, roses_f = roses_f + ?, roses_today = roses_today + ? WHERE phone = ? ', [rosesF2, rosesF2, rosesF2, infoF2.phone]);
//                 const [f3] = await connection.query('SELECT `phone`, `code`, `invite`, `rank` FROM users WHERE code = ? AND veri = 1  LIMIT 1 ', [infoF2.invite]);
//                 if (f3.length > 0) {
//                     let infoF3 = f3[0];
//                     let rosesF3 = (money / 100) * level0.f3;
//                     await connection.query('UPDATE users SET money = money + ?, roses_f = roses_f + ?, roses_today = roses_today + ? WHERE phone = ? ', [rosesF3, rosesF3, rosesF3, infoF3.phone]);
//                     const [f4] = await connection.query('SELECT `phone`, `code`, `invite`, `rank` FROM users WHERE code = ? AND veri = 1  LIMIT 1 ', [infoF3.invite]);
//                     if (f4.length > 0) {
//                         let infoF4 = f4[0];
//                         let rosesF4 = (money / 100) * level0.f4;
//                         await connection.query('UPDATE users SET money = money + ?, roses_f = roses_f + ?, roses_today = roses_today + ? WHERE phone = ? ', [rosesF4, rosesF4, rosesF4, infoF4.phone]);
//                     }
//                 }
//             }

//         }
//     }
// }

// const rosesPlus = async (auth, money) => {
//     const [level] = await connection.query('SELECT * FROM level ');

//     const [user] = await connection.query('SELECT `phone`, `code`, `invite`, `user_level` FROM users WHERE token = ? AND veri = 1 LIMIT 1 ', [auth]);
//     let userInfo = user[0];
//     const [f1] = await connection.query('SELECT `phone`, `code`, `invite`, `rank`, `user_level` FROM users WHERE code = ? AND veri = 1 LIMIT 1 ', [userInfo.invite]);

//     if (money < 300) {
//         return; // No need to proceed if money is less than 300
//     }

//     if (f1.length === 0) {
//         return; // No referrer found
//     }

//     let infoF1 = f1[0];

//     const f2 = await connection.query('SELECT `phone`, `code`, `invite`, `rank`, `user_level` FROM users WHERE code = ? AND veri = 1 LIMIT 1 ', [infoF1.invite]);
//     if (f2.length > 0) {
//         let infoF2 = f2[0];
//         if (infoF2.user_level >= 2) {
//             let rosesF2 = (money / 100) * level[1].f1;
//             await connection.query('UPDATE users SET money = money + ?, roses_f = roses_f + ?, roses_today = roses_today + ? WHERE phone = ? ', [rosesF2, rosesF2, rosesF2, infoF2.phone]);
//         }

//         const f3 = await connection.query('SELECT `phone`, `code`, `invite`, `rank`, `user_level` FROM users WHERE code = ? AND veri = 1 LIMIT 1 ', [infoF2.invite]);
//         if (f3.length > 0) {
//             let infoF3 = f3[0];
//             if (infoF3.user_level >= 3) {
//                 let rosesF3 = (money / 100) * level[2].f1;
//                 await connection.query('UPDATE users SET money = money + ?, roses_f = roses_f + ?, roses_today = roses_today + ? WHERE phone = ? ', [rosesF3, rosesF3, rosesF3, infoF3.phone]);
//             }

//             const f4 = await connection.query('SELECT `phone`, `code`, `invite`, `rank`, `user_level` FROM users WHERE code = ? AND veri = 1 LIMIT 1 ', [infoF3.invite]);
//             if (f4.length > 0) {
//                 let infoF4 = f4[0];
//                 if (infoF4.user_level >= 4) {
//                     let rosesF4 = (money / 100) * level[3].f1;
//                     await connection.query('UPDATE users SET money = money + ?, roses_f = roses_f + ?, roses_today = roses_today + ? WHERE phone = ? ', [rosesF4, rosesF4, rosesF4, infoF4.phone]);
//                 }
//             }
//         }
//     }
// }

// const rosesPlus = async (auth, money) => {
//     const [level] = await connection.query('SELECT * FROM level ');
//     const [user] = await connection.query('SELECT `phone`, `code`, `invite` FROM users WHERE token = ? AND veri = 1  LIMIT 1 ', [auth]);
//     let userInfo = user[0];
//     const [f1] = await connection.query('SELECT `phone`, `code`, `invite`, `rank` FROM users WHERE code = ? AND veri = 1  LIMIT 1 ', [userInfo.invite]);
//     let infoF1 = f1[0];

//     const [check_invite] = await connection.query('SELECT * FROM users WHERE invite = ?', [userInfo.invite]);
//     if (money >= 300) {
//         let levels = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44];
//         let levelIndex = levels.findIndex(levelThreshold => check_invite.length < levelThreshold);

//         if (levelIndex !== -1) {
//             let rosesF1 = (money / 100) * level[levelIndex].f1;
//             await connection.query('UPDATE users SET money = money + ?, roses_f1 = roses_f1 + ?, roses_f = roses_f + ?, roses_today = roses_today + ? WHERE phone = ? ', [rosesF1, rosesF1, rosesF1, rosesF1, infoF1.phone]);
//         }
//     }
// }

const betTrxWingo = async (req, res) => {
  try {
    let { typeid, join, x, money } = req.body;
    let auth = req.cookies.auth;

    if (typeid != 1 && typeid != 3 && typeid != 5 && typeid != 10) {
      return res.status(200).json({
        message: "Error!",
        status: true,
      });
    }

    let gameJoin = "";
    if (typeid == 1) gameJoin = "trx_wingo";
    if (typeid == 3) gameJoin = "trx_wingo3";
    if (typeid == 5) gameJoin = "trx_wingo5";
    if (typeid == 10) gameJoin = "trx_wingo10";
    const [trxWingoNow] = await connection.query(
      `SELECT period FROM trx_wingo_game WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1 `,
      [gameJoin],
    );
    const [user] = await connection.query(
      "SELECT `phone`, `code`, `invite`, `level`, `money` FROM users WHERE token = ? AND veri = 1  LIMIT 1 ",
      [auth],
    );
    if (!trxWingoNow[0] || !user[0] || !isNumber(x) || !isNumber(money)) {
      return res.status(200).json({
        message: "Error!",
        status: true,
      });
    }

    let userInfo = user[0];
    let period = trxWingoNow[0].period;
    let fee = x * money * 0.02;
    let total = x * money - fee;
    let timeNow = new Date().getTime();
    let check = userInfo.money - total;

    let date = new Date();
    let years = formateT(date.getFullYear());
    let months = formateT(date.getMonth() + 1);
    let days = formateT(date.getDate());
    let id_product =
      years + months + days + Math.floor(Math.random() * 1000000000000000);

    let formatTime = timerJoin();

    let color = "";
    if (join == "l") {
      color = "big";
    } else if (join == "n") {
      color = "small";
    } else if (join == "t") {
      color = "violet";
    } else if (join == "d") {
      color = "red";
    } else if (join == "x") {
      color = "green";
    } else if (join == "0") {
      color = "red-violet";
    } else if (join == "5") {
      color = "green-violet";
    } else if (join % 2 == 0) {
      color = "red";
    } else if (join % 2 != 0) {
      color = "green";
    }

    let checkJoin = "";

    if ((!isNumber(join) && join == "l") || join == "n") {
      checkJoin = `
        <div data-v-a9660e98="" class="van-image" style="width: 30px; height: 30px;">
            <img src="/images/${join == "n" ? "small" : "big"}.png" class="van-image__img">
        </div>
        `;
    } else {
      checkJoin = `
        <span data-v-a9660e98="">${isNumber(join) ? join : ""}</span>
        `;
    }

    let result = `
    <div data-v-a9660e98="" issuenumber="${period}" addtime="${formatTime}" rowid="1" class="hb">
        <div data-v-a9660e98="" class="item c-row">
            <div data-v-a9660e98="" class="result">
                <div data-v-a9660e98="" class="select select-${color}">
                    ${checkJoin}
                </div>
            </div>
            <div data-v-a9660e98="" class="c-row c-row-between info">
                <div data-v-a9660e98="">
                    <div data-v-a9660e98="" class="issueName">
                        ${period}
                    </div>
                    <div data-v-a9660e98="" class="tiem">${formatTime}</div>
                </div>
            </div>
        </div>
        <!---->
    </div>
    `;

    function timerJoin(params = "", addHours = 0) {
      let date = "";
      if (params) {
        date = new Date(Number(params));
      } else {
        date = new Date();
      }

      date.setHours(date.getHours() + addHours);

      let years = formateT(date.getFullYear());
      let months = formateT(date.getMonth() + 1);
      let days = formateT(date.getDate());

      let hours = date.getHours() % 12;
      hours = hours === 0 ? 12 : hours;
      let ampm = date.getHours() < 12 ? "AM" : "PM";

      let minutes = formateT(date.getMinutes());
      let seconds = formateT(date.getSeconds());

      return (
        years +
        "-" +
        months +
        "-" +
        days +
        " " +
        hours +
        ":" +
        minutes +
        ":" +
        seconds +
        " " +
        ampm
      );
    }
    let checkTime = timerJoin(date.getTime());

    if (check >= 0) {
      const sql = `INSERT INTO trx_wingo_bets SET 
            id_product = ?,
            phone = ?,
            code = ?,
            invite = ?,
            stage = ?,
            level = ?,
            money = ?,
            amount = ?,
            fee = ?,
            get = ?,
            game = ?,
            bet = ?,
            status = ?,
            today = ?,
            time = ?`;
      await connection.query(sql, [
        id_product,
        userInfo.phone,
        userInfo.code,
        userInfo.invite,
        period,
        userInfo.level,
        total,
        x,
        fee,
        0,
        gameJoin,
        join,
        0,
        checkTime,
        timeNow,
      ]);
      await connection.query(
        "UPDATE `users` SET `money` = `money` - ?, trxwingoGameTotalBetAmount = trxwingoGameTotalBetAmount + ?, totalBetAmount = totalBetAmount + ? WHERE `token` = ? ",
        [money * x, money * x, money * x, auth],
      );
      const [users] = await connection.query(
        "SELECT `money`, `level` FROM users WHERE token = ? AND veri = 1  LIMIT 1 ",
        [auth],
      );

      await commissionController.updateTurnover(
        userInfo.phone,
        money * x,
        userInfo.code,
        userInfo.invite,
      );

      // Give Personal Real-Time Rebate
      await vipController.payoutRealTimeRebate(userInfo.phone, money * x);
      return res.status(200).json({
        message: "Successful bet",
        status: true,
        data: result,
        change: users[0].level,
        money: users[0].money,
      });
    } else {
      return res.status(200).json({
        message: "The amount is not enough",
        status: false,
      });
    }
  } catch (error) {
    return res.status(200).json({
      message: "Error!",
      status: false,
    });
  }
};

const listOrderOld = async (req, res) => {
  let { typeid, pageno, pageto } = req.body;

  if (typeid != 1 && typeid != 3 && typeid != 5 && typeid != 10) {
    return res.status(200).json({
      message: "Error!",
      status: true,
    });
  }
  if (pageno < 0 || pageto < 0) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      page: 1,
      status: false,
    });
  }
  let auth = req.cookies.auth;
  const [user] = await connection.query(
    "SELECT `phone`, `code`, `invite`, `level`, `money` FROM users WHERE token = ? AND veri = 1  LIMIT 1 ",
    [auth],
  );

  let game = "";
  if (typeid == 1) game = TRX_WINGO_GAME_TYPE_MAP.MIN_1;
  if (typeid == 3) game = TRX_WINGO_GAME_TYPE_MAP.MIN_3;
  if (typeid == 5) game = TRX_WINGO_GAME_TYPE_MAP.MIN_5;
  if (typeid == 10) game = TRX_WINGO_GAME_TYPE_MAP.MIN_10;

  const [trx_wingo] = await connection.query(
    "SELECT * FROM trx_wingo_game WHERE status != 0 AND game = ? ORDER BY id DESC LIMIT ?, ?",
    [game, Number(pageno), Number(pageto)],
  );

  const [trx_wingoAll] = await connection.query(
    "SELECT COUNT(*) as game_length FROM trx_wingo_game WHERE status != 0 AND game = ?",
    [game],
  );
  const [period] = await connection.query(
    "SELECT period FROM trx_wingo_game WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1",
    [game],
  );
  if (!trx_wingo[0]) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      page: 1,
      status: false,
    });
  }

  if (!pageno || !pageto || !user[0] || !trx_wingo[0] || !period[0]) {
    return res.status(200).json({
      message: "Error!",
      status: true,
    });
  }

  let page = Math.ceil(trx_wingoAll[0].game_length / 10);

  return res.status(200).json({
    code: 0,
    msg: "Receive success",
    data: {
      gameslist: trx_wingo,
    },
    period: period[0].period,
    page: page,
    status: true,
  });
};

const GetMyEmerdList = async (req, res) => {
  let { typeid, pageno, pageto } = req.body;

  // if (!pageno || !pageto) {
  //     pageno = 0;
  //     pageto = 10;
  // }

  if (typeid != 1 && typeid != 3 && typeid != 5 && typeid != 10) {
    return res.status(200).json({
      message: "Error!",
      status: true,
    });
  }

  if (pageno < 0 || pageto < 0) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      page: 1,
      status: false,
    });
  }
  let auth = req.cookies.auth;

  let game = "";
  if (typeid == 1) game = "trx_wingo";
  if (typeid == 3) game = "trx_wingo3";
  if (typeid == 5) game = "trx_wingo5";
  if (typeid == 10) game = "trx_wingo10";

  const [user] = await connection.query(
    "SELECT `phone`, `code`, `invite`, `level`, `money` FROM users WHERE token = ? AND veri = 1 LIMIT 1",
    [auth],
  );
  const [trx_wingo_bets] = await connection.query(
    "SELECT * FROM trx_wingo_bets WHERE phone = ? AND game = ? ORDER BY id DESC LIMIT ?, ?",
    [user[0].phone, game, Number(pageno), Number(pageto)],
  );
  const [trx_wingo_betsAll] = await connection.query(
    "SELECT COUNT(*) as bet_length FROM trx_wingo_bets WHERE phone = ? AND game = ? ORDER BY id DESC",
    [user[0].phone, game],
  );

  if (!trx_wingo_bets[0]) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      page: 1,
      status: false,
    });
  }
  if (!pageno || !pageto || !user[0] || !trx_wingo_bets[0]) {
    return res.status(200).json({
      message: "Error!",
      status: true,
    });
  }

  let page = Math.ceil(trx_wingo_betsAll[0].bet_length / 10);

  let datas = trx_wingo_bets.map((data) => {
    let { id, phone, code, invite, level, game, ...others } = data;
    return others;
  });

  return res.status(200).json({
    code: 0,
    msg: "Receive success",
    data: {
      gameslist: datas,
    },
    page: page,
    status: true,
  });
};

function minutesPassedSince(time) {
  const inputTime = moment(time);
  const minutesDiff = moment().diff(inputTime, "minutes");
  return minutesDiff;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const generateResultByHash = (hash) => {
  const hashItemList = hash.split("");

  let Result = "";
  for (let index = 0; index < hashItemList.length; index++) {
    const hashItem = hashItemList[hashItemList.length - 1 - index];

    const NUMBER_LIST = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    const isNumber = NUMBER_LIST.includes(hashItem);
    if (isNumber) {
      Result = hashItem;
      break;
    }
  }

  return Result;
};

function getNthMinuteSinceDayStart() {
  const now = moment();
  const startOfDay = moment().startOf("day");
  const diff = now.diff(startOfDay, "minutes");
  return diff;
}

const addTrxWingo = async (game) => {
  try {
    let join = "";
    if (game == 1) join = TRX_WINGO_GAME_TYPE_MAP.MIN_1;
    if (game == 3) join = TRX_WINGO_GAME_TYPE_MAP.MIN_3;
    if (game == 5) join = TRX_WINGO_GAME_TYPE_MAP.MIN_5;
    if (game == 10) join = TRX_WINGO_GAME_TYPE_MAP.MIN_10;

    let gameRepresentationId = GameRepresentationIds.TRXWINGO[game];
    let NewGamePeriod = generatePeriod(gameRepresentationId);
    let timeNow = new Date().getTime();

    const [trxWinGoTest] = await connection.query(
      "SELECT period FROM trx_wingo_game WHERE period = ? AND game = ?",
      [NewGamePeriod, join],
    );

    if (trxWinGoTest.length === 0) {
      await connection.query(
        "INSERT INTO trx_wingo_game SET period = ?, result = 0, game = ?, status = 0, block_id = 0, block_time = '', hash = '', time = ?",
        [NewGamePeriod, join, timeNow],
      );
    }
    return NewGamePeriod;
  } catch (error) {
    console.log(error);
  }
};

const updateTrxResult = async (game) => {
    try {
        let join = "";
        if (game == 1) join = TRX_WINGO_GAME_TYPE_MAP.MIN_1;
        if (game == 3) join = TRX_WINGO_GAME_TYPE_MAP.MIN_3;
        if (game == 5) join = TRX_WINGO_GAME_TYPE_MAP.MIN_5;
        if (game == 10) join = TRX_WINGO_GAME_TYPE_MAP.MIN_10;

        // Get all pending games for this type, excluding the very latest one (which just started)
        const [pendingGames] = await connection.query(
            "SELECT * FROM trx_wingo_game WHERE status = 0 AND game = ? ORDER BY id ASC",
            [join]
        );

        if (pendingGames.length <= 1) return; // Only the current active game exists

        // Update all but the last one (the last one is the current active period)
        for (let i = 0; i < pendingGames.length - 1; i++) {
            const gameData = pendingGames[i];
            const PendingGamePeriod = gameData.period;
            const periodStartTime = Number(gameData.time); 
            const periodEndTime = periodStartTime + (game * 60 * 1000);

            const getCorrectBlock = async () => {
                const targetSS = process.env.TRX_WINGO_GAME_TIME_SS || "54";
                try {
                    // Fetch blocks specifically for this period's time range
                    const response = await axios({
                        method: "GET",
                        url: `https://apilist.tronscanapi.com/api/block?sort=-timestamp&start=0&limit=50&start_timestamp=${periodStartTime}&end_timestamp=${periodEndTime}`,
                        headers: { "TRON-PRO-API-KEY": process.env.TRON_API_KEY },
                        timeout: 5000
                    });

                    if (response.data && response.data.data) {
                        const targetBlock = response.data.data.find(item => {
                            const blockSS = new Date(item.timestamp).getSeconds().toString().padStart(2, '0');
                            return blockSS === targetSS;
                        });

                        if (targetBlock) {
                            return targetBlock;
                        }
                    }
                } catch (apiErr) {
                    console.error(`[TRX] API Error for Period ${PendingGamePeriod}:`, apiErr.message);
                }
                return null;
            };

            const block = await getCorrectBlock();
            if (block) {
                const Result = generateResultByHash(block.hash);
                await connection.query(
                    `UPDATE trx_wingo_game SET result = ?, status = ?, block_id = ?, block_time = ?, hash = ?, release_status = 1 WHERE period = ? AND game = ?`,
                    [Result, TRX_WINGO_GAME_STATUS_MAP.COMPLETED, block.number, block.timestamp, block.hash, PendingGamePeriod, join]
                );
            }
        }
        return true;
    } catch (e) {
        console.error("TRX Global Update Error:", e);
        return false;
    }
}

const handlingTrxWingo1P = async (typeid) => {
  try {
    let game = "";
    if (typeid == 1) game = "trx_wingo";
    if (typeid == 3) game = "trx_wingo3";
    if (typeid == 5) game = "trx_wingo5";
    if (typeid == 10) game = "trx_wingo10";

    const [trxWingoCompleted] = await connection.query(
      "SELECT * FROM trx_wingo_game WHERE status = 1 AND release_status = 1 AND game = ? ORDER BY id ASC",
      [game],
    );

    if (trxWingoCompleted.length === 0) return;

    for (const trxWingoNow of trxWingoCompleted) {
        const period = trxWingoNow.period;
        const result = Number(trxWingoNow.result);

        // Update results for all bets in this period
        await connection.query(
            "UPDATE trx_wingo_bets SET result = ? WHERE status = 0 AND game = ? AND stage = ?",
            [result, game, period],
        );

        // Mark losing bets as status = 2
        const validBets = getValidBets(result);
        await connection.execute(
            `UPDATE trx_wingo_bets SET status = 2 WHERE status = 0 AND game = ? AND stage = ? AND bet NOT IN (${validBets.map(() => "?").join(",")})`,
            [game, period, ...validBets]
        );

        // Get winning bets for this period
        const [winningBets] = await connection.query(
            "SELECT * FROM trx_wingo_bets WHERE status = 0 AND game = ? AND stage = ?",
            [game, period],
        );

        for (const bet of winningBets) {
            const winAmount = calculateWinAmount(bet.bet, result, bet.money);
            await connection.query(
                "UPDATE `trx_wingo_bets` SET `get` = ?, `status` = 1 WHERE `id` = ?",
                [winAmount, bet.id],
            );
            await connection.query(
                "UPDATE `users` SET money = money + ?, trxwingo_totalWinningAmount = trxwingo_totalWinningAmount + ?, totalWinningAmount = totalWinningAmount + ? WHERE `phone` = ?",
                [winAmount, winAmount, winAmount, bet.phone],
            );
        }

        // Mark game as fully processed (release_status = 2)
        await connection.query(
            "UPDATE trx_wingo_game SET release_status = 2 WHERE period = ? AND game = ?",
            [period, game],
        );
    }
  } catch (error) {
    console.error("TRX Payout Error:", error);
  }
};

const batchUpdateBetStatus = async (result, game) => {
  const validBets = getValidBets(result);
  const batchSize = 1000; // Adjust this based on your data volume and server capacity
  let offset = 0;

  while (true) {
    const [rows] = await connection.execute(
      `UPDATE trx_wingo_bets SET status = 2 
       WHERE status = 0 AND game = ? AND bet NOT IN (${validBets.map(() => "?").join(",")})
       LIMIT ${batchSize}`,
      [game, ...validBets],
    );

    if (rows.affectedRows === 0) break; // No more rows to update
    offset += batchSize;
  }
};

const getValidBets = (result) => {
  result = Number(result);

  const baseValidBets = [result.toString()];

  if (result % 2 === 0) baseValidBets.push("d");
  else baseValidBets.push("x");

  if (result === 0 || result === 5) baseValidBets.push("t");

  if (result <= 4) baseValidBets.push("n");
  else baseValidBets.push("l");

  return baseValidBets;
};

const calculateWinAmount = (bet, result, total) => {
  let winAmount = 0;
  if (bet == "l" || bet == "n") {
    winAmount = total * 2;
  } else {
    if (result == 0 || result == 5) {
      if (bet == "d" || bet == "x") {
        winAmount = total * 1.5;
      } else if (bet == "t") {
        winAmount = total * 4.5;
      } else if (bet == "0" || bet == "5") {
        winAmount = total * 9;
      }
    } else {
      if (result == 1 && bet == "1") {
        winAmount = total * 9;
      } else {
        if (result == 1 && bet == "x") {
          winAmount = total * 2;
        }
      }
      if (result == 2 && bet == "2") {
        winAmount = total * 9;
      } else {
        if (result == 2 && bet == "d") {
          winAmount = total * 2;
        }
      }
      if (result == 3 && bet == "3") {
        winAmount = total * 9;
      } else {
        if (result == 3 && bet == "x") {
          winAmount = total * 2;
        }
      }
      if (result == 4 && bet == "4") {
        winAmount = total * 9;
      } else {
        if (result == 4 && bet == "d") {
          winAmount = total * 2;
        }
      }
      if (result == 6 && bet == "6") {
        winAmount = total * 9;
      } else {
        if (result == 6 && bet == "d") {
          winAmount = total * 2;
        }
      }
      if (result == 7 && bet == "7") {
        winAmount = total * 9;
      } else {
        if (result == 7 && bet == "x") {
          winAmount = total * 2;
        }
      }
      if (result == 8 && bet == "8") {
        winAmount = total * 9;
      } else {
        if (result == 8 && bet == "d") {
          winAmount = total * 2;
        }
      }
      if (result == 9 && bet == "9") {
        winAmount = total * 9;
      } else {
        if (result == 9 && bet == "x") {
          winAmount = total * 2;
        }
      }
    }
  }
  return winAmount;
};

const trxWingoController = {
  trxWingoPage,
  betTrxWingo,
  listOrderOld,
  GetMyEmerdList,
  handlingTrxWingo1P,
  addTrxWingo,
  updateTrxResult,
  trxWingoPage3,
  trxWingoPage5,
  trxWingoPage10,
  trxWingoBlockPage,
};

export default trxWingoController;
