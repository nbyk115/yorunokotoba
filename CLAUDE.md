# 🧠 ConsultingOS — 司令塔

## システム概要
**コンサル・サービス開発・クリエイティブ特化の3本柱マルチエージェントOS**
18名のエージェントが連携し、提案から実装・コンテンツまでを一気通貫で担う。

---

## ルーティングロジック

ユーザーの入力を分析し、以下のトリガーキーワードに基づいて適切なエージェントにルーティングする。
複数部門にまたがる場合は、連携フローに従って順次起動する。

### 🔴 Consulting（コンサルティング）
**トリガー**: 戦略, 提案, 分析, KPI, 競合, 事業, 商談, リード, 予測, レポート, 計画, PL, 粗利, 市場, SWOT, ポジショニング

| エージェント | ファイル | 起動条件 |
|---|---|---|
| strategy-lead | `.claude/agents/consulting/strategy-lead.md` | 全体戦略・事業計画・意思決定支援 |
| competitive-analyst | `.claude/agents/consulting/competitive-analyst.md` | 競合調査・ポジショニング・差別化 |
| proposal-writer | `.claude/agents/consulting/proposal-writer.md` | 提案書・ピッチデック・クライアント資料 |
| lead-qualifier | `.claude/agents/consulting/lead-qualifier.md` | 案件評価・ヒアリング設計・クロージング |
| kpi-analytics | `.claude/agents/consulting/kpi-analytics.md` | KPIツリー・ダッシュボード・予測モデル |

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

### 🟣 Creative（クリエイティブ・コンテンツ）
**トリガー**: デザイン, UI, UX, Figma, LP, コンテンツ, SNS, ブログ, HTML, CSS, キャンペーン, ブランド, AIO, トーン

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

---

## エージェント連携パターン

### パターン1: 新サービスのLPを作りたい
```
consulting/proposal-writer → creative/ux-designer → creative/frontend-dev
     （訴求整理）              （UX設計）              （実装）
```

### パターン2: クライアントへの戦略提案書を作りたい
```
consulting/competitive-analyst → consulting/strategy-lead → consulting/proposal-writer
       （市場分析）                   （戦略立案）               （資料化）
```

### パターン3: SaaSプロダクトの新機能を開発したい
```
service-dev/tech-lead → service-dev/fullstack-dev → creative/frontend-dev
      （設計）                （実装）                    （UI）
```

### パターン4: コンテンツマーケティング戦略を立てたい
```
consulting/kpi-analytics → creative/content-strategist → creative/agentic-content
     （KPI設計）                （コンテンツ戦略）            （AIO最適化）
```

### パターン5: 新規事業の参入判断をしたい
```
consulting/competitive-analyst → consulting/strategy-lead → consulting/kpi-analytics
       （市場構造分析）              （戦略判断）               （PL試算）
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

## Gitワークフロー（マストルール）

### PRマージ方法
- **必ず「Squash and merge」を使用する**（Create a merge commitは禁止）
- マージ後は **ブランチを削除** する
- mainのコミット履歴は「1コミット = 1機能/修正」を維持する

### ブランチ運用
- feature branchで開発 → PRを作成 → Squash and merge → ブランチ削除
- mainへの直接pushは禁止
- PRタイトルは変更内容を簡潔に日本語で記述する
