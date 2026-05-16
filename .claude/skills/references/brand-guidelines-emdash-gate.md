# em-dash / en-dash 物理化ゲート - brand-guidelines 分離 (2026-05-15 PR #199 物理化)

> 元 brand-guidelines.md §5.8 (PR AU 実装 2026-05-06) を 500 行制限遵守のため references/ 分離。

CLAUDE.md ハードルール 16 ⑥ の em-dash (U+2014) / en-dash (U+2013) 禁止規律をターン内で物理検出する hook を追加。

## 背景・違反学習 (2026-05-06 関根さん案件)

assistant 応答「User指摘は正鵠 - sales-deck-designer」の中に em-dash が混入。
stop-validator.sh は assistant 応答完了後の検証であり、ターン中の生成テキストには介入できない構造的空白があった。
PR AU で PostToolUse + Stop の両フックに emdash-detector.sh を物理化し、構造的に発生不可能化。

## 検出対象・除外対象

| 対象 | 処理 |
|---|---|
| assistant 応答テキスト全体 | Stop hook で検証 (transcript の最終 assistant message) |
| ファイル書き込みコンテンツ (Edit/Write/MultiEdit) | PostToolUse hook で検証 |
| .claude/skills/ / .claude/agents/ / docs/ / CLAUDE.md | 除外 (規律定義書は学習目的で em-dash 表記あり、正当使用) |
| evolution-log.md | 除外 (違反記録ファイル自体が em-dash を記録する場合あり) |

## 動作モード

```bash
# 環境変数で制御 (default: warn)
CONSULTINGOS_EMDASH_ENFORCEMENT=off    # 即時通過
CONSULTINGOS_EMDASH_ENFORCEMENT=warn   # stderr 警告のみ (default)
CONSULTINGOS_EMDASH_ENFORCEMENT=block  # exit 2 でブロック
```

## 検証コマンド (手動実行)

```bash
# em-dash 検出テスト (ヒットすれば検出OK)
printf '{"content": "test em-dash here"}' | .claude/hooks/emdash-detector.sh 2>&1

# 規律定義書内は通過することを確認
printf '{"file_path": ".claude/skills/brand-guidelines.md", "content": "test em-dash"}'   | .claude/hooks/emdash-detector.sh 2>&1 && echo "PASS (excluded)" || echo "FAIL"

# リポジトリ全体の em-dash 残存チェック (外部出力ファイルのみ)
grep -rn $'\xe2\x80\x94' /home/user/consulting-os/strategy/ /home/user/consulting-os/examples/ 2>/dev/null | head -10 || echo "0件: クリア"
```

## hook ファイルパス

- `.claude/hooks/emdash-detector.sh` (PostToolUse + Stop から呼び出し)
- `settings.json` の PostToolUse `Edit|Write|MultiEdit` マッチャーと Stop 両方に登録済み

## 代替表現リファレンス

| NG | OK |
|---|---|
| `This is important &#x2014; it affects revenue` | `This is important: it affects revenue` |
| `Result &#x2014; 30% improvement` | `Result: 30% improvement` |
| `Phase 1 &#x2013; Discovery` | `Phase 1: Discovery` |
| `User指摘は正鵠 &#x2014; sales-deck-designer` | `User指摘は正鵠 - sales-deck-designer` |
