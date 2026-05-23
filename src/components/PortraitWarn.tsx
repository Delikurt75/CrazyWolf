import { usePortrait } from '../lib/usePortrait';

export function PortraitWarn() {
  const portrait = usePortrait();
  if (!portrait) return null;
  return (
    <div className="rotate-warn" style={{ display: 'flex' }}>
      <div className="ico">📱↻</div>
      <h2>LÜTFEN TELEFONU YATAY ÇEVİR</h2>
      <p>Bu oyun yatay ekran için tasarlanmıştır</p>
    </div>
  );
}
