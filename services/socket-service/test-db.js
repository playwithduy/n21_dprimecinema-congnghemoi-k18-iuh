const mysql = require("mysql2/promise");
async function test() {
    try {
        const conn = await mysql.createConnection({
            host: "127.0.0.1",
            user: "root",
            password: "",
            database: "booking_db",
            port: 3306
        });
        console.log("SUCCESS");
        await conn.end();
    } catch (err) {
        console.log("FAILURE: " + err.message);
    }
}
test();
