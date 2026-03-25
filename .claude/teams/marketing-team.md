# Marketing Team — マーケティング&リサーチチーム

> 起動条件: マーケティング全体戦略・広告/SEO/CRM/SNS/PR改善案件
> 対応パターン: CLAUDE.md パターン4（コンテンツマーケティング）、フルファネル改善

---

## チーム構成

| メンバー | 役割 | 担当フェーズ |
|---|---|---|
| **marketing-director**（起点） | 全体戦略・チャネルミックス・予算配分 | Phase 1: 戦略 |
| **market-researcher** | 消費者調査・セグメンテーション | Phase 1: リサーチ（並列） |
| **marketing-analyst** | GA4・アトリビューション・KPI設計 | Phase 1: 計測設計（並列） |
| **performance-marketer** | 広告運用・ROAS最適化 | Phase 2: 獲得チャネル |
| **seo-specialist** | テクニカルSEO・コンテンツSEO | Phase 2: オーガニック（並列） |
| **crm-ma-strategist** | CRM/MA・ナーチャリング | Phase 2: 育成チャネル（並列） |
| **social-media-strategist** | SNS戦略・インフルエンサー | Phase 2: SNS（必要時） |
| **pr-communications** | PR・メディアリレーション | Phase 2: PR（必要時） |

---

## 実行フロー

```
[START]
marketing-director
  ├─ インプット: marketing-intake.md + 現状KPI数値
  ├─ タスク: 課題特定・チャネル優先順位・予算配分・KPI設計
  ├─ 参照スキル: marketing-research-playbook §1、digital-sales-intelligence §1
  ├─ アウトプット: マーケティング戦略方針（チャネル別KPI・予算配分）
  └─ /handoff to=market-researcher [並列: /handoff to=marketing-analyst]
         ↓（並列実行）
market-researcher              marketing-analyst
  ├─ タスク: 消費者調査・         ├─ タスク: GA4設定確認・
  │   セグメンテーション         │   アトリビューション設計・
  ├─ 参照スキル:                 │   現状KPI数値整理
  │   marketing-research-      ├─ 参照スキル:
  │   playbook §4 §5           │   marketing-research-playbook §7
  └─ /handoff to=戦略方針統合    └─ /handoff to=戦略方針統合
         ↓（両方完了後 → marketing-directorが統合）
marketing-director（統合）
  ├─ タスク: リサーチ + 計測データを統合して実行プランを確定
  └─ /handoff to=各チャネル担当（以下並列）
         ↓（チャネル別に並列実行）
performance-marketer          seo-specialist           crm-ma-strategist
  ├─ 広告運用設計               ├─ テクニカルSEO監査        ├─ CRM/MAフロー設計
  ├─ ROAS目標・入札戦略          ├─ キーワード戦略           ├─ ナーチャリング設計
  ├─ 参照スキル:                ├─ 参照スキル:             ├─ 参照スキル:
  │   digital-sales-           │   marketing-research-   │   marketing-research-
  │   intelligence §1 §2       │   playbook §6           │   playbook §3
  └─ /handoff to=             └─ /handoff to=           └─ /handoff to=
     marketing-director(統合)    marketing-director        marketing-director
         ↓（全チャネル完了後）
marketing-director（最終統合）
  ├─ タスク: 全チャネル施策を統合・KPIダッシュボード設計・実行カレンダー作成
  └─ /peer-review file=[マーケ施策設計] reviewer=kpi-analytics
         ↓
/peer-review（クロスレビュー）
  ├─ kpi-analytics: KPI設計の妥当性・計測漏れ・PLインパクット試算を検証
  ├─ legal-compliance-checker: 景表法・薬機法・広告規制への準拠を確認
  └─ 問題あり → /handoff to=marketing-director（修正依頼）
     問題なし → deliverable-checklist.md で納品前確認
[END]
```

---

## チャネル別起動判定（最小構成）

案件によって不要なチャネルはスキップする:

| 課題 | 必須メンバー | スキップ可能 |
|---|---|---|
| 広告ROASが悪い | performance-marketer + marketing-analyst | crm, sns, pr |
| SEO流入が少ない | seo-specialist + content-strategist | performance, crm |
| リードが育たない | crm-ma-strategist + marketing-analyst | performance, seo |
| ブランド認知が低い | pr-communications + social-media-strategist | performance |
| 全体改善 | 全員 | なし |

---

## チーム起動プロンプト

```
Marketing Teamとして動いてください。
インテークファイル: .claude/intake/marketing-intake.md（記入済み）
プロジェクトファイル: .claude/projects/[案件ファイル].md

marketing-directorから開始し、/handoff コマンドで各メンバーに引き継いでください。
market-researcherとmarketing-analystは並列実行してください。
チャネル担当は案件の課題に応じて最小構成で起動してください。
```
