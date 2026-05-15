#!/bin/bash
# Auto-validate Discipline Hook
# Stop hook で assistant 応答に consulting_os validate_output() を自動実行
# 既存 stop-validator.sh を補完する Python 駆動の構造化検証層
#
# 検知範囲:
# - 反証チェック 4 要素 (header / Step 1 / Step 2 / Step 3 / 残存リスク)
# - 出典なし数値断言 (Hard Rule 2)
# - FACT / INFERENCE / SPECULATION ラベル分類
#
# 環境変数:
#   CONSULTINGOS_AUTO_VALIDATE=off|warn|block (default: warn)
#   CONSULTINGOS_VALIDATE_LOG=path (default: .claude/memory/auto-validate.log)

set -e

ENFORCEMENT="${CONSULTINGOS_AUTO_VALIDATE:-warn}"
LOG_PATH="${CONSULTINGOS_VALIDATE_LOG:-.claude/memory/auto-validate.log}"

if [ "$ENFORCEMENT" = "off" ]; then
  exit 0
fi

STDIN_INPUT=$(cat 2>/dev/null || true)
if [ -z "$STDIN_INPUT" ]; then
  exit 0
fi

# transcript_path 抽出 (Claude Code Stop hook の stdin JSON 想定)
TRANSCRIPT_PATH=$(printf '%s' "$STDIN_INPUT" | python3 -c '
import json, sys
try:
    data = json.load(sys.stdin)
    print(data.get("transcript_path", ""), end="")
except Exception:
    pass
' 2>/dev/null || true)

if [ -z "$TRANSCRIPT_PATH" ] || [ ! -f "$TRANSCRIPT_PATH" ]; then
  exit 0
fi

# 直近 assistant 応答の text 抽出
LATEST_RESPONSE=$(python3 -c "
import json, sys
path = '$TRANSCRIPT_PATH'
last_text = ''
try:
    with open(path) as f:
        for line in f:
            try:
                ev = json.loads(line)
            except Exception:
                continue
            if ev.get('type') != 'assistant':
                continue
            msg = ev.get('message', {})
            for block in msg.get('content', []):
                if block.get('type') == 'text':
                    last_text = block.get('text', '')
    print(last_text)
except Exception:
    pass
" 2>/dev/null || true)

if [ -z "$LATEST_RESPONSE" ]; then
  exit 0
fi

# Python validate_output() 呼び出し
VALIDATION_JSON=$(printf '%s' "$LATEST_RESPONSE" | python3 -c '
import sys, json
try:
    from consulting_os import validate_output
except ImportError:
    print(json.dumps({"available": False}))
    sys.exit(0)

text = sys.stdin.read()
result = validate_output(text)
print(json.dumps({
    "available": True,
    "discipline_pass": result.discipline_pass,
    "violations": result.violations,
    "falsification_complete": (
        result.falsification.has_all_steps if result.falsification else False
    ),
    "bare_numbers_count": len(result.sources.bare_numbers),
    "labels": {
        "fact": len(result.sources.facts),
        "inference": len(result.sources.inferences),
        "speculation": len(result.sources.speculations),
    },
}, ensure_ascii=False))
' 2>/dev/null || echo '{"available": false}')

# 解析
AVAILABLE=$(printf '%s' "$VALIDATION_JSON" | python3 -c '
import json, sys
try:
    print(json.load(sys.stdin).get("available", False))
except Exception:
    print(False)
' 2>/dev/null)

if [ "$AVAILABLE" != "True" ]; then
  # consulting_os パッケージ未インストール環境では既存 stop-validator.sh に委ね skip
  exit 0
fi

DISCIPLINE_PASS=$(printf '%s' "$VALIDATION_JSON" | python3 -c '
import json, sys
print(json.load(sys.stdin).get("discipline_pass", True))
' 2>/dev/null)

# ログ追記
mkdir -p "$(dirname "$LOG_PATH")" 2>/dev/null || true
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
printf '[%s] %s\n' "$TIMESTAMP" "$VALIDATION_JSON" >> "$LOG_PATH" 2>/dev/null || true

if [ "$DISCIPLINE_PASS" = "True" ]; then
  exit 0
fi

# 違反検出時の出力
VIOLATIONS=$(printf '%s' "$VALIDATION_JSON" | python3 -c '
import json, sys
data = json.load(sys.stdin)
for v in data.get("violations", []):
    print(f"  - {v}")
' 2>/dev/null)

WARNING_MSG="[ConsultingOS auto-validate] 規律違反検出:
${VIOLATIONS}
詳細ログ: ${LOG_PATH}
修正方法: consulting-os validate < <(echo \"<assistant 出力>\") で再検証可能"

if [ "$ENFORCEMENT" = "block" ]; then
  printf '%s\n' "$WARNING_MSG" >&2
  exit 2
else
  printf '%s\n' "$WARNING_MSG" >&2
  exit 0
fi
