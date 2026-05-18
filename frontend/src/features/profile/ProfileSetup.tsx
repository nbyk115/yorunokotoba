import { useState, useEffect, type FormEvent } from 'react';
import { Flower2, Moon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { SIGNS, getSignIndex } from '@/data/signs';
import { ZodiacIcon } from '@/components/ui/ZodiacIcon';
import type { UserProfile } from '@/lib/firestore';
import { saveLocalProfile } from '@/lib/firestore';
import { track } from '@/lib/analytics';

interface ProfileSetupProps {
  initial?: UserProfile | null;
  onComplete: (profile: UserProfile) => void;
}

// ─── Moon Phase Progress ────────────────────────────────────────────────────

interface MoonPhaseProgressProps {
  currentStep: 1 | 2 | 3;
}

function MoonPhaseProgress({ currentStep }: MoonPhaseProgressProps) {
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        padding: '16px 24px 12px',
        background: 'var(--bg1)',
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 24,
        }}
      >
        {/* Connector line left */}
        <div
          style={{
            position: 'absolute',
            left: 'calc(50% - 76px)',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 'calc(33% - 28px)',
            height: 1,
            background: currentStep >= 2 ? 'var(--rose)' : 'var(--border)',
            transition: 'background 300ms ease',
          }}
        />
        {/* Connector line right */}
        <div
          style={{
            position: 'absolute',
            right: 'calc(50% - 76px)',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 'calc(33% - 28px)',
            height: 1,
            background: currentStep >= 3 ? 'var(--rose)' : 'var(--border)',
            transition: 'background 300ms ease',
          }}
        />

        {([1, 2, 3] as const).map((phase) => {
          const isDone = phase < currentStep;
          const isCurrent = phase === currentStep;
          return (
            <div
              key={phase}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: `1.5px solid ${isDone ? 'var(--rose)' : isCurrent ? 'var(--rose)' : 'var(--border)'}`,
                background: isDone ? 'var(--rose)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--fs-body)',
                color: isDone ? '#fff' : isCurrent ? 'var(--rose)' : 'var(--t3)',
                animation: isCurrent ? 'breathe 2s ease infinite' : undefined,
                transition: 'all 300ms ease',
                zIndex: 1,
              }}
            >
              {isDone ? '🌕' : isCurrent ? '🌙' : '○'}
            </div>
          );
        })}
      </div>

      <p
        style={{
          textAlign: 'center',
          marginTop: 8,
          fontSize: 'var(--fs-micro)',
          color: 'var(--t3)',
          letterSpacing: '0.08em',
        }}
      >
        STEP {currentStep} / 3
      </p>
    </div>
  );
}

// ─── Keyframes injection (once) ─────────────────────────────────────────────

const STYLE_ID = 'profile-setup-keyframes';
function ensureKeyframes() {
  if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = `
      @keyframes breathe {
        0%, 100% { box-shadow: 0 0 0 0 rgba(0,0,0,0.25); }
        50%       { box-shadow: 0 0 0 6px rgba(0,0,0,0); }
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes slideOutLeft {
        from { opacity: 1; transform: translateX(0); }
        to   { opacity: 0; transform: translateX(-24px); }
      }
      @keyframes slideInRight {
        from { opacity: 0; transform: translateX(24px); }
        to   { opacity: 1; transform: translateX(0); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes starConnect {
        from { stroke-dashoffset: 200; opacity: 0; }
        to   { stroke-dashoffset: 0; opacity: 1; }
      }
    `;
    document.head.appendChild(el);
  }
}

// ─── Input style (下線のみ・フォーカス時 rose グロー) ───────────────────────

const underlineInputStyle = {
  width: '100%',
  padding: '12px 0',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid var(--border)',
  borderRadius: 0,
  fontSize: 'var(--fs-h2)',
  color: 'var(--t1)',
  fontFamily: 'var(--font-heading)',
  textAlign: 'center' as const,
  letterSpacing: '0.04em',
  outline: 'none',
  transition: 'border-color 200ms ease',
} as const;

// ─── Step 1: ニックネーム ────────────────────────────────────────────────────

interface Step1Props {
  name: string;
  onChange: (v: string) => void;
  animClass: string;
}

function Step1({ name, onChange, animClass }: Step1Props) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      style={{
        padding: '32px 24px 0',
        animation: `${animClass} 450ms ease forwards`,
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-accent)',
          fontSize: 'clamp(20px, 5vw, 24px)',
          fontStyle: 'italic',
          fontWeight: 300,
          color: 'var(--t1)',
          marginBottom: 24,
        }}
      >
        なんて呼ぼうか？
      </h2>

      <label>
        <span
          style={{
            fontSize: 'var(--fs-caption)',
            fontWeight: 700,
            color: 'var(--t3)',
            display: 'block',
            marginBottom: 8,
            letterSpacing: '0.06em',
          }}
        >
          夜にあなたを呼ぶ名前
        </span>
        <input
          type="text"
          value={name}
          onChange={(e) => onChange(e.target.value)}
          placeholder="あなたの呼び名"
          maxLength={20}
          required
          autoFocus
          style={{
            ...underlineInputStyle,
            borderBottomColor: focused
              ? 'var(--rose)'
              : name
                ? 'var(--border)'
                : 'var(--border)',
            boxShadow: focused
              ? '0 2px 0 0 rgba(0,0,0,0.18)'
              : 'none',
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </label>
    </div>
  );
}

// ─── Step 2: 生年月日 ────────────────────────────────────────────────────────

interface Step2Props {
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  onYear: (v: string) => void;
  onMonth: (v: string) => void;
  onDay: (v: string) => void;
  animClass: string;
}

function Step2({ birthYear, birthMonth, birthDay, onYear, onMonth, onDay, animClass }: Step2Props) {
  const [focusedField, setFocusedField] = useState<'year' | 'month' | 'day' | null>(null);

  const m = parseInt(birthMonth, 10);
  const d = parseInt(birthDay, 10);
  const hasValidDate = m >= 1 && m <= 12 && d >= 1 && d <= 31;
  const signIdx = hasValidDate ? getSignIndex(m, d) : -1;
  const sign = signIdx >= 0 ? SIGNS[signIdx] : null;

  const dateInputStyle = (field: 'year' | 'month' | 'day') => ({
    padding: '14px 16px',
    fontSize: 'var(--fs-h3)',
    textAlign: 'center' as const,
    borderRadius: 12,
    border: `1.5px solid ${focusedField === field ? 'var(--rose)' : 'var(--border)'}`,
    background: 'var(--bg1)',
    color: 'var(--t1)',
    transition: 'border-color 200ms ease',
    outline: 'none',
    boxShadow: focusedField === field ? '0 0 0 3px rgba(232,98,124,0.12)' : 'none',
    fontFamily: 'var(--font-heading)',
    width: '100%',
  } as const);

  return (
    <div
      style={{
        padding: '32px 24px 0',
        animation: `${animClass} 450ms ease forwards`,
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-accent)',
          fontSize: 'clamp(20px, 5vw, 24px)',
          fontStyle: 'italic',
          fontWeight: 300,
          color: 'var(--t1)',
          marginBottom: 4,
        }}
      >
        生年月日
      </h2>
      <p
        style={{
          fontSize: 'var(--fs-body)',
          color: 'var(--t2)',
          lineHeight: 1.8,
          marginBottom: 24,
        }}
      >
        この世にあなたが生まれた日
      </p>

      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1.5 }}>
          <input
            type="number"
            value={birthYear}
            onChange={(e) => onYear(e.target.value)}
            placeholder="年（例: 1999）"
            style={dateInputStyle('year')}
            min={1900}
            max={new Date().getFullYear()}
            onFocus={() => setFocusedField('year')}
            onBlur={() => setFocusedField(null)}
          />
        </div>
        <div style={{ flex: 1 }}>
          <input
            type="number"
            value={birthMonth}
            onChange={(e) => onMonth(e.target.value)}
            placeholder="月"
            style={dateInputStyle('month')}
            min={1}
            max={12}
            required
            onFocus={() => setFocusedField('month')}
            onBlur={() => setFocusedField(null)}
          />
        </div>
        <div style={{ flex: 1 }}>
          <input
            type="number"
            value={birthDay}
            onChange={(e) => onDay(e.target.value)}
            placeholder="日"
            style={dateInputStyle('day')}
            min={1}
            max={31}
            required
            onFocus={() => setFocusedField('day')}
            onBlur={() => setFocusedField(null)}
          />
        </div>
      </div>

      {sign && (
        <div
          style={{
            marginTop: 16,
            padding: '14px 20px',
            background: 'var(--card-secondary)',
            borderRadius: 14,
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            animation: 'fadeIn 300ms ease forwards',
          }}
        >
          <ZodiacIcon signIndex={signIdx} size={40} color="var(--rose)" />
          <div>
            <div style={{ fontSize: 'var(--fs-body)', fontWeight: 700, color: 'var(--rose)' }}>
              {sign.k}
            </div>
            <div style={{ fontSize: 'var(--fs-micro)', color: 'var(--t3)' }}>
              あなたの星座はこれだよ
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 3: 性別選択 ────────────────────────────────────────────────────────

interface Step3Props {
  gender: 'male' | 'female' | '';
  onChange: (v: 'male' | 'female') => void;
  animClass: string;
}

function Step3({ gender, onChange, animClass }: Step3Props) {
  const options: { value: 'female' | 'male'; icon: LucideIcon; label: string }[] = [
    { value: 'female', icon: Flower2, label: '女性' },
    { value: 'male', icon: Moon, label: '男性' },
  ];

  return (
    <div
      style={{
        padding: '32px 24px 0',
        animation: `${animClass} 450ms ease forwards`,
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-accent)',
          fontSize: 'clamp(20px, 5vw, 24px)',
          fontStyle: 'italic',
          fontWeight: 300,
          color: 'var(--t1)',
          marginBottom: 4,
        }}
      >
        性別
      </h2>
      <p
        style={{
          fontSize: 'var(--fs-body)',
          color: 'var(--t2)',
          lineHeight: 1.8,
          marginBottom: 0,
        }}
      >
        性別を選んでね。占いの精度が上がるよ。
      </p>

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        {options.map((opt) => {
          const selected = gender === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              style={{
                flex: 1,
                padding: '20px 16px',
                borderRadius: 14,
                border: `1.5px solid ${selected ? 'var(--rose)' : 'var(--border)'}`,
                background: selected ? 'rgba(232,98,124,0.08)' : 'transparent',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 200ms ease',
                minHeight: 80,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Icon icon={opt.icon} size={28} strokeWidth={1.5} />
              <span
                style={{
                  fontSize: 'var(--fs-body)',
                  fontWeight: 700,
                  color: selected ? 'var(--rose)' : 'var(--t1)',
                  fontFamily: 'var(--font-heading)',
                  transition: 'color 200ms ease',
                }}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Completion Screen ────────────────────────────────────────────────────────

interface CompletionScreenProps {
  signName: string;
  onDone: () => void;
}

function CompletionScreen({ signName, onDone }: CompletionScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2200);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '48px 24px',
        textAlign: 'center',
        animation: 'fadeIn 600ms ease forwards',
      }}
    >
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ marginBottom: 24 }}
      >
        {/* Star constellation animation */}
        <circle cx="60" cy="20" r="4" fill="var(--rose)" opacity="0.9" />
        <circle cx="95" cy="45" r="3" fill="var(--rose)" opacity="0.7" />
        <circle cx="85" cy="85" r="3.5" fill="var(--rose)" opacity="0.8" />
        <circle cx="35" cy="85" r="3.5" fill="var(--rose)" opacity="0.8" />
        <circle cx="25" cy="45" r="3" fill="var(--rose)" opacity="0.7" />
        <polyline
          points="60,20 95,45 85,85 35,85 25,45 60,20"
          stroke="var(--rose)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="200"
          strokeDashoffset="0"
          style={{
            animation: 'starConnect 1.2s ease forwards',
          }}
        />
      </svg>

      <h2
        style={{
          fontFamily: 'var(--font-accent)',
          fontSize: 'var(--fs-hero-en)',
          fontStyle: 'italic',
          fontWeight: 300,
          color: 'var(--t1)',
          marginBottom: 12,
        }}
      >
        あなたの星が見つかった
      </h2>
      <p
        style={{
          fontSize: 'var(--fs-body)',
          color: 'var(--rose)',
          fontWeight: 700,
          letterSpacing: '0.06em',
        }}
      >
        {signName}
      </p>
    </div>
  );
}

// ─── Edit Mode (1画面フォールバック) ─────────────────────────────────────────

interface EditModeProps {
  name: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  gender: 'male' | 'female' | '';
  onName: (v: string) => void;
  onYear: (v: string) => void;
  onMonth: (v: string) => void;
  onDay: (v: string) => void;
  onGender: (v: 'male' | 'female') => void;
  onSubmit: (e: FormEvent) => void;
}

function EditMode({
  name, birthYear, birthMonth, birthDay, gender,
  onName, onYear, onMonth, onDay, onGender, onSubmit,
}: EditModeProps) {
  return (
    <div style={{ padding: '24px 24px 120px' }}>
      <h2
        style={{
          fontFamily: 'var(--font-accent)',
          fontSize: 'var(--fs-h1)',
          fontStyle: 'italic',
          fontWeight: 300,
          color: 'var(--t1)',
          marginBottom: 4,
        }}
      >
        Your profile
      </h2>
      <p style={{ fontSize: 'var(--fs-caption)', color: 'var(--t2)', marginBottom: 24, lineHeight: 1.8 }}>
        情報を更新できるよ
      </p>

      <form
        onSubmit={onSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
      >
        <label>
          <span
            style={{
              fontSize: 'var(--fs-caption)',
              fontWeight: 700,
              color: 'var(--t3)',
              display: 'block',
              marginBottom: 8,
            }}
          >
            夜にあなたを呼ぶ名前
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => onName(e.target.value)}
            placeholder="あなたの呼び名"
            style={{
              ...underlineInputStyle,
              textAlign: 'left' as const,
            }}
            maxLength={20}
            required
          />
        </label>

        <div>
          <span
            style={{
              fontSize: 'var(--fs-caption)',
              fontWeight: 700,
              color: 'var(--t3)',
              display: 'block',
              marginBottom: 8,
            }}
          >
            この世にあなたが生まれた日
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="number"
              value={birthYear}
              onChange={(e) => onYear(e.target.value)}
              placeholder="年"
              style={{
                flex: 1.5,
                padding: '12px 14px',
                borderRadius: 12,
                border: '1.5px solid var(--border)',
                background: 'var(--bg1)',
                color: 'var(--t1)',
                fontSize: 'var(--fs-body)',
                fontFamily: 'var(--font-heading)',
                outline: 'none',
              }}
              min={1900}
              max={new Date().getFullYear()}
            />
            <input
              type="number"
              value={birthMonth}
              onChange={(e) => onMonth(e.target.value)}
              placeholder="月"
              style={{
                flex: 1,
                padding: '12px 14px',
                borderRadius: 12,
                border: '1.5px solid var(--border)',
                background: 'var(--bg1)',
                color: 'var(--t1)',
                fontSize: 'var(--fs-body)',
                fontFamily: 'var(--font-heading)',
                outline: 'none',
              }}
              min={1}
              max={12}
              required
            />
            <input
              type="number"
              value={birthDay}
              onChange={(e) => onDay(e.target.value)}
              placeholder="日"
              style={{
                flex: 1,
                padding: '12px 14px',
                borderRadius: 12,
                border: '1.5px solid var(--border)',
                background: 'var(--bg1)',
                color: 'var(--t1)',
                fontSize: 'var(--fs-body)',
                fontFamily: 'var(--font-heading)',
                outline: 'none',
              }}
              min={1}
              max={31}
              required
            />
          </div>
        </div>

        <div>
          <span
            style={{
              fontSize: 'var(--fs-caption)',
              fontWeight: 700,
              color: 'var(--t3)',
              display: 'block',
              marginBottom: 8,
            }}
          >
            あなたを表す星のかたち
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['female', 'male'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => onGender(g)}
                style={{
                  flex: 1,
                  padding: '16px',
                  borderRadius: 12,
                  border: `1.5px solid ${gender === g ? 'var(--rose)' : 'var(--border)'}`,
                  background: gender === g ? 'rgba(232,98,124,0.08)' : 'transparent',
                  color: gender === g ? 'var(--rose)' : 'var(--t1)',
                  fontWeight: 700,
                  fontFamily: 'var(--font-heading)',
                  cursor: 'pointer',
                  fontSize: 'var(--fs-body)',
                  transition: 'all 200ms ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Icon icon={g === 'female' ? Flower2 : Moon} size={18} strokeWidth={1.5} />
                {g === 'female' ? '女性' : '男性'}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            position: 'sticky',
            bottom: 'calc(56px + env(safe-area-inset-bottom))',
            padding: '16px 0',
            background: 'var(--bg1)',
          }}
        >
          <Button type="submit" fullWidth>
            保存する
          </Button>
        </div>
      </form>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProfileSetup({ initial, onComplete }: ProfileSetupProps) {
  // Keyframes injection
  ensureKeyframes();

  const isEditMode = initial !== null && initial !== undefined;

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [animClass, setAnimClass] = useState<'slideUp' | 'slideInRight'>('slideUp');
  const [isCompleting, setIsCompleting] = useState(false);

  const [name, setName] = useState(initial?.name ?? '');
  const [birthYear, setBirthYear] = useState(initial?.birthYear ?? '');
  const [birthMonth, setBirthMonth] = useState(initial?.birthMonth ?? '');
  const [birthDay, setBirthDay] = useState(initial?.birthDay ?? '');
  const [gender, setGender] = useState<'male' | 'female' | ''>(initial?.gender ?? '');

  // Computed sign for completion screen
  const m = parseInt(birthMonth, 10);
  const d = parseInt(birthDay, 10);
  const signIdx = m >= 1 && m <= 12 && d >= 1 && d <= 31 ? getSignIndex(m, d) : 0;
  const signName = SIGNS[signIdx]?.k ?? 'おひつじ座';

  function buildProfile(): UserProfile {
    return {
      name,
      sign: SIGNS[signIdx]?.k ?? 'おひつじ座',
      birthYear,
      birthMonth,
      birthDay,
      gender: gender as 'male' | 'female',
      prefecture: initial?.prefecture ?? '',
    };
  }

  function handleNext() {
    if (currentStep === 1) {
      if (!name.trim()) return;
      setAnimClass('slideInRight');
      setCurrentStep(2);
    } else if (currentStep === 2) {
      const mo = parseInt(birthMonth, 10);
      const dy = parseInt(birthDay, 10);
      if (!mo || !dy) return;
      setAnimClass('slideInRight');
      setCurrentStep(3);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const mo = parseInt(birthMonth, 10);
    const dy = parseInt(birthDay, 10);
    if (!name || !mo || !dy || !gender) return;

    const profile = buildProfile();
    saveLocalProfile(profile);
    track('profile_complete', { sign: profile.sign, gender: profile.gender });

    if (isEditMode) {
      onComplete(profile);
    } else {
      setIsCompleting(true);
    }
  }

  function handleCompletionDone() {
    onComplete(buildProfile());
  }

  // Edit mode: single-page form
  if (isEditMode) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg1)' }}>
        <EditMode
          name={name}
          birthYear={birthYear}
          birthMonth={birthMonth}
          birthDay={birthDay}
          gender={gender}
          onName={setName}
          onYear={setBirthYear}
          onMonth={setBirthMonth}
          onDay={setBirthDay}
          onGender={setGender}
          onSubmit={handleSubmit}
        />
      </div>
    );
  }

  // Completion screen
  if (isCompleting) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg1)' }}>
        <CompletionScreen signName={signName} onDone={handleCompletionDone} />
      </div>
    );
  }

  // New user: 3-step wizard
  const step1Valid = name.trim().length > 0;
  const step2Valid = parseInt(birthMonth, 10) >= 1 && parseInt(birthDay, 10) >= 1;
  const step3Valid = gender !== '';

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--bg1)',
        paddingBottom: 120,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Hero header */}
      <div
        style={{
          padding: '32px 24px 0',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-accent)',
            fontSize: 'var(--fs-hero-en)',
            fontStyle: 'italic',
            fontWeight: 300,
            color: 'var(--t1)',
            marginBottom: 8,
          }}
        >
          はじめまして。夢と星座で、あなたの夜に寄り添うよ。
        </h1>
        <p
          style={{
            fontSize: 'var(--fs-body)',
            color: 'var(--t2)',
            lineHeight: 1.8,
            letterSpacing: '0.04em',
          }}
        >
          占いに使うから、3つだけ教えて
        </p>
      </div>

      {/* Moon phase progress bar */}
      <MoonPhaseProgress currentStep={currentStep} />

      {/* Step content */}
      <form
        onSubmit={handleSubmit}
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        {currentStep === 1 && (
          <Step1
            name={name}
            onChange={setName}
            animClass={animClass}
          />
        )}
        {currentStep === 2 && (
          <Step2
            birthYear={birthYear}
            birthMonth={birthMonth}
            birthDay={birthDay}
            onYear={setBirthYear}
            onMonth={setBirthMonth}
            onDay={setBirthDay}
            animClass={animClass}
          />
        )}
        {currentStep === 3 && (
          <Step3
            gender={gender}
            onChange={setGender}
            animClass={animClass}
          />
        )}

        {/* Sticky button */}
        <div
          style={{
            position: 'sticky',
            bottom: 'calc(56px + env(safe-area-inset-bottom))',
            padding: '16px 24px',
            background: 'var(--bg1)',
            marginTop: 'auto',
          }}
        >
          {currentStep < 3 ? (
            <Button
              type="button"
              variant="primary"
              fullWidth
              onClick={handleNext}
              disabled={currentStep === 1 ? !step1Valid : !step2Valid}
              style={{
                opacity: (currentStep === 1 ? !step1Valid : !step2Valid) ? 0.5 : 1,
                transition: 'opacity 200ms ease',
              }}
            >
              つぎへ
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={!step3Valid}
              style={{
                opacity: !step3Valid ? 0.5 : 1,
                transition: 'opacity 200ms ease',
              }}
            >
              ひらく
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
