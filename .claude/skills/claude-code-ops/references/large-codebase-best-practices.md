# Anthropic 公式 Large Codebase Best Practices（2026-05-14 統合）

`tech-lead` + `infra-devops` + `ai-engineer` + `strategy-lead` 連携の Claude Code 運用ベスト・プラクティス。Boris 9 規律 + Karpathy 12 ルール + 10-agent パターンと並列。

出典: claude.com/blog/how-claude-code-works-in-large-codebases-best-practices-and-where-to-start (Anthropic 公式 2026-05、INFERENCE: ユーザー提示テキスト + URL 経由)。

## 1. 核心原則（Anthropic 公式）

1. 中央インデックス不要: Claude は人間エンジニアと同じくファイルシステム探索、開発者環境で直接稼働
2. 自律検索 > 古いインデックス検索: 常に最新の状況把握
3. 初期コンテキスト重要: 探索を効率化するため最初の背景情報が鍵
4. 性能 ≒ 周辺拡張: モデルそのものより設定 / skill / hook で大きく左右
5. CLAUDE.md 階層化 + シンプル保持: 詰め込みすぎ禁止
6. サブディレクトリ起動: リポ最上位でなく作業ディレクトリで起動
7. テスト / チェック範囲をディレクトリで絞る: エラー / 遅延防止
8. 自動生成ファイル除外: ノイズ削減
9. 目次ファイル: 複雑なディレクトリ構造には目次推奨
10. 設定定期見直し: 古いモデル弱点補完設定は新モデルで負債化、3-6 ヶ月 / 新モデル時に棚卸し
11. 組織導入は専任担当者 + 承認スキル + 段階展開: 混乱回避

## 2. ConsultingOS 既存規律との対応マッピング

| Anthropic 公式 | ConsultingOS 既存実装 | 評価 |
|---|---|---|
| 1 中央インデックス不要 | リポ内ファイル探索ベース、中央 DB なし | 完全整合 |
| 2 自律検索 | Read / Grep / Glob 駆動 | 完全整合 |
| 3 初期コンテキスト | workflow.json (PR #149) + CLAUDE.md + ICP.md + DESIGN.md | 強網羅 |
| 4 性能 ≒ 周辺拡張 | 38 skill + 21 hook + 17 hard rules | 強網羅 |
| 5 CLAUDE.md 階層化 | Hard Rule 13 (500 行制限、references/ 分離) | 強網羅 |
| 6 サブディレクトリ起動 | リポルート起動が暗黙的、サブディレクトリ推奨未明示 | **Gap** |
| 7 テスト範囲ディレクトリ絞り | hook はリポ全体走査傾向、絞り未明示 | **Gap (中)** |
| 8 自動生成ファイル除外 | .gitignore あり、Claude 向け除外未明示 | **Gap (低)** |
| 9 目次ファイル | workflow.json は system 全体、ディレクトリ単位目次未実装 | **Gap (中)** |
| 10 設定定期見直し | 4 週間再評価カレンダー (evolution-log) | 中網羅、モデル更新タイミング未明示 |
| 11 組織導入 | 個人運用前提、組織展開テンプレ未明示 | **Gap (将来課題)** |

## 3. 即実装可能な改善 4 件

### 3.1 サブディレクトリ起動の推奨明示（Gap 6）

YOU MUST: 大規模案件 (関根さん N&Y Craft OEM 等) では作業ディレクトリ単位で Claude Code を起動。例:

```
# リポルート起動 (現状暗黙的)
cd /home/user/consulting-os && claude

# サブディレクトリ起動 (推奨)
cd /home/user/consulting-os/oem-base-kits/n-y-craft-os && claude
cd /home/user/consulting-os/strategy/n-y-craft-oem-case && claude
```

効果: コンテキスト絞り込みで Claude の探索効率向上、トークン消費削減。

### 3.2 hook のディレクトリ絞り（Gap 7）

現状: 21 hook はリポ全体走査傾向。

改善候補: 案件別ディレクトリ (`oem-base-kits/n-y-craft-os/`, `strategy/n-y-craft-oem-case/`) で起動時、関連 hook のみ発火する設定追加検討（次セッション課題、Boris #3 先回り禁止で実需確認後）。

### 3.3 ディレクトリ単位の目次ファイル（Gap 9）

`workflow.json` (PR #149) は system 全体目次。複雑なサブディレクトリには個別目次が有効:

```
oem-base-kits/n-y-craft-os/INDEX.md  # OEM ベースキット目次
strategy/n-y-craft-oem-case/INDEX.md  # 関根さん案件ディレクトリ目次
strategy/mizuno-funding-1000man/INDEX.md  # 水野さん案件目次
```

= 案件着手時にユーザーが「`docs/handoff-*.md` 読んで」より「`INDEX.md` から始めて」と指示しやすくなる。

### 3.4 モデル更新タイミングの設定棚卸し（Gap 10 補強）

既存: evolution-log 4 週間再評価カレンダー

追加: Anthropic Claude モデルアップデート (Sonnet 4.7 / Opus 4.8 等) 公開時、以下を必ず棚卸し:
- 古いモデルの弱点補完で作った hook / skill が新モデルで負債化していないか
- ハードルール 17 体系の自動化レベルを新モデル能力に合わせて引き上げ可能か
- 反証チェック Step 1-4 のコスト効率が改善可能か

実装: evolution-log 再評価カレンダーに「次期 Claude モデル公開時 = 即時設定棚卸し」エントリ追加候補。

## 4. 中期検討候補 1 件

### 4.1 組織導入テンプレ（Gap 11）

現状: ConsultingOS は個人運用。

将来課題: 関根さん N&Y Craft OEM が成功 → 他業界 OEM 展開 → 「ConsultingOS 組織導入テンプレ」需要発生。その際:
- 専任担当者 (Internal Developer Platform チーム相当)
- 承認スキル / コードレビュープロセス
- セキュリティ + 管理者を含むクロスファンクショナルチーム

実装: 実需確認後 (Boris #3)、OEM 顧客 3 件以上獲得 + 組織導入要望発生時に着手。

## 5. ConsultingOS 自己診断（2026-05-14 時点）

| 軸 | 適用度 |
|---|---|
| 1-5 基本原則 | 強網羅 |
| 6 サブディレクトリ起動 | 弱 (本 PR で推奨明示) |
| 7 テスト範囲絞り | 中 (次セッション課題) |
| 8 自動生成除外 | 中 (.gitignore あり、Claude 向け強化候補) |
| 9 ディレクトリ目次 | 中 (本 PR で 3 案件目次推奨) |
| 10 設定定期見直し | 強 (4 週間カレンダー + モデル更新時棚卸し追加) |
| 11 組織導入 | 弱 (実需待ち、将来課題) |

= 11 軸中 5 強 / 3 中 / 3 弱、本 PR で 4 件の即実装改善 + 1 件の中期候補を明示。

## 6. ICP 提案質問 79-81 件目追加

`tech-lead` + `strategy-lead` + `infra-devops` は提案時に追加で:

79. Claude Code 運用で「サブディレクトリ起動 + ディレクトリ目次 + ディレクトリ別テスト範囲」3 軸を整備しているか、それともリポ全体探索に閉じているか
80. 設定 (CLAUDE.md / skill / hook) の定期見直しを 4 週間 + Claude モデル更新時の 2 軸で実施しているか
81. 組織導入時の「専任担当者 + 承認スキル + クロスファンクショナルチーム」体制を整備しているか、それとも個人運用に閉じているか

## 7. 関連参照

- 出典: Anthropic 公式 claude.com/blog/how-claude-code-works-in-large-codebases-best-practices-and-where-to-start (2026-05、INFERENCE)
- 関連 skill: Boris 9 規律 / Karpathy 12 ルール (PR #138) / 10-agent パターン (PR #155) / 5 Orchestration Patterns (PR #158) / output-quality-rubrics (PR #160)
- 関連: workflow.json (PR #149) / Hard Rule 13 (500 行制限) / evolution-log 4 週間再評価カレンダー

## 8. 反証チェック（Step 1-4 圧縮）

- Step 1: Anthropic 公式記事は INFERENCE (ユーザー提示テキスト + URL 経由、本セッション一次出典 fetch 未実施) / 11 軸の評価は ConsultingOS 既存実装との honest 対比
- Step 2: 既存 Hard Rule 13 + 17 + Boris 9 + Karpathy 12 + 10-agent パターンと整合検証
- Step 3 実用反証: 11 軸中 5 強網羅は実装ベース、4 gap は明示
- Step 4 リスク即潰し: 4 件即実装改善 + 1 件中期候補で gap 構造的に解消、Gap 11 (組織導入) は実需確認後 (Boris #3)
