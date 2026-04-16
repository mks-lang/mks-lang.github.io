(function renderSiteHeader() {
  const navItems = [
    { href: 'index.html', label: 'Home' },
    { href: 'examples.html', label: 'Examples' },
    { href: 'docs.html', label: 'Docs' },
    { href: 'playground.html', label: 'Playground' },
    { href: 'roadmap.html', label: 'Roadmap' },
    { href: 'changelog.html', label: 'Changelog' },
  ];

  const github = {
    href: 'https://github.com/mks-lang/MKS-interpreter',
    label: 'GitHub',
  };

  const nav = document.createElement('nav');
  nav.className = 'navbar';
  nav.innerHTML = `
    <div class="nav-inner">
      <a class="logo" href="index.html" aria-label="MKS home">
        <span class="logo-mark" aria-hidden="true"></span>
        <span class="logo-text">
          <strong>MKS</strong>
          <small>language</small>
        </span>
      </a>

      <div class="nav-links">
        ${navItems.map((item) => `<a href="${item.href}">${item.label}</a>`).join('')}
        <a class="nav-github" href="${github.href}" target="_blank" rel="noreferrer">${github.label}</a>
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
        ${navItems.map((item) => `<a href="${item.href}">${item.label}</a>`).join('')}
        <a href="${github.href}" target="_blank" rel="noreferrer">${github.label}</a>
      </div>
    </div>
  `;

  const main = document.querySelector('main');
  document.body.insertBefore(nav, main || document.body.firstChild);
})();
