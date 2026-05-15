# Hooks / Monitor / Routines 詳細: 4 自動化軸の実装

> **先回りで設定しない。実需が出てから設定する。**

---

## 1. Hooks（自動化トリガー）

Hooks はツール呼び出しやライフサイクルイベントに紐づく自動処理。`settings.json` に定義する。

### Hook 種別

| Hook | タイミング | 用途 |
|---|---|---|
| **PreToolUse** | ツール実行前 | バリデーション・警告・ブロック |
| **PostToolUse** | ツール実行後 | フォーマット・フィードバック |
| **UserPromptSubmit** | メッセージ送信時 | 入力チェック・コンテキスト付加 |
| **Stop** | Claude 応答完了時 | 品質チェック・残タスク確認 |
| **PreCompact** | コンテキスト圧縮前 | 重要情報の保全 |

### Exit Code 仕様

| Exit Code | 意味 |
|---|---|
| `0` | allow（処理を継続） |
| `2` | block（処理を停止） |

→ PreToolUse で `exit 2` を返すと該当ツール呼び出しがブロックされる。安全ゲートとして利用する。

### ConsultingOS 推奨 Hooks

#### PostToolUse: TypeScript/TSX 編集後に Prettier 自動実行
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

#### PreToolUse: 長時間コマンド実行前に tmux 警告
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

#### Stop: console.log 残留チェック
```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "count=$(grep -r 'console\\.log' src/ --include='*.ts' --include='*.tsx' -l 2>/dev/null | grep -v test | grep -v spec | wc -l); if [ \"$count\" -gt 0 ]; then echo \"console.logが${count}ファイルに残っています\"; fi"
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

## 2. Monitor（イベント駆動型バックグラウンド監視）

> **`sleep` ポーリングを廃止し、イベント発火で即反応する効率的な監視。トークンを大幅に節約する。**

### Monitor とは
バックグラウンドでプロセスの出力（stdout）を監視し、**条件に合致した行が出た瞬間に Claude を起こす**仕組み。`sleep` ループや `/loop` によるポーリングと違い、何も起きていない間はトークンを消費しない。

### 基本パターン
```
Monitor({
  command: "tail -f /var/log/app.log",
  pattern: "ERROR|CRITICAL|FATAL",
  description: "アプリログのエラー監視"
})
```

### ConsultingOS 活用シーン

| シーン | 監視コマンド | パターン | 起動エージェント |
|---|---|---|---|
| デプロイ監視 | `tail -f deploy.log` | `ERROR\|FAILED\|ROLLBACK` | infra-devops |
| テスト実行 | `npm test 2>&1` | `FAIL\|Error` | fullstack-dev |
| ビルド監視 | `npm run build 2>&1` | `error\|BUILD FAILED` | frontend-dev |
| CI/CD結果 | `gh run watch` | `completed\|failure` | infra-devops |
| サーバーログ | `docker logs -f app` | `500\|503\|timeout` | tech-lead |
| DB監視 | `tail -f slow-query.log` | `Query_time: [0-9]{2,}` | fullstack-dev |

### Monitor vs 従来手法

| 項目 | sleep ループ | /loop | Monitor |
|---|---|---|---|
| トークン消費 | 毎回フル消費 | 定期的に消費 | イベント時のみ |
| 反応速度 | sleep 間隔依存 | 間隔依存 | 即時（行単位） |
| 用途 | 汎用 | 定期チェック | ログ・ストリーム監視 |
| 推奨 | 非推奨 | 定期レポート向き | リアルタイム監視向き |

### 使い分けガイド
```
監視タスクが来たら:
├─ 「定期的に結果を見たい」→ /loop
├─ 「何か起きたら即教えて」→ Monitor
└─ 「1回だけ完了を待ちたい」→ Bash の run_in_background
```

### 障害対応での活用
```
1. 障害発生 → tech-lead が SEV判定
2. Monitor 起動:
   - Monitor(command: "kubectl logs -f pod/app", pattern: "ERROR|OOM|CrashLoop")
   - Monitor(command: "curl -s -o /dev/null -w '%{http_code}' https://app.example.com", pattern: "^[45]")
3. Monitor が異常検知 → 即原因仮説の検証
4. 修正デプロイ後も Monitor 継続 → 再発確認
5. 30 分異常なし → Monitor 停止 → ポストモーテム
```

---

## 3. Dynamic Looping（動的ループ）

> **間隔を指定せず `/loop` だけ打てば、Claude が最適な間隔を自動判断する。**

```bash
# 従来: 自分で間隔を指定
/loop 5m check for feedback in bug-hunter channel

# Dynamic Looping: Claude が自動で間隔決定
/loop check for feedback in bug-hunter channel
  → 「最初のチェックは5分後」と判断
  → 静かなら「次は20分後にバックオフ」自動調整
  → 活動が多ければ間隔短縮
```

- **効果**: 無駄な定期チェック激減、トークン節約 + レスポンス爆速
- **使いどころ**: 大規模監視・CI チェック・フィードバック監視
- **ConsultingOS 適合**: growth-hacker の A/B テスト監視、infra-devops の本番監視、client-success のヘルススコア定期チェック

---

## 4. 並列ワークフロー

### /fork: 会話を分岐して並列タスクを非干渉で実行
```
メイン: API 設計・実装
  → /fork → フォーク1: テスト作成
  → /fork → フォーク2: ドキュメント更新
```
- 各フォークは独立コンテキスト
- メインのコンテキストを汚さない
- 完了後にメインに戻って統合

### git worktree: ブランチ並列作業
```bash
git worktree add ../project-feature-a feature/auth
git worktree add ../project-feature-b feature/payment

cd ../project-feature-a && claude
cd ../project-feature-b && claude
```

### tmux: 長時間コマンドのデタッチ
```bash
tmux new-session -d -s dev "npm run dev"
tmux new-session -d -s claude "claude"
tmux attach -t dev
```

### /ultraplan: Web 上で計画立案 → ローカルで実行
- **/plan との違い**: /plan はターミナル一体、/ultraplan は計画を Web に分離
- **使い分け**: `/plan` 小〜中規模 / `/ultraplan` 大規模・並行作業必要時
- **ConsultingOS 適合**: Consulting 系（調査・戦略立案）を Web 側に逃がし、Service Dev 系（実装）はローカル並行

---

## 5. Agent Teams（セッション間チーム協調）

> **複数の Claude Code セッションがチームとして協調動作する実験的機能。**

### 有効化
```json
{
  "env": { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" }
}
```
> Claude Code v2.1.32 以降必須。

### サブエージェント vs Agent Teams

| | サブエージェント | Agent Teams |
|---|---|---|
| **通信** | 結果を呼び出し元に返すのみ | チームメイト同士が直接通信 |
| **適用** | 集中した単発タスク | 議論・反証・協調が必要な複雑タスク |
| **トークン** | 低 | 高 |

### 推奨チーム構成

#### パターンA: デバッグ・バグ修正チーム（★最重要）
```
チームメイト1: フロントエンド調査
チームメイト2: バックエンド調査
チームメイト3: テスト・再現確認
チームメイト4: デビルズアドボケイト（仮説を反証）
```

#### パターンB: コードレビュー・品質チーム
```
1: セキュリティ / 2: パフォーマンス / 3: テストカバレッジ
```

#### パターンC: デザイン・UI/UX 検証チーム
```
1: UX フロー / 2: レスポンシブ・a11y / 3: ブランド整合 / 4: CWV
```

#### パターンD: 新機能開発チーム（クロスレイヤー）
```
1: フロント実装 / 2: バックエンド API / 3: テスト作成
```

### 運用ルール

| ルール | 内容 |
|---|---|
| チーム規模 3-5 名 | それ以上は調整コストが利点を上回る |
| 1 メンバー 5-6 タスク | 生産性と管理のバランス |
| ファイル競合を避ける | 各メンバーが異なるファイル群を担当 |
| リードは実装しない | 調整・統合に専念 |
| 終了時はクリーンアップ | リードから `Clean up the team` 実行 |

### 操作

| 操作 | キー |
|---|---|
| チームメイト切り替え | `Shift+Down` |
| タスクリスト表示 | `Ctrl+T` |
| メンバー中断 | `Enter` → `Escape` |


## 出典・依拠先

- FACT: 本ファイルは @nbyk115/consulting-os の ConsultingOS 規律ファイルとして 2026-05-05 PR #65 で体系的明示物理化により定義された（ファイルパス: .claude/skills/claude-code-ops/references/hooks-monitor-routines.md）
- INFERENCE: 業界標準ベストプラクティス（佐藤裕介流の構造で売る原則、Boris Cherny 流の 9 規律 ruthlessly edit、該当部門の業界フレームワーク）から派生し実装
- SPECULATION: 4 週間ごとの再評価カレンダー（evolution-log.md 再評価カレンダーセクション）で形骸化検出、Boris #3 削除セット対象、規律違反発生時は統合 / 分離 / 削除で整理予定
