# DESIGN.md : よるのことば

> 方針: ピンクポップ。日本の夜職/20-40 代女性向け。あたたかく親しみやすい「丸み + ピンク + 絵文字」のトーンで、占いを開いた瞬間にテンションが上がる体験を作る。インクブルー単色のクールな旧路線は廃し、明るいピンク基調 + 淡いグロー + 絵文字多めで「自分に語りかけてくれる」感触を最優先する。
>
> SSOT: トークンの実値は `frontend/src/styles/tokens.css`（出典 `design/contracts/tokens.json`）。本書はそれと一致させる。変更時は tokens.json → validate.ts → tokens.css → 本書の順で更新する。

## Colors

ブランドピンクは `--rose: #E8627C`（明るく親しみのあるローズ）。これがピンクポップの主役色で、CTA・アクティブ・リンク・アクセントに使う。ゴールド `--gold` はプレミアムの 1 点アクセント。背景はライトが基本（明るいピンク温白）、夜時間帯（22:00-05:00）に自動でダークへ切り替わる。

### Light Theme（既定）
| Token | Value | Usage |
|---|---|---|
| `--bg1` | `#FFF5F0` | 背景（ピンク混じり温白） |
| `--bg-body` | `var(--bg1)` | body 背景 |
| `--rose` | `#E8627C` | ブランドピンク。CTA / アクティブ / リンク / アクセント |
| `--pink` | `#D4506A` | ローズの濃い変種（グラデ終点・hover） |
| `--blush` | `#F2A0B0` | 淡ピンク。装飾・ニュアンス用 |
| `--lavender` | `#B08ACF` | パーティクル・補助アクセント |
| `--gold` | `#D4A853` | プレミアムの唯一の上質アクセント |
| `--t1` | `#3A2830` | 文字（ピンク寄り濃茶、純黒不使用） |
| `--t2` | `rgba(58,40,48,0.72)` | 文字 secondary |
| `--t3` | `rgba(58,40,48,0.56)` | 文字 tertiary |
| `--card` | `rgba(255,255,255,0.92)` | カード背景（半透明 + blur） |
| `--card-solid` | `#FFFFFF` | 不透明カード・ボタン地 |
| `--border` | `rgba(58,40,48,0.08)` | ボーダー |
| `--card-highlight-shadow` | `0 4px 20px rgba(232,98,124,0.12)` | 主役カードの淡いピンクグロー（ブランドの立体表現） |

### Dark Theme（`[data-theme="dark"]`、夜 22:00-05:00 自動）
| Token | Value | Usage |
|---|---|---|
| `--bg1` | `#0D0B0E` | 背景（ワイン寄り深黒） |
| `--rose` | `#F0809A` | 暗背景で映える明度上げローズ |
| `--card` | `rgba(28,22,30,0.85)` | カード背景 |
| `--card-solid` | `#1C161E` | 不透明カード地 |
| `--t1` | `#F0E8EC` | 文字（白に微ピンク） |
| `--t2` | `rgba(240,232,236,0.72)` | 文字 secondary |
| `--t3` | `rgba(240,232,236,0.56)` | 文字 tertiary |
| `--border` | `rgba(240,232,236,0.10)` | ボーダー |

ダーク適用は `frontend/src/lib/theme.ts`。`auto`（既定）は 22:00-05:00 をダーク判定、`on`/`off` で手動上書き可（localStorage `ynk_night_mode`）。5 段階の時間帯モードは現状未実装で、light/dark の二値。

### Semantic
| Token | Usage |
|---|---|
| `--rose` | ブランドピンク。CTA・アクティブ・リンク・主役のアクセント |
| `--gold` | プレミアム専用の上質アクセント。1 画面 1 点に絞る |
| `--lavender` / `--blush` | 補助アクセント・パーティクル・装飾ニュアンス |

## Typography

### Font Stack
```css
/* Heading / Body : 丸ゴシックで警戒心を解く、あたたかい印象 */
font-family: var(--font-heading);
/* = 'Zen Maru Gothic', 'Hiragino Maru Gothic Pro', 'BIZ UDGothic', sans-serif */
/* Weight: 400 (body), 500 (emphasis), 700 (heading) */

/* Accent : 装飾用に予約（--font-accent: 'Cormorant', serif）。現状は最小限の使用 */
```

### Scale
| Element | Size | Weight | Line Height |
|---|---|---|---|
| H1（ページタイトル） | 22px | 700 | 1.3 |
| H2（セクション） | 16-18px | 700 | 1.4 |
| H3（カード見出し） | 14-16px | 700 | 1.4 |
| Body | 15px | 400 | 1.7-1.9 |
| Small / Caption | 12-13px | 400 | 1.5-1.7 |
| Minimum | 10-11px | 400-700 | 1.4 |

## Spacing

ベース 4px。トークン `--sp-1`〜`--sp-8` = 4, 8, 12, 16, 20, 24, 32, 48。

| Element | Padding | Margin |
|---|---|---|
| Card | 20px（`--sp-5`） | 12px-16px bottom |
| Section | 0 16px | 16-24px bottom |
| Button | 14px 28px | -- |
| Input | 14px 16px | 12px bottom |

## Border Radius

トークン: `--r-card: 18px` / `--r-button: 14px` / `--r-input: 12px` / `--r-tag: 20px` / `--r-modal: 24px`。アバターは `50%`（円）。最小 8px（角を鋭くしない）。

## 影・グロー方針（ピンクポップ）

立体表現の主役は「淡いピンク/ゴールドのグロー」。これがブランドの手触りで、冷たい黒影一辺倒にはしない。

- 主役カード・CTA: 淡いピンクグロー（例 `--card-highlight-shadow` = `0 4px 20px rgba(232,98,124,0.12)`、Button primary = `0 4px 20px rgba(232,98,124,0.28)`）。有彩色グローは alpha 0.3 以下に抑える。
- サブカード・一覧: ごく弱い影で輪郭づけ程度（過剰な発光はしない）。
- 上端 inset ハイライト線（`rgba(255,255,255,...)`）でガラス質の立体感を足してよい。
- 規約（`design/contracts/rules.json`）: 有彩色グローは alpha 0.3 以下を許可、0.4 以上の garish な強発光のみ error。

## 装飾・絵文字方針（ピンクポップ）

絵文字はブランドのコア要素。見出し・CTA・占い結果メッセージに積極的に使い、ターゲットが読んでテンションが上がる温度を作る（🌙 夢占い / ✨ ホロスコープ / 💞 相性 / 💫💕🌟⚡ セクション見出し等）。ただし無秩序に散らさず、各ブロックの意味づけ・リズム作りに使う。グラデーションと淡いグローもブランド要素として CTA・主役カード・バッジに使ってよい。1 画面の装飾の主役は絞り、視線が占い結果・CTA へ向かう導線を最優先する。パーティクル（rose/lavender/gold）は控えめなアンビエントとして背景に流す。

## Components

### Button（`frontend/src/components/ui/Button.tsx`）
- Primary: `background: linear-gradient(135deg, var(--rose), var(--pink))`, 白文字, `boxShadow: 0 4px 20px rgba(232,98,124,0.28)`（ピンクグロー）
- Secondary: `background: var(--card-solid)`, `color: var(--t1)`, `border: 1px solid var(--border)`
- Ghost: `background: transparent`, `color: var(--rose)`, border なし
- 共通: `border-radius: var(--r-button)`（14px）, `padding: 14px 28px`, `font-size: 15`, `font-weight: 700`, `min-height/min-width: 44`
- Transition: `transform var(--anim-hover), box-shadow var(--anim-hover)`

### Card（`frontend/src/components/ui/Card.tsx`）
- Background: `var(--card)` + `backdrop-filter: blur()`
- Border: `1px solid var(--border)`, radius `var(--r-card)`（18px）, padding 20px
- 主役カードは淡いピンクグロー、グラデ背景も可

### Input / Textarea
- Border: `1.5px solid var(--border)`, radius 12px, focus は rose の outline
- Padding: 14px 16px

### Bottom Tab Bar
- Background: `var(--card)` + blur, アクティブは `var(--rose)`, 非アクティブ `var(--t3)`

## Animation

| Animation | Duration | Easing |
|---|---|---|
| Fade in | 500ms | ease |
| Slide up | 450ms（`slide-up-1`〜`-5` は 50ms stagger） | ease |
| Hover transform | 200ms | ease |
| Theme toggle | 300ms | ease |
| Character float | 3.6s ループ | ease-in-out |

- キャラの浮遊（`.chara-float`）は `translateY` 最大 14px。ブランドコアの心地よい動きなので `prefers-reduced-motion` でも維持する（その他のアニメは reduce 時に停止）。
- SSR キャラは `.chara-sparkle` で✨をきらめかせる。
- レイアウトプロパティ（width/height/top/left）はアニメーションしない。transform / opacity のみ。

## Responsive

| Name | Width | Layout |
|---|---|---|
| Mobile（既定） | 0-600px | 単一カラム・全幅カード |
| Desktop | 601px+ | `max-width: 480px`（`--app-max-width`）で中央寄せ、アプリ風 |

タッチターゲット最小 44px。モバイルファースト。

## PWA

- Display: standalone, Orientation: portrait
- `manifest.json`: `theme_color` / `background_color` = `#FFF5F0`
- `index.html` meta `theme-color` = `#E8627C`（ブラウザ chrome をブランドピンクに）
- Icons: 192x192, 512x512

## Do

- 色はトークン（CSS custom properties）を使う。ブランドのピンクグロー `rgba(232,98,124,...)` はトークン未定義箇所でインライン可
- 絵文字を見出し・CTA・結果メッセージに積極活用し、ターゲットのテンションを上げる
- グラデーション・淡いグローをブランド要素として CTA・主役カード・バッジに使う
- light/dark 両対応（`[data-theme]`）。夜は自動でダーク
- ガラス質カードに `backdrop-filter: blur()`
- すべてのテキストに Zen Maru Gothic（あたたかい丸ゴシック）
- アニメは控えめに（hover の translateY 最大 2px、キャラ float 最大 14px、opacity 中心）

## Don't

- 角を鋭くしない（最小 radius 8px）
- 純黒（#000）・純白（#fff）を文字色にしない
- フォントを 2 種類超にしない
- レイアウトプロパティ（width/height/top/left）をアニメーションしない
- garish な強い有彩色グロー（alpha 0.4 以上）を使わない。淡いピンク/ゴールドグロー（alpha 0.3 以下）はブランドシグネチャとして可
- グラデーション上にコントラスト不足の文字を直置きしない
- システムフォントに頼らない。Zen Maru Gothic を必ず読み込む
- 英語出力で em dash / en dash（長いダッシュ記号）を使わない。コロン（:）・ハイフン（-）・カンマ（,）で代替
