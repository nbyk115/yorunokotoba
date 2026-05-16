import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
// CharaAvatar / RarityBadge は PR4 で夢占いから削除（夢占いとホロスコープ分離方針）.
// ホロスコープ占い（FortuneView）でのみ使用.
import { RitualButton } from '@/components/ui/RitualButton';
import { BlurReveal } from '@/components/ui/BlurReveal';
import { ShareCard } from '@/components/ui/ShareCard';
import { analyzeDream, type DreamResult } from '@/logic/dream';
import { SIGNS } from '@/data/signs';
import { saveArchiveEntry } from '@/lib/archive';
import { track } from '@/lib/analytics';
import type { UserProfile } from '@/lib/firestore';

interface DreamViewProps {
  profile: UserProfile;
}

/* ─── 解析フェーズテキスト（3秒 / 3段階） ─── */
const RITUAL_PHASES = ['夢を、読んでいる', 'シンボルをひらく', '見えてきた'];

/* ─── 月SVG（stroke-dasharray アニメーション） ─── */
function RitualMoonSvg({ progress }: { progress: number }) {
  const CIRCUMFERENCE = 2 * Math.PI * 40; // ≈ 251
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
          {/* 右半円を残して三日月を作る */}
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

  /* カルーセル用 */
  const [activeCard, setActiveCard] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  /* シェアシート表示フラグ */
  const [showShare, setShowShare] = useState(false);

  const signIdx = SIGNS.findIndex((s) => s.k === profile.sign);

  /* ─── ロジック（既存流用） ─── */
  const handleConfirm = useCallback(async () => {
    if (!text.trim()) return;
    track('dream_start', { length: text.length });
    setLoading(true);
    setRitualPhaseIdx(0);
    setPhaseVisible(true);
    setMoonProgress(0);

    // 月のアニメーション開始トリガー（1フレーム後に進行開始）
    requestAnimationFrame(() => setMoonProgress(1));

    const PHASE_INTERVAL = 1000; // 3フェーズ × 1秒
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
    setActiveCard(0);
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

  /* ─── カルーセルのスクロール同期 ─── */
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    function onScroll() {
      if (!el) return;
      const cardWidth = el.scrollWidth / 5; // 5枚
      const idx = Math.round(el.scrollLeft / cardWidth);
      setActiveCard(Math.min(Math.max(idx, 0), 4));
    }
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [result]);

  /* ─── ドットクリックでスクロール ─── */
  function scrollToCard(idx: number) {
    if (!carouselRef.current) return;
    const cardWidth = carouselRef.current.scrollWidth / 5;
    carouselRef.current.scrollTo({ left: cardWidth * idx, behavior: 'smooth' });
  }

  /* ─── カード共通スタイル ─── */
  const cardBase: React.CSSProperties = {
    flexShrink: 0,
    width: 'clamp(calc(100vw - 32px), calc(100vw - 48px), 432px)',
    scrollSnapAlign: 'start',
    background: 'var(--card)',
    backdropFilter: 'blur(20px)',
    borderRadius: 'var(--r-card)',
    border: '1px solid var(--border)',
    padding: '20px',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ paddingBottom: 32 }}>

      {/* ══════════════════════════════════════════
          ★ 入力フェーズ
      ══════════════════════════════════════════ */}
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
                fontFamily: 'var(--font-accent)',
                fontSize: 13,
                fontStyle: 'italic',
                color: 'var(--lavender)',
                letterSpacing: '0.1em',
                marginBottom: 12,
              }}
            >
              Dream Oracle
            </p>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: 'var(--t1)',
                letterSpacing: '0.04em',
                lineHeight: 1.3,
                marginBottom: 8,
              }}
            >
              夢を、あずけて
            </h2>
            <p
              style={{
                fontSize: 13,
                color: 'var(--t2)',
                lineHeight: 1.8,
              }}
            >
              見た夢をそのまま書いて。深層心理のヒントが出てくるよ。
            </p>
          </div>

          {/* textarea-card（罫線ノート風） */}
          <div
            style={{
              margin: '0 16px 16px',
              padding: 20,
              background: 'var(--card)',
              backdropFilter: 'blur(20px)',
              borderRadius: 18,
              border: '1px solid var(--border)',
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
                fontSize: 15,
                lineHeight: 1.9,
                resize: 'none',
                minHeight: 'clamp(120px, 28vw, 200px)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              // placeholder 色はグローバル CSS で制御できないため style タグ内に注入
            />
            <div
              style={{
                textAlign: 'right',
                fontSize: 11,
                color: 'var(--t3)',
                marginTop: 8,
              }}
            >
              {text.length} / 500
            </div>

            <div style={{ marginTop: 16 }}>
              <RitualButton
                verb="夜にあずける"
                onConfirm={handleConfirm}
                disabled={!text.trim() || loading}
                fullWidth
              />
            </div>
          </div>

          {/* 期待値コピー（textarea-card と TabBar の間の余白を埋める） */}
          <div
            style={{
              padding: '8px 32px 24px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-accent)',
                fontStyle: 'italic',
                fontSize: 14,
                color: 'var(--t3)',
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              You leave it to the night.
            </p>
            <p
              style={{
                fontSize: 12,
                color: 'var(--t3)',
                lineHeight: 1.7,
                marginTop: 4,
                letterSpacing: '0.04em',
              }}
            >
              夜にあずけると、あなたへのことばが返ってくる
            </p>
          </div>

          {/* placeholder の色を t3 に下げてノイズ感を解消 */}
          <style>{`
            textarea::placeholder {
              color: rgba(240, 232, 236, 0.40);
            }
          `}</style>
        </>
      )}

      {/* ══════════════════════════════════════════
          ★ 解析オーバーレイ（loading === true 時）
      ══════════════════════════════════════════ */}
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
            style={{
              fontFamily: 'var(--font-accent)',
              fontSize: 20,
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

      {/* ══════════════════════════════════════════
          ★ 結果フェーズ
      ══════════════════════════════════════════ */}
      {result && (
        <>
          {/* ── カルーセル ── */}
          <div
            ref={carouselRef}
            style={{
              display: 'flex',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              scrollPaddingLeft: 16,
              WebkitOverflowScrolling: 'touch',
              gap: 12,
              padding: 16,
              /* スクロールバー非表示 */
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            className="no-scrollbar"
          >

            {/* ── Card 1: テーマ主役ヒーロー（夢占いはキャラなし）── */}
            <div
              style={{
                ...cardBase,
                background: result.theme.grad,
                border: 'none',
                color: '#fff',
                padding: 'var(--sp-6) var(--sp-5) var(--sp-5)',
                textAlign: 'center',
                position: 'relative',
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                minHeight: 320,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* テーマ大型アイコン（キャラの代わり） */}
              <div
                style={{
                  fontSize: 96,
                  lineHeight: 1,
                  marginTop: 8,
                  marginBottom: 16,
                  filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))',
                }}
                aria-hidden="true"
              >
                {result.theme.icon}
              </div>

              {/* テーマラベル H1 */}
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  marginBottom: 4,
                }}
              >
                {result.theme.label}
              </h3>

              {/* シンボル 1 行サマリー */}
              <p
                style={{
                  fontSize: 14,
                  opacity: 0.92,
                  marginTop: 6,
                  lineHeight: 1.6,
                }}
              >
                {result.symbols.slice(0, 3).map((s) => s.word).join('・')}
              </p>

              {/* ── フローティング「この夢を残す」ボタン ── */}
              <button
                onClick={() => setShowShare(true)}
                aria-label="この夢を残す"
                style={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: 'var(--font-heading)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1.3,
                  gap: 2,
                  padding: 4,
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: 16 }}>🌙</span>
                <span>残す</span>
              </button>
            </div>

            {/* ── Card 2: 月が、あなたに残したことば（ICP語彙核） ── */}
            <div style={{ ...cardBase }}>
              <h4
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'var(--lavender)',
                  marginBottom: 10,
                  fontFamily: 'var(--font-heading)',
                }}
              >
                月が、あなたに残したことば
              </h4>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.9,
                  color: 'var(--t1)',
                  marginBottom: 16,
                }}
              >
                {result.mainReading.intro}
              </p>
              {/* BlurReveal を mainReading.deep に適用 */}
              <BlurReveal initialBlur={4} revealOnTap>
                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.9,
                    color: 'var(--t2)',
                  }}
                >
                  {result.mainReading.deep}
                </p>
              </BlurReveal>
              <p
                style={{
                  fontSize: 11,
                  color: 'var(--t3)',
                  marginTop: 8,
                  textAlign: 'center',
                }}
              >
                タップして続きを読む
              </p>
            </div>

            {/* ── Card 3: シンボル一覧 ── */}
            <div style={{ ...cardBase }}>
              <h4
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'var(--lavender)',
                  marginBottom: 12,
                }}
              >
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
                      {s.word} · {s.meaning}
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: 'var(--t2)',
                        marginTop: 4,
                        lineHeight: 1.7,
                      }}
                    >
                      {s.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Card 4: 今日のメッセージ + アクション3種 ── */}
            <div style={{ ...cardBase }}>
              <h4
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'var(--rose)',
                  marginBottom: 10,
                }}
              >
                今日のメッセージ
              </h4>
              <p style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--t1)' }}>
                {result.todayMessage}
              </p>

              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 6 }}>
                  今日やるといいこと
                </p>
                <ul style={{ paddingLeft: 20, fontSize: 13, color: 'var(--t1)', lineHeight: 1.8 }}>
                  {result.actions.should.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 6 }}>
                  気をつけること
                </p>
                <ul style={{ paddingLeft: 20, fontSize: 13, color: 'var(--t1)', lineHeight: 1.8 }}>
                  {result.actions.aware.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>

              {/* 「今日避けたいこと」は ux-designer 診断で認知過負荷判定 → 削除（should + aware の 2 点で十分）*/}
            </div>

            {/* ── Card 5: 今日のお守り + 相性タイプ（統合） ── */}
            <div style={{ ...cardBase }}>
              <h4
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'var(--gold)',
                  marginBottom: 10,
                }}
              >
                💝 今日のお守り
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ fontSize: 13, color: 'var(--t1)' }}>
                  <strong style={{ color: result.lucky.color.hex }}>
                    🎨 {result.lucky.color.v}
                  </strong>
                  <span style={{ color: 'var(--t2)', marginLeft: 8 }}>
                    {result.lucky.color.reason}
                  </span>
                </p>
                <p style={{ fontSize: 13, color: 'var(--t1)' }}>
                  <strong>
                    {result.lucky.item.e} {result.lucky.item.v}
                  </strong>
                  <span style={{ color: 'var(--t2)', marginLeft: 8 }}>
                    {result.lucky.item.reason}
                  </span>
                </p>
                <p style={{ fontSize: 13, color: 'var(--t1)' }}>
                  <strong>🔢 ナンバー {result.lucky.num.v}</strong>
                  <span style={{ color: 'var(--t2)', marginLeft: 8 }}>
                    {result.lucky.num.reason}
                  </span>
                </p>
              </div>

              {/* 「相性タイプ・恋愛傾向」セクションは PR4 で削除.
                  夢占いとホロスコープの分離方針: キャラ・恋愛傾向は
                  ホロスコープ占い（FortuneView）専属とし、夢占いは
                  テーマ・シンボル・夢のメッセージに集中. */}
            </div>
          </div>

          {/* ── ドットインジケーター ── */}
          <div
            role="tablist"
            aria-label="カードナビゲーション"
            style={{
              display: 'flex',
              gap: 6,
              justifyContent: 'center',
              padding: '12px 0',
            }}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <button
                key={i}
                role="tab"
                aria-selected={activeCard === i}
                aria-label={`カード ${i + 1}`}
                onClick={() => scrollToCard(i)}
                style={{
                  width: activeCard === i ? 18 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: activeCard === i ? 'var(--rose)' : 'var(--t3)',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'width 300ms ease, background 300ms ease',
                }}
              />
            ))}
          </div>

          {/* ── reset-button ── */}
          <div style={{ margin: '16px 16px 32px' }}>
            <Button variant="ghost" onClick={handleReset} fullWidth>
              もう一度あずける
            </Button>
          </div>
          <p
            style={{
              fontSize: 11,
              color: 'var(--t3)',
              textAlign: 'center',
              margin: '16px 16px 4px',
              lineHeight: 1.6,
            }}
          >
            ※ 夢の解釈は AI が生成した娯楽コンテンツです. 特定の結果を保証するものではありません.
          </p>
        </>
      )}

      {/* ══════════════════════════════════════════
          ★ シェアシート（モーダル）
      ══════════════════════════════════════════ */}
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
              fontSize: 18,
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

      {/* no-scrollbar utility（スクロールバー非表示） */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
