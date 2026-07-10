// ══════════════════════════════════════════════
//  PYTHON 🐍 v2 — a cobrinha caçadora de bugs
//  bug crítico · partículas · sons · countdown
// ══════════════════════════════════════════════
(function () {
  'use strict';

  const GRID = 21;
  const TICK_INICIAL = 170;
  const TICK_MINIMO  = 75;
  const ACELERA_A_CADA = 4;
  const CRITICO_A_CADA = 5;        // a cada N bugs, nasce um crítico
  const CRITICO_DURACAO = 5000;    // ms até sumir
  const RECORD_KEY = 'lf-python-record';
  const SOM_KEY    = 'lf-python-som';

  const canvas  = document.getElementById('gameCanvas');
  const ctx     = canvas.getContext('2d');
  const wrap    = document.getElementById('boardWrap');

  const sScore  = document.getElementById('sScore');
  const sRecord = document.getElementById('sRecord');
  const sSpeed  = document.getElementById('sSpeed');

  const startOv = document.getElementById('startOverlay');
  const pauseOv = document.getElementById('pauseOverlay');
  const overOv  = document.getElementById('overOverlay');
  const overErr = document.getElementById('overError');
  const overScr = document.getElementById('overScore');
  const overRec = document.getElementById('overRecord');
  const somBtn  = document.getElementById('somBtn');

  let cobra, dir, dirFila, bug, critico, score, tick, nivel;
  let rodando = false, pausado = false, contagem = 0;
  let loopId = null, comidos = 0;
  let particulas = [], textos = [];

  // ═══════════ SOM (WebAudio, gerado na hora) ═══════════
  let audioCtx = null;
  let somLigado = true;
  try { somLigado = localStorage.getItem(SOM_KEY) !== '0'; } catch (e) {}

  function beep(freq, dur, tipo, vol, quando) {
    if (!somLigado) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const t = audioCtx.currentTime + (quando || 0);
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = tipo || 'square';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(vol || 0.06, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(g); g.connect(audioCtx.destination);
      osc.start(t); osc.stop(t + dur);
    } catch (e) {}
  }
  const somComer    = () => beep(620, .09, 'square', .05);
  const somCritico  = () => { beep(520, .08, 'square', .05); beep(660, .08, 'square', .05, .08); beep(880, .12, 'square', .05, .16); };
  const somMorte    = () => { beep(300, .15, 'sawtooth', .06); beep(200, .2, 'sawtooth', .06, .12); beep(120, .35, 'sawtooth', .06, .26); };
  const somTicToc   = () => beep(440, .06, 'sine', .05);
  const somGo       = () => beep(880, .15, 'sine', .06);

  function atualizarSomBtn() {
    if (somBtn) somBtn.textContent = somLigado ? '🔊 som' : '🔇 mudo';
  }
  if (somBtn) {
    somBtn.addEventListener('click', () => {
      somLigado = !somLigado;
      try { localStorage.setItem(SOM_KEY, somLigado ? '1' : '0'); } catch (e) {}
      atualizarSomBtn();
      if (somLigado) somComer();
    });
    atualizarSomBtn();
  }

  const vibrar = (padrao) => { if (navigator.vibrate) navigator.vibrate(padrao); };

  // ═══════════ RECORDE ═══════════
  function lerRecorde() {
    try { return Number(localStorage.getItem(RECORD_KEY)) || 0; }
    catch (e) { return 0; }
  }
  function salvarRecorde(v) {
    try { localStorage.setItem(RECORD_KEY, String(v)); } catch (e) {}
  }
  sRecord.textContent = lerRecorde();

  // ═══════════ CANVAS ═══════════
  function dimensionar() {
    const tam = wrap.clientWidth;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = tam * dpr;
    canvas.height = tam * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', dimensionar);

  // ═══════════ ESTADO ═══════════
  function resetar() {
    const meio = Math.floor(GRID / 2);
    cobra = [ {x: meio - 1, y: meio}, {x: meio - 2, y: meio}, {x: meio - 3, y: meio} ];
    dir = {x: 1, y: 0};
    dirFila = [];
    score = 0; nivel = 1; comidos = 0;
    tick = TICK_INICIAL;
    critico = null;
    particulas = []; textos = [];
    novoBug();
    atualizarStats();
  }

  function celulaLivre() {
    let p;
    do {
      p = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    } while (
      cobra.some(s => s.x === p.x && s.y === p.y) ||
      (bug && bug.x === p.x && bug.y === p.y) ||
      (critico && critico.x === p.x && critico.y === p.y)
    );
    return p;
  }

  function novoBug() { bug = celulaLivre(); }

  function nascerCritico() {
    const p = celulaLivre();
    critico = { x: p.x, y: p.y, nasceu: performance.now() };
  }

  function atualizarStats() {
    sScore.textContent = score;
    sSpeed.textContent = nivel + 'x';
  }

  // ═══════════ EFEITOS ═══════════
  function explodir(cx, cy, cor, qtd) {
    for (let i = 0; i < qtd; i++) {
      const ang = Math.random() * Math.PI * 2;
      const vel = 1 + Math.random() * 2.4;
      particulas.push({
        x: cx, y: cy,
        vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel,
        vida: 1, cor,
      });
    }
  }
  function textoFlutuante(cx, cy, txt, cor) {
    textos.push({ x: cx, y: cy, txt, cor, vida: 1 });
  }

  // ═══════════ LÓGICA (tick) ═══════════
  function passo() {
    if (dirFila.length) {
      const d = dirFila.shift();
      if (d.x !== -dir.x || d.y !== -dir.y) dir = d;
    }

    const cel = wrap.clientWidth / GRID;
    const cabeca = { x: cobra[0].x + dir.x, y: cobra[0].y + dir.y };

    if (cabeca.x < 0 || cabeca.x >= GRID || cabeca.y < 0 || cabeca.y >= GRID) {
      return fimDeJogo('SegmentationFault: bateu na parede');
    }
    if (cobra.some(s => s.x === cabeca.x && s.y === cabeca.y)) {
      return fimDeJogo('RecursionError: a cobra mordeu a si mesma');
    }

    cobra.unshift(cabeca);
    let comeu = false;

    // bug comum
    if (cabeca.x === bug.x && cabeca.y === bug.y) {
      comeu = true;
      score++; comidos++;
      explodir((bug.x + .5) * cel, (bug.y + .5) * cel, '#00ff9d', 12);
      textoFlutuante((bug.x + .5) * cel, bug.y * cel, '+1', '#00ff9d');
      somComer(); vibrar(25);
      novoBug();
      if (comidos % CRITICO_A_CADA === 0 && !critico) nascerCritico();
      if (comidos % ACELERA_A_CADA === 0 && tick > TICK_MINIMO) {
        tick = Math.max(TICK_MINIMO, tick - 14);
        nivel++;
      }
      atualizarStats();
    }

    // bug crítico
    if (critico && cabeca.x === critico.x && cabeca.y === critico.y) {
      comeu = true;
      score += 3; comidos++;
      explodir((critico.x + .5) * cel, (critico.y + .5) * cel, '#ffd166', 22);
      textoFlutuante((critico.x + .5) * cel, critico.y * cel, '+3', '#ffd166');
      somCritico(); vibrar([30, 40, 30]);
      critico = null;
      atualizarStats();
    }

    // crítico expira
    if (critico && performance.now() - critico.nasceu > CRITICO_DURACAO) critico = null;

    if (!comeu) cobra.pop();

    loopId = setTimeout(passo, tick);
  }

  // ═══════════ RENDER (60fps, contínuo) ═══════════
  function render() {
    const tam = wrap.clientWidth;
    const cel = tam / GRID;

    ctx.fillStyle = '#071019';
    ctx.fillRect(0, 0, tam, tam);

    ctx.strokeStyle = 'rgba(0,212,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 1; i < GRID; i++) {
      ctx.beginPath(); ctx.moveTo(i * cel, 0); ctx.lineTo(i * cel, tam); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * cel); ctx.lineTo(tam, i * cel); ctx.stroke();
    }

    if (cobra) {
      // ── bug comum ──
      ctx.font = (cel * .8) + 'px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🐛', (bug.x + .5) * cel, (bug.y + .55) * cel);

      // ── bug crítico (dourado, com anel de tempo) ──
      if (critico) {
        const vida = 1 - (performance.now() - critico.nasceu) / CRITICO_DURACAO;
        if (vida <= 0) { critico = null; }
        else {
          const cx = (critico.x + .5) * cel, cy = (critico.y + .5) * cel;
          // pisca nos 30% finais
          const pisca = vida < .3 && Math.floor(performance.now() / 150) % 2 === 0;
          if (!pisca) {
            ctx.shadowColor = 'rgba(255,209,102,.8)';
            ctx.shadowBlur = 14;
            ctx.fillText('🐞', cx, cy + cel * .05);
            ctx.shadowBlur = 0;
          }
          // anel de tempo restante
          ctx.strokeStyle = '#ffd166';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(cx, cy, cel * .62, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * vida);
          ctx.stroke();
        }
      }

      // ── cobra: corpo conectado ──
      const pad = cel * .12;
      const larg = cel - pad * 2;
      // conectores entre segmentos (por baixo)
      for (let i = 0; i < cobra.length - 1; i++) {
        const a = cobra[i], b = cobra[i + 1];
        const fade = Math.max(.35, 1 - (i + .5) / cobra.length);
        ctx.fillStyle = `rgba(0, 255, 157, ${fade})`;
        const x = Math.min(a.x, b.x) * cel + pad;
        const y = Math.min(a.y, b.y) * cel + pad;
        const w = (Math.abs(a.x - b.x) * cel) + larg;
        const h = (Math.abs(a.y - b.y) * cel) + larg;
        ctx.fillRect(x, y, w, h);
      }
      // segmentos arredondados por cima
      cobra.forEach((s, i) => {
        const x = s.x * cel + pad, y = s.y * cel + pad;
        const r = cel * .24;
        if (i === 0) {
          ctx.fillStyle = '#00d4ff';
          ctx.shadowColor = 'rgba(0,212,255,.6)';
          ctx.shadowBlur = 12;
        } else {
          const fade = Math.max(.35, 1 - i / cobra.length);
          ctx.fillStyle = `rgba(0, 255, 157, ${fade})`;
          ctx.shadowBlur = 0;
        }
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x, y, larg, larg, r) : ctx.rect(x, y, larg, larg);
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      // olhos
      const cab = cobra[0];
      ctx.fillStyle = '#050a0e';
      const ex = (cab.x + .5) * cel, ey = (cab.y + .5) * cel, off = cel * .16;
      const olho = cel * .07;
      if (dir.x !== 0) {
        ctx.beginPath(); ctx.arc(ex + dir.x * off, ey - off, olho, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(ex + dir.x * off, ey + off, olho, 0, 7); ctx.fill();
      } else {
        ctx.beginPath(); ctx.arc(ex - off, ey + dir.y * off, olho, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(ex + off, ey + dir.y * off, olho, 0, 7); ctx.fill();
      }
    }

    // ── partículas ──
    particulas = particulas.filter(p => p.vida > 0);
    particulas.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.vx *= .95; p.vy *= .95;
      p.vida -= .035;
      ctx.globalAlpha = Math.max(0, p.vida);
      ctx.fillStyle = p.cor;
      ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    });
    ctx.globalAlpha = 1;

    // ── textos flutuantes ──
    textos = textos.filter(t => t.vida > 0);
    ctx.font = '700 ' + (cel * .75) + 'px "Space Mono", monospace';
    textos.forEach(t => {
      t.y -= .8; t.vida -= .025;
      ctx.globalAlpha = Math.max(0, t.vida);
      ctx.fillStyle = t.cor;
      ctx.fillText(t.txt, t.x, t.y);
    });
    ctx.globalAlpha = 1;

    // ── contagem regressiva ──
    if (contagem > 0) {
      ctx.fillStyle = 'rgba(5,10,14,.55)';
      ctx.fillRect(0, 0, tam, tam);
      ctx.fillStyle = '#00d4ff';
      ctx.font = '800 ' + (tam * .28) + 'px Syne, sans-serif';
      ctx.fillText(contagem, tam / 2, tam / 2);
    }

    requestAnimationFrame(render);
  }

  // ═══════════ FLUXO ═══════════
  function iniciar() {
    resetar();
    startOv.classList.add('hidden');
    overOv.classList.add('hidden');
    pauseOv.classList.add('hidden');
    clearTimeout(loopId);
    // contagem 3-2-1
    contagem = 3;
    somTicToc();
    const cd = setInterval(() => {
      contagem--;
      if (contagem > 0) { somTicToc(); return; }
      clearInterval(cd);
      somGo();
      rodando = true;
      pausado = false;
      loopId = setTimeout(passo, tick);
    }, 700);
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
    somMorte(); vibrar([60, 40, 80]);
    // explosão na cabeça
    const cel = wrap.clientWidth / GRID;
    explodir((cobra[0].x + .5) * cel, (cobra[0].y + .5) * cel, '#ff4d6d', 26);

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
    // pequena pausa dramática antes do overlay
    setTimeout(() => overOv.classList.remove('hidden'), 450);
  }

  // ═══════════ ENTRADAS ═══════════
  const MAPA_TECLAS = {
    ArrowUp: {x:0,y:-1}, ArrowDown: {x:0,y:1}, ArrowLeft: {x:-1,y:0}, ArrowRight: {x:1,y:0},
    w: {x:0,y:-1}, s: {x:0,y:1}, a: {x:-1,y:0}, d: {x:1,y:0},
  };

  document.addEventListener('keydown', e => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k === 'p' || (k === ' ' && rodando)) { e.preventDefault(); pausarOuContinuar(); return; }
    const d = MAPA_TECLAS[k];
    if (!d) return;
    e.preventDefault();
    if (!rodando) return; // durante countdown/overlays só os botões iniciam
    if (pausado) pausarOuContinuar();
    if (dirFila.length < 2) dirFila.push(d);
  });

  let tX = null, tY = null;
  wrap.addEventListener('touchstart', e => {
    tX = e.touches[0].clientX; tY = e.touches[0].clientY;
  }, { passive: true });
  wrap.addEventListener('touchmove', e => {
    if (tX === null || !rodando) return;
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

  document.getElementById('dpad').addEventListener('click', e => {
    const btn = e.target.closest('.dpad-btn');
    if (!btn || !rodando) return;
    const d = { up:{x:0,y:-1}, down:{x:0,y:1}, left:{x:-1,y:0}, right:{x:1,y:0} }[btn.dataset.dir];
    if (pausado) pausarOuContinuar();
    if (dirFila.length < 2) dirFila.push(d);
  });

  pauseOv.addEventListener('click', pausarOuContinuar);
  document.getElementById('startBtn').addEventListener('click', iniciar);
  document.getElementById('retryBtn').addEventListener('click', iniciar);

  // ═══════════ GO ═══════════
  dimensionar();
  requestAnimationFrame(render);
})();
