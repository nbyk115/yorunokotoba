/**
 * OnboardingView  -  Wave L2 オンボーディング画面
 *
 * handoff §2「オンボーディング（1画面に統合）」完全準拠。
 * インライン style 全廃（handoff §4 構造的解決方針）。
 * スタイルは OnboardingView.module.css に集約。
 *
 * レイアウト:
 *   safe-area + 24px → ロゴエリア（yorunokotoba + あなたのことを教えて）
 *   フォーム（名前/生年月日/性別を1画面に統合）
 *   はじめるボタン（margin-top auto で最下部）
 *
 * 廃止（handoff §1 + §2 指示）:
 *   FtueOverlay / 使い方チュートリアル（完了で即ホームへ遷移）
 *   インライン style 全て（OnboardingView.module.css に集約）
 *
 * App.tsx から直接 onComplete コールバックを受け取り、完了後は即 setProfile で
 * ホーム画面へ切り替わる（遅延なし）。
 *
 * 識別性ゲート（断った平均値）:
 *   「3ステップウィザード + 月齢ステッパー演出で焦らす」を断った。
 *   1画面に全項目を収め、最短タップで完了できる導線を選んだ。
 */
import { useState, type FormEvent } from 'react';
import { Flower2, Moon } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SIGNS, getSignIndex } from '@/data/signs';
import { saveLocalProfile } from '@/lib/firestore';
import type { UserProfile } from '@/lib/firestore';
import { track } from '@/lib/analytics';
import styles from './OnboardingView.module.css';

interface OnboardingViewProps {
  onComplete: (profile: UserProfile) => void;
}

export function OnboardingView({ onComplete }: OnboardingViewProps) {
  const [name, setName] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [gender, setGender] = useState<'female' | 'male' | ''>('');

  const m = parseInt(birthMonth, 10);
  const d = parseInt(birthDay, 10);
  const isValid =
    name.trim().length > 0 &&
    m >= 1 && m <= 12 &&
    d >= 1 && d <= 31 &&
    gender !== '';

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
      gender: gender as 'male' | 'female',
      prefecture: '',
    };
    saveLocalProfile(profile);
    track('profile_complete', { sign: profile.sign, gender: profile.gender });
    onComplete(profile);
  }

  return (
    <main className={styles.root}>
      {/* ロゴエリア */}
      <div className={styles.logoArea}>
        <p className={styles.logoAccent}>yorunokotoba</p>
        <h1 className={styles.logoTitle}>あなたのことを教えて</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>

        {/* 名前 */}
        <div className={styles.fieldGroup}>
          <label htmlFor="onb-name" className={styles.fieldLabel}>
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
            autoFocus
          />
        </div>

        {/* 生年月日 */}
        <div className={styles.fieldGroup}>
          <span className={styles.fieldLabel}>生年月日（星座判定に使用）</span>
          <div className={styles.birthRow}>
            <div className={styles.birthInputWrap}>
              <Input
                id="onb-month"
                type="number"
                inputMode="numeric"
                value={birthMonth}
                onChange={(e) => setBirthMonth(e.target.value)}
                placeholder="月"
                min={1}
                max={12}
                required
                aria-label="生まれた月"
                className={styles.birthInput}
              />
            </div>
            <span className={styles.birthSeparator} aria-hidden="true">月</span>
            <div className={styles.birthInputWrap}>
              <Input
                id="onb-day"
                type="number"
                inputMode="numeric"
                value={birthDay}
                onChange={(e) => setBirthDay(e.target.value)}
                placeholder="日"
                min={1}
                max={31}
                required
                aria-label="生まれた日"
                className={styles.birthInput}
              />
            </div>
            <span className={styles.birthSeparator} aria-hidden="true">日</span>
          </div>
        </div>

        {/* 性別 */}
        <div className={styles.fieldGroup}>
          <span className={styles.fieldLabel}>性別（キャラ選定に使用）</span>
          <GenderSelector value={gender} onChange={setGender} />
        </div>

        {/* はじめるボタン */}
        <div className={styles.submitArea}>
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

/* ──────────────────────────────────────────────
   GenderSelector
   ProfileSetup.tsx と同じ視覚パターン。
   CSS Module のクラスは OnboardingView.module.css に集約。
────────────────────────────────────────────── */
interface GenderSelectorProps {
  value: 'female' | 'male' | '';
  onChange: (v: 'female' | 'male') => void;
}

function GenderSelector({ value, onChange }: GenderSelectorProps) {
  const options = [
    { value: 'female' as const, icon: Flower2, label: '女性' },
    { value: 'male' as const, icon: Moon, label: '男性' },
  ] as const;

  return (
    <div className={styles.genderRow} role="group" aria-label="性別を選択">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(opt.value)}
            className={
              selected
                ? `${styles.genderBtn} ${styles.genderBtnSelected}`
                : styles.genderBtn
            }
          >
            <Icon
              icon={opt.icon}
              size={24}
              strokeWidth={1.5}
              color={selected ? 'var(--rose)' : 'var(--t2)'}
            />
            <span
              className={
                selected
                  ? `${styles.genderBtnLabel} ${styles.genderBtnLabelSelected}`
                  : styles.genderBtnLabel
              }
            >
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
