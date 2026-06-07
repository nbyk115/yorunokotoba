import { Card } from '@/components/ui/Card';
import { PremiumBadge } from '@/components/PremiumBadge';
import { getDeepHoroscope } from '@/logic/horoscopeDeep';
import type { UserProfile } from '@/lib/firestore';

interface DeepHoroscopeCardProps {
  profile: UserProfile;
}

/**
 * ホロスコープの深い分析 (機能②) の表示。
 * gold 縁 + 上辺インセットハイライトでプレミアム感を演出。
 * todayHighlight をカード最上部に大きく表示し、日替わり価値を見せる。
 */
export function DeepHoroscopeCard({ profile }: DeepHoroscopeCardProps) {
  const deep = getDeepHoroscope(profile);
  const { todayHighlight } = deep;

  return (
    <Card
      className="slide-up"
      style={{
        background:
          'linear-gradient(135deg, rgba(212, 168, 83, 0.06), rgba(176, 138, 207, 0.08))',
        border: '1px solid rgba(212, 168, 83, 0.40)',
        boxShadow:
          'inset 0 1px 0 rgba(212, 168, 83, 0.25), 0 2px 16px rgba(0,0,0,0.08)',
      }}
    >
      {/* ヘッダー */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          marginBottom: 12,
        }}
      >
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>
          <span style={{ marginRight: 6 }}>🔭</span>
          ホロスコープの深い分析
        </h3>
        <PremiumBadge />
      </div>

      {/* 今日のハイライト: 日替わり価値を最上部で目立つ形で表示 */}
      <div
        className="slide-up-1"
        style={{
          padding: '14px 16px',
          marginBottom: 16,
          background: 'rgba(212, 168, 83, 0.08)',
          borderRadius: 'var(--r-input)',
          border: '1px solid rgba(212, 168, 83, 0.30)',
          boxShadow: 'inset 0 1px 0 rgba(212, 168, 83, 0.20)',
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--gold)',
            marginBottom: 6,
            letterSpacing: 0.5,
          }}
        >
          <span style={{ marginRight: 4 }}>{todayHighlight.icon}</span>
          今日の{todayHighlight.label}
        </p>
        <p style={{ fontSize: 14, color: 'var(--t1)', lineHeight: 1.85, fontWeight: 500 }}>
          {todayHighlight.note}
        </p>
      </div>

      <p
        style={{
          fontSize: 12,
          color: 'var(--t2)',
          lineHeight: 1.8,
          marginBottom: 'var(--sp-4)',
        }}
      >
        {deep.sunSign}のあなただけに、もう一層深く届けるよ。✨
      </p>

      {/* 深掘り 4 層: 50ms ずつずらしてスライドイン */}
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 'var(--sp-4)' }}
      >
        {deep.layers.map((layer, i) => (
          <div
            key={layer.label}
            className={`slide-up-${Math.min(i + 2, 5)}`}
            style={{
              padding: '12px 14px',
              background: 'var(--card-solid)',
              borderRadius: 'var(--r-input)',
              border: '1px solid var(--border)',
            }}
          >
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--lavender)',
                marginBottom: 6,
              }}
            >
              <span style={{ marginRight: 6 }}>{layer.icon}</span>
              {layer.label}
            </p>
            <p style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.9 }}>{layer.body}</p>
          </div>
        ))}
      </div>

      {/* 月星座の近似 */}
      <div
        className="slide-up-5"
        style={{
          padding: '14px 16px',
          background: 'var(--bg1)',
          borderRadius: 'var(--r-input)',
          borderLeft: '3px solid var(--lavender)',
          marginBottom: 'var(--sp-4)',
        }}
      >
        <p
          style={{ fontSize: 12, fontWeight: 700, color: 'var(--lavender)', marginBottom: 6 }}
        >
          🌙 月星座から読む、感情のクセ（目安）
        </p>
        <p style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.9 }}>
          目安では{' '}
          <span style={{ color: 'var(--rose)', fontWeight: 700 }}>{deep.moon.sign}</span> 寄り。
          {deep.moon.note}
        </p>
        <p
          style={{
            fontSize: 11,
            color: 'var(--t3)',
            lineHeight: 1.7,
            marginTop: 8,
          }}
        >
          {deep.moon.caveat}
        </p>
      </div>

      {/* 将来導線 */}
      <p
        style={{
          fontSize: 11,
          color: 'var(--t3)',
          lineHeight: 1.8,
          textAlign: 'center',
        }}
      >
        {deep.futureHint}
      </p>
    </Card>
  );
}
