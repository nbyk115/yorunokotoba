/**
 * Dream analysis : interprets free-text dreams into structured symbolism,
 * actions, and a daily fortune reading.
 *
 * Extracted from legacy index.html analyzeDream(). Preserves bit-for-bit
 * behavior so archived dream results remain reproducible via seed.
 */

import { simpleHash, getDailySeed, makeSeededRandom } from './hash';
import { DREAM_KEYWORDS, type DreamMeaning } from '@/data/dreamKeywords';
import { DREAM_TYPES, type DreamType } from '@/data/dreamTypes';
import { generateLucky, type LuckyResult } from './lucky';

// ── ストップワード（助詞・指示語・短すぎる語） ──
const STOP_RE = /^(の|が|を|に|は|で|と|も|へ|から|まで|より|て|い|る|た|だ|ね|よ|か|な|し|れ|て|いる|ある|する|なる|これ|それ|あれ|この|その|あの|こと|もの|ため|とき|ところ|わたし|私|あなた|自分)$/;

/**
 * 辞書キーに該当しない入力テキストから意味のありそうな語を抽出する。
 * カタカナ連続 / 漢字連続 / ひらがな 2-4 文字連続を対象とし、
 * ストップワードと 1 文字語を除去して最長 2-3 語を返す。
 *
 * @param text - 夢の自由記述テキスト
 * @returns 抽出語の配列（最大 3 語）
 */
export function extractNovelTokens(text: string): string[] {
  const patterns = [
    /[ァ-ヶー]{2,}/g,   // カタカナ連続
    /[一-龠々]{2,}/g,   // 漢字連続
    /[ぁ-ん]{2,4}/g,    // ひらがな 2-4 文字連続
  ];
  const tokens: string[] = [];
  for (const re of patterns) {
    const matches = text.match(re) ?? [];
    for (const m of matches) {
      if (!STOP_RE.test(m) && m.length >= 2 && !tokens.includes(m)) {
        tokens.push(m);
      }
    }
  }
  return tokens.slice(0, 3);
}

export interface DreamSymbol {
  word: string;
  meaning: string;
  detail: string;
}

export interface DreamTheme {
  key: 'anx' | 'love' | 'free' | 'work' | 'mystery';
  label: string;
  icon: string;
  color: string;
}

export interface DreamActions {
  should: string[];
  aware: string[];
  avoid: string[];
}

export interface DreamReading {
  intro: string;
  deep: string;
}

export interface DreamResult {
  symbols: DreamSymbol[];
  type: DreamType;
  theme: DreamTheme;
  todayMessage: string;
  actions: DreamActions;
  lucky: LuckyResult;
  mainReading: DreamReading;
}

export function analyzeDream(text: string, signIdx = 0): DreamResult {
  const map = DREAM_KEYWORDS as Record<string, readonly DreamMeaning[]>;
  const rng0 = makeSeededRandom(getDailySeed(simpleHash(text) * 7));
  const rng1 = makeSeededRandom(getDailySeed(simpleHash(text) * 3 + 1));
  const T: Record<DreamTheme["key"], DreamTheme> = {anx:{key:"anx",label:"不安・解放",icon:"🌊",color:"#5A9AC0"},love:{key:"love",label:"恋愛・感情",icon:"🌸",color:"#E8627C"},free:{key:"free",label:"自由・飛翔",icon:"🌙",color:"#B08ACF"},work:{key:"work",label:"成長・課題",icon:"⚡",color:"#D4A853"},mystery:{key:"mystery",label:"深層・謎",icon:"🔮",color:"#9060B8"}};const hasAnx=/(追|逃|怖|落|追いかけ|不安|焦|恐|泣|叫)/.test(text);const hasLove=/(好き|恋|キス|告白|付き合|別れ|元カレ|元カノ|デート|ハグ)/.test(text);const hasFree=/(飛|空|逃げ|自由|旅|海外|鳥|翼|羽|走|広い)/.test(text);const hasWork=/(学校|仕事|試験|テスト|先生|成功|失敗|目標|挑戦|努力|練習)/.test(text);const symbolKeys=Object.keys(map);const detected=symbolKeys.filter(k=>text.includes(k));const primaryKey=detected[0]||(hasAnx?"追":hasLove?"好き":hasFree?"飛":hasWork?"学校":"知らない");const primaryPatterns=map[primaryKey]||map["知らない"];const symbolThemeMap: Record<string, DreamTheme["key"]> = {蛇:"mystery",歯:"anx",水:"anx",飛:"free",追:"anx",落:"anx",火:"love",海:"mystery",花:"free",月:"mystery",猫:"free",犬:"love",魚:"mystery",鳥:"free",雨:"anx",友:"love",家:"anx",学校:"work",車:"work",死:"mystery",赤ちゃん:"free",好き:"love",元カレ:"love",元カノ:"love",知らない:"mystery",怖:"anx",泣:"anx",笑:"love",走:"work",電車:"work",鏡:"mystery",お金:"work",子供:"free",遅刻:"anx"};const detectedThemeKey: DreamTheme["key"] = (detected[0] && symbolThemeMap[detected[0]]) ? symbolThemeMap[detected[0]]! : hasAnx?"anx":hasLove?"love":hasFree?"free":hasWork?"work": "mystery"; const themeKey: DreamTheme["key"] = detectedThemeKey;const theme = T[themeKey];const primaryPat=primaryPatterns[Math.floor(rng0()*primaryPatterns.length)];const symbols: DreamSymbol[] = [];const usedKeys = new Set<string>();symbols.push({word:primaryKey,meaning:primaryPat.m||"深層心理のサイン",detail:primaryPat.d||"あなたの深層心理からのメッセージ。"});usedKeys.add(primaryKey);for(const k of detected){if(usedKeys.has(k)||symbols.length>=4||!(k in map))continue;const pats=map[k];const pat=pats[Math.floor(rng1()*pats.length)];symbols.push({word:k,meaning:pat.m,detail:pat.d});usedKeys.add(k);}const themeBackfill: Record<DreamTheme["key"], string[]> = {anx:["怖","泣","落"],love:["好き","鏡","月"],free:["飛","鳥","水"],work:["電車","家","走"],mystery:["水","月","魚"]};for(const k of themeBackfill[themeKey]||[]){if(usedKeys.has(k)||symbols.length>=4||!(k in map))continue;const pats=map[k];const pat=pats[Math.floor(rng1()*pats.length)];symbols.push({word:k,meaning:pat.m,detail:pat.d});usedKeys.add(k);}const todayMessage = primaryPat.hint || "今日の自分の感情を大切にして";const actShould: string[] = primaryPat.should || ["今日の自分の感情に正直になる"];const actAware: string[] = hasAnx?["夜中の悩みループ思考に入ってないか確認する","「解決しようとする」より「感じきる」を優先する"]:hasLove?["感情的な状態での重要な連絡・決断を避ける","相手への期待と自分への期待を混同しない"]:hasFree?["「正解の道」を求めすぎず、直感を信じる","今に集中してる場面と未来を考えてる場面を分ける"]:hasWork?["完璧主義が邪魔をしてないか確認する","「できてること」に気づかず「できてないこと」ばかり見てないか"]:["論理より感覚を優先していい場面を見分ける","深読みしすぎて疲れてないか自分に聞いてみる"];const actAvoid: string[] = hasAnx?["疲れてる状態での大きな決断","自分を責め続けること","不安を他人に押し付けること"]:hasLove?["SNSで相手の動向を確認し続けること","答えが出ないことを考え続けること","感情任せの衝動行動"]:hasFree?["「でも、だって」で可能性を閉じること","他人と自分のペースを比べること","変化を怖がって現状に固執すること"]:hasWork?["頑張ってるのに結果を急ぎすぎること","完璧にやろうとして始めることを先延ばしすること","周りの評価だけを行動の基準にすること"]:["意味を探しすぎて今を楽しめないこと","大きなお金の動きや重要な決断","根拠のないネガティブな予測"];const charId = DREAM_TYPES[Math.floor(rng0() * DREAM_TYPES.length)]!.id;const type = DREAM_TYPES.find((t) => t.id === charId) || DREAM_TYPES[0]!;const symWords=symbols.slice(0,2).map(function(s){return s.word;}).join("・");const readingIntros: Record<DreamTheme["key"], string> = {anx:`「${symWords}」が出た夢、これはあなたの内側からのSOSサイン。外では平気そうに見えても、深層心理は「もう無理」と言い始めてる。${(primaryPat.d||"").split("。")[0]}。`,love:`「${symWords}」の夢は、感情と本音が表に出てきたサイン。好き嫌いを超えた深いところで、誰かへの気持ちや自分の欲求が動いてる。${(primaryPat.d||"").split("。")[0]}。`,free:`「${symWords}」が夢に現れた、今のあなたには変化の波が来てる。今いる場所や状況から一歩踏み出したいという衝動が、夢という形で出てきた。${(primaryPat.d||"").split("。")[0]}。`,work:`「${symWords}」の夢は、自分の成長を求めてるサイン。頑張ってきた先で「このままでいいのか」という問いが深層心理から浮かんでる。${(primaryPat.d||"").split("。")[0]}。`,mystery:`「${symWords}」、この夢にはまだ言葉になりきれない何かがある。直感と深層心理が活性化してるときに見る夢。ここには今のあなたへのヒントが詰まってる。${(primaryPat.d||"").split("。")[0]}。`};const readingDeeps: Record<DreamTheme["key"], string> = {anx:`今あなたが抱えてるのは「普通に頑張ってる」で片付けられない何か。\n\n夢が出したシンボル（${symWords}）は、意識が避けようとしてる部分を直接映してる。解決策を探す前に、まず「しんどい」を認めることが最初のステップ。\n\n今日1つだけ正直になって。SNSに書かなくていい。日記でも、声に出すだけでも。それだけで体が少し軽くなる。`,love:`「${symWords}」が出た夢、感情の扉が開きかけてる。\n\n恋愛の夢は「その人が好き」というより「その人との関係で感じた何か」が正体なことが多い。嬉しさ、不安、嫉妬、期待、どれが一番強かった？\n\nその感情の正体が分かると、次の行動が見えてくる。「好き」なのか「怖い」のか「もう終わりたい」のか、夢は嘘をつかない。`,free:`「${symWords}」の夢は、今のあなたに変化の波が来てる証拠。\n\n「やりたいけどどうせ無理」「今じゃない」「もう少し準備してから」、こういう言い訳を重ねてきてない？\n\n完璧な準備は一生来ない。今日できる一番小さい一歩を踏み出すだけでいい。それが1ヶ月後の自分を変える起点になる。`,work:`「${symWords}」が出たということは、あなたの深層心理が「今のままでいいのか」と問いかけてる。\n\n頑張り方を変える時期かもしれない。量じゃなくて質へ。作業じゃなくて戦略へ。\n\n今週やってることの中で「これ本当に必要？」と思うものがあれば、切り捨てていい。本当に大事なことに集中する時間を作って。`,mystery:`「${symWords}」、この組み合わせは珍しいパターン。あなたの潜在意識が何かを整理しようとしてる。\n\n今感じてる「なんとなく落ち着かない」「なんとなく気になる」感覚に名前をつけてみて。不安なのか、期待なのか、寂しいのか。\n\n言語化した瞬間に霧が晴れる。夢日記に今日の夢と今の気持ちをそのまま書いてみて。`};const readingIntro=readingIntros[themeKey]||readingIntros.mystery;const readingDeep=readingDeeps[themeKey]||readingDeeps.mystery;

  // ── 辞書外フォールバック補正 ──
  // primaryKey が "知らない" かつ detected が空（辞書ヒットなし）のとき、
  // extractNovelTokens で入力語を抽出し symbols[0] を上書きする。
  // detected[0] 経路（辞書命中時）は一切変更しない。
  if (primaryKey === "知らない" && detected.length === 0) {
    const novelTokens = extractNovelTokens(text);
    if (novelTokens.length > 0) {
      const novelWord = novelTokens[0]!;
      symbols[0] = {
        word: novelWord,
        meaning: "記憶と感情のかけら",
        detail: `『${novelWord}』が印象に残る夢。それはあなたの記憶や感情が今この言葉に反応しているサイン。`,
      };
    }
  }

  return{symbols,type,theme,todayMessage,actions:{should:actShould,aware:actAware,avoid:actAvoid},lucky:generateLucky(signIdx||0),mainReading:{intro:readingIntro,deep:readingDeep}};
}
