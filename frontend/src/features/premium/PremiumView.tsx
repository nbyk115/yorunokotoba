/**
 * PremiumView — Wave L1 骨格実装
 * BackHeader → ヒーローコピー → 価値3点 → 登録Button
 */
import { BackHeader } from '@/components/ui/BackHeader';
import { Card } from '@/components/ui/Card';
import { PremiumCTA } from '@/components/ui/PremiumCTA';
import { useCurrentUser } from '@/lib/auth';

interface PremiumViewProps {
  onBack: () => void;
}

const VALUE_POINTS = [
  {
    label: '夢記録の傾向分析',
    body: '蓄積した夢の傾向をふり返れる記録機能。自分のパターンが見えてくるよ。',
  },
  {
    label: 'ホロスコープ深層心理',
    body: '星座の基本より一段深い、あなたの心の構造へのメッセージ。',
  },
  {
    label: 'キャラからの今月メッセージ',
    body: '守護キャラが今月のあなたに贈る、特別なことば。',
  },
];

export function PremiumView({ onBack }: PremiumViewProps) {
  const { userId } = useCurrentUser();

  return (
    <div style={{ paddingBottom: 40 }}>
      <BackHeader onBack={onBack} title="Premium" />

      {/* ヒーローコピー */}
      <div style={{ padding: '16px 20px 24px', textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'var(--font-accent)',
            fontSize: 'var(--fs-hero-en)',
            fontStyle: 'italic',
            color: 'var(--gold)',
            letterSpacing: '0.06em',
            margin: '0 0 8px',
          }}
        >
          premium
        </p>
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--fs-h1)',
            fontWeight: 700,
            color: 'var(--t1)',
            letterSpacing: '0.04em',
            lineHeight: 1.4,
            margin: '0 0 8px',
          }}
        >
          もっと深く、よみとく
        </h2>
        <p style={{ fontSize: 'var(--fs-body)', color: 'var(--t2)', lineHeight: 1.8, margin: 0 }}>
          月 ¥980。いつでも解約できるよ。
        </p>
      </div>

      {/* 価値3点 */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {VALUE_POINTS.map((v) => (
          <Card key={v.label} variant="secondary">
            <p
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--fs-body)',
                fontWeight: 700,
                color: 'var(--gold)',
                margin: '0 0 8px',
              }}
            >
              {v.label}
            </p>
            <p style={{ fontSize: 'var(--fs-body)', color: 'var(--t2)', lineHeight: 1.8, margin: 0, fontFamily: 'var(--font-heading)' }}>
              {v.body}
            </p>
          </Card>
        ))}
      </div>

      {/* 登録Button */}
      <div style={{ padding: '24px 16px 0' }}>
        <PremiumCTA source="premium_view" userId={userId} />
      </div>

      <p style={{ textAlign: 'center', fontSize: 'var(--fs-micro)', color: 'var(--t3)', padding: '16px 24px 0', lineHeight: 1.6 }}>
        月額 ¥980 / 自動更新 / いつでも解約可
      </p>
    </div>
  );
}
