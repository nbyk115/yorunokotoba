/**
 * POST /api/webhooks/univapay
 *
 * UnivaPay からの subscription イベントを受信し、Firestore の
 * users/{userId}.subscription を更新する.
 *
 * セキュリティ:
 *   - 本番（VERCEL_ENV === 'production'）では ?mock=1 を完全無効化.
 *   - HMAC-SHA256 + timing-safe で署名検証.
 *   - idempotency は Firestore transaction で原子化（TOCTOU race 防止）.
 *
 * 想定イベント:
 *   - subscription.activated / payment.succeeded → 'active'
 *   - subscription.payment.failed → 'past_due'
 *   - subscription.canceled → 'canceled'
 *
 * 注意（G2 完了後に確定）:
 *   - HMAC signature ヘッダのプレフィックス・エンコーディング（hex / base64 / `sha256=` プレフィックス等）
 *   - event payload の実フィールド名（current_period_end / subscription_id 等）
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import {
  mapUnivapayEventToStatus,
  type UnivapayWebhookEvent,
} from '../_shared/types';
import { getAdminFirestore } from '../_shared/firebase-admin';
import { isProductionEnv } from '../_shared/auth-verify';

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

  // mock 経路は本番で完全無効化（任意 userId を Premium 化されないため）.
  const isMock = req.query.mock === '1' && !isProductionEnv();

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

  const status = mapUnivapayEventToStatus(event.event, event.data.status);
  const currentPeriodEnd = toTimestamp(event.data.current_period_end);

  // idempotency: event.id があれば transaction で「未処理かつ user 更新」を原子化.
  if (event.id) {
    const eventRef = db.collection('webhook_events').doc(event.id);
    const userRef = db.doc(`users/${userId}`);
    const subMapRef = db.collection('subscriptionsMap').doc(event.data.id);

    try {
      const result = await db.runTransaction(async (tx) => {
        const eventSnap = await tx.get(eventRef);
        if (eventSnap.exists) {
          return { deduplicated: true };
        }
        tx.set(eventRef, {
          provider: 'univapay',
          eventName: event.event,
          subscriptionId: event.data.id,
          userId,
          receivedAt: FieldValue.serverTimestamp(),
        });
        tx.set(
          userRef,
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
        // 監査用の subscriptionId → userId マップ
        tx.set(
          subMapRef,
          {
            userId,
            firstSeenAt: FieldValue.serverTimestamp(),
            lastEvent: event.event,
            lastStatus: status,
          },
          { merge: true },
        );
        return { deduplicated: false };
      });
      res.status(200).json({ received: true, ...result });
      return;
    } catch (err) {
      console.error('[univapay webhook] transaction_failed', err);
      res.status(500).json({ error: 'transaction_failed' });
      return;
    }
  }

  // event.id が無いペイロードは idempotency 不可だがベストエフォートで反映.
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

  res.status(200).json({ received: true, idempotency: 'best_effort' });
}

async function readRawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : (chunk as Buffer));
  }
  return Buffer.concat(chunks);
}

function verifyHmac(body: Buffer, signatureHex: string, secret: string): boolean {
  // UnivaPay 公式仕様未確定のためプレフィックス耐性のみ確保（hex 想定）.
  const cleaned = signatureHex.trim().toLowerCase().replace(/^sha256=/, '');
  const expected = createHmac('sha256', secret).update(body).digest('hex');
  const expectedBuf = Buffer.from(expected, 'utf8');
  const actualBuf = Buffer.from(cleaned, 'utf8');
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
