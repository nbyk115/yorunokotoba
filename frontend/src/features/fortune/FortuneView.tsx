import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { CharaAvatar } from '@/components/ui/CharaAvatar';
import { ShareCard } from '@/components/ui/ShareCard';
import { generateFortune, type FortuneRank, type FortuneResult } from '@/logic/fortune';
import { SIGNS } from '@/data/signs';
import { ZodiacIcon } from '@/components/ui/ZodiacIcon';
import { getGuardianMessage } from '@/data/guardianMessages';
import { getMoonSignWave } from '@/data/moonSignWaves';
import { getMoonPhaseCategory, getMoonPhaseIndex, getMoonPhaseLabel } from '@/lib/moonPhase';
import { MoonPhaseIcon } from '@/components/ui/MoonPhaseIcon';
import { track } from '@/lib/analytics';
import type { UserProfile } from '@/lib/firestore';
import { useSubscription } from '@/lib/subscription';
import { PremiumCTA } from '@/components/ui/PremiumCTA';

interface FortuneViewProps {
  profile: UserProfile;
  currentUserId: string | null;
}

/* ── ランク英語変換 ── */
const RANK_TO_EN: Record<FortuneRank, string> = {
  大吉: 'Great Fortune',
  中吉: 'Fortune',
  小吉: 'Good Luck',
  吉: 'Lucky',
  末吉: 'Hope',
};

/* ── ランク別テーマカラー ── */
const RANK_COLOR: Record<FortuneRank, string> = {
  大吉: 'var(--gold)',
  中吉: 'var(--gold)',
  小吉: 'var(--rose)',
  吉: 'var(--rose)',
  末吉: 'var(--rose)',
};

/* ── ランク別パーティクル色（Particles コンポーネントがない場合は CSS 変数で代替） ── */
const RANK_PARTICLE_COLOR: Record<FortuneRank, string> = {
  大吉: '#D4A853',
  中吉: '#B08ACF',
  小吉: '#E8627C',
  吉: '#E8627C',
  末吉: '#E8627C',
};

/* ── ランク別 ShareCard テーマ ── */
type CardTheme = 'rose' | 'gold' | 'lavender';
const RANK_SHARE_THEME: Record<FortuneRank, CardTheme> = {
  大吉: 'gold',
  中吉: 'lavender',
  小吉: 'rose',
  吉: 'rose',
  末吉: 'rose',
};

/* ── 星座アニメ用 SVG パス（五角形を回転させた星型） ── */
const CONSTELLATION_POINTS = [
  [50, 8],
  [79, 90],
  [2, 35],
  [98, 35],
  [21, 90],
].map((p) => p.join(',')).join(' ');

/* ────────────────────────────────────────────── */
/*  幕タイトル eyebrow（日本語の控えめなセクション見出し） */
/* ────────────────────────────────────────────── */
function ActEyebrow({ label }: { label: string }) {
  return (
    <div
      style={{
        textAlign: 'center',
        margin: '28px 0 14px',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-accent)',
          fontStyle: 'italic',
          fontSize: 'var(--fs-caption)',
          color: 'var(--gold)',
          letterSpacing: '0.32em',
          margin: 0,
          opacity: 0.85,
        }}
      >
        {label}
      </p>
      <div
        aria-hidden="true"
        style={{
          width: 32,
          height: 1,
          background: 'var(--border)',
          margin: '8px auto 0',
        }}
      />
    </div>
  );
}

/* ────────────────────────────────────────────── */
/*  星座結びアニメーション（SVG stroke-dasharray） */
/* ────────────────────────────────────────────── */
function ConstellationReveal({ color }: { color: string }) {
  const pathRef = useRef<SVGPolylineElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const length = path.getTotalLength();
    path.style.strokeDasharray = String(length);
    path.style.strokeDashoffset = String(length);

    // フレームを跨いでアニメ開始
    const raf = requestAnimationFrame(() => {
      path.style.transition = 'stroke-dashoffset 2.4s cubic-bezier(0.4, 0, 0.2, 1)';
      path.style.strokeDashoffset = '0';
    });

    // ICP（夜中3時・即時性重視）に合わせ 1.2秒で消す（ドーシー流即時性 + 演出余韻のバランス）
    const timer = setTimeout(() => setVisible(false), 1200);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(10, 8, 16, 0.88)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        transition: 'opacity 0.6s ease',
        opacity: visible ? 1 : 0,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        width="200"
        height="200"
        style={{ overflow: 'visible' }}
      >
        {/* 頂点ドット */}
        {[
          [50, 8],
          [79, 90],
          [2, 35],
          [98, 35],
          [21, 90],
        ].map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r="2.4"
            fill={color}
            opacity="0.85"
          />
        ))}

        {/* 星型のライン（stroke-dasharray で描画） */}
        <polyline
          ref={pathRef}
          points={CONSTELLATION_POINTS}
          fill="none"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.75"
        />
      </svg>

      <p
        style={{
          position: 'absolute',
          bottom: '30%',
          color: 'rgba(240, 232, 236, 0.65)',
          fontSize: 'var(--fs-caption)',
          fontFamily: 'var(--font-accent)',
          fontStyle: 'italic',
          letterSpacing: '0.12em',
        }}
      >
        星を読んでいる…
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────── */
/*  メインコンポーネント                          */
/* ────────────────────────────────────────────── */
export function FortuneView({ profile, currentUserId }: FortuneViewProps) {
  const [result, setResult] = useState<FortuneResult | null>(null);
  const [showConstellation, setShowConstellation] = useState(true);

  useEffect(() => {
    track('fortune_start', { sign: profile.sign });
    const r = generateFortune(
      profile.name,
      profile.sign,
      profile.gender === 'male' ? 'male' : 'female',
      parseInt(profile.birthDay, 10) || undefined,
      parseInt(profile.birthMonth, 10) || undefined,
    );
    setResult(r);
    track('fortune_complete', { sign: profile.sign, rank: r.rank });

    // 1.2秒後に星座アニメを消す（ConstellationReveal 内部 timer と同期）
    const t = setTimeout(() => setShowConstellation(false), 1200);
    return () => clearTimeout(t);
  }, [profile]);

  const signIndex = SIGNS.findIndex((s) => s.k === profile.sign);

  /* ── ローディング ── */
  if (!result) {
    return (
      <div style={{ padding: 'var(--sp-6)', textAlign: 'center' }}>
        <p style={{ color: 'var(--t2)' }}>占いを準備中…</p>
      </div>
    );
  }

  const rankEn = RANK_TO_EN[result.rank];
  const rankColor = RANK_COLOR[result.rank];
  const particleColor = RANK_PARTICLE_COLOR[result.rank];
  const shareTheme = RANK_SHARE_THEME[result.rank];

  return (
    <>
      {/* ── 星座結びオーバーレイ（1.2秒） ── */}
      {showConstellation && <ConstellationReveal color={particleColor} />}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg1)',
          minHeight: '100vh',
        }}
      >
        {/* ════════════════════════════════ */}
        {/*  fortune-hero                    */}
        {/* ════════════════════════════════ */}
        <div
          style={{
            padding: '28px 24px 20px',
            textAlign: 'center',
            background: 'var(--bg1)',
            position: 'relative',
          }}
        >
          {/* パーティクル風装飾ドット */}
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            {[
              { top: '12%', left: '8%', size: 3, opacity: 0.35 },
              { top: '22%', left: '88%', size: 2, opacity: 0.25 },
              { top: '55%', left: '5%', size: 2, opacity: 0.20 },
              { top: '70%', left: '92%', size: 3, opacity: 0.30 },
              { top: '38%', left: '96%', size: 2, opacity: 0.20 },
              { top: '80%', left: '12%', size: 2, opacity: 0.22 },
            ].map((dot, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: dot.top,
                  left: dot.left,
                  width: dot.size,
                  height: dot.size,
                  borderRadius: '50%',
                  background: particleColor,
                  opacity: dot.opacity,
                }}
              />
            ))}
          </div>

          {/* eyebrow */}
          <p
            style={{
              fontFamily: 'var(--font-accent)',
              fontSize: 'var(--fs-caption)',
              fontStyle: 'italic',
              color: 'var(--t3)',
              letterSpacing: '0.1em',
              marginBottom: 8,
              margin: '0 0 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            {signIndex >= 0 && (
              <ZodiacIcon signIndex={signIndex} size={14} color="var(--t3)" />
            )}
            {profile.sign} · {profile.name}
          </p>

          {/* rank-en（Cormorant 72px italic） */}
          <h2
            className="slide-up"
            style={{
              fontFamily: 'var(--font-accent)',
              fontSize: 'clamp(60px, 18vw, 72px)',
              fontWeight: 300,
              fontStyle: 'italic',
              color: rankColor,
              lineHeight: 1.0,
              letterSpacing: '-0.02em',
              textShadow: `0 4px 40px ${particleColor}72`,
              margin: '0 0 8px',
            }}
          >
            {rankEn}
          </h2>

          {/* rank-jp */}
          <p
            style={{
              fontSize: 'var(--fs-body)',
              fontWeight: 700,
              color: 'var(--t2)',
              letterSpacing: '0.12em',
              marginBottom: 16,
            }}
          >
            {result.rank}
          </p>

          {/* chara-wrapper */}
          <div style={{ margin: '0 auto', width: 120, height: 120 }}>
            <CharaAvatar id={result.type.id} size={120} animate />
          </div>

          {/* chara-name */}
          <p
            style={{
              fontSize: 'var(--fs-body)',
              fontWeight: 700,
              color: 'var(--t1)',
              marginTop: 12,
            }}
          >
            {result.type.name}
          </p>

          {/* chara-sub（タイプ識別子・MBTI 風ラベル） */}
          <p
            style={{
              fontSize: 'var(--fs-micro)',
              color: 'var(--t3)',
              marginTop: 4,
              letterSpacing: '0.04em',
            }}
          >
            {result.type.sub}
          </p>

          {/* summary */}
          <p
            style={{
              fontSize: 'var(--fs-body)',
              color: 'var(--t2)',
              lineHeight: 1.9,
              marginTop: 12,
              textAlign: 'left',
              padding: '0 4px',
            }}
          >
            {result.summary}
          </p>
        </div>

        {/* ════════════════════════════════ */}
        {/*  第二幕: 今夜のよみとき              */}
        {/* ════════════════════════════════ */}
        <ActEyebrow label="今夜のよみとき" />

        {/* カード1: 今夜のエネルギー（1カード1テーマ） */}
        <Card
          className="slide-up-1"
          style={{ margin: '0 16px 12px' }}
        >
          <h4
            style={{
              fontSize: 'var(--fs-h3)',
              fontWeight: 700,
              color: 'var(--lavender)',
              marginBottom: 10,
            }}
          >
            今夜のエネルギー
          </h4>
          <p style={{ fontSize: 'var(--fs-body)', color: 'var(--t1)', lineHeight: 1.85 }}>
            {result.personality.trait}
          </p>
        </Card>

        {/* カード1.5: あなたの核（誕生数メッセージ） */}
        {result.lifePathMessage && (
          <Card
            className="slide-up-1"
            style={{ margin: '0 16px 12px' }}
          >
            <h4
              style={{
                fontSize: 'var(--fs-h3)',
                fontWeight: 700,
                color: 'var(--t3)',
                marginBottom: 10,
                letterSpacing: '0.06em',
              }}
            >
              あなたの核
            </h4>
            <p style={{ fontSize: 'var(--fs-body)', color: 'var(--t2)', lineHeight: 1.85 }}>
              {result.lifePathMessage}
            </p>
          </Card>
        )}

        {/* カード2: 恋愛・つながり */}
        <Card
          className="slide-up-1"
          style={{ margin: '0 16px 12px' }}
        >
          <h4
            style={{
              fontSize: 'var(--fs-h3)',
              fontWeight: 700,
              color: 'var(--rose)',
              marginBottom: 10,
            }}
          >
            恋愛・つながり
          </h4>
          <p style={{ fontSize: 'var(--fs-body)', color: 'var(--t1)', lineHeight: 1.85 }}>
            {result.personality.love}
          </p>
          <p style={{ fontSize: 'var(--fs-caption)', color: 'var(--t2)', lineHeight: 1.8, marginTop: 10 }}>
            {result.dailyLove}
          </p>
        </Card>

        {/* カード3: 仕事・才能 */}
        <Card
          className="slide-up-1"
          style={{ margin: '0 16px 12px' }}
        >
          <h4
            style={{
              fontSize: 'var(--fs-h3)',
              fontWeight: 700,
              color: 'var(--gold)',
              marginBottom: 10,
            }}
          >
            仕事・才能
          </h4>
          <p style={{ fontSize: 'var(--fs-body)', color: 'var(--t1)', lineHeight: 1.85 }}>
            {result.personality.work}
          </p>
          <p style={{ fontSize: 'var(--fs-caption)', color: 'var(--t2)', lineHeight: 1.8, marginTop: 10 }}>
            {result.dailyWork}
          </p>
        </Card>

        {/* カード4: 健康（今夜のよみとき末尾） */}
        <Card
          className="slide-up-2"
          style={{ margin: '0 16px 12px' }}
        >
          <h4
            style={{
              fontSize: 'var(--fs-h3)',
              fontWeight: 700,
              color: '#5BA87C',
              marginBottom: 10,
            }}
          >
            健康・からだ
          </h4>
          <p style={{ fontSize: 'var(--fs-body)', color: 'var(--t1)', lineHeight: 1.85 }}>
            {result.personality.health}
          </p>
          <p style={{ fontSize: 'var(--fs-caption)', color: 'var(--t2)', lineHeight: 1.8, marginTop: 10 }}>
            {result.dailyHealth}
          </p>
        </Card>

        {/* ════════════════════════════════ */}
        {/*  第三幕: 今夜のおわりに            */}
        {/* ════════════════════════════════ */}
        <ActEyebrow label="今夜のおわりに" />

        {/* lucky-time + risk グリッド（第三幕に移動） */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            margin: '0 16px 12px',
          }}
        >
          <div
            style={{
              padding: '16px 14px',
              background: 'var(--card-secondary)',
              borderRadius: 14,
              border: '1px solid var(--border-secondary)',
            }}
          >
            <p
              style={{
                fontSize: 'var(--fs-micro)',
                fontWeight: 700,
                color: 'var(--t3)',
                letterSpacing: '0.08em',
                margin: 0,
              }}
            >
              🌙 今夜のいい時間帯
            </p>
            <p style={{ fontSize: 'var(--fs-caption)', color: 'var(--t1)', marginTop: 4, lineHeight: 1.6 }}>
              {result.time}
            </p>
          </div>
          <div
            style={{
              padding: '16px 14px',
              background: 'var(--card-secondary)',
              borderRadius: 14,
              border: '1px solid var(--border-secondary)',
            }}
          >
            <p
              style={{
                fontSize: 'var(--fs-micro)',
                fontWeight: 700,
                color: 'var(--t3)',
                letterSpacing: '0.08em',
                margin: 0,
              }}
            >
              ひといき
            </p>
            <p style={{ fontSize: 'var(--fs-caption)', color: 'var(--t1)', marginTop: 4, lineHeight: 1.6 }}>
              {result.risk}
            </p>
          </div>
        </div>

        {/* ════════════════════════════════ */}
        {/*  深層セクション（Premium限定）   */}
        {/* ════════════════════════════════ */}
        <DeepReadingSection
          charaId={result.type.id}
          charaName={result.type.name}
          sign={profile.sign}
          currentUserId={currentUserId}
        />

        {/* ════════════════════════════════ */}
        {/*  share-section（ShareCard）      */}
        {/* ════════════════════════════════ */}
        <div
          style={{
            margin: '8px 16px 0',
            padding: '24px 0 32px',
          }}
        >
          <p
            style={{
              fontSize: 'var(--fs-caption)',
              fontWeight: 700,
              color: 'var(--t2)',
              letterSpacing: '0.04em',
              textAlign: 'center',
              marginBottom: 16,
            }}
          >
            シェアして残そう
          </p>

          <ShareCard
            title={rankEn}
            subtitle={result.type.sub}
            body={result.summary.slice(0, 30) + (result.summary.length > 30 ? '…' : '')}
            charaId={result.type.id}
            theme={shareTheme}
            signLabel={`${profile.sign} · ${profile.name}`}
          />

          {/* AI 免責（全コンテンツを読み終えた最後に配置・景表法対応） */}
          <p
            style={{
              fontSize: 'var(--fs-micro)',
              color: 'var(--t3)',
              textAlign: 'center',
              margin: '20px 0 0',
              lineHeight: 1.6,
              opacity: 0.7,
            }}
          >
            ※ AI が生成する娯楽の占いだよ
          </p>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// DeepReadingSection（Premium限定の深層メッセージ）
// ─────────────────────────────────────────────

interface DeepReadingSectionProps {
  charaId: string;
  charaName: string;
  sign: string;
  currentUserId: string | null;
}

function DeepReadingSection({
  charaId,
  charaName,
  sign,
  currentUserId,
}: DeepReadingSectionProps) {
  const { isPremium } = useSubscription(currentUserId);
  const message = getGuardianMessage(charaId);
  const moonPhaseCategory = getMoonPhaseCategory();
  const moonPhaseIdx = getMoonPhaseIndex();
  const moonLabel = getMoonPhaseLabel();
  const moonWave = getMoonSignWave(sign, moonPhaseCategory);

  if (!message) return null;

  const wrapStyle: React.CSSProperties = {
    margin: '8px 16px 16px',
    padding: 20,
    background: 'var(--card-secondary)',
    border: '1px solid var(--border-secondary)',
    borderRadius: 18,
    position: 'relative',
  };

  const eyebrowStyle: React.CSSProperties = {
    fontFamily: 'var(--font-accent)',
    fontStyle: 'italic',
    fontSize: 'var(--fs-micro)',
    color: 'var(--gold)',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    margin: '0 0 10px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 'var(--fs-body)',
    fontWeight: 700,
    color: 'var(--t1)',
    margin: '0 0 14px',
    letterSpacing: '0.04em',
  };

  const bodyStyle: React.CSSProperties = {
    fontSize: 'var(--fs-body)',
    color: 'var(--t1)',
    lineHeight: 1.9,
    margin: 0,
  };

  const dividerStyle: React.CSSProperties = {
    height: 1,
    background: 'var(--border)',
    margin: '20px 0',
  };

  // 非 Premium 時: 本文を一切描画せず（SR が読める blur 削除）、訴求 + CTA のみ.
  if (!isPremium) {
    return (
      <Card style={wrapStyle}>
        <p style={eyebrowStyle}>今夜のことば</p>
        <h4 style={titleStyle}>
          {charaName}からのメッセージ
        </h4>
        <p
          style={{
            fontSize: 'var(--fs-caption)',
            color: 'var(--t2)',
            lineHeight: 1.8,
            margin: '0 0 4px',
          }}
        >
          {charaName}から今夜のあなたへのメッセージが届いてるよ。
          {moonWave && `${moonLabel}のエネルギーを読み解く特別なメッセージも。`}
        </p>
        <PremiumCTA source="deep_reading" userId={currentUserId} />
      </Card>
    );
  }

  // Premium 時: 全文表示
  return (
    <Card style={wrapStyle}>
      <p style={eyebrowStyle}>今夜のことば</p>
      <h4 style={titleStyle}>
        {charaName}からのメッセージ
      </h4>
      <p style={bodyStyle}>{message.body}</p>

      {moonWave && (
        <>
          <div style={dividerStyle} aria-hidden="true" />
          <p
            style={{
              ...eyebrowStyle,
              color: 'var(--lavender)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <MoonPhaseIcon phaseIndex={moonPhaseIdx} size={12} color="var(--lavender)" />
            {' '}Moon × Sign · {moonLabel}のエネルギー
          </p>
          <h4 style={titleStyle}>{moonWave.title}</h4>
          <p style={bodyStyle}>{moonWave.body}</p>
        </>
      )}
    </Card>
  );
}
