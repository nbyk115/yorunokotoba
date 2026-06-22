import { Card } from '@/components/ui/Card';
import { PremiumBadge } from '@/components/PremiumBadge';
import { analyzeDreamTrends } from '@/logic/dreamTrends';
import type { ArchiveEntry } from '@/lib/archive';

interface DreamTrendCardProps {
  /** 夢ログ全件 (loadArchive の戻り値)。 */
  entries: readonly ArchiveEntry[];
  /** 集計の基準月。テスト用に差し替え可能。既定は現在時刻。 */
  now?: Date;
}

/** ランク別アクセントカラー (1位 gold / 2位 silver / 3位 bronze)。 */
const RANK_COLORS = [
  'var(--gold)',
  'rgba(180,180,180,0.85)',
  'rgba(180,120,60,0.75)',
] as const;

/**
 * 月ごとの夢の傾向分析 (機能①) の表示。
 * gold 縁 + 上辺インセットハイライトでプレミアム感を演出。
 * emotionTrend ブロックと頻出テーマ 1 位の gold アクセントを追加。
 */
export function DreamTrendCard({ entries, now }: DreamTrendCardProps) {
  const trend = analyzeDreamTrends(entries, now);

  // 3 件未満: 進捗を出す (ロックではなく「あと○件」)。
  if (!trend.ready) {
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            marginBottom: 8,
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>
            <span style={{ marginRight: 6 }}>📈</span>
            月ごとの夢の傾向分析
          </h3>
          <PremiumBadge />
        </div>
        <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.9 }}>{trend.message}</p>
        <p style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.7, marginTop: 10 }}>
          今月の記録: {trend.monthCount}件 / 分析成立まであと{trend.remaining}件
        </p>
      </Card>
    );
  }

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
          <span style={{ marginRight: 6 }}>📈</span>
          {trend.month + 1}月の夢の傾向
        </h3>
        <PremiumBadge />
      </div>
      <p style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 'var(--sp-4)' }}>
        今月 {trend.monthCount} 件の記録から読み解いたよ
      </p>

      {/* 感情の傾き (emotionTrend): 新規追加ブロック */}
      <div
        className="slide-up-1"
        style={{
          padding: '12px 14px',
          marginBottom: 'var(--sp-4)',
          background: 'rgba(212, 168, 83, 0.07)',
          borderRadius: 'var(--r-input)',
          border: '1px solid rgba(212, 168, 83, 0.25)',
        }}
      >
        <p
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--gold)',
            marginBottom: 8,
          }}
        >
          💫 今月の感情の傾き
        </p>
        {/* 前向き比率バー */}
        <div style={{ marginBottom: 8 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 11,
              color: 'var(--t3)',
              marginBottom: 4,
            }}
          >
            <span>前向き</span>
            <span>{trend.emotionTrend.forwardRatio}%</span>
          </div>
          <div
            style={{
              height: 6,
              background: 'var(--border)',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${trend.emotionTrend.forwardRatio}%`,
                background:
                  'linear-gradient(90deg, var(--gold), rgba(212, 168, 83, 0.60))',
                borderRadius: 3,
                transition: 'width 0.6s ease',
              }}
            />
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.8 }}>
          {trend.emotionTrend.note}
        </p>
      </div>

      {/* 頻出テーマ Top3: 1位に gold アクセント */}
      <div className="slide-up-2" style={{ marginBottom: 'var(--sp-4)' }}>
        <p
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--lavender)',
            marginBottom: 8,
          }}
        >
          🏷️ 今月の頻出テーマ
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {trend.topThemes.map((t, i) => (
            <div
              key={t.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 'var(--r-button)',
                background: i === 0 ? 'rgba(212, 168, 83, 0.08)' : 'var(--card-solid)',
                border:
                  i === 0
                    ? '1px solid rgba(212, 168, 83, 0.35)'
                    : '1px solid var(--border)',
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: RANK_COLORS[i] ?? 'var(--t3)',
                  minWidth: 16,
                }}
              >
                {i + 1}
              </span>
              <span style={{ fontSize: 14 }}>{t.icon}</span>
              <span
                style={{
                  flex: 1,
                  fontSize: 13,
                  color: i === 0 ? 'var(--t1)' : 'var(--t1)',
                  fontWeight: i === 0 ? 700 : 600,
                }}
              >
                {t.label}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: i === 0 ? 'var(--gold)' : 'var(--t2)',
                  fontWeight: i === 0 ? 700 : 400,
                }}
              >
                {t.count}回
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 先月との変化 */}
      <div
        className="slide-up-3"
        style={{
          padding: '12px 14px',
          background: 'var(--card-solid)',
          borderRadius: 'var(--r-input)',
          border: '1px solid var(--border)',
          marginBottom: 'var(--sp-4)',
        }}
      >
        <p
          style={{ fontSize: 12, fontWeight: 700, color: 'var(--rose)', marginBottom: 6 }}
        >
          📊 先月とくらべた変化
        </p>
        <p style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.9 }}>{trend.changeNote}</p>
      </div>

      {/* くり返しパターン (3 回以上のテーマがあるときだけ) */}
      {trend.repeatNote && (
        <div
          className="slide-up-4"
          style={{
            padding: '12px 14px',
            background: 'var(--card-solid)',
            borderRadius: 'var(--r-input)',
            borderLeft: '3px solid var(--lavender)',
            marginBottom: 'var(--sp-4)',
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
            🔁 くり返し現れるパターン
          </p>
          <p style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.9 }}>
            {trend.repeatNote}
          </p>
        </div>
      )}

      {/* 今月のあなたへの一言 */}
      <div
        className="slide-up-5"
        style={{
          padding: '14px 16px',
          background: 'var(--bg1)',
          borderRadius: 'var(--r-input)',
          borderLeft: '3px solid var(--rose)',
        }}
      >
        <p
          style={{ fontSize: 12, fontWeight: 700, color: 'var(--rose)', marginBottom: 6 }}
        >
          💬 今月のあなたへ
        </p>
        <p style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.9 }}>{trend.closing}</p>
      </div>
    </Card>
  );
}
