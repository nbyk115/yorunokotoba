# dreaming: ConsultingOS Memory Dream Pass (Phase 1 雛形、2026-05-14)

`tech-lead` + `ai-engineer` + `strategy-lead` + `brand-guardian` 4 agent 並列判定済の Memory + Dreaming 実装 (PR #168 gbrain + PR #158 5 Orchestration Patterns Memory + Dreaming gap 解決)。

出典: Anthropic 公式 Dreaming 機能 (Managed Agents 経由、INFERENCE) + Mnimiy @Mnilax 2026-05-15 ローカル実装記事 (INFERENCE)。

## 1. 用途

ConsultingOS の CLAUDE.md / evolution-log / skill 体系を 14-30 日サイクルで「dream pass」、過去セッションから aged context / 矛盾 / 形骸化ルールを検出 → diff 提示 → user 承認後 apply。

## 2. 4 agent 統合判定

| agent | 判定 |
|---|---|
| tech-lead | 実装 Yes、175 sessions 実測、Phase 1-3 段階導入 |
| ai-engineer | 合理的、rubric 25-30 行拡張、Opus 4.7 固定 |
| strategy-lead | Go、関根さん +$30K/月 上乗せ可能性、Hard Rule 1 真の 100 実 ROI 側 |
| brand-guardian | CONDITIONAL REJECT、機密リスク 4 修正要件必須 |

## 3. brand-guardian 4 修正要件 (PASS 移行必須)

YOU MUST: 以下 4 要件全件遵守、未満たし状態で dream.py 実行禁止:

### 要件 1: dream output は diff 提示のみ、自動 apply 禁止

```bash
# 禁止 (Anthropic 公式 Mnimiy 記事の単純実装)
OUTPUT.write_text(response.content[0].text)  # CLAUDE.md 直接書き換え

# 必須 (ConsultingOS 仕様)
git diff --no-color CLAUDE.md proposed_CLAUDE.md  # diff 提示
# user 承認後のみ Edit / Write 実行 (Phased Preamble 4 段階強制)
```

### 要件 2: jsonl ローカルパース、機密マスク or 文書構造のみ API 送信

`~/.claude/projects/*/sessions/*.jsonl` は関根さん / 水野さん案件の固有名詞 / 財務数値 / 未公開戦略を含む可能性。Anthropic API 送信時の選択肢:

- 選択肢 A: ローカル前処理で機密マスク (固有名詞 → [CLIENT_A]、財務数値 → [REDACTED])
- 選択肢 B: jsonl 自体を送信せず、CLAUDE.md / evolution-log の文書構造のみ送信
- 選択肢 C: ローカル LLM (Ollama 等) で前処理、Anthropic 送信前に抽象化

= **選択肢 B が最安全**、Phase 1 ではこの方針推奨。

### 要件 3: 数値クレーム実測コマンド添付必須

dream output に「73% 削除」「8.2x 修正」等の数値が含まれる場合、`grep -c` / `wc -l` 等の実測コマンド出力を反証 Step 3 に添付必須。INFERENCE 区別明記を dream rubric に埋込。

### 要件 4: dream_last_run + 30 日超過トリップワイヤー

evolution-log に `dream_last_run: YYYY-MM-DD` フィールド追加、30 日超過時の brand-guardian 自動 REJECT 実装。

## 4. Phase 1 (本 PR、雛形のみ)

本 PR は雛形 + 規律設計のみ。実コード実行 + API 呼出は Phase 2 以降:

- `.claude/skills/dreaming/README.md` (本ファイル)
- `.claude/skills/dreaming/dream.py.template` (実装雛形、ドキュメント化のみ)
- `.claude/skills/dreaming/rubric.md.template` (ConsultingOS 専用 25-30 行 rubric)

## 5. Phase 2 (実需確認後、次セッション)

- API key 設定 (user 環境)
- sample 20 sessions で試走 (コスト実測 $0.84 想定)
- output 検証 + 機密リスク確認
- diff 提示フロー実装

## 6. Phase 3 (Phase 2 成功後)

- 全 175 sessions 実行 ($7.35 想定、11 分 × 1.75 ≈ 20 分)
- 14 日 cron 化
- 関根さん月次顧問の運用コスト透明性レポートに統合
- evolution-log の `dream_last_run` 自動更新

## 7. 関根さん / 水野さん適用パス

### 関根さん N&Y Craft OEM

月次顧問契約のオプションとして $30K/月 上乗せ販売候補:
- 月次 dream pass 実行 + diff レポート提供
- N&Y Craft 業務規律の形骸化検出 + 改善提案
- 関根さん承認後の規律改訂

### 水野さん v4 投資テーゼ

投資先評価ツールとして dream pass 提供候補:
- 投資先企業の「declared vs actual」乖離検出
- 経営判断の自己改善能力評価

## 8. ConsultingOS 既存規律との統合

- gbrain (PR #168): global / cross-project 層、本 dream pass は local 層、相補関係
- PR #173 Prompt Cache Prewarm: dream output を次月 prewarm cache に注入
- PR #169 LLM 推論メカニクス: §2 KV キャッシュ最大活用
- PR #160 ルーブリック明示 skill: dream rubric が同型概念
- Karpathy 12 ルール (PR #138): ルール 6 トークン予算と整合 ($4.20/月)

## 9. ConsultingOS 専用 rubric テンプレート (Phase 2 で活用)

Mnimiy 12 行を ConsultingOS 規律体系向けに 25 行拡張:

```markdown
# ConsultingOS Dream Pass Rubric

You are doing a forensic pass over 100+ ConsultingOS Claude Code sessions.
Find patterns I would not write down myself + ConsultingOS 規律違反.

## Workflow patterns observed (高/中/低 confidence)
- Behavioral observations only
- Cite session frequency

## ConsultingOS 規律違反検出
- Hard Rule 17 主語詐称 (agent 起動ゼロ時の「ConsultingOS が」)
- Hard Rule 2 出典なし数値断言
- Hard Rule 13 形骸化ルール
- 反証チェック Step 1-4 不完全

## 削除候補
- 一回限り訂正が永続ルール化
- aged context (プロジェクト名 / アーキテクチャ変更)
- 矛盾する規律

## 38 skill 間の重複・形骸化

## 27 agent 起動パターン (実起動 vs 主語詐称)

Rules: max 40 lines. No defense. Recurring patterns only.
```

## 10. 関連参照

- 出典: Anthropic 公式 Dreaming + Mnimiy ローカル実装 (INFERENCE)
- 関連: gbrain (PR #168) / 5 Orchestration Patterns (PR #158) / Prompt Cache Prewarm (PR #173) / LLM 推論メカニクス (PR #169) / ルーブリック明示 (PR #160)
- 関連 agent: tech-lead + ai-engineer + strategy-lead + brand-guardian (4 agent 起動判定済)

## 11. 反証チェック (Step 1-4 圧縮)

- Step 1: Anthropic 公式 Dreaming + Mnimiy 記事 INFERENCE / 4 agent 判定済 FACT / 175 sessions 実測 FACT (tech-lead agent 確認) / 機密リスクは brand-guardian 機械検証 FACT
- Step 2: 既存 ConsultingOS 規律 (Hard Rule 13/15/17 + Boris #3 + gbrain PR #168) と整合検証
- Step 3 実用反証: Phase 1 雛形のみ、実コード実行は Phase 2 以降、本 PR で API 呼出ゼロ
- Step 4 リスク即潰し: 機密リスク (brand-guardian REJECT 軸 5) は選択肢 B (文書構造のみ送信) で構造的回避、自動 apply 禁止は diff 提示 + Phased Preamble 4 段階強制で構造的回避、形骸化リスクは dream_last_run + 30 日トリップワイヤーで構造的回避
