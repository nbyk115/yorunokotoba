/**
 * POST /api/subscription/cancel
 *
 * UnivaPay の subscription を即時キャンセル要求.
 *
 * 認可: Authorization: Bearer <Firebase ID Token> 必須.
 * 取り消す subscription は token の uid に紐付くもののみ.
 * body の userId は信用せず、token から取得した uid を使う（IDOR 防止）.
 *
 * 処理フロー:
 *   1. ID Token 検証 → uid
 *   2. Firestore users/{uid}.subscription.univapaySubscriptionId を取得
 *   3. UnivaPay /stores/{id}/subscriptions/{sub_id}/cancel を呼ぶ
 *   4. 実 status='canceled' 反映は webhook (subscription.canceled) 経由
 *
 * env 未設定 → 503.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminFirestore } from '../_shared/firebase-admin';
import { verifyAuthUid } from '../_shared/auth-verify';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const uid = await verifyAuthUid(req);
  if (!uid) {
    res.status(401).json({ error: 'unauthorized' });
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

  const snap = await db.doc(`users/${uid}`).get();
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
