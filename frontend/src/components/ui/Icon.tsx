/**
 * Icon: lucide-react アイコンの単一エントリラッパー.
 *
 * 使い方:
 *   import { Icon } from '@/components/ui/Icon';
 *   import { House } from 'lucide-react';
 *   <Icon icon={House} size={22} />
 *
 * - size: px 単位のアイコンサイズ（既定 20）
 * - color: CSS color 値（既定 currentColor = 親の text 色を継承）
 * - strokeWidth: 線幅（既定 1.75）
 * - className / style: 追加の CSS クラス・インラインスタイル
 */

import type { LucideIcon, LucideProps } from 'lucide-react';

interface IconProps extends Omit<LucideProps, 'ref'> {
  icon: LucideIcon;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({
  icon: LucideIconComponent,
  size = 20,
  color = 'currentColor',
  strokeWidth = 1.75,
  ...rest
}: IconProps) {
  return (
    <LucideIconComponent
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      aria-hidden="true"
      focusable={false}
      {...rest}
    />
  );
}
