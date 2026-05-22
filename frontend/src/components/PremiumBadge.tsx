/**
 * PremiumBadge: プレミアム/プレビューバッジの共通コンポーネント。
 * gold 基調で統一し、無料カードのバッジと視覚的に差をつける。
 * --rose は CTA 専用のため使わない。
 */

interface PremiumBadgeProps {
  /** 表示テキスト。省略時は「プレミアム機能(プレビュー公開中)」 */
  label?: string;
}

export function PremiumBadge({ label = 'プレミアム機能(プレビュー公開中)' }: PremiumBadgeProps) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: 'var(--gold)',
        background: 'rgba(212, 168, 83, 0.12)',
        border: '1px solid rgba(212, 168, 83, 0.35)',
        borderRadius: 'var(--r-button)',
        padding: '2px 8px',
        whiteSpace: 'nowrap',
        letterSpacing: 0.2,
      }}
    >
      {label}
    </span>
  );
}
