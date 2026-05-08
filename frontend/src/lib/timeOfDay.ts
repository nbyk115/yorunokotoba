/**
 * Time of Day logic — 5段階の時間帯モード判定
 *
 * 02-05 night-deep / 05-11 dawn / 11-17 day / 17-22 dusk / 22-02 night
 */

export type TimeOfDay = 'night-deep' | 'dawn' | 'day' | 'dusk' | 'night';

/**
 * 現在時刻から時間帯モードを返す。
 * テスト用に hour を外部から注入できるようにしている。
 */
export function getTimeOfDay(hour = new Date().getHours()): TimeOfDay {
  if (hour >= 2 && hour < 5) return 'night-deep';
  if (hour >= 5 && hour < 11) return 'dawn';
  if (hour >= 11 && hour < 17) return 'day';
  if (hour >= 17 && hour < 22) return 'dusk';
  return 'night'; // 22-02
}

/**
 * 暗い背景の時間帯モードでは dark テーマを適用する。
 * dawn/day は light テーマ、night-deep/dusk/night は dark テーマ。
 */
const DARK_TIME_MODES: ReadonlySet<TimeOfDay> = new Set(['night-deep', 'dusk', 'night']);

/**
 * document.documentElement.dataset.timeOfDay と data-theme を設定する。
 * TokensCSS の [data-time-of-day="..."] と [data-theme="dark"] が CSS 変数を上書きする。
 */
export function applyTimeOfDay(tod: TimeOfDay): void {
  document.documentElement.dataset.timeOfDay = tod;
  document.documentElement.dataset.theme = DARK_TIME_MODES.has(tod) ? 'dark' : 'light';
}
