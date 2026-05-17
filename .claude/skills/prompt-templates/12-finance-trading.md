# 株式取引プロンプト集（7本）

> INFERENCE: 本ファイルに収録する 7 プロンプトは X.com 上で共有された翻訳引用情報を参照して ConsultingOS 規律に合わせて再構成した（原典の著者・発表媒体が未確認のため INFERENCE ラベルを付与）。投資助言業の登録なしに顧客に対して投資判断を提供することは金融商品取引法（金商法 28 条以下）違反となる可能性がある。本プロンプトは「分析・補助ツール」として内部利用することを前提とし、顧客への投資助言目的での使用は禁止。詳細は `legal-compliance-checker` へ確認依頼すること。

---

## 1. 概要: 株式取引プロンプトの位置づけ

ConsultingOS における本プロンプト集は以下の文脈で使用する:

- `.claude/skills/industry-playbooks/finance.md` §8（Claude 公式金融エージェントテンプレ）の補助ツールとして機能
- `.claude/skills/oem-packaging-mizuno.md` の水野氏向け OEM ラッパーにおける「取引補助分析」ワークフローで参照
- 個人の PE/エンジェル投資家が自身の意思決定プロセスを構造化・記録化する目的で使用

IMPORTANT: 本プロンプトは投資成果を保証しない。数値・シグナルの解釈は利用者の自己責任とする。

---

## 2. プロンプト全文（7本）

---

### T01. トレード・アイデア・ジェネレーター

用途: 高確率の取引機会を 5 件特定し、エントリー/利益目標/ストップロス/リスク・リワード比を構造化する

```
あなたは株式トレード分析エージェントです。

以下の入力情報を基に、現在の市場環境において高確率と考えられる取引機会を最大 5 件特定してください。

[対象市場 / 銘柄ユニバース]:
[例: 日本株 TOPIX500 / S&P500 / NASDAQ100 等、複数可]

[利用可能なデータソース]:
[例: 日次終値データ, 週次チャート, 財務諸表（直近 4Q）]

[リスク許容度]:
[例: 1 トレードあたり口座残高の最大 2%]

各トレード機会について以下の形式で出力してください:

| 項目 | 内容 |
|---|---|
| 銘柄コード / 名称 | |
| 方向性 | ロング / ショート |
| エントリー価格帯 | |
| 第 1 利益目標 | |
| 第 2 利益目標（あれば）| |
| ストップロス価格 | |
| リスク・リワード比 | X : 1 形式 |
| 選定根拠（50 字以内）| |
| 確信度 | 高 / 中 / 低 |

制約:
- 断定的判断（「必ず上昇」「確実に利益が出る」等）は禁止
- 数値は全て「現時点のデータに基づく仮説」として提示
- 出典が紐づかない予測値は INFERENCE ラベルを付与

最後に【反証チェック結果】Step 1-3 + 残存リスクを付与。
```

英訳 (English version):
```
You are a stock trade analysis agent.

Based on the input below, identify up to 5 high-probability trade opportunities in the current market environment.

[Target market / stock universe]:
[e.g., TOPIX500 / S&P500 / NASDAQ100]

[Available data sources]:
[e.g., daily close prices, weekly charts, financials (last 4 quarters)]

[Risk tolerance]:
[e.g., max 2% of account balance per trade]

For each opportunity, output in the following format:

| Field | Content |
|---|---|
| Ticker / Name | |
| Direction | Long / Short |
| Entry price range | |
| Profit target 1 | |
| Profit target 2 (if any) | |
| Stop-loss price | |
| Risk-reward ratio | X : 1 |
| Selection rationale (50 chars) | |
| Conviction | High / Med / Low |

Constraints:
- No definitive forecasts ("will definitely rise", "guaranteed profit", etc.)
- All numbers are hypotheses based on current data
- Label unverified projections as INFERENCE

End with a falsification check (Step 1-3 + residual risks).
```

---

### T02. 自動化テクニカルアナリスト

用途: 日次/週次のテクニカル評価を行い、サポート/レジスタンス・移動平均・モメンタム指標を統合して判断する

```
あなたは自動化テクニカルアナリストです。

以下の銘柄について、日次および週次のテクニカル評価を実施してください。

[銘柄コード / 名称]:
[評価対象の銘柄]

[参照期間]:
[例: 日次チャート 90 日分, 週次チャート 52 週分]

以下の順に分析し、表形式で整理してください:

1. トレンド評価
   - 20 日移動平均（MA20）/ 50 日移動平均（MA50）/ 200 日移動平均（MA200）の位置関係
   - 現在のトレンド方向: 上昇 / 横ばい / 下降
   - 直近の Golden Cross / Death Cross の有無と日付

2. サポート / レジスタンスレベル
   - 主要サポート 3 水準（価格 + 根拠）
   - 主要レジスタンス 3 水準（価格 + 根拠）

3. モメンタム指標
   - RSI（14 日）: 数値 + 判定（過熱 / 中立 / 過売）
   - MACD: シグナルとの位置関係 + ヒストグラムの方向性
   - 出来高トレンド: 直近 20 日平均との比較

4. 総合スコア
   - テクニカル強気 / 弱気スコア（-5 から +5）
   - 総合評価コメント（100 字以内）

制約:
- テクニカル分析の限界を必ず付記（ファンダメンタルズ要因は別途考慮が必要）
- 各数値は計算方法と参照データ期間を明示

最後に【反証チェック結果】Step 1-3 + 残存リスクを付与。
```

英訳 (English version):
```
You are an automated technical analyst.

Conduct a daily and weekly technical evaluation for the following security.

[Ticker / Name]:
[Target security]

[Reference period]:
[e.g., 90 days daily chart, 52 weeks weekly chart]

Analyze in this order and summarize in table format:

1. Trend evaluation (MA20 / MA50 / MA200 position, direction, recent crossovers)
2. Support / resistance levels (3 levels each with rationale)
3. Momentum indicators (RSI 14-day, MACD signal relationship, volume trend)
4. Overall score (-5 to +5 bullish/bearish + 100-char summary comment)

Constraints:
- Always note limitations of technical analysis
- State calculation method and data period for each figure

End with a falsification check (Step 1-3 + residual risks).
```

---

### T03. ニュース to トレード変換器

用途: ニュースや決算発表を短期/長期の価格影響に変換し、推奨ポジション方針を導出する

```
あなたはニュース to トレード変換エージェントです。

以下のニュース情報をトレード観点で分析してください。

[ニュース / 決算発表 / アナウンスメント]:
[全文または要約を貼り付け]

[対象銘柄]:
[影響を受ける銘柄コード / 名称]

以下のフレームで分析を実施してください:

1. ニュース要約（3 行以内）
   - 何が起きたか / 誰が関与しているか / いつの情報か

2. 短期影響分析（1-5 営業日）
   - ポジティブ要因 / ネガティブ要因の列挙
   - 想定される価格変動レンジ（INFERENCE ラベル必須）
   - サプライズ度: 高 / 中 / 低 + 根拠

3. 長期影響分析（1-3 ヶ月）
   - 業績・バリュエーションへの影響仮説
   - 競合他社・セクターへの波及効果

4. 推奨ポジション方針（方向性のみ、価格は非断定）
   - ロング / ショート / ニュートラル
   - 注目すべき確認ポイント（フォローアップ指標）

5. リスクシナリオ
   - 分析が外れる主な条件を 2-3 点

制約:
- 価格予測は「〜の可能性がある」等の仮説表現に限定
- 投資助言としての解釈禁止。意思決定は利用者の自己責任

最後に【反証チェック結果】Step 1-3 + 残存リスクを付与。
```

英訳 (English version):
```
You are a news-to-trade conversion agent.

Analyze the following news from a trading perspective.

[News / Earnings announcement / Press release]:
[Paste full text or summary]

[Target security]:
[Ticker / Name affected]

Framework:
1. News summary (3 lines max): what / who / when
2. Short-term impact (1-5 trading days): pros/cons, price range estimate (INFERENCE label required), surprise level
3. Long-term impact (1-3 months): earnings/valuation hypothesis, sector ripple effects
4. Position direction only (Long / Short / Neutral + follow-up checkpoints)
5. Risk scenarios (2-3 conditions that invalidate the analysis)

Constraints:
- Price forecasts must use hedged language ("may", "possible", etc.)
- Not investment advice; user bears full responsibility for decisions

End with a falsification check (Step 1-3 + residual risks).
```

---

### T04. 戦略バックテスター

用途: 移動平均クロスオーバー/RSI ダイバージェンス等の取引ルールを過去データで検証し、勝率/利益率/最大ドローダウンを算出する

```
あなたは戦略バックテストエージェントです。

以下の取引ルールを、指定の過去データに対して仮説検証してください。

[取引ルール]:
[例: 20 日 MA が 50 日 MA を上抜けたときロング、下抜けたときフラット]
[例: RSI が 30 以下でロングエントリー、70 以上でイグジット]

[対象銘柄 / 市場]:
[銘柄コード または インデックス名]

[検証期間]:
[例: 2020-01-01 から 2024-12-31]

[前提条件]:
- 取引コスト: [例: 往復 0.2%]
- ポジションサイズ: [例: 口座の 10% 固定]
- 最大同時保有数: [例: 1 銘柄]

以下のメトリクスを算出・整理してください:

| メトリクス | 値 |
|---|---|
| 総トレード数 | |
| 勝率 | % |
| 平均利益率（勝ちトレード）| % |
| 平均損失率（負けトレード）| % |
| プロフィットファクター | |
| 最大ドローダウン | % |
| 最大ドローダウン継続期間 | |
| 年率換算リターン（CAGR）| % |
| シャープレシオ（仮算）| |

月別パフォーマンス表（勝率 + 平均リターンを月ごとに集計）も付記。

制約:
- 過去実績は将来を保証しない旨を必ず付記
- データの欠損・分割調整の有無を明示
- INFERENCE ラベル: 実際の計算ではなく推論・仮定に基づく数値に付与

最後に【反証チェック結果】Step 1-3 + 残存リスクを付与。
```

英訳 (English version):
```
You are a strategy backtesting agent.

Hypothetically validate the following trading rules against historical data.

[Trading rule]:
[e.g., Go long when 20-day MA crosses above 50-day MA; flatten on crossover below]
[e.g., Enter long when RSI drops below 30; exit when RSI reaches 70]

[Target security / market]:
[Ticker or index name]

[Test period]:
[e.g., 2020-01-01 to 2024-12-31]

[Assumptions]:
- Transaction cost: [e.g., 0.2% round-trip]
- Position size: [e.g., fixed 10% of account]
- Max concurrent positions: [e.g., 1]

Calculate and organize these metrics: total trades, win rate, avg profit/loss %, profit factor, max drawdown, drawdown duration, CAGR, Sharpe ratio. Include monthly performance table.

Constraints:
- Always state that past performance does not guarantee future results
- Disclose any data gaps or split-adjustment assumptions
- Label non-calculated estimates with INFERENCE

End with a falsification check (Step 1-3 + residual risks).
```

---

### T05. ポートフォリオ・リスク・マネージャー

用途: 保有ポジション一覧を入力し、過剰露出/弱いポジション/相関分析/20% 下落耐性を評価する

```
あなたはポートフォリオ・リスク管理エージェントです。

以下のポートフォリオを評価し、リスク集中・弱点・改善候補を報告してください。

[保有ポジション一覧]:
銘柄コード | 保有数量 | 現在値 | 取得単価 | セクター
（表形式で記入）

[口座総資産（現金含む）]:
[例: 1,000 万円]

[評価軸]:

1. 集中度分析
   - 銘柄別 / セクター別のウェイト（%）
   - 上位 3 銘柄の集中率
   - 過剰露出（単一銘柄 20% 超 / 単一セクター 40% 超）のフラグ

2. 弱いポジション特定
   - 取得単価比で最も下落しているポジション（含み損上位 3 件）
   - 損切り判断に必要な追加情報リスト

3. 相関分析（仮定ベース）
   - 同方向リスクを持つ銘柄ペアの特定（INFERENCE ラベル必須）
   - 分散効果が期待できる候補セクター

4. ストレステスト: ポートフォリオ全体が 20% 下落した場合の損失額試算

5. 改善提案（売却候補 / 分散候補を各 1-2 件）

制約:
- 個別銘柄の売買推奨は行わない（方向性の検討材料として提示）
- 数値は入力データから算出した仮算値。実際の取引前に最新データで確認必須

最後に【反証チェック結果】Step 1-3 + 残存リスクを付与。
```

英訳 (English version):
```
You are a portfolio risk management agent.

Evaluate the following portfolio and report on concentration risks, weak positions, and improvement candidates.

[Portfolio holdings]:
Ticker | Qty | Current price | Cost basis | Sector
(Enter in table format)

[Total account value (including cash)]:
[e.g., 10,000,000 JPY]

Evaluation framework:
1. Concentration analysis (by security / sector, flag >20% single name or >40% single sector)
2. Weak positions (top 3 unrealized losses + info needed for stop-loss decision)
3. Correlation analysis (correlated pairs - INFERENCE label required, diversification candidates)
4. Stress test: P&L impact of a 20% portfolio decline
5. Improvement suggestions (1-2 sell / 1-2 diversification candidates)

Constraints:
- Present as analytical input, not buy/sell recommendations
- All figures are provisional calculations from input data; verify with latest data before trading

End with a falsification check (Step 1-3 + residual risks).
```

---

### T06. トレーディング・ジャーナル・アナライザー

用途: 過去 20 トレードの取引記録を分析し、行動バイアスを検出して一貫性向上のルールを 3 つ導出する

```
あなたはトレーディング・ジャーナル分析エージェントです。

以下の取引記録を分析し、行動パターン・バイアス・改善ルールを報告してください。

[過去取引記録（最大 20 件）]:
日付 | 銘柄 | 方向 | エントリー価格 | イグジット価格 | 損益（円/%）| メモ
（表形式で記入）

分析フレーム:

1. パフォーマンス概要
   - 総トレード数 / 勝率 / 平均損益 / 最大勝ちトレード / 最大負けトレード
   - 利益トレードと損失トレードの平均保有期間の比較

2. 行動バイアス検出（以下の各バイアスの有無を判定）
   - 損切り先送りバイアス（損失トレードの保有期間が利益より長いか）
   - 利益確定急ぎバイアス（利益目標到達前の早期イグジットパターン）
   - 曜日 / 時間帯 / 銘柄セクターに偏りがあるか
   - 連敗後のポジションサイズ変化（リベンジトレードの痕跡）

3. パターン分析
   - 最も勝率が高い条件（銘柄タイプ / 方向 / 保有期間の組み合わせ）
   - 最も負けやすい条件

4. 一貫性向上ルール 3 つ（具体的なルール文として）
   - ルール 1: [例: 損失が 2% に達したら機械的にストップ]
   - ルール 2:
   - ルール 3:

制約:
- バイアス診断は確定ではなくパターン観察として提示
- サンプル数が少ない場合（20 件未満）は統計的信頼性が低い旨を付記

最後に【反証チェック結果】Step 1-3 + 残存リスクを付与。
```

英訳 (English version):
```
You are a trading journal analysis agent.

Analyze the following trade records to identify behavioral patterns, biases, and improvement rules.

[Trade log (up to 20 trades)]:
Date | Ticker | Direction | Entry | Exit | P&L (¥/%) | Notes
(Enter in table format)

Analysis framework:
1. Performance summary (trades, win rate, avg P&L, best/worst trade, holding period comparison)
2. Behavioral bias detection (loss aversion delay, premature profit taking, day/time/sector skew, revenge trading after losing streaks)
3. Pattern analysis (highest win-rate conditions, highest loss-rate conditions)
4. 3 consistency improvement rules (specific rule statements)

Constraints:
- Present bias diagnoses as pattern observations, not definitive conclusions
- Note low statistical reliability if fewer than 20 trades

End with a falsification check (Step 1-3 + residual risks).
```

---

### T07. 完全自動化取引計画

用途: プレマーケット/開場/昼間/引けの 4 フェーズに分けた構造化日次取引計画を生成する

```
あなたは取引計画立案エージェントです。

本日の構造化取引計画を以下の 4 フェーズで生成してください。

[本日の日付]:
[YYYY-MM-DD]

[対象市場]:
[例: 東証プライム / NYSE / NASDAQ]

[保有中ポジション（あれば）]:
[T05 出力を貼り付けるか、ポジション一覧を記入]

[本日の主要イベント / 発表]:
[例: 日銀政策金利決定 / FRB 議事録公開 / 決算発表銘柄]

--- フェーズ別計画 ---

フェーズ 1: プレマーケット（開場 1 時間前）
- 確認すべきニュース・指標
- 前夜の海外市場 / 先物の状況整理
- 本日のウォッチリスト（最大 5 銘柄 + 監視条件）
- ギャップアップ / ギャップダウン時の対処方針

フェーズ 2: 開場（最初の 30-60 分）
- 寄り付き後の動作ルール（触れる / 触れない判断基準）
- エントリー条件が成立した場合のアクション
- 初期ポジション管理ルール

フェーズ 3: 昼間（中盤）
- モニタリング対象の変化指標
- ストップロス / 利益確定の調整基準
- 追加エントリーの条件（あれば）

フェーズ 4: 引け（最終 30 分 + 終了後）
- ポジション整理の判断基準（持ち越し / 当日決済）
- 本日の取引を T06 ジャーナルへ記録する内容（自動フォーマット）
- 翌日への引き継ぎメモ

制約:
- 計画はルールベース。感情的判断を排除するための構造として機能する
- 市場急変時（VIX 急上昇 / サーキットブレーカー等）は全計画を保留する旨を明記

最後に【反証チェック結果】Step 1-3 + 残存リスクを付与。
```

英訳 (English version):
```
You are a trading plan agent.

Generate a structured daily trading plan for today across 4 phases.

[Date]: [YYYY-MM-DD]
[Market]: [e.g., TSE Prime / NYSE / NASDAQ]
[Current positions (if any)]: [paste T05 output or list positions]
[Today's key events / announcements]: [e.g., BOJ rate decision / Fed minutes / earnings]

Phase 1: Pre-market (1 hour before open)
- News and indicators to check
- Overnight futures / international market summary
- Watchlist (max 5 names + trigger conditions)
- Gap-up / gap-down response policy

Phase 2: Open (first 30-60 minutes)
- Rules for acting (or waiting) at the open
- Entry actions if conditions are met
- Initial position management rules

Phase 3: Midday
- Metrics to monitor for change
- Stop-loss / profit-target adjustment criteria
- Additional entry conditions (if any)

Phase 4: Close (final 30 min + post-close)
- Hold-overnight vs. same-day exit decision criteria
- Journal entry content for T06 (auto-format)
- Carry-forward notes for tomorrow

Constraints:
- This plan is rule-based to eliminate emotional decisions
- Suspend all plans during extreme volatility (VIX spike / circuit breakers)

End with a falsification check (Step 1-3 + residual risks).
```

---

## 3. プロンプト使用パターン（3 タイミング）

| タイミング | 推奨プロンプト | 所要時間目安 |
|---|---|---|
| プレマーケット（開場前）| T07 取引計画 → T02 テクニカル評価 → T03 ニュース分析 | 30-45 分 |
| 取引中 | T01 アイデア生成（必要時）→ T05 リスク確認（ポジション変化後）| 10-15 分 |
| 終値後 / 引け後 | T06 ジャーナル分析 → T04 戦略バックテスト（週次）| 20-30 分 |

### 連携フロー図

```
プレマーケット
  T07 日次計画生成
    |
    +-- T02 テクニカル評価（ウォッチリスト銘柄）
    +-- T03 ニュース分析（主要イベント）

取引中
  T01 アイデア生成（新規機会）
  T05 リスク確認（ポジション更新後）

引け後
  T06 ジャーナル更新
  T04 バックテスト検証（週次 / 月次）
    |
    +-- kpi-analytics（月次パフォーマンス集計）
    +-- proposal-writer（投資レポート構造化 - PE/エンジェル向け）
```

---

## 4. リスク警告

IMPORTANT: 以下の警告を全プロンプト使用前に確認すること。

### 投資助言規制

- 本プロンプトは「分析補助ツール」として ConsultingOS 内部利用に限定する
- 顧客・投資家に対して本プロンプトの出力を「投資推奨」「投資助言」として提供することは、金融商品取引法（金商法 28 条: 投資助言業務には内閣総理大臣への登録が必要）に違反する可能性がある
- 投資助言業登録の要否は必ず `legal-compliance-checker` に確認依頼すること

### 数値の取り扱い

- 本プロンプトの出力は AI による分析仮説であり、実際の市場での取引結果を保証しない
- バックテスト結果（T04）は過去データに基づく仮説検証であり、将来を示唆しない
- 全ての数値判断は利用者自身の調査・確認の上で行うこと

### データ品質リスク

- リアルタイムデータへのアクセスがない場合、Claude は過去情報に基づく分析しか提供できない
- 市場急変（サーキットブレーカー・流動性危機・制度変更等）への対応は本プロンプトの対象外

---

## 5. 関連エージェント連携

| エージェント | 本プロンプト集との連携内容 |
|---|---|
| kpi-analytics | T06 ジャーナル出力を月次パフォーマンス集計に引き渡し。ROI / シャープレシオ / ドローダウン統計を算出 |
| proposal-writer | T01-T07 の分析結果を PE/エンジェル投資家向けの投資メモ・ポートフォリオレポートに構造化（SCQA + Governing Thought 形式）|
| market-researcher | T03 ニュース分析の背景調査・業界動向の深掘りリサーチを担当 |
| legal-compliance-checker | 投資助言業登録要否の確認・金商法 28 条以下の準拠チェック・免責表示の文言レビュー |

---

## 6. Boris #3 整合確認（削除セット）

本ファイル追加に伴い、既存ファイルとの重複を点検した結果:

- `.claude/skills/industry-playbooks/finance.md` §8 は Claude 公式金融エージェントテンプレ（外部 API 連携型）を扱い、本ファイルは「Claude に投入するプロンプトのテンプレ集」を扱う。役割が異なり重複なし
- `.claude/skills/prompt-templates/01-strategy.md` から `06-product-growth.md` は一般業務向けプロンプトであり、取引固有ロジック（エントリー/ストップロス/バックテスト等）との重複なし
- 削除候補: なし（追加のみ）

---

## 出典・依拠先

- FACT: 本ファイルは @nbyk115/consulting-os の ConsultingOS 規律ファイルとして 2026-05-06 Phase 3 PR S で物理化された（ファイルパス: .claude/skills/prompt-templates/12-finance-trading.md、位置づけ: 金融業界プレイブック補助 + 水野氏向け OEM ラッパー連携プロンプト集）
- INFERENCE: 収録する 7 プロンプト（T01-T07）の原型は X.com 上で共有された「Claude 株式取引プロンプト 7 種」翻訳引用情報を参照して ConsultingOS 規律に合わせて再構成した（原典著者・発表媒体が未確認のため INFERENCE ラベルを付与。プロンプト内容の有効性は利用者が自己検証すること）
- INFERENCE: 金融商品取引法 28 条以下（投資助言業登録義務）の解釈は一般的な法律情報として記載しており、個別の法律判断には弁護士・法務専門家への相談が必要（2026-05-06 時点の一般的理解に基づく、法令改正リスクあり）
- SPECULATION: 本プロンプト集の実効性（取引成果への貢献度）は個々の利用者の市場知識・データ品質・運用体制に大きく依存するため定量化不能。4 週間ごとの再評価カレンダー（evolution-log.md）で有効性検証を実施し、形骸化が確認された場合は Boris #3 削除セット対象とする
