# Advisor Strategy 詳細: Opus アドバイザー × Sonnet/Haiku 実行

> **Opus をアドバイザー、Sonnet/Haiku を実行役にペアリングし、Opus 同等の知能を低コストで実現する。**

---

## モデルペアリング設計

| 役割 | モデル | 呼び出し | 用途 |
|---|---|---|---|
| Executor（実行役） | Sonnet 4.6 | 毎ターン | ファイル操作・コード生成・定型タスク |
| Advisor（戦略役） | Opus 4.6+ | オンデマンド | 戦略判断・設計レビュー・品質ゲート |

---

## ConsultingOS への適用

| 部門 | Executor（Sonnet） | Advisor（Opus）呼び出し条件 |
|---|---|---|
| Consulting | 情報収集・データ整理・フォーマット | 戦略判断・PL 試算・Go/No-Go 判定 |
| Service Dev | コード実装・テスト・バグ修正 | アーキテクチャ設計・セキュリティレビュー |
| Product | バックログ整理・VOC 分類 | PMF 判定・ロードマップ優先順位 |
| Creative | コンテンツ生成・デザイン実装・Claude Design 生成 | ブランド戦略・クリエイティブ方針 |
| Global | 翻訳・データ収集 | GTM 戦略・市場参入判断 |
| Marketing | レポート生成・データ集計 | チャネルミックス・予算配分判断 |

---

## 設定方法

エージェントファイルの `model` フロントマターで指定:

```yaml
---
name: strategy-lead
model: opus    # 戦略判断は Opus
---
```

```yaml
---
name: fullstack-dev
model: sonnet  # 実装は Sonnet
---
```

サブエージェント起動時の `model` パラメータでも指定可能。

---

## /advisor（公式 Advisor Strategy）★推奨

> **Opus がセカンドオピニオンとしてメインエージェントの作業をレビューする公式機能。**

```bash
/advisor opus    # Opus をアドバイザーに設定（推奨）
/advisor sonnet  # Sonnet をアドバイザーに
/advisor off     # アドバイザー無効化
```

- **発火タイミング**: 作業開始前・タスク完了時・エラー解決不能時に自動レビュー
- **ConsultingOS との関係**: エージェントファイルの `model: opus/sonnet` は「どのモデルで動くか」の設定。`/advisor` はそれに加えて「Opus が上位からレビューする」機能。**併用する**
- **推奨**: `/advisor opus` を常時 ON。Sonnet で実行 → Opus がレビュー → 品質ガードが1層追加される

---

## 必須環境変数

```bash
export MAX_THINKING_TOKENS=31999
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

- `MAX_THINKING_TOKENS`: 思考予算の上限引き上げ（デフォルト medium → high 相当）
- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`: 複数 Claude インスタンスの並列協調作業を有効化

---

## 思考予算（最も体感が変わる設定）

```json
{
  "extendedThinking": true,
  "effortLevel": "high"
}
```

- デフォルトが medium に変更されている。high 常時 ON にすると修正のやり直しが減り、結果的にトークン節約
- 環境変数 `MAX_THINKING_TOKENS=31999` で上限を引き上げ


## 出典・依拠先

- FACT: 本ファイルは @nbyk115/consulting-os の ConsultingOS 規律ファイルとして 2026-05-05 PR #65 で体系的明示物理化により定義された（ファイルパス: .claude/skills/claude-code-ops/references/advisor-strategy.md）
- INFERENCE: 業界標準ベストプラクティス（佐藤裕介流の構造で売る原則、Boris Cherny 流の 9 規律 ruthlessly edit、該当部門の業界フレームワーク）から派生し実装
- SPECULATION: 4 週間ごとの再評価カレンダー（evolution-log.md 再評価カレンダーセクション）で形骸化検出、Boris #3 削除セット対象、規律違反発生時は統合 / 分離 / 削除で整理予定
