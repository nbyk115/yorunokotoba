---
name: website-audit
description: URL を渡すだけで Web サイトを 5 軸 × 各 20 点 = 100 点満点で採点し、改善提案レポートを生成するクリエイティブ部門スキル。Hotice デッキ案件の延長で「採点 → 改善提案 → 制作」のフルパッケージ商品化を可能にする。
allowed-tools: WebFetch, WebSearch, Read, Grep, Glob, Bash
model: opus
---

# /website-audit: Web サイト 5 軸採点スキル（クリエイティブ部門主導）

## 起動方法
`/website-audit <URL>` または「<URL> を採点して」と自然言語で指示。

## 部門配置: クリエイティブ部門
主導: `creative-director`
連携: `ux-designer` / `frontend-dev` / `brand-guardian` / `content-strategist` / `seo-specialist`（マーケティング部門）

## 5 軸採点設計（各 20 点 = 100 点満点）

### 軸 1: UI/UX 視覚（0-20 点）
- レイアウト構造（情報階層 / グリッド / 視線誘導）
- タイポグラフィ（フォント選定 / サイズスケール / 行間）
- カラーシステム（コントラスト比 / ブランド整合 / 感情設計）
- スペーシング（4px / 8px グリッド準拠 / セクション間隔）
- 評価担当: ux-designer + creative-director
- 参照: DESIGN.md セクション 2-4

### 軸 2: レスポンシブ（0-20 点）
- デスクトップ（1200px+）/ タブレット（768-1024px）/ モバイル（480-767px）
- ブレークポイント切替の自然さ
- タッチ領域 24x24px 以上
- 評価担当: frontend-dev
- 参照: DESIGN.md セクション 5 + Playwright（任意）

### 軸 3: アクセシビリティ（WCAG 2.1 AA）（0-20 点）
- コントラスト比 4.5:1 以上（通常）/ 3:1 以上（18pt+）
- alt 属性 / フォーカス表示 / 色覚多様性配慮
- スクリーンリーダー読み上げ精度
- 動画 / 音声の字幕 or 文字起こし
- 評価担当: brand-guardian + frontend-dev
- 参照: DESIGN.md セクション 7（PR #15 で追加済）

### 軸 4: コンテンツ品質（0-20 点）
- ファーストビュー訴求（5 秒で何のサイトか分かるか）
- 見出し階層と読みやすさ
- CTA（Call to Action）の配置 / 文言 / 数
- 抽象論禁止（「最高品質」ではなく「導入企業 100 社」）
- 評価担当: content-strategist + proposal-writer
- 参照: consulting-playbook 全エージェント共通の出力ルール

### 軸 5: SEO / GEO（0-20 点）
- title / description / og タグ
- 構造化データ（schema.org）
- Core Web Vitals（LCP / INP / CLS）
- AI 検索（GEO）対応の見出し構造
- 評価担当: seo-specialist + marketing-analyst
- 参照: marketing-research-playbook

## 実行フロー

```
Step 1: WebFetch で対象 URL の HTML / メタ情報取得
Step 2: 必要に応じて Playwright でレスポンシブ・動的レンダリング確認
Step 3: 5 軸を順次評価（各エージェント連携）
Step 4: 反証チェック Step 1-3（評価バイアスを潰す）
Step 5: brand-guardian で出力フォーマット規律チェック
Step 6: レポート生成（5 軸スコア + 上位 3 改善提案 + 総合所見）
```

## 出力フォーマット

```
【Web サイト採点レポート】<URL> / YYYY-MM-DD

総合スコア: XX / 100

軸 1 UI/UX 視覚: XX / 20
  良い点: <具体>
  改善点: <具体 + 数値根拠>

軸 2 レスポンシブ: XX / 20
（同様に各軸）

軸 3 アクセシビリティ（WCAG AA）: XX / 20
軸 4 コンテンツ品質: XX / 20
軸 5 SEO / GEO: XX / 20

【上位 3 改善提案（PL インパクト順）】
1. <改善案 + 想定インパクト + 実装難易度 + 期間>
2. <同上>
3. <同上>

【次のアクション】
スポット採点で完結 / 改善提案実装まで / 月次継続改善 のいずれを推奨

【反証チェック結果】
Step 1-3 + 残存リスク
```

## 商品化（ICP.md 商品ライン候補 9 つ目）

| 商品形態 | 価格 | 期間 |
|---|---|---|
| スポット採点 + 改善提案レポート | 5-15 万円 | スポット |
| 採点 + 改善提案 + 制作実装 | 30-80 万円 | スポット |
| 月次継続改善 + 効果測定 | 月 3-8 万円 | 継続 |

Hotice 案件の Web 制作（8-25 万円）と組み合わせ「採点 → 改善 → 制作」のフルパッケージ化が可能。

## 禁止事項
- 「全体的に良い」「もう少し改善余地あり」等の抽象論（CLAUDE.md What NOT 違反）
- 出典なし数値断言（「コントラスト比 4.5:1 未満」等は実測値必須）
- 競合サイトへの ToS 違反スクレイピング（Scrapling / Camofox 同類禁止）
- 著作物の丸パクリ提案（YouTube パクリ術と同類禁止）

## 関連
- `creative-director`: 採点総括・最終レポート責任者
- `ux-designer` / `frontend-dev` / `brand-guardian`: 各軸評価担当
- `content-strategist` / `seo-specialist`: コンテンツ・SEO 軸担当
- `DESIGN.md` セクション 2-7: 採点基準の根拠
- `consulting-playbook`: 出力ルール / プロトタイプ・ファースト原則
- `/audit`: ConsultingOS 自体の 5 軸自己評価（本スキルと別軸）
- `/check-hallucination`: 採点根拠のハルシネーション防止


## 出典・依拠先

- FACT: 本ファイルは @nbyk115/consulting-os の ConsultingOS 規律ファイルとして 2026-05-05 PR #65 で体系的明示物理化により定義された（ファイルパス: .claude/skills/website-audit/SKILL.md）
- INFERENCE: 業界標準ベストプラクティス（佐藤裕介流の構造で売る原則、Boris Cherny 流の 9 規律 ruthlessly edit、該当部門の業界フレームワーク）から派生し実装
- SPECULATION: 4 週間ごとの再評価カレンダー（evolution-log.md 再評価カレンダーセクション）で形骸化検出、Boris #3 削除セット対象、規律違反発生時は統合 / 分離 / 削除で整理予定
