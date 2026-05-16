/**
 * CancelConfirmModal: Premium 解約の確認モーダル.
 *
 * 法務的明示（特商法 + 利用規約準拠）:
 *   - 価格 ¥980/月 を再表示（消費者保護の観点）
 *   - 次回更新日まで利用可能であること
 *   - 日割返金はないこと
 *
 * ダークパターン回避（消費者庁2025年強化方針対応）:
 *   - 「解約」「継続」を視覚的に同等の重みで表示
 *   - 「継続」を強調しない（Confirmshaming 回避）
 *
 * a11y: ESC で閉じる + フォーカストラップ + scroll lock
 */

import { useRef, useState } from 'react';
import { cancelSubscription } from '@/lib/subscription';
import { track } from '@/lib/analytics';
import { useModalA11y } from '@/lib/useModalA11y';
import { PREMIUM_PRICE_LABEL } from '@/components/ui/PremiumCTA';

interface CancelConfirmModalProps {
  onClose: () => void;
  onCanceled: () => void;
  currentPeriodEndIso: string | null;
}

/**
 * 解約理由の選択肢. pricing-decision.md Section 5 の「"高すぎる" 比率 < 20%」
 * 監視のため、解約イベントに reason を付与して GA4 で集計する.
 */
type CancelReason = 'too_expensive' | 'unused' | 'content_lacking' | 'other';

const REASON_LABELS: Record<CancelReason, string> = {
  too_expensive: '高いと感じた',
  unused: 'あまり使わなかった',
  content_lacking: '内容が物足りない',
  other: 'その他',
};

export function CancelConfirmModal({
  onClose,
  onCanceled,
  currentPeriodEndIso,
}: CancelConfirmModalProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState<CancelReason | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const initialRef = useRef<HTMLButtonElement>(null);

  useModalA11y({
    open: true,
    onClose: pending ? () => {} : onClose,
    dialogRef,
    initialFocusRef: initialRef,
  });

  async function handleConfirm() {
    if (!reason) {
      setError('やめる理由を選んでね');
      return;
    }
    setPending(true);
    setError(null);
    try {
      await cancelSubscription();
      track('subscription_cancel', { reason });
      onCanceled();
    } catch (err) {
      console.error('[CancelConfirmModal] cancel failed', err);
      setError('うまくつながらなかったみたい。もう一度試してね');
      setPending(false);
    }
  }

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="cancel-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'var(--sp-5)',
      }}
      onClick={pending ? undefined : onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--card-solid)',
          border: '1px solid var(--border)',
          borderRadius: 18,
          padding: 'var(--sp-5)',
          maxWidth: 360,
          width: '100%',
          outline: 'none',
        }}
      >
        <h3
          id="cancel-modal-title"
          style={{ fontSize: 'var(--fs-h3)', fontWeight: 700, color: 'var(--t1)', margin: '0 0 12px' }}
        >
          Premium を解約する？
        </h3>
        <p style={{ fontSize: 'var(--fs-caption)', color: 'var(--t2)', lineHeight: 1.7, margin: '0 0 12px' }}>
          現在: {PREMIUM_PRICE_LABEL}
        </p>
        <p style={{ fontSize: 'var(--fs-caption)', color: 'var(--t1)', lineHeight: 1.8, margin: '0 0 8px' }}>
          解約しても、{currentPeriodEndIso ? formatIsoDate(currentPeriodEndIso) : '次回更新日'}まではそのまま使えるよ。
        </p>
        <p style={{ fontSize: 'var(--fs-micro)', color: 'var(--t3)', lineHeight: 1.7, margin: '0 0 16px' }}>
          ※ 残り期間の日割返金はないよ。<br />
          ※ 次回更新日の前日23:59 までに解約すれば、翌日以降の課金は止まるよ。
        </p>

        {/* 解約理由（M3 価格 A/B 判断材料、pricing-decision.md Section 5） */}
        <fieldset style={{ border: 'none', padding: 0, margin: '0 0 16px' }}>
          <legend
            style={{
              fontSize: 'var(--fs-caption)',
              color: 'var(--t2)',
              margin: '0 0 8px',
              fontWeight: 700,
            }}
          >
            よかったら理由を教えてね
          </legend>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(Object.keys(REASON_LABELS) as CancelReason[]).map((key) => (
              <label
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 4px',
                  cursor: pending ? 'not-allowed' : 'pointer',
                  fontSize: 'var(--fs-caption)',
                  color: 'var(--t1)',
                }}
              >
                <input
                  type="radio"
                  name="cancel-reason"
                  value={key}
                  checked={reason === key}
                  onChange={() => setReason(key)}
                  disabled={pending}
                  style={{ accentColor: 'var(--rose)' }}
                />
                {REASON_LABELS[key]}
              </label>
            ))}
          </div>
        </fieldset>

        {error && (
          <p
            role="alert"
            style={{ fontSize: 'var(--fs-micro)', color: 'var(--rose)', margin: '0 0 12px' }}
          >
            {error}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            ref={initialRef}
            type="button"
            onClick={handleConfirm}
            disabled={pending}
            style={equalWeightButtonStyle(pending, 'danger')}
          >
            {pending ? '処理中…' : 'うん、解約する'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            style={equalWeightButtonStyle(pending, 'neutral')}
          >
            やっぱり続ける
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * ダークパターン回避: 両ボタンを同等の視覚的重みで表示.
 * danger: 解約（注意色のアウトライン）
 * neutral: 継続（淡色のアウトライン）
 * どちらもアウトラインで、CTAを「継続」側に視覚誘導しない.
 */
function equalWeightButtonStyle(
  pending: boolean,
  variant: 'danger' | 'neutral',
): React.CSSProperties {
  const color = variant === 'danger' ? 'var(--rose)' : 'var(--t1)';
  const borderColor = variant === 'danger' ? 'var(--rose)' : 'var(--border)';
  return {
    minHeight: 44,
    padding: '10px 24px',
    borderRadius: 12,
    border: `1px solid ${borderColor}`,
    background: 'transparent',
    color,
    fontSize: 'var(--fs-caption)',
    fontWeight: 700,
    cursor: pending ? 'wait' : 'pointer',
    opacity: pending ? 0.6 : 1,
  };
}

function formatIsoDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  } catch {
    return iso;
  }
}
