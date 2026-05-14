;(function initDocsEnhancements() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  var docsEnhancementState = {
    cleanup: null
  };

  function initCards() {
    var panels = document.querySelectorAll('.panel');
    for (var i = 0; i < panels.length; i++) {
      panels[i].style.animationDelay = (i * 0.05) + 's';
    }

    var cardCleanups = [];
    var cards = document.querySelectorAll('[data-docs-card]');
    for (var j = 0; j < cards.length; j++) {
      (function(panel) {
        var onPointerMove = function(event) {
          var rect = panel.getBoundingClientRect();
          var x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
          var y = Math.max(0, Math.min(rect.height, event.clientY - rect.top));
          panel.style.setProperty('--x', x + 'px');
          panel.style.setProperty('--y', y + 'px');
        };
        var onPointerLeave = function() {
          panel.style.setProperty('--x', '-1000px');
          panel.style.setProperty('--y', '-1000px');
        };
        panel.addEventListener('pointermove', onPointerMove);
        panel.addEventListener('pointerleave', onPointerLeave);
        cardCleanups.push(function() {
          panel.removeEventListener('pointermove', onPointerMove);
          panel.removeEventListener('pointerleave', onPointerLeave);
        });
      })(cards[j]);
    }

    var observer = null;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(function(entries) {
        for (var k = 0; k < entries.length; k++) {
          var entry = entries[k];
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        }
      }, { threshold: 0.1 });
      for (var l = 0; l < cards.length; l++) {
        observer.observe(cards[l]);
      }
    }

    docsEnhancementState.cleanup = function() {
      for (var m = 0; m < cardCleanups.length; m++) {
        cardCleanups[m]();
      }
      if (observer) observer.disconnect();
    };
  }

  var docsSidebarState = {
    cleanup: null
  };

  function initSidebar() {
    var sidebar = document.querySelector('.sidebar');
    var links = Array.prototype.slice.call(document.querySelectorAll('.sidebar a'));
    if (!sidebar || !links.length) return;

    var sections = [];
    for (var i = 0; i < links.length; i++) {
      var sec = document.querySelector(links[i].getAttribute('href'));
      if (sec) sections.push(sec);
    }

    var sidebarScrollTarget = sidebar.scrollTop;
    var sidebarScrollFrame = null;
    var userSidebarLockUntil = 0;

    function lockSidebarAutoScroll(ms) {
      userSidebarLockUntil = Date.now() + ms;
    }

    function smoothScrollSidebar() {
      if (sidebarScrollFrame) return;
      var step = function() {
        var current = sidebar.scrollTop;
        var delta = sidebarScrollTarget - current;
        if (Math.abs(delta) < 0.5) {
          sidebar.scrollTop = sidebarScrollTarget;
          sidebarScrollFrame = null;
          return;
        }
        sidebar.scrollTop = current + delta * 0.12;
        sidebarScrollFrame = requestAnimationFrame(step);
      };
      sidebarScrollFrame = requestAnimationFrame(step);
    }

    function syncSidebar() {
      if (Date.now() < userSidebarLockUntil) return;
      var activeLink = sidebar.querySelector('a.active');
      if (!activeLink) return;

      var sidebarBox = sidebar.getBoundingClientRect();
      var linkBox = activeLink.getBoundingClientRect();
      var offset = linkBox.top - sidebarBox.top + sidebar.scrollTop;

      if (window.innerWidth <= 960) {
        var targetLeft = activeLink.offsetLeft - (sidebar.clientWidth - activeLink.offsetWidth) / 2;
        sidebar.scrollLeft = targetLeft;
      } else {
        var linkTop = activeLink.offsetTop;
        var linkBottom = linkTop + activeLink.offsetHeight;
        var visibleTop = sidebar.scrollTop;
        var visibleBottom = visibleTop + sidebar.clientHeight;
        var padding = 12;

        if (linkTop < visibleTop + padding) {
          sidebarScrollTarget = Math.max(0, linkTop - padding);
          smoothScrollSidebar();
        } else if (linkBottom > visibleBottom - padding) {
          sidebarScrollTarget = linkBottom - sidebar.clientHeight + padding;
          smoothScrollSidebar();
        }
      }
    }

    function updateActiveSection() {
      var viewportLine = window.innerHeight * 0.44;
      var pageBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
      var current = pageBottom ? sections[sections.length - 1] : sections[0];
      var closestDistance = Number.POSITIVE_INFINITY;

      if (!pageBottom) {
        for (var i = 0; i < sections.length; i++) {
          var section = sections[i];
          var rect = section.getBoundingClientRect();
          var distance = Math.abs(rect.top - viewportLine);
          if (rect.top < viewportLine && distance < closestDistance) {
            closestDistance = distance;
            current = section;
          }
        }
      }

      if (current) {
        var hash = '#' + current.id;
        for (var j = 0; j < links.length; j++) {
          var link = links[j];
          var isActive = link.getAttribute('href') === hash;
          link.classList.toggle('active', isActive);
          if (isActive) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        }
        syncSidebar();
      }
    }

    var ticking = false;
    function requestSync() {
      if (!ticking) {
        requestAnimationFrame(function() {
          updateActiveSection();
          ticking = false;
        });
        ticking = true;
      }
    }

    var onPointerDown = function() { lockSidebarAutoScroll(1800); };
    var onMouseDown = function() { lockSidebarAutoScroll(1800); };
    var onWheel = function() { lockSidebarAutoScroll(900); };
    var onScroll = function() { requestSync(); };
    var onResize = function() { requestSync(); };
    var onHashChange = function() {
      requestSync();
      var activeLink = null;
      for (var k = 0; k < links.length; k++) {
        if (links[k].classList.contains('active')) {
          activeLink = links[k];
          break;
        }
      }
      if (activeLink) lockSidebarAutoScroll(2000);
    };

    sidebar.addEventListener('pointerdown', onPointerDown);
    sidebar.addEventListener('mousedown', onMouseDown);
    sidebar.addEventListener('wheel', onWheel);
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onResize);
    window.addEventListener('hashchange', onHashChange);

    var linkCleanups = links.map(function(link) {
      var onClick = function(event) {
        var section = document.querySelector(link.getAttribute('href'));
        if (section) {
          event.preventDefault();
          lockSidebarAutoScroll(3000);
          window.scrollTo({
            top: section.offsetTop - 100,
            behavior: 'smooth'
          });
          history.pushState(null, null, link.getAttribute('href'));
          updateActiveSection();
        }
      };
      link.addEventListener('click', onClick);
      return function() { link.removeEventListener('click', onClick); };
    });

    docsSidebarState.cleanup = function() {
      sidebar.removeEventListener('pointerdown', onPointerDown);
      sidebar.removeEventListener('mousedown', onMouseDown);
      sidebar.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('hashchange', onHashChange);
      for (var l = 0; l < linkCleanups.length; l++) {
        linkCleanups[l]();
      }
    };

    updateActiveSection();
  }

  window.addEventListener('docs:ready', function() {
    if (docsEnhancementState.cleanup) docsEnhancementState.cleanup();
    if (docsSidebarState.cleanup) docsSidebarState.cleanup();
    initCards();
    initSidebar();
  });
})();
