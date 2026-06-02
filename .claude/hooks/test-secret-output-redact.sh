#!/usr/bin/env bash
# test-secret-output-redact.sh
# secret-output-redact.sh の self-test。15 ケース (block 期待 10 + pass 期待 5)。
# 実行: bash .claude/hooks/test-secret-output-redact.sh

set -u

HOOK=".claude/hooks/secret-output-redact.sh"
PASS=0
FAIL=0
FAIL_DETAIL=""

run_test() {
  local name="$1"
  local expected_exit="$2"
  local input="$3"

  local actual_exit
  actual_exit=$(echo "$input" | bash "$HOOK" >/dev/null 2>&1; echo $?)

  if [ "$actual_exit" = "$expected_exit" ]; then
    PASS=$((PASS+1))
    echo "PASS: $name (exit=$actual_exit)"
  else
    FAIL=$((FAIL+1))
    FAIL_DETAIL="${FAIL_DETAIL}
FAIL: $name (expected=$expected_exit, actual=$actual_exit)"
    echo "FAIL: $name (expected=$expected_exit, actual=$actual_exit)"
  fi
}

# ===== block 期待 (exit 2) =====
run_test "T01 GitHub PAT ghp_"        "2" '{"tool_response":{"content":"my token is ghp_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa here"}}'
run_test "T02 GitHub fine-grained"    "2" '{"tool_response":{"content":"github_pat_aaaaaaaaaaaaaaaaaaaaaa_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"}}'
run_test "T03 Anthropic sk-ant"       "2" '{"tool_response":{"content":"key sk-ant-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa here"}}'
run_test "T04 OpenAI sk-"             "2" '{"tool_response":{"content":"sk-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}}'
run_test "T05 AWS AKIA"               "2" '{"tool_response":{"content":"AKIAIOSFODNN7EXAMPLE"}}'
run_test "T06 Google AIza"            "2" '{"tool_response":{"content":"AIzaSyDaGmWKa4JsXZ-HjGw7ISLn_3namBGewQe"}}'
run_test "T07 Slack xoxb"             "2" '{"tool_response":{"content":"xoxb-1234-5678-aaaabbbbccccdddd"}}'
run_test "T08 Resend re_"             "2" '{"tool_response":{"content":"re_AbCdEf12345678901234567890"}}'
run_test "T09 PEM private key"        "2" '{"tool_response":{"content":"-----BEGIN RSA PRIVATE KEY-----"}}'
run_test "T10 Hugging Face hf_"       "2" '{"tool_response":{"content":"hf_AbCdEfGhIjKlMnOpQrStUvWxYz12345678"}}'

# ===== pass 期待 (exit 0) =====
run_test "T11 empty input"            "0" ''
run_test "T12 plain text"             "0" '{"tool_response":{"content":"hello world, no secret here"}}'
run_test "T13 placeholder name"       "0" '{"tool_response":{"content":"set GITHUB_TOKEN env var"}}'
run_test "T14 partial ghp_ short"     "0" '{"tool_response":{"content":"ghp_abc"}}'
run_test "T15 bypass env"             "0" '{"tool_response":{"content":"hello"}}'

# T15 強化: bypass env set 時に block-期待入力でも exit 0 になるかを別途検証
expected_exit=0
input='{"tool_response":{"content":"ghp_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}}'
actual_exit=$(echo "$input" | CONSULTINGOS_SECRET_OUTPUT_ENFORCEMENT=off bash "$HOOK" >/dev/null 2>&1; echo $?)
if [ "$actual_exit" = "$expected_exit" ]; then
  PASS=$((PASS+1))
  echo "PASS: T15b bypass env actually disables block (exit=$actual_exit)"
else
  FAIL=$((FAIL+1))
  FAIL_DETAIL="${FAIL_DETAIL}
FAIL: T15b bypass env (expected=$expected_exit, actual=$actual_exit)"
  echo "FAIL: T15b bypass env (expected=$expected_exit, actual=$actual_exit)"
fi

# ===== summary =====
echo ""
echo "=============================="
echo "PASS: $PASS / FAIL: $FAIL"
echo "=============================="
if [ "$FAIL" -gt 0 ]; then
  echo -e "$FAIL_DETAIL"
  exit 1
fi
exit 0
