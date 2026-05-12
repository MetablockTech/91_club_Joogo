import connection from "../config/connectDB.js";

const middlewareController = async (req, res, next) => {
  // xác nhận token
  const auth = req.cookies.auth;
  if (!auth) return res.redirect("/login");
  try {
    // Check maintenance mode
    const [settings] = await connection.execute("SELECT maintenance FROM admin_ac LIMIT 1");
    const isMaintenance = settings[0]?.maintenance === 1;

    const [rows] = await connection.execute(
      "SELECT `token`, `status`, `level` FROM `users` WHERE `token` = ? AND `veri` = 1",
      [auth],
    );

    if (isMaintenance && (!rows || !rows[0] || rows[0].level !== 1)) {
        return res.redirect("/maintenance");
    }

    if (!rows || rows.length === 0) {
      res.clearCookie("auth");
      return res.end();
    }
    if (auth == rows[0].token && rows[0].status == "1") {
      req.userToken = auth;
      next();
    } else {
      return res.redirect("/login");
    }
  } catch (error) {
    return res.redirect("/login");
  }
};

export default middlewareController;
