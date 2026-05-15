#!/bin/bash
# Stop hook: assistant 応答完了時に応答内容を検証
# Phase 5-3 実装: 2026-05-05
# 70 点で出して実運用しながら改修（佐藤裕介流）
#
# 検知対象:
# 1. 禁止フレーズ（CLAUDE.md ハードルール 17）- 絞り込み錯覚 / orchestrator 規律違反シグナル
# 2. 反証チェック未付与（CLAUDE.md ハードルール 1）- 全アウトプット末尾必須
#
# 環境変数 CONSULTINGOS_STOP_ENFORCEMENT=off|warn|block （default: warn）
# 初期は警告運用、誤検知率検証後に block 移行判断

set -e

ENFORCEMENT="${CONSULTINGOS_STOP_ENFORCEMENT:-warn}"

# off モードは即時通過
if [ "$ENFORCEMENT" = "off" ]; then
  exit 0
fi

# stdin から JSON 受信（Stop hook 入力）
STDIN_INPUT=$(cat 2>/dev/null || true)

if [ -z "$STDIN_INPUT" ]; then
  exit 0
fi

# transcript_path 抽出
# SPECULATION: Claude Code Stop hook の stdin JSON フォーマットは公式ドキュメント未確認
# - transcript_path フィールドの存在: SPECULATION（v2.x 仕様、実装テストで確認）
# - jq でのトランスクリプト抽出: SPECULATION（transcript スキーマ非公開）
# - フォールバック: 取得失敗時は exit 0（false positive 防止 + SDK 仕様変更時の互換性）
# - 検証期日: 2026-05-12 までに stderr ログで実動作確認、結果を evolution-log 記録
TRANSCRIPT_PATH=$(echo "$STDIN_INPUT" | jq -r '.transcript_path // .transcriptPath // empty' 2>/dev/null)

# transcript の最終 assistant message を取得
LATEST_RESPONSE=""
if [ -n "$TRANSCRIPT_PATH" ] && [ -f "$TRANSCRIPT_PATH" ]; then
  # 2026-05-05 M7 修正: 長文応答（コンサル納品物等）の前半に禁止フレーズがある場合の検出漏れ防止
  LATEST_RESPONSE=$(jq -r 'select(.type == "assistant") | .message.content[]? | select(.type == "text") | .text' "$TRANSCRIPT_PATH" 2>/dev/null | tail -300)
fi

# transcript アクセス失敗時は通過（false positive 防止、SDK 仕様変更時の互換性確保）
if [ -z "$LATEST_RESPONSE" ]; then
  exit 0
fi

# --- 検知 1: 禁止フレーズ ---
FORBIDDEN_PHRASES=(
  "自分で書いた方が早い"
  "assistant 直接で書く方が早い"
  "単独で完結"
  "並列起動さえすれば完了"
  "形式変換だから例外"
)

DETECTED_PHRASES=""
for PHRASE in "${FORBIDDEN_PHRASES[@]}"; do
  if printf '%s' "$LATEST_RESPONSE" | grep -qF -- "$PHRASE" 2>/dev/null; then
    DETECTED_PHRASES="${DETECTED_PHRASES}  - ${PHRASE}"$'\n'
  fi
done

# --- 検知 2: 反証チェック未付与 ---
HAS_FALSIFICATION="yes"
if ! printf '%s' "$LATEST_RESPONSE" | grep -qE '反証チェック結果|Step 1.*自己反証|Step 2.*構造反証|Step 3.*実用反証|Step 4.*リスク即潰し' 2>/dev/null; then
  HAS_FALSIFICATION="no"
fi

# --- 検知 2.5: 反証 Step 3 narrative-only 検出（2026-05-05 PR #59 自己虚偽事象学習）---
# Step 3「実用反証」セクションを抽出し、コマンド実行痕跡（$ プレフィックス / 検証コマンド名 /
# 数値結果 / file:line 形式）が含まれない場合 = 形骸化警告（warn のみ、ブロックなし）
STEP3_BLOCK=$(printf '%s' "$LATEST_RESPONSE" | awk '
  /Step 3|実用反証/ { capture=1 }
  capture { print }
  /残存リスク|^---$|^## / && capture && NR>1 { capture=0 }
' 2>/dev/null | head -50)

STEP3_NARRATIVE_ONLY="no"
if [ "$HAS_FALSIFICATION" = "yes" ] && [ -n "$STEP3_BLOCK" ]; then
  if ! printf '%s' "$STEP3_BLOCK" | grep -qE '(\$\s|grep |wc |find |test |git log|git diff|pdffonts|unzip |jq |awk |sed |[0-9]+ 件|[0-9]+ 行|[a-zA-Z0-9_./-]+:[0-9]+)' 2>/dev/null; then
    STEP3_NARRATIVE_ONLY="yes"
  fi
fi

# --- 検知 3: 完了系キーワード × 検証コマンド未実行（HARD BLOCK・PR #59 虚偽再発防止）---
# 完了断言時、transcript を遡り検証コマンド実行ログがなければ exit 2
# 完了断言ガードキーワード（PR #65 で体系化、軸4 数値根拠の物理化）: 撲滅 / 残存ゼロ / 致命的 0 / 全件処理 / 統一済 / 修復済 / 達成 / クリア / 全件成功
COMPLETION_KEYWORDS='撲滅|残存ゼロ|致命的 0|全件処理|統一済|修復済|達成|クリア|全件成功'
COMPLETION_CLAIM="no"
if printf '%s' "$LATEST_RESPONSE" | grep -qE '撲滅|残存ゼロ|致命的 0|全件処理|統一済|修復済' 2>/dev/null; then
  COMPLETION_CLAIM="yes"
fi

# 例外: ユーザーが「強制マージ」「検証スキップ」「実測なし許可」明示時は通過
USER_OVERRIDE="no"
if [ -n "$TRANSCRIPT_PATH" ] && [ -f "$TRANSCRIPT_PATH" ]; then
  RECENT_USER=$(jq -r 'select(.type == "user") | .message.content // empty' "$TRANSCRIPT_PATH" 2>/dev/null | tail -20)
  if printf '%s' "$RECENT_USER" | grep -qE '強制マージ|検証スキップ|実測なし許可' 2>/dev/null; then
    USER_OVERRIDE="yes"
  fi
fi

VERIFICATION_MISSING="no"
if [ "$COMPLETION_CLAIM" = "yes" ] && [ "$USER_OVERRIDE" = "no" ] && [ -n "$TRANSCRIPT_PATH" ] && [ -f "$TRANSCRIPT_PATH" ]; then
  RECENT_BASH=$(jq -r 'select(.type == "assistant") | .message.content[]? | select(.type == "tool_use" and .name == "Bash") | .input.command // empty' "$TRANSCRIPT_PATH" 2>/dev/null | tail -30)
  if ! printf '%s' "$RECENT_BASH" | grep -qE '(^|[ /;|&])(grep|wc|find|test|git log|git diff|pdffonts|unzip)' 2>/dev/null; then
    VERIFICATION_MISSING="yes"
  fi
fi

# --- 結果判定 ---
HAS_VIOLATION="no"
HARD_BLOCK="no"
if [ -n "$DETECTED_PHRASES" ] || [ "$HAS_FALSIFICATION" = "no" ] || [ "$STEP3_NARRATIVE_ONLY" = "yes" ]; then
  HAS_VIOLATION="yes"
fi
if [ "$VERIFICATION_MISSING" = "yes" ]; then
  HAS_VIOLATION="yes"
  HARD_BLOCK="yes"
fi

if [ "$HAS_VIOLATION" = "no" ]; then
  exit 0
fi

# --- 違反警告メッセージ生成 ---
WARNING_MSG="[ConsultingOS Stop hook 違反検知]"$'\n'

if [ -n "$DETECTED_PHRASES" ]; then
  WARNING_MSG="${WARNING_MSG}禁止フレーズ検出（CLAUDE.md ハードルール 17）:"$'\n'
  WARNING_MSG="${WARNING_MSG}${DETECTED_PHRASES}"
  WARNING_MSG="${WARNING_MSG}これらは絞り込み錯覚 / orchestrator 規律違反のシグナルです。次回応答で関連エージェント並列起動 + 反証 Step 1-4 必須。"$'\n'
fi

if [ "$HAS_FALSIFICATION" = "no" ]; then
  WARNING_MSG="${WARNING_MSG}反証チェック未付与検出（CLAUDE.md ハードルール 1）: 全アウトプット末尾に【反証チェック結果】Step 1-4（Step 4 = リスク即潰し）必須。省略・形骸化禁止。"$'\n'
fi

if [ "$STEP3_NARRATIVE_ONLY" = "yes" ]; then
  WARNING_MSG="${WARNING_MSG}反証 Step 3 形骸化検出: 実用反証セクションにコマンド出力痕跡が見当たりません。\$ プレフィックス / grep / wc / find / git log / 数値結果 / file:line を必ず添付してください（PR #59 em ダッシュ虚偽 370 件残存事象の再発防止・falsification-check.md §4.2）。"$'\n'
fi

if [ "$VERIFICATION_MISSING" = "yes" ]; then
  WARNING_MSG="${WARNING_MSG}[HARD BLOCK] 完了系キーワード（撲滅 / 残存ゼロ / 致命的 0 / 全件処理 / 統一済 / 修復済）を検出しましたが、直近 30 ターン以内に grep / wc / find / test / git log / git diff / pdffonts / unzip 等の検証コマンド実行ログが見つかりません。完了断言には実測コマンド + 結果添付必須（PR #59 em ダッシュ虚偽 370 件残存事象の再発防止）。検証コマンドを実行してから再度応答するか、ユーザー承認下で「強制マージ」「検証スキップ」「実測なし許可」明示で通過してください。"$'\n'
fi

# --- 出力 ---
echo "$WARNING_MSG" >&2

# HARD_BLOCK は ENFORCEMENT モードに関わらず block（虚偽再発防止が最優先）
if [ "$HARD_BLOCK" = "yes" ]; then
  exit 2
fi

if [ "$ENFORCEMENT" = "block" ]; then
  exit 2
fi

# warn モードは exit 0 で通過、stderr 警告のみ
exit 0
