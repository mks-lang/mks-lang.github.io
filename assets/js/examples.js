;(function staggerExampleCards() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  var cards = document.querySelectorAll('.example-card');
  for (var i = 0; i < cards.length; i++) {
    (function(card, idx) {
      card.style.animationDelay = (idx % 6) * 0.08 + 's';
    })(cards[i], i);
  }

  var count = document.querySelector('[data-example-count]');
  if (count) count.textContent = String(cards.length);
})();

;(function initExampleFilters() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  var chips = document.querySelectorAll('.filter-chip');
  var cards = document.querySelectorAll('.example-card, .featured-card');
  var search = document.querySelector('[data-example-search]');
  var count = document.querySelector('[data-example-count]');

  if (!chips.length || !cards.length) return;

  var activeFilter = 'all';
  var query = '';

  function cardText(card) {
    return card.textContent.toLowerCase();
  }

  function applyFilters() {
    var visibleCount = 0;
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var kind = card.dataset.kind;
      var matchesKind = activeFilter === 'all' || kind === activeFilter;
      var matchesQuery = !query || cardText(card).indexOf(query) !== -1;
      var isVisible = matchesKind && matchesQuery;
      card.classList.toggle('hidden', !isVisible);
      if (isVisible) visibleCount++;
    }

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

  for (var j = 0; j < chips.length; j++) {
    (function(chip) {
      chip.addEventListener('click', function() {
        for (var k = 0; k < chips.length; k++) {
          var c = chips[k];
          c.classList.remove('active');
          c.setAttribute('aria-pressed', 'false');
        }
        chip.classList.add('active');
        chip.setAttribute('aria-pressed', 'true');

        activeFilter = chip.dataset.filter;
        applyFilters();
      });
    })(chips[j]);
  }

  if (search) {
    search.addEventListener('input', function() {
      query = search.value.trim().toLowerCase();
      applyFilters();
    });
  }
})();

;(function animateExamplesTerminal() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  var root = document.querySelector('[data-examples-terminal]');
  if (!root) return;

  var lines = [
    '$ mks examples/showcase.mks',
    'loading std/math... ok',
    'binding watcher... ok',
    'running tests... pass',
    'entity User... ok',
    'extend array... ok',
    'done in 34ms'
  ];

  var index = 0;

  function colorize(line) {
    return line
      .replace(/\$/g, '<span class="prompt">$</span>')
      .replace(/ok/g, '<span class="green">ok</span>')
      .replace(/pass/g, '<span class="green">pass</span>');
  }

  function draw() {
    var shown = lines.slice(0, index + 1)
      .map(function(line) {
        return '<div class="term-line">' + colorize(line) + '</div>';
      })
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

    setTimeout(draw, 620);
  }

  draw();
})();
