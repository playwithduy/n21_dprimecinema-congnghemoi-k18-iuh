// ============================================================
// email.service.js
// Đặt tại: services/booking-service/src/services/email.service.js
// ============================================================

const nodemailer = require("nodemailer");

const MAIL_CONFIG = {
    gmail:    "playwithduy@gmail.com",
    password: "lgzy ikut tfxi ocsc",
    name:     "DPrime Cinema",
};

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: MAIL_CONFIG.gmail,
        pass: MAIL_CONFIG.password,
    },
});

/* ─── QR URL ─────────────────────────────────────────────────── */
function buildQRUrl({ booking_code, movie_name, cinema_info, show_time, seats, final_total }) {
    const data = [
        booking_code,
        movie_name  || "",
        cinema_info || "",
        show_time   || "",
        (seats || []).join(","),
        Number(final_total).toLocaleString("vi-VN") + "d",
    ].join("|");
    return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(data)}&bgcolor=ffffff&color=000000&margin=10`;
}

/* ─── Watermark band ─────────────────────────────────────────── */
const WM = `
<tr><td style="background:#e8a0a6;padding:5px 0">
<div style="font-family:'Courier New',monospace;font-size:9px;font-weight:700;letter-spacing:2px;color:rgba(192,55,61,0.3);text-transform:uppercase;white-space:nowrap;overflow:hidden;padding:2px 12px">DPRIME &nbsp;TICKET &nbsp;DPRIME &nbsp;TICKET &nbsp;DPRIME &nbsp;TICKET &nbsp;DPRIME &nbsp;TICKET &nbsp;DPRIME</div>
<div style="font-family:'Courier New',monospace;font-size:9px;font-weight:700;letter-spacing:2px;color:rgba(192,55,61,0.3);text-transform:uppercase;white-space:nowrap;overflow:hidden;padding:2px 12px">TICKET &nbsp;DPRIME &nbsp;TICKET &nbsp;DPRIME &nbsp;TICKET &nbsp;DPRIME &nbsp;TICKET &nbsp;DPRIME &nbsp;TICKET</div>
<div style="font-family:'Courier New',monospace;font-size:9px;font-weight:700;letter-spacing:2px;color:rgba(192,55,61,0.3);text-transform:uppercase;white-space:nowrap;overflow:hidden;padding:2px 12px">DPRIME &nbsp;TICKET &nbsp;DPRIME &nbsp;TICKET &nbsp;DPRIME &nbsp;TICKET &nbsp;DPRIME &nbsp;TICKET &nbsp;DPRIME</div>
</td></tr>`;

const SEP_EQ  = `<tr><td style="font-family:'Courier New',monospace;font-size:9px;color:#b08085;padding:4px 0;letter-spacing:0">=================================</td></tr>`;
const SEP_DA  = `<tr><td style="font-family:'Courier New',monospace;font-size:9px;color:#b08085;padding:4px 0;letter-spacing:0">---------------------------------</td></tr>`;
const SEP_DOT = `<tr><td style="font-family:'Courier New',monospace;font-size:9px;color:#b08085;padding:4px 0;text-align:center;letter-spacing:2px">- - - - - - - - - - - - - - - - -</td></tr>`;

/* ============================================================
   HÀM GỬI EMAIL VÉ  –  CGV-style thermal ticket
   ============================================================ */
async function sendTicketEmail({ to, booking_code, movie_name, cinema_info, show_time, seats, combos, seat_total, combo_total, final_total, payment_method }) {

    const payMethodLabel = { cash: "Tien mat tai quay", bank_transfer: "Chuyen khoan", vnpay: "VNPay" }[payment_method] || payment_method;
    const statusLabel    = payment_method === "cash" ? "CHO THANH TOAN" : "DA THANH TOAN";
    const seatsText      = (seats || []).join(", ") || "---";
    const qrUrl          = buildQRUrl({ booking_code, movie_name, cinema_info, show_time, seats, final_total });

    const now     = new Date();
    const dateStr = `${now.getDate().toString().padStart(2,"0")}/${(now.getMonth()+1).toString().padStart(2,"0")}/${now.getFullYear()} ${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`;

    const comboRows = combos && combos.length > 0 ? combos.map(c => `
        <tr>
            <td style="font-family:'Courier New',monospace;font-size:11px;color:#444;text-transform:uppercase;padding:3px 0">${c.combo_name} x${c.qty}</td>
            <td style="font-family:'Courier New',monospace;font-size:11px;color:#111;font-weight:700;text-align:right;padding:3px 0">${Number(c.total_price).toLocaleString("vi-VN")}d</td>
        </tr>`).join("") : "";

    const comboSection = combos && combos.length > 0 ? `
        ${SEP_DA}
        <tr><td style="font-family:'Courier New',monospace;font-size:9px;color:#888;text-transform:uppercase;letter-spacing:1.5px;padding:3px 0">COMBO DA CHON</td></tr>
        <tr><td><table width="100%" cellpadding="0" cellspacing="0">${comboRows}</table></td></tr>` : "";

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#1a1a2e">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a2e;padding:32px 0">
<tr><td align="center">
<table width="420" cellpadding="0" cellspacing="0" style="background:#f5c8cc;overflow:hidden;box-shadow:0 12px 48px rgba(0,0,0,0.6)">

    <!-- HEADER -->
    <tr><td style="background:#c0373d;padding:18px 20px">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td>
                <div style="font-family:Arial,sans-serif;font-weight:900;font-size:28px;color:#fff;line-height:1">DPrime</div>
                <div style="font-family:Arial,sans-serif;font-weight:600;font-size:11px;color:rgba(255,255,255,0.65);letter-spacing:4px;margin-top:2px">CINEMA</div>
            </td>
            <td style="text-align:right;vertical-align:top">
                <div style="background:#fff;color:#c0373d;font-family:Arial,sans-serif;font-weight:800;font-size:10px;letter-spacing:1px;padding:4px 10px;border-radius:2px;display:inline-block">${statusLabel}</div>
                <div style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:2px;color:rgba(255,255,255,0.6);text-transform:uppercase;margin-top:6px">THE VAO PHONG CHIEU PHIM</div>
            </td>
        </tr></table>
    </td></tr>

    ${WM}

    <!-- BODY -->
    <tr><td style="padding:16px 20px 20px">
    <table width="100%" cellpadding="0" cellspacing="0">

        <tr><td style="font-family:Arial,sans-serif;font-weight:700;font-size:12px;text-transform:uppercase;color:#1a1a1a;padding-bottom:2px">${cinema_info || "D Prime Cinema"}</td></tr>
        <tr><td style="font-family:'Courier New',monospace;font-size:10px;color:#666;padding-bottom:10px">Ho Chi Minh City</td></tr>

        ${SEP_EQ}

        <tr><td style="padding:8px 0 2px">
            <div style="font-family:Arial,sans-serif;font-weight:900;font-size:24px;text-transform:uppercase;color:#1a1a1a;line-height:1.1">${movie_name || "---"}</div>
            <div style="font-family:'Courier New',monospace;font-size:12px;color:#444;margin-top:4px">${show_time || "---"}</div>
        </td></tr>

        ${SEP_EQ}

        <tr><td><table width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td style="font-family:'Courier New',monospace;font-size:10px;color:#666;text-transform:uppercase;padding:4px 0">GHE / PHONG</td>
                <td style="font-family:'Courier New',monospace;font-size:11px;color:#111;font-weight:700;text-align:right;padding:4px 0">${seatsText}</td>
            </tr>
            <tr>
                <td style="font-family:'Courier New',monospace;font-size:10px;color:#666;text-transform:uppercase;padding:4px 0">NGAY DAT</td>
                <td style="font-family:'Courier New',monospace;font-size:11px;color:#111;font-weight:700;text-align:right;padding:4px 0">${dateStr}</td>
            </tr>
        </table></td></tr>

        ${SEP_DA}

        <tr><td><table width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td style="font-family:'Courier New',monospace;font-size:10px;color:#666;text-transform:uppercase;padding:4px 0">THANH TOAN</td>
                <td style="font-family:'Courier New',monospace;font-size:11px;color:#111;font-weight:700;text-align:right;padding:4px 0">${payMethodLabel}</td>
            </tr>
            <tr>
                <td style="font-family:'Courier New',monospace;font-size:10px;color:#666;text-transform:uppercase;padding:4px 0">GIA VE (GHE)</td>
                <td style="font-family:'Courier New',monospace;font-size:11px;color:#111;font-weight:700;text-align:right;padding:4px 0">${Number(seat_total||0).toLocaleString("vi-VN")}d</td>
            </tr>
        </table></td></tr>

        ${comboSection}

        ${SEP_DA}

        <tr><td><table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="font-family:Arial,sans-serif;font-weight:800;font-size:13px;text-transform:uppercase;color:#1a1a1a;letter-spacing:1px;padding:6px 0">TONG TIEN</td>
            <td style="font-family:Arial,sans-serif;font-weight:900;font-size:22px;color:#c0373d;text-align:right;padding:6px 0">${Number(final_total).toLocaleString("vi-VN")}d</td>
        </tr></table></td></tr>

        ${SEP_EQ}

        <tr><td style="text-align:center;padding:12px 0 6px">
            <div style="font-family:'Courier New',monospace;font-size:9px;color:#888;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px">MA DAT VE</div>
            <div style="font-family:'Courier New',monospace;font-size:22px;font-weight:700;color:#c0373d;letter-spacing:3px">${booking_code}</div>
            <div style="font-family:'Courier New',monospace;font-size:9px;color:#888;margin-top:5px">Xuat trinh ma nay tai quay khi den rap</div>
        </td></tr>

        ${SEP_DOT}

        <tr><td style="text-align:center;padding:10px 0 6px">
            <div style="font-family:'Courier New',monospace;font-size:9px;color:#888;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px">QUET QR XAC NHAN VE</div>
            <div style="display:inline-block;background:#fff;padding:8px;border:1px solid #d0a0a3">
                <img src="${qrUrl}" width="160" height="160" alt="QR" style="display:block" />
            </div>
            <div style="font-family:'Courier New',monospace;font-size:9px;color:#999;margin-top:8px">Nhan vien quet ma nay tai quay</div>
        </td></tr>

        <tr><td style="text-align:center;padding:10px 0 2px;font-family:'Courier New',monospace;font-size:10px;color:#888">Cam on quy khach. Chuc xem phim vui ve!</td></tr>
        <tr><td style="text-align:center;padding:2px 0 8px;font-family:'Courier New',monospace;font-size:9px;color:#aaa">dprime.cinema &nbsp;|&nbsp; hotline: 1900-xxxx</td></tr>

    </table>
    </td></tr>

</table>
</td></tr>
</table>
</body></html>`;

    try {
        const info = await transporter.sendMail({
            from:    `"${MAIL_CONFIG.name}" <${MAIL_CONFIG.gmail}>`,
            to,
            subject: `[DPrime Cinema] Ve cua ban — ${booking_code}`,
            html,
        });
        console.log("📧 Email sent:", info.messageId, "→", to);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error("❌ Email error:", err.message);
        return { success: false, error: err.message };
    }
}

/* ============================================================
   HÀM GỬI EMAIL HỦY VÉ  –  CGV-style
   ============================================================ */
async function sendCancelEmail({ to, booking_code, seats, final_total }) {
    const seatsText = (seats || []).join(", ") || "---";

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#1a1a2e">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a2e;padding:32px 0">
<tr><td align="center">
<table width="420" cellpadding="0" cellspacing="0" style="background:#f5c8cc;overflow:hidden;box-shadow:0 12px 48px rgba(0,0,0,0.6)">

    <!-- HEADER -->
    <tr><td style="background:#c0373d;padding:18px 20px">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td>
                <div style="font-family:Arial,sans-serif;font-weight:900;font-size:28px;color:#fff;line-height:1">DPrime</div>
                <div style="font-family:Arial,sans-serif;font-weight:600;font-size:11px;color:rgba(255,255,255,0.65);letter-spacing:4px;margin-top:2px">CINEMA</div>
            </td>
            <td style="text-align:right;vertical-align:top">
                <div style="background:#fff;color:#c0373d;font-family:Arial,sans-serif;font-weight:800;font-size:10px;letter-spacing:1px;padding:4px 10px;border-radius:2px;display:inline-block">DA HUY</div>
                <div style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:2px;color:rgba(255,255,255,0.6);text-transform:uppercase;margin-top:6px">THONG BAO HUY VE</div>
            </td>
        </tr></table>
    </td></tr>

    ${WM}

    <!-- BODY -->
    <tr><td style="padding:16px 20px 20px">
    <table width="100%" cellpadding="0" cellspacing="0">

        ${SEP_EQ}

        <tr><td style="padding:8px 0 4px">
            <div style="font-family:Arial,sans-serif;font-weight:900;font-size:22px;text-transform:uppercase;color:#c0373d;line-height:1.1">VE DA BI HUY</div>
            <div style="font-family:'Courier New',monospace;font-size:11px;color:#555;margin-top:4px">Yeu cau huy ve da duoc xu ly thanh cong</div>
        </td></tr>

        ${SEP_EQ}

        <tr><td><table width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td style="font-family:'Courier New',monospace;font-size:10px;color:#666;text-transform:uppercase;padding:4px 0">GHE</td>
                <td style="font-family:'Courier New',monospace;font-size:11px;color:#111;font-weight:700;text-align:right;padding:4px 0">${seatsText}</td>
            </tr>
            <tr>
                <td style="font-family:'Courier New',monospace;font-size:10px;color:#666;text-transform:uppercase;padding:4px 0">SO TIEN</td>
                <td style="font-family:'Courier New',monospace;font-size:11px;color:#111;font-weight:700;text-align:right;padding:4px 0">${Number(final_total).toLocaleString("vi-VN")}d</td>
            </tr>
        </table></td></tr>

        ${SEP_EQ}

        <tr><td style="text-align:center;padding:12px 0 6px">
            <div style="font-family:'Courier New',monospace;font-size:9px;color:#888;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px">MA DAT VE</div>
            <div style="font-family:'Courier New',monospace;font-size:22px;font-weight:700;color:#c0373d;letter-spacing:3px">${booking_code}</div>
        </td></tr>

        ${SEP_DOT}

        <tr><td style="padding:10px 0">
            <div style="font-family:'Courier New',monospace;font-size:9px;color:#666;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">LUU Y</div>
            <div style="font-family:'Courier New',monospace;font-size:10px;color:#555;line-height:1.7">
                - Neu ban KHONG yeu cau huy ve nay,<br>
                &nbsp;&nbsp;lien he ngay: 1900-xxxx<br>
                - Ghe da duoc giai phong cho nguoi khac
            </div>
        </td></tr>

        <tr><td style="text-align:center;padding:8px 0;font-family:'Courier New',monospace;font-size:9px;color:#aaa">dprime.cinema &nbsp;|&nbsp; hotline: 1900-xxxx</td></tr>

    </table>
    </td></tr>

</table>
</td></tr>
</table>
</body></html>`;

    try {
        const info = await transporter.sendMail({
            from:    `"${MAIL_CONFIG.name}" <${MAIL_CONFIG.gmail}>`,
            to,
            subject: `[DPrime Cinema] Ve ${booking_code} da bi huy`,
            html,
        });
        console.log("📧 Cancel email sent:", info.messageId, "→", to);
        return { success: true };
    } catch (err) {
        console.error("❌ sendCancelEmail error:", err.message);
        return { success: false, error: err.message };
    }
}

module.exports = { sendTicketEmail, sendCancelEmail };