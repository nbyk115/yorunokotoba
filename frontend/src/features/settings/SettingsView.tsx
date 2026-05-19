import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProfileSetup } from '@/features/profile/ProfileSetup';
import { clearLocalProfile } from '@/lib/firestore';
import { signOut } from '@/lib/auth';
import type { UserProfile } from '@/lib/firestore';

interface SettingsViewProps {
  profile: UserProfile;
  onProfileUpdate: (profile: UserProfile) => void;
  onLogout: () => void;
}

export function SettingsView({ profile, onProfileUpdate, onLogout }: SettingsViewProps) {
  const [editingProfile, setEditingProfile] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  function handleProfileComplete(p: UserProfile) {
    onProfileUpdate(p);
    setEditingProfile(false);
  }

  async function handleLogout() {
    clearLocalProfile();
    try {
      await signOut();
    } catch {
      /* Firebase サインアウト失敗はローカルクリアで十分 */
    }
    onLogout();
  }

  if (editingProfile) {
    return (
      <div style={{ padding: 'var(--sp-5)' }}>
        <button
          onClick={() => setEditingProfile(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--t2)',
            fontSize: 14,
            cursor: 'pointer',
            padding: '0 0 var(--sp-4)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          ← もどる
        </button>
        <ProfileSetup initial={profile} onComplete={handleProfileComplete} />
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      <Card>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>
          プロフィール
        </h2>
        <p style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 'var(--sp-4)', lineHeight: 1.7 }}>
          {profile.name} / {profile.sign}
        </p>
        <Button variant="secondary" fullWidth onClick={() => setEditingProfile(true)}>
          プロフィールを編集
        </Button>
      </Card>

      <Card>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>
          アカウント
        </h2>
        <p style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 'var(--sp-4)', lineHeight: 1.7 }}>
          ログアウトすると、プロフィール情報がリセットされます。夢のきろくは消えません。
        </p>

        {confirmingLogout ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            <p style={{ fontSize: 14, color: 'var(--t1)', fontWeight: 700, textAlign: 'center' }}>
              ログアウトしますか？
            </p>
            <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setConfirmingLogout(false)}
              >
                キャンセル
              </Button>
              <button
                onClick={handleLogout}
                style={{
                  flex: 1,
                  borderRadius: 'var(--r-button)',
                  padding: '14px 28px',
                  fontSize: 15,
                  fontWeight: 700,
                  fontFamily: 'var(--font-heading)',
                  cursor: 'pointer',
                  minHeight: 44,
                  background: 'rgba(232, 98, 124, 0.12)',
                  color: 'var(--rose)',
                  border: '1px solid var(--rose)',
                }}
              >
                ログアウト
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmingLogout(true)}
            style={{
              width: '100%',
              borderRadius: 'var(--r-button)',
              padding: '14px 28px',
              fontSize: 15,
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              cursor: 'pointer',
              minHeight: 44,
              background: 'rgba(232, 98, 124, 0.08)',
              color: 'var(--rose)',
              border: '1px solid rgba(232, 98, 124, 0.3)',
            }}
          >
            ログアウト
          </button>
        )}
      </Card>
    </div>
  );
}
