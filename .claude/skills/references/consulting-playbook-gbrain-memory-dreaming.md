# gbrain Memory + Dreaming gap 解決候補（2026-05-14）

`strategy-lead` + `tech-lead` + `ai-engineer` + `infra-devops` 連携の長期記憶 + 関係性記憶 + 夜間統合フレーム。PR #158「5 Orchestration Patterns vs ConsultingOS」で特定した Memory + Dreaming gap (パターン 4) の具体的解決実装候補。

出典: Garry Tan (Y Combinator CEO) `garrytan/gbrain` OSS (2026-05、INFERENCE: ユーザー提示テキスト + GitHub URL 経由)。

## 1. gbrain アーキテクチャ

3 層構造:

| 層 | 役割 | 実装 |
|---|---|---|
| Brain Repo (git) | markdown files = source of truth、human が常時 read & edit 可能 | git repo + .md files |
| GBrain (retrieval) | Postgres + pgvector、hybrid search (vector + keyword + RRF) | DB ベース、夜間 retrieval |
| AI Agent (read/write) | 29 skills が brain の使い方を定義、RESOLVER.md が intent を skill にルーティング | Claude Code / Codex 等 |

## 2. 既存 ConsultingOS との対応

| ConsultingOS 既存 | gbrain 該当 |
|---|---|
| evolution-log.md (markdown 規律違反 / 学習エントリ) | Brain Repo source of truth、ただし手動更新 |
| workflow.json (PR #149) | bootstrap data、ただし LLM context 投入のみ、関係性検索なし |
| 38 skill 体系 | 29 skills (gbrain) と類似だが、ConsultingOS は consulting 業務特化 |
| なし | GBrain retrieval 層 (Postgres + pgvector) = **gap** |
| なし | 夜間自動統合 = **gap** |
| なし | RESOLVER.md (intent → skill ルーティング) = **gap (部分的)** |

= ConsultingOS は「Brain Repo (markdown) + 38 skill」相当を物理化済、しかし「GBrain retrieval (hybrid search) + 夜間統合 + RESOLVER」は gap。

## 3. PR #158 Memory + Dreaming gap との対応

PR #158 で特定した Memory + Dreaming gap:
- 夜間自動レビュー
- 失敗パターン自動抽出
- システムプロンプト自動反映
- 24/7 ホスト不要で半自動 Memory 実装

gbrain がこれらを直接解決:
- markdown source of truth = ConsultingOS evolution-log + .claude/skills/ 互換
- Postgres + pgvector = ローカル運用可能 (24/7 ホスト不要)
- 夜間統合 = Memory + Dreaming パターン直接実装

## 4. ConsultingOS への統合判定

### 4.1 統合価値: 高

理由:
1. PR #158 で明示した gap の具体実装
2. 24/7 ホスト不要 (10-agent パターン PR #155 の Teamly $29-179/月不要)
3. markdown source of truth = ConsultingOS 既存資産 (38 skill + evolution-log + workflow.json) と互換性高
4. ベクトル + ナレッジグラフのハイブリッド = 「関係性記憶」(例: 「関根さんはどの skill を使った？」「水野さんと過去案件の関係性は？」) 解決
5. Y Combinator CEO Garry Tan 公開 = 信頼性高い (FACT、ユーザー提示)

### 4.2 統合のハードル

- Postgres + pgvector セットアップ必要 (user 環境)
- 29 skills / RESOLVER.md の ConsultingOS skill 体系との重複検証必要
- ConsultingOS 既存 38 skill との統合方針確認必要

### 4.3 採用判定: 段階導入

Phase 1 (即実装可能): gbrain GitHub repo を観察、ConsultingOS markdown structure (.claude/skills/ + evolution-log) との互換性検証

Phase 2 (実需確認後): user 環境で gbrain Postgres セットアップ、関根さん N&Y Craft Phase 1 構築の長期記憶として実装

Phase 3 (Phase 2 成功後): 水野さん v4 投資先評価の関係性検索に拡張

## 5. ConsultingOS 自己診断 (Memory + Dreaming 観点、再評価)

| 評価軸 | PR #158 時点 | gbrain 統合後 (見込み) |
|---|---|---|
| 夜間自動レビュー | 弱 (evolution-log 手動) | 強 (gbrain 夜間統合) |
| 失敗パターン自動抽出 | 弱 | 強 (ハイブリッド検索) |
| 関係性記憶 (関根さん × skill × 案件) | 弱 (workflow.json は静的) | 強 (ナレッジグラフ) |
| 長期記憶 | 中 (evolution-log 永続) | 強 (gbrain Brain Repo) |
| 24/7 ホスト | 不要 (代替 Agent View + /goal) | 不要 (ローカル Postgres) |

= gbrain 統合で Memory + Dreaming gap が完全解決見込み、5 Orchestration Patterns 5/5 充足。

## 6. ICP 提案質問 89-90 件目追加

89. AI エージェントが「長期記憶」+「関係性記憶」を持つ構造になっているか、それともセッション終了で記憶喪失か (gbrain Memory + Dreaming パターン)
90. markdown source of truth + ベクトル / ナレッジグラフ検索 + 夜間自動統合の 3 層構造を物理化しているか

## 7. 関根さん / 水野さん適用パス

### 関根さん N&Y Craft Phase 1 構築

gbrain 統合候補ユースケース:
- クラフトビール業界の市場データ + 競合 + 関根さん発言を長期記憶化
- 「N&Y Craft の Phase 1 で何が起きた？」を関係性検索で即引き出し
- 月次顧問契約継続中の文脈累積 + 夜間統合

### 水野さん v4 投資テーゼ

gbrain 統合候補ユースケース:
- 水野さん投資先候補 (fintech / AI vertical OS) の関係性検索
- 「水野さんが過去に投資した会社と今回の投資先の類似性は？」
- 投資テーゼ進化の夜間統合 (毎晩 v4 → v5 → v6 で漸進的に深化)

## 8. Boris #3 + Hard Rule 13 遵守

YOU MUST: gbrain 即インストール禁止、段階導入のみ:

1. Phase 1: 本 references skill 登録 + GitHub repo 観察 (本 PR、無コスト)
2. Phase 2: 関根さん N&Y Craft Phase 1 着手前に user 環境セットアップ判断 (Postgres + pgvector 必要)
3. Phase 3: Phase 2 成功 + 関係性検索の実需確認後、水野さん案件に拡張

## 9. 関連参照

- 出典: garrytan/gbrain (INFERENCE)
- 関連 skill: PR #158 5 Orchestration Patterns (Memory + Dreaming gap 解決候補) / workflow.json PR #149 / evolution-log
- 関連 hard rules: Boris #3 先回り禁止 / Hard Rule 13 形骸化防止 / ハードルール 17 (主語詐称禁止 + Phased Preamble)

## 10. 反証チェック (Step 1-4 圧縮)

- Step 1: gbrain 機能詳細 INFERENCE (ユーザー提示テキスト + GitHub URL 経由、本セッション一次出典 fetch 未実施) / Garry Tan YC CEO 公開は FACT
- Step 2: PR #158 Memory + Dreaming gap と完全整合、ConsultingOS 既存 38 skill + evolution-log + workflow.json と相補
- Step 3 実用反証: 段階導入計画 Phase 1-3 明示、関根さん / 水野さん適用パス物理化
- Step 4 リスク即潰し: gbrain 即インストール形骸化リスクは段階導入 + Boris #3 遵守で構造的回避、Phase 2 で実需確認後採用判断
