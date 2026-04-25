const docsEnhancementState = {
  cleanup: null,
};

function initDocsEnhancements() {
  if (typeof docsEnhancementState.cleanup === 'function') {
    docsEnhancementState.cleanup();
    docsEnhancementState.cleanup = null;
  }

  document.querySelectorAll('.panel').forEach((panel, idx) => {
    panel.style.animationDelay = `${(idx % 5) * 0.08}s`;
  });

  const cardCleanups = [];

  document.querySelectorAll('[data-docs-card]').forEach((panel) => {
    const onPointerMove = (event) => {
      const rect = panel.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, event.clientY - rect.top));

      panel.style.setProperty('--mx', `${x}px`);
      panel.style.setProperty('--my', `${y}px`);
    };

    const onPointerLeave = () => {
      panel.style.setProperty('--mx', '50%');
      panel.style.setProperty('--my', '18%');
    };

    panel.addEventListener('pointermove', onPointerMove);
    panel.addEventListener('pointerleave', onPointerLeave);

    cardCleanups.push(() => {
      panel.removeEventListener('pointermove', onPointerMove);
      panel.removeEventListener('pointerleave', onPointerLeave);
    });
  });

  const cards = Array.from(document.querySelectorAll('[data-docs-card]'));
  let observer = null;

  if (cards.length && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('docs-card-live', entry.isIntersecting);
      });
    }, {
      rootMargin: '-32% 0px -50% 0px',
      threshold: 0,
    });

    cards.forEach((card) => observer.observe(card));
  }

  docsEnhancementState.cleanup = () => {
    cardCleanups.forEach((cleanup) => cleanup());
    if (observer) observer.disconnect();
  };
}

(function bootDocsEnhancements() {
  window.addEventListener('docs:ready', initDocsEnhancements);
})();

const docsSidebarState = {
  cleanup: null,
};

function initSidebarLinks() {
  if (typeof docsSidebarState.cleanup === 'function') {
    docsSidebarState.cleanup();
    docsSidebarState.cleanup = null;
  }

  const sidebar = document.querySelector('.sidebar');
  const links = Array.from(document.querySelectorAll('.sidebar a'));
  if (!sidebar || !links.length) return;

  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  let sidebarScrollTarget = sidebar.scrollTop;
  let sidebarScrollFrame = null;
  let userSidebarLockUntil = 0;

  function lockSidebarAutoScroll(ms = 1400) {
    userSidebarLockUntil = Date.now() + ms;

    if (sidebarScrollFrame) {
      cancelAnimationFrame(sidebarScrollFrame);
      sidebarScrollFrame = null;
    }
  }

  function smoothSidebarScrollTo(target) {
    sidebarScrollTarget = target;

    if (sidebarScrollFrame) return;

    const step = () => {
      const current = sidebar.scrollTop;
      const delta = sidebarScrollTarget - current;

      if (Math.abs(delta) < 0.8) {
        sidebar.scrollTop = sidebarScrollTarget;
        sidebarScrollFrame = null;
        return;
      }

      sidebar.scrollTop = current + delta * 0.16;
      sidebarScrollFrame = requestAnimationFrame(step);
    };

    sidebarScrollFrame = requestAnimationFrame(step);
  }

  function moveSidebar() {
    if (window.matchMedia('(max-width: 960px)').matches) {
      sidebar.style.setProperty('--sidebar-shift', '0px');
      return;
    }

    const shift = Math.min(10, window.scrollY * 0.02);
    sidebar.style.setProperty('--sidebar-shift', `${shift}px`);
  }

  function moveIndicator(activeLink) {
    const sidebarBox = sidebar.getBoundingClientRect();
    const linkBox = activeLink.getBoundingClientRect();
    const offset = linkBox.top - sidebarBox.top + sidebar.scrollTop;

    sidebar.style.setProperty('--indicator-y', `${offset}px`);
    sidebar.style.setProperty('--indicator-height', `${linkBox.height}px`);
    sidebar.style.setProperty('--indicator-opacity', '1');
  }

  function keepLinkVisible(activeLink, smooth = false) {
    if (window.matchMedia('(max-width: 960px)').matches) {
      const targetLeft = activeLink.offsetLeft - (sidebar.clientWidth - activeLink.offsetWidth) / 2;
      sidebar.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: smooth ? 'smooth' : 'auto',
      });
      return;
    }

    const linkTop = activeLink.offsetTop;
    const linkBottom = linkTop + activeLink.offsetHeight;
    const visibleTop = sidebar.scrollTop;
    const visibleBottom = visibleTop + sidebar.clientHeight;
    const padding = 12;

    if (linkTop < visibleTop + padding) {
      const nextTop = Math.max(0, linkTop - padding);
      if (smooth) smoothSidebarScrollTo(nextTop);
      else sidebar.scrollTop = nextTop;
    } else if (linkBottom > visibleBottom - padding) {
      const nextTop = linkBottom - sidebar.clientHeight + padding;
      if (smooth) smoothSidebarScrollTo(nextTop);
      else sidebar.scrollTop = nextTop;
    }
  }

  function setActive(id) {
    const hash = `#${id}`;
    let activeLink = null;

    links.forEach((link) => {
      const isActive = link.getAttribute('href') === hash;
      link.classList.toggle('active', isActive);
      if (isActive) activeLink = link;
    });

    if (activeLink) {
      moveIndicator(activeLink);
      if (Date.now() > userSidebarLockUntil) keepLinkVisible(activeLink, true);
    }
  }

  function sync() {
    const viewportLine = window.innerHeight * 0.44;
    const pageBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
    let current = pageBottom ? sections[sections.length - 1] : sections[0];
    let closestDistance = Number.POSITIVE_INFINITY;

    if (!pageBottom) {
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.bottom < viewportLine) return;

        const distance = Math.abs(rect.top - viewportLine);
        if (distance < closestDistance) {
          closestDistance = distance;
          current = section;
        }
      });
    }

    moveSidebar();
    if (current) setActive(current.id);
  }

  let ticking = false;
  function requestSync() {
    if (ticking) return;

    ticking = true;
    requestAnimationFrame(() => {
      sync();
      ticking = false;
    });
  }

  const onPointerDown = () => lockSidebarAutoScroll(1800);
  const onMouseDown = () => lockSidebarAutoScroll(1800);
  const onWheel = () => lockSidebarAutoScroll(900);
  const onScroll = () => requestSync();
  const onResize = () => requestSync();
  const onHashChange = () => {
    sync();
    const activeLink = links.find((link) => link.classList.contains('active'));
    if (activeLink) keepLinkVisible(activeLink, true);
  };

  sidebar.addEventListener('pointerdown', onPointerDown);
  sidebar.addEventListener('mousedown', onMouseDown);
  sidebar.addEventListener('wheel', onWheel, { passive: true });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  window.addEventListener('hashchange', onHashChange);

  const linkCleanups = links.map((link) => {
    const onClick = (event) => {
      const section = document.querySelector(link.getAttribute('href'));
      if (!section) return;

      event.preventDefault();
      section.scrollIntoView({ block: 'center', behavior: 'smooth' });
      history.pushState(null, '', link.getAttribute('href'));
      setActive(section.id);
    };

    link.addEventListener('click', onClick);
    return () => link.removeEventListener('click', onClick);
  });

  sync();

  docsSidebarState.cleanup = () => {
    if (sidebarScrollFrame) {
      cancelAnimationFrame(sidebarScrollFrame);
      sidebarScrollFrame = null;
    }

    sidebar.removeEventListener('pointerdown', onPointerDown);
    sidebar.removeEventListener('mousedown', onMouseDown);
    sidebar.removeEventListener('wheel', onWheel);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('hashchange', onHashChange);
    linkCleanups.forEach((cleanup) => cleanup());
  };
}

(function bootSidebarLinks() {
  window.addEventListener('docs:ready', initSidebarLinks);
})();
