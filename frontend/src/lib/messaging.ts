/**
 * Push notification registration.
 * Legacy SW file `/firebase-messaging-sw.js` is preserved for compatibility.
 */

import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { getFirebaseApp, VAPID_KEY } from './firebase';

const TOKEN_KEY = 'ynk_push_token';

export async function registerPushNotifications(): Promise<string | null> {
  try {
    if (!(await isSupported())) return null;
    if (!('serviceWorker' in navigator)) return null;

    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js',
      { scope: '/' },
    );

    const messaging = getMessaging(getFirebaseApp());
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      try {
        localStorage.setItem(TOKEN_KEY, token);
      } catch {
        /* ignore */
      }
      return token;
    }
    return null;
  } catch {
    return null;
  }
}
