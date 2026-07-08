// ══════════════════════════════════════════════
//  EFEITOS GLOBAIS — Konami, Matrix, CRT e cursor
//  ↑↑↓↓←→←→BA (ou 5 toques no logo) = modo hacker
// ══════════════════════════════════════════════
(function () {
  'use strict';

  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ─────────────────────────────────────────────
  //  MODO HACKER (Matrix + CRT)
  // ─────────────────────────────────────────────
  let matrixAtivo = false;
  let canvas = null, ctx = null, colunas = [], animId = null;
  const CHARS = 'アイウエオカキクケコサシスセソ01</>{}$#@ハヒフヘホ';

  function criarCamadas() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.className = 'matrix-canvas';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');

    const crt = document.createElement('div');
    crt.className = 'crt-overlay';
    document.body.appendChild(crt);

    window.addEventListener('resize', dimensionar);
  }

  function dimensionar() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const tam = 16;
    colunas = new Array(Math.ceil(canvas.width / tam)).fill(0)
      .map(() => Math.floor(Math.random() * -50));
  }

  function desenharMatrix() {
    if (!matrixAtivo) return;
    const tam = 16;
    // fade do rastro
    ctx.fillStyle = 'rgba(5, 10, 14, 0.10)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = tam + 'px monospace';
    for (let i = 0; i < colunas.length; i++) {
      const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
      const x = i * tam, y = colunas[i] * tam;
      // cabeça da coluna mais clara, corpo ciano/verde alternado
      ctx.fillStyle = Math.random() < .08 ? '#e8f4f8' : (i % 2 ? '#00d4ff' : '#00ff9d');
      ctx.fillText(ch, x, y);
      colunas[i] = (y > canvas.height && Math.random() > 0.975) ? 0 : colunas[i] + 1;
    }
    animId = requestAnimationFrame(desenharMatrix);
  }

  function toast(msg) {
    let t = document.querySelector('.hacker-toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'hacker-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => t.classList.remove('show'), 2600);
  }

  function alternarModoHacker() {
    criarCamadas();
    matrixAtivo = !matrixAtivo;
    document.body.classList.toggle('modo-hacker', matrixAtivo);
    if (matrixAtivo) {
      dimensionar();
      desenharMatrix();
      toast('>> MODO HACKER ATIVADO <<');
    } else {
      cancelAnimationFrame(animId);
      // limpa após o fade do CSS
      setTimeout(() => ctx && ctx.clearRect(0, 0, canvas.width, canvas.height), 650);
      toast('modo hacker desativado');
    }
  }

  // ── Konami code ──
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let pos = 0;
  document.addEventListener('keydown', e => {
    // Esc sempre desativa
    if (e.key === 'Escape' && matrixAtivo) { alternarModoHacker(); return; }
    const tecla = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (tecla === KONAMI[pos]) {
      pos++;
      if (pos === KONAMI.length) { pos = 0; alternarModoHacker(); }
    } else {
      pos = (tecla === KONAMI[0]) ? 1 : 0;
    }
  });

  // ── Alternativa mobile: 5 toques rápidos no logo ──
  const logo = document.querySelector('.nav-logo');
  if (logo) {
    let toques = 0, timer = null;
    logo.addEventListener('click', e => {
      toques++;
      clearTimeout(timer);
      timer = setTimeout(() => { toques = 0; }, 1600);
      if (toques >= 5) {
        e.preventDefault();
        toques = 0;
        alternarModoHacker();
      }
    });
  }

  // ─────────────────────────────────────────────
  //  RASTRO DE PARTÍCULAS DO CURSOR (só desktop)
  // ─────────────────────────────────────────────
  const ponteiroFino = window.matchMedia('(pointer: fine)').matches;
  if (ponteiroFino && !reduzido) {
    let ultimo = 0;
    document.addEventListener('pointermove', e => {
      const agora = performance.now();
      if (agora - ultimo < 40) return; // ~25 partículas/s no máximo
      ultimo = agora;
      const dot = document.createElement('span');
      dot.className = 'trail-dot' + (Math.random() < .5 ? ' g' : '');
      dot.style.left = (e.clientX + (Math.random() * 10 - 5)) + 'px';
      dot.style.top  = (e.clientY + (Math.random() * 10 - 5)) + 'px';
      document.body.appendChild(dot);
      setTimeout(() => dot.remove(), 650);
    }, { passive: true });
  }
})();
