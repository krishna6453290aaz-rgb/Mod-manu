import { useEffect, useState } from 'react';
import { Activity, Cpu, ShieldCheck, Wifi } from 'lucide-react';
import type { InjectionState } from '../types/modMenu';

interface TopTelemetryHudProps {
  fpsBoost120: boolean;
  antiLagDns: boolean;
  injectionState: InjectionState;
}

export function TopTelemetryHud({
  fpsBoost120,
  antiLagDns,
  injectionState,
}: TopTelemetryHudProps) {
  const [fps, setFps] = useState(fpsBoost120 ? 119 : 59);
  const [ping, setPing] = useState(antiLagDns ? 11 : 42);
  const [frameMs, setFrameMs] = useState(fpsBoost120 ? '8.4' : '16.8');

  useEffect(() => {
    if (!fpsBoost120) return;

    const interval = window.setInterval(() => {
      const nextFps = 117 + Math.floor(Math.random() * 4);
      const basePing = antiLagDns ? 9 : 36;
      const jitter = antiLagDns ? Math.floor(Math.random() * 5) : Math.floor(Math.random() * 14);
      const nextPing = basePing + jitter;
      const nextFrame = (1000 / nextFps).toFixed(1);

      setFps(nextFps);
      setPing(nextPing);
      setFrameMs(nextFrame);
    }, 650);

    return () => window.clearInterval(interval);
  }, [fpsBoost120, antiLagDns]);

  if (!fpsBoost120) {
    return null;
  }

  return (
    <div
      className="fixed top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none max-w-[calc(100vw-24px)]"
      aria-live="polite"
    >
      <div className="cyber-glass border border-cyan-400/30 rounded-xl px-4 py-2 shadow-[0_0_24px_rgba(0,240,255,0.16)] flex items-center gap-3 sm:gap-5 text-xs font-mono-tech whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-slate-400">FPS</span>
          <span className="text-cyan-300 font-bold text-sm">{fps}</span>
        </div>

        <span className="text-white/15" aria-hidden="true">|</span>

        <div className="flex items-center gap-1.5">
          <Wifi className={`w-3.5 h-3.5 shrink-0 ${antiLagDns ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span className="text-slate-400">PING</span>
          <span className={`font-bold text-sm ${antiLagDns ? 'text-emerald-400' : 'text-amber-300'}`}>
            {ping}ms
          </span>
        </div>

        <span className="hidden sm:inline text-white/15" aria-hidden="true">|</span>

        <div className="hidden sm:flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span className="text-slate-400">FRAME</span>
          <span className="text-slate-200 font-semibold">{frameMs}ms</span>
        </div>

        <span className="hidden md:inline text-white/15" aria-hidden="true">|</span>

        <div className="hidden md:flex items-center gap-1.5">
          <ShieldCheck
            className={`w-3.5 h-3.5 shrink-0 ${
              injectionState === 'success' ? 'text-emerald-400' : 'text-rose-400'
            }`}
          />
          <span className={injectionState === 'success' ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
            {injectionState === 'success' ? 'BYPASS ACTIVE' : 'ARM64-V8A'}
          </span>
        </div>
      </div>
    </div>
  );
}
