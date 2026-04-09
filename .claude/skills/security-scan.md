# Security Scan — Claude Code設定セキュリティ監査スキル

## 概要
`.claude/` ディレクトリ全体を対象に、102のセキュリティルール・1,282テストで脆弱性と
設定ミスを検出する。シークレット漏洩・権限過多・プロンプトインジェクション・
サプライチェーンリスクを重大度A〜Fでグレーディング。
出典: affaan-m/everything-claude-code (AgentShield)

---

## §1 スキャン対象ファイル

```
.claude/
├── CLAUDE.md（ローカル・グローバル）
├── settings.json / settings.local.json
├── agents/*.md
├── skills/*.md
├── hooks/（スクリプト含む）
└── mcp-servers設定
```

---

## §2 検出カテゴリ（5種）

### 1. シークレット・認証情報
| パターン | 例 |
|---|---|
| ハードコードAPIキー | `sk-...`, `ghp_...`, `AKIA...` |
| パスワード直書き | `password=abc123` |
| トークン漏洩 | Bearer token を設定ファイルに記載 |

### 2. 権限過多
| 問題 | リスク |
|---|---|
| `allowedTools: ["*"]` または過剰な全許可 | 任意コマンド実行リスク |
| Bash無制限許可 | ファイル削除・ネットワーク操作が無制限 |
| `--dangerously-skip-permissions` | 全ゲートバイパス |

### 3. コマンドインジェクション
```
hooks内の未サニタイズ変数展開
例: eval "$USER_INPUT"  → インジェクション可能
```

### 4. プロンプトインジェクション
```
スキルファイル内の悪意ある指示パターン:
- "ignore previous instructions"
- "you are now DAN"
- ユーザー入力をそのままスキルテキストに埋め込む構造
```

### 5. サプライチェーンリスク
```
MCPサーバー設定:
- 未検証のnpmパッケージ
- 外部URLを直接実行するスクリプト
- バージョン固定なしの依存関係
```

---

## §3 重大度グレーディング

| グレード | 意味 | 対応 |
|---|---|---|
| **A** | セキュア | 問題なし |
| **B** | 軽微なリスク | 余裕があれば対応 |
| **C** | 中程度リスク | 次のスプリントで対応 |
| **D** | 重大なリスク | 今週中に対応 |
| **E** | 深刻な脆弱性 | 今すぐ対応 |
| **F** | 致命的脆弱性 | 即時停止・修正 |

---

## §4 手動スキャンチェックリスト

AgentShieldが使えない環境での手動実行手順:

```bash
# Step 1: シークレット検索
grep -r "sk-\|ghp_\|AKIA\|password\s*=\|token\s*=" .claude/ --include="*.md" --include="*.json"

# Step 2: 権限チェック
grep -r "allowedTools\|bypassPermissions\|skip-permissions" .claude/

# Step 3: プロンプトインジェクション検索
grep -ri "ignore.*instruction\|you are now\|jailbreak\|DAN" .claude/skills/ .claude/agents/

# Step 4: 外部URL実行チェック
grep -r "curl\|wget\|fetch\|npm install" .claude/hooks/

# Step 5: MCP検証
cat .claude/settings.json | python3 -c "
import json,sys
data=json.load(sys.stdin)
mcps = data.get('mcpServers', {})
for name, cfg in mcps.items():
    cmd = cfg.get('command','')
    args = cfg.get('args',[])
    print(f'MCP: {name} | {cmd} {args}')
"
```

---

## §5 自動スキャン（AgentShield CLI）

```bash
# 基本スキャン
npx ecc-agentshield scan

# 詳細スキャン（Claude Opus 4.6 パイプライン）
npx ecc-agentshield scan --opus

# Markdown形式でレポート出力
npx ecc-agentshield scan --format markdown > .claude/security-report.md

# CI/CD統合（GitHub Actions）
# .github/workflows/security.yml に追加
```

---

## §6 スキャンタイミング

```
必須:
✅ 新規Claude Codeプロジェクトのセットアップ時
✅ .claude/ 設定ファイル変更後
✅ 新しいMCPサーバーを追加した後
✅ 新しいスキル・エージェントを外部から取り込む前

推奨:
◎ 月次定期スキャン（claude-healthと同時実行）
◎ 新規エージェントを外部リポジトリから追加する際
```

---

## §7 ConsultingOS適用エージェント

| エージェント | 使用場面 |
|---|---|
| orchestrator | 月次セキュリティ監査（claude-healthと同時実行） |
| tech-lead | 外部スキル取り込み前の事前チェック |
| infra-devops | CI/CD パイプラインへのAgentShield統合 |
