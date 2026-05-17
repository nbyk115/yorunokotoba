/**
 * Time of Day logic  -  5段階の時間帯モード判定
 *
 * 02-05 night-deep / 05-11 dawn / 11-17 day / 17-22 dusk / 22-02 night
 *
 * Wave L1: data-theme 廃止。常時ダーク + time-of-day セレクタのみで配色制御。
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
 * document.documentElement.dataset.timeOfDay を設定する。
 * tokens.css の [data-time-of-day="..."] セレクタが CSS 変数を上書きする。
 * data-theme は Wave L1 で廃止。
 */
export function applyTimeOfDay(tod: TimeOfDay): void {
  document.documentElement.dataset.timeOfDay = tod;
}
