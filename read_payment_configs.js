import connection from "./src/config/connectDB.js";

async function run() {
    const [rows] = await connection.query("SELECT gateway_name, quick_amounts FROM payment_configs");
    console.log(rows);
    process.exit(0);
}
run();
