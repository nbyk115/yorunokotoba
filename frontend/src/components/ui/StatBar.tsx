/**
 * StatBar  -  5段階バー（恋愛/仕事/健康 等）
 * DESIGN.md: --r-tag 20px フィル / --rose アクティブ / --border バック
 */

interface StatBarProps {
  label: string;
  /** 1-5 */
  value: number;
  /** 色トークン。デフォルト var(--rose) */
  colorToken?: string;
}

export function StatBar({ label, value, colorToken = 'var(--rose)' }: StatBarProps) {
  const clamped = Math.min(5, Math.max(1, Math.round(value)));
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <span
        style={{
          fontSize: 'var(--fs-caption)',
          color: 'var(--t2)',
          fontFamily: 'var(--font-heading)',
          minWidth: 52,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <div
        role="meter"
        aria-valuenow={clamped}
        aria-valuemin={1}
        aria-valuemax={5}
        aria-label={`${label}: ${clamped}/5`}
        style={{
          flex: 1,
          display: 'flex',
          gap: 4,
        }}
      >
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 'var(--r-tag)',
              background: i < clamped ? colorToken : 'var(--border)',
              transition: 'background var(--anim-hover)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
