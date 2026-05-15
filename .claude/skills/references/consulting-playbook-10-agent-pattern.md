# 10-Agent ベンチマーク + ConsultingOS gap 分析（2026-05-14 統合）

`strategy-lead` + `tech-lead` + `infra-devops` + `client-success` + `proposal-writer` 連携の Claude Code agent 設計ベンチマーク + ConsultingOS gap identification。

出典: darkzodchi @zodchiii X.com 投稿「10 Claude Code agents nobody told you to build」(2026-05-12、INFERENCE: ユーザー提示テキスト経由) + ユーザー提示要約。

## 1. 核心テーゼ (10-agent 記事)

「Claude Code は『チャットで相談するツール』でなく、10 人分の AI エージェントを並列で動かす業務 OS として使うべき」

3 つの設置場所:
- Slash commands (`.claude/commands/<name>.md`): 手動起動、`/name`
- Hooks (`.claude/hooks/<event>.sh`): イベント自動起動（PreToolUse / PostToolUse / git events）
- Hosted scripts (Claude Agent SDK): サーバー上 24/7 稼働、schedules + webhooks

エージェント設計 3 要素: 職務定義 + 起動条件 + 出力形式

## 2. 記事の 10 Agent 構成

| # | Agent | 種別 | 用途 |
|---|---|---|---|
| 1 | PR Reviewer | Slash + GitHub hook | 90 秒で PR diff レビュー |
| 2 | Test Generator | Slash + pre-commit hook | 関数毎にテスト 3-5 ケース生成 |
| 3 | Bug Hunter | Hosted SDK | Sentry stacktrace → 修正 PR ドラフト |
| 4 | Doc Writer | Post-merge hook | README / docstrings / /docs 自動更新 |
| 5 | Refactor Tracker | Slash (weekly) | TODO / FIXME / 500 行超ファイル列挙 |
| 6 | Daily Standup | Hosted SDK | 8am に GitHub + Linear + Calendar 要約 |
| 7 | Customer Feedback | Hosted SDK (weekly) | Intercom + X + reviews クラスタリング |
| 8 | Cold Outreach | Hosted SDK | CRM lead → 個別メール下書き |
| 9 | Content Repurposer | Slash | 長文 → ツイート 3 + LinkedIn + Telegram + newsletter |
| 10 | Inbox Triage | Hosted SDK (30min) | Gmail 4 バケット分類 + 下書き |

ローカル運用 5: PR Reviewer / Test Generator / Doc Writer / Refactor Tracker / Content Repurposer
24/7 ホスト 5: Bug Hunter / Daily Standup / Cold Outreach / Customer Feedback / Inbox Triage

## 3. ConsultingOS との構造比較

### 3.1 ConsultingOS が exceed する 5 軸

| 軸 | ConsultingOS 優位 |
|---|---|
| Agent 数 | 27 (10 の 2.7 倍) |
| Skill 体系 | 38 skill (記事には無) |
| 規律層 | ハードルール 17 + 反証チェック + ハードルール 13 (記事には無) |
| カバー領域 | 6 部門（consulting / service-dev / product / creative / global / marketing-research）vs 記事 = code + 業務支援のみ |
| Hook 体系 | 21 hook (記事は数件) |

### 3.2 記事が exceed する 3 軸（ConsultingOS gap）

| Gap | 記事 | ConsultingOS 現状 |
|---|---|---|
| 24/7 ホスト | Teamly $29-179/月 で 5 agent 常時稼働 | ローカル + ユーザー対話駆動のみ、24/7 ホスティングなし |
| Slash コマンド多様性 | 5 種 (/review /tests /rot /repurpose ...) | 6 種 (/audit /level-up /review-pr /tdd /check-hallucination /analyze) ただし「業務自動化系」 (/standup, /repurpose, /inbox-triage 等) は未実装 |
| Webhook 駆動 | Sentry / Intercom / Gmail webhook 連携 | webhook 駆動なし、user 対話起点 |

## 4. ConsultingOS gap 対応戦略

### 4.1 Boris #3「先回り増設禁止」遵守

YOU MUST: 3 gap 全件を即実装するのは形骸化リスク。実需確認後の段階導入が原則。

実需基準:
- 24/7 ホスト: 関根さん N&Y Craft Phase 1 で「日次業界トレンド監視」が必須化したら検討
- Slash コマンド: /standup（daily 朝報）/ /repurpose（content-strategist 拡張）/ /inbox-triage（email 仕分け）を実需に応じて追加
- Webhook 駆動: 関根さん業界の特定イベント（在庫 / 配送）駆動が必須化したら検討

### 4.2 即実装候補（実需あり）

| Agent | 実需根拠 | 実装方法 |
|---|---|---|
| Content Repurposer | content-strategist agent 既存、 /repurpose slash コマンド未実装 | `.claude/commands/repurpose.md` 追加 |
| Daily Standup | evolution-log + git log の朝報自動化 | `.claude/commands/standup.md` 追加 |
| Refactor Tracker | 既存 /audit と類似、TODO / FIXME / 500 行超を機械検出 | `.claude/commands/rot.md` 追加候補 |

これらは「ConsultingOS の業務自動化系」として user 環境負担ゼロ。

### 4.3 保留候補（実需待ち）

| Agent | 保留理由 |
|---|---|
| Bug Hunter | ConsultingOS は基本コード少、Sentry 連携実需薄 |
| Cold Outreach | user は B2B コンサル orchestrator、cold outreach 実需薄 |
| Customer Feedback Synthesizer | feedback-synthesizer agent 既存、追加 hosted 不要 |
| Inbox Triage | user 環境（iPhone / Mac）依存、Gmail OAuth 整備が前提 |
| 24/7 ホスト全般 | Teamly $29-179/月 = 追加コスト、実需確認後 |

## 5. Teamly $29-179/月 ホスティングへの判断

YOU MUST: Teamly 採用は以下条件すべて満たした時のみ:

1. 24/7 稼働の実需 3 件以上（関根さん / 水野さん / 別案件）
2. ローカル運用で対応不能（user 不在時に動かす必要）
3. 月額コスト < 案件売上の 5%（経済合理性）

現状（2026-05-14）= 1 件目から該当しない、保留。

代替案: Anthropic Claude Code Agent View (PR #DK で物理化済) + `/goal` コマンド (PR #153) で「user 対話起点」「自走完了条件」を強化 = 24/7 ホスト不要で 7-8 割の効果。

## 6. ICP 提案質問 68-70 件目追加

`strategy-lead` + `proposal-writer` は提案時に追加で:

68. 自社の AI agent 構成が「職務定義 + 起動条件 + 出力形式」の 3 要素設計になっているか、それともチャットセッション止まりか
69. Slash コマンド / Hooks / Hosted SDK の 3 層を使い分けているか、それとも単一層に閉じているか
70. 業務自動化 agent の 24/7 ホスト化を実需ベースで判断しているか、無自覚に「ローカルのみ」「ホストのみ」のどちらかに固定していないか

## 7. ConsultingOS 自己診断（10-agent パターン適用）

| 評価軸 | ConsultingOS |
|---|---|
| 27 agent 体系 | 強（記事 10 の 2.7 倍）|
| Slash コマンド | 中（6 件、業務自動化系は未実装）|
| Hooks | 強（21 件）|
| 24/7 ホスト | 弱（実装なし、保留）|
| Webhook 駆動 | 弱（実装なし、保留）|
| 規律層 | 強（ハードルール 17 + 反証チェック、記事には無）|

= ConsultingOS は構造的に勝るが、3 つの gap は実需確認後に段階導入。

## 8. 関連参照

- 出典: darkzodchi @zodchiii「10 Claude Code agents nobody told you to build」2026-05-12（INFERENCE）
- 関連 skill: agent-view-integration (PR #DK + #153 /goal) / Tom Griffiths 8 条件 (PR #148) / AI ガードレール 3 層 (PR #150)
- 関連: 関根さん N&Y Craft / 水野さん v4

## 9. 反証チェック（Step 1-4 圧縮）

- Step 1: 10-agent 構成は INFERENCE（ユーザー提示テキスト経由、X.com 投稿）/ Teamly $29-179/月は INFERENCE（公式 URL 未取得）/ 3 軸 gap 評価は assistant 分析 INFERENCE
- Step 2: 既存 27 agent + 38 skill + 21 hook + 17 hard rules と整合検証、3 gap の独立性確認
- Step 3: ConsultingOS 自己診断は実装状況で実証、即実装候補 3 件は実需根拠明示
- Step 4 リスク即潰し: 「3 gap 全件即実装で形骸化」リスクは Boris #3 + 実需基準明示で構造的回避、段階導入のみ承認
