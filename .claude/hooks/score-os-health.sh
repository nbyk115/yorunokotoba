#!/bin/bash
# SessionStart hook: ConsultingOS 5 軸ヘルス採点（実測値ベース）
# Phase 2 PR D: 数値根拠 +1 物理化 (2026-05-05)
#
# 5 軸採点（各 20 点満点 / 合計 100 点）:
# 軸1 構造性    : CLAUDE.md 行数 + ハードルール数 + Boris #3 削除セット整合
# 軸2 再現性    : hook 数 + settings.json deny ルール数 + 再評価カレンダー件数
# 軸3 アセット帰属: agent/skill ファイルの FACT/INFERENCE/SPECULATION ラベル含有率
# 軸4 数値根拠   : em/en ダッシュ件数(逆点) + 完了系宣言 narrative-only ガード件数
# 軸5 差別化    : exit 2 物理ブロック実装件数 + 競合比較表セクション数

set -e

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CLAUDE_MD="$REPO_ROOT/CLAUDE.md"
EVOLUTION_LOG="$REPO_ROOT/evolution-log.md"
SETTINGS_JSON="$REPO_ROOT/.claude/settings.json"
HOOKS_DIR="$REPO_ROOT/.claude/hooks"
AGENTS_DIR="$REPO_ROOT/.claude/agents"
SKILLS_DIR="$REPO_ROOT/.claude/skills"

if [ ! -f "$CLAUDE_MD" ] || [ ! -f "$SETTINGS_JSON" ]; then
  exit 0
fi

# 軸1: 構造性
CLAUDE_LINES=$(wc -l < "$CLAUDE_MD" 2>/dev/null || echo "0")
HARD_RULE_COUNT=$(grep -cE "^[0-9]+\. \*\*(YOU MUST|IMPORTANT|NEVER)\*\*" "$CLAUDE_MD" 2>/dev/null || echo "0")
BORIS3_CHECK=$(grep -cE "削除と.*セット|セット.*削除" "$CLAUDE_MD" 2>/dev/null || echo "0")

if [ "$CLAUDE_LINES" -ge 100 ] && [ "$CLAUDE_LINES" -le 130 ]; then
  SCORE_LINES=8
elif [ "$CLAUDE_LINES" -gt 130 ] && [ "$CLAUDE_LINES" -le 150 ]; then
  SCORE_LINES=6
else
  SCORE_LINES=4
fi

if [ "$HARD_RULE_COUNT" -ge 15 ]; then
  SCORE_RULES=8
elif [ "$HARD_RULE_COUNT" -ge 10 ]; then
  SCORE_RULES=5
else
  SCORE_RULES=2
fi

if [ "$BORIS3_CHECK" -ge 1 ]; then
  SCORE_BORIS3=4
else
  SCORE_BORIS3=0
fi

SCORE_AXIS1=$(( SCORE_LINES + SCORE_RULES + SCORE_BORIS3 ))
[ "$SCORE_AXIS1" -gt 20 ] && SCORE_AXIS1=20

# 軸2: 再現性
HOOK_COUNT=$(find "$HOOKS_DIR" -name "*.sh" 2>/dev/null | wc -l || echo "0")
DENY_COUNT=$(jq '.permissions.deny | length' "$SETTINGS_JSON" 2>/dev/null || echo "0")
CALENDAR_COUNT=0
if [ -f "$EVOLUTION_LOG" ]; then
  CALENDAR_COUNT=$(awk '
    /^## 再評価カレンダー/ { in_s=1; next }
    /^## / && in_s { in_s=0 }
    in_s && /^- [0-9]{4}-[0-9]{2}-[0-9]{2}:/ { count++ }
    END { print count+0 }
  ' "$EVOLUTION_LOG" 2>/dev/null || echo "0")
fi

if [ "$HOOK_COUNT" -ge 7 ]; then
  SCORE_HOOK=7
elif [ "$HOOK_COUNT" -ge 4 ]; then
  SCORE_HOOK=5
else
  SCORE_HOOK=2
fi

if [ "$DENY_COUNT" -ge 30 ]; then
  SCORE_DENY=7
elif [ "$DENY_COUNT" -ge 15 ]; then
  SCORE_DENY=5
else
  SCORE_DENY=2
fi

if [ "$CALENDAR_COUNT" -ge 10 ]; then
  SCORE_CALENDAR=6
elif [ "$CALENDAR_COUNT" -ge 5 ]; then
  SCORE_CALENDAR=4
else
  SCORE_CALENDAR=2
fi

SCORE_AXIS2=$(( SCORE_HOOK + SCORE_DENY + SCORE_CALENDAR ))
[ "$SCORE_AXIS2" -gt 20 ] && SCORE_AXIS2=20

# 軸3: アセット帰属
# 厳密判定: 「## 出典」セクションヘッダ存在 + FACT/INFERENCE/SPECULATION 各ラベル行が 30 字以上の具体的記述（形骸化検出）
AGENT_TOTAL=$(find "$AGENTS_DIR" -name "*.md" 2>/dev/null | wc -l || echo "0")
SKILL_TOTAL=$(find "$SKILLS_DIR" -name "*.md" 2>/dev/null | wc -l || echo "0")
TOTAL_FILES=$(( AGENT_TOTAL + SKILL_TOTAL ))

LABELED_FILES=0
for f in $(find "$AGENTS_DIR" "$SKILLS_DIR" -name "*.md" 2>/dev/null); do
  if ! grep -q "^## 出典" "$f" 2>/dev/null; then continue; fi
  FACT_LINE=$(grep -E "^- FACT:" "$f" | head -1)
  INF_LINE=$(grep -E "^- INFERENCE:" "$f" | head -1)
  SPEC_LINE=$(grep -E "^- SPECULATION:" "$f" | head -1)
  if [ ${#FACT_LINE} -ge 30 ] && [ ${#INF_LINE} -ge 30 ] && [ ${#SPEC_LINE} -ge 30 ]; then
    LABELED_FILES=$(( LABELED_FILES + 1 ))
  fi
done

if [ "$TOTAL_FILES" -gt 0 ]; then
  LABEL_RATE=$(( LABELED_FILES * 100 / TOTAL_FILES ))
else
  LABEL_RATE=0
fi

if [ "$LABEL_RATE" -ge 50 ]; then
  SCORE_AXIS3=20
elif [ "$LABEL_RATE" -ge 30 ]; then
  SCORE_AXIS3=15
elif [ "$LABEL_RATE" -ge 15 ]; then
  SCORE_AXIS3=10
else
  SCORE_AXIS3=5
fi

# 軸4: 数値根拠
EM_DASH_COUNT=$(grep -rE $'\xe2\x80\x94|\xe2\x80\x93' "$REPO_ROOT/.claude" "$REPO_ROOT/docs" "$REPO_ROOT"/*.md 2>/dev/null | wc -l || echo "0")
COMPLETION_GUARD=$(grep -cE "撲滅|残存ゼロ|致命的 0|全件処理|統一済|修復済" "$HOOKS_DIR/stop-validator.sh" 2>/dev/null || echo "0")

if [ "$EM_DASH_COUNT" -eq 0 ]; then
  SCORE_EMDASH=12
elif [ "$EM_DASH_COUNT" -le 5 ]; then
  SCORE_EMDASH=8
else
  SCORE_EMDASH=3
fi

if [ "$COMPLETION_GUARD" -ge 3 ]; then
  SCORE_GUARD=8
elif [ "$COMPLETION_GUARD" -ge 1 ]; then
  SCORE_GUARD=5
else
  SCORE_GUARD=0
fi

SCORE_AXIS4=$(( SCORE_EMDASH + SCORE_GUARD ))
[ "$SCORE_AXIS4" -gt 20 ] && SCORE_AXIS4=20

# 軸5: 差別化
EXIT2_COUNT=$(grep -rn "exit 2" "$HOOKS_DIR" 2>/dev/null | wc -l || echo "0")
COMPARE_TABLE_COUNT=0
if [ -f "$REPO_ROOT/README.md" ]; then
  COMPARE_TABLE_COUNT=$(grep -cE "競合カテゴリ|競合の訴求|競合比較" "$REPO_ROOT/README.md" 2>/dev/null || echo "0")
fi

if [ "$EXIT2_COUNT" -ge 8 ]; then
  SCORE_BLOCK=12
elif [ "$EXIT2_COUNT" -ge 4 ]; then
  SCORE_BLOCK=8
else
  SCORE_BLOCK=4
fi

if [ "$COMPARE_TABLE_COUNT" -ge 2 ]; then
  SCORE_COMPARE=8
elif [ "$COMPARE_TABLE_COUNT" -ge 1 ]; then
  SCORE_COMPARE=5
else
  SCORE_COMPARE=0
fi

SCORE_AXIS5=$(( SCORE_BLOCK + SCORE_COMPARE ))
[ "$SCORE_AXIS5" -gt 20 ] && SCORE_AXIS5=20

# 合計 + ボトルネック抽出
TOTAL=$(( SCORE_AXIS1 + SCORE_AXIS2 + SCORE_AXIS3 + SCORE_AXIS4 + SCORE_AXIS5 ))

MIN_SCORE="$SCORE_AXIS1"
MIN_AXIS="構造性"
for pair in "再現性:$SCORE_AXIS2" "アセット帰属:$SCORE_AXIS3" "数値根拠:$SCORE_AXIS4" "差別化:$SCORE_AXIS5"; do
  AXIS_NAME="${pair%%:*}"
  AXIS_SCORE="${pair##*:}"
  if [ "$AXIS_SCORE" -lt "$MIN_SCORE" ]; then
    MIN_SCORE="$AXIS_SCORE"
    MIN_AXIS="$AXIS_NAME"
  fi
done

RESULT="【ConsultingOS 5 軸ヘルス採点 (実測: $(date +%Y-%m-%d))】\n"
RESULT="${RESULT}軸1 構造性     : ${SCORE_AXIS1}/20  (CLAUDE.md ${CLAUDE_LINES} 行 / ハードルール ${HARD_RULE_COUNT} / Boris#3 整合 ${BORIS3_CHECK})\n"
RESULT="${RESULT}軸2 再現性     : ${SCORE_AXIS2}/20  (hook ${HOOK_COUNT} 本 / deny ${DENY_COUNT} 件 / カレンダー ${CALENDAR_COUNT} 件)\n"
RESULT="${RESULT}軸3 アセット帰属: ${SCORE_AXIS3}/20  (ラベル付与率 ${LABEL_RATE}% = ${LABELED_FILES}/${TOTAL_FILES} ファイル)\n"
RESULT="${RESULT}軸4 数値根拠   : ${SCORE_AXIS4}/20  (em/en ダッシュ ${EM_DASH_COUNT} 件 / 完了断言ガード ${COMPLETION_GUARD} 件)\n"
RESULT="${RESULT}軸5 差別化     : ${SCORE_AXIS5}/20  (exit2 ブロック ${EXIT2_COUNT} 件 / 競合比較表 ${COMPARE_TABLE_COUNT} セクション)\n"
RESULT="${RESULT}総合スコア     : ${TOTAL}/100  [形式達成度 INFERENCE: Goodhart 法則該当、真の 100 ではない、Phase 4 採点ロジック AutoHarness 化で構造担保予定]\n"
RESULT="${RESULT}ボトルネック   : 軸「${MIN_AXIS}」(${MIN_SCORE} 点) が最低、優先改善対象\n"
RESULT="${RESULT}注記           : 真の 100 = 実クライアント ROI 実証 + Goodhart 対策後のみ到達。本スコアと混同して「100/100 達成」断言は虚偽（CLAUDE.md ハードルール 1 + 17 §2.4 真の 100 原則）"

printf '{"additionalContext": "%s"}\n' "$(printf '%s' "$RESULT" | sed 's/"/\\"/g')"

exit 0
