# DESIGN.md : よるのことば

## Colors

PR5 リデザイン: インクブルー単色 → くすみピンク基調（日本20-40代女性向け再設計）。彩度45-58%の「くすみピンク」で上質化。旧 #E8627C（彩度76%、安っぽい）を廃し、黄み寄せのローズへ。夜モード背景はインクブルーを廃止しワイン/バーガンディ軸で統一。

Wave L1 確定: `[data-theme]` ライト/ダーク切り替え廃止。常時ダーク + time-of-day 5段階セレクタのみを正とする。

### 常時ダーク + time-of-day テーマ（Wave L1 確定）

夜系4モード（night-deep / dawn / dusk / night）が基本。dayモード（11:00-17:00）のみ明るい背景。

| Token | 夜系モード値 | day モード値 | Usage |
|---|---|---|---|
| `--bg1` | time-of-day 切替（下表参照） | `#FBF4F2` | Background primary |
| `--rose` | `#EC8C9E` | `#E0758C` | CTA and active states only |
| `--rose-deep` | `#D97088` | `#C75E76` | Rose hover variant |
| `--blush` | `#F3D9DC` | `#F3D9DC` | 淡ピンク。カード地ニュアンス用 |
| `--lavender` | `#8A87B8` | `#8A87B8` | Particle accent (装飾用途のみ) |
| `--gold` | `#C9A961` | `#C9A961` | Unique premium accent (シャンパンゴールド) |
| `--accent` | `#C9A961` | `#C9A961` | Primary accent - gold. All modes. |
| `--accent-rose` | `#EC8C9E` | `#E0758C` | CTA and active state accent |
| `--card-primary` | `rgba(40,28,34,0.92)` | `rgba(255,255,255,0.96)` | Primary card background (1 per screen) |
| `--card-secondary` | `rgba(28,20,24,0.60)` | `rgba(255,255,255,0.62)` | Secondary card background |
| `--border-primary` | `rgba(246,236,238,0.12)` | `rgba(58,42,48,0.10)` | Primary card border |
| `--border-secondary` | `rgba(246,236,238,0.06)` | `rgba(58,42,48,0.05)` | Secondary card border |
| `--t1` | `#F6ECEE` | `#3A2A30` | Text primary |
| `--t2` | `rgba(246,236,238,0.68)` | `rgba(58,42,48,0.70)` | Text secondary |
| `--t3` | `rgba(246,236,238,0.46)` | `rgba(58,42,48,0.52)` | Text tertiary |
| `--shadow-card-primary` | `inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 28px rgba(0,0,0,0.40)` | `inset 0 1px 0 rgba(255,255,255,0.55), 0 4px 20px rgba(224,117,140,0.14)` | Primary card shadow |
| `--shadow-card-secondary` | `inset 0 1px 0 rgba(255,255,255,0.04), 0 2px 10px rgba(0,0,0,0.28)` | `inset 0 1px 0 rgba(255,255,255,0.45), 0 2px 10px rgba(0,0,0,0.08)` | Secondary card shadow |

### Rarity Tokens（Wave L1 追加）
| Token | Value | Usage |
|---|---|---|
| `--rarity-n` | `var(--t3)` | N レアリティ（通常） |
| `--rarity-r` | `var(--rose)` | R レアリティ（レア） |
| `--rarity-sr` | `var(--lavender)` | SR レアリティ（スーパーレア） |
| `--rarity-ssr` | `var(--gold)` | SSR レアリティ（最高レア） |

### Time of Day Background Colors (PR5 確定値: 青を完全排除、ピンク/ワイン軸で統一)
| Mode | Hours | `--bg1` | Character |
|---|---|---|---|
| `night-deep` | 02:00-05:00 | `#150E14` | 最暗。ワイン寄り深黒 |
| `dawn` | 05:00-11:00 | `#2A1E28` | 夜明け前のワイン色 |
| `day` | 11:00-17:00 | `#FBF4F2` | ピンク温白。昼の光 |
| `dusk` | 17:00-22:00 | `#241823` | 宵闇。深まる夜 |
| `night` | 22:00-02:00 | `#1C1620` | 夜の帷 |

### Semantic
| Color | Usage |
|---|---|
| `--accent` / `--gold` | 唯一の上質アクセント。金 1 点のみ |
| `--accent-rose` / `--rose` | CTA とアクティブ状態のみ。全面使用禁止 |
| `--lavender` | パーティクルカラー（PR4-6 で用途整理） |
| `--blush` | 補助アクセント（PR4-6 で用途整理） |

## Typography

### Font Stack
```css
/* Heading / Body */
font-family: 'Zen Maru Gothic', sans-serif;
/* Weight: 400 (body), 500 (emphasis), 700 (heading) */

/* Accent / Decorative */
font-family: 'Cormorant', serif;
/* Weight: 300, 400, 500. Used for quotes, decorative text */
/* Italic available for emphasis */
```

### Japanese Font Stack (fallback)
```css
font-family: 'Zen Maru Gothic', 'Hiragino Maru Gothic Pro', 'BIZ UDGothic', sans-serif;
```

### Scale
| Element | Size | Weight | Line Height |
|---|---|---|---|
| H1 (page title) | 22px | 700 | 1.3 |
| H2 (section title) | 18px | 700 | 1.4 |
| H3 (card title) | 16px | 700 | 1.4 |
| Body | 15px | 400 | 1.7 |
| Small / Caption | 13px | 400 | 1.5 |
| Minimum | 11px | 400 | 1.4 |
| **Hero JP (Zen Maru, 主役)** | 24px | 700 | 1.4 |
| Hero EN (Cormorant italic, 装飾降格) | 24px | 300 | 1.3 |

## Spacing

### Base Unit
4px

### Scale
4, 8, 12, 16, 20, 24, 32, 48

### Common Patterns
| Element | Padding | Margin |
|---|---|---|
| Card | 20px | 12px bottom |
| Section | 0 16px | 24px bottom |
| Button | 14px 28px | -- |
| Input | 14px 16px | 12px bottom |
| Tab bar | 8px 0 | -- |

## Border Radius

| Element | Radius |
|---|---|
| Card | 18px |
| Button | 14px |
| Input | 12px |
| Tag / Badge | 20px (pill) |
| Avatar | 50% (circle) |
| Modal / Sheet | 24px (top corners) |

## ダークファースト・ライティング

よるのことばは time-of-day モードの大半が夜色背景で表示される。暗背景では黒い drop-shadow が不可視になり立体感が失われるため、立体表現の主役は「上端の inset ハイライト線」とする。光源は常に画面上方に固定し、カード上辺へ内側から 1px の明るい線（dark: rgba(255,255,255,0.07)、light: rgba(255,255,255,0.6)）を入れる。外側影は輪郭づけ程度に弱く保ち、主役カードのみ rose 系のごく淡いグローで浮きを補強する。影の良し悪しは「重さ」ではなく「光源との整合」で判断する。--shadow-card-primary / --shadow-card-secondary を必ず使い、コンポーネントで影値を直書きしない。

## 装飾とアイコン方針

装飾は「深夜ラジオ × 姉貴分 × 占い師」のトーンに従い、足し算ではなく引き算で設計する。Cormorant はヒーロー英字（--fs-hero-en）と占い結果中の引用句のみに限定し、見出し・本文・caption には使わない。アイコンは線幅 1.5px 前後の細線スタイルで統一し、塗りつぶしアイコンは active 状態のタブのみに許容する。絵文字を UI 部品として常用しない。装飾要素（パーティクル・グロー・グラデーション）は主役カードと CTA に集約し、サブカードや一覧には載せない。1画面の装飾の主役は1つに絞り、視線が占い結果へ向かう導線を最優先する。

## Components

### Button
- Primary: `background: var(--grad)`, white text, `border-radius: 14px`, `padding: 14px 28px`
- Secondary: `background: transparent`, `border: 1.5px solid var(--rose)`, rose text
- Disabled: `opacity: 0.5`, `pointer-events: none`
- Hover: `transform: translateY(-1px)`, shadow increase
- Active: `transform: translateY(0)`
- Transition: `all 0.2s ease`

### Card
- Background: `var(--card)`, `backdrop-filter: blur(20px)`
- Border: `1px solid var(--border)`
- Border radius: 18px
- Shadow: `var(--shadow)`
- Padding: 20px

### Input / Textarea
- Background: `rgba(255,255,255,0.5)` (light) / `rgba(255,255,255,0.05)` (dark)
- Border: `1.5px solid var(--border)`
- Border radius: 12px
- Focus: `outline: 2px solid var(--rose)`, `outline-offset: 2px`
- Padding: 14px 16px

### Bottom Tab Bar
- Height: 56px + safe area
- Background: `var(--card)`, `backdrop-filter: blur(20px)`
- Active icon: `var(--rose)`
- Inactive icon: `var(--t3)`
- Max 5 items

## Animation

### Timing
| Animation | Duration | Easing |
|---|---|---|
| Fade in | 500ms | ease |
| Slide up | 450ms | ease |
| Stagger delay | 50ms per item | -- |
| Hover transform | 200ms | ease |
| Theme toggle | 300ms | ease |
| **Ritual sequence** | 3000ms | cubic-bezier(0.4, 0, 0.2, 1) |

### Particles
- Canvas overlay, pointer-events: none
- Rose/Lavender/Gold colored circles
- Slow upward drift with fade

## Time of Day Mode

`document.documentElement.dataset.timeOfDay` 属性で切り替わる5段階の時間帯モード。
`TimeOfDayProvider` が1分ごとに自動判定し、CSS変数を上書きする。

| Mode | 時間帯 | `--bg1` | Particle Color | Count | Speed |
|---|---|---|---|---|---|
| `night-deep` | 02:00-05:00 | `#150E14` | `var(--gold)` | 8 | 0.6 |
| `dawn` | 05:00-11:00 | `#2A1E28` | `var(--accent)` | 5 | 0.8 |
| `day` | 11:00-17:00 | `#FBF4F2` | `var(--accent-rose)` | 6 | 1.0 |
| `dusk` | 17:00-22:00 | `#241823` | `var(--lavender)` | 7 | 0.9 |
| `night` | 22:00-02:00 | `#1C1620` | `var(--accent-rose)` | 6 | 1.0 |

### 設計原則
- ライト/ダークテーマ(`data-theme`)とは独立して動作する
- `day` モードのみ明るい背景（ライトテーマと同値）
- `day` 以外は夜系の深い背景色を使用
- パーティクル色・数・速度は各モードの雰囲気に合わせて調整

## Do

- Use CSS custom properties for all colors (never hardcode hex in components)
- Always-dark + time-of-day 5-stage selectors only (no `[data-theme]` toggle)
- Use `backdrop-filter: blur()` for glass morphism cards
- Use Zen Maru Gothic for all text (warm, rounded feel)
- Use Cormorant for decorative elements only
- Keep animations subtle (translateY: hover max 2px, chara float max 6px, opacity transitions)
- Use gradients for primary CTAs only
- PWA: full-screen capable, standalone display mode

## Don't

- Don't use sharp corners (minimum radius: 8px)
- Don't use pure black (#000) or pure white (#fff) as text color
- Don't use more than 2 fonts
- Don't animate layout properties (width, height, top, left). Use transform and opacity only
- Don't use colored glow (box-shadow with non-black rgba above alpha 0.15). Use black shadow rgba(0,0,0,...) for depth; black shadow up to alpha 0.5 is acceptable
- Don't place text directly on gradients without sufficient contrast
- Don't use system fonts. Always load Zen Maru Gothic
- Don't use em dash or en dash in English output

## Responsive

### Breakpoints
| Name | Width | Layout |
|---|---|---|
| Mobile (default) | 0 - 600px | Single column, full width cards |
| Tablet | 601 - 900px | Wider cards, optional 2-column |
| Desktop | 901px+ | Max width 480px centered (app-like) |

### Mobile First
- All styles default to mobile
- Desktop adds `max-width: 480px` and centers content
- Tab bar always visible on mobile
- Touch targets: minimum 44px

## PWA

- Display: standalone
- Theme color: `#FBF4F2` (light) / `#1C1620` (dark)
- Background color: `#FBF4F2`
- Icons: 192x192, 512x512
- Orientation: portrait
