const db = require("./src/config/db");

async function test() {
    const room_id = 1;
    const show_date = '2026-05-09';
    const show_time = '22:02';

    try {
        console.log("Checking overlap for Room 1 on 2026-05-09 at 22:02");
        const [overlap] = await db.query(`
          SELECT st.id, st.show_time, sd.show_date 
          FROM showtimes st
          JOIN show_dates sd ON st.show_date_id = sd.id
          WHERE st.room_id = ? AND sd.show_date = ?
            AND ABS(TIME_TO_SEC(st.show_time) - TIME_TO_SEC(?)) < 10800
        `, [room_id, show_date, show_time]);

        console.log("Found overlaps:", overlap);
    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit();
    }
}

test();
