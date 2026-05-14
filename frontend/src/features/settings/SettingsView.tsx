/**
 * SettingsView — マイページ（Premium 状態 / 解約 / 法務リンク / サインアウト）.
 *
 * 特商法第15条の3 準拠の解約導線をここに集約する.
 * 法務文書 3 本は同一画面内で切替表示（別タブやモーダルではなく fullscreen 遷移）.
 */

import { useState } from 'react';
import { useSubscription } from '@/lib/subscription';
import { signOut, useCurrentUser } from '@/lib/auth';
import { CancelConfirmModal } from './CancelConfirmModal';
import { LegalDocument, type LegalCategory } from './LegalDocument';
import { Card } from '@/components/ui/Card';

interface SettingsViewProps {
  onBack: () => void;
}

export function SettingsView({ onBack }: SettingsViewProps) {
  const { user, userId } = useCurrentUser();
  const { subscription, isPremium, loading } = useSubscription(userId);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [legalCategory, setLegalCategory] = useState<LegalCategory | null>(null);
  const [signOutPending, setSignOutPending] = useState(false);

  // T-H2: legal 遷移時は解約モーダルを必ず閉じる（戻った時の意図せぬ復帰防止）
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
    <div style={{ padding: 'var(--sp-5)', paddingBottom: 88 }}>
      <button
        type="button"
        onClick={onBack}
        aria-label="戻る"
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--rose)',
          fontSize: 14,
          padding: '10px 4px',
          minHeight: 44,
          cursor: 'pointer',
          marginBottom: 8,
        }}
      >
        ← 戻る
      </button>

      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--t1)', margin: '0 0 20px' }}>
        設定
      </h2>

      <Card style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold)', margin: '0 0 12px' }}>
          ✨ Premium ステータス
        </h3>
        {loading ? (
          <p style={{ fontSize: 13, color: 'var(--t2)' }}>読み込み中…</p>
        ) : (
          <SubscriptionStatusBlock
            isPremium={isPremium}
            status={subscription.status}
            currentPeriodEnd={subscription.currentPeriodEnd?.toDate()?.toISOString() ?? null}
            onCancel={() => setShowCancelModal(true)}
          />
        )}
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', margin: '0 0 12px' }}>
          📄 規約・ポリシー
        </h3>
        <LegalLinkRow onClick={() => openLegal('tokushoho')} label="特定商取引法に基づく表記" />
        <LegalLinkRow onClick={() => openLegal('terms')} label="利用規約" />
        <LegalLinkRow onClick={() => openLegal('privacy')} label="プライバシーポリシー" />
      </Card>

      {user && (
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', margin: '0 0 12px' }}>
            👤 アカウント
          </h3>
          <p style={{ fontSize: 12, color: 'var(--t2)', margin: '0 0 12px' }}>
            ログイン中: {user.email ?? user.uid}
          </p>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signOutPending}
            style={{
              minHeight: 44,
              padding: '10px 16px',
              borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--t1)',
              fontSize: 13,
              fontWeight: 700,
              cursor: signOutPending ? 'wait' : 'pointer',
              opacity: signOutPending ? 0.6 : 1,
            }}
          >
            {signOutPending ? '処理中…' : 'サインアウト'}
          </button>
        </Card>
      )}

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
        <p style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.8, margin: '0 0 4px' }}>
          🌙 Premium 利用中
        </p>
        {currentPeriodEnd && (
          <p style={{ fontSize: 11, color: 'var(--t3)', margin: '0 0 14px' }}>
            次回更新日: {formatDate(currentPeriodEnd)}
          </p>
        )}
        <button
          type="button"
          onClick={onCancel}
          style={{
            minHeight: 44,
            padding: '10px 16px',
            borderRadius: 12,
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--t2)',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Premium を解約する
        </button>
      </div>
    );
  }

  if (status === 'canceled') {
    return (
      <div>
        <p style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.8, margin: '0 0 4px' }}>
          解約済み
        </p>
        {currentPeriodEnd && (
          <p style={{ fontSize: 11, color: 'var(--t3)', margin: 0 }}>
            {formatDate(currentPeriodEnd)} までは引き続き使えるよ
          </p>
        )}
      </div>
    );
  }

  if (status === 'past_due') {
    return (
      <div>
        <p style={{ fontSize: 13, color: 'var(--rose)', lineHeight: 1.8, margin: '0 0 10px' }}>
          ⚠️ お支払いに問題が発生したみたい
        </p>
        <p style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.7, margin: '0 0 12px' }}>
          カードの有効期限切れや残高不足が原因かも。<br />
          次回更新日までに解決できない場合は自動で解約になるよ。
        </p>
        <button
          type="button"
          onClick={onCancel}
          style={{
            minHeight: 44,
            padding: '10px 16px',
            borderRadius: 12,
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--t2)',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          このまま解約する
        </button>
      </div>
    );
  }

  return (
    <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.8, margin: 0 }}>
      Premium は未契約だよ。占いタブの末尾から始められるよ。
    </p>
  );
}

function LegalLinkRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        minHeight: 44,
        padding: '10px 4px',
        background: 'transparent',
        border: 'none',
        borderTop: '1px solid var(--border)',
        color: 'var(--t1)',
        fontSize: 13,
        textAlign: 'left',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span>{label}</span>
      <span aria-hidden="true" style={{ color: 'var(--t3)' }}>›</span>
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
