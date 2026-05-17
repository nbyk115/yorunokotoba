/**
 * HomeView  -  Wave L2 ホーム画面
 *
 * handoff §3「ホーム画面 確定デザイン仕様」完全準拠。
 * インライン style 全廃（handoff §4 構造的解決方針）。
 * スタイルは HomeView.module.css に集約。
 *
 * レイアウト:
 *   safe-area + 24px → 時間帯あいさつ（左寄せ 0 20px、H2相当、2行まで）
 *   32px 空け → キャラクター 128px 浮遊（中央配置）
 *   24px 空け → 夢占いカード（主役、Card primary、左辺 2px gold line）
 *   28px 空け → 星座占い / これまでの記録 TextLink（中央 13px）
 *   flex-grow → bottom tab bar 56px
 *
 * 廃止: HeroBlock / RitualButton / BlurReveal / インライン style
 *
 * Card の margin + border-left はラッパー div（.dreamCardWrapper）で制御。
 * Card コンポーネントの style prop は使用しない（インライン style 全廃原則）。
 * CharaAvatar の浮遊アニメーションは floatClassName で渡す CSS クラスが担う。
 */
import { Card } from '@/components/ui/Card';
import { TextLink } from '@/components/ui/TextLink';
import { CharaAvatar } from '@/components/ui/CharaAvatar';
import { useTimeOfDay } from '@/components/providers/TimeOfDayProvider';
import type { TimeOfDay } from '@/lib/timeOfDay';
import type { UserProfile } from '@/lib/firestore';
import type { ViewKey } from '@/App';
import type { StreakState } from '@/logic/streak';
import { getCharaIdBySign } from '@/data/signs';
import styles from './HomeView.module.css';

interface HomeViewProps {
  profile: UserProfile;
  streak: StreakState;
  onNavigate: (view: ViewKey) => void;
}

/**
 * 時間帯あいさつコピー: 姉貴分の本音トーン (ICP §5-1)
 *
 * 識別性ゲート（断った平均値）:
 * - night-deep: 「おやすみなさい。ゆっくり休んでね」を断った。深夜に開いた人への等身大の共犯感
 * - night:      「おつかれさまでした」式の丁寧語を断った。対等な帰宅のねぎらい
 * - dawn:       「おはようございます」を断った。眠れたかどうかを聞く本音の関心
 *
 * 以下 2 本は新規起案。brand-guardian レビュー要。
 * - day:  「今日のあなたは輝いています」式の昼間ポジティブを断った。
 *         昼に開いた稀なユーザーへの軽い驚きと対等な問いかけ
 * - dusk: 「今日も頑張りましょう」「一日お疲れさまでした」を断った。
 *         宵闇の入り口で今夜の選択を静かに問う共犯感
 */
const GREETING: Record<TimeOfDay, string> = {
  'night-deep': 'まだ起きてるんだ。…まあ、わたしもだけど',
  night: 'おつかれ。今夜もよく帰ってきたね',
  dawn: 'もう朝が来るね。眠れた?',
  // brand-guardian レビュー要（新規起案）
  day: 'こんな時間に開いたんだ。今日は何かあった?',
  // brand-guardian レビュー要（新規起案）
  dusk: 'そろそろ夜が始まるね。今夜はどうする?',
};

/** 夢占いカード内の見出しコピー */
const DREAM_CARD_COPY = '今夜の夢をよみとく';

export function HomeView({ profile, onNavigate }: HomeViewProps) {
  const tod = useTimeOfDay();
  const greeting = GREETING[tod];
  const charaId = getCharaIdBySign(profile.sign, profile.gender);

  return (
    <div className={styles.root}>
      {/* 時間帯あいさつ: left 0 20px（padding で確保）、H2相当、2行まで */}
      <section className={styles.greeting} aria-label="時間帯のあいさつ">
        <h2 className={styles.greetingText}>{greeting}</h2>
      </section>

      {/* キャラクター 128px 中央。浮遊アニメは floatClassName 経由で CSS クラスが担う。
          global.css @keyframes float-chara: transform translateY(0→-6px→0) / 4000ms ease-in-out infinite
          layout プロパティ（width/height/top/left）のアニメ禁止 */}
      <div className={styles.charaWrap} aria-hidden="true">
        <CharaAvatar id={charaId} size={128} floatClassName={styles.charaFloat} />
      </div>

      {/* 夢占いカード（主役）ラッパー: margin + 左辺 2px gold line を担当。
          Card の style prop を使わず CSS Module のラッパーで制御（インライン style 全廃原則）。
          overflow: hidden + border-radius で左辺 border が角丸内に収まる。 */}
      <div className={styles.dreamCardWrapper}>
        <Card
          variant="primary"
          as="article"
          aria-label="夢占いカード"
        >
          {/* 小ラベル: --fs-card-label 14px / 700 / --t3 */}
          <p className={styles.cardLabel}>今夜の夢占い</p>

          {/* 24px 見出しコピー: --fs-hero-jp 24px / 700 / lh 1.4 / --t1 */}
          <h3 className={styles.cardHeading}>{DREAM_CARD_COPY}</h3>

          {/* 控えめな rose の操作アフォーダンス: 塗りボタンにしない。テキストリンク相当 */}
          <button
            type="button"
            className={styles.openLink}
            onClick={() => onNavigate('dream')}
            aria-label="夢占いをひらく"
          >
            ひらく →
          </button>
        </Card>
      </div>

      {/* テキストリンク 2 点: 中央配置、13px（--fs-caption）、ViewKey 遷移 */}
      <nav className={styles.textLinks} aria-label="他のページへ">
        <TextLink
          onClick={() => onNavigate('fortune')}
          label="星座占いへ"
        >
          星座占い
        </TextLink>
        <span className={styles.separator} aria-hidden="true">・</span>
        <TextLink
          onClick={() => onNavigate('archive')}
          label="これまでの記録へ"
        >
          これまでの記録
        </TextLink>
      </nav>

      {/* flex-grow スペーサー: bottom tab bar 56px の上に余白を確保 */}
      <div className={styles.spacer} aria-hidden="true" />
    </div>
  );
}
