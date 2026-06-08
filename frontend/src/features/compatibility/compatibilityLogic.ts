/**
 * 相性診断ロジック（純粋関数）
 *
 * 入力: 自分のキャラID + 相手のキャラID
 * 出力: 相性ランク + ランクラベル + ペア解釈テキスト
 *
 * 既存の dreamTypes.ts の bestMatch / bestWhy / keywords / rarity を参照する。
 * AI/外部API 不使用、完全に決定論的（同じ入力 → 同じ結果）。
 */

import { getDreamTypeById, type DreamType } from '@/data/dreamTypes';

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
 * 相性診断のコア判定。
 *
 * 優先順位:
 *  1. 相互bestMatch（A.bestMatch === B.id AND B.bestMatch === A.id） → 'best'
 *  2. 片方bestMatch（A.bestMatch === B.id OR 逆） → 'best'
 *  3. 共通キーワード ≥ 2 → 'good'
 *  4. rarity 同格 or どちらも SSR/SR → 'good'
 *  5. その他 → 'growth'
 *
 * 同一キャラ（自分自身との相性）は 'good' 固定（UX判断）。
 */
export function calculateCompatibility(
  charaIdA: string,
  charaIdB: string,
): CompatibilityResult {
  const charaA = getDreamTypeById(charaIdA);
  const charaB = getDreamTypeById(charaIdB);

  if (!charaA || !charaB) {
    return {
      rank: 'growth',
      rankLabel: RANK_LABEL.growth,
      pairText: '🌌 星座の交わりは、まだ見つかっていない夜にある。',
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
      pairText: '✨ 同じ星のもとに生まれた、もうひとりのあなた。鏡のように映し合う関係。',
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
    pairText = `💞 ${charaA.bestWhy}。星が引き合った、本物の縁。`;
  } else if (oneWayBest) {
    rank = 'best';
    pairText = `✨ ${charaA.bestMatch === charaIdB ? charaA.bestWhy : charaB.bestWhy}`;
  } else if (sharedKw >= 2 || bothHigh) {
    rank = 'good';
    pairText = `🌟 ${charaA.sub}と${charaB.sub}。違うようで、深いところで通じ合う。`;
  } else if (sameRarity) {
    rank = 'good';
    pairText = `🫧 ${charaA.name}と${charaB.name}、同じ温度感を持つふたり。`;
  } else {
    rank = 'growth';
    pairText = `🌱 ${charaA.sub}と${charaB.sub}。違いが、お互いを育てる夜。`;
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

/** ランク → テーマカラー */
export function getRankColor(rank: CompatibilityRank): string {
  if (rank === 'best') return 'var(--gold)';
  if (rank === 'good') return 'var(--lavender)';
  return 'var(--rose)';
}

// ─────────────────────────────────────────────
// スコア算出
// ─────────────────────────────────────────────

/**
 * 文字列から 0〜N-1 の決定的な整数インデックスを返すシンプルハッシュ。
 */
function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * ランクとペアIDから相性スコア(整数%)を決定的に算出する。
 * - best:   80〜95
 * - good:   60〜79
 * - growth: 40〜59
 */
export function getCompatibilityScore(
  rank: CompatibilityRank,
  charaAId: string,
  charaBId: string,
): number {
  const key = charaAId < charaBId ? charaAId + charaBId : charaBId + charaAId;
  const h = simpleHash(key);
  if (rank === 'best') return 80 + (h % 16);
  if (rank === 'good') return 60 + (h % 20);
  return 40 + (h % 20);
}

// ─────────────────────────────────────────────
// 深まるヒント
// ─────────────────────────────────────────────

const HINT_BEST = [
  'ふたりだけの時間を大切に 💫 特別なことをしなくても、隣にいるだけで十分幸せを感じられる関係だよ。',
  '素直に気持ちを伝え合うことで、この縁はさらに深まる ✨ 遠慮は無用、思ったことをそのまま言葉にしてみて。',
  'お互いの好きなものを共有してみよう 🎶 趣味が違っても、相手の世界に踏み込むことが絆を育てるよ。',
];

const HINT_GOOD = [
  'まずはひとつ、相手が喜ぶことを意識してみよう 🌸 小さな気遣いの積み重ねが信頼をつくるよ。',
  '違いを受け入れる練習から始めよう 🤝 相手の「当たり前」を否定せず、まず理解しようとする姿勢が大切。',
  '定期的に「最近どう?」って連絡してみて 💌 忙しくても気にかけている気持ちが伝わると、距離がぐっと縮まるよ。',
];

const HINT_GROWTH = [
  '価値観の違いをぶつけ合うより、まず「なるほど」と受け取ることから始めてみて 🌱 そこから対話が生まれるよ。',
  '一緒に何か新しいことに挑戦してみよう 🌈 同じ体験を重ねることが、ふたりの共通言語をつくるよ。',
  '相手の苦手なことをそっとフォローしてあげて 🫶 それだけでこの関係は大きく変わるよ。',
];

/**
 * ランクとペアIDから「関係性が深まるヒント」を決定的に返す。
 */
export function getCompatibilityHint(
  rank: CompatibilityRank,
  charaAId: string,
  charaBId: string,
): string {
  const key = charaAId < charaBId ? charaAId + charaBId : charaBId + charaAId;
  const h = simpleHash(key + 'hint');
  const pool = rank === 'best' ? HINT_BEST : rank === 'good' ? HINT_GOOD : HINT_GROWTH;
  return pool[h % pool.length];
}

// ─────────────────────────────────────────────
// 気をつけたいこと
// ─────────────────────────────────────────────

const CAUTION_BEST = [
  'この相性の良さに甘えすぎず、お互いへの感謝を忘れないでね 💐 当たり前にしないことが長続きの秘訣だよ。',
  '居心地が良すぎて変化を恐れてしまうことがあるかも ⚡ ふたりで成長し続ける意識を持っておこう。',
];

const CAUTION_GOOD = [
  '少しすれ違いを感じたら、早めに話し合うのが大事 💬 小さな違和感を放置すると大きくなりがちだよ。',
  '相手に期待しすぎると、ちょっとしたことで傷つきやすくなるよ 🫧 相手も完璧じゃないことを忘れずに。',
];

const CAUTION_GROWTH = [
  '感情的になりそうなときは一呼吸おいて 🍃 言葉の選び方で関係はガラッと変わるよ。',
  '最初から100%わかり合おうとしないで 🌊 時間をかけて理解を重ねることが、この関係の鍵だよ。',
];

/**
 * ランクとペアIDから「気をつけたいこと」を決定的に返す。
 */
export function getCompatibilityCaution(
  rank: CompatibilityRank,
  charaAId: string,
  charaBId: string,
): string {
  const key = charaAId < charaBId ? charaAId + charaBId : charaBId + charaAId;
  const h = simpleHash(key + 'caution');
  const pool =
    rank === 'best' ? CAUTION_BEST : rank === 'good' ? CAUTION_GOOD : CAUTION_GROWTH;
  return pool[h % pool.length];
}
