/**
 * 日次シード生成ユーティリティ（Premium コンテンツ日次多様化）
 *
 * 設計方針:
 * - サーバー不要、クライアント側 PRNG で完結
 * - 同じ日 + 同じ charaId なら常に同じ組み合わせを返す（再現性保証）
 * - 日が変わると組み合わせが変わる（毎晩違う体験）
 * - birthSeed を加えると「あなただけの」体感が出る
 *
 * アルゴリズム:
 * 全組み合わせ (intro × core × closing) を列挙し、誕生日+キャラ seed で
 * Fisher-Yates シャッフルして順序を固定。基点からの経過日数でインデックスを
 * 決定することで「N日間に全組み合わせが重複なく登場」を保証する。
 *   N = intro数 × core数 × closing数 (例: 3×2×3=18)
 */

/** 基点日（JST 2000-01-01、経過日数計算用） */
const BASE_DAY_MS = Date.UTC(2000, 0, 1); // 2000-01-01 00:00:00 UTC

/**
 * 数値列を xorshift32 で混合する超軽量 PRNG。
 * 同じ seed 列に対し常に同一シーケンスを返す。
 */
function xorshift32(seed: number): number {
  let s = seed >>> 0;
  if (s === 0) s = 1;
  s ^= s << 13;
  s ^= s >>> 17;
  s ^= s << 5;
  return s >>> 0;
}

/**
 * 文字列を djb2 ハッシュ（32bit 非負整数）に変換する。
 */
function hashString(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * 現在時刻から JST 基点の経過日数インデックスを返す。
 * dayInt ではなく経過日数を使うことで % N が均一に回る。
 */
function dayIndex(now: number = Date.now()): number {
  const d = new Date(now + 9 * 60 * 60 * 1000); // UTC+9
  const epoch = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.floor((epoch - BASE_DAY_MS) / 86_400_000);
}

/**
 * Fisher-Yates シャッフル（seed で決定論的）。
 */
function shuffleWithSeed<T>(arr: readonly T[], seed: number): T[] {
  const a = [...arr];
  let s = seed >>> 0;
  for (let i = a.length - 1; i > 0; i--) {
    s = xorshift32(s);
    const j = s % (i + 1);
    const tmp = a[i];
    a[i] = a[j]!;
    a[j] = tmp!;
  }
  return a;
}

/**
 * パーツ選択インデックスのトリプレットを返す。
 *
 * @param charaId    - キャラ or 組み合わせキー（グローバルユニーク）
 * @param birthSeed  - 誕生日由来の seed（0 でフォールバック）
 * @param introLen   - 導入パーツのバリアント数
 * @param coreLen    - 核心パーツのバリアント数
 * @param closingLen - 結びパーツのバリアント数
 * @param now        - テスト用現在時刻 ms（省略時は Date.now()）
 * @returns [introIdx, coreIdx, closingIdx]
 */
export function getDailyPartIndices(
  charaId: string,
  birthSeed: number,
  introLen: number,
  coreLen: number,
  closingLen: number,
  now?: number
): [number, number, number] {
  // 全組み合わせを列挙
  type Combo = [number, number, number];
  const combos: Combo[] = [];
  for (let c = 0; c < closingLen; c++) {
    for (let k = 0; k < coreLen; k++) {
      for (let i = 0; i < introLen; i++) {
        combos.push([i, k, c]);
      }
    }
  }

  // キャラ + 誕生日 seed でシャッフル順を固定
  const charaHash = hashString(charaId);
  const shuffleSeed = xorshift32(charaHash ^ (birthSeed >>> 0));
  const shuffled = shuffleWithSeed(combos, shuffleSeed);

  // 経過日数で今日のインデックスを決定（N日周期で全組み合わせを網羅）
  const idx = dayIndex(now) % shuffled.length;
  return shuffled[idx]!;
}

/**
 * 誕生日（YYYY-MM-DD 文字列 or null）から birthSeed を生成する。
 * null の場合は 0 を返す（フォールバック）。
 */
export function birthSeedFromDate(birthday: string | null | undefined): number {
  if (!birthday) return 0;
  return hashString(birthday);
}
