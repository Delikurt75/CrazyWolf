import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ─── Global stores ─────────────────────────────────────────────────────────
const GLB = { playerBlob: null, enemyBlob: null };
const Settings = {
  quality: 'medium',       // low | medium | high
  autoPerf: true,
  jsSize: 150,
  btnSize: 90,
  camDist: 13,
  sfx: true,
  music: true,
  demoMode: false,
  charScale: 1, charPosY: 0, charRot: 0,
};

// ─── Helpers ───────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = $(id);
  if (el) el.classList.add('active');
}
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

// ─── Virtual Joystick ──────────────────────────────────────────────────────
class VirtualJoystick {
  constructor(zone, base, knob) {
    this.zone = zone; this.base = base; this.knob = knob;
    this.x = 0; this.y = 0;
    this.active = false;
    this.touchId = null;
    this.maxR = 50;
    this._bind();
  }
  _bind() {
    this.zone.addEventListener('touchstart', e => this._ts(e), { passive: false });
    this.zone.addEventListener('touchmove',  e => this._tm(e), { passive: false });
    this.zone.addEventListener('touchend',   e => this._te(e), { passive: false });
    this.zone.addEventListener('touchcancel',e => this._te(e), { passive: false });
    this.zone.addEventListener('mousedown',  e => { this.active = true; this._upd(e.clientX, e.clientY); });
    window.addEventListener('mousemove',     e => { if (this.active && this.touchId === null) this._upd(e.clientX, e.clientY); });
    window.addEventListener('mouseup',       () => { if (this.touchId === null) this._reset(); });
  }
  _ts(e) {
    e.preventDefault();
    if (this.touchId !== null) return;
    const t = e.changedTouches[0];
    this.touchId = t.identifier;
    this.active = true;
    this._upd(t.clientX, t.clientY);
  }
  _tm(e) {
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (t.identifier === this.touchId) this._upd(t.clientX, t.clientY);
    }
  }
  _te(e) {
    for (const t of e.changedTouches) {
      if (t.identifier === this.touchId) { this._reset(); break; }
    }
  }
  _upd(cx, cy) {
    const r = this.base.getBoundingClientRect();
    let dx = cx - (r.left + r.width / 2);
    let dy = cy - (r.top + r.height / 2);
    const d = Math.sqrt(dx*dx + dy*dy);
    if (d > this.maxR) { dx = dx / d * this.maxR; dy = dy / d * this.maxR; }
    this.knob.style.transform = `translate(${dx}px,${dy}px)`;
    this.x = dx / this.maxR;
    this.y = dy / this.maxR;
  }
  _reset() {
    this.touchId = null; this.active = false;
    this.x = 0; this.y = 0;
    this.knob.style.transform = 'translate(0,0)';
  }
  setSize(px) {
    this.maxR = px * 0.28;
  }
}

// ─── Procedural Benan Deniz character ─────────────────────────────────────
function makeBenanDeniz() {
  const g = new THREE.Group();
  const suit = new THREE.MeshToonMaterial({ color: 0x1a1a22 });
  const shirt = new THREE.MeshToonMaterial({ color: 0xf5f5f5 });
  const bowtie = new THREE.MeshToonMaterial({ color: 0x0a0a0a });
  const skin = new THREE.MeshToonMaterial({ color: 0xd4a884 });
  const hair = new THREE.MeshToonMaterial({ color: 0x1a1209 });
  const shoe = new THREE.MeshToonMaterial({ color: 0x0a0a0a });
  const lapel = new THREE.MeshToonMaterial({ color: 0x0d0d12 });

  // Torso (wider for heavy build)
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.7, 0.38), suit);
  torso.position.y = 0.9;
  g.add(torso);

  // Lapels (V-shape)
  const lapelL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.55, 0.06), lapel);
  lapelL.position.set(-0.14, 0.95, 0.18);
  lapelL.rotation.z = -0.2;
  g.add(lapelL);
  const lapelR = lapelL.clone();
  lapelR.position.x = 0.14;
  lapelR.rotation.z = 0.2;
  g.add(lapelR);

  // Shirt (white)
  const shirtMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.5, 0.4), shirt);
  shirtMesh.position.set(0, 0.95, 0.005);
  g.add(shirtMesh);

  // Bow tie
  const bt1 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.08), bowtie);
  bt1.position.set(0, 1.18, 0.22);
  g.add(bt1);
  const bt2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.07, 0.07), bowtie);
  bt2.position.set(0, 1.18, 0.22);
  g.add(bt2);

  // Belly bump (large build)
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 10), suit);
  belly.position.set(0, 0.7, 0.18);
  belly.scale.set(1.05, 0.7, 0.7);
  g.add(belly);

  // Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.16, 10), skin);
  neck.position.y = 1.32;
  g.add(neck);

  // Head (wide jaw)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 12), skin);
  head.position.y = 1.52;
  head.scale.set(1.05, 1.05, 1);
  g.add(head);

  // Hair (short black, swept top)
  const hairTop = new THREE.Mesh(new THREE.SphereGeometry(0.23, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), hair);
  hairTop.position.set(0, 1.55, 0);
  g.add(hairTop);
  // Hair front sweep
  const hairFront = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 0.18), hair);
  hairFront.position.set(0, 1.66, 0.08);
  hairFront.rotation.x = -0.3;
  g.add(hairFront);

  // Eyes
  const eyeMat = new THREE.MeshToonMaterial({ color: 0x1a1a1a });
  for (const x of [-0.07, 0.07]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), eyeMat);
    eye.position.set(x, 1.53, 0.2);
    g.add(eye);
  }
  // Eyebrows
  const browMat = new THREE.MeshToonMaterial({ color: 0x1a1209 });
  for (const x of [-0.08, 0.08]) {
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.018, 0.02), browMat);
    brow.position.set(x, 1.58, 0.2);
    g.add(brow);
  }
  // Mouth
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.012, 0.015), new THREE.MeshToonMaterial({ color: 0x5a3a30 }));
  mouth.position.set(0, 1.44, 0.21);
  g.add(mouth);

  // Arms (slightly thick)
  const armGeom = new THREE.CylinderGeometry(0.1, 0.09, 0.62, 10);
  const armL = new THREE.Mesh(armGeom, suit);
  armL.position.set(-0.41, 0.86, 0);
  g.add(armL);
  const armR = armL.clone();
  armR.position.x = 0.41;
  g.add(armR);

  // Hands
  const handGeom = new THREE.SphereGeometry(0.08, 10, 8);
  const handL = new THREE.Mesh(handGeom, skin);
  handL.position.set(-0.41, 0.5, 0);
  g.add(handL);
  const handR = handL.clone();
  handR.position.x = 0.41;
  g.add(handR);

  // Watch on right wrist (small detail like the reference)
  const watch = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.12), new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.3 }));
  watch.position.set(0.41, 0.56, 0);
  g.add(watch);

  // Legs (suit pants)
  const legGeom = new THREE.CylinderGeometry(0.13, 0.12, 0.6, 10);
  const legL = new THREE.Mesh(legGeom, suit);
  legL.position.set(-0.16, 0.3, 0);
  g.add(legL);
  const legR = legL.clone();
  legR.position.x = 0.16;
  g.add(legR);

  // Shoes
  const shoeGeom = new THREE.BoxGeometry(0.18, 0.08, 0.3);
  const shoeL = new THREE.Mesh(shoeGeom, shoe);
  shoeL.position.set(-0.16, 0.04, 0.05);
  g.add(shoeL);
  const shoeR = shoeL.clone();
  shoeR.position.x = 0.16;
  g.add(shoeR);

  // Cast/receive shadows
  g.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });

  // Store reference data for animations
  g.userData = { armL, armR, legL, legR };
  return g;
}

// ─── Enemy (procedural shadow warrior) ─────────────────────────────────────
function makeShadowEnemy(quality = 'medium') {
  const g = new THREE.Group();
  const dark = new THREE.MeshToonMaterial({ color: 0x140a0a });
  const skin = new THREE.MeshToonMaterial({ color: 0x6a4030 });
  const eye = new THREE.MeshBasicMaterial({ color: 0xff2020 });

  const segments = quality === 'low' ? 6 : (quality === 'medium' ? 10 : 14);

  // Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.68, 0.32), dark);
  torso.position.y = 0.88;
  g.add(torso);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, segments, segments * 0.8), skin);
  head.position.y = 1.42;
  g.add(head);

  // Hood
  const hoodGeom = new THREE.SphereGeometry(0.24, segments, segments * 0.8, 0, Math.PI * 2, 0, Math.PI * 0.7);
  const hood = new THREE.Mesh(hoodGeom, dark);
  hood.position.set(0, 1.46, -0.02);
  hood.scale.set(1, 1.1, 1.05);
  g.add(hood);

  // Glowing eyes
  for (const x of [-0.07, 0.07]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), eye);
    e.position.set(x, 1.45, 0.16);
    g.add(e);
  }

  // Arms
  const armGeom = new THREE.CylinderGeometry(0.08, 0.07, 0.55, 8);
  const armL = new THREE.Mesh(armGeom, dark);
  armL.position.set(-0.38, 0.85, 0);
  g.add(armL);
  const armR = armL.clone();
  armR.position.x = 0.38;
  g.add(armR);

  // Legs
  const legGeom = new THREE.CylinderGeometry(0.1, 0.1, 0.55, 8);
  const legL = new THREE.Mesh(legGeom, dark);
  legL.position.set(-0.14, 0.28, 0);
  g.add(legL);
  const legR = legL.clone();
  legR.position.x = 0.14;
  g.add(legR);

  g.traverse(m => { if (m.isMesh) { m.castShadow = quality !== 'low'; m.receiveShadow = false; } });
  g.userData = { armL, armR, legL, legR };
  return g;
}

// ─── GLTF loader util ──────────────────────────────────────────────────────
const gltfLoader = new GLTFLoader();
function loadGLBBlob(blob, onDone, onFail) {
  if (!blob) { onFail(); return; }
  const url = URL.createObjectURL(blob);
  gltfLoader.load(url, gltf => {
    const m = gltf.scene;
    m.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });

    // Auto-scale: normalize bounding box to ~1.7m tall
    const box = new THREE.Box3().setFromObject(m);
    const size = new THREE.Vector3();
    box.getSize(size);
    if (size.y > 0.01) {
      const scale = 1.7 / size.y;
      m.scale.setScalar(scale);
    }
    // Re-compute and offset to feet on ground
    const box2 = new THREE.Box3().setFromObject(m);
    m.position.y -= box2.min.y;

    onDone(m);
    URL.revokeObjectURL(url);
  }, undefined, err => {
    console.warn('GLB load failed', err);
    URL.revokeObjectURL(url);
    onFail();
  });
}

// ─── Menu rotating character ───────────────────────────────────────────────
class MenuViewer {
  constructor(canvasId, opts = {}) {
    this.canvas = $(canvasId);
    if (!this.canvas) return;
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setClearColor(0x000000, 0);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
    this.camera.position.set(0, 1.4, 4.5);
    this.camera.lookAt(0, 1, 0);

    // Lights
    this.scene.add(new THREE.AmbientLight(0x404060, 1.5));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(2, 3, 3);
    this.scene.add(key);
    const rim = new THREE.PointLight(0x00b4ff, 2, 8);
    rim.position.set(-2, 2, -1);
    this.scene.add(rim);
    const fill = new THREE.PointLight(0xffcc00, 1.2, 8);
    fill.position.set(2, 1.5, -1);
    this.scene.add(fill);

    // Pedestal
    const ped = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 1.0, 0.08, 32),
      new THREE.MeshStandardMaterial({ color: 0x1a1530, metalness: 0.6, roughness: 0.4, emissive: 0x000020 })
    );
    ped.position.y = -0.04;
    this.scene.add(ped);

    // Ring
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.95, 0.03, 8, 48),
      new THREE.MeshStandardMaterial({ color: 0x00b4ff, emissive: 0x00b4ff, emissiveIntensity: 1.5 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.01;
    this.scene.add(ring);
    this.ring = ring;

    this.character = null;
    this._setCharacter(makeBenanDeniz());

    this.canvas.addEventListener('touchstart', e => this._onPointer(e.touches[0]), { passive: true });
    this.canvas.addEventListener('touchmove',  e => this._onPointer(e.touches[0]), { passive: true });
    this.canvas.addEventListener('mousemove',  e => this._onPointer(e));
    this.pointerX = 0;
    this.targetRot = 0;

    this._resize();
    window.addEventListener('resize', () => this._resize());
    this._animate = this._animate.bind(this);
    this._animate();
  }
  _resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }
  _onPointer(p) {
    if (!p) return;
    const r = this.canvas.getBoundingClientRect();
    const nx = (p.clientX - r.left) / r.width;
    this.targetRot = (nx - 0.5) * 2;
  }
  _setCharacter(model) {
    if (this.character) this.scene.remove(this.character);
    this.character = model;
    this.character.position.y = 0;
    this.scene.add(model);
  }
  updateFromGLB(blob) {
    loadGLBBlob(blob,
      m => this._setCharacter(m),
      () => this._setCharacter(makeBenanDeniz())
    );
  }
  setRotation(r) { this._manualRot = r; }
  setPosY(y) { if (this.character) this.character.position.y = y; }
  setScale(s) { if (this.character) this.character.scale.setScalar(s); }
  _animate() {
    requestAnimationFrame(this._animate);
    if (this.character) {
      const base = this._manualRot !== undefined ? this._manualRot : this.targetRot * 0.5;
      this.character.rotation.y += (base + performance.now() * 0.00015 - this.character.rotation.y) * 0.02 + 0.004;
    }
    if (this.ring) this.ring.material.emissiveIntensity = 1.2 + Math.sin(performance.now() * 0.002) * 0.5;
    this.renderer.render(this.scene, this.camera);
  }
}

// ─── Main Game ─────────────────────────────────────────────────────────────
class Game {
  constructor() {
    this.clock = new THREE.Clock(false);
    this.running = false;
    this.paused = false;
    this._keys = {};
    this._session = 0;

    this._setupRenderer();
    this._setupScene();
    this._setupCamera();
    this._setupLights();
    this._setupGround();
    this._setupJoystick();
    this._setupButtons();
    this._setupKeyboard();
    this._setupPause();

    // FPS tracking for auto-perf
    this._fpsBuf = [];
    this._fpsLast = performance.now();
    this._lastQualityChange = 0;

    this.animate = this.animate.bind(this);
  }

  // ── Setup ──
  _setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ canvas: $('game-canvas'), antialias: true, powerPreference: 'high-performance' });
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x060010);
    this.applyQuality(Settings.quality);
    this._resize();
    window.addEventListener('resize', () => this._resize());
    window.addEventListener('orientationchange', () => setTimeout(() => this._resize(), 200));
  }
  applyQuality(q) {
    Settings.quality = q;
    if (q === 'low') {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
      this.renderer.shadowMap.enabled = false;
      this._maxEnemies = 6;
      this._particleFactor = 0.4;
    } else if (q === 'medium') {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      this.renderer.shadowMap.enabled = true;
      this._maxEnemies = 10;
      this._particleFactor = 0.7;
    } else {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this._maxEnemies = 14;
      this._particleFactor = 1;
    }
  }
  _resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h);
    if (this.camera) {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }
  }
  _setupScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x060010, 0.03);
  }
  _setupCamera() {
    this.camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera.position.set(0, 9, 13);
    this.camera.lookAt(0, 0, 0);
  }
  _setupLights() {
    this.scene.add(new THREE.AmbientLight(0x303068, 1.2));
    const sun = new THREE.DirectionalLight(0xffffff, 1.6);
    sun.position.set(8, 22, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { near: 1, far: 60, left: -20, right: 20, top: 20, bottom: -20 });
    this.scene.add(sun);
    this.sun = sun;

    this.rimLight = new THREE.PointLight(0xb000ff, 2, 28);
    this.rimLight.position.set(-10, 6, -10);
    this.scene.add(this.rimLight);

    const orange = new THREE.PointLight(0xff5500, 1.6, 25);
    orange.position.set(10, 4, 10);
    this.scene.add(orange);
  }
  _setupGround() {
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(32, 64),
      new THREE.MeshStandardMaterial({ color: 0x0a0a18, roughness: 0.9, metalness: 0.1 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    const grid = new THREE.GridHelper(64, 32, 0x140840, 0x0a0420);
    grid.position.y = 0.01;
    this.scene.add(grid);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(22, 0.2, 8, 80),
      new THREE.MeshStandardMaterial({ color: 0x8b00ff, emissive: 0x6600cc, emissiveIntensity: 2 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    this.scene.add(ring);
    this.arenaRing = ring;
  }
  _setupJoystick() {
    this.joystick = new VirtualJoystick(
      $('joystick-zone'), $('joystick-base'), $('joystick-knob')
    );
  }
  _setupButtons() {
    // Attack
    const atk = $('btn-attack');
    const pressAtk = e => { if (e) e.preventDefault(); if (this.running && !this.paused) this._attack(); };
    atk.addEventListener('touchstart', pressAtk, { passive: false });
    atk.addEventListener('mousedown', pressAtk);

    // Defense (hold)
    const def = $('btn-defense');
    const defStart = e => {
      if (e) e.preventDefault();
      if (this.running && !this.paused) this._defenseDown();
    };
    const defEnd = e => {
      if (e) e.preventDefault();
      this._defenseUp();
    };
    def.addEventListener('touchstart', defStart, { passive: false });
    def.addEventListener('touchend', defEnd, { passive: false });
    def.addEventListener('touchcancel', defEnd, { passive: false });
    def.addEventListener('mousedown', defStart);
    def.addEventListener('mouseup', defEnd);
    def.addEventListener('mouseleave', defEnd);

    // Special
    const sp = $('btn-special');
    const pressSp = e => { if (e) e.preventDefault(); if (this.running && !this.paused) this._special(); };
    sp.addEventListener('touchstart', pressSp, { passive: false });
    sp.addEventListener('mousedown', pressSp);
  }
  _setupKeyboard() {
    window.addEventListener('keydown', e => {
      this._keys[e.code] = true;
      if (!this.running || this.paused) return;
      if (e.code === 'Space')      { e.preventDefault(); this._attack(); }
      if (e.code === 'KeyE')       { this._special(); }
      if (e.code === 'KeyQ')       { this._defenseDown(); }
      if (e.code === 'Escape')     { this._togglePause(); }
    });
    window.addEventListener('keyup', e => {
      this._keys[e.code] = false;
      if (e.code === 'KeyQ') this._defenseUp();
    });
  }
  _setupPause() {
    $('btn-pause').addEventListener('click', () => this._togglePause());
    $('btn-resume').addEventListener('click', () => this._togglePause());
    $('btn-restart-pause').addEventListener('click', () => {
      this._togglePause();
      this.start();
    });
    $('btn-menu-from-game').addEventListener('click', () => {
      this.paused = false;
      this.running = false;
      $('pause-overlay').style.display = 'none';
      showScreen('screen-menu');
    });
  }

  // ── Reset / Start ──
  start() {
    if (!this.running) {
      this.running = true;
      requestAnimationFrame(this.animate);
    }
    this._reset();
    this.clock.start();
  }
  _reset() {
    this._session++;
    const sid = this._session;

    if (this._enemies) this._enemies.forEach(e => this.scene.remove(e.model));
    if (this._particles) this._particles.forEach(p => this.scene.remove(p.mesh));
    if (this._playerModel) { this.scene.remove(this._playerModel); this._playerModel = null; }

    this._enemies = [];
    this._particles = [];
    this.health = 100;
    this.energy = 100;
    this.tengri = 100;
    this.score = 0;
    this.kills = 0;
    this.wave = 1;
    this.elapsed = 0;
    this.paused = false;

    // Demo mode countdown
    this._demoTimeLeft = Settings.demoMode ? 60 : null;

    this._attackCD = 0;
    this._specialCD = 0;
    this._defending = false;
    this._invincible = 0;
    this._waveTimer = 0;
    this._waveMax = 5;
    this._waveSpawned = 0;
    this._waveAlive = 0;

    this._combo = 0;
    this._bestCombo = 0;
    this._comboTimer = 0;

    this._playerPos = new THREE.Vector3(0, 0, 0);
    this._camTarget = new THREE.Vector3(0, Settings.camDist * 0.62, Settings.camDist);

    $('pause-overlay').style.display = 'none';
    $('killfeed').innerHTML = '';
    $('defense-overlay').classList.remove('active');
    $('combo-display').classList.remove('show');
    this._updateHUD();

    // Spawn player
    const spawnPlayer = (model) => {
      if (this._session !== sid) { this.scene.remove(model); return; }
      model.position.copy(this._playerPos);
      // Player aura
      const glow = new THREE.PointLight(0x00b4ff, 1.8, 5);
      glow.position.y = 1.1;
      model.add(glow);
      this._playerGlow = glow;
      this.scene.add(model);
      this._playerModel = model;
    };
    if (GLB.playerBlob) {
      loadGLBBlob(GLB.playerBlob, spawnPlayer, () => spawnPlayer(makeBenanDeniz()));
    } else {
      spawnPlayer(makeBenanDeniz());
    }
  }

  // ── Spawn enemy ──
  _spawnEnemy() {
    this._waveSpawned++;
    this._waveAlive++;
    const sid = this._session;
    const angle = Math.random() * Math.PI * 2;
    const dist = 18 + Math.random() * 5;
    const pos = new THREE.Vector3(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);

    const register = model => {
      if (this._session !== sid) { this.scene.remove(model); return; }
      model.position.copy(pos);

      // HP bar
      const c = document.createElement('canvas');
      c.width = 64; c.height = 10;
      const ctx = c.getContext('2d');
      const tex = new THREE.CanvasTexture(c);
      const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false }));
      spr.scale.set(1.5, 0.22, 1);
      spr.position.y = 2.2;
      model.add(spr);

      // Glow
      if (Settings.quality !== 'low') {
        const pt = new THREE.PointLight(0xff0000, 1, 2.5);
        pt.position.y = 1;
        model.add(pt);
      }

      this.scene.add(model);

      const maxHp = 50 + this.wave * 18;
      const enemy = {
        model, hbCanvas: c, hbCtx: ctx, hbTex: tex, hbSpr: spr,
        hp: maxHp, maxHp,
        speed: 2.3 + this.wave * 0.4 + Math.random() * 0.6,
        attackCD: 1 + Math.random(),
        state: 'alive',
        bobT: Math.random() * Math.PI * 2,
      };
      this._updateEnemyBar(enemy);
      this._enemies.push(enemy);
    };

    if (GLB.enemyBlob) {
      loadGLBBlob(GLB.enemyBlob, register, () => register(makeShadowEnemy(Settings.quality)));
    } else {
      register(makeShadowEnemy(Settings.quality));
    }
  }

  _updateEnemyBar(e) {
    const pct = Math.max(0, e.hp / e.maxHp);
    const ctx = e.hbCtx;
    ctx.clearRect(0, 0, 64, 10);
    ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, 64, 10);
    ctx.fillStyle = pct > 0.5 ? '#4caf50' : pct > 0.25 ? '#ff9800' : '#e53935';
    ctx.fillRect(1, 1, Math.round(62 * pct), 8);
    e.hbTex.needsUpdate = true;
  }

  // ── Combat ──
  _attack() {
    if (this._attackCD > 0 || this.energy < 8) return;
    this._attackCD = 0.42;
    this.energy = Math.max(0, this.energy - 8);
    this._setCooldown('attack', this._attackCD, 0.42);

    const dir = this._forwardDir();
    const hit = this._playerPos.clone().add(dir.clone().multiplyScalar(1.7));
    hit.y = 1;

    this._fxAttack(hit);

    let didHit = false;
    for (const e of this._enemies) {
      if (e.state !== 'alive') continue;
      if (e.model.position.distanceTo(hit) < 3) {
        const dmg = 18 + Math.floor(Math.random() * 18);
        this._hit(e, dmg);
        didHit = true;
      }
    }
    if (didHit) {
      this._combo++;
      this._comboTimer = 1.8;
      if (this._combo > this._bestCombo) this._bestCombo = this._combo;
      this._showCombo();
    } else {
      this._fxMiss(hit);
    }
    this._updateHUD();
  }

  _hit(e, dmg) {
    const finalDmg = Math.floor(dmg * (1 + this._combo * 0.06));
    e.hp -= finalDmg;
    this._updateEnemyBar(e);
    this._fxDmgNum(e.model.position.clone().add(new THREE.Vector3(0, 2.6, 0)), finalDmg);
    if (e.hp <= 0) this._killEnemy(e);
  }

  _killEnemy(e) {
    e.state = 'dead';
    this._waveAlive--;
    const bonus = Math.floor(100 * this.wave * (1 + this._combo * 0.05));
    this.score += bonus;
    this.kills++;
    this._fxDeath(e.model.position.clone().add(new THREE.Vector3(0, 1, 0)));
    this.scene.remove(e.model);
    this._addKillFeed(bonus);
    this._updateHUD();

    // Tengri energy refund on kill
    this.tengri = Math.min(100, this.tengri + 6);

    if (this._waveAlive <= 0 && this._waveSpawned >= this._waveMax) {
      this._nextWave();
    }
  }

  _special() {
    if (this._specialCD > 0 || this.tengri < 35) return;
    this._specialCD = 4;
    this.tengri = Math.max(0, this.tengri - 35);
    this._setCooldown('special', this._specialCD, 4);
    this._invincible = Math.max(this._invincible, 0.5);

    // Tengri AOE: huge blue energy wave from player
    this._fxTengri(this._playerPos.clone());

    // Damage all enemies within radius
    const radius = 8;
    for (const e of this._enemies) {
      if (e.state !== 'alive') continue;
      const d = e.model.position.distanceTo(this._playerPos);
      if (d < radius) {
        const dmg = Math.floor(60 + (1 - d/radius) * 40);
        this._hit(e, dmg);
      }
    }
    this._updateHUD();
  }

  _defenseDown() {
    if (this.energy < 5) return;
    this._defending = true;
    $('btn-defense').classList.add('holding');
    $('defense-overlay').classList.add('active');
  }
  _defenseUp() {
    this._defending = false;
    $('btn-defense').classList.remove('holding');
    $('defense-overlay').classList.remove('active');
  }

  _setCooldown(which, current, max) {
    const btn = $(`btn-${which}`);
    const cd = $(`cd-${which}`);
    btn.classList.add('cooling');
    const update = () => {
      const c = which === 'attack' ? this._attackCD : (which === 'special' ? this._specialCD : 0);
      if (c <= 0) {
        btn.classList.remove('cooling');
        cd.style.setProperty('--cd', '0%');
        return;
      }
      const pct = (c / max) * 100;
      cd.style.setProperty('--cd', `${pct}%`);
      requestAnimationFrame(update);
    };
    update();
  }

  _forwardDir() {
    if (this._playerModel) {
      const v = new THREE.Vector3(0, 0, -1).applyQuaternion(this._playerModel.quaternion);
      v.y = 0; v.normalize();
      return v;
    }
    return new THREE.Vector3(0, 0, -1);
  }

  // ── VFX ──
  _fxAttack(pos) {
    const n = Math.floor(14 * this._particleFactor);
    for (let i = 0; i < n; i++) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.06 + Math.random() * 0.06, 4, 4),
        new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(0.06 + Math.random() * 0.06, 1, 0.6), transparent: true, opacity: 1 })
      );
      mesh.position.copy(pos);
      const v = new THREE.Vector3((Math.random()-0.5) * 8, 2 + Math.random() * 5, (Math.random()-0.5) * 8);
      this.scene.add(mesh);
      this._particles.push({ mesh, vel: v, life: 0.5, maxLife: 0.5, gravity: true });
    }
  }
  _fxMiss(pos) {
    const mesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.5, 0.05, 6, 20),
      new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.6 })
    );
    mesh.position.copy(pos);
    this.scene.add(mesh);
    this._particles.push({ mesh, vel: new THREE.Vector3(0, 1, 0), life: 0.3, maxLife: 0.3, scaleUp: true });
  }
  _fxDeath(pos) {
    const n = Math.floor(20 * this._particleFactor);
    for (let i = 0; i < n; i++) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.08 + Math.random() * 0.1, 0.08 + Math.random() * 0.1, 0.08),
        new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(0, 1, 0.3 + Math.random() * 0.3) })
      );
      mesh.position.copy(pos);
      const v = new THREE.Vector3((Math.random()-0.5) * 12, 4 + Math.random() * 9, (Math.random()-0.5) * 12);
      this.scene.add(mesh);
      this._particles.push({ mesh, vel: v, life: 1.3, maxLife: 1.3, gravity: true });
    }
  }
  _fxDmgNum(pos, dmg) {
    const c = document.createElement('canvas');
    c.width = 100; c.height = 50;
    const ctx = c.getContext('2d');
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000'; ctx.lineWidth = 5;
    ctx.strokeText(`-${dmg}`, 50, 36);
    ctx.fillStyle = dmg >= 40 ? '#ffca28' : '#ff5252';
    ctx.fillText(`-${dmg}`, 50, 36);
    const tex = new THREE.CanvasTexture(c);
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    spr.scale.set(1.2, 0.6, 1);
    spr.position.copy(pos);
    this.scene.add(spr);
    this._particles.push({ mesh: spr, vel: new THREE.Vector3(0, 2.5, 0), life: 0.9, maxLife: 0.9 });
  }
  _fxTengri(pos) {
    // Big blue shockwave ring
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.5, 0.7, 64),
      new THREE.MeshBasicMaterial({ color: 0x00b4ff, transparent: true, opacity: 0.9, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.copy(pos);
    ring.position.y = 0.1;
    this.scene.add(ring);
    this._particles.push({ mesh: ring, vel: new THREE.Vector3(0,0,0), life: 0.8, maxLife: 0.8, expandRing: true });

    // Inner glow ring
    const ring2 = new THREE.Mesh(
      new THREE.RingGeometry(0.2, 0.4, 48),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1, side: THREE.DoubleSide })
    );
    ring2.rotation.x = -Math.PI / 2;
    ring2.position.copy(pos);
    ring2.position.y = 0.15;
    this.scene.add(ring2);
    this._particles.push({ mesh: ring2, vel: new THREE.Vector3(0,0,0), life: 0.5, maxLife: 0.5, expandRing: true });

    // Blue particles
    const n = Math.floor(40 * this._particleFactor);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.08 + Math.random() * 0.08, 5, 5),
        new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(0.55 + Math.random() * 0.1, 1, 0.6), transparent: true, opacity: 1 })
      );
      mesh.position.copy(pos).add(new THREE.Vector3(0, 0.2, 0));
      const sp = 6 + Math.random() * 6;
      const v = new THREE.Vector3(Math.cos(a) * sp, 1 + Math.random() * 3, Math.sin(a) * sp);
      this.scene.add(mesh);
      this._particles.push({ mesh, vel: v, life: 0.9, maxLife: 0.9, gravity: true });
    }

    // Vertical pillar
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.5, 6, 16, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x40c4ff, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
    );
    pillar.position.copy(pos);
    pillar.position.y = 3;
    this.scene.add(pillar);
    this._particles.push({ mesh: pillar, vel: new THREE.Vector3(0,0,0), life: 0.7, maxLife: 0.7, pillar: true });
  }
  _addKillFeed(bonus) {
    const feed = $('killfeed');
    const item = document.createElement('div');
    item.className = 'killfeed-item';
    item.textContent = `⚔ +${bonus} ${this._combo > 1 ? `(${this._combo}x)` : ''}`;
    feed.appendChild(item);
    setTimeout(() => item.remove(), 2200);
  }
  _showCombo() {
    if (this._combo < 2) return;
    const el = $('combo-display');
    el.textContent = `${this._combo}x COMBO!`;
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
  }
  _showWaveAnnounce() {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:200';
    el.innerHTML = `<div style="font-size:clamp(2rem,7vw,4rem);font-weight:900;color:#ffd54f;text-shadow:0 0 40px rgba(255,213,79,0.9);letter-spacing:6px;animation:waveAnnounce 2s forwards">DALGA ${this.wave}</div>`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2300);
  }
  _nextWave() {
    this.wave++;
    this._waveMax = 5 + (this.wave - 1) * 2;
    this._waveSpawned = 0;
    this._waveAlive = 0;
    this._waveTimer = 3;
    this._showWaveAnnounce();
    // Bonus
    this.health = Math.min(100, this.health + 20);
    this.tengri = Math.min(100, this.tengri + 25);
    this._updateHUD();
  }

  _clampArena(p) {
    const r = 21;
    const d = Math.sqrt(p.x * p.x + p.z * p.z);
    if (d > r) { p.x = p.x / d * r; p.z = p.z / d * r; }
  }
  _updateHUD() {
    $('bar-health').style.width = `${Math.max(0, this.health)}%`;
    $('val-health').textContent = Math.ceil(Math.max(0, this.health));
    $('bar-energy').style.width = `${Math.max(0, this.energy)}%`;
    $('val-energy').textContent = Math.ceil(this.energy);
    $('bar-tengri').style.width = `${Math.max(0, this.tengri)}%`;
    $('val-tengri').textContent = Math.ceil(this.tengri);
    $('val-score').textContent = this.score.toLocaleString();
    $('val-wave').textContent = this.wave;
    $('val-enemies').textContent = this._enemies ? this._enemies.filter(e => e.state === 'alive').length : 0;

    let t = this.elapsed;
    let label = '';
    if (Settings.demoMode && this._demoTimeLeft !== null) {
      t = Math.max(0, this._demoTimeLeft);
      label = 'DEMO ';
    }
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    $('val-timer').textContent = `${label}${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  _togglePause() {
    this.paused = !this.paused;
    $('pause-overlay').style.display = this.paused ? 'flex' : 'none';
    if (!this.paused) this.clock.getDelta();
  }
  _gameOver(reason) {
    this.running = false;
    $('go-score').textContent = this.score.toLocaleString();
    $('go-kills').textContent = this.kills;
    $('go-wave').textContent = this.wave;
    $('go-combo').textContent = this._bestCombo;
    const m = Math.floor(this.elapsed / 60);
    const s = Math.floor(this.elapsed % 60);
    $('go-time').textContent = `${m}:${String(s).padStart(2,'0')}`;
    $('gameover-reason').textContent = reason || 'Düştün, savaşçı...';
    showScreen('screen-gameover');
  }

  _flashDmg() {
    const el = $('damage-flash');
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 150);
  }

  // ── FPS auto-perf ──
  _trackFps(now) {
    const dt = now - this._fpsLast;
    this._fpsLast = now;
    if (dt > 0 && dt < 500) {
      this._fpsBuf.push(1000 / dt);
      if (this._fpsBuf.length > 60) this._fpsBuf.shift();
    }
    if (this._fpsBuf.length >= 30) {
      const avg = this._fpsBuf.reduce((a,b) => a+b, 0) / this._fpsBuf.length;
      $('fps-counter').textContent = `${Math.round(avg)} FPS`;
      $('fps-counter').style.color = avg > 45 ? '#4caf50' : (avg > 28 ? '#ffa726' : '#e53935');

      if (Settings.autoPerf && now - this._lastQualityChange > 5000) {
        if (avg < 28 && Settings.quality !== 'low') {
          this.applyQuality(Settings.quality === 'high' ? 'medium' : 'low');
          this._lastQualityChange = now;
          this._fpsBuf = [];
        } else if (avg > 55 && Settings.quality !== 'high') {
          // Don't auto-upscale to avoid oscillation
          this._lastQualityChange = now;
        }
      }
    }
  }

  // ── Main animate loop ──
  animate() {
    if (!this.running) return;
    requestAnimationFrame(this.animate);

    const now = performance.now();
    this._trackFps(now);

    const dt = Math.min(this.clock.getDelta(), 0.05);

    if (this.paused) {
      this.renderer.render(this.scene, this.camera);
      return;
    }

    this.elapsed += dt;

    // Demo mode countdown
    if (Settings.demoMode && this._demoTimeLeft !== null) {
      this._demoTimeLeft -= dt;
      if (this._demoTimeLeft <= 0) {
        this._demoTimeLeft = 0;
        this._gameOver('Demo süresi bitti!');
        return;
      }
    }

    // Cooldowns
    this._attackCD = Math.max(0, this._attackCD - dt);
    this._specialCD = Math.max(0, this._specialCD - dt);
    this._invincible = Math.max(0, this._invincible - dt);

    // Energy regen (slower while defending)
    const regen = this._defending ? 2 : 12;
    this.energy = Math.min(100, this.energy + dt * regen);
    // Tengri regen
    this.tengri = Math.min(100, this.tengri + dt * 4);

    // Defense drain
    if (this._defending) {
      this.energy -= dt * 12;
      if (this.energy <= 0) {
        this.energy = 0;
        this._defenseUp();
      }
    }

    // Combo timer
    if (this._comboTimer > 0) {
      this._comboTimer -= dt;
      if (this._comboTimer <= 0) {
        this._combo = 0;
        $('combo-display').classList.remove('show');
      }
    }

    // ── Player movement ──
    const kx = ((this._keys['KeyA'] || this._keys['ArrowLeft'])  ? -1 : 0) + ((this._keys['KeyD'] || this._keys['ArrowRight']) ? 1 : 0);
    const ky = ((this._keys['KeyW'] || this._keys['ArrowUp'])    ? -1 : 0) + ((this._keys['KeyS'] || this._keys['ArrowDown'])  ? 1 : 0);
    const jx = clamp(this.joystick.x + kx, -1, 1);
    const jy = clamp(this.joystick.y + ky, -1, 1);
    const moving = Math.abs(jx) > 0.06 || Math.abs(jy) > 0.06;

    if (moving && !this._defending) {
      const spd = 6.5;
      this._playerPos.x += jx * spd * dt;
      this._playerPos.z += jy * spd * dt;
      this._clampArena(this._playerPos);

      if (this._playerModel) {
        this._playerModel.position.copy(this._playerPos);
        this._playerModel.position.y = Math.sin(this.elapsed * 9) * 0.04;

        const targetAngle = Math.atan2(jx, jy) + Math.PI;
        const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), targetAngle);
        this._playerModel.quaternion.slerp(q, 0.2);
        this._animatePlayerWalk(dt, true);
      }
    } else if (this._playerModel) {
      this._playerModel.position.copy(this._playerPos);
      this._playerModel.position.y = 0;
      this._animatePlayerWalk(dt, false);
    }

    // Camera follow
    const camDist = Settings.camDist;
    this._camTarget.set(
      this._playerPos.x,
      camDist * 0.62,
      this._playerPos.z + camDist
    );
    this.camera.position.lerp(this._camTarget, 0.07);
    const look = this._playerPos.clone();
    look.y += 1;
    this.camera.lookAt(look);

    // Wave spawn
    if (this._waveTimer > 0) {
      this._waveTimer -= dt;
    } else {
      const alive = this._enemies.filter(e => e.state === 'alive').length;
      if (this._waveSpawned < this._waveMax && alive < this._maxEnemies) {
        this._spawnEnemy();
      }
    }

    // Enemy AI
    for (const e of this._enemies) {
      if (e.state !== 'alive') continue;
      e.bobT += dt * 4;

      const toP = this._playerPos.clone().sub(e.model.position);
      toP.y = 0;
      const dist = toP.length();

      if (dist > 1.8) {
        const step = toP.clone().normalize().multiplyScalar(e.speed * dt);
        e.model.position.add(step);
        e.model.position.y = Math.sin(e.bobT) * 0.04;
        const ang = Math.atan2(step.x, step.z) + Math.PI;
        const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), ang);
        e.model.quaternion.slerp(q, 0.16);

        // Walk animation
        if (e.model.userData && e.model.userData.armL) {
          const phase = e.bobT * 2;
          e.model.userData.armL.rotation.x = Math.sin(phase) * 0.5;
          e.model.userData.armR.rotation.x = -Math.sin(phase) * 0.5;
          e.model.userData.legL.rotation.x = -Math.sin(phase) * 0.4;
          e.model.userData.legR.rotation.x = Math.sin(phase) * 0.4;
        }
      } else {
        e.attackCD -= dt;
        if (e.attackCD <= 0) {
          e.attackCD = 1.3;
          if (this._invincible <= 0) {
            let dmg = 7 + this.wave * 2;
            if (this._defending) dmg *= 0.25;
            this.health -= dmg;
            this._flashDmg();
            this._updateHUD();
            if (this.health <= 0) {
              this.health = 0;
              this._updateHUD();
              this._gameOver('Düştün, savaşçı...');
              return;
            }
          }
        }
      }
    }

    // Particles
    for (let i = this._particles.length - 1; i >= 0; i--) {
      const p = this._particles[i];
      p.life -= dt;
      if (p.life <= 0) { this.scene.remove(p.mesh); this._particles.splice(i, 1); continue; }
      p.mesh.position.addScaledVector(p.vel, dt);
      if (p.gravity) p.vel.y -= 14 * dt;
      const t = p.life / p.maxLife;
      if (p.mesh.material && 'opacity' in p.mesh.material) p.mesh.material.opacity = t;
      if (p.scaleUp) p.mesh.scale.setScalar(1 + (1 - t) * 3);
      if (p.expandRing) p.mesh.scale.setScalar(1 + (1 - t) * 14);
      if (p.pillar) {
        p.mesh.scale.y = 1 + (1 - t) * 0.5;
        p.mesh.rotation.y += dt * 4;
      }
    }

    // Ring pulse
    if (this.arenaRing) {
      this.arenaRing.material.emissiveIntensity = 1.5 + Math.sin(this.elapsed * 1.8) * 0.6;
    }

    // Update HUD
    this._updateHUD();

    // Clean dead enemies
    for (let i = this._enemies.length - 1; i >= 0; i--) {
      if (this._enemies[i].state === 'dead') this._enemies.splice(i, 1);
    }

    this.renderer.render(this.scene, this.camera);
  }

  _animatePlayerWalk(dt, walking) {
    if (!this._playerModel || !this._playerModel.userData || !this._playerModel.userData.armL) return;
    const ud = this._playerModel.userData;
    if (walking) {
      const phase = this.elapsed * 8;
      ud.armL.rotation.x = Math.sin(phase) * 0.6;
      ud.armR.rotation.x = -Math.sin(phase) * 0.6;
      ud.legL.rotation.x = -Math.sin(phase) * 0.5;
      ud.legR.rotation.x = Math.sin(phase) * 0.5;
    } else {
      ud.armL.rotation.x *= 0.85;
      ud.armR.rotation.x *= 0.85;
      ud.legL.rotation.x *= 0.85;
      ud.legR.rotation.x *= 0.85;
    }
  }
}

// ─── Settings UI wiring ────────────────────────────────────────────────────
function wireSettings(game, menuViewer, charViewer) {
  const root = document.documentElement;
  // Quality segmented
  document.querySelectorAll('#seg-quality button').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('#seg-quality button').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      game.applyQuality(b.dataset.val);
    });
  });
  $('auto-perf').addEventListener('change', e => Settings.autoPerf = e.target.checked);

  $('js-size').addEventListener('input', e => {
    Settings.jsSize = +e.target.value;
    root.style.setProperty('--js-size', `${Settings.jsSize}px`);
    if (game.joystick) game.joystick.setSize(Settings.jsSize);
  });
  $('btn-size').addEventListener('input', e => {
    Settings.btnSize = +e.target.value;
    root.style.setProperty('--btn-size', `${Settings.btnSize}px`);
  });
  $('cam-dist').addEventListener('input', e => { Settings.camDist = +e.target.value; });
  $('sfx-on').addEventListener('change', e => Settings.sfx = e.target.checked);
  $('music-on').addEventListener('change', e => Settings.music = e.target.checked);
  $('demo-mode').addEventListener('change', e => Settings.demoMode = e.target.checked);

  $('btn-settings-back').addEventListener('click', () => showScreen('screen-menu'));
  $('btn-settings-fs').addEventListener('click', () => toggleFullscreen());

  // Apply defaults
  root.style.setProperty('--js-size', `${Settings.jsSize}px`);
  root.style.setProperty('--btn-size', `${Settings.btnSize}px`);

  // Character viewer
  $('char-scale').addEventListener('input', e => {
    Settings.charScale = +e.target.value;
    if (charViewer) charViewer.setScale(Settings.charScale);
  });
  $('char-posy').addEventListener('input', e => {
    Settings.charPosY = +e.target.value;
    if (charViewer) charViewer.setPosY(Settings.charPosY);
  });
  $('char-rotation').addEventListener('input', e => {
    Settings.charRot = +e.target.value;
    if (charViewer) charViewer.setRotation(Settings.charRot);
  });
  $('btn-char-reset').addEventListener('click', () => {
    Settings.charScale = 1; Settings.charPosY = 0; Settings.charRot = 0;
    $('char-scale').value = 1; $('char-posy').value = 0; $('char-rotation').value = 0;
    if (charViewer) { charViewer.setScale(1); charViewer.setPosY(0); charViewer.setRotation(0); }
  });
  $('btn-char-back').addEventListener('click', () => showScreen('screen-menu'));
}

// ─── Fullscreen ────────────────────────────────────────────────────────────
function toggleFullscreen() {
  const el = document.documentElement;
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    // Try orientation lock to landscape on mobile
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('landscape').catch(() => {});
    }
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
  }
}

// ─── Auto-fetch optional GLBs ──────────────────────────────────────────────
async function tryFetchGLB(path) {
  try { const r = await fetch(path); if (r.ok) return await r.blob(); } catch {}
  return null;
}

// ─── Boot ──────────────────────────────────────────────────────────────────
let game = null;
let menuViewer = null;
let charViewer = null;

async function boot() {
  // Try assets
  const [pb, eb] = await Promise.all([tryFetchGLB('assets/player.glb'), tryFetchGLB('assets/enemy.glb')]);
  if (pb) GLB.playerBlob = pb;
  if (eb) GLB.enemyBlob = eb;

  // Create instances
  game = new Game();
  menuViewer = new MenuViewer('menu-canvas');
  charViewer = new MenuViewer('char-canvas');

  wireSettings(game, menuViewer, charViewer);

  // Menu wiring
  $('btn-start').addEventListener('click', () => {
    showScreen('screen-game');
    setTimeout(() => game.start(), 50);
  });
  $('btn-character').addEventListener('click', () => {
    showScreen('screen-character');
    if (charViewer) charViewer._resize();
  });
  $('btn-settings').addEventListener('click', () => showScreen('screen-settings'));
  $('btn-fullscreen').addEventListener('click', toggleFullscreen);

  // GLB upload handlers
  const handleGLB = e => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    GLB.playerBlob = f;
    if (menuViewer) menuViewer.updateFromGLB(f);
    if (charViewer) charViewer.updateFromGLB(f);
    flashMsg(`Karakter yüklendi: ${f.name}`);
  };
  $('glb-input').addEventListener('change', handleGLB);
  $('glb-input-2').addEventListener('change', handleGLB);

  $('btn-upload-glb').addEventListener('click', () => $('glb-input').click());
  $('btn-upload-glb-2').addEventListener('click', () => $('glb-input-2').click());

  // Game over actions
  $('btn-restart').addEventListener('click', () => {
    showScreen('screen-game');
    setTimeout(() => game.start(), 50);
  });
  $('btn-menu-go').addEventListener('click', () => showScreen('screen-menu'));

  // Hide loading
  setTimeout(() => {
    $('loading').style.display = 'none';
    showScreen('screen-menu');
    if (menuViewer) menuViewer._resize();
  }, 400);
}

function flashMsg(text) {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;top:30%;left:50%;transform:translate(-50%,-50%);background:rgba(0,180,255,0.95);color:#fff;padding:14px 24px;border-radius:12px;font-weight:700;letter-spacing:2px;z-index:9999;box-shadow:0 4px 20px rgba(0,180,255,0.5);font-size:0.85rem';
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.style.opacity = '0', 1500);
  setTimeout(() => el.remove(), 2200);
}

boot();
