/**
 * CompatibilityView  -  Wave L2 相性占い画面（全面実装）
 *
 * handoff §2「相性占い（無料）」情報設計に完全準拠:
 *   見せる: 星座の相性スコア + エレメント構成 + ペアのコメント
 *   見せない: 課金壁（相性占いは全て無料）
 *
 * handoff §3-1「Tinder の占星術 参考」:
 *   太陽星座での性格の相性
 *   星座の相性スコア（Vibes / コミュニケーション 等を 5 段階バー）
 *   エレメント構成（火/地/風/水 の比率）
 *   ペアへの一言コメント
 *
 * データの正直さ（厳守）:
 *   - 相性スコア 4 軸は calculateSignCompatibility() → scores（simpleHash + エレメント相性ボーナス）
 *   - エレメントは SIGN_ELEMENT_MAP の実データ
 *   - ペアコメントは calculateSignCompatibility() → pairText（bestMatch/bestWhy/keywords 判定）
 *   - UI 側で固定オフセット捏造なし（CLAUDE.md Hard Rule 2）
 *
 * 識別性ゲート（断った平均値）:
 *   「相性占い = 全軸 100% 愛情あふれる結果を返す」を断った。
 *   hash ベースの決定論的算出で「成長しあえる」rank が返ることもある正直な設計を選んだ。
 *   「課金すれば詳細が見える」式の部分ロックを断った（handoff §3-1「課金壁なし」）。
 *
 * スタイル: CompatibilityView.module.css（インライン style 全廃）。
 * カード/余白パターン: HomeView / FortuneView の構造を踏襲。
 */
import { useState } from 'react';
import { BackHeader } from '@/components/ui/BackHeader';
import { Card } from '@/components/ui/Card';
import { StatBar } from '@/components/ui/StatBar';
import { Button } from '@/components/ui/Button';
import { SIGNS } from '@/data/signs';
import {
  calculateSignCompatibility,
  type SignCompatibilityResult,
  type AstroElement,
} from '@/features/aura/compatibilityLogic';
import styles from './CompatibilityView.module.css';

interface CompatibilityViewProps {
  onBack: () => void;
}

const SIGN_NAMES: readonly string[] = SIGNS.map((s) => s.k);

/* ────────────────────────────────────────────── */
/*  エレメント表示ヘルパー                        */
/* ────────────────────────────────────────────── */

/** エレメント → Cormorant 装飾記号 */
const ELEMENT_SYMBOL: Record<AstroElement, string> = {
  火: '△',
  地: '□',
  風: '◇',
  水: '○',
};

/** エレメント → CSS クラス（記号色） */
function elemSymbolClass(elem: AstroElement): string {
  if (elem === '火') return styles.elemFire;
  if (elem === '地') return styles.elemEarth;
  if (elem === '風') return styles.elemAir;
  return styles.elemWater;
}

/** エレメント → CSS クラス（バッジ色） */
function elemBadgeClass(elem: AstroElement): string {
  if (elem === '火') return styles.elemBadgeFire;
  if (elem === '地') return styles.elemBadgeEarth;
  if (elem === '風') return styles.elemBadgeAir;
  return styles.elemBadgeWater;
}

/* ────────────────────────────────────────────── */
/*  ランク → eyebrow CSS クラス                   */
/* ────────────────────────────────────────────── */
function rankEyebrowClass(rank: SignCompatibilityResult['rank']): string {
  if (rank === 'best') return `${styles.rankEyebrow} ${styles.rankEyebrowBest}`;
  if (rank === 'good') return `${styles.rankEyebrow} ${styles.rankEyebrowGood}`;
  return `${styles.rankEyebrow} ${styles.rankEyebrowGrowth}`;
}

/* ────────────────────────────────────────────── */
/*  StatBar カラートークン（軸別）                */
/* ────────────────────────────────────────────── */
const SCORE_COLORS = {
  vibes: 'var(--rose)',
  communication: 'var(--lavender)',
  growth: 'var(--gold)',
  stability: 'var(--lavender)',
};

/* ────────────────────────────────────────────── */
/*  メインコンポーネント                          */
/* ────────────────────────────────────────────── */
export function CompatibilityView({ onBack }: CompatibilityViewProps) {
  const [mySign, setMySign] = useState<string>(SIGN_NAMES[0] ?? 'おひつじ座');
  const [theirSign, setTheirSign] = useState<string>(SIGN_NAMES[3] ?? 'かに座');
  const [result, setResult] = useState<SignCompatibilityResult | null>(null);

  /**
   * calculateSignCompatibility に実際の星座名を渡して結果を得る。
   * UI 側でスコアに手を加えない（固定オフセット捏造禁止）。
   */
  function handleCheck() {
    const r = calculateSignCompatibility(mySign, theirSign);
    setResult(r);
  }

  return (
    <div className={styles.root}>
      {/* BackHeader */}
      <BackHeader onBack={onBack} title="相性占い" />

      {/* ページラベル */}
      <p className={styles.pageLabel}>太陽星座の相性</p>

      {/* 星座 Picker */}
      <div className={styles.pickerRow}>
        {/* 自分の星座 */}
        <div className={styles.pickerGroup}>
          <label htmlFor="my-sign" className={styles.pickerLabel}>
            あなたの星座
          </label>
          <select
            id="my-sign"
            className={styles.select}
            value={mySign}
            onChange={(e) => setMySign(e.target.value)}
          >
            {SIGN_NAMES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <span className={styles.pickerSep} aria-hidden="true">x</span>

        {/* 相手の星座 */}
        <div className={styles.pickerGroup}>
          <label htmlFor="their-sign" className={styles.pickerLabel}>
            相手の星座
          </label>
          <select
            id="their-sign"
            className={styles.select}
            value={theirSign}
            onChange={(e) => setTheirSign(e.target.value)}
          >
            {SIGN_NAMES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* CTA ボタン */}
      <div className={styles.ctaWrapper}>
        <Button variant="primary" onClick={handleCheck} fullWidth>
          相性をみる
        </Button>
      </div>

      {/* ────── 結果エリア ────── */}
      {result && (
        <div className={styles.resultSection}>

          {/* ペアタイトル（ヒーローエリア）*/}
          <div className={styles.pairHero}>
            <p className={rankEyebrowClass(result.rank)}>
              {result.rankLabel}
            </p>
            <h2 className={styles.pairTitle}>{result.pairTitle}</h2>
          </div>

          {/* ════════════════════════════════════════ */}
          {/*  相性スコア（主役カード）                */}
          {/*  scores は calculateSignCompatibility() の実出力  */}
          {/* ════════════════════════════════════════ */}
          <div className={styles.primaryCardWrapper}>
            <Card variant="primary" as="section" aria-label="相性スコア">
              <p className={styles.cardLabel}>相性スコア</p>
              <div className={styles.statList}>
                <StatBar
                  label="Vibes"
                  value={result.scores.vibes}
                  colorToken={SCORE_COLORS.vibes}
                />
                <StatBar
                  label="会話"
                  value={result.scores.communication}
                  colorToken={SCORE_COLORS.communication}
                />
                <StatBar
                  label="成長"
                  value={result.scores.growth}
                  colorToken={SCORE_COLORS.growth}
                />
                <StatBar
                  label="安定"
                  value={result.scores.stability}
                  colorToken={SCORE_COLORS.stability}
                />
              </div>
            </Card>
          </div>

          {/* ════════════════════════════════════════ */}
          {/*  エレメント構成                          */}
          {/*  elementA / elementB は SIGN_ELEMENT_MAP の実データ */}
          {/* ════════════════════════════════════════ */}
          <div className={styles.elemCardWrapper}>
            <Card variant="secondary" as="section" aria-label="エレメント構成">
              <p className={styles.cardLabel}>エレメント構成</p>

              <div className={styles.elemRow}>
                {/* 自分のエレメント */}
                <div className={styles.elemEntry}>
                  <p className={`${styles.elemSymbol} ${elemSymbolClass(result.elementA)}`}>
                    {ELEMENT_SYMBOL[result.elementA]}
                  </p>
                  <p className={styles.elemSignName}>{mySign}</p>
                  <span className={`${styles.elemBadge} ${elemBadgeClass(result.elementA)}`}>
                    {result.elementA}
                  </span>
                </div>

                <span className={styles.elemSep} aria-hidden="true">x</span>

                {/* 相手のエレメント */}
                <div className={styles.elemEntry}>
                  <p className={`${styles.elemSymbol} ${elemSymbolClass(result.elementB)}`}>
                    {ELEMENT_SYMBOL[result.elementB]}
                  </p>
                  <p className={styles.elemSignName}>{theirSign}</p>
                  <span className={`${styles.elemBadge} ${elemBadgeClass(result.elementB)}`}>
                    {result.elementB}
                  </span>
                </div>
              </div>

              {/* エレメント間の相性テキスト: ELEMENT_COMPATIBILITY_TEXT の実データ */}
              <p className={styles.elemCompatText}>
                {result.elementCompatibilityText}
              </p>
            </Card>
          </div>

          {/* ════════════════════════════════════════ */}
          {/*  ペアへの一言コメント                    */}
          {/*  pairText は bestMatch/keywords 判定ロジックの実出力 */}
          {/* ════════════════════════════════════════ */}
          <div className={styles.commentCardWrapper}>
            <Card variant="primary" as="section" aria-label="ふたりへのコメント">
              <p className={styles.cardLabel}>ふたりへ</p>
              <p className={styles.commentBody}>{result.pairText}</p>
            </Card>
          </div>

          {/* AI 免責（景表法対応）*/}
          <p className={styles.disclaimer}>
            ※ AI が生成する娯楽の占いだよ
          </p>
        </div>
      )}
    </div>
  );
}
