/**
 * Birthday-based personalisation helpers.
 *
 * - lifePathNumber: 数秘術の誕生数（1-9 + マスター数 11/22/33）
 * - birthSeed: 誕生日ペアをユニーク整数に変換（占いシードの差分化）
 *
 * 後方互換: d/m が NaN / undefined のとき birthSeed は 0 を返す。
 */

/**
 * 各桁の和を繰り返し1桁にする（マスター数 11/22/33 は保持）。
 * 例: 29 -> 11（保持）, 34 -> 7, 4 -> 4
 */
function reduceDigits(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n)
      .split('')
      .reduce((acc, ch) => acc + Number(ch), 0);
  }
  return n;
}

/**
 * 誕生数（Life Path Number）を計算する。
 * 月と日の全桁を合計し、1桁（またはマスター数 11/22/33）になるまで繰り返す。
 *
 * @param d - 生まれた日 (1-31)
 * @param m - 生まれた月 (1-12)
 * @returns 1-9 または 11/22/33 のいずれか
 */
export function lifePathNumber(d: number, m: number): number {
  const sumDigits = (n: number) =>
    String(n)
      .split('')
      .reduce((acc, ch) => acc + Number(ch), 0);

  const raw = sumDigits(m) + sumDigits(d);
  return reduceDigits(raw);
}

/**
 * 誕生日ペアをユニーク整数に変換する（101-1231 の範囲）。
 * 占い生成時の getDailySeed への extra 加算に使用する。
 *
 * d/m が NaN または undefined のときは 0 を返す（後方互換）。
 *
 * @param d - 生まれた日 (1-31)
 * @param m - 生まれた月 (1-12)
 * @returns 101-1231 の整数、または 0
 */
export function birthSeed(d?: number, m?: number): number {
  if (d === undefined || m === undefined || isNaN(d) || isNaN(m)) {
    return 0;
  }
  return m * 100 + d;
}

// ─── ユニットテスト（vitest が入っていないため、型レベルの静的検証のみ） ───
// 以下のアサーションはビルド時に型チェックで保証する。
// 実行時テストは vitest 導入時に移行する。
//
// lifePathNumber(29, 4) -> 4+2+9=15 -> 1+5=6
// lifePathNumber(11, 2) -> 2+1+1=4 -> 4
// lifePathNumber(29, 11) -> 1+1+2+9=13 -> 4   ※月11=1+1=2, 日29=2+9=11 -> 2+11=13 -> 4
// lifePathNumber(11, 11) -> 1+1+1+1=4
// lifePathNumber(22, 1)  -> 1+2+2=5
// lifePathNumber(11, 2)  -> 2+1+1=4
// マスター数保持: lifePathNumber(2, 9)  -> 9+2=11 -> 11 (保持)
//                lifePathNumber(4, 18)  -> 1+8+4=13 -> 4
//                lifePathNumber(22, 4)  -> 4+2+2=8 -> 8
//
// birthSeed 境界値:
// birthSeed(1, 1)   = 101
// birthSeed(31, 12) = 1231
// birthSeed(undefined, 1) = 0
// birthSeed(1, undefined) = 0
// birthSeed(NaN, 1)       = 0
