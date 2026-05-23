import { useEffect, useState } from 'react';
import { useApp } from '../lib/store';

export function Loading() {
  const [pct, setPct] = useState(0);
  const setScreen = useApp((s) => s.setScreen);

  useEffect(() => {
    let p = 0;
    const t = setInterval(() => {
      p += 5 + Math.random() * 12;
      if (p >= 100) {
        p = 100;
        clearInterval(t);
        setTimeout(() => setScreen('menu'), 200);
      }
      setPct(p);
    }, 80);
    return () => clearInterval(t);
  }, [setScreen]);

  return (
    <div className="screen loading-screen">
      <div className="loading-logo">GÖK BÖRÜ</div>
      <div className="loading-sub">BENAN DENİZ</div>
      <div className="loading-spin" />
      <div className="loading-progress"><div style={{ width: `${pct}%` }} /></div>
    </div>
  );
}
