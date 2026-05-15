#!/bin/bash
# PostToolUse hook: 案件成果物 (.slides.md / .html / .pptx / .css) 生成時に
# 必須テンプレート要素 (.claude/templates/<agent>/ 配下) が含まれているか grep 検証
# PR AV 2026-05-06 物理化: skill が「規約集」止まりから「実装テンプレ」に進化させる構造強制
#
# 環境変数 CONSULTINGOS_TEMPLATE_INJECTION_CHECK=off で無効化可（OEM 先で運用前検証）
# default: warn モード（block でなく stderr 警告のみ、誤検出最小化）

set -e

# 無効化フラグ
if [ "${CONSULTINGOS_TEMPLATE_INJECTION_CHECK:-warn}" = "off" ]; then
  exit 0
fi

FILE=$(echo "$CLAUDE_TOOL_INPUT" | jq -r '.file_path // .filePath // empty' 2>/dev/null)
CONTENT=$(echo "$CLAUDE_TOOL_INPUT" | jq -r '.content // .new_string // empty' 2>/dev/null)

# ファイルパス未取得・コンテンツ未取得は通過（false positive 防止）
if [ -z "$FILE" ] || [ -z "$CONTENT" ]; then
  exit 0
fi

ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo "$(pwd)")
REL_FILE="${FILE#$ROOT/}"

# 規律定義書 (.claude/ / docs/) は対象外（テンプレ配置先 / 規律ドキュメント）
case "$REL_FILE" in
  .claude/*|docs/*|tests/*|evolution-log.md|CLAUDE.md|ICP.md|DESIGN.md)
    exit 0
    ;;
esac

WARNINGS=""

# Marp slides 検証 (sales-deck-designer 必須)
case "$FILE" in
  *.slides.md|*.marp.md)
    # frontmatter 必須キー
    if ! echo "$CONTENT" | head -20 | grep -q "^marp: true"; then
      WARNINGS="${WARNINGS}- marp: true frontmatter 欠落（.claude/templates/sales-deck-designer/marp-frontmatter.md 参照）\n"
    fi
    if ! echo "$CONTENT" | head -20 | grep -qE "^lang: (ja|ja-JP)"; then
      WARNINGS="${WARNINGS}- lang: ja frontmatter 欠落（CLAUDE.md ハードルール 10、中国字形フォールバック禁止）\n"
    fi
    # word-break: auto-phrase 必須（関根さん案件再発防止）
    if ! echo "$CONTENT" | grep -qE "word-break:\s*(auto-phrase|keep-all)"; then
      WARNINGS="${WARNINGS}- word-break: auto-phrase 欠落（.claude/templates/sales-deck-designer/marp-required.css 参照、関根さん案件改行不具合の再発防止）\n"
    fi
    ;;
esac

# HTML 検証 (frontend-dev 必須)
case "$FILE" in
  *.html|*.htm)
    if ! echo "$CONTENT" | grep -qE 'lang="(ja|ja-JP)"'; then
      WARNINGS="${WARNINGS}- lang=\"ja\" 属性欠落（CLAUDE.md ハードルール 10、.claude/templates/frontend-dev/html-required.html 参照）\n"
    fi
    if ! echo "$CONTENT" | grep -qE '<meta[^>]*viewport'; then
      WARNINGS="${WARNINGS}- viewport meta 欠落（レスポンシブ対応必須、.claude/templates/frontend-dev/html-required.html 参照）\n"
    fi
    ;;
esac

# CSS 検証 (sales-deck-designer / frontend-dev 必須)
case "$FILE" in
  *.css)
    # 日本語フォント指定があり、かつ Noto Sans CJK 無印 / Source Han Sans 無印が含まれる場合は警告
    if echo "$CONTENT" | grep -qE 'font-family.*[一-龯]' && \
       echo "$CONTENT" | grep -qE '(Noto Sans CJK[^J]|Source Han Sans[^J]|SimSun)'; then
      WARNINGS="${WARNINGS}- 中国字形フォールバック検出（Noto Sans CJK 無印 / Source Han Sans 無印 / SimSun は使用禁止、CLAUDE.md ハードルール 10、JP サフィックス付きを使用）\n"
    fi
    ;;
esac

# 警告出力
if [ -n "$WARNINGS" ]; then
  echo "[ConsultingOS テンプレ注入検証 警告: $REL_FILE]" >&2
  echo -e "$WARNINGS" >&2
  echo "詳細: .claude/templates/<agent>/ 配下の必須テンプレを参照、欠落要素を補完してください。誤検出時は CONSULTINGOS_TEMPLATE_INJECTION_CHECK=off で無効化可（PR AV 2026-05-06 物理化）。" >&2
fi

# warn モード（exit 0 で通過、stderr 警告のみ）
exit 0
