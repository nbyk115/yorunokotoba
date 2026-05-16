/**
 * 日次シード生成ユーティリティ（Premium コンテンツ日次多様化）
 *
 * 設計方針:
 * - サーバー不要、クライアント側 PRNG で完結
 * - 同じ日 + 同じ charaId なら常に同じ組み合わせを返す（再現性保証）
 * - 日が変わると組み合わせが変わる（毎晩違う体験）
 * - birthSeed を加えると「あなただけの」体感が出る
 */

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
 * 今日の日付を YYYYMMDD 整数で返す（JST 基準）。
 */
function todayInt(now: number = Date.now()): number {
  const d = new Date(now + 9 * 60 * 60 * 1000); // UTC+9
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  return y * 10000 + m * 100 + day;
}

/**
 * 日次 PRNG インスタンスを返す。
 *
 * seed 列: todayInt + charaHash + birthSeed を xorshift で混合。
 * pick(n) を呼ぶたびに次の乱数から 0..n-1 を返す。
 */
export function createDailyRng(charaId: string, birthSeed: number = 0, now?: number) {
  const day = todayInt(now);
  const charaHash = hashString(charaId);
  let state = xorshift32(day ^ charaHash ^ (birthSeed >>> 0));

  return {
    /** 0 以上 n 未満の整数を返す */
    pick(n: number): number {
      state = xorshift32(state);
      return state % n;
    },
  };
}

/**
 * 誕生日（YYYY-MM-DD 文字列 or null）から birthSeed を生成する。
 * null の場合は 0 を返す（フォールバック）。
 */
export function birthSeedFromDate(birthday: string | null | undefined): number {
  if (!birthday) return 0;
  return hashString(birthday);
}
