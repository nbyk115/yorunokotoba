# awesome-design-skills 67 スタイル選定フレーム + ConsultingOS DESIGN.md 統合（2026-05-14）

`creative-director` + `ux-designer` + `frontend-dev` + `sales-deck-designer` + `brand-guardian` 連携のデザインスタイル選定 + AI 専用ルール統合フレーム。AI 同士の「解釈違い」防止 + デザイン統一性確保。

出典: github.com/bergside/awesome-design-skills (INFERENCE: ユーザー提示テキスト経由) + npx typeui.sh pull <name> CLI installer。

## 1. 核心テーゼ: SKILL.md (AI 憲法) + DESIGN.md (人間用) 二層構造

ConsultingOS HTML-First (PR #140) 原則「読者が人間か Claude か」境界線と同型構造:

| 層 | 役割 | ConsultingOS 既存 |
|---|---|---|
| SKILL.md (AI 憲法) | AI へのカラートークン / 余白比率 / コンポーネント Do/Don't 厳格ルール | 38 skill + brand-guardian 5 項目機械検証 (PR #140) |
| DESIGN.md (人間用) | デザイン意図 + 運用ルール設計図 | DESIGN.md §12 (PR #139) ビジュアル参照ライブラリ |

= ConsultingOS は既に二層構造を物理化済、awesome-design-skills は「67 スタイル選択肢」の追加価値あり。

## 2. 67 スタイルカタログ (主要 10 件抜粋)

INFERENCE: 全件詳細はユーザー提示画像経由、Lo-fi 含む 67 種類:

| スタイル | 特徴 | ConsultingOS 適用候補 |
|---|---|---|
| Minimal | 余白広 + シンプルタイポ | 水野さん v4 投資資料 / IR デッキ |
| Lo-fi | 落ち着いたトーン + 広い余白 | 関根さん N&Y Craft クラフトビール (職人感) |
| Glassmorphism | 透明感 + ぼかし | プロダクト LP (将来案件) |
| Brutalism | 太字 + 大胆配置 | 反コンセンサスブランド (将来案件) |
| Retro | 80-90s 風 | レトロブランド (将来案件) |
| Vintage | 古紙感 + 落ち着いた色 | クラフトビール / 食品 vertical |
| Corporate | 信頼感 + 整然 | エンタープライズ提案 (ConsultingOS は中小特化のため低優先) |
| Editorial | 雑誌風 | コンテンツメディア vertical |
| Cyberpunk | ネオン + ダーク | ゲーム / Web3 vertical |
| Bauhaus | 幾何学 + 原色 | ブランド統一感重視 |

## 3. 選定フレーム (4 軸)

YOU MUST: スタイル採用は以下 4 軸全件確認:

1. 案件 ICP との整合 (関根さん N&Y Craft = Lo-fi / Vintage が候補、水野さん v4 = Minimal / Corporate)
2. 既存 brand-guidelines.md との整合 (日本語字形 / em-dash 0 / raw `**` 0)
3. ConsultingOS DESIGN.md §12 参照ライブラリ query 後の確認
4. Boris #3 先回り禁止 (全 67 件インストール禁止、案件発生時に必要分のみ)

## 4. インストール方法 (案件発生時のみ)

```bash
npx typeui.sh pull <style-name>
```

= `.cursor/skills/` or `.claude/` に直接インストール。

YOU MUST: 案件着手前に creative-director が:
1. ICP.md からスタイル候補 2-3 件抽出
2. ux-designer が Lazyweb MCP + awesome-design-skills 候補で参照取得
3. ユーザー or クライアント承認後に `npx typeui.sh pull` 実行
4. brand-guardian が DESIGN.md §12.5.1 5 項目機械検証

## 5. 関根さん / 水野さん適用パス

### 関根さん N&Y Craft OEM

候補スタイル:
- **Lo-fi** (推奨): クラフトビール職人感 + 落ち着いたトーン
- **Vintage**: 古紙感 + 醸造工程の歴史性
- **Editorial**: 雑誌風で商品ストーリー強調

Phase 2 visual / SNS 動画展開時に上記 1-2 件試行、最適化選定。

### 水野さん v4 投資資料

候補スタイル:
- **Minimal** (推奨): 余白広 + シンプルタイポ、IR デッキ標準
- **Corporate**: 信頼感 + 整然 (個人投資家向けでなく機関投資家向けの場合)
- **Editorial**: 投資テーゼをストーリー化する場合

事業計画 v4 書き直し時に Minimal で着手、必要に応じて他候補と比較。

## 6. AI 同士の「解釈違い」防止メカニズム

ユーザー指摘: Cursor + Claude Code 同時運用時に SKILL.md 共有で解釈違い防止。

ConsultingOS 既存:
- 21 hook (em-dash detector / brand-guardian 等) で機械検証
- ハードルール 17 (主語詐称禁止 + Phased Preamble 二層化 PR #160)
- workflow.json (PR #149) で LLM bootstrap data 共有

awesome-design-skills 追加価値: デザインドメイン特化の SKILL.md = 既存規律の補完。

## 7. ICP 提案質問 87-88 件目追加

87. デザインスタイル選定で ICP + 既存 brand-guidelines + 参照ライブラリ query 後の承認プロセスを物理化しているか
88. AI 同士の「解釈違い」を SKILL.md 共有 + 機械検証で防止しているか、それとも口頭規律に閉じているか

## 8. ConsultingOS 自己診断

| 軸 | 適用度 |
|---|---|
| SKILL.md + DESIGN.md 二層構造 | 強 (既存物理化、PR #139 + #140) |
| 67 スタイル選択肢 | 中 (本 references で活用フレーム化) |
| AI 解釈違い防止機械検証 | 強 (21 hook + brand-guardian) |
| 案件別スタイル選定 | 中 (本 references で関根さん / 水野さん適用パス明示) |

## 9. 関連参照

- 出典: github.com/bergside/awesome-design-skills (INFERENCE)
- 関連 skill: DESIGN.md §12 / brand-guidelines.md / HTML-First (PR #140) / video-creative-pipeline (PR #165) / output-quality-rubrics (PR #160)
- 関連 agent: creative-director / ux-designer / brand-guardian
- 関連: Lazyweb MCP (PR #141) / Hard Rule 13 形骸化防止

## 10. 反証チェック (Step 1-4 圧縮)

- Step 1: 67 スタイル + npx CLI は INFERENCE (ユーザー提示テキスト経由) / 適用候補マッピングは assistant 構築
- Step 2: 既存 DESIGN.md §12 + brand-guardian + Hard Rule 13 + HTML-First と整合
- Step 3 実用反証: 関根さん / 水野さん適用パス明示、案件発生時に実機検証可能
- Step 4 リスク即潰し: 全 67 件インストールで形骸化リスクは「案件発生時のみ + 4 軸選定フレーム」で構造的回避
