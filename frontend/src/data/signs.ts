/**
 * Zodiac signs (Japanese).
 * Extracted from legacy index.html.
 */

export interface Sign {
  k: string;
  icon: string;
}

export const SIGNS: readonly Sign[] = [
  { k: 'おひつじ座', icon: '♈' },
  { k: 'おうし座', icon: '♉' },
  { k: 'ふたご座', icon: '♊' },
  { k: 'かに座', icon: '♋' },
  { k: 'しし座', icon: '♌' },
  { k: 'おとめ座', icon: '♍' },
  { k: 'てんびん座', icon: '♎' },
  { k: 'さそり座', icon: '♏' },
  { k: 'いて座', icon: '♐' },
  { k: 'やぎ座', icon: '♑' },
  { k: 'みずがめ座', icon: '♒' },
  { k: 'うお座', icon: '♓' },
];

/**
 * Determine zodiac sign index from month/day (1-indexed).
 * Returns 0-11 matching SIGNS array order.
 */
export function getSignIndex(month: number, day: number): number {
  const cutoffs: Array<[number, number, number]> = [
    [1, 20, 9], // やぎ座 until Jan 19
    [2, 19, 10], // みずがめ座
    [3, 21, 11], // うお座
    [4, 20, 0], // おひつじ座
    [5, 21, 1], // おうし座
    [6, 22, 2], // ふたご座
    [7, 23, 3], // かに座
    [8, 23, 4], // しし座
    [9, 23, 5], // おとめ座
    [10, 24, 6], // てんびん座
    [11, 23, 7], // さそり座
    [12, 22, 8], // いて座
  ];

  for (const [m, d, idx] of cutoffs) {
    if (month < m || (month === m && day < d)) {
      return idx;
    }
  }
  return 9; // やぎ座 (Dec 22 - Jan 19)
}
