#!/bin/bash
# UserPromptSubmit hook: 毎ターン強制ルール注入 + 短文化要求検知時の規律強化

# 2026-05-05 C2 修正: stdin の JSON から prompt 抽出（v2.x 仕様対応）
STDIN_INPUT=$(cat 2>/dev/null || true)
USER_PROMPT=""
if [ -n "$STDIN_INPUT" ]; then
  USER_PROMPT=$(echo "$STDIN_INPUT" | jq -r '.prompt // empty' 2>/dev/null || true)
fi
if [ -z "$USER_PROMPT" ]; then
  USER_PROMPT="${CLAUDE_USER_PROMPT:-}"
fi

# 短文化要求検知（規律省略誘惑が発生しやすいパターン）
SHORT_REQUEST_DETECTED=""
if echo "$USER_PROMPT" | grep -qE '端的|短く|1行で|文章で|スクリーニング|簡潔に|要約|まとめて|短文|圧縮'; then
  SHORT_REQUEST_DETECTED="\n\nBLOCKED:【短文化要求検知】規律省略の誘惑が発生しやすい状況です。短文・端的・スクリーニング・1 行回答でも【反証チェック結果】Step 1-4（Step 4 = リスク即潰し）の省略は禁止（圧縮版 2-3 行は可、完全省略のみ禁止）。出典なし具体数値の断言も禁止（FACT/INFERENCE/SPECULATION 3 ラベル明示必須）。"
fi

cat << JSONEOF
{"additionalContext": "【毎ターン強制ルール】\n1. 外科的変更: 依頼の範囲を超えない。隣接物を勝手に直さない。差分を最小化。\n2. トークン効率: Edit直接変更 > Grep/Glob > Read行範囲指定。同じ検索を繰り返さない。\n3. セキュリティ: .env/credentials/secretの読み取り禁止。force push禁止。外部APIへのPOST/PUT/DELETEは承認必須。\n4. IMPORTANT: 反証モード厳守（2026-05-01 違反学習）: 全応答末尾に【反証チェック結果】Step 1-4（Step 4 = リスク即潰し）必須。短文・端的・スクリーニング・1行・文章形式要求でも省略禁止（圧縮版2-3行は可）。\n5. 出典管理3ラベル: 出典なし具体数値（X割/X%/金額/年次予測）の断言禁止。FACT/INFERENCE/SPECULATIONを明示。出典持たない場合は『業界調査により幅あり』『個人見立て』と明記。\n6. クライアント納品物・コンサル回答時は特に4-5を厳守。短文化要求でも規律省略は不可。\n7. REQUIRED: 日本語字形検証必須（2026-05-01 違反学習）: PDF/DOCX/PPTX 生成タスクではスタイル指定だけで満足するな。生成後に必ず pdffonts（PDF）/ unzip+grep w:lang（DOCX）/ unzip+grep lang（PPTX）で埋込フォント・ロケールを機械検証してから納品。\n8. FORMAT: 出力フォーマット規律（2026-05-01 学習）: ① Markdown 太字 \`**\` 全面禁止（強調は「」or 大文字英語キーワードで代替）／ ② 一文中の改行禁止（句読点での改行 NG）／ ③ 表は Word/PPT で中央揃え必須／ ④ PPT/PDF はページシート内に必ず収める（はみ出し禁止）／ ⑤ 出力直前に佐藤裕介 W チェック（1 周目内容 + 2 周目形式）を必ず実施。\n9. BLOCKED: main 直接 push 禁止（2026-05-02 違反学習・物理ブロック）: CLAUDE.md ハードルール 7 厳守。feature branch + PR + Squash and merge を例外なく徹底。直接 push は PreToolUse hook で物理ブロック済み。${SHORT_REQUEST_DETECTED}"}
JSONEOF

