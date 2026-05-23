import { useApp } from '../lib/store';
import { toggleFullscreen } from '../lib/fullscreen';
import { audio } from '../lib/audio';

export function Settings() {
  const { settings, updateSettings, setScreen } = useApp((s) => ({
    settings: s.settings, updateSettings: s.updateSettings, setScreen: s.setScreen,
  }));

  return (
    <div className="screen settings-screen">
      <div className="settings-panel">
        <h2>AYARLAR</h2>

        <div className="setting-row">
          <label>Grafik Kalitesi</label>
          <div className="seg-group">
            {(['low', 'medium', 'high'] as const).map((q) => (
              <button
                key={q}
                className={settings.quality === q ? 'active' : ''}
                onClick={() => updateSettings({ quality: q })}
              >
                {q === 'low' ? 'Düşük' : q === 'medium' ? 'Orta' : 'Yüksek'}
              </button>
            ))}
          </div>
        </div>

        <div className="setting-row">
          <label>Otomatik Optimize</label>
          <label className="switch">
            <input type="checkbox" checked={settings.autoPerf} onChange={(e) => updateSettings({ autoPerf: e.target.checked })} />
            <span />
          </label>
        </div>

        <div className="setting-row">
          <label>Joystick Boyutu</label>
          <input type="range" min={120} max={220} step={10} value={settings.joystickSize}
            onChange={(e) => updateSettings({ joystickSize: +e.target.value })} />
        </div>

        <div className="setting-row">
          <label>Buton Boyutu</label>
          <input type="range" min={70} max={130} step={5} value={settings.buttonSize}
            onChange={(e) => updateSettings({ buttonSize: +e.target.value })} />
        </div>

        <div className="setting-row">
          <label>Kamera Uzaklığı</label>
          <input type="range" min={7} max={18} step={0.5} value={settings.camDistance}
            onChange={(e) => updateSettings({ camDistance: +e.target.value })} />
        </div>

        <div className="setting-row">
          <label>Ses Efektleri</label>
          <label className="switch">
            <input type="checkbox" checked={settings.sfx} onChange={(e) => { updateSettings({ sfx: e.target.checked }); audio.setEnabled(e.target.checked); }} />
            <span />
          </label>
        </div>

        <div className="setting-row">
          <label>Müzik</label>
          <label className="switch">
            <input type="checkbox" checked={settings.music} onChange={(e) => { updateSettings({ music: e.target.checked }); if (!e.target.checked) audio.stopMusic(); }} />
            <span />
          </label>
        </div>

        <div className="settings-actions">
          <button className="m-btn m-btn-small" onClick={toggleFullscreen}>⛶ TAM EKRAN</button>
          <button className="m-btn m-btn-small m-btn-primary" onClick={() => setScreen('menu')}>← GERİ</button>
        </div>
      </div>
    </div>
  );
}
