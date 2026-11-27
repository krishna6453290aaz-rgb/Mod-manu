import standaloneOverlayHtml from '../mod_overlay.html?raw';

export const STANDALONE_DOWNLOAD_PATH = '/mod_overlay.html';
export const STANDALONE_FILENAME = 'vx_core_mod_overlay.html';

export function generateStandaloneHtml(): string {
  return standaloneOverlayHtml;
}

export function downloadStandaloneHtml(filename = STANDALONE_FILENAME): void {
  const blob = new Blob([standaloneOverlayHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
