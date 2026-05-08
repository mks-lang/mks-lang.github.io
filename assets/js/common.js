(async function initSiteLanguage() {
  const LANG_KEY = 'mks.site.lang';
  const defaultLang = document.documentElement.getAttribute('lang') || 'en';
  const page = document.documentElement.getAttribute('data-page') || '';
  const pageEntryBaseline = new Map();

  function readLang() {
    try {
      return localStorage.getItem(LANG_KEY) || defaultLang;
    } catch {
      return defaultLang;
    }
  }

  function writeLang(lang) {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {}
  }

  function setNodeValue(node, entry) {
    if (!node || !entry) return;
    if (entry.attr) {
      node.setAttribute(entry.attr, entry.value);
      return;
    }
    if (entry.html != null) {
      node.innerHTML = entry.html;
      return;
    }
    node.textContent = entry.text ?? '';
  }

  function captureBaseline(entries) {
    (entries || []).forEach((entry) => {
      document.querySelectorAll(entry.selector).forEach((node, index) => {
        const key = `${entry.selector}::${index}::${entry.attr || 'text'}`;
        if (pageEntryBaseline.has(key)) return;
        pageEntryBaseline.set(
          key,
          entry.attr ? node.getAttribute(entry.attr) : node.innerHTML
        );
      });
    });
  }

  function restoreBaseline(entries) {
    (entries || []).forEach((entry) => {
      document.querySelectorAll(entry.selector).forEach((node, index) => {
        const key = `${entry.selector}::${index}::${entry.attr || 'text'}`;
        if (!pageEntryBaseline.has(key)) return;
        const baseline = pageEntryBaseline.get(key);
        if (entry.attr) {
          if (baseline == null) node.removeAttribute(entry.attr);
          else node.setAttribute(entry.attr, baseline);
          return;
        }
        node.innerHTML = baseline ?? '';
      });
    });
  }

  function applySelectorEntries(entries) {
    (entries || []).forEach((entry) => {
      document.querySelectorAll(entry.selector).forEach((node) => setNodeValue(node, entry));
    });
  }

  function applyUi(messages, lang) {
    document.documentElement.setAttribute('lang', lang);
    document.querySelectorAll('[data-i18n]').forEach((node) => {
      const key = node.dataset.i18n;
      const value = messages?.[key];
      if (value) node.textContent = value;
    });
    document.querySelectorAll('[data-language-select]').forEach((select) => {
      select.value = lang;
    });
    document.querySelectorAll('.copy-btn').forEach((button) => {
      button.textContent = messages?.['copy.default'] || 'Copy';
      button.setAttribute('aria-live', 'polite');
    });
  }

  let dictionary = { ui: {}, pages: {} };

  try {
    const response = await fetch('assets/data/site.json?v=20260426-i18n-fix-1', { cache: 'no-store' });
    if (response.ok) dictionary = await response.json();
  } catch (error) {
    console.error('Failed to load site copy:', error);
  }

  captureBaseline(dictionary.pages?.[page]?.en?.entries || []);
  captureBaseline(dictionary.pages?.[page]?.ru?.entries || []);

  function applyLanguage(lang) {
    const nextLang = dictionary.ui?.[lang] ? lang : 'en';
    const uiMessages = dictionary.ui?.[nextLang] || {};
    const englishPageData = dictionary.pages?.[page]?.en || {};
    const pageData = dictionary.pages?.[page]?.[nextLang] || {};

    applyUi(uiMessages, nextLang);

    if (englishPageData.title) document.title = englishPageData.title;
    if (pageData.title) document.title = pageData.title;

    if (Array.isArray(englishPageData.entries)) restoreBaseline(englishPageData.entries);
    if (Array.isArray(pageData.entries)) applySelectorEntries(pageData.entries);

    writeLang(nextLang);
    document.dispatchEvent(new CustomEvent('mks:language-change', { detail: { lang: nextLang } }));
  }

  document.addEventListener('change', (event) => {
    const select = event.target.closest('[data-language-select]');
    if (!select) return;
    applyLanguage(select.value);
  });

  window.MKSSiteI18n = {
    applyLanguage,
    getLanguage: () => document.documentElement.getAttribute('lang') || 'en',
    get: (key, fallback = '') => {
      const lang = document.documentElement.getAttribute('lang') || 'en';
      return dictionary.ui?.[lang]?.[key] || dictionary.ui?.en?.[key] || fallback;
    },
  };

  applyLanguage(readLang());
})();

(function initActiveNav() {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu-nav a').forEach((a) => {
    if (a.getAttribute('href') === path) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  });
})();

(function bindCopyButtons() {
  document.addEventListener('click', async (event) => {
    const btn = event.target.closest('.copy-btn');
    if (!btn) return;

    const code = btn.parentElement?.querySelector('code, pre');
    if (!code) return;
    const text = code.innerText.trim();

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }

    const copiedLabel = window.MKSSiteI18n?.get('copy.copied', 'Copied');
    const copyLabel = window.MKSSiteI18n?.get('copy.default', 'Copy');
    btn.textContent = copiedLabel;
    setTimeout(() => {
      btn.textContent = copyLabel;
    }, 1200);
  });
})();

(function initParticles() {
  const canvas = document.querySelector('.particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let flakes = [];

  const isMobile = window.innerWidth <= 600;
  const flakeCount = isMobile ? 55 : 110;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createFlakes() {
    flakes = Array.from({ length: flakeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2.2 + 0.4,
      speedY: Math.random() * 0.7 + 0.2,
      speedX: (Math.random() - 0.5) * 0.25,
      drift: Math.random() * 0.6 + 0.1,
      alpha: Math.random() * 0.45 + 0.18,
    }));
  }

  function resetFlake(flake, respawnTop = true) {
    flake.x = Math.random() * width;
    flake.y = respawnTop ? -10 : Math.random() * height;
    flake.r = Math.random() * 2.2 + 0.4;
    flake.speedY = Math.random() * 0.7 + 0.2;
    flake.speedX = (Math.random() - 0.5) * 0.25;
    flake.drift = Math.random() * 0.6 + 0.1;
    flake.alpha = Math.random() * 0.45 + 0.18;
  }

  function drawFlake(flake) {
    const glow = ctx.createRadialGradient(flake.x, flake.y, 0, flake.x, flake.y, flake.r * 3.2);
    glow.addColorStop(0, `rgba(122,162,255,${flake.alpha})`);
    glow.addColorStop(0.45, `rgba(109,242,197,${flake.alpha * 0.45})`);
    glow.addColorStop(1, 'rgba(122,162,255,0)');
    ctx.beginPath();
    ctx.fillStyle = glow;
    ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
    ctx.fill();
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    flakes.forEach((flake) => {
      flake.y += flake.speedY;
      flake.x += flake.speedX + Math.sin(flake.y * 0.01) * flake.drift * 0.15;
      if (flake.y > height + 12) resetFlake(flake, true);
      if (flake.x < -20) flake.x = width + 10;
      if (flake.x > width + 20) flake.x = -10;
      drawFlake(flake);
    });
    requestAnimationFrame(animate);
  }

  resize();
  createFlakes();
  animate();
  window.addEventListener('resize', () => {
    resize();
    createFlakes();
  });
})();

(function revealOnScroll() {
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('reveal');
    });
  }, { threshold: 0.12 });

  function observeReveal(root = document) {
    root.querySelectorAll('.panel, .timeline-item, .timeline-card, .code-block').forEach((el) => {
      if (el.dataset.revealObserved) return;
      el.dataset.revealObserved = 'true';
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      observer.observe(el);
    });
  }

  observeReveal();
  window.addEventListener('docs:ready', () => observeReveal(document.querySelector('[data-docs-body]')));

  const style = document.createElement('style');
  style.textContent = '.reveal{opacity:1!important;transform:none!important;transition:opacity 260ms ease, transform 260ms ease;}';
  document.head.appendChild(style);
})();

(function initMobileMenu() {
  const navbar = document.querySelector('.navbar');
  const nav = document.querySelector('.nav-inner');
  const burger = document.querySelector('.burger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (!nav || !burger || !mobileMenu) return;

  const backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';
  document.body.appendChild(backdrop);

  function setBackdrop(open) {
    backdrop.style.opacity = open ? '1' : '';
    backdrop.style.visibility = open ? 'visible' : '';
    backdrop.style.pointerEvents = open ? 'auto' : '';
  }

  function closeMenu() {
    nav.classList.remove('nav-open');
    navbar?.classList.remove('nav-menu-open');
    burger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    setBackdrop(false);
  }

  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('nav-open');
    navbar?.classList.toggle('nav-menu-open', isOpen);
    burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    mobileMenu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    setBackdrop(isOpen);
  });

  mobileMenu.querySelectorAll('.mobile-menu-nav a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !backdrop.contains(e.target)) closeMenu();
  });

  window.addEventListener('resize', closeMenu);

  backdrop.addEventListener('click', closeMenu);
})();

(function initDockNav() {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;

  const SCALE_MAX = 1.38;
  const LIFT_MAX  = 10;
  const RANGE     = 110;

  let rafId = null;
  let lastX = null;

  function smoothstep(t) {
    const c = Math.max(0, Math.min(1, t));
    return c * c * (3 - 2 * c);
  }

  function applyDock(mouseX) {
    navLinks.querySelectorAll('a').forEach(link => {
      const rect = link.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const t = smoothstep(1 - Math.abs(mouseX - center) / RANGE);
      const scale = 1 + (SCALE_MAX - 1) * t;
      const lift  = LIFT_MAX * t;
      link.style.transform = `translateY(${-lift}px) scale(${scale})`;
    });
  }

  function resetDock() {
    navLinks.querySelectorAll('a').forEach(link => {
      link.style.transform = '';
    });
  }

  navLinks.addEventListener('mousemove', e => {
    lastX = e.clientX;
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      if (lastX !== null) applyDock(lastX);
    });
  });

  navLinks.addEventListener('mouseleave', () => {
    lastX = null;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    resetDock();
  });
})();

(function initGlobalShortcuts() {
  window.addEventListener('keydown', (e) => {
    const active = document.activeElement;
    if (!active) return;

    const isInput = ['INPUT', 'TEXTAREA'].includes(active.tagName) || (active.isContentEditable === true);

    if (e.key === '/' && !isInput) {
      const search = document.querySelector('[data-example-search], [data-change-search]');
      if (search) {
        e.preventDefault();
        search.focus();
      }
    }
  });
})();
