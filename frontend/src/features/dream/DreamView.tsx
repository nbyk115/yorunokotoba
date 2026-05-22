import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PremiumCard } from '@/components/PremiumCard';
import { DreamTrendCard } from '@/components/DreamTrendCard';
import { analyzeDream, type DreamResult } from '@/logic/dream';
import { SIGNS } from '@/data/signs';
import { saveArchiveEntry, loadArchive, clearArchive, type ArchiveEntry } from '@/lib/archive';
import { getDreamTypeById } from '@/data/dreamTypes';
import { track } from '@/lib/analytics';
import type { UserProfile } from '@/lib/firestore';
import type { ViewKey } from '@/App';
import { pushAppState } from '@/App';

// ---- カレンダー用ユーティリティ（ArchiveView から移植） ----

const themeLabels: Record<string, string> = {
  anx: '不安・解放',
  love: '恋愛・感情',
  free: '自由・飛翔',
  work: '成長・課題',
  mystery: '深層・謎',
};

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

function dayKey(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDayLabel(key: string): string {
  const [y, m, d] = key.split('-');
  return `${y}年${Number(m)}月${Number(d)}日`;
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

interface DreamViewProps {
  profile: UserProfile;
  onNavigate: (view: ViewKey) => void;
  /** result ステージへの戻りコールバックを App に登録する（null = 解除） */
  onRegisterHistoryBack?: (cb: (() => void) | null) => void;
}

export function DreamView({ profile, onNavigate, onRegisterHistoryBack }: DreamViewProps) {
  const [text, setText] = useState('');
  const [result, setResult] = useState<DreamResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // カレンダー状態
  const [entries, setEntries] = useState<ArchiveEntry[]>(() => loadArchive());
  const [cursor, setCursor] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const signIdx = SIGNS.findIndex((s) => s.k === profile.sign);

  // カレンダー計算
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
  const month = cursor.getMonth();

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

  // result ステージに入ったら pushState + 戻りコールバックを登録
  useEffect(() => {
    if (result) {
      pushAppState('dream', 'result');
      onRegisterHistoryBack?.(() => handleReset());
    } else {
      onRegisterHistoryBack?.(null);
    }
    // handleReset は関数参照が安定しているので依存に含めない（再登録不要）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  async function handleAnalyze() {
    if (!text.trim()) return;
    track('dream_start', { length: text.length });
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const r = analyzeDream(text, signIdx);
    setResult(r);
    setLoading(false);
    track('dream_complete', { typeId: r.archive.typeId, theme: r.theme.key });
  }

  function handleSaveLog() {
    if (saved || !result) return;
    saveArchiveEntry({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      text: text.slice(0, 200),
      timestamp: Date.now(),
      typeId: result.archive.typeId,
      themeKey: result.archive.themeKey,
      summary: result.archive.summary,
    });
    setSaved(true);
    setEntries(loadArchive());
  }

  function handleReset() {
    setText('');
    setResult(null);
    setSaved(false);
  }

  return (
    <div style={{ padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      <header style={{ textAlign: 'center', marginBottom: 'var(--sp-3)' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--rose)', letterSpacing: 1 }}>
          夢占い
        </h2>
        {!result && (
          <p style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4 }}>
            見た夢をそのまま書いてみて。その夢が伝えているメッセージを読み解くよ。
          </p>
        )}
      </header>

      {!result && (
        <Card className="slide-up">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="例: 蛇が出てきて、追いかけられてた。逃げ切れなくて..."
            rows={6}
            disabled={loading}
            style={{
              width: '100%',
              padding: 'var(--sp-4)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-input)',
              background: 'var(--bg1)',
              color: 'var(--t1)',
              fontFamily: 'var(--font-heading)',
              fontSize: 14,
              lineHeight: 1.8,
              resize: 'vertical',
              minHeight: 120,
            }}
          />
          <div style={{ marginTop: 'var(--sp-4)' }}>
            <Button onClick={handleAnalyze} fullWidth disabled={!text.trim() || loading}>
              {loading ? '読み取ってるよ…' : '夢を読み解く'}
            </Button>
          </div>
        </Card>
      )}

      {result && (
        <>
          {/* 夢が伝えていること: detailed reading */}
          <Card className="slide-up">
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--lavender)', marginBottom: 10 }}>
              夢が伝えていること
            </h4>
            <p style={{ fontSize: 14, lineHeight: 2, color: 'var(--t1)', whiteSpace: 'pre-line' }}>
              {result.reading.body}
            </p>

            {result.reading.advice && (
              <div
                style={{
                  marginTop: 'var(--sp-4)',
                  padding: '14px 16px',
                  background: 'var(--bg1)',
                  borderRadius: 'var(--r-input)',
                  borderLeft: '3px solid var(--rose)',
                }}
              >
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--rose)', marginBottom: 6 }}>
                  💡 対策とアドバイス
                </p>
                <p style={{ fontSize: 13, lineHeight: 1.9, color: 'var(--t2)' }}>
                  {result.reading.advice}
                </p>
              </div>
            )}
          </Card>

          {/* 今日のメッセージ: prose, not a bullet list */}
          <Card className="slide-up-1">
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--rose)', marginBottom: 10 }}>
              今日のメッセージ
            </h4>
            <p style={{ fontSize: 14, lineHeight: 2, color: 'var(--t1)', whiteSpace: 'pre-line' }}>
              {result.todayMessage}
            </p>
          </Card>

          {/* Save to archive: only persists when the user taps. */}
          <Card className="slide-up-2">
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--rose)', marginBottom: 8 }}>
              📖 ログに残す
            </h4>
            <p
              style={{
                fontSize: 12,
                lineHeight: 1.9,
                color: 'var(--t2)',
                marginBottom: 'var(--sp-4)',
              }}
            >
              この夢の記録を残しておくと、あとから読み返せるよ。
            </p>
            <Button fullWidth onClick={handleSaveLog} disabled={saved}>
              {saved ? '✓ ログに保存したよ' : 'ログに残す'}
            </Button>
          </Card>

          <PremiumCard onNavigate={onNavigate} />

          <Button variant="secondary" onClick={handleReset} fullWidth>
            もう一度占う
          </Button>
        </>
      )}

      {/* 夢診断カレンダー（入力/結果の下に常時表示） */}
      <section aria-label="夢診断カレンダー">
        <header style={{ textAlign: 'center', margin: 'var(--sp-3) 0' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--rose)' }}>📅 夢診断カレンダー</h3>
          <p style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4 }}>
            夢を記録した日をふり返れるよ（{entries.length}件）
          </p>
        </header>

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
          <div className="slide-up" style={{ marginTop: 'var(--sp-4)' }}>
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

        {/* 月ごとの夢の傾向分析（機能①・プレビュー公開中） */}
        <div style={{ marginTop: 'var(--sp-4)' }}>
          <DreamTrendCard entries={entries} />
        </div>

        {entries.length === 0 ? (
          <Card style={{ marginTop: 'var(--sp-4)' }}>
            <p style={{ fontSize: 14, color: 'var(--t2)', textAlign: 'center', padding: 'var(--sp-5)' }}>
              まだ記録がないよ。夢占いをすると、この日にマークがつくよ。
            </p>
          </Card>
        ) : (
          <Button
            variant="ghost"
            fullWidth
            style={{ marginTop: 'var(--sp-4)' }}
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
      </section>
    </div>
  );
}
