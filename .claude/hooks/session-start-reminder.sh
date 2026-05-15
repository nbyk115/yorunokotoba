#!/bin/bash
# SessionStart hook: 再評価カレンダー自動通知
# Phase 2 PR D: 再現性 +2 物理化 (2026-05-05)

set -e

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
EVOLUTION_LOG="$REPO_ROOT/evolution-log.md"

if [ ! -f "$EVOLUTION_LOG" ]; then
  exit 0
fi

if ! grep -q "## 再評価カレンダー" "$EVOLUTION_LOG" 2>/dev/null; then
  exit 0
fi

TODAY=$(date +%Y-%m-%d)
TODAY_EPOCH=$(date -d "$TODAY" +%s 2>/dev/null || date -j -f "%Y-%m-%d" "$TODAY" +%s 2>/dev/null || echo "0")

CALENDAR_LINES=$(awk '
  /^## 再評価カレンダー/ { in_section=1; next }
  /^## / && in_section { in_section=0 }
  in_section && /^- [0-9]{4}-[0-9]{2}-[0-9]{2}:/ { print }
' "$EVOLUTION_LOG" 2>/dev/null)

if [ -z "$CALENDAR_LINES" ]; then
  exit 0
fi

MESSAGES=()
OVERDUE_COUNT=0
UPCOMING_COUNT=0

while IFS= read -r line; do
  ITEM_DATE=$(echo "$line" | grep -oE '^- [0-9]{4}-[0-9]{2}-[0-9]{2}:' | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}')
  if [ -z "$ITEM_DATE" ]; then
    continue
  fi

  ITEM_EPOCH=$(date -d "$ITEM_DATE" +%s 2>/dev/null || date -j -f "%Y-%m-%d" "$ITEM_DATE" +%s 2>/dev/null || echo "0")
  ITEM_DESC=$(echo "$line" | sed 's/^- [0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}: //')

  if [ "$ITEM_EPOCH" = "0" ] || [ "$TODAY_EPOCH" = "0" ]; then
    if [[ "$ITEM_DATE" < "$TODAY" || "$ITEM_DATE" = "$TODAY" ]]; then
      MESSAGES+=("OVERDUE [$ITEM_DATE]: $ITEM_DESC")
      MESSAGES+=("  → 対応オプション: (A) 再評価を実施して evolution-log に結果記録 / (B) 済みなら evolution-log から当該行を削除してアーカイブ")
      OVERDUE_COUNT=$((OVERDUE_COUNT + 1))
    fi
  else
    DIFF_EPOCH=$(( ITEM_EPOCH - TODAY_EPOCH ))
    DIFF_DAYS=$(( DIFF_EPOCH / 86400 ))

    if [ "$DIFF_DAYS" -le 0 ]; then
      ELAPSED_DAYS=$(( -DIFF_DAYS ))
      if [ "$ELAPSED_DAYS" -eq 0 ]; then
        LABEL="OVERDUE [本日 $ITEM_DATE]"
      else
        LABEL="OVERDUE [${ELAPSED_DAYS}日超過 $ITEM_DATE]"
      fi
      MESSAGES+=("$LABEL: $ITEM_DESC")
      MESSAGES+=("  → 対応オプション: (A) 再評価を実施して evolution-log に結果記録 / (B) 済みなら evolution-log から当該行を削除してアーカイブ")
      OVERDUE_COUNT=$((OVERDUE_COUNT + 1))
    elif [ "$DIFF_DAYS" -le 7 ]; then
      MESSAGES+=("UPCOMING (残り ${DIFF_DAYS} 日) [$ITEM_DATE]: $ITEM_DESC")
      UPCOMING_COUNT=$((UPCOMING_COUNT + 1))
    fi
  fi
done <<< "$CALENDAR_LINES"

if [ ${#MESSAGES[@]} -eq 0 ]; then
  exit 0
fi

if [ "$OVERDUE_COUNT" -gt 0 ] && [ "$UPCOMING_COUNT" -gt 0 ]; then
  SUMMARY="再評価カレンダー: 期日超過 ${OVERDUE_COUNT} 件 / 直近 7 日以内 ${UPCOMING_COUNT} 件 (実測: evolution-log.md, $(date +%Y-%m-%d))"
elif [ "$OVERDUE_COUNT" -gt 0 ]; then
  SUMMARY="再評価カレンダー: 期日超過 ${OVERDUE_COUNT} 件 (実測: evolution-log.md, $(date +%Y-%m-%d))"
else
  SUMMARY="再評価カレンダー: 直近 7 日以内 ${UPCOMING_COUNT} 件 (実測: evolution-log.md, $(date +%Y-%m-%d))"
fi

CONTEXT="【再評価カレンダー自動通知】${SUMMARY}\n"
for msg in "${MESSAGES[@]}"; do
  CONTEXT="${CONTEXT}${msg}\n"
done
CONTEXT="${CONTEXT}参照: evolution-log.md「## 再評価カレンダー」セクション"

printf '{"additionalContext": "%s"}\n' "$(printf '%s' "$CONTEXT" | sed 's/"/\\"/g')"

exit 0
