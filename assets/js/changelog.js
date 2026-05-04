(async function initChangelogPage() {
  const root = document.getElementById('main-content');
  if (!root) return;

  async function render() {
    const lang = window.MKSSiteI18n?.getLanguage?.() || 'en';
    const path = lang === 'ru' ? 'assets/data/changelog.ru.json?v=20260425-i18n-1' : 'assets/data/changelog.json?v=20260423-1';
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to fetch changelog.json: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    root.innerHTML = [
      renderHero(data.hero, data.stats),
      renderFilters(data.releases),
      renderReleases(data.releases)
    ].join('');

    initFilters();
    initChangelogFx();
  }

  try {
    await render();
  } catch (err) {
    console.error('Changelog load error:', err);
    root.innerHTML = `
      <section class="section panel glass">
        <p class="eyebrow">Changelog</p>
        <h1>${escapeHtml(window.MKSSiteI18n?.get('changelog.failed', 'Failed to load changelog'))}</h1>
        <p class="sub">${escapeHtml(err.message)}</p>
      </section>
    `;
  }

  document.addEventListener('mks:language-change', async () => {
    try {
      await render();
    } catch (err) {
      console.error('Changelog rerender error:', err);
    }
  });
})();

function renderHero(hero, stats) {
  return `
    <section class="change-hero">
      <div class="change-hero-bg">
        <div class="change-grid"></div>
        <div class="change-beam beam-a"></div>
        <div class="change-beam beam-b"></div>
      </div>

      <div class="section change-hero-inner">
        <div>
          <p class="eyebrow">${escapeHtml(hero?.eyebrow || 'Changelog')}</p>
          <h1>${escapeHtml(hero?.title || '')}</h1>
          <p class="sub change-sub">${escapeHtml(hero?.subtitle || '')}</p>

          <div class="change-chips">
            ${(hero?.chips || []).map(chip => `
              <span class="change-chip ${chipClass(chip.variant)}">${escapeHtml(chip.text)}</span>
            `).join('')}
          </div>
        </div>

        <div class="change-console panel glass">
          <div class="console-head">
            <span></span><span></span><span></span>
            <strong>/changelog/live</strong>
          </div>
          <div class="console-body">
            <div><span>$</span> mks changes --latest</div>
            <div><span>></span> ${escapeHtml(stats?.[0]?.value || 'ready')}</div>
            <div><span>></span> releases indexed</div>
          </div>
          <div class="change-stats">
            ${(stats || []).map(stat => `
              <div class="change-stat">
                <p class="label">${escapeHtml(stat.label)}</p>
                <p class="value">${escapeHtml(stat.value)}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderFilters(releases) {
  const allLabel = window.MKSSiteI18n?.get('filters.all', 'all');
  const tags = [allLabel, ...new Set((releases || []).map(item => item.tag).filter(Boolean))];

  return `
    <section class="section change-filter-shell">
      <div class="change-filters panel glass" data-change-filters>
        <input class="change-search" type="search" placeholder="${escapeHtml(window.MKSSiteI18n?.get('changelog.search', 'Search changelog...'))}" aria-label="${escapeHtml(window.MKSSiteI18n?.get('changelog.search', 'Search changelog...'))}" data-change-search>
        <div class="change-filter-list">
          ${tags.map((tag, index) => `
            <button class="change-filter ${index === 0 ? 'active' : ''}" type="button" data-filter="${escapeHtml(tag)}">
              ${escapeHtml(tag)}
            </button>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderReleases(releases) {
  return `
    <section class="section change-feed" data-change-feed>
      ${(releases || []).map((release, index) => `
        <article class="change-card panel glimmer" data-tag="${escapeHtml(release.tag || '')}" style="--delay:${index * 90}ms">
          <div class="change-date">
            <span>${escapeHtml(release.date)}</span>
            <strong>${String(index + 1).padStart(2, '0')}</strong>
          </div>

          <div class="change-content">
            <div class="change-card-head">
              <div>
                <p class="eyebrow">${escapeHtml(release.status || '')}</p>
                <h2>${escapeHtml(release.title || '')}</h2>
              </div>
              <span class="change-tag">${escapeHtml(release.tag || '')}</span>
            </div>

            <p class="sub">${escapeHtml(release.summary || '')}</p>

            <ul class="change-list">
              ${(release.items || []).map(item => `<li>${escapeHtml(item)}</li>`).join('')}
            </ul>
          </div>
        </article>
      `).join('')}
    </section>
  `;
}

function initFilters() {
  const filters = document.querySelector('[data-change-filters]');
  const cards = Array.from(document.querySelectorAll('.change-card'));
  const search = document.querySelector('[data-change-search]');
  if (!filters || !cards.length) return;

  let activeFilter = window.MKSSiteI18n?.get('filters.all', 'all');
  let query = '';

  function applyFilters() {
    cards.forEach((card) => {
      const allLabel = window.MKSSiteI18n?.get('filters.all', 'all');
      const matchesFilter = activeFilter === allLabel || card.dataset.tag === activeFilter;
      const matchesQuery = !query || card.textContent.toLowerCase().includes(query);
      card.hidden = !(matchesFilter && matchesQuery);
    });
  }

  filters.addEventListener('click', (event) => {
    const button = event.target.closest('.change-filter');
    if (!button) return;

    activeFilter = button.dataset.filter;
    filters.querySelectorAll('.change-filter').forEach((item) => {
      item.classList.toggle('active', item === button);
    });

    applyFilters();
  });

  if (search) {
    search.addEventListener('input', () => {
      query = search.value.trim().toLowerCase();
      applyFilters();
    });
  }
}

function initChangelogFx() {
  const cards = document.querySelectorAll('.change-card');
  if (!cards.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.18 });

  cards.forEach((card) => observer.observe(card));
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
