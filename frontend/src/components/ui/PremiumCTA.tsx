/**
 * PremiumCTA — Premium 課金導線（UnivaPay scaffold）.
 *
 * onClick → startCheckout() でバックエンドに checkoutUrl を要求 → 同タブで遷移。
 *
 * 既知ギャップ（TODO(univapay) 参照）:
 * - userId が undefined の場合は guest ID を生成。本番では Firebase Auth 必須。
 * - 価格は props で渡す（既存 ¥480 と新方針 ¥1,980 の差は意思決定待ち）。
 */

import { useState } from 'react';
import { track } from '@/lib/analytics';
import { startCheckout } from '@/lib/subscription';

interface PremiumCTAProps {
  source: string;
  userId: string | null;
  priceLabel?: string;
  headline?: string;
  description?: string;
}

export function PremiumCTA({
  source,
  userId,
  priceLabel = '月¥480',
  headline = 'For Premium readers',
  description = '守護キャラからの私信を、夜ごとに読み解けます',
}: PremiumCTAProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    track('compat_paywall_tap', { source });
    setPending(true);
    setError(null);
    try {
      const effectiveUserId = userId ?? generateGuestId();
      const { checkoutUrl } = await startCheckout({
        userId: effectiveUserId,
        plan: 'premium_monthly',
      });
      window.location.href = checkoutUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'checkout error');
      setPending(false);
    }
  }

  return (
    <div
      style={{
        marginTop: 16,
        padding: '14px 16px',
        background:
          'linear-gradient(135deg, rgba(232, 192, 104, 0.10), rgba(176, 138, 207, 0.10))',
        border: '1px solid var(--border)',
        borderRadius: 14,
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-accent)',
          fontStyle: 'italic',
          fontSize: 14,
          color: 'var(--gold)',
          margin: '0 0 4px',
          letterSpacing: '0.06em',
        }}
      >
        {headline}
      </p>
      <p
        style={{
          fontSize: 12,
          color: 'var(--t2)',
          margin: '0 0 12px',
          lineHeight: 1.7,
        }}
      >
        {description}
      </p>
      <button
        type="button"
        onClick={handleClick}
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
          fontFamily: 'var(--font-heading)',
          letterSpacing: '0.04em',
          opacity: pending ? 0.6 : 1,
        }}
      >
        {pending ? '起動中…' : `続きを読む · ${priceLabel}`}
      </button>
      {error && (
        <p style={{ fontSize: 11, color: 'var(--rose)', marginTop: 8 }}>
          決済画面を開けませんでした（{error}）
        </p>
      )}
    </div>
  );
}

// TODO(univapay): Firebase Auth 統合後に削除。userId が null の場合の暫定ID生成。
function generateGuestId(): string {
  const stored = localStorage.getItem('ynk_guest_id');
  if (stored) return stored;
  const id = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  try {
    localStorage.setItem('ynk_guest_id', id);
  } catch {
    /* storage unavailable */
  }
  return id;
}
