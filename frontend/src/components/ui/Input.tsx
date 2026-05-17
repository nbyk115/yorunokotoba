/**
 * Input  -  テキスト入力
 * DESIGN.md: --r-input 12px / padding 14px 16px / focus: outline 2px solid var(--rose)
 */
import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ style, ...rest }: InputProps) {
  return (
    <input
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
        lineHeight: 1.5,
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color var(--anim-hover)',
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
