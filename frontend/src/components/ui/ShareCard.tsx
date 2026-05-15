import { useRef, type CSSProperties } from 'react';
import { toPng } from 'html-to-image';
import { CharaAvatar } from './CharaAvatar';
import { track } from '@/lib/analytics';

/** シェアテキストに添える招待誘引 + URL（K値計測用） */
function buildShareText(title: string, subtitle: string): string {
  const url = typeof window !== 'undefined' ? window.location.origin : '';
  const head = subtitle ? `${title} · ${subtitle}` : title;
  return `${head}\n友達の星座を入れると相性が見れるよ\n${url} #よるのことば`;
}

type CardTheme = 'rose' | 'gold' | 'lavender';

interface ShareCardProps {
  title: string;
  subtitle: string;
  body: string;
  charaId?: string;
  theme?: CardTheme;
  /** トップ右に出す日付ラベル（例: "5.8 ✦"）。未指定時は現在日付 */
  dateLabel?: string;
  /** トップ左に出すコンテキスト（例: "蠍座 · みおの夜"）。未指定なら非表示 */
  signLabel?: string;
  /** ラッキーナンバー（例: 12）。指定時は大型 Cormorant italic で中央上部に */
  luckyNumber?: number | string;
  /** ラッキーナンバーの注釈（例: "Lucky"）。luckyNumber と併用 */
  luckyNumberLabel?: string;
  /** 月相絵文字（例: 🌖）。トップ左の signLabel 下に併記 */
  moonPhase?: string;
}

function getDefaultDateLabel(): string {
  const d = new Date();
  return `${d.getMonth() + 1}.${d.getDate()} ✦`;
}

const THEME_GRADIENTS: Record<CardTheme, string> = {
  rose: 'linear-gradient(135deg, #E8627C, #D4506A)',
  gold: 'linear-gradient(135deg, #D4A853, #B8893A)',
  lavender: 'linear-gradient(135deg, #B08ACF, #9068B0)',
};

const CARD_SIZE = 1080;
/** display 上の縮小比率 */
const DISPLAY_SCALE = 0.32;
const DISPLAY_SIZE = Math.round(CARD_SIZE * DISPLAY_SCALE);

export function ShareCard({
  title,
  subtitle,
  body,
  charaId,
  theme = 'rose',
  dateLabel,
  signLabel,
  luckyNumber,
  luckyNumberLabel,
  moonPhase,
}: ShareCardProps) {
  const dateText = dateLabel ?? getDefaultDateLabel();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleSave = async () => {
    if (!cardRef.current) return;
    try {
      // フル解像度でキャプチャするため scale を指定
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 1,
        width: CARD_SIZE,
        height: CARD_SIZE,
      });
      const link = document.createElement('a');
      link.download = 'yorunokotoba-share.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('ShareCard: PNG 生成に失敗しました', err);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 1,
        width: CARD_SIZE,
        height: CARD_SIZE,
      });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], 'yorunokotoba-share.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'よるのことば',
          text: buildShareText(title, subtitle),
          files: [file],
        });
        track('share_result', { theme, has_chara: Boolean(charaId), surface: 'web_share' });
      } else {
        await handleSave();
        track('share_result', { theme, has_chara: Boolean(charaId), surface: 'fallback_save' });
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('ShareCard: シェアに失敗しました', err);
      }
    }
  };

  /* ────── カード本体スタイル（1080×1080px 固定） ────── */
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
    // 縮小表示用
    transform: `scale(${DISPLAY_SCALE})`,
    transformOrigin: 'top left',
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
    fontSize: 32,
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

  const titleStyle: CSSProperties = {
    fontFamily: "'Cormorant', serif",
    fontStyle: 'italic',
    fontWeight: 300,
    fontSize: 64,
    lineHeight: 1.3,
    color: '#F0E8EC',
    margin: 0,
    textAlign: 'center',
    letterSpacing: '0.01em',
  };

  const subtitleStyle: CSSProperties = {
    fontSize: 36,
    fontWeight: 500,
    color: 'rgba(240,232,236,0.75)',
    margin: 0,
    textAlign: 'center',
  };

  const bodyStyle: CSSProperties = {
    fontSize: 30,
    fontWeight: 400,
    color: 'rgba(240,232,236,0.68)',
    margin: 0,
    textAlign: 'center',
    lineHeight: 1.7,
    maxWidth: 840,
  };

  const accentLineStyle: CSSProperties = {
    width: 60,
    height: 3,
    background: THEME_GRADIENTS[theme],
    borderRadius: 2,
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

  /* ────── ボタン共通スタイル ────── */
  const btnBase: CSSProperties = {
    padding: '10px 20px',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
    fontFamily: 'var(--font-heading)',
    cursor: 'pointer',
    minHeight: 44,
    border: 'none',
    transition: 'opacity 0.2s ease',
  };

  return (
    <div>
      {/* 縮小表示ラッパー */}
      <div
        style={{
          width: DISPLAY_SIZE,
          height: DISPLAY_SIZE,
          overflow: 'hidden',
          borderRadius: Math.round(48 * DISPLAY_SCALE),
          boxShadow: '0 4px 24px rgba(0,0,0,0.20)',
          position: 'relative',
        }}
        aria-label="シェアカードプレビュー"
      >
        <div ref={cardRef} style={cardStyle}>
          {/* グラデーションオーバーレイ */}
          <div style={gradientOverlayStyle} aria-hidden="true" />

          {/* トップ右: 日付（月+日） */}
          <span style={dateBadgeStyle} aria-hidden="true">
            {dateText}
          </span>

          {/* トップ左: 星座+名前（任意） + 月相絵文字（任意） */}
          {signLabel && (
            <span style={signBadgeStyle} aria-hidden="true">
              {signLabel}
              {moonPhase && <span style={{ marginLeft: 12, fontSize: 32 }}>{moonPhase}</span>}
            </span>
          )}

          {/* 夜のキャラ */}
          {charaId && <CharaAvatar id={charaId} size={180} />}

          {/* ラッキーナンバー大型表示（任意） — Spotify Wrapped 型の "あなただけの数字" */}
          {luckyNumber !== undefined && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0,
                margin: '8px 0',
              }}
              aria-hidden="true"
            >
              {luckyNumberLabel && (
                <span
                  style={{
                    fontFamily: "'Cormorant', serif",
                    fontStyle: 'italic',
                    fontSize: 28,
                    color: '#E8C068',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    fontWeight: 300,
                  }}
                >
                  {luckyNumberLabel}
                </span>
              )}
              <span
                style={{
                  fontFamily: "'Cormorant', serif",
                  fontStyle: 'italic',
                  fontSize: 180,
                  fontWeight: 300,
                  lineHeight: 1,
                  color: '#F0E8EC',
                  textShadow: '0 4px 32px rgba(232, 192, 104, 0.3)',
                  letterSpacing: '-0.04em',
                }}
              >
                {luckyNumber}
              </span>
            </div>
          )}

          {/* テキスト群 */}
          <p style={titleStyle}>{title}</p>
          <div style={accentLineStyle} aria-hidden="true" />
          <p style={subtitleStyle}>{subtitle}</p>
          <p style={bodyStyle}>{body}</p>

          {/* フッター（gold Cormorant italic 30px・センタリング） */}
          <span style={footerStyle} aria-hidden="true">
            yorunokotoba · よるのことば
          </span>
        </div>
      </div>

      {/* アクションボタン群 */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginTop: 12,
          justifyContent: 'center',
        }}
      >
        <button
          style={{
            ...btnBase,
            background: 'linear-gradient(135deg, var(--rose), var(--pink))',
            color: '#fff',
          }}
          onClick={handleSave}
        >
          画像を保存
        </button>
        <button
          style={{
            ...btnBase,
            background: 'var(--card)',
            color: 'var(--t1)',
            border: '1px solid var(--border)',
          }}
          onClick={handleShare}
        >
          シェア
        </button>
      </div>
    </div>
  );
}
