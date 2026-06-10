const docsEnhancementState = { cleanup: null };
function initDocsEnhancements() {
  if (typeof docsEnhancementState.cleanup === 'function') docsEnhancementState.cleanup();
  document.querySelectorAll('.panel').forEach((p, i) => p.style.animationDelay = `${(i % 5) * 0.08}s`);
  const cardCleanups = [];
  document.querySelectorAll('[data-docs-card]').forEach((panel) => {
    const move = (e) => {
      const r = panel.getBoundingClientRect();
      panel.style.setProperty('--mx', `${Math.max(0, Math.min(r.width, e.clientX - r.left))}px`);
      panel.style.setProperty('--my', `${Math.max(0, Math.min(r.height, e.clientY - r.top))}px`);
    };
    const leave = () => { panel.style.setProperty('--mx', '50%'); panel.style.setProperty('--my', '18%'); };
    panel.addEventListener('pointermove', move);
    panel.addEventListener('pointerleave', leave);
    cardCleanups.push(() => { panel.removeEventListener('pointermove', move); panel.removeEventListener('pointerleave', leave); });
  });
  const cards = Array.from(document.querySelectorAll('[data-docs-card]'));
  let observer = cards.length && 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('docs-card-live', e.isIntersecting)), { rootMargin: '-32% 0px -50% 0px' }) : null;
  if (observer) cards.forEach((c) => observer.observe(c));
  docsEnhancementState.cleanup = () => { cardCleanups.forEach((f) => f()); if (observer) observer.disconnect(); };
}
(function bootDocsEnhancements() { window.addEventListener('docs:ready', initDocsEnhancements); })();

const docsSidebarState = { cleanup: null };
function initSidebarLinks() {
  if (typeof docsSidebarState.cleanup === 'function') docsSidebarState.cleanup();
  const sidebar = document.querySelector('.sidebar');
  const links = Array.from(document.querySelectorAll('.sidebar a'));
  if (!sidebar || !links.length) return;
  const sections = links.map((l) => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  let targetY = sidebar.scrollTop, frame = null, lockUntil = 0;
  const smooth = (y) => {
    targetY = y;
    if (frame) return;
    const step = () => {
      const cur = sidebar.scrollTop, d = targetY - cur;
      if (Math.abs(d) < 0.8) { sidebar.scrollTop = targetY; frame = null; return; }
      sidebar.scrollTop = cur + d * 0.16;
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
  };
  const sync = () => {
    const line = window.innerHeight * 0.44;
    const bottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
    let curr = bottom ? sections[sections.length - 1] : sections[0], dist = Infinity;
    if (!bottom) sections.forEach((s) => { const r = s.getBoundingClientRect(); if (r.bottom >= line && Math.abs(r.top - line) < dist) { dist = Math.abs(r.top - line); curr = s; } });
    if (window.matchMedia('(min-width: 961px)').matches) sidebar.style.setProperty('--sidebar-shift', `${Math.min(10, window.scrollY * 0.02)}px`);
    if (curr) {
      const hash = `#${curr.id}`;
      let active = null;
      links.forEach((l) => { const isA = l.getAttribute('href') === hash; l.classList.toggle('active', isA); if (isA) active = l; });
      if (active) {
        const sB = sidebar.getBoundingClientRect(), lB = active.getBoundingClientRect();
        sidebar.style.setProperty('--indicator-y', `${lB.top - sB.top + sidebar.scrollTop}px`);
        sidebar.style.setProperty('--indicator-height', `${lB.height}px`);
        sidebar.style.setProperty('--indicator-opacity', '1');
        if (Date.now() > lockUntil) {
          if (window.matchMedia('(max-width: 960px)').matches) sidebar.scrollTo({ left: Math.max(0, active.offsetLeft - (sidebar.clientWidth - active.offsetWidth) / 2), behavior: 'smooth' });
          else {
            const vT = sidebar.scrollTop, vB = vT + sidebar.clientHeight;
            if (active.offsetTop < vT + 12) smooth(Math.max(0, active.offsetTop - 12));
            else if (active.offsetTop + active.offsetHeight > vB - 12) smooth(active.offsetTop + active.offsetHeight - sidebar.clientHeight + 12);
          }
        }
      }
    }
  };
  let ticking = false;
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { sync(); ticking = false; }); } };
  const lock = (ms) => { lockUntil = Date.now() + ms; if (frame) { cancelAnimationFrame(frame); frame = null; } };
  sidebar.addEventListener('pointerdown', () => lock(1800));
  sidebar.addEventListener('wheel', () => lock(900), { passive: true });
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  window.addEventListener('hashchange', () => { sync(); const a = links.find((l) => l.classList.contains('active')); if (a) smooth(a.offsetTop - 12); });
  const linkCleanups = links.map((l) => {
    const click = (e) => { const s = document.querySelector(l.getAttribute('href')); if (s) { e.preventDefault(); s.scrollIntoView({ block: 'center', behavior: 'smooth' }); history.pushState(null, '', l.getAttribute('href')); sync(); } };
    l.addEventListener('click', click);
    return () => l.removeEventListener('click', click);
  });
  sync();
  docsSidebarState.cleanup = () => { if (frame) cancelAnimationFrame(frame); window.removeEventListener('scroll', req); window.removeEventListener('resize', req); linkCleanups.forEach((f) => f()); };
}
(function bootSidebarLinks() { window.addEventListener('docs:ready', initSidebarLinks); })();

;(function initCopyLinks() {
  if (typeof window === 'undefined') return;
  document.addEventListener('click', async (e) => {
    const b = e.target.closest('.docs-copy-link');
    if (!b || b.classList.contains('copied')) return;
    try {
      await navigator.clipboard.writeText(`${location.origin}${location.pathname}#${b.dataset.id}`);
      const i = b.querySelector('i'), oC = i.className, oL = b.getAttribute('aria-label');
      b.classList.add('copied');
      b.setAttribute('aria-label', window.MKSSiteI18n?.get('copy.link_copied', 'Copied!'));
      i.className = 'hgi-stroke hgi-tick-01';
      setTimeout(() => { b.classList.remove('copied'); b.setAttribute('aria-label', oL); i.className = oC; }, 1500);
    } catch (err) {}
  });
})();
