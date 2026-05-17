---
name: audit
description: ConsultingOS の現状を 5 軸 100 点満点でスコアリングし、上位 3 ギャップを抽出する OS 改善ループの起点スキル。週次 / 月次運用推奨。
allowed-tools: Read, Grep, Glob, Bash
model: opus
---

# /audit: ConsultingOS 5 軸自己評価スキル

## 起動方法
`/audit` または「OS 監査して」と自然言語で指示。

## 目的
ConsultingOS の運用品質を 5 軸 × 各 20 点 = 100 点満点でスコアリングし、上位 3 ギャップ（レバレッジ順）を抽出する。形骸化検出 + 改善優先度の可視化。

## 5 軸スコアリング基準

### 軸 1: 規律遵守度（0-20）
- CLAUDE.md ハードルール 16 項目の遵守率
- Boris Cherny 9 規律の運用度
- main 直接 push 違反 0 件 / `**` 太字検出 0 件 / 反証チェック省略 0 件
- 評価方法: 直近 7 日間の commit 履歴 + evolution-log を grep

### 軸 2: 反証モード徹底度（0-20）
- 反証チェック Step 1-3 + 残存リスク の完全実施率
- 短文・端的回答でも省略していないか
- 評価方法: evolution-log の反証セクション存在率 + commit message 内記載率

### 軸 3: 出典管理度（0-20）
- FACT / INFERENCE / SPECULATION 3 ラベル明示率
- 出典なし数値断言 0 件
- 「業界調査により幅あり」「個人見立て」の明示率
- 評価方法: 直近応答 + evolution-log の数値記載箇所をサンプリング

### 軸 4: 構造資産度（0-20）
- 30 エージェント・19 スキル・7 層防御の運用密度
- 形骸化エージェント / スキルの数（参照ゼロ = 形骸化）
- 評価方法: `.claude/agents/` `.claude/skills/` の Last Modified + 参照頻度

### 軸 5: 商品ライン進行度（0-20）
- 8 商品候補（Web 制作 / レビュー返信代行 / マネジメント記憶構造化 / サイト保守 / AI 化顧問 / 法務 AI / 金融 AI / OSS CRM）の実需顕在化率
- 案件パイプライン（Hotice 月 5 万 × 3 ヶ月 / N.Y.CRAFT 提案中）の進行度
- 評価方法: examples/ + strategy/ + ICP.md セクション 9.2 を確認

## 出力フォーマット

```
【ConsultingOS Audit Report YYYY-MM-DD】

総合スコア: XX / 100

軸 1 規律遵守度: XX / 20
  根拠: <実装事実>
  懸念: <違反検出>

軸 2 反証モード徹底度: XX / 20
（同様に各軸）

【上位 3 ギャップ（レバレッジ順）】
1. <ギャップ説明 + 改善案>
2. <同上>
3. <同上>

【次の Level Up 推奨】
/level-up を起動して具体施策を 5 質問で発見
```

## 運用頻度
- 週次（毎週金曜日）: 軽量 audit（5 軸スコアのみ）
- 月次（毎月第 1 金曜日）: 詳細 audit（5 軸 + 形骸化検出 + 商品ライン進行度）
- スコア履歴は `evolution-log.md` の「audit 記録」セクションに append

## 関連
- `/level-up`: audit のギャップを 5 質問で施策化
- `/review-agent-essence`: エージェント本質レビュー
- `/check-hallucination`: ハルシネーション反証
- `evolution-log.md`: スコア履歴 + 改善記録


## 出典・依拠先

- FACT: 本ファイルは @nbyk115/consulting-os の ConsultingOS 規律ファイルとして 2026-05-05 PR #65 で体系的明示物理化により定義された（ファイルパス: .claude/skills/audit/SKILL.md）
- INFERENCE: 業界標準ベストプラクティス（佐藤裕介流の構造で売る原則、Boris Cherny 流の 9 規律 ruthlessly edit、該当部門の業界フレームワーク）から派生し実装
- SPECULATION: 4 週間ごとの再評価カレンダー（evolution-log.md 再評価カレンダーセクション）で形骸化検出、Boris #3 削除セット対象、規律違反発生時は統合 / 分離 / 削除で整理予定
