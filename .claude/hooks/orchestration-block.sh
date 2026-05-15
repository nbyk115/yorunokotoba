#!/bin/bash
# PreToolUse hook: 案件成果物の Write/Edit/MultiEdit 時にエージェント起動履歴を検証
# 対象: strategy/*/*.html|*.pptx|*.pdf / examples/*/*.html|*.pptx|*.pdf
# 直近5分以内にエージェント（sales-deck-designer/frontend-dev/creative-director/ux-designer/brand-guardian）
# の起動履歴がなければ stderr に警告 + exit 2 で物理ブロック
# 2026-05-04 違反学習: orchestration 物理ブロック実装

set -e

# 2026-05-05 F1 修正: false positive オーバーライド機構（Docker / CI / セッションログ検出不可環境）
# CONSULTINGOS_ORCHESTRATION_BYPASS=1 で全体スキップ（escape hatch）
if [ "${CONSULTINGOS_ORCHESTRATION_BYPASS:-0}" = "1" ]; then
  exit 0
fi

TOOL_NAME="${CLAUDE_TOOL_NAME:-}"

# Write / Edit / MultiEdit のみ対象
case "$TOOL_NAME" in
  Write|Edit|MultiEdit) ;;
  *) exit 0 ;;
esac

FILE=$(echo "$CLAUDE_TOOL_INPUT" | jq -r '.file_path // .filePath // empty' 2>/dev/null)

# ファイルパス未取得なら通過（false positive 防止）
if [ -z "$FILE" ]; then
  exit 0
fi

# テストケース7対応: Edit の場合、old_string が 200 バイト以内なら軽微修正として通過
# （typo 1-3 字 / インデント等の形式修正は物理ブロック対象外）
if [ "$TOOL_NAME" = "Edit" ]; then
  OLD_STR=$(echo "$CLAUDE_TOOL_INPUT" | jq -r '.old_string // empty' 2>/dev/null)
  OLD_LEN=${#OLD_STR}
  if [ "$OLD_LEN" -le 200 ]; then
    exit 0
  fi
fi

# プロジェクトルート検出（case 判定の前に移動: 2026-05-05 C1 修正）
ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo "$(pwd)")

# 絶対パス対応: ROOT を剥がして相対化（Claude Code は絶対パスを渡す）
REL_FILE="${FILE#$ROOT/}"

# 対象パターン判定（PR AT 2026-05-06: clients/projects/cases 追加 + 環境変数上書き機構）
MATCHED=0
case "$REL_FILE" in
  strategy/*/*.html|strategy/*/*.css|strategy/*/*.pptx|strategy/*/*.pdf|\
  strategy/*/*.docx|strategy/*/*.md|strategy/*/*.slides.md|\
  strategy/*/case-*.html|strategy/*/index.html|\
  examples/*/*.html|examples/*/*.css|examples/*/*.pptx|examples/*/*.pdf|\
  examples/*/*.docx|examples/*/*.md|examples/*/*.slides.md|\
  clients/*/*.html|clients/*/*.css|clients/*/*.pptx|clients/*/*.pdf|\
  clients/*/*.docx|clients/*/*.md|clients/*/*.slides.md|\
  clients/*/*/*.html|clients/*/*/*.css|clients/*/*/*.pptx|clients/*/*/*.pdf|\
  clients/*/*/*.docx|clients/*/*/*.md|clients/*/*/*.slides.md|\
  projects/*/*.html|projects/*/*.css|projects/*/*.pptx|projects/*/*.pdf|\
  projects/*/*.docx|projects/*/*.md|projects/*/*.slides.md|\
  cases/*/*.html|cases/*/*.css|cases/*/*.pptx|cases/*/*.pdf|\
  cases/*/*.docx|cases/*/*.md|cases/*/*.slides.md)
    MATCHED=1
    ;;
esac

# 環境変数 CONSULTINGOS_ORCHESTRATION_EXTRA_TARGETS で追加パターン上書き可（コロン区切り glob）
# OEM 提供時にクライアント別の対象パターン拡張に使用（PR AT 2026-05-06 物理化）
if [ "$MATCHED" -eq 0 ] && [ -n "${CONSULTINGOS_ORCHESTRATION_EXTRA_TARGETS:-}" ]; then
  IFS=':' read -ra EXTRA_PATTERNS <<< "$CONSULTINGOS_ORCHESTRATION_EXTRA_TARGETS"
  for PAT in "${EXTRA_PATTERNS[@]}"; do
    case "$REL_FILE" in
      $PAT) MATCHED=1; break ;;
    esac
  done
fi

if [ "$MATCHED" -eq 0 ]; then
  exit 0
fi

# エージェント起動履歴チェック（Claude Code projects ディレクトリ内の最近5分セッション）
# パス候補: ~/.claude/projects/<encoded-path>/ 配下の *.jsonl
# 2026-05-05 F-CRIT-1 修正: フォールバック ${HOME}/.claude/projects（プロジェクト全体走査）削除
# 別プロジェクトの履歴を拾う false negative リスク解消、PROJECT_HASH 厳格化 + ハイフン先頭バリアント追加
PROJECT_HASH=$(echo "$ROOT" | tr '/' '-' | sed 's/^-//')
SESSION_DIRS=(
  "${HOME}/.claude/projects/${PROJECT_HASH}"
  "${HOME}/.claude/projects/-${PROJECT_HASH}"
  "${HOME}/.claude/projects/$(basename "$ROOT")"
)

# PR AT 2026-05-06: AGENT_PATTERN 拡張（クリエイティブ系 5 + 戦略 / 調査 / 技術系 8 = 13 種）
AGENT_PATTERN='"subagent_type".*"(sales-deck-designer|frontend-dev|creative-director|ux-designer|brand-guardian|market-researcher|content-strategist|proposal-writer|strategy-lead|kpi-analytics|competitive-analyst|tech-lead|ai-engineer)"|"agent_name".*"(sales-deck-designer|frontend-dev|creative-director|ux-designer|brand-guardian|market-researcher|content-strategist|proposal-writer|strategy-lead|kpi-analytics|competitive-analyst|tech-lead|ai-engineer)"'

RECENT_AGENT=""
EDIT_COUNT=0
for SDIR in "${SESSION_DIRS[@]}"; do
  if [ -d "$SDIR" ]; then
    RECENT_AGENT=$(find "$SDIR" -name "*.jsonl" -mmin -5 \
      -exec grep -l -E "$AGENT_PATTERN" {} \; 2>/dev/null | head -1)
    # PR AT 2026-05-06: 連続 Edit カウント取得（直近 60 分以内の同一ファイル Edit/Write/MultiEdit 回数）
    LATEST_JSONL=$(find "$SDIR" -name "*.jsonl" -mmin -60 -print 2>/dev/null | head -1)
    if [ -n "$LATEST_JSONL" ]; then
      EDIT_COUNT=$(tail -n 2000 "$LATEST_JSONL" 2>/dev/null | \
        grep -cE "\"name\":\"(Edit|Write|MultiEdit)\".*\"file_path\":\"$FILE\"" 2>/dev/null || echo 0)
    fi
    if [ -n "$RECENT_AGENT" ]; then
      break
    fi
  fi
done

if [ -z "$RECENT_AGENT" ]; then
  # セッションログディレクトリ自体が存在しない環境でも動作させる
  # ログが見つからない = 起動履歴なし OR ログ検出不可
  # ログ検出不可の場合は false positive リスクがあるため stderr 警告 + exit 2 でブロック
  # PR AT 2026-05-06: 連続 Edit カウント表示 + 推奨エージェント拡張
  echo "BLOCKED: $FILE は案件成果物です（直近 60 分以内に同一ファイル Edit/Write/MultiEdit が ${EDIT_COUNT} 回検出、関連エージェント起動履歴は直近 5 分以内ゼロ）。CLAUDE.md ハードルール 17 違反（assistant 単独執筆モード）。次のいずれかを実施: 1. 起動推奨エージェント sales-deck-designer / frontend-dev / creative-director / ux-designer / brand-guardian / market-researcher / content-strategist / proposal-writer / strategy-lead / kpi-analytics / competitive-analyst / tech-lead / ai-engineer 2. 検出回避は CONSULTINGOS_ORCHESTRATION_BYPASS=1 で escape（一時退避用、常用禁止） 3. OEM 先で対象パターン拡張は CONSULTINGOS_ORCHESTRATION_EXTRA_TARGETS=glob1:glob2 で追加可。エージェント起動なしの assistant 単独 Write/Edit は ConsultingOS 存在意義違反 = evolution-log 記録義務。" >&2
  exit 2
fi

exit 0
