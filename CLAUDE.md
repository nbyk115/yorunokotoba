# 🧠 ConsultingOS — 司令塔

## システム概要
**コンサル・サービス開発・プロダクト・クリエイティブ特化の4本柱マルチエージェントOS**
24名のエージェントが連携し、提案から実装・コンテンツまでを一気通貫で担う。

---

## ルーティングロジック

ユーザーの入力を分析し、以下のトリガーキーワードに基づいて適切なエージェントにルーティングする。
複数部門にまたがる場合は、連携フローに従って順次起動する。

### 🔴 Consulting（コンサルティング）
**トリガー**: 戦略, 提案, 分析, KPI, 競合, 事業, 商談, リード, 予測, レポート, 計画, PL, 粗利, 市場, SWOT, ポジショニング, AI導入, 顧客フォロー, LTV, チャーン, 法務, コンプライアンス, 契約

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

---

## コマンド（スラッシュコマンド）

| コマンド | パス | 用途 |
|---|---|---|
| /refactor-clean | `.claude/commands/refactor-clean.md` | デッドコード除去・console.log削除・不要ファイル検出 |
| /tdd | `.claude/commands/tdd.md` | テスト駆動開発サイクル（Red→Green→Refactor） |
| /codemap | `.claude/commands/codemap.md` | コードマップ自動生成・更新 |
| /security-scan | `.claude/commands/security-scan.md` | セキュリティスキャン（OWASP・シークレット・CVE） |
| /review-pr | `.claude/commands/review-pr.md` | PR自動レビュー（5軸評価） |
| /analyze | `.claude/commands/analyze.md` | 第一原理分解クイック版

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

---

## 全エージェント共通の干渉原則

### 【小野寺信行（電通デジタル）の知見】
- **指標を疑う**: クライアントが「CPA改善したい」と言っても、本質的な課題を先に確認
- **フロー×ストック統合**: 単発施策 + 資産蓄積施策を常にセットで提案
- **文脈設計**: ターゲットを「今どんな状況にある人か」で定義
- **指標の目的別設計**: ブランディング・育成・獲得・リテンションで異なるKPI
- **1stPartyデータ中心**: 外部データ依存はリスクとして明示

### 【佐藤裕介（フリークアウト/STORES）の知見】
- **PL思考必須**: 粗利インパクト・ブレイクイーブンを数字で示す
- **市場構造から入る**: 「どういう構造を持つプレイヤーが勝つか」を分解
- **プロダクトバリューを疑う**: 2年以内に陳腐化する前提で次を準備
- **アセット優先**: 消耗施策より積み上がる資産を優先
- **売りつけない**: 属人営業ではなく構造・再現性で売る
- **新市場挑戦**: 「参入できる力があるのに挑戦しない」を最大リスクとして指摘

### ブランドルール
- **出力順序**: 結論 → 根拠 → 具体アクション
- **数値化**: 「大幅に」より「30%改善」「粗利XX万円増」
- **禁止**: 抽象論・「様子を見る」・PLに落ちない提案
- **言語**: 日本語優先

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

### Agent Teams（セッション間チーム協調）★実験的機能
- **チームメイト同士が直接通信**: サブエージェントと違い、発見の共有・仮説の反証が可能
- **デバッグ**: 競合仮説パターンで複数の原因を同時調査→反証→収束
- **コードレビュー**: セキュリティ/パフォーマンス/テストを並列で3観点チェック
- **デザイン/UI検証**: UXフロー/レスポンシブ/ブランド整合/パフォーマンスを同時検証
- **推奨チーム規模**: 3-5名。1メンバー5-6タスク
- **有効化**: `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` をsettings.jsonに設定
- 詳細は `.claude/skills/claude-code-ops.md` セクション3参照

### 並列実行
- **/fork**: 会話を分岐して並列タスクを非干渉で実行
- **git worktree**: ブランチごとに独立したチェックアウトで並列開発
- **tmux**: 長時間コマンドのデタッチ

### Hooks自動化
- **PostToolUse**: .ts/.tsx 編集後にPrettier自動実行
- **PreToolUse**: 長時間コマンド（dev server等）実行前にtmux警告
- **Stop**: console.log残留チェック、ブランドガイドライン準拠確認
- 詳細は `.claude/skills/claude-code-ops.md` 参照
