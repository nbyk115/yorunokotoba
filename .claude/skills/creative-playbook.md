# Creative Playbook — デザイン・コンテンツ・マルチツール連携

## 概要
Creative部門の全エージェントが参照するデザインプロセス・コンテンツ標準・デザインツール選定ガイド。
**デザインツールはFigma一択ではなく、リクエストに応じて最適ツールを自動選定する。全ツール無料枠で運用。**

---

## 1. デザインツール選定（リクエスト駆動）

### 鉄則: ニーズからツールを決める

> デザインタスクを受けたら「何を作るか」でツールを決定する。
> 全ツール無料枠で運用。有料プランは導入しない。

### ツール選定マトリクス

| ツール | 最適な用途 | コスト | 強み |
|---|---|---|---|
| **Google Stitch** | UI/アプリ画面の0→1生成・高速プロトタイプ・デザインシステム | 無料（月350回） | AI自動生成・コードエクスポート・Figma連携・Claude Code MCP対応 |
| **Canva** | SNS画像・バナー・簡易LP・名刺・プレゼン資料・ロゴ案 | 無料（Free） | テンプレート豊富・素材内蔵・高速制作 |
| **Figma** | UIデザインの仕上げ・コンポーネント管理・デザインシステム運用 | 無料（Starter） | 手動編集の精度・開発者連携・デザインシステム管理 |
| **Google Slides** | 提案書・ピッチデック・社内資料・ワークショップ資料 | 無料 | 共同編集・ビジネス標準・テキスト主体の資料 |

### 自動選定ロジック（creative-directorが判断）

```
リクエスト受領
  ↓
何を作るか？
  ├── UI/アプリ画面（新規・ラフ） → Google Stitch（0→1生成）
  │     → 仕上げが必要なら → Figma or frontend-dev
  ├── 提案書・ピッチデック・社内資料 → Google Slides
  ├── SNS画像・バナー・チラシ・簡易ビジュアル → Canva
  ├── LP（高速プロトタイプ） → Google Stitch → frontend-dev
  ├── LP（テンプレベース・ノンコード） → Canva
  ├── LP（カスタム・仕上げ重視） → Figma → frontend-dev
  ├── デザインシステム構築 → Google Stitch（生成）→ Figma（管理）
  ├── ロゴ案・ブランド素材（ラフ） → Canva
  ├── プレゼン（ビジュアル重視） → Canva
  ├── プレゼン（データ・テキスト主体） → Google Slides
  └── 不明・複合 → creative-directorが判断して分割
```

### ツール併用パターン

| ケース | 組み合わせ |
|---|---|
| UI新規制作 | Google Stitch（0→1生成）→ Figma（仕上げ）→ frontend-dev（実装） |
| 提案書 + デモUI | Google Slides（資料）+ Google Stitch（UIモック） |
| SNSキャンペーン + LP | Canva（SNS素材）+ Google Stitch or frontend-dev（LP） |
| ピッチ + ブランド素材 | Google Slides（ピッチ）+ Canva（ロゴ・素材） |
| LP + OGP画像 | Google Stitch/frontend-dev（LP）+ Canva（OGP画像） |
| デザインシステム構築 | Google Stitch（DESIGN.md生成）→ Figma（運用・管理） |

### 各ツールの出力と納品

| ツール | 主な出力形式 | 納品方法 |
|---|---|---|
| Google Stitch | HTML / CSS / React / Figmaエクスポート / DESIGN.md | 共有リンク / コードコピー |
| Canva | PNG / PDF / SVG / MP4 | 共有リンク or ダウンロード |
| Figma | デザイン仕様 → コード化 | 共有リンク / Dev Mode |
| Google Slides | PDF / PPTX | 共有リンク or エクスポート |

### Google Stitch 活用ガイド

> **UI/アプリ画面の0→1はStitchが最速。仕上げはFigma。**
> stitch.withgoogle.com にGoogleアカウントでサインイン。ブラウザだけで動作。

| 機能 | 説明 |
|---|---|
| テキスト→UI生成 | 自然言語でUIを記述→完全なデザイン生成 |
| 画像→UI変換 | スケッチ・スクショからUIを再生成 |
| コードエクスポート | HTML/CSS/Reactコードを直接コピー |
| Figmaエクスポート | 生成デザインをFigmaに直接送信 |
| DESIGN.md | デザインシステムをファイルとして抽出・インポート |
| 音声操作 | Voice Canvasで音声指示・リアルタイム修正 |
| プロトタイプ | 画面遷移・インタラクションを自動生成 |

**月間制限**: Standard（Gemini Flash）月350回 / Experimental（Gemini Pro）月50回

---

## 2. デザインプロセス

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

## 3. デザインツール連携ガイド

### 対応エージェントとツール
| エージェント | Canva | Figma | Google Slides |
|---|---|---|---|
| `creative-director` 🎨 | ✅ 方針指示・レビュー | ✅ デザインレビュー | ✅ 資料レビュー |
| `ux-designer` 🎨 | ✅ 簡易LP・モック | ✅ UX/UI設計 | — |
| `frontend-dev` 🎨 | — | ✅ Figma→コード変換 | — |
| `proposal-writer` | — | — | ✅ 提案書作成 |

### Figma連携フロー（UI/UX・コンポーネント設計時）
```
1. FigmaリンクをURLで共有
2. MCP経由でデザインデータを取得（MCP有効時のみ）
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

### Figma Make ワークフロー（AI生成→実装）

Figma MakeはFigma無料プランで使用可能。AIがデザイン仕様からコードを生成する。

**5層プロンプト構造（この順序で記述）:**

| Layer | 内容 | 例 |
|---|---|---|
| 1. Outcome | ページの目的・ターゲット・トーンを宣言 | "Generate a Next.js LP for [Brand], targeting [audience]..." |
| 2. Structure | コンポーネント階層を明示（PascalCase） | "<HeroSection> contains: headline, subheadline, CTAButton" |
| 3. Interaction | 許可するインタラクションのみ列挙 | "Hover: translateY(-4px), 250ms ease. Do NOT add parallax." |
| 4. Responsive | Mobile-firstで3ブレークポイントの挙動 | "FeatureGrid: 1col → 2col → 3col" |
| 5. Quality | パフォーマンス・アクセシビリティ・出力形式 | "All images lazy-loaded. Semantic HTML required." |

**Figma Make投入前チェックリスト:**
- [ ] デザイントークン名（Color/Semantic/〜）が仕様書に記載されているか
- [ ] コンポーネント名がPascalCaseで定義されているか
- [ ] インタラクション仕様が動詞+数値で記述されているか
- [ ] プロンプトは英語で記述されているか（精度が高い）
- [ ] 「Do NOT add」で不要アニメーションを明示的に除外しているか

### Figma Variables設計（無料プラン対応）

Figma無料プランでVariables（デザイントークン）を使用可能。ただし**Modes（ダークモード切替）は無料プラン対象外**のため、静的トークン設計にする。

```
Collection: Color/Primitive   ← 原色（直接使わない）
  └── Blue-500: #1A56DB

Collection: Color/Semantic    ← 意味に基づくエイリアス（コンポーネントで使用）
  └── Brand-Primary → Blue-500
  └── Text-Primary → Gray-900
  └── Surface-Default → White
```

**命名規則:** `[Category]/[Name]` — スラッシュでグループ化

---

## 4. コンポーネント設計

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

### UIステート設計（ELESパターン）— 全コンポーネント必須

動的データを表示するコンポーネントは必ず全4状態を設計する。「完成形（Success）だけ」のデザインは未完成。

| State | 定義 | Figmaフレーム命名 |
|---|---|---|
| **E**mpty | データ0件 / 初回利用 / フィルター結果ゼロ | `ComponentName/Empty` |
| **L**oading | データ取得中 / スケルトン表示 | `ComponentName/Loading` |
| **E**rror | 取得失敗 / 権限なし / ネットワークエラー | `ComponentName/Error` |
| **S**uccess | 通常表示（理想データ + ストレステスト） | `ComponentName/Default` |

**Empty Stateの3パターン:**
- Pattern A: イラスト + CTA（初回オンボーディング）
- Pattern B: アイコン + 説明文（検索結果ゼロ）
- Pattern C: ゴーストプレースホルダー（「追加してください」誘導）

**Loading Stateのルール:**
- スケルトンは実際のコンテンツ形状に合わせる（汎用グレーバー禁止）
- アニメーション: shimmer左→右、1.5s
- 3秒タイムアウト → Error Stateへ自動遷移

### Dev Mode代替アノテーション（Figma無料プラン）

Figma無料プランではDev Modeが使用不可。以下のアノテーション設計で開発ハンドオフを代替する。

**アノテーション命名規則:**
- スペーシング: `space-4 (16px)` — トークン名 + px値
- カラー: `Fill: Color/Semantic/Brand-Primary (#1A56DB)`
- タイポグラフィ: `H2 / 32px / 1.4 / 600 / Noto Sans JP`
- インタラクション: 矢印 → `Hover: translateY(-4px), 250ms ease`
- アセット: `Export: hero.webp / 1200×800px / alt: [テキスト]`

**Figmaページ構成（無料プラン推奨）:**
```
Page 1: 🎨 Design System（トークン・コンポーネントライブラリ）
Page 2: 🖥 Desktop Screens
Page 3: 📱 Mobile Screens
Page 4: 🔄 States（ELESパターン全状態）
Page 5: 📝 Handoff Notes（アノテーション付きフレーム）
Page 6: 🗄 Archive（WIP・ボツ案）
```

**ハンドオフ共有設定:** "Anyone with link → can view"（edit権限は外部に渡さない）

---

## 5. レスポンシブデザイン

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

## 6. コンテンツ制作標準

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

## 7. パフォーマンス基準

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

## 8. アクセシビリティ（WCAG 2.1 AA）

### 必須対応項目
- [ ] カラーコントラスト比 4.5:1 以上（テキスト）
- [ ] キーボード操作対応（Tab, Enter, Escape）
- [ ] スクリーンリーダー対応（ARIA）
- [ ] フォーカスインジケーター
- [ ] 代替テキスト（画像・アイコン）
- [ ] フォームラベル
- [ ] エラーメッセージの明示

---

## スキル横断リファレンス

| 状況 | 参照スキル |
|---|---|
| トーン・表現の品質チェック | → `brand-guidelines.md` |
| AIに選ばれるコンテンツ設計 | → `prompt-engineering.md` §3 RAG設計 |
| フロントエンドの品質ゲート | → `code-quality-gates.md` |
| API連携画面の設計 | → `api-design-patterns.md` |
| 収益に直結するコンテンツ | → `revenue-growth-framework.md` §3 アセット蓄積 |

---

## 適用エージェント
- `creative/creative-director` — デザイン方針・レビュー
- `creative/ux-designer` — UX/UI設計
- `creative/frontend-dev` — フロントエンド実装
- `creative/content-strategist` — コンテンツ制作
- `creative/campaign-planner` — キャンペーンクリエイティブ
- `creative/brand-guardian` — 品質チェック
- `creative/agentic-content` — AIO最適化


---

## 🔺 反証モード（トリプルチェック必須）

本スキルを適用する全アウトプットは、CLAUDE.md「反証モード」セクションに定義されたトリプルチェックを必ず実行すること。

1. **自己反証**: 結論に対する反論・反例を最低3つ挙げ、確証バイアスを排除
2. **構造反証**: ロジックの飛躍・数値の妥当性・抜け漏れを検証
3. **実用反証**: 実行可能性・エッジケース・最悪シナリオを検証

チェックなしのアウトプットはドラフト扱い。省略禁止。
