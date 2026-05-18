import { useState, Component, type ReactNode } from 'react';
import { loadLocalProfile, type UserProfile } from '@/lib/firestore';
import { ProfileSetup } from '@/features/profile/ProfileSetup';
import { HomeView } from '@/features/home/HomeView';
import { DreamView } from '@/features/dream/DreamView';
import { FortuneView } from '@/features/fortune/FortuneView';
import { ArchiveView } from '@/features/archive/ArchiveView';
import { CompatibilityView } from '@/features/compatibility/CompatibilityView';
import { CompatibilityReceiverView } from '@/features/compatibility/CompatibilityReceiverView';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';
import { AppHeader } from '@/components/navigation/AppHeader';
import { FtueOverlay, shouldShowFtue } from '@/components/onboarding/FtueOverlay';
import { Particles } from '@/components/fx/Particles';
import { trackException } from '@/lib/analytics';

export type ViewKey = 'home' | 'dream' | 'fortune' | 'archive' | 'compatibility';

/**
 * 相性診断の共有リンク（?compat=<charaId>）から開かれた場合、
 * 送信者のキャラIDを返す。通常起動時は null。
 */
function readCompatLink(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('compat');
    return id && id.trim() ? id.trim() : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(() => loadLocalProfile());
  const [view, setView] = useState<ViewKey>('home');
  const [showFtue, setShowFtue] = useState<boolean>(() => shouldShowFtue());
  // 相性診断の共有リンクから開かれたか（送信者キャラID）
  const [compatLink, setCompatLink] = useState<string | null>(() => readCompatLink());

  function handleProfileComplete(p: UserProfile) {
    setProfile(p);
  }

  function exitCompatLink() {
    setCompatLink(null);
    setView('home');
    try {
      // URL から ?compat= を取り除き、通常画面に戻す
      window.history.replaceState(null, '', window.location.pathname);
    } catch {
      /* history API 非対応環境 */
    }
  }

  // 相性診断の共有リンクで開かれた場合は、プロフィール有無に関わらず
  // 受信側画面を最優先で表示する（無料機能・登録不要）。
  if (compatLink) {
    return (
      <div className="app-root" style={{ position: 'relative' }}>
        <Particles count={14} seed={17} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <AppHeader />
          <ErrorBoundary>
            <CompatibilityReceiverView fromCharaId={compatLink} onExit={exitCompatLink} />
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
      <Particles count={14} seed={17} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <AppHeader />
        <ErrorBoundary>
          {view === 'home' && <HomeView profile={profile} onNavigate={setView} />}
          {view === 'dream' && <DreamView profile={profile} />}
          {view === 'fortune' && <FortuneView profile={profile} />}
          {view === 'archive' && <ArchiveView />}
          {view === 'compatibility' && (
            <CompatibilityView profile={profile} onNavigate={setView} />
          )}
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
