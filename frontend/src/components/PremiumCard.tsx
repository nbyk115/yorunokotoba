import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ViewKey } from '@/App';

interface PremiumCardProps {
  onNavigate: (view: ViewKey) => void;
}

const PREMIUM_FEATURES = [
  {
    icon: '📈',
    title: '月ごとの夢の傾向分析',
    desc: 'ためた夢の記録から、月ごとの心の傾向やくり返すパターンを読み解くよ。',
  },
  {
    icon: '🔭',
    title: 'ホロスコープの深い分析',
    desc: '無料の太陽星座リーディングより踏み込んだ、もっと詳しい自己分析が見られるよ。',
  },
] as const;

/**
 * プレミアム訴求カード。
 * HomeView / DreamView / FortuneView の結果末尾で共用する。
 * onNavigate('dream') を渡すと夢占い画面（カレンダー含む）に遷移する。
 */
export function PremiumCard({ onNavigate }: PremiumCardProps) {
  return (
    <Card
      style={{
        background: 'linear-gradient(135deg, rgba(176, 138, 207, 0.10), rgba(232, 98, 124, 0.08))',
        border: '1px solid var(--border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 18 }}>🔒</span>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>プレミアムで、もっと深く</h2>
      </div>
      <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.8, marginBottom: 'var(--sp-4)' }}>
        無料の占いより一歩踏み込んだ、あなただけの深いリーディング。プレミアムでこんなことができるよ。
      </p>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          marginBottom: 'var(--sp-4)',
        }}
      >
        {PREMIUM_FEATURES.map((f) => (
          <div
            key={f.title}
            style={{
              display: 'flex',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 'var(--r-button)',
              background: 'var(--card-solid)',
              border: '1px solid var(--border)',
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{f.icon}</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>{f.title}</p>
              <p style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.7, marginTop: 2 }}>
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Button variant="secondary" onClick={() => onNavigate('dream')} fullWidth>
        ✨ プレミアムを見る
      </Button>
    </Card>
  );
}
