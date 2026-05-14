;(function initDocsPage() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  var sidebar = document.querySelector('[data-docs-sidebar]');
  var body = document.querySelector('[data-docs-body]');
  if (!sidebar || !body) return;

  var defaultIcon = 'hgi-book-open-01';

  function iconMarkup(name) {
    var icon = name || defaultIcon;
    return '<i class="hgi-stroke ' + icon + '" aria-hidden="true"></i>';
  }

  function unstableBadge() {
    var label = (window.MKSSiteI18n && window.MKSSiteI18n.get) ? window.MKSSiteI18n.get('docs.unstable', 'Not-Stable') : 'Not-Stable';
    return '<span class="docs-status docs-status-unstable">' + escapeHtml(label) + '</span>';
  }

  function newBadge() {
    var label = (window.MKSSiteI18n && window.MKSSiteI18n.get) ? window.MKSSiteI18n.get('docs.new', 'New') : 'New';
    return '<span class="docs-status docs-status-new">' + escapeHtml(label) + '</span>';
  }

  function statusBadges(section) {
    return [
      section.unstable ? unstableBadge() : '',
      section.isNew ? newBadge() : '',
    ].join('');
  }

  function codeText(value) {
    return Array.isArray(value) ? value.join('\n') : String(value || '');
  }

  function makeCodeBlock(code, withCopy) {
    var isWithCopy = withCopy === undefined ? true : withCopy;
    var block = document.createElement('div');
    block.className = 'code-block';
    block.dataset.lang = 'MKS';

    if (isWithCopy) {
      var copy = document.createElement('button');
      copy.className = 'copy-btn';
      copy.type = 'button';
      var copyLabel = (window.MKSSiteI18n && window.MKSSiteI18n.get) ? window.MKSSiteI18n.get('copy.default', 'Copy') : 'Copy';
      copy.textContent = copyLabel;
      block.appendChild(copy);
    }

    var pre = document.createElement('pre');
    var codeEl = document.createElement('code');
    codeEl.textContent = codeText(code);
    pre.appendChild(codeEl);
    block.appendChild(pre);

    return block;
  }

  function appendRichContent(parent, section) {
    if (Array.isArray(section.points) && section.points.length) {
      var list = document.createElement('ul');
      list.className = 'docs-points';
      section.points.forEach(function(item) {
        var point = document.createElement('li');
        point.innerHTML = item;
        list.appendChild(point);
      });
      parent.appendChild(list);
    }

    if (section.warning) {
      var warning = document.createElement('p');
      warning.className = 'docs-callout warning';
      warning.innerHTML = section.warning;
      parent.appendChild(warning);
    }

    if (section.source) {
      var source = document.createElement('p');
      source.className = 'docs-source';
      source.innerHTML = section.source;
      parent.appendChild(source);
    }
  }

  function renderHero(hero) {
    var header = document.createElement('header');
    header.className = 'panel glass glimmer docs-hero';
    header.id = hero.id || 'overview';

    var scene = document.createElement('div');
    scene.className = 'docs-hero-scene';
    scene.setAttribute('aria-hidden', 'true');
    scene.innerHTML = [
      '<span></span><span></span><span></span>',
      '<i></i><i></i><i></i><i></i>',
      '<b></b><b></b>'
    ].join('');

    var eyebrow = document.createElement('p');
    eyebrow.className = 'eyebrow';
    eyebrow.textContent = hero.eyebrow || 'Docs';

    var meta = document.createElement('div');
    meta.className = 'docs-hero-meta';
    meta.innerHTML = iconMarkup(hero.icon) + '<span>' + (hero.meta || 'Reference based on current interpreter branch') + '</span>';

    var title = document.createElement('h1');
    title.textContent = hero.title || 'Docs';

    var description = document.createElement('p');
    description.className = 'sub';
    description.textContent = hero.description || '';

    var pills = document.createElement('div');
    pills.className = 'docs-hero-pills';
    (hero.tags || []).forEach(function(item) {
      var tag = document.createElement('span');
      var data = typeof item === 'string' ? { label: item } : item;
      tag.className = data.live ? 'tag live' : 'tag';
      tag.textContent = data.label;
      pills.appendChild(tag);
    });

    var terminal = document.createElement('div');
    terminal.className = 'docs-mini-terminal';
    terminal.innerHTML = [
      '<div><span>$</span> mks docs --open</div>',
      '<div><span>></span> syntax loaded</div>',
      '<div><span>></span> runtime notes ready</div>'
    ].join('');

    header.appendChild(scene);
    header.appendChild(eyebrow);
    header.appendChild(meta);
    header.appendChild(title);
    header.appendChild(description);
    header.appendChild(pills);
    header.appendChild(terminal);
    return header;
  }

  function renderTabbedSection(section) {
    var el = document.createElement('section');
    el.className = 'panel glimmer';
    el.id = section.id;
    el.dataset.docsCard = '';

    var title = document.createElement('div');
    title.className = 'docs-section-head';
    title.innerHTML = [
      '<div class="docs-section-title">',
        iconMarkup(section.icon),
        '<h2>' + section.title + '</h2>',
      '</div>',
      statusBadges(section)
    ].join('');

    var description = document.createElement('p');
    description.className = 'sub';
    description.innerHTML = section.description || '';

    var tabs = document.createElement('div');
    tabs.className = 'tabs';

    var panes = document.createDocumentFragment();
    section.tabs.forEach(function(tab, index) {
      var button = document.createElement('button');
      button.className = index === 0 ? 'tab active' : 'tab';
      button.type = 'button';
      button.dataset.tab = tab.id;
      button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      button.textContent = tab.label;
      tabs.appendChild(button);

      var pane = document.createElement('div');
      pane.className = index === 0 ? 'tab-pane active' : 'tab-pane';
      pane.dataset.tabPane = tab.id;
      pane.hidden = index !== 0;
      var codeBlock = makeCodeBlock(tab.code);
      codeBlock.dataset.lang = tab.label || tab.id || 'code';
      pane.appendChild(codeBlock);

      if (Array.isArray(tab.steps) && tab.steps.length) {
        var steps = document.createElement('ol');
        steps.className = 'docs-steps';
        tab.steps.forEach(function(item) {
          var step = document.createElement('li');
          step.innerHTML = item;
          steps.appendChild(step);
        });
        pane.appendChild(steps);
      }

      if (tab.note) {
        var note = document.createElement('p');
        note.className = 'docs-callout';
        note.innerHTML = tab.note;
        pane.appendChild(note);
      }

      panes.appendChild(pane);
    });

    el.appendChild(title);
    el.appendChild(description);
    appendRichContent(el, section);
    el.appendChild(tabs);
    el.appendChild(panes);
    return el;
  }

  function renderPlainSection(section) {
    if (section.python) {
      var tabs = [
        {
          id: 'mks',
          label: section.mksLabel || 'MKS',
          code: section.code,
          note: section.note,
          steps: section.steps,
        },
        {
          id: 'py',
          label: section.pythonLabel || 'Python',
          code: section.python,
        }
      ];
      var tabbedData = {};
      for (var key in section) {
        if (section.hasOwnProperty(key)) tabbedData[key] = section[key];
      }
      tabbedData.tabs = tabs;
      return renderTabbedSection(tabbedData);
    }

    var el = document.createElement('section');
    el.className = 'panel glimmer';
    el.id = section.id;
    el.dataset.docsCard = '';

    var title = document.createElement('div');
    title.className = 'docs-section-head';
    title.innerHTML = [
      '<div class="docs-section-title">',
        iconMarkup(section.icon),
        '<h2>' + section.title + '</h2>',
      '</div>',
      statusBadges(section)
    ].join('');

    var description = document.createElement('p');
    description.className = 'sub';
    description.innerHTML = section.description || '';

    el.appendChild(title);
    el.appendChild(description);
    appendRichContent(el, section);
    if (section.code) el.appendChild(makeCodeBlock(section.code));

    return el;
  }

  function renderTabs() {
    var tabsets = document.querySelectorAll('.tabs');
    for (var i = 0; i < tabsets.length; i++) {
      (function() {
        var tabset = tabsets[i];
        var tabs = Array.prototype.slice.call(tabset.querySelectorAll('.tab'));
        var panel = tabset.closest('.panel');
        if (!panel || !tabs.length) return;

        var panes = Array.prototype.slice.call(panel.querySelectorAll('.tab-pane'));
        if (!panes.length) return;

        function activate(name) {
          tabs.forEach(function(tab) {
            var isActive = tab.dataset.tab === name;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', String(isActive));
          });

          panes.forEach(function(pane) {
            var isActive = pane.dataset.tabPane === name;
            pane.classList.toggle('active', isActive);
            pane.hidden = !isActive;
          });
        }

        var activeTab = tabset.querySelector('.tab.active');
        var initial = (activeTab && activeTab.dataset.tab) || (tabs[0] && tabs[0].dataset.tab);
        if (initial) activate(initial);

        tabs.forEach(function(tab) {
          tab.addEventListener('click', function() { activate(tab.dataset.tab); });
        });
      })();
    }
  }

  function render() {
    var lang = (window.MKSSiteI18n && window.MKSSiteI18n.getLanguage && window.MKSSiteI18n.getLanguage()) || 'en';
    var path = lang === 'ru' ? 'assets/data/docs.ru.json?v=20260426-docs-ru-1' : 'assets/data/docs.json?v=20260423-docs-data-1';

    fetch(path, { cache: 'no-store' })
      .then(function(response) {
        if (!response.ok) throw new Error('Docs data request failed: ' + response.status);
        return response.json();
      })
      .then(function(docs) {
        var sections = docs.sections || [];

        while (sidebar.firstChild) sidebar.removeChild(sidebar.firstChild);
        while (body.firstChild) body.removeChild(body.firstChild);

        var overview = document.createElement('a');
        var heroData = docs.hero || {};
        overview.href = '#' + (heroData.id || 'overview');
        var overviewLabel = (window.MKSSiteI18n && window.MKSSiteI18n.get) ? window.MKSSiteI18n.get('docs.overview', 'Overview') : 'Overview';
        overview.innerHTML = iconMarkup(heroData.icon) + '<span>' + escapeHtml(overviewLabel) + '</span>';
        sidebar.appendChild(overview);

        var sectionById = {};
        sections.forEach(function(section) {
          sectionById[section.id] = section;
        });

        var navigation = Array.isArray(docs.navigation) && docs.navigation.length
          ? docs.navigation
          : [{ title: '', sections: sections.map(function(section) { return section.id; }) }];

        navigation.forEach(function(group) {
          var groupSections = (group.sections || [])
            .map(function(id) { return sectionById[id]; })
            .filter(Boolean);
          if (!groupSections.length) return;

          if (group.title) {
            var heading = document.createElement('p');
            heading.className = 'sidebar-heading';
            heading.textContent = group.title;
            sidebar.appendChild(heading);
          }

          groupSections.forEach(function(section) {
            var link = document.createElement('a');
            link.href = '#' + section.id;
            var newLabel = (window.MKSSiteI18n && window.MKSSiteI18n.get) ? window.MKSSiteI18n.get('docs.new', 'New') : 'New';
            var unstableLabel = (window.MKSSiteI18n && window.MKSSiteI18n.get) ? window.MKSSiteI18n.get('docs.unstable', 'Not-Stable') : 'Not-Stable';
            var sidebarBadge = section.isNew
              ? '<em class="sidebar-badge sidebar-badge-new">' + escapeHtml(newLabel) + '</em>'
              : section.unstable
                ? '<em>' + escapeHtml(unstableLabel) + '</em>'
                : '';
            link.innerHTML = iconMarkup(section.icon) + '<span>' + (section.nav || section.title) + '</span>' + sidebarBadge;
            sidebar.appendChild(link);
          });
        });

        var alertBanner = document.createElement('div');
        alertBanner.className = 'docs-warning-banner';
        var warningTitle = (window.MKSSiteI18n && window.MKSSiteI18n.get) ? window.MKSSiteI18n.get('docs.warning.title', 'Note') : 'Note';
        var warningText = (window.MKSSiteI18n && window.MKSSiteI18n.get) ? window.MKSSiteI18n.get('docs.warning.text', 'Some examples currently may be erroneous and non-working, this will be fixed soon.') : 'Some examples currently may be erroneous and non-working, this will be fixed soon.';
        alertBanner.innerHTML = [
          '<i class="hgi-stroke hgi-alert-01" aria-hidden="true"></i>',
          '<div>',
            '<strong>' + escapeHtml(warningTitle) + '</strong>',
            ' ' + escapeHtml(warningText),
          '</div>'
        ].join('');
        body.appendChild(alertBanner);

        body.appendChild(renderHero(docs.hero || {}));
        sections.forEach(function(section) {
          body.appendChild(section.tabs ? renderTabbedSection(section) : renderPlainSection(section));
        });

        renderTabs();
        if (typeof CustomEvent === 'function') {
          window.dispatchEvent(new CustomEvent('docs:ready'));
        }
      })
      .catch(function(error) {
        var failedLabel = (window.MKSSiteI18n && window.MKSSiteI18n.get) ? window.MKSSiteI18n.get('docs.failed', 'Docs failed to load.') : 'Docs failed to load.';
        body.innerHTML = '<section class="panel glimmer docs-loading">' + escapeHtml(failedLabel) + '</section>';
        console.error(error);
      });
  }

  render();

  document.addEventListener('mks:language-change', function() {
    render();
  });

  function escapeHtml(str) {
    var s = (str === null || str === undefined) ? '' : String(str);
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
