/**
 * LegalDocument — 法務文書を public/legal/*.md から fetch して表示.
 *
 * 「反証チェック」節は内部メタ情報のため、表示時に除外する.
 *
 * 文書は SSOT として docs/legal/ に置き、ビルド前に public/legal/ へ同期.
 * （現在は手動コピー. 将来的に prebuild スクリプトで自動化を検討）
 */

import { useEffect, useState } from 'react';

export type LegalCategory = 'tokushoho' | 'terms' | 'privacy';

const TITLES: Record<LegalCategory, string> = {
  tokushoho: '特定商取引法に基づく表記',
  terms: '利用規約',
  privacy: 'プライバシーポリシー',
};

interface LegalDocumentProps {
  category: LegalCategory;
  onBack: () => void;
}

export function LegalDocument({ category, onBack }: LegalDocumentProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/legal/${category}.md`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((text) => {
        if (cancelled) return;
        // 「## 反証チェック」以降は内部メタ情報のため除外
        const cleaned = text.split(/\n---\n\n## 反証チェック/)[0] ?? text;
        setContent(cleaned);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[LegalDocument] fetch failed', err);
        setError('ドキュメントを読み込めなかったみたい');
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category]);

  return (
    <div style={{ padding: 'var(--sp-5)', paddingBottom: 88 }}>
      <button
        type="button"
        onClick={onBack}
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
        ← 設定に戻る
      </button>

      <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)', margin: '0 0 16px' }}>
        {TITLES[category]}
      </h2>

      {loading && <p style={{ color: 'var(--t2)' }}>読み込み中…</p>}
      {error && <p style={{ color: 'var(--rose)' }}>{error}</p>}
      {!loading && !error && (
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: 'var(--font-body, system-ui, sans-serif)',
            fontSize: 13,
            lineHeight: 1.8,
            color: 'var(--t1)',
            margin: 0,
            background: 'transparent',
            padding: 0,
          }}
        >
          {content}
        </pre>
      )}
    </div>
  );
}
