import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PremiumCard } from '@/components/PremiumCard';
import { answerMidnight, type MidnightResponse } from '@/logic/midnight';
import {
  loadTodayEntry,
  saveTodayEntry,
  loadHistory,
  todayKeyJst,
  type MidnightEntry,
} from '@/lib/midnightStore';
import { track } from '@/lib/analytics';
import type { UserProfile } from '@/lib/firestore';
import type { ViewKey } from '@/App';
import { pushAppState } from '@/App';

interface MidnightViewProps {
  profile: UserProfile;
  onNavigate: (view: ViewKey) => void;
  /** result ステージへの戻りコールバックを App に登録する（null = 解除） */
  onRegisterHistoryBack?: (cb: (() => void) | null) => void;
}

const toneLabels: Record<MidnightResponse['meta']['tone'], string> = {
  forward: '前向き',
  tangle: 'モヤモヤ',
  calm: '凪',
};

function formatHistoryDate(dayKey: string): string {
  const [y, m, d] = dayKey.split('-');
  return `${y}年${Number(m)}月${Number(d)}日`;
}

export function MidnightView({ profile, onNavigate, onRegisterHistoryBack }: MidnightViewProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  // 当日すでに問うていれば、その応答を初期表示にする（1 日 1 問）。
  const [entry, setEntry] = useState<MidnightEntry | null>(() => loadTodayEntry());
  const [history, setHistory] = useState<MidnightEntry[]>(() => loadHistory());

  const askedToday = entry !== null && entry.dayKey === todayKeyJst();

  // result ステージ（応答表示中）に入ったら pushState + 戻りコールバックを登録。
  // 当日回答済みで開いた場合も「結果がある状態」なので登録する。
  useEffect(() => {
    if (entry) {
      pushAppState('midnight', 'result');
      onRegisterHistoryBack?.(() => handleBackToInput());
    } else {
      onRegisterHistoryBack?.(null);
    }
    // handleBackToInput は参照が安定しているので依存に含めない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry]);

  async function handleAsk() {
    if (!text.trim() || askedToday) return;
    track('dream_start', { feature: 'midnight', length: text.length });
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const response = answerMidnight(text, profile);
    const newEntry: MidnightEntry = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      dayKey: todayKeyJst(),
      timestamp: Date.now(),
      question: text.slice(0, 200),
      response,
    };
    saveTodayEntry(newEntry);
    setEntry(newEntry);
    setHistory(loadHistory());
    setLoading(false);
    track('dream_complete', {
      feature: 'midnight',
      tone: response.meta.tone,
      category: response.meta.category,
      timeBand: response.meta.timeBand,
    });
  }

  // 入力画面に戻る（戻る操作の着地点）。当日回答済みでも入力欄は再表示しない。
  function handleBackToInput() {
    setEntry(null);
    setText('');
  }

  return (
    <div style={{ padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      <header style={{ textAlign: 'center', marginBottom: 'var(--sp-3)' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--rose)', letterSpacing: 1 }}>
          🌙 深夜の問いかけ
        </h2>
        <p style={{ fontSize: 11, color: 'var(--lavender)', marginTop: 4 }}>
          プレミアム機能（プレビュー公開中）
        </p>
        {!entry && (
          <p style={{ fontSize: 12, color: 'var(--t2)', marginTop: 6, lineHeight: 1.8 }}>
            今夜のモヤモヤを、ひとつだけ書いてみて。1日1問、その夜のあなたに言葉を返すよ。
          </p>
        )}
      </header>

      {/* 入力（当日まだ問うていない時だけ表示） */}
      {!entry && (
        <Card className="slide-up">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="例: 明日の会議のことを考えると、なんだか胸がざわざわして眠れない…"
            rows={5}
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
              minHeight: 110,
            }}
          />
          <div style={{ marginTop: 'var(--sp-4)' }}>
            <Button onClick={handleAsk} fullWidth disabled={!text.trim() || loading}>
              {loading ? '言葉を探してるよ…' : '今夜の問いを送る'}
            </Button>
          </div>
          <p style={{ fontSize: 10, color: 'var(--t3)', textAlign: 'center', marginTop: 'var(--sp-3)', lineHeight: 1.7 }}>
            問いかけは1日にひとつ。今夜のぶんは、今夜のうちに。
          </p>
        </Card>
      )}

      {/* 応答 */}
      {entry && (
        <>
          {askedToday && (
            <Card
              className="slide-up"
              style={{
                background: 'linear-gradient(135deg, rgba(176, 138, 207, 0.10), rgba(232, 98, 124, 0.08))',
              }}
            >
              <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.8 }}>
                今夜の問いは、もう聞いたよ。また明日、聞かせてね。🌙
              </p>
            </Card>
          )}

          {/* あなたが書いたモヤモヤ */}
          <Card className="slide-up-1" style={{ background: 'var(--bg1)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', marginBottom: 6, letterSpacing: 1 }}>
              今夜のあなたの言葉
            </p>
            <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.9 }}>
              {entry.question}
            </p>
          </Card>

          {/* 姉貴分からの応答 */}
          <Card className="slide-up-2">
            <p style={{ fontSize: 15, lineHeight: 2, color: 'var(--t1)', marginBottom: 'var(--sp-4)' }}>
              {entry.response.opener}
            </p>
            <p style={{ fontSize: 14, lineHeight: 2, color: 'var(--t1)' }}>
              {entry.response.body}
            </p>

            <div
              style={{
                marginTop: 'var(--sp-4)',
                padding: '12px 14px',
                background: 'var(--bg1)',
                borderRadius: 'var(--r-input)',
                borderLeft: '3px solid var(--lavender)',
              }}
            >
              <p style={{ fontSize: 13, lineHeight: 1.9, color: 'var(--t2)' }}>
                {entry.response.starNote}
              </p>
            </div>
          </Card>

          {/* 今夜できる、いちばん小さなひとつ */}
          <Card className="slide-up-3">
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--rose)', marginBottom: 10 }}>
              今夜のひとつ
            </h4>
            <p style={{ fontSize: 14, lineHeight: 2, color: 'var(--t1)' }}>
              {entry.response.nudge}
            </p>
          </Card>

          <PremiumCard onNavigate={onNavigate} />

          <Button variant="secondary" onClick={() => onNavigate('home')} fullWidth>
            ホームに戻る
          </Button>
        </>
      )}

      {/* これまでの問いかけ（履歴） */}
      {history.length > 0 && (
        <section aria-label="これまでの問いかけ" style={{ marginTop: 'var(--sp-3)' }}>
          <header style={{ textAlign: 'center', margin: 'var(--sp-3) 0' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--rose)' }}>
              🕯️ これまでの夜
            </h3>
            <p style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4 }}>
              あなたが問いかけた夜をふり返れるよ（{history.length}件）
            </p>
          </header>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {history.map((h) => (
              <Card key={h.id} style={{ padding: 'var(--sp-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)' }}>
                    {formatHistoryDate(h.dayKey)}
                  </p>
                  <p style={{ fontSize: 10, color: 'var(--lavender)' }}>
                    {toneLabels[h.response.meta.tone]}
                  </p>
                </div>
                <p style={{ fontSize: 12, color: 'var(--t2)', marginTop: 6, lineHeight: 1.7 }}>
                  {h.question}
                </p>
                <p style={{ fontSize: 11, color: 'var(--t3)', marginTop: 6, lineHeight: 1.7 }}>
                  {h.response.nudge}
                </p>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
