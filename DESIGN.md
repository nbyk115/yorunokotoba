# DESIGN.md : よるのことば

## Colors

PR2 リデザイン: 旧多色アクセント配色 → インクブルー1色相 + シャンパンゴールド1点アクセント。

### Light Theme (day mode)
| Token | Value | Usage |
|---|---|---|
| `--bg1` | `#F3EFEA` | Background primary (温白) |
| `--rose` | `#E27A8E` | CTA and active states only (彩度を抑えたローズ) |
| `--pink` | `#CF6A7C` | Rose hover variant |
| `--blush` | `#7B7A9E` | Blue-purple muted (PR4-6 で変数名整理) |
| `--lavender` | `#8A87B8` | Blue-purple particle accent (PR4-6 で変数名整理) |
| `--gold` | `#C9A961` | Unique premium accent (シャンパンゴールド) |
| `--accent` | `#C9A961` | Primary accent - gold. All modes. |
| `--accent-rose` | `#E27A8E` | CTA and active state accent |
| `--card` | `var(--card-secondary)` | Card background (migration alias for card-secondary) |
| `--card-primary` | `rgba(255,255,255,0.96)` | Primary card background (main content card, 1 per screen) |
| `--card-secondary` | `rgba(255,255,255,0.62)` | Secondary card background (sub cards, list items) |
| `--border-primary` | `rgba(42,37,48,0.10)` | Primary card border |
| `--border-secondary` | `rgba(42,37,48,0.05)` | Secondary card border |
| `--card-solid` | `#fff` | Card background solid |
| `--border` | `rgba(42,37,48,0.08)` | Border |
| `--t1` | `#2A2530` | Text primary |
| `--t2` | `rgba(42,37,48,0.72)` | Text secondary |
| `--t3` | `rgba(42,37,48,0.56)` | Text tertiary |
| `--t4` | `rgba(42,37,48,0.40)` | Text quaternary |
| `--grad` | `linear-gradient(135deg, #E27A8E, #CF6A7C)` | Primary gradient (PR3 で var 化) |
| `--grad2` | `linear-gradient(135deg, #E27A8E, #8A87B8)` | Secondary gradient (PR3 で var 化) |
| `--shadow` | `var(--shadow-card-secondary)` | Default shadow (migration alias) |
| `--shadow-card-primary` | `inset 0 1px 0 rgba(255,255,255,0.55), 0 6px 22px rgba(0,0,0,0.14)` | Primary card shadow |
| `--shadow-card-secondary` | `inset 0 1px 0 rgba(255,255,255,0.45), 0 2px 10px rgba(0,0,0,0.08)` | Secondary card shadow |

### Dark Theme (`[data-theme="dark"]`) / Night Modes
| Token | Value | Usage |
|---|---|---|
| `--bg1` | `#14121F` | Background primary (インクブルー夜色) |
| `--rose` | `#E27A8E` | CTA and active states only |
| `--card` | `var(--card-secondary)` | Card background (migration alias for card-secondary) |
| `--card-primary` | `rgba(31,27,46,0.92)` | Primary card background |
| `--card-secondary` | `rgba(20,18,31,0.60)` | Secondary card background |
| `--border-primary` | `rgba(244,241,246,0.12)` | Primary card border |
| `--border-secondary` | `rgba(244,241,246,0.06)` | Secondary card border |
| `--card-solid` | `#1F1B2E` | Card background solid |
| `--t1` | `#F4F1F6` | Text primary |
| `--t2` | `rgba(244,241,246,0.62)` | Text secondary |
| `--t3` | `rgba(244,241,246,0.38)` | Text tertiary |
| `--shadow` | `var(--shadow-card-secondary)` | Default shadow (migration alias) |
| `--shadow-card-primary` | `inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 28px rgba(0,0,0,0.40)` | Primary card shadow |
| `--shadow-card-secondary` | `inset 0 1px 0 rgba(255,255,255,0.04), 0 2px 10px rgba(0,0,0,0.28)` | Secondary card shadow |

### Time of Day Background Colors (PR2 確定値)
| Mode | Hours | `--bg1` | Character |
|---|---|---|---|
| `night-deep` | 02:00-05:00 | `#0B0A14` | 最暗。星空の深淵 |
| `dawn` | 05:00-11:00 | `#1A1826` | 夜明け前の群青 |
| `day` | 11:00-17:00 | `#F3EFEA` | 温白。昼の光 |
| `dusk` | 17:00-22:00 | `#161422` | 宵闇。深まる夜 |
| `night` | 22:00-02:00 | `#14121F` | 夜の帷 |

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
| **Hero (Cormorant italic)** | 32px | 300 | 1.4 |
| **Hero JP (Zen Maru)** | 18px | 500 | 1.7 |

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
| `night-deep` | 02:00-05:00 | `#0B0A14` | `var(--gold)` | 8 | 0.6 |
| `dawn` | 05:00-11:00 | `#1A1826` | `var(--accent)` | 5 | 0.8 |
| `day` | 11:00-17:00 | `#F3EFEA` | `var(--accent-rose)` | 6 | 1.0 |
| `dusk` | 17:00-22:00 | `#161422` | `var(--lavender)` | 7 | 0.9 |
| `night` | 22:00-02:00 | `#14121F` | `var(--accent-rose)` | 6 | 1.0 |

### 設計原則
- ライト/ダークテーマ(`data-theme`)とは独立して動作する
- `day` モードのみ明るい背景（ライトテーマと同値）
- `day` 以外は夜系の深い背景色を使用
- パーティクル色・数・速度は各モードの雰囲気に合わせて調整

## Do

- Use CSS custom properties for all colors (never hardcode hex in components)
- Support both light and dark themes via `[data-theme]` attribute
- Use `backdrop-filter: blur()` for glass morphism cards
- Use Zen Maru Gothic for all text (warm, rounded feel)
- Use Cormorant for decorative elements only
- Keep animations subtle (translateY max 2px, opacity transitions)
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
- Theme color: `#F3EFEA` (light) / `#14121F` (dark)
- Background color: `#FFF5F0`
- Icons: 192x192, 512x512
- Orientation: portrait
