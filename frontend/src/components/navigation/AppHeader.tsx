/**
 * AppHeader — Wave L1 リビルド
 *
 * ナイトモードトグルを廃止。常時ダーク + time-of-day のみで配色制御。
 * 設定ページへのアクセスは SettingsView 内で完結させる。
 */
import { Icon } from '@/components/ui/Icon';
import { Settings } from 'lucide-react';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  onSettingsClick?: () => void;
}

export function AppHeader({ title = 'よるのことば', subtitle, onSettingsClick }: AppHeaderProps) {
  return (
    <header
      style={{
        padding: 'var(--sp-5) var(--sp-5) var(--sp-3)',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      {onSettingsClick && (
        <button
          type="button"
          onClick={onSettingsClick}
          aria-label="設定を開く"
          style={{
            position: 'absolute',
            top: 'var(--sp-5)',
            left: 'var(--sp-4)',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-tag)',
            padding: '6px 12px',
            cursor: 'pointer',
            color: 'var(--t1)',
            minHeight: 44,
            minWidth: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background var(--anim-hover)',
          }}
        >
          <Icon icon={Settings} size={20} />
        </button>
      )}
      <h1
        style={{
          fontSize: 'var(--fs-h1)',
          fontWeight: 700,
          color: 'var(--rose)',
          letterSpacing: 2,
          margin: 0,
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p style={{ color: 'var(--t2)', fontSize: 'var(--fs-caption)', marginTop: 4 }}>{subtitle}</p>
      )}
    </header>
  );
}
