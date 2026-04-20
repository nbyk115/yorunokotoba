#!/bin/bash
# ConsultingOS installer — 新プロジェクトにワンコマンドで OS 導入
set -e

TARGET_DIR="${1:-.}"
SOURCE_REPO="https://github.com/nbyk115/consulting-os.git"
TMP_DIR="/tmp/ynk-consulting-os-$$"

echo "🧠 ConsultingOS インストール開始"
echo "対象ディレクトリ: $TARGET_DIR"

# 1. Clone ConsultingOS source
echo "📥 ソース取得..."
git clone --depth 1 "$SOURCE_REPO" "$TMP_DIR"

# 2. Copy core files
echo "📂 ファイルコピー..."
cp "$TMP_DIR/CLAUDE.md" "$TARGET_DIR/CLAUDE.md"
cp -r "$TMP_DIR/.claude" "$TARGET_DIR/.claude"

# 3. Clean project-specific leftovers
rm -rf "$TARGET_DIR/.claude/memory"
rm -f "$TARGET_DIR/.claude/codemap.md"
rm -f "$TARGET_DIR/.claude/settings.local.json"

# 4. Cleanup
rm -rf "$TMP_DIR"

echo ""
echo "✅ ConsultingOS インストール完了"
echo ""
echo "次のステップ:"
echo "1. Claude Code を再起動 (または /reset でコンテキスト再読込)"
echo "2. CLAUDE.md 末尾にプロジェクト固有情報を追加"
echo "   - currentDate"
echo "   - プロジェクト名/ICP/技術スタック"
echo ""
echo "構成:"
echo "  - 34 エージェント (Consulting/Service Dev/Product/Creative/Global/Marketing)"
echo "  - 22 スキル (反証モード/デバッグ/セキュリティ等)"
echo "  - 10 コマンド (/tdd /evolve /check-hallucination 等)"
echo "  - UserPromptSubmit hook (毎ターンルール注入)"
echo "  - 多層防御 (settings.json permissions.deny)"
