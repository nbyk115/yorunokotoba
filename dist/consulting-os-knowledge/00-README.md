# ConsultingOS Knowledge Pack — 反証モード・ハルシネーション検証

**Version**: 1.0.0
**Date**: 2026-04-12
**Target**: claude.ai Project "ConsultingOS" (Dentsu Digital業務)

---

## なぜこのパックが必要か

今日の GA4 事例でハルシネーションが発生した。
調査の結果、ConsultingOS の Claude.ai Project 側には **反証モード / ハルシネーション検証** の強制ルールがインストールされていなかったことが判明。

一方、Claude Code 側（よるのことば リポジトリ）には既に:
- `CLAUDE.md` §🔺 反証モード
- `.claude/skills/falsification-check.md`
- `.claude/commands/check-hallucination.md`

が存在する。しかし **`.claude/` ディレクトリ構造は Claude Code 固有**で、claude.ai Project では参照されない。

→ このパックを claude.ai Project の **Knowledge (ナレッジ)** にアップロードすることで、ConsultingOS の全チャットで反証ルールが有効になる。

---

## 収録ファイル（3 点）

| ファイル | 用途 |
|---|---|
| `00-README.md` | 本ファイル。アップロード手順と構造説明 |
| `01-falsification-mode.md` | 反証モード本体（3 段階チェック + 出力フォーマット） |
| `02-hallucination-check-procedure.md` | ハルシネーション検証手順（クレーム抽出 → 3 ラベル分類） |

※ Claude Code 用の `.claude/commands/check-hallucination.md` はスラッシュコマンド専用のため claude.ai では動作しない。代わりに `02-` の手順ドキュメントを Knowledge に入れることで、Claude がプロンプト文脈として参照する。

---

## アップロード手順（claude.ai Project）

1. **claude.ai** にログイン
2. 対象 Project（例: **ConsultingOS**）を開く
3. 右上「**Project knowledge**」or「**Add knowledge**」をクリック
4. 本パック内の 3 ファイルをアップロード
   - `00-README.md`
   - `01-falsification-mode.md`
   - `02-hallucination-check-procedure.md`
5. Project の **System Prompt (Custom Instructions)** に以下を追記:
   ```
   あらゆる出力の前に、Knowledge 内の `01-falsification-mode.md` と
   `02-hallucination-check-procedure.md` を必ず参照し、3 段階の反証と
   ハルシネーション検証を実行すること。数値・固有名詞・引用を含む出力には
   必ず【反証チェック結果】を付与すること。
   ```
6. 保存 → 新規チャットを開始して動作確認

### 動作確認方法

新規チャットで次のプロンプトを投げる:
```
GA4 の Signed IDs 機能の制限を教えて。
```

期待される応答:
- 具体的な制限事項
- **末尾に「【反証チェック結果】」セクションが付与される**
- 数値や固有名詞に ✅/⚠️/❌ ラベルが付く
- ⚠️ や ❌ の項目は検証 or 削除の注記

---

## Custom Instructions への追記テンプレート（コピペ用）

```
# 反証モード必須ルール

事実主張・数値・固有名詞・引用を含む出力の前に、Project Knowledge 内の
`01-falsification-mode.md` と `02-hallucination-check-procedure.md` を必ず
参照し、以下を実行すること:

1. 自己反証（Step 1）: 自分の結論への反論 3 つを列挙
2. 構造反証（Step 2）: ロジック飛躍・数値・抜け漏れを確認
3. 実用反証（Step 3）: 実行可能性・エッジケースを確認
4. ハルシネーション検証: クレーム抽出 → ✅検証済/⚠️グレー/❌要削除 分類
5. 出力末尾に【反証チェック結果】セクションを付与

## 適用免除ケース（以下は反証チェック不要）

- 雑談・感情的サポート・励まし・共感・日常会話
- Slack カジュアル返信の草案（絵文字込みライト返信・社内チャット調）
- 純粋なコード生成（事実主張を含まないコード・リファクタ・フォーマット）
- ユーザーが「スピード優先」「急ぎで」「サッと」「軽く」と明示した場合
- ユーザーへの質問返し（確認・意図把握の問い返し）
- 短い応答 (1-2 文) で事実主張なし（「了解しました」等）

## 必ず実行する（免除されない）

- 数値・割合・金額を含む応答
- 固有名詞（サービス名・企業名・人名・製品名・機能名・API 名）を含む応答
- コンサル納品物（提案書・戦略分析・PRD・競合調査レポート）
- 価格試算・PL シミュレーション
- 法務・コンプライアンス関連の判断
- 技術仕様書・設計書・アーキテクチャ提案
- 引用・出典を主張する応答

判断に迷ったら「実行する側」を選ぶ。付けすぎの害 < 付け忘れの害。

違反時の出力は「ドラフト扱い」として扱い、最終出力には昇格させない。
```

---

## Claude Code 側との差分

| 項目 | Claude Code（よるのことば） | Claude.ai Project（ConsultingOS） |
|---|---|---|
| 反証ルール配置 | `CLAUDE.md` §🔺 反証モード | Project System Prompt + Knowledge |
| 検証 skill | `.claude/skills/falsification-check.md` | `01-falsification-mode.md`（本パック） |
| 実行コマンド | `/check-hallucination` slash command | （手動 / System Prompt 経由） |
| 自動実行 | ❌（ユーザー明示） | ✅（System Prompt で強制） |

**Trade-off**:
- Claude.ai Project は slash command 非対応なので System Prompt での強制が唯一の手段
- 一方 System Prompt に入れれば**毎ターン自動適用**されるため、結果的に強い

---

## 更新履歴

| Ver | 日付 | 変更 |
|---|---|---|
| 1.0.0 | 2026-04-12 | 初版。GA4 ハルシネーション事例を契機に作成 |
