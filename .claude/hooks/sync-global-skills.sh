#!/usr/bin/env bash
# sync-global-skills.sh
# SessionStart hook: consulting-os/.claude/skills/ の全エントリを
# ~/.claude/skills/ に symlink で補完する（差分追加のみ、idempotent）
# - 既存 symlink は変更しない
# - 壊れた symlink はユーザー判断に委ねて報告のみ
# - エラー時も exit 0 を維持（SessionStart を落とさない）

set -euo pipefail

REPO_ROOT="$(git -C "$(dirname "$0")/../.." rev-parse --show-toplevel 2>/dev/null || echo "")"
if [ -z "$REPO_ROOT" ]; then
  exit 0
fi

REPO_SKILLS="$REPO_ROOT/.claude/skills"
GLOBAL_SKILLS="$HOME/.claude/skills"

if [ ! -d "$REPO_SKILLS" ]; then
  echo "[sync-global-skills] WARN: source dir not found: $REPO_SKILLS" >&2
  exit 0
fi

mkdir -p "$GLOBAL_SKILLS"

added=0
broken=0

for src in "$REPO_SKILLS"/*; do
  [ -e "$src" ] || continue
  name=$(basename "$src")
  dest="$GLOBAL_SKILLS/$name"

  if [ -L "$dest" ] && [ ! -e "$dest" ]; then
    echo "[sync-global-skills] BROKEN symlink detected (manual review): $dest" >&2
    broken=$((broken + 1))
    continue
  fi

  if [ -e "$dest" ] || [ -L "$dest" ]; then
    continue
  fi

  if ln -s "$src" "$dest" 2>/dev/null; then
    echo "[sync-global-skills] added: $name"
    added=$((added + 1))
  else
    echo "[sync-global-skills] WARN: failed to symlink $name" >&2
  fi
done

if [ "$added" -gt 0 ]; then
  echo "[sync-global-skills] done: +${added} symlink(s) added to $GLOBAL_SKILLS"
fi

if [ "$broken" -gt 0 ]; then
  echo "[sync-global-skills] WARNING: ${broken} broken symlink(s) in $GLOBAL_SKILLS" >&2
fi

exit 0
