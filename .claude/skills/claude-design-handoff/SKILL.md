---
name: claude-design-handoff
description: Claude Design（claude.ai の artifact / design 機能、Opus 4.7 駆動）で生成されたビジュアル資産を、Claude Code 側の HTML/CSS/PPT 実装に取り込むためのハンドオフ手順。画像・SVG・HTML スニペット・PPTX エクスポートすべてに対応。
---

# claude-design-handoff

使用タイミング：
- セールス資料やプレゼンでビジュアル（画像・図版・チャート）が必要なとき
- Claude Code harness 内では画像生成ツールがないため、claude.ai（Claude Design）側で生成した資産を受け取って組み込むとき

## 背景

**Claude Code CLI harness** では DALL·E / Midjourney / Claude Design 相当の画像生成ツールは現状利用できない。一方 **Claude.ai（Web UI）の Claude Design** は Opus 4.7 駆動で下記が可能：
- プロンプトから試作／スライド／1枚もの生成
- Canva/PDF/PPTX/HTML でエクスポート
- 既存コード・デザインを読み込んで自動構築
- Pro/Max/Team/Enterprise で利用可

この2環境を**分業**するのが最適ルート。

## ハンドオフパターン

### Pattern A：画像（PNG/JPG）を受け取る

1. ユーザが Claude.ai で画像生成
2. ユーザがチャットに画像を貼る or ファイル共有
3. エージェント側が `examples/<deck-name>/assets/` に保存
4. HTML に `background-image: url('./assets/<name>.png')` で組込
5. `node render.mjs` で確認、commit、push

### Pattern B：HTML スニペットを受け取る

1. Claude Design で "HTML エクスポート" 選択
2. ユーザがコードブロックを貼る
3. エージェントが既存 `index.html` の該当セクションに統合
4. スタイルの衝突・命名規則は揃える（既存 `.col / .viz` 等と互換に）
5. レンダ → commit → push

### Pattern C：SVG を受け取る

1. Claude Design で SVG エクスポート
2. ユーザがチャットに貼る（そのまま SVG コード）
3. エージェントが `.viz` 内にインライン埋込
4. ブランド色と整合（`fill="#E60012"` 等）するよう最小改修

### Pattern D：PPTX を受け取る

1. Claude Design で PPTX エクスポート
2. エージェントは PPTX を直接取り込めない場合がある → まず画像化してから組込
3. あるいはスクショで受け取って画像として組込

## プロンプト作成ガイド（Claude Design 送り）

資料 P[N] のビジュアル生成を依頼する際、以下のフォーマットで渡す：

```
[対象スライド]
ページ番号・タイトル・対象読者

[ブランドガイド]
- 色：<hex codes>
- フォント系統：<Sans / Serif / 和文指定>
- トーン：<editorial / modernist / minimal / etc.>

[生成希望枚数と仕様]
- 枚数：N枚（横長 1600×480px など）
- 各画像のコンセプト（1行ずつ）

[禁則]
- テキストを画像内に直接入れない（CSS で後から重ねる想定）
- キャラクター感は避ける／プロフェッショナル・経営層向け
- 特定の人種・性別・年齢を連想させない

[整合先の既存デザイン参照]
- <repo-path>/index.html のトーン
- 既存スライドのスクショ
```

## 標準保存パス

生成物は下記で統一：

```
examples/<deck-slug>/
├── index.html
├── assets/
│   ├── era-1.png           # Claude Design 生成（画像）
│   ├── era-2.png
│   └── era-3.png
├── render.mjs
└── ...
```

## CSS 組込パターン（画像）

```css
.col .viz{
  height:100px;
  background-size:cover;
  background-position:center;
  background-color:#0A0A0A; /* fallback */
}
.col:nth-child(1) .viz{background-image:url('./assets/era-1.png')}
.col:nth-child(2) .viz{background-image:url('./assets/era-2.png')}
.col:nth-child(3) .viz{background-image:url('./assets/era-3.png')}
.col .viz::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.2),rgba(0,0,0,.55))}
```

Puppeteer は **ローカル画像**なら確実に読み込む（Unsplash URL は環境依存）。

## 品質チェック

Claude Design 生成物を組み込む前に下記確認：
1. **解像度**：1280×720 スライドに対し横幅1600以上（2倍デバイススケール対応）
2. **色調**：`docs/sales-deck-rules.md` のブランドガイドと整合
3. **余白**：画像上に CSS でテキストを重ねる場合、画像内のコントラストが十分か
4. **トンマナ**：editorial / modernist の一貫性

## URL → DESIGN.md 内製抽出フロー（2026-05-03 学習）

任意 Web サイトから DESIGN.md を抽出する場合の標準フロー。frontend-dev 評価で aura.build はフォワード生成（テキスト/画像 → UI）専用で URL → DESIGN.md 抽出機能はないことが判明、代わりに OSS の Dembrandt + Claude Code 内製化を採用。

### 推奨アーキテクチャ

```
[対象 URL]
   ↓ Dembrandt（OSS / MIT）https://github.com/dembrandt/dembrandt
   ↓ Playwright + Chromium で開き、SPA Hydration を 8-24 秒待機
   ↓ getComputedStyle() で全要素を走査
   ↓ 色・タイポグラフィ・スペーシング・ボーダー・シャドウ・コンポーネント抽出
[DESIGN.md + W3C DTCG JSON + Brand Guide PDF]
   ↓ Claude Code スクリプトでラップ
[brand-guidelines 整合チェック（brand-guardian 起動）]
   ↓
[案件 DESIGN.md として配置]
```

### 実装手順

```bash
# 1. Dembrandt インストール
git clone https://github.com/dembrandt/dembrandt && cd dembrandt && npm install

# 2. 対象 URL から DESIGN.md 抽出（SPA は --slow フラグ）
node bin/dembrandt.js --url https://example.com --output ./design.md --slow

# 3. brand-guardian で字形・禁止表現・抽象表現チェック
# 4. 案件レベル DESIGN.md として strategy/<案件>/DESIGN.md に配置
```

### 制約と回避策

| 制約 | 回避策 |
|---|---|
| 動的 CSS-in-JS（styled-components / emotion）未対応 | Playwright `--slow` で hydration 待機延長 |
| 認証必須サイト | Cookie 注入（Playwright 標準）|
| Canvas / WebGL レンダリング | 解析不能、別途 Vision AI 必要 |
| ToS 違反リスク（他社サイト商用分析）| クライアント案件は legal-compliance-checker 事前審査 |

### 競合ツール比較

| ツール | 入力 | DESIGN.md 出力 | 価格 | 採否 |
|---|---|---|---|---|
| Dembrandt | URL | 直接出力 | OSS / MIT 無料 | 推奨 |
| html.to.design | URL（Chrome 拡張）| Figma レイヤー（97% 精度）| 月 12 回無料 | 注目 |
| Superposition | URL | CSS / SCSS / Figma | 無料 | 注目 |
| aura.build | テキスト / 画像 | UI 生成（フォワード）| 不明 | 機能ミスマッチ |

## 関連

- `.claude/skills/sales-deck-review/SKILL.md`: レビュー用
- `.claude/agents/creative/sales-deck-designer.md`: デッキ実装エージェント
- `docs/sales-deck-rules.md`: コピー・レイアウト完全版ルール
- `docs/external-references.md`: 外部リソース URL 集約（デザイン抽出系含む）
- [Dembrandt GitHub](https://github.com/dembrandt/dembrandt)（OSS / MIT・URL → DESIGN.md 直接出力）

## 出典・依拠先

- FACT: 本ファイルは @nbyk115/consulting-os の規律ファイルとして 2026-05-05 PR #65 で体系的に出典明示が物理化された（ファイルパス: .claude/skills/claude-design-handoff/SKILL.md、タイトル: ---、規律カテゴリ: ConsultingOS 6 部門 27 エージェント・27 スキル体系の構成要素）
- INFERENCE: 業界標準ベストプラクティス（佐藤裕介流「構造で売る = 仕組みが結果を担保する」、Boris Cherny 流「9 規律 ruthlessly edit」、該当部門の業界フレームワーク）から派生、各セクションの判断基準は実証研究と経験則の両軸を採用
- SPECULATION: 4 週間ごとの再評価カレンダー（evolution-log.md「再評価カレンダー」セクション）で形骸化検出、Boris #3 削除セット対象、規律違反や過剰要件が発生した場合は本ファイルを統合・分離・削除のいずれかで整理する運用予定
