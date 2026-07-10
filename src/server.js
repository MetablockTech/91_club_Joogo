import "dotenv/config";

import express from "express";
import connection from "./config/connectDB.js";
import configViewEngine from "./config/configEngine.js";
import routes from "./routes/web.js";
import cronJobController from "./controllers/cronJobController.js";
import socketIoController from "./controllers/socketIoController.js";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import redisClient from "./config/redisDB.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const isProduction = process.env.NODE_ENV?.toLowerCase() === "production";

// Redis Adapter Setup
const redisHost = isProduction ? process.env.PROD_REDIS_HOST : process.env.DEV_REDIS_HOST;
const redisPort = isProduction ? process.env.PROD_REDIS_PORT : process.env.DEV_REDIS_PORT;
const redisPass = isProduction ? process.env.PROD_REDIS_PASS : process.env.DEV_REDIS_PASS;
const redisUrl = `redis://:${redisPass}@${redisHost}:${redisPort}`;
const pubClient = createClient({ 
    url: redisUrl,
    disableOfflineQueue: true
});
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    console.log("Redis Adapter connected for Socket.io");
}).catch(err => {
    console.error("Redis Adapter connection error:", err);
});

const port = isProduction ? (process.env.PROD_PORT || 3000) : (process.env.DEV_PORT || 2001);

app.use(cookieParser());
// app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Inject SITE_NAME & SITE_LOGO into every view automatically
app.use(async (req, res, next) => {
  try {
    let siteInfoStr;
    try {
        siteInfoStr = await redisClient.get("site_info");
    } catch (e) {
        siteInfoStr = null;
    }
    
    if (!siteInfoStr) {
        const [rows] = await connection.query("SELECT site_name, site_logo, website_link FROM admin_ac LIMIT 1");
        siteInfoStr = JSON.stringify(rows[0] || {});
        try { redisClient.set("site_info", siteInfoStr, { EX: 300 }); } catch (e) {}
    }
    const parsed = JSON.parse(siteInfoStr);
    res.locals.SITE_NAME = parsed.site_name || 'Starworldz';
    res.locals.SITE_LOGO = parsed.site_logo || '';
    res.locals.WEBSITE_LINK = parsed.website_link || 'https://starworldz.com';
  } catch (e) {
    res.locals.SITE_NAME = 'Starworldz';
    res.locals.SITE_LOGO = '';
    res.locals.WEBSITE_LINK = 'https://starworldz.com';
  }
  next();
});

// setup viewEngine
configViewEngine(app);

// Global Maintenance Mode Guard — runs before ALL routes
app.use(async (req, res, next) => {
  const path = req.path;
  // Exempt: admin panel, all /api/* (game APIs, login, etc), maintenance page, static files
  if (
    path.startsWith('/admin') ||
    path.startsWith('/api') ||
    path === '/maintenance' ||
    path === '/login' ||
    path === '/register' ||
    path.startsWith('/uploads') ||
    path.includes('.')
  ) {
    return next();
  }
  try {
    let maintenanceSettingsStr;
    try {
        maintenanceSettingsStr = await redisClient.get("maintenance_settings");
    } catch (e) {
        maintenanceSettingsStr = null;
    }
    
    if (!maintenanceSettingsStr) {
        const [settings] = await connection.query("SELECT maintenance, maintenance_end_time, maintenance_auto_off FROM admin_ac LIMIT 1");
        maintenanceSettingsStr = JSON.stringify(settings[0] || {});
        try { redisClient.set("maintenance_settings", maintenanceSettingsStr, { EX: 60 }); } catch (e) {}
    }
    const settings = [JSON.parse(maintenanceSettingsStr)];
    if (settings[0]?.maintenance === 1) {
      // Check for Auto-Live
      if (settings[0].maintenance_auto_off === 1 && settings[0].maintenance_end_time) {
          const now = new Date();
          const endTime = new Date(settings[0].maintenance_end_time);
          if (now >= endTime) {
              return next();
          }
      }

      const auth = req.cookies.auth;
      if (auth) {
        const [rows] = await connection.query(
          "SELECT level FROM users WHERE token = ? AND veri = 1", [auth]
        );
        // Level 1 = Admin — bypass maintenance
        if (rows && rows.length > 0 && rows[0].level === 1) {
          return next();
        }
      }
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      return res.redirect('/maintenance');
    }
  } catch (e) {
    console.error('[Maintenance Middleware Error]', e.message);
  }
  next();
});

// init Web Routes
routes.initWebRouter(app);

// Cron game 1 Phut (Only run on Primary Instance in PM2 Cluster Mode)
const isPrimaryInstance = process.env.NODE_APP_INSTANCE === undefined || process.env.NODE_APP_INSTANCE === '0';
if (isPrimaryInstance) {
    console.log("Primary instance: Starting Cron Jobs.");
    cronJobController.cronJobGame1p(io);
} else {
    console.log(`Worker instance ${process.env.NODE_APP_INSTANCE}: Skipping Cron Jobs.`);
}

// Check xem ai connect vào sever
socketIoController.sendMessageAdmin(io);

// app.all('*', (req, res) => {
//     return res.render("404.ejs");
// });

server.listen(port, () => {
  console.log(`Connected success http://localhost:${port}`);
});
