/**
 * DreamThemeIcon
 * 夢のテーマ5種を表すアイコン。
 *
 * 自作の手描き SVG（arc/bezier の座標手計算）は形が不正確で
 * 「見切れ・ダサさ」の原因になっていたため、プロデザインの
 * lucide-react アイコンに置き換えた。viewBox は lucide 側で
 * 正規化されているため見切れは発生しない。
 *
 * Motifs:
 *   anx     - Wind   : ざわめきと解放
 *   love    - Heart  : 恋愛と感情
 *   free    - Feather: 自由と飛翔
 *   work    - Sprout : 成長と課題
 *   mystery - Moon   : 深層と謎
 */

import type { FC } from 'react';
import { Wind, Heart, Feather, Sprout, Moon, type LucideIcon } from 'lucide-react';

type ThemeKey = 'anx' | 'love' | 'free' | 'work' | 'mystery';

interface DreamThemeIconProps {
  themeKey: ThemeKey;
  size?: number;
  color?: string;
}

const THEME_LABELS: Record<ThemeKey, string> = {
  anx: '不安・解放',
  love: '恋愛・感情',
  free: '自由・飛翔',
  work: '成長・課題',
  mystery: '深層・謎',
};

const THEME_ICONS: Record<ThemeKey, LucideIcon> = {
  anx: Wind,
  love: Heart,
  free: Feather,
  work: Sprout,
  mystery: Moon,
};

export const DreamThemeIcon: FC<DreamThemeIconProps> = ({
  themeKey,
  size = 24,
  color = 'currentColor',
}) => {
  const LucideIconComp = THEME_ICONS[themeKey];
  return (
    <LucideIconComp
      size={size}
      color={color}
      strokeWidth={1.5}
      aria-label={THEME_LABELS[themeKey]}
    />
  );
};
