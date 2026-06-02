#!/usr/bin/env bash
# secret-output-redact.sh
# PostToolUse Bash hook: tool 出力中に含まれる機微 token パターンを検出して exit 2 で block。
# CLAUDE.md Hard Rule 3「.env / credentials / secrets / API キーを読み取り・出力・コミット禁止」の出力側担保。
# secret-mask-check.sh (PreToolUse 入力側) と二段防御を構成。
# Reference: Nobucode/consulting-os PR #341 (2026-05-31 物理化) の Nobucode 側独自実装。
#
# 入力: stdin JSON (tool_response.content / .content / .output) 優先、フォールバックで CLAUDE_TOOL_OUTPUT env、最終フォールバックは raw input
# 出力: BLOCK 時は exit 2 + stderr メッセージ、通過時は exit 0
# Bypass: CONSULTINGOS_SECRET_OUTPUT_ENFORCEMENT=off で 1 ターン無効化可

set -uo pipefail

STDIN_INPUT=$(cat 2>/dev/null || true)
INPUT="${STDIN_INPUT:-${CLAUDE_TOOL_OUTPUT:-}}"

if [ "${CONSULTINGOS_SECRET_OUTPUT_ENFORCEMENT:-on}" = "off" ]; then
  exit 0
fi

if [ -z "$INPUT" ]; then
  exit 0
fi

# tool 出力テキスト抽出 (JSON 失敗時は raw input)
TEXT=$(echo "$INPUT" | jq -r '.tool_response.content // .content // .output // empty' 2>/dev/null || echo "")
if [ -z "$TEXT" ]; then
  TEXT="$INPUT"
fi

# Secret token パターン 20 種
# GitHub (PAT classic / OAuth / user / server / refresh / fine-grained), Anthropic, OpenAI,
# AWS, Google, GCP OAuth, Slack bot/user, Resend, SendGrid, PEM private key, JWT, NVIDIA, Hugging Face
SECRET_RE='(ghp_[A-Za-z0-9]{36}|gho_[A-Za-z0-9]{36}|ghu_[A-Za-z0-9]{36}|ghs_[A-Za-z0-9]{36}|ghr_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{82}|sk-ant-[A-Za-z0-9_-]{90,}|sk-[A-Za-z0-9]{48}|AKIA[0-9A-Z]{16}|AIza[A-Za-z0-9_-]{35}|ya29\.[A-Za-z0-9_-]+|xoxb-[0-9]+-[0-9]+-[A-Za-z0-9]+|xoxp-[0-9]+-[0-9]+-[0-9]+-[A-Za-z0-9]+|re_[A-Za-z0-9_]{24,}|SG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}|-----BEGIN [A-Z ]*PRIVATE KEY-----|eyJ[A-Za-z0-9_=-]+\.eyJ[A-Za-z0-9_=-]+\.[A-Za-z0-9_=-]+|nvapi-[A-Za-z0-9_-]+|hf_[A-Za-z0-9]{34}|aws_secret_access_key=[A-Za-z0-9/+=]+)'

if echo "$TEXT" | grep -qE "$SECRET_RE"; then
  echo "BLOCKED: tool output に secret token を検出 (PostToolUse)。" >&2
  echo "CLAUDE.md Hard Rule 3 出力側担保。" >&2
  echo "Bypass: 'CONSULTINGOS_SECRET_OUTPUT_ENFORCEMENT=off' を環境変数に設定して 1 ターンのみ無効化可。" >&2
  exit 2
fi

exit 0
