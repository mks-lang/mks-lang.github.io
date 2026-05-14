;(function initSiteLanguage() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  var LANG_KEY = 'mks.site.lang';
  var defaultLang = document.documentElement.getAttribute('lang') || 'en';
  var page = document.documentElement.getAttribute('data-page') || '';
  var pageEntryBaseline = {};

  function readLang() {
    try {
      return localStorage.getItem(LANG_KEY) || defaultLang;
    } catch (e) {
      return defaultLang;
    }
  }

  function writeLang(lang) {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {}
  }

  function setNodeValue(node, entry) {
    if (!node || !entry) return;
    if (entry.attr) {
      node.setAttribute(entry.attr, entry.value);
      return;
    }
    if (entry.html !== null && entry.html !== undefined) {
      node.innerHTML = entry.html;
      return;
    }
    node.textContent = (entry.text !== null && entry.text !== undefined) ? entry.text : '';
  }

  function captureBaseline(entries) {
    (entries || []).forEach(function(entry) {
      var nodes = document.querySelectorAll(entry.selector);
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var key = entry.selector + '::' + i + '::' + (entry.attr || 'text');
        if (pageEntryBaseline.hasOwnProperty(key)) continue;
        pageEntryBaseline[key] = entry.attr ? node.getAttribute(entry.attr) : node.innerHTML;
      }
    });
  }

  function restoreBaseline(entries) {
    (entries || []).forEach(function(entry) {
      var nodes = document.querySelectorAll(entry.selector);
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var key = entry.selector + '::' + i + '::' + (entry.attr || 'text');
        if (!pageEntryBaseline.hasOwnProperty(key)) continue;
        var baseline = pageEntryBaseline[key];
        if (entry.attr) {
          if (baseline === null || baseline === undefined) node.removeAttribute(entry.attr);
          else node.setAttribute(entry.attr, baseline);
          return;
        }
        node.innerHTML = (baseline !== null && baseline !== undefined) ? baseline : '';
      }
    });
  }

  function applySelectorEntries(entries) {
    (entries || []).forEach(function(entry) {
      var nodes = document.querySelectorAll(entry.selector);
      for (var i = 0; i < nodes.length; i++) {
        setNodeValue(nodes[i], entry);
      }
    });
  }

  function applyUi(messages, lang) {
    document.documentElement.setAttribute('lang', lang);
    var i18nNodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < i18nNodes.length; i++) {
      var node = i18nNodes[i];
      var key = node.dataset.i18n;
      var value = messages && messages[key];
      if (value) node.textContent = value;
    }
    var selects = document.querySelectorAll('[data-language-select]');
    for (var j = 0; j < selects.length; j++) {
      selects[j].value = lang;
    }
    var copyBtns = document.querySelectorAll('.copy-btn');
    for (var k = 0; k < copyBtns.length; k++) {
      var button = copyBtns[k];
      button.textContent = (messages && messages['copy.default']) || 'Copy';
      button.setAttribute('aria-live', 'polite');
    }
  }

  var dictionary = { ui: {}, pages: {} };

  function loadAndApply() {
    fetch('assets/data/site.json?v=20260426-i18n-fix-1', { cache: 'no-store' })
      .then(function(response) {
        if (response.ok) return response.json();
        return dictionary;
      })
      .then(function(data) {
        dictionary = data;
        var pageDict = dictionary.pages || {};
        var currentPage = pageDict[page] || {};
        captureBaseline((currentPage.en && currentPage.en.entries) || []);
        captureBaseline((currentPage.ru && currentPage.ru.entries) || []);
        applyLanguage(readLang());
      })
      .catch(function(error) {
        console.error('Failed to load site copy:', error);
        applyLanguage(readLang());
      });
  }

  function applyLanguage(lang) {
    var nextLang = (dictionary.ui && dictionary.ui[lang]) ? lang : 'en';
    var uiMessages = (dictionary.ui && dictionary.ui[nextLang]) || {};
    var pageDict = dictionary.pages || {};
    var currentPage = pageDict[page] || {};
    var englishPageData = currentPage.en || {};
    var pageData = currentPage[nextLang] || {};

    applyUi(uiMessages, nextLang);

    if (englishPageData.title) document.title = englishPageData.title;
    if (pageData.title) document.title = pageData.title;

    if (Array.isArray(englishPageData.entries)) restoreBaseline(englishPageData.entries);
    if (Array.isArray(pageData.entries)) applySelectorEntries(pageData.entries);

    writeLang(nextLang);
    if (typeof CustomEvent === 'function') {
      document.dispatchEvent(new CustomEvent('mks:language-change', { detail: { lang: nextLang } }));
    }
  }

  document.addEventListener('change', function(event) {
    var select = event.target.closest('[data-language-select]');
    if (!select) return;
    applyLanguage(select.value);
  });

  window.MKSSiteI18n = {
    applyLanguage: applyLanguage,
    getLanguage: function() { return document.documentElement.getAttribute('lang') || 'en'; },
    get: function(key, fallback) {
      var lang = document.documentElement.getAttribute('lang') || 'en';
      var fb = fallback === undefined ? '' : fallback;
      return (dictionary.ui && dictionary.ui[lang] && dictionary.ui[lang][key]) || (dictionary.ui && dictionary.ui.en && dictionary.ui.en[key]) || fb;
    },
  };

  loadAndApply();
})();

;(function initActiveNav() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  var path = location.pathname.split('/').pop() || 'index.html';
  var links = document.querySelectorAll('.nav-links a, .mobile-menu-nav a');
  for (var i = 0; i < links.length; i++) {
    var a = links[i];
    if (a.getAttribute('href') === path) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  }
})();

;(function bindCopyButtons() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  document.addEventListener('click', function(event) {
    var btn = event.target.closest('.copy-btn');
    if (!btn) return;

    var parent = btn.parentElement;
    var code = parent ? parent.querySelector('code, pre') : null;
    if (!code) return;
    var text = code.innerText.trim();

    var copyToClipboard = function() {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        return Promise.resolve();
      }
    };

    copyToClipboard().then(function() {
      var copiedLabel = window.MKSSiteI18n ? window.MKSSiteI18n.get('copy.copied', 'Copied') : 'Copied';
      var copyLabel = window.MKSSiteI18n ? window.MKSSiteI18n.get('copy.default', 'Copy') : 'Copy';
      btn.textContent = copiedLabel;
      setTimeout(function() {
        btn.textContent = copyLabel;
      }, 1200);
    });
  });
})();

;(function initParticles() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  var canvas = document.querySelector('.particles');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var width = 0;
  var height = 0;
  var flakes = [];

  var isMobile = window.innerWidth <= 600;
  var flakeCount = isMobile ? 55 : 110;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createFlakes() {
    flakes = [];
    for (var i = 0; i < flakeCount; i++) {
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2.2 + 0.4,
        speedY: Math.random() * 0.7 + 0.2,
        speedX: (Math.random() - 0.5) * 0.25,
        drift: Math.random() * 0.6 + 0.1,
        alpha: Math.random() * 0.45 + 0.18,
      });
    }
  }

  function resetFlake(flake, respawnTop) {
    flake.x = Math.random() * width;
    flake.y = respawnTop ? -10 : Math.random() * height;
    flake.r = Math.random() * 2.2 + 0.4;
    flake.speedY = Math.random() * 0.7 + 0.2;
    flake.speedX = (Math.random() - 0.5) * 0.25;
    flake.drift = Math.random() * 0.6 + 0.1;
    flake.alpha = Math.random() * 0.45 + 0.18;
  }

  function drawFlake(flake) {
    var glow = ctx.createRadialGradient(flake.x, flake.y, 0, flake.x, flake.y, flake.r * 3.2);
    glow.addColorStop(0, 'rgba(122,162,255,' + flake.alpha + ')');
    glow.addColorStop(0.45, 'rgba(109,242,197,' + (flake.alpha * 0.45) + ')');
    glow.addColorStop(1, 'rgba(122,162,255,0)');
    ctx.beginPath();
    ctx.fillStyle = glow;
    ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
    ctx.fill();
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (var i = 0; i < flakes.length; i++) {
      var flake = flakes[i];
      flake.y += flake.speedY;
      flake.x += flake.speedX + Math.sin(flake.y * 0.01) * flake.drift * 0.15;
      if (flake.y > height + 12) resetFlake(flake, true);
      if (flake.x < -20) flake.x = width + 10;
      if (flake.x > width + 20) flake.x = -10;
      drawFlake(flake);
    }
    requestAnimationFrame(animate);
  }

  resize();
  createFlakes();
  animate();
  window.addEventListener('resize', function() {
    resize();
    createFlakes();
  });
})();

;(function revealOnScroll() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (!('IntersectionObserver' in window)) return;
  var observer = new IntersectionObserver(function(entries) {
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      if (entry.isIntersecting) entry.target.classList.add('reveal');
    }
  }, { threshold: 0.12 });

  function observeReveal(root) {
    var targetRoot = root || document;
    var elements = targetRoot.querySelectorAll('.panel, .timeline-item, .timeline-card, .code-block');
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      if (el.dataset.revealObserved) continue;
      el.dataset.revealObserved = 'true';
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      observer.observe(el);
    }
  }

  observeReveal();
  window.addEventListener('docs:ready', function() {
    var docsBody = document.querySelector('[data-docs-body]');
    if (docsBody) observeReveal(docsBody);
  });

  var style = document.createElement('style');
  style.textContent = '.reveal{opacity:1!important;transform:none!important;transition:opacity 260ms ease, transform 260ms ease;}';
  document.head.appendChild(style);
})();

;(function initMobileMenu() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  var navbar = document.querySelector('.navbar');
  var nav = document.querySelector('.nav-inner');
  var burger = document.querySelector('.burger');
  var mobileMenu = document.querySelector('.mobile-menu');
  if (!nav || !burger || !mobileMenu) return;

  var backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';
  document.body.appendChild(backdrop);

  function toggleMenu(open) {
    nav.classList.toggle('nav-open', open);
    if (navbar) navbar.classList.toggle('nav-menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');

    backdrop.style.opacity = open ? '1' : '';
    backdrop.style.visibility = open ? 'visible' : '';
    backdrop.style.pointerEvents = open ? 'auto' : '';
    document.body.style.overflow = open ? 'hidden' : '';
  }

  function closeMenu() {
    toggleMenu(false);
  }

  burger.addEventListener('click', function() {
    var isOpen = !nav.classList.contains('nav-open');
    toggleMenu(isOpen);
  });

  var mobileLinks = mobileMenu.querySelectorAll('.mobile-menu-nav a');
  for (var i = 0; i < mobileLinks.length; i++) {
    mobileLinks[i].addEventListener('click', closeMenu);
  }

  document.addEventListener('click', function(e) {
    if (!nav.contains(e.target) && !backdrop.contains(e.target)) closeMenu();
  });

  window.addEventListener('resize', closeMenu);
  backdrop.addEventListener('click', closeMenu);

  window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeMenu();
  });
})();

;(function initDockNav() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  var navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;

  var SCALE_MAX = 1.38;
  var LIFT_MAX  = 10;
  var RANGE     = 110;

  var rafId = null;
  var lastX = null;

  function smoothstep(t) {
    var c = Math.max(0, Math.min(1, t));
    return c * c * (3 - 2 * c);
  }

  function applyDock(mouseX) {
    var links = navLinks.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var rect = link.getBoundingClientRect();
      var center = rect.left + rect.width / 2;
      var t = smoothstep(1 - Math.abs(mouseX - center) / RANGE);
      var scale = 1 + (SCALE_MAX - 1) * t;
      var lift  = LIFT_MAX * t;
      link.style.transform = 'translateY(' + (-lift) + 'px) scale(' + scale + ')';
    }
  }

  function resetDock() {
    var links = navLinks.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
      links[i].style.transform = '';
    }
  }

  navLinks.addEventListener('mousemove', function(e) {
    lastX = e.clientX;
    if (rafId) return;
    rafId = requestAnimationFrame(function() {
      rafId = null;
      if (lastX !== null) applyDock(lastX);
    });
  });

  navLinks.addEventListener('mouseleave', function() {
    lastX = null;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    resetDock();
  });
})();

;(function initGlobalShortcuts() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  window.addEventListener('keydown', function(e) {
    try {
      var active = document.activeElement;
      if (!active) return;

      var tag = (active.tagName || '').toUpperCase();
      var isInput = tag === 'INPUT' || tag === 'TEXTAREA' || (active.isContentEditable === true);

      if (e.key === '/' && !isInput) {
        var searchEl = document.querySelector('[data-example-search], [data-change-search]');
        if (searchEl) {
          e.preventDefault();
          searchEl.focus();
          if (searchEl.select) searchEl.select();
        }
      }

      if (e.key === 'Escape' && isInput) {
        active.blur();
      }
    } catch (err) {}
  });
})();
