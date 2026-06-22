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

import { simpleHash } from './hash';
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
  風: ['邪', '呂', '船', '景', '車'],
  山: ['田', '本', '口', '崎'],
  川: ['崎', '口', '上'],
  雷: ['同'],
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

/**
 * Insert a paragraph break near the middle sentence boundary so a multi-
 * sentence reading renders as two readable paragraphs instead of one wall of
 * text. Rendered with white-space: pre-line so `\n\n` shows as a blank line.
 * Single-sentence readings are returned unchanged.
 */
function paragraphize(text: string): string {
  // Split keeping each sentence's trailing ender.
  const raw: string[] = [];
  let cur = '';
  for (const ch of text) {
    cur += ch;
    if (ch === '。' || ch === '！' || ch === '？') {
      raw.push(cur);
      cur = '';
    }
  }
  if (cur) raw.push(cur);
  // A decorative emoji can sit at the start of the next chunk (it was placed
  // right after the previous sentence's ender). Pull any such leading emoji +
  // following space back onto the previous sentence so a paragraph break never
  // orphans an emoji at the start of a line.
  const parts: string[] = [];
  for (const chunk of raw) {
    const lead = chunk.match(/^(\p{Extended_Pictographic}+️?\s*)/u);
    if (lead && parts.length > 0) {
      // Keep the emoji + its space with the previous sentence.
      parts[parts.length - 1] += lead[1];
      const rest = chunk.slice(lead[1].length);
      if (rest.length > 0) parts.push(rest);
    } else {
      parts.push(chunk);
    }
  }
  // A trailing chunk that is only an emoji (no sentence text) also belongs to
  // the previous sentence.
  if (parts.length > 1) {
    const last = parts[parts.length - 1];
    if (last && /^[\s\p{Extended_Pictographic}️]+$/u.test(last)) {
      parts[parts.length - 2] += last;
      parts.pop();
    }
  }
  const cleaned = parts.filter((p) => p.trim().length > 0);
  if (cleaned.length < 2) return cleaned.join('').trim();
  // Break after the sentence that sits just past the midpoint, so the first
  // paragraph carries the core reading and the second carries the nuance.
  const breakAfter = Math.ceil(cleaned.length / 2);
  const head = cleaned.slice(0, breakAfter).join('').trim();
  const tail = cleaned.slice(breakAfter).join('').trim();
  return tail ? `${head}\n\n${tail}` : head;
}

/**
 * Build the prose "今日のメッセージ".
 *
 * Rendered with white-space: pre-line, so `\n\n` becomes a visible paragraph
 * break. The message is shaped as three short paragraphs:
 *   1. what the dream means for the dreamer right now (framing)
 *   2. the concrete advice (entry.advice as-is)
 *   3. a closing line of encouragement
 * The framing / closing paragraphs deliberately avoid the word "今日" because
 * almost every entry.advice already opens with it: keeping it out here stops
 * the "今日は…。今日は…" wall-of-text repetition the prose used to have.
 */
function buildTodayMessage(
  entry: DreamMeaning,
  theme: DreamTheme,
  tone: DreamTone,
): string {
  if (tone === 'positive') {
    return [
      `「${entry.key}」の夢は、あなたに追い風が吹いているサイン。🍃 心が動いたことに、素直に乗っていい流れが来ているよ。`,
      `${entry.advice}`,
      `小さく動き出したぶんだけ、その追い風はもっと強くなる。💫 感じている良い予感は、ちゃんと現実につながっているからね。🌷`,
    ].join('\n\n');
  }
  if (tone === 'negative') {
    return [
      `「${entry.key}」の夢が教えてくれているのは、あなたの心に少し手当てが必要だということ。🌿 でも大丈夫、やることははっきりしているよ。✍️`,
      `${entry.advice}`,
      `全部を一度に片づけようとしなくていい。🤍 一番小さいことを1つやるだけで、明日の心の重さは確実に変わるよ。🌅`,
    ].join('\n\n');
  }
  return [
    `「${entry.key}」の夢は、${theme.label}があなたのテーマになっているサイン。🔮 自分の内側の感覚を、少し丁寧に扱ってあげるタイミングだよ。🕯️`,
    `${entry.advice}`,
    `感じていることに名前をつけてあげれば、迷いははっきりした輪郭に変わる。💭 進む方向は、もうあなたの中にあるからね。🌟`,
  ].join('\n\n');
}

/**
 * Fallback reading pools for inputs with no dictionary match.
 *
 * Each tone owns 8+ distinct readings so two different unmatched dreams no
 * longer collapse onto one identical sentence. `{f}` is replaced with a short
 * fragment of the dreamer's own words. The variation is chosen deterministically
 * from simpleHash(input) (see pickFallback), so the same dream text always
 * yields the same reading while different text yields different readings.
 *
 * Quality rules kept from the single-variation version:
 * - decisive wording, no hedging
 * - positive readings encourage, negative readings carry concrete advice
 * - emoji at roughly one-per-sentence density
 * - todayMessage is prose with paragraph breaks
 * - the cross-tone "自分の気持ちと向き合うタイミング" phrase is no longer the
 *   only neutral framing: each variation takes a different angle (心の状態 /
 *   対人 / 変化の兆し / 休息のサイン / 前進の合図 / 気づき 等).
 */
interface FallbackVariant {
  /** Theme bucket for the hero gradient + archive label. */
  theme: DreamCategory;
  /** "夢が伝えていること" body. */
  body: string;
  /** "今日のメッセージ" prose. */
  today: string;
}

const FALLBACK_POSITIVE: readonly FallbackVariant[] = [
  {
    theme: 'free',
    body: '「{f}」という夢。これは、あなたの心が前向きなエネルギーで満ちているサイン。😊 夢の中で感じた明るい気持ちは、今のあなたの本音そのもの。「こうなったらいいな」という願いは、ただの空想じゃなく、現実に動き出す準備が整った合図だよ。✨ あなたの直感は今とても冴えている。心が「やってみたい」と言ったことは、迷わず選んで大丈夫。🌷',
    today: '今日のあなたには、はっきりと良い流れが来ている。🍀 「{f}」の夢が見せてくれた前向きな感覚は本物。気になっていたあのことに、今日かならず小さな一歩を踏み出してみて。👟 連絡を送る、調べる、申し込む。何でもいい。その一歩が、思っているより大きな変化の入り口になるよ。💫',
  },
  {
    theme: 'mystery',
    body: '「{f}」という夢。これは、あなたの中で長く眠っていた力が、ようやく目を覚ましたサイン。🌟 夢がこんなに鮮やかに残っているのは、心が「次に進む準備ができた」と教えてくれているから。🪄 あなたが密かに温めてきた望みは、もう芽を出す時期に入っている。🌱 自分の可能性を、今より少しだけ信じてあげていい。',
    today: '今日は、あなたの内側でずっと育っていたものが、形になり始める一日。🌷 「{f}」の夢が示しているのは、もう十分に準備ができているという合図。🪄 やりたかったことを、今日ひとつだけ口に出すか、書き出してみて。🖋️ 言葉にした瞬間、それは空想から計画に変わるよ。✨',
  },
  {
    theme: 'love',
    body: '「{f}」という夢。これは、あなたの心が誰かや何かと温かくつながりたがっているサイン。💗 夢の中の心地よさは、あなたが本来とても豊かな愛情を持っている証拠。🌸 今のあなたは、人に優しくする余裕も、優しくされる準備も整っている。🤍 心を開いた分だけ、うれしい出来事が返ってくる時期だよ。',
    today: '今日のあなたには、人とのあたたかい交流が幸運を運んでくる。🍀 「{f}」の夢が伝えているのは、心を閉じずに過ごしていいということ。💌 気になっている人に連絡してみる、ありがとうを言葉にする。🌸 そんな小さな働きかけが、思いがけない良いつながりを呼び込むよ。💫',
  },
  {
    theme: 'free',
    body: '「{f}」という夢。これは、あなたが今いる場所から一歩外へ出たがっているサイン。🕊️ 夢がのびやかだったのは、心がもっと自由に動きたいと望んでいるから。🌈 窮屈さを感じていたなら、それは新しい景色を求める健全な合図。🪽 あなたの世界は、思っているよりずっと広げられる。',
    today: '今日は、いつもの枠を少しだけはみ出してみると運が開ける一日。🌈 「{f}」の夢が見せてくれた解放感は本物だよ。🕊️ いつもと違う道を歩く、行ったことのない店に入る、新しいことを調べる。🌿 小さな冒険ひとつが、明日のあなたの視界を広げてくれる。✨',
  },
  {
    theme: 'work',
    body: '「{f}」という夢。これは、あなたの努力が実りに近づいているサイン。⚡ 夢に前向きな手応えがあったのは、現実でも積み重ねがちゃんと形になり始めているから。🌟 今のあなたには、目標へ進むためのエネルギーと集中力がそろっている。🎯 自分の頑張りを、もっと信じていい時期だよ。',
    today: '今日は、これまでの積み重ねが追い風になって背中を押してくれる。🍀 「{f}」の夢が示しているのは、進む力がちゃんと足りているという合図。⚡ 後回しにしていた課題に、今日ひとつだけ着手してみて。✍️ 動き出したぶんだけ、results は確実にあなたに近づくよ。🌅',
  },
  {
    theme: 'mystery',
    body: '「{f}」という夢。これは、あなたの直感がとても冴えているサイン。🔮 夢がはっきりした輪郭で残ったのは、心の奥のセンサーが正しく働いている証拠。🪄 今のあなたは、本当に大切なものとそうでないものを見分ける力がある。✨ ピンと来た感覚を、迷わず信じて大丈夫だよ。🌙',
    today: '今日は、あなたの直感が一番頼れる道しるべになる一日。🌙 「{f}」の夢が教えてくれたのは、心の声を信じていいということ。🔮 何かを選ぶ場面が来たら、頭で悩む前に「どっちが心地いいか」で決めてみて。🪄 その選び方が、今日のあなたを良い方向へ導くよ。✨',
  },
  {
    theme: 'love',
    body: '「{f}」という夢。これは、あなたの心がしっかり満たされているサイン。🌸 夢にあたたかさが残ったのは、今のあなたの内側が穏やかで安定しているから。🤍 心に余白がある今は、新しいことを受け取るのにちょうどいい時期。💗 自分の機嫌を自分で取れているあなたは、もう十分に強いよ。',
    today: '今日は、満たされた心が良いものを引き寄せてくれる一日。🍀 「{f}」の夢が伝えているのは、あなたの今の状態がとても良いということ。🌸 その余裕を使って、自分が本当に好きなことを今日ひとつ味わってみて。🍵 心を喜ばせる時間が、明日への活力にまっすぐつながるよ。💫',
  },
  {
    theme: 'free',
    body: '「{f}」という夢。これは、あなたの中で「変わってもいい」という許可が下りたサイン。🌅 夢が明るかったのは、心が新しい自分を歓迎する準備を終えたから。🪽 ためらっていた変化は、踏み出してみれば思ったより軽い。🌈 今のあなたには、その一歩を支える力がちゃんとある。✨',
    today: '今日は、ずっと迷っていたことに「やってみる」と答えていい一日。🌅 「{f}」の夢が示しているのは、変化を恐れなくていいという合図。🪽 完璧な準備を待たず、不完全なまま小さく動き出してみて。👟 始めた瞬間から、流れはあなたの味方になってくれるよ。💫',
  },
];

const FALLBACK_NEGATIVE: readonly { theme: DreamCategory; body: string; advice: string; today: string }[] = [
  {
    theme: 'anx',
    body: '「{f}」という夢。ここには、あなたが今ひとりで抱えている気持ちが、はっきり映し出されている。😢 夢の中で感じた不安やつらさは、現実のあなたが「もう十分がんばった」と訴えている声。これは気のせいなんかじゃない。🫧 あなたの心は今、休ませてほしいと正直に言っている。その声を、今夜はちゃんと聞いてあげて。',
    advice: '今日は、夢の中で一番強く感じた気持ちに名前をつけてあげて。✍️ 不安、寂しさ、悔しさ。それを紙に1行書くだけで、扱える形に変わる。そして、自分を回復させる時間を必ず1つ作って。🛁 ゆっくりお風呂に入る、好きな音楽を聴く、早く眠る。今夜のあなたを大切にする行動を、ひとつ選んで実行して。',
    today: '「{f}」の夢が教えてくれているのは、今のあなたに休息が必要だということ。🌿 やることはシンプル。今日できる一番小さいことを1つだけ選んで、それだけやればいい。全部を一度に解決しようとしなくていいよ。🤍 明日のあなたは、今夜ちゃんと休んだ自分にきっと感謝する。',
  },
  {
    theme: 'anx',
    body: '「{f}」という夢。これは、あなたが頭の中で同じ心配を何度もくり返しているサイン。🌀 夢が落ち着かなかったのは、考えても答えの出ないことを抱え込みすぎているから。🫧 その不安は、まだ起きていない未来のことかもしれない。🍃 心は今、その堂々めぐりから少し降りたがっているよ。',
    advice: '今日は、頭をぐるぐるさせている心配ごとを1つ残らず紙に書き出して。✍️ そして「自分で変えられること」と「変えられないこと」に分けて。🍃 変えられないことは思い切って線で消し、変えられることだけに、今日5分使ってみて。🛁 考える時間を減らすほど、心は軽くなるよ。',
    today: '「{f}」の夢が伝えているのは、考えすぎる時間を少し手放していいということ。🌿 今日は「これ以上は考えない」と決める時間を作ってみて。🕯️ 散歩でも、お茶でも、好きな音楽でもいい。💭 頭を休ませたぶんだけ、本当に大事な答えがちゃんと見えてくるよ。🌅',
  },
  {
    theme: 'love',
    body: '「{f}」という夢。これは、あなたが誰かとの関係で、言えない気持ちを抱え込んでいるサイン。💧 夢が重かったのは、本音をのみ込み続けて心が疲れているから。🤍 相手に合わせすぎて、あなた自身の声が小さくなっていないか。🍵 心は今、その我慢に気づいてほしいと言っている。',
    advice: '今日は、誰との関係に一番気をつかっているかをはっきりさせて。✍️ その相手の名前を書くだけで、モヤモヤの正体が見える。🌸 そして我慢していることを1つだけ、安全な形で外に出して。🧺 直接言えないなら、ノートに本音を書き切るだけでいい。🤍 「いい人」をやめる小さな練習を、今日から始めよう。',
    today: '「{f}」の夢が教えてくれているのは、自分の気持ちを後回しにしすぎているということ。🌿 今日は、誰かのためではなく、自分のための選択を1つだけしてみて。🍵 小さなわがままでいい。🤍 あなたの心の安全は、誰かの期待よりちゃんと優先していいんだよ。🌅',
  },
  {
    theme: 'anx',
    body: '「{f}」という夢。これは、あなたが「うまくやらなきゃ」と自分を追い込んでいるサイン。😣 夢に余裕がなかったのは、現実でも気を張りつめすぎているから。🫧 完璧でない自分を、あなたは少し責めすぎていないか。🍃 心は今、その厳しさをゆるめてほしいと訴えている。',
    advice: '今日は、自分に出している合格ラインを思い切って下げて。✍️ 「60点でいい」と声に出してみて。🛁 やることリストの中から、本当は今日やらなくていいものを2つ消して。🌿 そして、できた部分にだけ目を向けて、自分に「よくやった」と言ってあげて。🤍',
    today: '「{f}」の夢が伝えているのは、自分にもっと優しくしていいということ。🌿 今日は、頑張った自分をちゃんと認める時間を作ってみて。🕯️ できなかったことではなく、できたことを3つ数えてみて。💭 自分を許せた分だけ、明日の足取りは軽くなるよ。🌅',
  },
  {
    theme: 'anx',
    body: '「{f}」という夢。これは、あなたの心と体に、疲れが思った以上にたまっているサイン。😮‍💨 夢がどんよりしていたのは、休息が足りていないから。🫧 「まだ平気」と言い聞かせてきたけれど、心はもう正直なところを見せてきている。🍃 今は回復を最優先にしていい時期だよ。',
    advice: '今日は、予定をひとつ思い切ってキャンセルして、その時間を休息にあてて。🛁 早く眠る、何もしない時間を作る、温かいものを飲む。🍵 体を休めることは、なまけではなく必要な仕事。🌙 がんばる前に、まず充電する。今夜のあなたに、それを許してあげて。🤍',
    today: '「{f}」の夢が教えてくれているのは、立ち止まって休んでいいということ。🌿 今日は「何もしない」を予定に入れてみて。🕯️ 動き続けることだけが前進じゃない。💭 しっかり休んだ心と体は、明日きっと自然に動き出すよ。🌅',
  },
  {
    theme: 'mystery',
    body: '「{f}」という夢。これは、あなたが見ないふりをしてきた本音が、表に出たがっているサイン。🌑 夢がざわついたのは、心の奥にしまった気持ちが「気づいて」と合図を送っているから。🫧 ずっとフタをしてきた感情は、無視するほど大きくなる。🍃 今は、それにそっと向き合うタイミングだよ。',
    advice: '今日は、心の奥でずっと避けてきたことを1つだけ紙に書いてみて。✍️ 言葉にするのが怖くても、書いた瞬間にそれは扱える大きさに変わる。🌙 全部を解決しなくていい。🛁 ただ「私はこう感じている」と認めるだけで、心の重さは半分になるよ。🤍',
    today: '「{f}」の夢が伝えているのは、本当の気持ちから目をそらさなくていいということ。🌿 今日は静かな時間を5分だけ作って、心に「何が一番つらい?」と聞いてみて。🕯️ 答えはきっとすぐに返ってくる。💭 自分の声を聞けた分だけ、進む方向ははっきりするよ。🌅',
  },
  {
    theme: 'love',
    body: '「{f}」という夢。これは、あなたが心のどこかで、寂しさや孤独を感じているサイン。🥺 夢が切なかったのは、本当はもっと誰かとつながりたいと思っているから。🤍 強がって「ひとりで平気」と言ってきたけれど、心は正直だよ。🍵 そのさみしさは、決して弱さなんかじゃない。',
    advice: '今日は、安心できる誰かに、ほんの少しだけ心を開いてみて。💌 大きな相談じゃなくていい。「最近どう?」の一言でいい。🌸 つながりは、自分から小さく差し出すと返ってくる。🧺 そして、ひとりの時間も自分を責めずに大切に過ごして。🤍 さみしさを認めることが、回復の最初の一歩だよ。',
    today: '「{f}」の夢が教えてくれているのは、人に頼っていいということ。🌿 今日は、誰かに連絡をひとつだけ送ってみて。💌 弱音でも、雑談でもいい。🤍 心を少し開くだけで、ひとりで抱えていた重さは確実に軽くなるよ。🌅',
  },
  {
    theme: 'work',
    body: '「{f}」という夢。これは、あなたが今の進み方に「本当にこれでいいのか」と迷っているサイン。🌫️ 夢がすっきりしなかったのは、進む方向への小さな不安が残っているから。🍵 周りのペースに合わせすぎて、自分の歩幅を見失っていないか。🧭 心は今、立ち止まって確認したがっている。',
    advice: '今日は、今の道を進んだ先に何があるかを、具体的に紙に書いてみて。✍️ ワクワクするか、気が重いか。その感覚があなたの答えだよ。🧭 焦って大きな決断をする必要はない。🛁 まずは「今日できる小さな修正」を1つだけ決めて、足元から整えていこう。',
    today: '「{f}」の夢が伝えているのは、自分のペースを取り戻していいということ。🌿 今日は、誰かと比べそうになったら一度立ち止まって。🕯️ あなたの時計は、あなたのもの。💭 自分の歩幅で進むと決めた分だけ、迷いは静かに晴れていくよ。🌅',
  },
];

const FALLBACK_NEUTRAL: readonly FallbackVariant[] = [
  {
    theme: 'mystery',
    body: '「{f}」という夢。🔮 これは、あなたの心の奥で、何かが静かに動き始めているサイン。🕯️ 大きな出来事ではなくても、気持ちのどこかに変化の兆しが芽生えている。🌱 その感覚は、まだ言葉にならないだけで、ちゃんとあなたに伝わろうとしているよ。',
    today: '「{f}」の夢が伝えているのは、心の小さな変化に気づいてあげていいということ。💭 今日は、最近の自分の気分を一度ふり返ってみて。✨ 「前と少し違うな」と感じることがあれば、それは成長の入り口。🌟 変わり始めた自分を、否定せずに見守ってあげて。',
  },
  {
    theme: 'free',
    body: '「{f}」という夢。🌙 これは、あなたが新しい何かに向かう、ちょうど助走の時期にいるサイン。🪽 まだ動き出してはいなくても、心はもう次の場所を見ている。🌿 今感じている落ち着かなさは、停滞ではなく、変わる前の自然なざわめきだよ。',
    today: '「{f}」の夢が示しているのは、変化の準備がもう始まっているということ。🌅 今日は、最近気になっていることを1つ思い浮かべてみて。💭 まだ動かなくていい。✨ ただ「これが気になっている」と認めるだけで、次の一歩の輪郭が見えてくるよ。🌟',
  },
  {
    theme: 'love',
    body: '「{f}」という夢。🌸 これは、あなたの心が、人とのつながり方について何かを感じ取っているサイン。💭 誰かとの関係や、自分の接し方が、心のテーマになっている。🍃 大きな問題ではなく、ただ「もう少し心地よくしたい」という静かな願いだよ。',
    today: '「{f}」の夢が伝えているのは、自分の対人関係を少し見つめ直すタイミングだということ。💭 今日は、一緒にいて心が軽くなる人は誰かを思い浮かべてみて。🌸 その人との時間を少し増やすだけで、毎日の気持ちは自然と整っていくよ。🌟',
  },
  {
    theme: 'anx',
    body: '「{f}」という夢。🌊 これは、あなたの心が「少し休みたい」とつぶやいているサイン。🍃 はっきりした疲れではなくても、心のどこかに静けさを求める気持ちがある。🕯️ それは、立ち止まって自分をいたわるタイミングが来たという合図だよ。',
    today: '「{f}」の夢が教えてくれているのは、ペースをゆるめても大丈夫だということ。💭 今日は、予定の合間に静かな時間を5分だけ作ってみて。☕ 何もしない時間は、心の充電そのもの。🌙 立ち止まることを、自分に許してあげて。🌟',
  },
  {
    theme: 'work',
    body: '「{f}」という夢。⚡ これは、あなたが次に進みたい方向を、心の奥で探っているサイン。🧭 どこへ向かうか、まだはっきりしていなくても、その問いが生まれたこと自体が前進。🌱 あなたは今、止まっているのではなく、選ぼうとしているんだよ。',
    today: '「{f}」の夢が示しているのは、進む方向を考えるのに良いタイミングだということ。💭 今日は、半年後の自分がどうなっていたいかを1行だけ書いてみて。✨ 完璧な計画じゃなくていい。🌟 言葉にした方向に、心は少しずつ動き始めるよ。🌅',
  },
  {
    theme: 'mystery',
    body: '「{f}」という夢。🔮 これは、あなたがふだん見過ごしている小さな気づきを、心が拾い上げたサイン。🪄 夢に残ったということは、その気づきがあなたにとって意味を持つから。💭 まだ形にならなくても、それは大事なヒントとして心に届いているよ。',
    today: '「{f}」の夢が伝えているのは、自分の中の小さな気づきを大切にしていいということ。💭 今日は、ふと感じたことや思いついたことをメモしてみて。✨ 些細に思えても、書き留めた気づきは後で必ず役に立つ。🌟 あなたの感覚は、ちゃんと正しく働いているよ。',
  },
  {
    theme: 'free',
    body: '「{f}」という夢。🌙 これは、あなたの心が今、穏やかに整っているサイン。🍃 強い感情に振り回されていない、落ち着いた状態。🕯️ こういう時期は、新しいことを受け取ったり、考えをまとめたりするのにちょうどいい。あなたの内側は、今とても安定しているよ。',
    today: '「{f}」の夢が示しているのは、心に余白がある今を活かしていいということ。💭 今日は、その落ち着きを使って、少し先のことを考えてみて。✨ 焦りのない時こそ、良い判断ができる。🌟 整った心で選んだことは、きっと長く続くよ。🌅',
  },
  {
    theme: 'love',
    body: '「{f}」という夢。🌸 これは、あなたが自分自身ともっと仲良くなろうとしているサイン。💭 外の世界より、自分の内側に意識が向いている時期。🍃 それは内向きになっているのではなく、自分を理解しようとする健全な動きだよ。',
    today: '「{f}」の夢が伝えているのは、自分の声をていねいに聞いてあげるタイミングだということ。💭 今日は、「私は今どうしたい?」と自分に静かに問いかけてみて。🌸 答えはもうあなたの中にある。🌟 それを言葉にした分だけ、毎日の選択が自分らしくなっていくよ。',
  },
];

/**
 * Choose a fallback variant deterministically from the dreamer's input.
 * Same input text -> same index -> same reading. Different input -> a
 * different hash -> very likely a different reading.
 */
function pickFallback<T>(text: string, pool: readonly T[]): T {
  const idx = simpleHash(text) % pool.length;
  return pool[idx] as T;
}

/**
 * Fallback for inputs with no dictionary match.
 * Picks one of many forward-looking readings, chosen deterministically from
 * the dreamer's own words. Never returns a generic escape ("意味を探さないで" 等).
 */
function fallbackResult(text: string, tone: DreamTone): DreamResult {
  // Take a short, readable fragment of the dreamer's own words. Prefer
  // cutting at the first sentence break so the quoted phrase reads naturally.
  const cleaned = text.replace(/\s+/g, '');
  const firstSentence = cleaned.split(/[。、!！?？]/)[0] ?? cleaned;
  const base = firstSentence.length > 0 ? firstSentence : cleaned;
  const fragment = base.length > 14 ? `${base.slice(0, 14)}…` : base || 'その夢';
  const fill = (s: string) => s.split('{f}').join(fragment);

  let body: string;
  let advice: string | null;
  let todayMessage: string;
  let themeKey: DreamCategory;

  if (tone === 'positive') {
    const v = pickFallback(text, FALLBACK_POSITIVE);
    body = fill(v.body);
    advice = null;
    todayMessage = fill(v.today);
    themeKey = v.theme;
  } else if (tone === 'negative') {
    const v = pickFallback(text, FALLBACK_NEGATIVE);
    body = fill(v.body);
    advice = fill(v.advice);
    todayMessage = fill(v.today);
    themeKey = v.theme;
  } else {
    const v = pickFallback(text, FALLBACK_NEUTRAL);
    body = fill(v.body);
    advice = null;
    todayMessage = fill(v.today);
    themeKey = v.theme;
  }

  const theme = THEMES[themeKey];
  const reading: DreamReading = {
    headline: '夢からの個別メッセージ',
    emoji: tone === 'negative' ? '🌙' : tone === 'positive' ? '✨' : '🔮',
    body: paragraphize(body),
    advice: advice ? paragraphize(advice) : null,
  };

  return {
    theme,
    tone,
    keyword: fragment,
    reading,
    todayMessage: paragraphize(todayMessage),
    archive: {
      typeId: 'dream_generic',
      themeKey: theme.key,
      summary: fragment,
    },
  };
}

export function analyzeDream(text: string, _signIdx = 0): DreamResult {
  const input = text ?? '';
  const tone = detectTone(input);

  const entry = matchEntry(input);
  if (!entry) {
    return fallbackResult(input, tone);
  }

  const theme = THEMES[entry.category];
  const body = paragraphize(readingFor(entry, tone));
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
