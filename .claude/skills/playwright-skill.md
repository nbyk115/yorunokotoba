# Playwright Skill — ブラウザ自動化・E2Eテストスキル

## 概要
Playwrightを使ったブラウザ自動化。フォーム入力・スクリーンショット・レスポンシブ検証・
ログインフロー・リンク確認など、幅広いWebインタラクションを自動化する。
開発サーバー自動検出・スクリプト生成・実行の3ステップワークフローが核心。
出典: jpulido240-svg/playwright-skill

---

## §1 クリティカルワークフロー（順序厳守）

```
Step 1: サーバー検出（必ず先に実行）
  → localhostの開発サーバーを自動検出してからスクリプトを書く
  → URL・ポートをハードコードしない

Step 2: スクリプト生成
  → テストコードを /tmp/playwright-test-{タスク名}.js に書く
  → プロジェクトディレクトリを汚染しない

Step 3: 実行
  → スキルディレクトリの run.js ラッパー経由で実行
```

---

## §2 デフォルト設定

| 設定 | デフォルト値 | 理由 |
|---|---|---|
| headless | `false`（可視モード） | デバッグ・検証を容易にする |
| URL | 動的検出 | ハードコード禁止 |
| スクリプト保存先 | `/tmp/playwright-test-*.js` | プロジェクトを汚染しない |

ヘッドレス実行が必要な場合は明示的に指定する。

---

## §3 ユースケース別実装パターン

### ログインフロー検証
```javascript
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(process.env.BASE_URL || 'http://localhost:3000');
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'password');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
  console.log('✅ ログイン成功');
  await browser.close();
})();
```

### スクリーンショット取得
```javascript
await page.screenshot({
  path: `/tmp/screenshot-${Date.now()}.png`,
  fullPage: true
});
```

### レスポンシブ検証
```javascript
const viewports = [
  { width: 375, height: 812, name: 'iPhone' },
  { width: 768, height: 1024, name: 'iPad' },
  { width: 1440, height: 900, name: 'Desktop' }
];
for (const vp of viewports) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  await page.screenshot({ path: `/tmp/${vp.name}-${Date.now()}.png` });
}
```

### フォームバリデーション確認
```javascript
// 空送信でエラーが出るか確認
await page.click('button[type="submit"]');
const error = await page.locator('[role="alert"]').first();
await expect(error).toBeVisible();
```

### リンク切れ確認
```javascript
const links = await page.$$eval('a[href]', els => els.map(el => el.href));
for (const link of links) {
  const res = await page.request.get(link);
  if (!res.ok()) console.warn(`❌ ${link} → ${res.status()}`);
}
```

---

## §4 ヘルパーユーティリティ

```javascript
// サーバー検出
async function detectServer(ports = [3000, 3001, 8080, 5173]) {
  for (const port of ports) {
    try {
      const res = await fetch(`http://localhost:${port}`);
      if (res.ok) return `http://localhost:${port}`;
    } catch {}
  }
  throw new Error('開発サーバーが見つかりません');
}

// 安全なクリック（要素が存在する場合のみ）
async function safeClick(page, selector, timeout = 5000) {
  try {
    await page.waitForSelector(selector, { timeout });
    await page.click(selector);
    return true;
  } catch { return false; }
}

// タイムスタンプ付きスクリーンショット
async function timedScreenshot(page, name) {
  const path = `/tmp/${name}-${Date.now()}.png`;
  await page.screenshot({ path, fullPage: true });
  return path;
}
```

---

## §5 禁止事項

- URLのハードコード（常に動的検出か環境変数）
- プロジェクトディレクトリへのスクリプト保存
- ヘッドレス未明示での本番テスト（デバッグ時は可視モードを維持）

---

## §6 ConsultingOS適用エージェント

| エージェント | 使用場面 |
|---|---|
| fullstack-dev | E2Eテスト・フォームバリデーション確認・回帰テスト |
| frontend-dev | レスポンシブ検証・ビジュアルリグレッション |
| infra-devops | デプロイ後の動作確認・ヘルスチェック自動化 |
| growth-hacker | LP・ファネルのクリックパス検証・CVR計測補助 |
