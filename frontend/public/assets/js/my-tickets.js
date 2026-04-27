const API_BASE = window.location.protocol + "//" + window.location.hostname + ":3000/api/booking";

let allTickets    = [];
let currentFilter = "all";
let currentTicket = null;

/* ─── Utils ───────────────────────────────────────── */
function formatPrice(num) {
    if (!num) return "0đ";
    return Number(num).toLocaleString("vi-VN") + "đ";
}

function formatDate(dateStr) {
    if (!dateStr) return "---";
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2,"0")}/${(d.getMonth()+1).toString().padStart(2,"0")}/${d.getFullYear()} ${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
}

function formatShowTime(time) {
    if (!time) return "---";
    if (typeof time === "string" && time.length <= 5) return time;
    try {
        const d = new Date(time);
        return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
    } catch { return time; }
}

function payMethodLabel(method) {
    return {
        cash:          "Tiền mặt tại quầy",
        bank_transfer: "Chuyển khoản",
        vnpay:         "VNPay"
    }[method] || method;
}

function statusLabel(status) {
    const map = {
        paid:         { text: "Da thanh toan", cls: "status-paid"      },
        pending:      { text: "Cho thanh toan", cls: "status-pending"   },
        pending_cash: { text: "Cho tra tien",   cls: "status-pending"   },
        cancelled:    { text: "Da huy",          cls: "status-cancelled" },
        failed:       { text: "That bai",        cls: "status-cancelled" },
    };
    return map[status] || { text: status, cls: "" };
}

/* ─── QR URL ──────────────────────────────────────── */
function buildQRUrl(ticket) {
    const data = [
        ticket.booking_code,
        ticket.movie_name  || "",
        ticket.cinema_name || "",
        ticket.room_name   || "",
        formatShowTime(ticket.show_time),
        (ticket.seats || []).join(","),
        formatPrice(ticket.final_total),
    ].join("|");
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}&bgcolor=ffffff&color=000000&margin=10`;
}

/* ─── Decode JWT ──────────────────────────────────── */
function decodeJWT(token) {
    try { return JSON.parse(atob(token.split(".")[1])); }
    catch { return null; }
}

/* ─── Get user ────────────────────────────────────── */
function getUser() {
    try {
        const token = localStorage.getItem("token");
        let u = {};
        try { u = JSON.parse(localStorage.getItem("user") || "{}"); } catch {}

        if (u?.id)      return u;
        if (u?.user_id) return { ...u, id: u.user_id };

        if (token) {
            const jwt = decodeJWT(token);
            if (jwt?.id) {
                const fixed = { ...u, id: jwt.id, email: u.email || jwt.email || "" };
                localStorage.setItem("user", JSON.stringify(fixed));
                return fixed;
            }
        }
        return null;
    } catch { return null; }
}

/* ─── Load tickets ───────────────────────────────── */
document.addEventListener("DOMContentLoaded", async () => {
    const user = getUser();
    if (!user) { showEmpty("Chua dang nhap", "Vui long dang nhap de xem ve cua ban."); return; }
    await loadTickets(user.id);
    bindTabs();
});

async function loadTickets(userId) {
    try {
        const res  = await fetch(`${API_BASE}/payment/my-tickets/${userId}`);
        const data = await res.json();
        document.getElementById("tickets-loading").style.display = "none";
        if (!data.success || !data.tickets?.length) { showEmpty("Chua co ve", "Ban chua dat ve nao."); return; }
        allTickets = data.tickets;
        renderTickets(allTickets);
    } catch(err) {
        console.error("❌", err);
        showEmpty("Loi tai du lieu", "Khong the ket noi server.");
    }
}

function showEmpty(title, msg) {
    document.getElementById("tickets-loading").style.display = "none";
    document.getElementById("tickets-list").style.display    = "none";
    const el = document.getElementById("tickets-empty");
    el.style.display = "";
    el.querySelector("h3").textContent = title;
    el.querySelector("p").textContent  = msg;
}

/* ─── Render list ─────────────────────────────────── */
function renderTickets(tickets) {
    const list = document.getElementById("tickets-list");
    list.innerHTML = "";
    if (!tickets.length) { showEmpty("Khong co ve", ""); return; }
    document.getElementById("tickets-empty").style.display = "none";
    list.style.display = "";

    tickets.forEach((t, i) => {
        const { text: sText, cls: sCls } = statusLabel(t.payment_status);
        const card = document.createElement("div");
        card.className = "ticket-item";
        card.style.animationDelay = `${i * 0.05}s`;
        card.innerHTML = `
            <div class="ti-left">
                <div class="ti-date-col">
                    <div class="ti-day">${new Date(t.created_at).getDate().toString().padStart(2,"0")}</div>
                    <div class="ti-mon">${new Date(t.created_at).toLocaleString("vi-VN",{month:"short"})}</div>
                    <div class="ti-year">${new Date(t.created_at).getFullYear()}</div>
                </div>
            </div>
            <div class="ti-main">
                <div class="ti-top-row">
                    <div class="ti-movie">${t.movie_name || "---"}</div>
                    <span class="ti-status-badge ${sCls}">${sText}</span>
                </div>
                <div class="ti-meta">
                    <span>${t.cinema_name || "---"}${t.room_name ? " • " + t.room_name : ""}</span>
                    <span>${formatShowTime(t.show_time)}</span>
                    <span>${(t.seats || []).join(", ") || "---"}</span>
                </div>
                <div class="ti-footer-row">
                    <div class="ti-code">${t.booking_code}</div>
                    <div class="ti-total">${formatPrice(t.final_total)}</div>
                </div>
            </div>
            <div class="ti-arrow">›</div>
        `;
        card.addEventListener("click", () => openTicketModal(t));
        list.appendChild(card);
    });
}

/* ─── Tabs ────────────────────────────────────────── */
function bindTabs() {
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentFilter = btn.dataset.filter;
            let filtered = allTickets;
            if (currentFilter !== "all") {
                filtered = allTickets.filter(t => {
                    if (currentFilter === "paid")      return t.payment_status === "paid";
                    if (currentFilter === "pending")   return ["pending","pending_cash"].includes(t.payment_status);
                    if (currentFilter === "cancelled") return ["cancelled","failed"].includes(t.payment_status);
                    return true;
                });
            }
            renderTickets(filtered);
        });
    });
}

/* ─── Modal ───────────────────────────────────────── */
function openTicketModal(t) {
    currentTicket = t;

    const { text: sText, cls: sCls } = statusLabel(t.payment_status);
    setText("modal-movie",      t.movie_name || "---");
    setText("modal-cinema",     `${t.cinema_name || ""}${t.room_name ? " • " + t.room_name : ""}`);
    setText("modal-showtime",   formatShowTime(t.show_time));
    setText("modal-seats",      (t.seats || []).join(", ") || "---");
    setText("modal-date",       formatDate(t.created_at));
    setText("modal-method",     payMethodLabel(t.payment_method));
    setText("modal-seat-price", formatPrice(t.seat_price || t.ticket_price));
    setText("modal-total",      formatPrice(t.final_total));

    const statusEl = document.getElementById("modal-status");
    statusEl.textContent = sText;
    statusEl.className   = `cgv-status-badge ${sCls}`;

    // Barcode 1D (Booking Code)
    if (window.JsBarcode) {
        JsBarcode("#ticket-barcode", t.booking_code, {
            format: "CODE128",
            width: 2,
            height: 45,
            displayValue: true,
            fontSize: 18,
            fontOptions: "bold",
            font: "Share Tech Mono",
            margin: 10,
            lineColor: "#111"
        });
    }

    // QR
    const qrImg = document.getElementById("modal-qr");
    if (qrImg) {
        qrImg.src = buildQRUrl(t);
        qrImg.style.display = "block";
    }

    // Combo
    const comboWrap = document.getElementById("modal-combo-wrap");
    const comboList = document.getElementById("modal-combo-list");
    if (comboWrap && comboList) {
        if (t.combos && t.combos.length > 0) {
            comboList.innerHTML = t.combos.map(c =>
                `<div class="cgv-row-data"><span class="cgv-field">${c.combo_name} x${c.qty}</span><span class="cgv-value">${formatPrice(c.total_price)}</span></div>`
            ).join("");
            comboWrap.style.display = "";
        } else {
            comboWrap.style.display = "none";
        }
    }

    // Reset nút tải
    const btnText    = document.getElementById("btn-dl-text");
    const btnLoading = document.getElementById("btn-dl-loading");
    const btnDl      = document.getElementById("btn-download-ticket");
    if (btnText)    btnText.style.display    = "";
    if (btnLoading) btnLoading.style.display = "none";
    if (btnDl)      btnDl.disabled           = false;

    // ✅ Hiện nút hủy vé chỉ khi trạng thái pending
    const cancelBtn = document.getElementById("btn-cancel-ticket");
    if (cancelBtn) {
        const isPending = ["pending", "pending_cash"].includes(t.payment_status);
        cancelBtn.style.display = isPending ? "block" : "none";
        cancelBtn.disabled      = false;
        cancelBtn.textContent   = "Huy ve";
    }

    const modal = document.getElementById("ticket-modal");
    modal.style.display = "flex";
    setTimeout(() => modal.classList.add("visible"), 10);
}

/* ─── Cancel ticket ───────────────────────────────── */
window.cancelTicket = async function() {
    if (!currentTicket) return;
    if (!confirm("Ban co chac chan muon huy ve nay? Hanh dong nay khong the hoan tac.")) return;

    const cancelBtn = document.getElementById("btn-cancel-ticket");
    if (cancelBtn) {
        cancelBtn.disabled    = true;
        cancelBtn.textContent = "Dang huy...";
    }

    try {
        const res  = await fetch(`${API_BASE}/payment/cancel/${currentTicket.booking_code}`, { method: "POST" });
        const data = await res.json();
        if (data.success) {
            alert("Huy ve thanh cong.");
            closeTicketModal();
            const user = getUser();
            if (user) await loadTickets(user.id);
        } else {
            alert(data.message || "Huy ve that bai. Vui long thu lai.");
        }
    } catch (err) {
        console.error("❌ Cancel error:", err);
        alert("Khong the ket noi server.");
    } finally {
        if (cancelBtn) {
            cancelBtn.disabled    = false;
            cancelBtn.textContent = "Huy ve";
        }
    }
};

/* ─── Download PNG ────────────────────────────────── */
window.downloadTicketPNG = async function() {
    const btn     = document.getElementById("btn-download-ticket");
    const btnText = document.getElementById("btn-dl-text");
    const btnLoad = document.getElementById("btn-dl-loading");

    btn.disabled          = true;
    btnText.style.display = "none";
    btnLoad.style.display = "";

    try {
        const card  = document.getElementById("ticket-card-capture");
        const qrImg = document.getElementById("modal-qr");
        if (qrImg && !qrImg.complete) {
            await new Promise(resolve => { qrImg.onload = resolve; qrImg.onerror = resolve; });
        }

        const canvas = await html2canvas(card, {
            backgroundColor: "#f5c8cc",
            scale: 2,
            useCORS: true,
            allowTaint: false,
            logging: false,
        });

        const filename = currentTicket ? `ve-${currentTicket.booking_code}.png` : "ve-dprime.png";
        const link     = document.createElement("a");
        link.download  = filename;
        link.href      = canvas.toDataURL("image/png");
        link.click();

    } catch(err) {
        console.error("❌ Download error:", err);
        alert("Khong the tai ve. Vui long thu lai.");
    } finally {
        btn.disabled          = false;
        btnText.style.display = "";
        btnLoad.style.display = "none";
    }
};

/* ─── Helpers ─────────────────────────────────────── */
function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

window.closeTicketModal = function(e) {
    if (e && e.currentTarget !== e.target) return;
    const modal = document.getElementById("ticket-modal");
    modal.classList.remove("visible");
    setTimeout(() => modal.style.display = "none", 250);
};
