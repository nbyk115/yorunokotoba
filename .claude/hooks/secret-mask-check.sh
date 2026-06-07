#!/usr/bin/env bash
# secret-mask-check.sh
# PreToolUse Bash hook: 機微パス × 読出系 × sentinel 不在の 3 条件 AND で物理ブロック。
# CLAUDE.md Hard Rule 3「.env / credentials / secrets / API キーを読み取り・出力・コミット禁止」の入力側担保。
# 既存物理化 hook (block-main-push.sh 等) と同じ入出力仕様、case branch 経由で導入。
# Reference: theloveyousave/consulting-os PR #340-#345 (2026-05-31) の Nobucode 側独自実装。
#
# 入力: stdin JSON 優先、CLAUDE_TOOL_INPUT env フォールバック (既存 hook 互換)
# 出力: BLOCK 時は exit 2 + stderr メッセージ、通過時は exit 0
# Bypass: CONSULTINGOS_SECRET_MASK_ENFORCEMENT=off を環境変数に設定して 1 ターンのみ無効化可

set -uo pipefail

STDIN_INPUT=$(cat 2>/dev/null || true)
INPUT="${STDIN_INPUT:-${CLAUDE_TOOL_INPUT:-}}"

if [ "${CONSULTINGOS_SECRET_MASK_ENFORCEMENT:-on}" = "off" ]; then
  exit 0
fi

if [ -z "$INPUT" ]; then
  exit 0
fi

CMD=$(echo "$INPUT" | jq -r '.command // .tool_input.command // empty' 2>/dev/null || echo "")

if [ -z "$CMD" ]; then
  exit 0
fi

# 機微パス 33 種 (元 22 + 追加 11: env-local / secret-singular / cert: gpg/asc/p12/pfx/jks / wallet.dat / auth.json / service-account / gcloud / client_secret)
SENSITIVE_PATHS='\.env|\.env\.|credentials|secrets?|\.pem|\.key|_token|api_key|\.npmrc|\.pypirc|\.dockercfg|kubeconfig|\.ssh/|\.aws/credentials|id_rsa|id_dsa|id_ed25519|id_ecdsa|\.gnupg/|\.netrc|\.git-credentials|\.crypt|\.gpg|\.asc|\.p12|\.pfx|\.jks|wallet\.dat|auth\.json|service-account|gcloud/|client_secret'

# 読出系 22 種 (word boundary、env 単体は .env 誤マッチ防止のため除外)
READ_CMDS='\bcat\b|\bhead\b|\btail\b|\bless\b|\bmore\b|\bawk\b|\bsed\b|\bgrep\b|\begrep\b|\bfgrep\b|\bwc\b|\btac\b|\bstrings\b|\bxxd\b|\bod\b|\bjq\b|\byq\b|\bcut\b|\btr\b|\bsort\b|\buniq\b|\btee\b|\bprintenv\b'

# 安全 sentinel 23 種 (元 13 + 追加 10: sha1/sha512/b2/head-n-0 / 2>/dev/null / --silent / -s / sort -u / uniq -c / --count)
SAFE_SENTINELS='mask|redact|truncate|sha1sum|sha256sum|sha512sum|md5sum|b2sum|wc -l|wc -c|head -c 0|head -n 0|/dev/null 2>&1|> /dev/null|>/dev/null|2>/dev/null|--quiet|--silent|-q\b|-s\b|sort -u|uniq -c|--count'

if echo "$CMD" | grep -qE "$SENSITIVE_PATHS" \
  && echo "$CMD" | grep -qE "$READ_CMDS" \
  && ! echo "$CMD" | grep -qiE "$SAFE_SENTINELS"; then
  echo "BLOCKED: 機微パス読み出しを検出 (sentinel 不在)。" >&2
  echo "Command: $CMD" >&2
  echo "CLAUDE.md Hard Rule 3 物理担保。" >&2
  echo "Bypass: 'CONSULTINGOS_SECRET_MASK_ENFORCEMENT=off' を環境変数に設定して 1 ターンのみ無効化可。" >&2
  exit 2
fi

exit 0
