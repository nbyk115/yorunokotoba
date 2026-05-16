import { useState, useCallback } from 'react';
import { DreamThemeIcon } from '@/components/ui/DreamThemeIcon';
import { Button } from '@/components/ui/Button';
import { RitualButton } from '@/components/ui/RitualButton';
import { ShareCard } from '@/components/ui/ShareCard';
import { analyzeDream, type DreamResult } from '@/logic/dream';
import { SIGNS } from '@/data/signs';
import { saveArchiveEntry } from '@/lib/archive';
import { track } from '@/lib/analytics';
import type { UserProfile } from '@/lib/firestore';

interface DreamViewProps {
  profile: UserProfile;
}

/* --- 解析フェーズテキスト（3秒 / 3段階） --- */
const RITUAL_PHASES = ['夢を、読んでいる', 'シンボルをよみとく', '見えてきた'];

/* --- 月SVG（stroke-dasharray アニメーション） --- */
function RitualMoonSvg({ progress }: { progress: number }) {
  const CIRCUMFERENCE = 2 * Math.PI * 40; // approx 251
  const offset = CIRCUMFERENCE * (1 - progress);
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <defs>
        <clipPath id="crescent-clip">
          <path d="M40,0 A40,40 0 1,1 40,80 A28,28 0 1,0 40,0 Z" />
        </clipPath>
      </defs>
      <circle
        cx="40"
        cy="40"
        r="40"
        fill="rgba(212,168,83,0.08)"
        stroke="none"
        clipPath="url(#crescent-clip)"
      />
      <circle
        cx="40"
        cy="40"
        r="40"
        fill="none"
        stroke="var(--gold, #D4A853)"
        strokeWidth="1.5"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        strokeLinecap="round"
        clipPath="url(#crescent-clip)"
        style={{ transition: 'stroke-dashoffset 2000ms linear' }}
      />
    </svg>
  );
}

export function DreamView({ profile }: DreamViewProps) {
  const [text, setText] = useState('');
  const [result, setResult] = useState<DreamResult | null>(null);
  const [loading, setLoading] = useState(false);

  /* 解析オーバーレイ用 */
  const [ritualPhaseIdx, setRitualPhaseIdx] = useState(0);
  const [phaseVisible, setPhaseVisible] = useState(true);
  const [moonProgress, setMoonProgress] = useState(0);

  /* シェアシート表示フラグ */
  const [showShare, setShowShare] = useState(false);

  const signIdx = SIGNS.findIndex((s) => s.k === profile.sign);

  /* --- ロジック（既存流用） --- */
  const handleConfirm = useCallback(async () => {
    if (!text.trim()) return;
    track('dream_start', { length: text.length });
    setLoading(true);
    setRitualPhaseIdx(0);
    setPhaseVisible(true);
    setMoonProgress(0);

    requestAnimationFrame(() => setMoonProgress(1));

    const PHASE_INTERVAL = 1000;
    let idx = 0;
    const phaseTimer = setInterval(() => {
      idx += 1;
      if (idx >= RITUAL_PHASES.length) {
        clearInterval(phaseTimer);
        return;
      }
      setPhaseVisible(false);
      setTimeout(() => {
        setRitualPhaseIdx(idx);
        setPhaseVisible(true);
      }, 150);
    }, PHASE_INTERVAL);

    await new Promise((r) => setTimeout(r, 3000));
    clearInterval(phaseTimer);

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
      summary: r.symbols.slice(0, 2).map((s) => s.word).join('・'),
    });
  }, [text, signIdx]);

  function handleReset() {
    setText('');
    setResult(null);
    setShowShare(false);
    setMoonProgress(0);
  }

  return (
    <div style={{ paddingBottom: 32 }}>

      {/* ======================================================
          入力フェーズ
      ====================================================== */}
      {!result && (
        <>
          {/* ritual-header */}
          <div
            style={{
              padding: '48px 24px 24px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--fs-caption)',
                fontWeight: 700,
                color: 'var(--lavender)',
                letterSpacing: '0.1em',
                marginBottom: 12,
              }}
            >
              夢占い
            </p>
            <h2
              style={{
                fontSize: 'var(--fs-h1)',
                fontWeight: 700,
                color: 'var(--t1)',
                letterSpacing: '0.04em',
                lineHeight: 1.3,
                marginBottom: 8,
              }}
            >
              今夜の夢を書いて
            </h2>
            <p
              style={{
                fontSize: 'var(--fs-caption)',
                color: 'var(--t2)',
                lineHeight: 1.8,
              }}
            >
              見た夢をそのまま書いて。深層心理のヒントが出てくるよ。
            </p>
          </div>

          {/* textarea-card */}
          <div
            style={{
              margin: '0 16px 16px',
              padding: 24,
              background: 'var(--card-primary)',
              backdropFilter: 'blur(20px)',
              borderRadius: 18,
              border: '1px solid var(--border-primary)',
              boxShadow: 'var(--shadow-card-primary)',
            }}
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 500))}
              placeholder="空を飛んでいた…とか、知らない街にいた…とか"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                border: 'none',
                background: 'transparent',
                color: 'var(--t1)',
                caretColor: 'var(--rose)',
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--fs-body)',
                lineHeight: 1.9,
                resize: 'none',
                minHeight: 'clamp(120px, 28vw, 200px)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <div
              style={{
                textAlign: 'right',
                fontSize: 'var(--fs-micro)',
                color: 'var(--t3)',
                marginTop: 8,
              }}
            >
              {text.length} / 500
            </div>

            <div style={{ marginTop: 16 }}>
              <RitualButton
                verb="夢をよみとく"
                onConfirm={handleConfirm}
                disabled={!text.trim() || loading}
                fullWidth
              />
            </div>
          </div>

          {/* 期待値コピー */}
          <div
            style={{
              padding: '8px 32px 24px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: 'var(--fs-caption)',
                color: 'var(--t3)',
                lineHeight: 1.7,
                margin: 0,
                letterSpacing: '0.04em',
              }}
            >
              書いたら、あなたへのメッセージが出てくるよ
            </p>
          </div>

          <style>{`
            textarea::placeholder {
              color: rgba(240, 232, 236, 0.40);
            }
          `}</style>
        </>
      )}

      {/* ======================================================
          解析オーバーレイ（loading === true 時）
      ====================================================== */}
      {loading && (
        <div
          role="status"
          aria-live="polite"
          aria-label={RITUAL_PHASES[ritualPhaseIdx]}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            background: 'rgba(10, 8, 16, 0.92)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
            animation: 'ritualFadeIn 300ms ease',
          }}
        >
          <RitualMoonSvg progress={moonProgress} />
          <p
            key={ritualPhaseIdx}
            style={{
              fontFamily: 'var(--font-accent)',
              fontSize: 'var(--fs-h1)',
              fontStyle: 'italic',
              color: 'rgba(240,232,236,0.85)',
              letterSpacing: '0.06em',
              opacity: phaseVisible ? 1 : 0,
              transition: 'opacity 150ms ease',
              animation: 'breathe 1.8s ease infinite',
            }}
          >
            {RITUAL_PHASES[ritualPhaseIdx]}
          </p>
          <style>{`
            @keyframes ritualFadeIn {
              from { opacity: 0; }
              to   { opacity: 1; }
            }
            @keyframes breathe {
              0%, 100% { transform: scale(1); }
              50%       { transform: scale(1.04); }
            }
          `}</style>
        </div>
      )}

      {/* ======================================================
          結果フェーズ（縦スクロール1カラム）
      ====================================================== */}
      {result && (
        <>
          {/* 1. テーマヘッダー */}
          <div
            style={{
              margin: '16px 16px 0',
              padding: '28px 20px 24px',
              background: 'var(--card-secondary)',
              backdropFilter: 'blur(20px)',
              borderRadius: 'var(--r-card)',
              border: '1px solid var(--border-secondary)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* テーマ色の放射光 */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                width: 200,
                height: 200,
                transform: 'translateX(-50%)',
                background: `radial-gradient(circle, ${result.theme.color}38 0%, transparent 70%)`,
                pointerEvents: 'none',
              }}
            />
            <div style={{ position: 'relative', lineHeight: 1, marginBottom: 12 }}>
              <DreamThemeIcon
                themeKey={result.theme.key}
                size={64}
                color={result.theme.color}
              />
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--fs-h1)',
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: result.theme.color,
                margin: '0 0 8px',
              }}
            >
              {result.theme.label}
            </h3>
            <p
              style={{
                fontSize: 'var(--fs-caption)',
                color: 'var(--t2)',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              この夢が映していること
            </p>
          </div>

          {/* 2. 夢の意味（主役） */}
          <div
            style={{
              margin: '12px 16px 0',
              padding: '24px 20px',
              background: 'var(--card-secondary)',
              backdropFilter: 'blur(20px)',
              borderRadius: 'var(--r-card)',
              border: '1px solid var(--border-secondary)',
            }}
          >
            <h4
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--fs-body)',
                fontWeight: 700,
                color: 'var(--lavender)',
                marginBottom: 16,
              }}
            >
              夢のよみとき
            </h4>
            <p
              style={{
                fontSize: 'var(--fs-body)',
                lineHeight: 1.9,
                color: 'var(--t1)',
                marginBottom: 20,
              }}
            >
              {result.mainReading.intro}
            </p>
            {result.mainReading.deep.split('\n\n').map((para, i) => (
              <p
                key={i}
                style={{
                  fontSize: 'var(--fs-body)',
                  lineHeight: 1.9,
                  color: 'var(--t2)',
                  marginBottom: i < result.mainReading.deep.split('\n\n').length - 1 ? 16 : 0,
                }}
              >
                {para}
              </p>
            ))}
          </div>

          {/* 3. 今日のヒント */}
          <div
            style={{
              margin: '12px 16px 0',
              padding: '24px 20px',
              background: 'var(--card-secondary)',
              backdropFilter: 'blur(20px)',
              borderRadius: 'var(--r-card)',
              border: '1px solid var(--border-secondary)',
            }}
          >
            <h4
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--fs-body)',
                fontWeight: 700,
                color: 'var(--rose)',
                marginBottom: 12,
              }}
            >
              今日のヒント
            </h4>
            <p
              style={{
                fontSize: 'var(--fs-body)',
                lineHeight: 1.9,
                color: 'var(--t1)',
                marginBottom: 16,
              }}
            >
              {result.todayMessage}
            </p>
            <ul
              style={{
                padding: '0 0 0 20px',
                margin: 0,
                fontSize: 'var(--fs-body)',
                color: 'var(--t1)',
                lineHeight: 1.9,
              }}
            >
              {result.actions.should.map((a, i) => (
                <li key={i} style={{ marginBottom: i < result.actions.should.length - 1 ? 6 : 0 }}>
                  {a}
                </li>
              ))}
            </ul>
          </div>

          {/* 4. 下部アクション */}
          <div
            style={{
              margin: '24px 16px 0',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <Button
              variant="primary"
              onClick={() => setShowShare(true)}
              fullWidth
            >
              シェアする
            </Button>
            <Button variant="ghost" onClick={handleReset} fullWidth>
              別の夢をよみとく
            </Button>
          </div>

          <p
            style={{
              fontSize: 'var(--fs-micro)',
              color: 'var(--t3)',
              textAlign: 'center',
              margin: '16px 16px 4px',
              lineHeight: 1.6,
            }}
          >
            ※ 夢の解釈は登録された象徴辞典をもとに自動生成した娯楽コンテンツです。特定の結果を保証するものではありません。
          </p>
        </>
      )}

      {/* ======================================================
          シェアシート（モーダル）
      ====================================================== */}
      {showShare && result && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="夢のシェアカード"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'rgba(10, 8, 16, 0.88)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
            padding: 24,
            animation: 'ritualFadeIn 300ms ease',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowShare(false);
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-accent)',
              fontSize: 'var(--fs-h2)',
              fontStyle: 'italic',
              color: 'var(--t1)',
              letterSpacing: '0.06em',
            }}
          >
            この夢を残す
          </p>
          <ShareCard
            title={result.theme.label}
            subtitle={result.symbols.slice(0, 2).map((s) => s.word).join(' · ')}
            body={result.mainReading.intro}
            theme="lavender"
            signLabel={`${profile.sign} · ${profile.name}`}
          />
          <Button
            variant="ghost"
            onClick={() => setShowShare(false)}
          >
            閉じる
          </Button>
        </div>
      )}
    </div>
  );
}
