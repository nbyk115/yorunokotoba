/**
 * Firestore helpers  -  profile and archive persistence.
 * Falls back to localStorage for anonymous users.
 */

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import { getFirebaseApp } from './firebase';

export interface UserProfile {
  name: string;
  sign: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  gender: 'male' | 'female' | '';
  prefecture: string;
}

const PROFILE_KEY = 'ynk_profile';

let cachedDb: Firestore | null = null;
function db(): Firestore {
  if (!cachedDb) {
    cachedDb = getFirestore(getFirebaseApp());
  }
  return cachedDb;
}

export function loadLocalProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function saveLocalProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    /* ignore */
  }
}

export async function saveUserProfile(
  userId: string,
  profile: UserProfile,
): Promise<void> {
  saveLocalProfile(profile);
  try {
    await setDoc(
      doc(db(), 'users', userId),
      {
        ...profile,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch {
    /* ignore firestore errors; local copy is SSoT */
  }
}

export async function loadUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db(), 'users', userId));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch {
    /* fall through */
  }
  return loadLocalProfile();
}
