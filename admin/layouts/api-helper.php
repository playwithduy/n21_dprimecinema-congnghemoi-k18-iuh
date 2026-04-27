<?php
// Shared admin API helper - sử dụng JS fetch với token từ localStorage
// File này không cần PHP logic, chỉ cần constants để frontend dùng
?>
<script>
// ====================================================
// D PRIME ADMIN — API Helper
// ====================================================
const API = {
  BASE: window.location.protocol + "//" + window.location.hostname + ":3000/api",

  getAssetUrl(path) {
    if (!path || path === 'null' || path === 'undefined') return "https://ui-avatars.com/api/?background=random&name=User";
    if (path.startsWith('http')) return path;
    
    const gateway = window.location.protocol + "//" + window.location.hostname + ":3000";
    if (path.startsWith('/uploads/') || path.startsWith('uploads/')) {
        const normalizedPath = path.startsWith('/') ? path : '/' + path;
        return gateway + normalizedPath;
    }
    // Nếu chỉ là filename (thường là avatar trong auth-service), mặc định bỏ vào thư mục avatars
    return gateway + "/uploads/avatars/" + (path.startsWith('/') ? path.substring(1) : path);
  },

  getToken() {
    return localStorage.getItem("token") || "";
  },

  headers(extra = {}) {
    return {
      "Authorization": `Bearer ${this.getToken()}`,
      "Content-Type": "application/json",
      ...extra
    };
  },

  async get(path) {
    const res = await fetch(`${this.BASE}${path}`, {
      headers: this.headers()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    return res.json();
  },

  async post(path, body) {
    const res = await fetch(`${this.BASE}${path}`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    return data;
  },

  async put(path, body) {
    const res = await fetch(`${this.BASE}${path}`, {
      method: "PUT",
      headers: this.headers(),
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    return data;
  },

  async patch(path, body) {
    const res = await fetch(`${this.BASE}${path}`, {
      method: "PATCH",
      headers: this.headers(),
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    return data;
  },

  async delete(path) {
    const res = await fetch(`${this.BASE}${path}`, {
      method: "DELETE",
      headers: this.headers()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    return data;
  },
};

// Toast notification helper
function showToast(message, type = "success") {
  const existing = document.getElementById("admin-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "admin-toast";
  toast.innerHTML = `
    <div style="
      position: fixed; bottom: 30px; right: 30px; z-index: 9999;
      background: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
      color: white; padding: 14px 24px; border-radius: 10px;
      font-size: 14px; font-weight: 600;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      animation: slideInToast 0.3s ease;
    ">
      <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
      ${message}
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// Confirm modal helper (thay thế confirm() xấu xí)
function showConfirm(message, onConfirm) {
  const modal = document.createElement("div");
  modal.innerHTML = `
    <div style="
      position: fixed; inset: 0; background: rgba(0,0,0,0.7);
      z-index: 9999; display: flex; align-items: center; justify-content: center;
      backdrop-filter: blur(4px);
    ">
      <div style="
        background: #1a1d29; border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px; padding: 30px; max-width: 400px; width: 90%;
        text-align: center;
      ">
        <i class="fa-solid fa-triangle-exclamation" style="font-size:40px;color:#f1c40f;margin-bottom:15px;"></i>
        <p style="color:#f1f5f9;font-size:15px;margin-bottom:24px;">${message}</p>
        <div style="display:flex;gap:12px;justify-content:center;">
          <button id="_confirmYes" style="
            background:#e50914;color:#fff;border:none;border-radius:8px;
            padding:10px 24px;cursor:pointer;font-weight:700;font-size:14px;
          ">Xác nhận</button>
          <button id="_confirmNo" style="
            background:rgba(255,255,255,0.1);color:#fff;border:1px solid rgba(255,255,255,0.2);
            border-radius:8px;padding:10px 24px;cursor:pointer;font-weight:700;font-size:14px;
          ">Huỷ bỏ</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector("#_confirmYes").onclick = () => { modal.remove(); onConfirm(); };
  modal.querySelector("#_confirmNo").onclick = () => modal.remove();
}
</script>

<style>
@keyframes slideInToast {
  from { transform: translateX(60px); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}
</style>
