interface AppHeaderProps {
  title?: string;
  subtitle?: string;
}

export function AppHeader({ title = '🌙 よるのことば', subtitle }: AppHeaderProps) {
  return (
    <header
      style={{
        padding: 'var(--sp-5) var(--sp-5) var(--sp-3)',
        textAlign: 'center',
        position: 'relative',
      }}
    >
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
