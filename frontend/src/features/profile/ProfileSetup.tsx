/**
 * ProfileSetup  -  Wave L2 オンボーディング画面
 *
 * handoff §2「オンボーディング（1画面に統合）」完全準拠。
 * インライン style 全廃（handoff §4 構造的解決方針）。
 * スタイルは ProfileSetup.module.css に集約。
 *
 * レイアウト:
 *   safe-area + 24px → ロゴエリア（yorunokotoba + あなたのことを教えて）
 *   フォームカード（left 2px gold line, Card primary, 名前/生年月日/性別を1画面に統合）
 *   はじめるボタン（margin-top auto で最下部）
 *
 * 廃止（handoff §1 + §2 指示）:
 *   MoonPhaseProgress ステッパー UI（複数ステップに分けない）
 *   CompletionScreen 演出（完了で即ホームへ遷移）
 *   FtueOverlay / 使い方チュートリアル
 *   動的 @keyframes inject（global.css の fadeIn / slideUp を使用）
 *   インライン style 全て
 *
 * 識別性ゲート（断った平均値）:
 *   「3ステップウィザード + 月齢ステッパー演出で焦らす」を断った。
 *   handoff §2「1画面に統合・完了で即ホーム」を最短タップで実現する設計を選んだ。
 *
 * EditMode（プロフィール更新時）は 1画面フォーム構造を維持しつつ CSS Module に切替済み。
 */
import { useState, type FormEvent } from 'react';
import { Flower2, Moon } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SIGNS, getSignIndex } from '@/data/signs';
import { ZodiacIcon } from '@/components/ui/ZodiacIcon';
import type { UserProfile } from '@/lib/firestore';
import { saveLocalProfile } from '@/lib/firestore';
import { track } from '@/lib/analytics';
import styles from './ProfileSetup.module.css';

interface ProfileSetupProps {
  initial?: UserProfile | null;
  onComplete: (profile: UserProfile) => void;
}

export function ProfileSetup({ initial, onComplete }: ProfileSetupProps) {
  const isEditMode = initial !== null && initial !== undefined;

  const [name, setName] = useState(initial?.name ?? '');
  // birthYear は入力項目を持たないため state 不要。initial から初期値を固定で持つ。
  const birthYear = initial?.birthYear ?? '';
  const [birthMonth, setBirthMonth] = useState(initial?.birthMonth ?? '');
  const [birthDay, setBirthDay] = useState(initial?.birthDay ?? '');
  const [gender, setGender] = useState<'male' | 'female' | ''>(initial?.gender ?? '');

  const m = parseInt(birthMonth, 10);
  const d = parseInt(birthDay, 10);
  const signIdx = m >= 1 && m <= 12 && d >= 1 && d <= 31 ? getSignIndex(m, d) : -1;
  const sign = signIdx >= 0 ? SIGNS[signIdx] : null;

  const isValid =
    name.trim().length > 0 &&
    m >= 1 && m <= 12 &&
    d >= 1 && d <= 31 &&
    gender !== '';

  function buildProfile(): UserProfile {
    return {
      name: name.trim(),
      sign: sign?.k ?? 'おひつじ座',
      birthYear,
      birthMonth,
      birthDay,
      gender: gender as 'male' | 'female',
      prefecture: initial?.prefecture ?? '',
    };
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    const profile = buildProfile();
    saveLocalProfile(profile);
    track('profile_complete', { sign: profile.sign, gender: profile.gender });
    onComplete(profile);
  }

  return (
    <main className={styles.root}>
      {/* ロゴエリア */}
      <div className={styles.logoArea}>
        <p className={styles.logoAccent}>yorunokotoba</p>
        <h1 className={styles.logoTitle}>
          {isEditMode ? 'プロフィールを更新' : 'あなたのことを教えて'}
        </h1>
      </div>

      {/* フォームカード: 左辺 2px gold line + Card primary */}
      <div className={styles.formCardWrapper}>
        <Card variant="primary" as="section" aria-label="プロフィール入力">
          <form
            onSubmit={handleSubmit}
            className={styles.form}
          >
            {/* 名前 */}
            <div className={styles.fieldGroup}>
              <label htmlFor="ps-name" className={styles.fieldLabel}>
                名前（ニックネームでも）
              </label>
              <Input
                id="ps-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 20))}
                placeholder="れな"
                autoComplete="nickname"
                maxLength={20}
                required
                autoFocus={!isEditMode}
              />
            </div>

            {/* 生年月日 */}
            <div className={styles.fieldGroup}>
              <span className={styles.fieldLabel}>
                生年月日（星座判定に使用）
              </span>
              <div className={styles.birthRow}>
                <div className={styles.birthMonthWrap}>
                  <Input
                    id="ps-month"
                    type="number"
                    inputMode="numeric"
                    value={birthMonth}
                    onChange={(e) => setBirthMonth(e.target.value)}
                    placeholder="月"
                    min={1}
                    max={12}
                    required
                    aria-label="生まれた月"
                    className={styles.centerInput}
                  />
                </div>
                <span className={styles.birthSeparator} aria-hidden="true">月</span>
                <div className={styles.birthDayWrap}>
                  <Input
                    id="ps-day"
                    type="number"
                    inputMode="numeric"
                    value={birthDay}
                    onChange={(e) => setBirthDay(e.target.value)}
                    placeholder="日"
                    min={1}
                    max={31}
                    required
                    aria-label="生まれた日"
                    className={styles.centerInput}
                  />
                </div>
                <span className={styles.birthSeparator} aria-hidden="true">日</span>
              </div>

              {/* 星座プレビュー: 日付入力後に fadeIn 表示 */}
              {sign && (
                <div className={styles.signPreview}>
                  <ZodiacIcon signIndex={signIdx} size={40} color="var(--rose)" />
                  <div>
                    <p className={styles.signPreviewName}>{sign.k}</p>
                    <p className={styles.signPreviewSub}>あなたの星座はこれだよ</p>
                  </div>
                </div>
              )}
            </div>

            {/* 性別 */}
            <div className={styles.fieldGroup}>
              <span className={styles.fieldLabel}>性別（キャラ選定に使用）</span>
              <div className={styles.genderRow} role="group" aria-label="性別を選択">
                {([
                  { value: 'female' as const, icon: Flower2, label: '女性' },
                  { value: 'male' as const, icon: Moon, label: '男性' },
                ] as const).map((opt) => {
                  const selected = gender === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setGender(opt.value)}
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
            </div>

            {/* はじめる / 保存するボタン */}
            <div className={styles.submitArea}>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={!isValid}
              >
                {isEditMode ? '保存する' : 'はじめる'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
