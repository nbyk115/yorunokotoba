# Claude Code SDK / 自動化リファレンス

> 2026-05-02 学習。「AIを使う」（対話的）から「AIで出荷する」（自律実行）への移行を支える Claude Code SDK + headless mode + GitHub Actions の実装ナレッジ。

## 1. 基本コマンド `claude -p`

ターミナルから対話なしで Claude Code を一発実行する基本コマンド。

```bash
# 一発実行（対話モードなし）
claude -p "プロンプト内容"

# ファイル書き換え許可付き
claude -p "リファクタしてください" --allowed-tools write

# 全ツール許可（注意: 危険操作も実行可能になるため本番環境では避ける）
claude -p "..." --allowed-tools "*"
```

ここから全ての自動化が始まる。`claude -p` を理解せずに SDK 化はできない。

## 2. パイプ連携パターン

UNIX パイプ（`|`）で前のコマンドの結果を Claude に渡す流れ作業。エディタを開かずにデバッグ・レビュー・分析が完結する。

```bash
# ネットワーク問題のデバッグ
ifconfig | claude -p "ネットワーク問題をデバッグして、原因と修正案を出してください"

# エラーログ解析
cat error.log | claude -p "原因を特定して、修正手順を提示してください"

# コードレビュー
cat src/api/handler.ts | claude -p "このコードをレビューして、セキュリティと性能の観点で問題点を列挙してください"

# 競合分析（複数ソース統合）
curl -s https://example.com/news | claude -p "本文から競合動向を 3 点抽出してください"

# Git 差分の自動説明
git diff HEAD~1 | claude -p "この差分の意図を 1 段落で説明してください"
```

ConsultingOS での活用例（cron / GitHub Actions と組み合わせ）:

```bash
# 毎朝 9 時に競合 RSS を巡回 → competitive-analyst スキルで分析
0 9 * * * curl -s https://competitor.com/news.xml | claude -p "competitive-analyst として今日の重要トピックを 5 点抽出"
```

## 3. `--output-format JSON` で本番運用化（最重要）

Claude を「チャットツール」から「インフラ部品」に変える決定的フラグ。JSON 出力で他システムから機械的にパース可能になる。

```bash
# JSON 出力で結果を取得
claude -p "コードレビューして 5 点指摘" --output-format json

# 出力例
{
  "type": "result",
  "result": "1. ...\n2. ...\n...",
  "session_id": "abc123",
  "total_cost_usd": 0.012,
  "duration_ms": 4523
}

# jq で必要な部分だけ抽出して次のシステムに渡す
claude -p "..." --output-format json | jq -r '.result' | curl -X POST -d @- https://slack.webhook
```

このフラグ 1 つで「人間が読む出力」から「プログラムが処理するデータ」に変わる。本番（実際にエンドユーザーが使う環境）に乗せるなら必須。

## 4. SDK で実装可能なもの（用途マップ）

| 用途 | 実装難易度 | 効果 |
|---|---|---|
| コードレビュー自動化（GitHub Actions + claude-code-action） | 低 | 工数大幅削減 |
| カスタムリンター（独自ルールでコード品質チェック） | 中 | プロジェクト固有規律の自動化 |
| チャットボット（Slack / Discord 統合） | 中 | クライアント問い合わせ初期対応 |
| リモートコード環境管理（SSH 経由でサーバーコード自動操作） | 高 | DevOps 自動化 |
| エンジニアリングパイプライン全体運用（複数自動作業の流れ作業） | 高 | CI/CD への深い統合 |

## 5. GitHub Actions 連携（Anthropic 公式 action）

Anthropic 公式の [anthropics/claude-code-action@v1](https://github.com/anthropics/claude-code-action) を使うのが最速。

### セットアップ手順

```bash
# Claude Code のターミナルで以下を実行（対話的に GitHub App + Secrets を設定）
/install-github-app
```

### 基本ワークフロー例

```yaml
# .github/workflows/claude-pr-review.yml
name: Claude PR Auto Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            ConsultingOS の /review-pr スキル（5 軸評価）に従って、
            この PR をレビューしてください。
            出力は日本語で、結論 → 根拠 → 具体アクションの順序。
            末尾に【反証チェック結果】Step 1-3 + 残存リスクを必ず付与してください。
```

### 認証方法

- Anthropic API（最速・推奨）: ANTHROPIC_API_KEY を GitHub Secrets に登録
- Amazon Bedrock: AWS 認証情報経由
- Google Vertex AI: GCP 認証情報経由
- Microsoft Foundry: Azure 認証情報経由

## 6. ConsultingOS への組み込み戦略（Phase 別）

### Phase 1: PR 自動レビュー（本 PR で着手）
- GitHub Actions + claude-code-action@v1
- /review-pr スキルを SDK 経由で呼び出し
- PR 作成時に自動コメント

### Phase 2: 月次定期タスク（実需顕在化後）
- GitHub Actions の scheduled workflow
- /review-agent-essence を全エージェントに対して月次実行
- 結果を evolution-log.md に自動追記

### Phase 3: 朝の競合巡回（実需顕在化後）
- cron + claude -p + パイプ
- competitive-analyst を毎朝 9 時に起動
- Slack webhook に結果送信

### Phase 4: クライアント問い合わせ初期トリアージ（SaaS 化検討時）
- Slack / メール → SDK → strategy-lead で初期分類
- 担当エージェントを自動振り分け

## 7. セキュリティ規律（cybersecurity-playbook と整合）

- ANTHROPIC_API_KEY は必ず GitHub Secrets で管理（リポジトリにコミット禁止）
- Fine-grained PAT を使用、スコープ最小権限
- 90 日ローテーション
- workflow ファイルで `--allowed-tools` を最小権限に絞る（write 限定 / bash 禁止 等）
- セッションログに API キーが出力されていないか監視

### 7.1 権限管理（本番 AI 導入の最大の壁）
本番で AI を動かせない理由 No.1 は「権限の不安」（勝手にファイルを消されたら困る）。これを解決する 3 仕組み:

| フラグ | 役割 | 例 |
|---|---|---|
| デフォルト動作 | 破壊的操作（削除 / 上書き等）は不可 | `claude -p "..."` だけなら read のみ |
| `--allowed-tools` | 「これだけやっていい」を事前定義 | `--allowed-tools read,write` で書き込み許可 / `--allowed-tools "*"` は危険 |
| `--permission-prompt-tool` | MCP サーバーに認可をリアルタイム委譲 | 操作ごとに外部判定システムへ問い合わせ、承認後に実行 |

→ エンタープライズ級セキュリティがフラグ 1 つで担保される。本 PoC（claude-pr-review.yml）でも `--allowed-tools read` のみ許可、書き込みは別 workflow で明示。

## 8. 「AIを使う」から「AIで出荷する」への分岐点

| Stage | 状態 | 例 |
|---|---|---|
| 1. AIを使う | 対話的、人間が都度プロンプト送信 | Claude Code セッションで会話 |
| 2. AIで自動化 | 単発タスクをコマンド化 | `claude -p ... --output-format json` |
| 3. AIで出荷する | 本番システムに組み込み、エンドユーザーが間接利用 | GitHub Actions / Slack Bot / Web SaaS |

ConsultingOS は現在 Stage 1。本 Phase 1 PoC で Stage 2-3 への移行を開始する。

## 9. セッション永続化（マルチターンの真の解放）

普通の AI 連携は呼び出しごとに記憶喪失（前の会話を覚えていない）。SDK は session ID を返し、後から ID 指定で会話を再開できる。

```bash
# 初回実行で session ID を取得
SESSION_ID=$(claude -p "競合分析を開始" --output-format json | jq -r '.session_id')

# 数時間後・数日後・デプロイを跨いでも会話継続
claude -p "前回の続きから次の競合を分析" --resume "$SESSION_ID"

# JSON でやり取りすれば自動化システムから再開可能
claude -p "..." --resume "$SESSION_ID" --output-format json
```

ConsultingOS での活用例:
- クライアント別の長期コンテキスト保持（クライアント A の session ID を `.claude/memory/clients/A/session.txt` に保存し、案件継続時に再開）
- 月次競合巡回で前月のコンテキスト（競合動向の累積）を保持
- Slack スレッド単位で session ID を紐付け、同一スレッド内の会話を継続

## 10. ペルソナ差し替え（`--system-prompt`）

1 フラグで AI の性格・話し方・規律を切り替え。

```bash
# お遊び
claude -p "今日のニュースを教えて" --system-prompt "海賊風に喋れ、語尾は『〜だぜ、海賊王に俺はなる』"

# 本格運用: クライアント A 専用のレビュアー
claude -p "コードレビューして" --system-prompt "$(cat ./client-a-review-rules.md)"

# ConsultingOS 各エージェントを SDK 経由で呼び出し
claude -p "戦略提案を作成" --system-prompt "$(cat .claude/agents/consulting/strategy-lead.md)"
```

ConsultingOS での活用:
- クライアント別のレビュアー（クライアント A は厳格、B はカジュアル）
- 部門別エージェントを CLI から直接呼び出し
- 検証フェーズと本番フェーズで規律切り替え

## 11. GitHub Action 完全自動化フロー（Issue → PR）

人間がコードに一切触らない究極形態。

```
[人間] Issue を立てる: 「50/50 パワーアップ機能とスキップ機能を追加して」
   ↓
[Claude Action] 自動で ToDo リスト作成
   ↓
[Claude Action] 自動でファイル編集
   ↓
[Claude Action] 自動で Pull Request 作成
   ↓
[人間] PR レビューしてマージするだけ
```

実装: anthropics/claude-code-action@v1 を `issues: opened` トリガーで起動、`@claude` メンションで実行。

```yaml
on:
  issues:
    types: [opened, labeled]
  issue_comment:
    types: [created]

jobs:
  claude-implement:
    if: contains(github.event.comment.body, '@claude') || contains(github.event.issue.labels.*.name, 'claude-implement')
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      issues: write
    steps:
      - uses: actions/checkout@v4
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            この Issue の要望を実装してください。
            完了したら feature ブランチを作成し、PR を提出してください。
            CLAUDE.md ハードルール 6/7 に従い、Squash and merge 前提で main 直接 push 禁止。
            末尾に【反証チェック結果】Step 1-3 必須。
          claude_args: "--allowed-tools read,write,bash"
```

ConsultingOS での活用（Phase 5 候補）:
- クライアント要望を Issue 化 → Claude が自動実装 → PR 提出 → 人間レビュー
- 「Issue 文章を書く時間 = 機能完成までの時間」レベルの自動化

ただし `--allowed-tools` で bash 許可は危険、本 PoC では未着手。実需顕在化時に別 PR で慎重に Phase 5 として展開。

## 12. Anthropic 公式 3 層アーキテクチャ（最重要・FACT）

Anthropic が公開する SDK 関連は 3 層構造で重なっている。

| Layer | 役割 | 抽象度 | 用途 |
|---|---|---|---|
| L1: SDK | 生のプログラマブルアクセス（一番下の素の道具） | 最低 | フルカスタム実装、独自プロダクト構築 |
| L2: Base Action ([anthropics/claude-code-base-action](https://github.com/anthropics/claude-code-base-action)) | SDK をクリーンな API に包んだ層 | 中 | カスタム workflow を組む際のベース |
| L3: PR Action ([anthropics/claude-code-action](https://github.com/anthropics/claude-code-action)) | コメント・整形・GitHub UX を全部整えた層 | 最高 | 60 秒で本番投入、即運用可能 |

「チュートリアルをコピペする側」か「クライアント向けにカスタム AI インフラを組む側」かはここで分かれる。

ConsultingOS は本 PoC で L3（PR Action）を採用。クライアント案件で L1/L2 を組むスキルを蓄積していく方針。

## 13. 60 秒本番投入（インフラ不要）

普通の AI 自動化ツールに必要な以下が、GitHub Actions では全て不要。

| 必要だったもの | GitHub Actions での代替 |
|---|---|
| 専用サーバー | GitHub が用意した Action Runner |
| デプロイパイプライン | `git push` で自動実行 |
| 監視基盤 | GitHub Actions の実行履歴 + 失敗通知 |
| 認証 | GitHub Secrets |
| コスト管理 | GitHub Actions の利用枠（個人・OSS は無料枠あり） |

セットアップ:
```bash
# Claude Code のターミナルで実行
/install-github-app
# → YAML が自動生成 → 完成
```

月 $200 払う他の AI 自動化ツールより、この無料 Action のほうが強い。

## 14. 商業機会（コンサル提案の核）

英語圏のフリーランスが「SDK + GitHub Action 構成をクライアント環境向けに組む」だけで、月 $5K / $10K / $25K（日本円で月 50 万 / 100 万 / 250 万）の請求書を出している（出典: 個人ブログ・X 投稿等の SPECULATION、業界調査により幅あり）。

### 商品の構造
- 商品: 「SDK + GitHub Action 構成のクライアント環境向け実装」
- 工数: 1 案件あたり 2-4 週間（規模により）
- 競合: 日本ではほぼ未開拓

### ConsultingOS への組み込み余地
- consulting-playbook + service-dev の連携で、クライアント向け SDK 実装を提案商品化可能
- 戦略提案（strategy-lead）+ 実装（ai-engineer + infra-devops）+ 提案書化（proposal-writer）の Agent Team で対応
- 12 つ目の用途（自動コードレビュー / 自動バグトリアージ / Issue → PR 自動化 / ジュニア業務圧縮）が提案ネタの中核

### 注意（佐藤裕介流）
- 「英語圏で月 $25K」の数字は SPECULATION（個人体験談ベース）、日本市場で同単価は未検証
- 案件単価は「規模 × クライアント業種 × 既存システム複雑度」で大きく変動
- 先回り商品化禁止、実需（クライアント問い合わせ）が出てから提案資料化

## 15. ConsultingOS 進化ロードマップ統合

| Phase | 内容 | ステータス |
|---|---|---|
| Phase 1: PR 自動レビュー | claude-pr-review.yml + claude-code-action@v1 | 本 PoC で着手 |
| Phase 2: 月次定期タスク | scheduled workflow + /review-agent-essence | 実需確認後 |
| Phase 3: 朝の競合巡回 | cron + claude -p + パイプ + Slack webhook | 実需確認後 |
| Phase 4: クライアント問い合わせトリアージ | Slack → SDK → strategy-lead | SaaS 化検討時 |
| Phase 5: Issue → PR 完全自動化 | claude-code-action の `issues: opened` トリガー | 実需確認後（権限慎重） |
| Phase 6: クライアント案件向け実装サービス商品化 | 提案資料 + 実装パイプライン | クライアント問い合わせ後 |


## 出典・依拠先

- FACT: 本ファイルは @nbyk115/consulting-os の ConsultingOS 規律ファイルとして 2026-05-05 PR #65 で体系的明示物理化により定義された（ファイルパス: .claude/skills/claude-code-ops/references/sdk-automation.md）
- INFERENCE: 業界標準ベストプラクティス（佐藤裕介流の構造で売る原則、Boris Cherny 流の 9 規律 ruthlessly edit、該当部門の業界フレームワーク）から派生し実装
- SPECULATION: 4 週間ごとの再評価カレンダー（evolution-log.md 再評価カレンダーセクション）で形骸化検出、Boris #3 削除セット対象、規律違反発生時は統合 / 分離 / 削除で整理予定
