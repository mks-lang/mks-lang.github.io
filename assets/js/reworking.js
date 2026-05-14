;(function initReworkingUI() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  var root = document.querySelector('main');
  if (!root) return;

  function applyReworking() {
    var nodes = document.querySelectorAll('.reworking-text');
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node.dataset.i18n === 'roadmap.reworking') {
        var text = (window.MKSSiteI18n && window.MKSSiteI18n.get) ? window.MKSSiteI18n.get('roadmap.reworking', 'Reworking...') : 'Reworking...';
        node.textContent = text;
      }
    }
  }

  applyReworking();
  document.addEventListener('mks:language-change', applyReworking);
})();
