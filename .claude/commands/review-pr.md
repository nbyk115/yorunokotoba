---
name: review-pr
description: PRの自動コードレビュー（5軸評価）。「PRレビューして」「コードチェックして」「マージしていいか確認して」「差分レビュー」と言われたとき。正確性・セキュリティ・パフォーマンス・可読性・テストを評価してApprove/Request Changes/Commentを判定。具体的な修正コードを提示する。
argument-hint: [PR番号 or ブランチ名]
effort: high
context: fork
agent: Explore
---

ultrathink

## PR差分（自動取得）
!`gh pr diff $ARGUMENTS 2>/dev/null | head -600 || git diff HEAD~1 2>/dev/null | head -600`

## PR概要（自動取得）
!`gh pr view $ARGUMENTS --json title,body,additions,deletions,changedFiles 2>/dev/null || git log --oneline -5 2>/dev/null`

# /review-pr — PR自動レビュー

引数: $ARGUMENTS（PR番号 or ブランチ名）

## レビュー手順

### 1. 変更内容の取得
- `gh pr diff $ARGUMENTS` で差分を取得
- `gh pr view $ARGUMENTS` でPR概要を確認

### 2. レビュー観点（5軸）

| 観点 | チェック内容 |
|---|---|
| **正確性** | ロジックバグ、エッジケースの漏れ、型の不整合 |
| **セキュリティ** | OWASP Top 10、入力バリデーション、認証・認可 |
| **パフォーマンス** | N+1クエリ、不要な再レンダリング、メモリリーク |
| **可読性** | 命名、関数の長さ、責務の分離 |
| **テスト** | テストの有無、カバレッジ、エッジケースのテスト |

### 3. 出力フォーマット

**総合評価**: ✅ Approve / ⚠️ Request Changes / 🔍 Comment

**指摘事項**:
| 重要度 | ファイル:行 | 指摘 | 提案 |
|---|---|---|---|

**良い点**（あれば）:
- ...

## ルール
- 軽微なスタイルの指摘は最小限にする（フォーマッタに任せる）
- セキュリティ・正確性の問題は必ず指摘する
- 具体的な修正コードを示す
