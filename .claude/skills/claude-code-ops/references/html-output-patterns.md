# HTML-First 出力パターンガイド（2026-05-14 統合、Thariq @trq212 / Anthropic Claude Code チーム）

`tech-lead` + `sales-deck-designer` + `frontend-dev` + `creative-director` + `brand-guardian` 連携の出力フォーマット規律。出力対象別の Markdown vs HTML 選択基準、ブランド規律違反防止の検証コマンドを物理化。

出典: Thariq (@trq212) 「Using Claude Code: The Unreasonable Effectiveness of HTML」(X 1,100 万 View、2026-05、INFERENCE: ユーザー提示テキスト経由、一次出典 URL https://x.com/trq212/status/2052809885763747935 別途確認推奨)。

## 1. 採用範囲: 「読者が人間か Claude か」境界線

YOU MUST: 出力フォーマット選択は「読者が人間か Claude か」を境界線とする。

| 読者 | 出力フォーマット | 該当 |
|---|---|---|
| 人間（クライアント / 経営層 / 開発者 / 自分自身レビュー）| HTML 推奨 | visual / sales-deck / クライアント計画書 / レポート / プロトタイプ / カスタム編集 UI |
| Claude（grep / Read / agent 連携対象）| Markdown 維持 | SKILL / agent.md / CLAUDE.md / evolution-log / 規律ファイル |

= 全面 HTML 化は Boris #3 ruthlessly edit 違反 + ハードルール 13 形骸化リスク。境界線「読者」で切る。

## 2. HTML 化推奨ユースケース（Thariq 提案 5 件）

### 2.1 設計・計画・探索

- 100 行超の Markdown 計画書は読まれない
- HTML で「6 つの異なるアプローチをグリッドで並べてトレードオフ比較」「実装計画 + モックアップ + データフロー + コードスニペット を 1 ページ」

### 2.2 コードレビュー・理解

- PR レビューを HTML アーティファクトで（diff インライン + マージン注釈 + 重要度カラー）
- 「すべての PR に HTML 形式コード解説を添付」(Thariq 実践)
- ConsultingOS 注意: git diff レビューは Markdown のまま、HTML は補助資料として併走（2 層運用）

### 2.3 デザイン・プロトタイプ

- 「スライダーで色 / アニメ速度 / イージング調整」「コピーボタンで気に入ったパラメータ抽出」
- React / Swift 実装前に HTML でスケッチ → 書き換え

### 2.4 レポート・リサーチ

- 「フロー図 + 重要コードスニペット 3-4 個 + 落とし穴セクション = 1 回読んで理解」
- Slack / コードベース / git 履歴 / インターネット横断調査の合成

### 2.5 カスタム編集インターフェース（最強）

- 「30 件 Linear チケットをドラッグでカテゴリ分類、Markdown コピー」
- 「左右並びエディタ: 左でプロンプト編集、右でリアルタイム反映」
- 使い捨て UI、再利用不要、テキストだけで指示するより 100 倍効率

### 2.6 システム / アプリ全体可視化 (HTML + JSON 二層、2026-05-14 追加)

Thariq の発想を「自社システム全体のドキュメント化」に拡張するパターン。海外で話題化（PR #149 で ConsultingOS 自体に物理化）。

構造:
- HTML 1 ページ: 人間が読むための全体像可視化（クリック可能なワークフロー、モジュール間連携、agent / skill / hook の発火順序）
- JSON 1 ファイル: 次の LLM セッションがコンテキスト bootstrap するための構造化データ

YOU MUST: 以下プロンプトで「自社システムの可視化セット」を生成、定期更新:

```
このリポジトリ / プロダクトの構成を、ワークフロー単位で整理して。
1 ページ HTML でクリック可能な全体像 + JSON 1 ファイル（LLM bootstrap 用）を出力。
HTML 上で「主要ワークフロー X / Y / Z」をボタンで切替、選択時に対応する agent / skill / hook / 出力をフロー図で可視化。
誰が読んでも迷子にならない粒度で、外部に見せるほどキレイじゃなくていい。
```

効果:
- 引き継ぎ地獄回避: 一度作れば「どこが何をしていて、どこが境界か」が共有資産化
- コンテキスト bloat 防止: 新セッションで JSON を貼るだけで Read 連発不要 = トークン節約 + 速度向上
- 自己説明型コードベース: コードベースが「自分で説明してくれる」状態

ConsultingOS 実装例: `examples/consulting-os-workflow-map/index.html` + `workflow.json` (PR #149)

クライアント案件への適用:
- 関根さん N&Y Craft OEM: クラフトビール業界の業務フロー可視化（在庫 / 配送 / 顧客対応）
- 水野さん v4 投資先候補: 投資検討企業の組織 / プロダクト全体像可視化セット要求

## 3. HTML 化のメリット / デメリット

| 軸 | HTML | Markdown |
|---|---|---|
| 情報密度 | 高（タブ / カラー / 図解）| 低 |
| インタラクション | 可（スライダー / ボタン / リアルタイム反映）| 不可 |
| 共有性 | S3 URL ワンクリック | Slack 添付埋もれ |
| 読まれる確率 | 「格段に高い」(Thariq)| 100 行超でドロップ |
| トークン消費 | 2-4 倍 | 標準 |
| 生成時間 | 2-4 倍 | 標準 |
| バージョン管理 | git diff ノイズ多 | 差分明快 |
| 編集難易度 | 高（人間手編集困難）| 低 |

## 4. ConsultingOS 規律違反リスク 4 件（brand-guardian 特定）

### 4.1 lang 属性省略リスク（高優先）

HTML 自動生成で `<html lang="ja">` 自動付与漏れが頻発。ハードルール 10 違反。

検証コマンド: `grep 'lang="ja"' output.html` → 欠落時 REJECT

### 4.2 フォントスタック無指定リスク（高優先）

`font-family` フォールバック未指定で中国字形レンダリング事故。ハードルール 10 + brand-guidelines.md §推奨フォントスタック違反。

検証コマンド: `grep 'font-family' output.html | grep -v 'Noto Sans JP\|Yu Gothic\|Hiragino'` → ヒット時 REJECT

### 4.3 em ダッシュ HTML entity 混入リスク（中優先）

Markdown → HTML 変換時 `---` が `&mdash;` (U+2014) に自動変換されるレンダラー存在。ハードルール 16 違反、テキスト grep で検出不可。

検証コマンド: `grep '&mdash;\|&#8212;\|&#x2014;' output.html` → ヒット時 REJECT

### 4.4 raw `**` 残留リスク（低優先）

Markdown 太字 `**テキスト**` の HTML 変換漏れ。ハードルール 16 + brand-guidelines.md ① 違反。

検証コマンド: `grep '\*\*' output.html` → ヒット時 REJECT

## 5. 2 層構造運用（sales-deck-designer 必須）

B2B 提案デッキは以下 2 層構造で運用:

1. **設計層**（Markdown 5-7 ファイル）: 00-business-plan-master / 01-icp / 02-pricing / 03-competitive / 04-pl / 05-rebuttal 等。git diff レビュー / agent 並列レビュー / 反証チェック対象
2. **配信層**（HTML 単一）: Markdown を 1 ファイル HTML に build、Slack リンク共有、クライアント送付

理由: HTML 単一化すると agent 並列レビュー時の高速 diff が失われる、Markdown 設計層は agent 連携の必須資産。

## 6. agent 別 output format 推奨

| agent | デフォルト | 例外（HTML 推奨）|
|---|---|---|
| tech-lead / fullstack-dev / ai-engineer / infra-devops | Markdown | クライアントレビュー向け成果物 |
| frontend-dev | Markdown（コード）| クライアントレビュー / プロトタイプ |
| sales-deck-designer | 2 層構造 | 全デッキ（Markdown 設計層 + HTML 配信層）|
| proposal-writer | Markdown（設計層）+ HTML（配信層）| クライアント送付物 |
| creative-director | Markdown（ブリーフ）+ HTML（visual / プロトタイプ）| 人間が読む成果物全般 |
| brand-guardian / strategy-lead 等 | Markdown 維持 | 例外なし |

## 7. ConsultingOS 自己診断（HTML-First 採用状況）

| 既存資産 | 現状 | 判定 |
|---|---|---|
| visual v9（IR デッキ品質）| HTML | 採用済 |
| 関根さん N&Y Craft 提案 | Markdown 5 ファイル | 2 層構造化候補（次回提案で HTML 配信層追加）|
| 水野さん v4 事業計画 | Markdown 7 ファイル + HTML pitch 4 形式 | 4 形式並存は冗長、1 形式 HTML 配信層に絞る |
| hotice deck | HTML | 採用済 |
| 36 skill / agent.md / evolution-log | Markdown | 維持（Claude 読者対象）|

## 8. ICP 提案質問 41 件目追加

41. クライアント納品物が「読まれる確率」を最大化する出力フォーマット（HTML 配信層）に設計されているか、Markdown 単一依存に閉じていないか

## 9. 関連参照

- 出典: Thariq @trq212「Using Claude Code: The Unreasonable Effectiveness of HTML」(INFERENCE)
- 関連 skill: DESIGN.md §12.5（HTML + Playwright 推奨デフォルト、PR #139）/ `boris-cherny-9-rules.md` / `karpathy-12-rules.md`
- 関連 agent: creative-director / sales-deck-designer / frontend-dev / brand-guardian / tech-lead
- 関連: visual v9（採用済実例）/ hotice deck（採用済実例）

## 10. 反証チェック（Step 1-4 圧縮）

- Step 1: Thariq 発言 / X 1,100 万 View は INFERENCE（一次出典 URL 提示あり、本セッション未取得）/ 「読まれる確率格段に高い」は実証 INFERENCE（受注率実証なし）
- Step 2: 既存 36 軸体系 + DESIGN.md §12.5 + ハードルール 10 / 13 / 16 と整合検証済、4 agent 並列評価（creative-director / sales-deck-designer / tech-lead / brand-guardian）で構造的妥当性確認
- Step 3 実用反証: visual v9 + hotice deck の HTML 採用実証あり、検証コマンド 4 件（lang / font / em-dash entity / `**`）は実行可能
- Step 4 リスク即潰し: ブランド規律違反 4 リスクは brand-guardian 検証フロー追加で構造的に発生不可能化、2 層構造運用は sales-deck-designer description 改訂で物理化
