#!/bin/bash
# UserPromptSubmit hook: 直近 N ターン以内に Agent tool 呼び出しゼロかつ
# Edit/Write/MultiEdit が閾値以上発生していたら「assistant 単独執筆モード」を
# stderr 警告として表示し、orchestrator に並列起動を促す
# PR AW 2026-05-06 物理化: 関根さん案件「自分で書いた方が早い」モード自己検出機構
#
# 既存 orchestration-block.sh は PreToolUse でファイル書き込み時にブロックする (検出後)
# 本 hook は UserPromptSubmit でターン開始時に行動パターンを検出する (検出前)
#
# 環境変数:
# - CONSULTINGOS_AGENT_ZERO_WARNING=off で無効化
# - CONSULTINGOS_AGENT_ZERO_TURNS で監視ターン数 (default: 5)
# - CONSULTINGOS_AGENT_ZERO_EDIT_THRESHOLD で警告発火 Edit 回数 (default: 5)

set -e

if [ "${CONSULTINGOS_AGENT_ZERO_WARNING:-warn}" = "off" ]; then
  exit 0
fi

TURNS="${CONSULTINGOS_AGENT_ZERO_TURNS:-5}"
THRESHOLD="${CONSULTINGOS_AGENT_ZERO_EDIT_THRESHOLD:-5}"

# stdin から JSON 受信 (UserPromptSubmit hook 入力)
STDIN_INPUT=$(cat 2>/dev/null || true)
if [ -z "$STDIN_INPUT" ]; then
  exit 0
fi

TRANSCRIPT_PATH=$(echo "$STDIN_INPUT" | jq -r '.transcript_path // .transcriptPath // empty' 2>/dev/null)

if [ -z "$TRANSCRIPT_PATH" ] || [ ! -f "$TRANSCRIPT_PATH" ]; then
  exit 0
fi

# 直近 TURNS ターン以内の Edit/Write/MultiEdit 回数 と Agent tool 呼び出し回数を集計
# 各 user turn を 1 ターンとカウント、最後の TURNS 個の user turn 以降を検査範囲とする
USER_TURN_LINES=$(grep -nE '"type":\s*"user"' "$TRANSCRIPT_PATH" 2>/dev/null | tail -n "$TURNS" | head -1 | cut -d: -f1)

if [ -z "$USER_TURN_LINES" ]; then
  exit 0
fi

# 検査範囲のトランスクリプトを抽出
RECENT_TRANSCRIPT=$(tail -n +"$USER_TURN_LINES" "$TRANSCRIPT_PATH" 2>/dev/null)

EDIT_COUNT=$(echo "$RECENT_TRANSCRIPT" | grep -cE '"name":\s*"(Edit|Write|MultiEdit)"' 2>/dev/null || echo 0)
AGENT_COUNT=$(echo "$RECENT_TRANSCRIPT" | grep -cE '"name":\s*"Agent"|"subagent_type"' 2>/dev/null || echo 0)

# 警告条件: Edit が閾値以上 + Agent ゼロ
if [ "$EDIT_COUNT" -ge "$THRESHOLD" ] && [ "$AGENT_COUNT" -eq 0 ]; then
  cat >&2 <<EOF
[ConsultingOS Agent 起動ゼロ警告: 直近 ${TURNS} ターン以内]
- Edit/Write/MultiEdit 実行回数: ${EDIT_COUNT} 回
- Agent tool 呼び出し回数: 0 回
- 検出された行動パターン: 「自分で書いた方が早い」モード（CLAUDE.md ハードルール 17 違反シグナル）

assistant はオーケストレーターであり執筆者ではありません。次のターンでは:
1. 案件関連エージェント（sales-deck-designer / frontend-dev / creative-director / ux-designer / brand-guardian / market-researcher / content-strategist / proposal-writer / strategy-lead / kpi-analytics / competitive-analyst / tech-lead / ai-engineer）の並列起動を検討
2. 単発修正なら Edit 継続も許容、ただし orchestration-block.sh でファイル書き込み時に検証あり
3. 検出無効化は CONSULTINGOS_AGENT_ZERO_WARNING=off（OEM 先で運用前検証時のみ推奨）

関根さん案件再発防止 + 外販 / OEM 提供前の構造的規律担保 (PR AW 2026-05-06 物理化)
EOF
fi

exit 0
