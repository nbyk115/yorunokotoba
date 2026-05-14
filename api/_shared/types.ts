/**
 * Shared types & constants for Vercel API Routes (UnivaPay).
 */

export type SubscriptionPlan = 'premium_monthly';

/** Premium 月額（円）— SSOT: docs/strategy/pricing-decision.md, 2026-05-14 確定 */
export const PREMIUM_PRICE_JPY = 980 as const;

export interface CheckoutRequest {
  userId: string;
  plan: SubscriptionPlan;
}

export interface CheckoutResponse {
  checkoutUrl: string;
}

export interface CancelRequest {
  userId: string;
}

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'authorized';

/**
 * UnivaPay Webhook payload（暫定）.
 *
 * 実 API の payload 構造は事前相談（G2）で確定。確定後、各フィールドの
 * 命名（snake_case / camelCase）と型を本ファイルで一元修正する。
 */
export interface UnivapayWebhookEvent {
  /** ペイロード一意 ID（idempotency 用） */
  id?: string;
  /** イベント名: subscription.activated, subscription.payment.failed, subscription.canceled など */
  event: string;
  data: {
    id: string;
    status: SubscriptionStatus;
    metadata?: { userId?: string };
    current_period_end?: string;
  };
}

/**
 * UnivaPay event → 内部 Subscription status マッピング.
 *
 * - activated / payment.succeeded → 'active'
 * - payment.failed → 'past_due'
 * - canceled → 'canceled'
 */
export function mapUnivapayEventToStatus(
  eventName: string,
  rawStatus?: SubscriptionStatus,
): 'active' | 'past_due' | 'canceled' | 'none' {
  if (eventName.includes('canceled')) return 'canceled';
  if (eventName.includes('payment.failed')) return 'past_due';
  if (eventName.includes('activated') || eventName.includes('payment.succeeded')) {
    return 'active';
  }
  if (rawStatus === 'active') return 'active';
  if (rawStatus === 'past_due') return 'past_due';
  if (rawStatus === 'canceled') return 'canceled';
  return 'none';
}
