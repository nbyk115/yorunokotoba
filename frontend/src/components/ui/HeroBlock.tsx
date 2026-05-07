import type { CSSProperties } from 'react';

interface HeroBlockProps {
  english: string;
  japanese: string;
  subtitle?: string;
  align?: 'center' | 'left';
  size?: 'hero' | 'compact';
}

export function HeroBlock({
  english,
  japanese,
  subtitle,
  align = 'center',
  size = 'hero',
}: HeroBlockProps) {
  const isCompact = size === 'compact';

  const wrapStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: isCompact ? 6 : 10,
    marginTop: isCompact ? 32 : 72,
    paddingLeft: 32,
    paddingRight: 32,
    textAlign: align,
    alignItems: align === 'center' ? 'center' : 'flex-start',
  };

  const englishStyle: CSSProperties = {
    fontFamily: 'var(--font-accent)',
    fontStyle: 'italic',
    fontWeight: 300,
    fontSize: isCompact ? 22 : 'var(--hero-cormorant-size)',
    lineHeight: 1.4,
    color: 'var(--t1)',
    margin: 0,
    letterSpacing: '0.01em',
  };

  const japaneseStyle: CSSProperties = {
    fontFamily: 'var(--font-heading)',
    fontWeight: 500,
    fontSize: isCompact ? 14 : 'var(--hero-jp-size)',
    lineHeight: 1.7,
    color: 'var(--t2)',
    margin: 0,
  };

  const subtitleStyle: CSSProperties = {
    fontFamily: 'var(--font-heading)',
    fontWeight: 400,
    fontSize: 13,
    lineHeight: 1.5,
    color: 'var(--t3)',
    margin: 0,
    marginTop: 4,
  };

  return (
    <header style={wrapStyle}>
      <p style={englishStyle}>{english}</p>
      <p style={japaneseStyle}>{japanese}</p>
      {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
    </header>
  );
}
