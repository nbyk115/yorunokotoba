import type { CSSProperties } from 'react';
import { CharaAvatar } from '@/components/ui/CharaAvatar';

interface HeroBlockProps {
  english: string;
  japanese: string;
  subtitle?: string;
  align?: 'center' | 'left';
  size?: 'hero' | 'compact';
  /** 夜のキャラID（指定時は英文の上に大きく表示） */
  charaId?: string;
  /** 夜のキャラのサイズ。size=hero時のデフォルトは160px、compact時は0=非表示 */
  charaSize?: number;
}

export function HeroBlock({
  english,
  japanese,
  subtitle,
  align = 'center',
  size = 'hero',
  charaId,
  charaSize,
}: HeroBlockProps) {
  const isCompact = size === 'compact';
  const resolvedCharaSize = charaSize ?? (isCompact ? 0 : 160);
  const showChara = !!charaId && resolvedCharaSize > 0;

  const wrapStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: isCompact ? 6 : 10,
    marginTop: isCompact ? 32 : showChara ? 32 : 72,
    paddingLeft: 32,
    paddingRight: 32,
    textAlign: align,
    alignItems: align === 'center' ? 'center' : 'flex-start',
  };

  // 日本語を主役に. 英語は装飾的キャプション（11-13px・薄く）として表示.
  // ICP（夜中3時の港区夜職層・OL層）に英語ポエムは伝わらないため.
  const japaneseStyle: CSSProperties = {
    fontFamily: 'var(--font-heading)',
    fontWeight: 500,
    fontSize: isCompact ? 18 : 'var(--hero-jp-size, 24px)',
    lineHeight: 1.5,
    color: 'var(--t1)',
    letterSpacing: '0.02em',
    margin: 0,
  };

  const englishStyle: CSSProperties = {
    fontFamily: 'var(--font-accent)',
    fontStyle: 'italic',
    fontWeight: 300,
    fontSize: isCompact ? 'var(--fs-micro)' : 'var(--fs-caption)',
    lineHeight: 1.5,
    color: 'var(--t3)',
    opacity: 0.7,
    margin: 0,
    letterSpacing: '0.06em',
  };

  const subtitleStyle: CSSProperties = {
    fontFamily: 'var(--font-heading)',
    fontWeight: 400,
    fontSize: 'var(--fs-caption)',
    lineHeight: 1.5,
    color: 'var(--t3)',
    margin: 0,
    marginTop: 4,
  };

  return (
    <header style={wrapStyle}>
      {showChara && (
        <div
          style={{
            width: resolvedCharaSize,
            height: resolvedCharaSize,
            marginBottom: 12,
          }}
        >
          <CharaAvatar id={charaId!} size={resolvedCharaSize} animate />
        </div>
      )}
      {/* 日本語を主役に表示（ICP 配慮） */}
      <p style={japaneseStyle}>{japanese}</p>
      {/* 英語は装飾的キャプションとして小さく薄く */}
      <p style={englishStyle} aria-hidden="true">{english}</p>
      {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
    </header>
  );
}
