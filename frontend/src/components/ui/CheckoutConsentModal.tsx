/**
 * CheckoutConsentModal — 課金前の重要事項確認モーダル.
 *
 * 根拠法令: 電子消費者契約法第3条（申込内容の確認措置）+ 特商法第15条の3
 * （定期購入の重要事項表示）.
 *
 * 提示する重要事項3点:
 *   1. 価格: 月¥980（税込）
 *   2. 自動継続: 解約しない限り毎月課金
 *   3. 解約方法: マイページから1タップで解約可
 */

interface CheckoutConsentModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  onShowLegal: (category: 'tokushoho' | 'terms' | 'privacy') => void;
  pending?: boolean;
}

export function CheckoutConsentModal({
  onConfirm,
  onCancel,
  onShowLegal,
  pending = false,
}: CheckoutConsentModalProps) {
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
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--card-solid)',
          border: '1px solid var(--border)',
          borderRadius: 18,
          padding: 'var(--sp-5)',
          maxWidth: 380,
          width: '100%',
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
          <ConsentRow
            label="月額"
            value="¥980（税込）"
            note="申込時に即時決済されるよ"
          />
          <ConsentRow
            label="自動継続"
            value="解約しない限り毎月課金"
            note="次回更新日は初回決済日から30日ごと"
          />
          <ConsentRow
            label="解約"
            value="マイページから1タップ"
            note="次回更新日の前日23:59 まで・日割返金なし"
          />
        </ul>

        <div
          style={{
            fontSize: 11,
            color: 'var(--t3)',
            lineHeight: 1.7,
            margin: '0 0 16px',
          }}
        >
          詳しくは{' '}
          <LinkButton onClick={() => onShowLegal('tokushoho')}>特商法表記</LinkButton>
          {' / '}
          <LinkButton onClick={() => onShowLegal('terms')}>利用規約</LinkButton>
          {' / '}
          <LinkButton onClick={() => onShowLegal('privacy')}>プライバシー</LinkButton>
          {' を確認してね。'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            style={{
              minHeight: 44,
              padding: '10px 24px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, var(--rose), var(--pink))',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: pending ? 'wait' : 'pointer',
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
          color: 'var(--t3)',
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
