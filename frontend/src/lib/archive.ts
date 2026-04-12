/**
 * Dream archive persistence (localStorage only).
 * Preserves legacy `ynk_dream_archive` key format.
 */

const KEY = 'ynk_dream_archive';
const MAX_ENTRIES = 50;

export interface ArchiveEntry {
  id: string;
  text: string;
  timestamp: number;
  typeId: string;
  themeKey: string;
  summary: string;
}

export function loadArchive(): ArchiveEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is ArchiveEntry =>
        typeof e === 'object' &&
        e !== null &&
        typeof (e as ArchiveEntry).id === 'string' &&
        typeof (e as ArchiveEntry).text === 'string',
    );
  } catch {
    return [];
  }
}

export function saveArchiveEntry(entry: ArchiveEntry): void {
  const all = loadArchive();
  const next = [entry, ...all].slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage full / unavailable */
  }
}

export function clearArchive(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
