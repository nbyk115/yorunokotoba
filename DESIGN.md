# DESIGN.md — よるのことば

## Colors

### Light Theme
| Token | Value | Usage |
|---|---|---|
| `--bg1` | `#FFF5F0` | Background primary |
| `--rose` | `#E8627C` | Primary accent, CTA |
| `--pink` | `#D4506A` | Primary darker variant |
| `--blush` | `#F2A0B0` | Secondary accent |
| `--lavender` | `#B08ACF` | Tertiary accent |
| `--gold` | `#D4A853` | Premium, highlight |
| `--card` | `rgba(255,255,255,0.65)` | Card background |
| `--card-solid` | `#fff` | Card background solid |
| `--border` | `rgba(180,140,140,0.12)` | Border |
| `--t1` | `#3A2830` | Text primary |
| `--t2` | `rgba(58,40,48,0.72)` | Text secondary |
| `--t3` | `rgba(58,40,48,0.56)` | Text tertiary |
| `--t4` | `rgba(58,40,48,0.40)` | Text quaternary |
| `--grad` | `linear-gradient(135deg, #E8627C, #D4506A)` | Primary gradient |
| `--grad2` | `linear-gradient(135deg, #E8627C, #B08ACF)` | Secondary gradient |
| `--shadow` | `0 2px 16px rgba(180,100,120,0.08)` | Default shadow |

### Dark Theme (`[data-theme="dark"]`)
| Token | Value | Usage |
|---|---|---|
| `--bg1` | `#0D0B0E` | Background primary |
| `--rose` | `#F0809A` | Primary accent |
| `--pink` | `#E8627C` | Primary darker |
| `--blush` | `#D4809A` | Secondary accent |
| `--lavender` | `#C4A0E0` | Tertiary accent |
| `--gold` | `#E8C068` | Premium, highlight |
| `--card` | `rgba(28,22,30,0.85)` | Card background |
| `--card-solid` | `rgb(28,22,30)` | Card background solid |
| `--t1` | `#F0E8EC` | Text primary |
| `--t2` | `rgba(240,232,236,0.75)` | Text secondary |
| `--t3` | `rgba(240,232,236,0.68)` | Text tertiary |
| `--shadow` | `0 2px 16px rgba(0,0,0,0.25)` | Default shadow |

### Semantic
| Color | Usage |
|---|---|
| `--rose` | CTA, active states, primary actions |
| `--lavender` | Premium features, secondary accent |
| `--gold` | Premium badge, special highlights |
| `--blush` | Soft accent, tags, subtle highlights |

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
| `night-deep` | 02:00-05:00 | `#0A0810` | `var(--gold)` | 8 | 0.6 |
| `dawn` | 05:00-11:00 | `#1A0E18` | `var(--blush)` | 5 | 0.8 |
| `day` | 11:00-17:00 | `#FFF5F0` | `var(--rose)` | 6 | 1.0 |
| `dusk` | 17:00-22:00 | `#1A0A12` | `var(--lavender)` | 7 | 0.9 |
| `night` | 22:00-02:00 | `#0D0B0E` | `var(--rose)` | 6 | 1.0 |

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
- Don't use box-shadow heavier than `0 4px 24px rgba(..., 0.15)`
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
- Theme color: `#FFF5F0` (light) / `#0D0B0E` (dark)
- Background color: `#FFF5F0`
- Icons: 192x192, 512x512
- Orientation: portrait
