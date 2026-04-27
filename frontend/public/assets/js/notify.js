/* ================= NOTIFICATION SYSTEM ================= */

const NOTIFY_KEY = "app_notifications";

function getNotifications() {
  try { return JSON.parse(localStorage.getItem(NOTIFY_KEY) || "[]"); }
  catch(e) { return []; }
}

function saveNotifications(list) {
  localStorage.setItem(NOTIFY_KEY, JSON.stringify(list));
}

window.pushNotification = function(message, type = "info") {
  const list = getNotifications();
  list.unshift({
    id     : Date.now(),
    message,
    type,
    read   : false,
    time   : new Date().toLocaleString("vi-VN")
  });
  saveNotifications(list.slice(0, 20));
  renderNotifyBadge();
  renderNotifyDropdown();
};

function countUnread() {
  return getNotifications().filter(n => !n.read).length;
}

function renderNotifyBadge() {
  const badge = document.querySelector(".notify .badge");
  if (!badge) return;
  const count = countUnread();
  badge.textContent = count > 9 ? "9+" : count;
  badge.style.display = count === 0 ? "none" : "inline-block";
}

function renderNotifyDropdown() {
  const dropdown = document.getElementById("notifyDropdown");
  if (!dropdown) return;

  const list = getNotifications();

  if (list.length === 0) {
    dropdown.innerHTML = `<div class="notify-empty">Không có thông báo</div>`;
    return;
  }

  const icons = { success: "Dprime", info: "ℹ️", warning: "⚠️" };

  dropdown.innerHTML = `
    <div class="notify-header">
      <span>Thông báo</span>
      <button class="notify-clear" onclick="clearAllNotifications()">Xóa tất cả</button>
    </div>
    <div class="notify-list">
      ${list.map(n => `
        <div class="notify-item ${n.read ? '' : 'unread'}" onclick="markRead(${n.id})">
          <span class="notify-icon">${icons[n.type] || 'ℹ️'}</span>
          <div class="notify-body">
            <p>${n.message}</p>
            <small>${n.time}</small>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

window.markRead = function(id) {
  const list = getNotifications().map(n => n.id === id ? {...n, read: true} : n);
  saveNotifications(list);
  renderNotifyBadge();
  renderNotifyDropdown();
};

window.clearAllNotifications = function() {
  saveNotifications([]);
  renderNotifyBadge();
  renderNotifyDropdown();
};

function initNotify() {
  const notifyEl = document.querySelector(".notify");
  if (!notifyEl) return;

  if (!document.getElementById("notifyDropdown")) {
    const div = document.createElement("div");
    div.id = "notifyDropdown";
    div.className = "notify-dropdown";
    notifyEl.appendChild(div);
  }

  // Xóa event cũ tránh duplicate khi initNotify gọi nhiều lần
  const newNotify = notifyEl.cloneNode(true);
  notifyEl.parentNode.replaceChild(newNotify, notifyEl);

  newNotify.addEventListener("click", (e) => {
    e.stopPropagation();
    const dropdown = document.getElementById("notifyDropdown");
    const isOpen = dropdown.classList.contains("open");

    document.querySelectorAll(".notify-dropdown.open")
      .forEach(d => d.classList.remove("open"));

    if (!isOpen) {
      renderNotifyDropdown();
      dropdown.classList.add("open");
    }
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".notify")) {
      document.querySelectorAll(".notify-dropdown.open")
        .forEach(d => d.classList.remove("open"));
    }
  });

  renderNotifyBadge();
  renderNotifyDropdown();
}

window.initNotify = initNotify;

document.addEventListener("DOMContentLoaded", initNotify);
