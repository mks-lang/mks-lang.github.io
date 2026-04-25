(function renderSiteHeader() {
  const navItems = [
    { href: 'index.html', label: 'Home', key: 'nav.home' },
    { href: 'examples.html', label: 'Examples', key: 'nav.examples' },
    { href: 'docs.html', label: 'Docs', key: 'nav.docs' },
    { href: 'playground.html', label: 'Playground', key: 'nav.playground' },
    { href: 'roadmap.html', label: 'Roadmap', key: 'nav.roadmap' },
    { href: 'changelog.html', label: 'Changelog', key: 'nav.changelog' },
  ];

  const github = {
    href: 'https://github.com/mks-lang/MKS-interpreter',
    label: 'GitHub',
    key: 'nav.github',
  };

  const nav = document.createElement('nav');
  nav.className = 'navbar';
  nav.innerHTML = `
    <div class="nav-inner">
      <a class="logo" href="index.html" aria-label="MKS home">
        <span class="logo-mark" aria-hidden="true"></span>
        <span class="logo-text">
          <strong>MKS</strong>
          <small data-i18n="brand.language">language</small>
        </span>
      </a>

      <div class="nav-links">
        ${navItems.map((item) => `<a href="${item.href}" data-i18n="${item.key}">${item.label}</a>`).join('')}
        <label class="nav-language" aria-label="Language">
          <span class="sr-only" data-i18n="lang.label">Language</span>
          <select data-language-select>
            <option value="en">EN</option>
            <option value="ru">RU</option>
          </select>
        </label>
        <a class="nav-github" href="${github.href}" target="_blank" rel="noreferrer" data-i18n="${github.key}">${github.label}</a>
      </div>

      <div class="nav-mobile">
        <button class="burger" type="button" aria-label="Open menu" aria-expanded="false">
          <span class="burger-lines">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      <div class="mobile-menu" aria-hidden="true">
        ${navItems.map((item) => `<a href="${item.href}" data-i18n="${item.key}">${item.label}</a>`).join('')}
        <div class="mobile-menu-controls">
          <label class="nav-language mobile-language" aria-label="Language">
            <span class="sr-only" data-i18n="lang.label">Language</span>
            <select data-language-select>
              <option value="en">EN</option>
              <option value="ru">RU</option>
            </select>
          </label>
        </div>
        <a href="${github.href}" target="_blank" rel="noreferrer" data-i18n="${github.key}">${github.label}</a>
      </div>
    </div>
  `;

  const main = document.querySelector('main');
  document.body.insertBefore(nav, main || document.body.firstChild);
})();
