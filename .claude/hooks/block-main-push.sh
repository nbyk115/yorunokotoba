#!/usr/bin/env bash
# block-main-push.sh
# PreToolUse Bash hook: git push で main/master ブランチへの直接 push を物理ブロック。
# CLAUDE.md ハードルール 7「main への直接 push 禁止」の物理担保。
# bypass 4 種対応: HEAD:main / refs/heads/main / +main / --all / --mirror / クォート付き。
#
# 入力: stdin JSON 優先、CLAUDE_TOOL_INPUT env フォールバック（reality-check.sh 互換）
# 出力: BLOCK 時は exit 2 + stderr メッセージ、通過時は exit 0

set -euo pipefail

STDIN_INPUT=$(cat 2>/dev/null || true)
INPUT="${STDIN_INPUT:-${CLAUDE_TOOL_INPUT:-}}"

if [ -z "$INPUT" ]; then
  exit 0
fi

CMD=$(echo "$INPUT" | jq -r '.command // .tool_input.command // empty' 2>/dev/null || echo "")

if [ -z "$CMD" ]; then
  exit 0
fi

# git push でない場合はスキップ
if ! echo "$CMD" | grep -qE 'git[[:space:]]+push'; then
  exit 0
fi

# 削除コマンド（git push origin --delete main）は許可
if echo "$CMD" | grep -qE -- '--delete[[:space:]]+("|'\'')?(main|master)("|'\'')?'; then
  exit 0
fi
if echo "$CMD" | grep -qE 'git[[:space:]]+push[[:space:]]+origin[[:space:]]+:[[:space:]]*("|'\'')?(main|master)("|'\'')?'; then
  exit 0
fi

# Bypass パターン検出
BLOCK_REASON=""

# パターン 1: 通常 push（origin main / origin master、クォート付き含む）
if echo "$CMD" | grep -qE 'git[[:space:]]+push.*origin[[:space:]]+("|'\'')?(main|master)("|'\'')?([[:space:]]|$|;|&)'; then
  BLOCK_REASON="origin main/master 直接 push"
fi

# パターン 2: HEAD:main 系
if echo "$CMD" | grep -qE 'git[[:space:]]+push.*("|'\'')?HEAD:(main|master)("|'\'')?'; then
  BLOCK_REASON="HEAD:main/master 形式 push"
fi

# パターン 3: refs/heads/main 系
if echo "$CMD" | grep -qE 'git[[:space:]]+push.*refs/heads/(main|master)'; then
  BLOCK_REASON="refs/heads/main/master 形式 push"
fi

# パターン 4: +main 系（force push 同等）
if echo "$CMD" | grep -qE 'git[[:space:]]+push.*[[:space:]]\+(main|master)([[:space:]]|$|;|&)'; then
  BLOCK_REASON="+main/master force push 同等"
fi

# パターン 5: --all / --mirror（main 含む全 branch push）
if echo "$CMD" | grep -qE 'git[[:space:]]+push.*--all([[:space:]]|$|;|&)'; then
  BLOCK_REASON="--all 全 branch push（main 含む）"
fi
if echo "$CMD" | grep -qE 'git[[:space:]]+push.*--mirror([[:space:]]|$|;|&)'; then
  BLOCK_REASON="--mirror 全 branch push（main 含む）"
fi

if [ -n "$BLOCK_REASON" ]; then
  echo "BLOCKED: main/master への直接 push を検出（$BLOCK_REASON）。" >&2
  echo "CLAUDE.md ハードルール 7 違反。feature branch + PR + Squash and merge 経由で統合してください。" >&2
  echo "（PR BF / 5 agent audit tech H1 / bypass 4 種対応版、2026-05-08 物理化）" >&2
  exit 2
fi

exit 0
