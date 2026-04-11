#!/bin/bash
# ConsultingOS セットアップスクリプト
# 任意のリポジトリに .claude/ (エージェント + スキル) と CLAUDE.md をコピーする
#
# 使い方:
#   ./setup-consulting-os.sh /path/to/target-repo
#   ./setup-consulting-os.sh .   ← カレントディレクトリ

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET="${1:-.}"

if [ ! -d "$TARGET" ]; then
  echo "❌ ディレクトリが見つかりません: $TARGET"
  exit 1
fi

TARGET="$(cd "$TARGET" && pwd)"

echo "📦 ConsultingOS をセットアップします"
echo "   ソース: $SCRIPT_DIR"
echo "   ターゲット: $TARGET"
echo ""

# .claude/ ディレクトリをコピー
if [ -d "$SCRIPT_DIR/.claude" ]; then
  cp -r "$SCRIPT_DIR/.claude" "$TARGET/.claude"
  echo "✅ .claude/ (agents + skills + settings.json) をコピーしました"
else
  echo "❌ .claude/ がソースに見つかりません"
  exit 1
fi

# CLAUDE.md をコピー
if [ -f "$SCRIPT_DIR/CLAUDE.md" ]; then
  cp "$SCRIPT_DIR/CLAUDE.md" "$TARGET/CLAUDE.md"
  echo "✅ CLAUDE.md をコピーしました"
else
  echo "⚠️  CLAUDE.md がソースに見つかりません（スキップ）"
fi

echo ""
echo "🎉 セットアップ完了！"
echo "   ターゲットリポで Claude Code を起動すれば ConsultingOS が有効になります。"
echo ""
echo "   コピーされたファイル:"
find "$TARGET/.claude" -name "*.md" | sort | while read f; do
  echo "     $f"
done
[ -f "$TARGET/CLAUDE.md" ] && echo "     $TARGET/CLAUDE.md"
