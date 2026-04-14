document.addEventListener('DOMContentLoaded', () => {
  initHeroTerminal();
  initTiltCards();
  initPointerGlow();
});

function initHeroTerminal() {
  const term = document.querySelector('[data-terminal]');
  if (!term) return;

  const lines = [
    'mks run observe.mks',
    'lexer... ok',
    'parser... ok',
    'attach watch x ... ok',
    'gc pass #12 ... 6 freed',
    'event -> "x changed 2"',
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
    .replace(/6 freed/g, '<span class="accent">6 freed</span>')
    .replace(/"x changed 2"/g, '<span class="accent">"x changed 2"</span>')
    .replace(/"closing"/g, '<span class="accent">"closing"</span>');

  return `${escaped}${withCursor ? '<span class="cursor"></span>' : ''}`;
}

function escapeHtml(str) {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function initTiltCards() {
  const cards = document.querySelectorAll('.tilt-card');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;

      const rotateY = (px - 0.5) * 8;
      const rotateX = (0.5 - py) * 8;

      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

function initPointerGlow() {
  const hero = document.querySelector('.hero-v2');
  if (!hero) return;

  const glow = document.createElement('div');
  glow.className = 'hero-pointer-glow';
  hero.appendChild(glow);

  Object.assign(glow.style, {
    position: 'absolute',
    width: '320px',
    height: '320px',
    borderRadius: '50%',
    pointerEvents: 'none',
    background: 'radial-gradient(circle, rgba(109,242,197,0.12), transparent 65%)',
    filter: 'blur(18px)',
    transform: 'translate(-50%, -50%)',
    zIndex: '1',
    opacity: '0',
    transition: 'opacity 180ms ease'
  });

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    glow.style.left = `${e.clientX - rect.left}px`;
    glow.style.top = `${e.clientY - rect.top}px`;
    glow.style.opacity = '1';
  });

  hero.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
  });
}
