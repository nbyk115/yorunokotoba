#!/bin/bash
# Stop hook: ConsultingOS bootstrap 状態の事後検証（2026-05-07 PR AY 物理化）
# 関根さん案件 v1-v13 narrative-only 稼働事象学習: session 終了時に CLAUDE.md / .claude/agents
# 不在を検出したら evolution-log に違反記録を自動追記する

set -e
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CLAUDE_MD="$REPO_ROOT/CLAUDE.md"
EVO="$REPO_ROOT/evolution-log.md"

MISSING=()
[ ! -f "$CLAUDE_MD" ] && MISSING+=("CLAUDE.md")
[ ! -d "$REPO_ROOT/.claude/agents" ] && MISSING+=(".claude/agents/")
[ ! -d "$REPO_ROOT/.claude/hooks" ] && MISSING+=(".claude/hooks/")
[ ! -d "$REPO_ROOT/.claude/skills" ] && MISSING+=(".claude/skills/")

if [ ${#MISSING[@]} -eq 0 ]; then
  exit 0
fi

CURRENT_BRANCH=$(cd "$REPO_ROOT" 2>/dev/null && git branch --show-current 2>/dev/null || echo "(unknown)")
TODAY=$(date +%Y-%m-%d)

>&2 cat <<EOF
ConsultingOS UNLOADED detected at session end
- branch: $CURRENT_BRANCH
- missing: ${MISSING[*]}
- session は規律違反の可能性が極めて高い narrative-only 稼働だった
EOF

if [ -f "$EVO" ]; then
  cat >> "$EVO" <<EVENT

## $TODAY ConsultingOS UNLOADED detected (Stop hook)
- branch: $CURRENT_BRANCH
- 不在ファイル: ${MISSING[*]}
- 検出方法: Stop hook で CLAUDE.md / .claude/agents / .claude/hooks / .claude/skills 不在確認
- 対策候補: CONSULTINGOS_BOOTSTRAP_CHECK=block で次回 SessionStart block / git merge origin/main で物理修復 / bin/new-feature-branch.sh で正規 branch 作成

EVENT
fi

exit 0
