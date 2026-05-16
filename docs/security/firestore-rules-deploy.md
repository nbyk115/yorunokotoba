# Firestore Security Rules Deploy 手順書

## 概要

`firestore.rules` を Firebase に反映するための公式手順。リポジトリの `.firebaserc` に対象プロジェクト ID（`yorunokotoba-5df51`）が設定済み。

## 前提

- Node.js 18+ がインストール済み
- 対象 Firebase プロジェクト（`yorunokotoba-5df51`）への Editor 以上の権限を持つ Google アカウント

## 初回セットアップ（1回のみ）

```bash
# 1. Firebase CLI を global インストール
npm install -g firebase-tools

# 2. 対話的ログイン（ブラウザが開く）
firebase login
```

## デプロイ手順

```bash
# リポジトリルートで実行
cd /path/to/yorunokotoba

# 反映前に .firebaserc とルール内容を確認
cat .firebaserc
cat firestore.rules

# デプロイ実行
firebase deploy --only firestore:rules
```

成功時の出力例:

```
✔  firestore: rules file firestore.rules compiled successfully
✔  firestore: rules released successfully
```

## 反映確認（Rules Playground）

1. <https://console.firebase.google.com/project/yorunokotoba-5df51/firestore/rules> を開く
2. 「ルール プレイグラウンド」タブを選択
3. 以下5ケースを順番にテスト

| ケース | 操作 | パス | 認証 | 期待結果 |
|---|---|---|---|---|
| 自分のプロフィール read | get | `/users/UID_A` | UID_A でログイン | 許可 |
| 自分のプロフィール write | set | `/users/UID_A` | UID_A でログイン | 許可 |
| 他人のプロフィール write | set | `/users/UID_A` | UID_B でログイン | 拒否 |
| 未認証 read | get | `/users/UID_A` | 未認証 | 拒否 |
| 別パス read | get | `/other/doc` | UID_A でログイン | 拒否 |

すべて期待結果と一致したら反映完了。

## ロールバック手順

```bash
# 過去バージョン一覧
firebase firestore:rules:list

# 特定バージョンを取得して保存
firebase firestore:rules:get VERSION_NUMBER > firestore.rules.backup

# 内容確認後に再デプロイ
cp firestore.rules.backup firestore.rules
firebase deploy --only firestore:rules
```

## 緊急時：全アクセス拒否（インシデント対応）

```bash
cat > /tmp/emergency.rules << 'EOF'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
EOF

cp /tmp/emergency.rules firestore.rules
firebase deploy --only firestore:rules
```

復旧後は git のコミット履歴から本来の `firestore.rules` を復元してデプロイし直す。

## モニタリング

Firebase Console で以下を設定推奨:

- 予算アラート: <https://console.firebase.google.com/project/yorunokotoba-5df51/usage> で月 $10 / $20 / $50 のしきい値通知
- Firestore 読み込み spike アラート: 1日 50,000 件超で通知

## 関連ファイル

- `/firestore.rules` : Rules 本体
- `/firebase.json` : Firebase プロジェクト設定（Rules ファイルパス指定）
- `/.firebaserc` : デフォルトプロジェクト ID
