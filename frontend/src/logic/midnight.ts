/**
 * 深夜の問いかけ (Midnight question): offline, rule-based, zero runtime API cost.
 *
 * Premium 目玉機能。ユーザーが「今夜のモヤモヤ」を1問書くと、姉貴分トーンの
 * 応答をルールベースで組み立てて返す。LLM / 外部 API は一切使わない。
 *
 * 設計は dream.ts を踏襲:
 * - トーン判定は dream.ts と同じ NEGATIVE/POSITIVE マーカー方式を再利用
 * - 応答は simpleHash(input) で決定的に選ぶ（同じ入力 -> 同じ応答 /
 *   違う入力 -> 高確率で違う応答）
 * - 各トーン 8 種以上のテンプレで繰り返しを回避（dream.ts のフォールバック
 *   多バリエーション手法）
 *
 * 掛け合わせる軸:
 *   感情トーン (前向き / モヤモヤ / 凪) × 感情カテゴリ (人間関係 / 仕事 /
 *   恋愛 / 漠然とした不安 / 自分自身) × 時間帯 (深夜 / 朝 / 昼 / 夜) ×
 *   利用者の無料ホロスコープ (sign + getHoroscopeReading の本質ひとこと)
 *
 * 法務 (消費者契約法 4 条 3 項): 不安をあおる表現は禁止。「危険」「破綻」
 * 「警告」「このままでは」等は使わない。占いの断定もしない。寄り添いと
 * 機能の温度（ICP.md 姉貴分の本音モード）で返す。
 */

import { simpleHash } from './hash';
import { getHoroscopeReading } from './horoscope';
import type { UserProfile } from '@/lib/firestore';

export type MidnightTone = 'forward' | 'tangle' | 'calm';

export type MidnightCategory = 'people' | 'work' | 'love' | 'unease' | 'self';

export type TimeBand = 'midnight' | 'morning' | 'noon' | 'night';

export interface MidnightResponse {
  /** 対等な姉貴分の一言（導入）。時間帯で語り口が変わる。 */
  opener: string;
  /** 本体: モヤモヤを受け止め、相手の本音に寄り添う数文。 */
  body: string;
  /** ホロスコープ（sign の本質）を絡めた、その人だけの一言。 */
  starNote: string;
  /** 今夜できる、いちばん小さなひとつ。説教にしない。 */
  nudge: string;
  /** 内部メタ: 履歴・将来の傾向分析の入力になる。 */
  meta: {
    tone: MidnightTone;
    category: MidnightCategory;
    timeBand: TimeBand;
  };
}

/* ---- トーン判定: dream.ts と同じマーカー方式 ---- */

/** モヤモヤ・つらさを示す語。dream.ts の NEGATIVE_MARKERS を踏襲。 */
const TANGLE_MARKERS = [
  '不安', '焦', '泣', '苦し', '痛', 'つら', '辛', '嫌', '悲し', '寂し',
  'さみし', '孤独', '失', 'なくし', '無くし', '落ち込', '暗', '闇',
  '怖', 'こわ', 'モヤ', 'もや', 'イライラ', 'いらい', '疲れ', 'しんど',
  '消えたい', 'もう無理', 'わからな', '分からな', '迷', 'はぐれ',
  '取り残', '震え', '冷た', '裏切', 'ダメ', 'できない', '間に合わ',
  '責め', '後悔', '自信ない', '虚し', 'むなし', '眠れな', '重い',
];

/** 前向き・うれしさを示す語。dream.ts の POSITIVE_MARKERS を踏襲。 */
const FORWARD_MARKERS = [
  '楽し', 'うれし', '嬉し', '幸せ', 'しあわせ', '笑', '気持ちい',
  '気持ち良', 'すっきり', 'スッキリ', '安心', '穏や', 'おだや',
  'わくわく', 'ワクワク', 'ドキドキ', '好き', '愛', 'ハッピー',
  '輝', '満たさ', '満足', '癒', 'やさし', '優し', '成功', '受かっ',
  'できた', 'できそう', '前向き', '頑張れ', 'がんばれ', '楽になっ',
  '解決', 'よかった', '良かった', '感謝', 'ありがと',
];

function countHits(text: string, markers: readonly string[]): number {
  let n = 0;
  for (const m of markers) if (text.includes(m)) n++;
  return n;
}

/** 入力の本人の言葉から感情トーンを決める。dream.ts の detectTone と同型。 */
function detectTone(text: string): MidnightTone {
  const tangle = countHits(text, TANGLE_MARKERS);
  const forward = countHits(text, FORWARD_MARKERS);
  if (tangle === 0 && forward === 0) return 'calm';
  if (tangle > forward) return 'tangle';
  if (forward > tangle) return 'forward';
  // 同点で両方ヒット: 寄り添いを優先して tangle に倒す（あおりではなく手当て）。
  return 'tangle';
}

/* ---- 感情カテゴリ判定: 何についてのモヤモヤか ---- */

const CATEGORY_MARKERS: Record<MidnightCategory, readonly string[]> = {
  people: [
    '友達', '友人', '親友', '人間関係', '同僚', '上司', '先輩', '後輩',
    '家族', '親', '母', '父', 'ママ', 'パパ', 'グループ', 'みんな',
    '嫌われ', '陰口', '比べ', 'マウント', '気をつか', '気を使',
  ],
  work: [
    '仕事', '会社', '職場', '残業', '転職', '退職', '辞め', '評価',
    '上司', '同僚', 'プロジェクト', '締め切り', '締切', 'ミス', '失敗',
    'キャリア', '将来', '進路', '勉強', '受験', '就活', 'バイト', '給料',
  ],
  love: [
    '恋', '好きな人', '彼氏', '彼女', '元カレ', '元カノ', '片思い',
    '振られ', 'ふられ', '別れ', '復縁', 'デート', '連絡', '既読',
    '気になる人', '推し', '結婚', '婚約', '浮気', 'すれ違',
  ],
  unease: [
    '不安', '焦', 'モヤ', 'もや', '漠然', 'なんとなく', 'わからな',
    '分からな', '怖', 'こわ', '将来', 'お金', 'お金が', 'この先',
    '眠れな', '消えたい', '虚し', 'むなし', '生き', 'なんのため',
  ],
  self: [
    '自分', '私', 'わたし', '僕', 'ぼく', '俺', 'おれ', '性格',
    '自信', 'コンプレックス', '見た目', '体型', '変わりた', 'なりたい',
    'できない', 'ダメな', '価値', '比べ', '責め', '後悔', '疲れ',
  ],
};

/** 何についてのモヤモヤかを推定。複数該当時はヒット数が多いものを採用。 */
function detectCategory(text: string): MidnightCategory {
  let bestCat: MidnightCategory = 'unease';
  let bestHits = 0;
  for (const cat of Object.keys(CATEGORY_MARKERS) as MidnightCategory[]) {
    const hits = countHits(text, CATEGORY_MARKERS[cat]);
    if (hits > bestHits) {
      bestHits = hits;
      bestCat = cat;
    }
  }
  // 何も拾えなければ「漠然とした不安」に寄せる（深夜に開く人の最頻ケース）。
  return bestCat;
}

/* ---- 時間帯判定 ---- */

/**
 * JST の現在時刻から時間帯を決める。深夜帯ほど振り切った温度を返す入口。
 * 端末のタイムゾーンに依らず JST (UTC+9) で判定する（todayKeyJst と整合）。
 */
export function detectTimeBand(now: Date = new Date()): TimeBand {
  const jst = new Date(now.getTime() + 9 * 3_600_000);
  const h = jst.getUTCHours();
  if (h >= 0 && h < 5) return 'midnight';
  if (h >= 5 && h < 11) return 'morning';
  if (h >= 11 && h < 17) return 'noon';
  return 'night';
}

/**
 * JST の今日を YYYY-MM-DD で返す (本体プール選択の日付シード)。
 * midnightStore.todayKeyJst と同一仕様だが、循環依存を避けてローカルに持つ。
 * 1 日 1 問の保存は midnightStore 側が同日再生成を抑止するため、ここで日付を
 * シードに混ぜても「同日同入力は同結果」は保たれる (翌日に開くと別結果になる)。
 */
function dayKeyJst(now: Date): string {
  const d = new Date(now.getTime() + 9 * 3_600_000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * 時間帯ごとの opener プール（各 4 種以上）。
 * 「平均値（断るべき）」ではなく「同じ夜にいる者どうしの対等さ」(ICP.md)。
 * 深夜は共犯感まで振り切り、朝昼は少し外す。
 */
const OPENERS: Record<TimeBand, readonly string[]> = {
  midnight: [
    'まだ起きてるんだ。…まあ、わたしもだけど。🌃',
    'こんな時間に言葉を探してるってことは、けっこう本気のやつだね。🌙',
    'うん、聞くよ。深夜のモヤモヤは、昼間より正直だから。🕯️',
    'こんな時間まで考えてたんだね。えらいとかじゃなくて、ただ、おつかれ。🫧',
    '眠れない夜の頭の中、わたしはわりと信用してる。本音が出るから。🌌',
  ],
  morning: [
    'おはよう。朝にこれを書いてるなら、ゆうべは抱えたまま眠ったんだね。☕',
    '朝のいちばん静かな時間に、よく言葉にしたね。聞くよ。🌅',
    'まだ一日が始まる前だね。重いものは、ここで半分おろしていこう。🍃',
    '朝に出てくる気持ちは、たいてい本物だよ。受け取った。🌤️',
  ],
  noon: [
    '昼間の合間にこれを開いたんだ。ちょっとだけ、ここで息つこう。🍵',
    '日中なのに頭から離れない。それ、ちゃんと向き合う価値のあるやつだね。☀️',
    '忙しい時間に、よく自分の気持ちに気づいたね。聞くよ。🌿',
    '昼の明るさの中でもモヤッとするなら、見ないふりはもうやめどきかもね。🪟',
  ],
  night: [
    'おつかれ。今夜もよく帰ってきたね。🌙',
    '一日の終わりに、よく言葉にしたね。ここからは肩の力、抜いていい。🛁',
    '夜になって出てくる気持ちって、その日いちばんの本音だったりする。🕯️',
    'うん、夜だね。今日のぶんのモヤモヤ、ここで一回おろそう。🌌',
  ],
};

/* ---- 本体プール: トーン × カテゴリで分岐。各トーン 8 種以上 ---- */

interface BodyVariant {
  category: MidnightCategory;
  /** モヤモヤを受け止める本体。{f} は本人の言葉の断片に置換。 */
  body: string;
  /** 今夜できる、いちばん小さなひとつ。説教にしない。 */
  nudge: string;
}

// 凪 (calm): 強い感情語がない。静かに整える温度。8 種。
const CALM_VARIANTS: readonly BodyVariant[] = [
  {
    category: 'unease',
    body: '「{f}」か。はっきりした形のないモヤモヤって、いちばん持て余すよね。💭 でも、言葉にできないだけで、ちゃんと中身はある。今夜は無理に答えを出さなくていいよ。',
    nudge: '今いちばん引っかかってることを、ひとことだけメモに残してみて。📝 名前がつくと、輪郭がすこし見えてくるから。',
  },
  {
    category: 'self',
    body: '「{f}」って書いたんだね。自分のことを考える夜は、誰のためでもない、自分だけの時間だよ。🕯️ 答え合わせをしようとしなくていい。今は感じてるだけで十分。',
    nudge: '「私は今どうしたい?」って、声に出さずでいいから自分に聞いてみて。🤍 答えは、もうあなたの中にあると思う。',
  },
  {
    category: 'people',
    body: '「{f}」だね。人との距離って、近すぎても遠すぎても疲れるもんね。🍵 今あなたが感じてる違和感は、たぶん「もうちょっと心地よくしたい」っていう静かな願いだよ。',
    nudge: '一緒にいて肩の力が抜ける人を、ひとり思い浮かべてみて。🌿 その人との時間を少し増やすだけで、毎日のトーンは変わる。',
  },
  {
    category: 'work',
    body: '「{f}」か。今のやり方が合ってるのか、ふと立ち止まりたくなる夜ってあるよね。🧭 それは止まってるんじゃなくて、ちゃんと選ぼうとしてる証拠だよ。',
    nudge: '半年後の自分がどうなってたいか、一行だけ書いてみて。✨ 完璧な計画じゃなくていい。言葉にした方向に、心は動き出すから。',
  },
  {
    category: 'love',
    body: '「{f}」だね。恋の気持ちって、自分でも測りきれないところがあるよね。🌸 急いで結論を出さなくていい。今夜は、その揺れをそのまま持っていていい。',
    nudge: '相手にどうしてほしいかより、「自分はどうしたいか」を先に考えてみて。💭 そこがはっきりすると、迷いはすっと軽くなる。',
  },
  {
    category: 'unease',
    body: '「{f}」って、なんとなく心がざわつく感じかな。🌊 強い理由がなくても、ざわつく時はざわつく。それは弱さじゃなくて、繊細にできてるってことだよ。',
    nudge: '今夜は、温かいものを一杯だけ飲んでみて。🍵 体があたたまると、不思議と思考も静かになるから。',
  },
  {
    category: 'self',
    body: '「{f}」か。自分の輪郭をたしかめたくなる夜ってあるよね。🪞 外の評価はいったん置いて、自分がどう感じるかだけを基準にしていい時間だよ。',
    nudge: '今日できた小さなことを、3つだけ数えてみて。🌟 できなかったことより、できたことに目を向けると、夜の重さは変わる。',
  },
  {
    category: 'work',
    body: '「{f}」だね。先が見えない感じって、落ち着かないよね。🍃 でも、見えないのは進んでないからじゃなくて、まだ霧の中ってだけ。歩けば景色は変わる。',
    nudge: '明日いちばん最初にやる小さなことを、ひとつだけ決めておこう。👟 順番が決まると、漠然とした重さがほどけていく。',
  },
];

// モヤモヤ (tangle): つらさ・不安が乗っている。手当ての温度。8 種。
const TANGLE_VARIANTS: readonly BodyVariant[] = [
  {
    category: 'people',
    body: '「{f}」か。人との間でできたモヤモヤは、ひとりで抱えると倍に膨らむよね。😢 あなたは相手に合わせすぎて、自分の声を小さくしてないかな。今夜くらい、自分の側に立っていいよ。',
    nudge: 'のみ込んだ本音を、ノートに一行だけ書き出してみて。🤍 直接ぶつけなくていい。書くだけで、心の中の圧はだいぶ抜ける。',
  },
  {
    category: 'work',
    body: '「{f}」だね。ちゃんとやらなきゃって、自分を追い込みすぎてないかな。🫧 うまくいかない時って、力が足りないんじゃなくて、力の入れどころがズレてるだけのことが多い。',
    nudge: '今日の自分に出してる合格ラインを、思い切って下げてみて。🛁 「60点でいい」って一回声に出すと、肩のこわばりがほどける。',
  },
  {
    category: 'love',
    body: '「{f}」か。恋の不安は、相手の気持ちというより、自分の中の自信のゆらぎが見せてることが多いんだよ。💧 大切にされてないかもって思う夜ほど、まず自分を大切にしてあげて。',
    nudge: '今夜は相手の言動を深読みするのを、いったんお休みしよう。🌿 SNSを閉じて、自分が安心できることを一つだけして眠って。',
  },
  {
    category: 'unease',
    body: '「{f}」だね。形のない不安って、夜になると勝手に大きくなるよね。🌀 でもそれ、まだ起きてもいない未来のことだったりしない? 今のあなたは、ちゃんとここにいて大丈夫。',
    nudge: '頭をぐるぐるさせてることを、紙に全部書き出してみて。📝 「自分で変えられること」だけに丸をつけて、あとは今夜は手放していい。',
  },
  {
    category: 'self',
    body: '「{f}」か。自分を責める言葉って、いちばん近くにいるぶん、いちばん深く刺さるよね。🤍 でも、友達が同じことで悩んでたら、あなたはそんな厳しいこと言わないはず。その優しさ、自分にも向けていいよ。',
    nudge: '今日がんばった自分に、ひとつだけ「よくやったね」を言ってあげて。🌙 できなかったことじゃなくて、できたことを見てあげる夜にしよう。',
  },
  {
    category: 'unease',
    body: '「{f}」だね。心も体も、思ってる以上に疲れがたまってるサインかもしれない。😮‍💨 「まだ平気」って言い聞かせてきたぶん、今夜くらいは正直になっていい。回復が最優先の時期だよ。',
    nudge: '今夜は、ひとつ予定を手放して、その時間を休息にあてて。🛁 早く眠る、温かいものを飲む。休むのはサボりじゃなくて、必要な仕事だよ。',
  },
  {
    category: 'people',
    body: '「{f}」か。さみしさを感じてるなら、それは弱さじゃなくて、ちゃんと人とつながりたい気持ちがある証拠だよ。🥺 「ひとりで平気」って強がらなくていい夜もある。今夜がそれ。',
    nudge: '安心できる誰かに、ひとことだけ送ってみない?💌 「最近どう?」でいい。心を少し開くと、抱えてた重さは確実に軽くなる。',
  },
  {
    category: 'work',
    body: '「{f}」だね。周りのペースに合わせようとして、自分の歩幅を見失ってないかな。🌫️ 焦りは、あなたが真剣な証拠。でも、全員が同じ電車に乗る必要はないんだよ。',
    nudge: '誰かと比べそうになったら、一回立ち止まろう。🕯️ あなたの時計は、あなたのもの。明日やる小さな一つだけ決めて、今夜は休んで。',
  },
];

// 前向き (forward): 良いエネルギーがある。背中をそっと押す温度。8 種。
const FORWARD_VARIANTS: readonly BodyVariant[] = [
  {
    category: 'self',
    body: '「{f}」って書けるの、いい夜だね。😊 心が前を向いてる時って、自分でもわかるもんね。その感覚、気のせいなんかじゃないよ。今のあなたの直感は、けっこう冴えてる。',
    nudge: '心が「やってみたい」って言ったこと、今夜ひとつだけ書き留めておこう。✨ 言葉にした瞬間、それは空想から計画に変わるから。',
  },
  {
    category: 'work',
    body: '「{f}」だね。手応えを感じてるなら、それは積み重ねがちゃんと形になり始めてるってことだよ。⚡ 今のあなたには、進むためのエネルギーがそろってる。自分の頑張りを、もっと信じていい。',
    nudge: '後回しにしてた課題に、明日ひとつだけ着手する約束を、今夜の自分としておこう。👟 動いたぶんだけ、結果は近づいてくる。',
  },
  {
    category: 'love',
    body: '「{f}」か。心が誰かに向かって素直に開いてる時って、いちばん魅力的だよ。💗 その気持ち、抱えてるだけじゃもったいない。今のあなたなら、ちゃんと届けられる。',
    nudge: '気になってる人に、理由をつけずに軽く連絡してみない?💌 完璧なタイミングを待たなくていい。心が動いた今が、たぶんいい時。',
  },
  {
    category: 'people',
    body: '「{f}」だね。人とのあたたかい交流に幸運が乗ってる時期だよ。🌸 心を閉じずに過ごしていい。あなたの今の状態なら、いいつながりが自然と返ってくる。',
    nudge: '誰かに「ありがとう」を、今夜ひとつ言葉にしてみて。🤍 当たり前になってる感謝を口に出すと、関係はもっと温かくなる。',
  },
  {
    category: 'unease',
    body: '「{f}」って言える夜は、心に余白がある証拠だよ。🍀 満たされてる時こそ、新しいことを受け取るのにちょうどいい。自分の機嫌を自分で取れてるあなたは、もう十分に強い。',
    nudge: 'その余裕で、自分が本当に好きなことを今夜ひとつ味わってみて。🍵 心を喜ばせる時間が、明日への力にまっすぐつながる。',
  },
  {
    category: 'self',
    body: '「{f}」か。変わってもいいって、自分に許可が出せた夜なのかもね。🌅 ためらってた一歩は、踏み出してみると思ったより軽い。今のあなたには、それを支える力がちゃんとある。',
    nudge: '完璧な準備を待たずに、不完全なまま小さく動き出してみて。🪽 始めた瞬間から、流れはあなたの味方になってくれる。',
  },
  {
    category: 'work',
    body: '「{f}」だね。やりたい方向が見えてる時は、止まってるんじゃなくて助走に入ってるってこと。🌈 そのワクワク、信じて大丈夫。あなたの世界は、思ってるよりずっと広げられる。',
    nudge: 'いつもの枠を少しだけはみ出すことを、明日ひとつ試してみて。🕊️ 小さな冒険が、明日の視界を広げてくれるから。',
  },
  {
    category: 'love',
    body: '「{f}」か。心が満たされてる時のあなたは、まわりにもいい流れを連れてくるよ。🌟 その明るさは本物。今は、うれしい出来事が続きやすい時期だと思う。',
    nudge: '今日心から笑えたことを、ひとつだけ思い出して眠ろう。😊 幸せは、記録すると増えていくものだから。',
  },
];

function variantsFor(tone: MidnightTone): readonly BodyVariant[] {
  if (tone === 'forward') return FORWARD_VARIANTS;
  if (tone === 'tangle') return TANGLE_VARIANTS;
  return CALM_VARIANTS;
}

/**
 * トーン内のバリエーションを、本人の入力 + その日の日付から決定的に選ぶ。
 *
 * 旧実装はカテゴリ一致プールだけから選んでいたため、同カテゴリ・同トーンの
 * 悩みでは実効 1-2 本に収束し反復が早かった。対策として:
 *   1. カテゴリ一致プール (matched) を重み付きで前に置きつつ、トーン全体プール
 *      (pool) も候補に混ぜる。これで一致を優先しながら表現の幅を確保する。
 *   2. 日付キー (dayKey) をシードに混ぜ、同じ入力でも開く日でズレるようにする。
 *      決定性は維持: 同日・同入力は同じ dayKey -> 同じ index -> 同じ応答。
 *
 * matched が空ならトーン全体プールから選ぶ (必ず何か返る)。
 */
function pickBody(
  text: string,
  tone: MidnightTone,
  category: MidnightCategory,
  dayKey: string,
): BodyVariant {
  const pool = variantsFor(tone);
  const matched = pool.filter((v) => v.category === category);
  // 一致プールを先頭に (優先)、続けてトーン全体プールを連結した混合候補列。
  // 一致分が実質的に二重に含まれるため、カテゴリ一致が出やすい重み付けになる。
  const choices = matched.length > 0 ? [...matched, ...pool] : pool;
  const idx = simpleHash(`${text}|${dayKey}`) % choices.length;
  return choices[idx] as BodyVariant;
}

/** opener も同じ入力で安定するよう、hash で決定的に選ぶ。 */
function pickOpener(text: string, band: TimeBand): string {
  const pool = OPENERS[band];
  // opener と body が同じ index に偏らないよう、別シードを混ぜる。
  const idx = simpleHash(`${text}|opener`) % pool.length;
  return pool[idx] as string;
}

/**
 * ホロスコープ（無料データ）を絡めた、その人だけの一言を組み立てる。
 * sign の本質ひとことを抜き、トーンに合わせた枠にはめる。あおらない。
 */
function buildStarNote(
  profile: UserProfile,
  tone: MidnightTone,
): string {
  const essence = extractEssencePhrase(getHoroscopeReading(profile.sign).essence);

  if (tone === 'forward') {
    return `${profile.sign}のあなたは、もともと「${essence}」人。🌟 その力が、今夜はちゃんと働いてるよ。`;
  }
  if (tone === 'tangle') {
    return `${profile.sign}のあなたは、本来「${essence}」人だよ。🤍 今そう感じられないのは、力が消えたんじゃなくて、ちょっと疲れてるだけ。`;
  }
  return `${profile.sign}のあなたの根っこには、「${essence}」力がある。🕯️ 迷う夜こそ、その軸に静かに戻っていい。`;
}

/**
 * ホロスコープ essence 文から、核となるフレーズを取り出す。
 * essence は「あなたの本質は「○○する力」。…」の形なので、内側の
 * 鉤括弧の中身（○○する力）だけを抜く。抜けなければ最初の一文を短く借りる。
 * 「」を二重に重ねないための整形。
 */
function extractEssencePhrase(essence: string): string {
  const m = essence.match(/「([^」]+)」/);
  if (m && m[1]) {
    // 「○○する力」-> 末尾の「力」を外して body 側の「人 / 力がある」に接続する。
    return m[1].replace(/力$/, '').trim();
  }
  const firstSentence = (essence.split('。')[0] ?? essence).trim();
  return firstSentence.replace(/力$/, '').trim() || essence.trim();
}

/**
 * 入力 + プロフィール + 時間帯から、深夜の問いかけの応答を組み立てる。
 * 完全に決定的: 同じ (text, profile, timeBand) は同じ応答を返す。
 */
export function answerMidnight(
  text: string,
  profile: UserProfile,
  now: Date = new Date(),
): MidnightResponse {
  const input = (text ?? '').trim();
  const tone = detectTone(input);
  const category = detectCategory(input);
  const timeBand = detectTimeBand(now);
  const dayKey = dayKeyJst(now);

  const opener = pickOpener(input, timeBand);
  const variant = pickBody(input, tone, category, dayKey);
  const fragment = makeFragment(input);
  const fill = (s: string) => s.split('{f}').join(fragment);

  return {
    opener,
    body: fill(variant.body),
    starNote: buildStarNote(profile, tone),
    nudge: fill(variant.nudge),
    meta: { tone, category, timeBand },
  };
}

/** 本人の言葉の短い断片を取り出す（dream.ts fallbackResult と同じ作法）。 */
function makeFragment(text: string): string {
  const cleaned = text.replace(/\s+/g, '');
  const firstSentence = cleaned.split(/[。、!！?？]/)[0] ?? cleaned;
  const base = firstSentence.length > 0 ? firstSentence : cleaned;
  if (base.length > 18) return `${base.slice(0, 18)}…`;
  return base || 'そのモヤモヤ';
}

/** 各トーンのバリエーション数（テスト・表示用の単一ソース）。 */
export const MIDNIGHT_VARIANT_COUNTS = {
  forward: FORWARD_VARIANTS.length,
  tangle: TANGLE_VARIANTS.length,
  calm: CALM_VARIANTS.length,
} as const;
