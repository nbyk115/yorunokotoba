/**
 * Lucky item generator — color / item / number for the day.
 * Deterministic per-day, per-zodiac-sign.
 * Extracted from legacy index.html generateLucky().
 */

import { makeSeededRandom, getDailySeed } from './hash';

export interface LuckyColor {
  v: string;
  hex: string;
  reason: string;
}

export interface LuckyItem {
  v: string;
  reason: string;
  e: string;
}

export interface LuckyNumber {
  v: string;
  reason: string;
}

export interface LuckyResult {
  color: LuckyColor;
  item: LuckyItem;
  num: LuckyNumber;
}

const COLORS: readonly LuckyColor[] = [
  { v: 'ローズピンク', hex: '#E8627C', reason: '恋愛運UP。リップに仕込んで' },
  { v: 'ラベンダー', hex: '#B08ACF', reason: '直感が冴える。選択に迷ったら' },
  { v: 'シャンパンゴールド', hex: '#D4A853', reason: 'お金まわりの色。アクセやネイルに' },
  { v: 'ベビーブルー', hex: '#5A9AC0', reason: 'コミュ力UP。人と話す日に' },
  { v: 'コーラル', hex: '#E07070', reason: '行動力の色。チークに仕込んで' },
  { v: 'ミルクホワイト', hex: '#F5F0EB', reason: 'リセットの色。部屋に白いものを' },
  { v: 'フォレストグリーン', hex: '#5BA87C', reason: '癒しと回復の色。植物を飾って' },
  { v: 'バーガンディ', hex: '#8B2252', reason: '強さと魅力が増す色。勝負の日に' },
  { v: 'スカイブルー', hex: '#87CEEB', reason: '発信運UP。SNSを更新して' },
  { v: 'サーモンピンク', hex: '#FA8072', reason: '出会い運の色。外出前にチェック' },
  { v: 'マスタードイエロー', hex: '#E3A84A', reason: '知性と直感の色。勉強や分析の日に' },
  { v: 'モーブピンク', hex: '#C8779A', reason: '魅力が増す色。好きな人に会う前に' },
];

const ITEMS: readonly LuckyItem[] = [
  { v: 'リップ', reason: '言葉に力が宿る日', e: '💋' },
  { v: '香水', reason: '嗅覚から運気UP', e: '🌸' },
  { v: 'ミラー', reason: '自分を見つめ直すと気づき', e: '🪞' },
  { v: 'ネイルオイル', reason: '指先ケアが今夜の底上げ', e: '💅' },
  { v: 'ヘアオイル', reason: '艶やかさが魅力を底上げ', e: '✨' },
  { v: 'ピアス', reason: '耳元から運気を引き込む', e: '💎' },
  { v: 'ハンドクリーム', reason: '手から縁を引き寄せる', e: '🤍' },
  { v: 'キャンドル', reason: '灯りで空間の気を変えて', e: '🕯️' },
  { v: 'お茶', reason: '一杯飲んでから動き出して', e: '🍵' },
  { v: 'チョコ', reason: '甘いものが判断力を上げる日', e: '🍫' },
  { v: 'スマホ', reason: '今日は連絡に縁がある日', e: '📱' },
  { v: '財布', reason: 'お金まわりを意識して持ち歩いて', e: '👛' },
  { v: '本', reason: 'ひと言が人生を変える日かも', e: '📖' },
  { v: 'イヤホン', reason: '好きな音楽で気持ちを整えて', e: '🎧' },
  { v: 'マスク', reason: '守りの日。無理せず自分を守って', e: '🌙' },
];

const NUMS: readonly LuckyNumber[] = [
  { v: '7', reason: '直感が冴える数字' },
  { v: '11', reason: '11:11に願い事してみて' },
  { v: '22', reason: '夢を叶えるナンバー' },
  { v: '33', reason: '愛と癒しの数字' },
  { v: '3', reason: '行動を3つ決めると動き出す' },
  { v: '8', reason: '無限の可能性を示す数字' },
  { v: '5', reason: '変化と自由の数字' },
  { v: '444', reason: '守られてるサイン。安心して' },
  { v: '1', reason: '新しいスタートの数字' },
  { v: '9', reason: '完成と手放しの数字' },
  { v: '12', reason: '時間を守ると運が動く' },
  { v: '2', reason: '2人の縁が動く日' },
];

function pick<T>(arr: readonly T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

export function generateLucky(signIdx = 0): LuckyResult {
  const rng = makeSeededRandom(getDailySeed(700 + signIdx));
  return {
    color: pick(COLORS, rng),
    item: pick(ITEMS, rng),
    num: pick(NUMS, rng),
  };
}
