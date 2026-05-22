import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface TeaserItem {
  label: string;
}

interface PremiumFeatureCardProps {
  /** ロックアイコン前に表示するアイコン絵文字 */
  icon?: string;
  /** カードタイトル */
  title: string;
  /** 機能の説明文 */
  desc: string;
  /** ぼかしティザー項目 (3件程度) */
  teasers: TeaserItem[];
  /** ログ件数など任意の補足行。省略可 */
  supplement?: string;
  /** CTA ボタンのラベル。省略時は「✨ プレミアムで解放する」 */
  ctaLabel?: string;
  /** CTA タップ時のコールバック */
  onCtaTap?: () => void;
}

/**
 * 機能別プレミアムロックカード。
 * DreamView (月ごとの夢の傾向分析) と FortuneView (ホロスコープの深い分析) で使用する。
 * 体裁は既存 MonthlyTrendPremiumCard (🔒 + ぼかしティザー + CTA + 近日提供予定) を踏襲。
 */
export function PremiumFeatureCard({
  icon = '📈',
  title,
  desc,
  teasers,
  supplement,
  ctaLabel = '✨ プレミアムで解放する',
  onCtaTap,
}: PremiumFeatureCardProps) {
  return (
    <Card
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(176, 138, 207, 0.10), rgba(232, 98, 124, 0.08))',
        border: '1px solid var(--border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 18 }}>🔒</span>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>
          <span style={{ marginRight: 6 }}>{icon}</span>
          {title}
        </h3>
      </div>
      <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.8, marginBottom: 'var(--sp-4)' }}>
        {desc}
      </p>

      {supplement && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            borderRadius: 'var(--r-button)',
            background: 'var(--card-solid)',
            border: '1px solid var(--border)',
            marginBottom: 'var(--sp-4)',
          }}
        >
          <span style={{ fontSize: 14 }}>📒</span>
          <p style={{ flex: 1, fontSize: 11, color: 'var(--t2)', lineHeight: 1.6 }}>{supplement}</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 'var(--sp-4)' }}>
        {teasers.map((t) => (
          <div
            key={t.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 12px',
              borderRadius: 'var(--r-button)',
              background: 'var(--card-solid)',
              border: '1px dashed var(--border)',
            }}
          >
            <p
              style={{
                flex: 1,
                fontSize: 12,
                color: 'var(--t3)',
                filter: 'blur(0.4px)',
                lineHeight: 1.6,
              }}
            >
              {t.label}
            </p>
            <span style={{ fontSize: 12 }}>🔒</span>
          </div>
        ))}
      </div>

      <Button variant="secondary" fullWidth onClick={onCtaTap}>
        {ctaLabel}
      </Button>
      <p style={{ fontSize: 10, color: 'var(--t3)', textAlign: 'center', marginTop: 8 }}>
        プレミアムは近日提供予定です
      </p>
    </Card>
  );
}
