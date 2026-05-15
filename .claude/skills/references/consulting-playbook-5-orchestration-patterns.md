# 海外プロ標準 AI Orchestration 5 パターン vs ConsultingOS 網羅度（2026-05-14）

`strategy-lead` + `tech-lead` + `ai-engineer` + `infra-devops` + `client-success` 連携の AI orchestration 設計フレーム。2026 年 Anthropic + OpenAI 公式パターンと ConsultingOS 実装の対比、3 軸物理化済 + 2 軸 gap の体系化。

出典: ユーザー提示テキスト経由 INFERENCE。Anthropic 2026-05 公式リリース (Sub-Agent Orchestration / Memory + Dreaming) + OpenAI GPT-5.3-Codex 公式ガイド (Architect-Implementer Split / Phased Preamble Prompting) + Anthropic 内部評価 (Outcomes Loop)。本セッション一次出典 URL 未取得。

## 1. パターン 1: Sub-Agent Orchestration（網羅度: 高）

### 1.1 海外プロ標準

- リード司令官 AI + 専門サブエージェント並列起動
- 例: 「ファクト調査役 + 競合分析役 + 構成設計役 + 批評役」を独立コンテキストで並列実行
- Anthropic 公式評価: Claude 単体比 90.2% 精度向上 (INFERENCE、出典 URL 未確認)
- Netflix / Harvey が本番運用 (INFERENCE)

### 1.2 ConsultingOS 実装

- `assistant orchestrator` = リード司令官
- 27 agent = 専門サブエージェント
- ハードルール 17 主語詐称禁止 = agent 実起動の物理化
- 本セッション実証: PR #140 で creative-director + brand-guardian + tech-lead + sales-deck-designer 並列起動

YOU MUST: agent 並列起動時の 4 軸明示:
1. 各 agent への独立コンテキスト
2. 役割 (職務定義)
3. 起動条件
4. 出力形式

ハードルール 17 + 10-agent パターン (PR #155) と整合。

## 2. パターン 2: Outcomes Loop（網羅度: 中-高、ルーブリック明示が gap）

### 2.1 海外プロ標準

- 評価者 AI が本体 AI 出力を 100 点満点で採点
- 80 点未満なら具体的修正指示 + 再生成
- Anthropic 内部評価: PowerPoint 生成品質 10.1% 向上 / docx 品質 8.4% 向上 (INFERENCE)

### 2.2 ConsultingOS 既存実装

- `brand-guardian` agent = 反証ゲート専任 (機械検証)
- 反証チェック Step 1-3 = 自己評価
- HTML 出力 5 項目機械検証 (PR #140): lang / charset / font / em-dash / raw **
- `score-os-health.sh` hook = 健全性スコア
- 既存 100 点満点採点 skill: `/audit` (5 軸 100 点満点)

### 2.3 Gap: ルーブリック明示

現状: 反証チェックは「PASS / REJECT 二択」、80 点未満差し戻しの中間グラデーションなし。

改善候補（実需確認後）:
- 出力タイプ別ルーブリック定義（提案書 / visual / コード / 戦略文書）
- 80 点未満で `brand-guardian` が「具体的修正指示」自動生成
- 関根さん N&Y Craft Phase 1 で実証

## 3. パターン 3: Architect-Implementer Split（網羅度: 高）

### 3.1 海外プロ標準

- 設計役 AI と実装役 AI 完全分離
- 例: 「構成設計 AI」+「執筆 AI」を別セッションで動かす
- Harvey 採用でタスク完了率 6 倍 (INFERENCE、出典 URL 未確認)
- GPT-5.3-Codex 公式ガイドの標準パターン (INFERENCE)

### 3.2 ConsultingOS 実装

- `strategy-lead` (設計) + `fullstack-dev` / `frontend-dev` (実装) 分離
- `creative-director` (設計 + 監督) + `ux-designer` (ワイヤー) + `frontend-dev` / `sales-deck-designer` (実装) + `brand-guardian` (検証) の 4-stage 分離 (PR #139)
- `proposal-writer` (設計) + `sales-deck-designer` (実装) 分離
- 2 層構造運用: Markdown 設計層 + HTML 配信層 (PR #140)

= 完全網羅、既存実装で物理化済。

## 4. パターン 4: Memory + Dreaming（網羅度: 低、gap）

### 4.1 海外プロ標準

- AI が過去セッションを夜間レビュー
- 失敗パターン自動抽出 → システムプロンプト反映
- Anthropic 2026-05 公式リリース機能 (INFERENCE)

### 4.2 ConsultingOS 現状

- `evolution-log.md` = 失敗パターン記録、ただし**手動更新**
- 反証チェック Step 4 リスク即潰し = リアルタイム対応
- 4 週間後再評価カレンダー (evolution-log 冒頭) = 形骸化検知メカニズム

### 4.3 Gap

夜間自動レビュー + 失敗パターン自動抽出 + システムプロンプト自動反映 = 未実装。

改善候補（実需確認後）:
- `claude --bg "過去 30 セッション ログから頻出失敗パターン抽出"` + cron で夜間実行
- 抽出結果を `evolution-log.md` に自動追記
- 4 週間毎に CLAUDE.md ハードルール候補として `strategy-lead` レビュー

実装ハードル: 24/7 ホスティング必要 (10-agent パターン PR #155 で議論済、現状未該当)。代替: Claude Code Agent View (PR #DK) + `/goal` (PR #153) で半自動運用。

## 5. パターン 5: Phased Preamble Prompting（網羅度: 中、gap）

### 5.1 海外プロ標準

4 フェーズ強制:
1. 受領確認 (1 文)
2. 計画提示 (1-2 文)
3. ユーザー承認
4. 実行

= 早期停止 + 暴走防止、OpenAI 公式最新標準 (INFERENCE)

### 5.2 ConsultingOS 現状

- Plan Mode (Boris #1): 3 ファイル以上 / アーキテクチャ判断 / 本番影響で必須
- Autonomous Mode 既定化 (ハードルール 17): 即実行寄り
- 反証チェック Step 4「リスク即潰し」= ユーザー承認待たない傾向

### 5.3 Gap + 部分衝突

「Autonomous Mode 既定化」と「Phased Preamble 4 段階」は部分衝突:
- 小タスク (skill 1 件追加等): Autonomous で OK
- 中-大タスク (関根さん Phase 1 / 水野さん v4): Phased Preamble 推奨

改善候補:
- タスクサイズ判定で Autonomous / Phased Preamble 自動切替
- 中-大タスク = 「①受領確認 + ②計画提示 + ③ユーザー承認 + ④実行」明示
- ハードルール 17 を「Autonomous default + Phased Preamble for 不可逆 / 大型タスク」と二層化

## 6. 統合判定: ConsultingOS 強化方向 3 件

### 6.1 即実装可能（実需確認後）

1. **ルーブリック明示** (パターン 2 gap): 出力タイプ別 100 点満点ルーブリック定義、関根さん Phase 1 で実証
2. **Phased Preamble 二層化** (パターン 5 gap): タスクサイズ判定で自動切替、ハードルール 17 補強

### 6.2 中期検討（24/7 ホスト判断後）

3. **夜間自動レビュー** (パターン 4 gap): Memory + Dreaming = 10-agent パターン PR #155 の 24/7 ホスト判断と連動

## 7. ICP 提案質問 71-73 件目追加

71. AI orchestration で「リード司令官 + 専門サブエージェント並列起動」を物理化しているか、それとも単一 AI 依存か（パターン 1）
72. 出力品質を「評価者 AI のルーブリック採点」で機械検証しているか、それとも主観チェックか（パターン 2）
73. 大型 / 不可逆タスクで「受領確認 + 計画提示 + 承認 + 実行」の 4 段階を強制しているか（パターン 5）

## 8. ConsultingOS 自己診断（2026-05-14 時点）

| パターン | 自己適用度 | 改善方向 |
|---|---|---|
| 1 Sub-Agent Orchestration | 高 | 既存実装で物理化、追加実装不要 |
| 2 Outcomes Loop | 中-高 | ルーブリック明示 (関根さん Phase 1 実証候補) |
| 3 Architect-Implementer Split | 高 | 既存実装で物理化、追加実装不要 |
| 4 Memory + Dreaming | 低 | 24/7 ホスト判断と連動、中期検討 |
| 5 Phased Preamble Prompting | 中 | ハードルール 17 二層化候補、即実装可能 |

## 9. 関連参照

- 出典: ユーザー提示テキスト 2026-05-14（INFERENCE）
- 関連 skill: 10-agent パターン (PR #155) / AI ガードレール 3 層 (PR #150) / Tom Griffiths 8 条件 (PR #148) / Karpathy 12 ルール (PR #138) / ハードルール 17 (CLAUDE.md)
- 関連 agent: assistant orchestrator + brand-guardian + strategy-lead + creative-director
- 関連 hook: reality-check.sh / self-fraud-check.sh / stop-validator.sh

## 10. 反証チェック（Step 1-4 圧縮）

- Step 1: 5 パターンはユーザー提示 INFERENCE / Anthropic + OpenAI 公式リリース日 INFERENCE / 90.2% / 10.1% / 6 倍などの数値 INFERENCE（一次出典 URL 未取得）
- Step 2: 既存 27 agent + 38 skill + 21 hook + 17 hard rules と整合検証、3 軸物理化 + 2 軸 gap 確認
- Step 3 実用反証: 本セッション PR #140 (4 agent 並列起動) + PR #139 (creative 5 名 orchestration) で Sub-Agent + Architect-Implementer Split 実証済
- Step 4 リスク即潰し: gap 2 件 (パターン 4 / 5) は実需確認後 + 中期検討で構造的に発生不可能化、Boris #3 先回り禁止遵守
