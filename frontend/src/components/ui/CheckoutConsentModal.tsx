/**
 * CheckoutConsentModal — 課金前の重要事項確認モーダル.
 *
 * 根拠法令:
 *   - 電子契約法第3条（申込内容の確認措置）
 *   - 特商法第15条の3（定期購入の重要事項表示）
 *   - 民法第5条（18歳以上の年齢確認）
 *
 * 機能:
 *   - 重要事項3点（価格・自動継続・解約方法）の明示
 *   - 18歳以上チェックボックス必須
 *   - 同意記録 Firestore 保存（onConfirm 内）
 *   - 法務リンク（特商法/利用規約/プラポリ）をモーダル内部でフルスクリーン表示
 *     → 戻ったときに同意モーダルが維持される（CVR維持）
 *   - ESC で閉じる + フォーカストラップ + scroll lock
 */

import { useRef, useState } from 'react';
import { useModalA11y } from '@/lib/useModalA11y';
import { LegalDocument, type LegalCategory } from '@/features/settings/LegalDocument';

interface CheckoutConsentModalProps {
  /** 同意取得後に呼ばれる. ageConfirmed は L-H2 要件用. */
  onConfirm: (args: { ageConfirmed: boolean }) => void;
  onCancel: () => void;
  pending?: boolean;
}

export function CheckoutConsentModal({
  onConfirm,
  onCancel,
  pending = false,
}: CheckoutConsentModalProps) {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [legalCategory, setLegalCategory] = useState<LegalCategory | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const initialRef = useRef<HTMLInputElement>(null);

  useModalA11y({
    open: legalCategory === null,
    onClose: pending ? () => {} : onCancel,
    dialogRef,
    initialFocusRef: initialRef,
  });

  // 法務文書を表示中はモーダル全画面で legal を出す
  // 「← 戻る」で同意モーダルに復帰（CVR 維持）
  if (legalCategory) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--bg, #1a1530)',
          zIndex: 1100,
          overflowY: 'auto',
        }}
      >
        <LegalDocument
          category={legalCategory}
          onBack={() => setLegalCategory(null)}
        />
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'var(--sp-5)',
      }}
      onClick={pending ? undefined : onCancel}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--card-solid)',
          border: '1px solid var(--border)',
          borderRadius: 18,
          padding: 'var(--sp-5)',
          maxWidth: 380,
          width: '100%',
          outline: 'none',
        }}
      >
        <h3
          id="consent-modal-title"
          style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)', margin: '0 0 14px' }}
        >
          Premium を始める前に
        </h3>

        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <ConsentRow label="月額" value="¥980（税込）" note="申込時に即時決済されるよ" />
          <ConsentRow
            label="サービス内容"
            value="毎月の Premium 機能アクセス"
            note="占いの深層メッセージ・キャラクターからのことば 等"
          />
          <ConsentRow
            label="提供期間"
            value="期間の定めなし（解約まで継続）"
            note="次回更新日は初回決済日から30日ごと"
          />
          <ConsentRow
            label="自動継続"
            value="解約しない限り毎月課金"
            note="解約は次回更新日の前日23:59 まで"
          />
          <ConsentRow
            label="解約"
            value="マイページから1タップ"
            note="日割返金なし・残り期間は引き続き利用可"
          />
        </ul>

        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            cursor: 'pointer',
            margin: '0 0 14px',
            padding: '8px 0',
            minHeight: 44,
          }}
        >
          <input
            ref={initialRef}
            type="checkbox"
            checked={ageConfirmed}
            onChange={(e) => setAgeConfirmed(e.target.checked)}
            disabled={pending}
            style={{
              width: 18,
              height: 18,
              marginTop: 2,
              accentColor: 'var(--rose)',
              cursor: 'pointer',
            }}
          />
          <span style={{ fontSize: 12, color: 'var(--t1)', lineHeight: 1.6 }}>
            私は18歳以上です（民法上、未成年は親権者の同意が必要）
          </span>
        </label>

        <div
          style={{
            fontSize: 11,
            color: 'var(--t3)',
            lineHeight: 1.7,
            margin: '0 0 16px',
          }}
        >
          詳しくは{' '}
          <LinkButton onClick={() => setLegalCategory('tokushoho')}>特商法表記</LinkButton>
          {' / '}
          <LinkButton onClick={() => setLegalCategory('terms')}>利用規約</LinkButton>
          {' / '}
          <LinkButton onClick={() => setLegalCategory('privacy')}>プライバシー</LinkButton>
          {' を確認してね。'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            type="button"
            onClick={() => onConfirm({ ageConfirmed })}
            disabled={pending || !ageConfirmed}
            aria-disabled={pending || !ageConfirmed}
            style={{
              minHeight: 44,
              padding: '10px 24px',
              borderRadius: 12,
              border: 'none',
              background:
                pending || !ageConfirmed
                  ? 'var(--border)'
                  : 'linear-gradient(135deg, var(--rose), var(--pink))',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: pending || !ageConfirmed ? 'not-allowed' : 'pointer',
              opacity: pending ? 0.6 : 1,
            }}
          >
            {pending ? '起動中…' : '同意して決済に進む'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            style={{
              minHeight: 44,
              padding: '10px 24px',
              borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--t1)',
              fontSize: 13,
              fontWeight: 700,
              cursor: pending ? 'wait' : 'pointer',
              opacity: pending ? 0.6 : 1,
            }}
          >
            やめる
          </button>
        </div>
      </div>
    </div>
  );
}

interface ConsentRowProps {
  label: string;
  value: string;
  note: string;
}

function ConsentRow({ label, value, note }: ConsentRowProps) {
  return (
    <li>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span
          style={{
            fontSize: 11,
            color: 'var(--t3)',
            fontWeight: 700,
            minWidth: 56,
          }}
        >
          {label}
        </span>
        <span style={{ fontSize: 14, color: 'var(--t1)', fontWeight: 700 }}>{value}</span>
      </div>
      <p
        style={{
          fontSize: 11,
          color: 'var(--t2)',
          lineHeight: 1.6,
          margin: '2px 0 0 64px',
        }}
      >
        {note}
      </p>
    </li>
  );
}

function LinkButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'transparent',
        border: 'none',
        color: 'var(--rose)',
        textDecoration: 'underline',
        cursor: 'pointer',
        font: 'inherit',
        padding: 0,
      }}
    >
      {children}
    </button>
  );
}
