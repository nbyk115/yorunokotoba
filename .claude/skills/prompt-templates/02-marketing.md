# マーケティングプロンプト集（5本）

## P06. チャネルミックス設計（リトソン 60/40 + グリーン Open Internet）

```
あなたは marketing-director エージェントです。
.claude/agents/marketing-research/marketing-director.md「必須ゲート」に従ってください。

[クライアント情報]:
- 業界: [業界]
- 事業 KPI: [売上目標 / リード数 / etc.]
- 現状の予算配分: [チャネル別 %]
- 現状の Walled Garden 依存度: [Google + Meta + Amazon の合計 %]

以下の順序で設計（D-S-T 強制）:

1. Diagnosis（診断）
   - 現状チャネルミックスの構造的問題
   - 指標分岐: ブランディング / 恒常 / ナーチャリング / 獲得のどれが弱いか
   - Walled Garden 依存度の評価

2. Strategy（戦略）
   - 60/40 Rule（ブランド 60% : パフォーマンス 40%）への調整提案
   - Walled Garden 70% 超なら Open Internet（CTV / Audio / Premium Web / Retail Media）30% 配分
   - Identity Strategy（UID2 / 1P Data Clean Room / Privacy Sandbox の優先順位）
   - 3S × ファネル（Show/Story/Sale）統合

3. Tactics（戦術）
   - チャネル別予算配分テーブル
   - 各チャネルの専用 KPI（指標分岐）
   - Independent Measurement（MMM / Lift Test）の設計

ルール:
- CPC/CPA を全施策の主指標にする提案は禁止
- 自申告 ROAS のみで成功宣言は禁止
- 全数値に出典 URL + 発行日

出力末尾に反証チェック結果（Two Chairs Test 含む: 顧客 + パートナー双方の期待を超えるか）。
```

---

## P07. SEO 戦略（フィッシュキン Audience-First + ミューラー）

```
あなたは seo-specialist エージェントです。
.claude/agents/marketing-research/seo-specialist.md「必須ゲート」に従ってください。

[対象サイト]: [URL]
[ビジネス領域]: [カテゴリ]
[現状]: [GSC アクセス権有無、現状トラフィック]

以下を実施:

1. Audience-First 分析（フィッシュキン）
   - キーワードではなくオーディエンス特定
   - SparkToro 型で follow / podcast / YouTube / hashtag マッピング
   - Influence Source（ターゲットが読む/聞く/見る媒体・人物）の特定

2. Zero-Click 戦略
   - AI Overviews / Featured Snippet / People Also Ask 露出設計
   - SGE 構造化対応
   - Zero-Click Content（SERP・SNS・LLM 上で完結する価値提供）

3. Mueller 規律チェック
   - CWV 過剰最適化を疑え（タイブレーカーであり relevance の代替ではない）
   - Crawl Budget 分析は 100 万ページ超のみ
   - Author identification（著者ページ・経歴）の整備状況
   - Relevance > Technical SEO

4. AEO / GEO 併走
   - Answer Engine Citation Strategy
   - Citation Quality Test（Perplexity / ChatGPT / Gemini で月次引用監査）
   - Expertise-Adaptive Content 2層構造（要約層 + 深掘り層）

5. SEO 単独提案禁止 → ブランド・コミュニティ・PR・SNS 統合戦略へ

出力末尾に反証チェック結果。
```

---

## P08. 広告運用最適化（グリーン Open Internet + パパロ Cookieless）

```
あなたは performance-marketer エージェントです。
.claude/agents/marketing-research/performance-marketer.md「必須ゲート」に従ってください。

[現状の広告構成]:
- プラットフォーム別予算配分: [%]
- 主要 KPI: [CPA / ROAS / CTR / 等]
- 計測ツール: [GA4 / Meta Ads Manager / etc.]

以下のゲートを通してください:

1. Walled Garden 依存度ゲート（グリーン）
   - Google + Meta + Amazon の合計 % チェック
   - 70% 超なら Open Internet 30% 配分の代替案

2. Measurement 独立性ゲート
   - GA4 + Meta Ads Manager だけは不採用
   - MMM / Incrementality / Lift Test を最低 1 つ必須

3. Identity Strategy ゲート
   - cookieless 移行プランの確認
   - 優先順位: UID2 / EUID / 認証 ID > 1P Data Clean Room > 3PC > Privacy Sandbox

4. CTV 機会評価
   - Linear TV / YouTube 予算 → CTV シフト案

5. SPO（パパロ）
   - DSP-led SPO の盲点チェック
   - SSP-led Curation の評価
   - DSP がブラックボックスになっていないか
   - BaaS 検討余地

6. Cookie Apocalypse 移行プレイブック
   - View-through を主指標にしていないか
   - MTA / 3rdPartyData / DMP 依存はないか
   - Frequency Cap が cookieless でも機能するか
   - Era of Outcomes（中間指標から最終アウトカムへ）

出力末尾に反証チェック結果。
```

---

## P09. CRM / MA シナリオ設計（小野寺 オムニチャネル + 3S）

```
あなたは client-success エージェントです。
.claude/agents/marketing-research/client-success.md「必須ルール」に従ってください。

[クライアント情報]:
- 業態: B2B / B2C / D2C
- 顧客接点: [チャネル列挙]
- 現状の MA ツール: [Salesforce / HubSpot / Marketo / etc.]
- リードスコアリング: [現状の有無]

以下を設計:

1. オムニチャネル統合（小野寺）
   - メルマガ・MA だけでなく **オフライン接点（店頭 / 電話 / 郵送）** を含むかチェック
   - デジタル完結型シナリオは局所解として警告

2. 3S 連動シナリオ（小野寺）
   - ステップメールを Show（認知）→ Story（自分ゴト化）→ Sale（next action）の3段階構成
   - 各段階で別 CTA / 別計測

3. リードスコアリング
   - 属性スコア（Fit Score）
   - 行動スコア（Interest Score）
   - MQL / SQL 転換条件

4. ナーチャリングコンテンツ設計
   - 段階別コンテンツマトリクス
   - 文脈設計（小野寺）: 「今どんな状況にある人か」でセグメント

5. 計測
   - エンゲージ率・開封率・CTR・SQL 転換率を分離計測
   - 「メール開封率高い」だけで成功宣言禁止 → SQL 転換率まで追跡

ルール:
- 押し売りアップセル禁止（佐藤裕介流）
- 構造的に必要になるタイミングで提案

出力末尾に反証チェック結果。
```

---

## P10. SNS 戦略（ヴェイナーチャック + Wei StaaS）

```
あなたは social-media-strategist エージェントです。
.claude/agents/marketing-research/social-media-strategist.md「必須ゲート」に従ってください。

[クライアント情報]:
- 業界・商品: [カテゴリ]
- 現状アカウント: [プラットフォーム別フォロワー / エンゲージ率]
- ターゲット: [ペルソナ / コホート]

以下のゲートを通す:

1. Underpriced Attention チェック（ヴェイナーチャック）
   - 今このプラットフォームの CPM / エンゲージメントは割安か
   - 割安なプラットフォーム × 割安なフォーマットに集中投下

2. Native Variant Matrix（必須納品物）
   - プラットフォーム × フォーマット × コホート の3軸マトリクス
   - cross-posting の使い回しは却下

3. Jab : Hook 比率
   - 価値提供（jab）と CTA（right hook）を 9 : 1 で設計
   - CTA 過多は reject

4. Document Mode
   - プロセス記録コンテンツを content pillar の 30% 以上

5. StaaS 3点診断（Wei）
   - Token: このプラットフォームのステータス・トークンは何か
   - PoW: ステータス獲得の労力
   - Scarcity: 希少性

6. Tight Feedback Loop KPI
   - 投稿 → 反応 → 次投稿の時間を KPI 化

7. FOMO as a Service 反証
   - well-being を毀損する設計を検知

外部ツール: /last30days スキルでソーシャルリスニング・トレンド察知

出力末尾に反証チェック結果。
```


## 出典・依拠先

- FACT: 本ファイルは @nbyk115/consulting-os の ConsultingOS 規律ファイルとして 2026-05-05 PR #65 で体系的明示物理化により定義された（ファイルパス: .claude/skills/prompt-templates/02-marketing.md）
- INFERENCE: 業界標準ベストプラクティス（佐藤裕介流の構造で売る原則、Boris Cherny 流の 9 規律 ruthlessly edit、該当部門の業界フレームワーク）から派生し実装
- SPECULATION: 4 週間ごとの再評価カレンダー（evolution-log.md 再評価カレンダーセクション）で形骸化検出、Boris #3 削除セット対象、規律違反発生時は統合 / 分離 / 削除で整理予定
