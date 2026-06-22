/**
 * GET /api/share?type=<dreamTypeId>
 *
 * SNS クローラ (Twitterbot / Facebookbot / Slackbot / LINEbot) 向け
 * 動的シェアページ。JS 非実行クローラが OG meta タグを取得できるよう
 * サーバーサイドで HTML を生成して返す。
 *
 * リダイレクト: 通常ブラウザは SPA (/#/result?type=xxx) に誘導。
 * 不正 type は 404 / 型なし fallback ページ。
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDreamType, RARITY_LABEL } from './_shared/dreamTypeLookup.js';

const SITE_URL = 'https://yorunokotoba.vercel.app';
const SITE_NAME = 'よるのことば';

export default function handler(req: VercelRequest, res: VercelResponse): void {
  const typeParam = String(req.query.type ?? '').trim();
  const entry = typeParam ? getDreamType(typeParam) : undefined;

  if (!typeParam || !entry) {
    res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8').send(`<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ページが見つかりません - ${escapeHtml(SITE_NAME)}</title>
  <meta name="robots" content="noindex" />
</head>
<body>
  <p>このシェアリンクは無効です。</p>
  <a href="${escapeHtml(SITE_URL)}">よるのことばで診断する</a>
</body>
</html>`);
    return;
  }

  const ogImageUrl = `${SITE_URL}/api/og?type=${encodeURIComponent(entry.id)}`;
  const sharePageUrl = `${SITE_URL}/share/${encodeURIComponent(entry.id)}`;
  const appUrl = `${SITE_URL}/#/result?type=${encodeURIComponent(entry.id)}`;

  const rarityLabel = RARITY_LABEL[entry.rarity] ?? entry.rarity;
  const ogTitle = `${entry.name} - ${entry.sub} | ${SITE_NAME}`;
  const ogDescription = `${entry.signature} [${rarityLabel}] ${entry.share}`;

  // キャッシュ: OG 画像は 24h キャッシュ、シェアページは 1h
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(ogTitle)}</title>
  <meta name="description" content="${escapeHtml(ogDescription)}" />

  <!-- OG / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />
  <meta property="og:title" content="${escapeHtml(ogTitle)}" />
  <meta property="og:description" content="${escapeHtml(ogDescription)}" />
  <meta property="og:image" content="${escapeHtml(ogImageUrl)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${escapeHtml(sharePageUrl)}" />
  <meta property="og:locale" content="ja_JP" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(ogTitle)}" />
  <meta name="twitter:description" content="${escapeHtml(ogDescription)}" />
  <meta name="twitter:image" content="${escapeHtml(ogImageUrl)}" />

  <!-- LINE / Slack も og: タグを参照 -->

  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{
      font-family:'Hiragino Kaku Gothic ProN','Hiragino Sans','Yu Gothic',sans-serif;
      background:#0d0b1a;
      color:#f0eaf8;
      min-height:100dvh;
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      padding:24px 16px;
    }
    .card{
      max-width:480px;
      width:100%;
      text-align:center;
    }
    .rarity{
      display:inline-block;
      font-size:11px;
      font-weight:700;
      letter-spacing:.08em;
      padding:3px 10px;
      border-radius:999px;
      margin-bottom:16px;
      background:rgba(255,255,255,0.12);
      color:rgba(255,255,255,0.7);
    }
    .color-dot{
      width:48px;
      height:48px;
      border-radius:50%;
      margin:0 auto 12px;
      border:2px solid rgba(255,255,255,0.2);
    }
    h1{
      font-size:clamp(22px,5vw,30px);
      font-weight:700;
      margin-bottom:6px;
    }
    .sub{
      font-size:14px;
      color:rgba(255,255,255,0.6);
      margin-bottom:20px;
    }
    .signature{
      font-size:clamp(14px,3.5vw,17px);
      line-height:1.7;
      color:rgba(255,255,255,0.88);
      background:rgba(255,255,255,0.06);
      border-left:3px solid;
      border-radius:8px;
      padding:14px 16px;
      margin-bottom:28px;
      text-align:left;
    }
    .cta{
      display:block;
      width:100%;
      padding:15px 24px;
      border-radius:14px;
      background:#e8627c;
      color:#fff;
      font-size:15px;
      font-weight:700;
      text-decoration:none;
      transition:opacity .15s;
    }
    .cta:hover{opacity:.85}
    .site-name{
      margin-top:20px;
      font-size:12px;
      color:rgba(255,255,255,0.4);
      letter-spacing:.05em;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="rarity">${escapeHtml(rarityLabel)}</div>
    <div class="color-dot" style="background:${escapeHtml(entry.color)}"></div>
    <h1>${escapeHtml(entry.name)}</h1>
    <p class="sub">${escapeHtml(entry.sub)}</p>
    <p class="signature" style="border-color:${escapeHtml(entry.color)}">${escapeHtml(entry.signature)}</p>
    <a class="cta" href="${escapeHtml(appUrl)}">あなたも診断してみる</a>
    <p class="site-name">${escapeHtml(SITE_NAME)}</p>
  </div>
</body>
</html>`);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
