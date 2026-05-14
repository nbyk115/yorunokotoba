/**
 * Type-safe wrapper around Google Analytics 4 gtag().
 * EventName union で typo を compile-time に弾く.
 *
 * 旧 paywall 系（soft_paywall_tap, deep_paywall_tap, letter_paywall_tap,
 * banner_premium_tap, premium_cta_tap, sticky_cta_tap, teaser_cta_tap,
 * retention_teaser_tap）は実装統合により dead. 2026-05-14 削除.
 * 現在は compat_paywall_tap 1系統に集約.
 */

type EventName =
  | 'dream_start'
  | 'dream_complete'
  | 'fortune_start'
  | 'fortune_complete'
  | 'ftue_next'
  | 'ftue_complete'
  | 'profile_complete'
  | 'paywall_view'
  | 'compat_paywall_tap'
  | 'checkout_open'
  | 'subscription_cancel'
  | 'image_save'
  | 'share_result'
  | 'share_dream'
  | 'friend_invite_tap'
  | 'push_prompt_dream_result'
  | 'streak_update'
  | 'streak_milestone'
  | 'night_mode_toggle'
  | 'compatibility_start'
  | 'compatibility_complete'
  | 'compatibility_share'
  | 'compatibility_link_open'
  | 'auth_email_link_complete'
  | 'compat_paywall_auth_prompt'
  | 'compat_paywall_email_submit'
  | 'exception';

declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function track(name: EventName, params: Record<string, unknown> = {}): void {
  try {
    window.gtag?.('event', name, params);
  } catch {
    /* never let analytics crash the app */
  }
}

export function trackException(message: string, fatal = false): void {
  try {
    window.gtag?.('event', 'exception', { description: message, fatal });
  } catch {
    /* ignore */
  }
}
