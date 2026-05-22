import { useState, useEffect, useRef, Component, type ReactNode } from 'react';
import { loadLocalProfile, type UserProfile } from '@/lib/firestore';
import { ProfileSetup } from '@/features/profile/ProfileSetup';
import { HomeView } from '@/features/home/HomeView';
import { DreamView } from '@/features/dream/DreamView';
import { MidnightView } from '@/features/midnight/MidnightView';
import { FortuneView } from '@/features/fortune/FortuneView';
import { CompatibilityView } from '@/features/compatibility/CompatibilityView';
import { CompatibilityReceiverView } from '@/features/compatibility/CompatibilityReceiverView';
import { SettingsView } from '@/features/settings/SettingsView';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';
import { AppHeader } from '@/components/navigation/AppHeader';
import { FtueOverlay, shouldShowFtue } from '@/components/onboarding/FtueOverlay';
import { Particles } from '@/components/fx/Particles';
import { trackException } from '@/lib/analytics';

export type ViewKey = 'home' | 'dream' | 'midnight' | 'fortune' | 'compatibility' | 'settings';

/**
 * History state の型。
 * view: アプリ内のタブ/画面
 * subStage: View 内部のサブステージ（'result'/'edit' 等）。未指定は root ステージ
 */
export interface AppHistoryState {
  _ynk: true;
  view: ViewKey;
  subStage?: string;
}

/**
 * アプリ管理の pushState ヘルパー。
 * try/catch で history API 非対応環境を吸収する。
 */
export function pushAppState(view: ViewKey, subStage?: string): void {
  try {
    const state: AppHistoryState = { _ynk: true, view, ...(subStage ? { subStage } : {}) };
    window.history.pushState(state, '');
  } catch {
    /* history API 非対応環境は無視 */
  }
}

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

  // 各 View から登録される「サブステージを1段戻す」コールバック（null = 登録なし）
  const subStageBackRef = useRef<(() => void) | null>(null);

  // popstate（ブラウザ戻る / iOS エッジスワイプ）ハンドラ
  useEffect(() => {
    function handlePopState(e: PopStateEvent) {
      const state = e.state as AppHistoryState | null;

      // アプリ外の履歴（state が _ynk を持たない）はそのまま離脱
      if (!state || !state._ynk) return;

      // サブステージがある場合 → View 内部の「1段戻る」コールバックを呼ぶ
      if (state.subStage && subStageBackRef.current) {
        subStageBackRef.current();
        return;
      }

      // タブ遷移の戻り: state の view に戻す
      // compat-receiver モードの場合は無視（exitCompatLink が担う）
      if (state.view && !compatLink) {
        setView(state.view);
      }
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [compatLink]);

  // 初期ロード時のベースエントリを replaceState で設定（戻るの起点）
  useEffect(() => {
    try {
      const currentState = window.history.state as AppHistoryState | null;
      if (!currentState || !currentState._ynk) {
        window.history.replaceState({ _ynk: true, view: 'home' } satisfies AppHistoryState, '');
      }
    } catch {
      /* history API 非対応環境 */
    }
  }, []);

  /**
   * タブ切り替え: setView + pushState。
   * ホームへの遷移はスタックを積まない（ホームが常にベース）。
   */
  function navigateTo(nextView: ViewKey) {
    // サブステージ戻りコールバックをリセット（タブ切り替えでサブステージは破棄）
    subStageBackRef.current = null;
    setView(nextView);
    if (nextView !== 'home') {
      pushAppState(nextView);
    } else {
      try {
        window.history.replaceState({ _ynk: true, view: 'home' } satisfies AppHistoryState, '');
      } catch {
        /* history API 非対応環境 */
      }
    }
  }

  function handleProfileComplete(p: UserProfile) {
    setProfile(p);
  }

  function exitCompatLink() {
    setCompatLink(null);
    setView('home');
    try {
      // URL から ?compat= を取り除き、通常画面に戻す
      window.history.replaceState({ _ynk: true, view: 'home' } satisfies AppHistoryState, '', window.location.pathname);
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
        <AppHeader onSettingsClick={() => navigateTo('settings')} />
        <ErrorBoundary>
          {view === 'home' && <HomeView profile={profile} onNavigate={navigateTo} />}
          {view === 'dream' && (
            <DreamView
              profile={profile}
              onNavigate={navigateTo}
              onRegisterHistoryBack={(cb) => { subStageBackRef.current = cb ?? null; }}
            />
          )}
          {view === 'midnight' && (
            <MidnightView
              profile={profile}
              onNavigate={navigateTo}
              onRegisterHistoryBack={(cb) => { subStageBackRef.current = cb ?? null; }}
            />
          )}
          {view === 'fortune' && <FortuneView profile={profile} onNavigate={navigateTo} />}
          {view === 'compatibility' && (
            <CompatibilityView
              profile={profile}
              onNavigate={navigateTo}
              onRegisterHistoryBack={(cb) => { subStageBackRef.current = cb ?? null; }}
            />
          )}
          {view === 'settings' && (
            <SettingsView
              profile={profile}
              onProfileUpdate={(p) => { setProfile(p); navigateTo('home'); }}
              onLogout={() => { setProfile(null); navigateTo('home'); }}
              onRegisterHistoryBack={(cb) => { subStageBackRef.current = cb ?? null; }}
            />
          )}
        </ErrorBoundary>
      </div>
      {view !== 'settings' && <BottomTabBar current={view} onChange={navigateTo} />}
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
