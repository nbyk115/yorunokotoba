/**
 * Firebase initialization.
 *
 * CRITICAL: Config values below are imported from the production project
 * yorunokotoba-5df51. DO NOT change — it would invalidate existing user
 * accounts, Firestore data, and push notification tokens.
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyAMSAW3ez0Hir2Guv4ibbuxUgzRTuS14PI',
  authDomain: 'yorunokotoba-5df51.firebaseapp.com',
  projectId: 'yorunokotoba-5df51',
  storageBucket: 'yorunokotoba-5df51.firebasestorage.app',
  messagingSenderId: '133287391957',
  appId: '1:133287391957:web:aafda69540c7359ba1a85c',
};

let app: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

/** VAPID key for FCM web push. DO NOT change. */
export const VAPID_KEY =
  'BMaXF44Ya4nZg-zfpfHKp6wr2gPRBlf3nkoCJ9z3CQxWmOGyOZFxLoSHYNCYrtHi0R0_mxW7u-mjTq5HpEaqDcw';
