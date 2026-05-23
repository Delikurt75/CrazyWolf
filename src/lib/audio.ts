// Procedural audio using WebAudio. No external assets, low bandwidth.
// All sounds are synthesised on demand.

class AudioBus {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  enabled = true;
  musicGain: GainNode | null = null;
  musicNodes: OscillatorNode[] = [];
  musicTimer: number | null = null;

  ensure() {
    if (this.ctx) return this.ctx;
    try {
      const C: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      this.ctx = new C();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.6;
      this.master.connect(this.ctx.destination);
    } catch {
      this.ctx = null;
    }
    return this.ctx;
  }

  // Toggle SFX only. Music is independent (own gain via startMusic/stopMusic).
  setEnabled(b: boolean) {
    this.enabled = b;
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  }

  // ===== One-shots =====
  private tone(freq: number, dur: number, type: OscillatorType, vol = 0.3, slide?: number) {
    if (!this.enabled) return;
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slide !== undefined) o.frequency.exponentialRampToValueAtTime(Math.max(1, slide), ctx.currentTime + dur);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g).connect(this.master);
    o.start();
    o.stop(ctx.currentTime + dur + 0.05);
  }

  private noise(dur: number, vol = 0.25, freq = 800) {
    if (!this.enabled) return;
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.value = vol;
    src.connect(filter).connect(g).connect(this.master);
    src.start();
  }

  attack() { this.tone(420, 0.12, 'square', 0.18, 220); }
  knife()  { this.tone(900, 0.08, 'sawtooth', 0.16, 400); }
  sword()  { this.tone(330, 0.18, 'sawtooth', 0.22, 140); }
  shoot()  { this.noise(0.06, 0.3, 1800); this.tone(1100, 0.06, 'square', 0.2, 400); }
  reload() { this.tone(220, 0.08, 'triangle', 0.15); setTimeout(() => this.tone(280, 0.08, 'triangle', 0.15), 120); }
  hit()    { this.noise(0.07, 0.35, 600); }
  enemyHit() { this.tone(180, 0.1, 'sawtooth', 0.2, 80); }
  enemyDie() { this.tone(120, 0.3, 'sawtooth', 0.25, 50); this.noise(0.2, 0.3, 300); }
  pickup() { this.tone(880, 0.06, 'sine', 0.2); setTimeout(() => this.tone(1320, 0.08, 'sine', 0.2), 60); }
  special() {
    if (!this.enabled) return;
    const ctx = this.ensure(); if (!ctx) return;
    this.tone(110, 0.45, 'sawtooth', 0.3, 1000);
    setTimeout(() => this.noise(0.4, 0.4, 1200), 80);
    setTimeout(() => this.tone(440, 0.25, 'sine', 0.3, 880), 150);
  }
  defense() { this.tone(660, 0.1, 'sine', 0.18); }
  wave()    { this.tone(523, 0.12, 'sine', 0.25); setTimeout(() => this.tone(659, 0.12, 'sine', 0.25), 110); setTimeout(() => this.tone(784, 0.16, 'sine', 0.3), 220); }
  victory() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.tone(f, 0.18, 'triangle', 0.3), i * 130)); }
  defeat()  { [330, 277, 220, 165].forEach((f, i) => setTimeout(() => this.tone(f, 0.25, 'sawtooth', 0.25), i * 180)); }

  // Background music: simple drum + drone loop (Kam davulu / shaman drum vibe)
  startMusic() {
    if (!this.enabled || this.musicTimer !== null) return;
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    this.musicGain = ctx.createGain();
    this.musicGain.gain.value = 0.18;
    this.musicGain.connect(this.master);

    // Drone
    const drone = ctx.createOscillator();
    drone.type = 'sine';
    drone.frequency.value = 73;
    const droneG = ctx.createGain();
    droneG.gain.value = 0.4;
    drone.connect(droneG).connect(this.musicGain);
    drone.start();
    this.musicNodes.push(drone);

    const drone2 = ctx.createOscillator();
    drone2.type = 'triangle';
    drone2.frequency.value = 110;
    const drone2G = ctx.createGain();
    drone2G.gain.value = 0.2;
    drone2.connect(drone2G).connect(this.musicGain);
    drone2.start();
    this.musicNodes.push(drone2);

    // Drum loop
    let beat = 0;
    const playBeat = () => {
      if (!this.musicGain || !ctx) return;
      const accent = beat % 4 === 0;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(accent ? 120 : 90, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.12);
      g.gain.setValueAtTime(accent ? 0.6 : 0.35, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
      o.connect(g).connect(this.musicGain);
      o.start();
      o.stop(ctx.currentTime + 0.22);
      beat++;
    };
    playBeat();
    this.musicTimer = window.setInterval(playBeat, 420);
  }

  stopMusic() {
    if (this.musicTimer) { clearInterval(this.musicTimer); this.musicTimer = null; }
    this.musicNodes.forEach((n) => { try { n.stop(); } catch {} });
    this.musicNodes = [];
    if (this.musicGain) { try { this.musicGain.disconnect(); } catch {} this.musicGain = null; }
  }
}

export const audio = new AudioBus();
