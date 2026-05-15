#!/bin/bash
# Outcomes Judge (minimal PoC)
# 用途: ConsultingOS の assistant 応答に対する mechanical enforcement
# 設計根拠: Anthropic Outcomes 機能（2026-05-06 公式発表）の概念を自前移植
# 物理化日: 2026-05-07
# Phase: PoC（非ブロッキング、alert のみ）
# Rubric: .claude/rubrics/brand-guardian-minimal.yaml

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RUBRIC="$REPO_ROOT/.claude/rubrics/brand-guardian-minimal.yaml"

# Stop hook input: JSON via stdin with transcript_path
INPUT=$(cat)
TRANSCRIPT_PATH=$(echo "$INPUT" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('transcript_path', ''))" 2>/dev/null || echo "")

if [ -z "$TRANSCRIPT_PATH" ] || [ ! -f "$TRANSCRIPT_PATH" ]; then
  exit 0  # transcript なしは silent skip
fi

# 直近 assistant message の text 部を抽出（最後の完了応答）
LAST_OUTPUT=$(python3 <<EOF 2>/dev/null || echo ""
import json
import sys

try:
    with open("$TRANSCRIPT_PATH", "r") as f:
        lines = f.readlines()
    # 直近 50 行から assistant message を逆順検索
    for line in reversed(lines[-100:]):
        try:
            msg = json.loads(line)
            if msg.get('type') == 'assistant' or msg.get('role') == 'assistant':
                content = msg.get('message', {}).get('content', msg.get('content', ''))
                if isinstance(content, list):
                    text_parts = [c.get('text', '') for c in content if c.get('type') == 'text']
                    print('\n'.join(text_parts))
                else:
                    print(str(content))
                break
        except (json.JSONDecodeError, KeyError):
            continue
except Exception:
    pass
EOF
)

if [ -z "$LAST_OUTPUT" ]; then
  exit 0  # parse 失敗は silent skip（false positive 防止）
fi

# Rubric criteria check
FAILURES=()

# Criterion 1: em / en ダッシュ禁止 (rule 16 ⑥)
# byte pattern 使用: hook サブシェルは C locale の可能性、\x{} unicode code point は解釈不可
if echo "$LAST_OUTPUT" | grep -q -e $'\xe2\x80\x94' -e $'\xe2\x80\x93' 2>/dev/null; then
  FAILURES+=("[FAIL] emdash_ban: em / en ダッシュ違反検出 (rule 16 ⑥)")
fi

# Criterion 2: 太字 ** 違反 (rule 16 ①)
if echo "$LAST_OUTPUT" | grep -q '\*\*' 2>/dev/null; then
  FAILURES+=("[FAIL] bold_markdown_ban: 太字 ** 違反検出 (rule 16 ①)")
fi

# Criterion 3: 完了系断言の実測値併記 (rule 1)
COMPLETION_KEYWORDS="撲滅|完了|残存ゼロ|致命的 0|修復済|統一済|0 件|0件"
EVIDENCE_KEYWORDS="grep|wc -l|実測|FACT|出力|ログ|スクリーンショット"
if echo "$LAST_OUTPUT" | grep -qE "$COMPLETION_KEYWORDS" 2>/dev/null; then
  if ! echo "$LAST_OUTPUT" | grep -qE "$EVIDENCE_KEYWORDS" 2>/dev/null; then
    FAILURES+=("[FAIL] completion_claim_evidence: 完了系断言に実測値併記なし (rule 1)")
  fi
fi

# Criterion 4: 主語詐称禁止（簡易検出、agent 起動の有無は本 hook では判定困難のため warn 扱い）
# 本 PoC では「ConsultingOS が」+「assistant が今ターン直接」両方なしを suspicious として alert
SUBJECT_PHRASES="ConsultingOS が|OS が自律|orchestrator として自律|OS 自律実行|OS 自律完結"
DIRECT_PHRASES="assistant が今ターン直接|assistant が直接|私が直接|今ターン直接"
if echo "$LAST_OUTPUT" | grep -qE "$SUBJECT_PHRASES" 2>/dev/null; then
  if ! echo "$LAST_OUTPUT" | grep -qE "$DIRECT_PHRASES" 2>/dev/null; then
    # ConsultingOS 主語使用 + 直接実装明記なし、agent 起動の事実確認はこの hook では困難
    FAILURES+=("[WARN] subject_fraud_ban: 「ConsultingOS が」使用検出、agent 起動有無を確認推奨 (§2.3)")
  fi
fi

# 結果出力
if [ ${#FAILURES[@]} -gt 0 ]; then
  echo "🚨 Outcomes rubric (brand-guardian-minimal) 不通過:" >&2
  for f in "${FAILURES[@]}"; do
    echo "  $f" >&2
  done
  echo "  rubric: $RUBRIC" >&2
fi

exit 0  # 非ブロッキング（rule 16 + rule 1 違反検出は alert のみ、応答 block しない）
