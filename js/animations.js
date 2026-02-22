/**
 * ═══════ SpendSense — GSAP Animations ═══════
 * All GSAP-powered animations across the site.
 * Uses ScrollTrigger for scroll-based reveals.
 */

gsap.registerPlugin(ScrollTrigger);

/* ─── Check reduced motion preference ─── */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initLandingAnimations() {
  if (prefersReducedMotion) return;

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.from('.hero-badge', { opacity: 0, y: 30, duration: 0.6 })
    .from('.hero-title', { opacity: 0, y: 40, duration: 0.8 }, '-=0.3')
    .from('.hero-subtitle', { opacity: 0, y: 30, duration: 0.6 }, '-=0.4')
    .from('.hero-ctas', { opacity: 0, y: 20, duration: 0.5 }, '-=0.3')
    .from('.hero-stats > div', { opacity: 0, y: 20, stagger: 0.1, duration: 0.5 }, '-=0.3')
    .from('.hero-visual', { opacity: 0, x: 60, duration: 1, ease: 'power2.out' }, '-=0.8');

  // Counter animations for stats
  document.querySelectorAll('.stat-number').forEach(el => {
    const target = parseInt(el.dataset.target);
    if (!target) return;
    gsap.to(el, {
      innerText: target,
      duration: 2,
      delay: 1,
      snap: { innerText: 1 },
      ease: 'power2.out',
      onUpdate: function () {
        const val = Math.floor(parseFloat(el.innerText));
        el.innerText = val >= 1000000
          ? (val / 1000000).toFixed(1) + 'M+'
          : val >= 1000
          ? (val / 1000).toFixed(val >= 10000 ? 0 : 1) + 'K+'
          : val.toLocaleString();
      },
    });
  });

  // Chart line draw
  const chartLine = document.getElementById('chart-line');
  if (chartLine) {
    const length = chartLine.getTotalLength();
    gsap.set(chartLine, { strokeDasharray: length, strokeDashoffset: length });
    gsap.to(chartLine, { strokeDashoffset: 0, duration: 2, delay: 0.8, ease: 'power2.inOut' });
  }

  // Feature cards stagger on scroll
  gsap.from('.feature-card', {
    scrollTrigger: {
      trigger: '#features',
      start: 'top 80%',
    },
    opacity: 0,
    y: 50,
    stagger: 0.12,
    duration: 0.7,
    ease: 'power2.out',
  });

  // Step cards
  gsap.from('.step-card', {
    scrollTrigger: {
      trigger: '#how-it-works',
      start: 'top 80%',
    },
    opacity: 0,
    y: 40,
    stagger: 0.15,
    duration: 0.7,
    ease: 'power2.out',
  });

  // CTA section
  gsap.from('.cta-card', {
    scrollTrigger: {
      trigger: '#cta',
      start: 'top 80%',
    },
    opacity: 0,
    scale: 0.95,
    duration: 0.8,
    ease: 'power2.out',
  });
}

/* ─── Dashboard Animations ─── */
function initDashboardAnimations() {
  if (prefersReducedMotion) return;

  // KPI cards stagger
  gsap.from('.kpi-card', {
    opacity: 0,
    y: 30,
    stagger: 0.1,
    duration: 0.6,
    ease: 'power2.out',
    delay: 0.2,
  });

  // Animate KPI numbers
  document.querySelectorAll('.kpi-value').forEach(el => {
    const target = parseFloat(el.dataset.target);
    if (isNaN(target)) return;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const decimals = parseInt(el.dataset.decimals) || 0;

    gsap.from(el, {
      innerText: 0,
      duration: 1.5,
      delay: 0.5,
      ease: 'power2.out',
      snap: { innerText: Math.pow(10, -decimals) },
      onUpdate: function () {
        const val = parseFloat(el.innerText);
        el.innerText = prefix + val.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }) + suffix;
      },
    });
  });

  // Chart containers
  gsap.from('.chart-container', {
    opacity: 0,
    y: 30,
    stagger: 0.15,
    duration: 0.7,
    ease: 'power2.out',
    delay: 0.4,
  });

  // Recent transactions
  gsap.from('.transaction-row', {
    opacity: 0,
    x: -20,
    stagger: 0.06,
    duration: 0.5,
    ease: 'power2.out',
    delay: 0.6,
  });
}

/* ─── Auth Page Animations ─── */
function initAuthAnimations() {
  if (prefersReducedMotion) return;

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.from('.auth-card', { opacity: 0, y: 40, duration: 0.8 })
    .from('.auth-card .auth-field', { opacity: 0, y: 20, stagger: 0.1, duration: 0.5 }, '-=0.3');
}

/* ─── Page Transition Helper ─── */
function pageEntrance(selector, options = {}) {
  if (prefersReducedMotion) return;
  const defaults = { opacity: 0, y: 30, stagger: 0.1, duration: 0.6, ease: 'power2.out', delay: 0.2 };
  gsap.from(selector, { ...defaults, ...options });
}

/* ─── Initialize based on page ─── */
document.addEventListener('DOMContentLoaded', () => {
  // Determine which page we're on
  const path = window.location.pathname;
  const page = path.split('/').pop() || 'index.html';

  if (page === 'index.html' || page === '' || page === 'Personal Expense Tracker') {
    initLandingAnimations();
  } else if (page === 'dashboard.html') {
    initDashboardAnimations();
  } else if (page === 'login.html' || page === 'register.html') {
    initAuthAnimations();
  } else {
    // Generic page entrance for other pages
    pageEntrance('.page-content > *');
  }
});
