/**
 * POST /api/webhooks/univapay
 *
 * UnivaPay からの subscription イベントを受信し、Firestore の
 * users/{userId}.subscription を更新する。
 *
 * 実装フロー（TODO(univapay)）:
 *   1. UnivaPay の webhook 署名検証（HMAC-SHA256）
 *      - header: X-Univapay-Signature
 *      - secret: process.env.UNIVAPAY_WEBHOOK_SECRET
 *   2. event 種別ごとに status を判定
 *   3. firebase-admin で users/{userId}.subscription を更新
 *
 * 想定イベント:
 *   - subscription.activated → status: 'active'
 *   - subscription.payment.failed → status: 'past_due'
 *   - subscription.canceled → status: 'canceled'
 *
 * 現状: スタブ実装。?mock=1 で署名検証スキップ、Firestore 更新もログのみ。
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { UnivapayWebhookEvent } from '../_shared/types';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const isMock = req.query.mock === '1';

  // TODO(univapay): 本番では署名検証必須
  if (!isMock) {
    const signature = req.headers['x-univapay-signature'];
    const webhookSecret = process.env.UNIVAPAY_WEBHOOK_SECRET;
    if (!signature || !webhookSecret) {
      res.status(401).json({ error: 'signature_required' });
      return;
    }
    // TODO(univapay): HMAC-SHA256 で req.body を検証
  }

  const event = req.body as Partial<UnivapayWebhookEvent>;
  if (!event?.event || !event.data) {
    res.status(400).json({ error: 'invalid_event' });
    return;
  }

  const userId = event.data.metadata?.userId;
  if (!userId) {
    res.status(400).json({ error: 'userId_missing_in_metadata' });
    return;
  }

  // TODO(univapay): firebase-admin で Firestore 更新
  // import { initializeApp, cert } from 'firebase-admin/app';
  // import { getFirestore, Timestamp } from 'firebase-admin/firestore';
  // const app = getOrInitAdminApp();
  // await getFirestore(app).doc(`users/${userId}`).set({
  //   subscription: {
  //     status: mapStatus(event.event, event.data.status),
  //     plan: 'premium_monthly',
  //     currentPeriodEnd: event.data.current_period_end
  //       ? Timestamp.fromDate(new Date(event.data.current_period_end))
  //       : null,
  //     univapaySubscriptionId: event.data.id,
  //   },
  // }, { merge: true });

  console.log('[univapay webhook]', {
    event: event.event,
    userId,
    subscriptionId: event.data.id,
    status: event.data.status,
    mock: isMock,
  });

  res.status(200).json({ received: true, mock: isMock });
}
