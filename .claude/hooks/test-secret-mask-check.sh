#!/usr/bin/env bash
# test-secret-mask-check.sh
# secret-mask-check.sh の self-test。28 ケース (block 期待 15 + pass 期待 12 + bypass 検証 1)。
# 実行: bash .claude/hooks/test-secret-mask-check.sh

set -u

HOOK=".claude/hooks/secret-mask-check.sh"
PASS=0
FAIL=0
FAIL_DETAIL=""

run_test() {
  local name="$1"
  local expected_exit="$2"
  local cmd_json="$3"

  local actual_exit
  actual_exit=$(echo "$cmd_json" | bash "$HOOK" >/dev/null 2>&1; echo $?)

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
run_test "B01 cat .env"                "2" '{"command":"cat .env"}'
run_test "B02 head credentials"        "2" '{"command":"head ~/.aws/credentials"}'
run_test "B03 grep secrets"            "2" '{"command":"grep API_KEY secrets.json"}'
run_test "B04 cat id_rsa"              "2" '{"command":"cat ~/.ssh/id_rsa"}'
run_test "B05 awk pem"                 "2" '{"command":"awk /BEGIN/ key.pem"}'
run_test "B06 jq token"                "2" '{"command":"jq .access_token access_token.json"}'
run_test "B07 cat .env.local"          "2" '{"command":"cat .env.local"}'
run_test "B08 cat client_secret"       "2" '{"command":"cat client_secret.json"}'
run_test "B09 head .gpg"               "2" '{"command":"head backup.gpg"}'
run_test "B10 cat service-account"     "2" '{"command":"cat service-account.json"}'
run_test "B11 grep auth.json"          "2" '{"command":"grep token auth.json"}'
run_test "B12 cat .p12"                "2" '{"command":"cat cert.p12"}'
run_test "B13 strings wallet.dat"      "2" '{"command":"strings wallet.dat"}'
run_test "B14 cat .gnupg/"             "2" '{"command":"cat ~/.gnupg/secring.gpg"}'
run_test "B15 head kubeconfig"         "2" '{"command":"head ~/.kube/kubeconfig"}'

# ===== pass 期待 (exit 0) =====
run_test "P01 empty input"             "0" '{}'
run_test "P02 plain ls"                "0" '{"command":"ls -la"}'
run_test "P03 .env no read cmd"        "0" '{"command":"touch .env"}'
run_test "P04 cat with mask"           "0" '{"command":"cat .env | mask"}'
run_test "P05 sha256sum credentials"   "0" '{"command":"sha256sum credentials.json"}'
run_test "P06 wc -l .env"              "0" '{"command":"wc -l .env"}'
run_test "P07 cat to /dev/null 2>&1"   "0" '{"command":"cat .env > /dev/null 2>&1"}'
run_test "P08 sort -u secrets"         "0" '{"command":"sort -u secrets.txt"}'
run_test "P09 head -n 0 client_secret" "0" '{"command":"head -n 0 client_secret.json"}'
run_test "P10 redact tool"             "0" '{"command":"cat secrets.json | redact-tool"}'
run_test "P11 file without sensitive"  "0" '{"command":"cat README.md"}'
run_test "P12 -q grep credentials"     "0" '{"command":"grep -q TOKEN credentials.json"}'

# B16 強化: bypass env set 時に block-期待入力でも exit 0
expected_exit=0
input='{"command":"cat .env"}'
actual_exit=$(echo "$input" | CONSULTINGOS_SECRET_MASK_ENFORCEMENT=off bash "$HOOK" >/dev/null 2>&1; echo $?)
if [ "$actual_exit" = "$expected_exit" ]; then
  PASS=$((PASS+1))
  echo "PASS: P13 bypass env actually disables block (exit=$actual_exit)"
else
  FAIL=$((FAIL+1))
  FAIL_DETAIL="${FAIL_DETAIL}
FAIL: P13 bypass env (expected=$expected_exit, actual=$actual_exit)"
  echo "FAIL: P13 bypass env (expected=$expected_exit, actual=$actual_exit)"
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
