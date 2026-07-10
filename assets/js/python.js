// ══════════════════════════════════════════════
//  PYTHON 🐍 — a cobrinha caçadora de bugs
//  Grid 21x21 · acelera a cada 4 bugs
// ══════════════════════════════════════════════
(function () {
  'use strict';

  const GRID = 21;                 // células por lado
  const TICK_INICIAL = 170;        // ms por passo
  const TICK_MINIMO  = 75;
  const ACELERA_A_CADA = 4;        // bugs
  const RECORD_KEY = 'lf-python-record';

  const canvas   = document.getElementById('gameCanvas');
  const ctx      = canvas.getContext('2d');
  const wrap     = document.getElementById('boardWrap');

  const sScore   = document.getElementById('sScore');
  const sRecord  = document.getElementById('sRecord');
  const sSpeed   = document.getElementById('sSpeed');

  const startOv  = document.getElementById('startOverlay');
  const pauseOv  = document.getElementById('pauseOverlay');
  const overOv   = document.getElementById('overOverlay');
  const overErr  = document.getElementById('overError');
  const overScr  = document.getElementById('overScore');
  const overRec  = document.getElementById('overRecord');

  let cobra, dir, dirFila, bug, score, tick, nivel, rodando, pausado, loopId;

  // ── recorde ──
  function lerRecorde() {
    try { return Number(localStorage.getItem(RECORD_KEY)) || 0; }
    catch (e) { return 0; }
  }
  function salvarRecorde(v) {
    try { localStorage.setItem(RECORD_KEY, String(v)); } catch (e) {}
  }
  sRecord.textContent = lerRecorde();

  // ── canvas nítido em qualquer tela ──
  function dimensionar() {
    const tam = wrap.clientWidth;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = tam * dpr;
    canvas.height = tam * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!rodando) desenhar(); // redesenha estado parado
  }
  window.addEventListener('resize', dimensionar);

  // ── estado inicial ──
  function resetar() {
    const meio = Math.floor(GRID / 2);
    cobra = [ {x: meio - 1, y: meio}, {x: meio - 2, y: meio}, {x: meio - 3, y: meio} ];
    dir = {x: 1, y: 0};
    dirFila = [];
    score = 0;
    nivel = 1;
    tick = TICK_INICIAL;
    novoBug();
    atualizarStats();
  }

  function novoBug() {
    do {
      bug = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    } while (cobra.some(s => s.x === bug.x && s.y === bug.y));
  }

  function atualizarStats() {
    sScore.textContent = score;
    sSpeed.textContent = nivel + 'x';
  }

  // ── loop ──
  function passo() {
    // consome próxima direção da fila (evita 180° em um tick)
    if (dirFila.length) {
      const d = dirFila.shift();
      if (d.x !== -dir.x || d.y !== -dir.y) dir = d;
    }

    const cabeca = { x: cobra[0].x + dir.x, y: cobra[0].y + dir.y };

    // parede
    if (cabeca.x < 0 || cabeca.x >= GRID || cabeca.y < 0 || cabeca.y >= GRID) {
      return fimDeJogo('SegmentationFault: bateu na parede');
    }
    // colisão consigo mesma
    if (cobra.some(s => s.x === cabeca.x && s.y === cabeca.y)) {
      return fimDeJogo('RecursionError: a cobra mordeu a si mesma');
    }

    cobra.unshift(cabeca);

    // comeu o bug?
    if (cabeca.x === bug.x && cabeca.y === bug.y) {
      score++;
      if (score % ACELERA_A_CADA === 0 && tick > TICK_MINIMO) {
        tick = Math.max(TICK_MINIMO, tick - 14);
        nivel++;
      }
      atualizarStats();
      novoBug();
    } else {
      cobra.pop();
    }

    desenhar();
    loopId = setTimeout(passo, tick);
  }

  // ── desenho ──
  function desenhar() {
    const tam = wrap.clientWidth;
    const cel = tam / GRID;

    ctx.fillStyle = '#071019';
    ctx.fillRect(0, 0, tam, tam);

    // grade sutil
    ctx.strokeStyle = 'rgba(0,212,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 1; i < GRID; i++) {
      ctx.beginPath(); ctx.moveTo(i * cel, 0); ctx.lineTo(i * cel, tam); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * cel); ctx.lineTo(tam, i * cel); ctx.stroke();
    }

    if (!cobra) return;

    // bug (alvo)
    ctx.font = (cel * 0.8) + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐛', (bug.x + 0.5) * cel, (bug.y + 0.55) * cel);

    // cobra: cabeça ciano, corpo esmaecendo em verde
    cobra.forEach((s, i) => {
      const pad = cel * 0.08;
      if (i === 0) {
        ctx.fillStyle = '#00d4ff';
        ctx.shadowColor = 'rgba(0,212,255,.6)';
        ctx.shadowBlur = 10;
      } else {
        const fade = Math.max(0.35, 1 - i / cobra.length);
        ctx.fillStyle = `rgba(0, 255, 157, ${fade})`;
        ctx.shadowBlur = 0;
      }
      const r = cel * 0.22;
      const x = s.x * cel + pad, y = s.y * cel + pad, w = cel - pad * 2;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(x, y, w, w, r) : ctx.rect(x, y, w, w);
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    // olhos da cabeça
    const cab = cobra[0];
    ctx.fillStyle = '#050a0e';
    const ex = (cab.x + 0.5) * cel, ey = (cab.y + 0.5) * cel, off = cel * 0.16;
    const olho = cel * 0.07;
    if (dir.x !== 0) {
      ctx.beginPath(); ctx.arc(ex + dir.x * off, ey - off, olho, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(ex + dir.x * off, ey + off, olho, 0, 7); ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(ex - off, ey + dir.y * off, olho, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(ex + off, ey + dir.y * off, olho, 0, 7); ctx.fill();
    }
  }

  // ── controle de fluxo ──
  function iniciar() {
    resetar();
    rodando = true;
    pausado = false;
    startOv.classList.add('hidden');
    overOv.classList.add('hidden');
    pauseOv.classList.add('hidden');
    desenhar();
    clearTimeout(loopId);
    loopId = setTimeout(passo, tick);
  }

  function pausarOuContinuar() {
    if (!rodando) return;
    pausado = !pausado;
    pauseOv.classList.toggle('hidden', !pausado);
    if (pausado) clearTimeout(loopId);
    else loopId = setTimeout(passo, tick);
  }

  function fimDeJogo(erro) {
    rodando = false;
    clearTimeout(loopId);
    overErr.textContent = erro;
    overScr.textContent = score;
    const recorde = lerRecorde();
    if (score > recorde) {
      salvarRecorde(score);
      sRecord.textContent = score;
      overRec.classList.remove('hidden');
    } else {
      overRec.classList.add('hidden');
    }
    overOv.classList.remove('hidden');
  }

  // ── entradas ──
  const MAPA_TECLAS = {
    ArrowUp: {x:0,y:-1}, ArrowDown: {x:0,y:1}, ArrowLeft: {x:-1,y:0}, ArrowRight: {x:1,y:0},
    w: {x:0,y:-1}, s: {x:0,y:1}, a: {x:-1,y:0}, d: {x:1,y:0},
  };

  document.addEventListener('keydown', e => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k === 'p' || (k === ' ' && rodando)) { e.preventDefault(); pausarOuContinuar(); return; }
    const d = MAPA_TECLAS[k];
    if (!d) return;
    e.preventDefault(); // não rola a página com as setas
    if (!rodando && !overOv.classList.contains('hidden')) return;
    if (!rodando) { iniciar(); }
    if (pausado) pausarOuContinuar();
    if (dirFila.length < 2) dirFila.push(d);
  });

  // swipe no tabuleiro
  let tX = null, tY = null;
  wrap.addEventListener('touchstart', e => {
    tX = e.touches[0].clientX; tY = e.touches[0].clientY;
  }, { passive: true });
  wrap.addEventListener('touchmove', e => {
    if (tX === null) return;
    const dx = e.touches[0].clientX - tX;
    const dy = e.touches[0].clientY - tY;
    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
    const d = Math.abs(dx) > Math.abs(dy)
      ? { x: Math.sign(dx), y: 0 }
      : { x: 0, y: Math.sign(dy) };
    if (dirFila.length < 2) dirFila.push(d);
    tX = null; tY = null;
    e.preventDefault();
  }, { passive: false });

  // d-pad
  document.getElementById('dpad').addEventListener('click', e => {
    const btn = e.target.closest('.dpad-btn');
    if (!btn || !rodando) return;
    const d = { up:{x:0,y:-1}, down:{x:0,y:1}, left:{x:-1,y:0}, right:{x:1,y:0} }[btn.dataset.dir];
    if (pausado) pausarOuContinuar();
    if (dirFila.length < 2) dirFila.push(d);
  });

  // toque na pausa retoma
  pauseOv.addEventListener('click', pausarOuContinuar);

  document.getElementById('startBtn').addEventListener('click', iniciar);
  document.getElementById('retryBtn').addEventListener('click', iniciar);

  // primeiro desenho
  dimensionar();
})();
