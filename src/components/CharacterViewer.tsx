import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Group } from 'three';
import { useApp } from '../lib/store';
import { PlayerModel } from '../game/PlayerModel';
import { audio } from '../lib/audio';

function ViewerChar({ scale, posY, rot, autoRot }: { scale: number; posY: number; rot: number; autoRot: boolean }) {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    if (ref.current && autoRot) ref.current.rotation.y += dt * 0.4;
  });
  const glbUrl = useApp((s) => s.glbUrl);
  return (
    <group ref={ref} position={[0, posY, 0]} rotation={[0, rot, 0]} scale={scale}>
      <PlayerModel glbUrl={glbUrl ?? undefined} idle />
    </group>
  );
}

export function CharacterViewer() {
  const setScreen = useApp((s) => s.setScreen);
  const setGlbUrl = useApp((s) => s.setGlbUrl);
  const glbUrl = useApp((s) => s.glbUrl);
  const [scale, setScale] = useState(1);
  const [posY, setPosY] = useState(-1);
  const [rot, setRot] = useState(0);
  const [autoRot, setAutoRot] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => { setScale(1); setPosY(-1); setRot(0); };
  const onPickFile = () => fileRef.current?.click();
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (glbUrl) URL.revokeObjectURL(glbUrl);
    setGlbUrl(URL.createObjectURL(f));
    audio.pickup();
  };

  return (
    <div className="screen viewer-screen">
      <div className="viewer-canvas">
        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 1.5, 3.6], fov: 38 }}>
          <color attach="background" args={['#050010']} />
          <fog attach="fog" args={['#050010', 5, 18]} />
          <ambientLight intensity={0.4} color="#88aacc" />
          <directionalLight position={[4, 5, 3]} intensity={1.2} color="#ffd9aa" castShadow shadow-mapSize={[2048, 2048]} />
          <directionalLight position={[-3, 2, -2]} intensity={0.5} color="#6688ff" />
          <Suspense fallback={null}>
            <ViewerChar scale={scale} posY={posY} rot={rot} autoRot={autoRot} />
            <ContactShadows position={[0, posY, 0]} opacity={0.7} scale={6} blur={2.4} far={4} />
            <Environment preset="sunset" />
          </Suspense>
          <OrbitControls
            enablePan={false}
            minDistance={2.2}
            maxDistance={7}
            target={[0, posY + 1, 0]}
            onChange={() => setAutoRot(false)}
          />
        </Canvas>
      </div>
      <div className="viewer-overlay">
        <div className="viewer-top">
          <button className="m-btn m-btn-small" onClick={() => setScreen('menu')}>← GERİ</button>
          <div className="viewer-info">
            <h2>BENAN DENİZ</h2>
            <p>Smokin · İri Yapılı · Tengri Savaşçısı</p>
          </div>
          <div style={{ width: 70 }} />
        </div>
        <div className="viewer-controls">
          <label><span>Ölçek</span><input type="range" min={0.3} max={2.5} step={0.05} value={scale} onChange={(e) => setScale(+e.target.value)} /><b>{scale.toFixed(2)}</b></label>
          <label><span>Y Pozisyon</span><input type="range" min={-2} max={1} step={0.05} value={posY} onChange={(e) => setPosY(+e.target.value)} /><b>{posY.toFixed(2)}</b></label>
          <label><span>Dönüş</span><input type="range" min={-Math.PI} max={Math.PI} step={0.05} value={rot} onChange={(e) => setRot(+e.target.value)} /><b>{rot.toFixed(2)}</b></label>
          <div className="viewer-actions">
            <button className="m-btn m-btn-small" onClick={reset}>SIFIRLA</button>
            <button className="m-btn m-btn-small" onClick={() => setAutoRot((v) => !v)}>{autoRot ? '⏸ DUR' : '▶ DÖNDÜR'}</button>
            <button className="m-btn m-btn-small" onClick={onPickFile}>📁 GLB
              <input ref={fileRef} type="file" accept=".glb,.gltf" hidden onChange={onFileChange} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
