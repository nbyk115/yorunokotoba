# FDE 時代戦略 5 原則（2026-05-09 統合、ConsultingOS 中核戦略）

`strategy-lead` + `client-success` + `ai-engineer` + `gtm-consultant` 連携の横断 5 原則。マスク式 4 + アルトマン式 5 と並列で、AI モデル提供 → 実装支援 (FDE) への業界転換期における ConsultingOS のポジショニングを定義。

出典:
- OpenAI Tomoro 買収 (40 億ドル超、FDE 150 名獲得、2026 年): https://openai.com/index/ (FACT、Reuters 経由)
- Anthropic + Blackstone / Hellman & Friedman / Goldman Sachs AI-native enterprise services 設立 (2026 年): https://anthropic.com/news/ (FACT、Reuters 経由)
- 「AI と共に知覚する時代」観: ユーザー Nobu 知見 (Yahoo Finance 引用、INFERENCE)

## 原則 1: FDE 民主化（モデルを売る → 業務に埋め込む）

業界転換: 「AI モデルが賢いか」競争 → 「企業内に埋め込んで成果を出せるか」競争へ。OpenAI / Anthropic 両社が FDE 部隊を持ち、企業内に入り経営陣 / 現場と連携、業務インフラ / ワークフローを再設計する流れが標準化。

YOU MUST: ConsultingOS 提案で「モデル性能」でなく「業務埋め込み深度 + ワークフロー再設計能力」を主訴求軸化。

ConsultingOS 整合: 既存 `consulting-playbook.md` §11「Palantir FDE 民主化版」+ 27 agent + 規律 hook = OpenAI / Anthropic 公式 FDE 部隊の「個人 / スモビジ版民主化」と同型構造。Tomoro 150 名規模を 1 人 + 27 AI agent で実現。

## 原則 2: 認知 OS 書き換え（AI と共に知覚する時代）

「AI を使う時代」→「AI と共に知覚する時代」への移行。AI の真価は「使っている」と感じないこと。AI が人間の感覚器そのものを拡張する段階。視覚偏重の人類知覚が空間 + 感情 + 直感の全方位へ取り戻される（INFERENCE: ユーザー Nobu 知見）。

YOU MUST: ConsultingOS 提案で「AI ツールを使う UI」でなく「業務フロー内に AI が溶け込んで気づかない設計」を訴求。「AI 利用感ゼロ」が目標値。

ConsultingOS 整合:
- 反証チェック / 字形検証 / 出典規律 = 全てユーザーが意識せず働く hook 物理化
- agent 並列起動 + statrategy-lead 統合 = orchestrator が裏で動き、ユーザーには結果のみ提示
- 「AI を使っている」意識を排除する設計思想と整合

## 原則 3: 業務インフラ再設計（既存業務への埋め込み）

FDE の本質は「業務インフラとワークフローの再設計」。AI ツール導入でなく、業務プロセス自体を AI 前提で組み替える。

YOU MUST: 既存業務を「自動化」でなく「再設計」の対象として扱う。営業 / 提案 / 法務 / マーケ等の各工程で「人間 → AI」「AI → 人間」のハンドオフ設計が成果差を生む。

ConsultingOS 整合:
- 27 agent ハンドオフ設計 = 業務インフラ再設計の物理実装
- 反証チェック Step 1-4 = 各工程の品質ゲート埋め込み
- ConsultingOS 自体が「コンサル業務の再設計プロトタイプ」

## 原則 4: 日本 AI コンサル / SI 市場ポジショニング

OpenAI / Anthropic は米国大企業中心。日本市場では言語 / 文化 / 法規制 / 商習慣の壁により、海外大手 FDE 部隊だけでは対応不可。

「日本の AI コンサル会社にチャンスあり」（ユーザー観察、INFERENCE）。市場構造:

| プレイヤー | ポジション | 規模 |
|---|---|---|
| OpenAI / Anthropic FDE | 米国大企業中心、グローバル展開準備中 | 数百名規模 |
| 日本 SIer 大手 | 既存システム連携、AI 経験浅い | 数千名規模 |
| 日本 AI コンサル新興 | AI ネイティブ、スモビジ / 中堅特化 | 1 人 - 数十名 |
| ConsultingOS (本体) | 個人版 FDE 民主化、OEM 提供可能 | 1 人 + 27 AI |

YOU MUST: ConsultingOS は「日本 AI コンサル新興 + AI ネイティブ」セグメントの OS として位置づけ。SIer 大手と戦わず、AI ネイティブの個人 / スモビジが「Tomoro 規模を 1 人で実現する」武器に。

## 原則 5: ConsultingOS = 「FDE が中にいる OS」（人間 + AI 接点設計）

最終的に AI 競争は「人間と AI の接点を最も自然に設計できるか」の戦いになる（INFERENCE: ユーザー Nobu 知見）。

ConsultingOS の本質的価値:
- 27 agent + skill + 規律 hook = 「FDE が常駐する企業内 AI 部隊」の個人版
- 業務に埋め込まれた AI が「気づかれず動く」設計
- ユーザーが「OS を使う」のでなく「OS で考える」状態

YOU MUST: ConsultingOS 提案で「ツールとしての AI」でなく「思考 OS としての AI」を訴求軸化。視認性のあるツール（チャット UI / ダッシュボード）でなく、不可視の orchestrator（裏で 27 体が動く）が本質。

## FDE 実装 4 ステッププロセス（2026-05-15 統合、関根さん Phase 1 実装フレーム）

原則論 (原則 1-5) に対する実行プロセス論。出典: ユーザー提示テキスト 2026-05-15 (INFERENCE、一次出典なし)。

| ステップ | 内容 | ConsultingOS 実装 |
|---|---|---|
| 1 現状把握 + 課題の握り込み | AI が状況把握できる権限 / データ接続、議事録 / 背景インプット + 経営課題の握り込み | document-creation-6-steps ① 論点設定 + Feynman method 理解確認 |
| 2 実行環境整備 | managed Agents + MCP (M365 / GCloud / Salesforce 等) | Anthropic Managed Agents (PR #189 判定) + MCP エコシステム |
| 3 モニタリング / Eval 整備 | Langfuse / Datadog / Snowflake で計測 → FB (改善) ループ | score-os-health.sh + outcomes-judge + dream pass (PR #192) |
| 4 カスタムツール作成 | スキル / サブエージェント の案件特化実装 | 60+ skill + 27 agent の案件別カスタム |

### 横断的に重要な 4 点

1. (1)-(4) を貫くアーキテクチャの見極め (案件ごとの構成判断)
2. 使い回せる部分の再利用モジュール化 (skill / agent の汎用化)
3. その後の Agent 起点 OS 化 (単発実装でなく OS 化)
4. 最初の課題の握り (ステップ 1 の経営課題定義が全体品質を決める)

### Palantir 版対比 (FACT、ユーザー提示)

| ステップ | Palantir | ConsultingOS |
|---|---|---|
| 1 | Foundry / Ontology | document-creation-6-steps + 反証チェック |
| 2 | 自社で実装 | Managed Agents + MCP |
| 3 | Foundry | score-os-health + dream pass |
| 4 | テンプレ化 (Workshop) | skill / sub-agent カスタム + OEM パッケージ化 |

Palantir は全工程に「チェンジマネジメント + FB ループ構築」を併走。ConsultingOS も関根さん Phase 1 で「業務 OS 化に伴う組織変化管理」を提案スコープに含める。

## ConsultingOS 自己診断（2026-05-09 時点）

| 原則 | 自己適用度 | 次セッション課題 |
|---|---|---|
| 1 FDE 民主化 | 高 (27 agent + skill 物理化) | 実クライアント案件で「Tomoro 規模 1 人実現」実証 |
| 2 認知 OS 書き換え | 中 (反証チェック裏稼働) | UI / UX で「AI 利用感ゼロ」設計の更なる徹底 |
| 3 業務インフラ再設計 | 中 (orchestrator フロー) | 関根さん / 水野さん案件で具体的な業務再設計事例化 |
| 4 日本市場ポジショニング | 中 (日本語 B2B 特化) | OEM パッケージ化で AI コンサル新興への提供準備 |
| 5 人間 + AI 接点設計 | 中 (assistant orchestrator) | 不可視 orchestrator の更なる物理化 |

## ICP への適用（提案時の標準質問 10-14 件目追加）

`strategy-lead` + `proposal-writer` は提案時に追加で:

10. AI モデル性能を競う段階か、業務埋め込み深度を競う段階かの自社認識（原則 1）
11. AI ツールの「利用感ゼロ」設計が UX 設計の主目的か（原則 2）
12. 既存業務の「自動化」でなく「再設計」を対象としているか（原則 3）
13. 日本市場特有の言語 / 文化 / 法規制適応戦略はあるか（原則 4）
14. 「AI を使う UI」でなく「AI で考える OS」を目指しているか（原則 5）

## 思想体系統合関係（マスク 4 + アルトマン 5 + FDE 5 = 計 14 原則）

| 軸 | マスク式 | アルトマン式 | FDE 式 |
|---|---|---|---|
| 評価指標 | 評判資本主義 (原則 2) | GDP インパクト (原則 4) | 業務埋め込み深度 (原則 1) |
| 実行 | アルゴリズム実行 (原則 4) | エージェント管理 CEO スキル (原則 2) | 業務インフラ再設計 (原則 3) |
| 真実認識 | Unkind Truth (原則 3) | 認知的帯域上限 (原則 1) | 認知 OS 書き換え (原則 2) |
| ポジション | インセンティブ設計 (原則 1) | 垂直特化 (原則 3) | 日本市場 / 不可視設計 (原則 4-5) |

3 思想家フレームが層構造で重なる: 思考 (マスク) + 経営 (アルトマン) + 実装 (FDE)。

## OpenAI FDE 公式 Job Description 6 capabilities（2026-05-14 追加）

OpenAI 公式 Forward Deployed Engineer 募集要項より、上位 FDE に求められる 6 能力（FACT、出典: openai.com/careers/forward-deployed-engineer、INFERENCE: ユーザー提示画像経由）:

| # | 能力 | 詳細 |
|---|---|---|
| 1 | 顧客課題の構造化 | 曖昧な要望を業務要件・技術要件へ整理 / 顧客の本質課題を見抜く |
| 2 | システム設計・実装力 | フルスタックで本番品質まで実装 / API・データ・クラウド踏まえた設計 |
| 3 | LLM / 生成 AI 活用力 | RAG・Agent・評価設計を理解 / モデル挙動と UX への影響を判断 |
| 4 | プロジェクト推進力 | 優先順位付け・スコープ調整・障害除去 / 速度・品質・納期のバランス |
| 5 | 本番運用・ガバナンス | セキュリティ・監査・信頼性を担保 / リスクを早期発見し対処 |
| 6 | 仕組み化と学習循環 | 成功パターンを Playbook 化・再利用 / 現場知見を Product / Research へ還元 |

コア資質 4 軸: 顧客理解 / 技術力 / 判断力 / やり切る力

定義: 「上位の FDE とは、単なる AI エンジニアではなく、顧客現場で AI を『使える形』にする技術責任者」

報酬 FACT (NY base、INFERENCE: ユーザー提示):
- 年俸: $162K – $280K
- Equity: あり

日本展開: 「日本でも近々ポジション openinng」予測 (SPECULATION、ユーザー提示)。

### ConsultingOS との対応マッピング

| OpenAI FDE 6 capabilities | ConsultingOS 該当 |
|---|---|
| 1 顧客課題の構造化 | strategy-lead + proposal-writer + 反証チェック Step 1 自己反証 |
| 2 システム設計・実装力 | tech-lead + fullstack-dev + infra-devops + ai-engineer |
| 3 LLM / 生成 AI 活用力 | ai-engineer + 21 hook + ハードルール 17 体系 |
| 4 プロジェクト推進力 | assistant orchestrator + ハードルール 6/7/12 (PR / commit 規律) |
| 5 本番運用・ガバナンス | brand-guardian + AI ガードレール 3 層 (PR #150) + Tom Griffiths 8 条件 (PR #148) |
| 6 仕組み化と学習循環 | evolution-log + 36 skill 体系 + 反証チェック Step 4 リスク即潰し |

= ConsultingOS は OpenAI FDE 6 capabilities 全件カバーする「個人版 FDE プラットフォーム」として既に物理化済 (PR #DI で FDE 民主化原則明示)。

## 関連参照

- 出典: OpenAI Tomoro 買収 / Anthropic + Blackstone 連携（Reuters 2026）
- ユーザー Nobu 知見「AI と共に知覚する時代」: Yahoo Finance 2026-05-09 (INFERENCE)
- 関連 skill: マスク式 4 原則 (`consulting-playbook-musk-*.md`)
- 関連 skill: アルトマン式 5 原則 (`consulting-playbook-altman-solopreneur.md`)
- 関連 skill: Anthropic Claude for Legal 統合 (`legal-playbook.md`)
- 関連: `consulting-playbook.md` §11「Palantir FDE 民主化版」既存記述

## 反証チェック（Step 1-3 圧縮）

- Step 1: OpenAI Tomoro 買収額 40 億ドル / FDE 150 名 / Anthropic + Blackstone 連携は Reuters 出典 FACT (二次)、一次 OpenAI / Anthropic 公式は別途確認推奨
- Step 2: ConsultingOS 既存規律 (`consulting-playbook.md` §11 Palantir FDE 民主化、マスク式評判資本主義、アルトマン式エージェント管理) と整合 / ハードルール 13 遵守 (agent 追加せず skill 1 件)
- Step 3: 14 原則統合体系は assistant 構築 INFERENCE、実クライアント案件での実証は次セッション課題
