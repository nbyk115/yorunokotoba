import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { analyzeDream, type DreamResult } from '@/logic/dream';
import { SIGNS } from '@/data/signs';
import { saveArchiveEntry } from '@/lib/archive';
import { track } from '@/lib/analytics';
import type { UserProfile } from '@/lib/firestore';

interface DreamViewProps {
  profile: UserProfile;
}

const TONE_LABEL: Record<DreamResult['tone'], string> = {
  positive: '前向きな夢',
  negative: 'こころのサイン',
  neutral: '深層からのメッセージ',
};

export function DreamView({ profile }: DreamViewProps) {
  const [text, setText] = useState('');
  const [result, setResult] = useState<DreamResult | null>(null);
  const [loading, setLoading] = useState(false);

  const signIdx = SIGNS.findIndex((s) => s.k === profile.sign);

  async function handleAnalyze() {
    if (!text.trim()) return;
    track('dream_start', { length: text.length });
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const r = analyzeDream(text, signIdx);
    setResult(r);
    setLoading(false);
    track('dream_complete', { typeId: r.archive.typeId, theme: r.theme.key });
    saveArchiveEntry({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      text: text.slice(0, 200),
      timestamp: Date.now(),
      typeId: r.archive.typeId,
      themeKey: r.archive.themeKey,
      summary: r.archive.summary,
    });
  }

  function handleReset() {
    setText('');
    setResult(null);
  }

  return (
    <div style={{ padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      <header style={{ textAlign: 'center', marginBottom: 'var(--sp-3)' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--rose)', letterSpacing: 1 }}>
          🌙 夢占い
        </h2>
        <p style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4 }}>
          見た夢をそのまま書いてみて。深層心理のヒントが出てくるよ。
        </p>
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
          {/* Hero: theme + keyword headline (no character) */}
          <div
            className="slide-up"
            style={{
              borderRadius: 'var(--r-card)',
              overflow: 'hidden',
              background: result.theme.grad,
              color: '#fff',
              padding: 'var(--sp-6) var(--sp-5) var(--sp-5)',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            }}
          >
            <p style={{ fontSize: 12, fontWeight: 700, opacity: 0.85, letterSpacing: 1 }}>
              {result.theme.icon} {result.theme.label}
            </p>
            <div style={{ fontSize: 44, margin: '14px 0 8px' }}>{result.reading.emoji}</div>
            <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: 1 }}>
              {result.reading.headline}
            </h3>
            <p style={{ fontSize: 12, opacity: 0.92, marginTop: 8 }}>
              「{result.keyword}」の夢 ・ {TONE_LABEL[result.tone]}
            </p>
          </div>

          {/* 夢が伝えていること: detailed reading */}
          <Card className="slide-up-1">
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--lavender)', marginBottom: 10 }}>
              夢が伝えていること
            </h4>
            <p style={{ fontSize: 14, lineHeight: 2, color: 'var(--t1)' }}>
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
          <Card className="slide-up-2">
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--rose)', marginBottom: 10 }}>
              今日のメッセージ
            </h4>
            <p style={{ fontSize: 14, lineHeight: 2, color: 'var(--t1)' }}>
              {result.todayMessage}
            </p>
          </Card>

          <Button variant="secondary" onClick={handleReset} fullWidth>
            もう一度占う
          </Button>
        </>
      )}
    </div>
  );
}
