import { useMemo } from 'react';
import * as THREE from 'three';
import { ARENA, ARENA_RADIUS } from '../lib/constants';

// Bozkır arena: dairesel taş halka, çadırlar, davullar, totem direkleri.
// Atmosferik sis ve gece mavisi gökyüzüyle Tengri teması.

export function Arena() {
  const decor = useMemo(() => buildArenaDecor(), []);

  return (
    <group>
      {/* Ground */}
      <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[ARENA_RADIUS * 1.4, 48]} />
        <meshStandardMaterial color={ARENA.groundColor} roughness={1} />
      </mesh>
      {/* Inner dirt ring */}
      <mesh receiveShadow position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[ARENA_RADIUS * 0.55, ARENA_RADIUS * 0.95, 48]} />
        <meshStandardMaterial color={0x3e2a18} roughness={1} />
      </mesh>
      {/* Stone ring boundary */}
      <mesh position={[0, 0.4, 0]}>
        <torusGeometry args={[ARENA_RADIUS, 0.5, 8, 60]} />
        <meshStandardMaterial color={0x3a3a3a} roughness={0.9} />
      </mesh>
      {/* Grid mat in center */}
      <mesh receiveShadow position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[6, 32]} />
        <meshStandardMaterial color={0x4a2a14} roughness={0.95} />
      </mesh>

      <primitive object={decor} />
    </group>
  );
}

function buildArenaDecor() {
  const group = new THREE.Group();

  // ===== Totem poles around the edge =====
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    const r = ARENA_RADIUS - 1.2;
    const x = Math.cos(ang) * r;
    const z = Math.sin(ang) * r;
    const totem = makeTotem(i);
    totem.position.set(x, 0, z);
    totem.lookAt(0, totem.position.y, 0);
    group.add(totem);
  }

  // ===== Tents (yurts) outside the ring =====
  const tentColors = [0xc4926a, 0x8e6a4a, 0xa67c5a, 0x6d5234];
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2 + 0.4;
    const r = ARENA_RADIUS + 4;
    const x = Math.cos(ang) * r;
    const z = Math.sin(ang) * r;
    const tent = makeTent(tentColors[i % tentColors.length]);
    tent.position.set(x, 0, z);
    tent.rotation.y = -ang + Math.PI;
    group.add(tent);
  }

  // ===== Shaman drums (Kam davulu) =====
  for (let i = 0; i < 4; i++) {
    const ang = (i / 4) * Math.PI * 2 + Math.PI / 8;
    const r = ARENA_RADIUS * 0.45;
    const drum = makeDrum();
    drum.position.set(Math.cos(ang) * r, 0, Math.sin(ang) * r);
    drum.rotation.y = -ang;
    group.add(drum);
  }

  // ===== Far mountains (silhouette) =====
  for (let i = 0; i < 20; i++) {
    const ang = (i / 20) * Math.PI * 2;
    const r = 70 + Math.random() * 12;
    const h = 8 + Math.random() * 10;
    const m = new THREE.Mesh(
      new THREE.ConeGeometry(6 + Math.random() * 4, h, 5),
      new THREE.MeshStandardMaterial({ color: 0x1a1a30, roughness: 1 }),
    );
    m.position.set(Math.cos(ang) * r, h / 2 - 1, Math.sin(ang) * r);
    group.add(m);
  }

  // ===== Sky dome =====
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(120, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x0a1230, side: THREE.BackSide, fog: false }),
  );
  group.add(sky);

  // Stars (small sprites as points)
  const starGeo = new THREE.BufferGeometry();
  const positions: number[] = [];
  for (let i = 0; i < 300; i++) {
    const a = Math.random() * Math.PI * 2;
    const b = Math.random() * Math.PI * 0.4 + 0.05;
    const r = 110;
    positions.push(
      Math.cos(a) * Math.sin(b) * r,
      Math.cos(b) * r,
      Math.sin(a) * Math.sin(b) * r,
    );
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xeeeeff, size: 0.6, fog: false }));
  group.add(stars);

  // Crescent moon (Türk bayrağı vibe)
  const moon = new THREE.Mesh(new THREE.CircleGeometry(2.5, 32), new THREE.MeshBasicMaterial({ color: 0xfff1c2, fog: false }));
  moon.position.set(-30, 28, -60);
  moon.lookAt(0, 12, 0);
  group.add(moon);

  return group;
}

function makeTotem(seed: number) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 3.4, 10), new THREE.MeshStandardMaterial({ color: 0x4d2e0e, roughness: 0.85 }));
  pole.position.y = 1.7; pole.castShadow = true;
  g.add(pole);
  // Wolf head on top
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 0.7), new THREE.MeshStandardMaterial({ color: 0x6b5436, roughness: 0.9 }));
  head.position.y = 3.6;
  g.add(head);
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 0.4), new THREE.MeshStandardMaterial({ color: 0x3a2a18, roughness: 0.95 }));
  snout.position.set(0, 3.55, 0.45);
  g.add(snout);
  const earL = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 6), new THREE.MeshStandardMaterial({ color: 0x3a2a18, roughness: 0.9 }));
  earL.position.set(-0.22, 3.95, -0.1);
  g.add(earL);
  const earR = earL.clone(); earR.position.x = 0.22;
  g.add(earR);
  // Glowing eyes
  const glow = new THREE.MeshBasicMaterial({ color: seed % 2 === 0 ? 0x88c4ff : 0xffaa66 });
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), glow);
  eye.position.set(0.12, 3.62, 0.36);
  g.add(eye);
  const eye2 = eye.clone(); eye2.position.x = -0.12;
  g.add(eye2);
  // Hanging cloth
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.45), new THREE.MeshStandardMaterial({ color: 0xb02b2b, side: THREE.DoubleSide, roughness: 0.95 }));
  cloth.position.set(0, 2.7, 0.05);
  g.add(cloth);
  return g;
}

function makeTent(color: number) {
  const g = new THREE.Group();
  // Cylindrical wall
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.7, 1.4, 12), new THREE.MeshStandardMaterial({ color, roughness: 0.95 }));
  wall.position.y = 0.7; wall.castShadow = true; wall.receiveShadow = true;
  g.add(wall);
  // Conical roof
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.85, 1.2, 12), new THREE.MeshStandardMaterial({ color: 0x4d3a24, roughness: 0.9 }));
  roof.position.y = 2.0; roof.castShadow = true;
  g.add(roof);
  // Smoke vent
  const vent = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.25, 8), new THREE.MeshStandardMaterial({ color: 0x222, roughness: 1 }));
  vent.position.y = 2.55;
  g.add(vent);
  // Door
  const door = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 1.0), new THREE.MeshStandardMaterial({ color: 0x2a1808, side: THREE.DoubleSide, roughness: 0.95 }));
  door.position.set(0, 0.5, 1.71);
  g.add(door);
  return g;
}

function makeDrum() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.18, 16), new THREE.MeshStandardMaterial({ color: 0xc9a374, roughness: 0.7 }));
  body.position.y = 0.7;
  body.rotation.z = Math.PI / 2;
  body.castShadow = true;
  g.add(body);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.06, 8, 16), new THREE.MeshStandardMaterial({ color: 0x4d2e0e, roughness: 0.9 }));
  ring.position.y = 0.7;
  ring.rotation.y = Math.PI / 2;
  g.add(ring);
  // Stand
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.7, 6), new THREE.MeshStandardMaterial({ color: 0x4d2e0e, roughness: 0.9 }));
  stand.position.y = 0.35; stand.castShadow = true;
  g.add(stand);
  return g;
}
