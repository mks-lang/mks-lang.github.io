(function renderSiteHeader() {
  const navItems = [
    { href: 'index.html',    label: 'Home',       key: 'nav.home',       icon: 'home-01' },
    { href: 'examples.html', label: 'Examples',   key: 'nav.examples',   icon: 'code' },
    { href: 'docs.html',     label: 'Docs',       key: 'nav.docs',       icon: 'book-open-01' },
    { href: 'playground.html', label: 'Playground', key: 'nav.playground', icon: 'play' },
    { href: 'roadmap.html',  label: 'Roadmap',    key: 'nav.roadmap',    icon: 'road-01' },
    { href: 'changelog.html', label: 'Changelog', key: 'nav.changelog',  icon: 'time-02' },
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
        <div class="mobile-menu-header">
          <span class="mobile-menu-title">Navigation</span>
        </div>
        <div class="mobile-menu-nav">
          ${navItems.map((item) => `<a href="${item.href}" data-i18n="${item.key}"><i class="hgi-stroke hgi-${item.icon}" aria-hidden="true"></i><span>${item.label}</span></a>`).join('')}
        </div>
        <div class="mobile-menu-footer">
          <label class="nav-language mobile-language" aria-label="Language">
            <span class="sr-only" data-i18n="lang.label">Language</span>
            <select data-language-select>
              <option value="en">EN</option>
              <option value="ru">RU</option>
            </select>
          </label>
          <a class="mobile-github-btn" href="${github.href}" target="_blank" rel="noreferrer" data-i18n="${github.key}">
            <i class="hgi-stroke hgi-github" aria-hidden="true"></i>
            <span>${github.label}</span>
          </a>
        </div>
      </div>
    </div>
  `;

  const main = document.querySelector('main');
  document.body.insertBefore(nav, main || document.body.firstChild);

  const skip = document.createElement('a');
  skip.className = 'skip-link';
  skip.href = '#main-content';
  skip.dataset.i18n = 'nav.skip';
  skip.textContent = 'Skip to content';
  document.body.prepend(skip);
})();
