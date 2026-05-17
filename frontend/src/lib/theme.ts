/**
 * Theme management — night mode (dark) auto-detection
 * Preserves compatibility with legacy `ynk_night_mode` localStorage key.
 */

const STORAGE_KEY = 'ynk_night_mode';

export type NightMode = 'on' | 'off' | 'auto';

function isNightHours(): boolean {
  const h = new Date().getHours();
  return h >= 22 || h < 5;
}

export function getNightMode(): NightMode {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'on' || v === 'off') return v;
    return 'auto';
  } catch {
    return 'auto';
  }
}

export function isDarkActive(): boolean {
  const mode = getNightMode();
  if (mode === 'on') return true;
  if (mode === 'off') return false;
  return isNightHours();
}

export function setNightMode(mode: NightMode): void {
  try {
    if (mode === 'auto') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  } catch {
    /* ignore storage errors */
  }
  applyTheme(isDarkActive());
}

export function applyTheme(dark: boolean): void {
  const html = document.documentElement;
  if (dark) {
    html.setAttribute('data-theme', 'dark');
  } else {
    html.removeAttribute('data-theme');
  }
}

/** Called before React mounts to avoid flash. */
export function applyInitialTheme(): void {
  applyTheme(isDarkActive());
}
