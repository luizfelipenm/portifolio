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

  document.getElementById('resultTitle').textContent = title;
  document.getElementById('resultMsg').textContent   = msg;

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
//  COMPARTILHAR RESULTADO
// ══════════════════════════════════════════════
const shareBtn = document.getElementById('shareBtn');
if (shareBtn) {
  shareBtn.addEventListener('click', async () => {
    const wpm = document.getElementById('rWpm').textContent;
    const acc = document.getElementById('rAcc').textContent;
    const modo = state.mode === 'zen' ? 'modo zen' : `modo ${state.totalTime}s`;
    const texto = `⌨️ Fiz ${wpm} WPM com ${acc} de precisão no Speed Typing (${modo})! Consegue me superar?`;
    const url = window.location.href;

    // celular: abre o menu nativo de compartilhamento
    if (navigator.share) {
      try { await navigator.share({ text: texto, url }); } catch (e) { /* usuário cancelou */ }
      return;
    }
    // desktop: copia para a área de transferência
    try {
      await navigator.clipboard.writeText(`${texto} ${url}`);
      feedbackShare('Copiado! ✅');
    } catch (e) {
      feedbackShare('Não foi possível copiar');
    }
  });
}

function feedbackShare(msg) {
  const original = shareBtn.innerHTML;
  shareBtn.textContent = msg;
  shareBtn.disabled = true;
  setTimeout(() => { shareBtn.innerHTML = original; shareBtn.disabled = false; }, 1800);
}
