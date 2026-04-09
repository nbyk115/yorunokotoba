---
name: security-scan
description: コードベースのセキュリティ一括監査（OWASP/シークレット/CVE）。「セキュリティチェックして」「脆弱性スキャン」「シークレットが漏れてないか確認」「セキュリティ監査」と言われたとき。ハードコードシークレット・OWASP Top 10・依存関係CVE・設定ファイルを検出してリスクレポートを出力する。
effort: high
context: fork
agent: Explore
allowed-tools: Read Grep Glob Bash(find *) Bash(cat *) Bash(grep *)
---

## スキャン前情報（自動取得）
- .envファイル一覧: !`find . -name ".env*" -not -path "*/node_modules/*" -maxdepth 4 2>/dev/null | head -15`
- シークレット候補ファイル: !`grep -rl "password\|secret\|api_key\|token\|private_key" --include="*.js" --include="*.ts" --include="*.py" --include="*.env" . 2>/dev/null | grep -v "node_modules\|\.git\|test\|spec" | head -15`
- package.json 依存関係: !`cat package.json 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); deps={**d.get('dependencies',{}),**d.get('devDependencies',{})}; [print(f'{k}@{v}') for k,v in deps.items()]" 2>/dev/null | head -30`

# /security-scan — セキュリティスキャン

コードベース全体をスキャンし、以下のセキュリティリスクを検出・報告してください。

## チェック項目

### 1. ハードコードされたシークレット
- API キー、トークン、パスワードが直書きされていないか
- `.env` ファイルが `.gitignore` に含まれているか

### 2. OWASP Top 10
- SQLインジェクション（生SQL、テンプレートリテラル内のSQL）
- XSS（dangerouslySetInnerHTML、sanitize未使用の入力表示）
- CSRF（トークン未使用のPOST/PUT/DELETE）
- 認証・認可の不備

### 3. 依存関係
- `package.json` / `requirements.txt` の既知CVE（バージョン確認）
- ロックファイルの存在確認

### 4. 設定ファイル
- CORS設定（`*` の使用）
- デバッグモードが本番で有効になっていないか
- HTTPS強制の設定

## 出力
| 重要度 | ファイル:行 | 問題 | 推奨修正 |
|---|---|---|---|

重要度: 🔴 Critical / 🟠 High / 🟡 Medium / 🔵 Low
