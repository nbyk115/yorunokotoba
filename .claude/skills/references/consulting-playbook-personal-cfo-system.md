# Personal CFO System - 水野さん向け個人投資家運用フレーム (2026-05-15)

`strategy-lead` + `proposal-writer` + `client-success` + `kpi-analytics` + `legal-compliance-checker` 連携の Personal CFO 構築フレーム。水野さん v4 投資テーゼ + 1000 万投資運用 + 個人投資家活動の Anthropic 公式 anchor 化された構造化システム。

出典: Miles Deutscher @milesdeutscher 2026-05-15「I Turned Claude Into My Personal CFO」(INFERENCE: ユーザー提示テキスト経由、一次出典 fetch 未実施)。McKinsey-level Investor Strategy Architect + Claude Cowork / Codex / Claude Code 駆動。

## 1. 核心構造: 4 ファイル + フォルダアーキテクチャ

```
Investment Folder/
├── investor-one-pager.md  ← 投資哲学・原則・mindset (静的、authoritative)
├── memory.md  ← 評価・変更ログ (動的、append-only with date)
├── instructions.md  ← Claude への運用指示 (read both before every response)
└── financials/
    ├── pnl-summary.md  ← Rolling 6-month P&L
    └── bank-statement-[month]-[year].md  ← 月次 source statements
```

= 4 ファイル + 1 フォルダ構造で「永続記憶 + 進化文脈 + 数値根拠」を一元化。

## 2. 7 Phase 投資家 Questionnaire (One-Pager 構築)

| Phase | 内容 |
|---|---|
| 1 Situation & Constraints | 居住地 / 税制 / 収入 / 流動性 / 時間予算 / 家族制約 |
| 2 Capital & Horizon | 資本規模 / Tactical (月) / Core (年) / Generational (10 年+) |
| 3 Philosophy & Mindset | 投資信念 (自分の言葉) / 集中 vs 分散 / 過去ドローダウン対応 |
| 4 Behavioural Nuance | 行動盲点 / トリガー / 公開発信影響 |
| 5 Preferences & Anti-Preferences | 買う / 絶対買わない / 信頼源 / 不信源 |
| 6 Goals (Mindset Form) | Compounding → Preservation 移行 / sleep test / 10 年 won 状態 |
| 7 Stress Tests | 「70% 暴落シナリオ」「ルール違反 deal 提示」「18 ヶ月 30% underperform」「単一最大ポジ 4x rumor」 |

= 各 Phase で「probing > polite」「constraints first」「mindset > mechanics」「one sharp question at a time」原則遵守。

## 3. McKinsey-Level Investor Strategy Architect Role

YOU MUST: Personal CFO 起動時に以下原則:
- Probing over polite (質問の裏の質問)
- Constraints first, ambitions second (制約優先)
- Mindset > mechanics (60% 配分より「逸脱判断ルール」)
- One sharp question at a time (3 つ同時禁止)
- Push back on contradictions (矛盾即指摘)
- No fluff, no flattery (前置き / 阿諛禁止)
- Their voice, not yours (本人の言葉維持)

ConsultingOS 整合: マスク式原則 3 Unkind Truth (consulting-playbook §11) + Hard Rule 1 真の 100 + ハードルール 17 主語詐称禁止 と完全整合。

## 4. ConsultingOS 既存規律との統合

| Personal CFO | ConsultingOS 既存 |
|---|---|
| investor-one-pager.md | document-creation-6-steps (PR #166) ① 論点設定 + ② メッセージ決定 |
| memory.md (append-only with date) | evolution-log.md (PR #DG 系) と同型構造 |
| instructions.md | CLAUDE.md ハードルール 17 体系の Investor 版 |
| 7 Phase Questionnaire | 反証チェック Step 1-4 + 6 ステップ ⑤ 仮説検証 |
| Stress Tests | マスク式 Unkind Truth + LayerX Be Animal Case 3 (PR #152) |
| McKinsey-level role | strategy-lead パートナー級 (PR #166 ① 論点設計、年収 3000 万+) |
| Claude Cowork / Codex / Claude Code | ConsultingOS 既存 Claude Code 環境 |
| BotFather / Dispatch mobile | Phased Preamble (PR #160) + 受け入れ基準 (PR #176) で代替可能 |

= Personal CFO = ConsultingOS 既存体系の **個人投資家 vertical 実装**。

## 5. 水野さん v4 投資テーゼ + 1000 万投資運用への直接適用

YOU MUST: 水野さん本人の Personal CFO セットアップ提案 (核心 argument):

### 5.1 水野さん向け Investor One-Pager 構築

7 Phase Questionnaire を水野さん本人に実施 → 個人投資家としての投資哲学・原則・mindset を文書化:
- Phase 1: ジーニー退任後 / 個人投資家 / 業界 (ad-tech / マーケ)
- Phase 2: 1000 万投資資本 / 投資先 horizon (ConsultingOS 5-10 年)
- Phase 3: 投資哲学 (vertical AI-OS verticalization trend への early bet)
- Phase 4: ジーニー時代 vs 個人投資家の行動変化
- Phase 5: AI vertical / 中小 vertical 投資 vs エンタープライズ回避
- Phase 6: 10 年 won 状態定義 (財務 + 業界貢献)
- Phase 7: ConsultingOS 失敗 / Anthropic 競合参入 / AI 規制等のストレステスト

### 5.2 4 ファイル構造で運用継続

- `mizuno-investor-one-pager.md`: 個人投資家投資哲学
- `mizuno-memory.md`: 1000 万投資判断 + ConsultingOS 関根さん N&Y Craft 進捗 + 業界変化ログ
- `mizuno-instructions.md`: Claude 運用指示
- `mizuno-financials/`: 投資先 P&L + キャッシュフロー + ROI 追跡

### 5.3 既存 ConsultingOS 資産との統合

- Anthropic CFO 指数関数 (PR #144) = 多層指数関数で投資先成長予測
- Krishna 月次財務報告 (PR #179) 30 分 95% 正確 = 水野さん投資先月次レポート自動生成
- HMM watch list (PR #184) = 興味確認後の quant 投資フレーム
- Dario 3 段階 + Medvi 実証 (PR #190) = 投資テーゼ核心 argument
- Anthropic Economic Index (PR #188) = 業界別投資判断ベースライン
- TAI 研究アジェンダ (PR #186) = Anthropic 公式上位 anchor

## 6. 関根さん N&Y Craft への転用 (副次的)

ConsultingOS が関根さん向け OEM 提案する際、Personal CFO 構造を **クライアント向け Personal CFO サービス** として商品化候補:
- 関根さん本人 (経営者) 向け Personal CFO
- N&Y Craft 投資判断 / キャッシュフロー管理 / 業界 trend 反映
- 月次顧問契約に上乗せ販売可能 (PR #179 Krishna 月次レポート同型)

= Personal CFO = ConsultingOS の **OEM 商品候補**、関根さん Phase 3 で展開検討。

## 7. ConsultingOS 自己診断 (Personal CFO 構造適用度)

| 軸 | 現状 |
|---|---|
| 7 Phase Questionnaire 物理化 | 強 (PR #166 + 反証チェック Step 1-4) |
| 4 ファイル構造 | 中 (workflow.json + CLAUDE.md + evolution-log で同型、Investor 専用化は Phase 2 課題) |
| McKinsey-level role | 強 (strategy-lead パートナー級) |
| 水野さん本人 Personal CFO 構築 | **弱 (本 PR で構造設計、Phase 2 で水野さん本人実装)** |
| 関根さん OEM 商品化 | 弱 (Phase 3 候補) |

## 8. ICP 提案質問 122-124 件目追加

122. 個人投資家 / 経営者が Personal CFO 構造 (4 ファイル + 7 Phase Questionnaire) で投資判断を体系化しているか
123. McKinsey-level Investor Strategy Architect role (probing / constraints first / mindset > mechanics) を Claude に明示的に設定しているか
124. Investor One-Pager + Memory + Instructions + Financials の 4 ファイル構造で永続記憶 + 進化文脈 + 数値根拠を一元化しているか

## 9. アンチパターン 4 件

YOU MUST: 以下を検知したら Personal CFO 構造再設計:

1. Investor One-Pager を「numerical targets」で定義 (mindset state でなく数値目標化、PR #190 Dario 第 3 段階で経済単位構築に反する)
2. Memory.md を overwrite (append-only with date 違反、evolution-log 同型構造遵守)
3. Stress Tests スキップ (Phase 7 = 投資哲学 vs 実行 gap 検出の核心)
4. McKinsey role を soft advisor に矮小化 (probing / push back on contradictions / no flattery 原則違反)

## 10. 関連参照

- 出典: Miles Deutscher @milesdeutscher 2026-05-15 (INFERENCE)
- 関連 skill: document-creation-6-steps (PR #166) / Anthropic CFO 指数関数 (PR #144) / Krishna 月次レポート (PR #179) / HMM 水野さん watch list (PR #184) / Dario 3 段階 + Medvi (PR #190) / Anthropic Economic Index (PR #188) / TAI 研究アジェンダ (PR #186) / マスク式 Unkind Truth + LayerX Be Animal (PR #152) / PoC 地獄脱出 戦略 4 (PR #161)
- 関連 agent: strategy-lead + proposal-writer + client-success + kpi-analytics + legal-compliance-checker
- 関連 hard rules: 1 (真の 100) + 2 (出典なし数値断言禁止) + 13 (形骸化防止) + 17 (主語詐称禁止 + Phased Preamble)
- 関連 doc: docs/handoff-mizuno-funding-v4.md §11

## 11. 反証チェック (Step 1-4 圧縮)

- Step 1: Miles Deutscher 記事 INFERENCE (一次出典 fetch 未実施) / 7 Phase Questionnaire + 4 ファイル構造 + McKinsey role FACT (記事提示) / 水野さん適用パスは assistant 構築 INFERENCE
- Step 2: 既存 PR #166 + #144 + #179 + #184 + #190 + #188 + #186 + #152 + #161 + ハードルール 17 体系と整合検証、Personal CFO = ConsultingOS 既存体系の個人投資家 vertical 実装と確認
- Step 3 実用反証: ConsultingOS 自己診断 5 軸中 2 強 / 1 中 / 2 弱、水野さん Phase 2 + 関根さん Phase 3 で実機検証可能
- Step 4 リスク即潰し: アンチパターン 4 件 (numerical 化 / overwrite / Stress Tests スキップ / soft advisor 化) + Hard Rule 17 主語詐称禁止 + Phased Preamble 二層化で構造的回避
