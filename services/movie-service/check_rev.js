const db = require("./src/config/db");

async function checkRevenue() {
    try {
        const movieId = 2; // Nhà Trấn Quỷ
        console.log(`Checking revenue for Movie ID: ${movieId}`);
        
        // 1. Find showtimes for this movie
        const [showtimes] = await db.query("SELECT id FROM showtimes WHERE movie_id = ?", [movieId]);
        const showtimeIds = showtimes.map(s => s.id);
        console.log("Showtime IDs:", showtimeIds);

        if (showtimeIds.length === 0) {
            console.log("No showtimes found for this movie.");
            return;
        }

        // 2. Check bookings for these showtimes
        const [bookings] = await db.query(`
            SELECT b.id, b.final_total, b.payment_status 
            FROM booking_db.bookings b 
            WHERE b.showtime_id IN (?)
        `, [showtimeIds]);
        
        console.log("Bookings found:", bookings);

        const totalRevenue = bookings
            .filter(b => b.payment_status === 'paid')
            .reduce((sum, b) => sum + parseFloat(b.final_total), 0);
        
        console.log("Total Paid Revenue:", totalRevenue);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit();
    }
}

checkRevenue();
