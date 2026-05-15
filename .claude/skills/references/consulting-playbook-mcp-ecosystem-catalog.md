# MCP エコシステム 30 サーバー catalog + 選定基準 + TradingView 水野さん適用検討（2026-05-14）

`strategy-lead` + `tech-lead` + `infra-devops` + `ai-engineer` + `marketing-director` 連携の MCP 選定 / 拡張フレーム。Boris #3 先回り禁止 + CLAUDE.md §4 (MCP 最大 5-6 個) + Hard Rule 13 形骸化防止と整合した段階導入戦略。

出典: Claude Code Studio @ClaudeCode_love + the_smart_ape (X.com 海外 130 万 view、INFERENCE: ユーザー提示テキスト経由) + DeFiTracer (TradingView MCP、INFERENCE)。一次出典 URL 別途確認推奨。

## 1. 規律: MCP 全件導入の禁止

YOU MUST: 30 MCP 一気導入は以下 3 規律により構造的禁止:
- CLAUDE.md §4: MCP 全てデフォルト無効、有効化最大 5-6 個
- Boris #3: 先回り増設禁止、実需確認後
- Hard Rule 13: 追加は削除と 1 セット、形骸化防止

選択的導入の基準（4 軸）:
1. 実需証拠あり（案件で詰まった経験 / 月 3 回以上の手動操作）
2. 既存 MCP / hook / skill との重複なし
3. ConsultingOS 27 agent + 38 skill 体系への統合パス明確
4. CLAUDE.md §4 の最大数 (5-6 個) 内に収まる

= 30 MCP 中、実需確認後の選択導入のみ承認。catalog は「実需発生時の参照リスト」として活用。

## 2. ConsultingOS 既存 MCP 状況（2026-05-14）

| 既存 MCP | 用途 | 状態 |
|---|---|---|
| Figma MCP | デザイン参照、Code Connect | 利用中 |
| GitHub MCP | PR / Issue / コミット操作 | 利用中 (本セッションで PR #131-#158 連続実行) |
| Lazyweb MCP | UI 参照ギャラリー 257k スクリーン | インストール済 (PR #141)、token 取得保留中 |

= 3 個、CLAUDE.md §4 最大 5-6 個の余白 2-3 個。

## 3. 30 MCP カタログ（記事転記、優先度フラグ付き）

INFERENCE: 各 MCP のスター数 / 機能詳細は記事提示、一次出典 URL 別途確認推奨。

### 3.1 開発・コード系 5 件

| MCP | ConsultingOS 優先度 | 理由 |
|---|---|---|
| GitHub MCP (28k stars) | 既導入 | 必須、PR 連続マージ実証済 |
| Playwright MCP | 中 | HTML + Playwright スクリーンショット (PR #140 visual 生成フロー) で実需あり、検討候補 |
| Sentry MCP | 低 | ConsultingOS はコード少、Sentry 連携実需薄 |
| Semgrep MCP | 低 | security-scan slash command 既存、重複 |
| CircleCI MCP | 低 | CI/CD 実需薄 |

### 3.2 データベース・データ系 5 件

| MCP | ConsultingOS 優先度 | 理由 |
|---|---|---|
| PostgreSQL / Neon MCP | 低-中 | 関根さん / 水野さん案件で DB 利用時に検討 |
| Supabase MCP | 低-中 | OEM 展開時 backend 利用候補 |
| Neo4j MCP | 低 | ナレッジグラフ実需薄 |
| Qdrant MCP | 中 | RAG / ベクトル検索、Anthropic 垂直 OS (PR #133) と連動候補 |
| ClickHouse / Tinybird MCP | 低 | 大規模分析実需薄 |

### 3.3 クラウド・インフラ系 5 件

| MCP | ConsultingOS 優先度 | 理由 |
|---|---|---|
| AWS MCP スイート | 低 | ConsultingOS は GitHub 中心、AWS 直接利用なし |
| Cloudflare MCP | 中 | OEM 展開時 edge / DNS 利用候補 |
| Grafana MCP | 低 | ダッシュボード実需薄 |
| Railway MCP | 中 | OEM 展開時 deploy 利用候補 |
| Render MCP | 中 | Railway 代替候補 |

### 3.4 生産性・ビジネス系 6 件

| MCP | ConsultingOS 優先度 | 理由 |
|---|---|---|
| Notion MCP | 中-高 | クライアント納品ドキュメント、関根さん / 水野さん協業候補 |
| Slack MCP | 中 | コミュニケーション統合、実需確認後 |
| Gmail MCP | 中 | 10-agent パターン (PR #155) Inbox Triage 実装時に必須 |
| Jira / Asana MCP | 低 | コンサル業務で実需薄 |
| Stripe MCP | 中 | 関根さん OEM 課金導入時に検討 |
| HubSpot MCP | 中 | marketing-director + client-success 連携、CRM 実需時 |

### 3.5 Web スクレイピング・データ抽出系 4 件

| MCP | ConsultingOS 優先度 | 理由 |
|---|---|---|
| Firecrawl MCP | 中-高 | 競合分析 / market-researcher の調査自動化、実需あり |
| Browserbase MCP | 中 | クラウド browser、Playwright 代替候補 |
| Bright Data MCP | 低 | エンタープライズ向け、ConsultingOS は中小特化 |
| Apify MCP | 中 | 3000 スクレイパー、market-researcher 拡張候補 |

### 3.6 AI・ナレッジ・メモリ系 3 件

| MCP | ConsultingOS 優先度 | 理由 |
|---|---|---|
| Memory MCP (公式) | 高 | パターン 4 Memory + Dreaming (PR #158) gap 補完候補 |
| Sequential Thinking MCP (公式) | 高 | 反証チェック Step 1-4 + 構造的推論強化候補 |
| Context7 MCP | 中-高 | 最新ドキュメント参照、ハルシネーション防止 (ハードルール 1 真の 100 原則) |

### 3.7 メディア・デザイン系 2 件

| MCP | ConsultingOS 優先度 | 理由 |
|---|---|---|
| Figma MCP | 既導入 | 必須 |
| ElevenLabs MCP | 低 | 音声生成実需薄、将来 content-strategist 拡張時 |

### 3.8 金融・分析系（記事外、追加）

| MCP | ConsultingOS 優先度 | 理由 |
|---|---|---|
| TradingView MCP (DeFiTracer) | 中（水野さん限定）| 個人投資家補助、ただし angel investment (private) でなく株式 (public)、間接利用 |

## 4. 即実装候補 3 件（実需証拠あり）

| MCP | 実需根拠 | ConsultingOS への効果 |
|---|---|---|
| Context7 MCP | ハードルール 1 真の 100 原則 + ハルシネーション防止 | 最新ドキュメント参照で出典なし数値断言リスク低減 |
| Sequential Thinking MCP (公式) | 反証チェック Step 1-4 + 構造的推論 | パターン 2 Outcomes Loop (PR #158) のルーブリック明示と連動 |
| Memory MCP (公式) | パターン 4 Memory + Dreaming gap (PR #158) | 24/7 ホスト不要で半自動 Memory 実装 |

= 3 件導入で CLAUDE.md §4 最大数 (5-6 個) ぎりぎり、追加は当面禁止。

## 5. 水野さん向け TradingView MCP 評価（honest）

### 5.1 直接フィット度: 中

| 評価軸 | フィット度 | 詳細 |
|---|---|---|
| 個人投資家補助 | 中 | エンジェル投資 (private market) でなく株式 (public market) ツール、間接利用 |
| 投資先 fintech 競合分析 | 高 | Anthropic 垂直 OS 金融 vertical (PR #133) と連動 |
| 個人スキル習得 (AI x 金融データ可視化) | 中-高 | 退任後個人投資家としてのスキル拡張、ジーニー卒業後の付加価値 |

### 5.2 採用判定

YOU MUST: 水野さん本人が「TradingView 使いたい」と明示するまで導入見送り。理由:
- ConsultingOS 本体の実需薄（コンサル業務 = 金融データ分析でない）
- 水野さん個人環境（Mac / iPhone）でのセットアップ前提、ConsultingOS sandbox とは別環境
- Boris #3 先回り禁止

代替: 水野さん v4 投資テーゼ補強として「金融 vertical AI-OS への TradingView 等 MCP エコシステム拡大」を pitch 要素化（実装でなく言及のみ）。

## 6. ICP 提案質問 74-75 件目追加

74. AI 導入で MCP を「全件導入」してないか、CLAUDE.md §4 風の最大数規律 + 実需確認後の段階導入を遵守しているか
75. 自社の MCP ポートフォリオ（既存 + 候補 + 保留）が「実需証拠 + 既存重複なし + 統合パス明確 + 最大数内」の 4 軸で選定されているか

## 7. ConsultingOS 自己診断（MCP エコシステム観点）

| 評価 | 現状 |
|---|---|
| 既存 MCP 数 | 3 (Figma + GitHub + Lazyweb) |
| CLAUDE.md §4 最大数 (5-6) 余白 | 2-3 個 |
| 即実装候補 | Context7 / Sequential Thinking / Memory (公式 Anthropic) |
| 保留候補 | Notion / Gmail / Firecrawl / Stripe / TradingView 等 |
| 全件導入リスク | 構造的に発生不可能（CLAUDE.md §4 + Boris #3 + Hard Rule 13）|

## 8. 関連参照

- 出典: Claude Code Studio + the_smart_ape + DeFiTracer (X.com 海外 130 万 view、INFERENCE)
- 関連 skill: 10-agent パターン (PR #155) / 5 Orchestration Patterns (PR #158) / AI ガードレール (PR #150)
- 関連: Lazyweb MCP (PR #141) / DESIGN.md §12.3
- 関連 hard rules: CLAUDE.md §4 (MCP 最大 5-6) + Boris #3 (先回り禁止) + Hard Rule 13 (形骸化防止)

## 9. 反証チェック（Step 1-4 圧縮）

- Step 1: 30 MCP カタログはユーザー提示 INFERENCE / スター数 / 機能詳細は記事提示 INFERENCE / 一次出典 URL 別途確認推奨 / TradingView MCP の水野さん適性は assistant 分析 INFERENCE
- Step 2: CLAUDE.md §4 + Boris #3 + Hard Rule 13 と整合検証、選定基準 4 軸明示、ConsultingOS 既存 3 MCP との重複確認
- Step 3 実用反証: 即実装候補 3 件は実需根拠明示 / 保留 27 件は理由付き / 水野さん向け TradingView は honest 評価
- Step 4 リスク即潰し: 30 MCP 一気導入リスクは CLAUDE.md §4 最大数規律で構造的回避、選択的段階導入のみ承認、水野さん向けは本人明示要求まで保留
