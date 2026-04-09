# Dev Team — サービス開発チーム

> 起動条件: 新機能開発・API設計・AI機能統合・インフラ構築案件
> 対応パターン: CLAUDE.md パターン3（SaaSプロダクトの新機能開発）

---

## チーム構成

| メンバー | 役割 | 担当フェーズ |
|---|---|---|
| **tech-lead**（起点） | アーキテクチャ設計・技術選定 | Phase 1: 設計 |
| **ai-engineer** | AI機能・RAG・プロンプト設計 | Phase 1: AI設計（並列） |
| **fullstack-dev** | バックエンド・API・DB実装 | Phase 2: 実装 |
| **frontend-dev** | UI・コンポーネント実装 | Phase 3: UI |
| **infra-devops** | デプロイ・CI/CD・監視 | Phase 4: 本番化 |

---

## 実行フロー

```
[START]
tech-lead
  ├─ インプット: dev-intake.md + ユーザーストーリー・受け入れ基準
  ├─ タスク: アーキテクチャ設計・技術選定・実装前チェック
  ├─ 参照スキル: api-design-patterns §1 §2、engineering-playbook §1
  ├─ 必須出力: 【実装前チェック】失敗シナリオ3つ + 対策
  ├─ アウトプット: 設計ドキュメント（ERD / APIスペック / コンポーネント図）
  └─ /handoff to=fullstack-dev [AI機能あり: /handoff to=ai-engineer も並列]
         ↓（並列実行可）
ai-engineer（AI機能がある場合）
  ├─ インプット: tech-leadの設計ドキュメント
  ├─ タスク: LLM統合設計・RAGアーキテクチャ・プロンプトエンジニアリング
  ├─ 参照スキル: prompt-engineering §1 §3、engineering-playbook §2
  ├─ アウトプット: AI統合仕様 + プロンプトテンプレート
  └─ /handoff to=fullstack-dev
         ↓
fullstack-dev
  ├─ インプット: tech-leadの設計 + ai-engineerの仕様（AI機能あり）
  ├─ タスク: API実装・DB設計・ビジネスロジック
  ├─ 参照スキル: engineering-playbook §2、migration-safety §1、code-quality-gates §1
  ├─ 必須出力: 【実装前チェック】（CLAUDE.md準拠）
  ├─ アウトプット: 実装コード + テスト
  └─ /handoff to=frontend-dev [UIあり] or to=infra-devops [API単体]
         ↓
frontend-dev（UIあり）
  ├─ インプット: fullstack-devのAPI仕様 + デザイン仕様（Figmaリンク）
  ├─ タスク: UIコンポーネント実装・レスポンシブ対応
  ├─ 参照スキル: frontend-quality-guard §1 §2、creative-playbook §4
  ├─ 必須出力: 【フリーズチェック】（frontend-quality-guard準拠）
  ├─ アウトプット: フロントエンドコード
  └─ /handoff to=infra-devops
         ↓
infra-devops
  ├─ インプット: 全実装コード
  ├─ タスク: デプロイ設定・CI/CD・監視・コスト試算
  ├─ 参照スキル: engineering-playbook §4、incident-response §1
  ├─ アウトプット: デプロイ済み環境 + 監視設定 + README更新
  └─ /peer-review file=[実装コード] reviewer=tech-lead
         ↓
/peer-review（クロスレビュー）
  ├─ tech-lead: アーキテクチャ・セキュリティ・スケーラビリティを検証
  ├─ fullstack-dev（別観点）: バグ・エッジケース・パフォーマンスを検証
  └─ 問題あり → /handoff to=fullstack-dev（修正依頼）
     問題なし → deliverable-checklist.md で納品前確認（コード）
[END]
```

---

## 品質ゲート

| フェーズ | 確認内容 | 担当 |
|---|---|---|
| 設計完了 | 実装前チェック（失敗シナリオ3つ）が出力されているか | tech-lead |
| 実装完了 | テスト全パス・console.log除去・セキュリティスキャン | fullstack-dev |
| UI完了 | フリーズチェック・PageSpeed 90以上・SP/PC確認 | frontend-dev |
| デプロイ完了 | ゼロダウンタイム確認・ロールバック手順あり | infra-devops |

---

## チーム起動プロンプト

```
Dev Teamとして動いてください。
インテークファイル: .claude/intake/dev-intake.md（記入済み）
プロジェクトファイル: .claude/projects/[案件ファイル].md

tech-leadから開始し、/handoff コマンドで各メンバーに引き継いでください。
コードを1行書く前に必ず【実装前チェック】を出力してください。
```
