import { useState } from 'react';
import { CLASSES } from '../lib/constants';
import { useApp } from '../lib/store';
import { audio } from '../lib/audio';

export function ClassSelect() {
  const setScreen = useApp((s) => s.setScreen);
  const setClass = useApp((s) => s.setClass);
  const [picked, setPicked] = useState<string>('savasci');

  const start = () => {
    setClass(picked);
    audio.wave();
    setScreen('game');
  };

  return (
    <div className="screen class-screen">
      <div className="class-title">SINIFINI SEÇ</div>
      <div className="class-cards">
        {Object.values(CLASSES).map((c) => {
          const active = picked === c.id;
          return (
            <div
              key={c.id}
              className={'class-card' + (active ? ' active' : '')}
              style={
                {
                  ['--cls-color' as any]: c.color,
                  ['--cls-shadow' as any]: c.color + '55',
                } as React.CSSProperties
              }
              onClick={() => { setPicked(c.id); audio.attack(); }}
            >
              <div className="class-icon" style={{ color: c.color }}>{c.icon}</div>
              <div className="class-name" style={{ color: c.color }}>{c.name}</div>
              <div className="class-desc">{c.desc}</div>
              <div className="class-stats-mini">
                <div>❤️ Can: <b>{c.hp}</b></div>
                <div>⚡ Enerji: <b>{c.energy}</b></div>
                <div>🏃 Hız: <b>{c.speed.toFixed(1)}</b></div>
                <div>👊 Yakın: <b>x{c.meleeMult.toFixed(2)}</b></div>
                <div>🔫 Uzak: <b>x{c.rangedMult.toFixed(2)}</b></div>
              </div>
              <div className="class-bonus">{c.bonus}</div>
            </div>
          );
        })}
      </div>
      <div className="class-actions">
        <button className="m-btn m-btn-small" onClick={() => setScreen('menu')}>← GERİ</button>
        <button className="m-btn m-btn-primary" onClick={start}>SAVAŞA BAŞLA ⚔️</button>
      </div>
    </div>
  );
}
