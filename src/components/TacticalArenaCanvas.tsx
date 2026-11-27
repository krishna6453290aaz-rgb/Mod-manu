import { useEffect, useRef } from 'react';
import type { ModSettings } from '../types/modMenu';

interface TacticalArenaCanvasProps {
  settings: ModSettings;
  isUnlocked: boolean;
}

interface SimulatedEnemy {
  id: string;
  name: string;
  baseX: number;
  baseY: number;
  ampX: number;
  ampY: number;
  speedX: number;
  speedY: number;
  phase: number;
  hp: number;
  maxHp: number;
  distance: number;
}

const INITIAL_ENEMIES: SimulatedEnemy[] = [
  {
    id: 'e1',
    name: 'STRIKER_01',
    baseX: 0.32,
    baseY: 0.48,
    ampX: 0.16,
    ampY: 0.05,
    speedX: 0.95,
    speedY: 1.4,
    phase: 0.3,
    hp: 86,
    maxHp: 100,
    distance: 24,
  },
  {
    id: 'e2',
    name: 'VEX_SNIPER',
    baseX: 0.68,
    baseY: 0.42,
    ampX: 0.14,
    ampY: 0.04,
    speedX: 0.72,
    speedY: 1.1,
    phase: 2.1,
    hp: 62,
    maxHp: 100,
    distance: 41,
  },
  {
    id: 'e3',
    name: 'RECON_04',
    baseX: 0.5,
    baseY: 0.56,
    ampX: 0.22,
    ampY: 0.06,
    speedX: 1.25,
    speedY: 1.7,
    phase: 4.2,
    hp: 94,
    maxHp: 100,
    distance: 18,
  },
  {
    id: 'e4',
    name: 'HEAVY_UNIT',
    baseX: 0.22,
    baseY: 0.39,
    ampX: 0.11,
    ampY: 0.03,
    speedX: 0.55,
    speedY: 0.9,
    phase: 1.2,
    hp: 44,
    maxHp: 100,
    distance: 53,
  },
];

export function TacticalArenaCanvas({ settings, isUnlocked }: TacticalArenaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const settingsRef = useRef(settings);
  const unlockedRef = useRef(isUnlocked);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    unlockedRef.current = isUnlocked;
  }, [isUnlocked]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;
    let aimTrackX = window.innerWidth / 2;
    let aimTrackY = window.innerHeight / 2;
    const startTime = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const drawCornerBox = (
      x: number,
      y: number,
      w: number,
      h: number,
      color: string,
      cornerLen: number
    ) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Top-left
      ctx.moveTo(x, y + cornerLen);
      ctx.lineTo(x, y);
      ctx.lineTo(x + cornerLen, y);
      // Top-right
      ctx.moveTo(x + w - cornerLen, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + cornerLen);
      // Bottom-left
      ctx.moveTo(x, y + h - cornerLen);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x + cornerLen, y + h);
      // Bottom-right
      ctx.moveTo(x + w - cornerLen, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + w, y + h - cornerLen);
      ctx.stroke();
    };

    const drawOperativeSilhouette = (
      cx: number,
      cy: number,
      boxW: number,
      boxH: number,
      inFov: boolean
    ) => {
      const headR = boxW * 0.18;
      const headY = cy - boxH * 0.34;
      const shoulderY = headY + headR * 1.45;
      const hipY = cy + boxH * 0.12;
      const footY = cy + boxH * 0.45;

      ctx.save();
      ctx.fillStyle = inFov ? 'rgba(255, 30, 66, 0.28)' : 'rgba(148, 163, 184, 0.22)';
      ctx.strokeStyle = inFov ? 'rgba(255, 80, 110, 0.65)' : 'rgba(148, 163, 184, 0.42)';
      ctx.lineWidth = 1.4;

      // Head
      ctx.beginPath();
      ctx.arc(cx, headY, headR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Torso armor
      ctx.beginPath();
      ctx.moveTo(cx - boxW * 0.28, shoulderY);
      ctx.lineTo(cx + boxW * 0.28, shoulderY);
      ctx.lineTo(cx + boxW * 0.2, hipY);
      ctx.lineTo(cx - boxW * 0.2, hipY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Legs
      ctx.beginPath();
      ctx.moveTo(cx - boxW * 0.14, hipY);
      ctx.lineTo(cx - boxW * 0.2, footY);
      ctx.moveTo(cx + boxW * 0.14, hipY);
      ctx.lineTo(cx + boxW * 0.2, footY);
      ctx.stroke();
      ctx.restore();
    };

    const render = (now: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const t = (now - startTime) / 1000;
      const s = settingsRef.current;
      const unlocked = unlockedRef.current;
      const centerX = w / 2;
      const centerY = h / 2;

      // 1. Tactical Arena Backdrop
      const bgGrad = ctx.createRadialGradient(centerX, centerY * 0.72, 40, centerX, centerY, Math.max(w, h) * 0.85);
      bgGrad.addColorStop(0, '#101522');
      bgGrad.addColorStop(0.55, '#090b12');
      bgGrad.addColorStop(1, '#040508');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Perspective horizon grid
      const horizonY = h * 0.34;
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.065)';
      ctx.lineWidth = 1;

      // Horizontal depth lines
      for (let i = 0; i < 12; i++) {
        const ratio = Math.pow(i / 11, 1.8);
        const y = horizonY + ratio * (h - horizonY);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Perspective radiating vertical lines
      const cols = 14;
      for (let i = -cols; i <= cols; i++) {
        const bottomX = centerX + (i / cols) * w * 1.15;
        ctx.beginPath();
        ctx.moveTo(centerX + i * 16, horizonY);
        ctx.lineTo(bottomX, h);
        ctx.stroke();
      }

      // Horizon glow
      const hGlow = ctx.createLinearGradient(0, horizonY - 2, 0, horizonY + 18);
      hGlow.addColorStop(0, 'rgba(0, 240, 255, 0.16)');
      hGlow.addColorStop(1, 'rgba(0, 240, 255, 0)');
      ctx.fillStyle = hGlow;
      ctx.fillRect(0, horizonY, w, 18);
      ctx.restore();

      // 2. Compute & Draw Simulated Enemy Operatives
      let lockedTarget: { x: number; y: number; headY: number; name: string; dist: number } | null = null;
      let minDistToCenter = Infinity;

      for (const enemy of INITIAL_ENEMIES) {
        const ex = w * (enemy.baseX + Math.sin(t * enemy.speedX + enemy.phase) * enemy.ampX);
        const ey = h * (enemy.baseY + Math.cos(t * enemy.speedY + enemy.phase) * enemy.ampY);
        const depthScale = 0.72 + ((ey - horizonY) / (h - horizonY)) * 0.72;
        const boxW = Math.max(38, 46 * depthScale);
        const boxH = Math.max(76, 94 * depthScale);
        const boxX = ex - boxW / 2;
        const boxY = ey - boxH / 2;
        const headY = ey - boxH * 0.34;
        const dynamicDist = Math.max(8, Math.round(enemy.distance + Math.sin(t * enemy.speedY + enemy.phase) * 5));
        const dynamicHp = Math.max(
          15,
          Math.min(100, Math.round(enemy.hp + Math.sin(t * 1.2 + enemy.phase) * 8))
        );

        const distFromCrosshair = Math.hypot(ex - centerX, headY - centerY);
        const inFov = unlocked && s.showFovCircle && distFromCrosshair <= s.fovRadius;

        if (unlocked && s.aimbotEnabled && distFromCrosshair <= s.fovRadius && distFromCrosshair < minDistToCenter) {
          minDistToCenter = distFromCrosshair;
          lockedTarget = { x: ex, y: ey, headY, name: enemy.name, dist: dynamicDist };
        }

        // Draw character silhouette
        drawOperativeSilhouette(ex, ey, boxW, boxH, inFov);

        // Draw ESP Overlays when unlocked & toggled ON
        if (unlocked && s.espBox) {
          const boxColor = inFov ? '#ff1e42' : '#00f0ff';

          // Subtle box fill
          ctx.fillStyle = inFov ? 'rgba(255, 30, 66, 0.07)' : 'rgba(0, 240, 255, 0.04)';
          ctx.fillRect(boxX, boxY, boxW, boxH);

          drawCornerBox(boxX, boxY, boxW, boxH, boxColor, Math.min(12, boxW * 0.28));

          // Head hitbox marker
          ctx.beginPath();
          ctx.arc(ex, headY, 3.2, 0, Math.PI * 2);
          ctx.fillStyle = '#ff1e42';
          ctx.fill();

          // Player Name + Distance label
          ctx.font = '600 10px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          const tag = `${enemy.name} [${dynamicDist}m]`;
          const tagWidth = ctx.measureText(tag).width + 10;
          ctx.fillStyle = 'rgba(6, 8, 13, 0.78)';
          ctx.fillRect(ex - tagWidth / 2, boxY - 18, tagWidth, 14);
          ctx.fillStyle = inFov ? '#ff8fa3' : '#a5f3fc';
          ctx.fillText(tag, ex, boxY - 8);

          // Health Bar
          if (s.espHealthBar) {
            const hpBarX = boxX - 7;
            const hpRatio = dynamicHp / enemy.maxHp;
            const hpColor = hpRatio > 0.6 ? '#00e676' : hpRatio > 0.3 ? '#fbbf24' : '#ff1e42';

            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.fillRect(hpBarX, boxY, 4, boxH);

            ctx.fillStyle = hpColor;
            const filledH = boxH * hpRatio;
            ctx.fillRect(hpBarX, boxY + (boxH - filledH), 4, filledH);
          }

          // Snaplines from top center
          if (s.espSnaplines) {
            ctx.save();
            ctx.strokeStyle = inFov ? 'rgba(255, 30, 66, 0.55)' : 'rgba(0, 240, 255, 0.26)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(centerX, 0);
            ctx.lineTo(ex, boxY);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // 3. Aimbot FOV Circle & Smooth Tracking Vector
      if (unlocked && s.showFovCircle) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, s.fovRadius, 0, Math.PI * 2);
        ctx.strokeStyle = lockedTarget ? 'rgba(255, 30, 66, 0.85)' : 'rgba(0, 240, 255, 0.65)';
        ctx.lineWidth = 1.6;
        ctx.shadowColor = lockedTarget ? '#ff1e42' : '#00f0ff';
        ctx.shadowBlur = 12;
        ctx.stroke();

        // Subtle inner dashed tick ring
        ctx.shadowBlur = 0;
        ctx.setLineDash([3, 8]);
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.max(12, s.fovRadius - 6), 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);

        // FOV radius indicator text at bottom rim
        ctx.font = '500 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = lockedTarget ? '#ff6b81' : 'rgba(0, 240, 255, 0.85)';
        ctx.fillText(`FOV ${s.fovRadius}px`, centerX, centerY + s.fovRadius + 14);
        ctx.restore();
      }

      // Smooth Aimbot Lock Indicator
      if (unlocked && s.aimbotEnabled && lockedTarget) {
        const lerpFactor = Math.max(0.04, 1 / Math.max(1, s.aimSmoothness * 0.75));
        aimTrackX += (lockedTarget.x - aimTrackX) * lerpFactor;
        aimTrackY += (lockedTarget.headY - aimTrackY) * lerpFactor;

        ctx.save();
        ctx.strokeStyle = 'rgba(255, 30, 66, 0.85)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(aimTrackX, aimTrackY);
        ctx.stroke();

        // Lock diamond on smoothed aim point
        ctx.translate(aimTrackX, aimTrackY);
        ctx.rotate(Math.PI / 4);
        ctx.strokeStyle = '#ff1e42';
        ctx.fillStyle = 'rgba(255, 30, 66, 0.25)';
        ctx.fillRect(-5, -5, 10, 10);
        ctx.strokeRect(-5, -5, 10, 10);
        ctx.restore();
      } else {
        aimTrackX += (centerX - aimTrackX) * 0.15;
        aimTrackY += (centerY - aimTrackY) * 0.15;
      }

      // 4. Custom Pro Crosshair
      if (unlocked && s.customCrosshair) {
        ctx.save();
        ctx.strokeStyle = '#00f0ff';
        ctx.fillStyle = '#ff1e42';
        ctx.shadowColor = 'rgba(0, 240, 255, 0.85)';
        ctx.shadowBlur = 8;
        ctx.lineWidth = 2;

        if (s.crosshairStyle === 'tactical') {
          const gap = 5;
          const len = 10;
          ctx.beginPath();
          ctx.moveTo(centerX - gap - len, centerY);
          ctx.lineTo(centerX - gap, centerY);
          ctx.moveTo(centerX + gap, centerY);
          ctx.lineTo(centerX + gap + len, centerY);
          ctx.moveTo(centerX, centerY - gap - len);
          ctx.lineTo(centerX, centerY - gap);
          ctx.moveTo(centerX, centerY + gap);
          ctx.lineTo(centerX, centerY + gap + len);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (s.crosshairStyle === 'dot') {
          ctx.beginPath();
          ctx.arc(centerX, centerY, 9, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(centerX, centerY, 2.6, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Chevron
          ctx.beginPath();
          ctx.moveTo(centerX - 10, centerY + 7);
          ctx.lineTo(centerX, centerY - 4);
          ctx.lineTo(centerX + 10, centerY + 7);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(centerX, centerY - 4, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animationFrameId = window.requestAnimationFrame(render);
    };

    animationFrameId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none block"
      aria-label="Simulated tactical arena HUD preview"
    />
  );
}
