/**
 * Authentication — Google popup + Email link (passwordless).
 * Preserves compatibility with legacy `ynk_email_for_signin` localStorage key.
 */

import { useEffect, useState } from 'react';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  isSignInWithEmailLink,
  signOut as fbSignOut,
  onAuthStateChanged,
  type Auth,
  type User,
} from 'firebase/auth';
import { getFirebaseApp } from './firebase';

const EMAIL_KEY = 'ynk_email_for_signin';

let cachedAuth: Auth | null = null;

export function getAuthInstance(): Auth {
  if (!cachedAuth) {
    cachedAuth = getAuth(getFirebaseApp());
  }
  return cachedAuth;
}

export async function signInWithGoogle(): Promise<User> {
  const auth = getAuthInstance();
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function sendEmailLink(email: string): Promise<void> {
  const auth = getAuthInstance();
  const url = `${window.location.origin}/?emailSignIn=1`;
  await sendSignInLinkToEmail(auth, email, {
    url,
    handleCodeInApp: true,
  });
  try {
    localStorage.setItem(EMAIL_KEY, email);
  } catch {
    /* storage unavailable */
  }
}

/** Call on app startup; returns the signed-in user if this visit
 * was triggered by an email link, otherwise null. */
export async function handleEmailLinkSignInOnLoad(): Promise<User | null> {
  const auth = getAuthInstance();
  if (!isSignInWithEmailLink(auth, window.location.href)) {
    return null;
  }
  let email: string | null = null;
  try {
    email = localStorage.getItem(EMAIL_KEY);
  } catch {
    /* ignore */
  }
  if (!email) {
    email = window.prompt('サインインに使ったメールアドレスを入力してね') || null;
  }
  if (!email) return null;
  const result = await signInWithEmailLink(auth, email, window.location.href);
  try {
    localStorage.removeItem(EMAIL_KEY);
  } catch {
    /* ignore */
  }
  return result.user;
}

export function subscribeToAuthState(
  callback: (user: User | null) => void,
): () => void {
  return onAuthStateChanged(getAuthInstance(), callback);
}

export async function signOut(): Promise<void> {
  await fbSignOut(getAuthInstance());
}

/**
 * 現在ログイン中の Firebase Auth ユーザーを購読する React フック。
 * 未ログイン時は user=null / userId=null を返す（既存の guest 体験を維持）。
 */
export function useCurrentUser(): {
  user: User | null;
  userId: string | null;
  loading: boolean;
} {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsub = subscribeToAuthState((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { user, userId: user?.uid ?? null, loading };
}
