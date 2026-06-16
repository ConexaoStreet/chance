/* ═══════════════════════════════════════════════
   GALLERY.JS — Coverflow 3D com suporte a touch
═══════════════════════════════════════════════ */

class CoverflowGallery {
  constructor() {
    this.track = document.getElementById('gallery-track');
    this.dotsContainer = document.getElementById('gallery-dots');
    this.prevBtn = document.getElementById('gal-prev');
    this.nextBtn = document.getElementById('gal-next');

    // Fotos a exibir — adicione paths aqui ou elas são descobertas automaticamente
    // Coloque arquivos em assets/photos/ com nomes como: photo1.jpg, photo2.jpg...
    // O sistema vai usar placeholders enquanto não há fotos reais
    this.photoList = [
      { src: 'assets/photos/photo1.jpg',  caption: 'Nosso começo' },
      { src: 'assets/photos/photo2.jpg',  caption: 'Memória querida' },
      { src: 'assets/photos/photo3.jpg',  caption: 'Aquele dia especial' },
      { src: 'assets/photos/photo4.jpg',  caption: 'Risadas sem motivo' },
      { src: 'assets/photos/photo5.jpg',  caption: 'Só nós dois' },
      { src: 'assets/photos/photo6.jpg',  caption: 'Um momento guardado' },
      { src: 'assets/photos/photo7.jpg',  caption: 'Para sempre aqui' },
      { src: 'assets/photos/photo8.jpg',  caption: 'Você linda assim' },
      { src: 'assets/photos/photo9.jpg',  caption: 'Nossa história' },
      { src: 'assets/photos/photo10.jpg', caption: 'E muito mais vem' }
    ];

    this.current = 0;
    this.total = this.photoList.length;

    // Touch/drag state
    this.startX = 0;
    this.isDragging = false;
    this.dragDelta = 0;

    this.build();
    this.bindEvents();
    this.render();
  }

  build() {
    if (!this.track) return;
    this.track.innerHTML = '';

    this.photoList.forEach((photo, i) => {
      const slide = document.createElement('div');
      slide.className = 'gallery-slide';
      slide.dataset.index = i;

      const img = document.createElement('img');
      img.className = 'gallery-slide-img';
      img.alt = photo.caption || `Memória ${i + 1}`;
      img.loading = 'lazy';
      img.src = photo.src;

      const placeholder = document.createElement('div');
      placeholder.className = 'gallery-slide-placeholder';
      placeholder.innerHTML = `<span>📷</span><small>Adicione ${photo.src}</small>`;

      img.onerror = () => {
        img.style.display = 'none';
        placeholder.style.display = 'flex';
      };
      img.onload = () => {
        placeholder.style.display = 'none';
      };

      slide.appendChild(img);
      slide.appendChild(placeholder);
      slide.addEventListener('click', () => {
        if (i !== this.current) this.goTo(i);
      });

      this.track.appendChild(slide);
    });

    // Dots
    if (this.dotsContainer) {
      this.dotsContainer.innerHTML = '';
      this.photoList.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Foto ${i + 1}`);
        dot.addEventListener('click', () => this.goTo(i));
        this.dotsContainer.appendChild(dot);
      });
    }
  }

  bindEvents() {
    if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prev());
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.next());

    // Keyboard
    document.addEventListener('keydown', e => {
      if (!document.getElementById('main-content')?.classList.contains('main-revealed')) return;
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });

    // Touch / mouse drag
    const coverflow = document.getElementById('gallery-coverflow');
    if (!coverflow) return;

    // Touch
    coverflow.addEventListener('touchstart', e => {
      this.startX = e.touches[0].clientX;
      this.isDragging = true;
    }, { passive: true });

    coverflow.addEventListener('touchmove', e => {
      if (!this.isDragging) return;
      this.dragDelta = e.touches[0].clientX - this.startX;
    }, { passive: true });

    coverflow.addEventListener('touchend', () => {
      if (this.dragDelta < -50) this.next();
      else if (this.dragDelta > 50) this.prev();
      this.isDragging = false;
      this.dragDelta = 0;
    });

    // Mouse
    coverflow.addEventListener('mousedown', e => {
      this.startX = e.clientX;
      this.isDragging = true;
    });
    coverflow.addEventListener('mousemove', e => {
      if (!this.isDragging) return;
      this.dragDelta = e.clientX - this.startX;
    });
    coverflow.addEventListener('mouseup', () => {
      if (this.dragDelta < -50) this.next();
      else if (this.dragDelta > 50) this.prev();
      this.isDragging = false;
      this.dragDelta = 0;
    });
    coverflow.addEventListener('mouseleave', () => {
      this.isDragging = false;
      this.dragDelta = 0;
    });
  }

  render() {
    const slides = this.track?.querySelectorAll('.gallery-slide');
    if (!slides) return;

    slides.forEach((slide, i) => {
      const offset = i - this.current;
      const absOff = Math.abs(offset);

      slide.classList.toggle('active', i === this.current);

      // Coverflow 3D transform
      const rotateY = Math.max(-55, Math.min(55, offset * -40));
      const translateX = offset * 65; // % of slide width
      const translateZ = absOff === 0 ? 0 : -Math.min(absOff * 80, 180);
      const scale = absOff === 0 ? 1 : Math.max(0.72, 1 - absOff * 0.14);
      const opacity = absOff > 3 ? 0 : Math.max(0, 1 - absOff * 0.25);

      slide.style.cssText = `
        transform: translateX(${translateX}%) rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(${scale});
        opacity: ${opacity};
        z-index: ${10 - absOff};
        transform-style: preserve-3d;
        transition: transform 0.55s cubic-bezier(0.16,1,0.3,1), opacity 0.55s ease;
      `;
    });

    // Dots
    const dots = this.dotsContainer?.querySelectorAll('.gallery-dot');
    dots?.forEach((d, i) => {
      d.classList.toggle('active', i === this.current);
    });
  }

  goTo(index) {
    this.current = Math.max(0, Math.min(this.total - 1, index));
    this.render();
  }

  next() { this.goTo(this.current + 1 < this.total ? this.current + 1 : 0); }
  prev() { this.goTo(this.current - 1 >= 0 ? this.current - 1 : this.total - 1); }
}

// ─────────────────────────────────────────────
// POLAROID MURAL
// ─────────────────────────────────────────────
function buildPolaroidMural() {
  const board = document.getElementById('polaroid-board');
  if (!board) return;

  // Mesmas fotos + captions poéticas para o mural
  const polaroids = [
    { src: 'assets/photos/photo1.jpg',  caption: 'o começo' },
    { src: 'assets/photos/photo2.jpg',  caption: 'nossa bolha' },
    { src: 'assets/photos/photo3.jpg',  caption: 'risadas' },
    { src: 'assets/photos/photo4.jpg',  caption: 'esse dia' },
    { src: 'assets/photos/photo5.jpg',  caption: 'saudade' },
    { src: 'assets/photos/photo6.jpg',  caption: 'você assim' },
    { src: 'assets/photos/photo7.jpg',  caption: 'memória minha' },
    { src: 'assets/photos/photo8.jpg',  caption: 'entre nós' },
    { src: 'assets/photos/photo9.jpg',  caption: 'que saudade' },
    { src: 'assets/photos/photo10.jpg', caption: 'pra sempre' },
  ];

  board.innerHTML = '';

  polaroids.forEach((p, i) => {
    const pol = document.createElement('div');
    pol.className = 'polaroid';

    // Rotação aleatória leve: entre -8 e +8 graus
    const rotation = (Math.random() - 0.5) * 14;
    pol.style.transform = `rotate(${rotation}deg)`;
    pol.style.zIndex = i;

    const img = document.createElement('img');
    img.className = 'polaroid-img';
    img.src = p.src;
    img.alt = p.caption;
    img.loading = 'lazy';

    const ph = document.createElement('div');
    ph.className = 'polaroid-img-placeholder';
    ph.textContent = '📸';
    ph.style.display = 'none';

    img.onerror = () => { img.style.display = 'none'; ph.style.display = 'flex'; };

    const caption = document.createElement('p');
    caption.className = 'polaroid-caption';
    caption.textContent = p.caption;

    pol.appendChild(img);
    pol.appendChild(ph);
    pol.appendChild(caption);

    // Mantém rotação original no hover via dataset
    pol.dataset.rotation = rotation;
    pol.addEventListener('mouseenter', () => {
      pol.style.transform = `rotate(${rotation * 0.3}deg) translateY(-8px) scale(1.04)`;
    });
    pol.addEventListener('mouseleave', () => {
      pol.style.transform = `rotate(${rotation}deg)`;
    });

    board.appendChild(pol);
  });
}

window.GalleryModule = { CoverflowGallery, buildPolaroidMural };
