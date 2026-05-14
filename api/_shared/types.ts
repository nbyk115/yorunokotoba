/**
 * Shared types for Vercel API Routes (UnivaPay scaffold).
 */

export type SubscriptionPlan = 'premium_monthly';

export interface CheckoutRequest {
  userId: string;
  plan: SubscriptionPlan;
}

export interface CheckoutResponse {
  checkoutUrl: string;
}

export interface UnivapayWebhookEvent {
  // UnivaPay の実 webhook ペイロードに合わせて拡張する
  // TODO(univapay): 実 API の Event 型に置換
  event: string;
  data: {
    id: string;
    status: 'active' | 'past_due' | 'canceled' | 'authorized';
    metadata?: { userId?: string };
    current_period_end?: string;
  };
}
