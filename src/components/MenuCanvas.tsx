import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import { Group } from 'three';
import { PlayerModel } from '../game/PlayerModel';
import { useApp } from '../lib/store';

function RotatingChar() {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.35;
  });
  const glbUrl = useApp((s) => s.glbUrl);
  return (
    <group ref={ref} position={[0, -1.05, 0]}>
      <PlayerModel glbUrl={glbUrl ?? undefined} idle />
    </group>
  );
}

export function MenuCanvas() {
  return (
    <div className="menu-canvas-bg">
      <Canvas
        shadows
        dpr={[1, 1.8]}
        camera={{ position: [0, 1.4, 4.2], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#0a0015']} />
        <fog attach="fog" args={['#0a0015', 5, 15]} />
        <ambientLight intensity={0.5} color="#88aacc" />
        <directionalLight position={[3, 4, 2]} intensity={1.3} color="#ffd9aa" castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-2, 2, -1]} intensity={0.5} color="#6688ff" />
        <Suspense fallback={null}>
          <RotatingChar />
          <ContactShadows position={[0, -1.05, 0]} opacity={0.7} scale={6} blur={2.4} far={4} />
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>
    </div>
  );
}
