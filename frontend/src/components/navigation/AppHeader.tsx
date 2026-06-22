interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  onSettingsClick?: () => void;
}

export function AppHeader({ title = '🌙 よるのことば', subtitle, onSettingsClick }: AppHeaderProps) {
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
          onClick={onSettingsClick}
          aria-label="設定"
          style={{
            position: 'absolute',
            right: 'var(--sp-5)',
            top: 'var(--sp-5)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 20,
            color: 'var(--t2)',
            padding: 4,
            minWidth: 44,
            minHeight: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
          }}
        >
          ⚙
        </button>
      )}
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
