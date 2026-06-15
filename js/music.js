/* ═══════════════════════════════════════════════
   MUSIC.JS — Player Customizado para "Te Vivo"
═══════════════════════════════════════════════ */

class MusicPlayer {
  constructor() {
    this.audio     = document.getElementById('main-audio');
    this.playBtn   = document.getElementById('play-btn');
    this.iconPlay  = this.playBtn?.querySelector('.icon-play');
    this.iconPause = this.playBtn?.querySelector('.icon-pause');
    this.progressBar   = document.getElementById('progress-bar');
    this.progressFill  = document.getElementById('progress-fill');
    this.progressThumb = document.getElementById('progress-thumb');
    this.timeCurrent   = document.getElementById('time-current');
    this.timeTotal     = document.getElementById('time-total');
    this.volumeSlider  = document.getElementById('volume-slider');
    this.vinyl         = document.getElementById('vinyl-disc');
    this.playerEl      = document.getElementById('music-player');

    this.isPlaying = false;
    this.isSeeking = false;

    if (this.audio) {
      this.audio.volume = 0.7;
      this.bindEvents();
    }
  }

  bindEvents() {
    // Play/Pause
    this.playBtn?.addEventListener('click', () => this.toggle());

    // Progress updates
    this.audio.addEventListener('timeupdate', () => this.onTimeUpdate());
    this.audio.addEventListener('loadedmetadata', () => this.onMetadata());
    this.audio.addEventListener('ended', () => this.onEnded());
    this.audio.addEventListener('error', () => this.onError());

    // Progress bar click/drag
    if (this.progressBar) {
      this.progressBar.addEventListener('click', e => this.seek(e));
      this.progressBar.addEventListener('mousedown', e => {
        this.isSeeking = true;
        this.seek(e);
      });
      window.addEventListener('mousemove', e => {
        if (this.isSeeking) this.seek(e);
      });
      window.addEventListener('mouseup', () => { this.isSeeking = false; });

      // Touch
      this.progressBar.addEventListener('touchstart', e => {
        this.isSeeking = true;
        this.seek(e.touches[0]);
      }, { passive: true });
      window.addEventListener('touchmove', e => {
        if (this.isSeeking) this.seek(e.touches[0]);
      }, { passive: true });
      window.addEventListener('touchend', () => { this.isSeeking = false; });
    }

    // Volume
    this.volumeSlider?.addEventListener('input', () => {
      this.audio.volume = parseFloat(this.volumeSlider.value);
    });
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    this.audio.play().then(() => {
      this.isPlaying = true;
      this.updatePlayUI();
      this.vinyl?.classList.add('spinning');
    }).catch(err => {
      console.warn('Audio play blocked:', err);
    });
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this.updatePlayUI();
    this.vinyl?.classList.remove('spinning');
  }

  updatePlayUI() {
    if (!this.iconPlay || !this.iconPause) return;
    this.iconPlay.classList.toggle('hidden', this.isPlaying);
    this.iconPause.classList.toggle('hidden', !this.isPlaying);
  }

  seek(e) {
    if (!this.audio.duration) return;
    const rect = this.progressBar.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = x / rect.width;
    this.audio.currentTime = ratio * this.audio.duration;
    this.updateProgress(ratio);
  }

  onTimeUpdate() {
    if (!this.audio.duration || this.isSeeking) return;
    const ratio = this.audio.currentTime / this.audio.duration;
    this.updateProgress(ratio);
    if (this.timeCurrent) this.timeCurrent.textContent = this.formatTime(this.audio.currentTime);
  }

  onMetadata() {
    if (this.timeTotal) this.timeTotal.textContent = this.formatTime(this.audio.duration);
  }

  onEnded() {
    this.isPlaying = false;
    this.updatePlayUI();
    this.vinyl?.classList.remove('spinning');
    this.updateProgress(0);
    // Auto-replay após 2s
    setTimeout(() => {
      this.audio.currentTime = 0;
      this.play();
    }, 2000);
  }

  onError() {
    console.warn('Erro ao carregar o áudio. Coloque o arquivo em assets/music/te-vivo.mp3');
  }

  updateProgress(ratio) {
    const pct = `${ratio * 100}%`;
    if (this.progressFill) this.progressFill.style.width = pct;
    if (this.progressThumb) this.progressThumb.style.left = pct;
  }

  formatTime(sec) {
    if (!isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  showPlayer() {
    this.playerEl?.classList.add('visible');
  }

  // Chamado após interação da usuária para respeitar políticas de browser
  initAfterInteraction() {
    this.showPlayer();
    // Não auto-play: deixa ela clicar no botão
  }
}

window.MusicModule = { MusicPlayer };
