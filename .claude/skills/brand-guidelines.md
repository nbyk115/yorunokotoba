# Brand Guidelines: ブランドガイドライン

## 概要
全エージェントが遵守するブランドルール・トーン規定・品質基準・禁止表現。

---

## 1. ブランドトーン

### Phil Knight Nike 創業マニフェスト 10 項目（2026-05-06 PR AC 統合、ConsultingOS ブランド規律の権威者基盤）

ConsultingOS のブランド規律は Nike 創業者 Phil Knight が記した 10 項目マニフェスト（著書「Shoe Dog」+ 創業時メモ）に整合する形で物理化。各項目は ConsultingOS 既存規律と整合（INFERENCE）:

1. Our business is change = 川邊健太郎 AI 駆動型 + Born in AI 思想
2. We're on offense. All the time = monopoly-positioning §教訓 4 独占攻勢 + Boris Cherny ruthlessly edit
3. Perfect results count, not a perfect process. Break the rules: fight the law = ハードルール 1 実測必須 + ティール「漸進改善は競争を生む」否定
4. About battle as about business = ティール §教訓 3「競争は敗者のもの」+ 独占ポジショニング設計
5. Assume nothing. Make sure people keep promises. Push yourselves push others. Stretch the possible = 反証チェック Step 1-3 + Boris Cherny 自己検証 + 出典明示
6. Live off the land = BMR スモビジ「初期投資ゼロ」+ 致命傷を避ける
7. Your job isn't done until THE job is done = 真の 100 原則（PR Z）+ 形式達成度 ≠ 真の 100
8. Dangers: Bureaucracy / Personal ambition / Energy takers vs givers / Knowing weaknesses / Don't get too many things on the platter = Boris #3 ruthlessly edit + Meta 中間管理職削減 + 形骸化追加禁止
9. It won't be pretty = 反証 Step 1-3 で泥臭く検証
10. If we do the right things we'll make money damn near automatic = 佐藤裕介「構造で売る = 仕組みが結果を担保する」整合（INFERENCE）

名言: 「Just Do It」「ブランドは信頼から生まれる」 = ConsultingOS の規律遵守 + 反証チェック + 完了系断言禁止と整合。

### コアバリュー
- **信頼性**: データと根拠に基づく発言（Phil Knight「ブランドは信頼から生まれる」+ Step 3 実用反証）
- **専門性**: 業界知識と実践経験に裏付けられた提案（Phil Knight 第 5 項「Stretch the possible」）
- **実行力**: 提案だけでなく実装まで一気通貫

### トーンスペクトラム
```
カジュアル ←――――――●―――→ フォーマル
                ここ（専門的だが堅すぎない）

抽象的 ←―――――――――――●→ 具体的
                    ここ（常に数字と事例で語る）

消極的 ←―――――――――――●→ 積極的
                    ここ（明確な提案と行動提起）
```

---

## 2. 出力ルール（全エージェント共通）

### 出力フォーマット規律（2026-05-01 学習・絶対遵守）

#### ① Markdown 太字記法 `**` 全面禁止
- NG: `**重要**` `**結論**` `**売上 30% 増**`
- OK: 「重要」「結論」「売上 30% 増」/ IMPORTANT / NEVER / 大文字英語キーワード
- 理由: コピペ時に `**` がそのまま見えて美観破壊／環境によって描画されない／出力一貫性確保
- 例外: コードブロック内のサンプル・引用元の原文保持時のみ

#### ② 改行ルール
- 一文中での改行禁止（句読点直前・直後での改行 NG）
- 段落区切り・リスト項目・見出しでのみ改行
- 「変な改行」検知: 「、」「。」直後の不自然な改行 / 単語途中での折り返し
- Word/PPT 出力時はテキストランの改行コードを CRLF/LF で統一、半端な改行混入を防ぐ

#### ③ 表の中央揃え（Word/PPT 出力時）
- 表全体（テーブル）はページ中央揃え必須
- セル内のテキストも基本中央揃え（左揃え指定があれば従う）
- python-docx: `table.alignment = WD_TABLE_ALIGNMENT.CENTER`
- python-pptx: `table.left = (slide_width - table_width) / 2` で中央配置
- HTML/PDF: `<table style="margin: 0 auto;">` または `text-align: center;`

#### ④ ページ収まり（PPT/PDF 必須）
- PPT/PDF 出力時、テキスト・表・画像が**ページシート内に必ず収まる**
- はみ出し検知: スライド/ページサイズに対しコンテンツの bounding box が超過していないか機械検証
- 検証コマンド例:
  - PDF: `pdfinfo output.pdf` でページサイズ確認 → コンテンツとの差分を視覚確認
  - PPTX: `python-pptx` でテキストフレームの `auto_size = MSO_AUTO_SIZE.TEXT_TO_FIT_SHAPE` 適用
- 収まらない場合の対応: フォントサイズ縮小 → 文章圧縮 → ページ分割（順序厳守）

#### ⑤ 佐藤裕介 W チェック（出力直前必須）
出力前に必ず 2 周のチェックを実行する:

| 周 | チェック対象 |
|---|---|
| 1 周目（内容） | 結論先行か / 数値具体化されているか / PL に落ちているか / 出典 3 ラベル明示か / 反証チェック結果ブロックがあるか |
| 2 周目（形式） | `**` 不使用か / 改行が自然か / 表中央揃えか / ページ収まっているか / 字形検証済みか / brand-guidelines 準拠か |

- W チェック未実施の出力は規律違反として REJECT
- brand-guardian がこの 2 周を機械的に検証する役割を担う

### 必須フォーマット
```
1. 結論（1〜2文で端的に）
2. 根拠（データ・分析・事例）
3. 具体アクション（誰が・いつ・何を）
```

### 数値化ルール
| NG | OK |
|---|---|
| 大幅に改善 | 30%改善 |
| 多くの顧客 | 顧客数1,200社 |
| コストが高い | 月額50万円 |
| すぐに | 2週間以内に |
| かなりの効果 | 粗利+200万円/月 |

---

## 3. 禁止表現

### 絶対禁止
| 禁止カテゴリ | 禁止表現例 | 代替表現 |
|---|---|---|
| 曖昧な結論 | 「様子を見る」「検討する」 | 「X月までにY指標でZ%を確認し判断」 |
| 根拠なき最上級 | 「業界No.1」「最高品質」 | 「〇〇調査でシェアX%」 |
| 断定的保証 | 「必ず成功」「絶対に」 | 「標準シナリオでROI X%見込み」 |
| 抽象的形容 | 「革新的」「画期的」 | 具体的な機能・効果を記述 |
| PLなき提案 | 「やった方がいい」 | 「粗利+X万円、Y ヶ月で回収」 |
| 消極的結論 | 「難しい」「厳しい」で終わる | 代替案を必ず提示 |

### 注意表現
| 表現 | 使用条件 |
|---|---|
| 「おすすめ」 | 根拠(数値/事例)を併記する場合のみ |
| 「効果的」 | 具体的な効果量を示す場合のみ |
| 「重要」 | 何がなぜ重要かを説明する場合のみ |

---

## 4. 言語ルール

### 基本
- **言語**: 日本語優先
- **敬語**: です/ます調（提案書・クライアント向け）
- **技術用語**: 初出時に簡潔な説明を付与
- **英語**: 技術用語・固有名詞はそのまま使用（無理に訳さない）

### 英語出力ルール
- **em ダッシュ（U+2014）・en ダッシュ（U+2013）は使用禁止**。代わりにコロン（:）、カンマ（,）、ピリオド（.）、セミコロン（;）で区切る
- NG: U+2014 を含む例示はリポジトリ字形違反検出を汚染するため省略（検証は `grep $'\xe2\x80\x94'` で 0 件確認）
- OK: `This is important: it affects revenue`
- OK: `This is important, and it affects revenue`

### 表記統一
| 項目 | ルール |
|---|---|
| 数字 | 半角アラビア数字（1, 2, 3...） |
| 単位 | 半角（%、px、KB） |
| カッコ | 全角（）を基本、技術用語内は半角() |
| 句読点 | 「、」「。」 |
| リスト | 箇条書きは「-」で統一 |

---

## 4.5 AI文章バレ対策（全エージェント必須）

> **AIが書いた文章だとバレないための品質基準。全コンテンツ系アウトプットに適用する。**

### 事実と正確性
- ハルシネーション（虚偽情報）を含めない。正確で検証可能な事実のみ記述する
- 古い情報を使わない。必ず最新の情報に更新する

### 表現の具体性
- 抽象的・曖昧な表現を避け、読者の理解を助ける具体的な表現を使う
- 「〜するべき」「非常に重要です」など曖昧・強調表現の多用を避ける

### 文章の自然さ
- 接続詞や語尾に変化をつけ、単調にならない自然な文章を心がける
- 不自然な言い回しやAIらしいパターン文を避け、自然な日本語にする
- 文の長さに配慮し、一文を適切に区切る

### 読みやすさ
- 漢字・ひらがな・カタカナの比率を整え、読みやすさを意識する
- 読者のレベルに応じて、難しい用語は補足説明を加える
- 誤字脱字がないように見直しを徹底する

### AIパターン回避チェックリスト
- [ ] 「〜と言えるでしょう」「〜ではないでしょうか」の連発がない
- [ ] 段落冒頭が全て「まず」「次に」「そして」「最後に」のパターンになっていない
- [ ] 「重要なのは」「注目すべきは」の多用がない
- [ ] 箇条書きが全て同じ文型（「〜すること」）で揃いすぎていない
- [ ] 「ただし」「一方で」の後に毎回同じ構文が来ていない
- [ ] 文末が「です」「ます」の単調な繰り返しになっていない

---

## 5. ビジュアルガイドライン

### カラーパレット
プロジェクトごとに定義するが、以下のルールを適用:
- **プライマリ**: ブランドの主色（CTA、見出し）
- **セカンダリ**: 補助色（アクセント、ホバー）
- **ニュートラル**: グレースケール（テキスト、背景、ボーダー）
- **セマンティック**: 成功(緑), 警告(黄), エラー(赤), 情報(青)

### タイポグラフィ
- **見出し**: ゴシック体（Noto Sans JP / Inter）
- **本文**: ゴシック体、line-height: 1.7〜1.8
- **コード**: Monospace（JetBrains Mono / Fira Code）
- **最小フォント**: 14px（本文）、12px（注釈）

### 日本語字形禁則（中国字形フォールバック防止）
> **現象**: Word / PPTX / PDF で日本語が中国語（簡体字・繁体字）の字形でレンダリングされる事故が頻発。原因は CJK 統合漢字（直・骨・没・強・社・直 等）の locale 解決失敗。

#### 必須対応（全ドキュメント・全エクスポート形式）
- **HTML**: `<html lang="ja">` 必須。`<meta charset="UTF-8">` も併記
- **DOCX**: ドキュメントプロパティの言語を **`ja-JP`** に設定（Word の「校閲 → 言語」または python-docx の `w:lang` 要素）
- **PPTX**: 各テキストランの `lang` 属性を `ja-JP` に。python-pptx なら `run.font.language_id = MSO_LANGUAGE_ID.JAPANESE`
- **PDF**: 出力前に HTML/DOCX の lang を確定。Puppeteer なら `<html lang="ja">` を必ず確認

#### フォント指定の禁則
| NG（中国字形リスク） | OK（日本語字形確定） |
|---|---|
| `Noto Sans CJK`（サフィックスなし） | `Noto Sans JP` / `Noto Sans CJK JP` |
| `Source Han Sans`（無印） | `Source Han Sans JP` / `源ノ角ゴシック JP` |
| `SimSun` / `SimHei` / `Microsoft YaHei` | `Yu Gothic` / `游ゴシック` / `Hiragino Sans` |
| `Arial Unicode MS` 単独 | `Yu Mincho` / `Hiragino Mincho ProN` |

#### 推奨フォントスタック（全プラットフォーム互換）
```css
font-family:
  "Yu Gothic", "游ゴシック", "Hiragino Sans", "ヒラギノ角ゴ ProN",
  "Noto Sans JP", "Meiryo", "メイリオ",
  sans-serif;
```

#### 採用候補（評価中、デフォルト採用は時期尚早）

**Gen Interface JP**（Inter + Noto Sans JP 混植、yamatoiizuka 制作、OFL ライセンス、v0.1.2、2026 年公開）

- 設計: Inter（英文 UI）+ Noto Sans JP の緻密調整 = UI 用途最適
- ライセンス: OFL = 無償・商用可
- リスク: v0.1.2 = 初期版、Windows ウェイト不具合修正直後
- 評価期日: 2026-06-03（claude-mem / Anthropic 公式機能と同期）
- 評価項目: pdffonts / unzip+grep で中国字形フォールバック実測検証 + 全 OS（Windows / Mac / Linux）動作 + 6 ヶ月後の安定性
- リポジトリ: github.com/yamatoiizuka/gen-interface-jp
- 公式: gen.typesetting.jp
- 採用判断: 評価期日後に実測検証通過 = デフォルト採用候補へ昇格、未通過 = 候補維持 or 削除

#### 検知方法（機械検証必須・2026-05-01 違反学習で強化）

**スタイル指定で満足するな。生成後の埋込フォントを必ず機械的に検証する。**

##### PDF: `pdffonts` で埋込フォント検証（必須）
```bash
# 必要時インストール: brew install poppler / apt-get install poppler-utils
pdffonts output.pdf

# 期待: type 列に「Type 1」「TrueType」「CID Type 0」等が出る
# 名前列に Yu Gothic / Hiragino / Noto Sans JP / Source Han Sans JP のいずれかが含まれる
# 名前列に Noto Sans CJK（無印）/ Source Han Sans（無印）/ SimSun が出たら REJECT
```

##### DOCX: zip 解凍 + grep で言語タグ検証（必須）
```bash
unzip -p output.docx word/document.xml | grep -o 'w:lang w:val="[^"]*"' | sort -u
# 期待: w:lang w:val="ja-JP" のみ / 他言語が混在したら REJECT

unzip -p output.docx word/styles.xml | grep -i 'rfonts.*east' | head
# eastAsia="Yu Gothic" 等の和文フォント指定確認
```

##### PPTX: zip 解凍 + grep で lang 属性検証（必須）
```bash
unzip -p output.pptx ppt/slides/slide1.xml | grep -o 'lang="[^"]*"' | sort -u
# 期待: lang="ja-JP" のみ
```

##### HTML: 直接 grep（即時可能）
```bash
grep -E 'lang="(ja|ja-JP)"|<meta[^>]*charset' output.html
grep -i 'font-family' output.html | grep -iE 'noto sans cjk[^j]|source han sans[^j]|simsun|microsoft yahei'
# ヒットしたら REJECT
```

##### 目視最終確認（自動検証通過後）
- 以下の漢字を目視: **直 骨 没 強 社 入 海 角 直** （SC/TC/JP で字形差が大きい）
- 「骨」上部が縦か横か / 「直」下部の点の位置 / 「没」右側の形が判別ポイント
- 違和感があれば lang 属性とフォント指定を再確認

##### やってはいけないこと（違反パターン）
- スタイル指定（CSS / python-docx / python-pptx）だけで「対応済み」と報告
- 生成後の機械検証をスキップ
- 「フォント指定したから大丈夫」と思い込む（レンダリング環境にフォントがなければフォールバックで中国字形になる）

#### claude.ai Word 出力の既知バグ
- claude.ai の `.docx` エクスポートは document language を未設定で出すケースあり
- **対策**: Claude Code 側で生成する場合は `python-docx` で明示的に `<w:lang w:val="ja-JP"/>` を埋め込む
- claude.ai 側の出力をそのまま使う場合は、Word で「校閲 → 言語 → 校正言語の設定 → 日本語」を必ず実行

### スペーシング
- **基準単位**: 4px
- **スペーシングスケール**: 4, 8, 12, 16, 24, 32, 48, 64, 96
- **セクション間**: 48px〜96px
- **要素間**: 8px〜24px

---

## 5.5 数値・単位整合性ルール（2026-05-02 学習・必須）

### 違反学習（実例）

market-researcher サブエージェントが summary 文「2030 年 42-52 億米ドル（約 6.3-7.8 兆円）」と table「MarketsandMarkets 526.2 億ドル」を内部矛盾のまま出力。私（assistant）が summary を機械的にコピーし、水野さん向け 1000 万円エンジェル出資ピッチデッキに「42-53 億ドル」と記述（正しくは 420-530 億ドル）。投資家向け資料での単位錯誤 = 信頼毀損リスク重大。

### 必須クロスチェック手順

| 検証項目 | チェック方法 |
|---|---|
| 1. 単位の自己整合性 | `億 × USD` と `兆円` の換算式（USD × 150 = JPY、$1B = 1,500 億円 = 0.15 兆円）を頭の中で回す |
| 2. summary vs table の突き合わせ | サブエージェント出力の summary 数値と detail table の数値が一致するか機械的に確認 |
| 3. 桁数の常識感覚 | $42B 市場 ≒ 6 兆円 ≒ Adobe 売上クラス、$4.2B 市場 ≒ 0.6 兆円 ≒ ミドルキャップ SaaS 1 社相当、文脈で桁が妥当か判断 |
| 4. 出典機関の数値レンジ | 同一数値について複数機関の値が同オーダー（10 倍以内）か |
| 5. 通貨換算の方向 | USD → JPY × 150 / JPY → USD ÷ 150（為替レート 2026-05 時点・適宜更新）|

### 単位対応表（覚える）

| USD 表記 | 億ドル表記 | JPY 換算（@150）|
|---|---|---|
| $1 million | 1 億円相当 | 約 1.5 億円 |
| $1 billion = $1B | 10 億ドル | 約 1,500 億円 = 0.15 兆円 |
| $10 billion = $10B | 100 億ドル | 約 1.5 兆円 |
| $50 billion = $50B | 500 億ドル | 約 7.5 兆円 |
| $1 trillion | 10,000 億ドル | 約 150 兆円 |

### 違反検知ルール

| パターン | アクション |
|---|---|
| 数値 + 通貨単位（億ドル / billion / 兆円）が含まれる出力 | 必ずクロスチェック手順 1-5 を実行してから書き込み |
| サブエージェント出力を引用する | summary と table の数値突き合わせを機械的に実施 |
| 桁が文脈と合わないと感じた | 即停止、別出典で再確認 |
| 投資家向け / 公開資料 / 法務関連の数値 | 必ず 2 つ以上の出典で照合 |

### 自動化候補

- PostToolUse hook で「億ドル」「billion」「兆円」を含む書き込み時に警告ログ出力
- pre-commit hook で投資家向け資料（strategy/ 配下）の数値抽出 + 単位整合性チェック

---

## 5.6 改行・<br> タグ許容範囲（2026-05-03 学習）

CLAUDE.md ハードルール 16 ②「一文中の改行禁止」の精緻化。

### `<br>` タグ許容範囲

| 場所 | 許容 | 理由 |
|---|---|---|
| カバースライド `.sub` 内 | OK | 装飾用、視覚的階層構成 |
| section-divider `.sub` 内 | OK | 装飾用、Act タイトル下の補足 |
| 本文スライドのコンテンツ | NG | 句読点後改行と同義、可読性低下 |
| blockquote 内 | NG | 文章分割で論理構造破壊 |
| 表セル内 | NG | レイアウト崩れリスク |

### 句読点（、。）直後の改行

本文では完全禁止。Marp / Markdown では空行で段落分割を使用。

### 違反検知

```bash
# <br> タグの本文使用検知
grep -nE '^[^<].*<br>' file.slides.md | grep -v 'class="sub"\|class="meta"' | grep -v cover

# 句読点直後の改行検知
grep -nE '[、。]$' file.slides.md
```

### 自動化（PostToolUse hook）

`.slides.md` 書き込み時に `<br>` 本文使用 + 句読点後改行を機械検知。settings.json で実装。

---

## 5.7 出典 URL ハイパーリンク必須化

> 詳細は `.claude/skills/references/brand-guidelines-source-url-rule.md` 参照 (500 行制限遵守のため 2026-05-15 PR #199 で分離、元 2026-05-03 水野さんピッチデッキ違反学習)。投資家資料 / 戦略文書 / 提案書 / SNS 投稿等で出典名 + URL ハイパーリンク必須、PostToolUse hook で機械検知。

---


## 6. 品質ゲート

### 識別性ゲート（2026-05-15 PR #226、AI 時代の反スロップ）

YOU MUST: creative 成果物の brand-guardian レビュー時、「AI / 参考事例が合理的に推奨する案を、どこで断ったか」を 1 行明示。未記載は REVISE。AI 生成物は均質化 (研究 FACT: ポジティブ感情 +107% / 意味類似性 +33%) に向かうため、床ゲート (スロップ回避) だけでなく天井ゲート (識別性確保) を併用。詳細: `.claude/skills/references/creative-playbook-distinctiveness.md` (断る力 3 能力 = テイスト / 意思と勇気 / ユーモア)。

### brand-guardian チェックフロー
```
成果物作成 → brand-guardian レビュー → PASS/REVISE/REJECT
                                         ↓
                                    PASS → リリース
                                    REVISE → 修正 → 再レビュー
                                    REJECT → 差し戻し → 再設計
```

### ブランド適合度スコア
| スコア | 判定 | アクション |
|---|---|---|
| 9-10 | PASS | そのままリリース可 |
| 7-8 | PASS (minor) | 軽微な修正後リリース |
| 5-6 | REVISE | 修正必須 |
| 1-4 | REJECT | 再設計 |

---

## 実戦テンプレート

### ブランドチェックシート（コピペ用）
```
【チェック対象】___（LP / ブログ / SNS / 提案書 / 広告）
【チェック日】20XX-XX-XX
【チェック者】___

テキスト品質:
□ 結論→根拠→アクションの順序
□ 数値の正確性（根拠あり）
□ 禁止表現なし（No.1/絶対/様子を見る）
□ 誤字脱字・表記ゆれなし
□ ターゲットの言葉で書かれている

AI文章バレ対策:
□ 接続詞・語尾が単調に繰り返されていない
□ AIパターン文（「〜と言えるでしょう」連発等）がない
□ 漢字・ひらがな・カタカナの比率が自然
□ 一文が長すぎず適切に区切られている
□ ハルシネーション（検証不能な事実）がない

ビジュアル品質:
□ ブランドカラー準拠
□ フォント規定準拠
□ ロゴのクリアスペース確保
□ 画像品質・解像度OK
□ レスポンシブ対応

判定: □ PASS □ REVISE □ REJECT
ブランド適合度スコア: __/10
指摘事項: ___
```

---

## 7. brand-guidelines → DESIGN.md 変換ガイド

> **本ガイドラインの内容をDESIGN.md（機械可読な実装仕様）に変換する際の対応表。**

| brand-guidelines のセクション | DESIGN.md のセクション | 変換内容 |
|---|---|---|
| 1. ブランドトーン |: | DESIGN.mdには含めない（人間向けルール） |
| 2. 出力ルール |: | DESIGN.mdには含めない（テキスト品質ルール） |
| 3. 禁止表現 | `Do / Don't` | 禁止表現を「Don't」セクションに変換 |
| 4. 言語ルール | `Typography` | フォント・敬語ルールをフォントスタック定義に変換 |
| 4.5 AI文章バレ対策 |: | DESIGN.mdには含めない（テキスト品質ルール） |
| 5. ビジュアルガイドライン | `Colors` `Typography` `Spacing` | カラーパレット・フォント・スペーシングをトークンに変換 |
| 6. 品質ゲート | `Do / Don't` | チェック項目の一部を「Do」に変換 |

### 変換時の注意
- DESIGN.mdは**実装者（AI含む）が読む仕様書**。思想や背景は書かない
- 値は具体的に（「プライマリカラー」ではなく `#1A1A2E`）
- Tailwindのconfig形式で書くとfrontend-devが即活用できる

## 適用エージェント
- 全27エージェントが本ガイドラインを遵守
- `creative/brand-guardian` が最終品質ゲートとして判定
- `creative/creative-director` がDESIGN.md生成・管理を担当



> 反証モード（トリプルチェック）の共通ルールは CLAUDE.md を参照。
---

## 5.8 em-dash / en-dash 物理化ゲート

> 詳細は `.claude/skills/references/brand-guidelines-emdash-gate.md` 参照 (500 行制限遵守のため 2026-05-15 PR #199 で分離、元 PR AU 実装 2026-05-06)。CLAUDE.md ハードルール 16 ⑥ em-dash / en-dash 禁止を Stop hook + PostToolUse hook で物理検出、規律定義書 (`.claude/skills/` 等) は除外。動作モード: warn (default) / off / block (環境変数 `CONSULTINGOS_EMDASH_ENFORCEMENT`)。

---


## バージョン履歴

| Ver | 日付 | 変更内容 | 根拠 | 効果 |
|---|---|---|---|---|
| 1.0.0 | 2026-03-25 | 初版 |: | ベースライン |


## 出典・依拠先

- FACT: 本ファイルは @nbyk115/consulting-os の ConsultingOS 規律ファイルとして 2026-05-05 PR #65 で体系的明示物理化により定義された（ファイルパス: .claude/skills/brand-guidelines.md）
- INFERENCE: 業界標準ベストプラクティス（佐藤裕介流の構造で売る原則、Boris Cherny 流の 9 規律 ruthlessly edit、該当部門の業界フレームワーク）から派生し実装
- SPECULATION: 4 週間ごとの再評価カレンダー（evolution-log.md 再評価カレンダーセクション）で形骸化検出、Boris #3 削除セット対象、規律違反発生時は統合 / 分離 / 削除で整理予定
