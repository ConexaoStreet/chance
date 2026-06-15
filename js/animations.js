/* ═══════════════════════════════════════════════
   ANIMATIONS.JS — Partículas, Tela de Decisão,
   Transição Cinematográfica e Canvas Effects
═══════════════════════════════════════════════ */

// ─────────────────────────────────────────────
// 1. CANVAS DE PARTÍCULAS — TELA INICIAL
// ─────────────────────────────────────────────
class ParticleSystem {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.opts = {
      count: opts.count || 80,
      colors: opts.colors || ['#c97b8e', '#d4a85a', '#e8b4c2', '#fdf6f0'],
      minSize: opts.minSize || 1,
      maxSize: opts.maxSize || 3.5,
      speed: opts.speed || 0.3,
      ...opts
    };
    this.animId = null;
    this.resize();
    this.spawn();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  spawn() {
    this.particles = [];
    for (let i = 0; i < this.opts.count; i++) {
      this.particles.push(this.createParticle(true));
    }
  }

  createParticle(initial = false) {
    const size = this.opts.minSize + Math.random() * (this.opts.maxSize - this.opts.minSize);
    return {
      x: Math.random() * this.canvas.width,
      y: initial ? Math.random() * this.canvas.height : this.canvas.height + size,
      size,
      color: this.opts.colors[Math.floor(Math.random() * this.opts.colors.length)],
      speedX: (Math.random() - 0.5) * this.opts.speed,
      speedY: -(this.opts.speed * 0.5 + Math.random() * this.opts.speed),
      opacity: 0,
      targetOpacity: 0.2 + Math.random() * 0.6,
      life: 0,
      maxLife: 120 + Math.random() * 200,
      twinkle: Math.random() * Math.PI * 2
    };
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles.forEach((p, i) => {
      p.life++;
      p.twinkle += 0.03;
      const twinkleFactor = 0.7 + 0.3 * Math.sin(p.twinkle);

      if (p.life < 30) p.opacity = Math.min(p.targetOpacity, p.opacity + p.targetOpacity / 30);
      if (p.life > p.maxLife - 30) p.opacity = Math.max(0, p.opacity - p.targetOpacity / 30);

      p.x += p.speedX;
      p.y += p.speedY;

      this.ctx.save();
      this.ctx.globalAlpha = p.opacity * twinkleFactor;
      this.ctx.fillStyle = p.color;
      this.ctx.shadowBlur = p.size * 4;
      this.ctx.shadowColor = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();

      if (p.life >= p.maxLife || p.y < -10) {
        this.particles[i] = this.createParticle();
      }
    });
  }

  start() {
    const loop = () => {
      this.draw();
      this.animId = requestAnimationFrame(loop);
    };
    loop();
  }

  stop() {
    if (this.animId) cancelAnimationFrame(this.animId);
  }
}

// ─────────────────────────────────────────────
// 2. CORAÇÕES FLUTUANTES
// ─────────────────────────────────────────────
function spawnFloatingHearts(container, count = 12) {
  if (!container) return;
  const hearts = ['♥', '❤', '♡', '💕', '💗'];
  container.innerHTML = '';

  for (let i = 0; i < count; i++) {
    const h = document.createElement('span');
    h.className = 'floating-heart';
    h.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    h.style.cssText = `
      left: ${Math.random() * 100}%;
      font-size: ${10 + Math.random() * 20}px;
      animation-duration: ${6 + Math.random() * 8}s;
      animation-delay: ${Math.random() * 8}s;
      color: hsl(${340 + Math.random() * 20}deg, ${60 + Math.random() * 30}%, ${60 + Math.random() * 20}%);
      opacity: 0;
      position: absolute;
    `;
    container.appendChild(h);
  }
}

// ─────────────────────────────────────────────
// 3. BOTÃO "NÃO" QUE FOGE
// ─────────────────────────────────────────────
class EscapeButton {
  constructor(btn) {
    this.btn = btn;
    this.active = true;
    this.hasEscaped = false;

    this.placeNextToYes();

    // Correção: Agora foge não apenas no clique, mas ao passar o mouse ou tocar na tela
    this.btn.addEventListener('mouseenter', () => this.flee());
    this.btn.addEventListener('click', (e) => {
      e.preventDefault();
      this.flee();
    });
    this.btn.addEventListener('touchstart', (e) => {
      e.preventDefault(); 
      this.flee();
    }, { passive: false });
  }

  placeNextToYes() {
    const btnYes = document.getElementById('btn-yes');
    if (!btnYes) return;

    // Correção crucial: Remove o botão do fluxo HTML para que ele não fique "colado"
    this.btn.style.position = 'fixed';
    this.btn.style.zIndex = '999';

    const rect = btnYes.getBoundingClientRect();
    const bh = this.btn.offsetHeight || 48;

    // Posiciona à direita do botão SIM inicialmente
    const x = rect.right + 20;
    const y = rect.top + (rect.height / 2) - (bh / 2);

    this.x = x;
    this.y = y;
    this.btn.style.left = `${this.x}px`;
    this.btn.style.top = `${this.y}px`;
    this.btn.style.transition = 'none';
  }

  flee() {
    if (!this.active) return;

    const margin = 20;
    const bw = this.btn.offsetWidth || 110;
    const bh = this.btn.offsetHeight || 48;

    let newX, newY, tries = 0;
    do {
      newX = margin + Math.random() * (window.innerWidth - bw - margin * 2);
      newY = margin + Math.random() * (window.innerHeight - bh - margin * 2);
      tries++;
    } while (
      Math.abs(newX - this.x) < 150 &&
      Math.abs(newY - this.y) < 100 &&
      tries < 10
    );

    this.x = newX;
    this.y = newY;

    this.btn.style.transition = 'left 0.4s cubic-bezier(0.16,1,0.3,1), top 0.4s cubic-bezier(0.16,1,0.3,1)';
    this.btn.style.left = `${this.x}px`;
    this.btn.style.top = `${this.y}px`;
  }

  destroy() {
    this.active = false;
  }
}

// ─────────────────────────────────────────────
// 4. TRANSIÇÃO CINEMATOGRÁFICA
// ─────────────────────────────────────────────
class CinematicTransition {
  constructor(overlay) {
    this.overlay = overlay;
    this.canvas = overlay ? overlay.querySelector('#transition-canvas') : null;
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.hearts = overlay ? overlay.querySelector('#transition-hearts') : null;
    this.text = overlay ? overlay.querySelector('.transition-text') : null;
    this.particles = [];
    this.animId = null;
    this.startTime = null;
  }

  play() {
    return new Promise(resolve => {
      if (!this.overlay) return resolve(); // Trava de segurança
      
      this.overlay.classList.add('active');

      if (this.canvas && this.ctx) {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.spawnParticles();
        this.startTime = Date.now();
        this.animateCanvas();
      }

      if (this.hearts) {
        this.spawnHearts();
      }

      if (this.text) {
        setTimeout(() => {
          this.text.classList.add('visible');
        }, 600);
      }

      // Resolve a promise independente dos elementos existirem ou não
      setTimeout(() => {
        if (this.text) this.text.classList.remove('visible');
        resolve();
      }, 2400);
    });
  }

  fadeOut() {
    return new Promise(resolve => {
      if (!this.overlay) return resolve();

      // Fallback caso o GSAP falhe ou demore a responder
      let isResolved = false;
      const safeResolve = () => {
        if (isResolved) return;
        isResolved = true;
        this.overlay.style.display = 'none';
        if (this.animId) cancelAnimationFrame(this.animId);
        resolve();
      };

      setTimeout(safeResolve, 1000); // Garante que a transição finalize em no máx 1s

      if (typeof gsap !== 'undefined') {
        gsap.to(this.overlay, {
          opacity: 0, duration: 0.8, ease: 'power2.inOut',
          onComplete: safeResolve
        });
      } else {
        safeResolve();
      }
    });
  }

  spawnHearts() {
    this.hearts.innerHTML = '';
    for (let i = 0; i < 20; i++) {
      const h = document.createElement('span');
      h.textContent = ['♥','❤','💗','💕'][Math.floor(Math.random() * 4)];
      h.style.cssText = `
        position: absolute;
        left: ${20 + Math.random() * 60}%;
        top: ${20 + Math.random() * 60}%;
        font-size: ${14 + Math.random() * 28}px;
        color: hsl(${340 + Math.random() * 20}deg, 70%, 70%);
        opacity: 0;
        transform: scale(0);
        pointer-events: none;
        transition: opacity 0.5s, transform 0.6s cubic-bezier(0.16,1,0.3,1);
        transition-delay: ${Math.random() * 0.4}s;
      `;
      this.hearts.appendChild(h);
      setTimeout(() => {
        h.style.opacity = '0.9';
        h.style.transform = 'scale(1) translateY(-20px)';
      }, 50 + Math.random() * 200);
    }
  }

  spawnParticles() {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const colors = ['#c97b8e','#e8b4c2','#d4a85a','#ffffff','#9a4e65'];
    for (let i = 0; i < 120; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      this.particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1, decay: 0.012 + Math.random() * 0.01
      });
    }
  }

  animateCanvas() {
    if (!this.ctx || !this.canvas) return;
    
    const loop = () => {
      const t = (Date.now() - this.startTime) / 1000;
      this.ctx.fillStyle = `rgba(26, 10, 20, 0.15)`;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.life -= p.decay;
        if (p.life <= 0) return;
        this.ctx.save();
        this.ctx.globalAlpha = p.life * 0.8;
        this.ctx.fillStyle = p.color;
        this.ctx.shadowBlur = 6;
        this.ctx.shadowColor = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      });

      if (t < 2.5) this.animId = requestAnimationFrame(loop);
    };
    loop();
  }
}

// ─────────────────────────────────────────────
// 5. HERO CANVAS — estrelas ambiente
// ─────────────────────────────────────────────
function initHeroCanvas(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];
  let W, H;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    stars = Array.from({ length: 80 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 0.5 + Math.random() * 1.5,
      alpha: Math.random(),
      speed: 0.003 + Math.random() * 0.007,
      phase: Math.random() * Math.PI * 2
    }));
  }

  resize();
  window.addEventListener('resize', resize);

  let t = 0;
  function loop() {
    t += 0.016;
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      const a = 0.2 + 0.6 * (0.5 + 0.5 * Math.sin(t * s.speed * 60 + s.phase));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = '#e8b4c2';
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#c97b8e';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    requestAnimationFrame(loop);
  }
  loop();
}

// ─────────────────────────────────────────────
// 6. FUTURE / FINAL CANVAS — partículas suaves
// ─────────────────────────────────────────────
function initAmbientCanvas(canvas, color = '#c97b8e') {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts = [];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    pts = Array.from({ length: 40 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 1 + Math.random() * 2,
      a: Math.random()
    }));
  }
  resize();
  window.addEventListener('resize', resize);

  function loop() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
      ctx.save();
      ctx.globalAlpha = 0.15 + p.a * 0.3;
      ctx.fillStyle = color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    requestAnimationFrame(loop);
  }
  loop();
}

// ─────────────────────────────────────────────
// 7. SCROLL REVEAL — IntersectionObserver
// ─────────────────────────────────────────────
function initScrollReveal() {
  const targets = [
    '.msg-content',
    '.timeline-item',
    '.learned-card',
    '.future-item',
    '.polaroid',
    '.section-title',
    '.section-eyebrow',
    '.final-heart-big',
    '.final-title',
    '.final-signature',
    '.final-name'
  ];

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const delay = parseFloat(entry.target.dataset.delay || 0);
        setTimeout(() => {
          entry.target.classList.add('in');
        }, delay);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.dataset.delay = i * 80;
      obs.observe(el);
    });
  });
}

// ─────────────────────────────────────────────
// 8. LENIS SMOOTH SCROLL INIT
// ─────────────────────────────────────────────
function initLenis() {
  if (typeof Lenis === 'undefined') return;
  const lenis = new Lenis({
    duration: 1.3,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    touchMultiplier: 1.5
  });

  if (typeof gsap !== 'undefined') {
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  return lenis;
}

// ─────────────────────────────────────────────
// 9. PARALLAX SUAVE NO HERO
// ─────────────────────────────────────────────
function initParallax() {
  const heroPhoto = document.querySelector('.hero-photo-wrap');
  const heroText = document.querySelector('.hero-text');
  if (!heroPhoto && !heroText) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (heroPhoto) heroPhoto.style.transform = `translateY(${scrolled * 0.25}px)`;
    if (heroText) heroText.style.transform = `translateY(${scrolled * 0.1}px)`;
  }, { passive: true });
}

// Exports para app.js
window.AnimationsModule = {
  ParticleSystem,
  EscapeButton,
  CinematicTransition,
  spawnFloatingHearts,
  initHeroCanvas,
  initAmbientCanvas,
  initScrollReveal,
  initLenis,
  initParallax
};
