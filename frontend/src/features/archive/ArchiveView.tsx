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

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

/** ローカル日付を YYYY-MM-DD のキーにする（タイムゾーン安全）。 */
function dayKey(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * 夢診断カレンダー。
 * 月めくりカレンダーで夢診断を記録した日にマークを表示し、
 * 日付タップでその日の過去ログを振り返れる（無料機能）。
 * プレミアムの傾向分析カードも同居する。
 */
export function ArchiveView() {
  const [entries, setEntries] = useState<ArchiveEntry[]>(() => loadArchive());
  // 表示中の月（その月の1日を保持）
  const [cursor, setCursor] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  // 選択中の日付キー（null = 未選択）
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // 日付キー -> その日のログ一覧
  const entriesByDay = useMemo(() => {
    const map = new Map<string, ArchiveEntry[]>();
    for (const e of entries) {
      const k = dayKey(e.timestamp);
      const arr = map.get(k) ?? [];
      arr.push(e);
      map.set(k, arr);
    }
    return map;
  }, [entries]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth(); // 0-indexed

  // カレンダーのセル配列（先頭の空白セル + 各日）
  const cells = useMemo(() => {
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const list: Array<number | null> = [];
    for (let i = 0; i < firstWeekday; i++) list.push(null);
    for (let d = 1; d <= daysInMonth; d++) list.push(d);
    return list;
  }, [year, month]);

  function shiftMonth(delta: number) {
    setCursor(new Date(year, month + delta, 1));
    setSelectedDay(null);
  }

  const todayKey = dayKey(Date.now());
  const selectedEntries = selectedDay ? (entriesByDay.get(selectedDay) ?? []) : [];

  return (
    <div style={{ padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      <header style={{ textAlign: 'center', marginBottom: 'var(--sp-3)' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--rose)' }}>📅 夢診断カレンダー</h2>
        <p style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4 }}>
          夢を記録した日をふり返れるよ（{entries.length}件）
        </p>
      </header>

      {/* カレンダー本体 */}
      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--sp-4)',
          }}
        >
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            aria-label="前の月"
            style={navBtnStyle}
          >
            ‹
          </button>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>
            {year}年 {month + 1}月
          </p>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            aria-label="次の月"
            style={navBtnStyle}
          >
            ›
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              style={{
                textAlign: 'center',
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--t3)',
                paddingBottom: 4,
              }}
            >
              {w}
            </div>
          ))}

          {cells.map((d, i) => {
            if (d === null) return <div key={`empty-${i}`} />;
            const k = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayEntries = entriesByDay.get(k);
            const hasLog = Boolean(dayEntries && dayEntries.length > 0);
            const isToday = k === todayKey;
            const isSelected = k === selectedDay;
            return (
              <button
                key={k}
                type="button"
                onClick={() => {
                  if (!hasLog) return;
                  setSelectedDay(isSelected ? null : k);
                }}
                aria-label={`${month + 1}月${d}日${hasLog ? ` 夢診断 ${dayEntries!.length}件` : ''}`}
                aria-pressed={isSelected}
                disabled={!hasLog}
                style={{
                  position: 'relative',
                  aspectRatio: '1 / 1',
                  borderRadius: 'var(--r-input)',
                  border: isSelected ? '1px solid var(--rose)' : '1px solid transparent',
                  background: isSelected
                    ? 'rgba(232, 98, 124, 0.10)'
                    : hasLog
                      ? 'var(--bg1)'
                      : 'transparent',
                  color: hasLog ? 'var(--t1)' : 'var(--t3)',
                  fontSize: 12,
                  fontWeight: isToday ? 700 : 500,
                  cursor: hasLog ? 'pointer' : 'default',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                <span
                  style={{
                    textDecoration: isToday ? 'underline' : 'none',
                    textUnderlineOffset: 3,
                  }}
                >
                  {d}
                </span>
                {hasLog && (
                  <span
                    aria-hidden="true"
                    style={{
                      marginTop: 2,
                      fontSize: 8,
                      color: 'var(--rose)',
                      lineHeight: 1,
                    }}
                  >
                    {dayEntries!.length > 1 ? `🌙×${dayEntries!.length}` : '🌙'}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <p style={{ fontSize: 10, color: 'var(--t3)', textAlign: 'center', marginTop: 'var(--sp-4)' }}>
          🌙 のついた日をタップすると、その日の夢診断を見られるよ
        </p>
      </Card>

      {/* 選択日のログ詳細 */}
      {selectedDay && (
        <div className="slide-up">
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--t3)',
              marginBottom: 8,
              letterSpacing: 1,
            }}
          >
            {formatDayLabel(selectedDay)} の夢診断
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {selectedEntries
              .slice()
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((e) => {
                const type = getDreamTypeById(e.typeId);
                return (
                  <Card key={e.id} style={{ padding: 'var(--sp-4)' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                      }}
                    >
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
                        lineHeight: 1.7,
                      }}
                    >
                      {e.text}
                    </p>
                  </Card>
                );
              })}
          </div>
        </div>
      )}

      {/* プレミアム傾向分析（ログがたまるほど深くなる） */}
      <MonthlyTrendPremiumCard logCount={entries.length} />

      {entries.length === 0 ? (
        <Card>
          <p style={{ fontSize: 14, color: 'var(--t2)', textAlign: 'center', padding: 'var(--sp-5)' }}>
            まだ記録がないよ。夢占いをすると、この日にマークがつくよ。
          </p>
        </Card>
      ) : (
        <Button
          variant="ghost"
          fullWidth
          onClick={() => {
            if (window.confirm('夢診断の記録を全部削除するよ。いい？')) {
              clearArchive();
              setEntries([]);
              setSelectedDay(null);
            }
          }}
        >
          記録を全て削除
        </Button>
      )}
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  minWidth: 36,
  minHeight: 36,
  borderRadius: '50%',
  border: '1px solid var(--border)',
  background: 'var(--card-solid)',
  color: 'var(--rose)',
  fontSize: 18,
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--font-heading)',
};

/** YYYY-MM-DD を「YYYY年M月D日」に整形する。 */
function formatDayLabel(key: string): string {
  const [y, m, d] = key.split('-');
  return `${y}年${Number(m)}月${Number(d)}日`;
}

/**
 * 傾向分析はプレミアム機能。
 * このブランチには課金システムがないため、プレミアムで何が
 * 解放されるかを見せるロックされたティザーを表示する。
 * 夢ログの件数を受け取り、ためるほど分析が深くなることを訴求する。
 */
function MonthlyTrendPremiumCard({ logCount }: { logCount: number }) {
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
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>夢ログの傾向分析</h3>
      </div>
      <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.8, marginBottom: 'var(--sp-4)' }}>
        カレンダーにためた夢の記録から、月ごとの心のテーマやくり返すパターンを読み解くプレミアム機能。記録がたまるほど、あなただけの深いリーディングが見られるよ。
      </p>

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
        <p style={{ flex: 1, fontSize: 11, color: 'var(--t2)', lineHeight: 1.6 }}>
          いまの記録: {logCount}件
          {logCount > 0 ? '。ためるほど分析が深くなるよ' : '。まず夢占いをしてみてね'}
        </p>
      </div>

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
