/**
 * MoonPhaseIcon
 *
 * 8相の月を SVG で描くコンポーネント。
 *
 * 描画原理:
 *   1. ベース円（満月）を --gold で塗る
 *   2. clipPath で月の円にクリップした欠け楕円（背景色）を重ねる
 *   3. 欠け楕円の rx と cx を phaseIndex に応じて調整し
 *      月の輝面の幅・方向を制御する
 *
 * phaseIndex 対応:
 *   0 = 新月     (全面影: 月が見えない)
 *   1 = 三日月   (右側が細く光る, 左側が大きく欠ける)
 *   2 = 上弦の月 (右半分が光る)
 *   3 = 十三夜   (右側が広く光る, 左端が少し欠ける)
 *   4 = 満月     (全面が光る, 影なし)
 *   5 = 十六夜   (左側が広く光る, 右端が少し欠ける)
 *   6 = 下弦の月 (左半分が光る)
 *   7 = 晦日月   (左側が細く光る, 右側が大きく欠ける)
 */

import type { CSSProperties } from 'react';

const PHASE_LABELS = [
  '新月',
  '三日月',
  '上弦の月',
  '十三夜',
  '満月',
  '十六夜',
  '下弦の月',
  '晦日月',
] as const;

interface MoonPhaseIconProps {
  phaseIndex: number;
  size?: number;
  glow?: boolean;
  color?: string;
  style?: CSSProperties;
  className?: string;
}

/**
 * 欠け楕円のパラメータを返す。
 *
 * 楕円の意味:
 *   - rx: 欠け楕円の横半径 (0=欠けなし, r=全面欠け)
 *   - cx_offset: 欠け楕円中心の月中心からの横ずれ
 *     正 = 右に寄る（左側が欠ける面積が増える）
 *     負 = 左に寄る（右側が欠ける面積が増える）
 *   - side: 'left' | 'right' : 欠けている側
 *     left  = 左側が欠ける（右が光る, idx 0-3）
 *     right = 右側が欠ける（左が光る, idx 5-7）
 *
 * 上弦(idx=2)を基準にする:
 *   上弦は左半分が欠ける。楕円 cx=月中心, rx=r → 左半分をマスク。
 *   しかし楕円を左半円のみに適用するためには clipPath を使う。
 *
 * より単純な楕円1枚アプローチ:
 *   欠け楕円の cx を月円の外に移動することで、月円内でどれだけ
 *   欠けが見えるかが変わる。
 *   cx_offset = r * factor (factor: -1 ~ +1)
 *   factor = 0 → 欠け楕円が月の中心 → 左半分をマスク（上弦相当）
 *   factor > 0 → 楕円が右に寄る → 欠けが小さくなる（十三夜方向）
 *   factor < 0 → 楕円が左に寄る → 欠けが大きくなる（三日月方向）
 *
 * idx 0-4 (右が光る系):
 *   idx  0: factor=-1  全面欠け（新月）
 *   idx  1: factor=-0.5  大きく欠け（三日月）
 *   idx  2: factor=0    上弦（左半分欠け）
 *   idx  3: factor=0.5  少し欠け（十三夜）
 *   idx  4: shadow なし（満月）
 *
 * idx 4-7 (左が光る系, 右側に欠け楕円):
 *   idx  5: factor=0.5  少し欠け（十六夜）
 *   idx  6: factor=0    下弦（右半分欠け）
 *   idx  7: factor=-0.5  大きく欠け（晦日月）
 */
interface ShadowParams {
  rx: number;
  cxOffset: number;
  side: 'left' | 'right' | 'none';
}

function getShadowParams(phaseIndex: number, r: number): ShadowParams {
  const idx = ((phaseIndex % 8) + 8) % 8;

  if (idx === 4) return { rx: 0, cxOffset: 0, side: 'none' };
  if (idx === 0) return { rx: r, cxOffset: -r, side: 'left' };

  if (idx < 4) {
    // 満ちていく月: 右が光る、左が欠ける
    // idx 1,2,3 → factor: -0.5, 0, +0.5
    const factor = (idx - 2) * 0.5;
    return { rx: r, cxOffset: r * factor, side: 'left' };
  }

  // 欠けていく月: 左が光る、右が欠ける
  // idx 5,6,7 → factor: +0.5, 0, -0.5
  const factor = (6 - idx) * 0.5;
  return { rx: r, cxOffset: r * factor, side: 'right' };
}

export function MoonPhaseIcon({
  phaseIndex,
  size = 24,
  glow = false,
  color = 'var(--gold)',
  style,
  className,
}: MoonPhaseIconProps) {
  const idx = ((phaseIndex % 8) + 8) % 8;
  const r = size / 2;
  const label = PHASE_LABELS[idx] ?? '月';

  // ID の一意性: phaseIndex + size で区別
  const uid = `mp-${idx}-${size}`;
  const clipId = `${uid}-clip`;
  const halfClipId = `${uid}-half`;
  const glowId = `${uid}-glow`;

  const { rx, cxOffset, side } = getShadowParams(idx, r);
  const isNewMoon = idx === 0;
  const isFull = idx === 4;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={label}
      style={style}
      className={className}
    >
      <defs>
        {/* 月の輪郭にクリップ */}
        <clipPath id={clipId}>
          <circle cx={r} cy={r} r={r - 0.5} />
        </clipPath>

        {/* 欠け楕円を月の半分（左 or 右）に制限するクリップ */}
        {side === 'left' && (
          <clipPath id={halfClipId}>
            {/* 左半分のみ（x: 0 ~ r） */}
            <rect x={0} y={0} width={r} height={size} />
          </clipPath>
        )}
        {side === 'right' && (
          <clipPath id={halfClipId}>
            {/* 右半分のみ（x: r ~ size） */}
            <rect x={r} y={0} width={r} height={size} />
          </clipPath>
        )}

        {/* グロー用フィルタ（満月 + glow=true 時のみ） */}
        {glow && isFull && (
          <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation={r * 0.45} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      {/* グロー後光（満月 + glow=true 時のみ） */}
      {glow && isFull && (
        <circle
          cx={r}
          cy={r}
          r={r * 0.82}
          fill={color}
          opacity={0.22}
          filter={`url(#${glowId})`}
        />
      )}

      {/* 月本体: --gold で塗る。新月は透明 */}
      {!isNewMoon && (
        <circle cx={r} cy={r} r={r - 0.75} fill={color} clipPath={`url(#${clipId})`} />
      )}

      {/* 欠け部分: 背景色の楕円で月の一部を塗りつぶす */}
      {side !== 'none' && !isNewMoon && (
        <g clipPath={`url(#${clipId})`}>
          {/*
           * 欠け楕円を halfClip で「欠ける側」だけに制限してから描く。
           * これにより反対側（光る側）の色に影響しない。
           */}
          <ellipse
            cx={r + cxOffset}
            cy={r}
            rx={rx}
            ry={r - 0.5}
            fill="var(--bg1)"
            clipPath={`url(#${halfClipId})`}
          />
        </g>
      )}

      {/* 新月: 薄い輪郭のみ */}
      {isNewMoon && (
        <circle
          cx={r}
          cy={r}
          r={r - 0.75}
          fill="none"
          stroke={color}
          strokeWidth={1}
          opacity={0.45}
        />
      )}

      {/* 輪郭の細線（新月以外: 全相共通） */}
      {!isNewMoon && (
        <circle
          cx={r}
          cy={r}
          r={r - 0.75}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          opacity={0.55}
        />
      )}
    </svg>
  );
}
