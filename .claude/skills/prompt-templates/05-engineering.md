# エンジニアリングプロンプト集（5本）

## P21. アーキテクチャ設計レビュー（ファウラー + ヴォーゲルス + ハイタワー）

```
あなたは tech-lead エージェントです。
.claude/agents/service-dev/tech-lead.md「必須ゲート」に従ってください。

[設計対象]: [新規 or 既存システム]
[要件]: [機能要件・非機能要件]
[制約]: [予算・期間・チームスキル]

以下のゲートを通す:

1. ファウラー 可逆性チェック
   - この判断は後で巻き戻せるか
   - Strangler Fig で段階移行できるか
   - Branch by Abstraction で本番影響なく進められるか
   - 不可逆判断なら Plan Mode で承認

2. ドーシー Constraint-Driven Architecture
   - 駆動制約を1行で明示（latency 100ms / 依存3つまで / etc.）
   - 制約のない設計は却下

3. ドーシー Foundational vs Surface 判定
   - 基盤層への投資か、表層への追加か
   - 表層追加が3回続いたら基盤再設計

4. ヴォーゲルス Frugal Architect 7 Laws
   - Cost = NFR / Aligned profit & cost / Architect = trade-offs
   - Unobserved = unknown cost / Tier by criticality
   - Continuous optimization / Challenge status quo
   - Cost Tier / Observability / Assumption Challenge 3欄必須

5. ハイタワー "Does it provide value?" テスト
   - バンドワゴン排除（流行だから採用は禁止）
   - Day-2 First 設計（3ヶ月後の運用コストを見積）
   - Boring Technology 優先（革新ポイント1-2個に絞る）
   - Declarative > Imperative

成果物:
- アーキテクチャ図（必要なら mermaid）
- ADR（Architecture Decision Record）
  - 判断 / 代替案 / トレードオフ
  - 駆動制約 / 可逆性 / Cost Tier

出力末尾に反証チェック結果。
```

---

## P22. コードレビュー（ベック Tidy First + ヘルスバーグ Type-First）

```
あなたは fullstack-dev エージェントです。
.claude/agents/service-dev/fullstack-dev.md「必須規律」に従ってください。

[レビュー対象]:
[コードを貼るかファイルパスを指定]

以下の観点で順番にレビュー:

1. ベック Tidy First チェック
   - 1 PR = Tidying（構造変更）or Behavior change（振る舞い変更）か
   - 混在していないか（混在は却下）
   - コミットメッセージに `tidy:` プレフィックスがあるか（構造のみ変更時）

2. ベック Augmented Coding チェック
   - テストカバレッジ・複雑度・保守性が維持されているか
   - Vibe coding（AI に丸投げで動けば良し）になっていないか

3. ヘルスバーグ Type-First 規律
   - any 禁止（境界に unknown で受けナローイング）
   - strict null checks 必須
   - 型定義をレビュー第一段階に
   - AI 生成コードは「型が通ったら検証 50% 完了」
   - Type erosion 防止（境界以外で any が漏れていないか）

4. セキュリティレビュー（Layer 1/2 連動）
   - .env / credentials / secrets への参照
   - 外部 API への POST/PUT/DELETE が承認なし
   - rm -rf / chmod 777 / 危険コマンド

5. アモデイ Pre-deployment Safety（AI 機能含む場合）
   - プロンプトインジェクション耐性
   - Tool use の権限境界（deny-list）
   - PII / 機密データの監査ログ
   - ロールバック手順

成果物:
- 各観点の Pass / Fail / 改善案
- ブロッカー（マージ不可）/ 推奨修正 / Nice to have を分離

出力末尾に反証チェック結果。
```

---

## P23. デバッグ診断（反証ベース）

```
あなたは fullstack-dev or tech-lead エージェントです。
.claude/skills/debug-methodology.md に従ってください。

[症状]: [何が起きているか具体的に]
[再現手順]: [Step by Step]
[エラーログ]: [ログを貼り付け、または最初の20-30行のみ]

反証ベースで診断:

1. 5 Whys を5回連続で掘り下げ
   - 各レベルで、症状なのか根本原因なのかを特定

2. 3つの解決策を提案
   - 表面的な症状への対処
   - 中間的な原因への対処
   - 根本原因への対処

3. どれを実行すべきか推薦 + 理由

4. ドーシー 対症療法の検知
   - 同カテゴリ修正が2回続いたら「構造の問題では?」と自問
   - 3回続いたら設計を見直す

5. 反証モード Step 1-3
   - 自己反証: 仮説に対する反論3つ
   - 構造反証: ロジックの飛躍・抜け漏れ
   - 実用反証: 修正案の副作用シミュレーション

6. 変更前必須チェック（CLAUDE.md 反証連動）
   - 変数/定数削除なら全参照を grep で列挙
   - CSS 変更なら影響範囲を変更前に列挙

「最初に述べた問題の定義を額面通りに受け取らない」
本当の問題は説明されたものとは違うことが多い。

出力末尾に反証チェック結果。
```

---

## P24. AI 機能設計（アモデイ RSP + 社内 ASL）

```
あなたは ai-engineer エージェントです。
.claude/agents/service-dev/ai-engineer.md「必須ゲート」に従ってください。

[AI 機能の概要]: [何をする機能か]
[業務影響度]: [高 / 中 / 低]
[自律度]: [補助的 / 半自律 / 自律 / 高自律]

以下を設計:

1. 社内 ASL（AI Safety Level）判定
   - ASL-1: 補助的・人間が常時監督
   - ASL-2: 半自律・人間レビュー必須
   - ASL-3: 自律・監視 + 緊急停止可能
   - ASL-4: 高自律・特権アクセス（要承認）

2. Pre-deployment Safety Checklist（5項目）
   - プロンプトインジェクション耐性テスト
   - Tool use の権限境界（deny-list で物理ブロック / Layer 2 連動）
   - PII / 機密データの入出力監査ログ
   - 能力評価レポート（できること・できないこと）
   - ロールバック手順の事前定義

3. If-then Commitment 設計
   - if 誤用率 X% 超過 then 機能停止
   - if ハルシネーション率 Y% 超過 then RAG 強化
   - if 危険能力観測 then deploy 停止 + 安全策実装まで再開禁止
   - 抽象的な価値観でなく、具体的トリガー × 対応行動

4. 3軸強化（ASL レベル別）
   - evals（危険能力評価）
   - security（モデル盗用防御）
   - deployment（誤用防止）

5. プロンプト設計（prompt-engineering スキル参照）
   - System prompt / User prompt の分離
   - Tool use schema の定義
   - エラーハンドリング

成果物:
- ASL レベル + 根拠
- Pre-deployment Safety Checklist の Pass/Fail
- If-then Commitments のリスト
- ロールバック手順書

出力末尾に反証チェック結果。
```

---

## P25. インフラ最適化（ヴォーゲルス Frugal + ハイタワー Boring）

```
あなたは infra-devops エージェントです。
.claude/agents/service-dev/infra-devops.md「必須ゲート」に従ってください。

[現状]:
- インフラ構成: [AWS / GCP / Azure + 主要サービス]
- 月額コスト: [金額]
- 主要 KPI: [可用性 / レイテンシ / etc.]

以下のゲートを通す:

1. ハイタワー "Does it provide value?" テスト
   - 新インフラ / MCP / ツール導入前に自問
   - バンドワゴン排除（流行だから採用は禁止）

2. ハイタワー Day-2 First 設計
   - 構築コストより 3ヶ月後の運用コスト
   - 監視・更新・障害対応のシンプル化を ADR テンプレートに

3. ハイタワー Boring Technology
   - 革新ポイント 1-2個に絞り、残りは退屈な実績ある技術
   - 「実績 2年未満の技術」採用時はロールバック計画必須

4. ヴォーゲルス Frugal Architect 7 Laws チェック
   - Cost Tier（クリティカル度で階層化）
   - Observability（観測されない系はコストブラックホール）
   - Assumption Challenge（既存 stack を反射的に再利用しない）

5. クラウドコスト最適化
   - Reserved Instance / Savings Plan の活用余地
   - 不要リソースの削除
   - Auto Scaling 設計
   - Spot Instance 活用余地

6. セキュリティ Layer 0/1/2 連動
   - Gitleaks pre-commit hook（Layer 0）
   - settings.json deny ルール（Layer 2）
   - シークレット管理（AWS Secrets Manager / GCP Secret Manager）

成果物:
- 現状コスト分析（最大コスト要因 Top 5）
- 最適化ロードマップ（短期・中期・長期）
- 期待削減額（PL 試算 / 佐藤裕介流）

出力末尾に反証チェック結果。
```


## 出典・依拠先

- FACT: 本ファイルは @nbyk115/consulting-os の ConsultingOS 規律ファイルとして 2026-05-05 PR #65 で体系的明示物理化により定義された（ファイルパス: .claude/skills/prompt-templates/05-engineering.md）
- INFERENCE: 業界標準ベストプラクティス（佐藤裕介流の構造で売る原則、Boris Cherny 流の 9 規律 ruthlessly edit、該当部門の業界フレームワーク）から派生し実装
- SPECULATION: 4 週間ごとの再評価カレンダー（evolution-log.md 再評価カレンダーセクション）で形骸化検出、Boris #3 削除セット対象、規律違反発生時は統合 / 分離 / 削除で整理予定
