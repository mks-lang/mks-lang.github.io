;(async function initChangelogPage() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  var root = document.getElementById('changelog-root');
  if (!root) return;

  async function render() {
    var lang = (window.MKSSiteI18n && window.MKSSiteI18n.getLanguage && window.MKSSiteI18n.getLanguage()) || 'en';
    var path = lang === 'ru' ? 'assets/data/changelog.ru.json?v=20260425-i18n-1' : 'assets/data/changelog.json?v=20260423-1';
    var response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Failed to fetch changelog.json: ' + response.status + ' ' + response.statusText);
    }

    var data = await response.json();
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
    var failedLabel = (window.MKSSiteI18n && window.MKSSiteI18n.get) ? window.MKSSiteI18n.get('changelog.failed', 'Failed to load changelog') : 'Failed to load changelog';
    root.innerHTML = [
      '<section class="section panel glass">',
        '<p class="eyebrow">Changelog</p>',
        '<h1>' + escapeHtml(failedLabel) + '</h1>',
        '<p class="sub">' + escapeHtml(err.message) + '</p>',
      '</section>'
    ].join('');
  }

  document.addEventListener('mks:language-change', async function() {
    try {
      await render();
    } catch (err) {
      console.error('Changelog rerender error:', err);
    }
  });
})();

function renderHero(hero, stats) {
  var eyebrow = (hero && hero.eyebrow) || 'Changelog';
  var title = (hero && hero.title) || '';
  var subtitle = (hero && hero.subtitle) || '';
  var chips = (hero && hero.chips) || [];
  var statsList = stats || [];

  return [
    '<section class="change-hero">',
      '<div class="change-hero-bg">',
        '<div class="change-grid"></div>',
        '<div class="change-beam beam-a"></div>',
        '<div class="change-beam beam-b"></div>',
      '</div>',
      '<div class="section change-hero-inner">',
        '<div>',
          '<p class="eyebrow">' + escapeHtml(eyebrow) + '</p>',
          '<h1>' + escapeHtml(title) + '</h1>',
          '<p class="sub change-sub">' + escapeHtml(subtitle) + '</p>',
          '<div class="change-chips">',
            chips.map(function(chip) {
              return '<span class="change-chip ' + chipClass(chip.variant) + '">' + escapeHtml(chip.text) + '</span>';
            }).join(''),
          '</div>',
        '</div>',
        '<div class="change-console panel glass">',
          '<div class="console-head">',
            '<span></span><span></span><span></span>',
            '<strong>/changelog/live</strong>',
          '</div>',
          '<div class="console-body">',
            '<div><span>$</span> mks changes --latest</div>',
            '<div><span>></span> ' + escapeHtml((statsList[0] && statsList[0].value) || 'ready') + '</div>',
            '<div><span>></span> releases indexed</div>',
          '</div>',
          '<div class="change-stats">',
            statsList.map(function(stat) {
              return [
                '<div class="change-stat">',
                  '<p class="label">' + escapeHtml(stat.label) + '</p>',
                  '<p class="value">' + escapeHtml(stat.value) + '</p>',
                '</div>'
              ].join('');
            }).join(''),
          '</div>',
        '</div>',
      '</div>',
    '</section>'
  ].join('');
}

function renderFilters(releases) {
  var allLabel = (window.MKSSiteI18n && window.MKSSiteI18n.get) ? window.MKSSiteI18n.get('filters.all', 'all') : 'all';
  var rawTags = (releases || []).map(function(item) { return item.tag; }).filter(Boolean);
  var uniqueTags = [];
  rawTags.forEach(function(tag) {
    if (uniqueTags.indexOf(tag) === -1) uniqueTags.push(tag);
  });
  var tags = [allLabel].concat(uniqueTags);
  var searchLabel = (window.MKSSiteI18n && window.MKSSiteI18n.get) ? window.MKSSiteI18n.get('changelog.search', 'Search changelog...') : 'Search changelog...';
  var searchPlaceholder = searchLabel + ' (/)';

  return [
    '<section class="section change-filter-shell">',
      '<div class="change-filters panel glass" data-change-filters>',
        '<input class="change-search" type="search" placeholder="' + escapeHtml(searchPlaceholder) + '" aria-label="' + escapeHtml(searchPlaceholder) + '" data-change-search>',
        '<div class="change-filter-list">',
          tags.map(function(tag, index) {
            return '<button class="change-filter ' + (index === 0 ? 'active' : '') + '" type="button" data-filter="' + escapeHtml(tag) + '" aria-pressed="' + (index === 0 ? 'true' : 'false') + '">' + escapeHtml(tag) + '</button>';
          }).join(''),
        '</div>',
      '</div>',
    '</section>'
  ].join('');
}

function renderReleases(releases) {
  var emptyLabel = (window.MKSSiteI18n && window.MKSSiteI18n.get) ? window.MKSSiteI18n.get('changelog.empty', 'No changes found') : 'No changes found';

  return [
    '<section class="section change-feed" data-change-feed>',
      (releases || []).map(function(release, index) {
        return [
          '<article class="change-card panel glimmer" data-tag="' + escapeHtml(release.tag || '') + '" style="--delay:' + (index * 90) + 'ms">',
            '<div class="change-date">',
              '<span>' + escapeHtml(release.date) + '</span>',
              '<strong>' + String(index + 1).padStart(2, '0') + '</strong>',
            '</div>',
            '<div class="change-content">',
              '<div class="change-card-head">',
                '<div>',
                  '<p class="eyebrow">' + escapeHtml(release.status || '') + '</p>',
                  '<h2>' + escapeHtml(release.title || '') + '</h2>',
                '</div>',
                '<span class="change-tag">' + escapeHtml(release.tag || '') + '</span>',
              '</div>',
              '<p class="sub">' + escapeHtml(release.summary || '') + '</p>',
              '<ul class="change-list">',
                (release.items || []).map(function(item) { return '<li>' + escapeHtml(item) + '</li>'; }).join(''),
              '</ul>',
            '</div>',
          '</article>'
        ].join('');
      }).join(''),
    '</section>',
    '<div class="changelog-empty reworking-container" aria-live="polite" hidden>',
      '<div class="reworking-icon"></div>',
      '<div class="reworking-text">' + escapeHtml(emptyLabel) + '</div>',
    '</div>'
  ].join('');
}

function initFilters() {
  var filters = document.querySelector('[data-change-filters]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.change-card'));
  var search = document.querySelector('[data-change-search]');
  if (!filters || !cards.length) return;

  var allLabel = (window.MKSSiteI18n && window.MKSSiteI18n.get) ? window.MKSSiteI18n.get('filters.all', 'all') : 'all';
  var activeFilter = allLabel;
  var query = '';

  function applyFilters() {
    var visibleCount = 0;
    var currentAllLabel = (window.MKSSiteI18n && window.MKSSiteI18n.get) ? window.MKSSiteI18n.get('filters.all', 'all') : 'all';

    cards.forEach(function(card) {
      var matchesFilter = activeFilter === currentAllLabel || card.dataset.tag === activeFilter;
      var matchesQuery = !query || card.textContent.toLowerCase().indexOf(query) !== -1;
      var isVisible = matchesFilter && matchesQuery;
      card.hidden = !isVisible;
      if (isVisible) visibleCount++;
    });

    var empty = document.querySelector('.changelog-empty');
    if (empty) {
      empty.hidden = visibleCount > 0;
    }
  }

  filters.addEventListener('click', function(event) {
    var button = event.target.closest('.change-filter');
    if (!button) return;

    activeFilter = button.dataset.filter;
    filters.querySelectorAll('.change-filter').forEach(function(item) {
      var isActive = item === button;
      item.classList.toggle('active', isActive);
      item.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    applyFilters();
  });

  if (search) {
    search.addEventListener('input', function() {
      query = search.value.trim().toLowerCase();
      applyFilters();
    });
  }
}

function initChangelogFx() {
  var cards = document.querySelectorAll('.change-card');
  if (!cards.length || !('IntersectionObserver' in window)) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.18 });

  cards.forEach(function(card) { observer.observe(card); });
}

function chipClass(variant) {
  if (variant === 'live') return 'chip-live';
  if (variant === 'ghost') return 'chip-ghost';
  return '';
}

function escapeHtml(str) {
  var s = str === null || str === undefined ? '' : String(str);
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
