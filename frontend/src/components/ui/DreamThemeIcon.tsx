/**
 * DreamThemeIcon
 * Custom line-art SVG icons for the five dream theme keys.
 *
 * Design spec (Phase C3):
 *   - 24x24 viewBox, stroke 1.5px, fill: none
 *   - All paths drawn within the viewBox with ~1.5px visual margin
 *   - No em/en dashes in comments or strings
 *
 * Motifs:
 *   anx     - two horizontal sine waves (2 cycles each), restlessness + release
 *   love    - 5-petal open flower drawn as a continuous loop curve
 *   free    - crescent moon (two-circle outline) + one small star above
 *   work    - lightning bolt: sharp zigzag single stroke
 *   mystery - crescent cradling inner arc + three small dot stars
 */

import type { FC } from 'react';

type ThemeKey = 'anx' | 'love' | 'free' | 'work' | 'mystery';

interface DreamThemeIconProps {
  themeKey: ThemeKey;
  size?: number;
  color?: string;
}

/* ── per-theme label for aria-label ── */
const THEME_LABELS: Record<ThemeKey, string> = {
  anx: '不安・解放',
  love: '恋愛・感情',
  free: '自由・飛翔',
  work: '成長・課題',
  mystery: '深層・謎',
};

/* ───────────────────────────────────────────
   anx: two sine waves stacked vertically.
   Top wave  y-center = 9, Bottom wave y-center = 15.
   2 full cycles from x=2 to x=22 using cubic bezier.
   Bezier control points for one sine cycle of width W:
     P0=(x0,yc), C1=(x0+W/4, yc-A), C2=(x0+W/2-W/4, yc-A),
     P1=(x0+W/2, yc),
     C3=(x0+W/2+W/4, yc+A), C4=(x0+W-W/4, yc+A), P2=(x0+W, yc)
   For 2 cycles in [2,22]: W_cycle=10, A=3
─────────────────────────────────────────── */
function AnxIcon({ color, sw }: { color: string; sw: number }) {
  const wave = (yc: number) => {
    const x0 = 2, xEnd = 22, A = 3;
    const w = (xEnd - x0) / 2; // 10 per cycle
    const q = w / 4; // 2.5
    return (
      `M ${x0},${yc} ` +
      `C ${x0 + q},${yc - A} ${x0 + w - q},${yc - A} ${x0 + w},${yc} ` +
      `C ${x0 + w + q},${yc + A} ${x0 + 2 * w - q},${yc + A} ${x0 + 2 * w},${yc}`
    );
  };
  return (
    <>
      <path d={wave(9)} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <path d={wave(15)} stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </>
  );
}

/* ───────────────────────────────────────────
   love: 5-petal flower, continuous open loop.
   Center at (12,13). Each petal is an ellipse-like cubic
   bezier radiating outward. Petals do NOT close back to
   the exact start point - the stroke is open (open-ended feel).
   Petal tip radius: 7.5, petal base half-width control: 3.
   Angles: -90, -18, 54, 126, 198 degrees (72-deg steps).
─────────────────────────────────────────── */
function LoveIcon({ color, sw }: { color: string; sw: number }) {
  const cx = 12, cy = 13;
  const r = 7.5;   // tip distance from center
  const ctrl = 3.5; // tangential control offset for petal width

  function petal(angleDeg: number) {
    const rad = (angleDeg * Math.PI) / 180;
    const tx = cx + r * Math.cos(rad);
    const ty = cy + r * Math.sin(rad);
    // perpendicular direction for control points
    const px = -Math.sin(rad);
    const py = Math.cos(rad);
    return {
      // start at center, curve out to tip and back
      d:
        `M ${cx},${cy} ` +
        `C ${cx + px * ctrl},${cy + py * ctrl} ` +
        `${tx + px * ctrl * 0.6},${ty + py * ctrl * 0.6} ` +
        `${tx},${ty} ` +
        `C ${tx - px * ctrl * 0.6},${ty - py * ctrl * 0.6} ` +
        `${cx - px * ctrl},${cy - py * ctrl} ` +
        `${cx},${cy}`,
    };
  }

  const angles = [-90, -18, 54, 126, 198];
  return (
    <>
      {angles.map((a) => (
        <path
          key={a}
          d={petal(a).d}
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      ))}
    </>
  );
}

/* ───────────────────────────────────────────
   free: crescent moon outline + small star.
   Crescent: outer circle cx=11, cy=12, r=7
             inner circle cx=13.5, cy=10.5, r=5.5
   We draw the outer circle arc from where the inner
   circle exits to where it enters, and the inner arc
   from where it re-enters outer space to form the crescent.
   Simpler approach: clip path via SVG defs or approximate
   the crescent outline directly with bezier.

   Direct approach: the crescent outline as a single closed path.
   Outer circle arc (large, left half-ish) + inner circle arc.

   Outer circle: center (11,12), r=7.
   Inner circle (the cutout): center (14,10), r=5.8

   Intersection points of the two circles:
     Given C1=(11,12),r1=7 and C2=(14,10),r2=5.8:
     dx=3, dy=-2, d=sqrt(13)=3.606
     a = (r1^2 - r2^2 + d^2)/(2d) = (49 - 33.64 + 13)/(7.211) = 28.36/7.211 = 3.933
     h = sqrt(r1^2 - a^2) = sqrt(49 - 15.47) = sqrt(33.53) = 5.79
     midpoint = C1 + a*(C2-C1)/d = (11 + 3.933*3/3.606, 12 + 3.933*(-2)/3.606)
              = (11 + 3.27, 12 - 2.18) = (14.27, 9.82)
     perpendicular unit = (-dy,dx)/d = (2/3.606, 3/3.606) = (0.555, 0.832)
     P1 = (14.27 + 5.79*0.555, 9.82 + 5.79*0.832) = (17.49, 14.64)
     P2 = (14.27 - 5.79*0.555, 9.82 - 5.79*0.832) = (11.06, 5.00)

   Crescent path:
     - Start at P2 (11.06, 5.00)
     - Large arc along outer circle (center 11,12, r=7) to P1
     - Small arc along inner circle REVERSED (center 14,10, r=5.8) back to P2

   SVG arc: A rx ry x-rot large-arc sweep x y
   For outer arc P2 -> P1 (going clockwise, large arc):
     A 7 7 0 1 1 17.49 14.64
   For inner arc P1 -> P2 (going counter-clockwise, small arc):
     A 5.8 5.8 0 0 0 11.06 5.00

   Star at (17, 4): small 4-line cross
─────────────────────────────────────────── */
function FreeIcon({ color, sw }: { color: string; sw: number }) {
  // Crescent outline as closed path
  const crescentD =
    'M 11.06,5.00 ' +
    'A 7,7 0 1 1 17.49,14.64 ' +
    'A 5.8,5.8 0 0 0 11.06,5.00 Z';

  // Small star: 4-directional cross, center (17.5, 4.5), arm length 1.8
  const sx = 17.5, sy = 4.5, sa = 1.8;

  return (
    <>
      <path
        d={crescentD}
        stroke={color}
        strokeWidth={sw}
        strokeLinejoin="round"
        fill="none"
      />
      {/* vertical arm */}
      <line x1={sx} y1={sy - sa} x2={sx} y2={sy + sa} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      {/* horizontal arm */}
      <line x1={sx - sa} y1={sy} x2={sx + sa} y2={sy} stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </>
  );
}

/* ───────────────────────────────────────────
   work: lightning bolt - 4-segment sharp zigzag.
   Points (approx):
     (13.5, 2) -> (8, 11.5) -> (12.5, 11.5) -> (7, 22)
   This gives the classic lightning bolt shape that stays
   within 24x24 with ~1.5px margins.
─────────────────────────────────────────── */
function WorkIcon({ color, sw }: { color: string; sw: number }) {
  return (
    <polyline
      points="13.5,2 8,11.5 12.5,11.5 7,22"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  );
}

/* ───────────────────────────────────────────
   mystery: crescent + three inner constellation dots.
   Crescent is smaller and slightly left-leaning.
   Outer circle: center (11, 12), r=8.5 clipped to view
   Use a simpler crescent:
     Outer circle: cx=11, cy=12, r=8 - but that's too big.
   Use outer r=7, inner r=5 with shifted center for a wider crescent.

   Actually reuse the same crescent geometry as "free" but scaled differently,
   and add three small dots inside the crescent belly.

   Outer: cx=11, cy=12, r=7 (same as free)
   Inner: cx=15, cy=10, r=5.5 (wider mouth crescent)

   Intersection C1=(11,12),r1=7, C2=(15,10),r2=5.5:
     dx=4, dy=-2, d=sqrt(20)=4.472
     a = (49 - 30.25 + 20)/(2*4.472) = 38.75/8.944 = 4.333
     h = sqrt(49 - 18.77) = sqrt(30.23) = 5.498
     mid = (11 + 4.333*4/4.472, 12 + 4.333*(-2)/4.472)
         = (11 + 3.875, 12 - 1.937) = (14.875, 10.063)
     perp unit = (-(-2),4)/4.472 = (2/4.472, 4/4.472) = (0.447, 0.894)
     P1 = (14.875 + 5.498*0.447, 10.063 + 5.498*0.894)
        = (14.875 + 2.458, 10.063 + 4.915) = (17.33, 14.98)
     P2 = (14.875 - 2.458, 10.063 - 4.915) = (12.42, 5.15)

   Crescent path:
     M 12.42,5.15
     A 7,7 0 1 1 17.33,14.98
     A 5.5,5.5 0 0 0 12.42,5.15 Z

   Three dots in belly area (left inner space of crescent):
     dot1: (6.5, 9.5)
     dot2: (5.0, 13.0)
     dot3: (8.0, 15.5)
─────────────────────────────────────────── */
function MysteryIcon({ color, sw }: { color: string; sw: number }) {
  const crescentD =
    'M 12.42,5.15 ' +
    'A 7,7 0 1 1 17.33,14.98 ' +
    'A 5.5,5.5 0 0 0 12.42,5.15 Z';

  const dots: [number, number][] = [
    [6.5, 9.0],
    [5.0, 13.0],
    [8.5, 15.5],
  ];
  const dotR = 0.85;

  return (
    <>
      <path
        d={crescentD}
        stroke={color}
        strokeWidth={sw}
        strokeLinejoin="round"
        fill="none"
      />
      {dots.map(([dx, dy], i) => (
        <circle
          key={i}
          cx={dx}
          cy={dy}
          r={dotR}
          stroke={color}
          strokeWidth={sw * 0.7}
          fill={color}
        />
      ))}
    </>
  );
}

/* ── Main export ── */
export const DreamThemeIcon: FC<DreamThemeIconProps> = ({
  themeKey,
  size = 24,
  color = 'currentColor',
}) => {
  const sw = 1.5;
  const label = THEME_LABELS[themeKey];

  let inner: React.ReactNode;
  switch (themeKey) {
    case 'anx':
      inner = <AnxIcon color={color} sw={sw} />;
      break;
    case 'love':
      inner = <LoveIcon color={color} sw={sw} />;
      break;
    case 'free':
      inner = <FreeIcon color={color} sw={sw} />;
      break;
    case 'work':
      inner = <WorkIcon color={color} sw={sw} />;
      break;
    case 'mystery':
      inner = <MysteryIcon color={color} sw={sw} />;
      break;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={label}
    >
      {inner}
    </svg>
  );
};
