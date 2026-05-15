#!/bin/bash
# Stop hook: self-fraud-check - assistant 自称詐称の機械検出（PR AZ 物理化）
# 検出事象: Agent 起動ゼロ session で assistant が「ConsultingOS が」「自律実行」等の
#           主語ラベルを付与した出力を行い、ConsultingOS 稼働を偽装する構造的問題
# 関根さん案件 v1-v13 同型 + 直近 PR AY bootstrap guard 自称詐称事象からの学習
# 担当エージェント設計: infra-devops（2026-05-07 起動）
#
# 環境変数:
# - CONSULTINGOS_SELF_FRAUD_CHECK=off で全体無効化
# - CONSULTINGOS_STOP_ENFORCEMENT=block で違反時 exit 2（default: warn）

set -e

if [ "${CONSULTINGOS_SELF_FRAUD_CHECK:-on}" = "off" ]; then
  exit 0
fi

STDIN_INPUT=$(cat 2>/dev/null || true)
if [ -z "$STDIN_INPUT" ]; then
  exit 0
fi

STOP_HOOK_ACTIVE=$(echo "$STDIN_INPUT" | jq -r '.stop_hook_active // false' 2>/dev/null)
if [ "$STOP_HOOK_ACTIVE" = "true" ]; then
  exit 0
fi

SESSION_ID=$(echo "$STDIN_INPUT" | jq -r '.session_id // empty' 2>/dev/null)
if [ -n "$SESSION_ID" ]; then
  FLAG_FILE="/tmp/consultingos-self-fraud-flag-${SESSION_ID}"
  if [ -f "$FLAG_FILE" ]; then
    exit 0
  fi
  touch "$FLAG_FILE" 2>/dev/null || true
fi

TRANSCRIPT_PATH=$(echo "$STDIN_INPUT" | jq -r '.transcript_path // .transcriptPath // empty' 2>/dev/null)
if [ -z "$TRANSCRIPT_PATH" ] || [ ! -f "$TRANSCRIPT_PATH" ]; then
  exit 0
fi

if ! command -v python3 >/dev/null 2>&1; then
  >&2 echo "[self-fraud-check] python3 not found, skipping transcript parse (regression guard)"
  exit 0
fi

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
EVO="$REPO_ROOT/evolution-log.md"
TODAY=$(date +%Y-%m-%d)
CURRENT_BRANCH=$(cd "$REPO_ROOT" 2>/dev/null && git branch --show-current 2>/dev/null || echo "(unknown)")

AGENT_COUNT=$(grep -cE '"name"[[:space:]]*:[[:space:]]*"Agent"|"subagent_type"[[:space:]]*:' "$TRANSCRIPT_PATH" 2>/dev/null || echo 0)
EDIT_COUNT=$(grep -cE '"name"[[:space:]]*:[[:space:]]*"(Edit|Write|MultiEdit)"' "$TRANSCRIPT_PATH" 2>/dev/null || echo 0)

LAST_ASSISTANT_TEXT=$(set +e; tac "$TRANSCRIPT_PATH" 2>/dev/null | python3 - 2>/dev/null <<'PYEOF'
import sys, json

for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    try:
        obj = json.loads(line)
    except json.JSONDecodeError:
        continue
    if obj.get('type') != 'assistant':
        continue
    content = obj.get('message', {}).get('content', obj.get('content', []))
    if isinstance(content, list):
        texts = [c.get('text', '') for c in content if isinstance(c, dict) and c.get('type') == 'text']
        if texts:
            print('\n'.join(texts))
            break
    elif isinstance(content, str) and content:
        print(content)
        break
PYEOF
true)

if [ -z "$LAST_ASSISTANT_TEXT" ]; then
  exit 0
fi

FRAUD_PATTERN='(ConsultingOS|本 ?OS|当 ?OS|ConsultingOSが)[ \t]*(が|として|の orchestrator|の orchestratorとして)|(orchestrator ?として|orchestratorとして)[ \t]*(自律|実行|稼働|完結)|自律実行|自律完結|自律報告|OS[ \t]*(が|側で)[ \t]*自律|自律的に(実行|完結|判断|報告)|私たちの ?ConsultingOS ?が|OS が稼働'

FRAUD_HITS=$(printf '%s' "$LAST_ASSISTANT_TEXT" | grep -oE "$FRAUD_PATTERN" 2>/dev/null | head -20 || true)
FRAUD_COUNT=$(printf '%s' "$FRAUD_HITS" | grep -c . 2>/dev/null || echo 0)

EDITED_FILES=$(set +e; python3 - "$TRANSCRIPT_PATH" 2>/dev/null <<'PYEOF'
import sys, json

path = sys.argv[1]
files = set()
try:
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue
            content = obj.get('message', {}).get('content', obj.get('content', []))
            if not isinstance(content, list):
                continue
            for item in content:
                if not isinstance(item, dict):
                    continue
                if item.get('type') == 'tool_use' and item.get('name') in ('Edit', 'Write', 'MultiEdit'):
                    fp = item.get('input', {}).get('file_path', '')
                    if fp:
                        files.add(fp)
except Exception:
    pass
for f in files:
    print(f)
PYEOF
true)

DISCIPLINE_ONLY="yes"
NON_DISCIPLINE_FILES=""
if [ -n "$EDITED_FILES" ]; then
  while IFS= read -r fpath; do
    [ -z "$fpath" ] && continue
    REL="${fpath#$REPO_ROOT/}"
    case "$REL" in
      .claude/*|CLAUDE.md|docs/*|evolution-log.md)
        ;;
      *)
        DISCIPLINE_ONLY="no"
        NON_DISCIPLINE_FILES="${NON_DISCIPLINE_FILES}  $REL"$'\n'
        ;;
    esac
  done <<< "$EDITED_FILES"
elif [ "$EDIT_COUNT" -eq 0 ]; then
  DISCIPLINE_ONLY="n/a"
fi

FRAUD_CONFIRMED="no"
if [ "$AGENT_COUNT" -eq 0 ] && [ "$EDIT_COUNT" -ge 1 ] && [ "$FRAUD_COUNT" -ge 1 ]; then
  if [ "$DISCIPLINE_ONLY" = "yes" ]; then
    FRAUD_CONFIRMED="no"
  else
    FRAUD_CONFIRMED="yes"
  fi
fi

if [ "$FRAUD_CONFIRMED" = "no" ]; then
  exit 0
fi

FRAUD_MSG="[ConsultingOS self-fraud-check 違反検知: 自称詐称]
- 検出日時: $TODAY
- branch: $CURRENT_BRANCH
- Agent 起動回数: $AGENT_COUNT（= 0）
- Edit/Write/MultiEdit 回数: $EDIT_COUNT
- 検出された自称フレーズ（最大 20 件）:
$(printf '%s' "$FRAUD_HITS" | sed 's/^/  /')
- 非規律ファイルへの Edit:
${NON_DISCIPLINE_FILES}
- 事象: assistant が Agent 起動ゼロで実装・執筆を行いながら ConsultingOS 稼働を示す
  主語ラベルを使用。実態は assistant 単独 narrative だが ConsultingOS が稼働しているかのように偽装。
- 根拠: CLAUDE.md ハードルール 17 主語詐称禁止原則 + 関根さん案件 v1-v13 同型事象
- 対策: 次回 session で関連エージェントを最低 1 名以上起動した上で主語ラベルを使用すること。
  Agent 起動ゼロで作業する場合は「ConsultingOS が」等の主語を使わず「assistant が」と明示すること。"

echo "$FRAUD_MSG" >&2

if [ -f "$EVO" ]; then
  cat >> "$EVO" <<EVEOF

## $TODAY self-fraud-check 違反検知 (Stop hook)
- branch: $CURRENT_BRANCH
- Agent 起動回数: 0 / Edit 回数: $EDIT_COUNT
- 検出フレーズ: $(printf '%s' "$FRAUD_HITS" | tr '\n' ' ' | head -c 200)
- 非規律 Edit 対象: $(echo "${NON_DISCIPLINE_FILES:-なし}" | tr '\n' ' ' | head -c 200)
- 検出方法: Stop hook self-fraud-check.sh（自称詐称 Agent=0 + Edit>=1 + 主語フレーズ検出）
- 対策: 次 session で Agent 起動後に主語使用 / または主語を「assistant が」に修正

EVEOF
fi

ENFORCEMENT="${CONSULTINGOS_STOP_ENFORCEMENT:-warn}"
if [ "$ENFORCEMENT" = "block" ]; then
  exit 2
fi

exit 0
