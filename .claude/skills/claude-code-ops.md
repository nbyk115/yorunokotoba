# Claude Code Ops — 運用・自動化・パフォーマンス最適化

## 概要
Claude Codeの性能を最大化するための運用ガイド。
Hooks・MCP管理・並列ワークフロー・コンテキスト管理を網羅する。

---

## 1. Hooks（自動化トリガー）

Hooksはツール呼び出しやライフサイクルイベントに紐づく自動処理。
settings.jsonに定義する。

### Hook種別

| Hook | タイミング | 用途 |
|---|---|---|
| **PreToolUse** | ツール実行前 | バリデーション・警告・ブロック |
| **PostToolUse** | ツール実行後 | フォーマット・フィードバック |
| **UserPromptSubmit** | メッセージ送信時 | 入力チェック・コンテキスト付加 |
| **Stop** | Claude応答完了時 | 品質チェック・残タスク確認 |
| **PreCompact** | コンテキスト圧縮前 | 重要情報の保全 |

### ConsultingOS推奨Hooks

#### PostToolUse: TypeScript/TSX編集後にPrettier自動実行
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "file=$(echo \"$CLAUDE_TOOL_INPUT\" | jq -r '.file_path // empty'); if [[ \"$file\" == *.ts || \"$file\" == *.tsx ]]; then npx prettier --write \"$file\" 2>/dev/null; fi"
          }
        ]
      }
    ]
  }
}
```

#### PreToolUse: 長時間コマンド実行前にtmux警告
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "cmd=$(echo \"$CLAUDE_TOOL_INPUT\" | jq -r '.command // empty'); if echo \"$cmd\" | grep -qE '(npm run dev|yarn dev|next dev|uvicorn|gunicorn)'; then echo 'WARN: 長時間コマンドです。tmux内で実行してください。' >&2; fi"
          }
        ]
      }
    ]
  }
}
```

#### Stop: console.log残留チェック
```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "count=$(grep -r 'console\\.log' src/ --include='*.ts' --include='*.tsx' -l 2>/dev/null | grep -v test | grep -v spec | wc -l); if [ \"$count\" -gt 0 ]; then echo \"⚠️ console.logが${count}ファイルに残っています\"; fi"
          }
        ]
      }
    ]
  }
}
```

#### Stop: ブランドガイドライン違反チェック
```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "if git diff --cached --name-only 2>/dev/null | grep -qE '\\.(md|html|tsx)$'; then echo 'REMINDER: コンテンツファイルが変更されています。ブランドガイドライン準拠を確認してください。'; fi"
          }
        ]
      }
    ]
  }
}
```

---

## 2. MCP・Plugin管理（コンテキスト節約が最重要）

### 鉄則: コンテキストウィンドウは命

> MCPを入れすぎると200kのコンテキストが実質70kまで縮小する。
> パフォーマンスに直結するため管理が超重要。

### 管理ルール

| ルール | 内容 |
|---|---|
| **常時有効は5〜6個まで** | ツール総数80以下を目安 |
| **プロジェクト単位で制御** | `disabledMcpServers` で不要なMCPを無効化 |
| **使っていないものは即オフ** | 定期的に `/mcp` で状態確認 |
| **APIで足りるならMCP不要** | MCP=プロンプト駆動の柔軟連携。単純なAPI呼び出しならBashで十分 |

### ConsultingOS推奨MCP構成

| MCP | 用途 | 常時有効 |
|---|---|---|
| **Supabase** | DB操作・テーブル管理 | ✅（開発時） |
| **Figma** | デザイン→コード変換 | ❌（Creative作業時のみ） |
| **GitHub** | PR・Issue操作 | ✅ |
| **Slack** | チーム通知 | ❌（必要時のみ） |
| **Sentry** | エラー監視 | ❌（デバッグ時のみ） |
| **Browser Use** | ブラウザ自動化・CDP直接接続 | ❌（調査・テスト時のみ） |

### 設定例
```json
{
  "mcpServers": {
    "supabase": { "command": "npx", "args": ["-y", "@supabase/mcp"] },
    "figma": { "command": "npx", "args": ["-y", "figma-developer-mcp"] }
  },
  "disabledMcpServers": ["figma", "slack", "sentry", "browser-use"]
}
```

---

## 3. 並列ワークフロー

### /fork: 会話を分岐して並列タスクを非干渉で実行
```
メインセッション: API設計・実装
  → /fork → フォーク1: テスト作成
  → /fork → フォーク2: ドキュメント更新
```
- 各フォークは独立したコンテキストで動作
- メインセッションのコンテキストを汚さない
- 完了後にメインに戻って統合

### git worktree: ブランチ並列作業
```bash
# メインの作業ディレクトリとは別に、独立したチェックアウトを作成
git worktree add ../project-feature-a feature/auth
git worktree add ../project-feature-b feature/payment

# それぞれ別のClaude Codeセッションを起動
cd ../project-feature-a && claude
cd ../project-feature-b && claude
```
- コンフリクトなく複数機能を並列開発
- 各worktreeに別々のClaudeインスタンスを割り当て

### tmux: 長時間コマンドのデタッチ
```bash
# 新しいtmuxセッションでサーバー起動
tmux new-session -d -s dev "npm run dev"

# 別のペインでClaude作業
tmux new-session -d -s claude "claude"

# 後からログ確認
tmux attach -t dev
```

---

## 4. コンテキスト管理

### /compact: 手動コンテキスト圧縮
長いセッションで応答が遅くなったら `/compact` を実行。
重要な情報はCLAUDE.mdやスキルファイルに残っているため、圧縮しても失われない。

### /rewind & /checkpoints: 巻き戻し
- `/rewind`: 会話を以前の状態に巻き戻し
- `/checkpoints`: ファイル単位のUndo管理

### コードマップの活用
`/codemap` コマンドで `.claude/codemap.md` を生成しておくと、
巨大コードベースでもコンテキストを消費せずにClaudeがナビゲートできる。

---

## 5. ショートカット早見表

| キー | 機能 |
|---|---|
| `Ctrl+U` | 1行丸ごと削除 |
| `!` | bashコマンドをクイック実行 |
| `@` | ファイルをインクリメンタル検索 |
| `/` | スラッシュコマンド起動 |
| `Shift+Enter` | 複数行入力 |
| `Tab` | 思考表示の切り替え |
| `Esc Esc` | Claude中断 & コード復元 |

---

## 適用エージェント
全24エージェント共通（運用基盤）
