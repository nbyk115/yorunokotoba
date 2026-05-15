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
  /** 自分の charaId. シェアテキストに ?from= リンクを埋める（受信者ファネル用） */
  fromCharaId?: string;
}

const THEME_GRADIENTS: Record<CardTheme, string> = {
  rose: 'linear-gradient(160deg, #2A1A24 0%, #4A2A35 60%, #6B3245 100%)',
  gold: 'linear-gradient(160deg, #2A2018 0%, #4A3520 60%, #6B4828 100%)',
  lavender: 'linear-gradient(160deg, #1F1A2E 0%, #352848 60%, #4D3870 100%)',
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

const CARD_W = 1080;
const CARD_H = 1920;
const DISPLAY_SCALE = 0.18;
const DISPLAY_W = Math.round(CARD_W * DISPLAY_SCALE);
const DISPLAY_H = Math.round(CARD_H * DISPLAY_SCALE);

function getDefaultDateLabel(): string {
  const d = new Date();
  return `${d.getMonth() + 1}.${d.getDate()}`;
}

/** 受信者リンク + 招待誘引（K値ドライバー）
 *  content-strategist 案: 機能説明ではなく「結果の報告」形式で社会的証明 */
function extractSign(signLabel?: string): string {
  if (!signLabel) return 'あなた';
  const [signPart] = signLabel.split('·').map((s) => s.trim());
  return signPart && signPart.length > 0 ? signPart : 'あなた';
}

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
        width: CARD_W,
        height: CARD_H,
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
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 1,
        width: CARD_W,
        height: CARD_H,
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
        track('compatibility_share', { rank, surface: 'web_share' });
      } else {
        await handleSave();
        track('compatibility_share', { rank, surface: 'fallback_save' });
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
      track('compatibility_share', { rank, surface: 'x_post' });
    }
  };

  /* ────── カード本体（1080×1920 縦長・IG ストーリーズ）────── */
  const cardStyle: CSSProperties = {
    width: CARD_W,
    height: CARD_H,
    background: THEME_GRADIENTS[theme],
    borderRadius: 0,
    padding: '280px 80px 280px',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
    fontFamily: "'Zen Maru Gothic', 'Hiragino Maru Gothic Pro', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    transform: `scale(${DISPLAY_SCALE})`,
    transformOrigin: 'top left',
  };

  const topBarStyle: CSSProperties = {
    position: 'absolute',
    top: 280,
    left: 80,
    right: 80,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 32,
    color: 'rgba(240,232,236,0.6)',
    letterSpacing: '0.08em',
  };

  const charaRowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 32,
  };

  const charaWrapStyle: CSSProperties = {
    width: 280,
    height: 280,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)',
    border: '6px solid rgba(255,255,255,0.20)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const separatorStyle: CSSProperties = {
    fontFamily: "'Cormorant', serif",
    fontSize: 96,
    fontWeight: 300,
    color: '#E8C068',
  };

  const rankBadgeStyle: CSSProperties = {
    fontFamily: "'Cormorant', serif",
    fontStyle: 'italic',
    fontSize: 140,
    lineHeight: 1,
    fontWeight: 400,
    color: RANK_COLOR[rank],
    margin: 0,
    letterSpacing: '0.02em',
    textShadow: '0 6px 32px rgba(0,0,0,0.4)',
  };

  const rankLabelStyle: CSSProperties = {
    fontSize: 56,
    fontWeight: 700,
    color: '#F0E8EC',
    margin: 0,
    letterSpacing: '0.06em',
  };

  const pairTextStyle: CSSProperties = {
    fontSize: 36,
    fontWeight: 400,
    color: 'rgba(240,232,236,0.82)',
    margin: 0,
    textAlign: 'center',
    lineHeight: 1.6,
    maxWidth: 900,
    wordBreak: 'keep-all',
    overflowWrap: 'break-word',
  };

  const footerStyle: CSSProperties = {
    position: 'absolute',
    bottom: 280,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: "'Cormorant', serif",
    fontStyle: 'italic',
    fontSize: 40,
    color: 'rgba(232, 192, 104, 0.92)',
    fontWeight: 400,
    letterSpacing: '0.14em',
  };

  const btnBase: CSSProperties = {
    padding: '12px 24px',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    fontFamily: 'var(--font-heading)',
    cursor: 'pointer',
    minHeight: 48,
    border: 'none',
    transition: 'opacity 0.2s ease',
  };

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          width: DISPLAY_W,
          height: DISPLAY_H,
          margin: '0 auto',
          overflow: 'hidden',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          position: 'relative',
        }}
        aria-label="相性カードプレビュー（縦長 9:16）"
      >
        <div ref={cardRef} style={cardStyle}>
          <div style={topBarStyle} aria-hidden="true">
            <span>{signLabel ?? ''}</span>
            <span>{dateText}</span>
          </div>

          <div style={charaRowStyle}>
            <div style={charaWrapStyle}>
              <CharaAvatar id={charaIdA} size={240} />
            </div>
            <span style={separatorStyle} aria-hidden="true">×</span>
            <div style={charaWrapStyle}>
              <CharaAvatar id={charaIdB} size={240} />
            </div>
          </div>

          <p style={rankBadgeStyle}>{RANK_PREFIX[rank]}</p>
          <p style={rankLabelStyle}>{rankLabel}</p>
          <p style={pairTextStyle}>{pairText}</p>

          <span style={footerStyle} aria-hidden="true">
            yorunokotoba
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          marginTop: 14,
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          aria-label="シェアする"
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
          aria-label="画像を保存"
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
          aria-label="Xに投稿"
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
