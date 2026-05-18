/**
 * Type-safe wrapper around Google Analytics 4 gtag().
 * All 28 event names from legacy index.html are declared as a union so
 * typos fail at compile time.
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
  | 'soft_paywall_tap'
  | 'deep_paywall_tap'
  | 'compat_paywall_tap'
  | 'letter_paywall_tap'
  | 'banner_premium_tap'
  | 'premium_cta_tap'
  | 'sticky_cta_tap'
  | 'teaser_cta_tap'
  | 'checkout_open'
  | 'subscription_cancel'
  | 'image_save'
  | 'share_result'
  | 'share_dream'
  | 'friend_invite_tap'
  | 'push_prompt_dream_result'
  | 'retention_teaser_tap'
  | 'streak_update'
  | 'streak_milestone'
  | 'night_mode_toggle'
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
