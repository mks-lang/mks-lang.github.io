document.addEventListener('DOMContentLoaded', function() {
  initHeroTerminal();
});

function initHeroTerminal() {
  var term = document.querySelector('[data-terminal]');
  if (!term) return;

  var lines = [
    'mks run observe.mks',
    'load module ... ok',
    'attach watch x ... attached',
    'gc pass #12 ... 6 freed',
    'event -> "x changed"',
    'defer queue -> "closing"',
    'exit in 38ms'
  ];

  var index = 0;

  function render() {
    var previous = lines
      .slice(0, index)
      .map(function(line) { return formatLine(line); })
      .join('');

    var current = index < lines.length
      ? '<div class="term-line">' + formatLine(lines[index], true) + '</div>'
      : '';

    term.innerHTML = previous + current;

    index += 1;

    if (index > lines.length) {
      setTimeout(function() {
        index = 0;
        render();
      }, 1200);
      return;
    }

    setTimeout(render, 850);
  }

  render();
}

function formatLine(text, withCursor) {
  var escaped = escapeHtml(text)
    .replace(/^mks run/, '<span class="prompt">$</span> mks run')
    .replace(/\bok\b/g, '<span class="green">ok</span>')
    .replace(/attached/g, '<span class="accent">attached</span>')
    .replace(/6 freed/g, '<span class="accent">6 freed</span>')
    .replace(/"x changed"/g, '<span class="accent">"x changed"</span>')
    .replace(/"closing"/g, '<span class="accent">"closing"</span>');

  return escaped + (withCursor ? '<span class="cursor"></span>' : '');
}

function escapeHtml(str) {
  var s = str === null || str === undefined ? '' : String(str);
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
