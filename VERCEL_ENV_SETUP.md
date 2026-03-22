# Vercel環境変数設定ガイド

## 必要な環境変数（Vercelダッシュボードで設定）

### 1. 決済関連（KOMOJU承認後に設定）
```
KOMOJU_PUBLISHABLE_KEY=pk_xxx
KOMOJU_SECRET_KEY=sk_xxx
```

### 2. Firebase関連
```
FIREBASE_PROJECT_ID=（Firebaseプロジェクトのプロジェクト名）
FIREBASE_CLIENT_EMAIL=（サービスアカウントのメール）
FIREBASE_PRIVATE_KEY=（Firebaseサービスアカウントの秘密鍵）
```

### 3. ドメイン
```
DOMAIN=https://yorunokotoba.vercel.app
```

---

## Vercelでの設定手順

1. https://vercel.com/dashboard を開く
2. yorunokobaプロジェクトをクリック
3. 「Settings」→「Environment Variables」
4. 各環境変数を追加（Production, Preview, Development 全てチェック）

---

## Firebase設定

1. https://console.firebase.google.com/ を開く
2. プロジェクト設定 → サービスアカウント
3. 「新しい秘密鍵の生成」をクリック
4. ダウンロードされたJSONから:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

---

**更新日:** 2026-03-22
**バージョン:** v8.0.0
**決済:** KOMOJU審査中
