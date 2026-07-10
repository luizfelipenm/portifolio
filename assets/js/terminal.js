// ══════════════════════════════════════════════
//  CONTEÚDO — edite aqui os seus dados
// ══════════════════════════════════════════════
const DATA = {
  nome: 'Luiz Felipe Nascimento Mota',
  cargo: 'Auxiliar / Suporte de TI',
  empresa: 'Ford Slaviero Brasília',
  formacao: 'Gestão da Tecnologia da Informação — Senac-DF',
  local: 'Brasília, DF',
  email: 'seu-email@exemplo.com',        // <- troque
  linkedin: 'https://linkedin.com/in/seu-perfil', // <- troque
  github: 'https://github.com/seu-usuario',      // <- troque
};

// ══════════════════════════════════════════════
//  COMANDOS
// ══════════════════════════════════════════════
const COMMANDS = {

  sobre: () => [
    ['t-green', `> ${DATA.nome}`],
    ['t-white', `  ${DATA.cargo} · ${DATA.empresa}`],
    ['t-muted', `  ${DATA.local}`],
    ['', ''],
    ['t-muted', `  Formado em ${DATA.formacao}.`],
    ['t-muted', '  Apaixonado por tecnologia, resolvo problemas de infraestrutura,'],
    ['t-muted', '  redes e sistemas no dia a dia — e nas horas vagas construo'],
    ['t-muted', '  projetos web do zero com HTML, CSS e JavaScript puro.'],
  ],

  skills: () => [
    ['t-green', '> Habilidades técnicas'],
    ['', ''],
    ['t-cyan',  '  Suporte      ', 't-muted', 'Windows · Active Directory · helpdesk · ITIL'],
    ['t-cyan',  '  Redes        ', 't-muted', 'TCP/IP · DNS · DHCP · VPN · roteadores/switches'],
    ['t-cyan',  '  Hardware     ', 't-muted', 'montagem · manutenção · diagnóstico · SSD/particionamento'],
    ['t-cyan',  '  Dev Web      ', 't-muted', 'HTML · CSS · JavaScript · Git/GitHub'],
    ['t-cyan',  '  Estudando    ', 't-muted', 'Next.js · Supabase · PWA'],
  ],

  experiencia: () => [
    ['t-green', '> Experiência profissional'],
    ['', ''],
    ['t-white', `  [atual] ${DATA.empresa}`],
    ['t-muted', `          ${DATA.cargo}`],
    ['', ''],
    ['t-white', '  [antes] Laboratório Senac-DF'],
    ['t-muted', '          Suporte e infraestrutura de laboratório'],
    ['', ''],
    ['t-white', '  [antes] BIG BOX 402'],
    ['t-muted', '          Atendimento e operações'],
  ],

  projetos: () => [
    ['t-green', '> Projetos'],
    ['', ''],
    ['t-cyan',  '  portfolio      ', 't-muted', 'este site — HTML/CSS/JS vanilla, do zero'],
    ['t-cyan',  '  speed-typing   ', 't-muted', 'mini-game de digitação com termos de TI'],
    ['t-cyan',  '  kick-bot       ', 't-muted', 'bot de chat p/ Kick.com em um único HTML'],
    ['t-cyan',  '  orcapro        ', 't-yellow', '[em desenvolvimento] ', 't-muted', 'PWA de orçamentos p/ prestadores de serviço'],
    ['t-cyan',  '  python         ', 't-muted', 'a cobrinha dev — corrija bugs sem quebrar em produção'],
    ['', ''],
    ['t-muted', '  Dica: digite o nome de um projeto para ver detalhes.'],
  ],

  portfolio: () => [
    ['t-green', '> portfolio'],
    ['t-muted', '  Site pessoal construído 100% do zero, sem frameworks.'],
    ['t-muted', '  Dark tech, ícones SVG animados, carrossel de experiências'],
    ['t-muted', '  e mini-games integrados.'],
    ['t-cyan',  '  Stack: HTML · CSS · JavaScript vanilla'],
  ],

  'speed-typing': () => [
    ['t-green', '> speed-typing'],
    ['t-muted', '  Jogo de digitação rápida com termos reais de TI (redes,'],
    ['t-muted', '  cloud, segurança...). Modos de 30s a zen, WPM e precisão.'],
    ['t-link-line', './speedtyping.html', 'Jogar agora →'],
  ],

  'kick-bot': () => [
    ['t-green', '> kick-bot'],
    ['t-muted', '  Bot de chat para Kick.com que roda direto no navegador,'],
    ['t-muted', '  sem instalação. Fila de mensagens e timing humanizado.'],
    ['t-cyan',  '  Stack: HTML + JavaScript em arquivo único'],
  ],

  python: () => [
    ['t-green', '> python'],
    ['t-muted', '  A clássica cobrinha em versão dev: coma os bugs 🐛,'],
    ['t-muted', '  não colida em produção. Acelera a cada 4 bugs.'],
    ['t-link-line', './python.html', 'Jogar agora →'],
  ],

  orcapro: () => [
    ['t-green', '> orcapro  ', 't-yellow', '[em desenvolvimento]'],
    ['t-muted', '  PWA mobile para prestadores de serviço gerarem orçamentos'],
    ['t-muted', '  itemizados em PDF e enviarem direto pelo WhatsApp.'],
    ['t-cyan',  '  Stack: Next.js · Vercel · Supabase · react-pdf'],
  ],

  contato: () => [
    ['t-green', '> Contato'],
    ['', ''],
    ['t-cyan',  '  email     ', 't-link-inline', `mailto:${DATA.email}`, DATA.email],
    ['t-cyan',  '  linkedin  ', 't-link-inline', DATA.linkedin, DATA.linkedin.replace('https://','')],
    ['t-cyan',  '  github    ', 't-link-inline', DATA.github, DATA.github.replace('https://','')],
  ],

  // ── utilitários / easter eggs ──
  whoami: () => [['t-white', 'visitante@lf-portfolio — bem-vindo(a)! 👋']],

  date: () => [['t-white', new Date().toLocaleString('pt-BR')]],

  echo: (args) => [['t-white', args.join(' ') || '']],

  ls: () => [['t-cyan', 'sobre/  skills/  experiencia/  projetos/  contato/']],

  cd: () => [['t-red', 'cd: permissão negada — aqui só tem um diretório: o meu portfólio 😄']],

  sudo: () => [
    ['t-red',   'usuário não está no arquivo sudoers.'],
    ['t-muted', 'este incidente será reportado... ao RH da Ford Slaviero. 🚨'],
  ],

  ping: (args) => {
    const host = args[0] || 'localhost';
    const t = () => (Math.random() * 40 + 8).toFixed(1);
    return [
      ['t-muted', `PING ${host} (127.0.0.1): 56 data bytes`],
      ['t-white', `64 bytes: icmp_seq=0 ttl=64 tempo=${t()} ms`],
      ['t-white', `64 bytes: icmp_seq=1 ttl=64 tempo=${t()} ms`],
      ['t-white', `64 bytes: icmp_seq=2 ttl=64 tempo=${t()} ms`],
      ['t-green', `--- conexão excelente. suporte de TI aprova. ✅`],
    ];
  },

  neofetch: () => [
    ['t-cyan',  '   ██╗     ███████╗    ', 't-white', ` ${DATA.nome}`],
    ['t-cyan',  '   ██║     ██╔════╝    ', 't-muted', ' ─────────────────────────────'],
    ['t-cyan',  '   ██║     █████╗      ', 't-muted', ` cargo:    ${DATA.cargo}`],
    ['t-cyan',  '   ██║     ██╔══╝      ', 't-muted', ` empresa:  ${DATA.empresa}`],
    ['t-cyan',  '   ███████╗██║         ', 't-muted', ` local:    ${DATA.local}`],
    ['t-cyan',  '   ╚══════╝╚═╝         ', 't-muted', ` shell:    lf-sh 1.0 (vanilla js)`],
  ],

  clear: 'CLEAR',
};

// monta o help dinamicamente com base nos comandos principais
COMMANDS.help = () => [
  ['t-white', 'Comandos disponíveis:'],
  ['', ''],
  ['t-cyan', '  sobre        ', 't-muted', 'quem eu sou'],
  ['t-cyan', '  skills       ', 't-muted', 'habilidades técnicas'],
  ['t-cyan', '  experiencia  ', 't-muted', 'onde já trabalhei'],
  ['t-cyan', '  projetos     ', 't-muted', 'o que já construí'],
  ['t-cyan', '  contato      ', 't-muted', 'como falar comigo'],
  ['t-cyan', '  clear        ', 't-muted', 'limpar a tela'],
  ['', ''],
  ['t-muted', '  Dicas: ↑/↓ navega no histórico · Tab completa o comando'],
  ['t-muted', '  Existem comandos escondidos... explore. 👀'],
];

const CMD_NAMES = Object.keys(COMMANDS);

// ══════════════════════════════════════════════
//  MOTOR DO TERMINAL
// ══════════════════════════════════════════════
const termBody = document.getElementById('termBody');
let history = [];
let histIdx = -1;
let inputEl = null;

const PROMPT_HTML = '<span class="t-prompt"><b>felipe@portfolio</b>:~$</span>';

function scrollBottom() { termBody.scrollTop = termBody.scrollHeight; }

// imprime uma linha; aceita pares [classe, texto, classe, texto...]
// classes especiais: 't-link-line' (link em linha própria) e 't-link-inline' (classe, url, rótulo)
function printLine(parts) {
  const div = document.createElement('div');
  div.className = 't-line';
  for (let i = 0; i < parts.length; i += 2) {
    const cls = parts[i], txt = parts[i + 1];
    if (cls === 't-link-line' || cls === 't-link-inline') {
      const a = document.createElement('a');
      a.className = 't-link';
      a.href = txt;
      a.target = txt.startsWith('mailto:') ? '_self' : '_blank';
      a.rel = 'noopener';
      a.textContent = parts[i + 2];
      if (cls === 't-link-line') div.append('  ');
      div.appendChild(a);
      i += 1; // consumiu um item extra (rótulo)
      continue;
    }
    const span = document.createElement('span');
    if (cls) span.className = cls;
    span.textContent = txt;
    div.appendChild(span);
  }
  termBody.insertBefore(div, termBody.lastElementChild);
  scrollBottom();
}

function printLines(lines, delay = 0) {
  if (delay === 0) { lines.forEach(printLine); return Promise.resolve(); }
  return new Promise(res => {
    let i = 0;
    const iv = setInterval(() => {
      printLine(lines[i++]);
      if (i >= lines.length) { clearInterval(iv); res(); }
    }, delay);
  });
}

// cria a linha de input ativa
function createInputRow() {
  const row = document.createElement('div');
  row.className = 't-input-row';
  row.innerHTML = PROMPT_HTML;
  const inp = document.createElement('input');
  inp.className = 't-field';
  inp.autocapitalize = 'off';
  inp.autocomplete = 'off';
  inp.spellcheck = false;
  row.appendChild(inp);
  termBody.appendChild(row);
  inputEl = inp;

  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') { runCommand(inp.value); }
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length && histIdx < history.length - 1) { histIdx++; inp.value = history[history.length - 1 - histIdx]; }
    }
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx > 0) { histIdx--; inp.value = history[history.length - 1 - histIdx]; }
      else { histIdx = -1; inp.value = ''; }
    }
    else if (e.key === 'Tab') {
      e.preventDefault();
      const v = inp.value.trim().toLowerCase();
      if (!v) return;
      const match = CMD_NAMES.filter(c => c.startsWith(v));
      if (match.length === 1) inp.value = match[0];
      else if (match.length > 1) printLine(['t-muted', match.join('  ')]);
    }
  });
}

// ecoa o comando digitado (linha fixa no histórico visual)
function echoCommand(cmd) {
  const div = document.createElement('div');
  div.className = 't-line';
  div.innerHTML = PROMPT_HTML + ' ';
  const span = document.createElement('span');
  span.className = 't-white';
  span.textContent = cmd;
  div.appendChild(span);
  termBody.insertBefore(div, termBody.lastElementChild);
}

function runCommand(raw) {
  const cmdLine = raw.trim();
  echoCommand(cmdLine);
  inputEl.value = '';
  histIdx = -1;

  if (!cmdLine) { scrollBottom(); return; }
  history.push(cmdLine);

  const [name, ...args] = cmdLine.toLowerCase().split(/\s+/);
  const handler = COMMANDS[name];

  if (handler === 'CLEAR' || name === 'clear' || name === 'cls') {
    termBody.querySelectorAll('.t-line').forEach(el => el.remove());
    scrollBottom();
    return;
  }
  if (!handler) {
    printLine(['t-red', `comando não encontrado: ${name}`, 't-muted', '  — digite ', 't-cyan', 'help']);
    return;
  }
  printLines(handler(args));
  printLine(['', '']);
}

// clique em qualquer lugar do terminal foca o input
termBody.addEventListener('click', () => inputEl && inputEl.focus());

// chips de atalho
document.getElementById('chips').addEventListener('click', e => {
  const btn = e.target.closest('.chip');
  if (!btn) return;
  runCommand(btn.dataset.cmd);
  inputEl.focus();
});

// ══════════════════════════════════════════════
//  BOOT
// ══════════════════════════════════════════════
async function boot() {
  createInputRow();
  inputEl.disabled = true;
  await printLines([
    ['t-muted', 'lf-sh v1.0 — inicializando...'],
    ['t-green', '[ OK ] carregando módulo: suporte-de-ti'],
    ['t-green', '[ OK ] carregando módulo: redes'],
    ['t-green', '[ OK ] carregando módulo: javascript-vanilla'],
    ['t-green', '[ OK ] café detectado no sistema ☕'],
    ['', ''],
    ['t-white', `Bem-vindo(a) ao terminal de `, 't-cyan', DATA.nome, 't-white', '!'],
    ['t-muted', 'Digite ', 't-cyan', 'help', 't-muted', ' para ver os comandos.'],
    ['', ''],
  ], 160);
  inputEl.disabled = false;
  // não força foco no mobile (evita abrir o teclado sozinho)
  if (!window.matchMedia('(pointer:coarse)').matches) inputEl.focus();
}

boot();
