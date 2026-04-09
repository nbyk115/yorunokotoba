# ConsultingOS — Core Memory

> このファイルはセッション間で継続する「作業記憶」です。
> 各エージェントは起動時にここを読み、終了時に更新します。
> 更新方法: 該当セクションを直接編集、または `.claude/memory/archival/` にセッションサマリーを追記。

## 最終更新
- 日時: 2026-04-09
- 更新者: orchestrator
- 変更内容: ConsultingOS最強化完了 / ultrathink追加（orchestrator+strategy-lead）/ verification-loop Stopフック追加 / PostToolUse設定変更ログフック追加 / brave-search MCPプロトコル追加（competitive-analyst/market-researcher/global-journalist）/ agent-evaluation.md新規作成（スキル38本）/ CLAUDE.md+orchestratorに評価スキル追記

---

## システム現状（最重要）

| 項目 | 値 |
|---|---|
| エージェント数 | 34（+ orchestrator） |
| スキル数 | 38（プロジェクト）/ 38（グローバル） |
| コマンド数 | 11 |
| グローバル同期 | ✅ ~/.claude/skills/ → すべてシンボリックリンク |
| ブランチ | claude/consulting-os-multiagent-YS5GK |
| MCP: context7 | ✅ user scope / 完全無料・APIキー不要 |
| MCP: youtube-mcp | ✅ user scope / YouTube Data API 無料枠（要APIキー発行） |
| MCP: brave-search | ✅ user scope / Brave Search 無料枠2,000クエリ/月（要APIキー発行） |

---

## アクティブプロジェクト

| プロジェクト名 | クライアント | フェーズ | 担当エージェント | 次のアクション |
|---|---|---|---|---|
| ConsultingOS構築 | 社内 | v2完成・運用中 | orchestrator | 月次claude-health実行・実運用フィードバック収集 |

---

## 重要な意思決定ログ

| 日付 | 内容 | 判断 | 根拠 |
|---|---|---|---|
| 2026-04-09 | 副業収益化リストラクチャリング | Go | monetization-playbook.md新設・9エージェント副業ガイド追加・7エージェントASI時代追加・orchestratorパターンO4追加 |
| 2026-04-09 | AlgrowをFreeスタックに刷新 | Go | context7（無料）+ youtube-mcp（無料枠）+ brave-search（2,000/月無料）に移行 |
| 2026-04-09 | effortLevel:high をデフォルト設定 | Go | 複雑タスクでの調査不足・即編集問題を構造で防止 |
| 2026-03-25 | 決済をStripe→Komojuに統一 | Go | 日本・アジア特化・手数料優位 |
| 2026-03-25 | Auto Mode実装 | Go | 長時間タスクの安全な自律実行 |
| 2026-03-25 | 反証モードDeep/Standard/Light深度設定 | Go | 省略防止・品質ゲート強化 |
| 2026-03-25 | ハンドオフ品質ゲート双方向化 | Go | 差し戻し基準の明文化で品質断絶防止 |
| 2026-03-27 | 外部スキル10本統合（superpowers/humanizer-ja等） | Go | 調査→実装→全エージェント配線まで完遂 |
| 2026-03-27 | グローバルシンボリックリンク修正 | Go | 他リポジトリでも新スキルが使えるよう修正 |
| 2026-03-27 | security-scan / strategic-compact 追加 | Go | everything-claude-codeから最高価値スキルを選定 |
| 2026-03-28 | 信頼→強制化: Hooks3本追加 | Go | TSチェック/TDD警告/humanizer-ja通知が自動トリガーに |
| 2026-03-28 | orchestrator並列上限（max 3）+ Phase 3.5 | Go | レートリミット死亡を構造で防止 |
| 2026-03-28 | スキル数38→36修正 | Fix | 実ファイル数と表記を一致させた |

---

## 今回追加したスキル（2026-03-27）

| スキル | 出典 | 主な適用エージェント |
|---|---|---|
| humanizer-ja | kgraph57/humanizer-ja | content-strategist, business-translator, brand-guardian, pr-communications, social-media-strategist |
| superpowers | obra/superpowers v5.0.6 | tech-lead, fullstack-dev, ai-engineer |
| claude-health | tw93/claude-health | orchestrator（月次実行） |
| planning-with-files | B0Qi/skill-planning-with-files | orchestrator, tech-lead, fullstack-dev, competitive-analyst |
| frontend-design | Lyvyos42/frontend-design-skill | frontend-dev, ux-designer, creative-director |
| verification-loop | everything-claude-code | tech-lead, fullstack-dev, infra-devops |
| deep-research | everything-claude-code | competitive-analyst, market-researcher, global-journalist |
| playwright-skill | jpulido240-svg/playwright-skill | fullstack-dev, frontend-dev, infra-devops |
| security-scan | everything-claude-code (AgentShield) | orchestrator, tech-lead（外部スキル取込前） |
| strategic-compact | everything-claude-code | orchestrator, 長時間タスク全般 |

---

## クライアントコンテキスト

| クライアント | 特記事項 | 禁止事項 | 意思決定者 |
|---|---|---|---|
| (未登録) | | | |

---

## 継続タスク

- [x] 月次 claude-health 実行（実施: 2026-03-28 → 次回: 2026-04-27）6/6 PASS
- [x] 月次 security-scan 実行 → 総合グレードA（Cat A/C/D/E=A、Cat B=A※soft_deny追加済み）
- [x] 副業収益化システム構築 → monetization-playbook.md + 9エージェント更新 + orchestratorパターンO4
- [x] MCPスタック無料化 → Algrow廃止・context7/youtube-mcp/brave-search導入
- [ ] YouTube API key / Brave API key の本番キー発行（現在はプレースホルダー）
- [ ] /schedule で月次メンテナンスを自動化（claude.ai接続エラーのため保留）
- [ ] 実運用フィードバックをもとにエージェント調整（副業案件受注後）
- [x] Claude.ai Project Custom Instructions の整備 → `.claude/templates/claude-project-custom-instructions.md` 完成済み
- [x] Skills記事踏襲強化 → 全11コマンドfrontmatter追加 / 14エージェントtrigger-phrase+effort追加
- [x] ConsultingOS最強化 → ultrathink(orchestrator+strategy-lead) / verification-loop Stopフック / PostToolUse設定変更ログ / brave-search MCP統合(3エージェント) / agent-evaluation.md新規作成(スキル38本)

---

## 学習事項（システム設計）

- スキルファイルに§番号がないと参照の曖昧さが生じる → 全スキルに§番号を付与
- ハンドオフが一方向チェックだと品質断絶が起きやすい → 双方向+受け取り拒否基準を追加
- エージェントの人格（キャリア×信念）が判断軸の一貫性を生む
- Auto Mode + Hooksで離席中も安全に長時間タスクが動く
- 新スキルをプロジェクト追加後、~/.claude/skills/ にシンボリックリンクを作らないと他リポジトリで使えない
- everything-claude-code（50K★）はスキルの宝庫だが全取込は不要。ConsultingOSの文脈で価値あるものだけ選定する
- フェイクコマンドリスト（/plan等）はラベルのみで中身がない。強さはプロセス設計にある
- 「信頼ベース設計」は脆い。スキルの実行をHooksで強制することで初めて機能する
- orchestratorは重くしすぎると自分がレートリミットで死ぬ。planning-with-filesで外部化が必須
- スキル数の表記ズレは信頼性を損なう。ファイル数確認後に即修正する
