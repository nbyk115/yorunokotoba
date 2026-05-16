/**
 * SegmentedControl — セグメント選択 (性別・選択肢など)
 * DESIGN.md: --r-input 12px container / --r-button 14px active segment
 */
import type { ReactNode } from 'react';

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  'aria-label'?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  'aria-label': ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      style={{
        display: 'flex',
        borderRadius: 'var(--r-input)',
        border: '1.5px solid var(--border)',
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.04)',
      }}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={isActive}
            style={{
              flex: 1,
              padding: '12px 8px',
              minHeight: 44,
              background: isActive ? 'var(--rose)' : 'transparent',
              color: isActive ? '#fff' : 'var(--t2)',
              border: 'none',
              borderRight: '1px solid var(--border)',
              cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--fs-caption)',
              fontWeight: isActive ? 700 : 400,
              transition: 'background var(--anim-hover), color var(--anim-hover)',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
