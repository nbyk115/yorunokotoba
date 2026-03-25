# Technical Accuracy — ハルシネーション防止・技術手順の正確性

> **全エージェント必須**。技術的な手順・設定・コマンドを出力するときに参照する。
> UI手順は6ヶ月で変わる。CLIコマンドは数年安定する。CLIを優先する。

---

## §1 ハルシネーション防止の原則

### CLIファースト原則
```
❌ 悪い例（UI手順 — すぐ陳腐化する）:
「GA4の管理画面 → 設定 → データストリーム → タグ設定をクリックして...」

✅ 良い例（CLI + 概念 + 公式docs）:
「Firebase CLIで初期化します:
  $ firebase init
  $ firebase deploy
→ 詳細: firebase.google.com/docs/cli（公式、常に最新）」
```

### 手順出力の必須フォーマット
```
【概念説明】（初めて聞く人向けに1-2文で何かを説明）

【前提条件】
- 必要なツール: Node.js 18+, git など
- 必要な権限: admin権限など

【手順】
$ [CLIコマンド]  ← 具体的で実行可能なコマンド

【確認方法】
$ [確認コマンド または 確認すべき状態]

【公式ドキュメント】
→ [URL]（UIの手順はここで最新版を確認してください）

【よくあるエラー】
- エラー文: 原因と対処法
```

### バージョン・日付の明記
```
# 必ず付ける
「以下の手順はXXX v[バージョン]時点（知識カットオフ: 2025年8月）の情報です。
 UIが変更されている可能性があります。公式ドキュメントで最新版を確認してください。」
```

---

## §2 GitHub — PR（プルリクエスト）の正確な手順

### PRとは何か（概念説明）
```
PR（Pull Request）= 「このコードをmainブランチに取り込んでください」という提案。

流れ:
  main ← feature/your-branch
  ①自分のブランチで作業
  ②変更をGitHubにpush
  ③PRを作成（「レビューしてください」という申請）
  ④レビュー → 承認 → マージ（mainに統合）
```

### 手順（gh CLI使用 — 推奨）

```bash
# 前提: gh CLIのインストールと認証
$ brew install gh          # Mac
$ gh auth login            # ブラウザで認証

# ①作業ブランチの作成
$ git checkout -b feature/your-feature-name

# ②変更をコミット
$ git add .
$ git commit -m "feat: 変更内容を端的に"

# ③GitHubにpush
$ git push -u origin feature/your-feature-name

# ④PRを作成
$ gh pr create \
  --title "変更内容のタイトル" \
  --body "## 変更内容\n\n- 何を変えたか\n\n## テスト方法\n\n- どう確認したか" \
  --base main

# ⑤PR URLが返ってくる → レビュー依頼
```

### 確認コマンド
```bash
$ gh pr list              # 自分のPR一覧
$ gh pr status            # 現在のブランチのPR状態
$ gh pr view              # PRの詳細
```

### 公式ドキュメント
→ `cli.github.com/manual/gh_pr_create`（常に最新）

---

## §3 GA4 — Google Analytics 4 の実装手順

### GA4とは（概念説明）
```
GA4 = Googleのアクセス解析ツール（旧UAの後継、2023年7月にUA廃止）。
イベントベース計測。Webサイトに「タグ」を埋め込んでデータ収集する。
```

### 実装方法（2択）

#### 方法A: Google Tag Manager経由（推奨）
```
GTMを使うと、コードを変えずにタグを管理できる。

①GTMアカウント作成: tagmanager.google.com
②コンテナスニペットをHTMLのheadとbodyに貼る:
  （GTMが表示する2つのコードスニペット）

③GTM内でGA4タグを設定:
  タグの種類: 「Googleタグ」
  タグID: 「G-XXXXXXXX」（GA4の測定ID）
  トリガー: 「All Pages」

④プレビューで確認 → 公開

【確認】
  → GA4の「リアルタイム」レポートでデータが入ることを確認
```

#### 方法B: gtag.js直接実装
```html
<!-- <head>内に追加 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXX');  // ← 自分の測定IDに変更
</script>
```

#### Next.js の場合
```bash
$ npm install @next/third-parties
```
```tsx
// app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
      <GoogleAnalytics gaId="G-XXXXXXXX" />
    </html>
  )
}
```

### 公式ドキュメント
→ `developers.google.com/analytics/devguides/collection/ga4`

---

## §4 Firebase — 設定・デプロイの正確な手順

### Firebaseとは（概念説明）
```
Firebase = Googleのバックエンド-as-a-Service。
主な機能: Authentication（認証）・Firestore（DB）・Storage・Hosting・Functions
```

### セットアップ手順

```bash
# Firebase CLIのインストール
$ npm install -g firebase-tools

# Googleアカウントでログイン
$ firebase login

# プロジェクトに初期化（対話形式で進む）
$ firebase init
  # 使う機能を選択: Hosting, Firestore, Functions など
  # プロジェクトIDを選択または新規作成

# ローカルでエミュレート（本番に影響しない）
$ firebase emulators:start

# 本番デプロイ
$ firebase deploy

# 機能別デプロイ
$ firebase deploy --only hosting
$ firebase deploy --only functions
$ firebase deploy --only firestore:rules
```

### 環境変数の設定（Functions）
```bash
# Cloud Functions の環境変数
$ firebase functions:config:set myapp.key="VALUE"
$ firebase functions:config:get  # 確認

# または .env ファイル（推奨）
# functions/.env に記載
```

### 公式ドキュメント
→ `firebase.google.com/docs/cli`
→ `firebase.google.com/docs` （機能別ドキュメント）

---

## §5 Vercel / デプロイの正確な手順

### Vercel CLIデプロイ
```bash
$ npm install -g vercel
$ vercel login
$ vercel          # プレビューデプロイ
$ vercel --prod   # 本番デプロイ

# 環境変数の設定
$ vercel env add VARIABLE_NAME
```

### GitHub連携（自動デプロイ）
```
①vercel.com でプロジェクト作成
②GitHubリポジトリを連携
③以後、mainへのpushで自動本番デプロイ
    PRをpushするとプレビューURLが自動生成される
```

---

## §6 技術手順の品質チェック（出力前）

```
□ CLI手順を優先したか（UI手順だけになっていないか）
□ バージョン/知識カットオフを明記したか
□ 公式ドキュメントURLを添付したか
□ 前提条件（必要なツール・権限）を書いたか
□ 確認方法（どうなれば成功か）を書いたか
□ よくあるエラーと対処法を書いたか
□ 初めて聞く人向けの概念説明（1-2文）があるか
```
