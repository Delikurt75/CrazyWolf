import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { ENEMY_DEFS, EnemyType } from '../lib/constants';

function buildEnemy(type: EnemyType) {
  const def = ENEMY_DEFS[type];
  const group = new THREE.Group();
  const mat = (color: THREE.ColorRepresentation, rough = 0.7) => new THREE.MeshStandardMaterial({ color, roughness: rough });

  const body = new THREE.Group();
  const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 1.05, 12), mat(def.color, 0.85));
  robe.castShadow = true;
  body.add(robe);
  const trim = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.07, 6, 16), mat(0x2a1a10, 0.95));
  trim.rotation.x = Math.PI / 2;
  trim.position.y = -0.5;
  body.add(trim);
  body.position.y = 0.95;
  group.add(body);

  const head = new THREE.Group();
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 12), mat(0xe1b58e, 0.7));
  skull.castShadow = true;
  head.add(skull);
  if (type === 'shaman') {
    const mask = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.34, 8), mat(def.accent, 0.5));
    mask.position.set(0, 0.18, 0.08);
    mask.rotation.x = -0.3;
    head.add(mask);
    const f1 = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.32, 6), mat(0xff66ff, 0.5));
    f1.position.set(0, 0.4, -0.05); head.add(f1);
    const f2 = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.28, 6), mat(0x66bbff, 0.5));
    f2.position.set(0.1, 0.36, -0.05); f2.rotation.z = 0.3; head.add(f2);
    const f3 = f2.clone(); f3.position.x = -0.1; f3.rotation.z = -0.3; head.add(f3);
  } else if (type === 'heavy') {
    const helm = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 10, 0, Math.PI * 2, 0, Math.PI / 1.8), mat(0x404048, 0.4));
    helm.position.y = 0.04; head.add(helm);
    const horn1 = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.22, 6), mat(0xdddddd, 0.6));
    horn1.position.set(0.18, 0.18, 0); horn1.rotation.z = -0.6; head.add(horn1);
    const horn2 = horn1.clone(); horn2.position.x = -0.18; horn2.rotation.z = 0.6; head.add(horn2);
  } else if (type === 'boss') {
    const spirit = new THREE.Mesh(
      new THREE.SphereGeometry(0.36, 18, 14),
      new THREE.MeshStandardMaterial({ color: def.accent, emissive: def.accent, emissiveIntensity: 0.7, roughness: 0.3 }),
    );
    spirit.position.y = 0.05; head.add(spirit);
    const ear1 = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 6), mat(def.accent, 0.3));
    ear1.position.set(0.18, 0.3, 0); ear1.rotation.z = -0.2; head.add(ear1);
    const ear2 = ear1.clone(); ear2.position.x = -0.18; ear2.rotation.z = 0.2; head.add(ear2);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff66ff }));
    eye.position.set(0.12, 0.05, 0.3); head.add(eye);
    const eye2 = eye.clone(); eye2.position.x = -0.12; head.add(eye2);
  } else {
    const hood = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 10, 0, Math.PI * 2, 0, Math.PI / 1.5), mat(def.color, 0.85));
    hood.position.y = 0.04; head.add(hood);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), new THREE.MeshBasicMaterial({ color: 0xff5252 }));
    eye.position.set(0.08, 0.02, 0.22); head.add(eye);
    const eye2 = eye.clone(); eye2.position.x = -0.08; head.add(eye2);
  }
  head.position.y = 1.65;
  group.add(head);

  const armL = new THREE.Group();
  const sleeveL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.55, 8), mat(def.color, 0.85));
  sleeveL.position.y = -0.27;
  armL.add(sleeveL);
  armL.position.set(-0.42, 1.4, 0);
  group.add(armL);

  const armR = new THREE.Group();
  const sleeveR = sleeveL.clone();
  armR.add(sleeveR);
  if (type === 'guard' || type === 'heavy') {
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7, 8), mat(0x4d2e0e, 0.8));
    handle.position.y = -0.65; handle.rotation.x = 0.2;
    armR.add(handle);
    const head2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.05), mat(0xbbbbbb, 0.3));
    head2.position.set(0, -1, 0);
    armR.add(head2);
  } else if (type === 'shaman') {
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.1, 8), mat(0x4d2e0e, 0.8));
    staff.position.y = -0.5;
    armR.add(staff);
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 12, 10),
      new THREE.MeshStandardMaterial({ color: def.accent, emissive: def.accent, emissiveIntensity: 0.8 }),
    );
    orb.position.y = -1.05;
    armR.add(orb);
  } else if (type === 'boss') {
    const claw = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.35, 6),
      new THREE.MeshStandardMaterial({ color: def.accent, emissive: def.accent, emissiveIntensity: 0.5 }),
    );
    claw.position.y = -0.7; claw.rotation.x = Math.PI;
    armR.add(claw);
  }
  armR.position.set(0.42, 1.4, 0);
  group.add(armR);

  const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.1, 0.85, 8), mat(0x222222, 0.85));
  legL.position.set(-0.15, 0.42, 0); legL.castShadow = true;
  group.add(legL);
  const legR = legL.clone();
  legR.position.x = 0.15;
  group.add(legR);

  group.scale.setScalar(def.scale);
  return { group, armR, head };
}

// Public per-enemy logical state used by Game's simulation loop.
export interface EnemyState {
  type: EnemyType;
  posX: number;
  posZ: number;
  rotY: number;
  hp: number;
  hpMax: number;
  speed: number;
  attackTimer: number;
  hitFlash: number;
  attackAnim: number;
  alive: boolean;
  dropDone?: boolean;
}

interface Props {
  data: EnemyState;
}

export function EnemyMesh({ data }: Props) {
  const built = useMemo(() => buildEnemy(data.type), [data.type]);
  const ref = useRef<THREE.Group>(null);

  useFrame(() => {
    const g = ref.current; if (!g) return;
    g.position.set(data.posX, 0, data.posZ);
    g.rotation.y = data.rotY;
    g.visible = data.alive;
    if (data.hitFlash > 0) {
      built.group.traverse((o: any) => {
        if (o.isMesh && o.material && o.material.color) {
          if (!o.userData._origCol) o.userData._origCol = o.material.color.clone();
          o.material.color.lerpColors(o.userData._origCol, new THREE.Color(0xffffff), data.hitFlash);
        }
      });
    } else {
      built.group.traverse((o: any) => {
        if (o.isMesh && o.material && o.material.color && o.userData._origCol) {
          o.material.color.copy(o.userData._origCol);
        }
      });
    }
    if (data.attackAnim > 0) {
      const a = Math.sin(data.attackAnim * Math.PI);
      built.armR.rotation.x = -a * 1.8;
    } else {
      built.armR.rotation.x *= 0.85;
    }
    built.head.position.y = 1.65 + Math.sin(performance.now() * 0.004) * 0.015;
  });

  return <group ref={ref}><primitive object={built.group} /></group>;
}
