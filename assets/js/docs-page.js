(async function initDocsPage() {
  const sidebar = document.querySelector('[data-docs-sidebar]');
  const body = document.querySelector('[data-docs-body]');
  if (!sidebar || !body) return;

  const defaultIcon = 'hgi-book-open-01';

  function iconMarkup(name) {
    const icon = name || defaultIcon;
    return `<i class="hgi-stroke ${icon}" aria-hidden="true"></i>`;
  }

  function unstableBadge() {
    return `<span class="docs-status docs-status-unstable">${escapeHtml(window.MKSSiteI18n?.get('docs.unstable', 'Not-Stable'))}</span>`;
  }

  function newBadge() {
    return `<span class="docs-status docs-status-new">${escapeHtml(window.MKSSiteI18n?.get('docs.new', 'New'))}</span>`;
  }

  function statusBadges(section) {
    return [
      section.unstable ? unstableBadge() : '',
      section.isNew ? newBadge() : '',
    ].join('');
  }

  const codeText = (value) => (Array.isArray(value) ? value.join('\n') : String(value || ''));

  function makeCodeBlock(code, withCopy = true) {
    const block = document.createElement('div');
    block.className = 'code-block';
    block.dataset.lang = 'MKS';

    if (withCopy) {
      const copy = document.createElement('button');
      copy.className = 'copy-btn';
      copy.type = 'button';
      copy.textContent = window.MKSSiteI18n?.get('copy.default', 'Copy');
      block.append(copy);
    }

    const pre = document.createElement('pre');
    const codeEl = document.createElement('code');
    codeEl.textContent = codeText(code);
    pre.append(codeEl);
    block.append(pre);

    return block;
  }

  function appendRichContent(parent, section) {
    if (Array.isArray(section.points) && section.points.length) {
      const list = document.createElement('ul');
      list.className = 'docs-points';
      section.points.forEach((item) => {
        const point = document.createElement('li');
        point.innerHTML = item;
        list.append(point);
      });
      parent.append(list);
    }

    if (section.warning) {
      const warning = document.createElement('p');
      warning.className = 'docs-callout warning';
      warning.innerHTML = section.warning;
      parent.append(warning);
    }

    if (section.source) {
      const source = document.createElement('p');
      source.className = 'docs-source';
      source.innerHTML = section.source;
      parent.append(source);
    }
  }

  function renderHero(hero) {
    const header = document.createElement('header');
    header.className = 'panel glass glimmer docs-hero';
    header.id = hero.id || 'overview';

    const scene = document.createElement('div');
    scene.className = 'docs-hero-scene';
    scene.setAttribute('aria-hidden', 'true');
    scene.innerHTML = [
      '<span></span><span></span><span></span>',
      '<i></i><i></i><i></i><i></i>',
      '<b></b><b></b>'
    ].join('');

    const eyebrow = document.createElement('p');
    eyebrow.className = 'eyebrow';
    eyebrow.textContent = hero.eyebrow || 'Docs';

    const meta = document.createElement('div');
    meta.className = 'docs-hero-meta';
    meta.innerHTML = `${iconMarkup(hero.icon)}<span>${hero.meta || 'Reference based on current interpreter branch'}</span>`;

    const title = document.createElement('h1');
    title.textContent = hero.title || 'Docs';

    const description = document.createElement('p');
    description.className = 'sub';
    description.textContent = hero.description || '';

    const pills = document.createElement('div');
    pills.className = 'docs-hero-pills';
    (hero.tags || []).forEach((item) => {
      const tag = document.createElement('span');
      const data = typeof item === 'string' ? { label: item } : item;
      tag.className = data.live ? 'tag live' : 'tag';
      tag.textContent = data.label;
      pills.append(tag);
    });

    const terminal = document.createElement('div');
    terminal.className = 'docs-mini-terminal';
    terminal.innerHTML = [
      '<div><span>$</span> mks docs --open</div>',
      '<div><span>></span> syntax loaded</div>',
      '<div><span>></span> runtime notes ready</div>'
    ].join('');

    header.append(scene, eyebrow, meta, title, description, pills, terminal);
    return header;
  }

  function renderTabbedSection(section) {
    const el = document.createElement('section');
    el.className = 'panel glimmer';
    el.id = section.id;
    el.dataset.docsCard = '';

    const title = document.createElement('div');
    title.className = 'docs-section-head';
    title.innerHTML = `
      <div class="docs-section-title">
        ${iconMarkup(section.icon)}
        <h2>${section.title}</h2>
      </div>
      ${statusBadges(section)}
    `;

    const description = document.createElement('p');
    description.className = 'sub';
    description.innerHTML = section.description || '';

    const tabs = document.createElement('div');
    tabs.className = 'tabs';

    const panes = document.createDocumentFragment();
    section.tabs.forEach((tab, index) => {
      const button = document.createElement('button');
      button.className = index === 0 ? 'tab active' : 'tab';
      button.type = 'button';
      button.dataset.tab = tab.id;
      button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      button.textContent = tab.label;
      tabs.append(button);

      const pane = document.createElement('div');
      pane.className = index === 0 ? 'tab-pane active' : 'tab-pane';
      pane.dataset.tabPane = tab.id;
      pane.hidden = index !== 0;
      const codeBlock = makeCodeBlock(tab.code);
      codeBlock.dataset.lang = tab.label || tab.id || 'code';
      pane.append(codeBlock);

      if (Array.isArray(tab.steps) && tab.steps.length) {
        const steps = document.createElement('ol');
        steps.className = 'docs-steps';
        tab.steps.forEach((item) => {
          const step = document.createElement('li');
          step.innerHTML = item;
          steps.append(step);
        });
        pane.append(steps);
      }

      if (tab.note) {
        const note = document.createElement('p');
        note.className = 'docs-callout';
        note.innerHTML = tab.note;
        pane.append(note);
      }

      panes.append(pane);
    });

    el.append(title, description);
    appendRichContent(el, section);
    el.append(tabs, panes);
    return el;
  }

  function renderPlainSection(section) {
    if (section.python) {
      return renderTabbedSection({
        ...section,
        tabs: [
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
          },
        ],
      });
    }

    const el = document.createElement('section');
    el.className = 'panel glimmer';
    el.id = section.id;
    el.dataset.docsCard = '';

    const title = document.createElement('div');
    title.className = 'docs-section-head';
    title.innerHTML = `
      <div class="docs-section-title">
        ${iconMarkup(section.icon)}
        <h2>${section.title}</h2>
      </div>
      ${statusBadges(section)}
    `;

    const description = document.createElement('p');
    description.className = 'sub';
    description.innerHTML = section.description || '';

    el.append(title, description);
    appendRichContent(el, section);
    if (section.code) el.append(makeCodeBlock(section.code));

    return el;
  }

  function renderTabs() {
    document.querySelectorAll('.tabs').forEach((tabset) => {
      const tabs = Array.from(tabset.querySelectorAll('.tab'));
      const panel = tabset.closest('.panel');
      if (!panel || !tabs.length) return;

      const panes = Array.from(panel.querySelectorAll('.tab-pane'));
      if (!panes.length) return;

      function activate(name) {
        tabs.forEach((tab) => {
          const isActive = tab.dataset.tab === name;
          tab.classList.toggle('active', isActive);
          tab.setAttribute('aria-selected', String(isActive));
        });

        panes.forEach((pane) => {
          const isActive = pane.dataset.tabPane === name;
          pane.classList.toggle('active', isActive);
          pane.hidden = !isActive;
        });
      }

      const initial = tabset.querySelector('.tab.active')?.dataset.tab || tabs[0]?.dataset.tab;
      if (initial) activate(initial);

      tabs.forEach((tab) => {
        tab.addEventListener('click', () => activate(tab.dataset.tab));
      });
    });
  }

  async function render() {
    const lang = window.MKSSiteI18n?.getLanguage?.() || 'en';
    const path = lang === 'ru' ? 'assets/data/docs.ru.json?v=20260426-docs-ru-1' : 'assets/data/docs.json?v=20260423-docs-data-1';
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Docs data request failed: ${response.status}`);

    const docs = await response.json();
    const sections = docs.sections || [];

    sidebar.replaceChildren();
    body.replaceChildren();

    const overview = document.createElement('a');
    overview.href = `#${docs.hero?.id || 'overview'}`;
    overview.innerHTML = `${iconMarkup(docs.hero?.icon)}<span>${escapeHtml(window.MKSSiteI18n?.get('docs.overview', 'Overview'))}</span>`;
    sidebar.append(overview);

    const sectionById = new Map(sections.map((section) => [section.id, section]));
    const navigation = Array.isArray(docs.navigation) && docs.navigation.length
      ? docs.navigation
      : [{ title: '', sections: sections.map((section) => section.id) }];

    navigation.forEach((group) => {
      const groupSections = (group.sections || [])
        .map((id) => sectionById.get(id))
        .filter(Boolean);
      if (!groupSections.length) return;

      if (group.title) {
        const heading = document.createElement('p');
        heading.className = 'sidebar-heading';
        heading.textContent = group.title;
        sidebar.append(heading);
      }

      groupSections.forEach((section) => {
        const link = document.createElement('a');
        link.href = `#${section.id}`;
        const sidebarBadge = section.isNew
          ? `<em class="sidebar-badge sidebar-badge-new">${escapeHtml(window.MKSSiteI18n?.get('docs.new', 'New'))}</em>`
          : section.unstable
            ? `<em>${escapeHtml(window.MKSSiteI18n?.get('docs.unstable', 'Not-Stable'))}</em>`
            : '';
        link.innerHTML = `${iconMarkup(section.icon)}<span>${section.nav || section.title}</span>${sidebarBadge}`;
        sidebar.append(link);
      });
    });

    body.append(renderHero(docs.hero || {}));
    sections.forEach((section) => {
      body.append(section.tabs ? renderTabbedSection(section) : renderPlainSection(section));
    });

    renderTabs();
    window.dispatchEvent(new CustomEvent('docs:ready'));
  }

  try {
    await render();
  } catch (error) {
    body.innerHTML = `<section class="panel glimmer docs-loading">${escapeHtml(window.MKSSiteI18n?.get('docs.failed', 'Docs failed to load.'))}</section>`;
    console.error(error);
  }

  document.addEventListener('mks:language-change', async () => {
    try {
      await render();
    } catch (error) {
      console.error('Docs rerender error:', error);
    }
  });

  function escapeHtml(str) {
    return String(str ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
})();
