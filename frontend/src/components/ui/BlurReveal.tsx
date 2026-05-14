import { useState, type CSSProperties, type ReactNode } from 'react';

interface BlurRevealProps {
  children: ReactNode;
  /** 初期ぼかし量 (px)。デフォルト 4 */
  initialBlur?: number;
  /** true: タップで reveal。false: 常に reveal 済み */
  revealOnTap?: boolean;
  style?: CSSProperties;
  className?: string;
}

/**
 * タップで blur を解除するラッパー。
 * 一度 reveal したら戻らない（内部 state で管理）。
 */
export function BlurReveal({
  children,
  initialBlur = 4,
  revealOnTap = true,
  style,
  className,
}: BlurRevealProps) {
  const [revealed, setRevealed] = useState(!revealOnTap);

  const handleReveal = () => {
    if (!revealed) setRevealed(true);
  };

  const wrapStyle: CSSProperties = {
    filter: revealed ? 'blur(0px)' : `blur(${initialBlur}px)`,
    transition: 'filter 300ms ease',
    cursor: revealed ? 'default' : 'pointer',
    userSelect: revealed ? 'auto' : 'none',
    WebkitUserSelect: revealed ? 'auto' : 'none',
    ...style,
  };

  return (
    <div
      className={className}
      style={wrapStyle}
      onClick={handleReveal}
      role={!revealed ? 'button' : undefined}
      aria-label={!revealed ? 'タップして表示' : undefined}
      tabIndex={!revealed ? 0 : undefined}
      onKeyDown={
        !revealed
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleReveal();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
