/**
 * PremiumCTA — Premium 課金導線（UnivaPay + Email link auth + 課金前同意モーダル）.
 *
 * フロー:
 *   1. userId なし → email 入力 → リンク送信 → メール開いて戻る → ログイン → 再タップ
 *   2. userId あり → CheckoutConsentModal で重要事項3点+18歳以上を確認 → recordConsent →
 *      startCheckout
 *
 * 価格: ¥980/月（SSOT: docs/strategy/pricing-decision.md, 2026-05-14 確定）
 * 法令: 電子契約法3条 + 特商法15条の3 + 民法5条 のため、課金前確認モーダルを強制.
 */

import { useEffect, useState } from 'react';
import { track } from '@/lib/analytics';
import { startCheckout, recordConsent } from '@/lib/subscription';
import { sendEmailLink } from '@/lib/auth';
import { CheckoutConsentModal } from './CheckoutConsentModal';

export const PREMIUM_PRICE_LABEL = '月¥980' as const;
const PREMIUM_PRICE_JPY = 980;

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
  headline = '今夜だけのことばを読む',
  description = 'キャラクターからの今夜のことばを読む',
}: PremiumCTAProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'idle' | 'email-input' | 'email-sent'>('idle');
  const [email, setEmail] = useState('');
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    track('paywall_view', { source });
  }, [source]);

  function openConsent() {
    if (!userId) {
      track('compat_paywall_auth_prompt', { source });
      setMode('email-input');
      return;
    }
    track('compat_paywall_tap', { source });
    setShowConsent(true);
  }

  async function handleConsentConfirm({ ageConfirmed }: { ageConfirmed: boolean }) {
    if (!userId) return;
    track('checkout_open', { source, plan: 'premium_monthly' });
    setPending(true);
    setError(null);
    try {
      // L2: 同意記録を Firestore に保存（特商法15条の4 申込取消権の証跡）
      await recordConsent({
        userId,
        kind: 'checkout',
        priceJpy: PREMIUM_PRICE_JPY,
        ageConfirmed,
      });
      const { checkoutUrl } = await startCheckout({ plan: 'premium_monthly' });
      window.location.href = checkoutUrl;
    } catch (e) {
      console.error('[PremiumCTA] checkout failed', e);
      setError('うまくつながらなかったみたい。もう一度試してね');
      setPending(false);
      setShowConsent(false);
    }
  }

  async function handleSendEmailLink(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError('メールアドレスの形が、ちょっと違うみたい');
      return;
    }
    track('compat_paywall_email_submit', { source });
    setPending(true);
    setError(null);
    try {
      await sendEmailLink(email.trim());
      setMode('email-sent');
    } catch (err) {
      console.error('[PremiumCTA] sendEmailLink failed', err);
      setError('メール送信ができなかったみたい。もう一度試してね');
    } finally {
      setPending(false);
    }
  }

  return (
    <>
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
          <>
            <button
              type="button"
              onClick={openConsent}
              disabled={pending}
              style={primaryButtonStyle(pending)}
            >
              {pending ? '起動中…' : `続きを読む · ${priceLabel}`}
            </button>
            <p
              style={{
                fontSize: 10,
                color: 'var(--t3)',
                marginTop: 8,
                lineHeight: 1.6,
              }}
            >
              月¥980（税込）· 自動更新 · いつでも解約できるよ
            </p>
          </>
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
            <p
              style={{
                fontSize: 10,
                color: 'var(--t3)',
                margin: '0 0 10px',
                lineHeight: 1.6,
              }}
            >
              ※ メアドはログイン目的のみ. 第三者には渡さないよ.
            </p>
            <button type="submit" disabled={pending} style={primaryButtonStyle(pending)}>
              {pending ? '送信中…' : 'ログインリンクを送る'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('idle');
                setEmail('');
                setError(null);
              }}
              disabled={pending}
              style={secondaryButtonStyle(pending)}
            >
              キャンセル
            </button>
          </form>
        )}

        {mode === 'email-sent' && (
          <div style={{ marginTop: 4 }}>
            <p style={{ fontSize: 13, color: 'var(--t1)', margin: '0 0 6px', lineHeight: 1.7 }}>
              ✉️ メールを送ったよ
            </p>
            <p style={{ fontSize: 11, color: 'var(--t2)', margin: '0 0 12px', lineHeight: 1.7 }}>
              届いたメールのリンクをタップして戻ってきてね。
              <br />
              ログインできたら、もう一度「続きを読む」を押してね。
            </p>
            <button
              type="button"
              onClick={() => {
                setMode('email-input');
                setError(null);
              }}
              style={secondaryButtonStyle(false)}
            >
              メアドを変える
            </button>
          </div>
        )}

        {error && (
          <p style={{ fontSize: 11, color: 'var(--rose)', marginTop: 8 }}>{error}</p>
        )}
      </div>

      {showConsent && (
        <CheckoutConsentModal
          pending={pending}
          onConfirm={handleConsentConfirm}
          onCancel={() => setShowConsent(false)}
        />
      )}
    </>
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

function secondaryButtonStyle(pending: boolean): React.CSSProperties {
  return {
    minHeight: 44,
    width: '100%',
    padding: '10px 24px',
    borderRadius: 12,
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--t2)',
    fontSize: 12,
    fontWeight: 700,
    cursor: pending ? 'wait' : 'pointer',
    marginTop: 8,
    opacity: pending ? 0.6 : 1,
  };
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
