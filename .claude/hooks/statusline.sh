#!/bin/bash
# Status line: branch / context% / cost / model
# Claude Code が JSON で session info を stdin に渡す

INPUT=$(cat)

# branch (現在の git ブランチ)
BRANCH=$(git branch --show-current 2>/dev/null || echo "no-git")

# モデル名
MODEL=$(echo "$INPUT" | jq -r '.model.display_name // .model.id // "claude"' 2>/dev/null)

# context 使用率（input_tokens / 1000000 * 100）
INPUT_TOKENS=$(echo "$INPUT" | jq -r '.usage.input_tokens // 0' 2>/dev/null)
CTX_PCT=$(echo "scale=1; $INPUT_TOKENS / 10000" | bc 2>/dev/null || echo "0.0")

# 累積コスト USD
COST=$(echo "$INPUT" | jq -r '.cost.total_cost_usd // 0' 2>/dev/null)
COST_FMT=$(printf "%.2f" "$COST" 2>/dev/null || echo "0.00")

# main ブランチ警告 (CLAUDE.md ハードルール 7)
BRANCH_WARN=""
if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
  BRANCH_WARN=" [main直接編集禁止]"
fi

# context 警告 (Thariq 氏 30-40 万トークンで context rot)
CTX_WARN=""
if (( $(echo "$CTX_PCT > 30" | bc -l 2>/dev/null) )); then
  CTX_WARN=" [/compact推奨]"
fi

echo "$MODEL | $BRANCH$BRANCH_WARN | ${CTX_PCT}%$CTX_WARN | \$$COST_FMT"
