/**
 * 月ごとの夢の傾向分析 (Monthly dream-trend analysis): offline, zero runtime
 * API cost. Premium feature ① のプレビュー実装。
 *
 * loadArchive() に貯まった夢ログ (ArchiveEntry) を当月ぶん集計し、頻出テーマ /
 * 先月との変化 / くり返しパターン / 姉貴分トーンの一言を、すべてルールベースで
 * 決定的に組み立てて返す。LLM / 外部 API は一切使わない。
 *
 * 設計は dream.ts / midnight.ts を踏襲:
 * - 文言バリエーションは simpleHash(seed) で決定的に選ぶ (同じ集計結果 ->
 *   同じ一言 / 違う集計結果 -> 高確率で違う一言)。
 * - テーマは ArchiveEntry.themeKey (anx/love/free/work/mystery) を集計軸にする。
 *   typeId は現状すべて 'dream_generic' で意味を持たないため使わない。
 * - 当月 3 件以上で分析成立。3 件未満は「あと○件で今月の傾向が見えるよ」と
 *   進捗を返し、空振りを避ける。
 *
 * 法務 (消費者契約法 4 条 3 項): 不安をあおる表現は禁止。「危険」「警告」
 * 「このままでは」「手遅れ」等は使わない。占いの断定もしない。寄り添いと
 * 機能の温度 (ICP.md 姉貴分の本音モード) で返す。
 */

import { simpleHash } from './hash';
import type { ArchiveEntry } from '@/lib/archive';

/** themeKey は dream.ts の DreamCategory と同じ 5 種。 */
type ThemeKey = 'anx' | 'love' | 'free' | 'work' | 'mystery';

/** themeKey -> 表示ラベル + アイコン。dream.ts の THEMES と整合させる。 */
const THEME_META: Record<ThemeKey, { label: string; icon: string }> = {
  anx: { label: '不安・解放', icon: '🌊' },
  love: { label: '恋愛・感情', icon: '🌸' },
  free: { label: '自由・飛翔', icon: '🪽' },
  work: { label: '成長・課題', icon: '⚡' },
  mystery: { label: '深層・謎', icon: '🔮' },
};

const KNOWN_THEMES: readonly ThemeKey[] = ['anx', 'love', 'free', 'work', 'mystery'];

/** 分析成立に必要な当月の最小記録数。 */
export const TREND_MIN_ENTRIES = 3;

/** 「くり返し現れるパターン」と判定するテーマの最小出現回数。 */
const REPEAT_THRESHOLD = 3;

export interface ThemeCount {
  key: ThemeKey;
  label: string;
  icon: string;
  count: number;
}

/**
 * 感情の傾き (emotion trend)。ArchiveEntry には感情/トーン列が無いため、
 * themeKey から感情極性を近似して当月分を集計する (¥0・決定的)。
 *  - free / work -> 前向き (forward): 自由・飛翔 / 成長・課題は外向きの動き
 *  - anx        -> 手当て (tending): 不安・解放は休息や回復のサイン
 *  - love / mystery -> 凪 (calm):  恋愛・感情 / 深層・謎は静かに見つめる温度
 * 占いの断定・不安をあおる表現は使わない。割合は当月の記録数を母数にする。
 */
export type EmotionPolarity = 'forward' | 'tending' | 'calm';

export interface EmotionTrend {
  /** 前向き寄り (free/work) の件数。 */
  forward: number;
  /** 手当て寄り (anx) の件数。 */
  tending: number;
  /** 凪寄り (love/mystery) の件数。 */
  calm: number;
  /** 当月の記録総数 (= forward + tending + calm)。割合の母数。 */
  total: number;
  /** 前向き比率 (0-100 の整数 %)。total が 0 なら 0。 */
  forwardRatio: number;
  /** いちばん多い感情傾向。 */
  dominant: EmotionPolarity;
  /** 集計から組み立てた、感情の傾きを伝える一言。あおらない。 */
  note: string;
}

/** 分析がまだ成立していないとき (当月 3 件未満)。 */
export interface DreamTrendPending {
  ready: false;
  /** 当月の記録数。 */
  monthCount: number;
  /** 分析成立まであと何件か。 */
  remaining: number;
  /** 進捗を伝える姉貴分トーンの一言。あおらない。 */
  message: string;
}

/** 分析成立 (当月 3 件以上)。 */
export interface DreamTrendReport {
  ready: true;
  /** 対象の年月 (表示用)。 */
  year: number;
  month: number;
  /** 当月の記録数。 */
  monthCount: number;
  /** 頻出テーマ Top3 (多い順)。 */
  topThemes: ThemeCount[];
  /** 今月の感情の傾き (前向き比率など)。themeKey 由来で近似。 */
  emotionTrend: EmotionTrend;
  /** 先月とくらべた傾向の変化を一言で。先月 0 件なら導入の語りに切り替える。 */
  changeNote: string;
  /** くり返し現れるパターン (3 回以上のテーマ)。無ければ null。 */
  repeatNote: string | null;
  /** 集計結果から組み立てた、今月のあなたへの一言。 */
  closing: string;
}

export type DreamTrend = DreamTrendPending | DreamTrendReport;

/** ts が year/month (month は 0-indexed) と同じ月か。端末ローカル時刻で判定。 */
function inMonth(ts: number, year: number, month: number): boolean {
  const d = new Date(ts);
  return d.getFullYear() === year && d.getMonth() === month;
}

/** themeKey を既知の 5 種に正規化。未知キーは mystery (深層・謎) に寄せる。 */
function normalizeTheme(themeKey: string): ThemeKey {
  return (KNOWN_THEMES as readonly string[]).includes(themeKey)
    ? (themeKey as ThemeKey)
    : 'mystery';
}

/** entries を themeKey ごとに集計し、多い順 (同数は KNOWN_THEMES 順) で返す。 */
function countThemes(entries: readonly ArchiveEntry[]): ThemeCount[] {
  const counts = new Map<ThemeKey, number>();
  for (const e of entries) {
    const k = normalizeTheme(e.themeKey);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const list: ThemeCount[] = [];
  for (const key of KNOWN_THEMES) {
    const count = counts.get(key) ?? 0;
    if (count > 0) {
      list.push({ key, label: THEME_META[key].label, icon: THEME_META[key].icon, count });
    }
  }
  // 多い順。同数は KNOWN_THEMES の並び (list の挿入順) を保つ安定ソート。
  return list.sort((a, b) => b.count - a.count);
}

/* ---- 進捗メッセージ (3 件未満): 各 remaining 値で複数バリエーション ---- */

const PENDING_FIRST: readonly string[] = [
  'まだ今月の夢の記録がないね。🌱 夢占いをして「ログに残す」を押すと、ここに今月の傾向が見えてくるよ。',
  '今月はこれから。🌷 夢を1つ書き留めるところから、あなただけの傾向分析が育っていくよ。',
  'まっさらな今月だね。✨ 見た夢を記録していくと、月のおわりには心のテーマが浮かび上がってくるよ。',
];

const PENDING_PROGRESS: readonly string[] = [
  '今月はあと{n}件で、傾向が見えてくるよ。🌿 あせらなくていい、見た夢を1つずつ残していこう。',
  'いいペース。🌸 あと{n}件たまると、今月のテーマやくり返しが読み解けるようになるよ。',
  'もう少し。🪄 あと{n}件記録すると、今月のあなたの心の動きが言葉になって返ってくるよ。',
  'あと{n}件で今月の分析がそろうよ。✨ 夢は思い出せる範囲で大丈夫、ゆっくりいこう。',
];

function pickN<T>(seed: string, pool: readonly T[]): T {
  return pool[simpleHash(seed) % pool.length] as T;
}

function buildPending(monthCount: number): DreamTrendPending {
  const remaining = TREND_MIN_ENTRIES - monthCount;
  const seed = `pending|${monthCount}`;
  const message =
    monthCount === 0
      ? pickN(seed, PENDING_FIRST)
      : pickN(seed, PENDING_PROGRESS).split('{n}').join(String(remaining));
  return { ready: false, monthCount, remaining, message };
}

/* ---- 先月との変化: 今月トップ vs 先月トップ で分岐。あおらない ---- */

const CHANGE_NO_PREV: readonly string[] = [
  '先月の記録がないから、今月がはじめての傾向分析だね。🌷 これがあなたの心の出発点だよ。',
  '比べる先月のデータはまだないけど、それでいい。✨ 今月のあなたを、まずはそのまま受け取ろう。',
  '先月分がないぶん、今月の傾向がまっさらな1ページ目になるよ。📖 ここから積み重なっていく。',
];

const CHANGE_SAME_TOP: readonly string[] = [
  '先月から続いて、今月も「{cur}」が中心のテーマ。🍃 同じ流れの中にいるあなたは、いま大事な何かとじっくり向き合ってるんだね。',
  '今月も「{cur}」が一番多かったよ。🌿 先月からつながるテーマは、急がず付き合っていけば大丈夫。',
  '「{cur}」が先月に続いてのトップ。🕯️ くり返すテーマは、あなたの心がちゃんと向き合おうとしてる証だよ。',
];

const CHANGE_SHIFTED: readonly string[] = [
  '先月は「{prev}」が多かったけど、今月は「{cur}」へ。🌗 心の向きがやさしく移り変わってきてるね。',
  '今月は「{prev}」から「{cur}」へとテーマが動いた。🍃 変化は、あなたが前に進んでるサインだよ。',
  '先月の「{prev}」から、今月は「{cur}」が前に出てきたね。✨ 心の景色が少しずつ変わってる。',
];

function buildChangeNote(
  seed: string,
  curTop: ThemeKey | null,
  prevTop: ThemeKey | null,
): string {
  if (!prevTop) return pickN(`${seed}|nochange`, CHANGE_NO_PREV);
  const cur = curTop ? THEME_META[curTop].label : '';
  const prev = THEME_META[prevTop].label;
  if (curTop && curTop === prevTop) {
    return pickN(`${seed}|same`, CHANGE_SAME_TOP).split('{cur}').join(cur);
  }
  return pickN(`${seed}|shift`, CHANGE_SHIFTED)
    .split('{prev}')
    .join(prev)
    .split('{cur}')
    .join(cur);
}

/* ---- くり返しパターン: 3 回以上のテーマ ---- */

const REPEAT_NOTE: readonly string[] = [
  '「{theme}」の夢が今月{n}回も。🔁 何度も出てくるね。それだけ心が伝えたい何かがあるのかも。',
  '今月は「{theme}」が{n}回くり返してる。🪄 何度も出てくるテーマは、いまのあなたの本音に近い場所にあるよ。',
  '「{theme}」が{n}回。🔁 くり返し現れるのは、そこにあなたの大事なテーマが眠ってるサインだよ。',
];

function buildRepeatNote(seed: string, themes: readonly ThemeCount[]): string | null {
  const repeated = themes.find((t) => t.count >= REPEAT_THRESHOLD);
  if (!repeated) return null;
  return pickN(`${seed}|repeat`, REPEAT_NOTE)
    .split('{theme}')
    .join(repeated.label)
    .split('{n}')
    .join(String(repeated.count));
}

/* ---- 今月のあなたへの一言: トップテーマ別 × 集計から決定的に ---- */

const CLOSING_BY_THEME: Record<ThemeKey, readonly string[]> = {
  anx: [
    '今月のあなたは、心の手当てがテーマの時期だったみたい。🌿 がんばってきた自分を、まずはちゃんとねぎらってあげて。',
    '不安や解放の夢が多めの今月。🤍 ためこんできた気持ちを、少しずつおろしていける月にしていこう。',
    '今月の夢は、休息を求めるサインが目立ったよ。🛁 立ち止まることも、ちゃんと前に進む一部だからね。',
  ],
  love: [
    '今月のあなたは、人とのつながりが心のまんなかにあったみたい。🌸 大切な誰かとの距離を、やさしく見つめ直す月だね。',
    '恋愛や感情の夢が多めの今月。💗 自分の気持ちを後回しにせず、まず満たしてあげる時期だよ。',
    '今月の夢には、あたたかさを求める気持ちがよく出てたよ。🤍 心を開いたぶんだけ、いいものが返ってくる。',
  ],
  free: [
    '今月のあなたは、新しい場所へ向かいたい気持ちが強かったみたい。🪽 窮屈さは、世界を広げたいという健やかな合図だよ。',
    '自由や飛翔の夢が多めの今月。🌈 いつもの枠を少しはみ出すと、景色が変わっていく月になりそう。',
    '今月の夢は、変化を歓迎する準備が整ってきたサイン。🌅 小さく動き出せば、流れはあなたの味方だよ。',
  ],
  work: [
    '今月のあなたは、成長や課題と向き合うテーマの時期だったみたい。⚡ 積み重ねはちゃんと形になり始めてるよ。',
    '成長や課題の夢が多めの今月。🎯 焦らず自分の歩幅で進めば、力はちゃんと届くからね。',
    '今月の夢には、次へ進みたい気持ちがよく出てたよ。🧭 進む方向は、もうあなたの中に芽生えてる。',
  ],
  mystery: [
    '今月のあなたは、心の奥の声に耳をすませる時期だったみたい。🔮 言葉にならない感覚も、大事なヒントだよ。',
    '深層や謎の夢が多めの今月。🪄 自分の直感を、少しだけ信じてあげていい月だね。',
    '今月の夢は、内側で何かが静かに動いているサイン。🕯️ その小さな気づきを、大切にしていこう。',
  ],
};

function buildClosing(seed: string, curTop: ThemeKey | null): string {
  const key = curTop ?? 'mystery';
  return pickN(`${seed}|closing|${key}`, CLOSING_BY_THEME[key]);
}

/* ---- 感情の傾き: themeKey 由来で近似集計 ---- */

/** themeKey -> 感情極性。dream.ts のトーン設計と整合させた近似。 */
const THEME_POLARITY: Record<ThemeKey, EmotionPolarity> = {
  free: 'forward',
  work: 'forward',
  anx: 'tending',
  love: 'calm',
  mystery: 'calm',
};

const EMOTION_NOTE: Record<EmotionPolarity, readonly string[]> = {
  forward: [
    '今月の夢は、前を向くエネルギーが {ratio}% と多めだったよ。🪽 心が次の景色を見たがってるサインだね。',
    '前向きな手ざわりの夢が {ratio}% を占めた今月。🌈 動き出す力が、ちゃんとあなたの中にそろってる。',
    '今月は心が外へ向かう夢が {ratio}%。⚡ その勢いを、小さな一歩に乗せていける時期だよ。',
  ],
  tending: [
    '今月の夢は、心の手当てを求める色あいが目立ったよ。🌿 がんばってきた自分を、まずねぎらってあげて。',
    '休息を求めるサインの夢が多めの今月。🛁 立ち止まることも、ちゃんと前に進む一部だからね。',
    '今月はいたわりのテーマが前に出ていたよ。🤍 ためこんだものを、少しずつおろしていける月にしよう。',
  ],
  calm: [
    '今月の夢は、静かに自分を見つめる凪の色あいだったよ。🕯️ 急がず、感じていることを大事にしていい時期。',
    '心が穏やかに整っている夢が多めの今月。🍃 新しいことを受け取るのに、ちょうどいい温度だね。',
    '今月は内側にそっと耳をすませる夢が中心だったよ。🤍 言葉にならない感覚も、大切なヒントになる。',
  ],
};

/** 当月 entries から感情の傾きを集計する。決定的・あおらない。 */
function buildEmotionTrend(seed: string, entries: readonly ArchiveEntry[]): EmotionTrend {
  let forward = 0;
  let tending = 0;
  let calm = 0;
  for (const e of entries) {
    const polarity = THEME_POLARITY[normalizeTheme(e.themeKey)];
    if (polarity === 'forward') forward++;
    else if (polarity === 'tending') tending++;
    else calm++;
  }
  const total = forward + tending + calm;
  const forwardRatio = total > 0 ? Math.round((forward / total) * 100) : 0;

  // いちばん多い極性。同数は forward > tending > calm の優先で安定させる。
  let dominant: EmotionPolarity = 'calm';
  if (forward >= tending && forward >= calm) dominant = 'forward';
  else if (tending >= forward && tending >= calm) dominant = 'tending';

  const note = pickN(`${seed}|emotion|${dominant}`, EMOTION_NOTE[dominant])
    .split('{ratio}')
    .join(String(forwardRatio));

  return { forward, tending, calm, total, forwardRatio, dominant, note };
}

/**
 * 夢ログ全件から、当月 (now の年月) の傾向分析を組み立てる。
 * 完全に決定的: 同じ entries + 同じ now の年月 -> 同じ出力。
 *
 * @param entries loadArchive() の戻り値 (全件)。
 * @param now     対象月の基準時刻。既定は現在時刻。
 */
export function analyzeDreamTrends(
  entries: readonly ArchiveEntry[],
  now: Date = new Date(),
): DreamTrend {
  const year = now.getFullYear();
  const month = now.getMonth();

  const thisMonth = entries.filter((e) => inMonth(e.timestamp, year, month));
  if (thisMonth.length < TREND_MIN_ENTRIES) {
    return buildPending(thisMonth.length);
  }

  // 先月 (month - 1) ぶん。1 月のときは前年 12 月へまわる。
  const prevBase = new Date(year, month - 1, 1);
  const prevMonth = entries.filter((e) =>
    inMonth(e.timestamp, prevBase.getFullYear(), prevBase.getMonth()),
  );

  const themes = countThemes(thisMonth);
  const topThemes = themes.slice(0, 3);
  const curTop = topThemes.length > 0 ? topThemes[0]!.key : null;

  const prevThemes = countThemes(prevMonth);
  const prevTop = prevThemes.length > 0 ? prevThemes[0]!.key : null;

  // 文言を安定させるシード: 当月のテーマ分布で決まる (同分布 -> 同文言)。
  const seed = `${year}-${month}|${themes.map((t) => `${t.key}:${t.count}`).join(',')}`;

  return {
    ready: true,
    year,
    month,
    monthCount: thisMonth.length,
    topThemes,
    emotionTrend: buildEmotionTrend(seed, thisMonth),
    changeNote: buildChangeNote(seed, curTop, prevTop),
    repeatNote: buildRepeatNote(seed, themes),
    closing: buildClosing(seed, curTop),
  };
}
