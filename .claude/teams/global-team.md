# Global Team — 海外展開チーム

> 起動条件: 海外市場参入・GTM設計・ローカライズ・海外規制対応案件
> 対応パターン: CLAUDE.md パターン12（SaaSプロダクトを海外展開したい）、パターン13（海外規制変更のインパクト分析）

---

## チーム構成

| メンバー | 役割 | 担当フェーズ |
|---|---|---|
| **gtm-consultant**（起点） | GTM戦略設計・市場評価フレーム | Phase 1: 市場評価 |
| **global-journalist** | 現地市場リサーチ・規制動向 | Phase 1: リサーチ（並列） |
| **global-business** | 現地オペレーション・商習慣・パートナー | Phase 2: 実行設計 |
| **legal-compliance-checker** | 現地法規制・コンプライアンス | Phase 2: 法務（並列） |
| **kpi-analytics** | グローバルPL試算・感度分析 | Phase 3: 数値化 |
| **business-translator** | ローカライズ・トランスクリエーション | Phase 4: 現地対応 |

---

## 実行フロー

```
[START]
gtm-consultant
  ├─ インプット: global-intake.md + 自社プロダクト情報
  ├─ タスク: 対象市場の優先順位付け・参入モデル選定
  ├─ 参照スキル: global-expansion-playbook §1 市場評価フレームワーク、§2 参入モデル設計
  ├─ アウトプット: 市場スコアリング + 推奨参入モデル
  └─ /handoff to=global-journalist [並列: /handoff to=legal-compliance-checker]
         ↓（並列実行）
global-journalist                   legal-compliance-checker
  ├─ タスク: 現地市場・競合・規制動向    ├─ タスク: 参入規制・ライセンス・データ法
  ├─ 参照スキル:                       ├─ 参照スキル:
  │   global-expansion-playbook §7    │   consulting-playbook §8
  ├─ 情報グレード基準: A/B以上のみ      ├─ アウトプット: 法的リスクレポート
  ├─ アウトプット: 現地リサーチレポート  └─ /handoff to=global-business
  └─ /handoff to=global-business
         ↓（両方完了後）
global-business
  ├─ インプット: GTM方針 + リサーチ + 法務リスク
  ├─ タスク: オペレーション設計・現地パートナー条件・商習慣アダプテーション
  ├─ 参照スキル: global-expansion-playbook §4 §5
  ├─ アウトプット: 現地オペレーション設計書
  └─ /handoff to=kpi-analytics
         ↓
kpi-analytics
  ├─ インプット: 全フェーズのアウトプット
  ├─ タスク: グローバルPL試算（為替リスク込み）・ブレイクイーブン・感度分析
  ├─ 参照スキル: unit-economics §1 §4、revenue-growth-framework §7 グローバル展開
  ├─ アウトプット: 海外展開PLシミュレーション（楽観/標準/悲観）
  └─ /handoff to=business-translator [ローカライズが必要な場合]
         ↓
business-translator
  ├─ インプット: 全成果物（日本語）
  ├─ タスク: 現地語へのトランスクリエーション（翻訳を超えた文化的適合）
  ├─ 参照スキル: global-expansion-playbook §3 ローカライズ品質基準
  ├─ アウトプット: ローカライズ済み資料（現地語）
  └─ → deliverable-checklist.md で納品前確認
[END]
```

---

## 情報品質基準（Global部門必須）

| グレード | 基準 | 使用可否 |
|---|---|---|
| A | 一次情報（直接インタビュー・公式統計） | ✅ 使用可 |
| B | 信頼できる二次情報（Reuters・業界団体） | ✅ 使用可 |
| C | 推計含む三次情報 | ⚠️ 注記必須 |
| D | 未検証・ソース不明 | ❌ 使用禁止（差し戻し対象） |

---

## チーム起動プロンプト

```
Global Teamとして動いてください。
インテークファイル: .claude/intake/global-intake.md（記入済み）
プロジェクトファイル: .claude/projects/[案件ファイル].md

gtm-consultantから開始し、/handoff コマンドで各メンバーに引き継いでください。
global-journalistとlegal-compliance-checkerは並列実行してください。
情報グレードD（未検証）データの使用は禁止です。
```
