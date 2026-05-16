import type { DreamType } from '@/data/dreamTypes';

interface RarityBadgeProps {
  rarity: DreamType['rarity'];
}

const RARITY_STYLES: Record<DreamType['rarity'], { bg: string; fg: string; label: string }> = {
  N: { bg: 'rgba(58,40,48,0.08)', fg: 'var(--t2)', label: 'N' },
  R: { bg: 'rgba(232,98,124,0.14)', fg: '#E8627C', label: 'R' },
  SR: { bg: 'rgba(123,140,222,0.16)', fg: '#7B8CDE', label: 'SR' },
  SSR: { bg: 'linear-gradient(135deg, #D4A853, #B8902E)', fg: '#fff', label: 'SSR' },
};

export function RarityBadge({ rarity }: RarityBadgeProps) {
  const s = RARITY_STYLES[rarity];
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 'var(--r-tag)',
        background: s.bg,
        color: s.fg,
        fontSize: 'var(--fs-micro)',
        fontWeight: 800,
        letterSpacing: 1,
      }}
    >
      {s.label}
    </span>
  );
}
