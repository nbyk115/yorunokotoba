/**
 * BottomTabBar  -  Wave L1 リビルド
 * タブ: ホーム / 夢占い / 星座占い / 履歴
 * DESIGN.md: height 56px / active --rose / inactive --t3
 */
import { House, Moon, Sparkles, BookOpen } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';
import type { ViewKey } from '@/App';

interface BottomTabBarProps {
  current: ViewKey;
  onChange: (view: ViewKey) => void;
}

const TABS: { key: ViewKey; icon: LucideIcon; label: string }[] = [
  { key: 'home', icon: House, label: 'ホーム' },
  { key: 'dream', icon: Moon, label: '夢占い' },
  { key: 'fortune', icon: Sparkles, label: '星座占い' },
  { key: 'archive', icon: BookOpen, label: '履歴' },
];

export function BottomTabBar({ current, onChange }: BottomTabBarProps) {
  return (
    <nav
      aria-label="メインナビゲーション"
      role="tablist"
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 430,
        zIndex: 900,
        background: 'var(--card-solid)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-around',
        height: 56,
        alignItems: 'stretch',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {TABS.map((tab) => {
        const active = current === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={tab.label}
            tabIndex={0}
            onClick={() => onChange(tab.key)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 12px',
              minHeight: 44,
              minWidth: 44,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              color: active ? 'var(--rose)' : 'var(--t3)',
              fontFamily: 'var(--font-heading)',
              transition: 'color var(--anim-hover)',
            }}
          >
            <Icon icon={tab.icon} size={24} />
            <span style={{ fontSize: 'var(--fs-micro)', fontWeight: 700 }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
