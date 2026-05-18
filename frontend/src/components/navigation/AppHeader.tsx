import { useEffect, useState } from 'react';
import {
  getNightMode,
  setNightMode,
  isDarkActive,
  type NightMode,
} from '@/lib/theme';
import { track } from '@/lib/analytics';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
}

export function AppHeader({ title = '🌙 よるのことば', subtitle }: AppHeaderProps) {
  const [mode, setMode] = useState<NightMode>(() => getNightMode());
  const [dark, setDark] = useState(() => isDarkActive());

  useEffect(() => {
    setDark(isDarkActive());
  }, [mode]);

  function cycle() {
    const next: NightMode = dark ? 'off' : 'on';
    setNightMode(next);
    setMode(next);
    setDark(isDarkActive());
    track('night_mode_toggle', { to: next });
  }

  return (
    <header
      style={{
        padding: 'var(--sp-5) var(--sp-5) var(--sp-3)',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      <button
        onClick={cycle}
        aria-label={dark ? 'ライトモードに切替' : 'ダークモードに切替'}
        style={{
          position: 'absolute',
          top: 'var(--sp-5)',
          right: 'var(--sp-4)',
          background: 'transparent',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-tag)',
          padding: '6px 12px',
          fontSize: 16,
          cursor: 'pointer',
          color: 'var(--t1)',
          minHeight: 44,
          minWidth: 44,
          transition: 'background var(--anim-hover)',
        }}
      >
        {dark ? '☀️' : '🌙'}
      </button>
      <h1
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: 'var(--rose)',
          letterSpacing: 2,
          margin: 0,
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p style={{ color: 'var(--t2)', fontSize: 12, marginTop: 4 }}>{subtitle}</p>
      )}
    </header>
  );
}
