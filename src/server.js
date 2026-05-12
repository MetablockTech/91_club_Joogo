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

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const isProduction = process.env.NODE_ENV?.toLowerCase() === "production";
const port = isProduction ? (process.env.PROD_PORT || 3000) : (process.env.DEV_PORT || 2001);

app.use(cookieParser());
// app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Inject SITE_NAME & SITE_LOGO into every view automatically
app.use(async (req, res, next) => {
  try {
    const [rows] = await connection.query("SELECT site_name, site_logo, website_link FROM admin_ac LIMIT 1");
    res.locals.SITE_NAME = rows[0]?.site_name || 'Starworldz';
    res.locals.SITE_LOGO = rows[0]?.site_logo || '';
    res.locals.WEBSITE_LINK = rows[0]?.website_link || 'https://starworldz.com';
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
    const [settings] = await connection.query("SELECT maintenance, maintenance_end_time, maintenance_auto_off FROM admin_ac LIMIT 1");
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

// Cron game 1 Phut
cronJobController.cronJobGame1p(io);

// Check xem ai connect vào sever
socketIoController.sendMessageAdmin(io);

// app.all('*', (req, res) => {
//     return res.render("404.ejs");
// });

server.listen(port, () => {
  console.log(`Connected success http://localhost:${port}`);
});
