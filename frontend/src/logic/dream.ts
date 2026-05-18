/**
 * Dream analysis (offline, zero runtime API cost).
 *
 * Rebuilt 2026-05 to a new spec:
 * - Result screen keeps only the detailed reading ("夢が伝えていること")
 *   and a prose "今日のメッセージ". Character / symbol list / lucky items /
 *   compatibility were removed from the result by product decision.
 * - Tone branching: positive dreams get an uplifting reading, negative
 *   dreams additionally get concrete advice / cautions.
 * - Sexual / violent inputs are read lightly and never refused.
 * - One clear, decisive interpretation. No "another reading could be..."
 *   hedging, no negating the dreamer's input.
 * - Unknown inputs get a concrete, forward-looking fallback built from the
 *   dreamer's own words, not a generic escape hatch.
 *
 * A small amount of legacy-shaped data (typeId / themeKey / summary) is kept
 * internally only so the existing localStorage archive keeps working.
 */

import { simpleHash, getDailySeed, makeSeededRandom } from './hash';
import {
  DREAM_KEYWORDS,
  DREAM_KEYWORD_INDEX,
  type DreamMeaning,
  type DreamCategory,
} from '@/data/dreamKeywords';

export type DreamTone = 'positive' | 'negative' | 'neutral';

export interface DreamTheme {
  key: DreamCategory;
  label: string;
  icon: string;
  grad: string;
}

export interface DreamReading {
  /** Short headline phrase ("変化と生命力のサイン" 等). */
  headline: string;
  /** Emoji that decorates the reading. */
  emoji: string;
  /** Detailed interpretation prose. */
  body: string;
  /** Advice / cautions prose, only present when tone is negative. */
  advice: string | null;
}

export interface DreamResult {
  /** Theme drives the hero gradient + archive label. */
  theme: DreamTheme;
  /** Overall emotional tone detected from the dreamer's own words. */
  tone: DreamTone;
  /** The keyword the reading is anchored on. */
  keyword: string;
  /** Detailed reading: "夢が伝えていること". */
  reading: DreamReading;
  /** Prose "今日のメッセージ" (no longer a bullet list). */
  todayMessage: string;
  /** Internal-only: kept so the legacy localStorage archive stays valid. */
  archive: {
    typeId: string;
    themeKey: string;
    summary: string;
  };
}

const THEMES: Record<DreamCategory, DreamTheme> = {
  anx: {
    key: 'anx',
    label: '不安・解放',
    icon: '🌊',
    grad: 'linear-gradient(135deg,#6BA3BE,#4A90B8)',
  },
  love: {
    key: 'love',
    label: '恋愛・感情',
    icon: '🌸',
    grad: 'linear-gradient(135deg,#E8627C,#D4447A)',
  },
  free: {
    key: 'free',
    label: '自由・飛翔',
    icon: '🌙',
    grad: 'linear-gradient(135deg,#B08ACF,#8B6AAF)',
  },
  work: {
    key: 'work',
    label: '成長・課題',
    icon: '⚡',
    grad: 'linear-gradient(135deg,#D4A853,#B8902E)',
  },
  mystery: {
    key: 'mystery',
    label: '深層・謎',
    icon: '🔮',
    grad: 'linear-gradient(135deg,#764ba2,#553B7D)',
  },
};

/** Words that signal the dream felt negative / distressing. */
const NEGATIVE_MARKERS = [
  '怖', 'こわ', '不安', '焦', '泣', '叫', '逃げ', '追われ', '追いかけ',
  '苦し', '痛', 'つら', '辛', '嫌', '悲し', '寂し', 'さみし', '孤独',
  '失', 'なくし', '無くし', '落ち', '堕ち', '暗', '闇', '死', '殺',
  '血', '怪我', 'けが', '事故', '負け', '壊れ', 'こわれ', '溺れ', 'おぼれ',
  '迷', 'はぐれ', '取り残', 'パニック', '震え', '凍', '冷た', '裏切',
  'ダメ', 'できない', '間に合わ', '助けて', 'もう無理', '疲れ',
];

/** Words that signal the dream felt positive / uplifting. */
const POSITIVE_MARKERS = [
  '楽し', 'うれし', '嬉し', '幸せ', 'しあわせ', '笑', '気持ちい',
  '気持ち良', 'すっきり', 'スッキリ', '美し', 'きれい', '綺麗',
  '心地', '安心', '穏や', 'おだや', 'わくわく', 'ワクワク', 'ドキドキ',
  '好き', '愛', 'ハッピー', '晴れ', '輝', 'まぶし', '満たさ', '満足',
  '癒', 'やさし', '優し', '成功', '勝', '受かっ', 'スムーズ', '飛べ',
];

function countHits(text: string, markers: readonly string[]): number {
  let n = 0;
  for (const m of markers) if (text.includes(m)) n++;
  return n;
}

/** Decide the dream's emotional tone from the dreamer's own words. */
function detectTone(text: string): DreamTone {
  const neg = countHits(text, NEGATIVE_MARKERS);
  const pos = countHits(text, POSITIVE_MARKERS);
  if (neg === 0 && pos === 0) return 'neutral';
  if (neg > pos) return 'negative';
  if (pos > neg) return 'positive';
  // Tie with hits on both sides: lean to the more cautious reading so the
  // dreamer still gets concrete advice.
  return 'negative';
}

/**
 * Compounds that swallow a single-character keyword but change its meaning,
 * e.g. "空間" / "空気" should not trigger the dream symbol "空".
 * Keyed by the keyword surface form -> following chars that void the match.
 */
const COMPOUND_BLOCKERS: Record<string, readonly string[]> = {
  空: ['間', '気', '腹', '港', '欄', '白'],
  星: ['座'],
  光: ['景', '栄'],
  夜: ['中', '勤', '景'],
  家: ['族', '具', '事', '賃'],
  木: ['曜', '材'],
  血: ['液', '管', '圧'],
  月: ['曜', '給'],
};

/** True if `surface` occurs in `text` as a meaningful dream symbol. */
function occursAsSymbol(text: string, surface: string): boolean {
  const idx = text.indexOf(surface);
  if (idx < 0) return false;
  const blockers = COMPOUND_BLOCKERS[surface];
  if (!blockers) return true;
  // Re-scan: accept only if at least one occurrence is not part of a blocked
  // compound.
  let from = 0;
  for (;;) {
    const at = text.indexOf(surface, from);
    if (at < 0) return false;
    const next = text[at + surface.length];
    if (!next || !blockers.includes(next)) return true;
    from = at + surface.length;
  }
}

/** Find the dictionary entry the input most strongly matches. */
function matchEntry(text: string): DreamMeaning | null {
  // Exact keyword / alias hit wins; pick the longest matched surface form so
  // "空を飛ぶ" beats "飛ぶ".
  let best: { entry: DreamMeaning; len: number } | null = null;
  for (const [surface, entry] of DREAM_KEYWORD_INDEX) {
    if (occursAsSymbol(text, surface) && (!best || surface.length > best.len)) {
      best = { entry, len: surface.length };
    }
  }
  return best ? best.entry : null;
}

/**
 * Pick the reading body for the detected tone.
 * Positive dream -> uplifting reading. Negative dream -> the negative reading.
 * Neutral -> the neutral reading. The reading is always one decisive
 * interpretation, never a list of alternatives.
 */
function readingFor(entry: DreamMeaning, tone: DreamTone): string {
  if (tone === 'positive') return entry.positive;
  if (tone === 'negative') return entry.negative;
  return entry.neutral;
}

/** Build the prose "今日のメッセージ" from the entry, theme and tone. */
function buildTodayMessage(
  entry: DreamMeaning,
  theme: DreamTheme,
  tone: DreamTone,
): string {
  if (tone === 'positive') {
    return `今日のあなたには追い風が吹いている。「${entry.key}」の夢が示す前向きな流れを信じて、心が動いたことに素直に乗ってみて。${entry.advice} 小さく動き出したぶんだけ、その追い風はもっと強くなる。今日感じた良い予感は、ちゃんと現実につながっているよ。`;
  }
  if (tone === 'negative') {
    return `「${entry.key}」の夢が教えてくれているのは、今のあなたに少し手当てが必要だということ。でも大丈夫、対策ははっきりしている。${entry.advice} 全部を一度にやろうとしなくていい。今日できる一番小さいことを1つ選んで、それだけやってみて。それだけで、明日の心の重さは確実に変わる。`;
  }
  return `「${entry.key}」の夢は、${theme.label}があなたのテーマになっているサイン。今日は、自分の内側の感覚を少し丁寧に扱ってあげる日にして。${entry.advice} 答えを急がなくていい。感じていることに名前をつけてあげるだけで、霧は少しずつ晴れていくよ。`;
}

/**
 * Fallback for inputs with no dictionary match.
 * Builds a concrete, forward-looking reading from the dreamer's own words.
 * Never returns a generic escape ("意味を探さないで" 等).
 */
function fallbackResult(
  text: string,
  tone: DreamTone,
  rng: () => number,
): DreamResult {
  // Take a short, readable fragment of the dreamer's own words. Prefer
  // cutting at the first sentence break so the quoted phrase reads naturally.
  const cleaned = text.replace(/\s+/g, '');
  const firstSentence = cleaned.split(/[。、!！?？]/)[0] ?? cleaned;
  const base = firstSentence.length > 0 ? firstSentence : cleaned;
  const fragment = base.length > 14 ? `${base.slice(0, 14)}…` : base || 'その夢';
  const themes: DreamCategory[] = ['mystery', 'free', 'love'];
  const theme = THEMES[themes[Math.floor(rng() * themes.length)] ?? 'mystery'];

  let body: string;
  let advice: string | null;
  let todayMessage: string;

  if (tone === 'positive') {
    body = `「${fragment}」という夢。これは、あなたの心が前向きなエネルギーで満ちているサイン。夢の中で感じた明るい気持ちは、今のあなたの本音そのもの。「こうなったらいいな」という願いが、現実に動き出す準備が整っている。あなたの直感は、今とても冴えている。😊`;
    advice = null;
    todayMessage = `今日のあなたには良い流れが来ている。「${fragment}」の夢が見せてくれた前向きな感覚を信じて、心が動いたことに素直に乗ってみて。気になっていたことに、今日小さな一歩を踏み出してみよう。その一歩が、思っているより大きな変化の入り口になるよ。`;
  } else if (tone === 'negative') {
    body = `「${fragment}」という夢。ここには、あなたが今ひとりで抱えている気持ちが映し出されている。夢の中で感じた不安やつらさは、現実のあなたが「少し疲れた」「もう頑張りすぎた」と訴えているサイン。その感情は、無視せず受け止めてあげるべき大切なメッセージ。`;
    advice = `今日は、夢の中で一番強く感じた気持ちに名前をつけてあげて。不安なのか、寂しいのか、悔しいのか。それを紙に1行書くだけで、輪郭がはっきりして扱いやすくなる。そして、自分を回復させる時間を意識的に1つ作って。睡眠、休息、好きなこと。何でもいい。あなたを大切にする行動を1つだけ。`;
    todayMessage = `「${fragment}」の夢が教えてくれているのは、今のあなたに休息と手当てが必要だということ。でも対策ははっきりしている。今日できる一番小さいことを1つだけ選んで、それだけやってみて。全部を一度に解決しようとしなくていい。明日のあなたは、今日の小さな一歩にきっと感謝するよ。`;
  } else {
    body = `「${fragment}」という夢。この夢には、まだ言葉になりきっていない、あなたの深層心理からのヒントが詰まっている。はっきりした答えはまだ見えないかもしれないけれど、それは「考えるべきことがある」という心のサイン。今のあなたが感じている小さな違和感や気がかりに、目を向けるタイミングが来ている。🌙`;
    advice = null;
    todayMessage = `「${fragment}」の夢が伝えているのは、自分の内側の声に耳を澄ますタイミングだということ。今日は、なんとなく気になっていることを1つ、紙に書き出してみて。言葉にした瞬間に、霧が晴れて次の一歩が見えてくる。答えを急がなくていい。あなたのペースで大丈夫。`;
  }

  const reading: DreamReading = {
    headline: '夢からの個別メッセージ',
    emoji: tone === 'negative' ? '🌙' : tone === 'positive' ? '✨' : '🔮',
    body,
    advice,
  };

  return {
    theme,
    tone,
    keyword: fragment,
    reading,
    todayMessage,
    archive: {
      typeId: 'dream_generic',
      themeKey: theme.key,
      summary: fragment,
    },
  };
}

export function analyzeDream(text: string, _signIdx = 0): DreamResult {
  const input = text ?? '';
  const rng = makeSeededRandom(getDailySeed(simpleHash(input) * 7));
  const tone = detectTone(input);

  const entry = matchEntry(input);
  if (!entry) {
    return fallbackResult(input, tone, rng);
  }

  const theme = THEMES[entry.category];
  const body = readingFor(entry, tone);
  const reading: DreamReading = {
    headline: entry.meaning,
    emoji: entry.emoji,
    body,
    advice: tone === 'negative' ? entry.advice : null,
  };
  const todayMessage = buildTodayMessage(entry, theme, tone);

  return {
    theme,
    tone,
    keyword: entry.key,
    reading,
    todayMessage,
    archive: {
      typeId: 'dream_generic',
      themeKey: theme.key,
      summary: entry.key,
    },
  };
}

/** Re-exported so callers needing the dictionary count have a single source. */
export const DREAM_KEYWORD_COUNT = DREAM_KEYWORDS.length;
