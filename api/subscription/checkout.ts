/**
 * POST /api/subscription/checkout
 *
 * UnivaPay Hosted Page の URL を生成して返す。
 *
 * 実装フロー:
 *   1. env 検証: UNIVAPAY_SECRET, UNIVAPAY_STORE_ID
 *   2. UnivaPay の Subscription Checkout API を呼び出して redirect URL を取得
 *   3. レスポンス { checkoutUrl } を返却
 *
 * env 未設定 → mock-checkout に fallback（開発フロー継続）.
 * UnivaPay API 失敗 → 502 を返却（client は error 表示）.
 *
 * 価格: PREMIUM_PRICE_JPY（¥980）— SSOT: docs/strategy/pricing-decision.md
 *
 * 注意（G2 完了後に確定）:
 *   - エンドポイント・パラメータ名は UnivaPay 公式 docs に従って微調整する
 *   - 現状は標準的な REST + Bearer auth + JSON body を仮定
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  PREMIUM_PRICE_JPY,
  type CheckoutRequest,
  type CheckoutResponse,
} from '../_shared/types';
import { isProductionEnv, verifyAuthUid } from '../_shared/auth-verify';

interface UnivapayCheckoutCreateResponse {
  redirect_url?: string;
  url?: string;
}

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

  const body = req.body as Partial<CheckoutRequest>;
  if (!body.plan) {
    res.status(400).json({ error: 'plan is required' });
    return;
  }
  // body.userId は信用しない（IDOR防止）。常に token の uid を使う.

  const secret = process.env.UNIVAPAY_SECRET;
  const storeId = process.env.UNIVAPAY_STORE_ID;
  const apiBase = process.env.UNIVAPAY_API_BASE ?? 'https://api.univapay.com';

  if (!secret || !storeId) {
    // 本番で env 未設定 = 設定漏れ事故. mock fallback すると課金 0 円で本番運用される.
    if (isProductionEnv()) {
      console.error('[checkout] UnivaPay env missing in production');
      res.status(503).json({ error: 'univapay_not_configured' });
      return;
    }
    const mock: CheckoutResponse = {
      checkoutUrl: `/api/subscription/mock-checkout?userId=${encodeURIComponent(
        uid,
      )}&plan=${encodeURIComponent(body.plan)}`,
    };
    res.status(200).json(mock);
    return;
  }

  const origin = getRequestOrigin(req);
  const successUrl = `${origin}/?premium=1`;
  const cancelUrl = `${origin}/?premium=cancel`;

  try {
    const upstream = await fetch(`${apiBase}/stores/${storeId}/checkout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: PREMIUM_PRICE_JPY,
        currency: 'jpy',
        period: 'monthly',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { userId: uid, plan: body.plan },
      }),
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => '');
      console.error('[univapay checkout] upstream_error', {
        status: upstream.status,
        body: text.slice(0, 500),
      });
      res.status(502).json({ error: 'univapay_upstream_error' });
      return;
    }

    const data = (await upstream.json()) as UnivapayCheckoutCreateResponse;
    const checkoutUrl = data.redirect_url ?? data.url;
    if (!checkoutUrl) {
      res.status(502).json({ error: 'univapay_missing_redirect_url' });
      return;
    }

    // Open redirect 防止: UnivaPay の正規ドメインのみ許可
    if (!isUnivapayAllowedHost(checkoutUrl)) {
      console.error('[checkout] disallowed redirect host', checkoutUrl);
      res.status(502).json({ error: 'univapay_invalid_redirect_host' });
      return;
    }

    const response: CheckoutResponse = { checkoutUrl };
    res.status(200).json(response);
  } catch (err) {
    console.error('[univapay checkout] exception', err);
    res.status(502).json({ error: 'univapay_request_failed' });
  }
}

const APP_URL = process.env.APP_PUBLIC_URL;

function getRequestOrigin(req: VercelRequest): string {
  // 優先: 環境変数で固定 origin（Host header injection 防止）
  if (APP_URL) return APP_URL.replace(/\/$/, '');
  const proto = (req.headers['x-forwarded-proto'] as string) ?? 'https';
  const host = (req.headers['x-forwarded-host'] as string) ?? req.headers.host;
  return `${proto}://${host}`;
}

function isUnivapayAllowedHost(url: string): boolean {
  try {
    const parsed = new URL(url);
    return /(^|\.)univapay\.com$/.test(parsed.hostname);
  } catch {
    return false;
  }
}
