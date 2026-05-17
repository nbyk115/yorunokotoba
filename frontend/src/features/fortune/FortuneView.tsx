/**
 * FortuneView  -  Wave L2 星座占い画面
 *
 * handoff §2「星座占い」情報設計に完全準拠:
 *   見せる: ランク + キャラ + 恋愛/仕事/健康 + ホロスコープ（星座の本質）
 *   見せない: お守り（廃止。guardianMessages は §3-1 Premium「キャラの今月メッセージ」として維持）
 *
 * Wave L2 の役割（handoff §5）:
 *   ホーム/夢占いで確立したカード/余白パターンを星座占い画面へ波及。
 *   インライン style 全廃（handoff §4 構造的解決方針）。
 *   スタイルは FortuneView.module.css に集約。
 *   fortune.ts ロジックは変更しない（FortuneResult の型をそのまま消費）。
 *
 * 廃止:
 *   ConstellationReveal（Wave L1 の演出コンポーネント）
 *   FortuneCard サブコンポーネント（インライン style が混在していた）
 *   インライン style 全て
 *
 * RarityBadge:
 *   FortuneResult.type.rarity（DreamType['rarity']）を直接消費。
 *   signs.ts + dreamTypes.ts にレア度データが実装済みであることを確認済み。
 *
 * キャッチフレーズ:
 *   docs/content-strategy/character-catchphrases.md の 24 体分のデータを
 *   CHARA_CATCHPHRASE マップとして本ファイルに物理化。
 *
 * StatBar スコア:
 *   fortune.ts は数値スコアを返さないため、UI 側で FortuneRank -> number のマッピングで算出。
 *   fortune.ts の変更なし。
 *
 * 識別性ゲート（断った平均値）:
 *   「星座占い = 神秘的なオーバーレイ演出で焦らす」を断った。
 *   Wave L2 は情報設計の正確さとデザイン言語の一貫性を優先。
 *   演出（ConstellationReveal）を廃止し、カード/余白パターンの統一で「信頼感」を選んだ。
 */
import { useEffect, useState } from 'react';
import { BackHeader } from '@/components/ui/BackHeader';
import { StatBar } from '@/components/ui/StatBar';
import { Card } from '@/components/ui/Card';
import { CharaAvatar } from '@/components/ui/CharaAvatar';
import { RarityBadge } from '@/components/ui/RarityBadge';
import { ShareCard } from '@/components/ui/ShareCard';
import { generateFortune, type FortuneRank, type FortuneResult } from '@/logic/fortune';
import { SIGNS } from '@/data/signs';
import { ZodiacIcon } from '@/components/ui/ZodiacIcon';
import { getGuardianMessage } from '@/data/guardianMessages';
import { getMoonSignWave } from '@/data/moonSignWaves';
import { getMoonPhaseCategory, getMoonPhaseIndex, getMoonPhaseLabel } from '@/lib/moonPhase';
import { MoonPhaseIcon } from '@/components/ui/MoonPhaseIcon';
import { track } from '@/lib/analytics';
import type { UserProfile } from '@/lib/firestore';
import { useSubscription } from '@/lib/subscription';
import { PremiumCTA } from '@/components/ui/PremiumCTA';
import styles from './FortuneView.module.css';

interface FortuneViewProps {
  profile: UserProfile;
  currentUserId: string | null;
}

/* ── ランク英語変換 ── */
const RANK_TO_EN: Record<FortuneRank, string> = {
  大吉: 'Great Fortune',
  中吉: 'Fortune',
  小吉: 'Good Luck',
  吉: 'Lucky',
  末吉: 'Hope',
};

/* ランク別 CSS クラス（gold / rose 二値）*/
const RANK_COLOR_CLASS: Record<FortuneRank, string> = {
  大吉: styles.rankGold,
  中吉: styles.rankGold,
  小吉: styles.rankRose,
  吉: styles.rankRose,
  末吉: styles.rankRose,
};

/* ランク別 ShareCard テーマ */
type CardTheme = 'rose' | 'gold' | 'lavender';
const RANK_SHARE_THEME: Record<FortuneRank, CardTheme> = {
  大吉: 'gold',
  中吉: 'lavender',
  小吉: 'rose',
  吉: 'rose',
  末吉: 'rose',
};

/*
 * キャラクターキャッチフレーズ一覧
 * 出典: docs/content-strategy/character-catchphrases.md（24体分）
 * フォーマット: charaId -> キャッチフレーズ
 */
const CHARA_CATCHPHRASE: Record<string, string> = {
  yume_kobuta:    '「好き」の気持ちに正直すぎて、いつも少しだけ損をする。',
  hana_panda:     'みんなの味方でいたくて、自分の味方を忘れてしまう。',
  niji_koala:     '急がなくていい。ゆっくり考えた答えが、一番深い。',
  hoshi_kuma:     'あなたがいるだけで、誰かの夜が安心に変わる。',
  ame_iruka:      '泣いた数だけ、人のやさしさがわかるようになった。',
  komorebi_shika: '静かな場所が好き。でも、孤独が好きなわけじゃない。',
  shizuku_penguin:'派手じゃなくていい。昨日の自分より一歩前にいればいい。',
  mori_risu:      '気になることが多すぎて、24時間じゃ足りない。',
  hana_poodle:    'かわいくありたい。でも、それだけじゃない自分も知ってほしい。',
  umi_rakko:      'マイペースは、自分を守るための静かな強さ。',
  hi_no_tora:     '立ち止まっている暇はない。燃えている今が、一番強い。',
  kaze_uma:       '「自由」を選ぶのは、逃げじゃない。勇気だ。',
  sakura_usagi:   '軽やかに見えて、実はちゃんと傷ついている。',
  yozora_fukurou: '誰も見ていない夜に、一番大事なことを考える。',
  yuuyake_kitsune:'空気を読めるのは才能。読みすぎるのは、やさしさ。',
  akatsuki_washi: 'まだ誰も見ていない景色を、最初に見に行く人。',
  yuki_hakucho:   '完璧に見える人ほど、見えない場所で必死に足を動かしている。',
  tsuki_hyou:     '感情に溺れない。でも、感情がないわけじゃない。',
  taiyou_lion:    '「自分らしく」を貫くのは、思っているより孤独な戦いだ。',
  mayonaka_neko:  '何も言わないのは、何も感じていないからじゃない。',
  sora_unicorn:   'この世界にないものを信じられるのは、選ばれた人だけ。',
  kaze_ookami:    '群れなくていい。本当に強い人は、一人でも道を作れる。',
  honoo_phoenix:  '何度でも燃え尽きて、何度でも生まれ変わる。それが私。',
  nijiiro_dragon: '常識を壊すのが怖い？ それは、新しい常識を作れる証拠。',
};

/* ────────────────────────────────────────────── */
/*  メインコンポーネント                          */
/* ────────────────────────────────────────────── */
export function FortuneView({ profile, currentUserId }: FortuneViewProps) {
  const [result, setResult] = useState<FortuneResult | null>(null);

  useEffect(() => {
    track('fortune_start', { sign: profile.sign });
    const r = generateFortune(
      profile.name,
      profile.sign,
      profile.gender === 'male' ? 'male' : 'female',
      parseInt(profile.birthDay, 10) || undefined,
      parseInt(profile.birthMonth, 10) || undefined,
    );
    setResult(r);
    track('fortune_complete', { sign: profile.sign, rank: r.rank });
  }, [profile]);

  const signIndex = SIGNS.findIndex((s) => s.k === profile.sign);

  /* ── ローディング ── */
  if (!result) {
    return (
      <div className={styles.loadingRoot}>
        <p className={styles.loadingText}>星を読んでいる</p>
      </div>
    );
  }

  const rankEn = RANK_TO_EN[result.rank];
  const rankColorClass = RANK_COLOR_CLASS[result.rank];
  const shareTheme = RANK_SHARE_THEME[result.rank];
  const catchphrase = CHARA_CATCHPHRASE[result.type.id] ?? '';

  /* シェアカード用ラベル */
  const today = new Date();
  const dateLabel = `${today.getMonth() + 1}.${today.getDate()}`;
  const signLabel = `${profile.sign} · ${profile.name}`;

  return (
    <div className={styles.root}>
      {/* BackHeader */}
      <BackHeader onBack={() => history.back()} title="星座占い" />

      {/* ページラベル「今日の運勢」 */}
      <p className={styles.pageLabel}>今日の運勢</p>

      {/* ════════════════════════════════════════ */}
      {/*  ヒーローエリア                           */}
      {/*  星座アイコン + ランク英語 + ランク日本語   */}
      {/*  キャラ + RarityBadge + 名前 + キャッチ    */}
      {/* ════════════════════════════════════════ */}
      <div className={styles.hero}>
        {/* eyebrow: 星座アイコン + 星座名 + ユーザー名 */}
        <p className={styles.heroEyebrow}>
          {signIndex >= 0 && (
            <ZodiacIcon signIndex={signIndex} size={14} color="var(--t3)" />
          )}
          {profile.sign} · {profile.name}
        </p>

        {/* ランク英語: Cormorant italic 大型 */}
        <h2 className={`${styles.rankEn} ${rankColorClass}`}>
          {rankEn}
        </h2>

        {/* ランク日本語 */}
        <p className={styles.rankJp}>{result.rank}</p>

        {/* キャラ + RarityBadge + 名前 + キャッチフレーズ */}
        <div className={styles.charaWrap}>
          <CharaAvatar
            id={result.type.id}
            size={96}
            floatClassName={styles.charaFloat}
            rarity={result.type.rarity}
          />
          <RarityBadge rarity={result.type.rarity} />
          <p className={styles.charaName}>{result.type.name}</p>
          <p className={styles.charaSub}>{result.type.sub}</p>
          {catchphrase && (
            <p className={styles.charaCatch}>{catchphrase}</p>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════ */}
      {/*  今日のまとめ（主役カード）              */}
      {/*  handoff §2「ランク + 今日のまとめ」      */}
      {/* ════════════════════════════════════════ */}
      <div className={styles.summaryCardWrapper}>
        <Card variant="primary" as="article" aria-label="今日の運勢まとめ">
          <p className={styles.cardLabel}>今日のよみとき</p>
          <p className={styles.fortuneBody}>{result.summary}</p>
          {result.risk && (
            <p className={styles.riskText}>今日、気をつけたいこと: {result.risk}</p>
          )}
        </Card>
      </div>

      {/* ════════════════════════════════════════ */}
      {/*  恋愛/仕事/健康 StatBar                 */}
      {/*  handoff §2「恋愛/仕事/健康」             */}
      {/* ════════════════════════════════════════ */}
      <div className={styles.statCardWrapper}>
        <Card variant="secondary" as="section" aria-label="恋愛・仕事・健康スコア">
          <StatBar label="恋愛" value={result.loveScore}   colorToken="var(--rose)" />
          <StatBar label="仕事" value={result.workScore}   colorToken="var(--gold)" />
          <StatBar label="健康" value={result.healthScore} colorToken="var(--lavender)" />
        </Card>
      </div>

      {/* ════════════════════════════════════════ */}
      {/*  今日の恋愛/仕事/健康 詳細               */}
      {/*  handoff §2「恋愛/仕事/健康」詳細テキスト  */}
      {/* ════════════════════════════════════════ */}
      <div className={styles.infoCardWrapper}>
        <Card variant="secondary" as="section" aria-label="今日の恋愛">
          <p className={styles.cardLabel}>今日の恋愛</p>
          <p className={styles.fortuneBody}>{result.dailyLove}</p>
        </Card>
      </div>

      <div className={styles.infoCardWrapper}>
        <Card variant="secondary" as="section" aria-label="今日の仕事">
          <p className={styles.cardLabel}>今日の仕事</p>
          <p className={styles.fortuneBody}>{result.dailyWork}</p>
        </Card>
      </div>

      <div className={styles.infoCardWrapper}>
        <Card variant="secondary" as="section" aria-label="今日の健康">
          <p className={styles.cardLabel}>今日の健康</p>
          <p className={styles.fortuneBody}>{result.dailyHealth}</p>
        </Card>
      </div>

      {/* ════════════════════════════════════════ */}
      {/*  ホロスコープ（星座の本質）               */}
      {/*  handoff §2「ホロスコープ（星座の本質）」  */}
      {/*  無料範囲: 今日の運勢 + ホロスコープ基本   */}
      {/* ════════════════════════════════════════ */}
      <div className={styles.sectionHeader}>
        <p className={styles.sectionLabel}>ホロスコープ</p>
        <p className={styles.sectionSubLabel}>{profile.sign}のあなた</p>
      </div>

      <div className={styles.infoCardWrapper}>
        <Card variant="secondary" as="section" aria-label="今夜のあなたの性質">
          <p className={styles.cardLabel}>今夜のあなたの性質</p>
          <p className={styles.fortuneBody}>{result.personality.trait}</p>
        </Card>
      </div>

      <div className={styles.infoCardWrapper}>
        <Card variant="secondary" as="section" aria-label="恋愛の傾向">
          <p className={styles.cardLabel}>恋愛の傾向</p>
          <p className={styles.fortuneBody}>{result.personality.love}</p>
        </Card>
      </div>

      <div className={styles.infoCardWrapper}>
        <Card variant="secondary" as="section" aria-label="仕事の傾向">
          <p className={styles.cardLabel}>仕事の傾向</p>
          <p className={styles.fortuneBody}>{result.personality.work}</p>
        </Card>
      </div>

      <div className={styles.infoCardWrapper}>
        <Card variant="secondary" as="section" aria-label="体と心の傾向">
          <p className={styles.cardLabel}>体と心の傾向</p>
          <p className={styles.fortuneBody}>{result.personality.health}</p>
        </Card>
      </div>

      {result.lifePathMessage && (
        <div className={styles.infoCardWrapper}>
          <Card variant="secondary" as="section" aria-label="あなたの核">
            <p className={styles.cardLabel}>あなたの核</p>
            <p className={styles.fortuneBody}>{result.lifePathMessage}</p>
          </Card>
        </div>
      )}

      {/* ════════════════════════════════════════ */}
      {/*  Premium 深層読み（§3-1 Premium 機能）   */}
      {/*  キャラからの今月メッセージ + 月×星座エネルギー */}
      {/* ════════════════════════════════════════ */}
      <DeepReadingSection
        charaId={result.type.id}
        charaName={result.type.name}
        sign={profile.sign}
        currentUserId={currentUserId}
        birthday={
          profile.birthYear && profile.birthMonth && profile.birthDay
            ? `${profile.birthYear}-${profile.birthMonth.padStart(2, '0')}-${profile.birthDay.padStart(2, '0')}`
            : null
        }
      />

      {/* ════════════════════════════════════════ */}
      {/*  ShareCard（夢占いと同じパターン）        */}
      {/*  handoff §2「シェア導線」                 */}
      {/* ════════════════════════════════════════ */}
      <div className={styles.shareSection}>
        <p className={styles.shareLabel}>シェアして残そう</p>
        <ShareCard
          title={rankEn}
          subtitle={result.type.sub}
          body={result.summary.slice(0, 30) + (result.summary.length > 30 ? '…' : '')}
          charaId={result.type.id}
          theme={shareTheme}
          dateLabel={dateLabel}
          signLabel={signLabel}
        />
      </div>

      {/* AI 免責（景表法対応） */}
      <p className={styles.disclaimer}>
        ※ AI が生成する娯楽の占いだよ
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   DeepReadingSection（Premium 限定の深層メッセージ）
   handoff §3-1「ホロスコープのより深層心理 + キャラの今月メッセージ」
   インライン style 全廃: FortuneView.module.css の deep* クラスを使用
───────────────────────────────────────────── */
interface DeepReadingSectionProps {
  charaId: string;
  charaName: string;
  sign: string;
  currentUserId: string | null;
  birthday: string | null;
}

function DeepReadingSection({
  charaId,
  charaName,
  sign,
  currentUserId,
  birthday,
}: DeepReadingSectionProps) {
  const { isPremium } = useSubscription(currentUserId);
  const message = getGuardianMessage(charaId, birthday);
  const moonPhaseCategory = getMoonPhaseCategory();
  const moonPhaseIdx = getMoonPhaseIndex();
  const moonLabel = getMoonPhaseLabel();
  const moonWave = getMoonSignWave(sign, moonPhaseCategory, birthday);

  if (!message) return null;

  /* 非 Premium: 訴求 + CTA のみ（本文は一切描画しない）*/
  if (!isPremium) {
    return (
      <div className={styles.deepWrap}>
        <Card variant="secondary" as="section" aria-label="Premium キャラメッセージ">
          <p className={styles.deepEyebrow}>今夜のことば</p>
          <h4 className={styles.deepTitle}>{charaName}からのメッセージ</h4>
          <p className={styles.deepTeaser}>
            {charaName}から今夜のあなたへのメッセージが届いてるよ。
            {moonWave && `${moonLabel}のエネルギーをよみとく特別なメッセージも。`}
          </p>
          <PremiumCTA source="deep_reading" userId={currentUserId} />
        </Card>
      </div>
    );
  }

  /* Premium: 全文表示 */
  return (
    <div className={styles.deepWrap}>
      <Card variant="secondary" as="section" aria-label="キャラからのメッセージ">
        <p className={styles.deepEyebrow}>今夜のことば</p>
        <h4 className={styles.deepTitle}>{charaName}からのメッセージ</h4>
        <p className={styles.deepBody}>{message.body}</p>

        {moonWave && (
          <>
            <hr className={styles.deepDivider} aria-hidden="true" />
            <p className={styles.deepEyebrowMoon}>
              <MoonPhaseIcon phaseIndex={moonPhaseIdx} size={12} color="var(--lavender)" />
              Moon x Sign · {moonLabel}のエネルギー
            </p>
            <h4 className={styles.deepTitle}>{moonWave.title}</h4>
            <p className={styles.deepBody}>{moonWave.body}</p>
          </>
        )}
      </Card>
    </div>
  );
}
