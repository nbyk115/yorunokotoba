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
 * Checkout 起動: バックエンドに UnivaPay の checkout URL or token を作成依頼。
 *
 * TODO(univapay): 実 API 接続時は以下を確定する
 *   - UnivaPay の Checkout 方式: (a) 自社UI + token API / (b) Hosted Page
 *   - 推奨は (b) Hosted Page（PCI DSS 範囲縮小）
 *   - レスポンス: { checkoutUrl: string } を期待
 */
export async function startCheckout(params: {
  userId: string;
  plan: SubscriptionPlan;
}): Promise<{ checkoutUrl: string }> {
  const res = await fetch('/api/subscription/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(`checkout failed: ${res.status}`);
  }
  return (await res.json()) as { checkoutUrl: string };
}

/**
 * Subscription キャンセル要求.
 * TODO(univapay): UnivaPay 側のキャンセル API 呼び出し → Webhook で status='canceled'
 */
export async function cancelSubscription(userId: string): Promise<void> {
  const res = await fetch('/api/subscription/cancel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) {
    throw new Error(`cancel failed: ${res.status}`);
  }
}
