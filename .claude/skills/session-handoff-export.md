---
description: セッション内容を後続 AI / 別セッションへ引き継ぐためのコンテキスト一式エクスポート skill。「引き継ぎ」「handoff」「export」キーワードで起動。事実ベース 16 セクション構造、作業指示なし、ConsultingOS workflow.json (PR #149) と相補。
---

# session-handoff-export: セッション引き継ぎ標準エクスポート

## 用途

セッション内容を **事実ベース** で 16 セクション構造に整理、後続 AI エージェント / 別セッション / 別 AI へ引き継ぐ。

## 起動条件

ユーザーが以下を発言した時:
- 「引き継ぎ」「ハンドオフ」「handoff」「export」
- 「context エクスポート」「セッション保存」
- 「別 AI に渡したい」

## 出力構造（16 セクション）

`context.md` を以下の構成で出力。ConsultingOS 環境では ZIP 作成不可のため、`docs/handoff-YYYYMMDD-HHMM-session-export.md` として保存 + 添付ファイルパス列挙で代替。

### 1. Export Metadata
- Exported at / Timezone / Source session / Exporting agent / Conversation language / User preferences / Scope of export

### 2. Executive Context Summary
- セッション主題 / ユーザー初期要求 / 途中の重要情報 / 現状到達点 / 確定事項 / 未確定事項
- 作業指示は書かない

### 3. User Intent and Requirements
- 3.1 Primary Intent
- 3.2 Explicit Requirements
- 3.3 Preferences and Style Constraints
- 3.4 Negative Requirements

### 4. Conversation Timeline
- Step N: 見出し
- User request / Assistant response or action / Information established / Files referenced / Resulting state

### 5. Established Facts
- 5.1 Facts provided by the user
- 5.2 Facts found from referenced sources
- 5.3 Facts inferred during the session（推定明示）
- 5.4 Facts that remain uncertain

### 6. Sources and References
- Source title / type / URL or identifier / Accessed at / Used for / Key information / Reliability / Local attachment path

### 7. Files, Images, and Attachments
- Original name / File type / Role / Local path / Source / Was analyzed / Was modified or generated / Notes

### 8. Generated or Modified Outputs
- Output name / type / Created or modified / Purpose / Local path / Summary / Dependencies

### 9. Decisions, Judgments, and Rationale
- Decision / Context / Options considered / Rationale / Evidence / Confidence (High/Medium/Low) / Caveats

### 10. Current State
- 完了済 / 判明済 / 未判明 / 保留論点 / 中断作業

### 11. Constraints and Assumptions
- 使用ツール / 参照可否 / 時間・日付・地域前提 / 形式指定 / 鮮度前提 / 推定箇所

### 12. Important Excerpts
- Speaker or source / Excerpt or summary / Why it matters

### 13. Reproducibility Notes
- コード / コマンド / 設定 / 入出力 / 環境 / 依存関係 / 再現不可部分

### 14. Citation Map
- Claim or context item | Source or evidence | Notes

### 15. Attachment Manifest
- Path in ZIP | Original name | Type | Description | Source

### 16. Integrity and Limitations
- 取得不可情報 / 添付不可ファイル / 未確認最新情報 / 推定箇所 / セッション外依存 / 非公開除外

## 最重要方針（出力時遵守）

YOU MUST:
- 後続 AI への作業指示 / 依頼文 / 命令文 / ToDo は書かない
- ユーザーが次に何をすべきかは書かない
- 事実・経緯・参照・確定・未確定・制約・判断材料のみ
- セッション内で明示されていない感情・意図・評価を補わない
- 内部の非公開思考過程 / 逐語的推論ログは含めない
- 結論に至る検討論点・採用 / 不採用案・判断根拠は要約形式で記載
- システムメッセージ / 開発者メッセージ / 非公開ツール仕様は記載しない
- ユーザー明示の希望・条件・制約・表現好みは必要範囲で記載
- API キー / パスワード / 認証 token / 秘密鍵 / PII は伏字

## ConsultingOS 環境での特殊適応

### ZIP 作成不可への対応

ConsultingOS は Claude Code セッション環境のため ZIP 直接作成不可。代替策:

1. `docs/handoff-YYYYMMDD-HHMM-session-export.md` として `context.md` を保存
2. `attachments/` フォルダパスは記述、実ファイルは既存 ConsultingOS リポ内 path を引用
3. PR 経由でユーザーが手動 ZIP 化（GitHub UI から ZIP ダウンロード）

### ConsultingOS 既存資産との連携

- `workflow.json` (PR #149): system 構造 bootstrap data、本 skill 16 セクションと相補（システム全体 + セッション内容の二層）
- `evolution-log.md`: 規律違反 / 学習エントリ = 本 skill §9 Decisions / §12 Excerpts のソース
- 既存 handoff doc (関根さん `docs/handoff-n-y-craft-meeting-2026-05-09.md` / 水野さん `docs/handoff-mizuno-funding-v4.md`): 案件特化 handoff、本 skill は汎用セッション handoff

## 起動例

```
ユーザー: 「引き継ぎ」
assistant: session-handoff-export skill 起動、現セッションを 16 セクション構造で docs/handoff-YYYYMMDD-HHMM-session-export.md に保存
```

```
ユーザー: 「別 AI に渡したいから export」
assistant: 同上、ただし保存先パスをユーザーに確認
```

## 関連参照

- ユーザー提示プロンプト (2026-05-14、X.com 経由 INFERENCE)
- workflow.json (PR #149): HTML + JSON 二層可視化、bootstrap data
- 既存 handoff docs (関根さん / 水野さん)
- ハードルール 1 真の 100 原則: 事実 vs 推定の明確区別
- ハードルール 17 主語詐称禁止: assistant 主語の明示

## 反証チェック（Step 1-4 圧縮）

- Step 1: 16 セクション構造はユーザー提示プロンプト経由 FACT / ConsultingOS 環境への ZIP 不可適応は assistant 構築 INFERENCE
- Step 2: 既存 workflow.json + handoff docs と相補、Hard Rule 13 形骸化防止のため新規 skill として独立価値あり (汎用セッション export 機能、案件特化 handoff とは別軸)
- Step 3 実用反証: 本 skill は次セッションで「引き継ぎ」発話時に起動、実機検証は次回 export 時に実施
- Step 4 リスク即潰し: 「形骸化」リスクは起動条件明示 + ConsultingOS 既存資産との相補性明示で構造的回避、4 週間後に再評価候補（evolution-log カレンダー登録は別 PR）
