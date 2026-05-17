/**
 * PremiumView  -  Wave L2 Premium 画面
 *
 * handoff §2「Premium」情報設計に完全準拠:
 *   見せる: 月¥980の価値 = 夢記録 + ホロスコープ深層心理 + キャラからの今月メッセージ、CTA1つ
 *   見せない: 機能羅列
 *
 * handoff §3-1 Premium（月¥980）の価値3点:
 *   ① 夢記録: 夢日記を「傾向が振り返れる」記録機能に（蓄積した夢の傾向分析）
 *   ② ホロスコープのより深層心理
 *   ③ キャラクター（守護キャラ）からの今月メッセージ
 *
 * Wave L2 の役割（handoff §5）:
 *   ホーム/夢占い/星座占い/設定で確立したカード/余白パターンをPremium画面へ波及。
 *   インライン style 全廃（handoff §4 構造的解決方針）。
 *   スタイルは PremiumView.module.css に集約。
 *   lib/subscription.ts / PremiumCTA のロジックは変更しない（UI のみ）。
 *   価格・金額は PremiumCTA コンポーネント（PREMIUM_PRICE_LABEL）の定義を正とする。
 *
 * 廃止: インライン style 全て / Card の style prop
 *
 * 識別性ゲート（断った平均値）:
 *   「機能リストを箇条書きで羅列するSaaSライクなPricing UI」を断った。
 *   3つの体験価値をそれぞれ1枚のカードで語り、CTAは最後の1つに絞った。
 *   「今夜のあなたへ」ではなく「もっと深く、よみとく」の一語で価値の方向を示した。
 */
import { BackHeader } from '@/components/ui/BackHeader';
import { Card } from '@/components/ui/Card';
import { PremiumCTA } from '@/components/ui/PremiumCTA';
import { useCurrentUser } from '@/lib/auth';
import styles from './PremiumView.module.css';

interface PremiumViewProps {
  onBack: () => void;
}

/**
 * 3つの価値説明。handoff §3-1 をそのまま反映。
 * 機能の「できること」ではなく「どう変わるか」の体験軸で語る。
 */
const VALUE_POINTS = [
  {
    label: '夢記録の傾向分析',
    body: '夢を記録し続けるほど、自分のパターンが見えてくる。繰り返す感情、繰り返す場面。あなたの夢には、あなただけの言語がある。',
  },
  {
    label: 'ホロスコープの深層心理',
    body: '今日の運勢より一段深いところへ。星座の本質から読み解く、あなたの心の構造へのメッセージ。',
  },
  {
    label: 'キャラからの今月メッセージ',
    body: '守護キャラが今月のあなただけに贈る、特別なことば。毎月更新される、あなたへの手紙。',
  },
] as const;

export function PremiumView({ onBack }: PremiumViewProps) {
  const { userId } = useCurrentUser();

  return (
    <div className={styles.root}>
      <BackHeader onBack={onBack} title="Premium" />

      {/* ヒーローエリア: Cormorant 装飾英字 + 日本語メインコピー + 価格サブコピー */}
      <div className={styles.hero}>
        <p className={styles.heroAccent}>premium</p>
        <h2 className={styles.heroTitle}>もっと深く、よみとく</h2>
        <p className={styles.heroSubtitle}>月¥980。いつでも解約できるよ。</p>
      </div>

      {/* 価値3点: 1枚ずつカードで語る。機能羅列にしない */}
      <div className={styles.cardsContainer}>
        {VALUE_POINTS.map((v) => (
          <div key={v.label} className={styles.valueCardWrapper}>
            <Card variant="secondary" as="section" aria-label={v.label}>
              <p className={styles.valueLabel}>{v.label}</p>
              <p className={styles.valueBody}>{v.body}</p>
            </Card>
          </div>
        ))}
      </div>

      {/* CTA: 1つに絞る。PremiumCTA が価格・同意フロー・認証を担う */}
      <div className={styles.ctaArea}>
        <PremiumCTA
          source="premium_view"
          userId={userId}
          headline="続きを読む"
          description="登録はいつでも解約できるよ"
        />
      </div>

      {/* 価格注記: 特商法準拠の最小表記 */}
      <p className={styles.priceNote}>
        月額¥980（税込） / 自動更新 / いつでも解約可
      </p>
    </div>
  );
}
