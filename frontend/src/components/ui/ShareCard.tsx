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
}: ShareCardProps) {
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
          text: title,
          files: [file],
        });
      } else {
        // Web Share API が使えない場合はダウンロードにフォールバック
        await handleSave();
      }
    } catch (err) {
      // AbortError はユーザーキャンセルなので無視
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
    opacity: 0.12,
    pointerEvents: 'none',
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
    right: 80,
    fontSize: 24,
    color: 'rgba(240,232,236,0.40)',
    fontWeight: 400,
    letterSpacing: '0.05em',
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

          {/* 守護キャラ */}
          {charaId && <CharaAvatar id={charaId} size={180} />}

          {/* テキスト群 */}
          <p style={titleStyle}>{title}</p>
          <div style={accentLineStyle} aria-hidden="true" />
          <p style={subtitleStyle}>{subtitle}</p>
          <p style={bodyStyle}>{body}</p>

          {/* フッター */}
          <span style={footerStyle} aria-hidden="true">
            よるのことば
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
