document.addEventListener('DOMContentLoaded', () => {
  initHeroTerminal();
});

function initHeroTerminal() {
  const term = document.querySelector('[data-terminal]');
  if (!term) return;

  const lines = [
    'mks run observe.mks',
    'load module ... ok',
    'attach watch x ... attached',
    'gc pass #12 ... 6 freed',
    'event -> "x changed"',
    'defer queue -> "closing"',
    'exit in 38ms'
  ];

  let index = 0;

  function render() {
    const previous = lines
      .slice(0, index)
      .map((line) => formatLine(line))
      .join('');

    const current = index < lines.length
      ? `<div class="term-line">${formatLine(lines[index], true)}</div>`
      : '';

    term.innerHTML = previous + current;

    index += 1;

    if (index > lines.length) {
      setTimeout(() => {
        index = 0;
        render();
      }, 1200);
      return;
    }

    setTimeout(render, 850);
  }

  render();
}

function formatLine(text, withCursor = false) {
  const escaped = escapeHtml(text)
    .replace(/^mks run/, '<span class="prompt">$</span> mks run')
    .replace(/\bok\b/g, '<span class="green">ok</span>')
    .replace(/attached/g, '<span class="accent">attached</span>')
    .replace(/6 freed/g, '<span class="accent">6 freed</span>')
    .replace(/"x changed"/g, '<span class="accent">"x changed"</span>')
    .replace(/"closing"/g, '<span class="accent">"closing"</span>');

  return `${escaped}${withCursor ? '<span class="cursor"></span>' : ''}`;
}

function escapeHtml(str) {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}
