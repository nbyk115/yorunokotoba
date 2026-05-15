---
description: 資料作りの基本の型 6 ステップ。コンサル + 全ビジネスマンの基本所作。論点を研ぎ澄ます → メッセージ決定 → 論拠 → ストーリー → 仮説検証 → 最終化。①に向かうほど難易度高、役職・年収相関。proposal-writer / sales-deck-designer / strategy-lead 必須参照。
---

# document-creation-6-steps: 資料作りの基本の型

## 用途

資料 / 提案書 / pitch deck / レポート / メモ等、全ビジネス資料の構築フレーム。コンサル基本所作、proposal-writer / sales-deck-designer / strategy-lead / creative-director が必須参照。

## 核心原則

「メッセージが入っていないスライドはいかに致命的か」=「論点 → メッセージ → 論拠」の構造がない資料は読まれない。

①に向かうほど難易度高、出来るようになるにつれて役職・年収も上がる (FACT、コンサル業界経験則)。

## 6 ステップ詳細

### ① 論点を研ぎ澄ます (最高難度)

「何を問うべきか」を定義する。多くの資料が失敗する理由 = 論点設定が曖昧。

YOU MUST:
- 論点を 1 文で書き出す
- 「これは本当の論点か」を 3 回自問
- ユーザーの期待 / 文脈 / 制約から論点候補を 3-5 件抽出、最も価値ある 1 つに収束
- 論点が広すぎる / 曖昧 / 答えが自明 → 研ぎ直し

### ② 最も伝えたい「メッセージ」を決める (論点に対する自分の考え)

論点に対する自分の答え = メッセージ。1 文で言える形に圧縮。

YOU MUST:
- メッセージは「Yes / No」「A or B」「具体的アクション」のいずれかの形で書き出す
- 「〜が重要」「〜を検討」等の曖昧表現は禁止 (CLAUDE.md §5 What NOT to include)
- 数値 / 期限 / 具体アクションを含む (例: 「3 ヶ月で月次粗利 200 万改善する Plan B 採択」)

### ③ 「メッセージ」を支える論拠を考える (ロジカルに隙なく、ピラミッド構造)

メッセージを支える論拠 A / B / C を MECE で構築。

YOU MUST:
- 論拠は 3 つを目安、最大 5 つ
- 各論拠は MECE (相互排他 + 完全網羅)、ピラミッド構造で組む
- 論拠の下に「下位論拠」「データ」「事例」を配置
- 「論拠の漏れ」「論拠同士の重複」を反証チェックで検証

参照: `revenue-growth-framework.md` §4 (市場構造分解 + VRIO)。

### ④ 「メッセージ」が伝わるストーリーを構成する (ボディを仮説で入れる)

論拠を読み手の認知順に並び替えてストーリー化。

YOU MUST:
- ストーリーは「結論先出し → 論拠 → エビデンス → アクション」の順
- 各スライド / セクション 1 つにつき 1 メッセージ
- ボディテキストは「仮説」段階で入れる (検証前の予想を明示)
- 読み手の「想定反論」を先回りで潰す配置

### ⑤ 仮説検証 (タスク / リサーチなど)

ストーリー仮説をデータ / 一次情報で検証。

YOU MUST:
- 仮説検証は competitive-analyst / market-researcher / kpi-analytics 起動候補
- FACT / INFERENCE / SPECULATION 3 ラベル全件付与
- 出典なし数値断言ゼロ (CLAUDE.md ハードルール 2)
- 仮説が反証された場合は Phase ②-④ に差し戻し

### ⑥ 資料を整える、最終化する

ビジュアル / レイアウト / 字形 / 出典の最終チェック。

YOU MUST:
- DESIGN.md 準拠 (色 / フォント / スペーシング)
- brand-guardian 5 項目機械検証 (HTML 出力時、PR #140)
- 日本語字形 (Noto Sans JP / Yu Gothic / Hiragino、ハードルール 10)
- em-dash / en-dash / raw `**` 全件 0 (ハードルール 16)
- 反証チェック Step 1-4 全件付与
- ルーブリック明示 skill (PR #160) で出力タイプ別 100 点満点採点、80 点未満は差し戻し

## 難易度 vs 役職相関

| ステップ | 担当できる役職水準 (INFERENCE、コンサル業界経験則) |
|---|---|
| ① 論点設定 | パートナー / マネージングディレクター (年収 3000 万 + ) |
| ② メッセージ決定 | プロジェクトマネージャー / シニアマネージャー (年収 1500-2500 万) |
| ③ 論拠構築 | シニアアソシエイト / マネージャー (年収 1000-1500 万) |
| ④ ストーリー構成 | アソシエイト / シニアアナリスト (年収 700-1000 万) |
| ⑤ 仮説検証 | アナリスト (年収 500-700 万) |
| ⑥ 最終化 | アナリスト / アシスタント (年収 400-600 万) |

= ⑥ → ① への成長が役職・年収の上昇と連動。「アシスタントは ⑥ ばかり、リーダーは ① に集中」。

## ConsultingOS 適用フロー

| 担当 agent | 主担当ステップ |
|---|---|
| strategy-lead | ① 論点 + ② メッセージ (パートナー級) |
| proposal-writer | ② メッセージ + ③ 論拠 + ④ ストーリー |
| competitive-analyst + market-researcher | ⑤ 仮説検証 |
| kpi-analytics | ⑤ 仮説検証 (数値検証) |
| sales-deck-designer + creative-director | ④ ストーリー (HTML 配信層) + ⑥ 最終化 |
| brand-guardian | ⑥ 最終化 (機械検証) |

## ConsultingOS 既存規律との統合

- HTML-First (PR #140): ④ ストーリー = Markdown 設計層 + HTML 配信層 2 層構造
- ルーブリック明示 (PR #160): ⑥ 最終化で出力タイプ別 100 点満点採点
- ハードルール 1 真の 100 原則: ⑤ 仮説検証で FACT/INFERENCE/SPECULATION 区別必須
- ハードルール 2 出典なし数値断言禁止: ⑤ 仮説検証で出典必須
- ハードルール 10/16/17: ⑥ 最終化で字形 / em-dash / 主語詐称機械検証

## Feynman method (理解確認、2026-05-15 追加)

複雑トピックを「分かったつもり」でなく「本当に分かる」ためのアナロジー駆動説明手法。出典: Anatoli Kopadze 18 Steps (2026-05-13、INFERENCE)。

YOU MUST: クライアント / ユーザーが複雑トピック (技術 / 金融 / 法務 / 業界専門用語) 理解で詰まった時、以下のパターン起動:

```
Explain [topic] to me using only analogies and everyday examples.
No jargon. Assume I have no background in this field.
After each analogy, check whether I've actually understood it by asking me one question.
Based on my answer, go deeper or adjust the explanation.
Keep going until I can explain it back to you in my own words without using any technical terms.
```

= 受動的説明でなく、相手の理解度に応じて深さを調整する対話型理解確認。document-creation-6-steps ② メッセージ決定の前段で「相手が分かっていない / 分かっているフリ」を検出可能。

ConsultingOS 適用:
- 関根さん: AI / vertical OS / OEM 等の技術概念説明時に Feynman 起動
- 水野さん: 投資テーゼの抽象概念 (vertical AI-OS verticalization trend) を Feynman で理解確認
- legal-compliance-checker: 法令解説でアナロジー駆動可能

## 起動条件

- ユーザーが「資料作って」「pitch deck」「提案書」「レポート」「メモ」発話時
- proposal-writer / sales-deck-designer / strategy-lead 起動時
- 関根さん / 水野さん案件の納品物制作時

## アンチパターン

YOU MUST: 以下を検知したら即停止 + ① から再構築:

1. 「メッセージなし」スライド: タイトル + データだけで主張がない
2. 「論点 = メッセージ」混同: 質問と答えが同じ
3. 論拠が MECE でない: 重複 / 漏れ
4. ストーリーが時系列順: 結論先出しでない
5. 仮説検証スキップ: FACT/INFERENCE 区別なし
6. ⑥ から始める: ビジュアル先行で論点未定義

## ICP 提案質問 84-86 件目追加

84. 資料作成で「論点 → メッセージ → 論拠 → ストーリー → 検証 → 最終化」6 ステップを順序遵守しているか、それとも ⑥ ビジュアルから着手していないか
85. 論点設定 (①) と メッセージ決定 (②) の難易度を経営層が認識しているか、それともアナリスト級に丸投げしていないか
86. 6 ステップ全件で FACT/INFERENCE/SPECULATION 区別 + 反証チェック Step 1-4 を物理化しているか

## 関連参照

- 出典: ユーザー提示画像 (2026-05-14、コンサル業界基本所作)、INFERENCE: 一次出典 URL 未確認、コンサル業界経験則として確立
- 関連 skill: output-quality-rubrics (PR #160) / consulting-playbook / revenue-growth-framework / proposal-writer / sales-deck-designer
- 関連 agent: strategy-lead / proposal-writer / competitive-analyst / market-researcher / kpi-analytics / sales-deck-designer / creative-director / brand-guardian
- 関連: HTML-First (PR #140) / Phased Preamble 二層化 (PR #160 ハードルール 17 改訂)

## 反証チェック (Step 1-4 圧縮)

- Step 1: 6 ステップフレームはユーザー提示 FACT (手書きスケッチ) / 難易度 vs 役職相関は INFERENCE (コンサル業界経験則)
- Step 2: 既存 ConsultingOS 規律 (ハードルール 1/2/10/16/17 + 反証チェック + ルーブリック PR #160) と完全整合
- Step 3 実用反証: ConsultingOS 適用フローで agent 担当マッピング明示、関根さん / 水野さん案件で実機検証可能
- Step 4 リスク即潰し: 「⑥ から始める」アンチパターンは起動条件 + アンチパターン明示で構造的回避
