import { Card } from '@/components/ui/Card';
import { analyzeDreamTrends } from '@/logic/dreamTrends';
import type { ArchiveEntry } from '@/lib/archive';

interface DreamTrendCardProps {
  /** 夢ログ全件 (loadArchive の戻り値)。 */
  entries: readonly ArchiveEntry[];
  /** 集計の基準月。テスト用に差し替え可能。既定は現在時刻。 */
  now?: Date;
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
 * 月ごとの夢の傾向分析 (機能①) の表示。
 * DreamView のカレンダー部にあった PremiumFeatureCard (ティザーロック) を
 * 置き換える、実際の分析カード。当月 3 件未満は進捗表示で空振りを避ける。
 */
export function DreamTrendCard({ entries, now }: DreamTrendCardProps) {
  const trend = analyzeDreamTrends(entries, now);

  // 3 件未満: 進捗を出す (ロックではなく「あと○件」)。
  if (!trend.ready) {
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
            marginBottom: 8,
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>
            <span style={{ marginRight: 6 }}>📈</span>
            月ごとの夢の傾向分析
          </h3>
          <PreviewBadge />
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
          <span style={{ marginRight: 6 }}>📈</span>
          {trend.month + 1}月の夢の傾向
        </h3>
        <PreviewBadge />
      </div>
      <p style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 'var(--sp-4)' }}>
        今月 {trend.monthCount} 件の記録から読み解いたよ
      </p>

      {/* 頻出テーマ Top3 */}
      <div style={{ marginBottom: 'var(--sp-4)' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--lavender)', marginBottom: 8 }}>
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
                background: 'var(--card-solid)',
                border: '1px solid var(--border)',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', minWidth: 16 }}>
                {i + 1}
              </span>
              <span style={{ fontSize: 14 }}>{t.icon}</span>
              <span style={{ flex: 1, fontSize: 13, color: 'var(--t1)', fontWeight: 700 }}>
                {t.label}
              </span>
              <span style={{ fontSize: 12, color: 'var(--t2)' }}>{t.count}回</span>
            </div>
          ))}
        </div>
      </div>

      {/* 先月との変化 */}
      <div
        style={{
          padding: '12px 14px',
          background: 'var(--card-solid)',
          borderRadius: 'var(--r-input)',
          border: '1px solid var(--border)',
          marginBottom: 'var(--sp-4)',
        }}
      >
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--rose)', marginBottom: 6 }}>
          📊 先月とくらべた変化
        </p>
        <p style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.9 }}>{trend.changeNote}</p>
      </div>

      {/* くり返しパターン (3 回以上のテーマがあるときだけ) */}
      {trend.repeatNote && (
        <div
          style={{
            padding: '12px 14px',
            background: 'var(--card-solid)',
            borderRadius: 'var(--r-input)',
            borderLeft: '3px solid var(--lavender)',
            marginBottom: 'var(--sp-4)',
          }}
        >
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--lavender)', marginBottom: 6 }}>
            🔁 くり返し現れるパターン
          </p>
          <p style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.9 }}>{trend.repeatNote}</p>
        </div>
      )}

      {/* 今月のあなたへの一言 */}
      <div
        style={{
          padding: '14px 16px',
          background: 'var(--bg1)',
          borderRadius: 'var(--r-input)',
          borderLeft: '3px solid var(--rose)',
        }}
      >
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--rose)', marginBottom: 6 }}>
          💬 今月のあなたへ
        </p>
        <p style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.9 }}>{trend.closing}</p>
      </div>
    </Card>
  );
}
