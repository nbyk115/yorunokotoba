/**
 * POST /api/subscription/checkout
 *
 * UnivaPay の Checkout URL（Hosted Page）を生成して返す。
 *
 * 実装フロー（TODO(univapay)）:
 *   1. process.env.UNIVAPAY_SECRET / UNIVAPAY_STORE_ID / UNIVAPAY_WEBHOOK_SECRET を読込
 *   2. UnivaPay の Subscription Token API を呼び出して checkout token を取得
 *      - POST https://api.univapay.com/stores/{store_id}/checkout
 *      - body: { amount: 480, currency: 'jpy', period: 'monthly', metadata: { userId } }
 *      - header: Authorization: Bearer {secret}
 *   3. レスポンスの redirect_url を返却
 *
 * 現状: スタブ実装。UNIVAPAY_SECRET 未設定なら mock checkout URL を返す。
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { CheckoutRequest, CheckoutResponse } from '../_shared/types';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const body = req.body as Partial<CheckoutRequest>;
  if (!body.userId || !body.plan) {
    res.status(400).json({ error: 'userId and plan are required' });
    return;
  }

  // TODO(univapay): 実 API 呼び出しに置換
  const secret = process.env.UNIVAPAY_SECRET;
  const storeId = process.env.UNIVAPAY_STORE_ID;
  if (!secret || !storeId) {
    const mock: CheckoutResponse = {
      checkoutUrl: `/api/subscription/mock-checkout?userId=${encodeURIComponent(
        body.userId,
      )}&plan=${encodeURIComponent(body.plan)}`,
    };
    res.status(200).json(mock);
    return;
  }

  // TODO(univapay): ここで UnivaPay Checkout API を呼ぶ
  // const r = await fetch(`https://api.univapay.com/stores/${storeId}/checkout`, {
  //   method: 'POST',
  //   headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ amount: 480, currency: 'jpy', period: 'monthly', metadata: { userId: body.userId } }),
  // });
  // const data = await r.json();
  // res.status(200).json({ checkoutUrl: data.redirect_url });

  res.status(501).json({ error: 'univapay_integration_pending' });
}
