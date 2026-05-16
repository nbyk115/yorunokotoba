/**
 * RarityBadge — レア度バッジ
 * Wave L1: hex 直書き廃止 → --rarity-* トークン参照
 * DESIGN.md: --r-tag 20px (pill 形状)
 */
import type { DreamType } from '@/data/dreamTypes';

interface RarityBadgeProps {
  rarity: DreamType['rarity'];
}

const RARITY_LABEL: Record<DreamType['rarity'], string> = {
  N: 'N',
  R: 'R',
  SR: 'SR',
  SSR: 'SSR',
};

/** 背景は前景色を低 alpha で重ねる（ガラス感）*/
const RARITY_BG: Record<DreamType['rarity'], string> = {
  N: 'rgba(246,236,238,0.08)',
  R: 'rgba(236,140,158,0.14)',
  SR: 'rgba(138,135,184,0.16)',
  SSR: 'rgba(201,169,97,0.22)',
};

export function RarityBadge({ rarity }: RarityBadgeProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 'var(--r-tag)',
        background: RARITY_BG[rarity],
        color: `var(--rarity-${rarity.toLowerCase()})`,
        fontSize: 'var(--fs-micro)',
        fontWeight: 800,
        letterSpacing: 1,
      }}
    >
      {RARITY_LABEL[rarity]}
    </span>
  );
}
