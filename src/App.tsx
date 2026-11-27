import { useEffect, useRef, useState } from 'react';
import { FloatingBubble } from './components/FloatingBubble';
import { ModMenuPanel } from './components/ModMenuPanel';
import { TacticalArenaCanvas } from './components/TacticalArenaCanvas';
import { TopTelemetryHud } from './components/TopTelemetryHud';
import { VipLoginGate } from './components/VipLoginGate';
import {
  DEFAULT_MOD_SETTINGS,
  type InjectionState,
  type ModSettings,
  type TerminalLog,
} from './types/modMenu';

function getTimeStamp(): string {
  const now = new Date();
  return now.toTimeString().slice(0, 8);
}

const PYTHON_INJECTION_STEPS: Array<{ level: TerminalLog['level']; text: string }> = [
  { level: 'cmd', text: '$ python3 core_hook.py --arch arm64-v8a --pid 18492' },
  { level: 'info', text: '[*] Loading pymem & frida-gadget 16.4.8 ARM64 bindings...' },
  { level: 'info', text: '[+] Attached to com.tactical.arena (uid=10284, arm64-v8a)' },
  { level: 'addr', text: '[*] Scanning libil2cpp.so base offsets -> 0x7a4c200000' },
  { level: 'addr', text: '[+] Found LocalPlayer::Update @ 0x7a4d814a90 (+0x1614a90)' },
  { level: 'addr', text: '[+] Found Camera::WorldToScreenPoint @ 0x7a4df02c18' },
  { level: 'warn', text: '[*] Patching libanogs.so anti-cheat CRC32 checksums...' },
  { level: 'info', text: "[+] NOP'd 4 integrity checks -> 0x1f2003d5 (ret)" },
  { level: 'success', text: '>>> SUCCESS! Python bypass & memory hooks active.' },
];

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activatedKey, setActivatedKey] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [settings, setSettings] = useState<ModSettings>(DEFAULT_MOD_SETTINGS);
  const [injectionState, setInjectionState] = useState<InjectionState>('idle');
  const [logs, setLogs] = useState<TerminalLog[]>([
    {
      id: 'init-1',
      timestamp: getTimeStamp(),
      level: 'info',
      text: '[SYS] Overlay mounted. Awaiting Python bypass execution.',
    },
  ]);

  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  const appendLog = (level: TerminalLog['level'], text: string) => {
    setLogs((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: getTimeStamp(),
        level,
        text,
      },
    ]);
  };

  const handleUnlock = (key: string) => {
    setActivatedKey(key);
    setIsUnlocked(true);
    setIsMenuOpen(true);
    appendLog('success', `[AUTH] VIP license verified (${key}).`);
  };

  const handleUpdateSettings = (patch: Partial<ModSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  const handleClearLogs = () => {
    if (injectionState === 'running') return;
    setLogs([
      {
        id: `clear-${Date.now()}`,
        timestamp: getTimeStamp(),
        level: 'info',
        text: '[SYS] Console cleared. Ready for core_hook.py.',
      },
    ]);
  };

  const handleInjectPythonBypass = () => {
    if (injectionState === 'running') return;

    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];

    setInjectionState('running');

    PYTHON_INJECTION_STEPS.forEach((step, index) => {
      const timerId = window.setTimeout(() => {
        appendLog(step.level, step.text);
        if (index === PYTHON_INJECTION_STEPS.length - 1) {
          setInjectionState('success');
        }
      }, index * 340);
      timersRef.current.push(timerId);
    });
  };

  return (
    <main className="relative w-screen h-[100dvh] overflow-hidden bg-[#06070a]">
      {/* Live Tactical Game Arena + ESP / Aimbot FOV / Pro Crosshair Canvas */}
      <TacticalArenaCanvas settings={settings} isUnlocked={isUnlocked} />

      {/* VIP Activation Key Gate */}
      {!isUnlocked && <VipLoginGate onUnlock={handleUnlock} />}

      {/* Unlocked Overlay HUD & Mod Menu */}
      {isUnlocked && (
        <>
          <TopTelemetryHud
            fpsBoost120={settings.fpsBoost120}
            antiLagDns={settings.antiLagDns}
            injectionState={injectionState}
          />

          <FloatingBubble
            isOpen={isMenuOpen}
            onToggleMenu={() => setIsMenuOpen((prev) => !prev)}
            injectionActive={injectionState === 'success'}
          />

          <ModMenuPanel
            isOpen={isMenuOpen}
            activatedKey={activatedKey}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onCollapse={() => setIsMenuOpen(false)}
            logs={logs}
            injectionState={injectionState}
            onInject={handleInjectPythonBypass}
            onClearLogs={handleClearLogs}
          />
        </>
      )}
    </main>
  );
}
