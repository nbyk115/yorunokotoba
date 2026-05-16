import type { CSSProperties } from 'react';
import { CharaAvatar } from '@/components/ui/CharaAvatar';

interface HeroBlockProps {
  /** 日本語見出し（主役。Zen Maru 700 24px） */
  japanese: string;
  /** 英語装飾フレーズ（Cormorant italic 22px に降格。引用句・サブキャプション用途） */
  english?: string;
  subtitle?: string;
  align?: 'center' | 'left';
  size?: 'hero' | 'compact';
  /** 夜のキャラID（指定時は見出しの上に表示） */
  charaId?: string;
  /** 夜のキャラのサイズ。size=hero時のデフォルトは128px（PR5 復帰）、compact時は0=非表示 */
  charaSize?: number;
}

export function HeroBlock({
  japanese,
  english,
  subtitle,
  align = 'center',
  size = 'hero',
  charaId,
  charaSize,
}: HeroBlockProps) {
  const isCompact = size === 'compact';
  // PR5: アバターを 88px → 128px に戻す（ターゲットはキャラ好き）
  const resolvedCharaSize = charaSize ?? (isCompact ? 0 : 128);
  const showChara = !!charaId && resolvedCharaSize > 0;

  const wrapStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: isCompact ? 4 : 6,
    marginTop: isCompact ? 32 : showChara ? 40 : 72,
    paddingLeft: 32,
    paddingRight: 32,
    textAlign: align,
    alignItems: align === 'center' ? 'center' : 'flex-start',
  };

  // PR5: 日本語が主役。Zen Maru 700 24px / letter-spacing .04em
  const japaneseStyle: CSSProperties = isCompact
    ? {
        fontFamily: 'var(--font-heading)',
        fontWeight: 700,
        fontSize: 18,
        lineHeight: 1.4,
        color: 'var(--t1)',
        letterSpacing: '0.04em',
        margin: 0,
      }
    : {
        fontFamily: 'var(--font-heading)',
        fontWeight: 'var(--fw-hero-jp)' as string,
        fontSize: 'var(--fs-hero-jp)',
        lineHeight: 1.4,
        color: 'var(--t1)',
        letterSpacing: '0.04em',
        margin: 0,
      };

  // PR5: 英文は装飾降格。Cormorant italic 22px / t3 色
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
        fontWeight: 'var(--fw-hero-en)' as string,
        fontSize: 'var(--fs-hero-en)',
        lineHeight: 1.3,
        color: 'var(--t3)',
        margin: 0,
        marginTop: 6,
        letterSpacing: '0.01em',
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
      {/* PR5: 日本語が主役（Zen Maru 700 24px）、英語は装飾降格（Cormorant italic 22px / t3） */}
      <p style={japaneseStyle}>{japanese}</p>
      {english && <p style={englishStyle}>{english}</p>}
      {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
    </header>
  );
}
