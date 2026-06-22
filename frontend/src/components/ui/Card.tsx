import type { CSSProperties, ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  as?: 'div' | 'section' | 'article';
}

export function Card({ children, style, className, as: Tag = 'div' }: CardProps) {
  return (
    <Tag
      className={className}
      style={{
        background: 'var(--card-solid)',
        borderRadius: 'var(--r-card)',
        padding: 'var(--sp-5)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        border: '1px solid var(--border)',
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
