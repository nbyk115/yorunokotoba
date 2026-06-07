import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ViewKey } from '@/App';

interface PremiumCardProps {
  onNavigate: (view: ViewKey) => void;
}

/**
 * 3 機能を「今夜の自分を、星に聞く」として 1 つの価値に束ねるプレミアム訴求カード。
 * 毎日/毎月手に入るものを明示し、散在していた機能の文脈をまとめる。
 * HomeView / DreamView / FortuneView / MidnightView の結果末尾で共用する。
 */

const PREMIUM_FEATURES = [
  {
    icon: '🌙',
    title: '今夜のモヤモヤを聞いてもらう',
    cadence: '毎日',
    category: '夜の対話',
    desc: '今夜のモヤモヤに言葉が返ってくる。1日1問、夜専用の対話。',
    view: 'midnight' as ViewKey,
  },
  {
    icon: '📈',
    title: '月ごとの夢の傾向分析',
    cadence: '毎月',
    category: '夢占い',
    desc: '夢の記録が積み重なると、今月の心のテーマとくり返しが見えてくる。',
    view: 'dream' as ViewKey,
  },
  {
    icon: '🔭',
    title: 'ホロスコープの深い分析',
    cadence: '日替わり',
    category: 'ホロスコープ',
    desc: '太陽星座の深い4層と「今日のハイライト」が、毎日一言変わって届く。',
    view: 'fortune' as ViewKey,
  },
] as const;

export function PremiumCard({ onNavigate }: PremiumCardProps) {
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
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 10px',
            borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(201, 169, 97, 0.18), rgba(201, 169, 97, 0.08))',
            border: '1px solid rgba(201, 169, 97, 0.55)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20)',
          }}
        >
          <span style={{ fontSize: 10, color: 'var(--gold)' }}>★</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--gold)', letterSpacing: 0.5 }}>プレミアム</span>
          <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--gold)', opacity: 0.7, letterSpacing: 0.3 }}>プレビュー公開中</span>
        </span>
      </div>
      <p
        style={{
          fontSize: 13,
          color: 'var(--t2)',
          lineHeight: 1.8,
          marginBottom: 'var(--sp-4)',
        }}
      >
        毎日・毎月・日替わりで届く、あなただけの{PREMIUM_FEATURES.length}つの星の言葉が届くよ。
      </p>

      {/* 3 機能: 毎日/毎月/日替わりの価値を明示 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          marginBottom: 'var(--sp-4)',
        }}
      >
        {PREMIUM_FEATURES.map((f, i) => (
          <div
            key={f.title}
            style={{
              display: 'flex',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 'var(--r-button)',
              background: i === 0 ? 'rgba(201, 169, 97, 0.07)' : 'var(--card-secondary)',
              border: '1px solid var(--border)',
              boxShadow: i === 0 ? 'inset 0 1px 0 rgba(255,255,255,0.18)' : 'none',
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{f.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 2 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>
                  {f.title}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  <span
                    style={{
                      fontSize: 9,
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
                      fontSize: 9,
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
