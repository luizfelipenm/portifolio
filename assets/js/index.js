// Hamburger menu
  const hamburger = document.getElementById('hamburger');
  const navDrawer = document.getElementById('navDrawer');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navDrawer.classList.toggle('open');
    document.body.style.overflow = navDrawer.classList.contains('open') ? 'hidden' : '';
  });
  function closeDrawer() {
    hamburger.classList.remove('open');
    navDrawer.classList.remove('open');
    document.body.style.overflow = '';
  }
  // Fechar ao clicar fora dos links (no fundo do drawer)
  navDrawer.addEventListener('click', e => {
    if (e.target === navDrawer) closeDrawer();
  });

  // Cursor glow (only desktop)
  const glow = document.getElementById('cursorGlow');
  if (window.matchMedia('(pointer: coarse)').matches) glow.style.display = 'none';
  document.addEventListener('mousemove', e => {
    if (glow.style.display !== 'none') {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    }
  });

  // Scroll reveal
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Stagger skill cards on scroll
  const skillObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const cards = document.querySelectorAll('.skill-card');
        cards.forEach((c, i) => {
          setTimeout(() => c.style.animationPlayState = 'running', i * 60);
        });
        skillObs.disconnect();
      }
    });
  }, { threshold: 0.1 });
  const skillSection = document.getElementById('habilidades');
  if (skillSection) skillObs.observe(skillSection);

  // Pause skill card animations until visible
  document.querySelectorAll('.skill-card').forEach(c => {
    c.style.animationPlayState = 'paused';
  });

  // ── CAROUSEL ──
  (function() {
    const track   = document.getElementById('carouselTrack');
    const dotsWrap = document.getElementById('carouselDots');
    const prevBtn  = document.getElementById('carouselPrev');
    const nextBtn  = document.getElementById('carouselNext');
    const currentEl = document.getElementById('carouselCurrent');
    const totalEl   = document.getElementById('carouselTotal');

    const cards = track.querySelectorAll('.exp-card');
    const total = cards.length;
    let current = 0;
    let startX = 0, isDragging = false;

    totalEl.textContent = total;

    // Build dots
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Slide ' + (i + 1));
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    function goTo(idx) {
      current = Math.max(0, Math.min(idx, total - 1));
      track.style.transform = `translateX(-${current * 100}%)`;
      currentEl.textContent = current + 1;
      dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) =>
        d.classList.toggle('active', i === current));
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === total - 1;
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    // Touch/drag swipe
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
    });

    // Keyboard
    document.addEventListener('keydown', e => {
      const sec = document.getElementById('experiencia');
      const rect = sec.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        if (e.key === 'ArrowLeft') goTo(current - 1);
        if (e.key === 'ArrowRight') goTo(current + 1);
      }
    });

    goTo(0);
  })();
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 100) current = s.id;
    });
    navLinks.forEach(a => {
      a.style.color = a.getAttribute('href') === '#' + current ? 'var(--accent)' : '';
    });
  });

// ══════════════════════════════════════════════
//  BOOT SCREEN — roda 1x por sessão
// ══════════════════════════════════════════════
(function () {
  const screen = document.getElementById('bootScreen');
  if (!screen) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let jaBotou = false;
  try { jaBotou = sessionStorage.getItem('lf-boot') === '1'; } catch (e) {}

  // já viu o boot nesta sessão (ou prefere menos animação): pula direto
  if (jaBotou || reduced) { screen.classList.add('hidden'); return; }

  const log = document.getElementById('bootLog');
  const LINES = [
    ['info', 'LF-BIOS v1.0 — Luiz Felipe Nascimento Mota'],
    ['',     'Verificando hardware................ OK'],
    ['ok',   '[ OK ] módulo carregado: help-desk'],
    ['ok',   '[ OK ] módulo carregado: redes & infraestrutura'],
    ['ok',   '[ OK ] módulo carregado: javascript-vanilla'],
    ['ok',   '[ OK ] café no sistema ☕'],
    ['w',    'Iniciando portfólio...'],
  ];

  let i = 0;
  const iv = setInterval(() => {
    const [cls, txt] = LINES[i++];
    const div = document.createElement('div');
    if (cls) div.className = cls;
    div.textContent = txt;
    log.appendChild(div);
    if (i >= LINES.length) { clearInterval(iv); setTimeout(encerrar, 420); }
  }, 210);

  function encerrar() {
    clearInterval(iv);
    try { sessionStorage.setItem('lf-boot', '1'); } catch (e) {}
    screen.classList.add('off');
    setTimeout(() => screen.classList.add('hidden'), 500);
  }

  // clique ou tecla pula o boot
  screen.addEventListener('click', encerrar);
  document.addEventListener('keydown', encerrar, { once: true });
})();
