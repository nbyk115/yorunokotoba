# Agentic Era Defensibility 7 軸（2026-05-14 統合、a16z Seema Amble）

`strategy-lead` + `competitive-analyst` + `product-manager` + `proposal-writer` 連携の横断 defensibility 分析フレーム。マスク 4 + アルトマン 7 + FDE 5 + Legora 5 と並列で、SaaS → Agentic Era の moat 移行を扱う。

出典: a16z Seema Amble「When Software Goes Headless, Where Does Defensibility Move?」(2026 年、INFERENCE: ユーザー提示画像経由、一次出典 URL 未確認)。Salesforce ヘッドレス化発表（API 開放、UI 剥離）を契機に、エージェント主導時代の防御線移行を体系化。

## 1. 7 軸比較表（SaaS Era vs Agentic Era）

| 軸 | SaaS Era | Agentic Era |
|---|---|---|
| Primary user | 人間 | エージェント (+ 人間 supervisor) |
| Primary interface | UI / dashboard | API / tools / agent workflow |
| System function | レコードを保存・表示 | ワークフローを起動・実行・更新 |
| Main moat | UI 採用 + 業務習慣 | proprietary data + closed-loop actions + real-world execution + network coordination |
| Role of data | 人間活動の記録 | proprietary data 結合 + action exhaust 捕捉 + outcomes 改善 |
| Source of stickiness | 筋肉記憶 / 訓練 / 日次利用 | Operating context（proprietary data + business-logic + permissions + edge-case coverage + outcome feedback + coordination）|
| Recreation risk | 移行困難（workflow が UI に住んでいる）| 最初の 80% は再現容易、エッジケースが防御線 |
| Startup opportunities | 既存 workflow の UX 改善 | actions/outcomes 所有 / 新データ収集 / parties 仲介 / 物理↔デジタル接続 |

## 2. 既存 21 原則体系との接続

- アルトマン式原則 3「ソフトウェア役割変容（垂直特化）」: 「すべての会社は API カンパニー」発言と本フレームの「ヘッドレス化」が直接接続。本フレームは moat 移行の構造化分解版
- アルトマン式原則 1「AI 1 人チーム」: 「Primary user = エージェント」軸と接続
- FDE 時代戦略原則 3「業務インフラ再設計」: 「Startup opportunities」4 類型と接続
- マスク式原則 3「Unkind Truth」: 「UI 採用 = 防御線」という SaaS 時代前提を直視して捨てる勇気

## 3. 新規 3 概念（既存 21 原則にない要素）

### 3.1 Recreation risk（80% コモディティ vs エッジケース防御線）

YOU MUST: 競合分析で「機能の 80% はコモディティ化する」前提に立ち、エッジケース（業務固有制約 / 規制 / 例外パス）の網羅率を defensibility の主軸にする。「機能の数」を訴求軸にする提案は SaaS 時代発想として却下。

ConsultingOS 自己診断: 27 agent + 36 skill 体系のうち、汎用 agent（fullstack-dev / frontend-dev 等）= 80% コモディティ側、規律 hook + 反証チェック + 日本語字形検証 + ハードルール 17 主語詐称禁止 = エッジケース防御線側。後者が ConsultingOS の真の moat。

### 3.2 Action exhaust（行動ログが proprietary data 化）

エージェントが実行した操作・成功失敗・修正履歴・mid-turn correction ログ全てが proprietary data 資産。SaaS 時代「人間活動の記録」を超えて「AI 行動の outcomes feedback loop」が新しい defensibility。

YOU MUST: AI 導入提案で「action exhaust の捕捉設計」を Phase 1 から組み込む。ログ設計を後回しにすると、6 ヶ月後に競合が action exhaust を持っているのに自社は何も持っていない構造になる。

ConsultingOS 自己診断: evolution-log.md = action exhaust 物理化（規律違反 / mid-turn correction / 学習エントリ）。stop hook + reality-check.sh + self-fraud-check.sh = action exhaust 自動収集機構。

### 3.3 Moat 4 要素分解（既存「垂直特化」より粒度細かい）

a16z 提示の Agentic Era moat = 4 要素の合成:
1. proprietary data: 顧客固有 / 業界固有 / 取引履歴
2. closed-loop actions: エージェントが実行 → 結果計測 → 改善のループ閉鎖
3. real-world execution: 物理世界 / 法務 / 金融 / 医療 等の実行可能性
4. network coordination: 複数エージェント / 複数ステークホルダー連携

YOU MUST: B2B 提案で 4 要素全てが揃っているか診断。1-2 要素しか揃っていない競合は中期で淘汰される前提で戦略設計。

ConsultingOS 自己診断（4 要素適用）:
- proprietary data: ICP.md / evolution-log / 関根さん N&Y Craft 案件文脈 / 水野さん投資文脈（FACT、ただし蓄積初期）
- closed-loop actions: 反証チェック Step 4「リスク即潰し」+ 形式達成度 vs 真の 100 区別 = ループ閉鎖の物理化
- real-world execution: 関根さん OEM 案件 = 実クライアント ROI 検証中（INFERENCE: Phase 1 着手前）
- network coordination: 27 agent 並列起動 = 単一 OS 内連携、複数顧客 / 複数 OEM 連携は将来課題

## 4. ICP 提案質問 22-25 件目追加

`strategy-lead` + `proposal-writer` は提案時に追加で:

22. 機能の 80% コモディティ化を前提とし、エッジケース網羅率を defensibility 主軸として測定しているか（原則 Defensibility 3.1 Recreation risk）
23. AI エージェントの action exhaust（実行履歴 / 成功失敗 / 修正ログ）を Phase 1 から捕捉設計しているか（原則 Defensibility 3.2 Action exhaust）
24. Moat 4 要素（proprietary data / closed-loop actions / real-world execution / network coordination）のうち何要素揃っているか（原則 Defensibility 3.3 Moat 分解）
25. SaaS 時代の moat 前提（UI 採用 / 業務習慣 / muscle memory）に依存していないか自己診断しているか（原則 Defensibility 全体）

## 5. ConsultingOS 自己診断（2026-05-14 時点）

| Defensibility 軸 | ConsultingOS 現状 | 評価 |
|---|---|---|
| proprietary data | ICP.md / evolution-log / 顧客文脈 | 中（蓄積初期）|
| closed-loop actions | 反証チェック Step 4 + 規律 hook 体系 | 高（物理化済）|
| real-world execution | 関根さん / 水野さん案件（Phase 1 前）| 低（実証待ち）|
| network coordination | 27 agent 並列、複数顧客連携は将来 | 中 |
| Recreation risk 防御 | 規律 hook + 字形検証 + 主語詐称検出 | 高 |
| Action exhaust 捕捉 | evolution-log + stop hook | 高 |

ギャップ最大: real-world execution（関根さん Phase 1 / 水野さん事業計画 v4 が未着手 = 実 ROI 未検証）。Boris #2 の「証明なしで complete マークしない」と同型。

## 6. 関根さん / 水野さん案件への適用

### 6.1 関根さん N&Y Craft OEM（提案軸として）

OEM 提案で「あなたの会社の moat はどう移行するか」診断を Phase 1 オンボーディング標準フローに組み込む候補。Recreation risk 軸で「N&Y Craft の独自エッジケース（クラフトビール業界 / D2C / 関根さんの人脈ネットワーク）」を defensibility 設計の起点化。

### 6.2 水野さん 1000 万投資（事業計画 v4 への組み込み）

事業計画 v4 書き直し時、Moat 4 要素分解を pitch deck に反映候補:
- proprietary data: 投資家ネットワーク + 業界知見
- closed-loop actions: 投資 → ROI 計測 → 次投資の改善ループ
- real-world execution: 退任後個人投資家としての実行履歴
- network coordination: ジーニー卒業生 + マーケ業界人脈

## 7. 関連参照

- 出典: a16z Seema Amble「When Software Goes Headless, Where Does Defensibility Move?」(2026 年、INFERENCE)
- 関連 skill: アルトマン式 7 原則（特に原則 3 ソフトウェア役割変容）/ FDE 時代戦略 5 原則 / マスク式 4 原則
- 関連: orchestration-protocol §2.7 Strategy ⇄ Execution 循環
- 関連: 関根さん案件 `strategy/n-y-craft-oem-case/` / 水野さん案件 `docs/handoff-mizuno-funding-v4.md`

## 8. 反証チェック（Step 1-4 圧縮）

- Step 1: a16z Seema Amble 出典は INFERENCE（ユーザー提示画像経由、一次出典 URL 未確認）/ 7 軸内容は画像転記 FACT / ConsultingOS 自己診断は INFERENCE（実クライアント ROI 未検証）
- Step 2: 既存 21 原則体系（マスク 4 + アルトマン 7 + FDE 5 + Legora 5）と整合、新規 3 概念は独立性確認済（Recreation risk / Action exhaust / Moat 4 要素分解）
- Step 3: 本 skill は分析フレーム、実機検証は関根さん Phase 1 / 水野さん v4 着手後
- Step 4: リスク即潰し: 「real-world execution が低」ギャップは関根さん Phase 1 / 水野さん v4 で解消予定（既存 handoff ファイルに着手手順物理化済）。本セッション内で潰せる追加リスクなし
