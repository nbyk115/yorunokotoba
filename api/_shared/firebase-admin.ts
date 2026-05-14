/**
 * Firebase Admin SDK initialization helper (server-side, Vercel API Routes).
 *
 * env: FIREBASE_SERVICE_ACCOUNT_JSON (base64-encoded service account JSON)
 *
 * 呼び出し側は getAdminApp() / getAdminFirestore() を使う。
 * env 未設定の場合は throw して上位で 503 に丸める。
 */

import {
  initializeApp,
  cert,
  getApps,
  type App,
  type ServiceAccount,
} from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let cachedApp: App | null = null;

export function getAdminApp(): App {
  if (cachedApp) return cachedApp;
  const existing = getApps()[0];
  if (existing) {
    cachedApp = existing;
    return cachedApp;
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON env is not set');
  }

  const decoded = decodeServiceAccount(raw);
  cachedApp = initializeApp({
    credential: cert(decoded),
  });
  return cachedApp;
}

export function getAdminFirestore(): Firestore {
  return getFirestore(getAdminApp());
}

function decodeServiceAccount(raw: string): ServiceAccount {
  let text = raw.trim();
  if (!text.startsWith('{')) {
    try {
      text = Buffer.from(text, 'base64').toString('utf8');
    } catch {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON: base64 decode failed');
    }
  }
  try {
    return JSON.parse(text) as ServiceAccount;
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON: invalid JSON');
  }
}
