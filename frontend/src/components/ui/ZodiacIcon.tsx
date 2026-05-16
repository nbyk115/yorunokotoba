/**
 * ZodiacIcon
 *
 * 12 zodiac signs as custom line-art SVG icons.
 *
 * Design spec (Phase C4):
 *   - 24x24 viewBox, stroke 1px, fill: none
 *   - Thinner than MoonPhaseIcon (1.5px) and DreamThemeIcon (1.5px)
 *     to match the delicate aesthetic of traditional astrology glyphs
 *   - All paths drawn within ~1.5px visual margin
 *   - No em/en dashes in comments or strings
 *
 * Glyph motifs (classical astrology):
 *   0  Aries (Ram horns):     two outward-curving arcs from center bottom, like ram horns
 *   1  Taurus (Bull):         circle with a "U" horn arc above
 *   2  Gemini (Twins):        two vertical lines with horizontal bars top and bottom (Roman II)
 *   3  Cancer (Crab):         two opposing spirals (69 shape, rotated horizontally)
 *   4  Leo (Lion):            small circle at bottom + S-curve tail extending upper right
 *   5  Virgo (Virgin):        M shape with right leg curving inward (looped)
 *   6  Libra (Scales):        flat base line, semicircle above it, flat cap line on top
 *   7  Scorpio (Scorpion):    M shape with arrow tail pointing right
 *   8  Sagittarius (Archer):  diagonal arrow (shaft + arrowhead + perpendicular bar)
 *   9  Capricorn (Sea-goat):  V shape with a loop on the right leg
 *   10 Aquarius (Water):      two horizontal wavy lines stacked
 *   11 Pisces (Fish):         two arcs facing opposite directions + horizontal line through center
 */

import type { FC } from 'react';
import { SIGNS } from '@/data/signs';

interface ZodiacIconProps {
  signIndex: number;
  size?: number;
  color?: string;
}

const STROKE_WIDTH = 1;

/* ───────────────────────────────────────────
   0. Aries (Aries, Ram horns)
   Two arcs starting from a shared center-bottom point (12, 17),
   one curving up-left, one curving up-right, like ram horns.
   Left horn:  M 12,17 C 5,17 3,8 8,6
   Right horn: M 12,17 C 19,17 21,8 16,6
────────────────────────────────────────── */
function AriesIcon({ color, sw }: { color: string; sw: number }) {
  return (
    <>
      <path
        d="M 12,17 C 5,17 3,8 8,6"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 12,17 C 19,17 21,8 16,6"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />
    </>
  );
}

/* ───────────────────────────────────────────
   1. Taurus (Bull, circle + horns)
   Circle centered at (12, 15) radius 5.
   "U" shaped horn arc above the circle: the two tips rest on the
   top of the circle (12 +/- 5 = 7 and 17), and the arc rises to y=6.
   Arc: M 7,13 A 7,7 0 0 1 17,13  (arc over the top of circle)
   simplified to a cubic bezier up:
   M 7,13 C 7,6 17,6 17,13
────────────────────────────────────────── */
function TaurusIcon({ color, sw }: { color: string; sw: number }) {
  return (
    <>
      {/* Main circle */}
      <circle cx={12} cy={15} r={5} stroke={color} strokeWidth={sw} fill="none" />
      {/* Horn arc above */}
      <path
        d="M 7,13 C 7,6 17,6 17,13"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />
    </>
  );
}

/* ───────────────────────────────────────────
   2. Gemini (Twins, Roman numeral II)
   Two vertical lines + top and bottom horizontal bars.
   Left line:  x=9, y=5 to y=19
   Right line: x=15, y=5 to y=19
   Top bar:    x=6 to x=18, y=5
   Bottom bar: x=6 to x=18, y=19
────────────────────────────────────────── */
function GeminiIcon({ color, sw }: { color: string; sw: number }) {
  return (
    <>
      <line x1={9} y1={5} x2={9} y2={19} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1={15} y1={5} x2={15} y2={19} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1={6} y1={5} x2={18} y2={5} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1={6} y1={19} x2={18} y2={19} stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </>
  );
}

/* ───────────────────────────────────────────
   3. Cancer (Crab, sideways 69)
   Two spirals mirrored. The classical glyph is two
   circular arcs / spirals facing opposite directions.
   Top spiral (like '6'): opens to the right, centers around y=9
   Bottom spiral (like '9'): opens to the left, centers around y=15

   Top (counterclockwise circle opening right):
     Small circle center (11, 9) radius 3.
     The curl start: M 14,9 arc to come back, then tail right.
     Represent as: circle at (10, 9) r=3 + short tail from the right
   Bottom (clockwise circle opening left):
     Circle at (14, 15) r=3 + short tail from the left

   Simplified as two C-curves facing opposite directions
   with small spiral suggestion at each end.

   Top arc: right-opening C, from (6,7) to (6,11) curving right to (14,9)
   Bottom arc: left-opening C, from (18,13) to (18,17) curving left to (10,15)
────────────────────────────────────────── */
function CancerIcon({ color, sw }: { color: string; sw: number }) {
  return (
    <>
      {/* Top spiral: open C facing right */}
      <path
        d="M 14,8 C 14,4 6,4 6,9 C 6,14 14,14 14,11"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />
      {/* Bottom spiral: open C facing left (mirrored) */}
      <path
        d="M 10,13 C 10,17 18,17 18,12 C 18,7 10,7 10,10"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />
    </>
  );
}

/* ───────────────────────────────────────────
   4. Leo (Lion, circle + S-curve tail)
   Small circle at bottom-center, open at top-right.
   Tail curls up and to the right.

   Circle center (10, 17) r=4, open at the top-right.
   Start at the gap (top right of circle) and draw the S-tail up.
   Circle arc (almost full, missing a notch at top):
     M 13,14 A 4,4 0 1 0 13.5,14.5 (going most of the way around)
   Then S-curve: up and right, looping over.
────────────────────────────────────────── */
function LeoIcon({ color, sw }: { color: string; sw: number }) {
  return (
    <>
      {/* Small circle (almost complete, open at top-right) */}
      <path
        d="M 13,14 A 4,4 0 1 0 14,13"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />
      {/* S-curve tail from circle opening, sweeping up-right */}
      <path
        d="M 14,13 C 16,10 20,10 20,7 C 20,4 17,4 17,6"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />
    </>
  );
}

/* ───────────────────────────────────────────
   5. Virgo (Virgin, M + looped right leg)
   Classic Virgo glyph: like an "M" but the rightmost
   downstroke curves inward into a loop before returning.

   Strokes:
     Left leg:   (5, 5) down to (5, 16)
     Middle leg: (5, 5) up peak, down through (10,16)
     Right leg:  goes down then loops inward (the "p" loop)

   Simplified path:
     M 5,16 V 7 (left upstroke)
     then M-like: up and down for two more humps
     final leg curves into a loop at bottom right
────────────────────────────────────────── */
function VirgoIcon({ color, sw }: { color: string; sw: number }) {
  return (
    <>
      {/* Three-hump M base + looped right leg */}
      <path
        d="M 4,16 L 4,9 C 4,5 8,5 8,9 L 8,16"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M 8,9 C 8,5 12,5 12,9 L 12,17 C 12,20 16,21 18,18 C 19,16 18,14 16,14"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  );
}

/* ───────────────────────────────────────────
   6. Libra (Scales, horizontal line + dome + cap)
   Bottom base line: y=18, x=3 to x=21
   Dome (semicircle) above: center (12,14), radius 5, upper half only
   Top cap line: y=10, x=5 to x=19
────────────────────────────────────────── */
function LibraIcon({ color, sw }: { color: string; sw: number }) {
  return (
    <>
      {/* Bottom base line */}
      <line x1={3} y1={18} x2={21} y2={18} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      {/* Dome semicircle: arc from (7,15) to (17,15) curving up to y=9 */}
      <path
        d="M 7,15 A 5,5 0 0 1 17,15"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />
      {/* Top cap line */}
      <line x1={5} y1={10} x2={19} y2={10} stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </>
  );
}

/* ───────────────────────────────────────────
   7. Scorpio (Scorpion, M + arrow tail)
   Like Virgo's M shape but the right leg ends in an arrow
   pointing to the lower-right instead of a loop.

   M legs: same three-hump M
   Arrow tail: from the bottom of the right leg, line diagonally
   down-right with arrowhead (two short lines).
────────────────────────────────────────── */
function ScorpioIcon({ color, sw }: { color: string; sw: number }) {
  return (
    <>
      {/* Three-hump M */}
      <path
        d="M 4,16 L 4,9 C 4,5 8,5 8,9 L 8,16"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M 8,9 C 8,5 12,5 12,9 L 12,16"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Arrow tail: horizontal then arrow tip */}
      <path
        d="M 12,16 L 18,16 L 15,13"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M 18,16 L 15,19"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />
    </>
  );
}

/* ───────────────────────────────────────────
   8. Sagittarius (Archer, diagonal arrow)
   Diagonal arrow: shaft from lower-left to upper-right
   with arrowhead at upper-right.
   A short crossbar intersects the shaft near center.

   Shaft: (4, 20) to (20, 4)
   Arrowhead: two lines from (20,4): (14,4) and (20,10)
   Crossbar: perpendicular to shaft at center (12,12):
     from (8,16) to (16,8)  - this is the shaft itself, so just a small cross:
     from (9,9) to (15,15)  - no, better use a short perpendicular line.
   Perpendicular to (4,20)-(20,4) at midpoint (12,12):
     Direction of shaft: (16,-16) normalized = (1/sqrt2, -1/sqrt2)
     Perpendicular: (1/sqrt2, 1/sqrt2)
     Crossbar from (12-3/sqrt2, 12+3/sqrt2) to (12+3/sqrt2, 12-3/sqrt2)
     = (12-2.12, 12+2.12) to (12+2.12, 12-2.12)
     = approx (9.9, 14.1) to (14.1, 9.9)
────────────────────────────────────────── */
function SagittariusIcon({ color, sw }: { color: string; sw: number }) {
  return (
    <>
      {/* Diagonal shaft */}
      <line x1={4} y1={20} x2={20} y2={4} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      {/* Arrowhead: two lines from tip (20,4) */}
      <polyline
        points="11,4 20,4 20,13"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Crossbar perpendicular to shaft */}
      <line x1={10} y1={14} x2={14} y2={10} stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </>
  );
}

/* ───────────────────────────────────────────
   9. Capricorn (Sea-goat, V + loop tail)
   A V shape where the right leg curls into a loop.
   Left stroke goes down-left from top.
   Right stroke goes down then loops to the right, curling under.

   V left leg: (8, 5) down to (12, 18)
   Right leg: from (12, 18) curving right and looping:
     C 16,18 18,14 16,12 C 14,10 11,12 13,15
   Short loop/curl suggestion for the tail.
────────────────────────────────────────── */
function CapricornIcon({ color, sw }: { color: string; sw: number }) {
  return (
    <>
      {/* Left leg of V down */}
      <path
        d="M 6,5 L 12,18"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />
      {/* Right leg: curves into a loop/tail */}
      <path
        d="M 18,5 L 12,18 C 16,18 20,15 19,11 C 18,8 14,8 13,11 C 12,14 14,17 17,17"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  );
}

/* ───────────────────────────────────────────
   10. Aquarius (Water-bearer, two wavy lines)
   Two horizontal sine-like waves, stacked vertically.
   Top wave center y=9, Bottom wave center y=15.
   One cycle from x=3 to x=21.
   Using cubic bezier: one full S-wave.
   M x0,yc C x0+q,yc-A x0+3q,yc-A x0+2q,yc
            C x0+2q+q,yc+A x0+4q,yc+A x0+3q,yc ...
   For one cycle width 18 (3 to 21), A=3:
     q = 18/4 = 4.5
   M 3,9 C 7.5,6 10.5,6 12,9 C 13.5,12 16.5,12 21,9
   M 3,15 C 7.5,12 10.5,12 12,15 C 13.5,18 16.5,18 21,15
────────────────────────────────────────── */
function AquariusIcon({ color, sw }: { color: string; sw: number }) {
  return (
    <>
      <path
        d="M 3,9 C 7.5,6 10.5,6 12,9 C 13.5,12 16.5,12 21,9"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 3,15 C 7.5,12 10.5,12 12,15 C 13.5,18 16.5,18 21,15"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />
    </>
  );
}

/* ───────────────────────────────────────────
   11. Pisces (Fish, two arcs + center bar)
   Left arc: opening to the right, spine on the left.
   Right arc: opening to the left, spine on the right.
   Center horizontal bar connecting the two midpoints.

   Left arc: from (12,5) curving left to (12,19), bulging left to x=5
     M 12,5 C 5,5 5,19 12,19
   Right arc: from (12,5) curving right to (12,19), bulging right to x=19
     M 12,5 C 19,5 19,19 12,19
   Center bar: horizontal line at y=12, x=4 to x=20
────────────────────────────────────────── */
function PiscesIcon({ color, sw }: { color: string; sw: number }) {
  return (
    <>
      {/* Left arc (bulges left) */}
      <path
        d="M 12,5 C 5,5 5,19 12,19"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />
      {/* Right arc (bulges right) */}
      <path
        d="M 12,5 C 19,5 19,19 12,19"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />
      {/* Center horizontal bar */}
      <line x1={4} y1={12} x2={20} y2={12} stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </>
  );
}

/* ── inner glyph components indexed 0-11 ── */
type GlyphProps = { color: string; sw: number };
const GLYPH_COMPONENTS: Array<FC<GlyphProps>> = [
  AriesIcon,
  TaurusIcon,
  GeminiIcon,
  CancerIcon,
  LeoIcon,
  VirgoIcon,
  LibraIcon,
  ScorpioIcon,
  SagittariusIcon,
  CapricornIcon,
  AquariusIcon,
  PiscesIcon,
];

/* ── Main export ── */
export const ZodiacIcon: FC<ZodiacIconProps> = ({
  signIndex,
  size = 24,
  color = 'currentColor',
}) => {
  const idx = ((signIndex % 12) + 12) % 12;
  const GlyphComponent = GLYPH_COMPONENTS[idx];
  const label = SIGNS[idx]?.k ?? '星座';

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
      <GlyphComponent color={color} sw={STROKE_WIDTH} />
    </svg>
  );
};
