/* TOAST NOTIFICATION HELPER */
const Toast = {
    init() {
        if (!document.querySelector('.toast-container')) {
            const container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
    },

    show(msg, title = "D'PRIME Notification", type = 'info', duration = 3000) {
        this.init();
        const container = document.querySelector('.toast-container');
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'fa-circle-info';
        if (type === 'success') icon = 'fa-circle-check';
        if (type === 'error') icon = 'fa-triangle-exclamation';

        toast.innerHTML = `
            <i class="fa-solid ${icon} toast-icon"></i>
            <div class="toast-content">
                <span class="toast-title">${title}</span>
                <span class="toast-msg">${msg}</span>
            </div>
        `;

        container.appendChild(toast);

        // Animate in
        setTimeout(() => toast.classList.add('show'), 100);

        // Remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, duration);
    },

    success(msg, title) { this.show(msg, title || "Success", 'success'); },
    error(msg, title) { this.show(msg, title || "Error", 'error', 5000); },
    info(msg, title) { this.show(msg, title || "Info", 'info'); }
};

// Global polyfill for alert
window.dAlert = (msg, type = 'info') => {
    Toast.show(msg, "D'PRIME Notification", type);
};
