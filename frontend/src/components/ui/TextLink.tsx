/**
 * TextLink  -  テキストリンク / テキストボタン
 * DESIGN.md: --fs-caption 13px / --t3 / タップ領域 44px
 */
import type { ReactNode } from 'react';

interface TextLinkProps {
  children: ReactNode;
  onClick: () => void;
  /** aria-label */
  label?: string;
  /** 色トークン。デフォルト var(--t3) */
  colorToken?: string;
}

export function TextLink({ children, onClick, label, colorToken = 'var(--t3)' }: TextLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: colorToken,
        fontSize: 'var(--fs-caption)',
        fontFamily: 'var(--font-heading)',
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: '0.04em',
        padding: '10px 12px',
        minHeight: 44,
        minWidth: 44,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity var(--anim-hover)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.opacity = '0.7';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.opacity = '1';
      }}
      onFocus={(e) => {
        (e.currentTarget as HTMLElement).style.outline = '2px solid var(--rose)';
        (e.currentTarget as HTMLElement).style.outlineOffset = '2px';
      }}
      onBlur={(e) => {
        (e.currentTarget as HTMLElement).style.outline = 'none';
      }}
    >
      {children}
    </button>
  );
}
