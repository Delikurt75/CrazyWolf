import { useEffect, useRef } from 'react';
import { ARENA_RADIUS } from '../lib/constants';

// Shared mutable state filled by Game.tsx each frame.
export const minimapState = {
  player: { x: 0, z: 0, angle: 0 },
  enemies: [] as { x: number; z: number; boss?: boolean }[],
};

export function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    let raf = 0;
    const draw = () => {
      const ctx = cv.getContext('2d');
      if (!ctx) { raf = requestAnimationFrame(draw); return; }
      const w = cv.width, h = cv.height;
      ctx.clearRect(0, 0, w, h);
      // background
      ctx.fillStyle = 'rgba(20,12,30,0.6)';
      ctx.fillRect(0, 0, w, h);
      // arena circle
      const cx = w / 2, cy = h / 2;
      const r = Math.min(w, h) / 2 - 6;
      const scale = r / ARENA_RADIUS;
      ctx.strokeStyle = 'rgba(136,196,255,0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      // grid
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy);
      ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r);
      ctx.stroke();

      // enemies
      for (const e of minimapState.enemies) {
        const ex = cx + e.x * scale;
        const ey = cy + e.z * scale;
        if (e.boss) {
          ctx.fillStyle = '#ff66ff';
          ctx.beginPath(); ctx.arc(ex, ey, 4, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.fillStyle = '#ff5252';
          ctx.beginPath(); ctx.arc(ex, ey, 2.5, 0, Math.PI * 2); ctx.fill();
        }
      }
      // player
      const p = minimapState.player;
      const px = cx + p.x * scale;
      const py = cy + p.z * scale;
      ctx.fillStyle = '#88c4ff';
      ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
      // facing direction
      ctx.strokeStyle = '#88c4ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + Math.sin(p.angle) * 9, py + Math.cos(p.angle) * 9);
      ctx.stroke();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas className="minimap" ref={canvasRef} width={130} height={100} />;
}
