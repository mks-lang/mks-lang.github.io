(function initReworking() {
  const root = document.querySelector('main');
  if (!root) return;

  function render() {
    const text = window.MKSSiteI18n?.get('roadmap.reworking', 'Reworking...') || 'Reworking...';
    root.innerHTML = `
      <div class="reworking-container">
        <div class="reworking-text">${text}</div>
        <div class="soft-spinner"></div>
      </div>
    `;
  }

  render();
  document.addEventListener('mks:language-change', render);
})();
