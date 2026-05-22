/**
 * 深夜の問いかけの永続化 (localStorage only)。
 *
 * 2 つの責務:
 * 1. 1 日 1 問: 最後に問うた日付 + その日の問い/応答を保存。同日再訪は
 *    新規生成せず当日の応答を返す。
 * 2. 履歴: 過去の問い/応答を時系列で保存（将来の傾向分析の入力になる構造）。
 *
 * archive.ts の方式（JSON 配列 + バリデーション + 件数上限）を踏襲する。
 */

import type { MidnightResponse } from '@/logic/midnight';

const TODAY_KEY = 'ynk_midnight_today';
const HISTORY_KEY = 'ynk_midnight_history';
const MAX_HISTORY = 60;

export interface MidnightEntry {
  id: string;
  /** YYYY-MM-DD (JST)。1 日 1 問の判定キー。 */
  dayKey: string;
  timestamp: number;
  /** 本人が書いたモヤモヤ（先頭 200 字まで）。 */
  question: string;
  response: MidnightResponse;
}

/** JST の今日を YYYY-MM-DD で返す。1 日 1 問判定の単一ソース。 */
export function todayKeyJst(now: Date = new Date()): string {
  const d = new Date(now.getTime() + 9 * 3_600_000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isMidnightEntry(e: unknown): e is MidnightEntry {
  if (typeof e !== 'object' || e === null) return false;
  const x = e as Partial<MidnightEntry>;
  return (
    typeof x.id === 'string' &&
    typeof x.dayKey === 'string' &&
    typeof x.question === 'string' &&
    typeof x.response === 'object' &&
    x.response !== null
  );
}

/** 当日すでに問うていれば、その日のエントリを返す。未回答なら null。 */
export function loadTodayEntry(now: Date = new Date()): MidnightEntry | null {
  try {
    const raw = localStorage.getItem(TODAY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isMidnightEntry(parsed)) return null;
    return parsed.dayKey === todayKeyJst(now) ? parsed : null;
  } catch {
    return null;
  }
}

/** 当日の問い/応答を保存し、履歴にも追記する。 */
export function saveTodayEntry(entry: MidnightEntry): void {
  try {
    localStorage.setItem(TODAY_KEY, JSON.stringify(entry));
  } catch {
    /* storage full / unavailable */
  }
  appendHistory(entry);
}

/** 履歴を新しい順で返す。 */
export function loadHistory(): MidnightEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isMidnightEntry);
  } catch {
    return [];
  }
}

function appendHistory(entry: MidnightEntry): void {
  const all = loadHistory();
  const next = [entry, ...all].slice(0, MAX_HISTORY);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}
