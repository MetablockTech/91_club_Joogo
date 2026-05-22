import connection from "./src/config/connectDB.js";
import crypto from 'crypto';

async function run() {
    const [rows] = await connection.query("SELECT * FROM payment_configs WHERE gateway_name = 'payok'");
    const privateKey = rows[0].private_key;
    try {
        const sign = crypto.createSign('RSA-SHA256').update('test').sign(privateKey, 'base64');
        console.log("TEST SIGN SUCCESS! Signature:", sign.substring(0, 30) + "...");
    } catch (e) {
        console.error("Error signing with private key:", e.message);
        console.error(e.stack);
    }
    process.exit(0);
}
run();
