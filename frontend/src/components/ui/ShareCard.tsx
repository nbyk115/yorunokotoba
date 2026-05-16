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

/**
 * テーマ別の深夜背景色。単色ベタ塗りから脱却し、
 * インクブルー基調 (#0E0C18) を土台に各テーマのトーンをごく淡く重ねる設計。
 * DESIGN.md: 夜系背景はインクブルー1色相で明度差のみ。
 */
const THEME_OVERLAY: Record<CardTheme, string> = {
  rose: 'rgba(226,122,142,0.09)',   // --rose に極薄サテュレーション
  gold: 'rgba(201,169,97,0.08)',    // --gold に極薄ウォームトーン
  lavender: 'rgba(138,135,184,0.09)', // --lavender に極薄クール
};

/**
 * テーマ別のゴールドライン色。DESIGN.md: --gold が唯一の上質アクセント。
 * rose テーマは --rose をごく薄く使うが金で統一させる。
 */
const THEME_ACCENT: Record<CardTheme, string> = {
  rose: 'rgba(201,169,97,0.70)',
  gold: 'rgba(201,169,97,0.85)',
  lavender: 'rgba(201,169,97,0.70)',
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
  // title はランク英字 (GREAT FORTUNE 等) 用に巨大表示する設計.
  // 日本語 title が渡る場合はサイズを落とす.
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

  const accent = THEME_ACCENT[theme];
  const overlay = THEME_OVERLAY[theme];

  /*
   * ══════════════════════════════════════════════
   * カードデザイン仕様
   * ══════════════════════════════════════════════
   * 基本構造 (1080x1920):
   *   - 土台: インクブルー深夜 #0E0C18 + テーマ極薄オーバーレイ
   *   - 装飾: 上辺 1px ゴールド内側ライン + 四辺 ゴールド細枠 + 中央縦割り金線
   *   - 階層: topbar（日付/星座）/ charaAvatar / titleBlock / bodyBlock / footer
   *   - フォント: Cormorant italic が主役. Zen Maru Gothic は補助
   *   - 余白: IG safe area 上下 260px, 左右 88px
   *
   * DESIGN.md 準拠:
   *   - インクブルー基調 + ゴールド1点アクセント
   *   - Cormorant: ヒーロー英字と引用句のみ
   *   - 引き算: 装飾は主役カードのみ、視線を占い結果へ導く
   *   - 光源上方: inset 上辺ハイライト線で立体感
   */

  /* ────── カード本体 ────── */
  const cardStyle: CSSProperties = {
    width: CARD_W,
    height: CARD_H,
    // インクブルー深夜基調 - 単色ベタ塗りから「深み」へ
    background: '#0E0C18',
    borderRadius: 0,
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
    fontFamily: "'Zen Maru Gothic', 'Hiragino Maru Gothic Pro', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    // IG ストーリー上下安全領域 260px
    padding: '260px 88px',
    gap: 0,
    transform: `scale(${DISPLAY_SCALE})`,
    transformOrigin: 'top left',
  };

  /* ────── テーマカラーの極薄オーバーレイ（単色ベタ塗りから脱却）────── */
  const themeOverlayStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: overlay,
    pointerEvents: 'none',
  };

  /* ────── 四辺ゴールド細枠（品格ライン）────── */
  const borderFrameStyle: CSSProperties = {
    position: 'absolute',
    inset: 48,
    border: `1px solid ${accent}`,
    borderRadius: 0,
    pointerEvents: 'none',
  };

  /* ────── 上辺 inset ハイライト線（DESIGN.md: 光源上方）────── */
  const topHighlightStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    background: 'rgba(255,255,255,0.06)',
    pointerEvents: 'none',
  };

  /* ────── ヘッダー（IG safe area 内、枠内上端に配置）────── */
  const topBarStyle: CSSProperties = {
    position: 'absolute',
    top: 120,
    left: 120,
    right: 120,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: "'Zen Maru Gothic', sans-serif",
    fontSize: 30,
    color: 'rgba(244,241,246,0.45)',
    letterSpacing: '0.10em',
  };

  /* ────── ヘッダー中央の横線装飾（サブタイトル区切り）────── */
  // GRADIENT-001: linear-gradient 直書き禁止のため、ゴールドカラーを薄く単色で使用
  const topDividerStyle: CSSProperties = {
    position: 'absolute',
    top: 176,
    left: 120,
    right: 120,
    height: 1,
    background: accent,
    opacity: 0.30,
  };

  /* ────── キャラアバター（上部コンテンツの中心）────── */
  const charaWrapStyle: CSSProperties = {
    width: 400,
    height: 400,
    borderRadius: '50%',
    // インクブルー + 極薄白で奥行きを出す
    background: 'rgba(255,255,255,0.04)',
    border: `2px solid ${accent}`,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 72,
    // DESIGN.md: 主役カードのみ rose 系ごく淡いグローで浮きを補強
    boxShadow: `0 0 60px rgba(201,169,97,0.12), 0 8px 40px rgba(0,0,0,0.5)`,
    flexShrink: 0,
  };

  /* ────── ランク英字（Cormorant 主役）────── */
  const titleStyle: CSSProperties = {
    fontFamily: isAsciiTitle
      ? "'Cormorant', serif"
      : "'Zen Maru Gothic', 'Hiragino Maru Gothic Pro', sans-serif",
    fontStyle: isAsciiTitle ? 'italic' : 'normal',
    fontWeight: isAsciiTitle ? 300 : 700,
    // ASCII (ランク英字) は大きく。日本語タイトルは適切なサイズに
    fontSize: isAsciiTitle ? 196 : 80,
    lineHeight: 1.0,
    // 白ではなくクリーム寄りのオフホワイト: 深夜背景に馴染む
    color: '#EDE8F0',
    textAlign: 'center',
    margin: 0,
    letterSpacing: isAsciiTitle ? '0.04em' : '0.02em',
    // 奥行き感: 黒ではなくインクブルー系のシャドウ
    textShadow: '0 4px 24px rgba(0,0,0,0.60)',
    maxWidth: 900,
    wordBreak: 'keep-all',
    flexShrink: 0,
  };

  /* ────── ゴールドアクセントライン（タイトルとサブタイトルの間）────── */
  const midLineStyle: CSSProperties = {
    width: 80,
    height: 1,
    background: accent,
    margin: '40px auto',
    flexShrink: 0,
  };

  /* ────── サブタイトル（タイプ識別子）────── */
  const subtitleStyle: CSSProperties = {
    fontFamily: "'Zen Maru Gothic', sans-serif",
    fontSize: 32,
    fontWeight: 500,
    color: 'rgba(244,241,246,0.62)',
    margin: 0,
    textAlign: 'center',
    letterSpacing: '0.14em',
    flexShrink: 0,
  };

  /* ────── 本文（占い結果・読ませる主役）────── */
  const bodyStyle: CSSProperties = {
    fontSize: 38,
    fontWeight: 400,
    color: 'rgba(244,241,246,0.82)',
    margin: '56px 0 0',
    textAlign: 'center',
    lineHeight: 1.9,
    maxWidth: 860,
    letterSpacing: '0.04em',
    flexShrink: 0,
  };

  /* ────── フッター（ブランド名・IG safe area 内下端）────── */
  const footerStyle: CSSProperties = {
    position: 'absolute',
    bottom: 112,
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  };

  const footerLineStyle: CSSProperties = {
    width: 48,
    height: 1,
    background: accent,
    opacity: 0.6,
  };

  const footerBrandStyle: CSSProperties = {
    fontFamily: "'Cormorant', serif",
    fontStyle: 'italic',
    fontSize: 36,
    color: accent,
    fontWeight: 300,
    letterSpacing: '0.22em',
    textTransform: 'lowercase',
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
          // プレビュー外枠: 深夜感を出す黒系シャドウ（DESIGN.md: 黒系 rgba のみ）
          boxShadow: '0 8px 40px rgba(0,0,0,0.50)',
          position: 'relative',
        }}
        aria-label="シェアカードプレビュー（縦長 9:16）"
      >
        <div ref={cardRef} style={cardStyle}>

          {/* レイヤー1: テーマカラー極薄オーバーレイ */}
          <div style={themeOverlayStyle} aria-hidden="true" />

          {/* レイヤー2: 四辺ゴールド品格枠 */}
          <div style={borderFrameStyle} aria-hidden="true" />

          {/* レイヤー3: 上辺 inset ハイライト */}
          <div style={topHighlightStyle} aria-hidden="true" />

          {/* ヘッダー: 星座+名前（左）/ 日付（右）*/}
          <div style={topBarStyle} aria-hidden="true">
            <span>{signLabel ?? ''}</span>
            <span>{dateText}</span>
          </div>

          {/* ヘッダー下の横線 */}
          <div style={topDividerStyle} aria-hidden="true" />

          {/* キャラ */}
          {charaId && (
            <div style={charaWrapStyle}>
              <CharaAvatar id={charaId} size={360} />
            </div>
          )}

          {/* ランク英字 - Cormorant 主役 */}
          <p style={titleStyle}>{title}</p>

          {/* ゴールドアクセントライン */}
          {subtitle && <div style={midLineStyle} aria-hidden="true" />}

          {/* タイプ識別子 */}
          {subtitle && <p style={subtitleStyle}>{subtitle}</p>}

          {/* 占い結果本文 */}
          {body && <p style={bodyStyle}>{body}</p>}

          {/* フッター: yorunokotoba ブランド */}
          <div style={footerStyle} aria-hidden="true">
            <div style={footerLineStyle} />
            <span style={footerBrandStyle}>yorunokotoba</span>
          </div>
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
