/**
 * App.tsx  -  Wave L1 リビルド
 * - ViewKey に premium を追加
 * - FtueOverlay 廃止
 * - 結果系画面（dream-result / fortune-result）を history.pushState に乗せ iOS スワイプバック対応
 */
import { useEffect, useState, useMemo, Component, type ReactNode } from 'react';
import { loadLocalProfile, type UserProfile } from '@/lib/firestore';
import { OnboardingView } from '@/features/profile/OnboardingView';
import { HomeView } from '@/features/home/HomeView';
import { DreamView } from '@/features/dream/DreamView';
import { FortuneView } from '@/features/fortune/FortuneView';
import { CompatibilityView } from '@/features/compatibility/CompatibilityView';
import { ArchiveView } from '@/features/archive/ArchiveView';
import { SettingsView } from '@/features/settings/SettingsView';
import { PremiumView } from '@/features/premium/PremiumView';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';
import { AppHeader } from '@/components/navigation/AppHeader';
import { TimeOfDayProvider } from '@/components/providers/TimeOfDayProvider';
import { tickStreak, type StreakState } from '@/logic/streak';
import { trackException, track } from '@/lib/analytics';
import { handleEmailLinkSignInOnLoad, useCurrentUser } from '@/lib/auth';

export type ViewKey =
  | 'home'
  | 'dream'
  | 'fortune'
  | 'compatibility'
  | 'archive'
  | 'settings'
  | 'premium';

/** URL から `?from=charaId` を読み取る */
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
    const params = new URLSearchParams(window.location.search);
    const premium = params.get('premium');
    if (premium === '1') {
      track('purchase', {
        transaction_id: `txn_${Date.now()}`,
        value: 980,
        currency: 'JPY',
        items: [
          {
            item_id: 'premium_monthly',
            item_name: 'よるのことば Premium 月額',
            price: 980,
            quantity: 1,
          },
        ],
      });
      const url = new URL(window.location.href);
      url.searchParams.delete('premium');
      window.history.replaceState({}, '', url.toString());
    }
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

  const tabViews: ViewKey[] = ['home', 'dream', 'fortune', 'archive'];
  const showTabBar = tabViews.includes(view);
  const showSettings = view === 'settings';

  if (!profile || fromCharaId) {
    return (
      <div className="app-root">
        <AppHeader subtitle="夢占い × 星座占い" />
        <ErrorBoundary>
          <OnboardingView onComplete={handleProfileComplete} />
        </ErrorBoundary>
      </div>
    );
  }

  return (
    <div className="app-root" style={{ paddingBottom: showTabBar ? 88 : 0 }}>
      {!showSettings && !tabViews.includes(view) ? null : null}
      {tabViews.includes(view) && (
        <AppHeader onSettingsClick={() => setView('settings')} />
      )}
      <ErrorBoundary>
        {view === 'home' && <HomeView profile={profile} streak={streak} onNavigate={setView} />}
        {view === 'dream' && <DreamView profile={profile} />}
        {view === 'fortune' && <FortuneView profile={profile} currentUserId={userId} />}
        {view === 'compatibility' && <CompatibilityView onBack={() => setView('home')} />}
        {view === 'archive' && <ArchiveView profile={profile} onNavigate={setView} />}
        {view === 'settings' && <SettingsView onBack={() => setView('home')} onPremium={() => setView('premium')} />}
        {view === 'premium' && <PremiumView onBack={() => setView('settings')} />}
      </ErrorBoundary>
      {showTabBar && <BottomTabBar current={view} onChange={setView} />}
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
            background: 'rgba(236,140,158,0.08)',
            borderRadius: 'var(--r-card)',
            margin: 20,
          }}
        >
          <p style={{ color: 'var(--rose)', fontWeight: 700, fontSize: 'var(--fs-body)' }}>
            ごめんね、表示でうまくいかなかったみたい
          </p>
          <p style={{ fontSize: 'var(--fs-micro)', color: 'var(--t3)', marginTop: 6, lineHeight: 1.6 }}>
            再読み込みすると直ることが多いよ。
          </p>
          <button
            type="button"
            onClick={() => location.reload()}
            style={{
              marginTop: 12,
              minHeight: 44,
              padding: '10px 20px',
              borderRadius: 'var(--r-input)',
              border: 'none',
              background: 'var(--rose)',
              color: 'var(--color-on-cta)',
              fontFamily: 'var(--font-heading)',
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
