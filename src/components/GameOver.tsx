import { useApp } from '../lib/store';

export function GameOver({ victory }: { victory: boolean }) {
  const setScreen = useApp((s) => s.setScreen);
  const result = useApp((s) => s.lastResult);

  const mins = Math.floor((result?.time ?? 0) / 60);
  const secs = Math.floor((result?.time ?? 0) % 60);
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="screen gameover-screen">
      <div className={'go-panel' + (victory ? ' victory' : '')}>
        <div className="go-title">{victory ? 'ZAFER!' : 'OYUN BİTTİ'}</div>
        <div className="go-sub">{result?.reason ?? (victory ? 'Tengri seni kutladı!' : 'Düştün, savaşçı...')}</div>
        <div className="go-stats">
          <div className="go-stat"><span>⭐ Skor</span><b>{result?.score ?? 0}</b></div>
          <div className="go-stat"><span>⏱ Süre</span><b>{timeStr}</b></div>
          <div className="go-stat"><span>💀 Öldürülen</span><b>{result?.kills ?? 0}</b></div>
          <div className="go-stat"><span>🌊 Dalga</span><b>{result?.wave ?? 1}</b></div>
          <div className="go-stat"><span>🔥 En İyi Combo</span><b>{result?.bestCombo ?? 0}</b></div>
        </div>
        <div className="go-actions">
          <button className="m-btn m-btn-primary" onClick={() => setScreen('class')}>🔄 TEKRAR OYNA</button>
          <button className="m-btn m-btn-small" onClick={() => setScreen('menu')}>🏠 ANA MENÜ</button>
        </div>
      </div>
    </div>
  );
}
