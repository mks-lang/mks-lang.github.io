(async function initRoadmapPage() {
  const root = document.getElementById('roadmap-root');
  if (!root) return;

  async function render() {
    const lang = window.MKSSiteI18n?.getLanguage?.() || 'en';
    const path = lang === 'ru' ? 'assets/data/roadmap.ru.json?v=20260425-i18n-1' : 'assets/data/roadmap.json?v=20260416-1';
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to fetch roadmap.json: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    root.innerHTML = `
      ${renderHero(data.hero, data.terminal, data.metrics)}
      ${renderVersionPath(data.versionPath)}
      ${renderRail(data.rail)}
      ${renderSections(data.sections)}
      ${renderTimeline(data.timeline)}
      ${renderPrinciple(data.principle)}
      <div class="roadmap-footer-status">
        <div class="reworking-text">${escapeHtml(window.MKSSiteI18n?.get('roadmap.reworking', 'Reworking...'))}</div>
        <div class="soft-spinner"></div>
      </div>
    `;

    initRoadmapTerminal(data.terminal?.lines || []);
    animateRoadmapBars();
    initTiltCards();
    initRoadmapScrollFx();
  }

  try {
    await render();
  } catch (err) {
    console.error('Roadmap load error:', err);
    root.innerHTML = `
      <section class="section panel glass">
        <p class="eyebrow">Roadmap</p>
        <h1>${escapeHtml(window.MKSSiteI18n?.get('roadmap.failed', 'Failed to load roadmap'))}</h1>
        <p class="sub">${escapeHtml(err.message)}</p>
      </section>
    `;
  }

  document.addEventListener('mks:language-change', async () => {
    try {
      await render();
    } catch (err) {
      console.error('Roadmap rerender error:', err);
    }
  });
})();

function renderHero(hero, terminal, metrics) {
  return `
    <section class="road-hero">
      <div class="road-hero-bg">
        <div class="scan-grid"></div>
        <div class="signal-ribbon ribbon-a"></div>
        <div class="signal-ribbon ribbon-b"></div>
        <div class="signal-ribbon ribbon-c"></div>
        <div class="hero-orb orb-a"></div>
        <div class="hero-orb orb-b"></div>
      </div>

      <div class="section road-hero-inner">
        <div class="road-copy">
          <p class="eyebrow">${escapeHtml(hero?.eyebrow || '')}</p>
          <h1>${escapeHtml(hero?.title || '')}</h1>
          <p class="sub hero-sub">${escapeHtml(hero?.subtitle || '')}</p>

          ${renderPathBadge(hero?.pathBadge)}

          <div class="chip-row">
            ${(hero?.chips || []).map(chip => `
              <span class="chip ${chipClass(chip.variant)}">${escapeHtml(chip.text)}</span>
            `).join('')}
          </div>

          <div class="hero-actions">
            <a class="btn" href="docs.html">${escapeHtml(window.MKSSiteI18n?.get('roadmap.read_docs', 'Read docs'))}</a>
            <a class="btn ghost" href="examples.html">${escapeHtml(window.MKSSiteI18n?.get('roadmap.see_examples', 'See examples'))}</a>
            <a class="btn ghost" href="https://github.com/mks-lang/MKS-interpreter" target="_blank" rel="noreferrer">${escapeHtml(window.MKSSiteI18n?.get('roadmap.open_github', 'Open GitHub'))}</a>
          </div>
        </div>

        <div class="hero-panel panel glass">
          <div class="signal-map" aria-hidden="true">
            <span></span><span></span><span></span><span></span>
          </div>

          <div class="term-header">
            <div class="term-dots"><span></span><span></span><span></span></div>
            <span class="term-path">${escapeHtml(terminal?.path || '/roadmap')}</span>
          </div>

          <div class="term-body roadmap-terminal" data-roadmap-terminal></div>

          <div class="hero-metrics">
            ${(metrics || []).map(metric => `
              <div class="metric-card">
                <p class="label">${escapeHtml(metric.label)}</p>
                <p class="value">${escapeHtml(metric.value)}</p>
              </div>
            `).join('')}
          </div>

          <div class="terminal-sweep"></div>
        </div>
      </div>
    </section>
  `;
}

function renderPathBadge(badge) {
  if (!badge) return '';

  return `
    <div class="path-badge" aria-label="${escapeHtml(badge.eyebrow || window.MKSSiteI18n?.get('roadmap.path', 'Path'))} ${escapeHtml(badge.from || '')} to ${escapeHtml(badge.to || '')}">
      <div class="path-ring">
        <span>${escapeHtml(badge.from || '')}</span>
        <i></i>
        <span>${escapeHtml(badge.to || '')}</span>
      </div>
      <div>
        <p class="eyebrow">${escapeHtml(badge.eyebrow || window.MKSSiteI18n?.get('roadmap.path', 'Path'))}</p>
        <strong>${escapeHtml(badge.label || '')}</strong>
      </div>
    </div>
  `;
}

function renderVersionPath(versionPath) {
  if (!versionPath?.items?.length) return '';

  return `
    <section class="section version-path-section">
      <div class="section-head">
        <div>
          <p class="eyebrow">${escapeHtml(versionPath?.eyebrow || window.MKSSiteI18n?.get('roadmap.version_path', 'Version path'))}</p>
          <h2>${escapeHtml(versionPath?.title || window.MKSSiteI18n?.get('roadmap.where_heading', 'Where MKS is heading'))}</h2>
        </div>
        <p class="sub">${escapeHtml(versionPath?.subtitle || '')}</p>
      </div>

      <div class="version-shell panel glass">
        <div class="version-line"></div>

        <div class="version-grid">
          ${(versionPath.items || []).map((item, index) => `
            <article class="version-node ${escapeHtml(item.state || '')}">
              <div class="version-dot-wrap">
                <span class="version-dot">${String(index + 1).padStart(2, '0')}</span>
              </div>

              <div class="version-card">
                <p class="version-number">${escapeHtml(item.version || '')}</p>
                <h3>${escapeHtml(item.label || '')}</h3>
                <p class="sub">${escapeHtml(item.text || '')}</p>
              </div>
            </article>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderRail(rail) {
  return `
    <section class="section roadmap-rail-section">
      <div class="road-rail panel glass">
        <div class="rail-line"></div>
        ${(rail || []).map((node, index) => `
          <div class="rail-node ${node.state || ''}">
            <span class="rail-dot">${String(index + 1).padStart(2, '0')}</span>
            <div>
              <p class="eyebrow">${escapeHtml(node.phase)}</p>
              <strong>${escapeHtml(node.title)}</strong>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function renderSections(sections) {
  return (sections || []).map(section => `
    <section class="section roadmap-block" id="${escapeHtml(section.id || '')}">
      <div class="section-head">
        <div>
          <p class="eyebrow">${escapeHtml(section.eyebrow || '')}</p>
          <h2>${escapeHtml(section.title || '')}</h2>
        </div>
        <p class="sub">${escapeHtml(section.subtitle || '')}</p>
      </div>

      <div class="stage-grid">
        ${(section.cards || []).map(card => renderCard(card)).join('')}
      </div>
    </section>
  `).join('');
}

function renderCard(card) {
  return `
    <article class="stage-card ${escapeHtml(card.state || '')} tilt-card" style="--progress:${Number(card.progress || 0)}%">
      <div class="stage-head">
        <span class="stage-step">${escapeHtml(card.step || '')}</span>
        <div>
          <p class="eyebrow">${escapeHtml(card.phase || '')}</p>
          <h3>${escapeHtml(card.title || '')}</h3>
        </div>
        <span class="stage-chip">${escapeHtml(card.status || '')}</span>
      </div>

      <p class="sub">${escapeHtml(card.description || '')}</p>

      <ul class="stage-list">
        ${(card.items || []).map(item => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>

      <div class="stage-meter"><span style="width:${Number(card.progress || 0)}%"></span></div>
      <div class="card-aura"></div>
    </article>
  `;
}

function renderTimeline(timeline) {
  return `
    <section class="section roadmap-band">
      <div class="section-head">
        <div>
          <p class="eyebrow">${escapeHtml(window.MKSSiteI18n?.get('roadmap.timeline', 'Timeline'))}</p>
          <h2>${escapeHtml(timeline?.title || '')}</h2>
        </div>
        <p class="sub">${escapeHtml(timeline?.subtitle || '')}</p>
      </div>

      <div class="timeline-shell panel glass">
        <div class="timeline-track">
          ${(timeline?.items || []).map(item => `
            <article class="timeline-card glimmer">
              <p class="eyebrow">${escapeHtml(item.month || '')}</p>
              <h3>${escapeHtml(item.title || '')}</h3>
              <p class="sub">${escapeHtml(item.text || '')}</p>
            </article>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderPrinciple(principle) {
  return `
    <section class="section signal-section">
      <div class="signal-panel panel glass">
        <div>
          <p class="eyebrow">${escapeHtml(principle?.eyebrow || '')}</p>
          <h2>${escapeHtml(principle?.title || '')}</h2>
          <p class="sub">${escapeHtml(principle?.text || '')}</p>
        </div>

        <div class="signal-pills">
          ${(principle?.pills || []).map(pill => `
            <span class="signal-pill">${escapeHtml(pill)}</span>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function initRoadmapTerminal(lines) {
  const root = document.querySelector('[data-roadmap-terminal]');
  if (!root || !lines.length) return;

  let index = 0;

  function colorize(line) {
    return escapeHtml(line)
      .replaceAll('$', '<span class="prompt">$</span>')
      .replaceAll('active', '<span class="green">active</span>')
      .replace('in development', '<span class="accent">in development</span>');
  }

  function draw() {
    const shown = lines
      .slice(0, index + 1)
      .map((line) => `<div class="term-line">${colorize(line)}</div>`)
      .join('');

    root.innerHTML = shown;
    index++;

    if (index >= lines.length) {
      setTimeout(() => {
        index = 0;
        draw();
      }, 1300);
      return;
    }

    setTimeout(draw, 650);
  }

  draw();
}

function animateRoadmapBars() {
  const bars = document.querySelectorAll('.stage-meter span');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const finalWidth = el.style.width;
      el.style.width = '0';
      el.style.transition = 'width 900ms ease';

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.width = finalWidth;
        });
      });

      observer.unobserve(el);
    });
  }, { threshold: 0.35 });

  bars.forEach((bar) => observer.observe(bar));
}

function initTiltCards() {
  const cards = document.querySelectorAll('.tilt-card');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 900) return;

      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;

      const rotateY = (px - 0.5) * 7;
      const rotateX = (0.5 - py) * 7;

      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

function initRoadmapScrollFx() {
  const cards = document.querySelectorAll('.stage-card, .timeline-card, .rail-node, .version-node');
  if (!cards.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.18 });

  cards.forEach((card, index) => {
    card.style.setProperty('--delay', `${(index % 6) * 70}ms`);
    observer.observe(card);
  });
}

function chipClass(variant) {
  if (variant === 'live') return 'chip-live';
  if (variant === 'ghost') return 'chip-ghost';
  return '';
}

function escapeHtml(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
