(function staggerExampleCards() {
  document.querySelectorAll('.example-card').forEach((card, idx) => {
    card.style.animationDelay = `${(idx % 6) * 0.08}s`;
  });
})();

(function initExampleFilters() {
  const chips = document.querySelectorAll('.filter-chip');
  const cards = document.querySelectorAll('.example-card, .featured-card');

  if (!chips.length || !cards.length) return;

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');

      const filter = chip.dataset.filter;

      cards.forEach((card) => {
        const kind = card.dataset.kind;
        const show = filter === 'all' || kind === filter;
        card.classList.toggle('hidden', !show);
      });
    });
  });
})();

(function animateExamplesTerminal() {
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
      .replace('$', '<span class="prompt">$</span>')
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