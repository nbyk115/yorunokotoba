#!/bin/bash
# PreToolUse hook: evolution-log.md / git commit メッセージへの完了断言を実測未実施でブロック
# 対象: Write/Edit/MultiEdit on evolution-log.md, Bash with `git commit` containing 完了系キーワード
# 直近 30 ターン以内に検証コマンド実行ログがなければ exit 2 ブロック + evolution-log 自動追記
# 2026-05-05 PR #59 em ダッシュ虚偽 370 件残存・引き継ぎ「致命的 0」虚偽の再発防止
# 例外: ユーザーが「強制マージ」「検証スキップ」「実測なし許可」明示時、または CONSULTINGOS_REALITY_BYPASS=1

set -euo pipefail

# escape hatch: ログ検出不可環境向け
if [ "${CONSULTINGOS_REALITY_BYPASS:-0}" = "1" ]; then
  exit 0
fi

# stdin JSON 優先 + env フォールバック（ai-engineer 推奨パターン）
STDIN_INPUT=""
if [ -t 0 ]; then
  STDIN_INPUT=""
else
  STDIN_INPUT=$(cat 2>/dev/null || true)
fi

TOOL_NAME=""
INPUT=""
if [ -n "$STDIN_INPUT" ]; then
  TOOL_NAME=$(echo "$STDIN_INPUT" | jq -r '.tool_name // empty' 2>/dev/null)
  INPUT=$(echo "$STDIN_INPUT" | jq -r '.tool_input // empty' 2>/dev/null)
fi

# fallback: 環境変数
if [ -z "$TOOL_NAME" ]; then
  TOOL_NAME="${CLAUDE_TOOL_NAME:-}"
fi
if [ -z "$INPUT" ]; then
  INPUT="${CLAUDE_TOOL_INPUT:-}"
fi

if [ -z "$TOOL_NAME" ] || [ -z "$INPUT" ]; then
  exit 0
fi

# 対象判定: Write/Edit/MultiEdit on evolution-log.md OR Bash git commit
TARGET_TEXT=""
TARGET_KIND=""
case "$TOOL_NAME" in
  Write|Edit|MultiEdit)
    FILE=$(echo "$INPUT" | jq -r '.file_path // .filePath // empty' 2>/dev/null)
    if [ -z "$FILE" ] || ! echo "$FILE" | grep -qE 'evolution-log\.md$' 2>/dev/null; then
      exit 0
    fi
    TARGET_TEXT=$(echo "$INPUT" | jq -r '(.content // .new_string // ([.edits[]?.new_string] | join("\n")) // empty)' 2>/dev/null)
    TARGET_KIND="evolution-log"
    ;;
  Bash)
    CMD=$(echo "$INPUT" | jq -r '.command // empty' 2>/dev/null)
    if ! echo "$CMD" | grep -qE 'git\s+commit' 2>/dev/null; then
      exit 0
    fi
    TARGET_TEXT="$CMD"
    TARGET_KIND="git-commit"
    ;;
  *)
    exit 0
    ;;
esac

if [ -z "$TARGET_TEXT" ]; then
  exit 0
fi

# 完了系キーワード検出（narrative 余地のある「完了」「0 件」は除外、虚偽断言確実な語のみ）
if ! printf '%s' "$TARGET_TEXT" | grep -qE '撲滅|残存ゼロ|致命的 0|全件処理|統一済|修復済' 2>/dev/null; then
  exit 0
fi

# プロジェクトのセッションログから直近 30 ターン以内の検証コマンド実行を確認
ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
PROJECT_HASH=$(echo "$ROOT" | tr '/' '-' | sed 's/^-//')
SESSION_DIRS=(
  "${HOME}/.claude/projects/${PROJECT_HASH}"
  "${HOME}/.claude/projects/-${PROJECT_HASH}"
)

LATEST_JSONL=""
for SDIR in "${SESSION_DIRS[@]}"; do
  if [ -d "$SDIR" ]; then
    LATEST_JSONL=$(find "$SDIR" -name "*.jsonl" -mmin -60 -printf '%T@ %p\n' 2>/dev/null | sort -rn | head -1 | awk '{print $2}')
    [ -n "$LATEST_JSONL" ] && break
  fi
done

# セッションログ検出不可（ROOT 不一致 / projects ディレクトリ未生成）の場合は通過
# false positive 防止 + escape hatch CONSULTINGOS_REALITY_BYPASS で明示制御
if [ -z "$LATEST_JSONL" ]; then
  echo "[reality-check] セッションログ未検出のため検証スキップ。完了断言時は実測コマンド + 結果添付を必ず手動確認してください。" >&2
  exit 0
fi

# ユーザー承認: 直近 user message に「強制マージ」明示で通過
USER_OVERRIDE="no"
RECENT_USER=$(jq -r 'select(.type == "user") | .message.content // empty' "$LATEST_JSONL" 2>/dev/null | tail -20)
if printf '%s' "$RECENT_USER" | grep -qE '強制マージ|検証スキップ|実測なし許可' 2>/dev/null; then
  USER_OVERRIDE="yes"
fi

if [ "$USER_OVERRIDE" = "yes" ]; then
  exit 0
fi

# 直近 30 ターン assistant Bash tool_use 抽出 → 検証コマンド有無
VERIFICATION_FOUND="no"
RECENT_BASH=$(jq -r 'select(.type == "assistant") | .message.content[]? | select(.type == "tool_use" and .name == "Bash") | .input.command // empty' "$LATEST_JSONL" 2>/dev/null | tail -30)
if printf '%s' "$RECENT_BASH" | grep -qE '(^|[ /;|&])(grep|wc|find|test|git log|git diff|pdffonts|unzip)' 2>/dev/null; then
  VERIFICATION_FOUND="yes"
fi

if [ "$VERIFICATION_FOUND" = "no" ]; then
  # 自動 evolution-log 追記（佐藤裕介条件 ①・ブロック発動を OS 学習資産化）
  EVOLUTION_LOG="${ROOT}/evolution-log.md"
  if [ -f "$EVOLUTION_LOG" ]; then
    BLOCK_DATE=$(date +%Y-%m-%d)
    BLOCK_TIME=$(date +%H:%M:%S)
    {
      echo ""
      echo "## ${BLOCK_DATE} ${BLOCK_TIME}: reality-check.sh 物理ブロック発動"
      echo ""
      echo "### 事象"
      echo ""
      echo "${TARGET_KIND} への完了系宣言検出 + 直近 30 ターン検証コマンド未実行 = 自己虚偽の構造的兆候。reality-check.sh が物理ブロック発動。"
      echo ""
      echo "### 検出キーワード"
      echo ""
      echo "対象テキストに含まれる完了系キーワード: 撲滅 / 残存ゼロ / 致命的 0 / 全件処理 / 統一済 / 修復済 のいずれか"
      echo ""
      echo "### 必要な対応"
      echo ""
      echo "1. grep / wc / find / test / git log / git diff / pdffonts / unzip 等の検証コマンドで実測値を取得"
      echo "2. 実測値（数値 0 or 該当ゼロのファイルリスト）を完了宣言と併記"
      echo "3. 再度書き込み実行"
      echo ""
      echo "ユーザー承認下で通過する場合: 直近メッセージに「強制マージ」「検証スキップ」「実測なし許可」を明示。"
    } >> "$EVOLUTION_LOG" 2>/dev/null || true
  fi

  echo "BLOCKED: 完了系キーワード（撲滅 / 残存ゼロ / 致命的 0 / 全件処理 / 統一済 / 修復済）を含む書き込み・コミットを検知しましたが、直近 30 ターン以内に検証コマンド（grep / wc / find / test / git log / git diff / pdffonts / unzip）の実行ログが見つかりません。PR #59 em ダッシュ虚偽 370 件残存・引き継ぎ「致命的 0」虚偽の再発を物理ブロックします。検証コマンドを実行して実測値を取得後、再度書き込みしてください。ユーザー承認下で通過する場合は直近メッセージに「強制マージ」「検証スキップ」「実測なし許可」を明示してください（CLAUDE.md ハードルール 1・2026-05-05 自己虚偽再発防止）。" >&2
  exit 2
fi

exit 0
