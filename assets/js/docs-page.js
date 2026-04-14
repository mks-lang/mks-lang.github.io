(async function initDocsPage() {
  const sidebar = document.querySelector('[data-docs-sidebar]');
  const body = document.querySelector('[data-docs-body]');
  if (!sidebar || !body) return;

  const codeText = (value) => (Array.isArray(value) ? value.join('\n') : String(value || ''));

  function makeCodeBlock(code, withCopy = true) {
    const block = document.createElement('div');
    block.className = 'code-block';

    if (withCopy) {
      const copy = document.createElement('button');
      copy.className = 'copy-btn';
      copy.type = 'button';
      copy.textContent = 'Copy';
      block.append(copy);
    }

    const pre = document.createElement('pre');
    const codeEl = document.createElement('code');
    codeEl.textContent = codeText(code);
    pre.append(codeEl);
    block.append(pre);

    return block;
  }

  function renderHero(hero) {
    const header = document.createElement('header');
    header.className = 'panel glass glimmer docs-hero';
    header.id = hero.id || 'overview';

    const scene = document.createElement('div');
    scene.className = 'docs-hero-scene';
    scene.setAttribute('aria-hidden', 'true');
    scene.innerHTML = '<span></span><span></span><span></span>';

    const eyebrow = document.createElement('p');
    eyebrow.className = 'eyebrow';
    eyebrow.textContent = hero.eyebrow || 'Docs';

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

    header.append(scene, eyebrow, title, description, pills, terminal);
    return header;
  }

  function renderTabbedSection(section) {
    const el = document.createElement('section');
    el.className = 'panel glimmer';
    el.id = section.id;
    el.dataset.docsCard = '';

    const title = document.createElement('h2');
    title.textContent = section.title;

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
      pane.append(makeCodeBlock(tab.code));

      if (tab.note) {
        const note = document.createElement('p');
        note.className = 'sub note';
        note.innerHTML = tab.note;
        pane.append(note);
      }

      panes.append(pane);
    });

    el.append(title, description, tabs, panes);
    return el;
  }

  function renderPlainSection(section) {
    const el = document.createElement('section');
    el.className = 'panel glimmer';
    el.id = section.id;
    el.dataset.docsCard = '';

    const title = document.createElement('h2');
    title.textContent = section.title;

    const description = document.createElement('p');
    description.className = 'sub';
    description.innerHTML = section.description || '';

    el.append(title, description);
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

  try {
    const response = await fetch('assets/data/docs.json?v=20260414-3', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Docs data request failed: ${response.status}`);

    const docs = await response.json();
    const sections = docs.sections || [];

    sidebar.replaceChildren();
    body.replaceChildren();

    const overview = document.createElement('a');
    overview.href = `#${docs.hero?.id || 'overview'}`;
    overview.textContent = 'Overview';
    sidebar.append(overview);

    sections.forEach((section) => {
      const link = document.createElement('a');
      link.href = `#${section.id}`;
      link.textContent = section.nav || section.title;
      sidebar.append(link);
    });

    body.append(renderHero(docs.hero || {}));
    sections.forEach((section) => {
      body.append(section.tabs ? renderTabbedSection(section) : renderPlainSection(section));
    });

    renderTabs();
    window.dispatchEvent(new CustomEvent('docs:ready'));
  } catch (error) {
    body.innerHTML = '<section class="panel glimmer docs-loading">Docs failed to load.</section>';
    console.error(error);
  }
})();
