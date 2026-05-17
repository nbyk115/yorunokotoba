/**
 * Textarea  -  複数行テキスト入力
 * DESIGN.md: --r-input 12px / padding 14px 16px / focus: outline 2px solid var(--rose)
 */
import type { TextareaHTMLAttributes } from 'react';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ style, ...rest }: TextareaProps) {
  return (
    <textarea
      {...rest}
      style={{
        width: '100%',
        padding: '14px 16px',
        borderRadius: 'var(--r-input)',
        border: '1.5px solid var(--border)',
        background: 'rgba(255,255,255,0.05)',
        color: 'var(--t1)',
        caretColor: 'var(--rose)',
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--fs-body)',
        lineHeight: 1.9,
        resize: 'none',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color var(--anim-hover)',
        minHeight: 'clamp(120px, 28vw, 200px)',
        ...style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = '2px solid var(--rose)';
        e.currentTarget.style.outlineOffset = '2px';
        rest.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = 'none';
        rest.onBlur?.(e);
      }}
    />
  );
}
