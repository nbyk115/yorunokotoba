/**
 * LegalDocument: 法務文書を public/legal/*.md から fetch して表示.
 *
 * SSOT は docs/legal/. ビルド時に scripts/sync-legal.mjs が
 * public/legal/ へ同期する（反証チェック等の内部メタ情報は除去済み）.
 *
 * 表示は最小限の Markdown レンダリング:
 *   - # / ## / ### → 見出し
 *   - > → 引用
 *   - 表（| ... |）→ pre で保持
 *   - **bold** → 太字
 *   - 区切り線 (---) → hr
 *   - 空行 → 段落分け
 *
 * XSS 対策: dangerouslySetInnerHTML を使わず、React 要素として組立てる.
 */

import { useEffect, useState, type ReactNode } from 'react';

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
        setContent(text);
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
        aria-label="設定に戻る"
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

      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: 'var(--t1)',
          margin: '0 0 16px',
        }}
      >
        {TITLES[category]}
      </h2>

      {loading && <p style={{ color: 'var(--t2)' }}>読み込み中…</p>}
      {error && <p style={{ color: 'var(--rose)' }}>{error}</p>}
      {!loading && !error && <MarkdownLite text={content} />}
    </div>
  );
}

// ─────────────────────────────────────────────
// 最小 Markdown レンダラー（XSS 安全・dangerouslySetInnerHTML なし）
// ─────────────────────────────────────────────

interface MarkdownLiteProps {
  text: string;
}

function MarkdownLite({ text }: MarkdownLiteProps) {
  const blocks = parseBlocks(text);
  return (
    <div style={{ color: 'var(--t1)', fontSize: 13, lineHeight: 1.8 }}>
      {blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} />
      ))}
    </div>
  );
}

type Block =
  | { type: 'heading'; level: 1 | 2 | 3 | 4; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'list-item'; text: string }
  | { type: 'table'; rows: string }
  | { type: 'hr' };

function parseBlocks(text: string): Block[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let buffer: string[] = [];
  let tableBuffer: string[] = [];

  const flushParagraph = () => {
    if (buffer.length > 0) {
      const joined = buffer.join('\n').trim();
      if (joined) blocks.push({ type: 'paragraph', text: joined });
      buffer = [];
    }
  };
  const flushTable = () => {
    if (tableBuffer.length > 0) {
      blocks.push({ type: 'table', rows: tableBuffer.join('\n') });
      tableBuffer = [];
    }
  };

  for (const line of lines) {
    const headingMatch = /^(#{1,4})\s+(.*)$/.exec(line);
    const quoteMatch = /^>\s?(.*)$/.exec(line);
    const listMatch = /^[-*]\s+(.*)$/.exec(line);
    const isTableRow = /^\s*\|.*\|\s*$/.test(line);
    const isHr = /^-{3,}\s*$/.test(line);

    if (isTableRow) {
      flushParagraph();
      tableBuffer.push(line);
      continue;
    }
    flushTable();

    if (isHr) {
      flushParagraph();
      blocks.push({ type: 'hr' });
      continue;
    }
    if (headingMatch) {
      flushParagraph();
      blocks.push({
        type: 'heading',
        level: Math.min(headingMatch[1].length, 4) as 1 | 2 | 3 | 4,
        text: headingMatch[2].trim(),
      });
      continue;
    }
    if (quoteMatch) {
      flushParagraph();
      blocks.push({ type: 'quote', text: quoteMatch[1].trim() });
      continue;
    }
    if (listMatch) {
      flushParagraph();
      blocks.push({ type: 'list-item', text: listMatch[1].trim() });
      continue;
    }
    if (line.trim() === '') {
      flushParagraph();
      continue;
    }
    buffer.push(line);
  }
  flushParagraph();
  flushTable();

  return blocks;
}

function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case 'heading': {
      const sizes = { 1: 18, 2: 16, 3: 14, 4: 13 } as const;
      const Tag = (`h${block.level + 1}` as 'h2' | 'h3' | 'h4' | 'h5');
      return (
        <Tag
          style={{
            fontSize: sizes[block.level],
            fontWeight: 700,
            color: block.level <= 2 ? 'var(--rose)' : 'var(--t1)',
            margin: '20px 0 8px',
          }}
        >
          {block.text}
        </Tag>
      );
    }
    case 'paragraph':
      return (
        <p style={{ margin: '0 0 10px' }}>
          <InlineFormatter text={block.text} />
        </p>
      );
    case 'quote':
      return (
        <blockquote
          style={{
            borderLeft: '3px solid var(--rose)',
            paddingLeft: 12,
            margin: '10px 0',
            color: 'var(--t2)',
            fontSize: 12,
          }}
        >
          <InlineFormatter text={block.text} />
        </blockquote>
      );
    case 'list-item':
      return (
        <div
          style={{
            display: 'flex',
            gap: 8,
            margin: '4px 0',
            paddingLeft: 8,
          }}
        >
          <span style={{ color: 'var(--t3)' }}>•</span>
          <span style={{ flex: 1 }}>
            <InlineFormatter text={block.text} />
          </span>
        </div>
      );
    case 'table':
      return (
        <pre
          style={{
            whiteSpace: 'pre',
            overflowX: 'auto',
            fontFamily: 'inherit',
            fontSize: 11,
            color: 'var(--t1)',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: 10,
            margin: '10px 0',
            lineHeight: 1.6,
          }}
        >
          {block.rows}
        </pre>
      );
    case 'hr':
      return (
        <hr
          style={{
            border: 'none',
            borderTop: '1px solid var(--border)',
            margin: '16px 0',
          }}
        />
      );
  }
}

/** インラインの `**bold**` を <strong> に変換（XSS 安全な分割） */
function InlineFormatter({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const pattern = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(<strong key={i++}>{match[1]}</strong>);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return <>{parts}</>;
}
