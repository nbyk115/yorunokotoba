import type { CSSProperties } from 'react';
import { CharaAvatar } from '@/components/ui/CharaAvatar';

interface HeroBlockProps {
  english: string;
  japanese: string;
  subtitle?: string;
  align?: 'center' | 'left';
  size?: 'hero' | 'compact';
  /** 夜のキャラID（指定時は英文の上に表示） */
  charaId?: string;
  /** 夜のキャラのサイズ。size=hero時のデフォルトは88px、compact時は0=非表示 */
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
  // PR4: アバターを 88px に縮小（旧 160px から削減。「占いアプリ感・子供っぽさ」を弱める）
  const resolvedCharaSize = charaSize ?? (isCompact ? 0 : 88);
  const showChara = !!charaId && resolvedCharaSize > 0;

  const wrapStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: isCompact ? 6 : 8,
    marginTop: isCompact ? 32 : showChara ? 40 : 72,
    paddingLeft: 32,
    paddingRight: 32,
    textAlign: align,
    alignItems: align === 'center' ? 'center' : 'flex-start',
  };

  // PR4: Cormorant italic 40px を英文の主役に昇格
  // creative-director 指定「H1とbodyが7px差しかなくのっぺり → フォント種別差で強い階層」
  const englishStyle: CSSProperties = isCompact
    ? {
        fontFamily: 'var(--font-accent)',
        fontStyle: 'italic',
        fontWeight: 300,
        fontSize: 'var(--fs-micro)',
        lineHeight: 1.5,
        color: 'var(--t3)',
        opacity: 0.7,
        margin: 0,
        letterSpacing: '0.06em',
      }
    : {
        fontFamily: 'var(--font-accent)',
        fontStyle: 'italic',
        fontWeight: 'var(--fw-hero-cormorant)' as string,
        fontSize: 'var(--fs-hero-cormorant)',
        lineHeight: 1.15,
        color: 'var(--t1)',
        margin: 0,
        letterSpacing: '-0.01em',
      };

  // PR4: 日本語はサポート扱い。Zen Maru 400 15px / t2 色 で英文の下に収まる
  const japaneseStyle: CSSProperties = {
    fontFamily: 'var(--font-heading)',
    fontWeight: isCompact ? 500 : 400,
    fontSize: isCompact ? 18 : 'var(--fs-body)',
    lineHeight: 1.6,
    color: 'var(--t2)',
    letterSpacing: '0.02em',
    margin: 0,
    marginTop: isCompact ? 0 : 4,
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
            marginBottom: 16,
          }}
        >
          <CharaAvatar id={charaId!} size={resolvedCharaSize} animate />
        </div>
      )}
      {/* PR4: 英文が主役 (Cormorant 40px italic)、日本語がサポート */}
      <p style={englishStyle}>{english}</p>
      <p style={japaneseStyle}>{japanese}</p>
      {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
    </header>
  );
}
