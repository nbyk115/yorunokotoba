# AI エージェントガードレール統合体系（2026-05-14 統合）

`strategy-lead` + `marketing-director` + `tech-lead` + `infra-devops` + `ai-engineer` + `client-success` 連携の AI エージェント運用ガードレール体系。マーケ広告に限定せず、AI エージェント全般 + 個人レベルの Claude Code 運用にも適用。

出典: Digiday「Marketers put up guardrails as AI agents reshape programmatic buying」(2026-05、INFERENCE: ユーザー提示 URL 経由) + ユーザー実体験（個人 Claude Code プロジェクトでのトークン消費爆発 + ビシビシ指導改善）。

## 1. 米国クライアント実例（FACT、ユーザー提示）

「米国のクライアントでは予算事故を経験しているところは結構いる」

= AI エージェント自律実行 = 構造的に予算事故リスクあり、未然防止策の体系化が必須。

## 2. ガードレール 3 層（外部 + 個人）

### 2.1 外部パートナー側支出上限（パートナー強制）

YOU MUST: AI エージェント運用提案で「パートナー側支出上限設定」を契約条項化:
- 広告 platform 側で日次 / 週次 / 月次 cap 強制
- エージェント側のバグ / 暴走に対する最終防衛線
- 自社制御失敗時の被害限定

### 2.2 自社内ゲートキーパーエージェント

YOU MUST: AI エージェント運用で「ゲートキーパー専任 agent」を必ず配置:
- 配下 agent の起案を承認 / 差戻し
- 予算 / KPI / 戦略整合性を機械検証
- 反証チェック発動

ConsultingOS 整合（既実装）:
- `marketing-director`: 配下 7 名のゲートキーパー（60/40 ルール + 指標分岐宣言、PR #148 でエージェンティック広告 5 規律追加済）
- `brand-guardian`: 反証ゲート専任、HTML 出力 5 項目機械検証（PR #140）
- ハードルール 17 主語詐称禁止: agent 起動有無の明示で責任所在明確化

### 2.3 個人レベル / Claude Code セッション

ユーザー実体験: 「エージェントが試行錯誤 → 詰む → あらぬ方向 → トークン消費爆発」

YOU MUST: Claude Code 運用で以下ガードレール強制:
1. Karpathy 12 ルール「ルール 6 トークン予算」: タスク単位 4,000 / セッション単位 30,000 トークン、超過明示
2. Karpathy 12 ルール「ルール 10 重要ステップごとにチェックポイント」: 流れを見失ったら止まり、現状を再整理する
3. ビシビシ指導 = mid-turn correction（アルトマン式原則 2 エージェント管理 CEO スキル）
4. 詰まり検知 → 即停止 → 人間介在で軌道修正
5. 並列 agent 起動時の役割明示（Princeton メタ認知層、PR #148）

## 3. Tom Griffiths 8 条件（既存、再整理）

予算権限委譲時の 8 条件（PR #148 で marketing-director に物理化済）:

1. 予算上限 (budget cap)
2. 成果の境界値 (outcome boundaries)
3. 戦略的制約 (strategic constraints)
4. 説明可能性 (explainability)
5. 監査可能性 (auditability)
6. ロールバック可能性 (rollback)
7. 学習閾値 (learning thresholds)
8. エスカレーションルール (escalation)

これらは「外部パートナー側支出上限」+「自社内ゲートキーパー」+「個人レベル運用」すべてに横断適用可能。

## 4. ConsultingOS 自己診断（ガードレール体系）

| ガードレール | 既実装 |
|---|---|
| ゲートキーパー agent | marketing-director (配下 7 名) / brand-guardian (反証ゲート) |
| 8 条件物理化 | marketing-director description (PR #148) |
| トークン予算明示 | Karpathy ルール 6 (PR #138) |
| 詰まり検知 + 停止 | reality-check.sh / stop-validator.sh / stop-os-check.sh |
| 並列 agent 役割明示 | ハードルール 17 主語詐称禁止 + Autonomous Mode 既定化 |
| 反証チェック Step 4 リスク即潰し | 全アウトプット末尾必須 |
| 人間介在ポイント | DRI 明示 (ハードルール 17) + センシティブ意思決定（保険 / 健康 / 法務、PR #148） |

= 既存ハードルール 17 体系 + 21 hook で 7 軸全件カバー、追加実装不要。本 references は「ガードレールの言語化 + 提案テンプレート化」が主目的。

## 5. クライアント提案テンプレート

### 5.1 AI 導入提案の必須セクション

```
## AI エージェント運用ガードレール（必須セクション）

1. 外部パートナー側支出上限
   - 日次 / 週次 / 月次 cap 強制
   - パートナー契約に明文化

2. 自社内ゲートキーパー
   - 専任ゲートキーパー agent 配置
   - 配下 agent の承認 / 差戻し権限

3. Tom Griffiths 8 条件全件遵守
   - 予算上限 / 成果境界 / 戦略制約 / 説明可能性 / 監査可能性 / ロールバック / 学習閾値 / エスカレーション

4. 詰まり検知 + 人間介在
   - トークン予算明示
   - チェックポイント設置
   - mid-turn correction 設計
```

### 5.2 関根さん N&Y Craft OEM 提案への適用

Phase 1 オンボーディング標準フローにガードレール 4 項目を組み込み:
- パートナー (Anthropic / API) 側の月次トークン cap
- N&Y Craft 専用ゲートキーパー設計（業界知識 + ConsultingOS 規律統合）
- 8 条件のうち「予算上限 / エスカレーション」を最優先実装
- 詰まり検知 hook（業界 KPI 異常検出）

### 5.3 水野さん v4 投資判断への適用

投資先評価軸に「AI エージェントガードレール体系の整備度」追加:
- ガードレール未整備 = 予算事故リスク = 投資見送り判断材料
- ガードレール整備済 = 運用成熟度高い = 投資優位

## 6. 既存原則との接続

- アルトマン式原則 2 エージェント管理 CEO スキル: ビシビシ指導 = mid-turn correction の物理実装
- ドーシー流原則 1 3 役割集約: DRI 集中 = 人間介在ポイント明示
- Anthropic 垂直 OS Human-in-the-loop: センシティブ意思決定の人間介在義務
- ダーク・ファクトリー原則 3 責任設計: ガードレール = 責任設計の具体実装
- Karpathy 12 ルール 6 (トークン予算) + 10 (チェックポイント): 個人レベルガードレールの物理化
- Tom Griffiths 8 条件 (PR #148): 予算権限委譲の機械検証

## 7. ICP 提案質問 61-63 件目追加

`strategy-lead` + `marketing-director` + `tech-lead` は提案時に追加で:

61. AI エージェント運用で「外部パートナー側支出上限」+「自社内ゲートキーパー」+「個人レベルガードレール」の 3 層体系を整備しているか
62. Tom Griffiths 8 条件全件を機械検証で物理化しているか、それとも口頭規律で終わっているか
63. AI エージェント詰まり検知 + 人間介在 + mid-turn correction を運用フローに組み込んでいるか

## 8. ConsultingOS 自己診断（2026-05-14 時点）

| ガードレール 3 層 | 自己適用度 |
|---|---|
| 外部パートナー側支出上限 | 中（Anthropic API 月次 cap は user 環境設定）|
| 自社内ゲートキーパー | 強（marketing-director + brand-guardian、PR #148）|
| 個人レベル | 強（ハードルール 17 + 21 hook + Karpathy 12 ルール）|

## 9. 関連参照

- 出典: Digiday「Marketers put up guardrails as AI agents reshape programmatic buying」(2026-05、INFERENCE)
- 関連 skill: agentic-advertising-foundry-nyc (Tom Griffiths 8 条件) / karpathy-12-rules (トークン予算 + チェックポイント) / dark-factory (責任設計) / altman-solopreneur (エージェント管理 CEO スキル)
- 関連 agent: marketing-director (ゲートキーパー実装) / brand-guardian (反証ゲート) / strategy-lead (戦略整合)
- 関連 hook: reality-check.sh / stop-validator.sh / stop-os-check.sh

## 10. 反証チェック（Step 1-4 圧縮）

- Step 1: Digiday 記事は INFERENCE（ユーザー提示 URL 経由、内容詳細未取得）/「米国クライアント予算事故経験者結構いる」はユーザー口頭 FACT / ユーザー個人 Claude Code 体験は FACT
- Step 2: 既存 31 原則 + Defensibility 7 軸 + Tom Griffiths 8 条件 (PR #148) + Karpathy 12 ルール (PR #138) と整合検証、新規性は「3 層ガードレール体系の汎用化 + 個人レベル追加」
- Step 3: ConsultingOS 自己診断は既存実装で 7 軸全件カバー実証
- Step 4 リスク即潰し: 「外部パートナー側 cap が user 環境依存」リスクは Anthropic API console での月次 cap 設定推奨を明示、クライアント提案では契約条項化を必須セクションとして物理化
