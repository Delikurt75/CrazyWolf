import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Procedural Benan Deniz placeholder + optional GLB swap-in.
// GLB loads imperatively so it never suspends the parent — procedural shows
// immediately, GLB takes its place when ready.

function buildBenan() {
  const SKIN = 0xe1b58e;
  const SUIT = 0x14161c;
  const SUIT_HI = 0x222730;
  const SHIRT = 0xf2f2f2;
  const TIE = 0x111111;
  const HAIR = 0x0e0e10;
  const SHOE = 0x080808;
  const group = new THREE.Group();
  const mat = (color: THREE.ColorRepresentation, rough = 0.7, metal = 0.0) =>
    new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });

  const torso = new THREE.Group();
  const jacket = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.78, 0.4), mat(SUIT, 0.65));
  jacket.castShadow = true; jacket.receiveShadow = true;
  torso.add(jacket);
  const shirt = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.6, 0.05), mat(SHIRT, 0.4));
  shirt.position.set(0, 0.02, 0.205);
  shirt.castShadow = true;
  torso.add(shirt);
  const bowTie = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.04), mat(TIE, 0.3));
  bowTie.position.set(0, 0.3, 0.23);
  torso.add(bowTie);
  const lapelGeo = new THREE.BoxGeometry(0.22, 0.55, 0.045);
  const lapelL = new THREE.Mesh(lapelGeo, mat(SUIT_HI, 0.55));
  lapelL.position.set(-0.13, -0.05, 0.215); lapelL.rotation.z = 0.15;
  torso.add(lapelL);
  const lapelR = lapelL.clone();
  lapelR.position.x = 0.13; lapelR.rotation.z = -0.15;
  torso.add(lapelR);
  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.07, 0.42), mat(0x080808, 0.5));
  belt.position.y = -0.42;
  torso.add(belt);
  torso.position.y = 1.2;
  group.add(torso);

  const head = new THREE.Group();
  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.21, 24, 18), mat(SKIN, 0.75));
  headMesh.scale.set(1, 1.08, 1); headMesh.castShadow = true;
  head.add(headMesh);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.215, 18, 14, 0, Math.PI * 2, 0, Math.PI / 2), mat(HAIR, 0.7));
  hair.position.y = 0.04; head.add(hair);
  const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.14, 0.34), mat(HAIR, 0.7));
  hairBack.position.set(0, 0.08, -0.04); head.add(hairBack);
  const eyeMat = mat(0x0a0a0a, 0.4);
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 6), eyeMat);
  eyeL.position.set(-0.07, 0.0, 0.19); head.add(eyeL);
  const eyeR = eyeL.clone(); eyeR.position.x = 0.07; head.add(eyeR);
  const browMat = mat(HAIR, 0.6);
  const browL = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.012, 0.02), browMat);
  browL.position.set(-0.07, 0.05, 0.19); browL.rotation.z = -0.1;
  head.add(browL);
  const browR = browL.clone();
  browR.position.x = 0.07; browR.rotation.z = 0.1;
  head.add(browR);
  const beard = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.07, 0.18), mat(0x2a2018, 0.85));
  beard.position.set(0, -0.13, 0.05); head.add(beard);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.13, 12), mat(SKIN, 0.7));
  neck.position.y = -0.22; head.add(neck);
  head.position.y = 1.85;
  group.add(head);

  const makeArm = (side: number) => {
    const armGroup = new THREE.Group();
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.1, 0.55, 12), mat(SUIT, 0.65));
    sleeve.castShadow = true; sleeve.position.y = -0.27;
    armGroup.add(sleeve);
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 12), mat(SHIRT, 0.4));
    cuff.position.y = -0.55;
    armGroup.add(cuff);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 10), mat(SKIN, 0.7));
    hand.scale.set(0.9, 0.8, 0.9); hand.position.y = -0.65; hand.castShadow = true;
    armGroup.add(hand);
    armGroup.position.set(0.42 * side, 1.55, 0);
    return armGroup;
  };
  const armL = makeArm(-1);
  const armR = makeArm(1);
  group.add(armL); group.add(armR);

  const makeLeg = (side: number) => {
    const legGroup = new THREE.Group();
    const pant = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.13, 0.75, 12), mat(SUIT, 0.65));
    pant.castShadow = true; pant.position.y = -0.38;
    legGroup.add(pant);
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.1, 0.32), mat(SHOE, 0.3, 0.4));
    shoe.position.set(0, -0.79, 0.04); shoe.castShadow = true;
    legGroup.add(shoe);
    legGroup.position.set(0.16 * side, 0.8, 0);
    return legGroup;
  };
  const legL = makeLeg(-1);
  const legR = makeLeg(1);
  group.add(legL); group.add(legR);

  return { group, armL, armR, legL, legR, head, torso };
}

// Module-level loader and cache so we only fetch each URL once and share across components.
const loader = new GLTFLoader();
const gltfCache = new Map<string, THREE.Group>();
const gltfLoading = new Map<string, Promise<THREE.Group>>();

function loadGLB(url: string): Promise<THREE.Group> {
  if (gltfCache.has(url)) return Promise.resolve(gltfCache.get(url)!.clone(true));
  if (gltfLoading.has(url)) return gltfLoading.get(url)!.then((g) => g.clone(true));
  const p = new Promise<THREE.Group>((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const scene = gltf.scene;
        const box = new THREE.Box3().setFromObject(scene);
        const size = new THREE.Vector3(); box.getSize(size);
        const targetH = 1.85;
        const scl = size.y > 0.01 ? targetH / size.y : 1;
        scene.scale.setScalar(scl);
        const box2 = new THREE.Box3().setFromObject(scene);
        scene.position.y -= box2.min.y;
        scene.traverse((o: any) => {
          if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
        });
        gltfCache.set(url, scene);
        resolve(scene.clone(true));
      },
      undefined,
      (err) => { console.warn('GLB load failed:', url, err); reject(err); },
    );
  });
  gltfLoading.set(url, p);
  return p;
}

interface Props {
  glbUrl?: string;
  idle?: boolean;
  walkAmount?: number;
  attackAnim?: number;
  hitFlash?: number;
  useDefault?: boolean;   // load packaged default GLB when true (menu/viewer/game)
}

export function PlayerModel({ glbUrl, idle = true, walkAmount = 0, attackAnim = 0, hitFlash = 0, useDefault = true }: Props) {
  const proceduralRefs = useMemo(() => buildBenan(), []);
  const wrapperRef = useRef<THREE.Group>(null);
  const [glbScene, setGlbScene] = useState<THREE.Group | null>(null);

  useEffect(() => {
    let cancelled = false;
    setGlbScene(null);
    // Pick URL: user-provided wins, else default packaged model (if enabled).
    const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
    const target = glbUrl || (useDefault ? base + '/models/benan.glb' : null);
    if (!target) return;
    loadGLB(target).then((scene) => {
      if (!cancelled) setGlbScene(scene);
    }).catch(() => {
      // Swallow — procedural rig stays visible.
    });
    return () => { cancelled = true; };
  }, [glbUrl, useDefault]);

  const t = useRef(0);
  useFrame((_, dt) => {
    t.current += dt;
    const usingGlb = !!glbScene;
    if (usingGlb && wrapperRef.current) {
      const bob = idle ? Math.sin(t.current * 2) * 0.015 : 0;
      wrapperRef.current.position.y = bob;
      return;
    }
    const { armL, armR, legL, legR, head, torso } = proceduralRefs;
    const breath = Math.sin(t.current * 2) * 0.02;
    torso.position.y = 1.2 + breath;
    head.position.y = 1.85 + breath;
    const speed = 9;
    const swing = walkAmount * 0.7;
    armL.rotation.x = Math.sin(t.current * speed) * swing - walkAmount * 0.2;
    armR.rotation.x = -Math.sin(t.current * speed) * swing - walkAmount * 0.2;
    legL.rotation.x = -Math.sin(t.current * speed) * swing * 0.9;
    legR.rotation.x = Math.sin(t.current * speed) * swing * 0.9;
    if (attackAnim > 0) {
      const a = Math.sin(attackAnim * Math.PI);
      armR.rotation.x = -a * 2.4;
      armR.rotation.z = -a * 0.3;
      torso.rotation.y = a * 0.25;
    } else {
      torso.rotation.y *= 0.85;
    }
    if (hitFlash > 0) {
      torso.traverse((o: any) => {
        if (o.isMesh && o.material && o.material.emissive) o.material.emissive.setRGB(hitFlash * 0.6, 0, 0);
      });
    } else {
      torso.traverse((o: any) => {
        if (o.isMesh && o.material && o.material.emissive) o.material.emissive.multiplyScalar(0.9);
      });
    }
  });

  return (
    <group ref={wrapperRef}>
      {glbScene ? <primitive object={glbScene} /> : <primitive object={proceduralRefs.group} />}
    </group>
  );
}
