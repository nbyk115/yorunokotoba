# ConsultingOS — ポータブル配布版

34 エージェント + 22 スキル + 10 コマンド + 反証モード + 多層防御セキュリティ

## 新規プロジェクトへの導入 (1分)

新しいリポジトリの Claude Code セッションで以下を実行:

```bash
# 1. 一時ディレクトリに ConsultingOS を取得
git clone https://github.com/nbyk115/yorunokotoba.git /tmp/ynk

# 2. OS ファイルを新プロジェクトにコピー
cp /tmp/ynk/CLAUDE.md ./CLAUDE.md
cp -r /tmp/ynk/.claude ./.claude

# 3. プロジェクト固有ファイル削除 (不要)
rm -rf ./.claude/memory
rm -f ./.claude/codemap.md
rm -f ./.claude/settings.local.json

# 4. Claude Code を再起動
```

## 含まれるもの

- `CLAUDE.md` (司令塔、ルーティングロジック、反証モード、多層防御)
- `.claude/agents/` (34 エージェント: Consulting/Service Dev/Product/Creative/Global/Marketing)
- `.claude/skills/` (22 スキル: 反証/デバッグ/API/セキュリティ等)
- `.claude/commands/` (10 スラッシュコマンド: /tdd, /evolve, /check-hallucination 等)
- `.claude/hooks/` (UserPromptSubmit で毎ターンルール注入)
- `.claude/settings.json` (hooks + permissions.deny パターン)

## プロジェクト固有カスタマイズ

CLAUDE.md 末尾に追加:

```markdown
# currentDate
Today's date is YYYY-MM-DD.

# Project-specific
- プロジェクト名: ...
- ICP/ターゲット: ...
- 技術スタック: ...
```

## 更新方法

`yorunokotoba` リポジトリが ConsultingOS の正本。新機能追加後:

```bash
cd /path/to/your-project
rm -rf ./.claude/agents ./.claude/skills ./.claude/commands
cp -r /tmp/ynk/.claude/agents ./.claude/
cp -r /tmp/ynk/.claude/skills ./.claude/
cp -r /tmp/ynk/.claude/commands ./.claude/
cp /tmp/ynk/CLAUDE.md ./CLAUDE.md
```
