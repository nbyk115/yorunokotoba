import { useState } from 'react';
import { Moon, MessageCircleHeart, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { track } from '@/lib/analytics';

const KEY = 'ynk_ftue_done';

interface FtueStep {
  title: string;
  body: string;
  icon: LucideIcon;
}

const STEPS: FtueStep[] = [
  {
    icon: Moon,
    title: 'よるのことばへようこそ',
    body: '夢と星座から、今日のあなたへのメッセージを届けるよ。短い時間で心を整えて。',
  },
  {
    icon: MessageCircleHeart,
    title: '夢を書いてみよう',
    body: 'ゆうべ見た夢をそのまま書くだけでOK。キーワードから深層心理を読み解くよ。',
  },
  {
    icon: Sparkles,
    title: '毎日の運勢も',
    body: '星座に応じた恋愛・仕事・健康のヒントと、今日のお守りが毎日更新されるよ。',
  },
];

interface FtueOverlayProps {
  onComplete: () => void;
}

export function FtueOverlay({ onComplete }: FtueOverlayProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step]!;
  const isLast = step === STEPS.length - 1;

  function handleNext() {
    if (isLast) {
      try {
        localStorage.setItem(KEY, '1');
      } catch {
        /* ignore */
      }
      track('ftue_complete', { step });
      onComplete();
    } else {
      track('ftue_next', { step });
      setStep(step + 1);
    }
  }

  return (
    <div
      className="fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ftue-title"
    >
      <div
        className="slide-up"
        style={{
          background: 'var(--card-solid)',
          borderRadius: 'var(--r-modal)',
          padding: '36px 28px 28px',
          maxWidth: 360,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 12px 48px rgba(0,0,0,0.25)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(232,98,124,0.10)',
            margin: '0 auto 16px',
            color: 'var(--rose)',
          }}
          aria-hidden="true"
        >
          <Icon icon={current.icon} size={32} color="var(--rose)" strokeWidth={1.5} />
        </div>
        <h2
          id="ftue-title"
          style={{
            fontSize: 'var(--fs-h1)',
            fontWeight: 700,
            color: 'var(--rose)',
            marginBottom: 12,
          }}
        >
          {current.title}
        </h2>
        <p style={{ fontSize: 'var(--fs-body)', color: 'var(--t2)', lineHeight: 1.8 }}>{current.body}</p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 8,
            marginTop: 24,
          }}
          aria-hidden="true"
        >
          {STEPS.map((_, i) => (
            <span
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: i === step ? 'var(--rose)' : 'var(--border)',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>

        <div style={{ marginTop: 20 }}>
          <Button onClick={handleNext} fullWidth>
            {isLast ? '始める' : '次へ'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function shouldShowFtue(): boolean {
  try {
    return !localStorage.getItem(KEY);
  } catch {
    return true;
  }
}
