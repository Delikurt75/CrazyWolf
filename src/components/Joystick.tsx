import { useEffect, useRef } from 'react';
import { useInput, useApp } from '../lib/store';

// Multi-touch joystick: tracks its own pointer id, doesn't steal taps from buttons.
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
    const maxR = jsSize * 0.32;

    const reset = () => {
      pointerId = null;
      knob.style.left = '50%';
      knob.style.top = '50%';
      knob.style.transform = 'translate(-50%, -50%)';
      base.classList.remove('active');
      setMove(0, 0);
    };

    const onDown = (e: PointerEvent) => {
      if (pointerId !== null) return;
      e.preventDefault();
      pointerId = e.pointerId;
      const rect = base.getBoundingClientRect();
      centerX = rect.left + rect.width / 2;
      centerY = rect.top + rect.height / 2;
      base.classList.add('active');
      try { zone.setPointerCapture(e.pointerId); } catch {}
      move(e.clientX, e.clientY);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      e.preventDefault();
      move(e.clientX, e.clientY);
    };

    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      try { zone.releasePointerCapture(e.pointerId); } catch {}
      reset();
    };

    const move = (x: number, y: number) => {
      let dx = x - centerX;
      let dy = y - centerY;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > maxR) {
        dx = (dx / d) * maxR;
        dy = (dy / d) * maxR;
      }
      const baseRect = base.getBoundingClientRect();
      const localX = baseRect.width / 2 + dx;
      const localY = baseRect.height / 2 + dy;
      knob.style.left = `${(localX / baseRect.width) * 100}%`;
      knob.style.top = `${(localY / baseRect.height) * 100}%`;
      knob.style.transform = 'translate(-50%, -50%)';
      const nx = dx / maxR;
      const ny = dy / maxR;
      // Dead zone
      const m = Math.sqrt(nx * nx + ny * ny);
      if (m < 0.15) setMove(0, 0); else setMove(nx, ny);
    };

    zone.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      zone.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [jsSize, setMove]);

  return (
    <div
      className="joystick-zone"
      ref={zoneRef}
      style={{ ['--js-size' as any]: `${jsSize}px` } as React.CSSProperties}
    >
      <div className="joystick-base" ref={baseRef}>
        <div className="joystick-knob" ref={knobRef} />
      </div>
    </div>
  );
}
