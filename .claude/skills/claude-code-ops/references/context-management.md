# コンテキスト管理 詳細: MCP・ツール・メモリ

> **コンテキストウィンドウは命。MCP を入れすぎると 200k のコンテキストが実質 70k まで縮小する。**

---

## MCP・Plugin 管理

### 鉄則: コンテキストウィンドウは命

### 管理ルール

| ルール | 内容 |
|---|---|
| **全 MCP デフォルト無効が原則** | MCP は追加しても `disabledMcpServers` に即登録。必要時のみ有効化 |
| **有効化は最大 5〜6 個まで** | ツール総数 80 以下を目安。超過でコンテキスト壊滅 |
| **タスク単位で ON/OFF** | タスク開始時に有効化 → 完了時に無効化 |
| **使っていないものは即オフ** | 定期的に `/mcp` で状態確認 |
| **API や CLI で足りるなら MCP 不要** | `gh` CLI、`curl` 等で代替可能なら MCP は追加しない |
| **無料運用が前提** | 有料 API を必要とする MCP は導入前にコスト確認必須 |

### MCP 導入判断フロー
```
1. 本当に MCP が必要か？ → CLI/API で代替できるなら不要
2. 無料で使えるか？ → 有料なら導入しない（明示的な許可がない限り）
3. 追加 → 即 disabledMcpServers に登録
4. 使うとき → 有効化 → タスク完了 → 無効化
```

### 現在の MCP 構成
> **このプロジェクトでは MCP を使用していません。**
> GitHub 操作は `gh` CLI、API 呼び出しは `curl`/Bash で代替。

### Optional MCPs（案件発生時に有効化する候補リスト）

> **原則**: 今は入れない。該当案件が発生した瞬間に settings.json に追加する。投機的抽象化を避けるため事前設定しない。

| MCP | 有効化する案件条件 | 対応エージェント |
|---|---|---|
| **Shopify AI Toolkit** | D2C/EC コンサル案件・商品管理/在庫/SEO 自動化 | performance-marketer / fullstack-dev / seo-specialist |
| **Stripe MCP** | 決済統合実装・サブスク設計 | fullstack-dev / ai-engineer |
| **Notion MCP** | クライアント案件のドキュメント同期・ナレッジ管理 | proposal-writer / product-manager |
| **Slack MCP** | チームコミュニケーション統合（長期プロジェクト） | client-success / strategy-lead |
| **Linear/Jira MCP** | プロダクトバックログ連携 | product-manager / tech-lead |

→ 有効化する場合は「5-6 個上限」のルールを守り、使用完了後は無効化。

---

## Tool Search（MCP 多すぎ対策）

```json
{
  "env": { "ENABLE_TOOL_SEARCH": "auto:5" }
}
```
- MCP ツール定義がコンテキストの 5% を超えたら自動有効化
- ツールは名前だけコンテキストに入り、使用時にスキーマを動的取得

---

## rtk（コマンド出力圧縮）★Service Dev / Creative 部門で推奨

> **git status, ls, find 等のコマンド出力を事前圧縮し、トークン消費を最大 90% 削減。**
> **ただし効果があるのは Bash コマンドを多用する用途のみ。**

```bash
cargo install rtk
```

- **仕組み**: Bash コマンドの出力がコンテキストに流れる前に、rtk が自動で圧縮・フィルタ
- **効果**: git status, ls, find, npm, docker, kubectl 等の冗長な出力を最小限に
- **claude-mem との使い分け**: rtk は「今のセッション内」のトークン節約、claude-mem は「セッション間」のメモリ

#### 効果があるエージェント（Service Dev / Creative）
| エージェント | rtk が効くコマンド |
|---|---|
| fullstack-dev | npm, git, ls, find, grep |
| frontend-dev | ビルド出力, lint, テスト結果 |
| tech-lead | grep, find, code review 系 |
| infra-devops | docker, kubectl, ログ確認 |
| ai-engineer | pip, ビルド, 評価実行 |

#### 効果が薄いエージェント
Consulting / Marketing / Global / Product 系は Bash コマンドをほぼ使わないため、削減率は 3% 以下。**これらの部門では導入不要。**

---

## claude-mem（永続メモリ圧縮）★推奨

> **セッション間の記憶を自動保存・自動注入。トークン消費を削減し、使用料到達を遅らせる。**

```bash
npx claude-mem install
```

- **自動保存**: セッション終了時に会話内容を圧縮して保存
- **自動注入**: 次のセッション開始時に必要な部分だけ読み込む
- **メモリ運用**: claude-mem が自動メモリ。構造化メモリは `.claude/memory/` 配下を直接利用

---

## /compact: 手動コンテキスト圧縮
長いセッションで応答が遅くなったら `/compact` 実行。重要な情報は CLAUDE.md やスキルファイルに残っているため、圧縮しても失われない。

---

## claude --resume: 中断セッションの再開

```bash
claude --resume
```

- **claude-mem との関係**: claude-mem はセッション終了時に自動保存・次回注入。`--resume` は同一セッションの直接継続。両方併用で二重に守られる
- **使い分け**:
  - 同じ作業を続ける → `--resume`
  - 前のセッションの知見を踏まえて別の作業 → 新セッション（claude-mem が自動注入）

---

## /rewind & /checkpoints: 巻き戻し
- `/rewind`: 会話を以前の状態に巻き戻し
- `/checkpoints`: ファイル単位の Undo 管理

---

## セッション管理 5 つの術（Thariq @trq212・Anthropic 社員公式）

> 出典: Thariq Shihipar（Anthropic）公式 X 投稿 2026 年（54 万ビュー）/ Claude Code セッション管理と 100 万トークンコンテキスト

### context rot（コンテキスト腐敗）の概念

コンテキストが大きくなると、モデルの注意が多くのトークンに分散され、古い・関係ない情報がノイズになり現在のタスクの邪魔をする現象。

| 指標 | 値 |
|---|---|
| Claude Code コンテキストウィンドウ | 100 万トークン |
| context rot 観察開始の目安 | 約 30-40 万トークン（タスク依存・厳密ルールではない） |
| ハードカットオフ | 100 万トークン到達で強制終了 |

含まれるもの: システムプロンプト / 会話履歴 / すべてのツール呼び出しと出力 / 読み込まれたファイル内容。

### 毎ターンが「分岐点」: 5 つの選択肢

Claude Code が 1 タスク終了後、次に何をするかが最重要判断ポイント。

| 番号 | 選択肢 | 内容 | 起動方法 |
|---|---|---|---|
| 1 | Continue | 同じセッションでそのまま続行 | 次のメッセージ送信 |
| 2 | /rewind | 過去のメッセージまで戻り、それ以降をコンテキストから削除 | Esc Esc ダブルタップ or `/rewind` |
| 3 | /clear | 自分で重要情報をまとめ、まっさらな新規セッション開始 | `/clear` |
| 4 | /compact | これまでの会話をモデルに要約させ、要約上で続行 | `/compact` |
| 5 | Subagents | 次の作業を独自クリーンコンテキストのサブエージェントに委任 | Agent ツール |

### 判断基準（Thariq 氏の経験則）

| 状況 | 推奨アクション | 理由 |
|---|---|---|
| 新しいタスクを始める | /clear で新規セッション | 「新しいタスクを始めるなら新しいセッションも始めるべき」 |
| アプローチが失敗した | /rewind でファイル読み込み直後に戻る + 学びを含めて再指示 | 失敗ログのトークンがコンテキストから消えクリーンに再挑戦可 |
| セッションが長くなってきた | 余裕のあるうちに /compact + 方向性を添える | autocompact は context rot 状態で品質低下、自分から早めに |
| 大量の中間出力が出る作業 | サブエージェントに委任 | 「ツール出力は後でまた必要か？結論だけあればいいか？」を判断 |
| 関連タスクでコンテキストが使える | そのまま続行 | 例: 機能実装直後のドキュメント作成（再読み込み無駄） |

### /rewind が最も過小評価されている機能

Thariq 氏が「良いコンテキスト管理を示す最大の習慣」として挙げた手法。

具体例:
- ❌ 普通の反応: Claude が 5 ファイル読み込んでアプローチ A 失敗 → 「それじゃダメ。X を試して」と指示 → 失敗ログ全部コンテキストに残存
- ✅ 良いやり方: ファイル読み込み直後まで /rewind → 「アプローチ A は使わないで。foo モジュールはそれを公開していない。直接 B で行って」と再指示 → 失敗試行錯誤のトークンが消えクリーン状態で再挑戦

「ここから要約して」機能を併用すれば、Claude が学びをまとめ「過去の自分から未来の自分へのメモ」を作成可能。

### /compact vs /clear の決定的な違い

| 項目 | /compact | /clear |
|---|---|---|
| 動作 | モデルが履歴を要約し、その要約に置き換え | 自分で重要情報を書き出し、まっさらな新規セッション開始 |
| 可逆性 | 不可逆（lossy）、Claude の判断に委ねる | 自分が選んだ情報だけで構成 |
| 手間 | 自分で書かなくていい | 手間はかかる |
| 失敗リスク | Claude が見落とす可能性 | 自分の選定漏れ |
| 方向付け | 指示を渡せる（例: `/compact auth refactor に集中、テストデバッグ削除`） | 完全自由 |

トレードオフ: コントロール vs 手軽さ。

### なぜ /compact が失敗するか

長時間セッションで /compact 品質が極端に悪化する最大原因は「モデルが作業の方向性を予測できない時」。

例: 長いデバッグ後 autocompact 発動 → 調査内容を要約 → 次のメッセージで「bar.ts の警告も直して」と言うと、デバッグ中心要約からその警告情報が抜け落ちる。

ジレンマ: context rot で「最も知性が低い状態」のモデルが「最も正確な要約が必要な瞬間」に要約を生成。

対策: 100 万トークン余裕のあるうちに自分から /compact 実行、次にやることの説明を添える。

### サブエージェントの判断基準

Claude Code が Agent ツールでサブエージェント生成 → 独自クリーンコンテキスト → 結果を要約して親セッションに返却。

判断基準:
> 「このツール出力は後でまた必要か？それとも結論だけあればいいか？」

結論だけでいいならサブエージェントに任せる。明示指示の例:
- 「サブエージェントを立ち上げて、このスペックファイルに基づいて作業結果を検証して」
- 「サブエージェントで別のコードベースの auth flow の実装方法を読んで要約して。それを参考に同じように実装して」
- 「サブエージェントで git の差分からこの機能のドキュメントを書いて」

中間出力を親コンテキストに持ち込まないことでクリーン保持。

### ConsultingOS での適用

| 場面 | 推奨アクション |
|---|---|
| 1 セッションで複数案件を扱い始めた | /clear で案件ごとに新規セッション |
| サブエージェントが失敗・無限ループ気味 | /rewind でサブエージェント起動前に戻る |
| 30-40 万トークン目安到達 | 余裕のあるうちに自分から /compact + 方向性指示 |
| 大量検索 / 全ファイル読み込み系タスク | サブエージェント（Explore 含む）に委任 |
| 案件継続のドキュメント作成・コミット作業 | そのまま続行（再読み込み無駄） |

### お金かからない増強の実践

Thariq 氏ナレッジは追加コストゼロで実装可能（Claude Code 既存機能のみ）。本セクションを読んで運用に組み込むだけで:
- context rot による品質劣化を回避
- /rewind 活用で失敗試行のトークン浪費削減
- /compact 早期実行で要約品質維持
- サブエージェント適切活用で親コンテキストクリーン化

→ Claude Code の出力品質を根本から向上、追加課金一切不要。

---

## コードマップの活用
`/codemap` コマンドで `.claude/codemap.md` を生成しておくと、巨大コードベースでもコンテキストを消費せずに Claude がナビゲートできる。

### code-review-graph（Tree-sitter AST 解析・精度重視）★Service Dev 向け上位版

> **/codemap は手動 Markdown、code-review-graph は AST 自動解析。トークン削減 6.8 倍の実測値あり。**

```bash
pip install code-review-graph
```

- **仕組み**: Tree-sitter で AST 解析 → ファイル依存関係を構造的にマッピング → 差分追跡で増分更新
- **効果**: Claude がクエリする時だけ関連ファイルを返す。全コードベース読み込みを回避
- **実測**: 13,205 トークン → 1,928 トークン（6.8 倍削減）、レビュー品質 7.2 → 8.8

### 使い分け
```
小規模プロジェクト → /codemap で十分
中〜大規模（100 ファイル超）→ code-review-graph
コードレビュー特化 → code-review-graph
汎用構造検索 → claude-mem:smart-explore
```

### 対応エージェント
- `tech-lead`: コードレビュー・技術負債分析
- `fullstack-dev`: 大規模リファクタリング時の影響範囲特定
- `frontend-dev`: コンポーネント依存関係の把握
- `infra-devops`: Infrastructure as Code の依存関係分析

---

## backlog/ フォルダ習慣（大量の指摘・TODO 管理）

> **システム分析や長文レビューで出てきた大量の指摘・タスクを、まず md に吐かせてから 1 つずつ処理する。**

AI に分析させると 5-10 個の重要な指摘が一気に出ることが多い。そのまま順番に処理するとコンテキストが詰まる。代わりに `backlog/` フォルダに全タスクを md として吐かせてから処理する。

```
project/
├── backlog/
│   ├── 001-security-audit-findings.md
│   ├── 002-performance-bottleneck.md
│   ├── 003-ux-issues.md
│   └── done/
│       └── 000-initial-setup.md
```

**活用方法**:
1. AI に「分析結果を `backlog/` に md で吐いて」と指示
2. 1 つの md を開いて新しいスレッドで処理開始
3. 完了したら `backlog/done/` に移動 or 削除
4. フォローアップ項目があれば既存 md に追記
5. 別モデル（Opus/Sonnet/外部 AI）にレビュー依頼する際も md を渡すだけで文脈が伝わる

**ConsultingOS 適合**: `/evolve` 結果、`/review-agent-essence` 結果、`agent-evaluation` の C 判定タスクを `backlog/` に吐き出せば段階的に処理できる。

**鉄則**: 何でも md に吐かせまくる。これが最強のコンテキスト管理。

---

## notebooklm-py（外部リサーチ委譲）

> **大量の資料分析を NotebookLM に丸投げし、ConsultingOS 側はコンテキストを消費せずに要点だけ受け取る。**

### 何ができるか
- URL/PDF/YouTube 動画を一括取り込み
- NotebookLM が自動でソース間を横断分析
- 音声・動画・スライド・クイズをプログラムで生成

### 導入
```bash
pip install notebooklm-py
```

### ConsultingOS 活用

| エージェント | 用途 |
|---|---|
| market-researcher | 海外ニュース 100 記事を一括投入 → 要約取得 |
| market-researcher | 業界レポート 10 本を一括分析 |
| competitive-analyst | 競合 IR/プレスリリースを一括処理 |
| content-strategist | 長文執筆時の参考資料を蓄積 |
| strategy-lead | M&A 対象企業の全公開資料を一括分析 |

---

## OpenDataLoader PDF（ローカル PDF 高精度抽出）

> **Claude Code 標準の Read では扱いきれない長文・表・OCR 対象 PDF を Markdown/JSON/HTML に変換。**
> **出典**: github.com/adlnet/OpenDataLoader-PDF（Apache 2.0・GPU 不要・無料）

### 何ができるか
- **100 ページ/秒** の高速パース
- **テーブル抽出 92.8% 精度**（#1 benchmark）
- **OCR 対応**（80+ 言語、300 DPI scan 対応）
- **LaTeX 数式・画像・チャート** 抽出
- **RAG 向け構造化 Markdown** 出力

### 導入
```bash
pip install opendataloader-pdf
opendataloader-pdf input.pdf --format markdown > output.md
```

### Claude Code 標準 Read との使い分け

| PDF サイズ/複雑度 | 推奨 |
|---|---|
| 1-20 ページ・単純レイアウト | Claude Code 標準 Read |
| 20 ページ超 または 表重視 | OpenDataLoader → Markdown 化 → Read |
| OCR 必要（scan PDF） | OpenDataLoader のみ |
| RAG 構築・bounding box 必要 | OpenDataLoader の JSON 出力 |

### ConsultingOS 活用

| エージェント | 活用場面 |
|---|---|
| competitive-analyst | 競合の annual report / IR 資料 |
| market-researcher | WEF / McKinsey / Edelman 等の長文レポート |
| market-researcher | 市場調査 PDF の表データ抽出 |
| legal-compliance-checker | 契約書・利用規約 PDF の構造化 |
| proposal-writer | 過去提案書からの要素再利用 |
| strategy-lead + ai-engineer | AI技術ホワイトペーパーの精読（戦略 + 技術検証ペア） |

---

## settings.json 推奨設定

> **settings.json は 4 層ある。User（全プロジェクト共通）→ Project（チーム共有）→ Local（個人 gitignore）→ Managed（組織ポリシー）の順で上書き。**

### セッション管理
```json
{ "cleanupPeriodDays": 365 }
```
- デフォルト 30 日 → 365 日に延長。過去セッション検索が可能に

### 危険操作の deny リスト
```json
{
  "permissions": {
    "deny": [
      "Bash(rm -rf /*)",
      "Bash(chmod 777 *)",
      "Bash(git push --force *)",
      "Bash(git reset --hard *)"
    ]
  }
}
```


## 出典・依拠先

- FACT: 本ファイルは @nbyk115/consulting-os の ConsultingOS 規律ファイルとして 2026-05-05 PR #65 で体系的明示物理化により定義された（ファイルパス: .claude/skills/claude-code-ops/references/context-management.md）
- INFERENCE: 業界標準ベストプラクティス（佐藤裕介流の構造で売る原則、Boris Cherny 流の 9 規律 ruthlessly edit、該当部門の業界フレームワーク）から派生し実装
- SPECULATION: 4 週間ごとの再評価カレンダー（evolution-log.md 再評価カレンダーセクション）で形骸化検出、Boris #3 削除セット対象、規律違反発生時は統合 / 分離 / 削除で整理予定
