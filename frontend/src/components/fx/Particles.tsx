import { useMemo } from 'react';

interface ParticleSpec {
  x: number;
  y: number;
  s: number;
  d: number;
  delay: number;
  color: string;
}

interface ParticlesProps {
  count?: number;
  seed?: number;
}

/** Lightweight twinkle stars background. pointer-events:none so it never blocks scroll. */
export function Particles({ count = 18, seed = 7 }: ParticlesProps) {
  const dots = useMemo<ParticleSpec[]>(() => {
    let s = seed;
    const rng = () => {
      s = (s * 16807) % 2_147_483_647;
      return (s & 0x7fffffff) / 2_147_483_647;
    };
    const colors = ['#FFE5EC', '#F2A0B0', '#B08ACF', '#D4A853'];
    return Array.from({ length: count }, () => ({
      x: rng() * 100,
      y: rng() * 100,
      s: 1 + rng() * 2,
      d: 2 + rng() * 3,
      delay: rng() * 3,
      color: colors[Math.floor(rng() * colors.length)]!,
    }));
  }, [count, seed]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {dots.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: s.x + '%',
            top: s.y + '%',
            width: s.s * 2,
            height: s.s * 2,
            borderRadius: '50%',
            background: s.color,
            opacity: 0.3,
            animation: `twinkle ${s.d}s ease-in-out infinite`,
            animationDelay: s.delay + 's',
          }}
        />
      ))}
    </div>
  );
}
