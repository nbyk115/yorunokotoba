# Boris Cherny 流 9 規律: 全エージェント徹底

> **Anthropic 内 Claude Code 開発リードの Boris Cherny が提唱する運用規律。ConsultingOS 全 34 エージェントに適用。**

---

## 1. Plan Mode を大規模変更で必須

以下のいずれかに該当する場合、`Shift+Tab` → `Shift+Tab` で **Plan Mode** に入ってから実行する:
- 3 ファイル以上に変更が及ぶ
- アーキテクチャ判断を含む（DB スキーマ、認証、状態管理層）
- 本番影響がある（マイグレーション、外部 API、決済）

### 操作
```
Shift+Tab → Tab        : Auto Accept モード
Shift+Tab → Shift+Tab  : Plan Mode（計画のみ、実行しない）
```

---

## 2. 自己検証を変更直後に実行

実装後、Claude が responsive を返す前に typecheck/test/lint を実行する。**反証モード Step 1-3 と統合**。

```bash
# 例: Next.js プロジェクト
npm run typecheck && npm run lint && npm test
```

- Boris の哲学: 「証明できる検証を全部やってから complete マークしろ」
- ConsultingOS 統合: 反証モード Step 3（実用反証）と一体化

---

## 3. CLAUDE.md "ruthlessly edit"

> **形骸化したルールは追加でなく削除する。**

- **月 1 回レビュー**: `strategy-lead` が CLAUDE.md を読み返し、機能していないルールを削除
- **追加より削除を優先**: 「○○の場合は△△」という条件付き追加はノイズ化しやすい
- **削除判断**: 過去 30 日で 1 回も適用されていない条文 = 削除候補
- ConsultingOS 適合: 進化ログ運用ルール（形骸化防止）と一体化

---

## 4. 権限 allow/deny/ask の明示

`settings.json` の `permissions` セクションを明示する。**承認疲れ減 × 危険操作の物理ブロック**。

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(git status)",
      "Bash(git diff *)",
      "Read(**)"
    ],
    "deny": [
      "Bash(rm -rf /*)",
      "Bash(chmod 777 *)",
      "Bash(git push --force *)",
      "Bash(git reset --hard *)",
      "Read(.env*)",
      "Read(*credentials*)"
    ],
    "ask": [
      "Bash(curl -X POST *)",
      "Bash(git push *)"
    ]
  }
}
```

### 効果
- 安全操作は無確認で進む（生産性 ↑）
- 危険操作は物理ブロック（事故 0）
- 中間操作のみ確認ダイアログ（注意リソース節約）

---

## 5. サブエージェント context separation

> **サブエージェントは独立コンテキストで動かし、メインを汚染させない。**

- ツール権限を絞る（コンサル系 = Read+WebSearch+WebFetch のみ等）
- 結果を要約して返す設計（生ログを返さない）
- 部門別ツール権限の標準は `CLAUDE.md` 「サブエージェント運用」参照

### ツール権限の標準
| 部門 | 標準ツール権限 |
|---|---|
| Consulting | Read+WebSearch+WebFetch |
| Service Dev | 全ツール |
| Creative | Read+Edit+Write+WebFetch |
| Product | Read+Grep+WebSearch |
| Global | Read+Glob+Grep+WebSearch+WebFetch |

---

## 6. /compact + /btw でコンテキスト攻撃的管理

- **`/compact`**: セッションが長くなったら手動圧縮（毎日 1 回以上）
- **`/btw`**: 重要決定をその場でメモ化。「by the way これ重要」と言うだけで Claude が記憶
- **`/codemap`**: コードマップを `.claude/codemap.md` に出力しておけば、巨大コードベースでも効率ナビ

### 攻撃的管理の指針
- セッション 4 時間 / 100 ターン超え → `/compact` 強制
- 重要意思決定は **その場で `/btw`**、後で書こうとすると忘れる
- 大規模リファクタ前に `/codemap` で全体構造をスナップショット

---

## 7. Demand Elegance（エレガンス要求）

> **非自明な変更で「もっとエレガントな方法は？」と自問する。**

- 「動けばいい」で止めず、保守性 / 可読性 / 拡張性で再考
- ConsultingOS 適合: 反証モード Step 2（構造反証）と統合
- 具体プロンプト例:
  ```
  これを本番運用レベルに引き上げて。
  より具体的に、より断定的に、トレードオフを明示して。
  ```

### Boris の主張
「エレガンスは贅沢ではない。3 ヶ月後の自分を救う唯一の手段だ。」

---

## 8. Verification Before Done

> **証明なしで complete マークしない。**

- 反証モード Step 3（実用反証）と統合
- チェックリスト:
  - [ ] 変更が動くことを実行で確認
  - [ ] テストが通る（変更したテストではなく既存テスト）
  - [ ] エッジケース（空入力 / null / 大量データ）を 1 つ以上テスト
  - [ ] 受け手が再現できる手順を残した

### "Done" の定義
- 「動くはず」 → NG
- 「動いているのを 1 回見た」 → OK
- 「動いているのをエッジケース込みで証明した」 → 完璧

---

## 9. Autonomous Bug Fixing

> **バグ報告 = 修正開始。ログ → 根本原因 → 修正を一気通貫。**

### フロー
```
1. バグ報告受領
2. ログ取得（Monitor / docker logs / browser console）
3. 仮説 3 つ立てる（反証モード Step 1）
4. 最も確度高い仮説を検証
5. 根本原因特定
6. 修正実装
7. 再現テスト追加
8. ユーザーに「修正完了 + 再発防止策」を報告
```

### Boris の哲学
- 「ユーザーに『どこのファイルですか？』と聞いた時点で負け」
- 自分でログを取り、自分で再現し、自分で直す
- ConsultingOS 適合: `debug-methodology` スキル + Agent Teams パターン A（デバッグチーム）と統合

---

## 統合まとめ

| Boris 規律 | ConsultingOS の統合先 |
|---|---|
| 1. Plan Mode | 大規模変更時の標準フロー |
| 2. 自己検証 | 反証モード Step 1-3 |
| 3. ruthlessly edit | 進化ログ運用ルール |
| 4. permissions 明示 | セキュリティ多層防御 Layer 2 |
| 5. context separation | サブエージェント運用 |
| 6. /compact + /btw | コンテキスト管理（references/context-management.md） |
| 7. Demand Elegance | 反証モード Step 2 + Iterative Refinement Prompt |
| 8. Verification Before Done | 反証モード Step 3 |
| 9. Autonomous Bug Fixing | debug-methodology + Agent Teams パターン A |


## 出典・依拠先

- FACT: 本ファイルは @nbyk115/consulting-os の ConsultingOS 規律ファイルとして 2026-05-05 PR #65 で体系的明示物理化により定義された（ファイルパス: .claude/skills/claude-code-ops/references/boris-cherny-9-rules.md）
- INFERENCE: 業界標準ベストプラクティス（佐藤裕介流の構造で売る原則、Boris Cherny 流の 9 規律 ruthlessly edit、該当部門の業界フレームワーク）から派生し実装
- SPECULATION: 4 週間ごとの再評価カレンダー（evolution-log.md 再評価カレンダーセクション）で形骸化検出、Boris #3 削除セット対象、規律違反発生時は統合 / 分離 / 削除で整理予定
