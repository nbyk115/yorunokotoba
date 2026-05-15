# Proposal Iteration Playbook

B2B 提案資料を v1 から v(N) で iterate する際の標準パターン。
関根さん案件 (claude/oem-sales-strategy-gVMWp) v1-v19 全 19 イテレーションの学習を skill 化。

- **Version**: 1.0.0
- **Author**: ConsultingOS / 関根さん案件 v1-v19 起点
- **Scope**: B2B 提案資料の iteration 全般
- **関連**: `.claude/agents/creative/sales-deck-designer.md` / `.claude/skills/sales-deck-review/SKILL.md`

---

## 1. なぜこの skill が必要か

関根さん案件で v1 から v19 まで 19 イテレーション、user の指摘 30 件以上を受けた。各バージョンの典型的修正パターンを整理することで、次案件で「同じ手戻りを繰り返さない」ための iteration phase を物理化する。

主要な学習:
1. 提案資料は v1 で完成しない (Sato 流 ruthlessly edit を 19 回繰り返す前提)
2. クライアントリテラシーは技術者の想定よりも基礎側に位置する
3. デザイン違和感は user 指摘を待つのではなく Draft 段階で `sales-deck-designer` subagent を起動して機械検証
4. ICP / 世界観の Pre-Draft Discovery を怠ると target 外しが発生 (v9 で「中堅・中小企業」と誤認 -> サイト確認後に「スタートアップ・PMF 期」へ修正)

---

## 2. イテレーション 5 phase

| Phase | 焦点 | 典型 Ver | 主要チェック項目 |
|---|---|---|---|
| Discovery | ICP / 世界観確認 | v0 (起票前) | クライアント Web / LinkedIn / vocabulary 抽出 |
| Draft | 構造・コア訴求 | v1-v3 | 価値訴求 -> 構造 -> 価格の順、1 ページ 1 メッセージ |
| Refinement | jargon / target 整合 | v4-v9 | 業界略語注釈、target 用語整合、思想 vs カスタム関係性 |
| Polish | デザイン・横揃え | v10-v15 | 必須 CSS、並列スライド同型、ブロック密度 max 2 / 列、横揃え grid |
| Final | 出典・hyperlink・semantic label | v16-v19 | ハイパーリンク化、数値 semantic ラベル、W チェック、pdffonts、em-dash 0 |

---

## 3. 各 Phase の詳細チェックリスト

### Phase 1: Discovery (Pre-Draft)

**目的**: target 外しを構造的に防ぐ

- [ ] クライアント公式 Web サイトを `WebFetch` または screenshot で確認
- [ ] 代表者の LinkedIn / 公式プロフィール / インタビュー記事を確認
- [ ] ターゲット顧客像 (ICP) を Web 記載で特定 (業種 / 規模 / フェーズ)
- [ ] クライアント独自 vocabulary を抽出 (ブランド名 / モデル名 / キーフレーズ)
- [ ] クライアントリテラシー水準を判定 (AI 素人 / 技術者 / 経営者 etc.)

**判定**: 上記 5 項目を確認せず Draft に入ると、後続 phase で target 外し由来の手戻りが発生する。

### Phase 2: Draft (v1-v3)

**目的**: 構造・コア訴求の確立

- [ ] アジェンダ: 5 セクション以内 (Why / What / How / Pricing / Next)
- [ ] 1 ページ 1 メッセージ
- [ ] 価値訴求 -> 構造 -> 価格の順序 (Sato 流: 金額は最後)
- [ ] 競合比較で「敵地で戦わない」(自社が負ける軸は載せない)
- [ ] PL 試算ページ (粗利インパクト・ブレイクイーブン)
- [ ] 数値には必ず出典 URL + 発行日

### Phase 3: Refinement (v4-v9)

**目的**: jargon / target 整合の修正

- [ ] 業界略語の初出注釈 (PMF / CAGR / Multi-Agent / RAG / LP / KPI 等)
- [ ] AI 関連用語注釈 (LLM / fine-tuning / プロンプト / Multi-Agent)
- [ ] 抽象語に具体例を併記 (「大手アプリ」-> 「業務向けソフトウェア (Salesforce 等)」)
- [ ] target 用語整合 (クライアント自身の vocabulary を反映)
- [ ] 思想的基盤 vs カスタムの関係性明示 (ベース vs 上書き)

### Phase 4: Polish (v10-v15)

**目的**: デザイン・横揃えの完成

- [ ] sales-deck-designer 必須 CSS 全項目 (word-break / 日本語フォント / .card grid / margin-top: auto)
- [ ] 並列スライド (Story 1/2/3 等) は同型構造
- [ ] ブロック密度: 1 列 max 2 ブロック
- [ ] 横揃え grid (.grid-2 / .grid-3)
- [ ] em-dash / Markdown ** の不在
- [ ] sales-deck-designer subagent を起動して Critical / Warning レビュー

### Phase 5: Final (v16-v19)

**目的**: 細部のポリッシュ

- [ ] 出典は `<a href="https://...">出典名 (発行年)</a>` のハイパーリンク
- [ ] 数値カードに semantic ラベル (`.stat-tag.issue` / `.stat-tag.chance`)
- [ ] W チェック (1 周目内容 / 2 周目形式・字形・規律)
- [ ] pdffonts で日本語フォント検証 (中国字形フォールバック禁止)
- [ ] 全ページ視覚確認 (`pdftoppm -r 80` で PNG 化)

---

## 4. 起動 workflow

新規 B2B 提案資料を作成する際:

1. **Phase 1 Discovery**: WebFetch / WebSearch / LinkedIn 確認
2. **Phase 2 Draft**: marp-frontmatter.md テンプレ起点で v1 作成
3. **sales-deck-designer subagent 起動**: Phase 2 完了時点でレビュー依頼
4. **Phase 3-5 を user feedback ループで反復**:
   - User 指摘 -> 修正 -> 再 render -> 視覚確認 -> commit -> push
   - v をインクリメント (タイトルスライド subtitle 下)
5. **完成判定**: 5 phase の全チェックリスト ✓ + user 「これで」発言

---

## 5. アンチパターン (関根さん案件で発生した規律違反)

| アンチパターン | 起点 ver | 対策 |
|---|---|---|
| ConsultingOS 規律ファイル不在環境で narrative-only 作業 | v1-v13 | SessionStart 物理ガード (handoff-os-bootstrap-guard) |
| クライアント Web 確認せず憶測で書く | v1-v8 | Phase 1 Discovery 必須化 |
| 業界略語注釈なしで連発 (PMF / Multi-Agent 等) | v6-v15 | 業界略語初出注釈ルール (B1) |
| 数値カードを単純な数字 + 説明だけで配置 | v13-v15 | semantic タグ必須 (B2) |
| URL を 2-3 行で text 直書き | v13-v15 | ハイパーリンク必須 (B3) |
| 並列スライド (Story 等) で末尾構造が揃わない | v13 | 並列同型強制 (B4) |
| 1 列に 3 ブロック以上スタック | v18 | ブロック密度 max 2 (B5) |
| 抽象語を曖昧な訳で出す (大手アプリ等) | v17 | 具体例必須 (B6) |
| User 指示なしで Serif フォント実験 | v9-v13 | visual permission 必須 (B8) |
| 連続スライドの relationship が不明 | v17 | relationship 注釈必須 (B9) |

---

## 6. 検証コマンド

各 Phase 完了時の機械検証:

```bash
# Phase 3 (Refinement) - 業界略語 grep
grep -nE "PMF|CAGR|Multi-Agent|RAG|LP[^a-z]|KPI|ICP|DESIGN|LLM|fine-tuning" *.slides.md

# Phase 4 (Polish) - 改行 / レイアウト
grep -c "word-break: auto-phrase" *.slides.md  # 必須
grep -c '\*\*' *.slides.md                       # 0 必須
grep -c $'\xe2\x80\x94' *.slides.md             # em-dash 0 必須

# Phase 5 (Final) - フォント / リンク / 視覚
pdffonts output.pdf | grep -iE "noto sans cjk[ ,]|simsun|wenquan"  # 0 必須
grep -c '<a href=' *.slides.md                  # 出典数と一致
pdftoppm -png -r 80 output.pdf audit             # 全ページ画像化
ls audit-*.png | wc -l                           # ページ数と一致
```

---

## 7. 出典・依拠先

- 関根さん案件: `claude/oem-sales-strategy-gVMWp` v1-v19 全イテレーション
- 引き継ぎ: `docs/handoff-os-proposal-iteration-learnings.md` (B1-B10 + C1)
- ポートフォリオ: `examples/n-y-craft-consulting-os-oem/README.md`
- 思想的基盤: 佐藤裕介流「ruthlessly edit」「具体 > 抽象」「敵地で戦わない」+ Boris #3
