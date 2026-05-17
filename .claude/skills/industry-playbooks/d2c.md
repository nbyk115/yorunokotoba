# D2C / EC 業界プレイブック

> ⚠️ **ハルシネーション禁則**: 本プレイブックの数値はすべて**目安・参照値**。提案・分析時は必ず**一次ソース URL で最新値を確認**。具体数値の引用には出典 URL + 確認日を付与。詳細は `.claude/memory/data-sources.md`。

## 1. 業界構造

### 主要プラットフォーム
- **D2C 自社 EC**: Shopify / BASE / STORES / カラーミー
- **モール**: Amazon / 楽天 / Yahoo!ショッピング / Qoo10
- **海外越境**: Shopify Markets / TikTok Shop

### 市場規模
> ⚠️ 具体数値は使用前に必ず一次ソース最新版で確認。

- **日本 BtoC EC 市場規模**: [経産省 電子商取引市場調査](https://www.meti.go.jp/policy/it_policy/statistics/outlook/ie_outlook.html) で年次最新版を確認
- **EC 化率**: 上記レポートで物販系・サービス系・デジタル系別の最新値を確認
- **グローバル EC 市場規模**: [eMarketer / Insider Intelligence](https://www.emarketer.com/) で最新値を確認

---

## 2. 業界固有 KPI

> ⚠️ 以下のベンチマークは Klaviyo / Shopify / 業界レポートで広く参照される目安。**カテゴリ・ブランド規模・チャネル構成で大きく変動**。提案時は最新の業界レポートで確認。

### Primary
| 指標 | 定義 | 一般的な目安（要最新確認） |
|---|---|---|
| **CAC** | 顧客獲得単価 | カテゴリ・チャネルで大きく変動 |
| **LTV/CAC** | 比率 | 3 倍以上が一般的な健全水準 |
| **AOV** | 平均注文単価 | カテゴリ依存 |
| **CVR** | サイト訪問→購入率 | カテゴリ依存（数 % 程度が目安、Best はその数倍） |
| **Repeat Rate** | リピート率 | 健全水準はカテゴリ依存（最新ベンチマーク参照） |
| **F2 転換率** | 初回購入→2回目購入率 | 健全水準はカテゴリ依存 |
| **Churn Rate**（サブスク D2C） | 月次解約率 | 健全水準は商材依存（消耗品 vs 高単価） |

### Secondary
- **CPC / CPM**: 広告効率（プラットフォーム・カテゴリで大きく変動）
- **ROAS**: 広告費対売上比: ただし **Walled Garden の自申告は構造的バイアス**あり（Jeff Green 規律: Independent Measurement で検証）
- **送料売上比**: カテゴリ・物流戦略で変動
- **粗利率**: カテゴリで大きく変動（コスメ・アパレル・食品で全く異なる）- **Shopify Reports / 業界別レポート**で確認

---

## 3. 業界規制

### 必須遵守
- **特定商取引法**: 通信販売の表示義務（事業者名・住所・電話番号・返品条件等）
- **景品表示法**: 不当表示の禁止（最上級表現・No.1 表記の根拠）
- **薬機法**: 化粧品・健康食品の効能効果表現（「シミが消える」等は NG）
- **食品表示法**: 食品の成分・原産地表示
- **酒類販売業免許**: アルコール販売には免許必須
- **古物営業法**: 中古品販売

### サブスク D2C 特有
- **特商法 改正（2022〜）**: サブスク契約の最終確認画面・解約方法の明示が義務
- **総務省ガイドライン**: ダークパターン禁止

---

## 4. 商習慣・契約慣行

### 価格設定
- **定期購入**: 初回割引 → 2回目以降通常価格（リピート率向上の主要手段）
- **送料**: 5,000-10,000円以上で送料無料が標準
- **返品**: 不良品交換は無料、顧客都合は元払いが標準

### 広告運用
- **Meta（FB/IG）広告**: D2C のメイン獲得チャネル
- **TikTok / TikTok Shop**: 短尺動画 + UGC で急成長
- **Google ショッピング広告**: 比較検討層
- **インフルエンサーマーケティング**: 化粧品・アパレル・健康食品で必須

### LP・クリエイティブ
- **LPO 必須**: 広告 → LP の導線、ヒートマップで継続改善
- **ファーストビュー**: 3秒で価値訴求 + CTA
- **社会的証明**: お客様の声・レビュー数・売上ランキング

---

## 5. 典型的な失敗パターン

### 失敗 1: ROAS だけ追って LTV を見ない
- ❌ ROAS 300% で利益と思い込む → 実は粗利率 30% で赤字
- ✅ ROAS × 粗利率 × Repeat Rate で**実利益**を計算

### 失敗 2: 初回購入だけで CAC を回収しようとする
- ❌ 単品 D2C で CAC > 初回 LTV で破綻
- ✅ F2 転換 / 定期購入で LTV 拡大、CAC Payback を 3-6ヶ月で設計

### 失敗 3: Walled Garden 全振り
- ❌ Meta 広告依存 → アルゴリズム変更で売上半減
- ✅ Open Internet（Open Web / CTV / TikTok）への分散（Jeff Green 規律）

### 失敗 4: 法令違反（薬機法・景表法）で行政指導
- ❌ 「3日でシミが消える」等の効能表現
- ✅ legal-compliance-checker で全 LP・広告を事前審査

### 失敗 5: サブスク解約導線を意図的に複雑化
- ❌ ダークパターン → 行政指導 + ブランド毀損
- ✅ ワンクリック解約を実装（特商法改正対応）

---

## 6. データソース

- **経産省 EC 統計**: https://www.meti.go.jp/policy/it_policy/statistics/outlook/ie_outlook.html
- **eMarketer**: https://www.emarketer.com/
- **Shopify Reports**: https://www.shopify.com/research
- **Marketplace Pulse**: https://www.marketplacepulse.com/
- **Klaviyo Benchmarks**: https://www.klaviyo.com/blog/

---

## 7. 提案チェックリスト

- [ ] CAC Payback / LTV/CAC 比率を確認
- [ ] 単品 vs 定期購入のミックスを把握
- [ ] 広告チャネルの分散度（Walled Garden 依存度）
- [ ] LP の薬機法・景表法準拠確認（legal-compliance-checker 連携）
- [ ] Repeat Rate / F2 転換率の改善余地を診断
- [ ] サブスク D2C なら特商法改正対応を確認

---

## 関連エージェント
- `marketing-director`: チャネルミックス・予算配分
- `performance-marketer`: 広告運用（Jeff Green / パパロ規律）
- `growth-hacker`: CVR / F2 転換改善（Sean Ellis 規律）
- `content-strategist`: GEO / AI Shopping 対応（旧 agentic-content 吸収）
- `legal-compliance-checker`: 薬機法・景表法・特商法
- `client-success`: サブスク D2C のチャーン低減（Lincoln Murphy 規律）


## 出典・依拠先

- FACT: 本ファイルは @nbyk115/consulting-os の ConsultingOS 規律ファイルとして 2026-05-05 PR #65 で体系的明示物理化により定義された（ファイルパス: .claude/skills/industry-playbooks/d2c.md）
- INFERENCE: 業界標準ベストプラクティス（佐藤裕介流の構造で売る原則、Boris Cherny 流の 9 規律 ruthlessly edit、該当部門の業界フレームワーク）から派生し実装
- SPECULATION: 4 週間ごとの再評価カレンダー（evolution-log.md 再評価カレンダーセクション）で形骸化検出、Boris #3 削除セット対象、規律違反発生時は統合 / 分離 / 削除で整理予定
