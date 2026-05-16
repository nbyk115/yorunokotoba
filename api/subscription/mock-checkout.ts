/**
 * GET /api/subscription/mock-checkout?userId=...&plan=...
 *
 * 開発用モック決済画面. 実 UnivaPay 接続前のフロー検証用.
 * 本番（VERCEL_ENV === 'production'）では 404 を返して完全無効化.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isProductionEnv } from '../_shared/auth-verify';

export default function handler(
  req: VercelRequest,
  res: VercelResponse,
): void {
  if (isProductionEnv()) {
    res.status(404).send('not found');
    return;
  }

  const userId = String(req.query.userId ?? '');
  const plan = String(req.query.plan ?? 'premium_monthly');

  if (!userId) {
    res.status(400).send('userId required');
    return;
  }

  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Mock Checkout · よるのことば</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #1a1530; color: #fff; padding: 32px; max-width: 480px; margin: 0 auto; }
    h1 { font-size: 18px; }
    .panel { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; padding: 20px; margin-top: 16px; }
    code { background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 8px; font-size: 12px; }
    button { width: 100%; min-height: 48px; padding: 14px; border-radius: 12px; border: none; background: linear-gradient(135deg, #e8627c, #d4659a); color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; margin-top: 16px; }
    .warn { color: #f5b942; font-size: 11px; margin-top: 12px; }
  </style>
</head>
<body>
  <h1>Mock Checkout（開発用）</h1>
  <div class="panel">
    <p>userId: <code>${escapeHtml(userId)}</code></p>
    <p>plan: <code>${escapeHtml(plan)}</code></p>
    <p>price: <code>¥980 / 月</code></p>
    <button id="pay">決済完了をシミュレート</button>
    <p class="warn">⚠ これはモック。実 UnivaPay 接続後はこのページは表示されない。</p>
  </div>
  <script>
    document.getElementById('pay').addEventListener('click', async () => {
      const btn = document.getElementById('pay');
      btn.disabled = true;
      btn.textContent = '処理中…';
      const r = await fetch('/api/webhooks/univapay?mock=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'subscription.activated',
          data: {
            id: 'mock_sub_' + Date.now(),
            status: 'active',
            metadata: { userId: ${JSON.stringify(userId)} },
            current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
          },
        }),
      });
      if (r.ok) {
        btn.textContent = '完了。アプリに戻ります…';
        // 本番 UnivaPay success_url と整合: ?premium=1 で App.tsx が purchase 発火
        setTimeout(() => { window.location.href = '/?premium=1'; }, 1200);
      } else {
        btn.textContent = '失敗: ' + r.status;
      }
    });
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
