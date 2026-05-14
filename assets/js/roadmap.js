;(function initRoadmapPage() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  var root = document.getElementById('roadmap-root');
  if (!root) return;

  function render() {
    var lang = (window.MKSSiteI18n && window.MKSSiteI18n.getLanguage && window.MKSSiteI18n.getLanguage()) || 'en';
    var path = lang === 'ru' ? 'assets/data/roadmap.ru.json?v=20260425-i18n-1' : 'assets/data/roadmap.json?v=20260416-1';

    fetch(path, { cache: 'no-store' })
      .then(function(response) {
        if (!response.ok) {
          throw new Error('Failed to fetch roadmap.json: ' + response.status + ' ' + response.statusText);
        }
        return response.json();
      })
      .then(function(data) {
        root.innerHTML = [
          renderHero(data.hero, data.terminal, data.metrics),
          renderVersionPath(data.versionPath),
          renderRail(data.rail),
          renderSections(data.sections),
          renderTimeline(data.timeline),
          renderPrinciple(data.principle),
          '<div class="roadmap-footer-status">',
            '<div class="reworking-text">' + escapeHtml(window.MKSSiteI18n ? window.MKSSiteI18n.get('roadmap.reworking', 'Reworking...') : 'Reworking...') + '</div>',
            '<div class="soft-spinner"></div>',
          '</div>'
        ].join('');

        initRoadmapTerminal((data.terminal && data.terminal.lines) || []);
        animateRoadmapBars();
        initTiltCards();
        initRoadmapScrollFx();
      })
      .catch(function(err) {
        console.error('Roadmap load error:', err);
        var failedLabel = (window.MKSSiteI18n && window.MKSSiteI18n.get) ? window.MKSSiteI18n.get('roadmap.failed', 'Failed to load roadmap') : 'Failed to load roadmap';
        root.innerHTML = [
          '<section class="section panel glass">',
            '<p class="eyebrow">Roadmap</p>',
            '<h1>' + escapeHtml(failedLabel) + '</h1>',
            '<p class="sub">' + escapeHtml(err.message) + '</p>',
          '</section>'
        ].join('');
      });
  }

  render();

  document.addEventListener('mks:language-change', function() {
    render();
  });
})();

function renderHero(hero, terminal, metrics) {
  var eyebrow = (hero && hero.eyebrow) || '';
  var title = (hero && hero.title) || '';
  var subtitle = (hero && hero.subtitle) || '';
  var termPath = (terminal && terminal.path) || '/roadmap';
  var chips = (hero && hero.chips) || [];
  var metricsList = metrics || [];

  var readDocsLabel = (window.MKSSiteI18n && window.MKSSiteI18n.get) ? window.MKSSiteI18n.get('roadmap.read_docs', 'Read docs') : 'Read docs';
  var seeExamplesLabel = (window.MKSSiteI18n && window.MKSSiteI18n.get) ? window.MKSSiteI18n.get('roadmap.see_examples', 'See examples') : 'See examples';
  var openGithubLabel = (window.MKSSiteI18n && window.MKSSiteI18n.get) ? window.MKSSiteI18n.get('roadmap.open_github', 'Open GitHub') : 'Open GitHub';

  return [
    '<section class="road-hero">',
      '<div class="road-hero-bg">',
        '<div class="scan-grid"></div>',
        '<div class="signal-ribbon ribbon-a"></div>',
        '<div class="signal-ribbon ribbon-b"></div>',
        '<div class="signal-ribbon ribbon-c"></div>',
        '<div class="hero-orb orb-a"></div>',
        '<div class="hero-orb orb-b"></div>',
      '</div>',
      '<div class="section road-hero-inner">',
        '<div class="road-copy">',
          '<p class="eyebrow">' + escapeHtml(eyebrow) + '</p>',
          '<h1>' + escapeHtml(title) + '</h1>',
          '<p class="sub hero-sub">' + escapeHtml(subtitle) + '</p>',
          renderPathBadge(hero && hero.pathBadge),
          '<div class="chip-row">',
            chips.map(function(chip) {
              return '<span class="chip ' + chipClass(chip.variant) + '">' + escapeHtml(chip.text) + '</span>';
            }).join(''),
          '</div>',
          '<div class="hero-actions">',
            '<a class="btn" href="docs.html">' + escapeHtml(readDocsLabel) + '</a>',
            '<a class="btn ghost" href="examples.html">' + escapeHtml(seeExamplesLabel) + '</a>',
            '<a class="btn ghost" href="https://github.com/mks-lang/MKS-interpreter" target="_blank" rel="noreferrer">' + escapeHtml(openGithubLabel) + '</a>',
          '</div>',
        '</div>',
        '<div class="hero-panel panel glass">',
          '<div class="signal-map" aria-hidden="true">',
            '<span></span><span></span><span></span><span></span>',
          '</div>',
          '<div class="term-header">',
            '<div class="term-dots"><span></span><span></span><span></span></div>',
            '<span class="term-path">' + escapeHtml(termPath) + '</span>',
          '</div>',
          '<div class="term-body roadmap-terminal" data-roadmap-terminal></div>',
          '<div class="hero-metrics">',
            metricsList.map(function(metric) {
              return [
                '<div class="metric-card">',
                  '<p class="label">' + escapeHtml(metric.label) + '</p>',
                  '<p class="value">' + escapeHtml(metric.value) + '</p>',
                '</div>'
              ].join('');
            }).join(''),
          '</div>',
          '<div class="terminal-sweep"></div>',
        '</div>',
      '</div>',
    '</section>'
  ].join('');
}

function renderPathBadge(badge) {
  if (!badge) return '';
  var pathLabel = (window.MKSSiteI18n && window.MKSSiteI18n.get) ? window.MKSSiteI18n.get('roadmap.path', 'Path') : 'Path';
  var eyebrow = badge.eyebrow || pathLabel;
  var from = badge.from || '';
  var to = badge.to || '';
  var label = badge.label || '';

  return [
    '<div class="path-badge" aria-label="' + escapeHtml(eyebrow) + ' ' + escapeHtml(from) + ' to ' + escapeHtml(to) + '">',
      '<div class="path-ring">',
        '<span>' + escapeHtml(from) + '</span>',
        '<i></i>',
        '<span>' + escapeHtml(to) + '</span>',
      '</div>',
      '<div>',
        '<p class="eyebrow">' + escapeHtml(eyebrow) + '</p>',
        '<strong>' + escapeHtml(label) + '</strong>',
      '</div>',
    '</div>'
  ].join('');
}

function renderVersionPath(versionPath) {
  if (!versionPath || !versionPath.items || !versionPath.items.length) return '';
  var vpLabel = (window.MKSSiteI18n && window.MKSSiteI18n.get) ? window.MKSSiteI18n.get('roadmap.version_path', 'Version path') : 'Version path';
  var headingLabel = (window.MKSSiteI18n && window.MKSSiteI18n.get) ? window.MKSSiteI18n.get('roadmap.where_heading', 'Where MKS is heading') : 'Where MKS is heading';
  var eyebrow = versionPath.eyebrow || vpLabel;
  var title = versionPath.title || headingLabel;
  var subtitle = versionPath.subtitle || '';

  return [
    '<section class="section version-path-section">',
      '<div class="section-head">',
        '<div>',
          '<p class="eyebrow">' + escapeHtml(eyebrow) + '</p>',
          '<h2>' + escapeHtml(title) + '</h2>',
        '</div>',
        '<p class="sub">' + escapeHtml(subtitle) + '</p>',
      '</div>',
      '<div class="version-shell panel glass">',
        '<div class="version-line"></div>',
        '<div class="version-grid">',
          (versionPath.items || []).map(function(item, index) {
            return [
              '<article class="version-node ' + escapeHtml(item.state || '') + '">',
                '<div class="version-dot-wrap">',
                  '<span class="version-dot">' + String(index + 1).padStart(2, '0') + '</span>',
                '</div>',
                '<div class="version-card">',
                  '<p class="version-number">' + escapeHtml(item.version || '') + '</p>',
                  '<h3>' + escapeHtml(item.label || '') + '</h3>',
                  '<p class="sub">' + escapeHtml(item.text || '') + '</p>',
                '</div>',
              '</article>'
            ].join('');
          }).join(''),
        '</div>',
      '</div>',
    '</section>'
  ].join('');
}

function renderRail(rail) {
  if (!rail) return '';
  return [
    '<section class="section roadmap-rail-section">',
      '<div class="road-rail panel glass">',
        '<div class="rail-line"></div>',
        rail.map(function(node, index) {
          return [
            '<div class="rail-node ' + (node.state || '') + '">',
              '<span class="rail-dot">' + String(index + 1).padStart(2, '0') + '</span>',
              '<div>',
                '<p class="eyebrow">' + escapeHtml(node.phase) + '</p>',
                '<strong>' + escapeHtml(node.title) + '</strong>',
              '</div>',
            '</div>'
          ].join('');
        }).join(''),
      '</div>',
    '</section>'
  ].join('');
}

function renderSections(sections) {
  return (sections || []).map(function(section) {
    return [
      '<section class="section roadmap-block" id="' + escapeHtml(section.id || '') + '">',
        '<div class="section-head">',
          '<div>',
            '<p class="eyebrow">' + escapeHtml(section.eyebrow || '') + '</p>',
            '<h2>' + escapeHtml(section.title || '') + '</h2>',
          '</div>',
          '<p class="sub">' + escapeHtml(section.subtitle || '') + '</p>',
        '</div>',
        '<div class="stage-grid">',
          (section.cards || []).map(function(card) { return renderCard(card); }).join(''),
        '</div>',
      '</section>'
    ].join('');
  }).join('');
}

function renderCard(card) {
  var progress = Number(card.progress || 0);
  return [
    '<article class="stage-card ' + escapeHtml(card.state || '') + ' tilt-card" style="--progress:' + progress + '%">',
      '<div class="stage-head">',
        '<span class="stage-step">' + escapeHtml(card.step || '') + '</span>',
        '<div>',
          '<p class="eyebrow">' + escapeHtml(card.phase || '') + '</p>',
          '<h3>' + escapeHtml(card.title || '') + '</h3>',
        '</div>',
        '<span class="stage-chip">' + escapeHtml(card.status || '') + '</span>',
      '</div>',
      '<p class="sub">' + escapeHtml(card.description || '') + '</p>',
      '<ul class="stage-list">',
        (card.items || []).map(function(item) { return '<li>' + escapeHtml(item) + '</li>'; }).join(''),
      '</ul>',
      '<div class="stage-meter"><span style="width:' + progress + '%"></span></div>',
      '<div class="card-aura"></div>',
    '</article>'
  ].join('');
}

function renderTimeline(timeline) {
  if (!timeline) return '';
  var timelineLabel = (window.MKSSiteI18n && window.MKSSiteI18n.get) ? window.MKSSiteI18n.get('roadmap.timeline', 'Timeline') : 'Timeline';
  return [
    '<section class="section roadmap-band">',
      '<div class="section-head">',
        '<div>',
          '<p class="eyebrow">' + escapeHtml(timelineLabel) + '</p>',
          '<h2>' + escapeHtml(timeline.title || '') + '</h2>',
        '</div>',
        '<p class="sub">' + escapeHtml(timeline.subtitle || '') + '</p>',
      '</div>',
      '<div class="timeline-shell panel glass">',
        '<div class="timeline-track">',
          (timeline.items || []).map(function(item) {
            return [
              '<article class="timeline-card glimmer">',
                '<p class="eyebrow">' + escapeHtml(item.month || '') + '</p>',
                '<h3>' + escapeHtml(item.title || '') + '</h3>',
                '<p class="sub">' + escapeHtml(item.text || '') + '</p>',
              '</article>'
            ].join('');
          }).join(''),
        '</div>',
      '</div>',
    '</section>'
  ].join('');
}

function renderPrinciple(principle) {
  if (!principle) return '';
  return [
    '<section class="section signal-section">',
      '<div class="signal-panel panel glass">',
        '<div>',
          '<p class="eyebrow">' + escapeHtml(principle.eyebrow || '') + '</p>',
          '<h2>' + escapeHtml(principle.title || '') + '</h2>',
          '<p class="sub">' + escapeHtml(principle.text || '') + '</p>',
        '</div>',
        '<div class="signal-pills">',
          (principle.pills || []).map(function(pill) {
            return '<span class="signal-pill">' + escapeHtml(pill) + '</span>';
          }).join(''),
        '</div>',
      '</div>',
    '</section>'
  ].join('');
}

function initRoadmapTerminal(lines) {
  var root = document.querySelector('[data-roadmap-terminal]');
  if (!root || !lines.length) return;

  var index = 0;

  function colorize(line) {
    return escapeHtml(line)
      .replace(/\$/g, '<span class="prompt">$</span>')
      .replace(/active/g, '<span class="green">active</span>')
      .replace('in development', '<span class="accent">in development</span>');
  }

  function draw() {
    var shown = lines
      .slice(0, index + 1)
      .map(function(line) { return '<div class="term-line">' + colorize(line) + '</div>'; })
      .join('');

    root.innerHTML = shown;
    index++;

    if (index >= lines.length) {
      setTimeout(function() {
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
  var bars = document.querySelectorAll('.stage-meter span');
  if (!bars.length || !('IntersectionObserver' in window)) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;

      var el = entry.target;
      var finalWidth = el.style.width;
      el.style.width = '0';
      el.style.transition = 'width 900ms ease';

      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          el.style.width = finalWidth;
        });
      });

      observer.unobserve(el);
    });
  }, { threshold: 0.35 });

  bars.forEach(function(bar) { observer.observe(bar); });
}

function initTiltCards() {
  var cards = document.querySelectorAll('.tilt-card');

  cards.forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      if (window.innerWidth <= 900) return;

      var rect = card.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width;
      var py = (e.clientY - rect.top) / rect.height;

      var rotateY = (px - 0.5) * 7;
      var rotateX = (0.5 - py) * 7;

      card.style.transform = 'perspective(900px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-4px)';
    });

    card.addEventListener('mouseleave', function() {
      card.style.transform = '';
    });
  });
}

function initRoadmapScrollFx() {
  var cards = document.querySelectorAll('.stage-card, .timeline-card, .rail-node, .version-node');
  if (!cards.length || !('IntersectionObserver' in window)) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.18 });

  cards.forEach(function(card, index) {
    card.style.setProperty('--delay', ((index % 6) * 70) + 'ms');
    observer.observe(card);
  });
}

function chipClass(variant) {
  if (variant === 'live') return 'chip-live';
  if (variant === 'ghost') return 'chip-ghost';
  return '';
}

function escapeHtml(str) {
  var s = (str === null || str === undefined) ? '' : String(str);
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
