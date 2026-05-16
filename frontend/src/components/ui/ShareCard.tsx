import { useRef, useState, type CSSProperties } from 'react';
import { toPng } from 'html-to-image';
import { CharaAvatar } from './CharaAvatar';
import { track } from '@/lib/analytics';

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

const THEME_SOLIDS: Record<CardTheme, string> = {
  rose: '#2A1A24',
  gold: '#2A2018',
  lavender: '#1F1A2E',
};

/** Instagram ストーリーズ標準 9:16. ICP は IG ストーリー世代 */
const CARD_W = 1080;
const CARD_H = 1920;
const DISPLAY_SCALE = 0.18;
const DISPLAY_W = Math.round(CARD_W * DISPLAY_SCALE);
const DISPLAY_H = Math.round(CARD_H * DISPLAY_SCALE);

/**
 * iOS Safari html-to-image 既知問題対策: Webフォント未ロードで初回失敗する。
 * リトライ間隔を 300ms 空けて最大 3 回試行する。
 * cacheBust: true でキャッシュ由来の空レンダリングを防ぐ。
 */
async function toPngWithRetry(
  node: HTMLElement,
  options: Parameters<typeof toPng>[1],
  maxRetry = 3,
): Promise<string> {
  let lastErr: unknown;
  for (let i = 0; i < maxRetry; i++) {
    try {
      const dataUrl = await toPng(node, { ...options, cacheBust: true });
      // html-to-image が空 dataUrl を返すケースを検出してリトライ
      if (dataUrl && dataUrl !== 'data:,') return dataUrl;
    } catch (err) {
      lastErr = err;
    }
    // 初回失敗はフォントロード待ち、2回目は描画安定待ち
    await new Promise((r) => setTimeout(r, 300 * (i + 1)));
  }
  throw lastErr ?? new Error('toPng: 空のデータURLが返されました');
}

type ShareStatus = 'idle' | 'loading' | 'success' | 'error' | 'saved';

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
  const [status, setStatus] = useState<ShareStatus>('idle');
  const isAsciiTitle = /^[\x00-\x7F]*$/.test(title);

  const handleSave = async () => {
    if (!cardRef.current) return;
    setStatus('loading');
    try {
      const dataUrl = await toPngWithRetry(cardRef.current, {
        pixelRatio: 1,
        width: CARD_W,
        height: CARD_H,
      });
      const link = document.createElement('a');
      link.download = 'yorunokotoba-share.png';
      link.href = dataUrl;
      link.click();
      track('image_save', { context: 'share_card' });
      setStatus('saved');
    } catch (err) {
      console.error('ShareCard: PNG 生成に失敗', err);
      setStatus('error');
    } finally {
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    setStatus('loading');
    try {
      const dataUrl = await toPngWithRetry(cardRef.current, {
        pixelRatio: 1,
        width: CARD_W,
        height: CARD_H,
      });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], 'yorunokotoba-share.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'よるのことば',
          text: `${title}${subtitle ? ` · ${subtitle}` : ''} #よるのことば`,
          files: [file],
        });
        track('share_result', { context: 'share_card', title });
        setStatus('success');
      } else {
        // canShare が false (PCブラウザ等): ダウンロードにフォールバックしてユーザーに明示
        const link = document.createElement('a');
        link.download = 'yorunokotoba-share.png';
        link.href = dataUrl;
        link.click();
        track('image_save', { context: 'share_card_fallback' });
        setStatus('saved');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // ユーザーがシェアシートをキャンセルした: 静かにリセット
        setStatus('idle');
        return;
      }
      console.error('ShareCard: シェア失敗', err);
      setStatus('error');
    } finally {
      setTimeout(() => setStatus((s) => (s !== 'idle' ? 'idle' : s)), 3500);
    }
  };

  /* ────── フィードバックメッセージ ────── */
  const feedbackMessage: Record<ShareStatus, string> = {
    idle: '',
    loading: '画像を生成中...',
    success: 'シェアしました',
    error: 'うまくいかなかった。もう一度試してみて',
    saved: '画像を保存しました',
  };

  /* ────── カード本体（1080×1920 縦長・Instagram ストーリーズ）────── */
  const cardStyle: CSSProperties = {
    width: CARD_W,
    height: CARD_H,
    background: THEME_SOLIDS[theme],
    borderRadius: 0,
    // IG ストーリー上下安全領域 250px（上下に重要情報を置かない）
    padding: '280px 80px 280px',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
    fontFamily: "'Zen Maru Gothic', 'Hiragino Maru Gothic Pro', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 48,
    transform: `scale(${DISPLAY_SCALE})`,
    transformOrigin: 'top left',
  };

  /* ────── ヘッダー（safe area 内）────── */
  const topBarStyle: CSSProperties = {
    position: 'absolute',
    top: 280,
    left: 80,
    right: 80,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: "'Zen Maru Gothic', sans-serif",
    fontSize: 'var(--fs-hero-en)',
    color: 'rgba(240,232,236,0.6)',
    letterSpacing: '0.08em',
  };

  /* ────── キャラ（縦長で大きく） ────── */
  const charaWrapStyle: CSSProperties = {
    width: 360,
    height: 360,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)',
    border: '6px solid rgba(255,255,255,0.20)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  /* ────── ランク英字（H1・縦長で巨大化）────── */
  const titleStyle: CSSProperties = {
    fontFamily: isAsciiTitle
      ? "'Cormorant', serif"
      : "'Zen Maru Gothic', 'Hiragino Maru Gothic Pro', sans-serif",
    fontStyle: isAsciiTitle ? 'italic' : 'normal',
    fontWeight: isAsciiTitle ? 400 : 700,
    fontSize: isAsciiTitle ? 180 : 88,
    lineHeight: 1.15,
    color: '#F0E8EC',
    textAlign: 'center',
    margin: 0,
    letterSpacing: '0.01em',
    textShadow: '0 6px 32px rgba(0,0,0,0.4)',
    maxWidth: 880,
    wordBreak: 'keep-all',
  };

  /* ────── タイプ識別子（H2）────── */
  const subtitleStyle: CSSProperties = {
    fontSize: 'var(--fs-hero-en)',
    fontWeight: 700,
    color: '#F0E8EC',
    margin: 0,
    textAlign: 'center',
    letterSpacing: '0.04em',
  };

  /* ────── 1 行詩（Body）────── */
  const bodyStyle: CSSProperties = {
    fontSize: 42,
    fontWeight: 400,
    color: 'rgba(240,232,236,0.82)',
    margin: 0,
    textAlign: 'center',
    lineHeight: 1.6,
    maxWidth: 900,
  };

  /* ────── footer（ブランド・safe area 内）────── */
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

  /* ────── ボタン共通 ────── */
  const btnBase: CSSProperties = {
    padding: '12px 24px',
    borderRadius: 12,
    fontSize: 'var(--fs-body)',
    fontWeight: 700,
    fontFamily: 'var(--font-heading)',
    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
    minHeight: 48,
    border: 'none',
    transition: 'opacity 0.2s ease',
    opacity: status === 'loading' ? 0.6 : 1,
  };

  return (
    <div style={{ width: '100%' }}>
      {/* 縮小プレビュー: 9:16 縦長 (Instagram ストーリーズ標準) */}
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
        aria-label="シェアカードプレビュー（縦長 9:16）"
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
              <CharaAvatar id={charaId} size={320} />
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

      {/* フィードバックメッセージ */}
      {status !== 'idle' && (
        <p
          role={status === 'error' ? 'alert' : 'status'}
          style={{
            fontSize: 'var(--fs-caption)',
            color: status === 'error' ? 'var(--rose)' : 'var(--t2)',
            textAlign: 'center',
            marginTop: 8,
            marginBottom: 0,
            lineHeight: 1.5,
          }}
        >
          {feedbackMessage[status]}
        </p>
      )}

      {/* アクションボタン群（プライマリ = シェア、セカンダリ = 保存）*/}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginTop: status !== 'idle' ? 8 : 14,
          justifyContent: 'center',
        }}
      >
        <button
          type="button"
          disabled={status === 'loading'}
          aria-label="シェアする"
          style={{
            ...btnBase,
            background: 'var(--accent-rose)',
            color: '#fff',
          }}
          onClick={handleShare}
        >
          {status === 'loading' ? '生成中...' : 'シェアする'}
        </button>
        <button
          type="button"
          disabled={status === 'loading'}
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
      </div>
    </div>
  );
}
