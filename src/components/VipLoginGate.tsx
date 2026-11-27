import { useState, type FormEvent } from 'react';
import { CheckCircle2, Download, ExternalLink, KeyRound, ShieldAlert, Sparkles, Unlock } from 'lucide-react';
import { STANDALONE_DOWNLOAD_PATH, STANDALONE_FILENAME } from '../utils/standaloneHtml';

interface VipLoginGateProps {
  onUnlock: (activatedKey: string) => void;
}

const VALID_PREFIXES = ['VX-VIP-', 'KAGE-', 'VIP-'];

export function VipLoginGate({ onUnlock }: VipLoginGateProps) {
  const [activationKey, setActivationKey] = useState('');
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleGetKey = () => {
    const randomBlock = Math.floor(1000 + Math.random() * 9000);
    const generated = `VX-VIP-${randomBlock}-ARM64`;
    setActivationKey(generated);
    setError('');
    setStatusMessage('VIP session key retrieved and auto-filled.');
  };

  const handleVerify = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = activationKey.trim().toUpperCase();

    if (!trimmed) {
      setError('Enter an activation key or tap GET KEY to auto-fill.');
      setStatusMessage('');
      return;
    }

    const looksValid =
      trimmed.length >= 6 &&
      (VALID_PREFIXES.some((prefix) => trimmed.startsWith(prefix)) || /^[A-Z0-9-]{6,}$/.test(trimmed));

    if (!looksValid) {
      setError('Invalid key format. Use GET KEY or enter a valid VIP token.');
      setStatusMessage('');
      return;
    }

    setError('');
    setIsVerifying(true);
    setStatusMessage('Verifying RSA-2048 VIP signature...');

    window.setTimeout(() => {
      setIsVerifying(false);
      onUnlock(trimmed);
    }, 320);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="w-full max-w-md cyber-glass cyber-border-glow rounded-2xl p-6 sm:p-7 relative overflow-hidden">
        {/* Top subtle accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#ff1e42] via-[#00f0ff] to-[#ff1e42]"
          aria-hidden="true"
        />

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-mono-tech tracking-wider text-cyan-400 mb-1">
              ANDROID ARM64 OVERLAY
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              VX-CORE VIP GATE
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Verify your activation license to mount the floating utility menu.
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/35 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5 text-[#ff1e42]" />
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label
              htmlFor="vip-key-input"
              className="block text-xs font-medium text-slate-300 mb-2"
            >
              VIP Activation Key
            </label>
            <div className="relative">
              <input
                id="vip-key-input"
                type="text"
                value={activationKey}
                onChange={(e) => {
                  setActivationKey(e.target.value);
                  if (error) setError('');
                }}
                placeholder="VX-VIP-XXXX-ARM64"
                autoComplete="off"
                spellCheck={false}
                className="w-full h-12 px-4 rounded-xl bg-[#07080d] border border-white/15 text-cyan-200 placeholder:text-slate-600 font-mono-tech text-sm tracking-wide focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/25 rounded-lg px-3 py-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {statusMessage && !error && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-lg px-3 py-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={handleGetKey}
              className="min-h-[46px] px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>GET KEY</span>
            </button>

            <button
              type="submit"
              disabled={isVerifying}
              className="min-h-[46px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff1e42] to-[#d91436] hover:from-[#ff3153] hover:to-[#eb1c40] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(255,30,66,0.4)] transition-all active:scale-[0.98] disabled:opacity-60 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              <Unlock className="w-4 h-4 shrink-0" />
              <span>{isVerifying ? 'VERIFYING...' : 'UNLOCK MENU'}</span>
            </button>
          </div>
        </form>

        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono-tech">
          <span>arm64-v8a · UI Simulator</span>
          <div className="flex items-center gap-2">
            <a
              href={STANDALONE_DOWNLOAD_PATH}
              className="min-h-[36px] px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 text-slate-200 font-sans font-medium text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span>Test Direct</span>
            </a>
            <a
              href={STANDALONE_DOWNLOAD_PATH}
              download={STANDALONE_FILENAME}
              className="min-h-[36px] px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-cyan-500/15 border border-cyan-400/35 text-cyan-300 font-sans font-semibold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>Download .HTML</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
