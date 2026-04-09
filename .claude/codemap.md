# ConsultingOS コードマップ
> 最終更新: 2026-03-25 | `/codemap` コマンドで再生成可能

---

## 1. ディレクトリ構造

```
.claude/
├── agents/                          # 34エージェント + Orchestrator (35ファイル)
│   ├── orchestrator.md              # 司令塔（3部門以上の複合タスク）
│   ├── consulting/                  # 🔴 コンサルティング部門 (8エージェント)
│   │   ├── strategy-lead.md
│   │   ├── competitive-analyst.md
│   │   ├── proposal-writer.md
│   │   ├── lead-qualifier.md
│   │   ├── kpi-analytics.md
│   │   ├── ai-consultant.md
│   │   ├── client-success.md
│   │   └── legal-compliance-checker.md
│   ├── service-dev/                 # 🟠 サービス開発部門 (4エージェント)
│   │   ├── tech-lead.md
│   │   ├── fullstack-dev.md
│   │   ├── ai-engineer.md
│   │   └── infra-devops.md
│   ├── product/                     # 🟢 プロダクト部門 (2エージェント)
│   │   ├── product-manager.md
│   │   └── feedback-synthesizer.md
│   ├── creative/                    # 🟣 クリエイティブ部門 (8エージェント) 🎨Figma対応
│   │   ├── creative-director.md     🎨
│   │   ├── ux-designer.md           🎨
│   │   ├── frontend-dev.md          🎨
│   │   ├── content-strategist.md
│   │   ├── campaign-planner.md
│   │   ├── brand-guardian.md
│   │   ├── agentic-content.md
│   │   └── growth-hacker.md
│   ├── global/                      # 🔵 グローバル部門 (4エージェント)
│   │   ├── gtm-consultant.md
│   │   ├── global-journalist.md
│   │   ├── global-business.md
│   │   └── business-translator.md
│   └── marketing-research/          # 🟡 マーケティング&リサーチ部門 (8エージェント)
│       ├── marketing-director.md
│       ├── performance-marketer.md
│       ├── seo-specialist.md
│       ├── marketing-analyst.md
│       ├── crm-ma-strategist.md
│       ├── social-media-strategist.md
│       ├── market-researcher.md
│       └── pr-communications.md
├── skills/                          # 22スキルファイル（全エージェント参照）
├── commands/                        # 6スラッシュコマンド
├── memory/                          # セッション間メモリ（claude-subconscious）
├── codemap.md                       # このファイル
└── settings.json                    # Auto Mode・Hooks・Agent Teams設定
```

---

## 2. 全エージェント一覧

### ⚫ Orchestrator
| name | description |
|---|---|
| orchestrator | ConsultingOS司令塔。複雑・複数部門にまたがるタスクを分解・配分・統合。単独解決不可の依頼の起点。 |

### 🔴 Consulting（8エージェント）
| name | description | 起動キーワード |
|---|---|---|
| strategy-lead | 戦略統括・事業計画・意思決定支援 | 戦略, 事業計画, Go/No-Go |
| competitive-analyst | 競合・市場分析・ポジショニング・差別化 | 競合, 市場構造, SWOT |
| proposal-writer | 提案書・ピッチデック・RFP回答 | 提案書, ピッチ, 資料 |
| lead-qualifier | リード精査・商談設計・クロージング | 商談, リード, ヒアリング |
| kpi-analytics | KPI設計・ダッシュボード・予測モデル | KPI, PL, 数値, ダッシュボード |
| ai-consultant | AI導入戦略・ROI試算・業務適用 | AI導入, DX, ROI |
| client-success | 顧客成功・LTV最大化・リテンション | チャーン, LTV, 解約率 |
| legal-compliance-checker | 法務・コンプラ・契約チェック | 法務, 契約, 規制 |

### 🟠 Service Dev（4エージェント）
| name | description | 起動キーワード |
|---|---|---|
| tech-lead | 技術選定・アーキテクチャ・コードレビュー | アーキテクチャ, 技術選定, 設計 |
| fullstack-dev | Next.js/FastAPI/DB実装・機能開発 | コード, 実装, API, DB |
| ai-engineer | Claude API統合・RAG・エージェント設計 | LLM, RAG, Claude API |
| infra-devops | デプロイ・Docker・CI/CD・監視 | インフラ, Docker, デプロイ |

### 🟢 Product（2エージェント）
| name | description | 起動キーワード |
|---|---|---|
| product-manager | プロダクト戦略・ロードマップ・PMF検証 | プロダクト, ロードマップ, PMF |
| feedback-synthesizer | VOC分析・フィードバック統合・インサイト抽出 | ユーザーの声, フィードバック, VOC |

### 🟣 Creative（8エージェント）
| name | description | 起動キーワード |
|---|---|---|
| creative-director 🎨 | クリエイティブ統括・ブリーフ・ツール選定 | デザイン全般, クリエイティブ方針 |
| ux-designer 🎨 | UXフロー・Figma仕様・LP設計 | UI, UX, ワイヤーフレーム |
| frontend-dev 🎨 | Figma→HTML/React変換・コンポーネント | フロントエンド, コンポーネント |
| content-strategist | ブログ・LP・SNS・ホワイトペーパー | コンテンツ, 記事, ブログ |
| campaign-planner | 施策設計・コンテンツカレンダー・KPI | キャンペーン, 施策 |
| brand-guardian | トーン統一・ガイドライン・品質ゲート | ブランド, トーン, 表現チェック |
| agentic-content | AIO対策・構造化データ・AIに選ばれる設計 | AIO, 構造化データ, AI検索 |
| growth-hacker | グロースハック・A/Bテスト・ファネル最適化 | CVR, グロース, A/Bテスト |

### 🔵 Global（4エージェント）
| name | description | 起動キーワード |
|---|---|---|
| gtm-consultant | GTM戦略・海外市場参入・ローカライズ | 海外展開, GTM, 参入戦略 |
| global-journalist | 海外ニュース分析・メディアリサーチ・情勢構造化 | 海外動向, 規制変更, 競合調査 |
| global-business | 海外事業運営・クロスボーダー・パートナーシップ | 海外拠点, JV, 現地法人 |
| business-translator | 多言語翻訳・ローカライゼーション・トランスクリエーション | 翻訳, ローカライズ, 多言語 |

### 🟡 Marketing & Research（8エージェント）
| name | description | 起動キーワード |
|---|---|---|
| marketing-director | マーケティング統括・チャネルミックス・予算配分 | マーケ全体戦略, 予算配分, CMO |
| performance-marketer | 広告運用・SEM/PPC・ROAS最適化 | 広告, SEM, ROAS, CPA |
| seo-specialist | テクニカルSEO・CWV・サイト構造 | SEO, CWV, インデックス |
| marketing-analyst | GA4・アトリビューション・CDP・ダッシュボード | GA4, アトリビューション, CDP |
| crm-ma-strategist | CRM・MA・ナーチャリング・メールマーケ | CRM, MA, ナーチャリング |
| social-media-strategist | SNS戦略・インフルエンサー・炎上対応 | SNS, インフルエンサー, 炎上 |
| market-researcher | 消費者リサーチ・定量/定性調査・価格戦略 | 市場調査, ペルソナ, 消費者 |
| pr-communications | PR・メディアリレーション・危機管理広報 | PR, プレスリリース, 危機管理 |

---

## 3. スキルファイル一覧（22本）

| ファイル | 用途 | 主な参照エージェント |
|---|---|---|
| consulting-playbook | 提案・戦略・商談の標準手法（小野寺×佐藤統合） | consulting全般 |
| digital-sales-intelligence | CPC/CPA変革・コンテクスチュアル・グローバルAM | marketing-research |
| revenue-growth-framework | PL思考・プロダクトバリュー変革・複利成長 | 全部門 |
| engineering-playbook | 開発プロセス・技術標準・Claude Code活用 | service-dev |
| creative-playbook | デザインプロセス・マルチツール選定（Figma/Canva/Google Stitch/Slides） | creative |
| brand-guidelines | トーン・品質基準・禁止表現 | creative, consulting |
| first-principles-breakdown | 第一原理分解・前提剥がし・真理からの再構築 | 全部門 |
| claude-code-ops | Hooks・Auto Mode・MCP管理・Agent Teams・並列ワークフロー | 運用全般 |
| browser-automation | Browser Use CLI 2.0・CDP接続・ブラウザ自動化 | service-dev |
| debug-methodology | 反証ベースデバッグ・根本原因特定・OODAループ | service-dev |
| migration-safety | DB/APIマイグレーション安全手順・ゼロダウンタイム | service-dev |
| code-quality-gates | PR前品質チェック・セルフレビュー・自動ゲート | service-dev |
| incident-response | 本番障害対応・SEV分類・ポストモーテム | service-dev, infra-devops |
| api-design-patterns | REST/GraphQL設計標準・認証・冪等性 | service-dev |
| prompt-engineering | プロンプト設計・RAG最適化・Tool Use設計 | ai-engineer |
| marketing-research-playbook | マーケティング戦略・チャネル選定・データ分析・PR | marketing-research |
| global-expansion-playbook | 海外展開・市場評価・ローカライズ・GTMフェーズ・Jobs-styleプレゼン | global |
| claude-subconscious | セッション間メモリ・コンテキスト蓄積 | 全エージェント |
| frontend-quality-guard | Reactフリーズ・バグ防御・実装前チェック | creative/frontend-dev |
| unit-economics | LTV/CAC・SaaS指標・AI Agent Companyユニットエコノミクス | consulting, global |
| ai-native-company | AI Agent Company設計原則・エージェント設計・収益モデル | 全部門 |
| ppt-presentation | PPT/スライド制作・メイリオ・日本語品質・Jobs-style・Komoju | creative, consulting, global |

---

## 4. スラッシュコマンド（6本）

| コマンド | 用途 |
|---|---|
| `/refactor-clean` | デッドコード除去・console.log削除・不要ファイル検出 |
| `/tdd` | テスト駆動開発サイクル（Red→Green→Refactor） |
| `/codemap` | このファイルを再生成・更新 |
| `/security-scan` | セキュリティスキャン（OWASP・シークレット・CVE） |
| `/review-pr` | PR自動レビュー（5軸評価） |
| `/analyze` | 第一原理分解クイック版 |

---

## 5. settings.json 設定サマリー

```
permissions.defaultMode = "auto"    // Auto Mode有効（classifier自動判定）
autoMode.soft_deny = [              // 禁止操作
  mainへの直接push禁止,
  force push禁止,
  本番DB削除禁止,
  .env/シークレットのコミット禁止
]
env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS = "1"  // Agent Teams有効
hooks = {
  PostToolUse: Prettier（.ts/.tsx）/ Black（.py）自動フォーマット
  PreToolUse:  長時間コマンドtmux警告 / mainへのpushブロック
  Stop:        console.log残留チェック / 未コミット変更通知
}
```

---

## 6. CLAUDE.md セクション構成

| セクション | 役割 |
|---|---|
| システム概要 | 6本柱・34エージェント構成の概要 |
| ルーティングロジック | 7部門のトリガーキーワード定義 + エージェントテーブル |
| スキルファイル一覧 | 22スキルの用途一覧 |
| コマンド一覧 | 6コマンドの用途 |
| スマートルーティング判定ツリー | Step 1-3の振り分けフロー |
| ハンドオフプロトコル | 部門間引き継ぎテンプレート・品質ゲート |
| エージェント連携パターン17本 | 新規事業〜AI Agent Company再設計まで |
| 全エージェント共通干渉原則 | 小野寺・佐藤知見・ブランドルール |
| 🔺 反証モード（トリプルチェック） | 実装前チェック義務・3ステップ反証 |
| Claude Code 運用鉄則 | Auto Mode・Agent Teams・Hooks・Gitワークフロー |

---

## 📊 システム統計

| 項目 | 数値 |
|---|---|
| 総エージェント数 | 35（Orchestrator + 34部門別） |
| 部門数 | 6部門 + 統合司令塔 |
| スキルファイル数 | 22本 |
| スラッシュコマンド数 | 6本 |
| 対応デザインツール | Figma 🎨 / Canva / Google Stitch / Google Slides |
| 決済標準 | Komoju（Stripe禁止） |
| デフォルトフォント | メイリオ（PPT/スライド） |
| Permission Mode | Auto Mode（デフォルト有効） |
| Agent Teams | 有効（CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1） |
| 開発ブランチルール | claude/* → Squash and merge → main |
