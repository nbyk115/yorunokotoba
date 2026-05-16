/**
 * BackHeader — 戻るボタン付きページヘッダー
 * DESIGN.md: タップ領域 44px / --rose テキストリンク
 */
import { ChevronLeft } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';

interface BackHeaderProps {
  onBack: () => void;
  title?: string;
}

export function BackHeader({ onBack, title }: BackHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: 'var(--sp-3) var(--sp-4)',
        position: 'relative',
        minHeight: 52,
      }}
    >
      <button
        type="button"
        onClick={onBack}
        aria-label="戻る"
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--rose)',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 'var(--fs-body)',
          fontFamily: 'var(--font-heading)',
          fontWeight: 400,
          minHeight: 44,
          minWidth: 44,
          padding: '8px 4px',
          transition: 'opacity var(--anim-hover)',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.opacity = '0.7';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.opacity = '1';
        }}
      >
        <Icon icon={ChevronLeft} size={20} />
        戻る
      </button>
      {title && (
        <p
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            margin: 0,
            fontSize: 'var(--fs-h3)',
            fontWeight: 700,
            color: 'var(--t1)',
            fontFamily: 'var(--font-heading)',
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </p>
      )}
    </div>
  );
}
