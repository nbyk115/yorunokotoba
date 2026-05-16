import { useState, useRef, useCallback, type CSSProperties } from 'react';
import { MoonPhaseIcon } from '@/components/ui/MoonPhaseIcon';

type RitualVerb = 'よみとく' | 'ひらく' | '残す' | 'しまう' | string;

interface RitualButtonProps {
  verb: RitualVerb;
  onConfirm: () => void;
  /** ミリ秒。デフォルト 3000ms (--ritual-duration) */
  ritualDuration?: number;
  /** true で即実行（演出スキップ） */
  skipAnimation?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: CSSProperties;
}

type Phase = 'idle' | 'ripple' | 'moon' | 'fadeIn';

/** prefers-reduced-motion を検出する */
function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const PHASE_DURATIONS: Record<Phase, number> = {
  idle: 0,
  ripple: 1000,
  moon: 1000,
  fadeIn: 1000,
};

export function RitualButton({
  verb,
  onConfirm,
  ritualDuration = 3000,
  skipAnimation = false,
  disabled = false,
  fullWidth = false,
  style,
}: RitualButtonProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const runRitual = useCallback(() => {
    if (disabled) return;

    // skip conditions: prop or reduced-motion
    if (skipAnimation || prefersReducedMotion()) {
      onConfirm();
      return;
    }

    const phaseMs = ritualDuration / 3;

    setPhase('ripple');
    timerRef.current = setTimeout(() => {
      setPhase('moon');
      timerRef.current = setTimeout(() => {
        setPhase('fadeIn');
        timerRef.current = setTimeout(() => {
          setPhase('idle');
          onConfirm();
        }, phaseMs);
      }, phaseMs);
    }, phaseMs);
  }, [disabled, skipAnimation, ritualDuration, onConfirm]);

  /** タップで演出スキップ → 即実行 */
  const handleSkip = () => {
    if (phase === 'idle') return;
    clearTimer();
    setPhase('idle');
    onConfirm();
  };

  const isAnimating = phase !== 'idle';

  const baseStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 'var(--r-button)',
    padding: '14px 28px',
    fontSize: 'var(--fs-h3)',
    fontWeight: 700,
    fontFamily: 'var(--font-heading)',
    cursor: disabled ? 'not-allowed' : isAnimating ? 'pointer' : 'pointer',
    minHeight: 48,
    minWidth: 44,
    width: fullWidth ? '100%' : undefined,
    border: 'none',
    background: isAnimating
      ? 'linear-gradient(135deg, var(--lavender), var(--rose))'
      : 'linear-gradient(135deg, var(--rose), var(--pink))',
    color: '#fff',
    boxShadow: isAnimating
      ? '0 4px 24px rgba(176,138,207,0.4)'
      : '0 4px 20px rgba(232, 98, 124, 0.28)',
    opacity: disabled ? 0.5 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
    transition: `background 800ms var(--ritual-easing), box-shadow 800ms var(--ritual-easing)`,
    overflow: 'hidden',
    ...style,
  };

  const moonProgress = phase === 'moon' || phase === 'fadeIn' ? 1 : 0;
  const moonStyle: CSSProperties = {
    position: 'absolute',
    right: 14,
    fontSize: 'var(--fs-h3)',
    opacity: moonProgress,
    transform: `scale(${moonProgress})`,
    transition: `opacity ${PHASE_DURATIONS.moon}ms var(--ritual-easing), transform ${PHASE_DURATIONS.moon}ms var(--ritual-easing)`,
  };

  const rippleStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: 'var(--r-button)',
    pointerEvents: 'none',
    background:
      phase === 'ripple'
        ? 'radial-gradient(circle at center, rgba(176,138,207,0.35) 0%, transparent 70%)'
        : 'transparent',
    transition: `background ${PHASE_DURATIONS.ripple}ms var(--ritual-easing)`,
  };

  return (
    <button
      style={baseStyle}
      onClick={isAnimating ? handleSkip : runRitual}
      aria-label={isAnimating ? `${verb}（タップでスキップ）` : verb}
      aria-busy={isAnimating}
    >
      {/* パーティクル波紋 (phase: ripple) */}
      <span aria-hidden="true" style={rippleStyle} />

      {/* 動詞テキスト */}
      <span>{verb}</span>

      {/* 月アイコン (phase: moon / fadeIn) */}
      <span aria-hidden="true" style={moonStyle}>
        <MoonPhaseIcon phaseIndex={4} glow size={20} color="rgba(255,255,255,0.95)" />
      </span>
    </button>
  );
}
