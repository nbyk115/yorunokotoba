---
description: セッション引き継ぎ用 16 セクション context.md エクスポート
---

# /handoff: セッション引き継ぎエクスポート

セッション内容を後続 AI / 別セッション用に 16 セクション構造で `docs/handoff-YYYYMMDD-HHMM-session-export.md` として出力。

## Usage

```
/handoff
```

または:

```
引き継ぎ
```

```
別 AI に渡したいから export
```

## 動作

1. `session-handoff-export` skill 起動
2. 現セッションを 16 セクション構造で整理
3. `docs/handoff-YYYYMMDD-HHMM-session-export.md` として保存
4. 添付ファイルパスは ConsultingOS リポ内 path で記述
5. PR 起票推奨（ユーザー判断）

## 詳細

`.claude/skills/session-handoff-export.md` 参照。

## 既存 handoff との関係

- 案件特化 handoff (`docs/handoff-n-y-craft-meeting-2026-05-09.md` 等): 特定案件向け詳細
- 本コマンド: 汎用セッション export、別 AI 渡し用標準フォーマット
- `workflow.json` (PR #149): system 構造 bootstrap data、本 export と相補

## 最重要方針

- 作業指示 / 依頼文 / ToDo は書かない
- 事実・経緯・参照・確定・未確定・制約・判断材料のみ
- 推定箇所は明示
- 機密情報（API キー / token / PII）は伏字
