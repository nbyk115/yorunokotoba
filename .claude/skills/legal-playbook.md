---
name: legal-playbook
description: Anthropic Claude for Legal 11 専門家構成を ConsultingOS legal-compliance-checker から呼び出す形で統合。日本ドメイン適応 + Claude Code Cowork / MCP 接続 + ConsultingOS 規律 (FACT/INFERENCE/SPECULATION / 真の 100) 強化版。
---

# legal-playbook: Anthropic Claude for Legal 統合（日本ドメイン適応版）

## 概要

Anthropic が `anthropics/claude-for-legal` (公開 GitHub) で提供する「現役法務専門家のノウハウを Claude が使える形に落とし込んだテンプレート集」を、ConsultingOS の `legal-compliance-checker` agent から参照する skill として統合。

## 1. 11 専門家分類（Anthropic Claude for Legal）

### 社内弁護士の日常業務

| ラベル | 領域 |
|---|---|
| commercial-legal | 契約レビュー (NDA / ベンダー契約 / SaaS) |
| corporate-legal | M&A / 会社法務 |
| employment-legal | 労務 / 人事 |
| privacy-legal | プライバシー |
| ip-legal | 知財 |
| product-legal | プロダクト法務チェック |
| ai-governance-legal | AI ガバナンス |
| regulatory-legal | 規制対応 |

### 訴訟・紛争

| ラベル | 領域 |
|---|---|
| litigation-legal | 訴訟全般 |

### ロースクール向け

| ラベル | 領域 |
|---|---|
| legal-clinic | クリニック運営 (教員視点) |
| law-student | 学習サポート (学生視点) |

出典: https://github.com/anthropics/claude-for-legal (FACT、Anthropic 公式)

## 2. 日本ドメイン適応（重要、Anthropic 原典は米国法ベース）

YOU MUST: Anthropic 原典の 11 専門家は米国法ベース。日本国内クライアント案件では以下のいずれかを必須適用:

1. 日本法準拠への書き換え（金商法 / 会社法 / 個人情報保護法 / 労働基準法 / 著作権法 / 不正競争防止法 等）
2. 米国法ベースのまま「参考意見」として扱い、最終判断は日本国内弁護士に委ねる旨明示
3. 該当領域に日本独自規制（景品表示法 / 特定商取引法 / 下請法 等）があれば追記

### 日本ドメイン適応の優先軸

| ラベル | 日本適応の必須要素 |
|---|---|
| commercial-legal | 民法 / 商法 / 下請法 / 特商法 |
| corporate-legal | 会社法 / 金商法 / 公開買付規制 |
| employment-legal | 労働基準法 / 労働契約法 / パワハラ防止法 / 高プロ制度 |
| privacy-legal | 個人情報保護法 (2022 改正) / 各業界個別ガイドライン |
| ip-legal | 著作権法 / 特許法 / 商標法 / 不正競争防止法 |
| product-legal | PL 法 / 景表法 / 特商法 / 業界規制 (薬機法 / 食品衛生法 等) |
| ai-governance-legal | AI 事業者ガイドライン (経産省 2024) / EU AI Act の日本企業影響 |
| regulatory-legal | 業界個別 (金融庁 / 厚労省 / 経産省 / 公取委 等) |
| litigation-legal | 民訴法 / 民事執行法 / 仲裁法 |

## 3. ConsultingOS legal-compliance-checker からの参照フロー

旧（ConsultingOS 単体）: legal-compliance-checker が単独で法務判断（汎用、深度浅い）

新（本 skill 統合後）:
1. legal-compliance-checker が案件入力を受領
2. 11 専門家ラベルから該当領域を 1-3 件特定
3. 該当領域の skill 参照（Anthropic 原典 + 日本適応軸）
4. 出力に「米国原典 / 日本適応版 / 最終判断は弁護士確認」の 3 ラベル明示
5. 結論を proposal-writer / strategy-lead に統合

### 標準起動例

```
user 入力: 「N.Y.Craft クライアントから NDA レビュー依頼」
↓
legal-compliance-checker (本 skill 参照)
├ commercial-legal 領域特定
├ 日本法準拠で民法 / 不正競争防止法観点でチェック
└ 出力: 修正提案 + 「最終判断は弁護士確認」明示
↓
proposal-writer に統合 / クライアント返信
```

## 4. 接続方法（Anthropic 原典の使い方）

Anthropic 公式が提示する 2 接続パターン:

### A. Cowork 経由（ビジネスサイド）

Claude Code Cowork（ブラウザ協働編集）で `anthropics/claude-for-legal` リポジトリを接続 → 11 専門家の prompts を即利用。

ユースケース: 法務担当者が日常的にレビューする時、その場で AI レビュー回す。

### B. md ファイル形式（エンジニアサイド）

`.md` ファイルなのでシステムに組み込み可能。MCP 経由で agent / skill として呼び出し。

ユースケース:
- 取引先との NDA 締結時に必ず AI レビューを回す（自動化）
- プロダクトローンチ前に GitHub 全体を見て回らせる
- CI/CD パイプラインで法務チェック自動化

## 5. オープン / クローズ判断（ユーザー観察の物理化）

ユーザー指摘「何をオープンにして、何をクローズにするか、その判断が重要」を ConsultingOS 規律として物理化:

| 対象 | オープン / クローズ | 理由 |
|---|---|---|
| 11 専門家構成 | オープン（Anthropic 原典そのまま）| マーケ効果 + 業界標準化 |
| 日本適応版 skill | 部分オープン | 業界標準として共有可、ただし特定クライアント文脈は除外 |
| クライアント案件の判断ログ | クローズ | 機密管理、N.Y.Craft / 水野氏等の個別文脈は本体に混入させない |
| ConsultingOS 規律体系 | オープン（公開 OEM 前商品）| 業界標準化が ConsultingOS 自身の評判資本（マスク式原則 2 適用）|
| 顧客固有の ICP / 判断パターン | クローズ | OEM 案件で別リポ管理（n-y-craft-os 等）|

## 6. 国内 AI ネイティブ法律事務所への含意（ユーザー戦略観察）

ユーザー指摘「これを改変して国内適応させ集客に成功した AI ネイティブな法律事務所に仕事が集中する」(INFERENCE: 業界予測)。

ConsultingOS 観点での解釈:
- マーケ効果: 11 専門家 + 日本適応版を公開する事務所が「業界先行者」として認知
- 大量処理: 社内システム化で AI に大量レビューを回し、人件費圧縮 + 受注量増
- 集客成功事務所への寡占: Sierra 型「カテゴリトップ集約」と同型構造（前 PR #125 + #127 マスク式評判資本主義適用）

ConsultingOS が提案できる位置づけ:
1. 国内法律事務所向け OEM 提供（本 skill を関根さん / 水野さん事業計画と同型で適用可）
2. 法律事務所 = ConsultingOS の新 ICP セグメント候補（既存 SaaS / D2C / 代理店 / 製造 / 金融 + 法律）
3. 業界別プレイブックに「legal」追加検討（次セッション課題）

## 7. 関連参照

- 出典: https://github.com/anthropics/claude-for-legal (FACT、Anthropic 公式)
- ConsultingOS agent: `.claude/agents/consulting/legal-compliance-checker.md`
- 関連 skill: `cybersecurity-playbook.md` (セキュリティ / プライバシー連携)
- マスク式評判資本主義（前 PR #125 + #127）: 11 専門家オープン化はマーケ効果 / 評判資本起点
- 業界別プレイブック（次セッション課題）: legal を追加するなら本 skill を起点

## 8. 反証チェック（Step 1-3 圧縮）

- Step 1 自己反証: 11 専門家分類は Anthropic 公式 README から取得 FACT、ただし最新更新は要確認 / 日本適応軸は assistant の業界知識ベース INFERENCE / 国内法律事務所への寡占予測は SPECULATION
- Step 2 構造反証: ConsultingOS 規律（FACT/INFERENCE/SPECULATION 3 ラベル / 真の 100 / 主語詐称禁止）に整合 / agent 追加せず skill 統合で ruthlessly edit 適合（27 → 27 維持、ハードルール 13 遵守）
- Step 3 実用реальное: Anthropic 公式 URL は本 PR 時点（2026-05-09）で参照可能 FACT、ただし業界の最新動向は user 経由で更新推奨
