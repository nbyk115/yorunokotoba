#!/bin/bash
# PostToolUse / Stop hook: em-dash (U+2014) / en-dash (U+2013) ターン内即時検出
# PR AU 実装 2026-05-06
#
# 検知対象:
#   em-dash U+2014 / en-dash U+2013 を assistant 応答テキストまたは
#   書き込みファイルコンテンツから検出し、stderr 警告を出力する
#
# 除外対象（規律定義書内は学習目的のため許容）:
#   .claude/skills/ / .claude/agents/ / .claude/commands/ / docs/ / CLAUDE.md / evolution-log.md
#
# 呼び出し元:
#   PostToolUse (Edit/Write/MultiEdit): ファイルコンテンツを検証
#   Stop: transcript の最終 assistant message を検証
#
# 動作モード:
#   CONSULTINGOS_EMDASH_ENFORCEMENT=off   -> 即時通過
#   CONSULTINGOS_EMDASH_ENFORCEMENT=warn  -> stderr 警告のみ (default)
#   CONSULTINGOS_EMDASH_ENFORCEMENT=block -> exit 2 でブロック

set -e

ENFORCEMENT="${CONSULTINGOS_EMDASH_ENFORCEMENT:-warn}"

if [ "$ENFORCEMENT" = "off" ]; then
  exit 0
fi

EM_DASH=$'\xe2\x80\x94'
EN_DASH=$'\xe2\x80\x93'

ALLOWED_PATH_PATTERN='\.claude/skills/|\.claude/agents/|\.claude/commands/|^docs/|CLAUDE\.md|evolution-log\.md'

DETECTED_HITS=""
SOURCE_LABEL=""

STDIN_INPUT=$(cat 2>/dev/null || true)

if [ -z "$STDIN_INPUT" ]; then
  exit 0
fi

FILE_PATH=$(echo "$STDIN_INPUT" | jq -r '.file_path // .filePath // empty' 2>/dev/null)
FILE_CONTENT=$(echo "$STDIN_INPUT" | jq -r '.content // .new_string // empty' 2>/dev/null)

if [ -n "$FILE_PATH" ]; then
  if echo "$FILE_PATH" | grep -qE "$ALLOWED_PATH_PATTERN" 2>/dev/null; then
    exit 0
  fi

  SOURCE_LABEL="ファイル: $FILE_PATH"

  if [ -n "$FILE_CONTENT" ]; then
    EM_HITS=$(printf '%s' "$FILE_CONTENT" | grep -n "${EM_DASH}" 2>/dev/null | head -5 || true)
    EN_HITS=$(printf '%s' "$FILE_CONTENT" | grep -n "${EN_DASH}" 2>/dev/null | head -5 || true)

    if [ -n "$EM_HITS" ]; then
      DETECTED_HITS="${DETECTED_HITS}  [em-dash U+2014]:${EM_HITS}"$'\n'
    fi
    if [ -n "$EN_HITS" ]; then
      DETECTED_HITS="${DETECTED_HITS}  [en-dash U+2013]:${EN_HITS}"$'\n'
    fi
  fi
fi

if [ -z "$FILE_PATH" ]; then
  TRANSCRIPT_PATH=$(echo "$STDIN_INPUT" | jq -r '.transcript_path // .transcriptPath // empty' 2>/dev/null)

  if [ -n "$TRANSCRIPT_PATH" ] && [ -f "$TRANSCRIPT_PATH" ]; then
    LATEST_RESPONSE=$(jq -r 'select(.type == "assistant") | .message.content[]? | select(.type == "text") | .text' "$TRANSCRIPT_PATH" 2>/dev/null | tail -300)

    if [ -n "$LATEST_RESPONSE" ]; then
      SOURCE_LABEL="assistant 応答テキスト (transcript)"

      EM_HITS=$(printf '%s' "$LATEST_RESPONSE" | grep -n "${EM_DASH}" 2>/dev/null | head -5 || true)
      EN_HITS=$(printf '%s' "$LATEST_RESPONSE" | grep -n "${EN_DASH}" 2>/dev/null | head -5 || true)

      if [ -n "$EM_HITS" ]; then
        DETECTED_HITS="${DETECTED_HITS}  [em-dash U+2014]:${EM_HITS}"$'\n'
      fi
      if [ -n "$EN_HITS" ]; then
        DETECTED_HITS="${DETECTED_HITS}  [en-dash U+2013]:${EN_HITS}"$'\n'
      fi
    fi
  fi
fi

if [ -z "$DETECTED_HITS" ]; then
  exit 0
fi

WARNING_MSG="[ConsultingOS em-dash/en-dash 検出: CLAUDE.md ハードルール 16 違反]"$'\n'
WARNING_MSG="${WARNING_MSG}対象: ${SOURCE_LABEL}"$'\n'
WARNING_MSG="${WARNING_MSG}検出箇所 (最大5件):"$'\n'
WARNING_MSG="${WARNING_MSG}${DETECTED_HITS}"
WARNING_MSG="${WARNING_MSG}修正方法: em-dash(U+2014) / en-dash(U+2013) をコロン(:) / ハイフン(-) / カンマ(,) / セミコロン(;) で置換してください。"$'\n'
WARNING_MSG="${WARNING_MSG}参照: .claude/skills/brand-guidelines.md §4 英語出力ルール / §5.8 em-dash 物理化ゲート (PR AU)"$'\n'

echo "$WARNING_MSG" >&2

if [ "$ENFORCEMENT" = "block" ]; then
  exit 2
fi

exit 0
