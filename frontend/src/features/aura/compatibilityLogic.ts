/**
 * 相性占いロジック（純粋関数）
 *
 * 入力: 自分のキャラID + 相手のキャラID
 * 出力: 相性ランク + ランクラベル + ペア解釈テキスト
 *
 * 既存の dreamTypes.ts の bestMatch / bestWhy / keywords / rarity を参照する。
 * AI/外部API 不使用、完全に決定論的（同じ入力 → 同じ結果）。
 */

import { type DreamType } from '@/data/dreamTypes';
import { getSafeDreamType } from '@/lib/contentFilter';

export type CompatibilityRank = 'best' | 'good' | 'growth';

export interface CompatibilityResult {
  rank: CompatibilityRank;
  rankLabel: string;
  pairText: string;
  pairTitle: string;
  charaA: DreamType | undefined;
  charaB: DreamType | undefined;
}

const RANK_LABEL: Record<CompatibilityRank, string> = {
  best: '相性ばっちり',
  good: '良い相性',
  growth: '成長しあえる',
};

const RANK_PREFIX: Record<CompatibilityRank, string> = {
  best: '◎',
  good: '○',
  growth: '△',
};

/**
 * 2キャラの共通キーワード数を数える。
 */
function countSharedKeywords(a: DreamType, b: DreamType): number {
  const setB = new Set(b.keywords);
  return a.keywords.filter((k) => setB.has(k)).length;
}

/**
 * rarity の高い側を判定する。
 */
const RARITY_RANK: Record<DreamType['rarity'], number> = {
  N: 1,
  R: 2,
  SR: 3,
  SSR: 4,
};

/**
 * 相性占いのコア判定。
 *
 * 優先順位:
 *  1. 相互bestMatch（A.bestMatch === B.id AND B.bestMatch === A.id） → 'best'
 *  2. 片方bestMatch（A.bestMatch === B.id OR 逆） → 'best'
 *  3. 共通キーワード ≥ 2 → 'good'
 *  4. rarity 同格 or どちらも SSR/SR → 'good'
 *  5. その他 → 'growth'
 *
 * 同一キャラ（自分自身との相性）は'good'固定（UX判断）。
 */
export function calculateCompatibility(
  charaIdA: string,
  charaIdB: string,
): CompatibilityResult {
  const charaA = getSafeDreamType(charaIdA);
  const charaB = getSafeDreamType(charaIdB);

  if (!charaA || !charaB) {
    return {
      rank: 'growth',
      rankLabel: RANK_LABEL.growth,
      pairText: '星座の交わりは、まだ見つかっていない夜にある。',
      pairTitle: 'unknown',
      charaA,
      charaB,
    };
  }

  // 同一キャラは 'good' 固定
  if (charaIdA === charaIdB) {
    return {
      rank: 'good',
      rankLabel: RANK_LABEL.good,
      pairText: `同じ星のもとに生まれた、もうひとりのあなた。鏡のように映し合う関係。`,
      pairTitle: `${charaA.name} × ${charaB.name}`,
      charaA,
      charaB,
    };
  }

  let rank: CompatibilityRank;
  let pairText: string;

  const mutualBest = charaA.bestMatch === charaIdB && charaB.bestMatch === charaIdA;
  const oneWayBest = charaA.bestMatch === charaIdB || charaB.bestMatch === charaIdA;
  const sharedKw = countSharedKeywords(charaA, charaB);
  const sameRarity = charaA.rarity === charaB.rarity;
  const bothHigh = RARITY_RANK[charaA.rarity] >= 3 && RARITY_RANK[charaB.rarity] >= 3;

  if (mutualBest) {
    rank = 'best';
    pairText = `${charaA.bestWhy}。星が引き合った、本物の縁。`;
  } else if (oneWayBest) {
    rank = 'best';
    pairText = charaA.bestMatch === charaIdB ? charaA.bestWhy : charaB.bestWhy;
  } else if (sharedKw >= 2 || bothHigh) {
    rank = 'good';
    pairText = `${charaA.sub}と${charaB.sub}。違うようで、深いところで通じ合う。`;
  } else if (sameRarity) {
    rank = 'good';
    pairText = `${charaA.name}と${charaB.name}、同じ温度感を持つふたり。`;
  } else {
    rank = 'growth';
    pairText = `${charaA.sub}と${charaB.sub}。違いが、お互いを育てる夜。`;
  }

  return {
    rank,
    rankLabel: RANK_LABEL[rank],
    pairText,
    pairTitle: `${charaA.name} × ${charaB.name}`,
    charaA,
    charaB,
  };
}

export function getRankPrefix(rank: CompatibilityRank): string {
  return RANK_PREFIX[rank];
}

/** ShareCard theme に対応するランク → テーマカラー */
export function getRankTheme(rank: CompatibilityRank): 'gold' | 'lavender' | 'rose' {
  if (rank === 'best') return 'gold';
  if (rank === 'good') return 'lavender';
  return 'rose';
}
