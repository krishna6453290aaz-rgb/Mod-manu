export type CrosshairStyle = 'tactical' | 'dot' | 'chevron';
export type MenuTab = 'esp' | 'aimbot' | 'boost';
export type InjectionState = 'idle' | 'running' | 'success';

export interface ModSettings {
  espBox: boolean;
  espSnaplines: boolean;
  espHealthBar: boolean;
  aimbotEnabled: boolean;
  showFovCircle: boolean;
  fovRadius: number;
  aimSmoothness: number;
  customCrosshair: boolean;
  crosshairStyle: CrosshairStyle;
  fpsBoost120: boolean;
  antiLagDns: boolean;
}

export interface TerminalLog {
  id: string;
  timestamp: string;
  level: 'cmd' | 'info' | 'addr' | 'warn' | 'success';
  text: string;
}

export const DEFAULT_MOD_SETTINGS: ModSettings = {
  espBox: true,
  espSnaplines: true,
  espHealthBar: true,
  aimbotEnabled: true,
  showFovCircle: true,
  fovRadius: 120,
  aimSmoothness: 8,
  customCrosshair: true,
  crosshairStyle: 'tactical',
  fpsBoost120: true,
  antiLagDns: true,
};
