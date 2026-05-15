# SaaS / B2B 業界プレイブック

> ⚠️ **ハルシネーション禁則**: 本プレイブックの数値はすべて**目安・参照値**。提案・分析時は必ず**一次ソース URL で最新値を確認**してから使用。具体数値の引用には出典 URL + 確認日を必ず付与。詳細は `.claude/memory/data-sources.md` の引用ルール参照。

## 1. 業界構造

### 主要プレイヤー（日本市場）
- **エンタープライズ向け**: Salesforce、ServiceNow、SAP、Oracle、Workday
- **国内大手**: Sansan、Money Forward、freee、SmartHR、kintone（サイボウズ）
- **新興 SaaS**: ANDPAD、カミナシ、LayerX、Algoage 等多数

### 市場規模
> ⚠️ **具体数値は使用前に必ず一次ソース最新版で確認**。本プレイブックは「どこで確認するか」を示すのみ。

- 日本 SaaS / クラウド市場: [富士キメラ総研](https://www.fcr.co.jp/) / [ITR](https://www.itr.co.jp/) / [IDC Japan](https://www.idc.com/jp/) のレポートで最新値を確認
- グローバル SaaS / クラウド市場: [Gartner](https://www.gartner.com/) / [IDC](https://www.idc.com/) のレポートで最新値を確認
- 成長率は IT 系シンクタンクの市場予測（年次）を参照

### 5フォース診断ポイント
- **新規参入の脅威**: 中（AWS / Vercel 等で参入容易、ただし顧客獲得が難）
- **代替品の脅威**: 高（内製 / Excel / オンプレ）
- **買い手の交渉力**: エンタープライズは強、SMB は弱
- **売り手の交渉力**: クラウドインフラ（AWS等）依存、中
- **既存競合の競争激度**: 高（ホリゾンタル領域）/ バーティカル特化なら低

---

## 2. 業界固有 KPI

> ⚠️ 以下のベンチマーク数値は SaaStr / OpenView / KeyBanc / Bessemer 等で**広く参照されている目安**。提案・分析時は必ず**最新の業界レポートで確認**してから使用。

### Primary（事業 KPI）
| 指標 | 定義 | 一般的な目安（要最新確認） |
|---|---|---|
| **ARR** | 年間経常収益 |: |
| **MRR** | 月間経常収益 |: |
| **NRR** | Net Revenue Retention（既存顧客の年間収益維持率） | 100% 以上が健全、120% 超で Best in class とされることが多い |
| **GRR** | Gross Revenue Retention（チャーン控除後の収益維持） | 90% 以上が一般的な健全水準 |
| **CAC** | Customer Acquisition Cost | 業種・チャネルにより大きく変動 |
| **LTV/CAC** | Customer Lifetime Value / CAC 比 | 3 倍以上が一般的な健全水準とされる |
| **CAC Payback** | CAC 回収期間 | 12-18 ヶ月以内が一般的な健全水準 |
| **Magic Number** | (Δ ARR × 4) / 営業マーケ費用 | 0.75 以上で投資加速可とされることが多い |
| **Rule of 40** | 成長率 % + 営業利益率 % | 40 以上が一般的な健全水準 |

### Secondary（活動 KPI）
- **Trial → Paid Conversion**: B2B SaaS では数 % 〜数十 % まで幅広い（プロダクト・PLG 度合いで変動）
- **Activation Rate**: 初回利用後 X 日以内に Aha! Moment 到達率
- **Time to Value（TTV）**: 顧客が初めて価値を実感するまでの時間
- **Logo Churn / Revenue Churn**: 年率の目安は業種依存。健全水準は **OpenView / KeyBanc SaaS Survey** の最新版で確認

### 業界別ベンチマーク参照
- **OpenView SaaS Benchmarks**: https://openviewpartners.com/saas-benchmarks/
- **KeyBanc SaaS Survey**: https://www.key.com/businesses-institutions/industry-expertise/saas-survey.jsp
- **Bessemer Cloud Index**: https://cloudindex.bvp.com/
- **ChartMogul Insights**: https://chartmogul.com/insights/

---

## 3. 業界規制・コンプライアンス

### データ保護
- **個人情報保護法**（日本）: クラウドサービス提供事業者は委託先として扱われる
- **GDPR**（EU）: EU 顧客がいる場合は厳格遵守、罰金は売上の最大4%
- **CCPA / CPRA**（カリフォルニア）: 米国西海岸顧客がいる場合
- **Pマーク / ISMS**（ISO 27001）: 取得が事実上必須（特にエンタープライズ案件）

### 業界別追加規制
- **金融顧客**: 金融庁ガイドライン（FISC 安全対策基準）
- **医療顧客**: 医療情報システムの安全管理に関するガイドライン（厚労省）
- **公共セクター**: ISMAP（政府情報システムのためのセキュリティ評価制度）

### AI 機能組み込み時
- **EU AI Act**: 2026年〜段階適用、リスクレベル分類が必要
- **日本 AI 事業者ガイドライン**（経産省）: 透明性・公平性・説明可能性

---

## 4. 商習慣・契約慣行

### 契約形態
- **年間契約**: 12ヶ月コミットメントが主流（割引と引き換え）
- **複数年契約**: 2-3年契約で更に割引（NRR 向上の主要手段）
- **MSA + SOW**: エンタープライズは Master Service Agreement + Statement of Work
- **Order Form**: 営業が提示する注文書、利用条件は MSA で定義

### 価格設定
- **シート課金**: ユーザー数 × 単価（最も一般的）
- **使用量課金**: API 呼び出し数 / データ量等（Snowflake 型）
- **ハイブリッド**: 基本料金 + 使用量
- **エンタープライズ**: カスタム見積（SOW で個別定義）

### 営業プロセス
- **PLG**（Product-Led Growth）: 無料トライアル → セルフサーブで自動コンバート（SMB 向け）
- **SLG**（Sales-Led Growth）: AE が個別商談（エンタープライズ向け）
- **複合型**: PLG で入口、エンタープライズは AE がアップセル

### 重要な商習慣
- **POC**（Proof of Concept）: エンタープライズでは2-3ヶ月の POC を要求されることが多い
- **セキュリティレビュー**: SOC 2 / ISO 27001 / 個別質問票への対応必須
- **法務レビュー**: 大企業は2-3ヶ月かかる（MEDDPICC の Paper Process）

---

## 5. 典型的な失敗パターン

### 失敗パターン 1: PMF 前のスケール（Sean Ellis 規律）
- ❌ PMF Survey で "Very disappointed" が 40% 未満なのに広告投下
- ✅ PMF 達成 → North Star Metric 確定 → スケール

### 失敗パターン 2: シート課金の罠
- ❌ 使われていないシートも課金 → 顧客から不満 → 更新時にチャーン
- ✅ 使用量メトリクス併用 / Active User ベースで価値訴求

### 失敗パターン 3: SMB と Enterprise の混同
- ❌ 同じプロダクト・同じ営業プロセスで両方狙う → どちらにも刺さらない
- ✅ どちらかにフォーカス、または明確に Tier 分離

### 失敗パターン 4: NRR 100% 未満なのにスケール
- ❌ 新規獲得で穴を埋めようとする → CAC 上昇 → 利益悪化
- ✅ NRR 110% 以上を確保してから加速（リード・ホフマン Blitzscaling 規律）

### 失敗パターン 5: エンタープライズ案件の Paper Process 軽視
- ❌ 商談クローズ目前で法務・調達で潰される
- ✅ MEDDPICC で Paper Process を最初から把握、法務リソースを早期投入

---

## 6. データソース（信頼ソース）

### 業界統計
- **総務省 SaaS 市場規模**: https://www.meti.go.jp/policy/it_policy/statistics/
- **MM総研 / IDC Japan / 富士キメラ総研**: 各社の SaaS 市場レポート
- **OpenView**: https://openviewpartners.com/

### 業界動向
- **TechCrunch / The Information**: グローバル SaaS 動向
- **MarkeZine / ITmedia**: 日本 SaaS 動向
- **a16z Enterprise**: https://a16z.com/category/enterprise/

### ベンチマーク
- **SaaStr Annual**: 年次カンファレンス、最新ベンチマーク
- **Pavilion / Revenue Collective**: SaaS 営業ベンチマーク
- **ChurnZero / Gainsight**: CS 業界ベンチマーク

---

## 7. 提案・分析時のチェックリスト

### 提案前
- [ ] クライアントの ARR / NRR / CAC Payback / Rule of 40 を確認
- [ ] 5フォースで業界構造を診断
- [ ] PMF Survey 実施 or 既存スコアを取得
- [ ] PLG / SLG / 複合型のどれかを明示

### 提案中
- [ ] 投資 vs 期待 NRR 改善で PL を語る（佐藤裕介流）
- [ ] CAC Payback 改善 → 投資加速のサイクルを示す
- [ ] エンタープライズ案件は MEDDPICC で資格化
- [ ] AI 機能組み込み時は EU AI Act / 日本 AI ガイドラインに言及

### 提案後
- [ ] 月次レポートで NRR / GRR / Magic Number を継続モニタリング
- [ ] 解約予兆（Health Score 低下）を early warning として運用
- [ ] アップセル機会（拡張余地のある契約）を Champion と共有

---

## 関連エージェント
- `strategy-lead`: SaaS 戦略立案
- `product-manager`: PMF / Outcome over Output
- `marketing-director`: PLG / SLG 設計
- `client-success`: NRR 改善（Lincoln Murphy 式 Desired Outcome）
- `proposal-writer`: MEDDPICC でエンタープライズ案件資格化


## 出典・依拠先

- FACT: 本ファイルは @nbyk115/consulting-os の ConsultingOS 規律ファイルとして 2026-05-05 PR #65 で体系的明示物理化により定義された（ファイルパス: .claude/skills/industry-playbooks/saas.md）
- INFERENCE: 業界標準ベストプラクティス（佐藤裕介流の構造で売る原則、Boris Cherny 流の 9 規律 ruthlessly edit、該当部門の業界フレームワーク）から派生し実装
- SPECULATION: 4 週間ごとの再評価カレンダー（evolution-log.md 再評価カレンダーセクション）で形骸化検出、Boris #3 削除セット対象、規律違反発生時は統合 / 分離 / 削除で整理予定
