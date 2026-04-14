document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.querySelector('[data-heap-canvas]');
  const astRoot = document.querySelector('[data-ast-tree]');
  const logRoot = document.querySelector('[data-log]');
  const phase = document.querySelector('[data-phase]');
  const detail = document.querySelector('[data-detail]');
  const heapCount = document.querySelector('[data-heap-count]');
  if (!canvas || !astRoot || !logRoot) return;

  const ctx = canvas.getContext('2d');
  let mode = 'idle';
  let tick = 0;

  const objects = [
    { id: 'env', label: 'env', x: 0.14, y: 0.24, root: true, marked: true },
    { id: 'root', label: 'root', x: 0.42, y: 0.22, marked: true },
    { id: 'leaf', label: 'leaf', x: 0.68, y: 0.36, marked: true },
    { id: 'watch', label: 'watch:x', x: 0.34, y: 0.68, marked: true },
    { id: 'temp', label: 'temp', x: 0.74, y: 0.72, marked: false, garbage: true }
  ];

  const edges = [
    ['env', 'root'],
    ['root', 'leaf'],
    ['env', 'watch']
  ];

  const astRows = [
    ['Program'],
    ['WatchDecl', 'VarDecl', 'Assign'],
    ['Identifier:x', 'Entity(root)', 'Member:child', 'Null(temp)'],
    ['OnChange', 'GC Candidate']
  ];

  function log(text) {
    const line = document.createElement('div');
    line.className = 'log-line';
    line.innerHTML = `<span>></span> ${text}`;
    logRoot.prepend(line);
  }

  function setPhase(name, text) {
    mode = name;
    if (phase) phase.textContent = name[0].toUpperCase() + name.slice(1);
    if (detail) detail.textContent = text;
  }

  function renderAst(activeMode = 'idle') {
    astRoot.replaceChildren();
    astRows.forEach((row) => {
      const rowEl = document.createElement('div');
      rowEl.className = 'ast-row';
      row.forEach((name) => {
        const node = document.createElement('span');
        node.className = 'ast-node';
        if (activeMode === 'mark' && !name.includes('Null') && !name.includes('Candidate')) {
          node.classList.add('active');
        }
        if (activeMode === 'sweep' && (name.includes('Null') || name.includes('Candidate'))) {
          node.classList.add('active', 'sweep');
        }
        node.textContent = name;
        rowEl.append(node);
      });
      astRoot.append(rowEl);
    });
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    ctx.clearRect(0, 0, width, height);

    tick += 0.018;
    const byId = Object.fromEntries(objects.map((obj) => [obj.id, obj]));

    edges.forEach(([from, to]) => {
      const a = byId[from];
      const b = byId[to];
      ctx.beginPath();
      ctx.moveTo(a.x * width, a.y * height);
      ctx.lineTo(b.x * width, b.y * height);
      ctx.strokeStyle = 'rgba(109,242,197,0.34)';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    objects.forEach((obj, index) => {
      const x = obj.x * width;
      const y = obj.y * height + Math.sin(tick * 2 + index) * 4;
      const active = mode === 'mark' && obj.marked;
      const sweeping = mode === 'sweep' && obj.garbage;
      const radius = obj.root ? 30 : 26;

      ctx.beginPath();
      ctx.arc(x, y, radius + (active ? Math.sin(tick * 8) * 3 + 5 : 0), 0, Math.PI * 2);
      ctx.fillStyle = sweeping
        ? 'rgba(255,123,186,0.2)'
        : active
          ? 'rgba(109,242,197,0.2)'
          : 'rgba(122,162,255,0.12)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = obj.garbage && mode === 'sweep'
        ? 'rgba(255,123,186,0.34)'
        : obj.marked && mode !== 'idle'
          ? 'rgba(109,242,197,0.28)'
          : 'rgba(15,22,39,0.94)';
      ctx.strokeStyle = obj.garbage
        ? 'rgba(255,123,186,0.72)'
        : obj.marked
          ? 'rgba(109,242,197,0.72)'
          : 'rgba(122,162,255,0.5)';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f6f8ff';
      ctx.font = '700 12px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(obj.label, x, y);
    });

    requestAnimationFrame(draw);
  }

  function runCycle() {
    setPhase('mark', 'Roots trace env -> root -> leaf and watch handlers.');
    renderAst('mark');
    log('mark roots: env, root, watch:x');

    setTimeout(() => {
      setPhase('sweep', 'temp is unreachable and gets collected.');
      renderAst('sweep');
      log('sweep garbage: temp freed');
    }, 1100);

    setTimeout(() => {
      setPhase('idle', 'Cycle complete. Heap is stable.');
      renderAst('idle');
      log('gc pass complete: 1 object freed');
    }, 2200);
  }

  document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      if (action === 'run') runCycle();
      if (action === 'mark') {
        setPhase('mark', 'Reachable objects are highlighted from the root set.');
        renderAst('mark');
        log('manual mark pass');
      }
      if (action === 'sweep') {
        setPhase('sweep', 'Unreachable heap nodes are highlighted for collection.');
        renderAst('sweep');
        log('manual sweep pass');
      }
      if (action === 'reset') {
        setPhase('idle', 'Ready to inspect roots, heap, and AST.');
        renderAst('idle');
        log('reset playground');
      }
    });
  });

  if (heapCount) heapCount.textContent = `${objects.length} objects`;
  resize();
  renderAst();
  log('playground ready');
  draw();
  window.addEventListener('resize', resize);
});
