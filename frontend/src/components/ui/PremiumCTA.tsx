/**
 * PremiumCTA — Premium 課金導線（UnivaPay scaffold + Email link auth）.
 *
 * userId あり: onClick → startCheckout() で checkoutUrl を取得 → 同タブで遷移
 * userId なし: メール入力 → sendEmailLink → メール確認 → リンクから戻ると App.tsx
 *              の handleEmailLinkSignInOnLoad が完了 → useCurrentUser 経由で userId
 *              が入る → ボタンを再タップして checkout
 *
 * 価格: ¥980/月（SSOT: docs/strategy/pricing-decision.md, 2026-05-14 確定）
 */

import { useState } from 'react';
import { track } from '@/lib/analytics';
import { startCheckout } from '@/lib/subscription';
import { sendEmailLink } from '@/lib/auth';

export const PREMIUM_PRICE_LABEL = '月¥980' as const;

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
  priceLabel = PREMIUM_PRICE_LABEL,
  headline = 'For Premium readers',
  description = '守護キャラからの私信を、夜ごとに読み解けます',
}: PremiumCTAProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'idle' | 'email-input' | 'email-sent'>('idle');
  const [email, setEmail] = useState('');

  async function handleCheckoutClick() {
    if (!userId) {
      track('compat_paywall_auth_prompt', { source });
      setMode('email-input');
      return;
    }
    track('compat_paywall_tap', { source });
    setPending(true);
    setError(null);
    try {
      const { checkoutUrl } = await startCheckout({
        userId,
        plan: 'premium_monthly',
      });
      window.location.href = checkoutUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'checkout error');
      setPending(false);
    }
  }

  async function handleSendEmailLink(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError('メールアドレスの形式が正しくないみたい');
      return;
    }
    track('compat_paywall_email_submit', { source });
    setPending(true);
    setError(null);
    try {
      await sendEmailLink(email.trim());
      setMode('email-sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'sign-in link send failed');
    } finally {
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
      {mode === 'idle' && (
        <button
          type="button"
          onClick={handleCheckoutClick}
          disabled={pending}
          style={primaryButtonStyle(pending)}
        >
          {pending ? '起動中…' : `続きを読む · ${priceLabel}`}
        </button>
      )}

      {mode === 'email-input' && (
        <form onSubmit={handleSendEmailLink} style={{ marginTop: 4 }}>
          <p style={{ fontSize: 11, color: 'var(--t2)', margin: '0 0 10px', lineHeight: 1.7 }}>
            続きを読むには、メールアドレスでログインしてね。
            <br />
            ※パスワード不要。届いたリンクをタップするだけ。
          </p>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              minHeight: 44,
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--t1)',
              fontSize: 13,
              marginBottom: 10,
            }}
          />
          <button type="submit" disabled={pending} style={primaryButtonStyle(pending)}>
            {pending ? '送信中…' : 'ログインリンクを送る'}
          </button>
        </form>
      )}

      {mode === 'email-sent' && (
        <div style={{ marginTop: 4 }}>
          <p style={{ fontSize: 13, color: 'var(--t1)', margin: '0 0 6px', lineHeight: 1.7 }}>
            ✉️ メールを送ったよ
          </p>
          <p style={{ fontSize: 11, color: 'var(--t2)', margin: 0, lineHeight: 1.7 }}>
            届いたメールのリンクをタップして戻ってきてね。
            <br />
            ログインできたら、もう一度「続きを読む」を押してね。
          </p>
        </div>
      )}

      {error && (
        <p style={{ fontSize: 11, color: 'var(--rose)', marginTop: 8 }}>
          {error}
        </p>
      )}
    </div>
  );
}

function primaryButtonStyle(pending: boolean): React.CSSProperties {
  return {
    minHeight: 44,
    width: '100%',
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
  };
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
