import { useEffect, useRef } from 'react';
import { Terminal, Trash2, Zap } from 'lucide-react';
import type { InjectionState, TerminalLog } from '../types/modMenu';

interface PythonTerminalProps {
  logs: TerminalLog[];
  injectionState: InjectionState;
  onInject: () => void;
  onClearLogs: () => void;
}

const LEVEL_COLORS: Record<TerminalLog['level'], string> = {
  cmd: 'text-cyan-300 font-semibold',
  info: 'text-slate-300',
  addr: 'text-amber-300',
  warn: 'text-rose-400',
  success: 'text-emerald-400 font-bold',
};

export function PythonTerminal({
  logs,
  injectionState,
  onInject,
  onClearLogs,
}: PythonTerminalProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="border-t border-white/10 pt-3 mt-3 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
          <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Python &amp; Memory Terminal</span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-[11px] font-mono-tech ${
              injectionState === 'success'
                ? 'text-emerald-400'
                : injectionState === 'running'
                ? 'text-amber-300'
                : 'text-slate-500'
            }`}
          >
            {injectionState === 'success'
              ? 'HOOKED'
              : injectionState === 'running'
              ? 'INJECTING'
              : 'STANDBY'}
          </span>

          <button
            type="button"
            onClick={onClearLogs}
            disabled={injectionState === 'running'}
            title="Clear terminal logs"
            aria-label="Clear terminal logs"
            className="min-w-[32px] min-h-[32px] rounded-lg bg-white/[0.04] hover:bg-white/[0.09] text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Auto-scrolling Terminal Console */}
      <div
        ref={scrollContainerRef}
        className="cyber-scroll h-32 rounded-xl bg-[#040508] border border-white/10 p-2.5 overflow-y-auto font-mono-tech text-[11px] leading-relaxed space-y-1 select-text"
      >
        {logs.map((entry) => (
          <div key={entry.id} className="flex items-start gap-2 break-all">
            <span className="text-slate-600 shrink-0">{entry.timestamp}</span>
            <span className={LEVEL_COLORS[entry.level]}>{entry.text}</span>
          </div>
        ))}
      </div>

      {/* Inject Button */}
      <button
        type="button"
        onClick={onInject}
        disabled={injectionState === 'running'}
        className={`w-full min-h-[46px] px-4 py-2.5 rounded-xl font-display font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all active:scale-[0.98] whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 ${
          injectionState === 'success'
            ? 'bg-emerald-500/15 border border-emerald-400/50 text-emerald-300 hover:bg-emerald-500/25 focus-visible:ring-emerald-400'
            : 'bg-gradient-to-r from-[#ff1e42] via-[#e6173a] to-[#b80e2c] hover:from-[#ff3355] hover:to-[#d11335] text-white shadow-[0_0_24px_rgba(255,30,66,0.38)] focus-visible:ring-rose-400'
        } disabled:opacity-65 disabled:cursor-wait`}
      >
        <Zap className="w-4 h-4 shrink-0" />
        <span>
          {injectionState === 'running'
            ? 'EXECUTING PYTHON HOOKS...'
            : injectionState === 'success'
            ? 'RE-INJECT PYTHON BYPASS'
            : 'INJECT PYTHON BYPASS'}
        </span>
      </button>
    </div>
  );
}
