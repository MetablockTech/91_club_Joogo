import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const isProduction = process.env.NODE_ENV?.toLowerCase() === "production";
const host = isProduction ? process.env.PROD_DB_HOST : process.env.DEV_DB_HOST;
const port = isProduction ? process.env.PROD_DB_PORT : process.env.DEV_DB_PORT;

console.log(`Connecting to DB: ${host}:${port} (Mode: ${process.env.NODE_ENV})`);

const connection = mysql.createPool({
    host: host,
    port: port || 3306,
    user: isProduction ? process.env.PROD_DB_USER : process.env.DEV_DB_USER,
    password: isProduction ? process.env.PROD_DB_PASS : process.env.DEV_DB_PASS,
    database: isProduction ? process.env.PROD_DB_NAME : process.env.DEV_DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default connection;
