/**
 * OnboardingView  -  Wave L1 骨格実装
 * 1画面統合: Logo → 名前Input → 生年月日Input → 性別SegmentedControl → はじめるButton
 * 完了で即ホーム遷移
 */
import { useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/Input';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Button } from '@/components/ui/Button';
import { SIGNS, getSignIndex } from '@/data/signs';
import { saveLocalProfile } from '@/lib/firestore';
import type { UserProfile } from '@/lib/firestore';
import { track } from '@/lib/analytics';

interface OnboardingViewProps {
  onComplete: (profile: UserProfile) => void;
}

const GENDER_OPTIONS = [
  { value: 'female' as const, label: '女性' },
  { value: 'male' as const, label: '男性' },
];

export function OnboardingView({ onComplete }: OnboardingViewProps) {
  const [name, setName] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [gender, setGender] = useState<'female' | 'male'>('female');

  const m = parseInt(birthMonth, 10);
  const d = parseInt(birthDay, 10);
  const isValid = name.trim().length > 0 && m >= 1 && m <= 12 && d >= 1 && d <= 31;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    const signIdx = getSignIndex(m, d);
    const profile: UserProfile = {
      name: name.trim(),
      sign: SIGNS[signIdx]?.k ?? 'おひつじ座',
      birthYear: '',
      birthMonth,
      birthDay,
      gender,
      prefecture: '',
    };
    saveLocalProfile(profile);
    track('profile_complete', { sign: profile.sign, gender: profile.gender });
    onComplete(profile);
  }

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100dvh',
        padding: 'var(--sp-6) var(--sp-5)',
        gap: 'var(--sp-5)',
      }}
    >
      {/* ロゴエリア */}
      <div style={{ textAlign: 'center', paddingTop: 'var(--sp-6)' }}>
        <p
          style={{
            fontFamily: 'var(--font-accent)',
            fontSize: 'var(--fs-hero-en)',
            fontStyle: 'italic',
            color: 'var(--t3)',
            letterSpacing: '0.08em',
            margin: '0 0 var(--sp-2)',
          }}
        >
          yorunokotoba
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--fs-section)',
            fontWeight: 700,
            color: 'var(--t2)',
            letterSpacing: 'var(--ls-section)',
            margin: 0,
          }}
        >
          あなたのことを教えて
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--sp-5)',
          flex: 1,
        }}
      >
        {/* 名前 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
          <label
            htmlFor="onb-name"
            style={{
              fontSize: 'var(--fs-caption)',
              color: 'var(--t3)',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '0.06em',
            }}
          >
            名前（ニックネームでも）
          </label>
          <Input
            id="onb-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 20))}
            placeholder="れな"
            autoComplete="nickname"
            maxLength={20}
          />
        </div>

        {/* 生年月日 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
          <span
            style={{
              fontSize: 'var(--fs-caption)',
              color: 'var(--t3)',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '0.06em',
            }}
          >
            生年月日（星座判定に使用）
          </span>
          <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}>
            <Input
              id="onb-month"
              type="number"
              inputMode="numeric"
              value={birthMonth}
              onChange={(e) => setBirthMonth(e.target.value)}
              placeholder="月"
              min={1}
              max={12}
              style={{ textAlign: 'center' }}
              aria-label="生まれた月"
            />
            <span style={{ color: 'var(--t3)', flexShrink: 0, fontFamily: 'var(--font-heading)' }}>月</span>
            <Input
              id="onb-day"
              type="number"
              inputMode="numeric"
              value={birthDay}
              onChange={(e) => setBirthDay(e.target.value)}
              placeholder="日"
              min={1}
              max={31}
              style={{ textAlign: 'center' }}
              aria-label="生まれた日"
            />
            <span style={{ color: 'var(--t3)', flexShrink: 0, fontFamily: 'var(--font-heading)' }}>日</span>
          </div>
        </div>

        {/* 性別 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
          <span
            style={{
              fontSize: 'var(--fs-caption)',
              color: 'var(--t3)',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '0.06em',
            }}
          >
            性別（キャラ選定に使用）
          </span>
          <SegmentedControl
            options={GENDER_OPTIONS}
            value={gender}
            onChange={setGender}
            aria-label="性別を選択"
          />
        </div>

        {/* はじめるボタン */}
        <div style={{ marginTop: 'auto', paddingBottom: 'var(--sp-6)' }}>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={!isValid}
          >
            はじめる
          </Button>
        </div>
      </form>
    </main>
  );
}
