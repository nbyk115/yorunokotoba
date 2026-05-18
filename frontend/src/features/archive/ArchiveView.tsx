import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { loadArchive, clearArchive, type ArchiveEntry } from '@/lib/archive';
import { getDreamTypeById } from '@/data/dreamTypes';
import { track } from '@/lib/analytics';

const themeLabels: Record<string, string> = {
  anx: '不安・解放',
  love: '恋愛・感情',
  free: '自由・飛翔',
  work: '成長・課題',
  mystery: '深層・謎',
};

export function ArchiveView() {
  const [entries, setEntries] = useState<ArchiveEntry[]>(() => loadArchive());
  const grouped = useMemo(() => {
    const byDay = new Map<string, ArchiveEntry[]>();
    for (const e of entries) {
      const day = new Date(e.timestamp).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const arr = byDay.get(day) ?? [];
      arr.push(e);
      byDay.set(day, arr);
    }
    return Array.from(byDay.entries());
  }, [entries]);

  return (
    <div style={{ padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      <header style={{ textAlign: 'center', marginBottom: 'var(--sp-3)' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--rose)' }}>📖 履歴</h2>
        <p style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4 }}>
          これまでの夢診断の記録（{entries.length}件）
        </p>
      </header>

      {/* Premium: monthly trend analysis (locked placeholder) */}
      <MonthlyTrendPremiumCard />

      {entries.length === 0 ? (
        <Card>
          <p style={{ fontSize: 14, color: 'var(--t2)', textAlign: 'center', padding: 'var(--sp-5)' }}>
            まだ履歴がないよ。夢占いをしてみて。
          </p>
        </Card>
      ) : (
        <>
          {grouped.map(([day, list]) => (
            <div key={day}>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--t3)',
                  marginBottom: 8,
                  letterSpacing: 1,
                }}
              >
                {day}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {list.map((e) => {
                  const type = getDreamTypeById(e.typeId);
                  return (
                    <Card key={e.id} style={{ padding: 'var(--sp-4)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>
                          {type?.name ?? '夢診断'}
                        </p>
                        <p style={{ fontSize: 10, color: 'var(--t3)' }}>
                          {themeLabels[e.themeKey] ?? e.themeKey}
                        </p>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--t2)', marginTop: 6, lineHeight: 1.7 }}>
                        シンボル: {e.summary}
                      </p>
                      <p
                        style={{
                          fontSize: 11,
                          color: 'var(--t3)',
                          marginTop: 4,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {e.text}
                      </p>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}

          <Button
            variant="ghost"
            fullWidth
            onClick={() => {
              if (window.confirm('履歴を全部削除するよ。いい？')) {
                clearArchive();
                setEntries([]);
              }
            }}
          >
            履歴を全て削除
          </Button>
        </>
      )}
    </div>
  );
}

/**
 * Monthly trend analysis is a premium feature.
 * This branch has no payment system, so this renders a locked
 * teaser placeholder that previews what premium unlocks.
 */
function MonthlyTrendPremiumCard() {
  const teasers = [
    '🌙 今月いちばん多く見た夢のテーマ',
    '📈 先月とくらべた心の動きの変化',
    '🔁 くり返し現れるパターンとそのメッセージ',
  ];
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
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>月ごとの傾向分析</h3>
      </div>
      <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.8, marginBottom: 'var(--sp-4)' }}>
        ためた夢の記録から、月ごとの心の傾向やくり返すパターンを読み解くプレミアム機能。あなただけの深いリーディングが見られるよ。
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 'var(--sp-4)' }}>
        {teasers.map((t) => (
          <div
            key={t}
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
              {t}
            </p>
            <span style={{ fontSize: 12 }}>🔒</span>
          </div>
        ))}
      </div>

      <Button
        variant="secondary"
        fullWidth
        onClick={() => track('teaser_cta_tap', { feature: 'monthly_trend' })}
      >
        ✨ プレミアムで解放する
      </Button>
      <p style={{ fontSize: 10, color: 'var(--t3)', textAlign: 'center', marginTop: 8 }}>
        プレミアムは近日提供予定です
      </p>
    </Card>
  );
}
