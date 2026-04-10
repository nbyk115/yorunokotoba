# よるのことば

夢占い×星座占いのPWAアプリ。

## 技術スタック

- **フロントエンド**: HTML / CSS / Vanilla JS（単一ファイル `index.html`）
- **バックエンド**: Firebase（認証・Firestore・Cloud Messaging）
- **ホスティング**: Vercel
- **フォント**: Zen Maru Gothic / Cormorant
- **PWA**: Service Worker + Web App Manifest

## ローカル開発

```bash
# 任意のHTTPサーバーで起動
npx serve .
```

## ConsultingOS

本リポジトリにはClaude Code用のマルチエージェントOS「ConsultingOS」が組み込まれている。

- **34エージェント**: Consulting / Service Dev / Product / Creative / Global / Marketing & Research の6部門
- **21スキルファイル**: 戦略・開発・クリエイティブ・グローバル・マーケティングの専門知識
- **7スラッシュコマンド**: `/analyze`, `/tdd`, `/codemap`, `/security-scan`, `/review-pr`, `/refactor-clean`, `/evolve`
- **自己進化システム**: エージェント評価・スキルA/Bテスト・自動改善

### 別リポジトリへの導入

```bash
./setup-consulting-os.sh /path/to/target-repo
```

これにより `.claude/`（エージェント + スキル）と `CLAUDE.md` がターゲットリポジトリにコピーされる。

## ディレクトリ構成

```
.
├── CLAUDE.md                 # ConsultingOS 司令塔（ルーティング・連携定義）
├── DESIGN.md                 # デザインシステム定義
├── index.html                # アプリ本体
├── setup-consulting-os.sh    # ConsultingOS セットアップスクリプト
├── .claude/
│   ├── agents/               # 34エージェント定義
│   │   ├── consulting/       # 戦略・提案・分析（8名）
│   │   ├── service-dev/      # 開発・インフラ（4名）
│   │   ├── product/          # プロダクト管理（2名）
│   │   ├── creative/         # デザイン・コンテンツ（8名）
│   │   ├── global/           # グローバル展開（4名）
│   │   └── marketing-research/ # マーケティング（8名）
│   ├── skills/               # 21スキルファイル
│   ├── commands/             # 7スラッシュコマンド
│   ├── memory/               # セッション間メモリ
│   └── settings.json         # Hooks設定
├── manifest.json             # PWA設定
├── firebase-messaging-sw.js  # プッシュ通知Service Worker
└── vercel.json               # Vercelデプロイ設定
```

## ライセンス

Private
