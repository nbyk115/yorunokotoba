import { useState, Component, type ReactNode } from 'react';
import { loadLocalProfile, type UserProfile } from '@/lib/firestore';
import { ProfileSetup } from '@/features/profile/ProfileSetup';
import { HomeView } from '@/features/home/HomeView';
import { DreamView } from '@/features/dream/DreamView';
import { FortuneView } from '@/features/fortune/FortuneView';
import { ArchiveView } from '@/features/archive/ArchiveView';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';
import { AppHeader } from '@/components/navigation/AppHeader';
import { FtueOverlay, shouldShowFtue } from '@/components/onboarding/FtueOverlay';
import { Particles } from '@/components/fx/Particles';
import { trackException } from '@/lib/analytics';

export type ViewKey = 'home' | 'dream' | 'fortune' | 'archive';

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(() => loadLocalProfile());
  const [view, setView] = useState<ViewKey>('home');
  const [showFtue, setShowFtue] = useState<boolean>(() => shouldShowFtue());

  function handleProfileComplete(p: UserProfile) {
    setProfile(p);
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
      <Particles count={14} seed={17} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <AppHeader />
        <ErrorBoundary>
          {view === 'home' && <HomeView profile={profile} onNavigate={setView} />}
          {view === 'dream' && <DreamView profile={profile} />}
          {view === 'fortune' && <FortuneView profile={profile} />}
          {view === 'archive' && <ArchiveView />}
        </ErrorBoundary>
      </div>
      <BottomTabBar current={view} onChange={setView} />
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
          <pre
            style={{
              fontSize: 10,
              color: 'var(--t3)',
              marginTop: 8,
              whiteSpace: 'pre-wrap',
            }}
          >
            {this.state.err.message}
          </pre>
          <button
            onClick={() => location.reload()}
            style={{
              marginTop: 12,
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
