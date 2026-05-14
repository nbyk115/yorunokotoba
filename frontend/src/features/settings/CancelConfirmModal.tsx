/**
 * CancelConfirmModal — Premium 解約の確認モーダル.
 *
 * 法務的明示（特商法 + 利用規約準拠）:
 *   - 次回更新日まで利用可能であること
 *   - 日割返金はないこと
 */

import { useState } from 'react';
import { cancelSubscription } from '@/lib/subscription';
import { track } from '@/lib/analytics';

interface CancelConfirmModalProps {
  onClose: () => void;
  onCanceled: () => void;
  currentPeriodEndIso: string | null;
}

export function CancelConfirmModal({
  onClose,
  onCanceled,
  currentPeriodEndIso,
}: CancelConfirmModalProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setPending(true);
    setError(null);
    try {
      await cancelSubscription();
      track('subscription_cancel', { reason: 'user_initiated' });
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
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--card-solid)',
          border: '1px solid var(--border)',
          borderRadius: 18,
          padding: 'var(--sp-5)',
          maxWidth: 360,
          width: '100%',
        }}
      >
        <h3
          id="cancel-modal-title"
          style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)', margin: '0 0 12px' }}
        >
          Premium を解約する？
        </h3>
        <p style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.8, margin: '0 0 8px' }}>
          解約しても、{currentPeriodEndIso ? formatIsoDate(currentPeriodEndIso) : '次回更新日'}まではそのまま使えるよ。
        </p>
        <p style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.7, margin: '0 0 20px' }}>
          ※ 残り期間の日割返金はないよ。<br />
          ※ 次回更新日の前日23:59 までに解約すれば、翌日以降の課金は止まるよ。
        </p>

        {error && (
          <p style={{ fontSize: 11, color: 'var(--rose)', margin: '0 0 12px' }}>{error}</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={pending}
            style={{
              minHeight: 44,
              padding: '10px 24px',
              borderRadius: 12,
              border: '1px solid var(--rose)',
              background: 'transparent',
              color: 'var(--rose)',
              fontSize: 13,
              fontWeight: 700,
              cursor: pending ? 'wait' : 'pointer',
              opacity: pending ? 0.6 : 1,
            }}
          >
            {pending ? '処理中…' : 'うん、解約する'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            style={{
              minHeight: 44,
              padding: '10px 24px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, var(--rose), var(--pink))',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: pending ? 'wait' : 'pointer',
              opacity: pending ? 0.6 : 1,
            }}
          >
            やっぱり続ける
          </button>
        </div>
      </div>
    </div>
  );
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
