import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

/**
 * Self-contained "add to home screen" CTA.
 *
 * - Android / Chrome: captures the `beforeinstallprompt` event and triggers the
 *   native install dialog on tap.
 * - iOS / Safari: programmatic install is impossible, so it shows the manual
 *   "share button -> add to home screen" instructions instead.
 * - Hidden entirely when the app is already running standalone (installed).
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari exposes navigator.standalone.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  const ua = window.navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream;
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const ios = isIOS();

  useEffect(() => {
    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setInstalled(true);
      setDeferred(null);
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  // Already installed / running standalone: render nothing.
  if (isStandalone() || installed) return null;

  // Android: only show once we actually have a deferred prompt to fire.
  // iOS: always show (no event exists), guiding the manual flow.
  if (!ios && !deferred) return null;

  async function handleInstall() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }

  return (
    <Card className="slide-up" style={{ background: 'var(--bg1)' }}>
      <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--rose)', marginBottom: 8 }}>
        📲 ホーム画面に追加
      </h4>
      <p style={{ fontSize: 13, lineHeight: 1.9, color: 'var(--t2)', marginBottom: 'var(--sp-4)' }}>
        アプリとしてホーム画面に追加すると、毎晩の夢をすぐ占えるよ。
      </p>

      {ios ? (
        <>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setShowIOSGuide((v) => !v)}
          >
            ホーム画面への追加方法を見る
          </Button>
          {showIOSGuide && (
            <ol
              style={{
                marginTop: 'var(--sp-4)',
                paddingLeft: 20,
                fontSize: 13,
                lineHeight: 2,
                color: 'var(--t1)',
              }}
            >
              <li>画面下の共有ボタン（□に↑のマーク）を押す</li>
              <li>メニューから「ホーム画面に追加」を選ぶ</li>
              <li>右上の「追加」を押す</li>
            </ol>
          )}
        </>
      ) : (
        <Button fullWidth onClick={handleInstall}>
          ホーム画面に追加する
        </Button>
      )}
    </Card>
  );
}
