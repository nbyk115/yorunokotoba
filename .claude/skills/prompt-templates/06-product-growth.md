# プロダクト・グロースプロンプト集（5本）

## P26. PMF 検証（ケーガン 4 Big Risks + Sean Ellis 40% Test）

```
あなたは product-manager エージェントです。
.claude/agents/product/product-manager.md「必須ルール」に従ってください。

[プロダクト]: [概要]
[現状フェーズ]: [Pre-PMF / PMF達成 / Scaling]

以下のゲートを通す:

1. ケーガン 4 Big Risks
   - Value（顧客は使うか）
   - Usability（使えるか）
   - Feasibility（作れるか）
   - Business Viability（事業として成立するか）

2. Sean Ellis 40% Test（PMF 判定）
   - "How would you feel if you could no longer use [product]?"
   - "Very disappointed" が 40% 以上 → PMF 達成
   - 40% 未満 → 施策提案を止める（グロース不可）

3. クリステンセン JTBD 転換
   - 顧客が解雇した代替手段（hired-from / fired-from）
   - Job 未達成時の workaround
   - Disruption ポテンシャル判定:
     - ローエンド or 新市場から始まっているか
     - 既存リーダーが「儲からない」と無視する領域か
     - 性能改善ベクトルがあるか

4. カーネマン Pre-mortem 必須化
   - 「機能をリリースして3ヶ月後 PMF 取れていない場合の理由」を最低5つ
   - 失敗パターンを先に潰してから着手判断

5. 佐藤裕介 JD ファースト原則
   - 機能と同時に運用 JD を定義
   - 属人ヒーロー前提のロードマップを禁止

6. Continuous Discovery（ケーガン）
   - 週次顧客接触の設計
   - Discovery は「常時動作」

成果物:
- PMF スコア + 根拠
- 4 Big Risks 各軸の評価
- JTBD インタビュー設計（10-20人深掘り）
- Pre-mortem 5つ

出力末尾に反証チェック結果。
```

---

## P27. ロードマップ設計（ドーシー Editor's Pen + Beautiful Constraint）

```
あなたは product-manager エージェントです。

[プロダクト]: [現状機能・MAU/DAU 等]
[期間]: [次四半期 / 半年 / 1年]
[戦略テーマ]: [プロダクトビジョンとの整合]

以下を設計:

1. ドーシー Editor's Pen 規律
   - バックログから「何を選び、何を捨てたか」を必ずペアで提示
   - 機能リクエストは1日数百件来る前提で、99% を捨て 1-2 を選ぶ

2. Beautiful Constraint Statement
   - 全機能定義に「この製品の beautiful constraint は何か」
   - 例: 「3タップ以内」「設定画面ゼロ」「ログイン不要」

3. "Limit the number of details to perfect"
   - 完璧にする項目数自体を 3 つに制限
   - 30 項目を 70% で出すより 3 項目を 100% で

4. Foundational vs Surface 二分法
   - 基盤投資 / 表層追加 の 2 列で可視化
   - 基盤投資 0 が 3 スプリント続いたら警告

5. ケーガン Outcome over Output
   - 機能ではなくビジネス成果（Outcome）で評価
   - 各機能に「測定する Outcome 指標」を必須化

6. 4 Big Risks（Discovery で先に潰す）
   - Value / Usability / Feasibility / Business Viability

7. CEO Decision Failure メトリクス
   - 経営/上位者にエスカレーションした意思決定の頻度
   - 月次集計、頻度上昇は組織設計欠陥として警告

成果物:
- ロードマップ（Foundational / Surface 2列）
- 各機能の Beautiful Constraint
- 各機能の Outcome 指標
- 捨てたものリスト + 理由

出力末尾に反証チェック結果。
```

---

## P28. グロース実験設計（Sean Ellis ICE + High-Tempo Testing）

```
あなたは growth-hacker エージェントです。
.claude/agents/creative/growth-hacker.md「必須ゲート」に従ってください。

[現状]:
- North Star Metric: [指標名 + 現状値]
- ファネル: [各段階の数値]
- PMF Survey スコア: [Very disappointed の %]

実験設計プロセス:

1. PMF First チェック
   - PMF Survey 40% 未満 → 実験提案を止める
   - 40% 以上 → 続行

2. North Star Metric 確認
   - 全提案に North Star を1つだけ明示
   - 例: Slack/Facebook = DAU、Amplitude = WAU

3. ICE スコアリング
   - Impact（影響度）× Confidence（確信度）× Ease（容易さ）
   - 各 1-10 で評価
   - スコア順に実験優先度

4. High-Tempo Testing
   - 週次で複数の施策仮説を実行
   - 学習速度で勝つ

5. Wei Status as a Service 診断（バイラル / リファラル設計時）
   - Token: このプラットフォームのステータス・トークンは何か
   - Proof of Work: ステータス獲得の労力
   - Scarcity: 希少性

6. Tight Feedback Loop KPI
   - 創作 → 配信 → フィードバック → 再創作 のループ短さ

7. FOMO as a Service 反証
   - well-being を毀損する設計を検知

成果物:
- 実験仮説 5-10件（ICE スコア順）
- North Star Metric への影響予測
- StaaS 3点診断（バイラル/リファラル系のみ）
- 週次実験テンポの設計

出力末尾に反証チェック結果。
```

---

## P29. VOC 統合（カーネマン 4象限 + クリステンセン 3次元 Job）

```
あなたは feedback-synthesizer エージェントです。
.claude/agents/product/feedback-synthesizer.md「必須 VOC 分類軸」に従ってください。

[VOC データ]:
[アンケート / レビュー / サポート問合せ / NPS コメント等を貼り付け]

以下の分類で統合:

1. 4象限分類（カーネマン）
   - 機能要望（Functional Job）
   - 感情ノイズ（Stable pattern noise）
   - 構造的不満（Behavioral signal）
   - 一時的不満（Occasion noise: 重み付けを下げる）

2. 3次元 Job 分類（クリステンセン）
   - Functional Job: 機能的用事
   - Social Job: 他者からどう見られたいか
   - Emotional Job: 自分がどう感じたいか
   - 3次元すべて満たす要望は優先度上げ
   - Functional のみは陳腐化リスク

3. ドーシー Editor's Pen
   - 全フィードバックを「採用 3 / 棚上げ / 却下」の3階層に編集
   - 「全部拾う」VOC レポートは却下

4. "Hard things in good times" シグナル検知
   - KPI 好調期にこそ「今やるべき難題」を VOC から拾う
   - 業績低下時に拾うのは遅い

5. Constraint Violation Pattern 検知
   - 「制約を外してほしい」系を別レポート化
   - 多数決で外すと製品が死ぬ → 別判断軸で扱う

6. Permanent Log バイアス検知（シュピーゲル）
   - 「保存されたデータ」だけでなく「消えた行動・短時間滞在」もインサイト源

成果物:
- 4象限マトリクスでの分類
- 採用 3 / 棚上げ / 却下 のリスト
- Hard things in good times 候補
- Constraint Violation Pattern レポート

出力末尾に反証チェック結果。
```

---

## P30. カスタマーサクセス設計（Lincoln Murphy + ライクヘルド NPS 3.0）

```
あなたは client-success エージェントです。
.claude/agents/consulting/client-success.md「必須ゲート」に従ってください。

[顧客情報]:
- 顧客セグメント: [Tier / 業界 / 規模]
- 契約形態: [年間 / 複数年 / 月額]
- 利用状況: [Health Score / 利用ログ]

以下を設計:

1. マーフィー Desired Outcome カード（全顧客必須）
   - Required Outcome（達成すべき本質的成果）
   - Appropriate Experience（達成プロセスへの体験要件）

2. ヘルススコア 2軸化
   - Required 達成度（成果は出ているか）
   - Appropriate Experience 充足度（体験は良いか）
   - 1軸（成果のみ）でヘルスを測ると体験で離反する顧客を見逃す

3. Success Milestones 設計
   - First Value 達成（TTFV を最重要指標）
   - 定着
   - 拡張

4. Success Potential 評価（契約前）
   - 顧客側の準備度 + 自社の適合度
   - 低スコア顧客は条件調整 or 失注選択

5. ライクヘルド NPS 3.0 / Earned Growth Rate
   - NPS 単体ではなく EGR を計測
   - EGR = 既存顧客 NRR + 紹介経由新規売上 ÷ 前期売上
   - 顧客コホート別 LTV/CAC を四半期 PL に組み込み
   - CFO が信じる財務指標に変換

6. Proactive Engagement 設計
   - 反応的サポートではなく能動的関与
   - Health Score 低下の early warning
   - 解約予兆の先回り対応

7. Churn 防止プレイブック
   - L0/L1/L2/L3 の Champion 行動評価
   - 各レベル別の介入策

成果物:
- Desired Outcome カード（テンプレ）
- 2軸ヘルススコアの設計
- Success Milestones（First Value / 定着 / 拡張）
- EGR 計測設計

出力末尾に反証チェック結果。
```


## 出典・依拠先

- FACT: 本ファイルは @nbyk115/consulting-os の ConsultingOS 規律ファイルとして 2026-05-05 PR #65 で体系的明示物理化により定義された（ファイルパス: .claude/skills/prompt-templates/06-product-growth.md）
- INFERENCE: 業界標準ベストプラクティス（佐藤裕介流の構造で売る原則、Boris Cherny 流の 9 規律 ruthlessly edit、該当部門の業界フレームワーク）から派生し実装
- SPECULATION: 4 週間ごとの再評価カレンダー（evolution-log.md 再評価カレンダーセクション）で形骸化検出、Boris #3 削除セット対象、規律違反発生時は統合 / 分離 / 削除で整理予定
