;(function initSiteHeader() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  var navItems = [
    { label: 'Home', key: 'nav.home', href: 'index.html', icon: 'home-01' },
    { label: 'Examples', key: 'nav.examples', href: 'examples.html', icon: 'grid-view' },
    { label: 'Docs', key: 'nav.docs', href: 'docs.html', icon: 'book-open-01' },
    { label: 'Playground', key: 'nav.playground', href: 'playground.html', icon: 'game-controller-01' },
    { label: 'Roadmap', key: 'nav.roadmap', href: 'roadmap.html', icon: 'direction-left-01' },
    { label: 'Changelog', key: 'nav.changelog', href: 'changelog.html', icon: 'property-update' }
  ];

  var github = {
    label: 'GitHub',
    key: 'nav.github',
    href: 'https://github.com/mks-lang/MKS-interpreter'
  };

  var nav = document.createElement('nav');
  nav.className = 'navbar';
  nav.innerHTML = [
    '<div class="nav-inner">',
      '<a href="index.html" class="logo">',
        '<div class="logo-mark"></div>',
        '<div class="logo-text">',
          '<strong>MKS</strong>',
          '<small>Language</small>',
        '</div>',
      '</a>',
      '<div class="nav-links">',
        navItems.map(function(item) {
          return '<a href="' + item.href + '" data-i18n="' + item.key + '">' + item.label + '</a>';
        }).join(''),
        '<a href="' + github.href + '" class="nav-github" data-i18n="' + github.key + '">' + github.label + '</a>',
      '</div>',
      '<div class="nav-mobile">',
        '<div class="nav-language">',
          '<select data-language-select aria-label="Select language">',
            '<option value="en">EN</option>',
            '<option value="ru">RU</option>',
          '</select>',
        '</div>',
        '<button class="burger" aria-label="Toggle menu" aria-expanded="false" aria-controls="mobile-menu">',
          '<div class="burger-lines">',
            '<span></span><span></span><span></span>',
          '</div>',
        '</button>',
      '</div>',
    '</div>',
    '<div class="mobile-menu" id="mobile-menu" aria-hidden="true">',
      '<div class="mobile-menu-header">',
        '<div class="mobile-menu-title">Menu</div>',
      '</div>',
      '<div class="mobile-menu-nav">',
        navItems.map(function(item) {
          return '<a href="' + item.href + '"><i class="hgi-stroke hgi-' + item.icon + '" aria-hidden="true"></i><span data-i18n="' + item.key + '">' + item.label + '</span></a>';
        }).join(''),
      '</div>',
      '<div class="mobile-menu-footer">',
        '<div class="nav-language mobile-language">',
          '<select data-language-select aria-label="Select language">',
            '<option value="en">English</option>',
            '<option value="ru">Русский</option>',
          '</select>',
        '</div>',
        '<a href="' + github.href + '" class="mobile-github-btn">',
          '<i class="hgi-stroke hgi-github" aria-hidden="true"></i>',
          '<span data-i18n="' + github.key + '">' + github.label + '</span>',
        '</a>',
      '</div>',
    '</div>'
  ].join('');

  document.body.insertBefore(nav, document.body.firstChild);

  var main = document.querySelector('main');
  if (main) {
    var skip = document.createElement('a');
    skip.href = '#main-content';
    skip.className = 'skip-link';
    skip.dataset.i18n = 'nav.skip';
    skip.textContent = 'Skip to content';
    document.body.insertBefore(skip, document.body.firstChild);
  }
})();
