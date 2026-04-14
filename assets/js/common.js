(function initTheme() {
  document.body.setAttribute('data-theme', document.body.getAttribute('data-theme') || 'dark');
})();

(function initActiveNav() {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((a) => {
    if (a.getAttribute('href') === path) a.classList.add('active');
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

    btn.textContent = 'Copied';
    setTimeout(() => {
      btn.textContent = 'Copy';
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
    const glow = ctx.createRadialGradient(
      flake.x,
      flake.y,
      0,
      flake.x,
      flake.y,
      flake.r * 3.2
    );

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

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('reveal');
      });
    },
    { threshold: 0.12 }
  );

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
  const nav = document.querySelector('.nav-inner');
  const burger = document.querySelector('.burger');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (!nav || !burger || !mobileMenu) return;

  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('nav-open');
    burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('nav-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) {
      nav.classList.remove('nav-open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });
})();
