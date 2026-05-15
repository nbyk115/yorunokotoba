#!/bin/bash
# Unit test for score-os-health.sh
# Phase 2 PR E: 計測ツール自身の自己虚偽事象再発防止のため invariant test を追加 (2026-05-05)

set -e

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
HOOK="$REPO_ROOT/.claude/hooks/score-os-health.sh"

PASS=0
FAIL=0
FAILED_TESTS=()

# Test 1: hook が実行可能
if [ -x "$HOOK" ]; then
  PASS=$((PASS+1))
  echo "PASS: T1 score-os-health.sh is executable"
else
  FAIL=$((FAIL+1))
  FAILED_TESTS+=("T1: not executable")
fi

# Test 2: bash -n 構文 OK
if bash -n "$HOOK" 2>/dev/null; then
  PASS=$((PASS+1))
  echo "PASS: T2 bash -n syntax check"
else
  FAIL=$((FAIL+1))
  FAILED_TESTS+=("T2: syntax error")
fi

# Test 3: 出力が valid JSON
OUTPUT=$(bash "$HOOK" 2>/dev/null)
if echo "$OUTPUT" | jq . >/dev/null 2>&1; then
  PASS=$((PASS+1))
  echo "PASS: T3 output is valid JSON"
else
  FAIL=$((FAIL+1))
  FAILED_TESTS+=("T3: invalid JSON output")
fi

# Test 4: additionalContext キー存在
if echo "$OUTPUT" | jq -e '.additionalContext' >/dev/null 2>&1; then
  PASS=$((PASS+1))
  echo "PASS: T4 .additionalContext key exists"
else
  FAIL=$((FAIL+1))
  FAILED_TESTS+=("T4: missing additionalContext")
fi

# Test 5: 総合スコアが 0-100 範囲
CONTEXT=$(echo "$OUTPUT" | jq -r '.additionalContext' 2>/dev/null)
TOTAL=$(echo "$CONTEXT" | grep -oE '総合スコア[^0-9]*[0-9]+' | grep -oE '[0-9]+' | head -1)
if [ -n "$TOTAL" ] && [ "$TOTAL" -ge 0 ] && [ "$TOTAL" -le 100 ]; then
  PASS=$((PASS+1))
  echo "PASS: T5 total score $TOTAL in range 0-100"
else
  FAIL=$((FAIL+1))
  FAILED_TESTS+=("T5: total out of range: $TOTAL")
fi

# Test 6: 5 軸全てが 0-20 範囲
ALL_IN_RANGE=true
OUT_AXES=""
for axis in 構造性 再現性 アセット帰属 数値根拠 差別化; do
  SCORE=$(echo "$CONTEXT" | grep -oE "${axis}[^0-9]*[0-9]+/20" | grep -oE '[0-9]+' | head -1)
  if [ -z "$SCORE" ] || [ "$SCORE" -lt 0 ] || [ "$SCORE" -gt 20 ]; then
    ALL_IN_RANGE=false
    OUT_AXES="$OUT_AXES $axis=$SCORE"
  fi
done
if [ "$ALL_IN_RANGE" = "true" ]; then
  PASS=$((PASS+1))
  echo "PASS: T6 all 5 axes in range 0-20"
else
  FAIL=$((FAIL+1))
  FAILED_TESTS+=("T6: axes out of range:$OUT_AXES")
fi

# Test 7: 5 軸合計 = 総合スコア（無矛盾検証、自己虚偽防止）
SUM=0
for axis in 構造性 再現性 アセット帰属 数値根拠 差別化; do
  SCORE=$(echo "$CONTEXT" | grep -oE "${axis}[^0-9]*[0-9]+/20" | grep -oE '[0-9]+' | head -1)
  SUM=$((SUM + SCORE))
done
if [ "$SUM" = "$TOTAL" ]; then
  PASS=$((PASS+1))
  echo "PASS: T7 5 axes sum ($SUM) equals total ($TOTAL)"
else
  FAIL=$((FAIL+1))
  FAILED_TESTS+=("T7: sum mismatch: axes_sum=$SUM, total=$TOTAL")
fi

# Test 8: ボトルネック軸が最低スコア軸と一致
BOTTLENECK=$(echo "$CONTEXT" | grep "ボトルネック" | sed 's/.*「//;s/」.*//')
MIN_SCORE=999
MIN_AXIS=""
for axis in 構造性 再現性 アセット帰属 数値根拠 差別化; do
  SCORE=$(echo "$CONTEXT" | grep -oE "${axis}[^0-9]*[0-9]+/20" | grep -oE '[0-9]+' | head -1)
  if [ "$SCORE" -lt "$MIN_SCORE" ]; then
    MIN_SCORE=$SCORE
    MIN_AXIS=$axis
  fi
done
if [ "$BOTTLENECK" = "$MIN_AXIS" ]; then
  PASS=$((PASS+1))
  echo "PASS: T8 bottleneck '$BOTTLENECK' matches min axis '$MIN_AXIS'"
else
  FAIL=$((FAIL+1))
  FAILED_TESTS+=("T8: bottleneck mismatch: reported='$BOTTLENECK', actual_min='$MIN_AXIS'")
fi

echo ""
echo "結果: PASS=$PASS / FAIL=$FAIL"
if [ "$FAIL" -gt 0 ]; then
  echo "失敗テスト:"
  for t in "${FAILED_TESTS[@]}"; do
    echo "  - $t"
  done
  exit 1
fi
exit 0
