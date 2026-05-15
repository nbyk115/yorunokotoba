import { useEffect, useState, useMemo, Component, type ReactNode } from 'react';
import { loadLocalProfile, type UserProfile } from '@/lib/firestore';
import { ProfileSetup } from '@/features/profile/ProfileSetup';
import { HomeView } from '@/features/home/HomeView';
import { DreamView } from '@/features/dream/DreamView';
import { FortuneView } from '@/features/fortune/FortuneView';
import { ArchiveView } from '@/features/archive/ArchiveView';
import { AuraView } from '@/features/aura/AuraView';
import { AuraReceiverView } from '@/features/aura/AuraReceiverView';
import { SettingsView } from '@/features/settings/SettingsView';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';
import { AppHeader } from '@/components/navigation/AppHeader';
import { FtueOverlay, shouldShowFtue } from '@/components/onboarding/FtueOverlay';
import { TimeOfDayProvider } from '@/components/providers/TimeOfDayProvider';
import { tickStreak, type StreakState } from '@/logic/streak';
import { trackException, track } from '@/lib/analytics';
import { handleEmailLinkSignInOnLoad, useCurrentUser } from '@/lib/auth';

export type ViewKey = 'home' | 'dream' | 'fortune' | 'archive' | 'aura' | 'settings';

/** URL から `?from=charaId` を読み取る。受信者ページ（リンク経由）の判定に使う。 */
function getFromCharaIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('from');
}

export default function App() {
  return (
    <TimeOfDayProvider>
      <AppInner />
    </TimeOfDayProvider>
  );
}

function AppInner() {
  const fromCharaId = useMemo(() => getFromCharaIdFromUrl(), []);
  const [profile, setProfile] = useState<UserProfile | null>(() => loadLocalProfile());
  const [view, setView] = useState<ViewKey>('home');
  const [showFtue, setShowFtue] = useState<boolean>(() => shouldShowFtue());
  const [streak, setStreak] = useState<StreakState>(() => ({ count: 0, lastDay: '' }));
  const { userId } = useCurrentUser();

  useEffect(() => {
    handleEmailLinkSignInOnLoad()
      .then((user) => {
        if (user) {
          track('auth_email_link_complete', { uid: user.uid });
          const url = new URL(window.location.href);
          url.searchParams.delete('emailSignIn');
          url.searchParams.delete('apiKey');
          url.searchParams.delete('mode');
          url.searchParams.delete('oobCode');
          url.searchParams.delete('continueUrl');
          url.searchParams.delete('lang');
          window.history.replaceState({}, '', url.toString());
        }
      })
      .catch((err) => trackException(`auth_email_link_error: ${String(err)}`, false));
  }, []);

  useEffect(() => {
    if (profile) {
      const s = tickStreak();
      setStreak(s);
      track('streak_update', { count: s.count });
      if (s.count === 3 || s.count === 7 || s.count === 14 || s.count === 30) {
        track('streak_milestone', { count: s.count });
      }
    }
  }, [profile]);

  function handleProfileComplete(p: UserProfile) {
    setProfile(p);
  }

  // リンク経由の受信者ページ: ?from= があり、未登録ユーザーなら専用UIを出す
  if (fromCharaId && !profile) {
    return (
      <div className="app-root" style={{ paddingBottom: 0, position: 'relative' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <AppHeader />
          <ErrorBoundary>
            <AuraReceiverView fromCharaId={fromCharaId} />
          </ErrorBoundary>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="app-root">
        <AppHeader subtitle="夢占い × 星座占い" />
        <ProfileSetup initial={null} onComplete={handleProfileComplete} />
      </div>
    );
  }

  return (
    <div className="app-root" style={{ paddingBottom: 88, position: 'relative' }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <AppHeader onSettingsClick={() => setView('settings')} />
        <ErrorBoundary>
          {view === 'home' && <HomeView profile={profile} streak={streak} onNavigate={setView} />}
          {view === 'dream' && <DreamView profile={profile} />}
          {view === 'fortune' && <FortuneView profile={profile} currentUserId={userId} />}
          {view === 'archive' && <ArchiveView profile={profile} onNavigate={setView} />}
          {view === 'aura' && <AuraView profile={profile} onNavigate={setView} />}
          {view === 'settings' && <SettingsView onBack={() => setView('home')} />}
        </ErrorBoundary>
      </div>
      {view !== 'settings' && <BottomTabBar current={view} onChange={setView} />}
      {showFtue && <FtueOverlay onComplete={() => setShowFtue(false)} />}
    </div>
  );
}

interface EBState {
  err: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  state: EBState = { err: null };

  static getDerivedStateFromError(err: Error): EBState {
    return { err };
  }

  componentDidCatch(err: Error) {
    trackException(err.message, true);
  }

  render() {
    if (this.state.err) {
      return (
        <div
          style={{
            padding: 20,
            background: 'rgba(232, 98, 124, 0.08)',
            borderRadius: 12,
            margin: 20,
          }}
        >
          <p style={{ color: 'var(--rose)', fontWeight: 700, fontSize: 14 }}>
            ごめんね、表示でうまくいかなかったみたい
          </p>
          <p style={{ fontSize: 11, color: 'var(--t3)', marginTop: 6, lineHeight: 1.6 }}>
            再読み込みすると直ることが多いよ。
          </p>
          <button
            type="button"
            onClick={() => location.reload()}
            style={{
              marginTop: 12,
              minHeight: 44,
              padding: '10px 20px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--rose)',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            再読み込み
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
