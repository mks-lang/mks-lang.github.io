;(function staggerExampleCards() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  var cards = document.querySelectorAll('.example-card');
  cards.forEach(function(card, idx) {
    card.style.animationDelay = (idx % 6) * 0.08 + 's';
  });

  var count = document.querySelector('[data-example-count]');
  if (count) count.textContent = String(cards.length);
})();

;(function initExampleFilters() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  var chips = document.querySelectorAll('.filter-chip');
  var cards = document.querySelectorAll('.example-card, .featured-card');
  var search = document.querySelector('[data-example-search]');
  var clearBtn = document.querySelector('[data-example-search-clear]');
  var count = document.querySelector('[data-example-count]');

  if (!chips.length || !cards.length) return;

  var activeFilter = 'all';
  var query = '';

  function cardText(card) {
    return card.textContent.toLowerCase();
  }

  function applyFilters() {
    var visibleCount = 0;
    cards.forEach(function(card) {
      var kind = card.dataset.kind;
      var matchesKind = activeFilter === 'all' || kind === activeFilter;
      var matchesQuery = !query || cardText(card).indexOf(query) !== -1;
      var isVisible = matchesKind && matchesQuery;
      card.classList.toggle('hidden', !isVisible);
      if (isVisible) visibleCount++;
    });

    var empty = document.querySelector('.examples-empty');
    if (empty) {
      empty.classList.toggle('hidden', visibleCount > 0);
    }

    if (count) {
      var nextText = String(visibleCount);
      var changed = count.textContent !== nextText;
      count.textContent = nextText;
      if (changed) {
        try {
          count.classList.remove('count-pop');
          count.offsetWidth; // trigger reflow
          count.classList.add('count-pop');
          setTimeout(function() { count.classList.remove('count-pop'); }, 200);
        } catch (e) {}
      }
    }
  }

  chips.forEach(function(chip) {
    chip.addEventListener('click', function() {
      chips.forEach(function(c) {
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-pressed', 'true');

      activeFilter = chip.dataset.filter;
      applyFilters();
    });
  });

  if (search) {
    search.addEventListener('input', function() {
      query = search.value.trim().toLowerCase();
      if (clearBtn) clearBtn.hidden = !query;
      applyFilters();
    });
  }

  if (clearBtn && search) {
    clearBtn.addEventListener('click', function() {
      search.value = '';
      query = '';
      clearBtn.hidden = true;
      applyFilters();
      search.focus();
    });
  }
})();

;(function animateExamplesTerminal() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const root = document.querySelector('[data-examples-terminal]');
  if (!root) return;

  const lines = [
    '$ mks examples/showcase.mks',
    'loading std/math... ok',
    'binding watcher... ok',
    'running tests... pass',
    'entity User... ok',
    'extend array... ok',
    'done in 34ms'
  ];

  let index = 0;

  function colorize(line) {
    return line
      .replace(/\$/g, '<span class="prompt">$</span>')
      .replace(/ok/g, '<span class="green">ok</span>')
      .replace(/pass/g, '<span class="green">pass</span>');
  }

  function draw() {
    const shown = lines.slice(0, index + 1)
      .map((line) => `<div class="term-line">${colorize(line)}</div>`)
      .join('');

    root.innerHTML = shown;
    index++;

    if (index >= lines.length) {
      setTimeout(() => {
        index = 0;
        draw();
      }, 1300);
      return;
    }

    setTimeout(draw, 620);
  }

  draw();
})();
