import { Card } from '@/components/ui/Card';
import { getDeepHoroscope } from '@/logic/horoscopeDeep';
import type { UserProfile } from '@/lib/firestore';

interface DeepHoroscopeCardProps {
  profile: UserProfile;
}

/** プレビュー公開中バッジ。課金ゲート接続は後続。 */
function PreviewBadge() {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: 'var(--rose)',
        background: 'rgba(232, 98, 124, 0.10)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-button)',
        padding: '2px 8px',
        whiteSpace: 'nowrap',
      }}
    >
      プレミアム機能(プレビュー公開中)
    </span>
  );
}

/**
 * ホロスコープの深い分析 (機能②) の表示。
 * FortuneView にあった PremiumFeatureCard (ティザーロック) を置き換える、
 * 実際の深い分析カード。出生時刻なし方針のため、時刻が必須な上昇星座・
 * ハウスは出さず、太陽星座の深掘り 4 層 + 月星座の近似 (注記つき) を出す。
 */
export function DeepHoroscopeCard({ profile }: DeepHoroscopeCardProps) {
  const deep = getDeepHoroscope(profile);

  return (
    <Card
      style={{
        background:
          'linear-gradient(135deg, rgba(176, 138, 207, 0.10), rgba(232, 98, 124, 0.08))',
        border: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          marginBottom: 6,
        }}
      >
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>
          <span style={{ marginRight: 6 }}>🔭</span>
          ホロスコープの深い分析
        </h3>
        <PreviewBadge />
      </div>
      <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.8, marginBottom: 'var(--sp-4)' }}>
        無料のリーディングより一段踏み込んだ、{deep.sunSign}のあなたの深い層を読み解くよ。
      </p>

      {/* 深掘り 4 層 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 'var(--sp-4)' }}>
        {deep.layers.map((layer) => (
          <div
            key={layer.label}
            style={{
              padding: '12px 14px',
              background: 'var(--card-solid)',
              borderRadius: 'var(--r-input)',
              border: '1px solid var(--border)',
            }}
          >
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--lavender)', marginBottom: 6 }}>
              <span style={{ marginRight: 6 }}>{layer.icon}</span>
              {layer.label}
            </p>
            <p style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.9 }}>{layer.body}</p>
          </div>
        ))}
      </div>

      {/* 月星座の近似 (目安 + 出生時刻が必要の注記) */}
      <div
        style={{
          padding: '14px 16px',
          background: 'var(--bg1)',
          borderRadius: 'var(--r-input)',
          borderLeft: '3px solid var(--lavender)',
          marginBottom: 'var(--sp-4)',
        }}
      >
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--lavender)', marginBottom: 6 }}>
          🌙 月星座から読む、感情のクセ（目安）
        </p>
        <p style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.9 }}>
          目安では{' '}
          <span style={{ color: 'var(--rose)', fontWeight: 700 }}>{deep.moon.sign}</span> 寄り。
          {deep.moon.note}
        </p>
        <p style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.7, marginTop: 8 }}>
          {deep.moon.caveat}
        </p>
      </div>

      {/* 将来導線 */}
      <p style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.8, textAlign: 'center' }}>
        {deep.futureHint}
      </p>
    </Card>
  );
}
