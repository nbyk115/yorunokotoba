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

/* ── ランク別テーマカラー: 金か淡いローズのみ（信号機廃止）── */
const RANK_COLOR: Record<FortuneRank, string> = {
  大吉: 'var(--gold)',
  中吉: 'var(--gold)',
  小吉: 'var(--rose)',
  吉: 'var(--rose)',
  末吉: 'var(--rose)',
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

/* ────────────────────────────────────────────── */
/*  三日月オーバーレイ（ConstellationReveal 代替）  */
/*  creative-director 評価「幾何学的に不正確」      */
/*  シンプルな三日月1つ + 金の細線（1.5px）で再設計  */
/* ────────────────────────────────────────────── */
function ConstellationReveal({ color }: { color: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1200);
    return () => clearTimeout(timer);
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
      {/* 三日月 SVG - 金の細線 1.5px */}
      <svg
        viewBox="0 0 100 100"
        width="160"
        height="160"
        style={{ overflow: 'visible' }}
      >
        {/*
          三日月: 大円から小円を差し引いたクリップマスクで実装。
          大円 cx=50,cy=50,r=36 / 小円 cx=62,cy=44,r=30 の差分が三日月形。
          stroke-dasharray アニメーションで描画演出を付ける。
        */}
        <defs>
          <clipPath id="crescent-clip">
            {/* 大円の内側だけ残す */}
            <circle cx="50" cy="50" r="36" />
          </clipPath>
        </defs>
        {/* 大円（fill なし、大円の縁だけ描く）*/}
        <MoonCrescentPath color={color} />
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

/* 三日月パス（stroke-dasharray でアニメ） */
function MoonCrescentPath({ color }: { color: string }) {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    // 三日月パスの長さを取得してdasharray設定
    const length = el.getTotalLength();
    el.style.strokeDasharray = String(length);
    el.style.strokeDashoffset = String(length);
    const raf = requestAnimationFrame(() => {
      el.style.transition = 'stroke-dashoffset 2.0s cubic-bezier(0.4, 0, 0.2, 1)';
      el.style.strokeDashoffset = '0';
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  /*
    三日月パス: SVG path の arc コマンドで描く。
    大円: 中心(50,50) r=36 を描いてから、
    小円(中心60,44 r=28) を反対方向で差し引く形の path。
    簡易的に: 三日月の外縁を arc で直接描く。
  */
  return (
    <path
      ref={pathRef}
      d="
        M 50 14
        A 36 36 0 1 1 14 50
        A 36 36 0 0 1 50 14
        Z
        M 62 20
        A 30 30 0 0 0 20 58
        A 30 30 0 0 0 62 20
        Z
      "
      fill={color}
      fillOpacity="0.18"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.85"
      clipRule="evenodd"
      fillRule="evenodd"
    />
  );
}

/* ────────────────────────────────────────────── */
/*  幕タイトル eyebrow                            */
/* ────────────────────────────────────────────── */
function ActEyebrow({ label }: { label: string }) {
  return (
    <div
      style={{
        textAlign: 'center',
        margin: '32px 0 16px',
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
/*  FortuneCard - PR4 リデザイン                  */
/*  見出し色分け（信号機状態）を全廃。               */
/*  全部 --text-low の小ラベルに統一し、             */
/*  左辺に金（--accent）の極細縦線 2px で各カードを区別 */
/* ────────────────────────────────────────────── */
interface FortuneCardProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

function FortuneCard({ label, children, className }: FortuneCardProps) {
  return (
    <Card
      variant="secondary"
      className={className}
      style={{
        margin: '0 16px 12px',
        /* 左辺に金の極細縦線 2px - カード区別のアクセント */
        borderLeft: 'var(--card-accent-line)',
        /* ソリッド縁のみ（backdrop-filter は secondary から継承）*/
      }}
    >
      {/* ラベル: Zen Maru 700 14px / --text-low / ls 0.14em (Co-Star 方式) */}
      <p
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--fs-card-label)',
          fontWeight: 700,
          color: 'var(--text-low)',
          letterSpacing: 'var(--ls-card-label)',
          margin: '0 0 10px',
        }}
      >
        {label}
      </p>
      {children}
    </Card>
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
  const shareTheme = RANK_SHARE_THEME[result.rank];

  return (
    <>
      {/* ── 三日月オーバーレイ（1.2秒） ── */}
      {showConstellation && <ConstellationReveal color={rankColor === 'var(--gold)' ? '#C9A961' : '#E27A8E'} />}

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
            padding: '32px 24px 24px',
            textAlign: 'center',
            background: 'var(--bg1)',
            position: 'relative',
          }}
        >
          {/* eyebrow - Cormorant italic / t3 / 星座アイコン */}
          <p
            style={{
              fontFamily: 'var(--font-accent)',
              fontSize: 'var(--fs-caption)',
              fontStyle: 'italic',
              color: 'var(--t3)',
              letterSpacing: '0.1em',
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

          {/*
            rank-en: Cormorant italic 72px - PR4 指定「維持」
            色: --accent（金）または --rose。textShadow は PR3 で削除済。
          */}
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
              margin: '0 0 8px',
            }}
          >
            {rankEn}
          </h2>

          {/* rank-jp - Zen Maru 700 / section スケール 17px */}
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--fs-section)',
              fontWeight: 700,
              color: 'var(--t1)',
              letterSpacing: 'var(--ls-section)',
              margin: '0 0 16px',
            }}
          >
            {result.rank}
          </p>

          {/* chara-wrapper - PR4: 80px（FortuneView のアバターも小さく）*/}
          <div style={{ margin: '0 auto', width: 80, height: 80 }}>
            <CharaAvatar id={result.type.id} size={80} animate />
          </div>

          {/* chara-name - Zen Maru 700 / body スケール */}
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--fs-body)',
              fontWeight: 700,
              color: 'var(--t1)',
              marginTop: 10,
            }}
          >
            {result.type.name}
          </p>

          {/* chara-sub - micro / t3 */}
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

          {/*
            summary - PR4「占い結果本文は読ませる主役」
            Zen Maru 400 / 16px / line-height 2.0
          */}
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--fs-fortune-body)',
              fontWeight: 400,
              color: 'var(--t1)',
              lineHeight: 'var(--lh-fortune-body)',
              marginTop: 16,
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

        {/* カード1: 今夜のエネルギー */}
        <FortuneCard label="今夜のエネルギー" className="slide-up-1">
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--fs-fortune-body)',
              fontWeight: 400,
              color: 'var(--t1)',
              lineHeight: 'var(--lh-fortune-body)',
              margin: 0,
            }}
          >
            {result.personality.trait}
          </p>
        </FortuneCard>

        {/* カード1.5: あなたの核（誕生数メッセージ）*/}
        {result.lifePathMessage && (
          <FortuneCard label="あなたの核" className="slide-up-1">
            <p
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--fs-fortune-body)',
                fontWeight: 400,
                color: 'var(--t2)',
                lineHeight: 'var(--lh-fortune-body)',
                margin: 0,
              }}
            >
              {result.lifePathMessage}
            </p>
          </FortuneCard>
        )}

        {/* カード2: 恋愛・つながり */}
        <FortuneCard label="恋愛・つながり" className="slide-up-1">
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--fs-fortune-body)',
              fontWeight: 400,
              color: 'var(--t1)',
              lineHeight: 'var(--lh-fortune-body)',
              margin: '0 0 10px',
            }}
          >
            {result.personality.love}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--fs-body)',
              fontWeight: 400,
              color: 'var(--t2)',
              lineHeight: 1.8,
              margin: 0,
            }}
          >
            {result.dailyLove}
          </p>
        </FortuneCard>

        {/* カード3: 仕事・才能 */}
        <FortuneCard label="仕事・才能" className="slide-up-1">
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--fs-fortune-body)',
              fontWeight: 400,
              color: 'var(--t1)',
              lineHeight: 'var(--lh-fortune-body)',
              margin: '0 0 10px',
            }}
          >
            {result.personality.work}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--fs-body)',
              fontWeight: 400,
              color: 'var(--t2)',
              lineHeight: 1.8,
              margin: 0,
            }}
          >
            {result.dailyWork}
          </p>
        </FortuneCard>

        {/* カード4: 健康・からだ */}
        <FortuneCard label="健康・からだ" className="slide-up-2">
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--fs-fortune-body)',
              fontWeight: 400,
              color: 'var(--t1)',
              lineHeight: 'var(--lh-fortune-body)',
              margin: '0 0 10px',
            }}
          >
            {result.personality.health}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--fs-body)',
              fontWeight: 400,
              color: 'var(--t2)',
              lineHeight: 1.8,
              margin: 0,
            }}
          >
            {result.dailyHealth}
          </p>
        </FortuneCard>

        {/* ════════════════════════════════ */}
        {/*  第三幕: 今夜のおわりに            */}
        {/* ════════════════════════════════ */}
        <ActEyebrow label="今夜のおわりに" />

        {/* lucky-time + risk グリッド */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            margin: '0 16px 12px',
          }}
        >
          <Card variant="secondary" style={{ padding: 'var(--sp-4) 14px', borderRadius: 'var(--r-button)' }}>
            <p
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--fs-card-label)',
                fontWeight: 700,
                color: 'var(--text-low)',
                letterSpacing: 'var(--ls-card-label)',
                margin: 0,
              }}
            >
              今夜のいい時間帯
            </p>
            <p
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--fs-caption)',
                color: 'var(--t1)',
                marginTop: 6,
                lineHeight: 1.6,
              }}
            >
              {result.time}
            </p>
          </Card>
          <Card variant="secondary" style={{ padding: 'var(--sp-4) 14px', borderRadius: 'var(--r-button)' }}>
            <p
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--fs-card-label)',
                fontWeight: 700,
                color: 'var(--text-low)',
                letterSpacing: 'var(--ls-card-label)',
                margin: 0,
              }}
            >
              ひといき
            </p>
            <p
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--fs-caption)',
                color: 'var(--t1)',
                marginTop: 6,
                lineHeight: 1.6,
              }}
            >
              {result.risk}
            </p>
          </Card>
        </div>

        {/* ════════════════════════════════ */}
        {/*  深層セクション（Premium限定）   */}
        {/* ════════════════════════════════ */}
        <DeepReadingSection
          charaId={result.type.id}
          charaName={result.type.name}
          sign={profile.sign}
          currentUserId={currentUserId}
          birthday={
            profile.birthYear && profile.birthMonth && profile.birthDay
              ? `${profile.birthYear}-${profile.birthMonth.padStart(2, '0')}-${profile.birthDay.padStart(2, '0')}`
              : null
          }
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
          {/* セクションラベル */}
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--fs-card-label)',
              fontWeight: 700,
              color: 'var(--text-low)',
              letterSpacing: 'var(--ls-card-label)',
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
  birthday: string | null;
}

function DeepReadingSection({
  charaId,
  charaName,
  sign,
  currentUserId,
  birthday,
}: DeepReadingSectionProps) {
  const { isPremium } = useSubscription(currentUserId);
  const message = getGuardianMessage(charaId, birthday);
  const moonPhaseCategory = getMoonPhaseCategory();
  const moonPhaseIdx = getMoonPhaseIndex();
  const moonLabel = getMoonPhaseLabel();
  const moonWave = getMoonSignWave(sign, moonPhaseCategory, birthday);

  if (!message) return null;

  const wrapStyle: React.CSSProperties = {
    margin: '8px 16px 16px',
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
    fontFamily: 'var(--font-heading)',
    fontSize: 'var(--fs-body)',
    fontWeight: 700,
    color: 'var(--t1)',
    margin: '0 0 14px',
    letterSpacing: '0.04em',
  };

  const bodyStyle: React.CSSProperties = {
    fontFamily: 'var(--font-heading)',
    fontSize: 'var(--fs-fortune-body)',
    fontWeight: 400,
    color: 'var(--t1)',
    lineHeight: 'var(--lh-fortune-body)' as string,
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
      <Card variant="secondary" style={wrapStyle}>
        <p style={eyebrowStyle}>今夜のことば</p>
        <h4 style={titleStyle}>
          {charaName}からのメッセージ
        </h4>
        <p
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--fs-caption)',
            color: 'var(--t2)',
            lineHeight: 1.8,
            margin: '0 0 4px',
          }}
        >
          {charaName}から今夜のあなたへのメッセージが届いてるよ。
          {moonWave && `${moonLabel}のエネルギーをよみとく特別なメッセージも。`}
        </p>
        <PremiumCTA source="deep_reading" userId={currentUserId} />
      </Card>
    );
  }

  // Premium 時: 全文表示
  return (
    <Card variant="secondary" style={wrapStyle}>
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
            {' '}Moon x Sign · {moonLabel}のエネルギー
          </p>
          <h4 style={titleStyle}>{moonWave.title}</h4>
          <p style={bodyStyle}>{moonWave.body}</p>
        </>
      )}
    </Card>
  );
}
