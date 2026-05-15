#!/bin/bash
# SessionStart hook: 直近 4 週間の 27 エージェント別起動回数を集計し、偏り検知
# PR AX 2026-05-07 物理化: 業務負荷配分マネジメント自己適用
# .claude/skills/workload-allocation-management.md の §4 自己適用を物理化
#
# 検出ロジック:
# - 個人集中: 特定エージェント起動回数が中央値の 1.5 倍超過
# - 単一依存: 特定エージェント起動率が全起動の 40% 超
#
# 環境変数:
# - CONSULTINGOS_WORKLOAD_TRACKING=off で無効化
# - CONSULTINGOS_WORKLOAD_WINDOW_DAYS で集計期間 (default: 28)
# - CONSULTINGOS_WORKLOAD_CONCENTRATION_THRESHOLD で集中閾値 (default: 1.5)
# - CONSULTINGOS_WORKLOAD_DEPENDENCY_THRESHOLD で単一依存閾値 (default: 40, percent)

set -e

if [ "${CONSULTINGOS_WORKLOAD_TRACKING:-on}" = "off" ]; then
  exit 0
fi

WINDOW_DAYS="${CONSULTINGOS_WORKLOAD_WINDOW_DAYS:-28}"
CONCENTRATION_THRESHOLD="${CONSULTINGOS_WORKLOAD_CONCENTRATION_THRESHOLD:-1.5}"
DEPENDENCY_THRESHOLD_PERCENT="${CONSULTINGOS_WORKLOAD_DEPENDENCY_THRESHOLD:-40}"

ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo "$(pwd)")
SNAPSHOT_FILE="${ROOT}/.claude/memory/workload-snapshot.json"
PROJECT_HASH=$(echo "$ROOT" | tr '/' '-' | sed 's/^-//')

SESSION_DIRS=(
  "${HOME}/.claude/projects/${PROJECT_HASH}"
  "${HOME}/.claude/projects/-${PROJECT_HASH}"
  "${HOME}/.claude/projects/$(basename "$ROOT")"
)

# Agent 起動回数集計
declare -A AGENT_COUNTS
TOTAL_INVOCATIONS=0

for SDIR in "${SESSION_DIRS[@]}"; do
  if [ -d "$SDIR" ]; then
    while IFS= read -r jsonl_file; do
      if [ -f "$jsonl_file" ]; then
        # subagent_type フィールドから agent 名を抽出
        while IFS= read -r agent_name; do
          if [ -n "$agent_name" ]; then
            AGENT_COUNTS["$agent_name"]=$((${AGENT_COUNTS["$agent_name"]:-0} + 1))
            TOTAL_INVOCATIONS=$((TOTAL_INVOCATIONS + 1))
          fi
        done < <(grep -oE '"subagent_type":\s*"[a-z-]+"' "$jsonl_file" 2>/dev/null | \
                 sed 's/.*"\([a-z-]*\)"$/\1/' || true)
      fi
    done < <(find "$SDIR" -name "*.jsonl" -mtime -"$WINDOW_DAYS" -print 2>/dev/null)
    break
  fi
done

# 起動履歴ゼロは通過（false positive 防止）
if [ "$TOTAL_INVOCATIONS" -lt 10 ]; then
  exit 0
fi

# 中央値計算（簡易: 起動回数の中位値）
COUNTS_SORTED=$(for k in "${!AGENT_COUNTS[@]}"; do echo "${AGENT_COUNTS[$k]}"; done | sort -n)
COUNT_NUM=$(echo "$COUNTS_SORTED" | wc -l)
MEDIAN_LINE=$(((COUNT_NUM + 1) / 2))
MEDIAN=$(echo "$COUNTS_SORTED" | sed -n "${MEDIAN_LINE}p")
MEDIAN="${MEDIAN:-1}"

# 偏り検知
WARNINGS=""
for AGENT in "${!AGENT_COUNTS[@]}"; do
  COUNT="${AGENT_COUNTS[$AGENT]}"

  # 個人集中: 中央値 × 閾値超過
  RATIO=$(awk -v c="$COUNT" -v m="$MEDIAN" 'BEGIN{ printf "%.2f", c/m }')
  if awk -v r="$RATIO" -v t="$CONCENTRATION_THRESHOLD" 'BEGIN{exit !(r > t)}'; then
    WARNINGS="${WARNINGS}- 集中: ${AGENT} 起動 ${COUNT} 回（中央値 ${MEDIAN} の ${RATIO} 倍）\n"
  fi

  # 単一依存: 全体に占める割合
  PERCENT=$(awk -v c="$COUNT" -v t="$TOTAL_INVOCATIONS" 'BEGIN{ printf "%.1f", c*100/t }')
  if awk -v p="$PERCENT" -v t="$DEPENDENCY_THRESHOLD_PERCENT" 'BEGIN{exit !(p > t)}'; then
    WARNINGS="${WARNINGS}- 単一依存: ${AGENT} が全起動の ${PERCENT}%（閾値 ${DEPENDENCY_THRESHOLD_PERCENT}%）\n"
  fi
done

# Snapshot 保存（次セッションで参照可、JSON 形式）
mkdir -p "$(dirname "$SNAPSHOT_FILE")"
{
  echo "{"
  echo "  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\","
  echo "  \"window_days\": $WINDOW_DAYS,"
  echo "  \"total_invocations\": $TOTAL_INVOCATIONS,"
  echo "  \"median\": $MEDIAN,"
  echo "  \"agent_counts\": {"
  FIRST=1
  for AGENT in "${!AGENT_COUNTS[@]}"; do
    if [ "$FIRST" -eq 0 ]; then echo ","; fi
    printf "    \"%s\": %d" "$AGENT" "${AGENT_COUNTS[$AGENT]}"
    FIRST=0
  done
  echo ""
  echo "  }"
  echo "}"
} > "$SNAPSHOT_FILE"

# 警告出力
if [ -n "$WARNINGS" ]; then
  cat >&2 <<EOF
[ConsultingOS Workload 偏り検知: 直近 ${WINDOW_DAYS} 日 / 起動 ${TOTAL_INVOCATIONS} 回]
${WARNINGS}
対応: 他エージェントへの並列分散を検討、属人化リスク (関根さん案件型) の構造的予防。
詳細: .claude/skills/workload-allocation-management.md §3 再配分プロトコル参照。
無効化: CONSULTINGOS_WORKLOAD_TRACKING=off (PR AX 2026-05-07 物理化)
EOF
fi

exit 0
