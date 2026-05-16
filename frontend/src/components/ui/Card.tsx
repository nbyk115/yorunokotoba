import type { CSSProperties, ReactNode } from 'react';

/**
 * Card プリミティブ — DESIGN.md 正典準拠（Phase 3）
 *
 * variant='primary'  : メイン機能カード。1画面に1枚が原則。
 *   background   : var(--card-primary)
 *   border       : var(--border-primary)
 *   shadow       : var(--shadow-card-primary)
 *   padding      : var(--sp-6) = 24px
 *   border-radius: var(--r-card) = 18px
 *
 * variant='secondary' : サブカード・リストアイテム。複数可。
 *   background   : var(--card-secondary)
 *   border       : var(--border-secondary)
 *   shadow       : var(--shadow-card-secondary)
 *   padding      : var(--sp-5) = 20px
 *   border-radius: var(--r-card) = 18px
 *
 * variant 未指定（省略） : 後方互換。従来の --card / --border / --shadow-card-secondary 相当。
 *
 * 影の直書き・--card-solid・hex 直書きは禁止。DESIGN.md § ダークファースト参照。
 */

export interface CardProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  style?: CSSProperties;
  className?: string;
  as?: 'div' | 'section' | 'article';
}

export function Card({
  children,
  variant,
  style,
  className,
  as: Tag = 'div',
}: CardProps) {
  const base: CSSProperties =
    variant === 'primary'
      ? {
          background: 'var(--card-primary)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--r-card)',
          padding: 'var(--sp-6)',
          boxShadow: 'var(--shadow-card-primary)',
        }
      : variant === 'secondary'
        ? {
            background: 'var(--card-secondary)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border-secondary)',
            borderRadius: 'var(--r-card)',
            padding: 'var(--sp-5)',
            boxShadow: 'var(--shadow-card-secondary)',
          }
        : {
            /* 後方互換: variant 未指定は旧 --card / --border / secondary shadow */
            background: 'var(--card)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-card)',
            padding: 'var(--sp-5)',
            boxShadow: 'var(--shadow-card-secondary)',
          };

  return (
    <Tag
      className={className}
      style={{ ...base, ...style }}
    >
      {children}
    </Tag>
  );
}
