import { useEffect, useRef } from 'react';
import { useApp, useGameUi, useInput } from '../lib/store';

export function ActionButtons() {
  const btnSize = useApp((s) => s.settings.buttonSize);
  const cd = useGameUi((s) => s.cooldowns);
  const tengri = useGameUi((s) => s.tengri);
  const ammo = useGameUi((s) => s.ammo);
  const weapon = useGameUi((s) => s.weapon);
  const pressAttack = useInput((s) => s.pressAttack);
  const pressSpecial = useInput((s) => s.pressSpecial);
  const setDefense = useInput((s) => s.setDefense);
  const defenseRef = useRef<HTMLButtonElement>(null);

  // Pointer handlers for hold-to-defend
  useEffect(() => {
    const btn = defenseRef.current;
    if (!btn) return;
    let id: number | null = null;
    const down = (e: PointerEvent) => {
      e.preventDefault();
      if (id !== null) return;
      id = e.pointerId;
      try { btn.setPointerCapture(e.pointerId); } catch {}
      setDefense(true);
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      try { btn.releasePointerCapture(e.pointerId); } catch {}
      id = null;
      setDefense(false);
    };
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('pointerleave', up);
    return () => {
      btn.removeEventListener('pointerdown', down);
      btn.removeEventListener('pointerup', up);
      btn.removeEventListener('pointercancel', up);
      btn.removeEventListener('pointerleave', up);
    };
  }, [setDefense]);

  const attackDisabled = cd.attack > 0 || (weapon === 'pistol' && ammo === 0);
  const specialDisabled = cd.special > 0 || tengri < 35;

  return (
    <div className="action-buttons" style={{ ['--btn-size' as any]: `${btnSize}px` } as React.CSSProperties}>
      <button
        className={'act-btn act-special' + (specialDisabled ? ' disabled' : '')}
        onPointerDown={(e) => { e.preventDefault(); if (!specialDisabled) pressSpecial(); }}
      >
        <span className="act-ico">🌀</span>
        <span className="act-lbl">TENGRİ</span>
        <div className={'act-cd' + (cd.special > 0 ? ' show' : '')}>{cd.special > 0 ? cd.special.toFixed(1) : ''}</div>
      </button>
      <button
        className="act-btn act-defense"
        ref={defenseRef}
      >
        <span className="act-ico">🛡️</span>
        <span className="act-lbl">SAVUN</span>
      </button>
      <button
        className={'act-btn act-attack' + (attackDisabled ? ' disabled' : '')}
        onPointerDown={(e) => { e.preventDefault(); if (!attackDisabled) pressAttack(); }}
      >
        <span className="act-ico">⚔️</span>
        <span className="act-lbl">SALDIR</span>
        <div className={'act-cd' + (cd.attack > 0 ? ' show' : '')}>{cd.attack > 0 ? cd.attack.toFixed(1) : ''}</div>
      </button>
    </div>
  );
}

