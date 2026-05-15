# ConsultingOS: コンサルティング・プレイブック

## 概要
コンサルティング部門の全エージェントが参照する標準手法・フレームワーク・思考原則。
小野寺信行（電通デジタル）と佐藤裕介（フリークアウト/STORES）の知見を統合。

---

## 1. 指標変革 -「CPA至上主義」からの脱却

### 小野寺メソッド: 指標を疑う
クライアントが「CPA改善したい」と言っても、即座にCPA施策に走らない。

**診断フロー:**
1. **本当の課題は何か？** → ブランド認知不足かもしれない
2. **ファネルのどこで詰まっているか？** → 認知→興味→検討→購入の各段階を数値で確認
3. **指標は目的に合っているか？** → ブランディングにCPAは不適切

### 目的別指標マトリクス
| 目的 | 主要指標 | 避けるべき指標 |
|---|---|---|
| ブランド認知 | SOV, リーチ, ブランドリフト | CPA, CVR |
| 育成 | エンゲージメント率, コンテンツ消費 | CPC |
| 獲得 | CPA, CVR, ROAS | インプレッション |
| リテンション | LTV, チャーン率, NPS | 新規CPA |

---

## 2. フロー×ストック統合設計

### 小野寺メソッド: 施策のストック化
単発施策（フロー）だけでなく、資産として積み上がる施策（ストック）を常にセットで提案する。

| タイプ | 特徴 | 例 |
|---|---|---|
| **フロー施策** | 即効性あり、止めたら効果ゼロ | 広告配信, キャンペーン, PR |
| **ストック施策** | 効果蓄積、時間とともに価値増大 | SEOコンテンツ, 顧客DB, ブランド |
| **統合施策** | フローでストックを加速 | 広告→LP→メアド取得→ナーチャリング |

### 提案テンプレート
```
【フロー施策】即効性のある〇〇を実施
【ストック施策】並行して△△を蓄積
【統合設計】フローの成果を□□としてストック化
【期待効果】X ヶ月後にフロー依存度を Y% 低減
```

---

## 3. PL思考: 全提案を数字で語る

> **詳細フレームワーク → `revenue-growth-framework.md` §1**

### 佐藤メソッド: 粗利インパクトで判断
どんな提案も最終的にPLに落とす。「いい施策」ではなく「儲かる施策」を基準にする。

**必須出力項目:**
- **粗利インパクト**: この施策で粗利がいくら変わるか
- **ブレイクイーブンポイント**: いつ投資回収できるか
- **ユニットエコノミクス**: LTV / CAC の比率（最低3倍以上）
- **感度分析**: 楽観/標準/悲観の3シナリオ

**PLチェック（コピペ用）:**
```
□ 粗利インパクト: ¥___万/月
□ ブレイクイーブン: __ヶ月
□ LTV/CAC: __倍
□ 感度分析: 楽観¥___万 / 標準¥___万 / 悲観¥___万
```

---

## 4. 市場構造分解

> **詳細フレームワーク → `revenue-growth-framework.md` §4**

### 佐藤メソッド: 構造から入る
施策の前に「この市場でどういう構造を持つプレイヤーが勝つか」を分解する。

**クイック分析（コピペ用）:**
```
□ TAM: ¥___億 → SAM: ¥___億 → SOM: ¥___億
□ 勝ちパターン: ネットワーク型 / 規模型 / ブランド型 / 技術型 / データ型
□ 自社適合度: 高 / 中 / 低（根拠:___）
□ 参入判断: Go / No-Go / 条件付きGo
```

---

### VRIO分析（内部資源の競争優位性評価）
| 基準 | 問い | Yes→ | No→ |
|---|---|---|---|
| Value（価値） | その資源は市場機会を活かせるか？ | 次へ | 競争劣位 |
| Rarity（希少性） | 競合が持っていないか？ | 次へ | 競争均衡 |
| Imitability（模倣困難性） | 競合が簡単に真似できないか？ | 次へ | 一時的優位 |
| Organization（組織） | その資源を活用する組織体制があるか？ | 持続的競争優位 | 未活用資源 |

→ strategy-leadがS1参入判断・S2中期計画で使用。competitive-analystが競合のVRIOを分析。

---

## 5. アセット優先原則

> **詳細（蓄積コスト・複利効果・予算配分ガイド）→ `revenue-growth-framework.md` §3**

### 佐藤メソッド: 蓄積する資産を最優先
止めたらゼロになる消耗施策より、積み上がる資産を優先する。

**資産5分類:**
| 資産 | 例 | 判定: 今の施策は蓄積されるか？ |
|---|---|---|
| 顧客資産 | 顧客DB, 1stPartyデータ | □ はい □ いいえ |
| コンテンツ資産 | SEO記事, ケーススタディ | □ はい □ いいえ |
| ブランド資産 | 認知, 信頼, ポジション | □ はい □ いいえ |
| 技術資産 | プロダクト, データ基盤 | □ はい □ いいえ |
| ネットワーク資産 | コミュニティ, パートナー | □ はい □ いいえ |

---

## 6. コンテクスト設計

### 小野寺メソッド: 「人」ではなく「状況」で定義
ターゲットを「30代男性」ではなく「今どんな状況にある人か」で定義する。

**コンテクスト設計フレームワーク:**
1. **状況**: ユーザーは今どんな状況にいるか
2. **動機**: なぜこの瞬間に情報を求めているか
3. **期待**: どんな情報・体験を期待しているか
4. **障壁**: 行動を阻む要因は何か
5. **トリガー**: 行動を促す最適な刺激は何か

---

## 7. ファーストパーティデータ戦略

### 小野寺メソッド: 1stParty中心設計
外部データ（3rd Party Cookie等）への依存を最小化し、自社データを中心に戦略を構築する。

**優先度:**
1. **1st Party Data**: 自社で直接取得（最優先）
2. **Zero Party Data**: ユーザーが自発的に提供
3. **2nd Party Data**: パートナー経由（信頼性を確認）
4. **3rd Party Data**: 外部購入（リスク認識必須）

---

## 8. 商談・提案の標準プロセス

### Phase 1: リード精査（proposal-writer）
- BANT / MEDDIC による案件評価
- Go / No-Go / 要精査の判定

### Phase 2: 課題分析（competitive-analyst + kpi-analytics）
- 市場構造の分解
- 競合ポジション分析
- 数値ベースの課題特定

### Phase 3: 戦略立案（strategy-lead）
- 勝ち筋の特定
- PL思考での施策設計
- フロー×ストック統合計画

### Phase 4: 資料化（proposal-writer）
- 結論ファーストの提案書
- 数値根拠の明示
- ROI・ブレイクイーブンの提示

### Phase 5: 実行・追跡（kpi-analytics）
- KPIモニタリング
- 指標の目的別評価
- 改善サイクルの実行

---

## 9. グローバル展開への適用

### コンサル×グローバルの統合原則
国内向けコンサルフレームワークを海外市場に適用する際の追加考慮事項。

**指標変革のグローバル適用:**
- 目的別指標マトリクス（§1）を市場ごとにローカライズ。先進国と新興国でファネル構造が異なる
- 1stPartyデータ戦略（§7）は各国の個人情報保護法（GDPR/CCPA等）に準拠した設計が必須

**PL思考のグローバル適用:**
- 為替リスクを感度分析に含める（§3の楽観/標準/悲観に通貨変動シナリオを追加）
- 現地の人件費・インフラコストでユニットエコノミクスを再計算
- ブレイクイーブンは国内より長め（12-24ヶ月）を基準に設定

**コンテクスト設計のグローバル適用:**
- §6のフレームワークを現地文化で再定義。「状況」「動機」「障壁」は市場ごとに大きく異なる
- `content-strategist`と連携し、言語だけでなく文化的コンテクストも翻訳

**商談プロセスのグローバル適用:**
- Phase 1（リード精査）: 海外案件は`gtm-consultant`が市場評価を先行
- Phase 2（課題分析）: `market-researcher`が現地市場の最新動向を提供
- Phase 3（戦略立案）: 現地の商習慣・意思決定構造を`gtm-consultant`（Post-Entry節）が補完

### グローバル連携先
- `gtm-consultant`: 市場参入戦略・GTM設計・現地オペレーション・商習慣（Post-Entry）
- `market-researcher`: 現地市場リサーチ・国際動向
- `content-strategist`: ローカライゼーション・トランスクリエーション

---

## 10. イノベーションのジレンマ: 破壊される前に破壊する

> **佐藤裕介の「プロダクトバリュー2年陳腐化」の構造的根拠がクリステンセンのイノベーションのジレンマ。**
> 既存顧客の声を聞き、利益率の高いセグメントに投資する「正しい経営」をしているうちに、ローエンドから破壊者に市場を奪われる。

### 破壊的イノベーション診断フレームワーク

**Step 1: 自社が破壊される側か判定する**
```
□ 既存顧客の要望に応え続けている（持続的イノベーション偏重）
□ 利益率の高い上位セグメントに集中している
□ 「機能が少ないが安い/手軽な」代替品が出現している
□ 非消費者（今まで使っていなかった層）が新規参入者を使い始めている
□ 自社が「オーバースペック」になっている（顧客が使いきれない機能がある）
→ 3つ以上該当したら破壊リスク高。strategy-leadに即報告
```

**Step 2: 破壊する側になれるか判定する**
```
□ 既存プレイヤーが「利益にならない」と無視しているセグメントがあるか
□ そのセグメントに「十分良い」プロダクトを低コストで提供できるか
□ 既存プレイヤーのビジネスモデルでは対抗できない構造か（対抗するとPLが壊れる）
□ 時間とともに性能が向上し、上位セグメントに侵食できるか
→ 全て該当したら破壊的イノベーションの機会。参入検討
```

**Step 3: 対策の設計**
| 状況 | 対策 | 担当 |
|---|---|---|
| 破壊される側 | 別組織で破壊的事業を立ち上げる（既存事業と分離） | strategy-lead |
| 破壊する側 | ローエンドから参入し、徐々に上位侵食 | strategy-lead + product-manager |
| 判断がつかない | competitive-analystに破壊シグナルの定点観測を依頼 | competitive-analyst |

### 破壊シグナルの定点観測項目
- 新規参入者の動向（特に「機能は劣るが安い/手軽」なプレイヤー）
- 非消費者セグメントの動き（今まで市場にいなかった層が突然参入）
- 自社の「オーバーシューティング率」（顧客が使いきれない機能の割合）
- 下位セグメントの離脱率変化

---

## 11. ICP.md: プロジェクト固有のターゲット憲法

> **CLAUDE.md（行動）/ DESIGN.md（見た目）/ ICP.md（ターゲット）の三位一体で中央参照。**

### ICP.mdとは
プロジェクトルートに置く**Ideal Customer Profile**の定義ファイル。
全マーケ系・コンサル系エージェントが自動参照する。

「誰のために作っているか」が全エージェントで統一されないと、アウトプットがブレる。
market-researcherのシナリオでその場しのぎで作るのではなく、**永続化**する。

### ICP.mdの必須セクション

```markdown
# ICP.md: [プロジェクト名]

## Primary ICP（主要ターゲット）
| 項目 | 内容 | Why |
|---|---|---|
| デモグラ | 25-35歳女性・都市部在住 | スマホ占いの主要利用層 |
| サイコグラ | 自己理解欲求・不安傾向・スピ好き | 占い課金モチベーションの源 |
| 利用文脈 | 朝の通勤中・夜寝る前 | 習慣化しやすい時間帯 |
| 未充足ニーズ | 「当たる」ではなく「寄り添ってほしい」 | 既存占いアプリの盲点 |
| 支払意欲 | 月500-980円 | PSM分析結果 |
| チャネル接触 | Instagram/TikTok/友人紹介 | オーガニック経由が主 |

## Secondary ICP（副次ターゲット）
[必要に応じて記述]

## Non-ICP（ターゲット外）
[明示的に除外するセグメント。ブレ防止]
- 例: 「毎日占いをする必要がない人」→ ターゲット外

## ペルソナ代表例
### ペルソナA: [名前]
- 年齢/性別/職業:
- 1日の過ごし方:
- 抱えている課題:
- 占いとの接点:
- 課金する瞬間:
```

### 適用エージェント（ICP.md自動参照）
- `market-researcher`: ペルソナ更新時の根拠データとして
- `marketing-director`: チャネルミックス判断の基準
- `performance-marketer`: オーディエンス設計の起点
- `content-strategist`: コンテンツトーン判定
- `proposal-writer`: 提案書のターゲティング節の出典
- `product-manager`: 機能優先順位判断の基準

### メンテナンス
- 四半期ごとに `market-researcher` がICP.mdを見直し
- 新データが入ったら即更新（Why列に根拠を明示）
- 変更履歴は `evolution-log.jsonl` に追記

### 注意
- ConsultingOS本体には置かない。**各プロジェクトのルート**に置く
- コンサル案件では**クライアントごとに別ICP.md**を作る
- 複数ICP.mdが必要な場合は `icp/client-a.md`, `icp/client-b.md` のように分ける

---

## 小野寺信行（電通デジタル / DII Connect）の追加フレーム
- **3Sフレーム（動画広告 × ファネル）**: Show（認知）/ Story（自分ゴト化）/ Sale（next action）の3段階で、それぞれ専用 KPI（再生数・好意度・CVR）。混在計測禁止
- **広告体験ガード**: ROAS 効率最大化が UX を毀損していないか必ず検証。「数値目標が優先されるあまりユーザーの広告体験が配慮されていない」状態を反証
- **ナーチャリングのオムニチャネル原則**: オウンドメディア・店頭パンフ・メルマガ・他デジタル施策をシナリオで統合。デジタル単体最適は局所解
- **代理店は R&D 機関**: 「運用屋」ではなく「プラットフォーム研究機関」へ。グローバル協業前提（出典: [MarkeZine](https://markezine.jp/article/detail/39924) / [Trade Desk Press Room](https://www.thetradedesk.com/jp/press-room/dentsu-digital-aims-to-transform-marketing-methods-in-an-era-of-increasingly-complex-advertising-environments)）

## 佐藤裕介（フリークアウト/STORES）の追加フレーム
- **3変数交点**: 技術 × ユーザー × 市場構造の3変化が重なる地点だけが勝つ。1つでも欠けると「良いプロダクトだが負ける」になる
- **コンセンサス疑念**: 「みんなが良いという施策」は反射的に疑う。コンセンサスの根拠を3レベル分解する
- **タイミング設計**: 市場名を出すときは必ず（黎明期 / 拡大期 / 成熟期）のラベルと根拠を付記
- **アセット帰属診断**: 「使い込むほど顧客資産が事業者側に残る」モデルを優先。フィー継続型のみは中間業者に価値が漏れるため警告
- **5年蓄積前提の業界精通**: 速読・要約では到達できない。5年スパンの一次情報蓄積が業界精通の唯一の道
- **JDで組織を作る**: ヒーロー依存より職務定義の精度（出典: [STARTUP DB](https://journal.startup-db.com/articles/hey) / [Digiday](https://digiday.jp/modern-retail/interview-with-stores-yusuke-sato/) / [Diamond](https://diamond.jp/articles/-/335825)）
- **新市場挑戦**: 「参入できる力があるのに挑戦しない」を最大リスクとして指摘

---

## 全エージェント共通の出力ルール
1. **出力順序**: 結論 → 根拠 → 具体アクション
2. **数値化**: 「大幅に」→「30%改善」「粗利XX万円増」
3. **禁止**: 抽象論・「様子を見る」・PLに落ちない提案
4. **言語**: 日本語優先

---

## 営業手法: 「成果物プレビュー」（佐藤裕介流 3 変数交点の実装）

> 出典: Damian Player ひとり社長プレイブック + Hotice 案件で実証済（2026-05-02 学習）

### 原則
従来の「ご提案させてください → 見積もり → 検討 → 失注」ループを否定。AI で先回りして完成形を作り、見せて、刺さったら売る。

### 実装手順
1. ターゲット選定（Google Maps 等で ★4.0 以上 + レビュー 20 件以上 + ホームページ古い or 無し の 3 条件）
2. 既存レビュー / 公開情報を ChatGPT に投げて骨子を 2 分で生成
3. AI ウェブサイトビルダー（Lovable / Framer / Webflow / Wix AI）で 1 時間で完成
4. ライブプレビューを業者に見せる（電話 / DM / 訪問）
5. 「気に入ったら買ってください」で受注

### 効果
属人営業の禁（佐藤裕介流）を破らずに「構造で売る」を実現。営業 = 成果物作成プロセスとなり、再現性が確保される。

### プロトタイプ・ファースト原則（Anthropic 開発速度学習・2026-05-02）
1 案件あたり 10〜20 個のプロトタイプを数時間で作り、実際に使って良いものだけを残す。仕様書（PRD）2 週間執筆 → 1 案実装よりも、20 案を AI に作らせて反証モード Step 3 で評価する方が AI 時代には有利。出典: Anthropic Claude Code チーム開発プロセス + Felix Rieseberg「実行コストはほぼゼロ」発言。

### Taste at Speed（PM / proposal-writer / product-manager 必須スキル）
大量プロトタイプから「どれが良いか」を素早く判断するセンス。仕様書を書く能力ではなく、選別する能力に価値が移る。反証モード Step 3 と統合して運用。「なぜそれが良いか」を説明する前に「それが良い」と判断できる感覚を磨くこと。

### 禁止事項
- ToS 違反スクレイピング（Cloudflare 突破 / bot 偽装、Scrapling 系）
- 1 日 500 通の自動コールドメール（特定電子メール法違反）
- 「ご提案させてください」方式（時間浪費・成約率低下）
- 「PRD を完璧に書いてから実装」方式（プロトタイプ・ファースト原則違反、ただし B2B コンサル案件の正式提案書は対象外）

---

## マネジメント記憶構造化（client-success / proposal-writer / proposal-writer 共通）

> 出典: マネジメント記憶構造化フレーム（2026-05-02 学習）

### 3 記憶類型の分離原則

クライアント情報・案件情報を扱う際は以下 3 類型を必ずファイル分離（同一ファイルに混ぜると AI 検索精度低下）。

| 記憶類型 | 内容 | 例（ConsultingOS 内） |
|---|---|---|
| エピソード記憶 | 時系列ログ（いつ・誰が・何をした）| evolution-log / examples/<案件>/1on1-log.md |
| 意味記憶 | 知識・ルール・方針・OKR・期待役割 | CLAUDE.md / DESIGN.md / ICP.md / context/ |
| 手続き記憶 | 行動パターン・ワークフロー・型 | .claude/skills/ / 1on1-template.md |

### 適用シーン

- クライアント月次顧問契約: メンバーごとにフォルダ分離（`<client>/members/<name>/`）、3 類型のファイルを必ず分離
- 1on1 記録 → 月次振り返り → 半期評価 の自然積み上げ設計
- 「ツール出力は後でまた必要か？結論だけあればいいか？」でサブエージェント委譲判断

### ConsultingOS 既存構造との整合
ConsultingOS は既に類似構造を運用中（CLAUDE.md = 意味 / evolution-log = エピソード / skills = 手続き）。本セクションは明示化と client-success / proposal-writer の月次顧問契約商品化に向けた整理。

---

> 反証モード（トリプルチェック）の共通ルールは CLAUDE.md を参照。

---

## スモールビジネス即活用 4 ステップ（2026-05-03 みるぼん流取り込み）

`strategy-lead` + `kpi-analytics` + `proposal-writer` 連携で、単独事業者・1-3 名の小規模事業者向けに即活用可能な実践フレーム。

### ステップ 1: ビジネスプロセスの細分化（全体像 + リスク）

事業を 1 枚絵で書けるか検証。受注 → 制作 → 納品 → 請求 → 入金 → リピート の 6 段階で各段階の所要時間 / コスト / 失敗パターンを表化、隣接段階のボトルネックを特定。

### ステップ 2: 受注 / 売上ルートの軸別分解（佐藤裕介流の核心）

「売上の源泉を抽象的に語らない」が原則。直販 / 紹介 / 既存リピート / 法人提携 / マイクロ B2B の 5 ルートで分解、各ルートの確度・期待売上・CAC・想定 LTV を 1 表で。

### ステップ 3: 事業 KSF = Secret Thesis 1 文

「業界コンセンサスと違うが正しい仮説」を 1 文で言語化（Peter Thiel "Zero to One" の Secret Thesis 論）。「なぜ自分でないとダメか」を 3 年経っても模倣されないコアコンピタンスとして特定、競合 3 社との比較表で差別化要素を可視化。

### ステップ 4: 簡易計画 = 行動 KPI + 撤退判断 + 行動習慣化

行動 KPI（週次 / 月次の必達数値）+ 撤退判断（数値で事前定義）+ 行動習慣化（朝・昼・夜のルーティン組み込み）の 3 点セット。

### 既存 ConsultingOS スキルとの位置関係

| 既存 | 4 ステップとの関係 |
|---|---|
| `first-principles-breakdown` | ステップ 1（プロセス細分化）と整合 |
| `revenue-growth-framework` | ステップ 2（受注ルート分解）の上位フレーム |
| `falsification-check` | ステップ 3（Secret Thesis 反証）と整合 |
| `agent-evaluation` | ステップ 4（行動 KPI モニタリング）と整合 |

「4 ステップは既存スキルの統合運用テンプレ」として位置付け、スキル新設は不要（CLAUDE.md ハードルール 13 遵守）。

### 出典

- [Peter Thiel "Zero to One"](https://www.amazon.com/Zero-One-Notes-Startups-Future/dp/0804139296)（Secret Thesis 論の出典）
- 大企業向け 20 ステップ標準フレームは `docs/external-references.md` §10 に「公開コンセンサス・参照のみ」で記録、ConsultingOS への取り込みは対象外（佐藤裕介判断）

---

## 事業化マインドセット: 小さく始めて致命傷を避ける（2026-05-06 BMR 流統合）

`strategy-lead` + `proposal-writer` + `kpi-analytics` + `market-researcher` 連携で、ConsultingOS 自身および ICP の事業化判断に適用する Phase 0 上流ゲート。前節「スモビジ即活用 4 ステップ」が事業内部運用（下流）であるのに対し、本節は「立ち上げる / 撤退する」の上流判断を担う。

### 致命傷を避ける 2 原則（BMR スモビジ研究所 2024-09-13、INFERENCE: 2026 年現在も有効）

YOU MUST: 新規事業 / 中期計画 / M&A 検討の全シナリオで Step 0 ゲートとして適用。

「原則 1: 初期投資を極限まで減らす」: オフィス契約 / 専従採用 / 広告大量出稿 / 在庫先行確保 / システム作り込み = 撤退コストを跳ね上げる地雷。代替は自宅 / 業務委託 / オーガニック獲得 / 受注ベース仕入れ / SaaS 組み合わせ。ConsultingOS 自身: $0 投資、Claude Code 従量課金のみ。

「原則 2: 6 ヶ月以内に継続可否ジャッジ」: 撤退ラインを着手前に数値で定義（月次粗利 X 万円 / 月次新規 Y 件 / LTV/CAC Z 倍）、6 ヶ月で未達なら機械撤退。`strategy-lead` 提案時に明文化、`kpi-analytics` 月次モニタ、`client-success` がエスカレーション。

### Palantir FDE 民主化版 × 挑戦回数最大化

Palantir 60 億ドル赤字 20 年のスタートアップ式とは構造が異なり、ConsultingOS は初期投資ゼロ + 自己資本のみで挑戦回数を最大化するスモビジ式に近い。27 エージェント × 27 スキル並列運用、案件ごとに最適チーム編成、当たり筋を高速発見、特定領域失敗が全体を毀損しない疎結合設計。

### SIer 業界 IT 人材 79 万人不足を補完する論理

経産省試算「2030 年 IT 人材 79 万人不足」（日経クロステック 2026 経由、INFERENCE: 数値は調査により幅あり）に対し、SIer の人月固定費モデルが限界に達する一方、ConsultingOS は 27 エージェント並列処理で人件費ゼロ × 案件数 10x スケール可能。NEVER: 「SIer 代替」訴求は敵を増やす、「SIer が取れない領域の補完」（中堅企業 / 個人 PE / 中小代理店）と訴求（佐藤裕介流市場構造設計）。

### 連携プレイブック（事業化判断 5 Phase）

| Phase | 担当 | アウトプット |
|---|---|---|
| 0 致命傷ゲート | strategy-lead | 初期投資抑制チェック + 撤退ライン明文化 |
| 1 市場構造 | market-researcher + competitive-analyst | TAM/SAM/SOM + Beachhead 特定（monopoly-positioning §6 連携）|
| 2 PL 試算 | kpi-analytics | 6 ヶ月粗利推移 + ブレイクイーブン + サンクコスト |
| 3 提案資料化 | proposal-writer | 撤退ライン込み提案書、感情論排除の構造提示 |
| 4 月次モニタ | kpi-analytics + client-success | 撤退ライン未達自動エスカレーション |

> 出典: BMR スモールビジネス研究所（note 2024-09-13、INFERENCE）/ 日経クロステック「2030 年 IT 人材 79 万人不足」（経産省「IT 人材需給調査」引用、SPECULATION）/ Palantir FDE 民主化論（docs/external-references.md 山崎レポート）

---

## マスク式 4 原則（2026-05-08 統合 + 拡張、references/ 分離）

`strategy-lead` + `client-success` + `marketing-director` + `tech-lead` + `infra-devops` 連携の横断原則。思考 2 + 実行 2 の体系。前節 §11「致命傷を避ける 2 原則」が立ち上げ / 撤退判断、本節は日常運用 + 資産化 + コミュニケーション + 実行プロセスを担う。

- 思考原則 1 インセンティブ設計: 罰則 / 報酬対称配置、漸進 vs 大胆比率宣言、失敗コスト上限管理
- 思考原則 2 評判資本主義: 「現金 = 遅行指標」vs「評判 / 知識 / 実証 ROI = 真の資産」、ハードルール 1「真の 100」と整合
- 実行原則 3 Unkind Truth（William Meijer 図）: 短期摩擦を許容して長期機能性を選ぶ、Kind Lie 排除、反証チェック / 阿諛禁止が物理化
- 実行原則 4 アルゴリズム（マスク 31 原則）: 5 ステップ（要件疑義 / 削除 / 簡素化 / サイクル加速 / 自動化）順序適用、削除 10% リバウンド / 物理法則のみルール

詳細: 思考 [`references/consulting-playbook-musk-incentive.md`](references/consulting-playbook-musk-incentive.md) / 実行 [`references/consulting-playbook-musk-execution.md`](references/consulting-playbook-musk-execution.md)

## アルトマン式ソロ創業戦略 11 原則 (2026-05-15 更新): AI 1 人チーム / エージェント管理 CEO スキル / 垂直特化 / GDP / 実践 5 件 / データアクセス / AI 採用遅延 / アイデアマン逆襲 / 現実主義 / 資本主義再設計 / 決意 (Determination、3-4 標準偏差異常値)。詳細: [`references/consulting-playbook-altman-solopreneur.md`](references/consulting-playbook-altman-solopreneur.md)

## FDE 時代戦略 5 原則 (2026-05-09): モデル → 実装 / 認知 OS 書き換え / 業務インフラ再設計 / 日本市場 AI コンサル / 人間+AI 接点設計。OpenAI Tomoro / Anthropic + Blackstone 動向反映。詳細: [`references/consulting-playbook-fde-era.md`](references/consulting-playbook-fde-era.md)

## Agentic Era Defensibility 7 軸 (2026-05-14、a16z Seema Amble): SaaS 時代 vs Agentic 時代の moat 移行（Primary user / Interface / System function / Main moat / Role of data / Stickiness / Recreation risk / Startup opportunities）。新規 3 概念: Recreation risk（80% コモディティ vs エッジケース防御線）/ Action exhaust（行動ログ proprietary data 化）/ Moat 4 要素分解。詳細: [`references/consulting-playbook-agentic-era-defensibility.md`](references/consulting-playbook-agentic-era-defensibility.md)

## ドーシー流ミニ AGI 化企業 4 原則 (2026-05-14、Block 創業者): 3 役割集約（IC / DRI / プレイヤーコーチ）/ ロードマップ創発（顧客クエリ自動生成）/ 会議プロトタイプ持参（cost-of-trying ゼロ化）/ 階層圧縮（5 層 → 2-3 層、中間管理職廃止）。Block 4,000 人レイオフで AI 中核化転換。詳細: [`references/consulting-playbook-dorsey-mini-agi.md`](references/consulting-playbook-dorsey-mini-agi.md)

## Anthropic 垂直 OS 戦略 + Finatext 4 層 (2026-05-14): Legal → Small Business → 金融 / 医療 / 製薬予測の vertical 制圧プレイブック。SaaS 死テーゼ（AI に選ばれない SaaS は消える）。Finatext 4 層（エージェント / コンテキスト / ビジネスロジック / データ）。Sierra 型エージェント入口 vs Finatext 型 SoR 入口の戦略分岐。水野さん v4 投資テーゼ起点。詳細: [`references/consulting-playbook-anthropic-vertical-os.md`](references/consulting-playbook-anthropic-vertical-os.md)

## BCG 生成 AI 普及 3 フェーズ + 数値ファクト (2026-05-14): フェーズ I 生成 AI の台頭（今、ツール普及 + 倫理ガイドライン）/ フェーズ II データの競争（1-3 年後、独自データ収集）/ フェーズ III Age of AI Disruption（3 年後超、品質 / 機能 / コスト全部 AI で再構成）。BCG 数値 FACT: 楽観派 52% / アップスキリング必要 86% vs 実施 14% / 経営層 68% 自信 vs 現場 29% 対策不十分。proposal-writer 用の引用元 FACT。詳細: [`references/consulting-playbook-bcg-3phases.md`](references/consulting-playbook-bcg-3phases.md)

## ダーク・ファクトリー流ソフトウェア開発 3 原則 (2026-05-14、サイモン・ウィリソン): 人間レビュー除去 + プロ品質維持の両立構造 / Agent 群れ QA シミュレーション（StrongDM 月 1 万ドル 24/7 QA 実例）/ 責任設計の未解決問題。ConsultingOS = コンサル業界のダーク・ファクトリー早期実装。詳細: [`references/consulting-playbook-dark-factory.md`](references/consulting-playbook-dark-factory.md)

## ExaWizards 3P 戦略ベンチマーク + AX 6 壁 + TAM 22 兆円 (2026-05-14): 日本 AI 業務 OS 最大競合の構造化。3P (People / Platform / Product) + AX 6 壁（何から始めるか / セキュリティ / データ基盤 / 専門人材 / PoC 止まり / 現場使われない）+ Dynatrace FACT（日本 11% vs グローバル 50%）+ TAM 22 兆円（BPO 5.7 + SI 8.7 + AI システム 4.2 + 保守 3.3 + BPR 0.15）。ConsultingOS は中小 / 個人 / OEM vertical 特化で差別化。詳細: [`references/consulting-playbook-exawizards-benchmark.md`](references/consulting-playbook-exawizards-benchmark.md)

## Anthropic CFO 指数関数思考 3 原則 (2026-05-14): 線形 vs 指数関数の意思決定軸 / 指数関数にあえて乗りにいく能動的選択 / 多層指数関数の構造観察。CFO 入社時 ARR $2.5 億 → 計画 $10 億、CEO Dario の指数関数予測が一貫して当たり続けた経験。「他のビジネスとは違う進化」前提受容。関根さん / 水野さん予測モデル直接適用。詳細: [`references/consulting-playbook-anthropic-cfo-exponential.md`](references/consulting-playbook-anthropic-cfo-exponential.md)
## Sierra 日本進出戦略 4 概念 (2026-05-14): 日本市場特殊性 3 軸（言語 / 人口減少 / 離職率）+ 日米 SW 10 倍 / BPO 3 倍ギャップ + ハーネスエンジニアリング（本番稼働技術蓄積 = 真の moat）+ AI 顧客接点 1-2 年時間軸。ConsultingOS は中小 / 個人 / OEM 完全非競合、追い風活用。詳細: [`references/consulting-playbook-sierra-japan-entry.md`](references/consulting-playbook-sierra-japan-entry.md)
## VC ホットトレンド vs 大成功創業年パターン 3 原則 (2026-05-14): 10 年データで「ホットテーマと一致しない企業」が真の大成功。ホットトレンドの罠 / 隣接未開拓領域発見 / 構造的賭け前提受容。詳細: [`references/consulting-playbook-vc-counter-trend.md`](references/consulting-playbook-vc-counter-trend.md)
## AI エージェントガードレール 3 層体系 (2026-05-14): 外部パートナー支出上限 / 自社内ゲートキーパー / 個人レベル運用。Tom Griffiths 8 条件 + Karpathy 12 ルール統合。詳細: [`references/consulting-playbook-ai-agent-guardrails.md`](references/consulting-playbook-ai-agent-guardrails.md)
## LayerX Be Animal 流新規事業 continuous 4 概念 (2026-05-14): 既存事業重力 vs 動き続ける文化 / 同モノサシ評価の罠 / シナジー主語化現象 / 祖業強迫観念 / 文化 = 実行の積分値 = MOAT。maki@LayerX note 経由。詳細: [`references/consulting-playbook-layerx-be-animal.md`](references/consulting-playbook-layerx-be-animal.md)
## 10-Agent ベンチマーク + ConsultingOS gap 分析 (2026-05-14): 10 agent vs ConsultingOS 27+38+21+17。exceed 5 軸 / gap 3 軸 (24/7 / slash / webhook)。Boris #3 段階導入。詳細: [`references/consulting-playbook-10-agent-pattern.md`](references/consulting-playbook-10-agent-pattern.md)
## 海外プロ標準 AI Orchestration 5 パターン vs ConsultingOS (2026-05-14): Sub-Agent / Outcomes Loop / Architect-Implementer Split / Memory+Dreaming / Phased Preamble。PR #160 で 4/5 充足、残 Memory+Dreaming は 24/7 ホスト判断後。詳細: [`references/consulting-playbook-5-orchestration-patterns.md`](references/consulting-playbook-5-orchestration-patterns.md)
## 和製 FDE PoC 地獄脱出 4 戦略 + 自社 SaaS 収斂 (2026-05-14): 営業 / アップセル / 運用保守 / 自社 SaaS。ユーザー事業当事者発言。「1 人アクセンチュア状態」収斂仮説 vs 自社 SaaS 主軸推奨。ConsultingOS = 戦略 4 主軸物理化済 (OEM ベースキット PR #DF + 関根さん月次モデル)、「1 人 SaaS 企業」収斂仮説の物理証明候補。詳細: [`references/consulting-playbook-poc-hell-escape.md`](references/consulting-playbook-poc-hell-escape.md)
## 補助 / 出典: 野村 / 佐藤裕介 / Dorsey / 孫正義 / Huang / 4 思想兼務 / マスク 4 原則 = [`references/consulting-playbook-thoughts.md`](references/consulting-playbook-thoughts.md) + [`references/consulting-playbook-musk-incentive.md`](references/consulting-playbook-musk-incentive.md)。FACT = PR #65 / INFERENCE = 佐藤 + Boris / SPECULATION = 4 週間再評価
