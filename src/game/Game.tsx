import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Arena } from './Arena';
import { Effects, fxBus } from './Effects';
import { PlayerModel } from './PlayerModel';
import { EnemyMesh, EnemyState } from './EnemyModel';
import {
  ARENA, ARENA_RADIUS, CLASSES, ENEMY_DEFS, EnemyType, QUALITY_PRESETS, WEAPONS, WeaponId,
  getWave,
} from '../lib/constants';
import { useApp, useGameUi, useInput } from '../lib/store';
import { audio } from '../lib/audio';
import { minimapState } from '../components/Minimap';

export function Game() {
  const settings = useApp((s) => s.settings);
  const preset = QUALITY_PRESETS[settings.quality];

  useEffect(() => {
    audio.resume();
    if (settings.music) audio.startMusic();
    return () => audio.stopMusic();
  }, [settings.music]);

  return (
    <div className="game-canvas-wrap">
      <Canvas
        shadows={preset.shadows}
        dpr={[1, preset.pixelRatio]}
        camera={{ position: [0, 6, 12], fov: 55, near: 0.1, far: 250 }}
        gl={{ antialias: settings.quality !== 'low', powerPreference: 'high-performance' }}
      >
        <color attach="background" args={[`#${ARENA.fogColor.toString(16).padStart(6, '0')}`]} />
        <fog attach="fog" args={[`#${ARENA.fogColor.toString(16).padStart(6, '0')}`, 18, 90]} />

        <ambientLight intensity={0.55} color={ARENA.ambient} />
        <hemisphereLight args={[0x8aa6ff, 0x3a2418, 0.4]} />
        <directionalLight
          position={[10, 18, 6]}
          intensity={ARENA.sunIntensity}
          color={ARENA.sunColor}
          castShadow={preset.shadows}
          shadow-mapSize={preset.shadows ? [1024, 1024] : undefined}
          shadow-camera-left={-25} shadow-camera-right={25}
          shadow-camera-top={25} shadow-camera-bottom={-25}
          shadow-camera-near={1} shadow-camera-far={60}
        />
        <directionalLight position={[-10, 6, -8]} intensity={0.3} color="#5566aa" />
        <pointLight position={[0, 5, 0]} intensity={0.8} color="#88c4ff" distance={20} decay={2} />

        <Suspense fallback={null}>
          <Arena />
          <Effects />
          <Sim />
        </Suspense>
      </Canvas>
    </div>
  );
}

interface Pickup {
  id: number;
  kind: 'health' | 'knife' | 'pistol' | 'sword';
  pos: THREE.Vector3;
  mesh: THREE.Group;
}

function Sim() {
  const { camera } = useThree();
  const setHp = useGameUi((s) => s.setHp);
  const setEnergy = useGameUi((s) => s.setEnergy);
  const setTengri = useGameUi((s) => s.setTengri);
  const setScore = useGameUi((s) => s.setScore);
  const setTime = useGameUi((s) => s.setTime);
  const setWave = useGameUi((s) => s.setWave);
  const setEnemiesAlive = useGameUi((s) => s.setEnemiesAlive);
  const setCombo = useGameUi((s) => s.setCombo);
  const setBestCombo = useGameUi((s) => s.setBestCombo);
  const setWeapon = useGameUi((s) => s.setWeapon);
  const setAmmo = useGameUi((s) => s.setAmmo);
  const setFps = useGameUi((s) => s.setFps);
  const setPaused = useGameUi((s) => s.setPaused);
  const setCooldowns = useGameUi((s) => s.setCooldowns);
  const flashDamage = useGameUi((s) => s.flashDamage);
  const showToast = useGameUi((s) => s.showToast);
  const addKill = useGameUi((s) => s.addKill);
  const resetForRun = useGameUi((s) => s.resetForRun);
  const setLastResult = useApp((s) => s.setLastResult);
  const setScreen = useApp((s) => s.setScreen);
  const classId = useApp((s) => s.classId);
  const settings = useApp((s) => s.settings);
  const glbUrl = useApp((s) => s.glbUrl);

  const cls = useMemo(() => CLASSES[classId ?? 'savasci'] ?? CLASSES.savasci, [classId]);

  // Enemy list as React state so meshes mount/unmount cleanly.
  const [enemies, setEnemies] = useState<EnemyState[]>([]);
  const enemiesRef = useRef<EnemyState[]>([]);
  enemiesRef.current = enemies;

  const [, forceRerender] = useState(0);

  const state = useRef({
    playerPos: new THREE.Vector3(0, 0, 0),
    playerVel: new THREE.Vector3(),
    playerAngle: 0,
    walkAmount: 0,
    attackAnim: 0,
    hitFlash: 0,
    hp: cls.hp,
    hpMax: cls.hp,
    energy: cls.energy,
    energyMax: cls.energy,
    tengri: 100,
    tengriMax: 100,
    score: 0,
    time: 0,
    wave: 1,
    pendingSpawns: [] as { type: EnemyType; delay: number }[],
    waveTimer: 1.0,
    weapon: 'fist' as WeaponId,
    ammo: Infinity,
    cdAttack: 0,
    cdSpecial: 0,
    combo: 0,
    bestCombo: 0,
    comboTimer: 0,
    kills: 0,
    shake: 0,
    fpsBuf: [] as number[],
    gameStarted: false,
    overTriggered: false,
    pickedPistolDrop: false,
    knifeDropped: false,
    swordDropped: false,
    pickups: [] as Pickup[],
    nextPickupId: 1,
  });

  const sceneGroupRef = useRef<THREE.Group>(null);
  const playerGroupRef = useRef<THREE.Group>(null);

  // Initialize
  useEffect(() => {
    resetForRun(cls.hp, cls.energy);
    setWeapon('fist', Infinity);
    const s = state.current;
    s.hp = cls.hp; s.hpMax = cls.hp;
    s.energy = cls.energy; s.energyMax = cls.energy;
    s.tengri = 100; s.tengriMax = 100;
    s.score = 0; s.time = 0; s.wave = 1;
    s.pendingSpawns = []; s.waveTimer = 1.5;
    s.weapon = 'fist'; s.ammo = Infinity;
    s.cdAttack = 0; s.cdSpecial = 0;
    s.combo = 0; s.bestCombo = 0; s.kills = 0;
    s.playerPos.set(0, 0, 0); s.playerVel.set(0, 0, 0);
    s.playerAngle = 0;
    s.gameStarted = true;
    s.overTriggered = false;
    s.pickedPistolDrop = false;
    s.knifeDropped = false;
    s.swordDropped = false;
    s.pickups = [];
    showToast(`DALGA 1 BAŞLIYOR`, 'info');
    setWave(1);
    scheduleWave(1);
    setEnemies([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Input subscriptions
  useEffect(() => {
    let lastAtk = useInput.getState().attackPressed;
    let lastSpc = useInput.getState().specialPressed;
    let lastPause = useInput.getState().pausePressed;
    const unsub = useInput.subscribe((cur) => {
      if (cur.attackPressed !== lastAtk) { lastAtk = cur.attackPressed; doAttack(); }
      if (cur.specialPressed !== lastSpc) { lastSpc = cur.specialPressed; doSpecial(); }
      if (cur.pausePressed !== lastPause) {
        lastPause = cur.pausePressed;
        const next = !useGameUi.getState().paused;
        setPaused(next);
      }
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function scheduleWave(n: number) {
    const wave = getWave(n);
    // Apply maxEnemies limit when autoPerf is enabled
    const count = settings.autoPerf ? Math.min(wave.count, preset.maxEnemies) : wave.count;
    let t = 0.5;
    state.current.pendingSpawns = [];
    for (let i = 0; i < count; i++) {
      const type = wave.types[i % wave.types.length];
      state.current.pendingSpawns.push({ type, delay: t });
      t += wave.delay;
    }
    state.current.waveTimer = 0.1;
    audio.wave();
  }

  function spawnEnemy(type: EnemyType) {
    const def = ENEMY_DEFS[type];
    const ang = Math.random() * Math.PI * 2;
    const r = ARENA_RADIUS * 0.85;
    const e: EnemyState = {
      type,
      posX: Math.cos(ang) * r,
      posZ: Math.sin(ang) * r,
      rotY: 0,
      hp: def.hp,
      hpMax: def.hp,
      speed: def.speed,
      attackTimer: Math.random() * def.attackCd,
      hitFlash: 0,
      attackAnim: 0,
      alive: true,
    };
    enemiesRef.current = [...enemiesRef.current, e];
    setEnemies(enemiesRef.current);
    setEnemiesAlive(enemiesRef.current.filter((x) => x.alive).length);
  }

  function spawnPickup(kind: Pickup['kind'], pos: THREE.Vector3) {
    if (!sceneGroupRef.current) return;
    const g = new THREE.Group();
    let color = 0xff5252;
    if (kind === 'knife') color = 0xcccccc;
    if (kind === 'pistol') color = 0xffaa44;
    if (kind === 'sword') color = 0x88c4ff;
    const box = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.32, 0),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.6, roughness: 0.3 }),
    );
    box.position.y = 0.7;
    g.add(box);
    const halo = new THREE.PointLight(color, 0.7, 4, 2);
    halo.position.y = 0.7;
    g.add(halo);
    g.position.copy(pos);
    g.position.y = 0;
    sceneGroupRef.current.add(g);
    state.current.pickups.push({ id: state.current.nextPickupId++, kind, pos: g.position, mesh: g });
  }

  function doAttack() {
    const s = state.current;
    if (s.cdAttack > 0) return;
    if (useGameUi.getState().paused) return;
    const w = WEAPONS[s.weapon];
    if (w.type === 'ranged') {
      if (s.ammo <= 0) {
        showToast('MERMİ BİTTİ → BIÇAK', 'warn');
        s.weapon = 'knife'; s.ammo = Infinity;
        setWeapon('knife', Infinity);
        return;
      }
      s.ammo--; setAmmo(s.ammo);
      audio.shoot();
    } else {
      if (w.id === 'knife') audio.knife();
      else if (w.id === 'sword') audio.sword();
      else audio.attack();
    }
    s.cdAttack = w.cooldown;
    s.attackAnim = 0.001;
    const dmg = w.minDmg + Math.random() * (w.maxDmg - w.minDmg);
    const mult = w.type === 'ranged' ? cls.rangedMult : cls.meleeMult;
    const finalDmg = dmg * mult;

    const forward = new THREE.Vector3(Math.sin(s.playerAngle), 0, Math.cos(s.playerAngle));

    if (w.type === 'ranged') {
      let best: { e: EnemyState; dist: number } | null = null;
      for (const en of enemiesRef.current) {
        if (!en.alive) continue;
        const dx = en.posX - s.playerPos.x;
        const dz = en.posZ - s.playerPos.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > w.range) continue;
        const dx2 = dx / dist, dz2 = dz / dist;
        const dot = dx2 * forward.x + dz2 * forward.z;
        if (dot < 0.5) continue;
        if (!best || dist < best.dist) best = { e: en, dist };
      }
      const muzzle = s.playerPos.clone().setY(1.4).add(forward.clone().multiplyScalar(0.6));
      fxBus.spawnSpark({ pos: muzzle, count: 5, color: 0xffe066, speed: 4, life: 0.18, size: 0.05 });
      if (best) damageEnemy(best.e, finalDmg, new THREE.Vector3(best.e.posX, 1.2, best.e.posZ));
      s.shake = Math.min(1, s.shake + 0.2);
    } else {
      let any = false;
      for (const en of enemiesRef.current) {
        if (!en.alive) continue;
        const dx = en.posX - s.playerPos.x;
        const dz = en.posZ - s.playerPos.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > w.range + 0.6) continue;
        const dx2 = dx / dist, dz2 = dz / dist;
        const dot = dx2 * forward.x + dz2 * forward.z;
        if (dot < 0.4) continue;
        damageEnemy(en, finalDmg, new THREE.Vector3(en.posX, 1.2, en.posZ));
        any = true;
      }
      if (any) s.shake = Math.min(1, s.shake + 0.4);
    }
  }

  function doSpecial() {
    const s = state.current;
    if (s.cdSpecial > 0) return;
    if (s.tengri < 35) { showToast('TENGRİ ENERJİSİ DÜŞÜK', 'warn'); return; }
    s.tengri = Math.max(0, s.tengri - 35);
    setTengri(s.tengri);
    s.cdSpecial = 4.5;
    audio.special();
    const radius = 7;
    fxBus.spawnRing({ pos: s.playerPos.clone().setY(0.05), color: 0x66bbff, maxRadius: radius * 1.4, life: 0.7 });
    fxBus.spawnRing({ pos: s.playerPos.clone().setY(0.05), color: 0xffffff, maxRadius: radius * 0.9, life: 0.5 });
    fxBus.spawnSpark({ pos: s.playerPos.clone().setY(1.0), count: 40, color: 0x88c4ff, speed: 12, life: 0.7, size: 0.12 });
    fxBus.spawnSpark({ pos: s.playerPos.clone().setY(0.5), count: 22, color: 0xffffff, speed: 8, life: 0.5, size: 0.08 });
    s.shake = 1;
    for (const en of enemiesRef.current) {
      if (!en.alive) continue;
      const dx = en.posX - s.playerPos.x;
      const dz = en.posZ - s.playerPos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist <= radius) {
        const dmg = 90 + Math.random() * 50;
        damageEnemy(en, dmg, new THREE.Vector3(en.posX, 1.2, en.posZ));
        // Knockback
        const k = 4 / Math.max(0.5, dist);
        en.posX += dx * k * 0.5;
        en.posZ += dz * k * 0.5;
      }
    }
  }

  function damageEnemy(e: EnemyState, dmg: number, hitPos: THREE.Vector3) {
    if (!e.alive) return;
    e.hp -= dmg;
    e.hitFlash = 1;
    e.attackAnim = 0.001;
    fxBus.spawnSpark({ pos: hitPos.clone().setY(1.2), count: 8, color: 0xff5555, speed: 4, life: 0.4, size: 0.06 });
    audio.enemyHit();
    if (e.hp <= 0) {
      e.alive = false;
      const def = ENEMY_DEFS[e.type];
      state.current.score += def.score;
      setScore(state.current.score);
      state.current.kills++;
      state.current.combo++;
      state.current.comboTimer = 3.0;
      if (state.current.combo > state.current.bestCombo) {
        state.current.bestCombo = state.current.combo;
        setBestCombo(state.current.bestCombo);
      }
      setCombo(state.current.combo);
      const label = e.type === 'boss' ? 'BOSS ŞAMAN' : e.type === 'heavy' ? 'AĞIR' : e.type === 'shaman' ? 'ŞAMAN' : 'MUHAFIZ';
      addKill(`💀 ${label} +${def.score}`);
      audio.enemyDie();
      fxBus.spawnSpark({ pos: hitPos.clone().setY(1.0), count: 16, color: 0xffaa44, speed: 6, life: 0.7, size: 0.1 });

      // Weapon / health drops
      if (!state.current.knifeDropped && e.type === 'guard' && state.current.wave === 1 && state.current.kills >= 2) {
        state.current.knifeDropped = true;
        spawnPickup('knife', hitPos);
      }
      if (!state.current.pickedPistolDrop && (e.type === 'shaman' || e.type === 'heavy') && state.current.wave >= 3) {
        state.current.pickedPistolDrop = true;
        spawnPickup('pistol', hitPos);
      }
      if (!state.current.swordDropped && e.type === 'heavy' && state.current.wave >= 4) {
        state.current.swordDropped = true;
        spawnPickup('sword', hitPos);
      }
      if (e.type === 'heavy' && Math.random() < 0.55) spawnPickup('health', hitPos);
      if (e.type === 'boss') {
        // Boss defeated → victory after delay
        if (!state.current.overTriggered) {
          state.current.overTriggered = true;
          setTimeout(() => {
            setLastResult({
              win: true,
              reason: 'Boss düştü! Tengri seni kutladı!',
              score: state.current.score,
              time: state.current.time,
              kills: state.current.kills,
              wave: state.current.wave,
              bestCombo: state.current.bestCombo,
            });
            audio.victory();
            setScreen('victory');
          }, 800);
        }
      }
    }
    setEnemiesAlive(enemiesRef.current.filter((x) => x.alive).length);
    forceRerender((n) => n + 1);
  }

  useFrame((_, dtRaw) => {
    const s = state.current;
    if (!s.gameStarted || s.overTriggered) return;
    if (useGameUi.getState().paused) return;
    const dt = Math.min(dtRaw, 0.05);
    s.time += dt;
    setTime(s.time);

    // FPS
    const fps = 1 / Math.max(dtRaw, 0.0001);
    s.fpsBuf.push(fps);
    if (s.fpsBuf.length > 60) s.fpsBuf.shift();
    setFps(s.fpsBuf.reduce((a, b) => a + b, 0) / s.fpsBuf.length);

    const input = useInput.getState();
    const mLen = Math.sqrt(input.moveX * input.moveX + input.moveY * input.moveY);
    const walking = mLen > 0.1;

    // Camera-relative movement
    const camYaw = Math.atan2(camera.position.x - s.playerPos.x, camera.position.z - s.playerPos.z) + Math.PI;
    const camForward = new THREE.Vector3(Math.sin(camYaw), 0, Math.cos(camYaw));
    const camRight = new THREE.Vector3(camForward.z, 0, -camForward.x);
    const moveDir = new THREE.Vector3();
    if (walking) {
      moveDir.addScaledVector(camForward, -input.moveY);
      moveDir.addScaledVector(camRight, input.moveX);
      if (moveDir.lengthSq() > 0) moveDir.normalize();
    }
    const targetSpeed = walking ? cls.speed * (input.defenseDown ? 0.5 : 1) : 0;
    s.playerVel.lerp(moveDir.multiplyScalar(targetSpeed), 0.25);
    s.playerPos.addScaledVector(s.playerVel, dt);
    const d = Math.sqrt(s.playerPos.x ** 2 + s.playerPos.z ** 2);
    if (d > ARENA_RADIUS - 0.8) {
      const k = (ARENA_RADIUS - 0.8) / d;
      s.playerPos.x *= k; s.playerPos.z *= k;
    }
    s.walkAmount = THREE.MathUtils.lerp(s.walkAmount, walking ? Math.min(1, mLen * 1.2) : 0, 0.18);
    if (walking) {
      const tgt = Math.atan2(moveDir.x, moveDir.z);
      s.playerAngle = lerpAngle(s.playerAngle, tgt, 0.18);
    }
    if (s.attackAnim > 0) {
      s.attackAnim += dt * 4;
      if (s.attackAnim >= 1) s.attackAnim = 0;
    }
    if (s.hitFlash > 0) s.hitFlash = Math.max(0, s.hitFlash - dt * 4);

    const defenseActive = input.defenseDown && s.energy > 0;
    if (defenseActive) s.energy = Math.max(0, s.energy - 20 * dt);
    else s.energy = Math.min(s.energyMax, s.energy + 10 * dt);
    s.tengri = Math.min(s.tengriMax, s.tengri + 5 * dt);
    setEnergy(s.energy, s.energyMax);
    setTengri(s.tengri, s.tengriMax);
    // Sync HUD defense overlay to current defense activity (held + has energy).
    if (useGameUi.getState().defenseHeld !== defenseActive) {
      useGameUi.getState().setDefenseHeld(defenseActive);
    }

    if (s.combo > 0) {
      s.comboTimer -= dt;
      if (s.comboTimer <= 0) { s.combo = 0; setCombo(0); }
    }
    if (s.cdAttack > 0) s.cdAttack = Math.max(0, s.cdAttack - dt);
    if (s.cdSpecial > 0) s.cdSpecial = Math.max(0, s.cdSpecial - dt);
    setCooldowns({ attack: s.cdAttack, defense: 0, special: s.cdSpecial });

    // Player transform on the group
    if (playerGroupRef.current) {
      playerGroupRef.current.position.copy(s.playerPos);
      playerGroupRef.current.rotation.y = s.playerAngle;
    }

    // Spawn pending
    if (s.pendingSpawns.length > 0) {
      s.pendingSpawns[0].delay -= dt;
      if (s.pendingSpawns[0].delay <= 0) {
        const ps = s.pendingSpawns.shift()!;
        spawnEnemy(ps.type);
      }
    } else {
      const aliveCount = enemiesRef.current.filter((e) => e.alive).length;
      if (aliveCount === 0) {
        s.waveTimer -= dt;
        if (s.waveTimer <= 0) {
          // Clean dead bodies
          const filtered = enemiesRef.current.filter((e) => e.alive);
          enemiesRef.current = filtered;
          setEnemies(filtered);
          s.wave++;
          setWave(s.wave);
          showToast(`DALGA ${s.wave}!`, 'good');
          scheduleWave(s.wave);
          s.waveTimer = 3.0;
        }
      }
    }

    // Enemy AI
    for (const en of enemiesRef.current) {
      if (!en.alive) continue;
      const def = ENEMY_DEFS[en.type];
      const dx = s.playerPos.x - en.posX;
      const dz = s.playerPos.z - en.posZ;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const tgtAng = Math.atan2(dx, dz);
      en.rotY = lerpAngle(en.rotY, tgtAng, 0.15);
      const stopRange = def.attackRange * 0.85;
      if (dist > stopRange && dist > 0.01) {
        en.posX += (dx / dist) * def.speed * dt;
        en.posZ += (dz / dist) * def.speed * dt;
      }
      // Separation
      for (const o of enemiesRef.current) {
        if (o === en || !o.alive) continue;
        const ox = en.posX - o.posX;
        const oz = en.posZ - o.posZ;
        const d2 = Math.sqrt(ox * ox + oz * oz);
        if (d2 < 1.2 && d2 > 0.01) {
          en.posX += (ox / d2) * (1.2 - d2) * 0.5;
          en.posZ += (oz / d2) * (1.2 - d2) * 0.5;
        }
      }
      // Arena bound clamp (don't let them leave the stone ring)
      const ed = Math.sqrt(en.posX * en.posX + en.posZ * en.posZ);
      if (ed > ARENA_RADIUS - 0.8) {
        const k = (ARENA_RADIUS - 0.8) / ed;
        en.posX *= k; en.posZ *= k;
      }
      if (en.hitFlash > 0) en.hitFlash = Math.max(0, en.hitFlash - dt * 5);
      if (en.attackAnim > 0) {
        en.attackAnim += dt * 3;
        if (en.attackAnim >= 1) en.attackAnim = 0;
      }
      en.attackTimer -= dt;
      if (en.attackTimer <= 0 && dist <= def.attackRange + 0.4) {
        en.attackTimer = def.attackCd;
        en.attackAnim = 0.001;
        let dmg = def.attackDmg;
        if (input.defenseDown && s.energy > 0) dmg *= 0.25;
        s.hp -= dmg;
        s.hitFlash = 1;
        flashDamage();
        audio.hit();
        s.shake = Math.min(1, s.shake + 0.5);
        if (s.hp <= 0 && !s.overTriggered) {
          s.hp = 0; s.overTriggered = true;
          setHp(0, s.hpMax);
          setTimeout(() => {
            setLastResult({
              win: false,
              reason: 'Tengri seni çağırdı, dinlen savaşçı.',
              score: s.score, time: s.time, kills: s.kills, wave: s.wave, bestCombo: s.bestCombo,
            });
            audio.defeat();
            setScreen('gameover');
          }, 700);
          return;
        }
        setHp(s.hp, s.hpMax);
        if (en.type === 'shaman') {
          fxBus.spawnSpark({ pos: new THREE.Vector3(en.posX, 1.5, en.posZ), count: 12, color: 0xaa44ff, speed: 8, life: 0.5, size: 0.08 });
        }
      }
    }

    // Pickups
    for (let i = s.pickups.length - 1; i >= 0; i--) {
      const p = s.pickups[i];
      p.mesh.rotation.y += dt * 2;
      p.mesh.children[0].position.y = 0.7 + Math.sin(s.time * 3 + i) * 0.1;
      const dx = p.pos.x - s.playerPos.x;
      const dz = p.pos.z - s.playerPos.z;
      const dd = Math.sqrt(dx * dx + dz * dz);
      if (dd < 1.3) {
        if (p.kind === 'health') {
          s.hp = Math.min(s.hpMax, s.hp + 40);
          setHp(s.hp, s.hpMax);
          showToast('+40 CAN', 'good');
        } else if (p.kind === 'knife') {
          s.weapon = 'knife'; s.ammo = Infinity;
          setWeapon('knife', Infinity);
          showToast('🔪 BIÇAK', 'good');
        } else if (p.kind === 'pistol') {
          s.weapon = 'pistol'; s.ammo = WEAPONS.pistol.maxAmmo;
          setWeapon('pistol', WEAPONS.pistol.maxAmmo);
          showToast('🔫 TABANCA', 'good');
        } else if (p.kind === 'sword') {
          s.weapon = 'sword'; s.ammo = Infinity;
          setWeapon('sword', Infinity);
          showToast('⚔️ KILIÇ', 'good');
        }
        audio.pickup();
        sceneGroupRef.current?.remove(p.mesh);
        p.mesh.traverse((o: any) => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) o.material.dispose();
        });
        s.pickups.splice(i, 1);
      }
    }

    // Camera
    const camTargetPos = s.playerPos.clone().add(new THREE.Vector3(0, 1.6, 0));
    const desired = new THREE.Vector3(
      s.playerPos.x - Math.sin(s.playerAngle) * settings.camDistance * 0.7,
      settings.camDistance * 0.55,
      s.playerPos.z - Math.cos(s.playerAngle) * settings.camDistance * 0.7,
    );
    camera.position.lerp(desired, 0.08);
    if (s.shake > 0) {
      camera.position.x += (Math.random() - 0.5) * s.shake * 0.3;
      camera.position.y += (Math.random() - 0.5) * s.shake * 0.3;
      s.shake = Math.max(0, s.shake - dt * 3);
    }
    camera.lookAt(camTargetPos);

    // Minimap
    minimapState.player.x = s.playerPos.x;
    minimapState.player.z = s.playerPos.z;
    minimapState.player.angle = s.playerAngle;
    minimapState.enemies = enemiesRef.current
      .filter((e) => e.alive)
      .map((e) => ({ x: e.posX, z: e.posZ, boss: e.type === 'boss' }));
  });

  return (
    <group ref={sceneGroupRef}>
      <group ref={playerGroupRef}>
        <PlayerModel glbUrl={glbUrl ?? undefined} walkAmount={state.current.walkAmount} attackAnim={state.current.attackAnim} hitFlash={state.current.hitFlash} />
      </group>
      {enemies.map((en, i) => (
        <EnemyMesh key={i + '-' + en.type} data={en} />
      ))}
    </group>
  );
}

function lerpAngle(a: number, b: number, t: number) {
  let diff = b - a;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}
