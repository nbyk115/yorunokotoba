# Vercel環境変数設定ガイド

## 必要な環境変数（Vercelダッシュボードで設定）

### 1. Stripe関連
```
STRIPE_SECRET_KEY=sk_live_xxx（新しく作成したキー）
STRIPE_PUBLISHABLE_KEY=pk_live_51T1gHuAMYeb3nO5Mi0eR0XmAUm9SxfP8tTXU44fhn8AT3mKHxCIANrq7R96j1vA7KD3TKeUus5u1n70MJqBn85hl004o1yoAKU
STRIPE_PRICE_ID=price_1T1gbxAMYeb3nO5M0f4a3SSY
STRIPE_WEBHOOK_SECRET=whsec_xxx（Webhookエンドポイント作成後に取得）
```

### 2. Firebase関連
```
FIREBASE_PROJECT_ID=（Firebaseプロジェクトのプロジェクト名）
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@xxx.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=（Firebaseサービスアカウントの秘密鍵）
```

### 3. ドメイン
```
DOMAIN=https://yorunokotoba.vercel.app
```

---

## Vercelでの設定手順

### 1. Vercelダッシュボードを開く
https://vercel.com/dashboard

### 2. yorunokobaプロジェクトをクリック

### 3. 「Settings」タブをクリック

### 4. 左メニューの「Environment Variables」をクリック

### 5. 各環境変数を追加
- Name: `STRIPE_SECRET_KEY`
- Value: `sk_live_xxx`（新しいキー）
- Environment: `Production`, `Preview`, `Development` 全てチェック
- 「Save」をクリック

※全ての環境変数を同様に追加

---

## Stripe Webhook設定

### 1. Stripeダッシュボードで

左メニュー → 「開発者」 → 「Webhook」

### 2. 「エンドポイントを追加」をクリック

### 3. エンドポイントURL
```
https://yorunokotoba.vercel.app/api/stripe-webhook
```

### 4. リッスンするイベントを選択
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

### 5. 「エンドポイントを追加」をクリック

### 6. Webhook署名シークレットをコピー
```
whsec_xxxxx
```

### 7. Vercelの環境変数に追加
```
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

---

## Firebase設定

### 1. Firebaseコンソールを開く
https://console.firebase.google.com/

### 2. プロジェクトを選択

### 3. 設定（歯車アイコン）→ プロジェクトの設定

### 4. サービスアカウント

### 5. 「新しい秘密鍵の生成」をクリック

### 6. ダウンロードされたJSONファイルから以下を取得
- `project_id` → `FIREBASE_PROJECT_ID`
- `client_email` → `FIREBASE_CLIENT_EMAIL`
- `private_key` → `FIREBASE_PRIVATE_KEY`

### 7. Vercelの環境変数に追加

---

## デプロイ

全ての環境変数を設定したら、GitHubにpushするだけで自動デプロイされます。

---

**作成日:** 2026-02-22
**バージョン:** v8.0.0
