function initDocsEnhancements() {
  document.querySelectorAll('.panel').forEach((panel, idx) => {
    panel.style.animationDelay = `${(idx % 5) * 0.08}s`;
  });
}

(function bootDocsEnhancements() {
  window.addEventListener('docs:ready', initDocsEnhancements);
})();

function initSidebarLinks() {
  const sidebar = document.querySelector('.sidebar');
  const links = Array.from(document.querySelectorAll('.sidebar a'));
  if (!links.length) return;

  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  function moveSidebar() {
    if (!sidebar) return;

    if (window.matchMedia('(max-width: 960px)').matches) {
      sidebar.style.setProperty('--sidebar-shift', '0px');
      return;
    }

    const shift = Math.min(10, window.scrollY * 0.02);
    sidebar.style.setProperty('--sidebar-shift', `${shift}px`);
  }

  function moveIndicator(activeLink) {
    if (!sidebar || !activeLink) return;

    const sidebarBox = sidebar.getBoundingClientRect();
    const linkBox = activeLink.getBoundingClientRect();
    const offset = linkBox.top - sidebarBox.top + sidebar.scrollTop;

    sidebar.style.setProperty('--indicator-y', `${offset}px`);
    sidebar.style.setProperty('--indicator-height', `${linkBox.height}px`);
    sidebar.style.setProperty('--indicator-opacity', '1');
  }

  function keepLinkVisible(activeLink, smooth = false) {
    if (!sidebar || !activeLink) return;

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
    const padding = 14;

    if (linkTop < visibleTop + padding) {
      sidebar.scrollTo({
        top: Math.max(0, linkTop - padding),
        behavior: smooth ? 'smooth' : 'auto',
      });
    } else if (linkBottom > visibleBottom - padding) {
      sidebar.scrollTo({
        top: linkBottom - sidebar.clientHeight + padding,
        behavior: smooth ? 'smooth' : 'auto',
      });
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
      keepLinkVisible(activeLink);
    }
  }

  function sync() {
    const viewportLine = window.innerHeight / 2;
    const pageBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
    let current = pageBottom ? sections[sections.length - 1] : sections[0];
    let closestDistance = Number.POSITIVE_INFINITY;

    if (!pageBottom) {
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const sectionBottom = rect.bottom;

        if (sectionBottom < viewportLine) return;

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

  window.addEventListener('scroll', requestSync, { passive: true });
  window.addEventListener('resize', requestSync);
  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const section = document.querySelector(link.getAttribute('href'));
      if (!section) return;

      event.preventDefault();
      section.scrollIntoView({ block: 'center', behavior: 'smooth' });
      history.pushState(null, '', link.getAttribute('href'));
      setActive(section.id);
      keepLinkVisible(link, true);
    });
  });
  window.addEventListener('hashchange', () => {
    sync();
    const activeLink = links.find((link) => link.classList.contains('active'));
    if (activeLink) keepLinkVisible(activeLink, true);
  });
  sync();
}

(function bootSidebarLinks() {
  window.addEventListener('docs:ready', initSidebarLinks);
})();
