# Agent View 統合運用ガイド（2026-05-09 PR DK 物理化）

> Claude Code 公式機能「Agent View」(Research Preview、2026-05) を ConsultingOS 27 agent 並列起動運用に統合するガイド。`claude-code-ops/SKILL.md` のサブ参照。

## 0. `/goal` コマンド統合（2026-05-14 追加、v2.1.139 で公式追加）

Anthropic が 2026-05-11 公式追加。完了条件を 1 行書くと Claude が達成まで複数ターン自走する仕組み。「続けて」連打が不要化、auto mode 併用で完全放置可能。

機能:
- 完了条件: 自然言語で指定（例: `test/auth 全パスかつ lint クリーン`）
- 評価者: 既定 Haiku、各ターン後に yes/no と理由を返却
- 状態: turns / tokens / elapsed をオーバーレイ表示
- 「Ralph loop」内蔵化

利用方法:
- CLI: `/goal [条件]` または `claude -p "/goal ..."` で非対話起動
- Remote Control でも動作
- session-scoped Stop hook のラッパー

出典: code.claude.com/docs/en/goal（INFERENCE: ユーザー提示テキスト経由）

ConsultingOS 整合:
- 既存 stop-validator.sh / stop-os-check.sh hook と統合候補（agent 自走時の反証チェック発火）
- ハードルール 17 Autonomous Mode 既定化と完全整合
- AI エージェントガードレール 3 層体系（PR #150）の「個人レベル運用」での自走条件明示化に直接活用

YOU MUST: 関根さん N&Y Craft Phase 1 構築 / 水野さん v4 書き直し等の大規模タスクで `/goal` 採用検討。完了条件 = 反証チェック Step 1-4 全項目 PASS + 規律 hook 全件 PASS 等を 1 行で指定。

Tom Griffiths 8 条件（PR #148）と連携:
- 予算上限: `/goal` の elapsed / tokens 上限を活用
- エスカレーション: Haiku 判定が一定回数 no なら停止 + 人間介在
- 監査可能性: turns / tokens / elapsed オーバーレイ = ログ可視化

ConsultingOS 案件での標準活用パターン:
| シーン | `/goal` 完了条件例 |
|---|---|
| 反証チェック修正 | `反証チェック Step 1-4 全項目 PASS + brand-guardian 5 項目検証 PASS` |
| visual 制作 | `lang=ja + charset=UTF-8 + Noto Sans JP + em-dash 0 + raw ** 0 全件 PASS` |
| skill 統合 | `consulting-playbook.md 500 行以下 + 出典明記 + 反証チェック付与` |
| OEM 案件構築 | `oem-base-kits/ 全 125 ファイル整合 + ICP.md 完成 + DESIGN.md 整合` |

### /goal 受け入れ基準設計 (2026-05-15 追加、書き方が成否の 80%)

YOU MUST: /goal の完了条件は「観察可能な終了状態」を記述。「ジュニア開発者へのチケット」メンタルモデルで受け入れ基準を書く。

#### Good Goals (機能する 3 要件)

1. 観察可能な終了状態 (テスト出力 / ビルド結果 / ファイル差分 等)
2. 評価者が transcript から確認可能
3. 具体的なアーティファクト指定

例:
- `test/auth の全テスト PASS + lint クリーン` (テスト出力で確認)
- `古い API の全呼出箇所が移行 + build 成功` (build 出力で確認)
- `CHANGELOG.md に今週マージ全 PR のエントリ追加` (ファイル + 内容指定)

#### Bad Goals (失敗 2 パターン)

1. 終了条件不明確 → エージェント無限ループ
2. 評価者が幻覚的成功宣言 → トークン浪費

NG 例:
- 「コードベースを良くする」(指標不明)
- 「すべてをリファクタリング」(終了条件なし)
- 「バグを修正」(どのバグ / 検証方法不明)

#### 複雑タスクの分解

「authを再設計 + OAuth追加 + テスト + ドキュメント」= 4 つの目標を 1 つに装っている。

YOU MUST: 連続した /goal 呼出に分解、各 /goal は単一の検証可能な終了線:

```
/goal 1: auth を再設計、test/auth 全 PASS
/goal 2: OAuth 統合、test/oauth 全 PASS
/goal 3: ドキュメント更新、CHANGELOG.md + README.md 整合
```

#### /goal vs /loop vs Stop hooks

- `/goal`: モデル検証された完了条件で停止、outcome-based work 向け
- `/loop`: スケジュール反復、polling / 定期タスク向け
- Stop hooks: 各ターン後のカスタム評価ロジック、柔軟だがセットアップ多

#### ConsultingOS 受け入れ基準テンプレート (関根さん / 水野さん向け)

| 案件タイプ | /goal 完了条件 |
|---|---|
| 関根さん Phase 1 構築 | `oem-base-kits/n-y-craft-os/ 125 ファイル全件存在 + ICP.md 完成 + DESIGN.md §12 整合 + 反証チェック Step 1-4 付与` |
| 水野さん v4 書き直し | `事業計画 7 ファイル + HTML pitch 1 形式 + 反証チェック PASS + FACT/INFERENCE/SPECULATION 全件付与 + ハルシネーション 0` |
| visual 制作 | `1280×720 HTML + brand-guardian 5 項目 (lang/charset/font/em-dash/raw**) 全 PASS` |
| skill 統合 PR | `consulting-playbook.md 500 行以下 + em-dash 0 + 反証チェック付与 + main マージ済` |
| 反証チェック修正 | `Step 1-4 全項目 + 実測コマンド出力添付 + brand-guardian PASS` |

#### 自己生成パターン (/goal 書けない時)

```
Write me a /goal prompt. Ask me what I'm trying to do first, then keep asking
follow-up questions until you can describe 'done' in specific, measurable terms.
```

= Claude に /goal 完了条件を逆生成させる、ConsultingOS の strategy-lead 起動 (パートナー級論点設計 = PR #166 資料作りの基本の型 ①) と同型構造。

#### アンチパターン検知 4 件

YOU MUST: 以下を検知したら即停止、/goal 書き直し:

1. 曖昧な動詞 (「改善」「リファクタ」「最適化」) のみ
2. 検証可能なアーティファクト未指定
3. 複数目標を 1 つに装う
4. 評価者が transcript から確認不能 (Claude が結果を出力しない)

## 1. Agent View 機能概要（FACT、Anthropic 公式）

Claude Code が「1 チャットでコードを書くツール」から「複数 AI 作業員を同時に動かす開発 OS」へ進化。

機能:
- 複数 Claude Code セッションを 1 画面で一覧管理
- 各セッションのステータス可視化（実行中 / 入力待ち / 完了）
- 必要なセッションだけ覗く / インライン返信
- フルセッション復帰
- `/bg` で既存セッションをバックグラウンド化
- `claude --bg "task"` で最初から裏で実行
- ターミナルタブ占有せずに継続実行

起動: `claude agents`

出典: x.com/claudeai (Research Preview、2026-05 発表、INFERENCE: 一次出典 URL 未確認、ユーザー提示テキスト経由)

## 2. ConsultingOS 14 原則との対応

| 原則 | Agent View 対応 |
|---|---|
| アルトマン式原則 1 AI 1 人チーム | 複数セッション 1 画面管理 = 1 人で 27 agent 並列の物理実装 |
| アルトマン式原則 2 エージェント管理 CEO スキル | インライン返信 + フルセッション復帰 = mid-turn correction |
| マスク式原則 4 アルゴリズム | `/bg` + `claude --bg` = サイクル加速 + 自動化 |
| マスク式 Step 4 リスク即潰し | 入力待ちステータス即座覗き + 軌道修正 |
| FDE 時代戦略原則 5 不可視 orchestrator | バックグラウンド継続実行 = ユーザーが意識しない裏稼働 |

## 3. ConsultingOS 27 agent 並列起動への適用

### 3.1 大規模案件の標準フロー（関根さん / 水野さん級）

```bash
# 1. 戦略統合判定（フォアグラウンド）
claude agents
# → strategy-lead + competitive-analyst + kpi-analytics 起動

# 2. 並行して長時間タスクをバックグラウンド化
claude --bg "市場調査: 日本 AI コンサル新興 3 社の最新動向"
claude --bg "競合分析: Sierra / Agentforce / Genspark 最新機能"
claude --bg "業界別プレイブック更新: SaaS / D2C 2026 トレンド反映"

# 3. Agent View で全セッション管理
# 入力待ちステータスのみ介入、他は自動継続
```

### 3.2 案件別 agent 配置パターン

| 案件タイプ | フォアグラウンド | バックグラウンド |
|---|---|---|
| 新規 OEM 提案 | strategy-lead + proposal-writer | competitive-analyst + market-researcher（長時間調査）|
| 法務レビュー | legal-compliance-checker | privacy-legal / commercial-legal（並行レビュー）|
| visual 制作 | creative-director + ux-designer | frontend-dev（実装）+ brand-guardian（検証）|
| 商談準備 | strategy-lead + client-success | kpi-analytics（ROI 試算）+ market-researcher（顧客背景調査）|

### 3.3 mid-turn correction の物理運用

- 入力待ちステータス検知 → 即座 Agent View で覗く → インライン返信で軌道修正
- 完了ステータス検知 → 結果確認 → 次 agent へハンドオフ判断
- 実行中で長時間化 → `/bg` でバックグラウンド化、別タスクに集中

マスク式 Step 4「リスク即潰し」+ アルトマン式「認知的帯域上限まで活用」の物理実装。

## 4. 規律遵守（Agent View 利用時の注意）

### 4.1 主語詐称禁止（ハードルール 17 §2.3）

YOU MUST: バックグラウンド agent が完了 → 結果を統合する際、agent が実行したものは「agent が」、assistant が直接 Edit したものは「assistant が直接」と明記。Agent View で複数並列していても、各 agent の実行範囲を主語に明示。

### 4.2 規律 hook の継続稼働

バックグラウンド実行でも以下 hook は継続稼働:
- reality-check.sh (完了系断言検証)
- self-fraud-check.sh (主語詐称検出)
- em-dash-detector.sh (字形検証)
- block-main-push.sh (main 直 push 物理ブロック)
- stop-validator.sh (反証チェック未付与検出)

バックグラウンド agent 完了時も stop hook が発火 = 規律違反の機械検出継続。

### 4.3 価値マップ確認（orchestration-protocol §2.7）

複数 agent 並列起動前に「Enterprise Value Map → KPI Prioritization → Innovation Roadmap」3 ステップ内省必須。Agent View で並列起動の「楽さ」が、起動前ゲートをスキップする誘惑を生む（形骸化リスク）。

## 5. ConsultingOS 自己診断（Agent View 統合後）

| 軸 | 統合前 | 統合後 |
|---|---|---|
| 27 agent 並列管理 | tmux / ターミナル多重化 / 手動 | Agent View 1 画面 |
| バックグラウンド実行 | 不可（フォアグラウンド占有）| `/bg` + `claude --bg` |
| mid-turn correction | フルセッション切替必要 | インライン返信即時 |
| 規律 hook 継続稼働 | フォアグラウンドのみ | 全セッションで稼働（INFERENCE: 公式仕様要確認）|
| 認知的帯域上限 | 手動管理で疲弊 | Agent View で可視化 + 優先度判定 |

## 6. 関根さん / 水野さん案件への適用

### 6.1 関根さん N&Y Craft OEM 案件

Phase 1 構築（3 ヶ月）期間中の運用想定:
- フォアグラウンド: 関根さん業務委託壁打ち（週次）
- バックグラウンド常時稼働: 業界動向監視 / 競合更新 / 関根版 skill 改善
- mid-turn correction: 週次レビューで方向性軌道修正

### 6.2 水野さん 1000 万案件

事業計画 v4 書き直し（次セッション課題）:
- フォアグラウンド: proposal-writer + strategy-lead 統合
- バックグラウンド: competitive-analyst + market-researcher（ジーニー / マーケ業界調査）+ kpi-analytics（ROI 試算）
- Agent View で全並列 5-7 agent を管理

## 6.3 Claude Code Desktop App vs ターミナルの使い分け（2026-05-14 追加）

Claude Code Desktop App (Mac / Windows) が機能拡張で「ターミナル代替」候補に進化:
- 過去セッション一覧表示
- フォルダ選択 + 展開
- ワーキングツリー + プレビュー表示
- ターミナル起動内蔵

設定共有: `~/.claude/` はデスクトップ / ターミナル両方で共有、ConsultingOS の skill / agent / hook / MCP / Lazyweb plugin はどちらでも稼働。

ConsultingOS 推奨使い分け:

| タスク | 推奨環境 | 理由 |
|---|---|---|
| コード実装 / ビルド / デプロイ / git 操作 | ターミナル | CLI 操作の即時性 |
| 壁打ち / 調査 / 資料作成 / 提案書ドラフト | デスクトップ | UI + プレビュー |
| 関根さん / 水野さん週次レビュー | デスクトップ | 過去セッション参照容易 |
| visual / OEM ベースキット制作 | ターミナル | hook + 検証コマンド連動 |
| iPhone / iPad 限定環境（user 現状）| Web claude.ai | デスクトップ未保有時のフォールバック |

副次効果: デスクトップ環境では `claude plugin` CLI 直接アクセス可能 = Lazyweb token 取得 (前ターン保留中) が容易化。

## 7. 関連参照

- 出典: x.com/claudeai (Agent View Research Preview、2026-05、INFERENCE)
- ConsultingOS 14 原則体系: マスク 4 (`consulting-playbook-musk-*.md`) + アルトマン 5 (`consulting-playbook-altman-solopreneur.md`) + FDE 5 (`consulting-playbook-fde-era.md`)
- orchestration-protocol §2.7 (Strategy ⇄ Execution 循環): `docs/orchestration-protocol.md`
- 親 skill: `.claude/skills/claude-code-ops/SKILL.md`

## 8. 反証チェック（Step 1-3 圧縮）

- Step 1: Agent View 機能仕様は Research Preview = 正式リリース前、仕様変更可能性あり SPECULATION / 一次出典 URL (Anthropic 公式 docs) は別途確認推奨
- Step 2: ConsultingOS 14 原則体系 + orchestration-protocol §2.7 と整合 / 規律 hook 継続稼働は INFERENCE (公式仕様要確認、`/bg` でも stop hook が発火するか)
- Step 3: 本 skill は運用ガイドのため実機検証は次の Agent View 実利用後 (関根さん Phase 1 構築期間中に検証推奨)
