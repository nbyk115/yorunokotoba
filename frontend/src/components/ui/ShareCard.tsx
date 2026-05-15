import { useRef, type CSSProperties } from 'react';
import { toPng } from 'html-to-image';
import { CharaAvatar } from './CharaAvatar';

type CardTheme = 'rose' | 'gold' | 'lavender';

interface ShareCardProps {
  title: string;
  subtitle: string;
  body: string;
  charaId?: string;
  theme?: CardTheme;
  /** トップ右に出す日付ラベル. 未指定時は現在日付 */
  dateLabel?: string;
  /** トップ左の星座+名前. 例: "蠍座 · みおの夜" */
  signLabel?: string;
}

function getDefaultDateLabel(): string {
  const d = new Date();
  return `${d.getMonth() + 1}.${d.getDate()}`;
}

const THEME_GRADIENTS: Record<CardTheme, string> = {
  rose: 'linear-gradient(160deg, #2A1A24 0%, #4A2A35 60%, #6B3245 100%)',
  gold: 'linear-gradient(160deg, #2A2018 0%, #4A3520 60%, #6B4828 100%)',
  lavender: 'linear-gradient(160deg, #1F1A2E 0%, #352848 60%, #4D3870 100%)',
};

const CARD_SIZE = 1080;
/** display 上の縮小比率（プレビューサイズ） */
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
}: ShareCardProps) {
  const dateText = dateLabel ?? getDefaultDateLabel();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleSave = async () => {
    if (!cardRef.current) return;
    try {
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
      console.error('ShareCard: PNG 生成に失敗', err);
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
          text: `${title} ${subtitle ? `· ${subtitle}` : ''} #よるのことば`,
          files: [file],
        });
      } else {
        await handleSave();
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('ShareCard: シェア失敗', err);
      }
    }
  };

  /* ────── カード本体（1080×1080）────── */
  const cardStyle: CSSProperties = {
    width: CARD_SIZE,
    height: CARD_SIZE,
    background: THEME_GRADIENTS[theme],
    borderRadius: 48,
    padding: '120px 80px 100px',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
    fontFamily: "'Zen Maru Gothic', 'Hiragino Maru Gothic Pro', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    // 縮小プレビュー用. top center で水平中央揃え.
    transform: `scale(${DISPLAY_SCALE})`,
    transformOrigin: 'top center',
  };

  /* ────── ヘッダー（top の日付 + sign）絶対配置 ────── */
  const topBarStyle: CSSProperties = {
    position: 'absolute',
    top: 64,
    left: 80,
    right: 80,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: "'Zen Maru Gothic', sans-serif",
    fontSize: 26,
    color: 'rgba(240,232,236,0.55)',
    letterSpacing: '0.08em',
  };

  /* ────── キャラ ────── */
  const charaWrapStyle: CSSProperties = {
    width: 240,
    height: 240,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.06)',
    border: '4px solid rgba(255,255,255,0.18)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  /* ────── ランク英字（H1）────── */
  const titleStyle: CSSProperties = {
    fontFamily: "'Cormorant', serif",
    fontStyle: 'italic',
    fontWeight: 400,
    fontSize: 120,
    lineHeight: 1.1,
    color: '#F0E8EC',
    textAlign: 'center',
    margin: 0,
    letterSpacing: '0.01em',
    textShadow: '0 4px 24px rgba(0,0,0,0.3)',
  };

  /* ────── タイプ識別子（H2）────── */
  const subtitleStyle: CSSProperties = {
    fontSize: 42,
    fontWeight: 700,
    color: '#F0E8EC',
    margin: 0,
    textAlign: 'center',
    letterSpacing: '0.04em',
  };

  /* ────── 1 行詩（Body）────── */
  const bodyStyle: CSSProperties = {
    fontSize: 32,
    fontWeight: 400,
    color: 'rgba(240,232,236,0.78)',
    margin: 0,
    textAlign: 'center',
    lineHeight: 1.6,
    maxWidth: 800,
  };

  /* ────── footer（ブランド）────── */
  const footerStyle: CSSProperties = {
    position: 'absolute',
    bottom: 64,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: "'Cormorant', serif",
    fontStyle: 'italic',
    fontSize: 32,
    color: 'rgba(232, 192, 104, 0.9)',
    fontWeight: 400,
    letterSpacing: '0.12em',
  };

  /* ────── ボタン共通 ────── */
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
      {/* 縮小プレビュー: width/height 固定で内側 cardRef が scale で収まる */}
      <div
        style={{
          width: DISPLAY_SIZE,
          height: DISPLAY_SIZE,
          margin: '0 auto',
          overflow: 'hidden',
          borderRadius: Math.round(48 * DISPLAY_SCALE),
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          position: 'relative',
        }}
        aria-label="シェアカードプレビュー"
      >
        <div ref={cardRef} style={cardStyle}>
          {/* ヘッダー: 星座+名前（左）/ 日付（右）*/}
          <div style={topBarStyle} aria-hidden="true">
            <span>{signLabel ?? ''}</span>
            <span>{dateText}</span>
          </div>

          {/* キャラ */}
          {charaId && (
            <div style={charaWrapStyle}>
              <CharaAvatar id={charaId} size={200} />
            </div>
          )}

          {/* ランク英字 */}
          <p style={titleStyle}>{title}</p>

          {/* タイプ識別子 */}
          {subtitle && <p style={subtitleStyle}>{subtitle}</p>}

          {/* 1 行詩 */}
          {body && <p style={bodyStyle}>{body}</p>}

          {/* footer */}
          <span style={footerStyle} aria-hidden="true">
            yorunokotoba
          </span>
        </div>
      </div>

      {/* アクションボタン群（プライマリ = シェア、セカンダリ = 保存）*/}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginTop: 14,
          justifyContent: 'center',
        }}
      >
        <button
          type="button"
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
      </div>
    </div>
  );
}
