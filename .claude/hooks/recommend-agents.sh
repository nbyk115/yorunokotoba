#!/bin/bash
# UserPromptSubmit hook: ユーザープロンプトのキーワード分析 → 関連エージェント推奨
# Phase 5-1 実装: 2026-05-04
# 入力: stdin から JSON ペイロード（CLAUDE_USER_PROMPT 環境変数も参照）
# 出力: stdout に {"additionalContext": "..."} 形式
# 絵文字禁止（CLAUDE.md ハードルール 16 準拠）

set -e

# --- 環境変数 ---
# CONSULTINGOS_AGENT_ENFORCEMENT=off|suggest|warn|block（default: suggest）
# block モードでも UserPromptSubmit では exit 2 しない（物理ブロック責務は orchestration-block.sh に一元化）
ENFORCEMENT="${CONSULTINGOS_AGENT_ENFORCEMENT:-suggest}"

# off モードは即時通過
if [ "$ENFORCEMENT" = "off" ]; then
  exit 0
fi

# --- プロンプト取得 ---
# Claude Code は UserPromptSubmit フックに対して stdin へ JSON を渡す
# 形式: {"prompt": "ユーザー入力全文", ...}
STDIN_INPUT=$(cat 2>/dev/null || true)

# stdin から prompt キーを抽出
USER_PROMPT=""
if [ -n "$STDIN_INPUT" ]; then
  USER_PROMPT=$(echo "$STDIN_INPUT" | jq -r '.prompt // empty' 2>/dev/null || true)
fi

# stdin に prompt がなければ環境変数にフォールバック
if [ -z "$USER_PROMPT" ]; then
  USER_PROMPT="${CLAUDE_USER_PROMPT:-}"
fi

# プロンプトが空なら通過
if [ -z "$USER_PROMPT" ]; then
  exit 0
fi

# --- 短文スキップ（10文字未満: 雑談・確認質問への過剰起動防止）---
PROMPT_LEN=${#USER_PROMPT}
if [ "$PROMPT_LEN" -lt 10 ]; then
  exit 0
fi

# --- TSV ルーティング表のパス解決 ---
# git rev-parse でプロジェクトルートを特定
ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo "$(pwd)")
TSV="$ROOT/.claude/agents.routing.tsv"

# TSV が存在しなければ通過（false positive 防止）
if [ ! -f "$TSV" ]; then
  exit 0
fi

# --- キーワードマッチング + 連動エージェント収集（Phase 5-2）---
# TSV 形式: priority\tagent\tregex\tsecondary（ヘッダ行は # で始まる）
# secondary 列: 連動必須エージェントのカンマ区切り（4 兼務体制 / 佐藤裕介 3 変数交点準拠）
PRIMARY_AGENTS=$(
  while IFS=$'\t' read -r priority agent pattern secondary; do
    case "$priority" in
      \#*|"") continue ;;
    esac
    if [ -z "$agent" ] || [ -z "$pattern" ]; then
      continue
    fi
    if printf '%s' "$USER_PROMPT" | tr '\n' ' ' | grep -qiE -- "$pattern" 2>/dev/null; then
      printf '%s\t%s\t%s\n' "$priority" "$agent" "$secondary"
    fi
  done < "$TSV" | sort -t$'\t' -k1,1n
)

if [ -z "$PRIMARY_AGENTS" ]; then
  exit 0
fi

# Primary + Secondary を統合（重複排除、上位 8 件、佐藤裕介 4 兼務 + α）
ALL_AGENTS=$(
  printf '%s\n' "$PRIMARY_AGENTS" | awk -F'\t' '{print $2}'
  printf '%s\n' "$PRIMARY_AGENTS" | awk -F'\t' '{
    n = split($3, sec, ",")
    for (i = 1; i <= n; i++) {
      gsub(/^ +| +$/, "", sec[i])
      if (sec[i] != "") print sec[i]
    }
  }'
)
MATCHED_AGENTS=$(printf '%s\n' "$ALL_AGENTS" | awk 'NF && !seen[$0]++' | head -8)

# マッチなし → 推奨なし
if [ -z "$MATCHED_AGENTS" ]; then
  exit 0
fi

# --- エージェント一覧をリスト形式に整形 ---
AGENT_LIST=$(echo "$MATCHED_AGENTS" | awk '{print "- " $0}')

# 上位件数カウント
AGENT_COUNT=$(echo "$MATCHED_AGENTS" | wc -l | tr -d ' ')

# --- モード別メッセージ生成（Phase 5-4 簡易: 強い推奨化）---
# suggest: 強い推奨（Task tool 並列起動を明示）
# warn: 推奨 + 未起動 = ハードルール 17 違反明示
# block は UserPromptSubmit では exit 2 しない（PreToolUse の orchestration-block.sh に委譲）

if [ "$ENFORCEMENT" = "warn" ] || [ "$ENFORCEMENT" = "block" ]; then
  PREFIX="[ConsultingOS Orchestrator 起動義務・ハードルール 17]"
  ACTION_LINE="この依頼は assistant 単独実行禁止。以下のエージェントを Task tool で並列起動してください（最低 1 名以上、形式変換を伴う場合は必須）。未起動で Write/Edit すると orchestration-block.sh で物理ブロックされる可能性があります。"
else
  PREFIX="[ConsultingOS 関連エージェント推奨・佐藤裕介 4 兼務オーケストレーション]"
  ACTION_LINE="この依頼に対し以下のエージェント（Primary + Secondary 連動）を Task tool で並列起動することを強く推奨します。AI 会社化原則: 全依頼で関連リード・部署が連動稼働。"
fi

MSG="${PREFIX} 推奨エージェント（${AGENT_COUNT}件・優先度順）:

${AGENT_LIST}

${ACTION_LINE}"

# --- JSON 出力 ---
# jq で適切にエスケープして additionalContext を生成
jq -n --arg ctx "$MSG" '{"additionalContext": $ctx}'

exit 0
