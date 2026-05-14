;(function initPlayground() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  var canvas = document.querySelector('[data-heap-canvas]');
  var astRoot = document.querySelector('[data-ast-tree]');
  var logRoot = document.querySelector('[data-log]');
  var phase = document.querySelector('[data-phase]');
  var detail = document.querySelector('[data-detail]');
  var heapCount = document.querySelector('[data-heap-count]');

  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var mode = 'idle';
  var tick = 0;

  var objects = [
    { id: 1, x: 0.2, y: 0.3, root: true, marked: false, garbage: false },
    { id: 2, x: 0.4, y: 0.25, root: false, marked: false, garbage: false },
    { id: 3, x: 0.35, y: 0.55, root: false, marked: false, garbage: false },
    { id: 4, x: 0.65, y: 0.3, root: false, marked: false, garbage: true },
    { id: 5, x: 0.8, y: 0.6, root: false, marked: false, garbage: true }
  ];

  var edges = [[1, 2], [2, 3]];

  var astRows = [
    ['Program'],
    ['Block'],
    ['VarDecl', 'WatchStmt'],
    ['Assign', 'Expr']
  ];

  function log(msg) {
    if (!logRoot) return;
    var line = document.createElement('div');
    line.textContent = '> ' + msg;
    logRoot.appendChild(line);
    logRoot.scrollTop = logRoot.scrollHeight;
  }

  function setPhase(p, d) {
    mode = p;
    if (phase) phase.textContent = p.toUpperCase();
    if (detail) detail.textContent = d;
  }

  function renderAST() {
    if (!astRoot) return;
    while (astRoot.firstChild) astRoot.removeChild(astRoot.firstChild);
    for (var i = 0; i < astRows.length; i++) {
      var row = astRows[i];
      var rowEl = document.createElement('div');
      rowEl.className = 'ast-row';
      for (var j = 0; j < row.length; j++) {
        var name = row[j];
        var node = document.createElement('span');
        node.className = 'ast-node';
        node.textContent = name;
        rowEl.appendChild(node);
      }
      astRoot.appendChild(rowEl);
    }
  }

  function draw() {
    if (!ctx) return;
    var rect = canvas.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    var width = rect.width;
    var height = rect.height;

    ctx.clearRect(0, 0, width, height);

    var byId = {};
    for (var i = 0; i < objects.length; i++) {
      byId[objects[i].id] = objects[i];
    }

    ctx.strokeStyle = 'rgba(168, 85, 247, 0.2)';
    ctx.lineWidth = 2;
    for (var j = 0; j < edges.length; j++) {
      var edge = edges[j];
      var a = byId[edge[0]];
      var b = byId[edge[1]];
      if (a && b) {
        ctx.beginPath();
        ctx.moveTo(a.x * width, a.y * height);
        ctx.lineTo(b.x * width, b.y * height);
        ctx.stroke();
      }
    }

    for (var k = 0; k < objects.length; k++) {
      var obj = objects[k];
      var x = obj.x * width;
      var y = obj.y * height + Math.sin(tick * 2 + k) * 4;
      var active = (mode === 'mark' && obj.marked);
      var sweeping = (mode === 'sweep' && obj.garbage);
      var radius = obj.root ? 30 : 26;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = sweeping ? 'rgba(251, 113, 133, 0.1)' : (active ? 'rgba(168, 85, 247, 0.4)' : 'rgba(23, 11, 38, 0.8)');
      ctx.fill();
      ctx.strokeStyle = sweeping ? '#fb7185' : (active ? '#d8b4fe' : 'rgba(216, 180, 254, 0.2)');
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = obj.marked ? '#d8b4fe' : '#b7a3cf';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(obj.root ? 'ROOT' : 'OBJ', x, y + 4);
    }

    tick += 0.02;
    requestAnimationFrame(draw);
  }

  function runCycle() {
    setPhase('mark', 'Traversing from roots...');
    log('gc cycle start');
    setTimeout(function() {
      for (var i = 0; i < objects.length; i++) {
        if (!objects[i].garbage) objects[i].marked = true;
      }
      log('mark phase: ' + objects.filter(function(o){return !o.garbage;}).length + ' objects reached');
      setPhase('sweep', 'Reclaiming unreachable memory.');
      setTimeout(function() {
        setPhase('idle', 'Cycle complete. Heap is stable.');
        log('gc pass complete: 1 object freed');
        for (var j = 0; j < objects.length; j++) {
          objects[j].marked = false;
        }
      }, 1500);
    }, 1500);
  }

  var buttons = document.querySelectorAll('[data-action]');
  for (var i = 0; i < buttons.length; i++) {
    (function(button) {
      button.addEventListener('click', function() {
        var action = button.dataset.action;
        if (action === 'run') runCycle();
        if (action === 'reset') {
          for (var j = 0; j < objects.length; j++) {
            objects[j].marked = false;
          }
          setPhase('idle', 'Heap reset.');
          log('heap cleared');
        }
      });
    })(buttons[i]);
  }

  renderAST();
  draw();
  log('runtime initialized');
})();
