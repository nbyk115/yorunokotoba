# 🧠 ConsultingOS — 司令塔

## システム概要
**コンサル・サービス開発・プロダクト・クリエイティブ・グローバル・マーケティング特化の6本柱マルチエージェントOS**
34名のエージェント（+orchestrator司令塔）が連携し、提案から実装・コンテンツ・海外展開までを一気通貫で担う。スキル37本・エージェント間連携スキル統合済み。

---

## 案件受付パイプライン（AI Agency フロー）

> クライアントの依頼は必ずこのフローを通る。ルーティングに直行しない。

```
Step 1: インテーク
  /new-project コマンドを起動
  → .claude/intake/ の該当テンプレートで情報を収集

Step 2: プロジェクトファイル生成
  → .claude/projects/YYYY-MM-DD_[クライアント]_[概要].md を作成
  → .claude/projects/template.md をベースに使用

Step 3: エージェントチーム配備
  → 下記ルーティングロジックで起点エージェントを特定
  → ハンドオフプロトコルに従い各エージェントを起動

Step 4: 品質ゲート（各フェーズ完了時）
  → 人間の承認なしに次フェーズへ進まない
  → .claude/projects/[案件ファイル].md の品質ゲートチェックを実施

Step 5: 成果物納品
  → .claude/templates/ の該当テンプレートで成果物を作成
  → .claude/templates/deliverable-checklist.md で納品前確認
```

### インテークフォーム一覧
| 案件種別 | フォーム | 主な成果物 |
|---|---|---|
| 戦略・提案・KPI・法務 | `.claude/intake/consulting-intake.md` | `.claude/templates/strategy-proposal.md` |
| LP・UI・コンテンツ・ブランド | `.claude/intake/creative-intake.md` | `.claude/templates/lp-brief.md` |
| コード・API・インフラ・AI機能 | `.claude/intake/dev-intake.md` | コードリポジトリ |
| 海外展開・翻訳・GTM | `.claude/intake/global-intake.md` | `.claude/templates/market-research-report.md` |
| 広告・SEO・CRM・SNS・PR | `.claude/intake/marketing-intake.md` | キャンペーン設計書 |

---

## ルーティングロジック

ユーザーの入力を分析し、以下のトリガーキーワードに基づいて適切なエージェントにルーティングする。
複数部門にまたがる場合は、連携フローに従って順次起動する。

### ⚫ Orchestrator（司令塔）
**トリガー**: 全体を見て, 複合的な依頼, 複数部門にまたがる, どうすればいいか, AI Agent Company, 全部やって, 総合的に判断, 新規事業立ち上げ（全工程）

| エージェント | ファイル | 起動条件 |
|---|---|---|
| orchestrator | `.claude/agents/orchestrator.md` | 3部門以上にまたがる複合タスク・全体統合・意思決定の調停 |

### 🔴 Consulting（コンサルティング）
**トリガー**: 戦略, 提案, 分析, KPI, 競合, 事業, 商談, リード, 予測, レポート, 計画, PL, 粗利, 市場, SWOT, ポジショニング, AI導入, 顧客フォロー, LTV, チャーン, 法務, コンプライアンス, 契約, 深掘り, 深掘り調査, デューデリ, DD, 多角的に調べ, ソース付きで調べ

| エージェント | ファイル | 起動条件 |
|---|---|---|
| strategy-lead | `.claude/agents/consulting/strategy-lead.md` | 全体戦略・事業計画・意思決定支援 |
| competitive-analyst | `.claude/agents/consulting/competitive-analyst.md` | 競合調査・ポジショニング・差別化 |
| proposal-writer | `.claude/agents/consulting/proposal-writer.md` | 提案書・ピッチデック・クライアント資料 |
| lead-qualifier | `.claude/agents/consulting/lead-qualifier.md` | 案件評価・ヒアリング設計・クロージング |
| kpi-analytics | `.claude/agents/consulting/kpi-analytics.md` | KPIツリー・ダッシュボード・予測モデル |
| ai-consultant | `.claude/agents/consulting/ai-consultant.md` | AI導入戦略・ROI試算・業務適用設計 |
| client-success | `.claude/agents/consulting/client-success.md` | 顧客成功・LTV最大化・リテンション |
| legal-compliance-checker | `.claude/agents/consulting/legal-compliance-checker.md` | 法務・コンプラ・契約チェック |

### 🟠 Service Dev（サービス開発）
**トリガー**: コード, 実装, API, DB, インフラ, アーキテクチャ, AI機能, バグ, デプロイ, SaaS, Docker, CI/CD, テスト, LLM, RAG

> **Claude Code自体がこの部門の実行エンジン。**
> エージェントファイルは「技術判断ナレッジ」として自動参照される。

| エージェント | ファイル | 起動条件 |
|---|---|---|
| tech-lead | `.claude/agents/service-dev/tech-lead.md` | アーキテクチャ・技術選定・コードレビュー |
| fullstack-dev | `.claude/agents/service-dev/fullstack-dev.md` | Next.js/FastAPI/DB実装・機能開発 |
| ai-engineer | `.claude/agents/service-dev/ai-engineer.md` | Claude API統合・RAG・エージェント設計 |
| infra-devops | `.claude/agents/service-dev/infra-devops.md` | デプロイ・Docker・コスト最適化 |

### 🟢 Product（プロダクト）
**トリガー**: プロダクト, ロードマップ, PMF, 機能優先順位, バックログ, GTM, リリース計画, MVP, フィードバック, VOC, ユーザーの声

| エージェント | ファイル | 起動条件 |
|---|---|---|
| product-manager | `.claude/agents/product/product-manager.md` | プロダクト戦略・ロードマップ・PMF検証 |
| feedback-synthesizer | `.claude/agents/product/feedback-synthesizer.md` | ユーザーフィードバック統合・インサイト抽出 |

### 🟣 Creative（クリエイティブ・コンテンツ）
**トリガー**: デザイン, UI, UX, Figma, LP, コンテンツ, SNS, ブログ, HTML, CSS, キャンペーン, ブランド, AIO, トーン, グロース, A/Bテスト, ファネル, CVR

> **Figma MCP対応エージェントには 🎨 を付与。**
> FigmaリンクをURLとして渡すと自動でデザイン→コード変換が起動する。

| エージェント | ファイル | 起動条件 |
|---|---|---|
| creative-director | `.claude/agents/creative/creative-director.md` 🎨 | 方針策定・ブリーフ・デザインレビュー |
| ux-designer | `.claude/agents/creative/ux-designer.md` 🎨 | UXフロー・Figma仕様・LP設計 |
| frontend-dev | `.claude/agents/creative/frontend-dev.md` 🎨 | Figma→HTML・コンポーネント生成 |
| content-strategist | `.claude/agents/creative/content-strategist.md` | ブログ・LP・SNS・ホワイトペーパー |
| campaign-planner | `.claude/agents/creative/campaign-planner.md` | 施策設計・コンテンツカレンダー・KPI |
| brand-guardian | `.claude/agents/creative/brand-guardian.md` | トーン統一・ガイドライン・品質チェック |
| agentic-content | `.claude/agents/creative/agentic-content.md` | AIO対策・AIに選ばれるコンテンツ設計 |
| growth-hacker | `.claude/agents/creative/growth-hacker.md` | グロースハック・A/Bテスト・ファネル最適化 |

### 🔵 Global（グローバル）
**トリガー**: 海外, グローバル, 国際, 翻訳, ローカライズ, GTM, 市場参入, 海外展開, 越境, クロスボーダー, 海外ニュース, 海外事例, 規制動向, 多言語, i18n

> **海外展開・グローバルビジネスの専門部門。**
> リサーチからGTM設計・翻訳・現地オペレーションまでを担う。

| エージェント | ファイル | 起動条件 |
|---|---|---|
| gtm-consultant | `.claude/agents/global/gtm-consultant.md` | Go-to-Market戦略・海外市場参入・ローカライズ戦略 |
| global-journalist | `.claude/agents/global/global-journalist.md` | 海外ニュース分析・メディアリサーチ・国際情勢構造化 |
| global-business | `.claude/agents/global/global-business.md` | 海外事業運営・クロスボーダー取引・国際パートナーシップ |
| business-translator | `.claude/agents/global/business-translator.md` | 多言語翻訳・ローカライゼーション・トランスクリエーション |

### 🟡 Marketing & Research（マーケティング&リサーチ）
**トリガー**: 広告, SEM, PPC, SEO, テクニカルSEO, SNS広告, ソーシャル広告, メディアバイイング, ROAS, アトリビューション, GA4, CDP, CRM, MA, マーケティングオートメーション, ナーチャリング, メールマーケ, インフルエンサー, PR, プレスリリース, メディアリレーション, 広報, 危機管理, 消費者調査, 市場調査, セグメンテーション, ペルソナ, 価格調査, コンジョイント, ブランドトラッキング, チャネルミックス, マーテク, リターゲティング, Cookie廃止

> **高水準・グローバルトップレベルのマーケティング&リサーチ専門部門。**
> 広告運用からSEO・CRM/MA・消費者リサーチ・PR広報まで、データドリブンなフルファネルマーケティングを担う。

| エージェント | ファイル | 起動条件 |
|---|---|---|
| marketing-director | `.claude/agents/marketing-research/marketing-director.md` | マーケティング統括・チャネルミックス・予算配分・マーテク |
| performance-marketer | `.claude/agents/marketing-research/performance-marketer.md` | 広告運用・SEM/PPC・ROAS最適化・メディアバイイング |
| seo-specialist | `.claude/agents/marketing-research/seo-specialist.md` | テクニカルSEO・CWV・サイト構造・国際SEO |
| marketing-analyst | `.claude/agents/marketing-research/marketing-analyst.md` | GA4・アトリビューション・CDP・ダッシュボード・A/Bテスト |
| crm-ma-strategist | `.claude/agents/marketing-research/crm-ma-strategist.md` | CRM・MA・ナーチャリング・メールマーケ・ABM |
| social-media-strategist | `.claude/agents/marketing-research/social-media-strategist.md` | SNS戦略・ソーシャル広告・コミュニティ・インフルエンサー |
| market-researcher | `.claude/agents/marketing-research/market-researcher.md` | 消費者リサーチ・定量/定性調査・セグメンテーション・価格戦略 |
| pr-communications | `.claude/agents/marketing-research/pr-communications.md` | PR戦略・メディアリレーション・危機管理広報・効果測定 |

---

## スキルファイル（全エージェント参照）

| ファイル | パス | 用途 |
|---|---|---|
| consulting-playbook | `.claude/skills/consulting-playbook.md` | 提案・戦略・商談の標準手法（小野寺×佐藤統合） |
| digital-sales-intelligence | `.claude/skills/digital-sales-intelligence.md` | CPC/CPA変革・コンテクスチュアル・グローバルAM |
| revenue-growth-framework | `.claude/skills/revenue-growth-framework.md` | PL思考・プロダクトバリュー変革・複利成長 |
| engineering-playbook | `.claude/skills/engineering-playbook.md` | 開発プロセス・技術標準・Claude Code活用 |
| creative-playbook | `.claude/skills/creative-playbook.md` | デザイン・コンテンツ・Figma MCP |
| brand-guidelines | `.claude/skills/brand-guidelines.md` | トーン・品質基準・禁止表現 |
| first-principles-breakdown | `.claude/skills/first-principles-breakdown.md` | 第一原理分解・前提剥がし・真理からの再構築 |
| claude-code-ops | `.claude/skills/claude-code-ops.md` | Hooks・MCP管理・並列ワークフロー・コンテキスト最適化 |
| browser-automation | `.claude/skills/browser-automation.md` | Browser Use CLI 2.0・CDP直接接続・ブラウザ自動化 |
| debug-methodology | `.claude/skills/debug-methodology.md` | 反証ベースデバッグ・根本原因特定・OODAループ |
| migration-safety | `.claude/skills/migration-safety.md` | DB/APIマイグレーション安全手順・ゼロダウンタイム |
| code-quality-gates | `.claude/skills/code-quality-gates.md` | PR前品質チェック・セルフレビュー・自動ゲート |
| incident-response | `.claude/skills/incident-response.md` | 本番障害対応・SEV分類・ポストモーテム |
| api-design-patterns | `.claude/skills/api-design-patterns.md` | REST/GraphQL設計標準・認証・冪等性 |
| prompt-engineering | `.claude/skills/prompt-engineering.md` | プロンプト設計・RAG最適化・Tool Use設計 |
| marketing-research-playbook | `.claude/skills/marketing-research-playbook.md` | マーケティング戦略・チャネル選定・データ分析・リサーチ・PR |
| global-expansion-playbook | `.claude/skills/global-expansion-playbook.md` | 海外展開・市場評価・ローカライズ品質・GTMフェーズ設計 |
| claude-subconscious | `.claude/skills/claude-subconscious.md` | セッション間メモリ・コンテキスト蓄積・Letta連携 |
| frontend-quality-guard | `.claude/skills/frontend-quality-guard.md` | Reactフリーズ・バグ防御・実装前チェック・必須パターン集 |
| unit-economics | `.claude/skills/unit-economics.md` | LTV/CAC・SaaS指標・AI Agent Company ユニットエコノミクス完全計算 |
| ai-native-company | `.claude/skills/ai-native-company.md` | AI Agent Company設計原則・エージェント設計・収益モデル・佐藤×小野寺統合 |
| ppt-presentation | `.claude/skills/ppt-presentation.md` | PPT/スライド制作・日本語品質・メイリオ・ジョブズスタイル・Komoju決済 |
| sales-playbook | `.claude/skills/sales-playbook.md` | ICP定義・MEDDPICC商談設計・クロージング戦術・SaaS営業KPI |
| product-management-playbook | `.claude/skills/product-management-playbook.md` | PMF検証・RICE優先順位付け・PRD設計・OKR連動ロードマップ |
| compliance-playbook | `.claude/skills/compliance-playbook.md` | 法務リスク評価・契約レビュー・個人情報保護・景表法・コンプライアンス体制 |
| technical-accuracy | `.claude/skills/technical-accuracy.md` | CLI優先原則・GA4/Firebase/GitHub PR実装の反ハルシネーションプロトコル |
| humanizer-ja | `.claude/skills/humanizer-ja.md` | 日本語AI臭除去・6カテゴリ30パターン検出。content-strategist/business-translator/brand-guardian/pr-communications必須 |
| superpowers | `.claude/skills/superpowers.md` | TDD・体系的デバッグ・実装前計画・完了前検証・サブエージェント協働。tech-lead/fullstack-dev必須 |
| claude-health | `.claude/skills/claude-health.md` | Claude Code設定の6層診断（CLAUDE.md→rules→skills→hooks→subagents→verifiers）。orchestrator月次実行 |
| planning-with-files | `.claude/skills/planning-with-files.md` | Manusスタイルファイルベース計画管理・コンテキスト永続化。3ステップ以上の複合タスク必須 |
| frontend-design | `.claude/skills/frontend-design.md` | プロダクショングレードUI設計・AIスロップ禁止・アクセシビリティ優先。frontend-dev/ux-designer必須 |
| verification-loop | `.claude/skills/verification-loop.md` | 6フェーズ品質保証（ビルド→型→lint→テスト→セキュリティ→diff）。PR前・リリース前必須 |
| deep-research | `.claude/skills/deep-research.md` | 15-30ソース多角調査・証拠ベースレポート生成。competitive-analyst/market-researcher/global-journalist必須 |
| playwright-skill | `.claude/skills/playwright-skill.md` | Playwrightブラウザ自動化・E2Eテスト・レスポンシブ検証。fullstack-dev/frontend-dev/infra-devops |
| security-scan | `.claude/skills/security-scan.md` | AgentShield 102ルール・設定セキュリティ監査。外部スキル取り込み前・月次必須 |
| strategic-compact | `.claude/skills/strategic-compact.md` | 戦略的コンテキスト圧縮・フェーズ移行時の/compact設計。orchestrator/長時間タスク全般 |

---

## コマンド（スラッシュコマンド）

| コマンド | パス | 用途 |
|---|---|---|
| /refactor-clean | `.claude/commands/refactor-clean.md` | デッドコード除去・console.log削除・不要ファイル検出 |
| /tdd | `.claude/commands/tdd.md` | テスト駆動開発サイクル（Red→Green→Refactor） |
| /codemap | `.claude/commands/codemap.md` | コードマップ自動生成・更新 |
| /security-scan | `.claude/commands/security-scan.md` | セキュリティスキャン（OWASP・シークレット・CVE） |
| /review-pr | `.claude/commands/review-pr.md` | PR自動レビュー（5軸評価） |
| /analyze | `.claude/commands/analyze.md` | 第一原理分解クイック版 |
| /ppt | `.claude/commands/ppt.md` | python-pptxで.pptxファイルを直接生成 |
| /new-project | `.claude/commands/new-project.md` | 案件受付・インテーク（インテークフォーム起動） |
| /handoff | `.claude/commands/handoff.md` | エージェント間ハンドオフファイル生成 |
| /peer-review | `.claude/commands/peer-review.md` | 別部門エージェントによるクロスレビュー |
| /maintenance | `.claude/commands/maintenance.md` | 月次健全性チェック（claude-health + security-scan） |

---

### ⚡ クイック判定（30秒ルーティング）

| ユーザーが言いたいこと | 起点エージェント |
|---|---|
| 「競合を調べたい」「差別化は？」「競合比較」 | competitive-analyst |
| 「顧客に聞きたい」「セグメント」「ペルソナ」「価格感度」 | market-researcher |
| 「海外事例」「グローバルトレンド」「規制動向」 | global-journalist |
| 「戦略を考えたい」「どの方向に進むか」 | strategy-lead |
| 「数字を出したい」「KPI」「PL試算」 | kpi-analytics |
| 「コードを書きたい」「実装したい」「バグ修正」 | fullstack-dev |
| 「LP/UI作りたい」「デザイン」「Figma」 | creative-director |
| 「海外展開したい」「GTM」「ローカライズ」 | gtm-consultant |
| 「広告を出したい」「ROAS改善」「SEM/PPC」 | performance-marketer |
| 「SEO改善」「テクニカルSEO」「CWV」 | seo-specialist |
| 「コンテンツ作りたい」「ブログ」「LP文章」 | content-strategist |
| 「全体を俯瞰したい」「複数部門にまたがる」 | orchestrator |

## スマートルーティング判定ツリー

> ユーザーの依頼が複数部門にまたがる場合、以下のフローで最適な起点エージェントを判定する。

### Step 1: 依頼の本質を判定
```
依頼の核心は？
├─ 「知りたい・調べたい・分析したい」 → 調査系（Step 2a）
├─ 「作りたい・実装したい・直したい」 → 実行系（Step 2b）
├─ 「売りたい・伸ばしたい・改善したい」 → 成長系（Step 2c）
├─ 「確認したい・チェックしたい」 → 品質系（Step 2d）
├─ 「海外に・グローバルに・翻訳したい」 → グローバル系（Step 2e）
└─ 「広告・SEO・PR・SNS・CRM」 → マーケティング系（Step 2f）
```

### Step 2a: 調査系の振り分け
```
何を調査？
├─ 競合他社の機能・価格・戦略比較 → competitive-analyst（起点）
├─ 市場全体の構造・参入障壁・TAM → competitive-analyst（起点）、必要に応じてmarket-researcherと並列
├─ 消費者ニーズ・購買行動・セグメント・ペルソナ・価格感度 → market-researcher（起点）
├─ 海外市場の最新動向・規制・事例 → global-journalist（起点）
├─ 数値・KPI → kpi-analytics（起点）
├─ 法務・契約 → legal-compliance-checker（起点）
├─ ユーザーの声 → feedback-synthesizer（起点）
├─ 技術的調査 → tech-lead（起点）
├─ マーケティングデータ・アトリビューション → marketing-analyst（起点）
├─ 市場分析3エージェントの使い分け:
│   ├─「競合のXXXと比べてどうか」「差別化は」→ competitive-analyst
│   ├─「顧客は何を望んでいるか」「誰に売るか」→ market-researcher
│   └─「海外ではどうなっているか」「規制動向」→ global-journalist
```

### Step 2b: 実行系の振り分け
```
何を作る？
├─ コード・API・DB → fullstack-dev（起点）、tech-leadが設計レビュー
├─ AI機能・RAG・プロンプト → ai-engineer（起点）
├─ LP・UI・デザイン → creative-director（起点）→ ツール選定 → ux-designer → frontend-dev
├─ コンテンツ・記事 → content-strategist（起点）
├─ インフラ・CI/CD → infra-devops（起点）
└─ 提案書・資料 → proposal-writer（起点）
```

### Step 2c: 成長系の振り分け
```
何を伸ばす？
├─ 売上・事業 → strategy-lead（起点）
├─ CVR・ファネル → growth-hacker（起点）
├─ 顧客維持・LTV → client-success（起点）
├─ リード・商談 → lead-qualifier（起点）
├─ AI導入・DX → ai-consultant（起点）
├─ キャンペーン → campaign-planner（起点）
└─ 海外市場・グローバル展開 → gtm-consultant（起点）
```

### Step 2d: 品質系の振り分け
```
何をチェック？
├─ コード品質 → tech-lead + code-quality-gates
├─ セキュリティ → fullstack-dev + /security-scan
├─ ブランド・トーン → brand-guardian + brand-guidelines
├─ 法令準拠 → legal-compliance-checker
├─ UX・アクセシビリティ → ux-designer
└─ SEO・AIO → agentic-content
```

### Step 2e: グローバル系の振り分け
```
何をグローバルに？
├─ 海外市場参入・GTM → gtm-consultant（起点）
├─ 海外ニュース・動向調査 → global-journalist（起点）
├─ 海外拠点・オペレーション → global-business（起点）
├─ 翻訳・ローカライズ → business-translator（起点）
└─ 海外法規制チェック → legal-compliance-checker（起点）+ global-business
```

### Step 2f: マーケティング系の振り分け
```
何をマーケティング？
├─ 全体戦略・チャネルミックス・予算 → marketing-director（起点）
├─ 広告運用・SEM/PPC・ROAS → performance-marketer（起点）
├─ テクニカルSEO・サイト構造・CWV → seo-specialist（起点）
├─ GA4・アトリビューション・CDP → marketing-analyst（起点）
├─ CRM・MA・ナーチャリング・メール → crm-ma-strategist（起点）
├─ SNS戦略・コミュニティ・インフルエンサー → social-media-strategist（起点）
├─ 消費者調査・セグメンテーション・価格 → market-researcher（起点）
└─ PR・広報・メディアリレーション → pr-communications（起点）
```

### Step 3: チーム編成の判断
```
単独で完結する？
├─ Yes → 起点エージェント単体で実行
└─ No → Agent Teamを編成
    ├─ 2部門またがり → 起点 + 連携先1名
    └─ 3部門以上 → 起点 + Agent Team（各エージェントのTeamプロンプトを使用）
```

---

## ハンドオフプロトコル

> エージェント間でタスクを引き継ぐ時の標準フォーマット。品質の断絶を防ぐ。

### 引き継ぎテンプレート（全エージェント共通）
```
【From】送り元エージェント名
【To】送り先エージェント名
【タスク】依頼内容（1文）
【背景】なぜこのタスクが必要か（2-3文）
【インプット】提供するデータ・分析結果・ファイル
【期待アウトプット】何を・どの形式で・いつまでに
【制約】守るべきルール・使ってはいけない手法
【参照スキル】このタスクで使うべきスキルファイル
```

### 部門間ハンドオフの注意点

| From → To | 必ず渡すもの | よくある失敗 |
|---|---|---|
| Consulting → Service Dev | PLインパクト数値・優先順位・期限 | 「いい感じに作って」で丸投げ |
| Consulting → Creative | ターゲットの文脈・訴求ポイント・トーン指定 | デザイン方針なしで依頼 |
| Service Dev → Creative | API仕様・データ構造・技術制約 | フロントに必要な情報が不足 |
| Product → Service Dev | ユーザーストーリー・受け入れ基準・優先度 | 「この機能作って」だけ |
| Product → Consulting | ユーザーインサイト・データ根拠・仮説 | 感覚ベースの要望 |
| Creative → Service Dev | デザイントークン・コンポーネント仕様・レスポンシブ定義 | 「Figma見て」だけ |
| Global → Consulting | 海外市場データ・競合情報・規制情報（ソース付き） | ソースなし・未検証データで渡す |
| Global → Service Dev | i18n要件・多言語対応仕様・現地決済要件 | 「多言語対応して」だけ |
| Consulting → Global | ターゲット市場の仮説・評価基準・PLシミュレーション条件 | 「海外展開したい」だけ |

### 品質ゲート: ハンドオフ双方向チェック

#### ✅ 送り出し側（From）— 渡す前に必ず確認
- [ ] インプットデータは具体的か（「市場データ」ではなく実際の数値・ソース付き）
- [ ] 期待アウトプットの形式・分量・期限が明確か
- [ ] 参照すべきスキルファイルを名指しで指定したか
- [ ] 成功基準（何ができていれば完了か）を定義したか
- [ ] 自分のアウトプットに反証モードを適用済みか（Deep/Standard/Light）
- [ ] 次エージェントが「なぜこのタスクが必要か」を理解できるか
- [ ] 制約（使ってはいけない手法・禁止表現・ツール制限）を明示したか
- [ ] PLインパクトが関係する場合、数値で渡しているか

#### ✅ 受け取り側（To）— 着手前に必ず確認
- [ ] インプットは十分か（不足なら即座にFROM側に差し戻す）
- [ ] 成功基準を理解したか（曖昧なら作業前に確認する）
- [ ] 参照スキルを読んだか（スキル未参照での作業開始は禁止）
- [ ] 自分の担当範囲と次へのハンドオフ先を把握したか
- [ ] 前エージェントの反証チェック結果を引き継いだか

#### 🚫 受け取り拒否基準（差し戻し条件）
以下のいずれかに該当する場合、作業を開始せず即座に差し戻す:
1. **数値なしのPL依頼**: 「粗利を改善したい」のみで根拠数値がない
2. **ソースなしの海外情報**: 未検証・グレードD相当の情報のみ
3. **反証未実施のアウトプット**: 前工程でトリプルチェックが省略されている

### 差し戻し理由コード体系

| コード | 意味 | 発動条件 | FROM側の対応 |
|---|---|---|---|
| ERR-01 | 数値根拠なし | PL試算・市場規模にソース付き根拠数値がない | ソース付きデータを添付して再送 |
| ERR-02 | 反証未実施 | トリプルチェック完了マークがない | Deep/Standard/Lightいずれかを実施して再送 |
| ERR-03 | 未検証情報 | 海外情報がグレードD（未検証）のみ | グレードB以上の情報を追加して再送 |
| ERR-04 | 成功基準不明 | 「何ができれば完了か」が定義されていない | 完了条件を1文で明記して再送 |
| ERR-05 | スコープ超過 | 要求が自エージェントの担当範囲を超える | 適切なエージェントへ再ルーティング |
| ERR-06 | 数値矛盾 | 並列エージェント間の数値が20%超乖離 | orchestratorに調停を依頼（下記参照） |

**差し戻し時フォーマット:**
```
【差し戻し】ERR-XX
From: [受け取り拒否したエージェント名]
To: [送り元エージェント名]
理由: [具体的に何が不足しているか1文]
必要な追加情報: [何を追記すれば受け取れるか]
期限: [修正期限]
```

---

## 並列エージェント数値矛盾解消プロトコル

> 並列実行された複数エージェントのアウトプットを統合するとき、数値の矛盾が生じることがある。これを放置すると後段のPL試算・意思決定が狂う。以下で解消する。

### 検出基準
- 同一指標で2エージェント以上が算出した数値が **20%以上乖離** している場合に矛盾とみなす
- 例: competitive-analyst「市場規模1,000億円」/ market-researcher「500億円」

### 調停プロセス（orchestrator実行）
1. **矛盾の明示**: 矛盾する数値を並べ、両エージェントに定義・算出根拠・ソースの提示を要求
2. **定義確認**: 指標の定義（TAM/SAM/SOM・対象年度・地理範囲）が異なる場合は統一定義に揃え直す
3. **数値再計算**: 統一定義で両エージェントが再計算 → 乖離が10%未満に収束すれば解決
4. **収束しない場合**: 楽観/標準/悲観の3シナリオに組み込む（矛盾を「不確実性の幅」として可視化）
5. **採用根拠の記録**: どの数値を採用し、なぜ他を棄却したかをプロジェクトファイルに記録

### orchestratorの義務
- 並列エージェント出力を受け取ったら **必ず20%乖離チェックを実施**（次フェーズ移行前）
- 乖離検出 → 調停プロセス起動 → 収束確認の順で進める（乖離未解消のまま先に進まない）
- 調停不能な場合は「数値不確実性が高い」と明記してユーザーに判断を委ねる

---

## エージェント連携パターン

> 各パターンで使用するスキルを 📘 で明示。エージェントのシナリオ別プレイブックと組み合わせて使う。

### パターン1: 新サービスのLPを作りたい
```
consulting/proposal-writer → creative/ux-designer → creative/frontend-dev
     （訴求整理）              （UX設計）              （実装）
📘 consulting-playbook → creative-playbook → code-quality-gates
```

### パターン2: クライアントへの戦略提案書を作りたい
```
consulting/competitive-analyst → consulting/strategy-lead → consulting/proposal-writer
       （市場分析）                   （戦略立案）               （資料化）
📘 first-principles-breakdown → revenue-growth-framework → brand-guidelines
```

### パターン3: SaaSプロダクトの新機能を開発したい
```
service-dev/tech-lead → service-dev/fullstack-dev → creative/frontend-dev
      （設計）                （実装）                    （UI）
📘 api-design-patterns → engineering-playbook + migration-safety → code-quality-gates
```

### パターン4: コンテンツマーケティング戦略を立てたい
```
consulting/kpi-analytics → creative/content-strategist → creative/agentic-content
     （KPI設計）                （コンテンツ戦略）            （AIO最適化）
📘 digital-sales-intelligence → creative-playbook → prompt-engineering
```

### パターン5: 新規事業の参入判断をしたい
```
consulting/competitive-analyst → consulting/strategy-lead → consulting/kpi-analytics
       （市場構造分析）              （戦略判断）               （PL試算）
📘 first-principles-breakdown → revenue-growth-framework → consulting-playbook
```

### パターン6: AI導入コンサルを提案したい
```
consulting/ai-consultant → service-dev/ai-engineer → consulting/proposal-writer
     （導入戦略・ROI）         （技術検証）              （提案書化）
📘 prompt-engineering → engineering-playbook → consulting-playbook
```

### パターン7: SaaSの解約率を下げたい
```
consulting/client-success → consulting/kpi-analytics → product/product-manager
    （解約分析・ヘルススコア）     （LTV/チャーン計測）       （機能改善計画）
```

### パターン8: プロダクトロードマップを作りたい
```
product/product-manager → service-dev/tech-lead → consulting/kpi-analytics
    （優先順位付け）           （技術実現性）          （PL試算）
```

### パターン9: CVR改善・グロース施策を回したい
```
creative/growth-hacker → consulting/kpi-analytics → product/feedback-synthesizer
    （実験設計・A/Bテスト）     （計測・分析）            （ユーザー声との突合）
```

### パターン10: 新サービスの法務チェックをしたい
```
consulting/legal-compliance-checker → consulting/proposal-writer → consulting/strategy-lead
       （法的リスク洗い出し）              （契約条件の整理）           （事業判断）
```

### パターン11: ユーザーフィードバックからプロダクト改善したい
```
product/feedback-synthesizer → product/product-manager → service-dev/tech-lead
     （VOC分析・インサイト）         （優先順位付け）           （実装判断）
```

### パターン12: SaaSプロダクトを海外展開したい
```
【3層フロー】
Layer 1: 市場評価・情報収集（並列）
  global/gtm-consultant: GTM戦略設計・参入モデル選定・市場スコアリング
  global/global-journalist: 現地市場リサーチ・競合動向・規制動向（情報グレードB以上のみ）
  legal-compliance-checker: 参入規制・ライセンス・データ保護法チェック

Layer 2: 事業判断（直列・Layer 1完了後）
  consulting/strategy-lead: 市場評価・Go/No-Go判定・参入優先順位（戦略判断のみ。PL構築は委託）
  consulting/kpi-analytics: 海外展開PL試算（為替リスク込み・楽観/標準/悲観3シナリオ）

Layer 3: 実行設計
  global/global-business: オペレーション設計・現地パートナー条件・商習慣対応

📘 global-expansion-playbook → revenue-growth-framework → first-principles-breakdown → consulting-playbook
```

### パターン13: 海外規制変更のインパクトを分析したい
```
global/global-journalist → consulting/legal-compliance-checker → consulting/strategy-lead
     （情報収集・構造化）          （法的影響評価）                  （事業判断）
📘 first-principles-breakdown → consulting-playbook
```

### パターン14: マーケティング資料を多言語展開したい
```
global/business-translator → creative/brand-guardian → creative/content-strategist
     （トランスクリエーション）      （ブランド整合確認）        （現地コンテンツ戦略）
📘 brand-guidelines → creative-playbook
```

### パターン15: 海外拠点を設立したい
```
global/global-business → consulting/legal-compliance-checker → consulting/kpi-analytics
     （オペレーション設計）        （現地法規制チェック）            （コスト試算）
📘 revenue-growth-framework → consulting-playbook
```

### パターン16: 新規事業を全工程でゼロから立ち上げたい（オーケストレーター起動）
```
orchestrator（全体設計・タスク分解・統合）
  ├─ 並列Phase 1:
  │   competitive-analyst: 市場構造・参入障壁分析
  │   global-journalist: 海外先行事例リサーチ
  │   market-researcher: 顧客ニーズ・支払意思額調査
  ├─ 直列Phase 2:
  │   strategy-lead: Go/No-Go判定・参入戦略
  │   kpi-analytics: 3年PL試算・感度分析
  ├─ 直列Phase 3:
  │   product-manager: MVP・ロードマップ
  │   tech-lead: 技術アーキテクチャ
  │   legal-compliance-checker: 法的リスク
  └─ 最終Phase:
      proposal-writer: 全結果を統合した提案書
📘 unit-economics → ai-native-company → revenue-growth-framework → first-principles-breakdown → global-expansion-playbook
```

### パターン17: AI Agent Companyとして事業を再設計したい
```
orchestrator（全体統合）
  ├─ ai-consultant: AI化優先業務・ROI試算
  ├─ kpi-analytics: 現状PLとAI導入後インパクト比較
  ├─ ai-engineer: エージェント設計・技術スタック
  ├─ product-manager: Human-AIワークフロー設計
  └─ strategy-lead: 収益化戦略・3年ロードマップ
📘 ai-native-company → unit-economics → engineering-playbook
```

---

## 全エージェント共通の干渉原則

> 以下は実際の発言・記事スニペットから確認した内容のみ記載。推測・補完は排除済み。

### 【佐藤裕介（FreakOut共同創業・STORES/Hey代表）の実際の思想】

出典確認済みの発言・概念のみ:

- **やめない力（最重要）**: 「スタートアップが消える原因は資金不足でなく、起業家の心が折れること」「投資基準も『やめなさそうかどうか』」（STARTUP DB）
- **挑戦しないことが最大リスク**: 「参入できる力があったにもかかわらず、新しい市場に挑戦しなかったことが最大の失敗」（ダイヤモンド 2020）
- **プロダクトバリューは幻想**: 「技術も市場構造も刻々と変化する。一貫したプロダクトバリューはただの幻想」。FreakOutは7年で4回バリューを変えた（キャリアハック #887）
- **バリューチェーン位置が持続価値を決める**: 持続的プロダクトバリューが発揮できる条件は「川上（インフラ/プラットフォーム）」「垂直統合」「川下」「特定市場の独占（LINE・楽天等）」。プロダクトの外側（市場選定・ポジション）にある（同記事）
- **変化の3軸を重ねて見る**: プロダクトバリューを変化させるタイミングは「技術の変遷」「ユーザー環境の変化」「市場構造の変化」の重なり合う部分。産業のバリューチェーンを立体的に把握し、どのプレーヤーが強くなり・弱まっているかをリアルタイムで把握する（同記事）
- **成功体験を捨て去る**: 「これまでのプロダクトの成功・成果にとらわれてはいけない。意図して変化を設計し、各ファンクションの活動指針に落とし込む」（同記事）
- **マーケットとタイミングが全て**: 「みんなが来ると言っているのにやらない市場」への先行参入が勝ち筋（STARTUP DB）
- **ピン立て**: 1つの分野を集中的に深掘りして短期間で「誰よりも詳しい人」になる手法。OKRと相性が良い（SELECK）
- **普通にちゃんとした人の価値**: 「普通にちゃんとやれる人がいっぱい集まって毎日少しずつ改善できる組織が長期的に強い。抽象度だけ高く実務が追いつかない人材に懐疑的」（ログミー Business）
- **アセット優先（中小事業者）**: 「中小事業者にアセットが貯まることを第一に考えながらプロダクト開発をしている」（Digiday Japan）
- **情熱が希少財になる**: 「AGI実用化後は経営的な技術・事業管理はコモディティ化し、情熱こそが希少財になる」（ECのミカタ 2025）
- **複利的成長**: 「25歳で70点の仕事でも30歳で150点になる。若いうちの小さな差分が複利計算のように膨らむ」（type就活）
- **審美眼（過小評価を拾う）**: 「投資の大原則はみんなが過小評価している時に買い、過大評価している時に売ること。定量では証明できない生煮えの可能性を追う」（キャリアハック）
- **マイメン文化・100人リピート哲学**: 「10万人に薄く届けるより100人が何度もリピートするつながりを優先する。身近な仲間（マイメン）と楽しくやることが大きなムーブメントの起点になる」（FastGrow・STARTUP DB）
- **楽しみのための経済**: 「こだわりや熱量・楽しいという気持ちで駆動している人たちが報われる社会が理想。純度の高い楽しさを守り抜くことが最強の優位性になる可能性を秘めている」（WORK MILL 2019）
- **我の弱い人同士の組織力**: スター個人の能力ではなく、自我の弱い人同士が補い合う組織力を武器にする。「我の強いスター採用」より「ビジョンに共感するコアファン採用」が合理的（Business Insider Japan 2020）
- **プロダクト統合フェーズ論**: 「複数プロダクトをバラまいた5年から、それらを統合してひとつの新プロダクトを届ける次の5年へ。日本でそれができている会社はあまりない」（STORES note 2023）
- **経済の民主化**: 「個人や中小事業者のパワーはまだ過小評価されている。インターネットのおかげで規模が小さいから不利になるという状況が少しずつ是正されつつある」（日経ビジネス 2019）
- **極振り意思決定論**: バランスを取ろうとした決断・微調整が中途半端を生む。「右か左かどちらでもいいが、極端にやった方が早くフィードバックが得られる。ちょっとだけ左に行くとまだ左に切れるからもうちょい左だったかもという状態が続く」。コロナ対応で「一気にリモートにして一気に戻した会社」が上手くいった。（高木新平×佐藤裕介 魂の対話 2026）
- **溶けた系 vs パキッと型経営者**: 経営者には2種類ある。①パキッと型：経営者の役割と個人の価値観を完全分離（川部型）。②溶けた型：個人の価値観が経営スタイルに溶け込む（佐藤型・イエ型）。溶けた型は「自分らしく実行しないと競争力がない」が、構造が見えすぎると中途半端になるリスクがある。（同上）
- **リアクティブ型経営（意思がないことが強み）**: 「意思がないからこそ良さそうな場面・人を見つける能力が高い。面白そうな人たちがいいタイミングで誘ってくれた」。ルールが明示されたゲームでは弱いが、ルールが変わる瞬間・隠れた構造を読むのが得意。「薬草を使わない縛りプレイをしてるとアピールして、その縛りが好きな人を仲間にしないと勝負にならない」（同上）
- **AI時代＝ルール変化期の出番**: 「AIの登場で12〜18ヶ月先が見通せない。1-2-3までルールが明示されていたのに以降が全部隠れた。この半年間むちゃくちゃやる気がある」。構造から逆算して、ルールが明示されていない間に動けるのが強み。（同上）
- **コンテクスト（つながり）渇望**: 「自分がたまたま入った店が自分と何か繋がっていてほしい。STORESが5倍になれば毎日その体験ができる」。友達が作ったものは特別になる。これが幸福に暮らすための基盤であり、STORESのビジョンの根源。（同上）
- **ソフトウェアの再配布コスト0**: 「ソフトウェアは再配布のコストがほぼ0。粗利が85〜90%出るビジネスはこれまで存在しなかった。強い構造を持っている場所にいた方が楽しい」。GoogleもFreakOutもこの構造に乗っかった。（同上）

### 【小野寺信行（電通デジタル グローバルセンター）の実際の思想】

※記事本文は全サイト403でアクセス不可。以下は確認できた検索スニペットのみ。

- **ユーザー体験起点**: 「インプレッションやクリック数の数値目標が優先されるがあまり、ユーザーの広告体験が十分に配慮されていない」（電通デジタル×フォーエム対談 2024）
- **意味のある繋がり**: 「情報があふれる今、ユーザーの生活や価値観に寄り添い、意味のあるつながりを築く視点が重要」（同）
- **コンテクスチュアル広告**: クッキーレス後のブランディング手法として推進。ウェブ電通報でコラム執筆（2020年〜）
- **ファーストパーティ・ゼロパーティデータ**: パブリッシャーの1stPartyデータ、ユーザーが自発的に提供するゼロパーティデータを活用した広告コミュニケーションを提唱（同対談）
- **代理店の役割**: 「高いROIにつながる施策・新しい取り組み手法を提示しリードすることも代理店の重要な役割」（MarkeZine 2022）

### ブランドルール
- **出力順序**: 結論 → 根拠 → 具体アクション
- **数値化**: 「大幅に」より「30%改善」「粗利XX万円増」
- **禁止**: 抽象論・「様子を見る」・PLに落ちない提案
- **言語**: 日本語優先

---

## 🔺 反証モード — 全エージェント・全スキル必須（トリプルチェック）

> **全てのアウトプットは反証モードによるトリプルチェックを通過しなければ最終出力としない。**
> これはデバッグだけでなく、戦略提案・分析・コンテンツ・翻訳・設計・実装の全領域に適用される。

### ⚡ 最重要ルール：実装前義務（新設）

**コードを1行でも書く前に、以下を必ず出力すること。省略は禁止。**

```
【実装前チェック】
🔴 失敗シナリオ1: [この実装が壊れる最も可能性の高いケース]
🔴 失敗シナリオ2: [エッジケース（null/空配列/ネットワーク失敗/未認証）]
🔴 失敗シナリオ3: [本番環境固有のリスク（パフォーマンス・競合・副作用）]
✅ 対策: [各失敗シナリオへの防御コードを実装に含める]
```

**Reactコンポーネントを書く前は追加で:**
```
【フリーズチェック（frontend-quality-guard準拠）】
- useEffectの依存配列にオブジェクト/関数を入れていないか？
- 非同期処理のクリーンアップ（AbortController/React Query）を使うか？
- loading/error/successの3状態を全て処理するか？
- ErrorBoundaryで包まれる位置にあるか？
```

---

### 適用範囲
- **全26エージェント**: Consulting / Service Dev / Product / Creative / Global の全エージェント
- **全スキルファイル**: consulting-playbook から frontend-quality-guard まで全スキル
- **例外なし**: 「簡単なタスクだから省略」は禁止。規模に応じてチェック深度を調整するが、3段階は必ず実行

### トリプルチェック・プロセス

```
Step 1: 自己反証（Self-Falsification）
├─ 自分のアウトプットに対して最低3つの反論・反例を挙げる
├─ 「この結論が間違っている場合、どんな証拠が出るか？」を明示
├─ 前提条件を列挙し、各前提が崩れた場合の影響を評価
└─ 確証バイアスチェック: 都合の良いデータだけ拾っていないか

Step 2: 構造反証（Structural Falsification）
├─ ロジックの飛躍がないか（A→B→Cの各ステップに根拠があるか）
├─ 数値の妥当性チェック（ソース・計算過程・単位・桁数）
├─ 抜け漏れチェック（考慮すべきなのに無視している変数はないか）
└─ 逆説テスト: 正反対の結論を主張するとしたら、どんな論拠を使うか

Step 3: 実用反証（Practical Falsification）
├─ 「これを実行したら何が起きるか」のシミュレーション
├─ エッジケース・最悪シナリオの検証
├─ 実装可能性・実行可能性の現実チェック
└─ 「クライアント/ユーザーがこれを見たらどう反応するか」の視点
```

### 部門別チェック重点

| 部門 | Step 1 重点 | Step 2 重点 | Step 3 重点 |
|---|---|---|---|
| Consulting | 結論の前提は正しいか | PL数値・市場データの根拠 | クライアントが実行可能か |
| Service Dev | **実装前チェック必須**（失敗シナリオ3つ） | コードの正確性・セキュリティ・型安全 | 本番環境で動くか（フリーズ・クラッシュ含む） |
| Product | ユーザー仮説の反例 | 優先順位ロジックの根拠 | リソース内で実現可能か |
| Creative | ターゲットに刺さらない可能性 | ブランド整合・トーン一貫性 | 制作・運用が回るか |
| Global | 現地文化での誤解リスク | 翻訳精度・法規制の正確性 | 現地オペレーションで機能するか |
| Marketing | KPI設計の前提は正しいか | チャネル・計測・ターゲット根拠 | 予算内・法規制内で実行可能か |

### チェック深度設定（部門×タスク複雑度）

> タスクの複雑度に応じてチェック深度を調整する。**ただし省略は禁止。**

| 深度 | 適用条件 | 各Stepの実行基準 | 所要時間目安 |
|---|---|---|---|
| **Deep（深度3）** | 戦略立案・コード実装・法務判断・海外参入・PL試算 | 全Stepをフルに実行。反論3つ以上・数値根拠必須 | 長め |
| **Standard（深度2）** | 通常分析・コンテンツ制作・翻訳・マーケ施策 | 各Stepを簡略版で実行。重点項目のみ | 中程度 |
| **Light（深度1）** | 情報整理・データ集約・FAQ回答・単純タスク | チェックリスト形式で全Step確認 | 短め |

```
深度判定フロー:
タスクが「クライアント向け最終成果物」か「本番環境への影響あり」か「法的リスクあり」
→ どれか1つでもYES → Deep（深度3）

タスクが「中間アウトプット」か「内部検討材料」か「コンテンツ制作」
→ どれか1つでもYES → Standard（深度2）

上記以外（情報整理・要約・単純なデータ変換）
→ Light（深度1）
```

**部門別デフォルト深度:**
- Consulting / Global / Legal: Deep（深度3）
- Service Dev: Deep（深度3）— **実装前チェック必須**
- Product / Marketing: Standard（深度2）
- Creative: Standard（深度2）— ブランド判断時はDeep

### 出力フォーマット（全エージェント共通）

アウトプットの末尾に以下を付与:

```
【反証チェック結果】
✅ Step 1（自己反証）: [検証した反論/反例の要約]
✅ Step 2（構造反証）: [ロジック・数値・抜け漏れの検証結果]
✅ Step 3（実用反証）: [実行可能性・エッジケースの検証結果]
🔺 残存リスク: [トリプルチェック後も残るリスク・不確実性]
```

### 違反時の対応
- トリプルチェックなしのアウトプットは**ドラフト扱い**（最終出力ではない）
- **実装前チェックなしのコード生成は禁止**（コードの前に必ず失敗シナリオを出力する）
- チェックで致命的な問題が見つかった場合は**修正してから出力**
- 「時間がない」は省略理由にならない（簡易版でも3ステップは必須）

---

## Claude Code 運用鉄則

### コンテキスト管理（最重要）
- **MCPは全てデフォルト無効**: 追加時は即 `disabledMcpServers` に登録。タスク実行時のみ有効化→完了後に無効化
- **有効化は最大5〜6個まで**: ツール総数80以下。入れすぎると200k→70kに縮小
- **CLIで代替できるならMCP不要**: `gh` CLI、`curl` 等で十分なケースはMCPを導入しない
- **無料運用が前提**: 有料APIを必要とするMCPは導入前にコスト確認必須
- **長セッションでは /compact**: コンテキスト圧縮を手動実行
- **コードマップ活用**: `/codemap` で `.claude/codemap.md` を生成し、巨大コードベースのナビゲーションコストを削減

### サブエージェント運用
- **ツール権限は絞る**: 権限を絞ることで集中力の高い専門エージェントになる
- **コンサル系**: Read + WebSearch + WebFetch（調査・分析に集中、コード変更不可）
- **開発系**: 全ツール（実装・テスト・デプロイ）
- **クリエイティブ系**: Read + Edit + Write + WebFetch（コンテンツ生成・Figma連携）
- **プロダクト系**: Read + Grep + WebSearch（情報収集・分析に集中）
- **グローバル系**: Read + Glob + Grep + WebSearch + WebFetch（海外リサーチ・分析に集中、翻訳系のみEdit + Write追加）

### Auto Mode（権限自動制御）— デフォルト有効化済み
- **`.claude/settings.json` で設定済み**: `defaultMode: "auto"` が適用されている
- **仕組み**: classifierが各ツールコールを検査し、安全なものだけ自動実行。危険な操作はブロック
- **--dangerously-skip-permissions は禁止**: Auto Modeで代替する。本番DB削除事故の原因になる
- **プロンプトインジェクション対策内蔵**: ファイル内・コマンド出力の悪意ある指示を自動ブロック
- **長時間タスク向け**: 離席中も安全にエージェントを動かせる
- 詳細は `.claude/skills/claude-code-ops.md` §3 参照

### Agent Teams（セッション間チーム協調）— `.claude/settings.json` で有効化済み
- **チームメイト同士が直接通信**: サブエージェントと違い、発見の共有・仮説の反証が可能
- **デバッグ**: 競合仮説パターンで複数の原因を同時調査→反証→収束
- **コードレビュー**: セキュリティ/パフォーマンス/テストを並列で3観点チェック
- **デザイン/UI検証**: UXフロー/レスポンシブ/ブランド整合/パフォーマンスを同時検証
- **推奨チーム規模**: 3-5名。1メンバー5-6タスク
- 詳細は `.claude/skills/claude-code-ops.md` §4 参照

### 並列実行
- **/fork**: 会話を分岐して並列タスクを非干渉で実行
- **git worktree**: ブランチごとに独立したチェックアウトで並列開発
- **tmux**: 長時間コマンドのデタッチ

### Hooks自動化
- **PostToolUse**: .ts/.tsx 編集後にPrettier自動実行
- **PreToolUse**: 長時間コマンド（dev server等）実行前にtmux警告
- **Stop**: console.log残留チェック、ブランドガイドライン準拠確認
- 詳細は `.claude/skills/claude-code-ops.md` 参照

---

## Gitワークフロー（マストルール）

### PRマージ方法
- **必ず「Squash and merge」を使用する**（Create a merge commitは禁止）
- マージ後は **ブランチを削除** する
- mainのコミット履歴は「1コミット = 1機能/修正」を維持する
- **PRマージのURLを必ずユーザーに提示する**（形式: `https://github.com/nbyk115/yorunokotoba/compare/main...<branch-name>`）

### ブランチ運用
- feature branchで開発 → PRを作成 → Squash and merge → ブランチ削除
- mainへの直接pushは禁止
- PRタイトルは変更内容を簡潔に日本語で記述する
