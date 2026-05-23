import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { ARENA, ARENA_RADIUS } from '../lib/constants';

export function Arena() {
  const decor = useMemo(() => buildArenaDecor(), []);

  return (
    <group>
      {/* Base ground */}
      <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[ARENA_RADIUS * 1.6, 64]} />
        <meshStandardMaterial color={ARENA.groundColor} roughness={1} />
      </mesh>
      {/* Combat dirt ring */}
      <mesh receiveShadow position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[ARENA_RADIUS * 0.32, ARENA_RADIUS * 0.97, 64]} />
        <meshStandardMaterial color={0x3a2210} roughness={1} />
      </mesh>
      {/* Inner sand */}
      <mesh receiveShadow position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[ARENA_RADIUS * 0.32, 48]} />
        <meshStandardMaterial color={0x56402e} roughness={1} />
      </mesh>
      {/* Ritual center */}
      <mesh receiveShadow position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[5.8, 36]} />
        <meshStandardMaterial color={0x4a2a14} roughness={0.85} />
      </mesh>
      {/* Runic ring etching */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.5, 5.6, 48]} />
        <meshStandardMaterial color={0x3a1e08} roughness={0.9} />
      </mesh>
      {/* Stone boundary torus */}
      <mesh position={[0, 0.45, 0]} receiveShadow>
        <torusGeometry args={[ARENA_RADIUS, 0.55, 8, 72]} />
        <meshStandardMaterial color={0x3a3835} roughness={0.95} metalness={0.05} />
      </mesh>
      {/* Inner cobble ledge */}
      <mesh position={[0, 0.18, 0]}>
        <torusGeometry args={[ARENA_RADIUS - 1.1, 1.1, 5, 64]} />
        <meshStandardMaterial color={0x2a2826} roughness={1} />
      </mesh>
      {/* Totem base patches */}
      {Array.from({ length: 8 }, (_, i) => {
        const ang = (i / 8) * Math.PI * 2;
        const r = ARENA_RADIUS - 1.2;
        return (
          <mesh key={i} receiveShadow position={[Math.cos(ang) * r, 0.01, Math.sin(ang) * r]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.75, 16]} />
            <meshStandardMaterial color={0x221408} roughness={1} />
          </mesh>
        );
      })}

      <primitive object={decor} />
      <ArenaLights />
      <EmberEmitter position={new THREE.Vector3(0, 0.5, 0)} rate={0.07} />
    </group>
  );
}

// ===== ANIMATED ARENA LIGHTS =====
function ArenaLights() {
  const torchRefs = useRef<(THREE.PointLight | null)[]>([]);
  const campfireRef = useRef<THREE.PointLight>(null);
  const flameRefs = useRef<(THREE.Mesh | null)[]>([]);
  const torchFlameRefs = useRef<(THREE.Mesh | null)[]>([]);
  const elapsed = useRef(0);

  const torchPositions = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => {
      const ang = (i / 4) * Math.PI * 2 + Math.PI / 8;
      const r = ARENA_RADIUS - 1.2;
      return new THREE.Vector3(Math.cos(ang) * r, 3.0, Math.sin(ang) * r);
    });
  }, []);

  useFrame((_, dt) => {
    elapsed.current += dt;
    const tc = elapsed.current;

    torchRefs.current.forEach((light, i) => {
      if (!light) return;
      const flicker = 1.3
        + 0.4 * Math.sin(tc * 11.3 + i * 2.7)
        + 0.25 * Math.sin(tc * 19.7 + i * 5.1)
        + 0.12 * (Math.random() - 0.5);
      light.intensity = Math.max(0.3, flicker);
    });

    if (campfireRef.current) {
      const flicker = 2.8
        + 0.7 * Math.sin(tc * 8.2)
        + 0.45 * Math.sin(tc * 17.5)
        + 0.25 * Math.sin(tc * 31.0)
        + 0.18 * (Math.random() - 0.5);
      campfireRef.current.intensity = Math.max(0.5, flicker);
    }

    // Animate campfire flames
    flameRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.scale.x = 0.85 + 0.15 * Math.sin(tc * 6 + i * 2.1) + 0.08 * Math.sin(tc * 13 + i * 1.3);
      mesh.scale.z = 0.85 + 0.15 * Math.sin(tc * 5.5 - i * 1.9) + 0.08 * Math.sin(tc * 9 + i);
      mesh.scale.y = 0.82 + 0.22 * Math.sin(tc * 7 + i * 1.7) + 0.1 * Math.sin(tc * 14 - i * 2);
      mesh.rotation.y = tc * 0.5 + i * 1.2;
      (mesh.material as THREE.MeshBasicMaterial).opacity = 0.72 + 0.22 * Math.sin(tc * 9 + i * 1.5);
    });

    // Animate torch flames
    torchFlameRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.scale.x = 0.9 + 0.12 * Math.sin(tc * 9 + i * 3.1);
      mesh.scale.z = 0.9 + 0.12 * Math.sin(tc * 11 + i * 2.3);
      mesh.scale.y = 0.85 + 0.18 * Math.sin(tc * 7.5 + i * 1.8);
      (mesh.material as THREE.MeshBasicMaterial).opacity = 0.75 + 0.2 * Math.sin(tc * 8 + i * 2);
    });
  });

  return (
    <>
      {torchPositions.map((pos, i) => (
        <group key={i}>
          <pointLight
            ref={(l) => { torchRefs.current[i] = l; }}
            position={pos}
            color={0xff8833}
            intensity={1.3}
            distance={11}
            decay={2}
          />
          {/* Torch flame visual */}
          <group position={[pos.x, pos.y - 0.2, pos.z]}>
            <mesh ref={(m) => { torchFlameRefs.current[i * 2] = m; }}>
              <coneGeometry args={[0.11, 0.32, 7]} />
              <meshBasicMaterial color={0xff8833} transparent opacity={0.85} />
            </mesh>
            <mesh position={[0, 0.08, 0]} ref={(m) => { torchFlameRefs.current[i * 2 + 1] = m; }}>
              <coneGeometry args={[0.065, 0.22, 6]} />
              <meshBasicMaterial color={0xffcc55} transparent opacity={0.8} />
            </mesh>
            {/* Torch bowl */}
            <mesh position={[0, -0.2, 0]}>
              <cylinderGeometry args={[0.12, 0.08, 0.18, 8]} />
              <meshStandardMaterial color={0x4a3010} roughness={0.8} metalness={0.3} />
            </mesh>
          </group>
        </group>
      ))}

      {/* Campfire light */}
      <pointLight ref={campfireRef} position={[0, 1.2, 0]} color={0xff6622} intensity={2.8} distance={15} decay={2} />

      {/* Campfire geometry */}
      <group position={[0, 0.01, 0]}>
        {Array.from({ length: 9 }, (_, i) => {
          const a = (i / 9) * Math.PI * 2;
          const rr = 0.48 + (i % 3) * 0.04;
          return (
            <mesh key={i} position={[Math.cos(a) * rr, 0.1, Math.sin(a) * rr]} castShadow>
              <sphereGeometry args={[0.14 + (i % 4) * 0.035, 5, 4]} />
              <meshStandardMaterial color={i % 2 === 0 ? 0x555550 : 0x454540} roughness={1} />
            </mesh>
          );
        })}
        {/* Logs */}
        {Array.from({ length: 3 }, (_, i) => {
          const a = (i / 3) * Math.PI * 2;
          return (
            <mesh key={i} rotation={[0, a, Math.PI / 2]} position={[Math.cos(a) * 0.16, 0.07, Math.sin(a) * 0.16]} castShadow>
              <cylinderGeometry args={[0.055, 0.075, 0.72, 8]} />
              <meshStandardMaterial color={0x3a2008} roughness={0.9} />
            </mesh>
          );
        })}
        {/* Emissive coals */}
        <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.33, 16]} />
          <meshStandardMaterial color={0xff2200} emissive={0xff3300} emissiveIntensity={2.5} roughness={0.4} />
        </mesh>
        {/* Flame cones */}
        {[
          { r: 0.23, h: 0.65, color: 0xff6622, op: 0.88 },
          { r: 0.16, h: 0.52, color: 0xffaa33, op: 0.84 },
          { r: 0.1, h: 0.4, color: 0xffee77, op: 0.78 },
        ].map((f, i) => (
          <mesh
            key={i}
            position={[0, 0.35, 0]}
            ref={(m) => { flameRefs.current[i] = m; }}
          >
            <coneGeometry args={[f.r, f.h, 8]} />
            <meshBasicMaterial color={f.color} transparent opacity={f.op} />
          </mesh>
        ))}
      </group>
    </>
  );
}

// ===== AMBIENT EMBER EMITTER =====
interface EmberEmitterProps {
  position: THREE.Vector3;
  rate?: number; // seconds between spawns
}

function EmberEmitter({ position, rate = 0.08 }: EmberEmitterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const embers = useRef<{ mesh: THREE.Mesh; vel: THREE.Vector3; life: number; total: number }[]>([]);
  const timer = useRef(0);

  useEffect(() => () => {
    embers.current.forEach((e) => {
      e.mesh.geometry.dispose();
      (e.mesh.material as THREE.Material).dispose();
    });
  }, []);

  useFrame((_, dt) => {
    const g = groupRef.current;
    if (!g) return;
    timer.current += dt;
    if (timer.current >= rate) {
      timer.current = 0;
      const size = 0.018 + Math.random() * 0.022;
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(size, 4, 3),
        new THREE.MeshBasicMaterial({
          color: Math.random() > 0.4 ? 0xff6622 : 0xffcc44,
          transparent: true,
          opacity: 0.9,
        }),
      );
      m.position.copy(position);
      m.position.x += (Math.random() - 0.5) * 0.35;
      m.position.z += (Math.random() - 0.5) * 0.35;
      g.add(m);
      const life = 1.4 + Math.random() * 1.8;
      embers.current.push({
        mesh: m,
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 0.35,
          0.9 + Math.random() * 0.7,
          (Math.random() - 0.5) * 0.35,
        ),
        life, total: life,
      });
    }
    for (let i = embers.current.length - 1; i >= 0; i--) {
      const e = embers.current[i];
      e.life -= dt;
      e.mesh.position.addScaledVector(e.vel, dt);
      e.vel.x += (Math.random() - 0.5) * 0.08 * dt;
      e.vel.z += (Math.random() - 0.5) * 0.08 * dt;
      const f = e.life / e.total;
      (e.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, f * 0.9);
      e.mesh.scale.setScalar(Math.max(0.05, f));
      if (e.life <= 0) {
        g.remove(e.mesh);
        e.mesh.geometry.dispose();
        (e.mesh.material as THREE.Material).dispose();
        embers.current.splice(i, 1);
      }
    }
  });

  return <group ref={groupRef} />;
}

// ===== STATIC ARENA DECORATION =====
function buildArenaDecor() {
  const group = new THREE.Group();

  // Totem poles
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    const r = ARENA_RADIUS - 1.2;
    const totem = makeTotem(i);
    totem.position.set(Math.cos(ang) * r, 0, Math.sin(ang) * r);
    totem.lookAt(0, totem.position.y, 0);
    group.add(totem);
  }

  // Yurt tents
  const tentColors = [0xc4926a, 0x8e6a4a, 0xa67c5a, 0x6d5234, 0xb8855c, 0x9a7248];
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2 + 0.4;
    const r = ARENA_RADIUS + 4.5;
    const tent = makeTent(tentColors[i % tentColors.length], i);
    tent.position.set(Math.cos(ang) * r, 0, Math.sin(ang) * r);
    tent.rotation.y = -ang + Math.PI;
    group.add(tent);
  }

  // Kam drums
  for (let i = 0; i < 4; i++) {
    const ang = (i / 4) * Math.PI * 2 + Math.PI / 8;
    const r = ARENA_RADIUS * 0.48;
    const drum = makeDrum();
    drum.position.set(Math.cos(ang) * r, 0, Math.sin(ang) * r);
    drum.rotation.y = -ang;
    group.add(drum);
  }

  // Mountains with snow caps
  for (let i = 0; i < 24; i++) {
    const ang = (i / 24) * Math.PI * 2 + (Math.random() - 0.5) * 0.15;
    const r = 70 + Math.random() * 16;
    const h = 9 + Math.random() * 14;
    const base = new THREE.Mesh(
      new THREE.ConeGeometry(5 + Math.random() * 5, h, 5 + (i % 2)),
      new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 1 }),
    );
    base.position.set(Math.cos(ang) * r, h / 2 - 1, Math.sin(ang) * r);
    group.add(base);
    if (Math.random() > 0.45) {
      const snow = new THREE.Mesh(
        new THREE.ConeGeometry(1.8 + Math.random() * 1.5, h * 0.32, 5),
        new THREE.MeshStandardMaterial({ color: 0xddeeff, roughness: 0.8 }),
      );
      snow.position.set(Math.cos(ang) * r, h - 1.5 + Math.random() * 0.5, Math.sin(ang) * r);
      group.add(snow);
    }
  }

  // Gradient sky dome — two layers for horizon glow
  const skyOuter = new THREE.Mesh(
    new THREE.SphereGeometry(125, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x060918, side: THREE.BackSide, fog: false }),
  );
  group.add(skyOuter);
  // Horizon glow band
  const skyHorizon = new THREE.Mesh(
    new THREE.CylinderGeometry(122, 122, 18, 36, 1, true),
    new THREE.MeshBasicMaterial({ color: 0x1a0d3a, side: THREE.BackSide, fog: false, transparent: true, opacity: 0.85 }),
  );
  skyHorizon.position.y = 4;
  group.add(skyHorizon);

  // Aurora Borealis bands (subtle)
  const auroraColors = [0x00cc66, 0x3366ff, 0x9933cc];
  for (let i = 0; i < 3; i++) {
    const ang = (i / 3) * Math.PI * 2;
    const aurora = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 20),
      new THREE.MeshBasicMaterial({
        color: auroraColors[i],
        transparent: true,
        opacity: 0.04 + i * 0.015,
        side: THREE.DoubleSide,
        fog: false,
      }),
    );
    aurora.position.set(Math.cos(ang) * 80, 55, Math.sin(ang) * 80);
    aurora.lookAt(0, 40, 0);
    aurora.rotation.z = ang * 0.3;
    group.add(aurora);
  }

  // Stars — varied sizes
  const starGeo = new THREE.BufferGeometry();
  const positions: number[] = [];
  const colors: number[] = [];
  for (let i = 0; i < 500; i++) {
    const a = Math.random() * Math.PI * 2;
    const b = Math.random() * Math.PI * 0.42 + 0.04;
    const r = 115;
    positions.push(Math.cos(a) * Math.sin(b) * r, Math.cos(b) * r, Math.sin(a) * Math.sin(b) * r);
    const warm = Math.random();
    colors.push(0.85 + warm * 0.15, 0.85 + warm * 0.1, 0.9 + (1 - warm) * 0.1);
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  starGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({ size: 0.55, vertexColors: true, fog: false, sizeAttenuation: true }),
  );
  group.add(stars);

  // Crescent moon — two overlapping circles
  const moonGlow = new THREE.Mesh(
    new THREE.CircleGeometry(3.2, 32),
    new THREE.MeshBasicMaterial({ color: 0xfff5c8, fog: false }),
  );
  moonGlow.position.set(-32, 30, -62);
  moonGlow.lookAt(0, 12, 0);
  group.add(moonGlow);
  const moonShadow = new THREE.Mesh(
    new THREE.CircleGeometry(2.8, 32),
    new THREE.MeshBasicMaterial({ color: 0x060918, fog: false }),
  );
  moonShadow.position.set(-30.5, 30.3, -61.2);
  moonShadow.lookAt(0, 12, 0);
  group.add(moonShadow);
  // Moon halo
  const moonHalo = new THREE.Mesh(
    new THREE.RingGeometry(3.4, 4.2, 32),
    new THREE.MeshBasicMaterial({ color: 0xfff5c8, transparent: true, opacity: 0.12, fog: false }),
  );
  moonHalo.position.set(-32, 30, -62);
  moonHalo.lookAt(0, 12, 0);
  group.add(moonHalo);

  return group;
}

function makeTotem(seed: number) {
  const g = new THREE.Group();
  // Main pole
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.22, 3.8, 10),
    new THREE.MeshStandardMaterial({ color: 0x3d2308, roughness: 0.9 }),
  );
  pole.position.y = 1.9; pole.castShadow = true;
  g.add(pole);
  // Decorative rings on pole
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.04, 5, 14),
      new THREE.MeshStandardMaterial({ color: 0x8a5a20, roughness: 0.7, metalness: 0.2 }),
    );
    ring.position.y = 0.7 + i * 1.2; ring.rotation.x = Math.PI / 2;
    g.add(ring);
  }
  // Wolf head
  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.58, 0.48, 0.72),
    new THREE.MeshStandardMaterial({ color: 0x6b5436, roughness: 0.9 }),
  );
  head.position.y = 4.0; head.castShadow = true;
  g.add(head);
  const snout = new THREE.Mesh(
    new THREE.BoxGeometry(0.36, 0.28, 0.42),
    new THREE.MeshStandardMaterial({ color: 0x3a2818, roughness: 0.95 }),
  );
  snout.position.set(0, 3.92, 0.52);
  g.add(snout);
  const earL = new THREE.Mesh(
    new THREE.ConeGeometry(0.13, 0.32, 6),
    new THREE.MeshStandardMaterial({ color: 0x3a2a18, roughness: 0.9 }),
  );
  earL.position.set(-0.22, 4.36, -0.1);
  g.add(earL);
  const earR = earL.clone(); earR.position.x = 0.22;
  g.add(earR);
  // Glowing eyes — alternate color per totem
  const eyeColor = seed % 3 === 0 ? 0x88c4ff : seed % 3 === 1 ? 0xff8833 : 0xcc44ff;
  const eyeMat = new THREE.MeshBasicMaterial({ color: eyeColor });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), eyeMat);
  eyeL.position.set(0.13, 4.02, 0.38);
  g.add(eyeL);
  const eyeR = eyeL.clone(); eyeR.position.x = -0.13;
  g.add(eyeR);
  // Hanging cloth
  const cloth = new THREE.Mesh(
    new THREE.PlaneGeometry(0.62, 0.5),
    new THREE.MeshStandardMaterial({ color: seed % 2 === 0 ? 0xa02020 : 0x203080, side: THREE.DoubleSide, roughness: 0.95 }),
  );
  cloth.position.set(0, 2.9, 0.06);
  g.add(cloth);
  // Torch holder bracket
  const bracket = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.08, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x554422, roughness: 0.7, metalness: 0.4 }),
  );
  bracket.position.set(0, 3.2, 0.26);
  g.add(bracket);
  return g;
}

function makeTent(color: number, seed: number) {
  const g = new THREE.Group();
  // Cylindrical wall
  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(1.65, 1.75, 1.5, 12),
    new THREE.MeshStandardMaterial({ color, roughness: 0.95 }),
  );
  wall.position.y = 0.75; wall.castShadow = true; wall.receiveShadow = true;
  g.add(wall);
  // Decorative band
  const band = new THREE.Mesh(
    new THREE.CylinderGeometry(1.68, 1.68, 0.14, 12),
    new THREE.MeshStandardMaterial({ color: seed % 2 === 0 ? 0x8a3020 : 0x204080, roughness: 0.8 }),
  );
  band.position.y = 1.3;
  g.add(band);
  // Conical roof
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(1.88, 1.3, 12),
    new THREE.MeshStandardMaterial({ color: 0x4a3820, roughness: 0.9 }),
  );
  roof.position.y = 2.1; roof.castShadow = true;
  g.add(roof);
  // Smoke vent
  const vent = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 0.28, 8),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 1 }),
  );
  vent.position.y = 2.65;
  g.add(vent);
  // Interior glow (emissive disk barely visible)
  const glow = new THREE.Mesh(
    new THREE.CircleGeometry(0.6, 16),
    new THREE.MeshBasicMaterial({ color: 0xff6622, transparent: true, opacity: 0.15 }),
  );
  glow.position.set(0, 0.01, 1.6);
  glow.rotation.x = -Math.PI / 2;
  g.add(glow);
  // Door
  const door = new THREE.Mesh(
    new THREE.PlaneGeometry(0.65, 1.05),
    new THREE.MeshStandardMaterial({ color: 0x221008, side: THREE.DoubleSide, roughness: 0.95 }),
  );
  door.position.set(0, 0.52, 1.76);
  g.add(door);
  return g;
}

function makeDrum() {
  const g = new THREE.Group();
  // Drum body — rotated to stand on edge
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.58, 0.58, 0.2, 18),
    new THREE.MeshStandardMaterial({ color: 0xc9a374, roughness: 0.65, metalness: 0.05 }),
  );
  body.position.y = 0.72; body.rotation.z = Math.PI / 2; body.castShadow = true;
  g.add(body);
  // Drum face designs
  const face = new THREE.Mesh(
    new THREE.CircleGeometry(0.52, 16),
    new THREE.MeshStandardMaterial({ color: 0xd4b484, roughness: 0.7 }),
  );
  face.position.set(0.11, 0.72, 0); face.rotation.y = Math.PI / 2;
  g.add(face);
  // Outer ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.58, 0.065, 8, 18),
    new THREE.MeshStandardMaterial({ color: 0x4d2e0e, roughness: 0.85 }),
  );
  ring.position.y = 0.72; ring.rotation.y = Math.PI / 2;
  g.add(ring);
  // Stand
  const stand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 0.72, 6),
    new THREE.MeshStandardMaterial({ color: 0x3d2208, roughness: 0.9 }),
  );
  stand.position.y = 0.36; stand.castShadow = true;
  g.add(stand);
  // Drumstick
  const stick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.55, 6),
    new THREE.MeshStandardMaterial({ color: 0x5d3a10, roughness: 0.8 }),
  );
  stick.position.set(0.2, 1.05, 0.2); stick.rotation.z = Math.PI / 4; stick.castShadow = true;
  g.add(stick);
  return g;
}
