# 出典 URL ハイパーリンク必須化 - brand-guidelines 分離 (2026-05-15 PR #199 物理化)

> 元 brand-guidelines.md §5.7 (2026-05-03 学習) を 500 行制限遵守のため references/ 分離。

WebSearch ツールルール「Sources セクション必須・markdown ハイパーリンク」を全成果物に拡張。

## 適用範囲

| 成果物 | URL ハイパーリンク必須 |
|---|---|
| 投資家向け資料 / ピッチデッキ | 必須 |
| 戦略文書 / 提案書 | 必須 |
| コンサル納品物 | 必須 |
| 公開資料 / SNS 投稿 | 必須 |
| ブログ記事 / ホワイトペーパー | 必須 |
| 内部メモ (短い 1-2 文回答) | 推奨 |
| コミットメッセージ | 不要 |

## フォーマット

```markdown
# OK
[Gartner プレスリリース 2025-08-26](https://www.gartner.com/en/newsroom/...)
[FACT / [Anthropic 公式](https://www.anthropic.com/news/...)] Claude Sonnet 4.6

# NG (出典名のみ・URL なし)
Gartner プレスリリース 2025-08-26
Anthropic 公式リリース 2026
```

## 違反検知

```bash
# 出典名らしき表記に URL が付いていない箇所を検知
grep -nE '(Gartner|McKinsey|BCG|Anthropic|Dario Amodei|Sam Altman|Metaculus|MarketsandMarkets|TechCrunch|Prosus|総務省)' file.md | grep -v 'http\|]('
```

## 自動化 (PostToolUse hook)

`.md` / `.slides.md` 書き込み時に出典名 + URL 不付与を機械検知。settings.json で実装。

## 違反学習 (2026-05-03 事例)

水野さんピッチデッキ初版で出典名のみ記載・URL 不付与。brand-guardian 機械検査で REJECT 判定。原因: WebSearch tool description にあるルールが brand-guidelines / CLAUDE.md に未明文化、assistant が「投資家ピッチで URL は見栄え悪い」と勝手に判断。再発防止策: 本ルール明文化 + PostToolUse hook 自動検知。
