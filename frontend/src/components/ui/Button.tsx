import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
  children: ReactNode;
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, var(--rose), var(--pink))',
    color: '#fff',
    border: 'none',
    boxShadow: '0 4px 20px rgba(232, 98, 124, 0.28)',
  },
  secondary: {
    background: 'var(--card-solid)',
    color: 'var(--t1)',
    border: '1px solid var(--border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--rose)',
    border: 'none',
  },
};

export function Button({
  variant = 'primary',
  fullWidth = false,
  children,
  style,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      style={{
        borderRadius: 'var(--r-button)',
        padding: '14px 28px',
        fontSize: 'var(--fs-body)',
        fontWeight: 700,
        fontFamily: 'var(--font-heading)',
        cursor: 'pointer',
        minHeight: 44,
        minWidth: 44,
        width: fullWidth ? '100%' : undefined,
        transition: 'transform var(--anim-hover), box-shadow var(--anim-hover)',
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}
