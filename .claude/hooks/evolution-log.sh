#!/bin/bash
# evolution-log 自動エントリ Hook
# PostToolUse で .claude/agents/ や .claude/skills/ の変更を検知
# 自動で evolution-log.md と evolution-log.jsonl にエントリ追加

set -e

# 入力パース
TOOL_INPUT=$(cat)
TOOL_NAME=$(echo "$TOOL_INPUT" | jq -r '.tool_name // empty' 2>/dev/null)
FILE_PATH=$(echo "$TOOL_INPUT" | jq -r '.tool_input.file_path // .tool_input.filePath // empty' 2>/dev/null)

# Edit/Write/MultiEdit のみ対象
case "$TOOL_NAME" in
  Edit|Write|MultiEdit) ;;
  *) exit 0 ;;
esac

# .claude/agents/ or .claude/skills/ の変更のみ対象
if ! echo "$FILE_PATH" | grep -qE '\.claude/(agents|skills)/'; then
  exit 0
fi

# evolution-log の更新自体は無限ループ防止のためスキップ
if echo "$FILE_PATH" | grep -qE 'evolution-log'; then
  exit 0
fi

# プロジェクトルート検出
ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo "$(pwd)")
LOG_MD="$ROOT/.claude/memory/evolution-log.md"
LOG_JSONL="$ROOT/.claude/memory/evolution-log.jsonl"

# ファイル種別検出
if echo "$FILE_PATH" | grep -qE '\.claude/agents/'; then
  CATEGORY="agent"
elif echo "$FILE_PATH" | grep -qE '\.claude/skills/'; then
  CATEGORY="skill"
else
  CATEGORY="other"
fi

# 相対パス
REL_PATH=$(echo "$FILE_PATH" | sed "s|$ROOT/||")

# 日時
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
DATE=$(date +"%Y-%m-%d")

# JSONL エントリ（機械可読）
JSON_ENTRY=$(jq -n \
  --arg ts "$TIMESTAMP" \
  --arg cat "$CATEGORY" \
  --arg path "$REL_PATH" \
  --arg tool "$TOOL_NAME" \
  '{timestamp: $ts, category: $cat, path: $path, tool: $tool, action: "modified"}')

mkdir -p "$ROOT/.claude/memory"
echo "$JSON_ENTRY" >> "$LOG_JSONL"

# Markdown エントリ（人間可読、日付セクションに追記）
if [ ! -f "$LOG_MD" ]; then
  cat > "$LOG_MD" <<EOF
# Evolution Log: ConsultingOS 進化履歴

> エージェント・スキルの変更履歴を時系列で記録。詳細仕様は CLAUDE.md「進化ログ運用ルール」参照。

EOF
fi

# 当日のセクションがなければ追加
if ! grep -q "^## $DATE$" "$LOG_MD"; then
  echo "" >> "$LOG_MD"
  echo "## $DATE" >> "$LOG_MD"
fi

# エントリ追記（重複防止: 直近20行以内に同じ path があればスキップ）
# 2026-05-05 C4 修正: grep -c が set -e + 0 ヒット時に exit 1 → || echo 0 と本来出力が連結
# 対応: -F でリテラル化、2>/dev/null でエラー抑制、空文字時のデフォルト値設定
LAST_10=$(tail -50 "$LOG_MD" | grep -cF "$REL_PATH" 2>/dev/null || true)
LAST_10=${LAST_10:-0}
if [ "$LAST_10" -lt 1 ]; then
  echo "- [$CATEGORY] \`$REL_PATH\` modified ($TOOL_NAME at $TIMESTAMP)" >> "$LOG_MD"
fi

exit 0
