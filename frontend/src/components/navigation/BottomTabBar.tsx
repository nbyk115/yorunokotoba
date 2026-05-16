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
  { key: 'fortune', icon: Sparkles, label: '今日の運勢' },
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
        left: 0,
        right: 0,
        zIndex: 900,
        background: 'var(--card-solid)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: `6px 0 calc(6px + env(safe-area-inset-bottom, 0px))`,
        boxShadow: '0 -2px 12px rgba(0, 0, 0, 0.04)',
        maxWidth: 'var(--app-max-width)',
        margin: '0 auto',
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
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
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
