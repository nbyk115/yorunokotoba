import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { loadArchive, clearArchive, type ArchiveEntry } from '@/lib/archive';
import { getDreamTypeById } from '@/data/dreamTypes';

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
