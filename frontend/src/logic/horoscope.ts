/**
 * Horoscope self-understanding readings.
 * Sun-sign based deep self-knowledge content (not a daily fortune).
 *
 * Source material: established Western astrology personality profiles
 * cross-referenced from zodiacsign.com, today.com, labyrinthos.co,
 * almanac.com and yourtango.com (12 signs, strengths / challenges /
 * relationship tendencies / life theme).
 *
 * This reading uses only the sun sign derived from the onboarding
 * birthday. Birth time and birth place are not collected, so this is
 * a sun-sign reading and does not claim to be a full natal horoscope.
 */

import { SIGNS } from '@/data/signs';
import { DREAM_TYPES, type DreamType } from '@/data/dreamTypes';
import { simpleHash, makeSeededRandom } from '@/logic/hash';
import type { UserProfile } from '@/lib/firestore';

export interface HoroscopeReading {
  /** One-line essence headline. */
  headline: string;
  /** Element + ruling-planet flavour text. */
  element: string;
  /** Core nature: who this person fundamentally is. */
  essence: string;
  /** Strengths, framed positively. */
  strengths: string;
  /** Weaknesses / growth points, framed as growth hints. */
  growth: string;
  /** Relationship / interpersonal tendency. */
  relationship: string;
  /** The life theme this sign keeps returning to. */
  lifeTheme: string;
}

const READINGS: Record<string, HoroscopeReading> = {
  おひつじ座: {
    headline: 'ゼロをイチにする、はじまりの星',
    element: '火のエレメント / 火星に守られた星座',
    essence:
      'あなたって、考えるより先に体が動いてしまうタイプだよ🔥。「やってみなきゃわかんない」が口癖になってて、気づいたら誰もいない場所に立ってることも多い。誰かに背中を押してもらわなくても、自分で走り出せる人。それって、かなり稀有なことだと思う。',
    strengths:
      '勇気・行動力・素直さ💪。怖くても飛び込める強さがあり、その姿は周りに「自分も動いていいんだ」という勇気を分けています。裏表がなく、感じたことをまっすぐ表現できるのも大きな魅力😊。',
    growth:
      '勢いがある分、走り出してから「どこへ向かうんだっけ」と迷うことがあります🧭。短気になったり、結果が出る前に飽きてしまう瞬間も。一歩目の速さはそのままに、ときどき立ち止まって地図を見る習慣をつけると、力がもっと遠くまで届きます🎯。',
    relationship:
      '人との距離を一気に縮めるのが得意🤝。ただし相手にも同じスピードを求めると、置いていかれた気持ちにさせてしまうことも。相手のペースを待つ余白を持てると、関係がぐっと深くなります💗。',
    lifeTheme:
      '「自分らしく、最初の一歩を踏み出し続ける」こと👣。誰かと比べる必要はありません。あなたのライバルは、いつも昨日の自分です🌅。',
  },
  おうし座: {
    headline: 'ゆっくり、確かに積み上げる星',
    element: '地のエレメント / 金星に守られた星座',
    essence:
      'あなたって、本物かどうかを肌で感じ取れる人だよ🌿。流行ってるから、みんなが持ってるから、じゃ動かない。食べるもの、いる場所、一緒にいる人。「これは好き」「これは違う」が自分の中にちゃんとある。その感覚、絶対に手放さないでほしいな。',
    strengths:
      '安定感・粘り強さ・誠実さ🪨。一度決めたことを最後までやり遂げる力があり、周りから「この人なら任せられる」と信頼されます。心地よさを見極めるセンスも、あなたならではの財産です💎。',
    growth:
      '安定を愛するぶん、変化を「脅威」と感じやすい一面があります。頑固さが出て、新しい提案を受け入れにくくなることも。すべてを変える必要はありません。いつもの暮らしに、ひとつだけ新しい風を入れてみる🍃。それだけで世界が広がります🌏。',
    relationship:
      'ゆっくり時間をかけて信頼を育てるタイプ🕰️。一度心を許した相手はとことん大切にします。ただ、居心地のよさを求めすぎて刺激のある出会いを避けてしまうことも。たまには小さな冒険を一緒に🌱。',
    lifeTheme:
      '「自分にとって本当に価値あるものを見極め、育てる」こと🌷。手放す勇気と守り抜く強さ、その両方があなたの人生を豊かにします💛。',
  },
  ふたご座: {
    headline: '世界を言葉でつなぐ、好奇心の星',
    element: '風のエレメント / 水星に守られた星座',
    essence:
      'あなたって、同時に 5 つくらいのことを頭で処理してるタイプだよね🔍。気になることが多すぎて、会話も思考もあちこち飛ぶ。でもその「全部おもしろい」という感覚が、あなたを一番あなたらしくしてると思う。飽きやすいんじゃなくて、吸収が速いんだよ。',
    strengths:
      '知性・適応力・コミュニケーション力🧠。場の空気を読み、相手に合わせて言葉を選べる柔軟さは天性のもの。学びが速く、どんな環境にもすっと馴染める身軽さも、あなたの強い武器です📚。',
    growth:
      '興味が多いぶん、ひとつに絞れず「どれも中途半端」に感じてしまう瞬間があります。気持ちが揺れて決めきれないことも。器用だからこそ、いまは一点に集中する🎯。それだけで眠っていた力が一気に開花します🌸。',
    relationship:
      '会話が弾む相手に強く惹かれます🗨️。ただ「話が合う」と「相性がいい」は別物。言葉の上手さよりも、その奥にある誠実さを見つめると、長く続く関係に出会えます💗。',
    lifeTheme:
      '「散らばった興味を、自分だけの一本の線につなぐ」こと🧵。あなたの集めた知識と出会いは、いつか思いがけない形で実を結びます🌟。',
  },
  かに座: {
    headline: '人を包み、守る、やさしさの星',
    element: '水のエレメント / 月に守られた星座',
    essence:
      'あなたって、言わなくてもわかってしまう人だよ🏡。相手の表情、声のトーン、ちょっとした沈黙。気づきたくなくても気づいちゃう。それだけ人のことを大切にしてるってことで、その繊細さはあなたの弱さじゃなくて、あなたがあなたである理由だと思う。',
    strengths:
      '共感力・包容力・記憶力🫂。相手の小さな変化に気づき、そっと寄り添える優しさは、まわりにとって大きな安心です。一度結んだ縁を長く大切にできる誠実さも、あなたの宝物🎁。',
    growth:
      '人を思いやるあまり、自分の感情を後回しにしてしまいがち。相手の機嫌で自分の気分まで揺れてしまうことも🌊。優しさはそのままに、まず自分の心を満たしてあげる。それが、もっと長くやさしくいられるコツです🍵。',
    relationship:
      '相手を深く守ろうとしますが、それが強くなりすぎると相手の自立を妨げてしまうことも🤲。「守る」と「信じて任せる」のバランスを意識すると、お互いに心地よい関係になります💞。',
    lifeTheme:
      '「他人を大切にするのと同じだけ、自分も大切にする」こと💕。あなたのやさしさは、あなた自身が満たされているときに一番輝きます🌷。',
  },
  しし座: {
    headline: '生まれながらに輝く、太陽の星',
    element: '火のエレメント / 太陽に守られた星座',
    essence:
      'あなたって、部屋に入っただけで空気が変わる人だよ☀️。自分で気づいてないかもしれないけど、あなたがいると場が明るくなる。それは演じてるんじゃなくて、あなたが本気で生きてるからだと思う。その熱量、消さないでほしいな。',
    strengths:
      '創造力・寛大さ・リーダーシップ👑。情熱的で温かく、人を惹きつける華があります🌹。困っている人に手を差し伸べる気前のよさも、あなたが愛される理由のひとつです。',
    growth:
      '認められたい気持ちが強いぶん、評価が得られないと自信を失いやすい一面が。プライドが邪魔して素直になれないことも。あなたの価値は、誰かの拍手がなくても変わりません👏。自分で自分を認める強さを育てていきましょう💪。',
    relationship:
      '「私を見て」という気持ちが前に出すぎると、相手が疲れてしまうことも。ときには相手を主役にして輝かせる側に回ってみて🎭。その余裕こそが、あなたをさらに魅力的にします✨。',
    lifeTheme:
      '「他人の評価ではなく、自分の誇りで生きる」こと🦁。あなたが心から楽しんでいるとき、その光は何よりも人を惹きつけます🌟。',
  },
  おとめ座: {
    headline: '細やかに整え、支える、誠実の星',
    element: '地のエレメント / 水星に守られた星座',
    essence:
      'あなたって、他の人が流すようなことを流せないタイプだよね🔎。「なんでこうなってるんだろう」「もうちょっとこうしたら」ってひっかかりが頭から離れない。それが時々しんどくなるのはわかる。でもその「気になっちゃう目」が、あなたのいちばんの才能だよ。',
    strengths:
      '分析力・実務能力・献身性📋。問題の本質を見抜き、現実的な解決策に落とし込める頭の良さがあります🧠。人知れず誰かを支える優しさも、あなたの大きな美点です。',
    growth:
      '完璧を求めるあまり、自分にも他人にも厳しくなりすぎることがあります。「まだ足りない」と自分を追い詰めてしまう瞬間も。完璧でない自分を許すこと🌿。80点で前に進む練習が、あなたを軽やかにします🍃。',
    relationship:
      '相手の欠点が気になりすぎて、理想のチェックリストで人を測ってしまうことも✅。条件よりも「一緒にいて安心できるか」という感覚を信じると、ありのままで愛される関係に出会えます💗。',
    lifeTheme:
      '「不完全さも含めて、自分と他人を受け入れる」こと🤍。あなたの誠実さは、自分を責めるためではなく、世界をやさしくするために使えます🌷。',
  },
  てんびん座: {
    headline: '調和とバランスをつくる、美の星',
    element: '風のエレメント / 金星に守られた星座',
    essence:
      'あなたって、どっちかに決めるのが苦手なくらい、両方の気持ちが見えてしまう人だよ⚖️。それは優柔不断じゃなくて、誰かの立場に立って考えることが自然にできるから。場の空気を読む力も、美しいものへの目も、全部つながってる。',
    strengths:
      '協調性・公平さ・社交性🤝。対立する意見の間に立ち、両者をつなぐ橋になれる稀有な才能があります🌉。場を和ませる優雅さと、人を惹きつける品のよさも、あなたの魅力です🌹。',
    growth:
      'みんなのバランスを取ろうとするあまり、自分の本音を後回しにしてしまいがち。「どっちも大事」は優しさですが、ときに自分を見失う言葉にもなります。自分の「好き」「嫌」をはっきり持つこと💬。それが本当の調和の土台です🌷。',
    relationship:
      '相手に合わせすぎて「いい人止まり」になってしまうことも。好かれようとするより、自分の意見を伝えたほうが、対等で深い関係に育ちます💞。意見のぶつかりは、相性を確かめるチャンスです✨。',
    lifeTheme:
      '「他人との調和と、自分との調和を両立させる」こと🌸。自分を大切にすることは、わがままではなく、健やかな関係の出発点です💛。',
  },
  さそり座: {
    headline: '深く潜り、本質を見抜く、再生の星',
    element: '水のエレメント / 冥王星に守られた星座',
    essence:
      'あなたって、浅い話だとどこかで飽きてしまうタイプだよね🌊。表面だけ取り繕ったような関係、ただ楽しければいいだけの場。それに馴染めない自分を変だと思うかもしれないけど、そうじゃない。あなたは本物しか要らない人で、それってかなり強い軸だよ。',
    strengths:
      '洞察力・集中力・誠実さ👁️。人が見落とす本音やリスクを直感的に見抜く力があります。困っている人に深く寄り添える情の厚さも、あなたが本物の信頼を集める理由です🤝。',
    growth:
      '感情を内に溜め込みやすく、ひとりで抱えすぎてしまう傾向が。猜疑心が強くなり、人を試してしまうことも。すべてを見せなくて大丈夫🍃。信頼できる一人に心を開くことから、重荷は軽くなっていきます🕯️。',
    relationship:
      '愛情が深いぶん、それが「重い」と感じられることも。相手を試し続けるより、自分から信じる覚悟を持つと、関係が本物に変わります💞。深さは、あなたの欠点ではなく才能です💎。',
    lifeTheme:
      '「壊れることを恐れず、何度でも生まれ変わる」こと🦋。危機や痛みは終わりではなく、あなたをより強くする再生の入り口です🌅。',
  },
  いて座: {
    headline: '遠くを目指す、自由と探求の星',
    element: '火のエレメント / 木星に守られた星座',
    essence:
      'あなたって、いまいる場所に収まりきらないことが多くない？🏹 「もっと広いところがあるはず」「これが全部じゃないはず」って感覚、ずっと胸のどこかにある。それは欲張りなんじゃなくて、あなたの世界がまだ全然広がり途中だってことだよ。',
    strengths:
      '楽観性・行動力・正直さ☀️。失敗を恐れず挑戦できる明るさがあり、その姿勢は周りに元気を与えます。心に思ったことをまっすぐ伝える率直さも、あなたの愛される個性です😊。',
    growth:
      '好奇心が強いぶん、始めることは得意でも「やり切る」前に次へ向かいたくなることが。飽きっぽさや、ときの率直すぎる言葉が課題になることも。ひとつのことを最後まで完走する経験が、あなたの自由をさらに本物にします🏁。',
    relationship:
      '束縛を嫌い、自由でいたい気持ちが強いタイプ🕊️。ただ自由すぎると相手を不安にさせることも。ときどき安心感を言葉や行動で伝えると、自由と信頼が両立します💞。',
    lifeTheme:
      '「広げた翼で、ちゃんと着地する」こと🦅。たくさんの挑戦と冒険は、やり遂げて初めてあなたの財産になります🎒。',
  },
  やぎ座: {
    headline: '一歩ずつ頂きへ向かう、達成の星',
    element: '地のエレメント / 土星に守られた星座',
    essence:
      'あなたって、決めたことを静かにやり遂げてしまうタイプだよ⛰️。派手に宣言しなくても、コツコツ積み上げる。誰に言わなくても、自分との約束は守る。その地道さは目立たないけど、気づいたら誰よりも遠くに来てるって、そういう人だと思う。',
    strengths:
      '忍耐力・責任感・現実感覚🧱。一度決めた道をコツコツ歩み続ける粘り強さがあります。困難な状況でも投げ出さず、周りを支える誠実さも、あなたが頼られる理由です💪。',
    growth:
      '頑張り屋なぶん、「報われていない」と感じて自分を責めやすい一面が。真面目さが行きすぎて、休むことに罪悪感を覚えることも。種はもう撒いてあります🌱。成果が出るまでのタイムラグを信じて、自分をいたわってあげてください🍵。',
    relationship:
      '仕事や目標を優先するあまり、大切な人との時間を後回しにしてしまいがち⏳。「しっかりしてるね」と言われて嬉しい反面、たまには弱さを見せて甘えることも、信頼を深める強さです💞。',
    lifeTheme:
      '「成果だけでなく、その過程の自分も認める」こと🏔️。山頂を目指す道のりそのものが、すでにあなたの価値です✨。',
  },
  みずがめ座: {
    headline: '常識を超えて未来を描く、革新の星',
    element: '風のエレメント / 天王星に守られた星座',
    essence:
      'あなたって、みんなが当たり前にしてることを、なんとなく信じきれないタイプだよ💡。「それって本当にそうなの？」って頭の中で思っても、口に出せないこともある。でもその「ちょっと待って」という感覚、世界が変わるときはいつもそこから始まってると思う。',
    strengths:
      '独創性・先見性・公平さ⚡。誰も思いつかない発想で物事を新しくする力があります。偏見にとらわれず、人を肩書きでなく中身で見られるフェアさも、あなたの大切な美点です⚖️。',
    growth:
      '人と違うことが自然なぶん、無理に合わせようとすると心も体も疲れてしまいます。感情の表現が苦手で、距離を取りすぎてしまうことも。周りに合わせる必要はありません🌿。ただ、あなたの考えを「伝わる言葉」にする工夫は、味方を増やします💬。',
    relationship:
      '知的なつながりを大切にするタイプ🧠。友達以上恋人未満の関係が多くなりがちなことも。理屈を超えて「ただ好き」という感情を認めてあげると、関係に温度が生まれます💞。',
    lifeTheme:
      '「自分の独自性を、孤立ではなくつながりに変える」こと🌐。あなたの新しい視点は、伝え方ひとつで世界を動かす力になります🌟。',
  },
  うお座: {
    headline: '境界を超えて感じとる、慈愛の星',
    element: '水のエレメント / 海王星に守られた星座',
    essence:
      'あなたって、人の痛みをもらいすぎてしまうことない？🐚 相手が悲しいと自分も沈んで、相手が怒ってると自分まで疲れてしまう。でもそれって、境界線が薄いんじゃなくて、それだけ深く感じられるってこと。その感受性は、あなたにしかない言葉をつくると思う。',
    strengths:
      '共感力・想像力・優しさ💗。相手の気持ちを言葉にならない部分まで受け取れる感受性があります。見返りを求めずに人を思いやれる無償の愛も、あなたが愛される理由です🕊️。',
    growth:
      '感受性が豊かなぶん、現実と空想の境目が曖昧になったり、つらい現実から逃げたくなることも☁️。人に流されやすい一面も。地に足をつける時間を持つこと🌿。あなたの優しさは、自分を犠牲にしなくても十分に届きます。',
    relationship:
      '「この人を助けてあげたい」という気持ちから恋が始まりがち。ただ、支える側と支えられる側に偏ると疲れてしまいます。お互いが自立して支え合う、対等な関係を意識してみて💞。',
    lifeTheme:
      '「やさしさと、現実を生きる強さを両立させる」こと🌈。地に足をつけたあなたの慈愛は、誰かの人生を本当に救う力になります✨。',
  },
};

const DEFAULT_SIGN = 'おひつじ座';

/**
 * Get the self-understanding reading for a given zodiac sign.
 * Falls back to the first sign if an unknown key is passed.
 */
export function getHoroscopeReading(sign: string): HoroscopeReading {
  return READINGS[sign] ?? READINGS[DEFAULT_SIGN]!;
}

/** Resolve the display icon for a zodiac sign. */
export function getSignIcon(sign: string): string {
  return SIGNS.find((s) => s.k === sign)?.icon ?? '✨';
}

/**
 * Deterministic 12-sign to character mapping (1 sign = 1 character).
 * The character represents "your type" as the outcome of the
 * sun-sign self-understanding reading. Each pairing loosely matches
 * the sign's element / nature with the character's theme.
 * DREAM_TYPES is reused as the character data source (character
 * archetypes are conceptually independent from the dream feature).
 */
const SIGN_CHARACTER: Record<string, string> = {
  おひつじ座: 'honoo_phoenix', // 火・始動: 情熱と挑戦の不死鳥
  おうし座: 'komorebi_shika', // 地・安定: 穏やかでマイペースなシカ
  ふたご座: 'mori_risu', // 風・好奇心: 情報通のリス
  かに座: 'hoshi_kuma', // 水・守り: 包容力あふれるクマ
  しし座: 'taiyou_lion', // 火・輝き: 太陽のような存在感のライオン
  おとめ座: 'shizuku_penguin', // 地・誠実: 堅実で計画的なペンギン
  てんびん座: 'sakura_usagi', // 風・調和: 社交的で軽やかなうさぎ
  さそり座: 'mayonaka_neko', // 水・洞察: 深く本質を見抜くネコ
  いて座: 'akatsuki_washi', // 火・探求: 自由を愛する冒険者のワシ
  やぎ座: 'yozora_fukurou', // 地・達成: 思慮深く着実なフクロウ
  みずがめ座: 'nijiiro_dragon', // 風・革新: 独創的なドラゴン
  うお座: 'ame_iruka', // 水・慈愛: 共感に満ちたイルカ
};

/**
 * Resolve the "your type" character for a given zodiac sign.
 * Deterministic: the same sign always returns the same character.
 * Falls back to the default sign's character for unknown keys.
 */
export function getSignCharacter(sign: string): DreamType {
  const id = SIGN_CHARACTER[sign] ?? SIGN_CHARACTER[DEFAULT_SIGN]!;
  return DREAM_TYPES.find((t) => t.id === id) ?? DREAM_TYPES[0]!;
}

/**
 * Resolve the "your type" character from the full birth profile.
 * Uses birth date + gender + prefecture as a deterministic seed, then
 * draws one of all 24 character archetypes weighted by rarity. The same
 * profile always yields the same character; rarer types (SR / SSR) are
 * genuinely uncommon, so landing on one feels special.
 */
export function getProfileCharacter(profile: UserProfile): DreamType {
  const seed = `${profile.birthYear}/${profile.birthMonth}/${profile.birthDay}/${profile.gender}/${profile.prefecture}`;
  const rng = makeSeededRandom(simpleHash(seed) + 1);
  const total = DREAM_TYPES.reduce((sum, t) => sum + t.weight, 0);
  let roll = rng() * total;
  for (const t of DREAM_TYPES) {
    roll -= t.weight;
    if (roll < 0) return t;
  }
  return DREAM_TYPES[DREAM_TYPES.length - 1]!;
}
