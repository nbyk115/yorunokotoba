---
marp: true
theme: default
paginate: true
size: 16:9
lang: ja
header: ''
footer: ''
style: |
  /* ConsultingOS 必須 CSS インライン版 (marp-required.css と同期) */
  /* 編集規律: creative-director 承認必須 */

  section,
  section * {
    word-break: auto-phrase;
    line-break: strict;
    overflow-wrap: break-word;
    font-family: "Hiragino Kaku Gothic ProN", "Hiragino Sans",
                 "Noto Sans JP", "BIZ UDPGothic", "Yu Gothic UI",
                 "Meiryo", sans-serif;
    font-feature-settings: "palt" 1;
  }

  section {
    overflow: hidden;
    box-sizing: border-box;
  }

  .card {
    display: grid;
    grid-template-rows: auto 1fr auto auto;
    height: 100%;
  }

  .srcLine,
  .caseNote,
  .footnote {
    margin-top: auto;
    font-size: 0.75rem;
    opacity: 0.7;
  }
---

<!--
================================================================
sales-deck-designer 必須 frontmatter テンプレート (Marp)
================================================================
このファイルは ConsultingOS の「実装テンプレ」物理化成果物。

参照元:
  - .claude/agents/creative/sales-deck-designer.md
  - .claude/skills/sales-deck-review/SKILL.md
  - .claude/templates/sales-deck-designer/marp-required.css

必須項目チェックリスト (template-injection-check.sh で検証):
  [x] marp: true              -> Marp ビルド有効化
  [x] theme: default           -> テーマ明示 (省略時の崩れ回避)
  [x] paginate: true           -> ページ番号 (営業資料の必須要素)
  [x] size: 16:9               -> 1280x720 / 1920x1080 想定
  [x] lang: ja                 -> CLAUDE.md ハードルール 10 対応
  [x] word-break: auto-phrase  -> 関根案件で欠落していた致命点
  [x] 日本語フォントスタック   -> 中国字形回避
  [x] .card grid               -> 横揃え保証
  [x] .srcLine margin-top:auto -> 下段 pin
  [x] version 表記             -> B10・関根さん案件 v1-v19 学習で必須化（タイトルスライドに <p class="neutral">YYYY.MM / v<N></p>）

クライアント別カスタマイズ:
  - .claude/templates/sales-deck-designer/<variant>.md として派生作成
  - 派生時は marp-required.css の必須項目を必ず含める

================================================================
-->

# タイトルスライド

サブタイトル / 提案先

<p class="neutral">YYYY.MM / v1</p>

<!--
B10 必須: Iteration version 表記（関根さん案件 v1-v19 学習・2026-05-07 物理化）
B2B 提案資料は v1 で完成しない（関根さん案件で 19 イテレーション要した実績）。
履歴 traceability のため、必ずタイトルスライドの subtitle 直下にバージョン表記を埋め込む。
推奨: タイトルスライドのみ表記、その他ページは footer 空（global header overlap 回避）。
更新ルール: User からの修正指示後に v をインクリメント。
-->

<div class="srcLine">作成: ConsultingOS / 提案日: YYYY-MM-DD</div>

---

# 2. アジェンダ

- 項目 1
- 項目 2
- 項目 3

---

<!-- 以降のスライドは sales-deck-designer のページ並び (18P 構成) を参照 -->
<!-- docs/sales-deck-rules.md で完全版を確認 -->
