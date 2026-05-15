# Figma → 実装ハンドオフ必須チェックリスト

ConsultingOS ux-designer 必須テンプレ（PR AV 2026-05-06 物理化）。
Figma デザインから HTML / React / Marp / PPTX へハンドオフする際に、以下 12 項目をすべて満たすことを `template-injection-check.sh` で機械検証する。

## 1. 言語・字形（必須）

- `lang="ja"` 属性が html / 各 slide 親要素に付与されているか
- 日本語フォントが Noto Sans CJK 無印・Source Han Sans 無印・SimSun を使用していないか（中国字形フォールバック禁止、CLAUDE.md ハードルール 10）
- 日本語フォントは `Noto Sans JP`, `Source Han Sans JP`, `Hiragino Sans`, `Yu Gothic`, `Gen Interface JP` のいずれかを優先使用

## 2. 文字組み（必須）

- `word-break: auto-phrase` または `word-break: keep-all` が日本語本文ブロックに適用されているか
- `line-break: strict` で禁則処理を有効化しているか
- 行頭・行末禁則文字（、。」』 等）の処理が CSS で担保されているか

## 3. レスポンシブ（必須）

- viewport meta タグ `width=device-width, initial-scale=1.0` 付与
- ブレイクポイント 3 段階以上（mobile / tablet / desktop）
- フォントサイズは rem 単位（px 直書き禁止）

## 4. アクセシビリティ（必須）

- カラーコントラスト WCAG AA 以上（通常テキスト 4.5:1、大文字 3:1）
- alt 属性すべての img / svg に付与
- focus 状態の視覚的フィードバック（outline / box-shadow）
- 見出しレベル h1-h6 の階層整合性

## 5. Marp スライド（該当時）

- `marp: true` frontmatter
- `theme: default` または ConsultingOS 標準テーマ
- `paginate: true`（フッターページ番号）
- 1 スライド 1 メッセージ原則（情報密度 60-70%）

## 6. パフォーマンス（必須）

- 画像 WebP / AVIF 最適化
- font-display: swap 指定
- Critical CSS インライン化（LCP 2.5s 以下目標）

## 7. 出典・データ規律

- 数値・グラフ・引用にすべて出典 URL（CLAUDE.md ハードルール 2）
- FACT / INFERENCE / SPECULATION 3 ラベル明示

## 8. ブランド規律

- em-dash（U+2014）/ en-dash（U+2013）使用ゼロ（CLAUDE.md ハードルール 16 ⑥）
- 太字記法 `**` 使用ゼロ（外部出力時、CLAUDE.md ハードルール 16 ①）
- DESIGN.md 準拠の色・余白・コンポーネント使用

## 9. レイアウト

- ページ / スライド内に全要素が収まっている（はみ出しゼロ、CLAUDE.md ハードルール 16 ④）
- 表は中央揃え（CLAUDE.md ハードルール 16 ③）
- 一文中改行禁止（CLAUDE.md ハードルール 16 ②）

## 10. ICP 整合（マーケ・セールス時）

- ICP.md 記載のペルソナ・利用文脈と整合
- 非ターゲット層を排除する文言設計

## 11. クライアント名・固有情報

- 仮置きクライアント名（株式会社XX 等）が残っていない
- ロゴ・コーポレートカラーの正規版使用

## 12. 検証コマンド

ハンドオフ前に以下を実行:

```bash
# 字形検証（PDF）
pdffonts <file>.pdf | grep -i "noto\|source\|hiragino"

# 字形検証（HTML）
grep -E 'lang="ja"|font-family' <file>.html

# em-dash 検出
grep -c $'\xe2\x80\x94' <file>

# 太字検出（外部出力）
grep -c '\*\*' <file>
```

## 形骸化検知

本チェックリストは 4 週間ごとに ux-designer + creative-director で再評価。形骸化（運用されていない / クライアント案件で参照されていない）が検知された場合は `evolution-log.md` に記録し、Boris #3 ruthlessly edit で項目削除 / 統合判断。

次回再評価期日: 2026-06-03。

## 出典・依拠先

- FACT: 本ファイルは PR AV（2026-05-06）で `.claude/templates/ux-designer/` 配下に新規作成された必須テンプレ。CLAUDE.md ハードルール 8（DESIGN.md 参照）/ 9（ICP.md 参照）/ 10（日本語字形）/ 16（ブランド規律）の物理化を目的とする
- INFERENCE: WCAG AA 基準・Marp 公式ドキュメント・Material Design アクセシビリティガイドラインから派生、ConsultingOS 独自の出典規律と統合
- SPECULATION: 12 項目の網羅性は 2026-06-03 再評価で検証、形骸化項目は削除 / 統合する運用予定
