# Consulting Team — 戦略提案チーム

> 起動条件: 市場参入・競合分析・戦略立案・提案書作成案件
> 対応パターン: CLAUDE.md パターン2（クライアントへの戦略提案書）、パターン5（新規事業参入判断）

---

## チーム構成

| メンバー | 役割 | 担当フェーズ |
|---|---|---|
| **competitive-analyst**（起点） | 市場・競合の構造分析 | Phase 1: 調査 |
| **strategy-lead** | 戦略立案・Go/No-Go判定 | Phase 2: 戦略 |
| **kpi-analytics** | PL試算・KPI設計 | Phase 2: 数値化 |
| **proposal-writer** | 提案書・資料化 | Phase 3: アウトプット |

---

## 実行フロー

```
[START]
competitive-analyst
  ├─ インプット: consulting-intake.md + クライアント情報
  ├─ タスク: 市場構造分解・競合マップ・参入機会特定
  ├─ 参照スキル: consulting-playbook §4 市場構造分解、first-principles-breakdown §1
  ├─ アウトプット: 市場調査ドラフト（.claude/templates/market-research-report.md 準拠）
  └─ /handoff to=strategy-lead
         ↓
strategy-lead
  ├─ インプット: competitive-analystのアウトプット + PL前提条件
  ├─ タスク: 勝ち筋特定・フロー×ストック統合設計・Go/No-Go判定
  ├─ 参照スキル: revenue-growth-framework §1 §4、consulting-playbook §8
  ├─ アウトプット: 戦略方針（結論・根拠・施策一覧）
  └─ /handoff to=kpi-analytics [並列: to=strategy-leadが直接続く場合はスキップ]
         ↓
kpi-analytics
  ├─ インプット: strategy-leadの戦略方針
  ├─ タスク: 3年PLシミュレーション（楽観/標準/悲観）・感度分析・ブレイクイーブン
  ├─ 参照スキル: unit-economics §1 §5、revenue-growth-framework §1
  ├─ アウトプット: PLスプレッドシート + 数値サマリー
  └─ /handoff to=proposal-writer
         ↓
proposal-writer
  ├─ インプット: 全フェーズのアウトプット統合
  ├─ タスク: strategy-proposal.md テンプレートで最終提案書作成
  ├─ 参照スキル: consulting-playbook §8、ppt-presentation §4 スティーブ・ジョブズ プレゼン原則
  ├─ アウトプット: 最終提案書（クライアント納品物）
  └─ → deliverable-checklist.md で納品前確認
[END]
```

---

## 品質ゲート

| フェーズ | 確認内容 | 担当 |
|---|---|---|
| Phase 1完了 | 情報グレードA/B以上・ソース付き数値のみ使用 | competitive-analyst |
| Phase 2完了 | Go/No-Go根拠・PLインパクット数値あり | strategy-lead |
| Phase 3完了 | 感度分析3シナリオ・ブレイクイーブン明示 | kpi-analytics |
| Phase 4完了 | brand-guardian §6品質ゲート通過 | proposal-writer |

---

## チーム起動プロンプト

```
Consulting Teamとして動いてください。
インテークファイル: .claude/intake/consulting-intake.md（記入済み）
プロジェクトファイル: .claude/projects/[案件ファイル].md

competitive-analystから開始し、/handoff コマンドで各メンバーに引き継いでください。
各フェーズの品質ゲートを通過してから次に進んでください。
```
