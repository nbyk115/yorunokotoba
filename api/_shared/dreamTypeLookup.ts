/**
 * dreamTypeLookup.ts - Serverless bundle 用 24 タイプ最小データ
 *
 * frontend/src/data/dreamTypes.ts を api/ から import すると bundle が肥大化するため、
 * 必要フィールド (id / name / sub / share / signature / color / rarity) のみを写経。
 * 更新時は dreamTypes.ts + signaturePhrases.ts と同期すること。
 */

export interface DreamTypeEntry {
  id: string;
  name: string;
  sub: string;
  share: string;
  signature: string;
  color: string;
  rarity: 'N' | 'R' | 'SR' | 'SSR';
}

const ENTRIES: readonly DreamTypeEntry[] = [
  {
    id: 'yume_kobuta',
    name: 'ゆめのこぶた',
    sub: '天真爛漫な愛されキャラ',
    share: '#ゆめのこぶた 天真爛漫タイプ',
    signature: '隠す気ないでしょ、顔に出てるよ',
    color: '#F5A0B0',
    rarity: 'N',
  },
  {
    id: 'umi_rakko',
    name: 'うみのラッコ',
    sub: '癒し系マイペース',
    share: '#うみのラッコ 癒しマイペース',
    signature: '怒ってるのに「別にいいよ」って言うの、今日もだよ',
    color: '#A0785A',
    rarity: 'R',
  },
  {
    id: 'mori_risu',
    name: 'もりのリス',
    sub: '好奇心旺盛な情報通',
    share: '#もりのリス 好奇心おばけ',
    signature: '8割途中でやめてるの、わかって始めてるでしょ',
    color: '#D4883A',
    rarity: 'N',
  },
  {
    id: 'hana_panda',
    name: 'はなのパンダ',
    sub: '平和主義のバランサー',
    share: '#はなのパンダ 平和主義者',
    signature: '断れなくて引き受けたやつ、また増えたでしょ',
    color: '#2A2A2A',
    rarity: 'N',
  },
  {
    id: 'sora_unicorn',
    name: 'そらのユニコーン',
    sub: '理想主義のカリスマ',
    share: '#そらのユニコーン 伝説タイプ',
    signature: 'みんなに合わせるより、はみ出したままでいいと思うよ',
    color: '#C8A0E8',
    rarity: 'SSR',
  },
  {
    id: 'yuki_hakucho',
    name: 'ゆきの白鳥',
    sub: '孤高のエレガンス',
    share: '#ゆきの白鳥 孤高のエレガンス',
    signature: '60点で止まるの怖いだけで、0か100じゃないよ',
    color: '#E8E8F0',
    rarity: 'SR',
  },
  {
    id: 'niji_koala',
    name: 'にじのコアラ',
    sub: 'のんびり哲学者',
    share: '#にじのコアラ のんびり哲学者',
    signature: '布団の中でまだ考えてる、わたしもだけど',
    color: '#A0A8B8',
    rarity: 'N',
  },
  {
    id: 'hi_no_tora',
    name: 'ひのトラ',
    sub: '情熱のチャレンジャー',
    share: '#ひのトラ 情熱の一匹狼',
    signature: '「大丈夫ひとりでやれる」って言いながら限界でしょ',
    color: '#E88A30',
    rarity: 'R',
  },
  {
    id: 'tsuki_hyou',
    name: 'つきのヒョウ',
    sub: '冷静な戦略家',
    share: '#つきのヒョウ 冷静な戦略家',
    signature: '全部読めてるくせに、黙ってるだけでしょ',
    color: '#8898B0',
    rarity: 'SR',
  },
  {
    id: 'hoshi_kuma',
    name: 'ほしのクマ',
    sub: '包容力あふれる守護者',
    share: '#ほしのクマ 包容力No.1',
    signature: '「大丈夫」って言ってるけど、大丈夫じゃないでしょ',
    color: '#C8A060',
    rarity: 'N',
  },
  {
    id: 'kaze_uma',
    name: 'かぜの馬',
    sub: '自由奔放な冒険家',
    share: '#かぜの馬 自由奔放な冒険家',
    signature: '飽きたのわかってるよ、続けるより次に行っていいよ',
    color: '#E0D0B0',
    rarity: 'R',
  },
  {
    id: 'kaze_ookami',
    name: 'かぜのオオカミ',
    sub: '孤高のリアリスト',
    share: '#かぜのオオカミ 伝説タイプ',
    signature: '離れた振りして、全部ちゃんと見てるよね',
    color: '#7888A0',
    rarity: 'SSR',
  },
  {
    id: 'honoo_phoenix',
    name: 'ほのおのフェニックス',
    sub: '情熱の炎で道を切り拓く',
    share: '#ほのおのフェニックス 情熱の不死鳥',
    signature: '今日も全部燃やしたでしょ、ご飯は？',
    color: '#E85533',
    rarity: 'SSR',
  },
  {
    id: 'sakura_usagi',
    name: 'さくらのうさぎ',
    sub: '春風のように軽やかに',
    share: '#さくらのうさぎ 春風の使者',
    signature: '「どっちでもいい」は優しさだから、決めなくていいよ',
    color: '#F8B4C8',
    rarity: 'R',
  },
  {
    id: 'yozora_fukurou',
    name: 'よぞらのフクロウ',
    sub: '静かな夜に輝く知性',
    share: '#よぞらのフクロウ 静かなる知恵',
    signature: 'もう情報足りてるよ、動けないのは別の理由だよ',
    color: '#4A5899',
    rarity: 'R',
  },
  {
    id: 'taiyou_lion',
    name: 'たいようのライオン',
    sub: '輝く太陽のような存在感',
    share: '#たいようのライオン 太陽の王',
    signature: '「大丈夫任せて」って言ったあと、内心やばかったでしょ',
    color: '#F5A623',
    rarity: 'SR',
  },
  {
    id: 'ame_iruka',
    name: 'あめのイルカ',
    sub: '雨上がりの虹を運ぶ',
    share: '#あめのイルカ 虹を運ぶ調和者',
    signature: '「私がやる」って言った瞬間、後悔したでしょ',
    color: '#5BB5D5',
    rarity: 'N',
  },
  {
    id: 'komorebi_shika',
    name: 'こもれびのシカ',
    sub: '森の静けさに癒しを見つける',
    share: '#こもれびのシカ 森の癒し',
    signature: '「また今度ね」ってもう何回言ったか、数えてないよね',
    color: '#8DB660',
    rarity: 'N',
  },
  {
    id: 'yuuyake_kitsune',
    name: 'ゆうやけのキツネ',
    sub: '夕暮れに輝く機転の持ち主',
    share: '#ゆうやけのキツネ 夕暮れの策士',
    signature: '笑顔で「大丈夫」って言った夜、疲れてたでしょ',
    color: '#E07830',
    rarity: 'R',
  },
  {
    id: 'akatsuki_washi',
    name: 'あかつきのワシ',
    sub: '高く遠くを見据える',
    share: '#あかつきのワシ 暁の冒険者',
    signature: '細かいことは苦手だよね、それでも飛べてるでしょ',
    color: '#6B4C9A',
    rarity: 'R',
  },
  {
    id: 'shizuku_penguin',
    name: 'しずくのペンギン',
    sub: '一歩ずつ着実に進む',
    share: '#しずくのペンギン 着実な努力家',
    signature: '休日も「何か生産的なことを」って考えてるでしょ',
    color: '#3A7CA5',
    rarity: 'N',
  },
  {
    id: 'nijiiro_dragon',
    name: 'にじいろのドラゴン',
    sub: '虹色の夢を描く革新者',
    share: '#にじいろのドラゴン 虹色の革新者',
    signature: '「何言ってるかわからない」って言われた、今日もでしょ',
    color: '#9B59B6',
    rarity: 'SSR',
  },
  {
    id: 'mayonaka_neko',
    name: 'まよなかのネコ',
    sub: '静寂に隠された情熱',
    share: '#まよなかのネコ 深淵の探求者',
    signature: 'まだ起きてるんだ。…まあ、わたしもだけど',
    color: '#2C2C54',
    rarity: 'SR',
  },
  {
    id: 'hana_poodle',
    name: 'はなのプードル',
    sub: 'かわいいのに、ちょっぴり不器用',
    share: '#はなのプードル かわいいのに、ちょっぴり不器用',
    signature: '褒められると何でもOKしちゃうの、今日も発動したでしょ',
    color: '#E8C8E0',
    rarity: 'N',
  },
];

/** id -> DreamTypeEntry の Map (O(1) lookup) */
export const DREAM_TYPE_MAP = new Map<string, DreamTypeEntry>(
  ENTRIES.map((e) => [e.id, e]),
);

/** id が有効かどうかを確認する */
export function getDreamType(id: string): DreamTypeEntry | undefined {
  return DREAM_TYPE_MAP.get(id);
}

/** Rarity の日本語ラベル */
export const RARITY_LABEL: Record<string, string> = {
  N: 'ノーマル',
  R: 'レア',
  SR: 'スーパーレア',
  SSR: 'ウルトラレア',
};
