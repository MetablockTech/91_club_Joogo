import connection from "./config/connectDB.js";

async function dumpSchema() {
    try {
        console.log("--- USERS TABLE ---");
        const [userColumns] = await connection.query("SHOW COLUMNS FROM users");
        userColumns.forEach(c => console.log(c.Field));

        console.log("\n--- TURN_OVER TABLE ---");
        const [turnoverColumns] = await connection.query("SHOW COLUMNS FROM turn_over");
        turnoverColumns.forEach(c => console.log(c.Field));

        console.log("\n--- PAYMENT_CONFIGS TABLE ---");
        const [paymentColumns] = await connection.query("SHOW COLUMNS FROM payment_configs");
        paymentColumns.forEach(c => console.log(c.Field));

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

dumpSchema();
