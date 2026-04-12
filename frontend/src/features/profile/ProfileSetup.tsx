import { useState, type FormEvent } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SIGNS, getSignIndex } from '@/data/signs';
import type { UserProfile } from '@/lib/firestore';
import { saveLocalProfile } from '@/lib/firestore';
import { track } from '@/lib/analytics';

interface ProfileSetupProps {
  initial?: UserProfile | null;
  onComplete: (profile: UserProfile) => void;
}

export function ProfileSetup({ initial, onComplete }: ProfileSetupProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [birthYear, setBirthYear] = useState(initial?.birthYear ?? '');
  const [birthMonth, setBirthMonth] = useState(initial?.birthMonth ?? '');
  const [birthDay, setBirthDay] = useState(initial?.birthDay ?? '');
  const [gender, setGender] = useState<'male' | 'female' | ''>(initial?.gender ?? '');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const m = parseInt(birthMonth, 10);
    const d = parseInt(birthDay, 10);
    if (!name || !m || !d || !gender) return;
    const signIdx = getSignIndex(m, d);
    const sign = SIGNS[signIdx]?.k ?? 'おひつじ座';
    const profile: UserProfile = {
      name,
      sign,
      birthYear,
      birthMonth,
      birthDay,
      gender,
      prefecture: initial?.prefecture ?? '',
    };
    saveLocalProfile(profile);
    track('profile_complete', { sign, gender });
    onComplete(profile);
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 'var(--r-input)',
    border: '1px solid var(--border)',
    background: 'var(--bg1)',
    fontSize: 15,
    color: 'var(--t1)',
    fontFamily: 'var(--font-heading)',
  } as const;

  return (
    <div style={{ padding: 'var(--sp-5)' }}>
      <Card>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, color: 'var(--t1)' }}>
          あなたのこと、教えて
        </h2>
        <p style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 'var(--sp-5)', lineHeight: 1.8 }}>
          占いをよりパーソナルにするために、少しだけ情報をもらうよ。
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <label>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>
              ニックネーム
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="あなたの呼び名"
              style={inputStyle}
              maxLength={20}
              required
            />
          </label>

          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>
              生年月日
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="number"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                placeholder="年"
                style={inputStyle}
                min={1900}
                max={new Date().getFullYear()}
              />
              <input
                type="number"
                value={birthMonth}
                onChange={(e) => setBirthMonth(e.target.value)}
                placeholder="月"
                style={inputStyle}
                min={1}
                max={12}
                required
              />
              <input
                type="number"
                value={birthDay}
                onChange={(e) => setBirthDay(e.target.value)}
                placeholder="日"
                style={inputStyle}
                min={1}
                max={31}
                required
              />
            </div>
          </div>

          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>
              性別
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['female', 'male'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 'var(--r-input)',
                    border: `1px solid ${gender === g ? 'var(--rose)' : 'var(--border)'}`,
                    background: gender === g ? 'var(--rose)' : 'var(--card-solid)',
                    color: gender === g ? '#fff' : 'var(--t1)',
                    fontWeight: 700,
                    fontFamily: 'var(--font-heading)',
                    cursor: 'pointer',
                    minHeight: 44,
                  }}
                >
                  {g === 'female' ? '女性' : '男性'}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" fullWidth style={{ marginTop: 'var(--sp-4)' }}>
            占いを始める
          </Button>
        </form>
      </Card>
    </div>
  );
}
