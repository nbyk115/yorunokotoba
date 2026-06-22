# Glean ADLC (Enterprise Agent Development Lifecycle) 7 段階 統合 (2026-05-15)

`strategy-lead` + `tech-lead` + `infra-devops` + `ai-engineer` + `client-success` + `legal-compliance-checker` 連携の AI エージェント本番展開ライフサイクル。AI エージェントを「業務ソフトウェア」として扱う統制 + スケーラビリティ確保。

出典: Glean Enterprise Agent Development Lifecycle (martechseries.com 2026-05 発表、INFERENCE: ユーザー提示テキスト + URL 経由、本セッション fetch 未実施)。

## 1. 7 段階ライフサイクル

| 段階 | 内容 | ConsultingOS 既存対応 |
|---|---|---|
| 1 業務課題の特定 | 解くべき問題の明確化 | strategy-lead + ICP.md + document-creation-6-steps (PR #166) ① 論点設定 |
| 2 設計 | エージェント設計・職務定義 | creative-director / tech-lead + 27 agent description |
| 3 成功指標の定義 | KPI / 受け入れ基準明示 | kpi-analytics + /goal 受け入れ基準 (PR #176) |
| 4 社内データとの接続 | データソース統合 | MCP 連携 (Figma + GitHub) + Anthropic 垂直 OS 4 層 (PR #133) |
| 5 開発・テスト | 実装 + 検証 | tech-lead + fullstack-dev + 反証チェック Step 1-4 |
| 6 公開 | 本番展開 | brand-guardian + ハードルール 17 (主語詐称禁止 + Phased Preamble) |
| 7 運用改善 | 継続管理・改善 | evolution-log 4 週間再評価 + gbrain (PR #168) + Dreaming (PR #175) |

## 2. 「AI エージェントを業務ソフトウェアとして扱う」哲学

YOU MUST: AI エージェント = チャットツールでなく業務ソフトウェアとして扱う。具体的には:

1. 権限制御 (Permission Control)
2. 実行ログの可視化 (Audit Trail)
3. Agent Library (再利用可能なエージェントカタログ)
4. 効果測定ダッシュボード (Performance Dashboard)
5. 統制しながら全社展開 (Governance at Scale)

= 10-Agent パターン (PR #155) + AI ガードレール 3 層 (PR #150) + Tom Griffiths 8 条件 (PR #148) と統合運用。

## 3. ConsultingOS との対応マッピング

### 3.1 権限制御

| Glean ADLC | ConsultingOS 既存 |
|---|---|
| ロール・権限管理 | settings.json permissions / dangerouslyDisableSandbox 制御 |
| データアクセス制御 | Hard Rule 3 (.env / credentials 禁止) |
| 不可逆操作の承認 | Hard Rule 15 (delete / force push 承認必須) |

### 3.2 実行ログ可視化

| Glean ADLC | ConsultingOS 既存 |
|---|---|
| エージェント実行ログ | git log + PR ベース全履歴保存 |
| トークン消費追跡 | Karpathy 12 ルール 6 (PR #138) トークン予算 |
| 監査可能性 | Tom Griffiths 8 条件 (PR #148) #5 |

### 3.3 Agent Library

| Glean ADLC | ConsultingOS 既存 |
|---|---|
| 再利用可能なエージェント | 27 agent (6 部門) + 53 skill 体系 |
| バージョン管理 | git で全 agent description / skill 履歴管理 |
| 共有 / 配布 | OEM ベースキット (PR #DF) = 関根さん N&Y Craft 展開 |

### 3.4 効果測定ダッシュボード

| Glean ADLC | ConsultingOS 既存 |
|---|---|
| KPI ダッシュボード | kpi-analytics agent + Hard Rule 1 真の 100 原則 |
| ROI 測定 | proposal-writer PL 思考 (consulting-playbook §3) |
| トークン ROI | LLM 推論メカニクス (PR #169) + Prompt Cache Prewarm (PR #173) |

### 3.5 統制しながら全社展開

| Glean ADLC | ConsultingOS 既存 |
|---|---|
| 全社展開ガバナンス | ハードルール 17 体系 + 反証チェック + 21 hook 機械検証 |
| 段階展開 | Boris #3 + 4 週間再評価カレンダー |
| 監査可能性 | brand-guardian 機械検証 + 主語詐称禁止 |

## 4. Gap 分析 (Glean ADLC が ConsultingOS を exceed する軸)

| Gap | ConsultingOS 現状 |
|---|---|
| Agent Library カタログ UI | ConsultingOS は git ベース、UI なし (将来候補) |
| 効果測定ダッシュボード UI | kpi-analytics 出力テキストベース、可視化 UI なし |
| 全社展開時の階層別権限 | 個人運用前提、組織展開時の階層権限テンプレ未明示 |

Boris #3 遵守: 上記 Gap は実需確認後の段階導入。OEM 顧客 3 件以上獲得 + 組織展開要望発生時に着手。

## 5. ConsultingOS 自己診断 (7 段階適用度)

| 段階 | 適用度 |
|---|---|
| 1 業務課題の特定 | 強 (PR #166 6 ステップ ①) |
| 2 設計 | 強 (27 agent + 53 skill) |
| 3 成功指標の定義 | 強 (/goal 受け入れ基準 PR #176) |
| 4 データ接続 | 中 (MCP 3 個 + Anthropic 垂直 OS 4 層 PR #133) |
| 5 開発・テスト | 強 (反証チェック Step 1-4) |
| 6 公開 | 強 (PR ベース + Squash merge + ブランド規律 5 項目) |
| 7 運用改善 | 強 (evolution-log + Dreaming PR #175 + gbrain PR #168) |

= 7 段階中 6 強 / 1 中、Agent Library UI + 効果測定 UI が中期検討候補。

## 6. 関根さん N&Y Craft OEM への適用パス

Phase 1 構築時に 7 段階を順次実行:

| 段階 | 関根さん N&Y Craft 具体タスク |
|---|---|
| 1 業務課題 | クラフトビール業界 OEM 業務 OS 化、Phase 1 範囲明示 |
| 2 設計 | 27 agent から N&Y Craft 向けカスタマイズ、ICP.md 作成 |
| 3 成功指標 | /goal 完了条件: 125 ファイル + ICP + DESIGN + 反証 (PR #176) |
| 4 データ接続 | N&Y Craft 内部データ (在庫 / 配送 / 顧客対応) MCP 候補 |
| 5 開発・テスト | brand-guardian 機械検証 + 反証チェック |
| 6 公開 | 関根さん承認 → OEM ベースキット展開 |
| 7 運用改善 | 月次顧問契約 + Dreaming + Krishna 月次レポート (PR #179) |

## 7. 水野さん v4 投資テーゼ補強

7 段階フレームを投資先評価軸化:

「投資先企業が Glean ADLC 7 段階を物理化しているか」= AI 駆動企業の成熟度判定軸。
- 7 段階全件物理化 → 投資優位
- 5 段階以下 → 構造的リスク

水野さん個人投資家として Glean ADLC を投資判断 checklist 化可能。

## 8. ICP 提案質問 101-103 件目追加

101. AI エージェント運用を「チャットツール」でなく「業務ソフトウェア」として 7 段階ライフサイクル管理しているか (Glean ADLC)
102. 権限制御 / 実行ログ / Agent Library / 効果測定ダッシュボード / 全社展開ガバナンスの 5 軸を整備しているか
103. 各エージェントの「業務課題特定 → 設計 → 成功指標 → データ接続 → 開発テスト → 公開 → 運用改善」7 段階を物理化しているか

## 9. 関連参照

- 出典: Glean Enterprise Agent Development Lifecycle (martechseries.com 2026-05、INFERENCE)
- 関連 skill: AI ガードレール 3 層 (PR #150) / Tom Griffiths 8 条件 (PR #148) / 10-agent パターン (PR #155) / 5 Orchestration Patterns (PR #158) / document-creation-6-steps (PR #166) / /goal 受け入れ基準 (PR #176) / Dreaming (PR #175) / gbrain (PR #168) / Anthropic 垂直 OS (PR #133)
- 関連 agent: strategy-lead + tech-lead + infra-devops + ai-engineer + client-success + legal-compliance-checker + brand-guardian
- 関連 hard rules: 17 主語詐称禁止 + 3 (.env 禁止) + 15 (不可逆操作承認)

## 10. 反証チェック (Step 1-4 圧縮)

- Step 1: Glean ADLC 内容 INFERENCE (martechseries.com 経由、本セッション fetch 未実施) / 7 段階分類 FACT (ユーザー提示)
- Step 2: 既存 AI ガードレール + Tom Griffiths 8 条件 + 10-agent パターン + 5 Orchestration Patterns + Hard Rule 17 体系と整合検証、新規性は「7 段階明示 + Agent Library + 効果測定ダッシュボード」
- Step 3: ConsultingOS 自己診断 7 段階中 6 強 / 1 中、関根さん N&Y Craft Phase 1 で実機検証可能
- Step 4 リスク即潰し: Agent Library UI + 効果測定 UI gap は Boris #3 で OEM 3 件以上獲得後、本 PR は 7 段階フレームの認知 + マッピングのみで構造的完結
