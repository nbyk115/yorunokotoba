/**
 * NG表現フィルター
 *
 * content-strategist（ConsultingOS、2026-05）が定義した20語のNG表現に対する
 * 検出・置換・モニタリング機能。
 *
 * 二段構え方針:
 *  - 方式A（プロンプト規制）: AI統合時にシステムプロンプトで生成段階で回避
 *  - 方式B（後処理Regexp）: 既存の静的テキストや AI 出力に対する保険
 *
 * SSOT保護:
 *  - dreamTypes.ts は editing 禁止（DREAM_TYPES の Japanese text）
 *  - 表示直前にこのフィルターを通すことで、SSOT を壊さずに NG 表現を除去
 */

/** 後処理で機械置換する「ゼロトレランス」パターン（セールス語・SaaS語） */
const HARD_REPLACEMENTS: Array<[RegExp, string]> = [
  [/お得[なに]?/g, ''],
  [/今だけ/g, ''],
  [/期間限定/g, ''],
  [/限定[のにで]/g, '夜だけの'],
  [/アップグレード/g, 'ひらく'],
  [/プレミアム(?!の|・)/g, ''], // 「プレミアム会員」等の直訳セールス語のみ
];

/** 文脈依存で誤検知リスクが高いため、検出のみ行う（自動置換しない）パターン */
const SOFT_DETECT: Array<[RegExp, string]> = [
  [/頑張[っりれろ]?[てにをはも]/g, 'NG: 鼓舞系（頑張って）'],
  [/応援(してます|してるよ|しています)/g, 'NG: 鼓舞系（応援）'],
  [/自信を持[っちてた]/g, 'NG: 鼓舞系（自信を持って）'],
  [/[すべき]?べきです/g, 'NG: 上から目線（〜すべき）'],
  [/我慢(し|して|してる)/g, 'NG: 抑圧（我慢）'],
  [/しょうがな[いく]|仕方な[いく]/g, 'NG: 諦め（しょうがない）'],
  [/素晴らし[いかくけ]/g, 'NG: 抽象形容詞（素晴らしい）'],
];

export interface FilterMonitorReport {
  /** 検出された NG 表現の総数 */
  detectedCount: number;
  /** 検出パターンの内訳 */
  patterns: Array<{ pattern: string; description: string; matches: string[] }>;
}

/**
 * テキストから「ゼロトレランス」パターンを除去する。
 *
 * セールス語・SaaS語のみを対象。鼓舞系や抑圧系は文脈依存で
 * 誤検知リスクが高いため、ここでは置換せず monitor で検出のみ行う。
 */
export function filterText(input: string): string {
  let output = input;
  for (const [pattern, replacement] of HARD_REPLACEMENTS) {
    output = output.replace(pattern, replacement);
  }
  // 連続スペースの正規化
  output = output.replace(/[ 　]+/g, ' ').trim();
  return output;
}

/**
 * テキストを走査して NG 表現を検出する（置換はしない）。
 *
 * 監視・QA 用途。本番では filterText を表示直前に通し、monitor は
 * バックグラウンドで検出ログを取る運用を想定。
 */
export function monitorText(input: string): FilterMonitorReport {
  const patterns: FilterMonitorReport['patterns'] = [];
  let detectedCount = 0;

  for (const [pattern, description] of SOFT_DETECT) {
    const matches = input.match(pattern);
    if (matches && matches.length > 0) {
      detectedCount += matches.length;
      patterns.push({
        pattern: pattern.source,
        description,
        matches: Array.from(new Set(matches)),
      });
    }
  }

  // ハード置換系も検出だけはしておく
  for (const [pattern] of HARD_REPLACEMENTS) {
    const matches = input.match(pattern);
    if (matches && matches.length > 0) {
      detectedCount += matches.length;
      patterns.push({
        pattern: pattern.source,
        description: 'NG: セールス・SaaS語',
        matches: Array.from(new Set(matches)),
      });
    }
  }

  return { detectedCount, patterns };
}

/**
 * テキストを「フィルター済み・監視済み」の状態で返す。
 *
 * 戻り値の text を画面表示し、report は ログ・分析用途で使用する。
 */
export function safeText(input: string): { text: string; report: FilterMonitorReport } {
  const report = monitorText(input);
  const text = filterText(input);
  return { text, report };
}

// ─────────────────────────────────────────────
// DREAM_TYPES の override 層（SSOT保護のためラッパーで対応）
// ─────────────────────────────────────────────

import { getDreamTypeById, type DreamType } from '@/data/dreamTypes';

/**
 * content-strategist（ConsultingOS、2026-05）が「致命的NG」として
 * 特定したエントリ・フィールドに対する個別 override。
 *
 * dreamTypes.ts は SSOT として手動編集禁止（DO NOT edit Japanese text manually）
 * のため、表示時にこの override を適用することで、ブランドルール違反を回避する。
 */
const DREAM_TYPE_OVERRIDES: Record<string, Partial<DreamType>> = {
  // 「我慢してるの見えてるよ」→ 中立表現に置換（鼓舞でも諦めでもなく）
  umi_rakko: {
    weak: '居心地いい場所から動きたくなくて、新しいことに腰が重くなりがち。「めんどくさい」って最近よく言ってない？笑　あと怒ってるのに「別にいいよ」って言っちゃうところ、周りにはバレてるかも。気持ち、ちゃんと出していいよ。言ってみたら意外とスッキリするから。',
  },
};

/**
 * dreamTypes.ts の getDreamTypeById をラップし、override + テキストフィルター
 * を適用して安全なバージョンを返す。
 *
 * 全ての画面で getDreamTypeById の代わりにこの関数を使うことで、
 * NG 表現が画面に出ない構造を担保する。
 */
export function getSafeDreamType(id: string): DreamType | undefined {
  const t = getDreamTypeById(id);
  if (!t) return undefined;
  const override = DREAM_TYPE_OVERRIDES[id];
  return override ? { ...t, ...override } : t;
}
