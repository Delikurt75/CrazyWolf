import { useEffect, useRef } from 'react';
import { useInput, useApp } from '../lib/store';

// Floating joystick: base spawns at touch point for natural thumb feel.
export function Joystick() {
  const zoneRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const setMove = useInput((s) => s.setMove);
  const jsSize = useApp((s) => s.settings.joystickSize);

  useEffect(() => {
    const zone = zoneRef.current!;
    const base = baseRef.current!;
    const knob = knobRef.current!;
    let pointerId: number | null = null;
    let centerX = 0, centerY = 0;
    const maxR = Math.round(jsSize * 0.42);
    const half = jsSize / 2;

    const resetBase = () => {
      base.style.left = '';
      base.style.top = '';
      knob.style.left = '50%';
      knob.style.top = '50%';
      knob.style.transform = 'translate(-50%, -50%)';
      base.classList.remove('active');
    };

    const reset = () => {
      pointerId = null;
      resetBase();
      setMove(0, 0);
    };

    const onDown = (e: PointerEvent) => {
      if (pointerId !== null) return;
      e.preventDefault();
      pointerId = e.pointerId;
      const zoneRect = zone.getBoundingClientRect();
      centerX = e.clientX;
      centerY = e.clientY;
      // Clamp base position so it stays fully inside zone
      const bx = Math.min(Math.max(e.clientX - zoneRect.left, half), zoneRect.width - half);
      const by = Math.min(Math.max(e.clientY - zoneRect.top, half), zoneRect.height - half);
      base.style.left = `${bx - half}px`;
      base.style.top = `${by - half}px`;
      base.classList.add('active');
      try { zone.setPointerCapture(e.pointerId); } catch {}
      moveKnob(e.clientX, e.clientY);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      e.preventDefault();
      moveKnob(e.clientX, e.clientY);
    };

    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      try { zone.releasePointerCapture(e.pointerId); } catch {}
      reset();
    };

    const moveKnob = (x: number, y: number) => {
      let dx = x - centerX;
      let dy = y - centerY;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > maxR) {
        dx = (dx / d) * maxR;
        dy = (dy / d) * maxR;
      }
      knob.style.left = `${half + dx}px`;
      knob.style.top = `${half + dy}px`;
      knob.style.transform = 'translate(-50%, -50%)';
      const nx = dx / maxR;
      const ny = dy / maxR;
      const m = Math.sqrt(nx * nx + ny * ny);
      if (m < 0.07) setMove(0, 0); else setMove(nx, ny);
    };

    zone.addEventListener('pointerdown', onDown);
    zone.addEventListener('pointermove', onMove);
    zone.addEventListener('pointerup', onUp);
    zone.addEventListener('pointercancel', onUp);

    return () => {
      zone.removeEventListener('pointerdown', onDown);
      zone.removeEventListener('pointermove', onMove);
      zone.removeEventListener('pointerup', onUp);
      zone.removeEventListener('pointercancel', onUp);
    };
  }, [jsSize, setMove]);

  return (
    <div className="joystick-zone" ref={zoneRef}>
      <div
        className="joystick-base"
        ref={baseRef}
        style={{ width: jsSize, height: jsSize } as React.CSSProperties}
      >
        <div className="joystick-knob" ref={knobRef} />
      </div>
    </div>
  );
}
