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

export function DreamView({ profile }: DreamViewProps) {
  const [text, setText] = useState('');
  const [result, setResult] = useState<DreamResult | null>(null);
  const [loading, setLoading] = useState(false);

  const signIdx = SIGNS.findIndex((s) => s.k === profile.sign);

  async function handleAnalyze() {
    if (!text.trim()) return;
    track('dream_start', { length: text.length });
    setLoading(true);
    // small delay so users feel the "analysis"
    await new Promise((r) => setTimeout(r, 400));
    const r = analyzeDream(text, signIdx);
    setResult(r);
    setLoading(false);
    track('dream_complete', { typeId: r.type.id, theme: r.theme.key });
    saveArchiveEntry({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      text: text.slice(0, 200),
      timestamp: Date.now(),
      typeId: r.type.id,
      themeKey: r.theme.key,
      summary: r.symbols
        .slice(0, 2)
        .map((s) => s.word)
        .join('・'),
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
        <Card>
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
          <Card style={{ background: result.theme.grad, color: '#fff' }}>
            <p style={{ fontSize: 13, fontWeight: 700, opacity: 0.85 }}>
              {result.theme.icon} {result.theme.label}
            </p>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 8, lineHeight: 1.6 }}>
              {result.type.name}
            </h3>
            <p style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>{result.type.sub}</p>
          </Card>

          <Card>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--lavender)', marginBottom: 10 }}>
              夢が伝えていること
            </h4>
            <p style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--t1)' }}>{result.mainReading.intro}</p>
            <p style={{ fontSize: 13, lineHeight: 1.9, color: 'var(--t2)', marginTop: 'var(--sp-4)', whiteSpace: 'pre-line' }}>
              {result.mainReading.deep}
            </p>
          </Card>

          {result.symbols.length > 0 && (
            <Card>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--lavender)', marginBottom: 12 }}>
                シンボル
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {result.symbols.map((s) => (
                  <div
                    key={s.word}
                    style={{
                      padding: '12px 14px',
                      background: 'var(--bg1)',
                      borderRadius: 'var(--r-input)',
                      borderLeft: '3px solid var(--rose)',
                    }}
                  >
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--rose)' }}>
                      {s.word} — {s.meaning}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4, lineHeight: 1.7 }}>
                      {s.detail}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--rose)', marginBottom: 10 }}>
              今日のメッセージ
            </h4>
            <p style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--t1)' }}>{result.todayMessage}</p>

            <div style={{ marginTop: 'var(--sp-4)' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 6 }}>
                今日やるといいこと
              </p>
              <ul style={{ paddingLeft: 20, fontSize: 13, color: 'var(--t1)', lineHeight: 1.8 }}>
                {result.actions.should.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>

            <div style={{ marginTop: 'var(--sp-4)' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 6 }}>
                今日避けたいこと
              </p>
              <ul style={{ paddingLeft: 20, fontSize: 13, color: 'var(--t1)', lineHeight: 1.8 }}>
                {result.actions.avoid.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          </Card>

          <Card>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold)', marginBottom: 10 }}>
              ラッキー3点
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontSize: 13, color: 'var(--t1)' }}>
                <strong style={{ color: result.lucky.color.hex }}>🎨 {result.lucky.color.v}</strong>
                <span style={{ color: 'var(--t2)', marginLeft: 8 }}>{result.lucky.color.reason}</span>
              </p>
              <p style={{ fontSize: 13, color: 'var(--t1)' }}>
                <strong>
                  {result.lucky.item.e} {result.lucky.item.v}
                </strong>
                <span style={{ color: 'var(--t2)', marginLeft: 8 }}>{result.lucky.item.reason}</span>
              </p>
              <p style={{ fontSize: 13, color: 'var(--t1)' }}>
                <strong>🔢 ナンバー {result.lucky.num.v}</strong>
                <span style={{ color: 'var(--t2)', marginLeft: 8 }}>{result.lucky.num.reason}</span>
              </p>
            </div>
          </Card>

          <Button variant="secondary" onClick={handleReset} fullWidth>
            もう一度占う
          </Button>
        </>
      )}
    </div>
  );
}
