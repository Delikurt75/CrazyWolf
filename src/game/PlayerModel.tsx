import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

// Procedural Benan Deniz placeholder: large build, tuxedo, white shirt, bow tie, black shoes.
// Animates with idle bob + walk swing + attack swing controlled via refs.

interface Refs {
  group: THREE.Group;
  armL: THREE.Object3D;
  armR: THREE.Object3D;
  legL: THREE.Object3D;
  legR: THREE.Object3D;
  head: THREE.Object3D;
  torso: THREE.Object3D;
}

function buildBenan(): Refs {
  const SKIN = 0xe1b58e;
  const SUIT = 0x14161c;
  const SUIT_HI = 0x222730;
  const SHIRT = 0xf2f2f2;
  const TIE = 0x111111;
  const HAIR = 0x0e0e10;
  const SHOE = 0x080808;

  const group = new THREE.Group();
  const mat = (color: number, rough = 0.7, metal = 0.0) =>
    new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });

  // Torso (tuxedo jacket) – box with bevel feel from layered geometry
  const torso = new THREE.Group();
  const jacketGeo = new THREE.BoxGeometry(0.72, 0.78, 0.4);
  const jacket = new THREE.Mesh(jacketGeo, mat(SUIT, 0.65));
  jacket.castShadow = true; jacket.receiveShadow = true;
  torso.add(jacket);

  // White shirt strip
  const shirtGeo = new THREE.BoxGeometry(0.24, 0.6, 0.05);
  const shirt = new THREE.Mesh(shirtGeo, mat(SHIRT, 0.4));
  shirt.position.set(0, 0.02, 0.205);
  shirt.castShadow = true;
  torso.add(shirt);

  // Bow tie
  const bowTie = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.04), mat(TIE, 0.3));
  bowTie.position.set(0, 0.3, 0.23);
  torso.add(bowTie);
  // Lapels
  const lapelGeo = new THREE.BoxGeometry(0.22, 0.55, 0.045);
  const lapelL = new THREE.Mesh(lapelGeo, mat(SUIT_HI, 0.55));
  lapelL.position.set(-0.13, -0.05, 0.215);
  lapelL.rotation.z = 0.15;
  torso.add(lapelL);
  const lapelR = lapelL.clone();
  lapelR.position.x = 0.13;
  lapelR.rotation.z = -0.15;
  torso.add(lapelR);

  // Belt
  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.07, 0.42), mat(0x080808, 0.5));
  belt.position.y = -0.42;
  torso.add(belt);

  torso.position.y = 1.2;
  group.add(torso);

  // Head
  const head = new THREE.Group();
  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.21, 24, 18), mat(SKIN, 0.75));
  headMesh.scale.set(1, 1.08, 1);
  headMesh.castShadow = true;
  head.add(headMesh);
  // Hair
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.215, 18, 14, 0, Math.PI * 2, 0, Math.PI / 2), mat(HAIR, 0.7));
  hair.position.y = 0.04;
  head.add(hair);
  // Hair stripe (slick back vibe)
  const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.14, 0.34), mat(HAIR, 0.7));
  hairBack.position.set(0, 0.08, -0.04);
  head.add(hairBack);
  // Eyes
  const eyeMat = mat(0x0a0a0a, 0.4);
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 6), eyeMat);
  eyeL.position.set(-0.07, 0.0, 0.19);
  head.add(eyeL);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.07;
  head.add(eyeR);
  // Eyebrows
  const browMat = mat(HAIR, 0.6);
  const browL = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.012, 0.02), browMat);
  browL.position.set(-0.07, 0.05, 0.19);
  browL.rotation.z = -0.1;
  head.add(browL);
  const browR = browL.clone();
  browR.position.x = 0.07; browR.rotation.z = 0.1;
  head.add(browR);
  // Beard stubble
  const beard = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.07, 0.18), mat(0x2a2018, 0.85));
  beard.position.set(0, -0.13, 0.05);
  head.add(beard);
  // Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.13, 12), mat(SKIN, 0.7));
  neck.position.y = -0.22;
  head.add(neck);

  head.position.y = 1.85;
  group.add(head);

  // Arms (sleeves + cuff + hand)
  const makeArm = (side: number) => {
    const armGroup = new THREE.Group();
    // Pivot at shoulder
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.1, 0.55, 12), mat(SUIT, 0.65));
    sleeve.castShadow = true;
    sleeve.position.y = -0.27;
    armGroup.add(sleeve);
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 12), mat(SHIRT, 0.4));
    cuff.position.y = -0.55;
    armGroup.add(cuff);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 10), mat(SKIN, 0.7));
    hand.scale.set(0.9, 0.8, 0.9);
    hand.position.y = -0.65;
    hand.castShadow = true;
    armGroup.add(hand);
    armGroup.position.set(0.42 * side, 1.55, 0);
    return armGroup;
  };
  const armL = makeArm(-1);
  const armR = makeArm(1);
  group.add(armL); group.add(armR);

  // Legs
  const makeLeg = (side: number) => {
    const legGroup = new THREE.Group();
    const pant = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.13, 0.75, 12), mat(SUIT, 0.65));
    pant.castShadow = true;
    pant.position.y = -0.38;
    legGroup.add(pant);
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.1, 0.32), mat(SHOE, 0.3, 0.4));
    shoe.position.set(0, -0.79, 0.04);
    shoe.castShadow = true;
    legGroup.add(shoe);
    legGroup.position.set(0.16 * side, 0.8, 0);
    return legGroup;
  };
  const legL = makeLeg(-1);
  const legR = makeLeg(1);
  group.add(legL); group.add(legR);

  return { group, armL, armR, legL, legR, head, torso };
}

interface Props {
  glbUrl?: string;
  idle?: boolean;
  walkAmount?: number;   // 0..1
  attackAnim?: number;   // 0..1 progress
  hitFlash?: number;     // 0..1
}

export function PlayerModel({ glbUrl, idle = true, walkAmount = 0, attackAnim = 0, hitFlash = 0 }: Props) {
  const proceduralRefs = useMemo(() => buildBenan(), []);
  const wrapperRef = useRef<THREE.Group>(null);
  const useGlb = !!glbUrl;
  // Always call useGLTF (hooks rule) — provide default model path.
  const defaultUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') + '/models/benan.glb';
  const url = glbUrl ?? defaultUrl;
  const gltf: any = useGLTF(url);
  const glbScene = useMemo(() => {
    if (!useGlb || !gltf?.scene) return null;
    const cloned = gltf.scene.clone(true);
    // Auto-scale to about 1.85 tall
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3(); box.getSize(size);
    const targetH = 1.85;
    const scl = size.y > 0.01 ? targetH / size.y : 1;
    cloned.scale.setScalar(scl);
    // Drop to ground
    const box2 = new THREE.Box3().setFromObject(cloned);
    cloned.position.y -= box2.min.y;
    cloned.traverse((o: any) => {
      if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
    });
    return cloned;
  }, [gltf, useGlb]);

  // Animate procedural rig
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current += dt;
    if (useGlb && wrapperRef.current) {
      // Subtle bob for GLB
      const bob = idle ? Math.sin(t.current * 2) * 0.015 : 0;
      wrapperRef.current.position.y = bob;
      return;
    }
    const { armL, armR, legL, legR, head, torso } = proceduralRefs;
    // Idle breathing
    const breath = Math.sin(t.current * 2) * 0.02;
    torso.position.y = 1.2 + breath;
    head.position.y = 1.85 + breath;
    // Walk swing
    const speed = 9;
    const swing = walkAmount * 0.7;
    armL.rotation.x = Math.sin(t.current * speed) * swing - walkAmount * 0.2;
    armR.rotation.x = -Math.sin(t.current * speed) * swing - walkAmount * 0.2;
    legL.rotation.x = -Math.sin(t.current * speed) * swing * 0.9;
    legR.rotation.x = Math.sin(t.current * speed) * swing * 0.9;
    // Attack swing override (right arm)
    if (attackAnim > 0) {
      const a = Math.sin(attackAnim * Math.PI);
      armR.rotation.x = -a * 2.4;
      armR.rotation.z = -a * 0.3;
      torso.rotation.y = a * 0.25;
    } else {
      torso.rotation.y *= 0.85;
    }
    // Hit flash colour on torso
    if (hitFlash > 0) {
      torso.traverse((o: any) => {
        if (o.isMesh && o.material && o.material.emissive) {
          o.material.emissive.setRGB(hitFlash * 0.6, 0, 0);
        }
      });
    } else {
      torso.traverse((o: any) => {
        if (o.isMesh && o.material && o.material.emissive) {
          o.material.emissive.multiplyScalar(0.9);
        }
      });
    }
  });

  if (useGlb && glbScene) {
    return (
      <group ref={wrapperRef}>
        <primitive object={glbScene} />
      </group>
    );
  }

  return (
    <group ref={wrapperRef}>
      <primitive object={proceduralRefs.group} />
    </group>
  );
}

try { useGLTF.preload((import.meta.env.BASE_URL || '/').replace(/\/$/, '') + '/models/benan.glb'); } catch {}
