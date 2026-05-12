import connection from "../config/connectDB.js";
import winGoController from "./winGoController.js";
import k5Controller from "./k5Controller.js";
import k3Controller from "./k3Controller.js";
import trxWingoController, {
  TRX_WINGO_GAME_TYPE_MAP,
} from "./trxWingoController.js";
import cron from "node-cron";
import vipController from "./vipController.js";
import gameController from "./gameController.js";

const cronJobGame1p = (io) => {
 
  // 1-minute games - ALL Optimized and Independent (STABLE)
  cron.schedule("*/1 * * * *", async () => {
    // Each game runs in its own independent async block for maximum speed
    
    // K3 1m
    (async () => {
        try {
            await k3Controller.addK3(1);
            await k3Controller.handlingK3(1);
            const [data] = await connection.execute("SELECT * FROM k3 WHERE `game` = 1 ORDER BY `id` DESC LIMIT 2");
            io.emit("data-server-k3", { data: data, game: "1" });
        } catch (e) { console.error("K3 1m Master Error:", e); }
    })();

    // WinGo 1m
    (async () => {
        try {
            await winGoController.addWinGo(1);
            await winGoController.handlingWinGo1P(1);
            const [data] = await connection.execute('SELECT * FROM `wingo` WHERE `game` = "wingo" ORDER BY `id` DESC LIMIT 2');
            io.emit("data-server", { data: data });
        } catch (e) { console.error("WinGo 1m Master Error:", e); }
    })();

    // 5D 1m
    (async () => {
        try {
            await k5Controller.add5D(1);
            await k5Controller.handling5D(1);
            const [data] = await connection.execute("SELECT * FROM 5d WHERE `game` = 1 ORDER BY `id` DESC LIMIT 2");
            io.emit("data-server-5d", { data: data, game: "1" });
        } catch (e) { console.error("5D 1m Master Error:", e); }
    })();

    // TRX 1m - Optimized for Zero Delay
    (async () => {
        try {
            const startTime = Date.now();

            
            // 1. Create New Period Instantly
            await trxWingoController.addTrxWingo(1);

            
            // 2. Define helper to fetch latest data
            const getLatestData = async () => {
                const [rows] = await connection.execute(
                    `SELECT * FROM trx_wingo_game WHERE game = '${TRX_WINGO_GAME_TYPE_MAP.MIN_1}' ORDER BY id DESC LIMIT 2`
                );
                return rows;
            };

            // 3. Fetch Result from Blockchain in background
            (async () => {
                try {
                    const bgStart = Date.now();
                    await trxWingoController.updateTrxResult(1);

                    
                    await trxWingoController.handlingTrxWingo1P(1);

                    
                    // 4. Emit again once result is calculated
                    const resultData = await getLatestData();
                    io.emit("data-server-trx-wingo", { data: resultData });

                } catch (e) { console.error("TRX Result Error:", e); }
            })();
        } catch (e) { console.error("TRX 1m Startup Error:", e); }
    })();
  });

  // 30-second game (WinGo 10)
  cron.schedule('*/30 * * * * *', async () => {
    try {
        await winGoController.addWinGo("10");
        await winGoController.handlingWinGo1P("10");
        const [winGo1] = await connection.execute(
          'SELECT * FROM `wingo` WHERE `game` = "wingo10" ORDER BY `id` DESC LIMIT 2 '
        );
        io.emit("data-server", { data: winGo1 });
    } catch (e) { console.error("WinGo 10 Master Error:", e); }
  });

  // Long-duration games (3m, 5m, 10m) stay on cron
  cron.schedule("*/3 * * * *", async () => {
    (async () => {
        try {
            await k3Controller.addK3(3);
            await k3Controller.handlingK3(3);
            const [data] = await connection.execute("SELECT * FROM k3 WHERE `game` = 3 ORDER BY `id` DESC LIMIT 2");
            io.emit("data-server-k3", { data: data, game: "3" });
        } catch (e) { console.error("K3 3m Master Error:", e); }
    })();
    (async () => {
        try {
            await winGoController.addWinGo(3);
            await winGoController.handlingWinGo1P(3);
            const [data] = await connection.execute('SELECT * FROM `wingo` WHERE `game` = "wingo3" ORDER BY `id` DESC LIMIT 2');
            io.emit("data-server", { data: data });
        } catch (e) { console.error("WinGo 3m Master Error:", e); }
    })();
    (async () => {
        try {
            await k5Controller.add5D(3);
            await k5Controller.handling5D(3);
            const [data] = await connection.execute("SELECT * FROM 5d WHERE `game` = 3 ORDER BY `id` DESC LIMIT 2");
            io.emit("data-server-5d", { data: data, game: "3" });
        } catch (e) { console.error("5D 3m Master Error:", e); }
    })();
    (async () => {
        try {
            await trxWingoController.addTrxWingo(3);
            const getLatestData = async () => {
                const [rows] = await connection.execute("SELECT * FROM trx_wingo_game WHERE game = 'trx_wingo3' ORDER BY id DESC LIMIT 2");
                return rows;
            };
            (async () => {
                try {
                    await trxWingoController.updateTrxResult(3);
                    await trxWingoController.handlingTrxWingo1P(3);
                    const resultData = await getLatestData();
                    io.emit("data-server-trx-wingo", { data: resultData });
                } catch (e) { console.error("TRX 3m Result Error:", e); }
            })();
        } catch (e) { console.error("TRX 3m Master Error:", e); }
    })();
  });

  cron.schedule("*/5 * * * *", async () => {
    (async () => {
        try {
            await k3Controller.addK3(5);
            await k3Controller.handlingK3(5);
            const [data] = await connection.execute("SELECT * FROM k3 WHERE `game` = 5 ORDER BY `id` DESC LIMIT 2");
            io.emit("data-server-k3", { data: data, game: "5" });
        } catch (e) { console.error("K3 5m Master Error:", e); }
    })();
    (async () => {
        try {
            await winGoController.addWinGo(5);
            await winGoController.handlingWinGo1P(5);
            const [data] = await connection.execute('SELECT * FROM `wingo` WHERE `game` = "wingo5" ORDER BY `id` DESC LIMIT 2');
            io.emit("data-server", { data: data });
        } catch (e) { console.error("WinGo 5m Master Error:", e); }
    })();
    (async () => {
        try {
            await k5Controller.add5D(5);
            await k5Controller.handling5D(5);
            const [data] = await connection.execute("SELECT * FROM 5d WHERE `game` = 5 ORDER BY `id` DESC LIMIT 2");
            io.emit("data-server-5d", { data: data, game: "5" });
        } catch (e) { console.error("5D 5m Master Error:", e); }
    })();
    (async () => {
        try {
            await trxWingoController.addTrxWingo(5);
            const getLatestData = async () => {
                const [rows] = await connection.execute("SELECT * FROM trx_wingo_game WHERE game = 'trx_wingo5' ORDER BY id DESC LIMIT 2");
                return rows;
            };
            (async () => {
                try {
                    await trxWingoController.updateTrxResult(5);
                    await trxWingoController.handlingTrxWingo1P(5);
                    const resultData = await getLatestData();
                    io.emit("data-server-trx-wingo", { data: resultData });
                } catch (e) { console.error("TRX 5m Result Error:", e); }
            })();
        } catch (e) { console.error("TRX 5m Master Error:", e); }
    })();
  });

  cron.schedule("*/10 * * * *", async () => {
    (async () => {
        try {
            await k3Controller.addK3(10);
            await k3Controller.handlingK3(10);
            const [data] = await connection.execute("SELECT * FROM k3 WHERE `game` = 10 ORDER BY `id` DESC LIMIT 2");
            io.emit("data-server-k3", { data: data, game: "10" });
        } catch (e) { console.error("K3 10m Master Error:", e); }
    })();
    (async () => {
        try {
            await winGoController.addWinGo(10);
            await winGoController.handlingWinGo1P(10);
            const [data] = await connection.execute('SELECT * FROM `wingo` WHERE `game` = "wingo10" ORDER BY `id` DESC LIMIT 2');
            io.emit("data-server", { data: data });
        } catch (e) { console.error("WinGo 10m Master Error:", e); }
    })();
    (async () => {
        try {
            await k5Controller.add5D(10);
            await k5Controller.handling5D(10);
            const [data] = await connection.execute("SELECT * FROM 5d WHERE `game` = 10 ORDER BY `id` DESC LIMIT 2");
            io.emit("data-server-5d", { data: data, game: "10" });
        } catch (e) { console.error("5D 10m Master Error:", e); }
    })();
    (async () => {
        try {
            await trxWingoController.addTrxWingo(10);
            const getLatestData = async () => {
                const [rows] = await connection.execute("SELECT * FROM trx_wingo_game WHERE game = 'trx_wingo10' ORDER BY id DESC LIMIT 2");
                return rows;
            };
            (async () => {
                try {
                    await trxWingoController.updateTrxResult(10);
                    await trxWingoController.handlingTrxWingo1P(10);
                    const resultData = await getLatestData();
                    io.emit("data-server-trx-wingo", { data: resultData });
                } catch (e) { console.error("TRX 10m Result Error:", e); }
            })();
        } catch (e) { console.error("TRX 10m Master Error:", e); }
    })();
  });

  cron.schedule("0 0 * * *", async () => {
    await connection.execute("UPDATE users SET roses_today = ?", [0]);
    await connection.execute("UPDATE users SET ctv_gift_wallet = ?", [0]);
    await connection.execute("UPDATE turn_over SET daily_turn_over = 0, daily_deposit = 0");
  });

  cron.schedule("0 0 * * *", async () => {
    await connection.execute("UPDATE users SET roses_today = ?", [0]);
    await connection.execute("UPDATE users SET ctv_gift_wallet = ?", [0]);
    await connection.execute("UPDATE turn_over SET daily_turn_over = 0, daily_deposit = 0");
  });

  cron.schedule("0 3 * * *", async () => {
    gameController.autoCleanOldGames();
  });

  cron.schedule("0 2 1 * *", async () => {
    vipController.releaseVIPLevel();
  });

  cron.schedule(
    "0 1 * * *",
    async () => await winGoController.distributeCommission(),
  );
  // cron.schedule('* * * * *', async () => await winGoController.distributeCommission());
};

const cronJobController = {
  cronJobGame1p,
};

export default cronJobController;
