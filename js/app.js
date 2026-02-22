/**
 * ═══════ SpendSense — Core Application Logic ═══════
 * Handles: navbar, mobile menu, toasts, sidebar, utils.
 * Auth & API are in appwrite.js (Appwrite SDK powered).
 */

/* ═══ Navbar scroll effect ═══ */
(function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    function onScroll() {
        if (window.scrollY > 20) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();

/* ═══ Mobile menu toggle ═══ */
(function initMobileMenu() {
    const toggle = document.getElementById('mobile-toggle');
    const menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
        menu.classList.toggle('hidden');
    });

    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => menu.classList.add('hidden'));
    });
})();

/* ═══ Sidebar toggle (dashboard pages) ═══ */
(function initSidebar() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (!sidebarToggle || !sidebar) return;

    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('active');
    });

    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }
})();

/* ═══ Toast Notification System ═══ */
const Toast = {
    _container: null,

    _getContainer() {
        if (!this._container) {
            this._container = document.createElement('div');
            this._container.id = 'toast-container';
            this._container.style.cssText = 'position:fixed;top:1.5rem;right:1.5rem;z-index:9999;display:flex;flex-direction:column;gap:0.75rem;';
            document.body.appendChild(this._container);
        }
        return this._container;
    },

    show(message, type = 'info', duration = 4000) {
        const container = this._getContainer();
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:0.75rem">
        <span>${message}</span>
        <button onclick="this.closest('.toast').remove()" style="opacity:0.6;cursor:pointer;background:none;border:none;color:inherit;font-size:1.2rem">&times;</button>
      </div>`;
        container.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    success(msg) { this.show(msg, 'success'); },
    error(msg) { this.show(msg, 'error'); },
    info(msg) { this.show(msg, 'info'); },
};

/* ═══ Utility Functions ═══ */
const Utils = {
    formatCurrency(cents, currency = 'INR') {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(cents / 100);
    },

    formatDate(dateStr, options) {
        const defaults = { month: 'short', day: 'numeric', year: 'numeric' };
        return new Date(dateStr).toLocaleDateString('en-US', options || defaults);
    },

    formatRelative(dateStr) {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return this.formatDate(dateStr);
    },

    getCurrentMonth() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    },

    debounce(fn, delay = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    },

    getCategoryIcon(category) {
        const icons = {
            food: 'utensils', transport: 'car', housing: 'home',
            health: 'heart-pulse', entertainment: 'film',
            shopping: 'shopping-bag', utilities: 'zap',
            education: 'graduation-cap', other: 'more-horizontal',
        };
        return icons[category] || 'circle';
    },

    getCategoryColor(category) {
        const colors = {
            food: '#f59e0b', transport: '#3b82f6', housing: '#8b5cf6',
            health: '#10b981', entertainment: '#ec4899', shopping: '#ef4444',
            utilities: '#22d3ee', education: '#6366f1', other: '#9ca3af',
        };
        return colors[category] || '#9ca3af';
    },

    getCategoryLabel(category) {
        const labels = {
            food: 'Food & Dining', transport: 'Transport', housing: 'Housing',
            health: 'Health', entertainment: 'Entertainment', shopping: 'Shopping',
            utilities: 'Utilities', education: 'Education', other: 'Other',
        };
        return labels[category] || category;
    },
};

/* ═══ Initialize Lucide Icons ═══ */
document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});
