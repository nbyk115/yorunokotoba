# Creative Playbook — デザイン・コンテンツ・Figma MCP

## 概要
Creative部門の全エージェントが参照するデザインプロセス・コンテンツ標準・Figma MCP活用ガイド。

---

## 1. デザインプロセス

### ワークフロー
```
ブリーフ → リサーチ → UX設計 → UI設計 → 実装 → レビュー → リリース
   ↑                                                    ↓
   └──────────── フィードバックループ ────────────────┘
```

### 各フェーズの担当
| フェーズ | 担当エージェント | 成果物 |
|---|---|---|
| ブリーフ | creative-director | クリエイティブブリーフ |
| UX設計 | ux-designer | ユーザーフロー, ワイヤーフレーム |
| UI設計 | ux-designer + creative-director | Figmaデザイン |
| 実装 | frontend-dev | HTML/CSS/React コード |
| コンテンツ | content-strategist | コピー, 記事, SNS |
| 品質チェック | brand-guardian | ブランド適合判定 |

---

## 2. Figma MCP 連携ガイド 🎨

### 対応エージェント
- `creative-director` 🎨 — デザインレビュー・方針確認
- `ux-designer` 🎨 — UXフロー・仕様策定
- `frontend-dev` 🎨 — Figma→コード変換

### Figma連携フロー
```
1. FigmaリンクをURLで共有
2. MCP経由でデザインデータを取得
3. コンポーネント構造を解析
4. デザイントークン抽出（色・フォント・スペーシング）
5. Reactコンポーネントとして実装
```

### デザイントークン変換ルール
| Figma | Tailwind CSS |
|---|---|
| カラースタイル | colors in tailwind.config |
| テキストスタイル | fontSize + fontWeight |
| エフェクト | shadow / blur |
| Auto Layout | flex / grid |
| Spacing | spacing scale (4px基準) |

---

## 3. コンポーネント設計

### Atomic Design階層
```
Atoms → Molecules → Organisms → Templates → Pages
```

### コンポーネント命名規約
```
{カテゴリ}/{コンポーネント名}.tsx

例:
  ui/Button.tsx
  ui/Input.tsx
  layout/Header.tsx
  layout/Footer.tsx
  features/LoginForm.tsx
  features/ProductCard.tsx
```

### コンポーネント品質基準
- [ ] TypeScript props定義（interface）
- [ ] デフォルトprops設定
- [ ] アクセシビリティ（ARIA, キーボード操作）
- [ ] レスポンシブ対応
- [ ] ダーク/ライトモード対応（該当する場合）
- [ ] Storybook ストーリー（該当する場合）

---

## 4. レスポンシブデザイン

### ブレークポイント（Tailwind標準）
| ブレークポイント | サイズ | デバイス |
|---|---|---|
| sm | 640px | モバイル横 |
| md | 768px | タブレット |
| lg | 1024px | ラップトップ |
| xl | 1280px | デスクトップ |
| 2xl | 1536px | ワイドスクリーン |

### モバイルファースト原則
1. デフォルトスタイルはモバイル向け
2. `sm:` `md:` `lg:` で段階的に拡張
3. タッチターゲット最小 44x44px
4. フォントサイズ最小 16px（入力フィールド）

---

## 5. コンテンツ制作標準

### 文体ガイド
- **トーン**: 専門的だが親しみやすい
- **文長**: 1文40文字以内を推奨
- **段落**: 3〜4文で改行
- **見出し**: 読者のベネフィットを含める

### SEO/AIO 最適化
- タイトルタグ: 30〜35文字
- メタディスクリプション: 120文字以内
- H1: ページに1つ
- 画像alt属性: 必須
- 構造化データ: FAQ/HowTo/Article

### コンテンツタイプ別テンプレート
| タイプ | 構成 | 文字数目安 |
|---|---|---|
| ブログ記事 | 導入→本文(3-5セクション)→まとめ→CTA | 2000-4000字 |
| ケーススタディ | 課題→施策→結果→学び | 1500-2500字 |
| LP | ヒーロー→課題→解決→特徴→証明→CTA | セクション×100-200字 |
| SNS投稿 | フック→本文→CTA | 140-280字 |

---

## 6. パフォーマンス基準

### Core Web Vitals 目標
| 指標 | 目標 |
|---|---|
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
| TTFB | < 800ms |

### 画像最適化
- フォーマット: WebP / AVIF 優先
- 遅延読み込み: viewport外の画像
- レスポンシブ画像: srcset + sizes
- 最大ファイルサイズ: 200KB/画像

---

## 7. アクセシビリティ（WCAG 2.1 AA）

### 必須対応項目
- [ ] カラーコントラスト比 4.5:1 以上（テキスト）
- [ ] キーボード操作対応（Tab, Enter, Escape）
- [ ] スクリーンリーダー対応（ARIA）
- [ ] フォーカスインジケーター
- [ ] 代替テキスト（画像・アイコン）
- [ ] フォームラベル
- [ ] エラーメッセージの明示

---

## 適用エージェント
- `creative/creative-director` — デザイン方針・レビュー
- `creative/ux-designer` — UX/UI設計
- `creative/frontend-dev` — フロントエンド実装
- `creative/content-strategist` — コンテンツ制作
- `creative/campaign-planner` — キャンペーンクリエイティブ
- `creative/brand-guardian` — 品質チェック
- `creative/agentic-content` — AIO最適化
