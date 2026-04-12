/**
 * Deterministic hash / seed helpers.
 * Extracted from legacy index.html (v8).
 *
 * Critical: These implementations must stay bit-for-bit identical to the
 * legacy version so that existing archived dream interpretations remain
 * reproducible.
 */

/** Simple FNV-like hash returning a non-negative 32-bit int. */
export function simpleHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Seed based on today's date in JST (UTC+9).
 * Format: YYYYMMDD + optional extra offset.
 * Ensures the same input on the same day returns the same result.
 */
export function getDailySeed(extra = 0): number {
  const d = new Date(Date.now() + 9 * 3_600_000);
  return (
    d.getUTCFullYear() * 10_000 +
    (d.getUTCMonth() + 1) * 100 +
    d.getUTCDate() +
    extra
  );
}

/** Park-Miller MCG pseudo-random generator. Returns a closure. */
export function makeSeededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16_807 + 0) % 2_147_483_647;
    return (s & 0x7fff_ffff) / 2_147_483_647;
  };
}
