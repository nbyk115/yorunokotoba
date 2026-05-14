/**
 * POST /api/subscription/cancel
 *
 * UnivaPay の subscription を即時キャンセル要求。
 *
 * 処理フロー:
 *   1. body.userId 必須
 *   2. Firestore から users/{userId}.subscription.univapaySubscriptionId を取得
 *   3. UnivaPay の cancel API を呼ぶ
 *   4. 実際の status='canceled' 反映は webhook (subscription.canceled) 経由
 *
 * env 未設定 → 503（mock 動作は webhook 側で完結するため不要）.
 *
 * 注意: 本エンドポイントは認証された userId のみが自分の subscription を
 * キャンセルできるよう、Firebase Auth ID Token 検証を G2 完了後に追加する.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { CancelRequest } from '../_shared/types';
import { getAdminFirestore } from '../_shared/firebase-admin';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const body = req.body as Partial<CancelRequest>;
  if (!body.userId) {
    res.status(400).json({ error: 'userId is required' });
    return;
  }

  const secret = process.env.UNIVAPAY_SECRET;
  const storeId = process.env.UNIVAPAY_STORE_ID;
  const apiBase = process.env.UNIVAPAY_API_BASE ?? 'https://api.univapay.com';

  if (!secret || !storeId) {
    res.status(503).json({ error: 'univapay_not_configured' });
    return;
  }

  let db;
  try {
    db = getAdminFirestore();
  } catch (err) {
    console.error('[subscription cancel] firebase_admin_init_failed', err);
    res.status(503).json({ error: 'firebase_admin_not_configured' });
    return;
  }

  const snap = await db.doc(`users/${body.userId}`).get();
  if (!snap.exists) {
    res.status(404).json({ error: 'user_not_found' });
    return;
  }
  const data = snap.data() as
    | { subscription?: { univapaySubscriptionId?: string } }
    | undefined;
  const subId = data?.subscription?.univapaySubscriptionId;
  if (!subId) {
    res.status(404).json({ error: 'subscription_not_found' });
    return;
  }

  try {
    const upstream = await fetch(
      `${apiBase}/stores/${storeId}/subscriptions/${subId}/cancel`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secret}`,
          'Content-Type': 'application/json',
        },
      },
    );
    if (!upstream.ok) {
      const text = await upstream.text().catch(() => '');
      console.error('[subscription cancel] upstream_error', {
        status: upstream.status,
        body: text.slice(0, 500),
      });
      res.status(502).json({ error: 'univapay_upstream_error' });
      return;
    }
    res.status(200).json({ ok: true, message: 'cancel_requested' });
  } catch (err) {
    console.error('[subscription cancel] exception', err);
    res.status(502).json({ error: 'univapay_request_failed' });
  }
}
