import { createClient } from "redis";
import "dotenv/config";

const isProduction = process.env.NODE_ENV?.toLowerCase() === "production";
const host = isProduction ? process.env.PROD_REDIS_HOST : process.env.DEV_REDIS_HOST;
const port = isProduction ? process.env.PROD_REDIS_PORT : process.env.DEV_REDIS_PORT;
const pass = isProduction ? process.env.PROD_REDIS_PASS : process.env.DEV_REDIS_PASS;

const redisClient = createClient({ 
    password: pass,
    socket: {
        host: host,
        port: port
    },
    disableOfflineQueue: true
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Connect automatically when imported
(async () => {
    try {
        await redisClient.connect();
        console.log("Global Redis Client Connected");
    } catch (error) {
        console.error("Global Redis Client Connection Error:", error);
    }
})();

export default redisClient;
