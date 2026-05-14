/**
 * Subscription state — UnivaPay scaffold (実装スタブ).
 *
 * このモジュールは UnivaPay 定期課金 API との連携を想定した雛形。
 * 実 API 接続前のスペック検証用。実装すべき箇所は TODO(univapay) でマーク。
 *
 * Data shape: users/{uid}.subscription
 *   status: 'none' | 'active' | 'past_due' | 'canceled'
 *   plan:   'premium_monthly'
 *   currentPeriodEnd: Firestore Timestamp（active な期間の末日）
 *   univapaySubscriptionId: UnivaPay 側の subscription ID
 *
 * Premium 判定: status === 'active' AND currentPeriodEnd > now
 */

import { useEffect, useState } from 'react';
import {
  doc,
  getDoc,
  onSnapshot,
  type Firestore,
  type Timestamp,
} from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { getFirebaseApp } from './firebase';
import { getCurrentIdToken } from './auth';

export type SubscriptionStatus = 'none' | 'active' | 'past_due' | 'canceled';
export type SubscriptionPlan = 'premium_monthly';

export interface Subscription {
  status: SubscriptionStatus;
  plan: SubscriptionPlan | null;
  currentPeriodEnd: Timestamp | null;
  univapaySubscriptionId: string | null;
}

export const FREE_SUBSCRIPTION: Subscription = {
  status: 'none',
  plan: null,
  currentPeriodEnd: null,
  univapaySubscriptionId: null,
};

let cachedDb: Firestore | null = null;
function db(): Firestore {
  if (!cachedDb) {
    cachedDb = getFirestore(getFirebaseApp());
  }
  return cachedDb;
}

export function isPremiumActive(sub: Subscription | null): boolean {
  if (!sub || sub.status !== 'active') return false;
  if (!sub.currentPeriodEnd) return false;
  return sub.currentPeriodEnd.toMillis() > Date.now();
}

export async function loadSubscription(
  userId: string,
): Promise<Subscription> {
  try {
    const snap = await getDoc(doc(db(), 'users', userId));
    if (!snap.exists()) return FREE_SUBSCRIPTION;
    const data = snap.data() as { subscription?: Subscription };
    return data.subscription ?? FREE_SUBSCRIPTION;
  } catch {
    return FREE_SUBSCRIPTION;
  }
}

/**
 * Firestore の users/{uid}.subscription をリアルタイム購読。
 * Webhook で更新された subscription を即座に画面に反映するため。
 */
export function useSubscription(userId: string | null): {
  subscription: Subscription;
  isPremium: boolean;
  loading: boolean;
} {
  const [subscription, setSubscription] =
    useState<Subscription>(FREE_SUBSCRIPTION);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userId) {
      setSubscription(FREE_SUBSCRIPTION);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = onSnapshot(
      doc(db(), 'users', userId),
      (snap) => {
        if (!snap.exists()) {
          setSubscription(FREE_SUBSCRIPTION);
        } else {
          const data = snap.data() as { subscription?: Subscription };
          setSubscription(data.subscription ?? FREE_SUBSCRIPTION);
        }
        setLoading(false);
      },
      () => {
        setSubscription(FREE_SUBSCRIPTION);
        setLoading(false);
      },
    );
    return unsub;
  }, [userId]);

  return {
    subscription,
    isPremium: isPremiumActive(subscription),
    loading,
  };
}

/**
 * Checkout 起動. Firebase Auth ID Token を Authorization で送る.
 * バックエンドは token の uid を権威ある識別子として使用（body.userId は信用しない）.
 */
export async function startCheckout(params: {
  plan: SubscriptionPlan;
}): Promise<{ checkoutUrl: string }> {
  const token = await getCurrentIdToken();
  if (!token) {
    throw new Error('not_signed_in');
  }
  const res = await fetch('/api/subscription/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(`checkout failed: ${res.status}`);
  }
  return (await res.json()) as { checkoutUrl: string };
}

/**
 * Subscription キャンセル要求. ID Token から uid を取得するため body は空でよい.
 */
export async function cancelSubscription(): Promise<void> {
  const token = await getCurrentIdToken();
  if (!token) {
    throw new Error('not_signed_in');
  }
  const res = await fetch('/api/subscription/cancel', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error(`cancel failed: ${res.status}`);
  }
}
