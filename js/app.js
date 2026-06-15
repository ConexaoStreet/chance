/* ═══════════════════════════════════════════════
   APP.JS — Orquestração principal
   Inicializa todos os módulos na ordem certa
═══════════════════════════════════════════════ */

(function () {
  'use strict';

  const {
    ParticleSystem,
    EscapeButton,
    CinematicTransition,
    spawnFloatingHearts,
    initHeroCanvas,
    initAmbientCanvas,
    initScrollReveal,
    initLenis,
    initParallax
  } = window.AnimationsModule;

  const { CoverflowGallery, buildPolaroidMural } = window.GalleryModule;
  const { MusicPlayer } = window.MusicModule;

  // ─────────────────────────────────────────────
  // Estado global
  // ─────────────────────────────────────────────
  let particleSystem = null;
  let escapeBtn = null;
  let cinematicTrans = null;
  let musicPlayer = null;
  let gallery = null;

  // ─────────────────────────────────────────────
  // Iniciar tela de decisão
  // ─────────────────────────────────────────────
  function initDecisionScreen() {
    const canvas = document.getElementById('particle-canvas');
    const heartsContainer = document.getElementById('floating-hearts');
    const btnNo = document.getElementById('btn-no');
    const btnYes = document.getElementById('btn-yes');
    const overlay = document.getElementById('transition-overlay');

    // Partículas no fundo
    if (canvas) {
      particleSystem = new ParticleSystem(canvas, { count: 90 });
      particleSystem.start();
    }

    // Corações flutuantes
    if (heartsContainer) spawnFloatingHearts(heartsContainer, 16);

    // Botão NÃO que foge — só ativa após o layout estar pronto
    if (btnNo) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          escapeBtn = new EscapeButton(btnNo);
        });
      });
    }

    // Transição cinematográfica
    if (overlay) {
      cinematicTrans = new CinematicTransition(overlay);
    }

    // Evento YES
    if (btnYes) {
      btnYes.addEventListener('click', onYesClicked);
    }
  }

  // ─────────────────────────────────────────────
  // Ao clicar em SIM
  // ─────────────────────────────────────────────
  async function onYesClicked() {
    const btnYes = document.getElementById('btn-yes');
    const decisionScreen = document.getElementById('decision-screen');

    // Desabilitar botões
    if (btnYes) btnYes.style.pointerEvents = 'none';
    if (escapeBtn) escapeBtn.destroy();

    // Parar partículas da tela de decisão
    if (particleSystem) particleSystem.stop();

    // Animação de saída da tela de decisão
    gsap.to(decisionScreen, {
      opacity: 0, scale: 0.97, duration: 0.6, ease: 'power2.in',
      onComplete: () => { decisionScreen.style.display = 'none'; }
    });

    // Iniciar transição cinematográfica
    await cinematicTrans.play();

    // Revelar conteúdo principal enquanto a transição ainda está visível
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.classList.remove('hidden');
      mainContent.classList.add('reveal');
    }

    // Espera um pouco e faz fade-out da transição
    await new Promise(r => setTimeout(r, 400));

    // Força a remoção do overlay caso a animação falhe
    const overlay = document.getElementById('transition-overlay');

    try {
      if (cinematicTrans) {
        await cinematicTrans.fadeOut();
      }
    } finally {
      if (overlay) {
        overlay.style.opacity = '0';
        overlay.style.display = 'none';
        overlay.style.pointerEvents = 'none';
        overlay.classList.remove('active');
      }
    }

    // Iniciar todo o conteúdo principal
    initMainContent();
  }

  // ─────────────────────────────────────────────
  // Inicializar conteúdo principal
  // ─────────────────────────────────────────────
  function initMainContent() {

    // Smooth scroll
    initLenis();

    // Parallax no hero
    initParallax();

    // Canvas ambient effects
    initHeroCanvas(document.getElementById('hero-canvas'));
    initAmbientCanvas(document.getElementById('future-canvas'), '#c97b8e');

    // Galeria Coverflow
    gallery = new CoverflowGallery();

    // Mural polaroid
    buildPolaroidMural();

    // Scroll reveal
    requestAnimationFrame(() => {
      initScrollReveal();
      animateHeroIn();
    });

    // Music player
    musicPlayer = new MusicPlayer();
    musicPlayer.initAfterInteraction();

    // Textos externos (se disponíveis)
    loadExternalTexts();

    // GSAP ScrollTrigger para seções avançadas
    initGSAPAnimations();
  }

  // ─────────────────────────────────────────────
  // Hero — animação de entrada
  // ─────────────────────────────────────────────
  function animateHeroIn() {
    const tl = gsap.timeline({ delay: 0.2 });

    tl.from('.hero-photo-frame', {
      opacity: 0, scale: 0.85, y: 30, duration: 1.2,
      ease: 'power3.out'
    })
    .from('.hero-eyebrow', {
      opacity: 0, y: 15, duration: 0.8, ease: 'power2.out'
    }, '-=0.6')
    .from('.hero-title', {
      opacity: 0, y: 20, duration: 1, ease: 'power3.out'
    }, '-=0.5')
    .from('.hero-subtitle', {
      opacity: 0, y: 15, duration: 0.8, ease: 'power2.out'
    }, '-=0.4')
    .from('.hero-scroll-hint', {
      opacity: 0, duration: 0.6
    }, '-=0.2');

    // Adiciona classes "in" para fallback CSS
    setTimeout(() => {
      document.querySelectorAll('.hero-eyebrow, .hero-title, .hero-subtitle')
        .forEach(el => el.classList.add('in'));
    }, 200);
  }

  // ─────────────────────────────────────────────
  // GSAP ScrollTrigger — animações sofisticadas
  // ─────────────────────────────────────────────
  function initGSAPAnimations() {
    if (typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // Message sections — linha por linha
    document.querySelectorAll('.msg-content p').forEach((p, i) => {
      gsap.from(p, {
        scrollTrigger: { trigger: p, start: 'top 85%', once: true },
        opacity: 0, y: 24, duration: 0.9,
        delay: i * 0.12,
        ease: 'power3.out'
      });
    });

    // Future items — stagger
    gsap.from('.future-item', {
      scrollTrigger: { trigger: '.future-items', start: 'top 80%', once: true },
      opacity: 0, x: -40, duration: 0.9,
      stagger: 0.15, ease: 'power3.out'
    });

    // Learned cards — stagger
    gsap.from('.learned-card', {
      scrollTrigger: { trigger: '.learned-cards', start: 'top 80%', once: true },
      opacity: 0, y: 40, scale: 0.95, duration: 0.8,
      stagger: 0.1, ease: 'back.out(1.4)'
    });

    // Section titles
    document.querySelectorAll('.section-title').forEach(el => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        opacity: 0, y: 30, duration: 1, ease: 'power3.out'
      });
    });

    // Timeline cards
    document.querySelectorAll('.timeline-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: 'top 85%', once: true },
        opacity: 0,
        x: i % 2 === 0 ? -50 : 50,
        duration: 0.9, ease: 'power3.out'
      });
    });

    // Final section
    gsap.from('.final-heart-big', {
      scrollTrigger: { trigger: '.final-section', start: 'top 70%', once: true },
      scale: 0, opacity: 0, duration: 0.8, ease: 'back.out(2)'
    });
    gsap.from('.final-title', {
      scrollTrigger: { trigger: '.final-section', start: 'top 70%', once: true },
      opacity: 0, y: 30, duration: 1.1, delay: 0.3, ease: 'power3.out'
    });
    gsap.from(['.final-signature', '.final-name'], {
      scrollTrigger: { trigger: '.final-section', start: 'top 70%', once: true },
      opacity: 0, y: 20, duration: 0.8, delay: 0.6, stagger: 0.2, ease: 'power2.out'
    });

    // Spawn partículas finais ao entrar na seção
    ScrollTrigger.create({
      trigger: '.final-section',
      start: 'top 60%',
      once: true,
      onEnter: spawnFinalParticles
    });
  }

  // ─────────────────────────────────────────────
  // Partículas finais em corações
  // ─────────────────────────────────────────────
  function spawnFinalParticles() {
    const container = document.getElementById('final-particles');
    if (!container) return;

    for (let i = 0; i < 18; i++) {
      const h = document.createElement('div');
      h.style.cssText = `
        position: absolute;
        left: ${Math.random() * 100}%;
        bottom: ${Math.random() * 50}%;
        font-size: ${12 + Math.random() * 18}px;
        color: hsl(${338 + Math.random() * 20}deg, 70%, ${60 + Math.random() * 20}%);
        opacity: 0;
        animation: floatHeart ${5 + Math.random() * 6}s ${Math.random() * 4}s linear infinite;
        pointer-events: none;
      `;
      h.textContent = ['♥', '❤', '♡'][Math.floor(Math.random() * 3)];
      container.appendChild(h);
    }
  }

  // ─────────────────────────────────────────────
  // Carrega textos externos (fetch)
  // Funciona quando servido via HTTP; em file:// usa defaults
  // ─────────────────────────────────────────────
  async function loadExternalTexts() {
    const elements = document.querySelectorAll('[data-text-file]');
    for (const el of elements) {
      const file = el.dataset.textFile;
      try {
        const res = await fetch(file);
        if (!res.ok) continue;
        const text = await res.text();
        if (text.trim()) {
          // Se o texto contém quebras de linha duplas, divide em parágrafos
          const paragraphs = text.trim().split(/\n\n+/);
          if (paragraphs.length > 1) {
            el.innerHTML = paragraphs.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
          } else {
            el.textContent = text.trim();
          }
        }
      } catch (e) {
        // Sem servidor HTTP, usa texto padrão do HTML
      }
    }
  }

  // ─────────────────────────────────────────────
  // Inicialização
  // ─────────────────────────────────────────────
  function init() {
    // Garante que o player está visível/flexível no início
    const player = document.getElementById('music-player');
    if (player) player.style.display = 'flex';

    initDecisionScreen();
  }

  // Espera o DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
