# ConsultingOS — Core Memory

> このファイルはセッション間で継続する「作業記憶」です。
> 各エージェントは起動時にここを読み、終了時に更新します。
> 更新方法: 該当セクションを直接編集、または `.claude/memory/archival/` にセッションサマリーを追記。

## 最終更新
- 日時: 2026-03-27
- 更新者: orchestrator
- 変更内容: スキル10本追加・エージェント14本更新・グローバルシンボリックリンク同期

---

## システム現状（最重要）

| 項目 | 値 |
|---|---|
| エージェント数 | 34（+ orchestrator） |
| スキル数 | 36（プロジェクト）/ 37（グローバル） |
| コマンド数 | 9 |
| グローバル同期 | ✅ ~/.claude/skills/ → すべてシンボリックリンク |
| ブランチ | claude/consulting-os-multiagent-YS5GK |

---

## アクティブプロジェクト

| プロジェクト名 | クライアント | フェーズ | 担当エージェント | 次のアクション |
|---|---|---|---|---|
| ConsultingOS構築 | 社内 | v2完成・運用中 | orchestrator | 月次claude-health実行・実運用フィードバック収集 |

---

## 重要な意思決定ログ

| 日付 | 内容 | 判断 | 根拠 |
|---|---|---|---|
| 2026-03-25 | 決済をStripe→Komojuに統一 | Go | 日本・アジア特化・手数料優位 |
| 2026-03-25 | Auto Mode実装 | Go | 長時間タスクの安全な自律実行 |
| 2026-03-25 | 反証モードDeep/Standard/Light深度設定 | Go | 省略防止・品質ゲート強化 |
| 2026-03-25 | ハンドオフ品質ゲート双方向化 | Go | 差し戻し基準の明文化で品質断絶防止 |
| 2026-03-27 | 外部スキル10本統合（superpowers/humanizer-ja等） | Go | 調査→実装→全エージェント配線まで完遂 |
| 2026-03-27 | グローバルシンボリックリンク修正 | Go | 他リポジトリでも新スキルが使えるよう修正 |
| 2026-03-27 | security-scan / strategic-compact 追加 | Go | everything-claude-codeから最高価値スキルを選定 |

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

- [ ] 月次 claude-health 実行（次回: 2026-04-27）
- [ ] 月次 security-scan 実行（orchestrator経由）
- [ ] 実運用フィードバックをもとにエージェント調整
- [ ] Claude.ai Project Custom Instructions の整備（CLAUDE.md非対応環境への対応）

---

## 学習事項（システム設計）

- スキルファイルに§番号がないと参照の曖昧さが生じる → 全スキルに§番号を付与
- ハンドオフが一方向チェックだと品質断絶が起きやすい → 双方向+受け取り拒否基準を追加
- エージェントの人格（キャリア×信念）が判断軸の一貫性を生む
- Auto Mode + Hooksで離席中も安全に長時間タスクが動く
- 新スキルをプロジェクト追加後、~/.claude/skills/ にシンボリックリンクを作らないと他リポジトリで使えない
- everything-claude-code（50K★）はスキルの宝庫だが全取込は不要。ConsultingOSの文脈で価値あるものだけ選定する
- フェイクコマンドリスト（/plan等）はラベルのみで中身がない。強さはプロセス設計にある
