import { useEffect, useState } from 'react';
import { useGameUi, useApp, useInput } from '../lib/store';
import { WEAPONS } from '../lib/constants';
import { Joystick } from './Joystick';
import { ActionButtons } from './ActionButtons';
import { Minimap } from './Minimap';

export function HUD() {
  const ui = useGameUi();
  const setScreen = useApp((s) => s.setScreen);
  const pressPause = useInput((s) => s.pressPause);
  const w = WEAPONS[ui.weapon];
  const [flash, setFlash] = useState(false);
  const [toastVisible, setToastVisible] = useState<{ id: number; text: string; kind: string } | null>(null);

  // Damage flash
  useEffect(() => {
    if (!ui.damageFlash) return;
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 140);
    return () => clearTimeout(t);
  }, [ui.damageFlash]);

  // Toast
  useEffect(() => {
    if (!ui.toast) return;
    setToastVisible(ui.toast);
    const t = setTimeout(() => setToastVisible(null), 2500);
    return () => clearTimeout(t);
  }, [ui.toast]);

  const mins = Math.floor(ui.time / 60);
  const secs = Math.floor(ui.time % 60);
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="hud">
      <div className="hud-top">
        <div className="hud-tl">
          <div className="stat-row">
            <span className="stat-ico">❤️</span>
            <div className="bar-bg"><div className="bar hp" style={{ width: `${Math.max(0, (ui.hp / ui.hpMax) * 100)}%` }} /></div>
            <span className="stat-val">{Math.ceil(ui.hp)}</span>
          </div>
          <div className="stat-row">
            <span className="stat-ico">⚡</span>
            <div className="bar-bg"><div className="bar en" style={{ width: `${Math.max(0, (ui.energy / ui.energyMax) * 100)}%` }} /></div>
            <span className="stat-val">{Math.ceil(ui.energy)}</span>
          </div>
          <div className="stat-row">
            <span className="stat-ico">🛡️</span>
            <div className="bar-bg"><div className="bar tn" style={{ width: `${Math.max(0, (ui.tengri / ui.tengriMax) * 100)}%` }} /></div>
            <span className="stat-val">{Math.ceil(ui.tengri)}</span>
          </div>
        </div>
        <div className="hud-tc">
          <div className="hud-score">⭐ {ui.score}</div>
          <div className="hud-timer">⏱ {timeStr}</div>
          <div className="hud-wave">DALGA {ui.wave} · {ui.enemiesAlive} DÜŞMAN</div>
        </div>
        <div className="hud-tr">
          <div className="fps">{Math.round(ui.fps)} FPS</div>
          <button className="pause-btn" onClick={() => pressPause()}>⏸</button>
        </div>
      </div>

      <Minimap />

      <div className="killfeed">
        {ui.killfeed.map((k) => (
          <div className="killfeed-item" key={k.id}>{k.text}</div>
        ))}
      </div>

      {ui.combo >= 3 && (
        <div className={'combo-display' + (ui.combo >= 5 ? ' fire' : '')} key={ui.combo}>
          x{ui.combo} COMBO!
        </div>
      )}

      {toastVisible && (
        <div className={'toast ' + (toastVisible.kind || '')} key={toastVisible.id}>
          {toastVisible.text}
        </div>
      )}

      <div className="weapon-info">
        <span className="weapon-ico">{w.icon}</span>
        <span className="weapon-name">{w.name.toUpperCase()}</span>
        {w.type === 'ranged' && <span className="weapon-ammo">{ui.ammo}/{w.maxAmmo}</span>}
      </div>

      <div className={'defense-overlay' + (ui.defenseHeld ? ' active' : '')} />
      <div className={'damage-flash' + (flash ? ' active' : '')} />

      <div className="controls">
        <Joystick />
        <ActionButtons />
      </div>

      {ui.paused && (
        <div className="pause-overlay">
          <div className="pause-panel">
            <h2>DURAKLANDI</h2>
            <button className="m-btn m-btn-primary" onClick={() => pressPause()}>▶ DEVAM</button>
            <button className="m-btn m-btn-small" onClick={() => setScreen('menu')}>🏠 ANA MENÜ</button>
          </div>
        </div>
      )}
    </div>
  );
}
