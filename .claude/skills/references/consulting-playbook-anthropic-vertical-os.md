# Anthropic 垂直 OS 戦略 + 4 層アーキテクチャ（2026-05-14 統合）

`strategy-lead` + `competitive-analyst` + `product-manager` + `proposal-writer` 連携の横断 vertical AI-OS 分析フレーム。マスク 4 + アルトマン 7 + FDE 5 + Legora 5 + ドーシー 4 + a16z Defensibility 7 軸と並列で、Anthropic vertical 制圧戦略と「SaaS 死」テーゼを扱う。

出典:
- Anthropic Claude for Legal 発表 (2026-05-12、INFERENCE: ユーザー提示画像経由)
- Anthropic Claude for Small Business 発表 (2026-05-13、INFERENCE: ユーザー提示テキスト経由、一次出典 URL 別途確認推奨)
- Finatext Holdings グループ AI 戦略資料 (INFERENCE: ユーザー提示画像経由、Finatext 公式 IR / 決算資料推定)
- note.com/110_110_110 (Sierra vs Finatext 戦略比較、INFERENCE: ユーザー提示テキスト経由)

## 1. Anthropic 垂直制圧プレイブック

### 1.1 観察された順序

| 時期 | vertical | 対象 |
|---|---|---|
| 2026-05-12 | Legal | 法律事務所 / 企業法務、11 専門家 + Westlaw 等連携 |
| 2026-05-13 | Small Business | 中小企業バックオフィス、15 既製 skill + QuickBooks/Stripe/HubSpot 等連携 |
| 予測 (SPECULATION) | 金融 | Claude + Bloomberg + 銀行 API = 自動融資審査 / 資産運用 |
| 予測 (SPECULATION) | 医療 | Claude + 電子カルテ (Epic/Cerner) + 検査結果 = 診断支援 / 診療報酬請求自動化 |
| 予測 (SPECULATION) | 製薬 | Claude + 治験 DB + 規制当局 = 申請書類自動生成 |

### 1.2 共通プレイブック構造

1. モデル (Opus 4.7) = 「脳」
2. MCP = 「神経」（vertical 固有 SaaS 接続）
3. 業界別 skill / plugin = 「手足」（15 既製 workflow 等）
4. Human-in-the-loop = 承認ゲート（既存権限継承でセキュリティ不安解消）
5. 業界提携 + 教育コース（Claude for Small Business は PayPal 共同で全米 10 都市ツアー）

YOU MUST: B2B 提案で「自社業界が次の Anthropic vertical 制圧対象か」診断必須。対象なら参入 / 補完戦略、対象外なら独自 vertical OS 構築戦略を提案分岐。

## 2. SaaS 死テーゼ（AI に選ばれない SaaS は消える）

### 2.1 構造論理

- これまで: 「人間にとっての使いやすさ」で SaaS が競った
- 今後: 「AI にとっての使いやすさ (MCP 対応)」が生存条件
- データ孤島化: AI から指示を受け取れない / データを渡せない SaaS は「ユーザーから見て存在しない」と同義
- スイッチングコスト消滅: AI が裏側でデータ移行 + workflow 再構築 → UI 拘泥が無効化
- 結論: SaaS は「自社 UI を愛でる」のをやめ、「AI 部品として高精度データ供給」に全振りしないとワークフローから消去される

### 2.2 既存原則との接続

- a16z Defensibility 原則「Recreation risk」: 80% コモディティ vs エッジケース防御線と同型構造、SaaS 死は Recreation risk の物理現象化
- アルトマン式原則 3「垂直特化」: 「すべての会社は API カンパニー」発言と直接整合、本フレームは vertical 制圧の具体プレイブック
- アルトマン式原則 7「AI 採用遅延の戦略損失」: SaaS ベンダー側にも適用、「自社 UI 愛で」継続 = AI 採用遅延の典型症状

## 3. Finatext 4 層アーキテクチャ（具体実装例）

### 3.1 4 層構造

| 層 | 役割 | Finatext 該当 |
|---|---|---|
| エージェントレイヤー | データ AI サービス / カスタマイズ AI エージェント / パーソナル AI エージェント | 上位露出、顧客接点 |
| コンテキストレイヤー | 高精度かつ安全なデータ・AI 活用を実現するデータ・エージェント統制基盤 | 競争優位の中核 |
| ビジネスロジックレイヤー | AI と連携しやすい金融業務システム（SoR）| 金融インフラ |
| データレイヤー | 外部データ（自社管理）+ 外部データ（外部管理）| 業務データ蓄積 |

### 3.2 競争優位の構造

Finatext 主張: 「SoR」と「エージェント」を高精度・安全につなぐ「コンテキスト」レイヤーが一体 = 複雑業務の自律化実現。

### 3.3 戦略分岐: SoR 入口 vs エージェント入口

| 戦略 | 起点 | 例 |
|---|---|---|
| エージェント入口（Sierra 型）| エージェント / コンテキスト = エッジ侵食 → SoR へ | Sierra（AI agent）が SoR へ侵食 |
| SoR 入口（Finatext 型）| ビジネスロジック / データ = 基盤から積み上げ → エージェント | Finatext 金融インフラ → AI エージェント拡張 |
| 両方同時（Finatext 別事業並列）| 異なる事業ユニットで両戦略並列 | Finatext グループ内別法人で実行 |

YOU MUST: vertical AI-OS 提案で「どの層から入るか」を明示。エージェント入口 = 速い参入だが SoR 依存リスク、SoR 入口 = 重いが防御線厚い、両方同時 = リソース要件高い。

## 4. ConsultingOS への適用（自己診断）

### 4.1 4 層マッピング

| 層 | ConsultingOS 該当 |
|---|---|
| エージェントレイヤー | 27 agent + assistant orchestrator |
| コンテキストレイヤー | evolution-log + ICP.md + 反証チェック + ハードルール 17 体系 + 規律 hook 21 種 |
| ビジネスロジックレイヤー | 36 skill 体系（consulting-playbook / 業界別 playbook / OEM 手順）|
| データレイヤー | 顧客文脈（関根さん N&Y Craft / 水野さん投資文脈）+ 案件記録 |

### 4.2 ConsultingOS の戦略位置

- 戦略タイプ: エージェント入口（Sierra 型）から開始、現在コンテキスト + ビジネスロジック層を厚く整備中
- vertical: 日本 B2B コンサル提案 ワークフロー特化
- Anthropic 公式 vertical （Legal / Small Business）と非競合（コンサル vertical は未参入領域）
- 関根さん N&Y Craft OEM = vertical AI-OS の業界別 OEM 展開実証中

## 5. 水野さん 1000 万投資案件への適用（v4 投資テーゼ）

### 5.1 投資テーゼ核心

「Anthropic は Legal → Small Business と vertical AI-OS を順次制圧中、次は金融 / 医療 / 製薬。この trend に乗る vertical AI-OS 早期参入者が次世代の defensible business」

### 5.2 水野さん側に刺さる 3 ポイント

1. ジーニー卒業生視点: ad-tech SaaS = 「AI に選ばれない SaaS」リスクの内側を知る個人投資家として希少
2. 1000 万投資 justification: コンサル事業投資でなく「AI-OS verticalization trend への early bet」= ConsultingOS = 日本 B2B コンサル vertical AI-OS
3. 横展開機会: 金融 vertical AI-OS（地銀 / 信金 / 個人投資家向け）への投資パイプライン構築

### 5.3 v4 事業計画への組み込みポイント

- セクション「投資テーゼ」に Anthropic vertical 制圧プレイブック + Finatext 4 層構造を反映
- 競合分析セクションに「SaaS 死テーゼ」+「AI に選ばれない SaaS」リスク追加
- 中期戦略に「金融 vertical AI-OS 横展開」候補追加（水野さんの個人投資家ネットワーク活用）

## 6. ICP 提案質問 30-33 件目追加

`strategy-lead` + `proposal-writer` は提案時に追加で:

30. 自社業界が Anthropic 次期 vertical 制圧対象か診断、参入 / 補完 / 独自構築戦略を分岐選択しているか
31. 自社 SaaS / プロダクトが MCP 対応か、「AI に選ばれない SaaS」リスクを認識しているか
32. 4 層アーキテクチャ（エージェント / コンテキスト / ビジネスロジック / データ）のどこから入るか戦略明示しているか
33. データ供給側 / プラットフォーム側 / アプリケーション側のどこで競争優位を取るか定義しているか

## 7. ConsultingOS 自己診断（2026-05-14 時点）

| 軸 | 自己適用度 | 改善候補 |
|---|---|---|
| エージェント層 | 高 (27 agent) | エージェント間連携の自動化深化 |
| コンテキスト層 | 高 (evolution-log + ICP + hook 体系) | クライアント文脈の自動同期 |
| ビジネスロジック層 | 高 (36 skill) | 業界別 skill の充実（金融 / 医療 / 製薬は未着手）|
| データ層 | 中 (顧客文脈蓄積初期) | 関根さん / 水野さん案件の蓄積で改善 |
| Anthropic 公式 vertical との非競合 | 高 | コンサル vertical は未参入領域 = 機会窓 |

## 8. 関連参照

- Anthropic Claude for Legal (2026-05-12 発表、関連 skill: `.claude/skills/legal-playbook.md`)
- Anthropic Claude for Small Business (2026-05-13 発表、INFERENCE)
- Finatext Holdings グループ AI 戦略 (INFERENCE)
- 関連 skill: アルトマン式 7 原則（特に原則 3 垂直特化）/ a16z Defensibility 7 軸（特に Recreation risk）/ ドーシー流 4 原則（プロトタイプ持参 + 階層圧縮）
- 関連: 水野さん案件 `docs/handoff-mizuno-funding-v4.md` / 関根さん案件 `strategy/n-y-craft-oem-case/`

## 9. 反証チェック（Step 1-4 圧縮）

- Step 1: Anthropic 発表 (Legal / Small Business) はユーザー提示画像 / テキスト経由 INFERENCE、一次出典 URL 別途確認推奨 / Finatext 資料は INFERENCE / 「次は金融 / 医療 / 製薬」予測は SPECULATION
- Step 2: 既存 25 原則 + Defensibility 7 軸と整合検証、新規 3 概念（Anthropic vertical 制圧プレイブック / SaaS 死テーゼ / 4 層アーキテクチャ）の独立性確認
- Step 3: ConsultingOS 4 層自己診断は既存実装の物理化で実証済（27 agent / evolution-log / 36 skill / 顧客文脈）
- Step 4 リスク即潰し: 「水野さん v4 投資テーゼ不足」リスクは本 skill + handoff doc 更新で構造的に発生不可能化、次セッション継承担保
