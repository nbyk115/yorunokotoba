/**
 * SettingsView  -  Wave L2 設定画面
 *
 * handoff §2「設定」情報設計に準拠:
 *   見せる: アカウント / Premium 状態 / 法務（規約/プライバシー等）
 *   見せない: ナイトモードトグル（handoff §4 廃止）
 *
 * handoff §4 ナイトモードトグル廃止:
 *   「夜前提アプリにライト/ダーク両対応は矛盾」のためトグル機能ごと廃止。
 *   常時ダーク1テーマ。UI にテーマ切替の残滓を残さない。
 *
 * Wave L2 の役割（handoff §5）:
 *   ホーム/夢占い/星座占い/履歴で確立したカード/余白パターンを設定画面へ波及。
 *   インライン style 全廃（handoff §4 構造的解決方針）。
 *   スタイルは SettingsView.module.css に集約。
 *   lib/subscription.ts / lib/auth.ts のロジックは変更しない（UI のみ）。
 *
 * 廃止: インライン style 全て / ナイトモードトグル UI / Card の style prop
 *
 * 法務要件:
 *   特商法第15条の3 準拠の解約導線をここに集約。
 *   法務文書 3 本は同一画面内で切替表示（LegalDocument 遷移）。
 *
 * 識別性ゲート（断った平均値）:
 *   「スイッチ/トグルが並ぶ一般的な設定画面」を断った。
 *   法務・解約・アカウントの 3 ブロックのみをカードで提示し、最小限の機能に絞った。
 */
import { useState } from 'react';
import { Sparkles, FileText, UserRound } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';
import { BackHeader } from '@/components/ui/BackHeader';
import { Card } from '@/components/ui/Card';
import { useSubscription } from '@/lib/subscription';
import { signOut, useCurrentUser } from '@/lib/auth';
import { CancelConfirmModal } from './CancelConfirmModal';
import { LegalDocument, type LegalCategory } from './LegalDocument';
import styles from './SettingsView.module.css';

interface SettingsViewProps {
  onBack: () => void;
  onPremium?: () => void;
}

export function SettingsView({ onBack, onPremium: _onPremium }: SettingsViewProps) {
  const { user, userId } = useCurrentUser();
  const { subscription, isPremium, loading } = useSubscription(userId);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [legalCategory, setLegalCategory] = useState<LegalCategory | null>(null);
  const [signOutPending, setSignOutPending] = useState(false);

  // 法務遷移時は解約モーダルを必ず閉じる（戻った時の意図せぬ復帰防止）
  function openLegal(c: LegalCategory) {
    setShowCancelModal(false);
    setLegalCategory(c);
  }

  if (legalCategory) {
    return <LegalDocument category={legalCategory} onBack={() => setLegalCategory(null)} />;
  }

  async function handleSignOut() {
    setSignOutPending(true);
    try {
      await signOut();
    } catch (err) {
      console.error('[SettingsView] signOut failed', err);
    } finally {
      setSignOutPending(false);
    }
  }

  return (
    <div className={styles.root}>
      <BackHeader onBack={onBack} title="設定" />

      <div className={styles.cardContainer}>

        {/* Premium ステータス カード */}
        <div className={styles.cardWrapper}>
          <Card variant="secondary" as="section" aria-label="Premium ステータス">
            <h3 className={`${styles.cardTitle} ${styles.cardTitleGold}`}>
              <Icon icon={Sparkles} size={16} color="var(--gold)" />
              Premium ステータス
            </h3>
            {loading ? (
              <p className={styles.loadingText}>読み込み中…</p>
            ) : (
              <SubscriptionStatusBlock
                isPremium={isPremium}
                status={subscription.status}
                currentPeriodEnd={subscription.currentPeriodEnd?.toDate()?.toISOString() ?? null}
                onCancel={() => setShowCancelModal(true)}
              />
            )}
          </Card>
        </div>

        {/* 規約・ポリシー カード */}
        <div className={styles.cardWrapper}>
          <Card variant="secondary" as="section" aria-label="規約とポリシー">
            <h3 className={styles.cardTitle}>
              <Icon icon={FileText} size={16} />
              規約・ポリシー
            </h3>
            <LegalLinkRow onClick={() => openLegal('tokushoho')} label="特定商取引法に基づく表記" />
            <LegalLinkRow onClick={() => openLegal('terms')} label="利用規約" />
            <LegalLinkRow onClick={() => openLegal('privacy')} label="プライバシーポリシー" />
          </Card>
        </div>

        {/* アカウント カード */}
        {user && (
          <div className={styles.cardWrapper}>
            <Card variant="secondary" as="section" aria-label="アカウント">
              <h3 className={styles.cardTitle}>
                <Icon icon={UserRound} size={16} />
                アカウント
              </h3>
              <p className={styles.accountEmail}>
                ログイン中: {user.email ?? user.uid}
              </p>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signOutPending}
                className={styles.outlineButton}
              >
                {signOutPending ? '処理中…' : 'サインアウト'}
              </button>
            </Card>
          </div>
        )}

      </div>{/* end cardContainer */}

      {/* 解約確認モーダル */}
      {showCancelModal && (
        <CancelConfirmModal
          currentPeriodEndIso={subscription.currentPeriodEnd?.toDate()?.toISOString() ?? null}
          onClose={() => setShowCancelModal(false)}
          onCanceled={() => setShowCancelModal(false)}
        />
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   SubscriptionStatusBlock
   Premium 状態に応じて解約ボタン / 解約済み / 未契約を切り替え表示。
   インライン style 全廃: SettingsView.module.css のクラスを使用。
────────────────────────────────────────────── */
interface SubscriptionStatusBlockProps {
  isPremium: boolean;
  status: 'none' | 'active' | 'past_due' | 'canceled';
  currentPeriodEnd: string | null;
  onCancel: () => void;
}

function SubscriptionStatusBlock({
  isPremium,
  status,
  currentPeriodEnd,
  onCancel,
}: SubscriptionStatusBlockProps) {
  if (status === 'active' && isPremium) {
    return (
      <div>
        <p className={styles.statusText}>
          Premium 利用中
        </p>
        {currentPeriodEnd && (
          <p className={styles.statusSubText}>
            次回更新日: {formatDate(currentPeriodEnd)}
          </p>
        )}
        <button
          type="button"
          onClick={onCancel}
          className={styles.outlineButton}
        >
          Premium を解約する
        </button>
      </div>
    );
  }

  if (status === 'canceled') {
    return (
      <div>
        <p className={styles.statusText}>
          解約済み
        </p>
        {currentPeriodEnd && (
          <p className={styles.statusSubText}>
            {formatDate(currentPeriodEnd)} までは引き続き使えるよ
          </p>
        )}
      </div>
    );
  }

  if (status === 'past_due') {
    return (
      <div>
        <p className={`${styles.statusText} ${styles.statusTextRose}`}>
          お支払いに問題が発生したみたい
        </p>
        <p className={styles.pastDueBody}>
          カードの有効期限切れや残高不足が原因かも。次回更新日までに解決できない場合は自動で解約になるよ。
        </p>
        <button
          type="button"
          onClick={onCancel}
          className={styles.outlineButton}
        >
          このまま解約する
        </button>
      </div>
    );
  }

  return (
    <p className={styles.freeText}>
      Premium は未契約だよ。占いタブの末尾から始められるよ。
    </p>
  );
}

/* ──────────────────────────────────────────────
   LegalLinkRow
   法務リンク行: フルwidthボタン / 右端にシェブロン。
   インライン style 全廃: SettingsView.module.css のクラスを使用。
────────────────────────────────────────────── */
function LegalLinkRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={styles.legalLinkRow}
    >
      <span>{label}</span>
      <span aria-hidden="true" className={styles.legalLinkChevron}>›</span>
    </button>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  } catch {
    return iso;
  }
}
