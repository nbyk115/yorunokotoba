# 業界別プレイブック

> 業界固有の KPI・規制・商習慣をまとめたプレイブック。各エージェントは案件の業界に応じてここを必ず参照する。

## 含まれる業界

| 業界 | ファイル | 主要担当エージェント |
|---|---|---|
| **SaaS / B2B** | `saas.md` | strategy-lead / product-manager / marketing-director |
| **D2C / EC** | `d2c.md` | marketing-director / performance-marketer / growth-hacker |
| **広告代理店** | `advertising-agency.md` | marketing-director / proposal-writer |
| **製造業** | `manufacturing.md` | strategy-lead / gtm-consultant |
| **金融** | `finance.md` | legal-compliance-checker / strategy-lead |

## 使い方

クライアント案件開始時:
1. クライアントの業界を `clients/<slug>/README.md` に記載
2. 該当する業界プレイブックを参照
3. 業界固有 KPI・規制・商習慣を提案・分析に組み込む
4. 案件中で業界特有の知見が得られたら、各プレイブックに追記（evolution-log で記録）

## 共通構成

各業界プレイブックは以下の標準セクションを持つ:
1. **業界構造**（5フォース・主要プレイヤー・市場規模）
2. **業界固有 KPI**（一般 KPI とは違う指標）
3. **業界規制・コンプライアンス**
4. **商習慣・契約慣行**
5. **典型的な失敗パターン**
6. **データソース**（信頼できる業界情報源）

## 拡張予定

要望ベースで以下を追加検討:
- 医療・ヘルスケア
- 教育（EdTech）
- 不動産・建設
- 飲食・小売
- メディア・エンタメ


## 出典・依拠先

- FACT: 本ファイルは @nbyk115/consulting-os の ConsultingOS 規律ファイルとして 2026-05-05 PR #65 で体系的明示物理化により定義された（ファイルパス: .claude/skills/industry-playbooks/README.md）
- INFERENCE: 業界標準ベストプラクティス（佐藤裕介流の構造で売る原則、Boris Cherny 流の 9 規律 ruthlessly edit、該当部門の業界フレームワーク）から派生し実装
- SPECULATION: 4 週間ごとの再評価カレンダー（evolution-log.md 再評価カレンダーセクション）で形骸化検出、Boris #3 削除セット対象、規律違反発生時は統合 / 分離 / 削除で整理予定
