/**
 * Retention streak tracker  -  counts consecutive daily visits.
 * Compatible with legacy `ynk_streak` localStorage format.
 */

const KEY = 'ynk_streak';

export interface StreakState {
  count: number;
  lastDay: string; // YYYY-MM-DD
}

function todayString(): string {
  const d = new Date(Date.now() + 9 * 3_600_000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(
    d.getUTCDate(),
  ).padStart(2, '0')}`;
}

function yesterdayString(): string {
  const d = new Date(Date.now() + 9 * 3_600_000 - 86_400_000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(
    d.getUTCDate(),
  ).padStart(2, '0')}`;
}

export function loadStreak(): StreakState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StreakState;
      if (typeof parsed.count === 'number' && typeof parsed.lastDay === 'string') {
        return parsed;
      }
    }
  } catch {
    /* ignore */
  }
  return { count: 0, lastDay: '' };
}

export function tickStreak(): StreakState {
  const today = todayString();
  const current = loadStreak();
  if (current.lastDay === today) {
    return current;
  }
  const next: StreakState =
    current.lastDay === yesterdayString()
      ? { count: current.count + 1, lastDay: today }
      : { count: 1, lastDay: today };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}
