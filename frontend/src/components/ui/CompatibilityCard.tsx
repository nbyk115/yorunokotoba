import { useRef, type CSSProperties } from 'react';
import { toPng } from 'html-to-image';
import { CharaAvatar } from './CharaAvatar';
import { track } from '@/lib/analytics';
import type { CompatibilityRank } from '@/features/aura/compatibilityLogic';

type CardTheme = 'rose' | 'gold' | 'lavender';

interface CompatibilityCardProps {
  charaIdA: string;
  charaIdB: string;
  rank: CompatibilityRank;
  rankLabel: string;
  pairText: string;
  pairTitle: string;
  signLabel?: string;
  dateLabel?: string;
  /** 自分の charaId. シェアテキストに ?from= を埋めて受信者ファネルへ接続 */
  fromCharaId?: string;
}

/** signLabel ("蠍座 · みおの夜" 形式) から自分の星座を抽出 */
function extractSign(signLabel?: string): string {
  if (!signLabel) return 'あなた';
  const [signPart] = signLabel.split('·').map((s) => s.trim());
  return signPart && signPart.length > 0 ? signPart : 'あなた';
}

/** content-strategist K値最大化シェアテキスト: 「結果の報告」型で社会的証明 */
function buildShareText(
  pairTitle: string,
  rankLabel: string,
  rank: CompatibilityRank,
  fromCharaId?: string,
  signLabel?: string,
): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const inviteUrl = fromCharaId ? `${origin}/?from=${fromCharaId}` : origin;
  const mySign = extractSign(signLabel);
  const surprise = rank === 'best' ? '怖いくらい' : rank === 'good' ? '思ったより深い' : '意外と';
  return `あなたとの相性、${mySign}は${rankLabel}だった。${surprise}。入れてみて→\n${inviteUrl} ${pairTitle} ${RANK_PREFIX[rank]} #よるのことば`;
}

const THEME_GRADIENTS: Record<CardTheme, string> = {
  rose: 'linear-gradient(135deg, #E8627C, #D4506A)',
  gold: 'linear-gradient(135deg, #D4A853, #B8893A)',
  lavender: 'linear-gradient(135deg, #B08ACF, #9068B0)',
};

const RANK_THEME: Record<CompatibilityRank, CardTheme> = {
  best: 'gold',
  good: 'lavender',
  growth: 'rose',
};

const RANK_COLOR: Record<CompatibilityRank, string> = {
  best: '#E8C068',
  good: '#B08ACF',
  growth: '#F0809A',
};

const RANK_PREFIX: Record<CompatibilityRank, string> = {
  best: '◎',
  good: '○',
  growth: '△',
};

const CARD_SIZE = 1080;
const DISPLAY_SCALE = 0.32;
const DISPLAY_SIZE = Math.round(CARD_SIZE * DISPLAY_SCALE);

function getDefaultDateLabel(): string {
  const d = new Date();
  return `${d.getMonth() + 1}.${d.getDate()} ✦`;
}

export function CompatibilityCard({
  charaIdA,
  charaIdB,
  rank,
  rankLabel,
  pairText,
  pairTitle,
  signLabel,
  dateLabel,
  fromCharaId,
}: CompatibilityCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const dateText = dateLabel ?? getDefaultDateLabel();
  const theme = RANK_THEME[rank];

  const handleSave = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 1,
        width: CARD_SIZE,
        height: CARD_SIZE,
      });
      const link = document.createElement('a');
      link.download = 'yorunokotoba-aura.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('CompatibilityCard: PNG 生成に失敗', err);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    // K 値分子の計測（バイラル係数）
    track('compatibility_share', { rank, charaIdA, charaIdB });
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 1,
        width: CARD_SIZE,
        height: CARD_SIZE,
      });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], 'yorunokotoba-aura.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'よるのことば 相性占い',
          text: buildShareText(pairTitle, rankLabel, rank, fromCharaId, signLabel),
          files: [file],
        });
      } else {
        await handleSave();
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('CompatibilityCard: シェアに失敗', err);
      }
    }
  };

  const handleXPost = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const inviteUrl = fromCharaId ? `${origin}/?from=${fromCharaId}` : origin;
    const mySign = extractSign(signLabel);
    const surprise = rank === 'best' ? '怖いくらい' : rank === 'good' ? '思ったより深い' : '意外と';
    const text = `あなたとの相性、${mySign}は${rankLabel}だった。${surprise}。${pairTitle} ${RANK_PREFIX[rank]}`;
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(inviteUrl)}&hashtags=${encodeURIComponent('よるのことば')}`;
    if (typeof window !== 'undefined') {
      window.open(intent, '_blank', 'noopener,noreferrer');
    }
  };

  const cardStyle: CSSProperties = {
    width: CARD_SIZE,
    height: CARD_SIZE,
    background: '#0D0B0E',
    borderRadius: 48,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 80,
    gap: 32,
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Zen Maru Gothic', 'Hiragino Maru Gothic Pro', sans-serif",
    transform: `scale(${DISPLAY_SCALE})`,
    transformOrigin: 'top center',
  };

  const gradientOverlayStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: THEME_GRADIENTS[theme],
    opacity: 0.30,
    pointerEvents: 'none',
  };

  const dateBadgeStyle: CSSProperties = {
    position: 'absolute',
    top: 64,
    right: 64,
    fontFamily: "'Cormorant', serif",
    fontStyle: 'italic',
    fontSize: 'var(--fs-hero-en)',
    fontWeight: 300,
    color: '#E8C068',
    letterSpacing: '0.06em',
  };

  const signBadgeStyle: CSSProperties = {
    position: 'absolute',
    top: 64,
    left: 64,
    fontFamily: "'Zen Maru Gothic', sans-serif",
    fontSize: 24,
    fontWeight: 500,
    color: 'rgba(240,232,236,0.62)',
    letterSpacing: '0.08em',
  };

  const charaRowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 32,
  };

  const separatorStyle: CSSProperties = {
    fontFamily: "'Cormorant', serif",
    fontSize: 64,
    fontWeight: 300,
    color: '#E8C068',
  };

  const rankBadgeStyle: CSSProperties = {
    fontFamily: "'Cormorant', serif",
    fontStyle: 'italic',
    fontSize: 'var(--fs-hero-en)',
    fontWeight: 300,
    color: RANK_COLOR[rank],
    margin: 0,
    letterSpacing: '0.02em',
  };

  const rankLabelStyle: CSSProperties = {
    fontSize: 36,
    fontWeight: 700,
    color: '#F0E8EC',
    margin: 0,
    letterSpacing: '0.06em',
  };

  const accentLineStyle: CSSProperties = {
    width: 60,
    height: 3,
    background: THEME_GRADIENTS[theme],
    borderRadius: 2,
  };

  const pairTextStyle: CSSProperties = {
    fontSize: 28,
    fontWeight: 400,
    color: 'rgba(240,232,236,0.78)',
    margin: 0,
    textAlign: 'center',
    lineHeight: 1.7,
    maxWidth: 840,
  };

  const footerStyle: CSSProperties = {
    position: 'absolute',
    bottom: 56,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: "'Cormorant', serif",
    fontStyle: 'italic',
    fontSize: 30,
    color: '#E8C068',
    fontWeight: 400,
    letterSpacing: '0.10em',
  };

  const btnBase: CSSProperties = {
    padding: '10px 20px',
    borderRadius: 10,
    fontSize: 'var(--fs-caption)',
    fontWeight: 700,
    fontFamily: 'var(--font-heading)',
    cursor: 'pointer',
    minHeight: 44,
    border: 'none',
    transition: 'opacity 0.2s ease',
  };

  return (
    <div>
      <div
        style={{
          width: DISPLAY_SIZE,
          height: DISPLAY_SIZE,
          overflow: 'hidden',
          borderRadius: Math.round(48 * DISPLAY_SCALE),
          boxShadow: '0 4px 24px rgba(0,0,0,0.20)',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          margin: '0 auto',
        }}
        aria-label="相性カードプレビュー"
      >
        <div ref={cardRef} style={cardStyle}>
          <div style={gradientOverlayStyle} aria-hidden="true" />

          <span style={dateBadgeStyle} aria-hidden="true">
            {dateText}
          </span>

          {signLabel && (
            <span style={signBadgeStyle} aria-hidden="true">
              {signLabel}
            </span>
          )}

          <div style={charaRowStyle}>
            <CharaAvatar id={charaIdA} size={180} />
            <span style={separatorStyle} aria-hidden="true">×</span>
            <CharaAvatar id={charaIdB} size={180} />
          </div>

          <p style={rankBadgeStyle}>{RANK_PREFIX[rank]}</p>
          <p style={rankLabelStyle}>{rankLabel}</p>
          <div style={accentLineStyle} aria-hidden="true" />
          <p style={pairTextStyle}>{pairText}</p>

          <span style={footerStyle} aria-hidden="true">
            yorunokotoba · よるのことば
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          marginTop: 12,
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          aria-label="リンクをシェアする"
          style={{
            ...btnBase,
            background: 'linear-gradient(135deg, var(--rose), var(--pink))',
            color: '#fff',
          }}
          onClick={handleShare}
        >
          シェアする
        </button>
        <button
          type="button"
          aria-label="画像を保存する"
          style={{
            ...btnBase,
            background: 'var(--card)',
            color: 'var(--t1)',
            border: '1px solid var(--border)',
          }}
          onClick={handleSave}
        >
          画像を保存
        </button>
        <button
          type="button"
          aria-label="Xに投稿する"
          style={{
            ...btnBase,
            background: 'var(--card)',
            color: 'var(--t1)',
            border: '1px solid var(--border)',
          }}
          onClick={handleXPost}
        >
          Xに投稿
        </button>
      </div>
    </div>
  );
}
