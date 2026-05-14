/**
 * POST /api/webhooks/univapay
 *
 * UnivaPay からの subscription イベントを受信し、Firestore の
 * users/{userId}.subscription を更新する。
 *
 * 処理フロー:
 *   1. Raw body を読み込む（HMAC 検証のため bodyParser: false）
 *   2. X-Univapay-Signature を HMAC-SHA256(secret, rawBody) で timing-safe 比較
 *   3. JSON パース → event.id で idempotency check（Firestore webhook_events/{event_id}）
 *   4. mapUnivapayEventToStatus で内部 status に変換
 *   5. users/{userId}.subscription を Firestore に書込（merge）
 *
 * 想定イベント:
 *   - subscription.activated / payment.succeeded → 'active'
 *   - subscription.payment.failed → 'past_due'
 *   - subscription.canceled → 'canceled'
 *
 * ?mock=1: 開発用 mock-checkout からの呼び出し。署名検証スキップ、
 *          metadata は query string から復元。
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import {
  mapUnivapayEventToStatus,
  type UnivapayWebhookEvent,
  type SubscriptionStatus,
} from '../_shared/types';
import { getAdminFirestore } from '../_shared/firebase-admin';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const isMock = req.query.mock === '1';
  const rawBody = await readRawBody(req);

  if (!isMock) {
    const webhookSecret = process.env.UNIVAPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[univapay webhook] UNIVAPAY_WEBHOOK_SECRET not set');
      res.status(503).json({ error: 'webhook_not_configured' });
      return;
    }
    const signatureHeader = req.headers['x-univapay-signature'];
    if (typeof signatureHeader !== 'string') {
      res.status(401).json({ error: 'signature_required' });
      return;
    }
    if (!verifyHmac(rawBody, signatureHeader, webhookSecret)) {
      res.status(401).json({ error: 'signature_invalid' });
      return;
    }
  }

  let event: UnivapayWebhookEvent;
  try {
    event = parseEvent(rawBody, isMock, req);
  } catch (err) {
    res.status(400).json({ error: 'invalid_event', detail: String(err) });
    return;
  }

  const userId = event.data.metadata?.userId;
  if (!userId) {
    res.status(400).json({ error: 'userId_missing_in_metadata' });
    return;
  }

  let db;
  try {
    db = getAdminFirestore();
  } catch (err) {
    console.error('[univapay webhook] firebase_admin_init_failed', err);
    res.status(503).json({ error: 'firebase_admin_not_configured' });
    return;
  }

  // idempotency: event.id があれば webhook_events/{event_id} で重複処理を防ぐ
  if (event.id) {
    const ref = db.collection('webhook_events').doc(event.id);
    const snap = await ref.get();
    if (snap.exists) {
      res.status(200).json({ received: true, deduplicated: true });
      return;
    }
    await ref.set({
      provider: 'univapay',
      eventName: event.event,
      receivedAt: FieldValue.serverTimestamp(),
    });
  }

  const status = mapUnivapayEventToStatus(event.event, event.data.status);
  const currentPeriodEnd = toTimestamp(event.data.current_period_end);

  await db.doc(`users/${userId}`).set(
    {
      subscription: {
        status,
        plan: status === 'none' ? null : 'premium_monthly',
        currentPeriodEnd,
        univapaySubscriptionId: event.data.id,
        updatedAt: FieldValue.serverTimestamp(),
      },
    },
    { merge: true },
  );

  res.status(200).json({ received: true });
}

async function readRawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : (chunk as Buffer));
  }
  return Buffer.concat(chunks);
}

function verifyHmac(body: Buffer, signatureHex: string, secret: string): boolean {
  const expected = createHmac('sha256', secret).update(body).digest('hex');
  const expectedBuf = Buffer.from(expected, 'utf8');
  const actualBuf = Buffer.from(signatureHex.trim().toLowerCase(), 'utf8');
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}

function parseEvent(
  rawBody: Buffer,
  isMock: boolean,
  req: VercelRequest,
): UnivapayWebhookEvent {
  if (isMock) {
    const userId = (req.query.userId as string) ?? '';
    const eventName = (req.query.event as string) ?? 'subscription.activated';
    const subId = (req.query.subscriptionId as string) ?? `mock_${Date.now()}`;
    const periodEnd =
      (req.query.currentPeriodEnd as string) ??
      new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString();
    return {
      id: `mock_${Date.now()}`,
      event: eventName,
      data: {
        id: subId,
        status: 'active',
        metadata: { userId },
        current_period_end: periodEnd,
      },
    };
  }

  const parsed = JSON.parse(rawBody.toString('utf8')) as Partial<UnivapayWebhookEvent>;
  if (!parsed.event || !parsed.data) {
    throw new Error('event or data missing');
  }
  return parsed as UnivapayWebhookEvent;
}

function toTimestamp(iso: string | undefined): Timestamp | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return Timestamp.fromDate(date);
}

// 型整合のため import を一箇所に
export type { SubscriptionStatus };
