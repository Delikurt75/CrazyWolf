import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Particle / VFX manager. Spawn methods are accessed via the singleton fxBus.

export interface SparkSpec {
  pos: THREE.Vector3;
  count: number;
  color: number;
  speed?: number;
  size?: number;
  life?: number;
}

export interface RingSpec {
  pos: THREE.Vector3;
  color: number;
  maxRadius: number;
  life?: number;
}

interface Spark {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  life: number;
  total: number;
}

interface Ring {
  mesh: THREE.Mesh;
  life: number;
  total: number;
  maxR: number;
}

class FxBus {
  sparks: SparkSpec[] = [];
  rings: RingSpec[] = [];
  spawnSpark(s: SparkSpec) { this.sparks.push(s); }
  spawnRing(r: RingSpec) { this.rings.push(r); }
}

export const fxBus = new FxBus();

export function Effects() {
  const groupRef = useRef<THREE.Group>(null);
  const sparks = useMemo<Spark[]>(() => [], []);
  const rings = useMemo<Ring[]>(() => [], []);

  useFrame((_, dt) => {
    const g = groupRef.current;
    if (!g) return;

    // Spawn new sparks
    while (fxBus.sparks.length) {
      const s = fxBus.sparks.shift()!;
      const count = s.count;
      const life = s.life ?? 0.6;
      const speed = s.speed ?? 6;
      const size = s.size ?? 0.08;
      const geom = new THREE.SphereGeometry(size, 6, 4);
      const mat = new THREE.MeshBasicMaterial({ color: s.color, transparent: true });
      for (let i = 0; i < count; i++) {
        const m = new THREE.Mesh(geom, mat.clone());
        m.position.copy(s.pos);
        const ang = Math.random() * Math.PI * 2;
        const up = Math.random() * 0.8 + 0.2;
        m.userData._vel = new THREE.Vector3(Math.cos(ang) * speed, up * speed * 0.6, Math.sin(ang) * speed).multiplyScalar(0.5 + Math.random() * 0.5);
        g.add(m);
        sparks.push({ mesh: m, vel: m.userData._vel, life, total: life });
      }
    }

    // Spawn rings
    while (fxBus.rings.length) {
      const r = fxBus.rings.shift()!;
      const life = r.life ?? 0.55;
      const geo = new THREE.RingGeometry(0.05, 0.12, 32);
      const mat = new THREE.MeshBasicMaterial({ color: r.color, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
      const m = new THREE.Mesh(geo, mat);
      m.position.copy(r.pos);
      m.rotation.x = -Math.PI / 2;
      g.add(m);
      rings.push({ mesh: m, life, total: life, maxR: r.maxRadius });
    }

    // Update sparks
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.life -= dt;
      const f = s.life / s.total;
      s.mesh.position.addScaledVector(s.vel, dt);
      s.vel.y -= 9 * dt;
      (s.mesh.material as any).opacity = Math.max(0, f);
      s.mesh.scale.setScalar(Math.max(0.1, f));
      if (s.life <= 0) {
        g.remove(s.mesh);
        s.mesh.geometry.dispose();
        (s.mesh.material as any).dispose();
        sparks.splice(i, 1);
      }
    }

    // Update rings
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.life -= dt;
      const t = 1 - r.life / r.total;
      const scale = 0.4 + t * r.maxR;
      r.mesh.scale.setScalar(scale);
      (r.mesh.material as any).opacity = Math.max(0, 1 - t);
      if (r.life <= 0) {
        g.remove(r.mesh);
        r.mesh.geometry.dispose();
        (r.mesh.material as any).dispose();
        rings.splice(i, 1);
      }
    }
  });

  useEffect(() => () => {
    sparks.forEach((s) => { s.mesh.geometry.dispose(); (s.mesh.material as any).dispose(); });
    rings.forEach((r) => { r.mesh.geometry.dispose(); (r.mesh.material as any).dispose(); });
  }, [sparks, rings]);

  return <group ref={groupRef} />;
}
