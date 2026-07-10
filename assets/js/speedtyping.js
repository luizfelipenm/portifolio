// ══════════════════════════════════════════════
//  WORD BANK — Termos reais de TI por categoria
// ══════════════════════════════════════════════
const WORDS = {
  redes: [
    'firewall','gateway','router','switch','dhcp','dns','ipv4','ipv6','tcp','udp',
    'vpn','vlan','subnet','proxy','nat','icmp','arp','ssid','bandwidth',
    'latency','ping','traceroute','ethernet','packet','protocol','ospf','bgp',
    'mac-address','broadcast','multicast','wireshark','topology','hub'
  ],
  sistemas: [
    'kernel','linux','ubuntu','bash','root','chmod','sudo','cron','daemon',
    'process','thread','ram','swap','disk','partition','grub','ssh','scp',
    'docker','container','vm','hypervisor','bios','uefi','windows','registry',
    'active-directory','gpo','ldap','powershell','terminal','cli'
  ],
  cloud: [
    'aws','azure','cloud','s3','ec2','iam','vpc','lambda','rds','api',
    'devops','cicd','kubernetes','terraform','ansible','cloudformation',
    'serverless','microservice','loadbalancer','autoscaling','monitoring',
    'logging','bucket','snapshot','region','availability-zone'
  ],
  dev: [
    'html','css','javascript','python','java','sql','git','github','api',
    'rest','json','xml','http','https','debug','refactor','deploy','backend',
    'frontend','framework','library','database','query','loop','function',
    'variable','boolean','integer','string','array','object','class'
  ],
  seguranca: [
    'criptografia','hash','ssl','tls','certificate','malware','ransomware',
    'phishing','antivirus','backup','vulnerability','patch','exploit','audit',
    'authentication','authorization','2fa','token','encryption','penetration',
    'zero-day','brute-force','spoofing','injection','csrf','xss'
  ],
  suporte: [
    'helpdesk','ticket','incident','sla','itil','cmdb','change','problem',
    'escalation','remote','teamviewer','anydesk','vnc','bios','driver',
    'update','reinstall','reboot','network','printer','monitor','keyboard',
    'log','event-viewer','task-manager','msconfig','ping','ipconfig'
  ]
};

const CATEGORIES = Object.keys(WORDS);
const ALL_WORDS = CATEGORIES.flatMap(c => WORDS[c]);

// ══════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════
let state = {
  mode: 30,          // seconds or 'zen'
  words: [],
  current: 0,
  correct: 0,
  errors: 0,
  started: false,
  finished: false,
  timeLeft: 30,
  totalTime: 30,
  timerInterval: null,
  startTime: null,
  currentCategory: '—',
  zenWords: 0,
};

// DOM refs
const wordDisplay  = document.getElementById('wordDisplay');
const typingInput  = document.getElementById('typingInput');
const startOverlay = document.getElementById('startOverlay');
const resultsPanel = document.getElementById('resultsPanel');
const statWpm      = document.getElementById('statWpm');
const statAcc      = document.getElementById('statAcc');
const statCorrect  = document.getElementById('statCorrect');
const statErrors   = document.getElementById('statErrors');
const timerNum     = document.getElementById('timerNum');
const timerRing    = document.getElementById('timerRing');
const progressBar  = document.getElementById('progressBar');
const catName      = document.getElementById('catName');
const startBtn     = document.getElementById('startBtn');
const restartBtn   = document.getElementById('restartBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const changeModeBtn= document.getElementById('changeModeBtn');
const CIRC = 2 * Math.PI * 35; // 220

// ══════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════
function shuffle(arr) {
  const a = [...arr];
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}

function pickWords(count = 60) {
  // mix categories
  const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  state.currentCategory = cat;
  catName.textContent = cat;
  // 60% from category, 40% mixed
  const catWords  = shuffle(WORDS[cat]).slice(0, Math.ceil(count * .6));
  const restWords = shuffle(ALL_WORDS.filter(w => !catWords.includes(w))).slice(0, count - catWords.length);
  return shuffle([...catWords, ...restWords]);
}

function renderWords() {
  wordDisplay.innerHTML = '';
  const word = state.words[state.current];
  if(!word) return;

  // palavra atual, letra por letra
  const wordEl = document.createElement('div');
  wordEl.className = 'word-single';
  [...word].forEach(ch => {
    const s = document.createElement('span');
    s.className = 'letter';
    s.textContent = ch;
    wordEl.appendChild(s);
  });
  wordDisplay.appendChild(wordEl);

  // dica da próxima palavra
  const next = state.words[state.current + 1];
  if(next) {
    const hint = document.createElement('div');
    hint.className = 'word-next-hint';
    hint.innerHTML = 'próxima: <span></span>';
    hint.querySelector('span').textContent = next;
    wordDisplay.appendChild(hint);
  }

  colorLetters(typingInput.value);
}

// colore as letras da palavra atual conforme o que foi digitado
function colorLetters(val) {
  const letters = wordDisplay.querySelectorAll('.word-single .letter');
  letters.forEach((el, i) => {
    el.className = 'letter';
    if(i < val.length) {
      el.classList.add(val[i] === el.textContent ? 'ok' : 'bad');
    } else if(i === val.length) {
      el.classList.add('next');
    }
  });
}

function updateStats() {
  const elapsed = state.startTime ? (Date.now() - state.startTime) / 60000 : 0;
  const wpm = elapsed > 0 ? Math.round(state.correct / elapsed) : 0;
  const total = state.correct + state.errors;
  const acc = total > 0 ? Math.round((state.correct / total) * 100) : 100;

  statWpm.textContent     = wpm;
  statCorrect.textContent = state.correct;
  statErrors.textContent  = state.errors;
  statAcc.textContent     = total > 0 ? acc + '%' : '—';

  // progress bar (words done / total)
  const pct = Math.min((state.current / state.words.length) * 100, 100);
  progressBar.style.width = pct + '%';

  return { wpm, acc };
}

function updateTimer() {
  if(state.mode === 'zen') {
    timerNum.textContent = '∞';
    timerRing.style.strokeDashoffset = 0;
    timerRing.style.stroke = 'var(--accent)';
    return;
  }
  timerNum.textContent = state.timeLeft;
  const pct = state.timeLeft / state.totalTime;
  timerRing.style.strokeDasharray  = CIRC;
  timerRing.style.strokeDashoffset = CIRC * (1 - pct);
  timerRing.style.stroke = pct > .5 ? 'var(--accent)' : pct > .25 ? 'var(--yellow)' : 'var(--red)';
  timerNum.style.color   = pct > .5 ? 'var(--accent)' : pct > .25 ? 'var(--yellow)' : 'var(--red)';
}

// ══════════════════════════════════════════════
//  GAME FLOW
// ══════════════════════════════════════════════
function initGame() {
  clearInterval(state.timerInterval);
  state.words       = pickWords(80);
  state.wordResults = [];
  state.current     = 0;
  state.correct     = 0;
  state.errors      = 0;
  state.started     = false;
  state.finished    = false;
  state.timeLeft    = state.mode === 'zen' ? Infinity : state.mode;
  state.totalTime   = state.mode === 'zen' ? Infinity : state.mode;
  state.startTime   = null;

  renderWords();
  updateTimer();
  updateStats();

  typingInput.value = '';
  typingInput.disabled = false;
  typingInput.className = 'typing-input';
  typingInput.placeholder = 'Digite aqui...';

  resultsPanel.classList.remove('show');
  startOverlay.style.display = 'none';
  progressBar.style.width = '0%';

  typingInput.focus();
}

function startTimer() {
  if(state.mode === 'zen') return;
  state.timerInterval = setInterval(() => {
    state.timeLeft--;
    updateTimer();
    if(state.timeLeft <= 0) endGame();
  }, 1000);
}

function endGame() {
  clearInterval(state.timerInterval);
  state.finished = true;
  typingInput.disabled = true;

  const { wpm, acc } = updateStats();

  // populate results
  document.getElementById('rWpm').textContent     = wpm;
  document.getElementById('rAcc').textContent     = acc + '%';
  document.getElementById('rCorrect').textContent = state.correct;
  document.getElementById('rErrors').textContent  = state.errors;

  const title = wpm >= 60 ? '🔥 Incrível!' : wpm >= 40 ? '✅ Bom trabalho!' : wpm >= 20 ? '💪 Continue praticando!' : '🐢 Vamos aquecer!';
  const msg   = `Você digitou ${state.correct} termos de TI corretamente com ${acc}% de precisão${state.mode !== 'zen' ? ` em ${state.totalTime} segundos` : ''}.`;

  // ranking pessoal
  const posicao = registrarNoRanking(wpm, acc);

  document.getElementById('resultTitle').textContent = posicao === 1 ? '🏆 NOVO RECORDE!' : title;
  document.getElementById('resultMsg').textContent   = posicao && posicao > 1 ? msg + ` Você ficou em ${posicao}º no seu ranking.` : msg;

  resultsPanel.classList.add('show');
  resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ══════════════════════════════════════════════
//  INPUT HANDLER
// ══════════════════════════════════════════════
typingInput.addEventListener('input', () => {
  if(state.finished) return;

  // start on first keystroke
  if(!state.started) {
    state.started   = true;
    state.startTime = Date.now();
    startTimer();
  }

  const val     = typingInput.value;
  const target  = state.words[state.current];

  // space or correct word submitted
  if(val.endsWith(' ') || val === target) {
    const typed = val.trim();
    if(typed === target) {
      state.wordResults[state.current] = 'correct';
      state.correct++;
    } else {
      state.wordResults[state.current] = 'error';
      state.errors++;
    }
    state.current++;
    typingInput.value = '';
    typingInput.className = 'typing-input';

    // add more words if running low
    if(state.current >= state.words.length - 15) {
      const more = pickWords(40);
      state.words.push(...more);
    }

    // zen mode: end after 50 words
    if(state.mode === 'zen' && state.current >= 50) endGame();

    renderWords();
    updateStats();
    return;
  }

  // live coloring
  const isCorrect = target.startsWith(val);
  typingInput.className = 'typing-input ' + (val.length === 0 ? '' : isCorrect ? 'correct' : 'wrong');
  colorLetters(val);
  updateStats();
});

// backspace clears wrong state
typingInput.addEventListener('keydown', e => {
  if(e.key === 'Escape') restartGame();
});

// ══════════════════════════════════════════════
//  MODE BUTTONS
// ══════════════════════════════════════════════
document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const m = btn.dataset.mode;
    state.mode = m === 'zen' ? 'zen' : parseInt(m);
    showStartOverlay();
  });
});

// ══════════════════════════════════════════════
//  RESTART / START
// ══════════════════════════════════════════════
function showStartOverlay() {
  clearInterval(state.timerInterval);
  state.words       = pickWords(80);
  state.wordResults = [];
  state.current     = 0;
  state.correct     = 0;
  state.errors      = 0;
  state.started     = false;
  state.finished    = false;
  state.timeLeft    = state.mode === 'zen' ? Infinity : state.mode;
  state.totalTime   = state.mode === 'zen' ? Infinity : state.mode;
  state.startTime   = null;
  renderWords();
  updateTimer();
  updateStats();
  typingInput.disabled = true;
  typingInput.value = '';
  typingInput.className = 'typing-input';
  resultsPanel.classList.remove('show');
  startOverlay.style.display = 'flex';
  progressBar.style.width = '0%';
}

function restartGame() {
  showStartOverlay();
}

startBtn.addEventListener('click', () => { startOverlay.style.display = 'none'; typingInput.disabled = false; typingInput.focus(); });
restartBtn.addEventListener('click', restartGame);
playAgainBtn.addEventListener('click', () => { restartGame(); });
changeModeBtn.addEventListener('click', () => { resultsPanel.classList.remove('show'); showStartOverlay(); });

// keyboard shortcut R to restart
document.addEventListener('keydown', e => {
  if(e.key === 'r' && !state.started && e.target !== typingInput) restartGame();
  if(e.key === 'Enter' && startOverlay.style.display !== 'none') {
    startOverlay.style.display = 'none';
    typingInput.disabled = false;
    typingInput.focus();
  }
});

// ══════════════════════════════════════════════
//  BLOB CURSOR
// ══════════════════════════════════════════════
const blob = document.getElementById('blob');
document.addEventListener('mousemove', e => { blob.style.left=e.clientX+'px'; blob.style.top=e.clientY+'px'; });
if(window.matchMedia('(pointer:coarse)').matches) blob.style.display='none';

// ══════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════
showStartOverlay();

// ══════════════════════════════════════════════
//  COMPARTILHAR RESULTADO — imagem p/ stories
//  (1080x1920 · Instagram / WhatsApp)
// ══════════════════════════════════════════════
const shareBtn = document.getElementById('shareBtn');
const SITE_URL = 'luizfelipenm.dev/speedtyping.html';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}


// reduz a fonte até o texto caber na largura máxima
function fitText(ctx, texto, pesoFonte, tamMax, larguraMax) {
  let tam = tamMax;
  do {
    ctx.font = pesoFonte.replace('{S}', tam);
    if (ctx.measureText(texto).width <= larguraMax) break;
    tam -= 2;
  } while (tam > 20);
  return tam;
}

async function gerarImagemStory() {
  // garante que as fontes do site estão prontas no canvas
  await Promise.all([
    document.fonts.load('800 200px Syne'),
    document.fonts.load('700 44px "Space Mono"'),
    document.fonts.load('400 34px "Space Mono"'),
  ]).catch(() => {});

  const wpm     = document.getElementById('rWpm').textContent;
  const acc     = document.getElementById('rAcc').textContent;
  const certas  = document.getElementById('rCorrect').textContent;
  const modo    = state.mode === 'zen' ? 'ZEN' : state.totalTime + 'S';

  const W = 1080, H = 1920;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');

  // ── fundo ──
  ctx.fillStyle = '#050a0e';
  ctx.fillRect(0, 0, W, H);

  // grade sutil
  ctx.strokeStyle = 'rgba(0,212,255,0.05)';
  ctx.lineWidth = 1;
  for (let gx = 0; gx <= W; gx += 72) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
  for (let gy = 0; gy <= H; gy += 72) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }

  // brilhos radiais
  let g = ctx.createRadialGradient(220, 260, 0, 220, 260, 900);
  g.addColorStop(0, 'rgba(0,212,255,0.16)'); g.addColorStop(1, 'transparent');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  g = ctx.createRadialGradient(900, 1700, 0, 900, 1700, 900);
  g.addColorStop(0, 'rgba(0,255,157,0.12)'); g.addColorStop(1, 'transparent');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'center';

  // ── topo: marca ──
  ctx.fillStyle = '#00d4ff';
  ctx.font = '800 84px Syne, sans-serif';
  ctx.fillText('LF.', W / 2, 250);
  ctx.fillStyle = '#00ff9d';
  ctx.font = '700 40px "Space Mono", monospace';
  ctx.fillText('//  S P E E D   T Y P I N G', W / 2, 340);

  // ── card central ──
  const cx = 80, cw = W - 160, cy = 480, ch = 880;
  ctx.fillStyle = '#0d1f2d';
  roundRect(ctx, cx, cy, cw, ch, 36); ctx.fill();
  ctx.strokeStyle = 'rgba(0,212,255,0.4)';
  ctx.lineWidth = 3;
  roundRect(ctx, cx, cy, cw, ch, 36); ctx.stroke();
  // linha gradiente no topo do card
  g = ctx.createLinearGradient(cx, 0, cx + cw, 0);
  g.addColorStop(0, '#00d4ff'); g.addColorStop(1, '#00ff9d');
  ctx.fillStyle = g;
  ctx.fillRect(cx + 36, cy, cw - 72, 6);

  // WPM gigante com gradiente
  g = ctx.createLinearGradient(0, cy + 150, 0, cy + 420);
  g.addColorStop(0, '#00d4ff'); g.addColorStop(1, '#00ff9d');
  ctx.fillStyle = g;
  ctx.font = '800 300px Syne, sans-serif';
  ctx.fillText(wpm, W / 2, cy + 400);

  ctx.fillStyle = '#6a8fa8';
  ctx.font = '700 38px "Space Mono", monospace';
  ctx.fillText('PALAVRAS POR MINUTO', W / 2, cy + 480);

  // divisor
  ctx.strokeStyle = 'rgba(0,212,255,0.15)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx + 80, cy + 560); ctx.lineTo(cx + cw - 80, cy + 560); ctx.stroke();

  // linha de stats: precisão · corretas · modo
  const stats = [
    [acc,    'PRECISÃO', '#00ff9d'],
    [certas, 'CORRETAS', '#ffd166'],
    [modo,   'MODO',     '#00d4ff'],
  ];
  const colW = cw / 3;
  stats.forEach(([val, label, cor], i) => {
    const sx = cx + colW * i + colW / 2;
    ctx.fillStyle = cor;
    ctx.font = '700 92px "Space Mono", monospace';
    ctx.fillText(val, sx, cy + 710);
    ctx.fillStyle = '#6a8fa8';
    ctx.font = '400 30px "Space Mono", monospace';
    ctx.fillText(label, sx, cy + 770);
  });

  // ── desafio (estilo prompt) ──
  ctx.fillStyle = '#ffffff';
  fitText(ctx, 'Consegue me superar?', '800 {S}px Syne, sans-serif', 62, 920);
  ctx.fillText('Consegue me superar?', W / 2, 1520);
  ctx.fillStyle = '#00ff9d';
  ctx.font = '400 36px "Space Mono", monospace';
  ctx.fillText('~$ aceite o desafio_', W / 2, 1595);

  // ── rodapé: url ──
  ctx.fillStyle = '#0d1f2d';
  roundRect(ctx, W / 2 - 400, 1680, 800, 90, 45); ctx.fill();
  ctx.strokeStyle = 'rgba(0,212,255,0.35)';
  ctx.lineWidth = 2;
  roundRect(ctx, W / 2 - 400, 1680, 800, 90, 45); ctx.stroke();
  ctx.fillStyle = '#00d4ff';
  fitText(ctx, SITE_URL, '700 {S}px "Space Mono", monospace', 32, 720);
  ctx.fillText(SITE_URL, W / 2, 1738);

  return new Promise(res => cv.toBlob(res, 'image/png'));
}

if (shareBtn) {
  shareBtn.addEventListener('click', async () => {
    shareBtn.disabled = true;
    try {
      const blob = await gerarImagemStory();
      const file = new File([blob], 'speedtyping-lf.png', { type: 'image/png' });
      const texto = `⌨️ Fiz ${document.getElementById('rWpm').textContent} WPM no Speed Typing! Consegue me superar? https://${SITE_URL}`;

      // celular: compartilha a imagem direto (Instagram, WhatsApp...)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file], text: texto }); } catch (e) { /* cancelou */ }
      } else {
        // desktop: baixa a imagem e copia o texto
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'speedtyping-lf.png';
        a.click();
        URL.revokeObjectURL(a.href);
        try { await navigator.clipboard.writeText(texto); } catch (e) {}
        feedbackShare('Imagem baixada! ✅');
      }
    } catch (e) {
      feedbackShare('Ops, algo falhou');
    }
    shareBtn.disabled = false;
  });
}

function feedbackShare(msg) {
  const original = shareBtn.innerHTML;
  shareBtn.textContent = msg;
  setTimeout(() => { shareBtn.innerHTML = original; }, 2000);
}

// ══════════════════════════════════════════════
//  RANKING PESSOAL (localStorage · top 10)
// ══════════════════════════════════════════════
const RANK_KEY = 'lf-st-ranking';

function lerRanking() {
  try { return JSON.parse(localStorage.getItem(RANK_KEY)) || []; }
  catch (e) { return []; }
}

function salvarRanking(lista) {
  try { localStorage.setItem(RANK_KEY, JSON.stringify(lista)); } catch (e) {}
}

function registrarNoRanking(wpm, acc) {
  const entrada = {
    wpm: Number(wpm),
    acc: Number(acc),
    modo: state.mode === 'zen' ? 'zen' : state.totalTime + 's',
    data: Date.now(),
  };
  const lista = lerRanking();
  lista.push(entrada);
  lista.sort((a, b) => b.wpm - a.wpm || b.acc - a.acc);
  const top = lista.slice(0, 10);
  salvarRanking(top);
  renderRanking(entrada.data);
  // posição 1-based, ou null se não entrou no top 10
  const pos = top.findIndex(e => e.data === entrada.data);
  return pos === -1 ? null : pos + 1;
}

function renderRanking(destaqueData) {
  const ul = document.getElementById('rankingList');
  const vazio = document.getElementById('rankingEmpty');
  if (!ul) return;
  const lista = lerRanking();
  ul.innerHTML = '';
  vazio.style.display = lista.length ? 'none' : 'block';

  lista.forEach((e, i) => {
    const li = document.createElement('li');
    li.className = 'ranking-row' + (e.data === destaqueData ? ' novo' : '');
    const medalha = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1) + '.';
    const dia = new Date(e.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    li.innerHTML =
      `<span class="ranking-pos">${medalha}</span>` +
      `<span class="ranking-wpm">${e.wpm} WPM</span>` +
      `<span class="ranking-acc">${e.acc}%</span>` +
      `<span class="ranking-modo">${e.modo}</span>` +
      `<span class="ranking-data">${dia}</span>`;
    ul.appendChild(li);
  });
}

// limpar histórico (com confirmação simples)
const rankingClear = document.getElementById('rankingClear');
if (rankingClear) {
  rankingClear.addEventListener('click', () => {
    if (rankingClear.dataset.confirma === '1') {
      salvarRanking([]);
      renderRanking();
      rankingClear.textContent = 'limpar';
      delete rankingClear.dataset.confirma;
    } else {
      rankingClear.dataset.confirma = '1';
      rankingClear.textContent = 'confirmar?';
      setTimeout(() => {
        rankingClear.textContent = 'limpar';
        delete rankingClear.dataset.confirma;
      }, 2500);
    }
  });
}

// exibe o ranking salvo ao abrir a página
renderRanking();
