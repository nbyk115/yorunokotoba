# Creative Team — クリエイティブ・コンテンツチーム

> 起動条件: LP制作・UI/UX設計・コンテンツ戦略・ブランディング案件
> 対応パターン: CLAUDE.md パターン1（新サービスのLPを作りたい）、パターン4（コンテンツマーケティング）

---

## チーム構成

| メンバー | 役割 | 担当フェーズ |
|---|---|---|
| **creative-director**（起点） | 方針策定・ブリーフ・ツール選定 | Phase 1: ブリーフ |
| **ux-designer** | UXフロー・ワイヤーフレーム・LP設計 | Phase 2: UX設計 |
| **frontend-dev** 🎨 | Figma→HTML・コンポーネント実装 | Phase 3: 実装 |
| **content-strategist** | コピーライティング・コンテンツ設計 | Phase 2: コンテンツ（並列） |
| **brand-guardian** | ブランド整合・品質チェック | Phase 4: QA |

---

## 実行フロー

```
[START]
creative-director
  ├─ インプット: creative-intake.md + クライアントブランドガイドライン
  ├─ タスク: クリエイティブブリーフ作成・ツール選定（Figma or Canva）・訴求軸決定
  ├─ 参照スキル: creative-playbook §1 デザインツール選定、brand-guidelines §1
  ├─ アウトプット: lp-brief.md 記入済み + デザイン方針
  └─ /handoff to=ux-designer [並列: /handoff to=content-strategist]
         ↓（並列実行）
ux-designer 🎨                    content-strategist
  ├─ タスク: UXフロー・ワイヤーフレーム    ├─ タスク: コピー・セクション文章
  ├─ 参照スキル: creative-playbook §2   ├─ 参照スキル: creative-playbook §6
  ├─ アウトプット: Figmaワイヤーフレーム  ├─ アウトプット: 全セクションのコピー
  └─ /handoff to=frontend-dev         └─ /handoff to=frontend-dev
         ↓（両方完了後）
frontend-dev 🎨
  ├─ インプット: Figmaデザイン + コンテンツコピー
  ├─ タスク: HTML/CSS/React実装・レスポンシブ対応
  ├─ 参照スキル: frontend-quality-guard §1 §2、creative-playbook §7 パフォーマンス基準
  ├─ 必須出力: 【フリーズチェック】
  ├─ アウトプット: 実装済みLP
  └─ /handoff to=brand-guardian
         ↓
brand-guardian
  ├─ インプット: 実装済みLP
  ├─ タスク: ブランドガイドライン準拠確認・品質ゲート
  ├─ 参照スキル: brand-guidelines §1 §3 §6
  ├─ アウトプット: 承認 or 修正指示リスト
  └─ /peer-review file=[LP] reviewer=growth-hacker
         ↓
/peer-review（クロスレビュー）
  ├─ growth-hacker: CVR・ファネル・CTAの有効性・A/Bテスト案を検証
  ├─ brand-guardian: すでにQAフェーズで担当済み（二重確認）
  └─ 問題あり → /handoff to=ux-designer or frontend-dev（修正依頼）
     問題なし → deliverable-checklist.md で納品前確認（LP）
[END]
```

---

## 品質ゲート

| フェーズ | 確認内容 | 担当 |
|---|---|---|
| ブリーフ完了 | ターゲット（状況ベース）・訴求軸・KPIが定義済み | creative-director |
| UX設計完了 | ユーザーフロー全セクション・CTAの位置・モバイル考慮 | ux-designer |
| 実装完了 | フリーズチェック・PageSpeed 90以上・SP/PC目視確認 | frontend-dev |
| QA完了 | brand-guidelines §6 全チェック通過 | brand-guardian |

---

## チーム起動プロンプト

```
Creative Teamとして動いてください。
インテークファイル: .claude/intake/creative-intake.md（記入済み）
プロジェクトファイル: .claude/projects/[案件ファイル].md

creative-directorから開始し、/handoff コマンドで各メンバーに引き継いでください。
ux-designerとcontent-strategistは並列実行してください。
```
