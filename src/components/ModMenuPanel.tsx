import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import {
  Check,
  Copy,
  Crosshair,
  Download,
  ExternalLink,
  Eye,
  Gauge,
  GripHorizontal,
  Minus,
  Target,
} from 'lucide-react';
import type {
  CrosshairStyle,
  InjectionState,
  MenuTab,
  ModSettings,
  TerminalLog,
} from '../types/modMenu';
import { PythonTerminal } from './PythonTerminal';
import {
  STANDALONE_DOWNLOAD_PATH,
  STANDALONE_FILENAME,
  downloadStandaloneHtml,
  generateStandaloneHtml,
} from '../utils/standaloneHtml';

interface ModMenuPanelProps {
  isOpen: boolean;
  activatedKey: string;
  settings: ModSettings;
  onUpdateSettings: (patch: Partial<ModSettings>) => void;
  onCollapse: () => void;
  logs: TerminalLog[];
  injectionState: InjectionState;
  onInject: () => void;
  onClearLogs: () => void;
}

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  accent?: 'crimson' | 'cyan';
  onToggle: () => void;
}

function ToggleRow({
  label,
  description,
  checked,
  accent = 'crimson',
  onToggle,
}: ToggleRowProps) {
  const activeTrack =
    accent === 'cyan'
      ? 'bg-cyan-400 shadow-[0_0_14px_rgba(0,240,255,0.65)]'
      : 'bg-[#ff1e42] shadow-[0_0_14px_rgba(255,30,66,0.65)]';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      className="w-full min-h-[52px] px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] flex items-center justify-between gap-3 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
    >
      <div className="min-w-0">
        <div className="text-sm font-medium text-slate-100 leading-snug">{label}</div>
        <div className="text-xs text-slate-400 mt-0.5 leading-snug">{description}</div>
      </div>

      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-150 ${
          checked ? activeTrack : 'bg-white/15'
        }`}
      >
        <span
          className={`inline-block h-4.5 w-4.5 rounded-full transition-transform duration-150 ${
            checked ? 'translate-x-5.5 bg-[#06070a]' : 'translate-x-1 bg-slate-200'
          }`}
        />
      </span>
    </button>
  );
}

export function ModMenuPanel({
  isOpen,
  activatedKey,
  settings,
  onUpdateSettings,
  onCollapse,
  logs,
  injectionState,
  onInject,
  onClearLogs,
}: ModMenuPanelProps) {
  const [activeTab, setActiveTab] = useState<MenuTab>('esp');
  const [copiedHtml, setCopiedHtml] = useState(false);

  const [position, setPosition] = useState(() => {
    const panelW = typeof window !== 'undefined' ? Math.min(430, window.innerWidth - 20) : 400;
    const x = typeof window !== 'undefined' ? Math.max(10, Math.round((window.innerWidth - panelW) / 2)) : 20;
    const y = typeof window !== 'undefined' ? Math.max(58, Math.round((window.innerHeight - 580) / 2)) : 70;
    return { x, y };
  });

  const panelRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    active: boolean;
    pointerId: number | null;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  }>({
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    originX: position.x,
    originY: position.y,
  });

  useEffect(() => {
    const clamp = () => {
      const el = panelRef.current;
      const w = el ? el.offsetWidth : 400;
      const h = el ? el.offsetHeight : 520;
      setPosition((prev) => ({
        x: Math.min(Math.max(8, prev.x), Math.max(8, window.innerWidth - w - 8)),
        y: Math.min(Math.max(8, prev.y), Math.max(8, window.innerHeight - h - 8)),
      }));
    };
    window.addEventListener('resize', clamp);
    return () => window.removeEventListener('resize', clamp);
  }, []);

  const handleHeaderPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: position.x,
      originY: position.y,
    };
  };

  const handleHeaderPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || dragRef.current.pointerId !== e.pointerId) return;
    const el = panelRef.current;
    const w = el ? el.offsetWidth : 400;
    const h = el ? el.offsetHeight : 520;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPosition({
      x: Math.min(Math.max(8, dragRef.current.originX + dx), Math.max(8, window.innerWidth - w - 8)),
      y: Math.min(Math.max(8, dragRef.current.originY + dy), Math.max(8, window.innerHeight - h - 8)),
    });
  };

  const handleHeaderPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || dragRef.current.pointerId !== e.pointerId) return;
    dragRef.current.active = false;
    dragRef.current.pointerId = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleDownloadSingleFile = () => {
    downloadStandaloneHtml();
  };

  const handleCopySingleFile = async () => {
    try {
      await navigator.clipboard.writeText(generateStandaloneHtml());
      setCopiedHtml(true);
      window.setTimeout(() => setCopiedHtml(false), 1800);
    } catch {
      handleDownloadSingleFile();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
      className="fixed top-0 left-0 z-40 w-[min(430px,calc(100vw-20px))] max-h-[84dvh] cyber-glass cyber-border-glow rounded-2xl flex flex-col overflow-hidden"
    >
      {/* Draggable ImGui-style Title Bar */}
      <div
        onPointerDown={handleHeaderPointerDown}
        onPointerMove={handleHeaderPointerMove}
        onPointerUp={handleHeaderPointerUp}
        onPointerCancel={handleHeaderPointerUp}
        style={{ touchAction: 'none' }}
        className="px-4 py-3 border-b border-white/10 bg-white/[0.025] flex items-center justify-between gap-2 cursor-move select-none shrink-0"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <GripHorizontal className="w-4 h-4 text-slate-500 shrink-0" />
          <div className="min-w-0">
            <h2 className="font-display text-base font-bold tracking-wide text-white truncate">
              VX-CORE OVERLAY
            </h2>
            <p className="text-[11px] font-mono-tech text-cyan-400 truncate">
              KEY: {activatedKey}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleCopySingleFile}
            title="Copy 100% single-file HTML code"
            className="min-h-[36px] px-2.5 rounded-lg bg-white/[0.04] hover:bg-cyan-500/15 border border-white/10 text-xs font-medium text-cyan-300 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
          >
            {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedHtml ? 'Copied' : 'Copy'}</span>
          </button>

          <a
            href={STANDALONE_DOWNLOAD_PATH}
            download={STANDALONE_FILENAME}
            title="Download single-file HTML app"
            className="min-h-[36px] px-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/35 text-xs font-semibold text-rose-300 flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>.HTML</span>
          </a>

          <button
            type="button"
            onClick={onCollapse}
            title="Collapse to floating bubble"
            aria-label="Collapse to floating bubble"
            className="min-w-[36px] min-h-[36px] rounded-lg bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-3 gap-1.5 px-3 py-2.5 border-b border-white/10 shrink-0 bg-black/20">
        <button
          type="button"
          onClick={() => setActiveTab('esp')}
          className={`min-h-[42px] px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'esp'
              ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-400/50 shadow-[0_0_16px_rgba(0,240,255,0.18)]'
              : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Eye className="w-3.5 h-3.5 shrink-0" />
          <span>ESP &amp; Reticle</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('aimbot')}
          className={`min-h-[42px] px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'aimbot'
              ? 'bg-rose-500/15 text-rose-200 border border-[#ff1e42]/60 shadow-[0_0_16px_rgba(255,30,66,0.2)]'
              : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Target className="w-3.5 h-3.5 shrink-0" />
          <span>Aimbot &amp; FOV</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('boost')}
          className={`min-h-[42px] px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'boost'
              ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-400/50 shadow-[0_0_16px_rgba(0,240,255,0.18)]'
              : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Gauge className="w-3.5 h-3.5 shrink-0" />
          <span>120 FPS Boost</span>
        </button>
      </div>

      {/* Scrollable Controls + Docked Terminal */}
      <div className="p-3.5 overflow-y-auto cyber-scroll flex-1">
        {activeTab === 'esp' && (
          <div className="space-y-2.5">
            <ToggleRow
              label="ESP Box & Player Info"
              description="Live moving enemy hitbox, player tag & distance"
              checked={settings.espBox}
              accent="crimson"
              onToggle={() => onUpdateSettings({ espBox: !settings.espBox })}
            />
            <ToggleRow
              label="ESP Health Bar"
              description="Dynamic vertical HP meter next to target bounding box"
              checked={settings.espHealthBar}
              accent="cyan"
              onToggle={() => onUpdateSettings({ espHealthBar: !settings.espHealthBar })}
            />
            <ToggleRow
              label="ESP Snaplines"
              description="Top-center tactical guide lines to active enemies"
              checked={settings.espSnaplines}
              accent="cyan"
              onToggle={() => onUpdateSettings({ espSnaplines: !settings.espSnaplines })}
            />
            <ToggleRow
              label="Custom Pro Crosshair"
              description="Sharp center-screen reticle overlay"
              checked={settings.customCrosshair}
              accent="cyan"
              onToggle={() => onUpdateSettings({ customCrosshair: !settings.customCrosshair })}
            />

            {settings.customCrosshair && (
              <div className="px-3 py-2.5 rounded-xl bg-white/[0.025] border border-white/[0.07]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                    Reticle Geometry
                  </span>
                  <span className="text-[11px] font-mono-tech text-cyan-300 uppercase">
                    {settings.crosshairStyle}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['tactical', 'dot', 'chevron'] as CrosshairStyle[]).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => onUpdateSettings({ crosshairStyle: style })}
                      className={`min-h-[38px] rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer ${
                        settings.crosshairStyle === style
                          ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/50'
                          : 'bg-white/[0.04] text-slate-400 hover:text-slate-200 border border-transparent'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'aimbot' && (
          <div className="space-y-2.5">
            <ToggleRow
              label="Aimbot Head-Track Assist"
              description="Locks onto nearest target inside active FOV cone"
              checked={settings.aimbotEnabled}
              accent="crimson"
              onToggle={() => onUpdateSettings({ aimbotEnabled: !settings.aimbotEnabled })}
            />
            <ToggleRow
              label="Show Neon FOV Circle"
              description="Displays dynamic center-screen targeting radius"
              checked={settings.showFovCircle}
              accent="cyan"
              onToggle={() => onUpdateSettings({ showFovCircle: !settings.showFovCircle })}
            />

            <div className="px-3 py-3 rounded-xl bg-white/[0.03] border border-white/[0.07] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-200">FOV Circle Radius</span>
                <span className="font-mono-tech font-semibold text-cyan-300">
                  {settings.fovRadius} px
                </span>
              </div>
              <input
                type="range"
                min={40}
                max={240}
                step={2}
                value={settings.fovRadius}
                onChange={(e) => onUpdateSettings({ fovRadius: Number(e.target.value) })}
                aria-label="FOV Circle Radius"
                className="cyber-slider"
              />
            </div>

            <div className="px-3 py-3 rounded-xl bg-white/[0.03] border border-white/[0.07] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-200">Aimbot Smoothness</span>
                <span className="font-mono-tech font-semibold text-[#ff5c77]">
                  {settings.aimSmoothness}.0x
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                step={1}
                value={settings.aimSmoothness}
                onChange={(e) => onUpdateSettings({ aimSmoothness: Number(e.target.value) })}
                aria-label="Aimbot Smoothness"
                className="cyber-slider crimson"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Instant Snap</span>
                <span>Legit Smooth</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'boost' && (
          <div className="space-y-2.5">
            <ToggleRow
              label="120 FPS Extreme Unlocker"
              description="Mounts top live FPS & frame-time telemetry HUD"
              checked={settings.fpsBoost120}
              accent="cyan"
              onToggle={() => onUpdateSettings({ fpsBoost120: !settings.fpsBoost120 })}
            />
            <ToggleRow
              label="Anti-Lag & DNS Route Booster"
              description="Stabilizes simulated ping latency & jitter"
              checked={settings.antiLagDns}
              accent="cyan"
              onToggle={() => onUpdateSettings({ antiLagDns: !settings.antiLagDns })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href={STANDALONE_DOWNLOAD_PATH}
                download={STANDALONE_FILENAME}
                className="min-h-[44px] px-3 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                <Download className="w-4 h-4 shrink-0" />
                <span>Download .HTML</span>
              </a>

              <a
                href={STANDALONE_DOWNLOAD_PATH}
                className="min-h-[44px] px-3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/15 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                <ExternalLink className="w-4 h-4 shrink-0" />
                <span>Test Direct</span>
              </a>
            </div>
          </div>
        )}

        {/* Realistic Python & Memory Injection Terminal */}
        <PythonTerminal
          logs={logs}
          injectionState={injectionState}
          onInject={onInject}
          onClearLogs={onClearLogs}
        />
      </div>
    </div>
  );
}
