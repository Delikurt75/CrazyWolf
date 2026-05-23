import { useRef } from 'react';
import { useApp } from '../lib/store';
import { MenuCanvas } from './MenuCanvas';
import { toggleFullscreen } from '../lib/fullscreen';
import { audio } from '../lib/audio';

export function MainMenu() {
  const setScreen = useApp((s) => s.setScreen);
  const setGlbUrl = useApp((s) => s.setGlbUrl);
  const glbUrl = useApp((s) => s.glbUrl);
  const fileRef = useRef<HTMLInputElement>(null);

  const onPickFile = () => fileRef.current?.click();
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (glbUrl) URL.revokeObjectURL(glbUrl);
    const url = URL.createObjectURL(file);
    setGlbUrl(url);
    audio.pickup();
  };

  const go = (s: any) => { audio.resume(); audio.attack(); setScreen(s); };

  return (
    <div className="screen menu-screen">
      <MenuCanvas />
      <div className="menu-grad-overlay" />
      <div className="menu-grid">
        <div className="menu-left">
          <div>
            <div className="brand-sub">BENAN DENİZ</div>
            <div className="brand-main">GÖK BÖRÜ <span>SAVAŞI</span></div>
            <div className="brand-tag">Tengri kutsal savaşçısı · Kam davulu · Bozkır rüzgârı</div>
          </div>
          <div className="menu-buttons">
            <button className="m-btn m-btn-primary" onClick={() => go('class')}>
              <span className="m-ico">⚔️</span><span>OYUNA BAŞLA</span>
            </button>
            <button className="m-btn" onClick={() => go('viewer')}>
              <span className="m-ico">🧍</span><span>KARAKTERİ İNCELE</span>
            </button>
            <button className="m-btn" onClick={onPickFile}>
              <span className="m-ico">📁</span><span>KARAKTER YÜKLE (GLB)</span>
              <input ref={fileRef} type="file" accept=".glb,.gltf" hidden onChange={onFileChange} />
            </button>
            <button className="m-btn m-btn-small" onClick={toggleFullscreen}>
              <span className="m-ico">⛶</span><span>TAM EKRAN</span>
            </button>
            <button className="m-btn m-btn-small" onClick={() => setScreen('settings')}>
              <span className="m-ico">⚙️</span><span>AYARLAR</span>
            </button>
          </div>
        </div>
        <div className="menu-right">
          <div className="char-frame">
            <div className="char-frame-label">KARAKTER</div>
            <div className="char-frame-name">BENAN DENİZ</div>
            <div className="char-stat"><span>İri Yapılı</span><b>★★★★★</b></div>
            <div className="char-stat"><span>Tengri Gücü</span><b>★★★★☆</b></div>
            <div className="char-stat"><span>Savaş Hüneri</span><b>★★★★★</b></div>
            <div className="char-stat"><span>Kut</span><b>★★★★☆</b></div>
          </div>
        </div>
      </div>
    </div>
  );
}
