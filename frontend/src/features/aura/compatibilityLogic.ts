/**
 * 相性占いロジック（純粋関数）
 *
 * 入力: 自分のキャラID + 相手のキャラID
 * 出力: 相性ランク + ランクラベル + ペア解釈テキスト
 *
 * 既存の dreamTypes.ts の bestMatch / bestWhy / keywords / rarity を参照する。
 * AI/外部API 不使用、完全に決定論的（同じ入力 → 同じ結果）。
 *
 * Wave L2 拡張:
 *   - 星座単位での相性計算: calculateSignCompatibility(signA, signB)
 *   - 4軸スコア（Vibes/コミュニケーション/成長/安定）: simpleHash ベースの決定論的算出
 *   - エレメント相性: 西洋占星術の実際の三重性（火/地/風/水）に基づく
 */

import { type DreamType } from '@/data/dreamTypes';
import { getSafeDreamType } from '@/lib/contentFilter';
import { simpleHash } from '@/logic/hash';
import { SIGN_GENDER_CHAR, SIGNS } from '@/data/signs';

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

/* ─────────────────────────────────────────────
   Wave L2: 星座単位での相性計算
   - 入力: 星座名A + 星座名B（SIGNS[].k と同値）
   - 出力: CompatibilityResult + 4軸スコア + エレメント構成 + エレメント相性テキスト
───────────────────────────────────────────── */

/** 西洋占星術のエレメント（四元素）*/
export type AstroElement = '火' | '地' | '風' | '水';

/** 星座 → エレメント（西洋占星術の三重性: 各4星座が火/地/風/水に対応）*/
export const SIGN_ELEMENT_MAP: Record<string, AstroElement> = {
  おひつじ座: '火',
  おうし座: '地',
  ふたご座: '風',
  かに座: '水',
  しし座: '火',
  おとめ座: '地',
  てんびん座: '風',
  さそり座: '水',
  いて座: '火',
  やぎ座: '地',
  みずがめ座: '風',
  うお座: '水',
};

/** エレメント間の基本相性テキスト（西洋占星術の実際の関係に基づく）*/
const ELEMENT_COMPATIBILITY_TEXT: Record<string, string> = {
  // 同エレメント: 深い共感・共鳴
  '火火': '同じ炎を持つふたり。お互いの情熱が燃え上がるような関係。一緒にいると止まれない夜が続く。',
  '地地': '大地の安定感が共鳴する。焦らず、確かに積み上げていくふたりの歩み。信頼は、静かに深くなる。',
  '風風': '言葉が軽やかに飛び交い、話が尽きない。アイデアが次々と生まれる、知的で刺激的な関係。',
  '水水': '感情の深みが通じ合うふたり。言葉にしなくても伝わる、静かで濃密なつながり。',
  // 相性の良いエレメント: 補い合う
  '火風': '風が火をあおり、炎がより高く燃える。お互いを高め合う、躍動感あふれる関係。',
  '風火': '風が火をあおり、炎がより高く燃える。お互いを高め合う、躍動感あふれる関係。',
  '地水': '大地が水を受け止め、水が大地を潤す。深く穏やかに、互いを支え合う関係。',
  '水地': '大地が水を受け止め、水が大地を潤す。深く穏やかに、互いを支え合う関係。',
  // 挑戦的な相性: 刺激と摩擦
  '火地': '炎と大地。スピードが違っても、ぶつかった先に意外な深さが生まれる。',
  '地火': '炎と大地。スピードが違っても、ぶつかった先に意外な深さが生まれる。',
  '火水': '熱さと冷たさ。正反対だからこそ、ふたりの間に独特の緊張と惹かれ合いが生まれる。',
  '水火': '熱さと冷たさ。正反対だからこそ、ふたりの間に独特の緊張と惹かれ合いが生まれる。',
  '風地': '風は自由に、大地は確かに。テンポは違うけど、それぞれの強さが刺激になる。',
  '地風': '風は自由に、大地は確かに。テンポは違うけど、それぞれの強さが刺激になる。',
  '風水': '感情と思考。水は風に揺れ、風は水に色を映す。複雑だけど、引き合う不思議さがある。',
  '水風': '感情と思考。水は風に揺れ、風は水に色を映す。複雑だけど、引き合う不思議さがある。',
};

/** エレメント間の基本相性スコアベース（西洋占星術の三重性に基づく加算値）*/
const ELEMENT_SCORE_BONUS: Record<string, number> = {
  // 同エレメント: 深い共感（+1）
  '火火': 1, '地地': 1, '風風': 1, '水水': 1,
  // 相性の良いペア（火-風 / 地-水）: 補完（+1）
  '火風': 1, '風火': 1,
  '地水': 1, '水地': 1,
  // 他の組み合わせ: 中立（0）
  '火地': 0, '地火': 0,
  '火水': 0, '水火': 0,
  '風地': 0, '地風': 0,
  '風水': 0, '水風': 0,
};

/** 4軸スコアの型 */
export interface CompatibilityScores {
  /** Vibes（直感的なフィーリング）1-5 */
  vibes: number;
  /** コミュニケーション（話しやすさ）1-5 */
  communication: number;
  /** 成長（一緒に高め合えるか）1-5 */
  growth: number;
  /** 安定（長続きするか）1-5 */
  stability: number;
}

/** Wave L2 拡張: 星座ペアへの相性結果 */
export interface SignCompatibilityResult extends CompatibilityResult {
  scores: CompatibilityScores;
  elementA: AstroElement;
  elementB: AstroElement;
  elementCompatibilityText: string;
}

/**
 * simpleHash を使ってスコアを決定論的に計算する。
 * seed = signA + signB の組み合わせ文字列（順序は正規化して順序非依存にする）。
 * エレメント相性による +1 ボーナスを各軸に加味する。
 *
 * HARD RULE: 固定オフセット捏造禁止。スコアは hash + エレメント相性ボーナスのみで決定。
 */
function calculateScores(signA: string, signB: string): CompatibilityScores {
  // 順序を正規化（A,B どちらを自分・相手にしても同じ結果）
  const [normA, normB] = [signA, signB].sort();
  const baseKey = `${normA}_${normB}`;
  const elemA = SIGN_ELEMENT_MAP[signA] ?? '火';
  const elemB = SIGN_ELEMENT_MAP[signB] ?? '火';
  const elemKey = `${elemA}${elemB}`;
  const bonus = ELEMENT_SCORE_BONUS[elemKey] ?? 0;

  // 各軸に異なる salt を使ってバラつきを出す
  const rawVibes       = (simpleHash(`vibes_${baseKey}`)       % 3) + 2; // 2-4
  const rawComm        = (simpleHash(`comm_${baseKey}`)        % 3) + 2; // 2-4
  const rawGrowth      = (simpleHash(`growth_${baseKey}`)      % 3) + 2; // 2-4
  const rawStability   = (simpleHash(`stability_${baseKey}`)   % 3) + 2; // 2-4

  return {
    vibes:         Math.min(5, rawVibes       + bonus),
    communication: Math.min(5, rawComm        + bonus),
    growth:        Math.min(5, rawGrowth       + bonus),
    stability:     Math.min(5, rawStability    + bonus),
  };
}

/**
 * 星座名から相性結果を計算する（Wave L2 メイン関数）。
 * 内部では SIGN_GENDER_CHAR で female キャラIDを取得し、既存の calculateCompatibility を利用する。
 */
export function calculateSignCompatibility(
  signA: string,
  signB: string,
): SignCompatibilityResult {
  const charaIdA = SIGN_GENDER_CHAR[signA]?.female ?? 'yume_kobuta';
  const charaIdB = SIGN_GENDER_CHAR[signB]?.female ?? 'yume_kobuta';

  const base = calculateCompatibility(charaIdA, charaIdB);
  const scores = calculateScores(signA, signB);
  const elementA = SIGN_ELEMENT_MAP[signA] ?? '火';
  const elementB = SIGN_ELEMENT_MAP[signB] ?? '火';
  const elemKey = `${elementA}${elementB}`;
  const elementCompatibilityText = ELEMENT_COMPATIBILITY_TEXT[elemKey]
    ?? 'ふたりのエレメントは、それぞれの個性を持ちながら夜の星空の下で出会う。';

  return {
    ...base,
    scores,
    elementA,
    elementB,
    elementCompatibilityText,
  };
}

/** SIGNS[].k をエレメントの表示文字列に変換（エラーなし）*/
export function getElementForSign(sign: string): AstroElement {
  return SIGN_ELEMENT_MAP[sign] ?? '火';
}

/** 全エレメントの表示用カラートークン（tokens.css 変数） */
export const ELEMENT_COLOR: Record<AstroElement, string> = {
  火: 'var(--rose)',
  地: 'var(--gold)',
  風: 'var(--lavender)',
  水: 'var(--lavender)',
};

/** 全 SIGNS の星座名一覧（UI Picker 用）*/
export const SIGN_NAMES: readonly string[] = SIGNS.map((s) => s.k);
