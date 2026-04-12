import { useEffect, useState } from 'react';

/**
 * App — Phase 1 skeleton.
 * This is a placeholder root component. Actual features (dream/fortune/
 * archive/premium) are migrated in Phase 2+.
 */
export default function App() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="app-root">
      <header style={{ padding: 'var(--sp-6) var(--sp-5)', textAlign: 'center' }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--rose)',
            letterSpacing: 2,
            margin: 0,
          }}
        >
          🌙 よるのことば
        </h1>
        <p style={{ color: 'var(--t2)', fontSize: 13, marginTop: 6 }}>夢占い × 星座占い</p>
      </header>

      <main
        style={{
          padding: 'var(--sp-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--sp-4)',
        }}
      >
        <div
          style={{
            background: 'var(--card-solid)',
            borderRadius: 'var(--r-card)',
            padding: 'var(--sp-6)',
            boxShadow: 'var(--card-highlight-shadow)',
            textAlign: 'center',
          }}
        >
          <p style={{ fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>
            Phase 1: ビルド基盤
          </p>
          <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.8 }}>
            Vite + React 18 + TypeScript の初期化が完了しました。
            <br />
            Phase 2 以降で既存機能を順次移植します。
          </p>
          {mounted && (
            <p
              style={{
                marginTop: 'var(--sp-4)',
                fontSize: 11,
                color: 'var(--t3)',
              }}
            >
              ✓ React mounted successfully
            </p>
          )}
        </div>
      </main>

      <footer
        style={{
          padding: 'var(--sp-6) var(--sp-5)',
          textAlign: 'center',
          fontSize: 11,
          color: 'var(--t3)',
        }}
      >
        © よるのことば運営事務局
      </footer>
    </div>
  );
}
