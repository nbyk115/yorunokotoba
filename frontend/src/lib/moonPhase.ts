/**
 * 月相計算ロジック
 *
 * 新月から満月までの29.5日サイクルを 8段階で表現。
 * 既存 HomeView.tsx の getMoonPhaseEmoji を SSOT として移植・拡張。
 */

const KNOWN_NEW_MOON_MS = new Date('2000-01-06T18:14:00Z').getTime();
const CYCLE_MS = 29.530589 * 24 * 60 * 60 * 1000;

const MOON_EMOJIS = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'] as const;

/**
 * 月相インデックス 0-7 を返す（0=新月、4=満月）。
 */
export function getMoonPhaseIndex(now: number = Date.now()): number {
  const phase = ((now - KNOWN_NEW_MOON_MS) % CYCLE_MS) / CYCLE_MS;
  return Math.round(phase * 8) % 8;
}

/**
 * 月相絵文字を返す。
 */
export function getMoonPhaseEmoji(now: number = Date.now()): string {
  const idx = getMoonPhaseIndex(now);
  return MOON_EMOJIS[idx] ?? '🌕';
}

/**
 * 月相カテゴリ（'new' | 'full'）を返す。
 *
 * α版では2カテゴリのみ使用:
 *   - idx 0-2, 6-7 → 'new'（新月期: 始まり・余白）
 *   - idx 3-5 → 'full'（満月期: 解放・感情）
 *
 * β版で 4 or 8 カテゴリに拡張予定。
 */
export type MoonPhaseCategory = 'new' | 'full';

export function getMoonPhaseCategory(now: number = Date.now()): MoonPhaseCategory {
  const idx = getMoonPhaseIndex(now);
  return idx >= 3 && idx <= 5 ? 'full' : 'new';
}

/**
 * 月相の状態名（日本語）を返す。表示用。
 */
export function getMoonPhaseLabel(now: number = Date.now()): string {
  const idx = getMoonPhaseIndex(now);
  const labels = ['新月', '三日月', '上弦の月', '十三夜', '満月', '十六夜', '下弦の月', '晦日月'];
  return labels[idx] ?? '満月';
}
