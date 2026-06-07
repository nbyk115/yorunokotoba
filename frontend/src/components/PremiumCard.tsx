import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ViewKey } from '@/App';

type FeatureKey = 'midnight' | 'dream' | 'fortune';

interface PremiumCardProps {
  onNavigate: (view: ViewKey) => void;
  /** 表示する機能 key を絞り込む。省略時は全 3 件表示。 */
  features?: readonly FeatureKey[];
}

/**
 * 3 機能を「今夜の自分を、星に聞く」として 1 つの価値に束ねるプレミアム訴求カード。
 * 夜ごと/月ごと/日替わりの cadence を明示し、散在していた機能の文脈をまとめる。
 * HomeView / DreamView / FortuneView / MidnightView の結果末尾で共用する。
 */

const PREMIUM_FEATURES = [
  {
    icon: '🌙',
    title: '今夜のモヤモヤを聞いてもらう',
    cadence: '夜ごと',
    category: '夜の対話',
    desc: 'こんな時間に、よく帰ってきたね。話、聞くよ。',
    view: 'midnight' as ViewKey,
  },
  {
    icon: '📈',
    title: '月ごとの夢の傾向分析',
    cadence: '月ごと',
    category: '夢占い',
    desc: '夢の記録が積み重なると、今月の心のテーマとくり返しが見えてくる。',
    view: 'dream' as ViewKey,
  },
  {
    icon: '🔭',
    title: 'ホロスコープの深い分析',
    cadence: '日替わり',
    category: 'ホロスコープ',
    desc: '太陽星座の深い4層(裏の本音 / 恋愛深層 / 才能活用 / 転機ヒント)を、毎日違う角度から読み解くよ。',
    view: 'fortune' as ViewKey,
  },
] as const;

export function PremiumCard({ onNavigate, features }: PremiumCardProps) {
  const displayFeatures = features
    ? (features.map((v) => PREMIUM_FEATURES.find((f) => f.view === v)).filter(
        (f): f is (typeof PREMIUM_FEATURES)[number] => f !== undefined
      ))
    : PREMIUM_FEATURES;
  return (
    <Card
      style={{
        background: 'linear-gradient(135deg, rgba(212, 168, 83, 0.06), rgba(176, 138, 207, 0.08))',
        border: '1px solid rgba(212, 168, 83, 0.40)',
        boxShadow:
          'inset 0 1px 0 rgba(212, 168, 83, 0.25), 0 2px 16px rgba(0,0,0,0.08)',
      }}
    >
      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 18 }}>✨</span>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>
          今夜の自分を、星に聞く
        </h2>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 16px',
            borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(212, 168, 83, 0.18), rgba(212, 168, 83, 0.08))',
            border: '1px solid rgba(212, 168, 83, 0.55)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20)',
          }}
        >
          <span style={{ fontSize: 13, color: 'var(--gold)' }}>★</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)', letterSpacing: 0.5 }}>プレミアム機能</span>
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontSize: 13,
          color: 'var(--t2)',
          lineHeight: 1.8,
          marginBottom: 'var(--sp-4)',
          textAlign: 'center',
        }}
      >
        <span>夜ごと・月ごと・日替わりに、</span>
        <span>あなただけの星の言葉が届くよ。</span>
      </div>

      {/* 3 機能: 夜ごと/月ごと/日替わりの cadence を明示 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          marginBottom: 'var(--sp-4)',
        }}
      >
        {displayFeatures.map((f, i) => (
          <div
            key={f.title}
            role="button"
            tabIndex={0}
            onClick={() => onNavigate(f.view)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onNavigate(f.view);
              }
            }}
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--r-button)',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              boxShadow: i === 0 ? 'var(--card-highlight-shadow)' : 'none',
              cursor: 'pointer',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1 }}>{f.icon}</span>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', margin: 0 }}>
                  {f.title}
                </p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: 'var(--gold)',
                      background: 'rgba(212, 168, 83, 0.12)',
                      border: '1px solid rgba(212, 168, 83, 0.30)',
                      borderRadius: 'var(--r-tag)',
                      padding: '1px 6px',
                      whiteSpace: 'nowrap',
                      display: 'inline-block',
                    }}
                  >
                    {f.cadence}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: 'var(--lavender)',
                      background: 'rgba(176, 138, 207, 0.12)',
                      border: '1px solid rgba(176, 138, 207, 0.30)',
                      borderRadius: 'var(--r-tag)',
                      padding: '1px 6px',
                      whiteSpace: 'nowrap',
                      display: 'inline-block',
                    }}
                  >
                    {f.category}
                  </span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.7 }}>
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Button variant="primary" onClick={() => onNavigate('dream')} fullWidth>
        ✨ プレミアムをのぞいてみる
      </Button>
    </Card>
  );
}
