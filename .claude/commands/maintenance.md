# /maintenance — 月次メンテナンス実行

ConsultingOS の月次健全性チェックを一括実行する。
claude-health（6層診断）+ security-scan（102ルール監査）をまとめて実行。

---

## 実行タイミング

- **月次**: 毎月27日前後（前回実行日を `.claude/memory/core_memory.md` で確認）
- **変更時**: 新スキル・新エージェント追加後
- **トラブル時**: 挙動がおかしいと感じたとき

---

## 実行フロー

### Step 1: 前回実行日の確認

`.claude/memory/core_memory.md` の「継続タスク」セクションで前回実行日を確認する。

### Step 2: claude-health 実行（6層診断）

`.claude/skills/claude-health.md` に従い、以下の6層を順番に診断する:

```
Layer 1: CLAUDE.md — ルーティング・反証モード・ブランドルールの完全性
Layer 2: rules — settings.json の permissions / soft_deny の有効性
Layer 3: skills — 全36スキルのシンボリックリンク・§番号・エージェント配線
Layer 4: hooks — SessionStart / PostToolUse / PreToolUse / Stop の動作確認
Layer 5: subagents — 全34エージェントの参照スキル・ハンドオフ接続
Layer 6: verifiers — 反証チェック・品質ゲート・差し戻し基準の実効性
```

診断結果を以下のフォーマットで出力:

```
【claude-health 診断結果】YYYY-MM-DD
Layer 1 CLAUDE.md:     ✅ / ⚠️  / 🔴  [所見]
Layer 2 rules:         ✅ / ⚠️  / 🔴  [所見]
Layer 3 skills:        ✅ / ⚠️  / 🔴  [所見]
Layer 4 hooks:         ✅ / ⚠️  / 🔴  [所見]
Layer 5 subagents:     ✅ / ⚠️  / 🔴  [所見]
Layer 6 verifiers:     ✅ / ⚠️  / 🔴  [所見]

総合スコア: [X/6 層が正常]
要対応: [修正が必要な項目リスト]
```

### Step 3: security-scan 実行（AgentShield 102ルール）

`.claude/skills/security-scan.md` に従い、以下の5カテゴリを監査する:

```
Cat A: CLAUDE.md / エージェントファイルのプロンプトインジェクションリスク
Cat B: settings.json の権限設定・soft_deny の抜け漏れ
Cat C: スキルファイルの外部URL・未検証コマンドの混入
Cat D: ハンドオフファイルの機密情報漏洩リスク
Cat E: Hooks コマンドのコマンドインジェクション脆弱性
```

診断結果:

```
【security-scan 結果】YYYY-MM-DD
Cat A (Prompt Injection): [A/B/C/D/E/F] [所見]
Cat B (Permissions):      [A/B/C/D/E/F] [所見]
Cat C (Skill Files):      [A/B/C/D/E/F] [所見]
Cat D (Handoffs):         [A/B/C/D/E/F] [所見]
Cat E (Hooks):            [A/B/C/D/E/F] [所見]

総合グレード: [A-F]
要対応: [修正が必要な項目リスト]
```

### Step 4: 結果をメモリに記録

`.claude/memory/core_memory.md` の「継続タスク」セクションを更新:

```markdown
- [ ] 月次 claude-health 実行（次回: YYYY-MM-DD）
- [ ] 月次 security-scan 実行（次回: YYYY-MM-DD）
```

次回実行日 = 今日から30日後。

### Step 5: 問題があれば即修正

- 🔴（重大）: その場で修正してからセッションを続ける
- ⚠️ （警告）: 今週中に修正するタスクとして記録
- ✅（正常）: 記録のみ、対応不要

---

## 所要時間目安

- claude-health のみ: 5-10分
- security-scan のみ: 10-15分
- 両方（/maintenance 標準）: 15-25分
- 問題あり修正込み: +15-30分

---

## 使用例

```
/maintenance
→ 両方を順番に実行（推奨）

/maintenance health-only
→ claude-health のみ実行

/maintenance security-only
→ security-scan のみ実行
```
