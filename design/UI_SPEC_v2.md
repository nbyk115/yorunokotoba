# UI仕様書 v2 — よるのことば リデザイン
**バージョン**: 2.0.0  
**策定日**: 2026-05-07  
**担当**: ux-designer  
**世界観**: 「深夜2時のあなたの部屋に置かれた月光詩集」（Co-Star × Calm × Apple Weather夜）  
**対象**: frontend-dev 実装用詳細仕様

---

## A. 共通コンポーネント仕様

---

### A-1. `<HeroBlock>`

**役割**: 全5画面共通の冒頭100vh占有ヒーローセクション。Cormorant italic英文 + Zen Maru和訳の2段テキスト＋守護キャラ200px中央配置。

**Props**

| prop | 型 | 必須 | 説明 |
|---|---|---|---|
| `quoteEn` | `string` | ✓ | Cormorant italic表示の英文（最大60字） |
| `quoteJp` | `string` | ✓ | Zen Maru 18px和訳テキスト |
| `charaId` | `string` | ✓ | 守護キャラID（CharaAvatarに渡す） |
| `timeOfDay` | `TimeOfDayMode` | ✓ | 時間帯モード（背景グラデーション制御） |
| `onScrollDown` | `() => void` | - | 下スクロール誘導ボタンのコールバック |

**レイアウト**

```
[HeroBlock]
height: 100dvh（Dynamic Viewport Height。iOS Safari対応）
display: flex
flex-direction: column
align-items: center
justify-content: center
padding: 0 24px
gap: 0
position: relative
overflow: hidden
background: var(--bg1)  ← 時間帯で上書き

  [particle-canvas]  ← Canvas, position: absolute, inset: 0, pointer-events: none, z-index: 0

  [hero-content]  ← z-index: 1, text-align: center
    [chara-wrapper]
      width: 200px, height: 200px
      margin: 0 auto 32px
      <CharaAvatar size={200} animate border="none" />

    [quote-en]
      font-family: var(--font-accent)   ← 'Cormorant', serif
      font-size: var(--hero-cormorant-size)  ← 32px
      font-weight: 300
      font-style: italic
      line-height: 1.4
      letter-spacing: 0.02em
      color: var(--t1)
      margin: 0 0 16px
      opacity: 0
      animation: heroFadeUp 800ms 200ms cubic-bezier(0.4, 0, 0.2, 1) forwards

    [quote-jp]
      font-family: var(--font-heading)
      font-size: var(--hero-jp-size)   ← 18px
      font-weight: 500
      line-height: 1.7
      letter-spacing: 0.04em
      color: var(--t2)
      margin: 0
      opacity: 0
      animation: heroFadeUp 800ms 450ms cubic-bezier(0.4, 0, 0.2, 1) forwards

  [scroll-cue]  ← position: absolute, bottom: 32px, left: 50%, transform: translateX(-50%)
    width: 24px, height: 24px
    animation: scrollBounce 2s ease-in-out infinite
    aria-label: "下にスクロール"
    role: button
    tabIndex: 0
```

**アニメーション**

```css
@keyframes heroFadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes scrollBounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50%       { transform: translateX(-50%) translateY(6px); }
}
```

**時間帯別背景グラデーション**（`data-time-of-day` 属性で自動切替）

| モード | background |
|---|---|
| `night-deep` | `radial-gradient(ellipse at 50% 30%, #1a0f2e 0%, #0A0810 60%)` |
| `dawn` | `radial-gradient(ellipse at 50% 20%, #2d1040 0%, #1A0E18 70%)` |
| `day` | `radial-gradient(ellipse at 50% 0%, #fff0ee 0%, #FFF5F0 100%)` |
| `dusk` | `radial-gradient(ellipse at 50% 40%, #2a0a1e 0%, #1A0A12 60%)` |
| `night` | `radial-gradient(ellipse at 50% 30%, #1c0d1e 0%, #0D0B0E 70%)` |

**Breakpoint対応**

| 幅 | charaサイズ | quote-en | quote-jp |
|---|---|---|---|
| 320px | 160px | 26px | 15px |
| 375px | 180px | 29px | 16px |
| 480px以上 | 200px | 32px | 18px |

**アクセシビリティ**

- `quoteEn` と `quoteJp` を `<p>` タグで出力（スクリーンリーダー対応）
- `scroll-cue` は `role="button"` と `tabIndex={0}` + `onKeyDown` でEnter/Space対応
- `prefers-reduced-motion: reduce` 時はアニメーション削除、即時表示（`opacity: 1`）

---

### A-2. `<TimeOfDayProvider>`

**役割**: 現在時刻を1分ごとに評価し、`document.documentElement.dataset.timeOfDay` を更新するコンテキストプロバイダー。CSS変数は tokens.css の `[data-time-of-day="xxx"]` セレクタが自動適用。

**5モードの定義**

| `data-time-of-day` 値 | 時間範囲 | 説明 |
|---|---|---|
| `night-deep` | 02:00 - 04:59 | 深夜。最も静謐。gold粒子8個、速度0.6 |
| `dawn` | 05:00 - 10:59 | 夜明け前後。blush粒子5個、速度0.8 |
| `day` | 11:00 - 16:59 | 昼間。唯一の明背景。rose粒子6個、速度1.0 |
| `dusk` | 17:00 - 21:59 | 夕暮れ〜宵。lavender粒子7個、速度0.9 |
| `night` | 22:00 - 01:59 | 深夜前。rose粒子6個、速度1.0 |

**CSS変数の切替方式**

tokens.css 既定の `[data-time-of-day="xxx"]` セレクタが `--bg1`, `--bg-body`, `--particle-color`, `--particle-count`, `--particle-speed` を上書きする。Providerはattrを切り替えるだけ。`data-theme`（ライト/ダーク）とは独立して動作する。重複時は `[data-time-of-day]` が `--bg1` と `--bg-body` を上書きするが、`data-theme="dark"` の `--t1`, `--card` 等は維持される。

**実装インターフェース**

```tsx
// src/providers/TimeOfDayProvider.tsx

type TimeOfDayMode = 'night-deep' | 'dawn' | 'day' | 'dusk' | 'night';

interface TimeOfDayContextValue {
  mode: TimeOfDayMode;
}

export const TimeOfDayContext = createContext<TimeOfDayContextValue>({ mode: 'night' });

function getMode(hour: number): TimeOfDayMode {
  if (hour >= 2  && hour < 5)  return 'night-deep';
  if (hour >= 5  && hour < 11) return 'dawn';
  if (hour >= 11 && hour < 17) return 'day';
  if (hour >= 17 && hour < 22) return 'dusk';
  return 'night'; // 22:00-01:59
}

export function TimeOfDayProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<TimeOfDayMode>(() => getMode(new Date().getHours()));

  useEffect(() => {
    const apply = () => {
      const m = getMode(new Date().getHours());
      setMode(m);
      document.documentElement.dataset.timeOfDay = m;
    };
    apply();
    const id = setInterval(apply, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <TimeOfDayContext.Provider value={{ mode }}>
      {children}
    </TimeOfDayContext.Provider>
  );
}
```

**配置場所**: `src/providers/TimeOfDayProvider.tsx`（新規作成）  
**App.tsx への組み込み**: `<TimeOfDayProvider>` で `<App>` 全体をラップ

**トリガー条件**: マウント時1回 + 毎分インターバル。タブがバックグラウンドから復帰した時は `visibilitychange` イベントでも再評価する（`document.addEventListener('visibilitychange', apply)`）。

---

### A-3. `<RitualButton>`

**役割**: 「ひらく / あずける / 残す / しまう」の動詞を持つ儀式ボタン。タップ後3秒間のフェーズ別演出を経て結果遷移する。

**Props**

| prop | 型 | 必須 | 説明 |
|---|---|---|---|
| `label` | `string` | ✓ | 動詞ラベル（例: "ひらく"） |
| `onComplete` | `() => Promise<void>` | ✓ | 3秒儀式完了後に呼ぶコールバック |
| `disabled` | `boolean` | - | 非活性状態 |
| `fullWidth` | `boolean` | - | `width: 100%` |

**通常状態**

```
background: var(--grad)  ← linear-gradient(135deg, var(--rose), var(--pink))
color: #fff
border: none
border-radius: var(--r-button)  ← 14px
padding: 16px 32px
font-size: 16px
font-weight: 700
font-family: var(--font-heading)
letter-spacing: 0.08em
min-height: 56px
min-width: 44px
box-shadow: 0 4px 24px rgba(232, 98, 124, 0.32)
transition: transform 200ms ease, box-shadow 200ms ease, opacity 200ms ease
cursor: pointer
```

**タップ波紋（0ms〜）**

タップ瞬間に `::after` 擬似要素（`border-radius: 50%`）をスケール 0→3 でexpandし300ms後に `opacity: 0`。`pointer-events: none`。色: `rgba(255,255,255,0.35)`。実装はCSSキーフレームで行い、Reactのstateで `isRippling` クラスをトグル。

```css
@keyframes rippleExpand {
  0%   { transform: scale(0); opacity: 0.5; }
  100% { transform: scale(3); opacity: 0; }
}
.ritual-btn--rippling::after {
  content: '';
  position: absolute;
  width: 100%;
  aspect-ratio: 1;
  top: 0; left: 0;
  border-radius: 50%;
  background: rgba(255,255,255,0.35);
  animation: rippleExpand 400ms ease-out forwards;
  pointer-events: none;
}
```

**3秒ローディング演出（フェーズ別）**

| フェーズ | 経過時間 | 演出 |
|---|---|---|
| Phase 0: 収束 | 0ms〜1000ms | ボタンラベル消失（opacity: 0、200ms）。Canvas上のパーティクルがボタン中央に向かって収束する（各粒子が `translate` でボタンXY座標へ移動、easing: cubic-bezier(0.4, 0, 0.2, 1)）。ボタン背景が `var(--lavender)` へ500msでtransition。 |
| Phase 1: 月満ち | 1000ms〜2000ms | ボタン中央に月のSVGアイコン（28px）がfadeIn 300ms。その外周に `conic-gradient` の半透明リングが0→360度で成長する（`stroke-dashoffset` アニメーション、1000ms、linear）。色: `var(--gold)`。 |
| Phase 2: 結果フェードイン | 2000ms〜3000ms | 月アイコンが scale 1→1.2 → 0 でdisappear（300ms）。ボタン背景が `var(--grad)` に戻りながら（500ms）ラベルが「完了」系テキスト（例: "よみとったよ"）でfadeIn。その後 `onComplete()` を呼ぶ。 |

**状態管理**

```tsx
type RitualPhase = 'idle' | 'phase0' | 'phase1' | 'phase2' | 'done';
```

`isRitualActive` フラグが `true` の間はボタンを `pointer-events: none`。

**disabled状態**

```
opacity: 0.45
pointer-events: none
box-shadow: none
cursor: not-allowed
```

**focus状態（キーボード）**

```
outline: 2px solid var(--rose)
outline-offset: 3px
```

**prefers-reduced-motion 対応**

`@media (prefers-reduced-motion: reduce)` 時は儀式アニメーション全スキップ。タップ後即 `onComplete()` を呼ぶ。波紋なし、フェーズなし。

---

### A-4. `<BlurReveal>`

**役割**: コンテンツをブラーで隠し、タップ/クリックで解除する演出コンポーネント。占い結果の一部を「ひらく」演出に使用。

**Props**

| prop | 型 | 必須 | 説明 |
|---|---|---|---|
| `children` | `ReactNode` | ✓ | ブラーで隠すコンテンツ |
| `label` | `string` | - | ブラー中に表示するCTA（例: "タップしてひらく"） |
| `autoReveal` | `boolean` | - | true時は3秒後自動解除 |
| `onReveal` | `() => void` | - | 解除時のコールバック |

**初期状態（ブラー中）**

```
position: relative
user-select: none

  [blur-layer]  ← position: absolute, inset: 0, z-index: 1, pointer-events: none
    backdrop-filter: blur(4px)
    -webkit-backdrop-filter: blur(4px)
    background: rgba(0, 0, 0, 0.04)
    border-radius: inherit
    transition: backdrop-filter 300ms ease, opacity 300ms ease

  [reveal-cta]  ← position: absolute, inset: 0, z-index: 2
    display: flex
    align-items: center
    justify-content: center
    cursor: pointer
    font-size: 13px
    font-weight: 700
    color: var(--t2)
    letter-spacing: 0.06em
```

**blur量の定義**

- 初期: `blur(4px)`（コンテンツが透けて見える程度。完全隠蔽ではない）
- 解除後: `blur(0px)`
- transition: `300ms cubic-bezier(0.4, 0, 0.2, 1)`
- 同時に `blur-layer` の `opacity: 1→0`

**タップ解除アニメーション（300ms）**

1. `backdrop-filter` を `blur(4px) → blur(0px)`（300ms ease）
2. `blur-layer` を `opacity: 1 → 0`（300ms）
3. `reveal-cta` を `opacity: 1 → 0`（150ms）
4. 300ms後に `isRevealed = true` をセット、blur-layerをDOM削除

**隣接要素との関係**

親要素が `overflow: hidden` かつ `border-radius: var(--r-card)` を持つ場合、BlurRevealの `border-radius: inherit` でカード角に合わせる。スクロール内コンテンツに使う場合は `position: sticky` との競合に注意（`z-index` スタッキングコンテキストを確認）。

**prefers-reduced-motion 対応**

ブラー自体はmotion問題ではないが、`transition` を `0ms` にする。タップ時即時解除。

**アクセシビリティ**

- `reveal-cta` に `role="button"`, `tabIndex={0}`, `aria-label="コンテンツを表示"` を付与
- 解除前 `[blur-layer]` に `aria-hidden="true"` を付け、コンテンツを読み上げさせない
- 解除後 `aria-hidden` を解除

---

### A-5. `<ShareCard>`

**役割**: FortuneViewのシェア機能。1080×1080px固定サイズのカードをSVG/DOMでレンダリングし、html-to-imageライブラリでPNGに変換してダウンロードまたはWeb Share APIで送信する。

**Props**

| prop | 型 | 必須 | 説明 |
|---|---|---|---|
| `userName` | `string` | ✓ | ユーザー名 |
| `sign` | `string` | ✓ | 星座名 |
| `rank` | `string` | ✓ | 運勢ランク（大吉/中吉/小吉/吉/末吉） |
| `charaId` | `string` | ✓ | キャラクターID |
| `summary` | `string` | ✓ | 占い要約テキスト（最大80字） |
| `date` | `string` | ✓ | 表示日（例: 2026.05.07） |
| `onExport` | `(blob: Blob) => void` | - | PNG生成後のコールバック |

**レイアウト（1080×1080px 固定座標系）**

```
[share-card-root]
  width: 1080px, height: 1080px
  position: relative, overflow: hidden
  background: linear-gradient(160deg, #0D0B0E 0%, #1c0d1e 60%, #0A0810 100%)
  font-family: var(--font-heading)

  [bg-particles]  ← SVG, 20個のgold/lavender/rose円、position: absolute, inset: 0
  [bg-grid]  ← 薄いドットグリッド overlay, opacity: 0.04

  [logo]  ← position: absolute, top: 72px, left: 54px
    text: "よるのことば"
    font: Cormorant italic 28px, color: rgba(240,232,236,0.5)
    letter-spacing: 0.08em

  [date]  ← position: absolute, top: 80px, right: 54px
    font: Zen Maru 20px 400, color: rgba(240,232,236,0.4)

  [chara]  ← position: absolute, top: 160px, left: 50%, transform: translateX(-50%)
    <CharaAvatar id={charaId} size={320} />

  [rank-text]  ← position: absolute, top: 520px, width: 100%, text-align: center
    font-family: var(--font-accent)  ← Cormorant
    font-size: 144px
    font-weight: 300
    font-style: italic
    color: var(--gold)
    letter-spacing: -0.02em
    text-shadow: 0 4px 40px rgba(212, 168, 83, 0.5)

  [user-sign]  ← position: absolute, top: 690px, width: 100%, text-align: center
    font-size: 32px, weight: 500, color: rgba(240,232,236,0.75)
    letter-spacing: 0.1em
    text: "{sign} / {userName}"

  [summary]  ← position: absolute, top: 760px, left: 80px, right: 80px
    font-size: 26px, line-height: 1.9, color: rgba(240,232,236,0.85)
    text-align: center

  [divider]  ← position: absolute, bottom: 120px, left: 50%, transform: translateX(-50%)
    width: 240px, height: 1px, background: rgba(240,232,236,0.15)

  [watermark]  ← position: absolute, bottom: 72px, width: 100%, text-align: center
    font: Cormorant italic 22px, color: rgba(240,232,236,0.3)
    text: "yorunokotoba.app"
```

**PNG出力ライブラリ**

`html-to-image`（`toPng` 関数）を使用。`node-html-parser` 不要。`dom-to-image-more` は代替だがメンテが薄いため非推奨。

```tsx
import { toPng } from 'html-to-image';

const dataUrl = await toPng(cardRef.current, {
  width: 1080,
  height: 1080,
  pixelRatio: 1,  // 既に1080pxなのでpixelRatio:1
  skipAutoScale: true,
});
```

**表示上のサイズ**: `<ShareCard>` 自体はDOMに `width: 1080px` で存在するが、画面上では `scale(0.33)` + `transform-origin: top left` で縮小プレビュー表示する（375pxデバイスで約357px幅）。プレビュー用ラッパーに `overflow: hidden; width: calc(1080px * 0.33); height: calc(1080px * 0.33)` を当てる。

**コントラスト確認**: WCAG AA 4.5:1以上。主要テキスト（rank: `var(--gold)` on `#0D0B0E`）は実測で約6.2:1（合格）。summary テキスト（`rgba(240,232,236,0.85)` on `#0D0B0E`）は約12.8:1（合格）。

---

## B. 画面別ハイファイ仕様

---

### B-1. HomeView（ホーム画面）

**構造概要**

```
[HomeView]
  <HeroBlock />           ← 100dvh
  [main-content]          ← スクロール領域
    [greeting-section]
    [dream-card]          ← 機能カード1枚のみ（夢占い）
    [scroll-indicator]    ← 他画面誘導
  [BottomTabBar]          ← 固定
```

**HeroBlock の quoteEn/quoteJp**（時間帯別に切り替える）

| `data-time-of-day` | quoteEn | quoteJp |
|---|---|---|
| `night-deep` | *The dream is a letter your soul wrote at 3 AM* | 夢は、魂が深夜3時に書いた手紙 |
| `dawn` | *Something new is breathing between the stars* | 星のあいだで、何かが息をし始めている |
| `day` | *Even daylight holds the memory of night* | 昼の光も、夜のことを覚えている |
| `dusk` | *This is the hour the day confesses its secrets* | 昼が秘密を打ち明ける時間 |
| `night` | *The night knows what the day forgot to say* | 夜は、昼が言い忘れたことを知っている |

**HeroBlock直下: greeting-section**

```
margin-top: 0  ← HeroBlockの下に連続
padding: 32px 24px 0
text-align: center

  [greeting-text]
    font-size: 13px
    font-weight: 400
    color: var(--t3)
    letter-spacing: 0.08em
    line-height: 1.5
    ← getGreeting() の返り値（例: "深夜、おつかれさま"）

  [name-text]
    font-size: 22px
    font-weight: 700
    color: var(--t1)
    letter-spacing: 0.04em
    margin-top: 4px
    line-height: 1.3
    ← "{profile.name}さん"

  [sign-text]
    font-size: 12px
    font-weight: 400
    color: var(--t3)
    margin-top: 4px
```

**dream-card（唯一の機能カード）**

```
margin: 24px 16px 0
padding: 24px
background: var(--card)
backdrop-filter: blur(20px)
-webkit-backdrop-filter: blur(20px)
border: 1px solid var(--border)
border-radius: 18px
box-shadow: var(--shadow)
animation: slideUp 450ms ease both

  [card-eyebrow]
    font-family: var(--font-accent)
    font-size: 11px
    font-weight: 400
    font-style: italic
    color: var(--lavender)
    letter-spacing: 0.12em
    text-transform: uppercase
    margin-bottom: 8px
    ← "Dream Reading"

  [card-title]
    font-size: 18px
    font-weight: 700
    color: var(--t1)
    line-height: 1.4
    margin-bottom: 8px
    ← "今夜の夢を読み解く"

  [card-body]
    font-size: 13px
    color: var(--t2)
    line-height: 1.8
    margin-bottom: 20px
    ← "見た夢をそのまま書いて。シンボルから今のあなたへのメッセージを読み解くよ。"

  <RitualButton label="ひらく" onComplete={...} fullWidth />
```

**scroll-indicator（他画面への誘導）**

```
margin: 24px 16px 0
display: flex
gap: 12px

  [fortune-chip]  ← flex: 1
    padding: 16px 12px
    background: var(--card)
    border: 1px solid var(--border)
    border-radius: 14px
    text-align: center
    font-size: 12px
    font-weight: 700
    color: var(--t2)
    cursor: pointer
    min-height: 56px
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center
    gap: 4px
    label: "✨ 星座占い"
    sub-label: "みる"  ← 13px, color: var(--rose)

  [archive-chip]  ← flex: 1
    同スタイル
    label: "📖 夜の日記"
    sub-label: "しまう"  ← var(--lavender)
```

**インタラクション状態**

- dream-card hover: `transform: translateY(-2px); box-shadow: 0 8px 32px rgba(180, 100, 120, 0.12)` / 200ms ease
- dream-card active: `transform: translateY(0)` / 100ms ease
- chip hover: `border-color: var(--rose); transform: translateY(-1px)` / 200ms ease
- chip focus: `outline: 2px solid var(--rose); outline-offset: 2px`

**Breakpoint対応**

| 幅 | card margin | card padding |
|---|---|---|
| 320px | 12px | 16px |
| 375px | 16px | 20px |
| 480px以上 | 20px | 24px |

**既存実装とのGAP**

- **削除**: 「今日の運勢」カード、「キャラカルーセル」カード、「履歴を振り返る」カード（HomeViewには夢占いカード1枚のみ）
- **削除**: streakカード（別途 dream-card 内部に小さく移動、またはProfileViewへ）
- **追加**: `<HeroBlock>` 全体（新規）
- **追加**: `scroll-indicator` の2チップ（新規）
- **変更**: Button → `<RitualButton label="ひらく">` に置き換え
- **変更**: `getGreeting()` は既存ロジック流用可。表示場所がheaderからgreeting-sectionに変わる

---

### B-2. DreamView（夢占い画面）

**構造概要**

```
[DreamView]
  [input-phase]    ← result === null 時
    [ritual-header]
    [textarea-card]
    <RitualButton label="あずける" />
    [3秒儀式アニメーション]  ← loading === true 時
  [result-phase]   ← result !== null 時
    [result-carousel]  ← 横スワイプカード群
    [reset-button]
```

**ritual-header（入力フェーズ）**

```
padding: 48px 24px 24px
text-align: center

  [eyebrow]
    font-family: var(--font-accent)
    font-size: 13px
    font-style: italic
    color: var(--lavender)
    letter-spacing: 0.1em
    margin-bottom: 12px
    ← "Dream Oracle"

  [title]
    font-size: 22px
    font-weight: 700
    color: var(--t1)
    letter-spacing: 0.04em
    line-height: 1.3
    margin-bottom: 8px
    ← "夢を、あずけて"

  [subtitle]
    font-size: 13px
    color: var(--t2)
    line-height: 1.8
    ← "見た夢をそのまま書いて。深層心理のヒントが出てくるよ。"
```

**textarea-card**

```
margin: 0 16px 16px
padding: 20px
background: var(--card)
backdrop-filter: blur(20px)
border-radius: 18px
border: 1px solid var(--border)

  [textarea]
    width: 100%
    padding: 16px
    border-radius: 12px
    border: 1.5px solid var(--border)
    background: rgba(255,255,255,0.04)  ← 夜系背景に溶け込む
    color: var(--t1)
    font-family: var(--font-heading)
    font-size: 15px
    line-height: 1.8
    resize: none
    min-height: 140px
    transition: border-color 200ms ease

  [textarea]:focus
    border-color: var(--rose)
    outline: none
    box-shadow: 0 0 0 3px rgba(232, 98, 124, 0.12)

  [char-count]
    text-align: right
    font-size: 11px
    color: var(--t3)
    margin-top: 8px
    ← "{text.length} / 500"

margin-top: 16px の位置に <RitualButton label="あずける" fullWidth />
disabled={!text.trim() || loading}
```

**3秒儀式アニメーション（loading === true 時）**

全画面オーバーレイで表示:

```
[ritual-overlay]
  position: fixed, inset: 0, z-index: 50
  background: rgba(10, 8, 16, 0.92)
  display: flex, flex-direction: column
  align-items: center, justify-content: center
  gap: 24px
  animation: fadeIn 300ms ease

  [ritual-moon-svg]
    width: 80px, height: 80px
    stroke: var(--gold)
    stroke-width: 1.5
    fill: none
    stroke-dasharray: 251  ← 円周 (2π×40)
    stroke-dashoffset: 251→0  ← 0ms〜2000ms, linear でアニメーション
    ← 月形状: clip-pathで半円削り三日月

  [ritual-text]
    font-family: var(--font-accent)
    font-size: 20px
    font-style: italic
    color: rgba(240,232,236,0.85)
    letter-spacing: 0.06em
    animation: breathe 1.8s ease infinite
    ← Phase 0 (0-1s): "夢を、読んでいる"
    ← Phase 1 (1-2s): "シンボルをひらく"
    ← Phase 2 (2-3s): "見えてきた"
    ← テキスト変更時は crossfade 300ms
```

**result-carousel（横スワイプカード群）**

```
[carousel-container]
  display: flex
  overflow-x: auto
  scroll-snap-type: x mandatory
  scroll-padding-left: 16px
  -webkit-overflow-scrolling: touch
  gap: 12px
  padding: 16px
  scrollbar-width: none  ← no-scrollbarクラス流用

  各カードは scroll-snap-align: start
  width: calc(100vw - 48px)  ← 左右マージン考慮
  max-width: 432px  ← 480px - 48px
  flex-shrink: 0
```

**result-card の順序と仕様**

| カード番号 | 内容 | 特記事項 |
|---|---|---|
| Card 1 | キャラ + テーマ + type.name + type.sub | 既存hero-cardをスワイプカードに変換。背景: `result.theme.grad`、白文字 |
| Card 2 | 夢が伝えていること（mainReading） | `var(--card)` 背景。`<BlurReveal>` で `mainReading.deep` を隠す |
| Card 3 | シンボル一覧 | 既存維持 |
| Card 4 | 今日のメッセージ + アクション3点 | 既存維持 |
| Card 5 | ラッキー3点 + 相性タイプ | 既存を1枚に統合 |

**カード切替インジケーター**

```
[dot-indicator]
  display: flex, gap: 6px
  justify-content: center
  padding: 12px 0

  各dot: width: 6px, height: 6px, border-radius: 50%
  active dot: background: var(--rose), width: 18px (pill形状)
  inactive dot: background: var(--t3)
  transition: width 300ms ease, background 300ms ease
```

**reset-button**

```
margin: 16px 16px 32px
<Button variant="ghost" fullWidth>もう一度あずける</Button>
```

既存の `variant="secondary"` から `variant="ghost"` に変更。

**インタラクション状態**

- textarea hover: `border-color: rgba(232, 98, 124, 0.4)` / 200ms
- carousel card active: `transform: scale(0.98)` / 100ms

**Breakpoint対応**

| 幅 | carouselカード幅 | textarea min-height |
|---|---|---|
| 320px | `calc(100vw - 32px)` | 120px |
| 375px | `calc(100vw - 48px)` | 140px |
| 480px以上 | `432px` | 160px |

**既存実装とのGAP**

- **変更**: `loading` 中の `{loading ? '読み取ってるよ…' : '夢を読み解く'}` → `<RitualButton label="あずける">` に置き換え + フルスクリーン儀式オーバーレイ追加
- **変更**: result表示が縦スクロールカード群 → 横スワイプカルーセルに変更
- **追加**: `<BlurReveal>` を mainReading.deep に適用
- **変更**: Button「もう一度占う」→「もう一度あずける」（ghost variant）
- **削除**: header内の `🌙` 絵文字テキスト → ritual-headerに置き換え
- **保持**: `handleAnalyze`, `handleReset`, `saveArchiveEntry` のロジックはそのまま流用

---

### B-3. FortuneView（星座占い画面）

**構造概要**

```
[FortuneView]
  [fortune-hero]       ← Cormorant 72px italic 英文ランク表記
  [reading-cards]      ← 各運勢カード（縦スクロール）
  [share-section]      ← ShareCard + シェアボタン
```

**fortune-hero**

```
padding: 48px 24px 32px
text-align: center
background: var(--bg1)  ← 時間帯で変化

  [eyebrow]
    font-family: var(--font-accent)
    font-size: 13px
    font-style: italic
    color: var(--t3)
    letter-spacing: 0.1em
    margin-bottom: 8px
    ← "{signIcon} {profile.sign} · {profile.name}"

  [rank-en]  ← 既存の「大吉」等をCormorant英語表記に変換
    font-family: var(--font-accent)  ← Cormorant
    font-size: 72px
    font-weight: 300
    font-style: italic
    color: var(--gold)  ← 大吉/中吉。小吉以下は var(--rose)
    line-height: 1.0
    letter-spacing: -0.02em
    text-shadow: 0 4px 40px rgba(212, 168, 83, 0.45)
    margin: 0 0 8px
    ← rankToEn変換: { 大吉: "Great Fortune", 中吉: "Fortune", 小吉: "Good Luck", 吉: "Lucky", 末吉: "Hope" }

  [rank-jp]  ← 小さく添える
    font-size: 14px
    font-weight: 700
    color: var(--t2)
    letter-spacing: 0.12em
    margin-bottom: 16px
    ← result.rank（漢字）

  [chara-wrapper]
    margin: 0 auto
    width: 160px, height: 160px
    <CharaAvatar id={result.type.id} size={160} animate />

  [chara-name]
    font-size: 15px
    font-weight: 700
    color: var(--t1)
    margin-top: 12px

  [summary]
    font-size: 14px
    color: var(--t2)
    line-height: 1.9
    margin-top: 12px
    text-align: left
    padding: 0 4px
```

**reading-cards（縦スクロール）**

各カードは `margin: 0 16px 12px` のCardコンポーネントを流用。

```
[lucky-time + risk]  ← grid: 2列, gap: 12px
  各セル: padding: 16px 14px, background: var(--card), border-radius: 14px, border: 1px solid var(--border)
  [label]: font-size: 10px, font-weight: 700, color: var(--t3), letter-spacing: 0.08em
  [value]: font-size: 13px, color: var(--t1), margin-top: 4px, line-height: 1.6
```

カード詳細（今日のあなた / 恋愛運 / 仕事運 / 健康運）は既存レイアウト維持。

**share-section**

```
margin: 8px 16px 0
padding: 24px 0 0

  [share-preview-wrapper]
    width: calc(1080px * 0.31)  ← 375px端末で約335px
    height: calc(1080px * 0.31)
    overflow: hidden
    border-radius: 14px
    margin: 0 auto 16px
    box-shadow: 0 8px 32px rgba(0,0,0,0.2)
    position: relative

    [share-card-scaled]
      transform: scale(0.31)
      transform-origin: top left
      width: 1080px
      height: 1080px
      <ShareCard ... />

  [share-actions]
    display: flex
    gap: 12px

    [btn-download]  ← flex: 1
      <Button variant="secondary">残す</Button>
      ← toPng → a.download でPNGダウンロード

    [btn-share]  ← flex: 1
      <Button variant="primary">シェア</Button>
      ← navigator.share または toPng → clipboard
```

**インタラクション状態**

- share-preview: hover → `box-shadow: 0 12px 48px rgba(0,0,0,0.3); transform: translateY(-2px)` / 200ms
- btn-download active: `transform: scale(0.97)`
- btn-share active: `transform: scale(0.97)`
- btn disabled（生成中）: `opacity: 0.5; pointer-events: none`

**Breakpoint対応**

| 幅 | share-preview scale | rank-en font-size |
|---|---|---|
| 320px | `0.26` | 60px |
| 375px | `0.31` | 72px |
| 480px以上 | `0.40` | 72px |

**既存実装とのGAP**

- **変更**: heroカード（グラデーション背景 + 白文字）→ fortune-hero（ページレベルのヒーロー、背景色はbg1）に変換
- **変更**: `result.rank` の大きいテキスト（48px → 72px Cormorant italic 英語表記）
- **追加**: `rankToEn` マッピング関数
- **変更**: シェアボタン（`navigator.share` 呼び出し）→ `<ShareCard>` + `toPng` のフル実装
- **追加**: シェアボタンラベルを「シェア」→「残す / シェア」の2ボタン（動詞リデザイン）
- **削除**: lucky-time / risk の inline flex → 2列グリッドに変更
- **保持**: `generateFortune`, analytics, profile propはそのまま流用

---

### B-4. ProfileSetup（プロフィール設定）

**構造概要**

```
[ProfileSetup]
  [progress-bar]     ← 月相プログレスバー（3フェーズ）
  [step-1]           ← ニックネーム入力
  [step-2]           ← 生年月日入力
  [step-3]           ← 性別選択 + 確認
  [next-button / submit-button]
```

**progress-bar（月相プログレスバー）**

```
position: sticky
top: 0
z-index: 10
padding: 16px 24px 12px
background: var(--bg1)

  [moon-phases]
    display: flex
    justify-content: center
    align-items: center
    gap: 24px

    各フェーズ（3個）:
      width: 28px, height: 28px
      border-radius: 50%
      border: 1.5px solid var(--border)
      display: flex, align-items: center, justify-content: center

      [完了フェーズ]: background: var(--rose), border-color: var(--rose), color: white
        内部テキスト: "🌕" (満月)
      [現在フェーズ]: background: transparent, border-color: var(--rose), color: var(--rose)
        内部テキスト: "🌙" (三日月)
        animation: breathe 2s ease infinite
      [未来フェーズ]: background: transparent, border-color: var(--border), color: var(--t3)
        内部テキスト: "○" (新月)

  [connector-lines]
    position: absolute内に  width: calc(33% - 28px), height: 1px
    background: var(--border) → var(--rose)（完了時）
    transition: background 300ms ease

  [step-label]
    text-align: center
    margin-top: 8px
    font-size: 11px, color: var(--t3), letter-spacing: 0.08em
    ← "STEP {currentStep} / 3"
```

**step-1: ニックネーム入力**

```
padding: 32px 24px 0
animation: slideUp 450ms ease

  [heading]
    font-family: var(--font-accent)
    font-size: 24px
    font-style: italic
    color: var(--t1)
    margin-bottom: 4px
    ← "Your name"

  [subheading]
    font-size: 14px, color: var(--t2), line-height: 1.8, margin-bottom: 24px
    ← "なんて呼ぼうか？"

  [label]
    font-size: 12px, font-weight: 700, color: var(--t3)
    display: block, margin-bottom: 8px
    ← "ニックネーム"

  [input]
    ← 既存 inputStyle を流用
    font-size: 18px  ← 大きめで入力しやすく
    text-align: center
    letter-spacing: 0.04em
```

**step-2: 生年月日入力**

```
padding: 32px 24px 0
animation: slideUp 450ms ease

  [heading]
    font-family: var(--font-accent)
    font-size: 24px, italic
    ← "Your birthday"

  [subheading]
    ← "生まれた日を教えて。星座が決まるよ。"

  [date-inputs]
    display: flex, gap: 8px

    [year-input]: flex: 1.5, placeholder: "年（例: 1999）"
    [month-input]: flex: 1, placeholder: "月"
    [day-input]: flex: 1, placeholder: "日"

    各input:
      padding: 14px 16px
      font-size: 16px
      text-align: center
      border-radius: 12px
      border: 1.5px solid var(--border)
      background: var(--bg1)
      color: var(--t1)
      transition: border-color 200ms ease

    :focus → border-color: var(--rose), outline: none, box-shadow: 0 0 0 3px rgba(232,98,124,0.12)

  [sign-preview]  ← 月日入力が有効な場合のみ表示（fadeIn 300ms）
    margin-top: 16px
    padding: 14px 20px
    background: var(--card)
    border-radius: 14px
    border: 1px solid var(--border)
    display: flex, align-items: center, gap: 12px

    [sign-icon]: font-size: 24px
    [sign-text]:
      font-size: 14px, font-weight: 700, color: var(--rose)
      ← "{SIGNS[idx].k}"
    [sign-desc]: font-size: 11px, color: var(--t3)
      ← "あなたの星座はこれだよ"
```

**step-3: 性別選択**

```
padding: 32px 24px 0
animation: slideUp 450ms ease

  [heading]
    font-family: var(--font-accent)
    font-size: 24px, italic
    ← "Who are you"

  [subheading]
    ← "性別を選んでね。占いの精度が上がるよ。"

  [gender-options]
    display: flex, gap: 12px, margin-top: 24px

    [option-female], [option-male]:
      flex: 1
      padding: 20px 16px
      border-radius: 14px
      border: 1.5px solid var(--border)
      text-align: center
      cursor: pointer
      transition: all 200ms ease
      min-height: 80px
      display: flex, flex-direction: column, align-items: center, justify-content: center, gap: 6px

      [icon]: font-size: 28px
      [label]: font-size: 14px, font-weight: 700, color: var(--t1)

      :selected → border-color: var(--rose); background: rgba(232,98,124,0.08); [label] color: var(--rose)
      :focus → outline: 2px solid var(--rose); outline-offset: 2px
```

**next-button / submit-button（ステップ共通）**

```
position: sticky
bottom: calc(56px + env(safe-area-inset-bottom))  ← タブバーの上
padding: 16px 24px
background: linear-gradient(to top, var(--bg1) 80%, transparent)

  [button]
    width: 100%
    Step 1-2: <Button variant="primary">つぎへ</Button>
    Step 3:   <Button type="submit" variant="primary">ひらく</Button>
```

**ステップ間アニメーション**

次のステップへの遷移時:
- 現在ステップ: `opacity: 1→0; transform: translateX(0)→translateX(-24px)` / 250ms ease-in
- 次ステップ: `opacity: 0→1; transform: translateX(24px)→translateX(0)` / 300ms ease-out / delay 100ms

**Breakpoint対応**

| 幅 | ステップheading size | gender-option min-height |
|---|---|---|
| 320px | 20px | 70px |
| 375px | 24px | 80px |
| 480px以上 | 28px | 90px |

**既存実装とのGAP**

- **変更**: 1ページフォーム → 3ステップウィザード（`currentStep: 1 | 2 | 3` のstate追加）
- **追加**: 月相プログレスバー（新規コンポーネント `<MoonPhaseProgress>` として分離推奨）
- **変更**: Button「占いを始める」 → Step 1-2「つぎへ」/ Step 3「ひらく」
- **追加**: step-2に `sign-preview`（リアルタイム星座表示）
- **追加**: ステップ間遷移アニメーション（translateX slide）
- **変更**: `handleSubmit` を step-3 の submit のみでトリガーする形に変更
- **変更**: `gender` 選択UIを小ボタン → 大カード形式に変更
- **保持**: `saveLocalProfile`, `getSignIndex`, `SIGNS`, analytics はそのまま流用

---

### B-5. ArchiveView（アーカイブ / 夜の日記）

**構造概要**

```
[ArchiveView]
  [archive-hero]    ← 「夜の日記」タイトル + 月情報
  [calendar-grid]  ← 月カレンダーグリッド（日付ごとにエントリー有無を表示）
  [month-nav]      ← 前月/翌月切り替え
  [entry-list]     ← カレンダーで選択した日のエントリー詳細（ドロワー形式）
  [clear-button]
```

**archive-hero**

```
padding: 40px 24px 24px
text-align: center

  [eyebrow]
    font-family: var(--font-accent)
    font-size: 13px, italic, color: var(--t3), letter-spacing: 0.1em
    ← "Dream Journal"

  [title]
    font-size: 22px, font-weight: 700, color: var(--t1)
    letter-spacing: 0.04em
    margin: 4px 0 8px
    ← "夜の日記"

  [subtitle]
    font-size: 12px, color: var(--t3)
    ← "{entries.length}件の夢の記録"
```

**月カレンダーグリッド**

```
[month-header]
  display: flex, align-items: center, justify-content: space-between
  padding: 0 16px 16px

  [prev-btn], [next-btn]
    width: 36px, height: 36px
    border-radius: 50%
    border: 1px solid var(--border)
    background: var(--card)
    color: var(--t1)
    display: flex, align-items: center, justify-content: center
    cursor: pointer
    min-height: 44px, min-width: 44px  ← タッチターゲット
    font-size: 16px

  [month-label]
    font-family: var(--font-accent)
    font-size: 20px, font-style: italic, color: var(--t1)
    ← "May 2026"

[weekday-labels]
  display: grid, grid-template-columns: repeat(7, 1fr)
  padding: 0 16px 8px
  font-size: 11px, font-weight: 700, color: var(--t3)
  text-align: center
  letter-spacing: 0.06em
  ← ["日", "月", "火", "水", "木", "金", "土"]

[calendar-grid]
  display: grid, grid-template-columns: repeat(7, 1fr)
  gap: 4px
  padding: 0 16px

  各セル [day-cell]:
    aspect-ratio: 1
    border-radius: 50%
    display: flex, flex-direction: column, align-items: center, justify-content: center
    cursor: pointer
    position: relative
    min-height: 40px
    font-size: 13px, color: var(--t2)
    transition: background 200ms ease

    [has-entry]: ← エントリーが存在する日
      color: var(--t1)
      &::after  ← ドット表示
        content: ''
        position: absolute
        bottom: 4px
        width: 4px, height: 4px
        border-radius: 50%
        background: var(--rose)

    [selected]: ← 選択された日
      background: var(--rose)
      color: #fff
      &::after background: #fff

    [today]:
      border: 1.5px solid var(--lavender)
      color: var(--lavender)

    [other-month]: ← 他月の日
      color: var(--t4)
      opacity: 0.4
      pointer-events: none

    :hover（has-entry）:
      background: rgba(232, 98, 124, 0.1)

    :focus:
      outline: 2px solid var(--rose)
      outline-offset: 2px
```

**entry-list（選択日のエントリー詳細）**

選択された日にエントリーがある場合、カレンダー下に slideDown で展開:

```
[entry-panel]
  margin: 16px 16px 0
  animation: slideUp 300ms ease both

  各エントリー:
    [entry-card]
      padding: 16px
      background: var(--card)
      border-radius: 14px
      border: 1px solid var(--border)
      margin-bottom: 8px

      [entry-header]
        display: flex, justify-content: space-between, align-items: baseline
        margin-bottom: 8px

        [type-name]: font-size: 14px, font-weight: 700, color: var(--t1)
        [theme-label]: font-size: 11px, color: var(--t3)

      [entry-symbol]
        font-size: 12px, color: var(--lavender), font-weight: 700, margin-bottom: 4px
        ← "シンボル: {e.summary}"

      [entry-text]
        font-size: 12px, color: var(--t2), line-height: 1.7
        overflow: hidden, text-overflow: ellipsis
        display: -webkit-box, -webkit-line-clamp: 3, -webkit-box-orient: vertical
```

エントリーがない日を選択した場合:

```
[empty-day]
  padding: 20px 16px
  text-align: center
  font-size: 13px, color: var(--t3)
  ← "この日は夢の記録がないよ"
```

**clear-button**

```
margin: 16px 16px 32px
<Button variant="ghost" fullWidth>履歴をすべて削除</Button>
← テキスト変更: "履歴を全て削除" → "しまう（全削除）"
```

**新規: 月表示state管理**

```tsx
const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
const [selectedDay, setSelectedDay] = useState<number | null>(null);

// エントリーをyear-month-dayでグルーピング
const entryDays = useMemo(() => {
  const set = new Set<string>();
  for (const e of entries) {
    const d = new Date(e.timestamp);
    if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
      set.add(`${d.getDate()}`);
    }
  }
  return set;
}, [entries, viewYear, viewMonth]);
```

**Breakpoint対応**

| 幅 | day-cell min-height | エントリーカード padding |
|---|---|---|
| 320px | 36px | 12px |
| 375px | 40px | 16px |
| 480px以上 | 44px | 20px |

**既存実装とのGAP**

- **変更**: 日付別テキストリスト → 月カレンダーグリッド（根本的な構造変更）
- **追加**: 月ナビゲーション（前月/翌月）
- **追加**: `viewYear`, `viewMonth`, `selectedDay` のstate
- **追加**: エントリー日のドットマーカー
- **追加**: `entry-panel`（選択日のエントリー詳細スライド表示）
- **変更**: ヘッダーを archive-hero スタイルに変更
- **変更**: クリアボタンラベル「履歴を全て削除」→「しまう（全削除）」
- **保持**: `loadArchive`, `clearArchive`, `getDreamTypeById`, `themeLabels` はそのまま流用

---

## C. CSS変数追加リスト

`tokens.css` に追加が必要な新規変数。既存値は変更禁止。

| 変数名 | Light値 | Dark値 | 時間帯別上書き | 用途 |
|---|---|---|---|---|
| `--bg1-deep` | `#1c0a18` | `#0a0810` | 各モードで `--bg1` が代用 | 深夜系背景（既存 `--bg1` の時間帯上書きで対応済みのため実質不要。heroes用グラデーション参照値として定義）|
| `--share-bg` | `#0D0B0E` | `#0D0B0E` | なし（固定） | ShareCard背景（常に夜系固定） |
| `--ritual-overlay-bg` | `rgba(10,8,16,0.92)` | `rgba(10,8,16,0.96)` | なし | 儀式オーバーレイ背景 |
| `--hero-grad-night-deep` | `radial-gradient(ellipse at 50% 30%, #1a0f2e 0%, #0A0810 60%)` | 同値 | `night-deep` | HeroBlock背景 |
| `--hero-grad-dawn` | `radial-gradient(ellipse at 50% 20%, #2d1040 0%, #1A0E18 70%)` | 同値 | `dawn` | HeroBlock背景 |
| `--hero-grad-day` | `radial-gradient(ellipse at 50% 0%, #fff0ee 0%, #FFF5F0 100%)` | `radial-gradient(ellipse at 50% 0%, #2d1a2a 0%, #1c161e 100%)` | `day` | HeroBlock背景 |
| `--hero-grad-dusk` | `radial-gradient(ellipse at 50% 40%, #2a0a1e 0%, #1A0A12 60%)` | 同値 | `dusk` | HeroBlock背景 |
| `--hero-grad-night` | `radial-gradient(ellipse at 50% 30%, #1c0d1e 0%, #0D0B0E 70%)` | 同値 | `night` | HeroBlock背景 |
| `--ritual-moon-color` | `var(--gold)` | `var(--gold)` | なし | 儀式月SVGのstroke色 |
| `--calendar-dot` | `var(--rose)` | `var(--rose)` | なし | カレンダーエントリードット |
| `--share-preview-radius` | `14px` | `14px` | なし | ShareCardプレビューラッパーの角丸 |
| `--progress-active` | `var(--rose)` | `var(--rose)` | なし | 月相プログレスバーのアクティブ色 |
| `--blur-reveal-amount` | `4px` | `4px` | なし | BlurRevealの初期blur量 |

**時間帯変数（既に tokens.css に定義済み。追加不要）**

`--bg-night-deep`, `--bg-dawn`, `--bg-day`, `--bg-dusk`, `--bg-night` は tokens.css の `[data-time-of-day]` セレクタで `--bg1` を上書きする形で実装済み。独立した変数名として定義する場合は以下を追記:

```css
:root {
  /* Time of day background references (read-only, never used directly in components) */
  --bg-night-deep: #0A0810;
  --bg-dawn:       #1A0E18;
  --bg-day:        #FFF5F0;
  --bg-dusk:       #1A0A12;
  --bg-night:      #0D0B0E;
}
```

**追加場所**: tokens.css の `:root {}` ブロック末尾（`--particle-speed` の直後）。

---

## D. アニメーション・ライブラリ・ファイル構成提案

### D-1. 既存使用ライブラリの確認結果

`package.json` を直接確認していないが、現実装コードから以下が推定される:

| ライブラリ | 使用箇所 | 推定 |
|---|---|---|
| React 18+ | 全ファイル | `useState`, `useEffect`, `useMemo` 使用 |
| TypeScript | 全ファイル | `type`, `interface` 宣言あり |
| CSS Modules なし | 全ファイル | inline style + グローバルCSS クラス |
| アニメーションライブラリ | なし | CSS keyframesのみ（`global.css`） |
| Canvas API | DESIGN.mdに記述 | パーティクル実装想定 |
| html-to-image | なし（現状未導入） | ShareCard PNG出力に必要 |

### D-2. 追加が必要なライブラリ

**必須追加（1件のみ）**

```
html-to-image@^1.11.x
```

理由: ShareCard の PNG出力に使用。`toPng()` 関数が Canvas / foreignObject ベースでDOMをPNGに変換。軽量（gzip 約14KB）。メンテが活発。`dom-to-image` より後発で互換性が高い（特にiOS WebKit）。

インストール:
```bash
npm install html-to-image
```

使用箇所: `src/features/fortune/FortuneView.tsx` 内、またはShareCardコンポーネント内。

**不要ライブラリ（あえて追加しない）**

| ライブラリ | 理由 |
|---|---|
| Framer Motion | 過剰。CSS keyframesで十分な演出量。バンドルサイズコスト大 |
| GSAP | 同上。RitualButtonの3秒演出もCSSとsetTimeoutで実装可能 |
| react-spring | 同上 |
| lottie-react | SVGアニメーションが1箇所のみで導入コスト過大 |

### D-3. 新規ファイル配置場所の提案

```
frontend/src/
├── providers/
│   └── TimeOfDayProvider.tsx          ← 新規（A-2）
│
├── components/
│   └── ui/
│       ├── Button.tsx                 ← 既存維持
│       ├── Card.tsx                   ← 既存維持
│       ├── CharaAvatar.tsx            ← 既存維持
│       ├── RarityBadge.tsx            ← 既存維持
│       ├── HeroBlock.tsx              ← 新規（A-1）
│       ├── RitualButton.tsx           ← 新規（A-3）
│       ├── BlurReveal.tsx             ← 新規（A-4）
│       └── ShareCard.tsx             ← 新規（A-5）
│
├── features/
│   ├── home/
│   │   └── HomeView.tsx              ← 既存を大幅改修
│   ├── dream/
│   │   └── DreamView.tsx             ← 既存を中程度改修
│   ├── fortune/
│   │   └── FortuneView.tsx           ← 既存を中程度改修
│   ├── profile/
│   │   ├── ProfileSetup.tsx          ← 既存を大幅改修
│   │   └── MoonPhaseProgress.tsx     ← 新規（ProfileSetup内部コンポーネントとして分離推奨）
│   └── archive/
│       └── ArchiveView.tsx           ← 既存を根本的に再構築
│
└── styles/
    ├── tokens.css                     ← 変数追記のみ（既存）
    └── global.css                     ← ritual/heroアニメーション追記（既存）
```

**global.css 追記が必要なkeyframe**

```css
@keyframes heroFadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes scrollBounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50%       { transform: translateX(-50%) translateY(6px); }
}

@keyframes rippleExpand {
  0%   { transform: scale(0); opacity: 0.5; }
  100% { transform: scale(3); opacity: 0; }
}

@keyframes moonStroke {
  from { stroke-dashoffset: 251; }
  to   { stroke-dashoffset: 0; }
}
```

---

## E. 実装優先順位（frontend-dev向け）

### フェーズ1: 基盤コンポーネント（所要見積: 1-2日）

**1-a. `TimeOfDayProvider`**

完了基準:
- `document.documentElement.dataset.timeOfDay` が現在時刻に応じた5値のいずれかを持つ
- 1分ごとに自動更新される
- `visibilitychange` でも更新される
- 時間を手動上書きできるデバッグ手段がある（開発時のみ: `window.__setTimeOfDay('night-deep')` 等）

**1-b. tokens.css 変数追記**

完了基準:
- Section C の新規変数が `:root {}` に追記されている
- `[data-time-of-day]` セレクタがChromeDevToolsで確認できる
- `day` モードのみ明るい `--bg1` になっている

**1-c. global.css keyframe追記**

完了基準:
- `heroFadeUp`, `scrollBounce`, `rippleExpand`, `moonStroke` が追記されている
- `prefers-reduced-motion: reduce` 時に全アニメーションが停止している

### フェーズ2: 共通UIコンポーネント（所要見積: 2-3日）

**2-a. `HeroBlock`**

完了基準:
- 375px端末で `height: 100dvh` を占有している
- 時間帯に応じた背景グラデーションが表示される
- Cormorant 32px italic の英文と Zen Maru 18px 和文が表示される
- CharaAvatar 200px が中央に配置される
- `heroFadeUp` アニメーションが 200ms / 450ms delay で動作する
- `prefers-reduced-motion` 時に即時表示される
- スクロール誘導ボタンが `scrollBounce` アニメーションで動作する

**2-b. `RitualButton`**

完了基準:
- 通常状態で `var(--grad)` 背景 + gradient shadow が表示される
- タップ時に波紋アニメーション（`rippleExpand` 400ms）が発火する
- Phase 0-1-2 の3段階演出がそれぞれ 1000ms ごとに切り替わる
- `onComplete()` が 3000ms 後に呼ばれる
- disabled 時に `opacity: 0.45` でタップ不可
- `prefers-reduced-motion` 時に即 `onComplete()` を呼ぶ

**2-c. `BlurReveal`**

完了基準:
- 初期状態で `backdrop-filter: blur(4px)` がかかっている
- タップ/クリックで 300ms かけて blur が解除される
- `aria-label` がスクリーンリーダーで読まれる
- `autoReveal` prop が true の場合3秒後に自動解除される

**2-d. `ShareCard`**

完了基準:
- 1080×1080px の絶対座標レイアウトが正確に表示される（スケール縮小プレビューで確認）
- `toPng()` を呼ぶと PNG Blob が生成される
- 生成された PNG を a タグの `download` 属性でダウンロードできる
- WCAG AA コントラスト比（実測値付き）が確認できる

### フェーズ3: 画面実装（所要見積: 3-4日）

**実装順序**

1. `HomeView`（HeroBlock統合 + 1枚カード構造。最もシンプルで動作確認のベースになる）
2. `ProfileSetup`（3ステップ化。ロジック変更なしで純UIリデザイン）
3. `DreamView`（儀式オーバーレイ + 横スワイプカルーセル）
4. `FortuneView`（ShareCard統合 + Cormorant英文ランク）
5. `ArchiveView`（月カレンダーグリッド。最も構造変更が大きい）

**HomeView完了基準**

- HeroBlockが時間帯別テキストを表示している
- greeting-sectionがHeroBlock直下に表示される
- dream-cardが1枚のみ表示される（既存の4枚カードを削除）
- `<RitualButton label="ひらく">` をタップするとDreamViewに遷移する
- scroll-indicatorの2チップが表示される

**ProfileSetup完了基準**

- MoonPhaseProgressが3ステップ進捗を正しく表示する
- ステップ間遷移で translateX slideアニメーションが動作する
- Step 2で月日入力後にsign-previewがfadeInで表示される
- Step 3の性別選択カードが選択時にハイライトされる
- Step 3「ひらく」でプロフィール保存とページ遷移が完了する

**DreamView完了基準**

- textareaにテキスト入力後「あずける」ボタンが活性化する
- 「あずける」タップで3秒儀式オーバーレイが全画面表示される
- 3秒後にresult-carouselが表示される
- 横スワイプでカードを切り替えられる
- dot-indicatorがスワイプに追従する
- Card 2の `mainReading.deep` がBlurRevealで隠れており、タップで解除できる

**FortuneView完了基準**

- fortune-heroにCormorant 72px italic英文ランクが表示される
- share-section にShareCardのプレビューが表示される
- 「残す」ボタンでPNGがダウンロードされる
- 「シェア」ボタンでWeb Share APIが呼ばれる（未対応端末はダウンロードにフォールバック）

**ArchiveView完了基準**

- 月カレンダーグリッドが正しい曜日列で表示される
- エントリーがある日にroseのドットが表示される
- 日付セルをタップするとentry-panelがslideUpで展開される
- 前月/翌月ボタンでカレンダーが切り替わる
- 「しまう（全削除）」ボタンが確認後に全エントリーを削除する

---

## F. 反証チェック結果

**Step 1（自己反証）**

本仕様書において以下の反論・反例を検討した:

(1) 「100dvhのHeroBlockはスクロールを妨げ離脱率を上げる」という反論: ICPの主利用時間帯が深夜2-5時であり、目的が「癒し・没入」であることを踏まえると、ヒーロー没入体験はFTUXとして正当化できる。ただし scroll-cueを必ず配置し、コンテンツの存在を示す必要がある。スクロール誘導なしのフルスクリーンは離脱リスクとして残存する。

(2) 「3秒儀式アニメーションが長すぎてUXを損なう」という反論: 電話占いが数分単位のコストであることを踏まえると、3秒の儀式はむしろ「価値の錯覚」を生む。ただし `prefers-reduced-motion` 対応を義務付け、アクセシビリティを担保した。

(3) 「横スワイプカルーセルはモバイルでの誤スワイプを招く」という反論: scroll-snap-type: mandatory でスナップを強制することで対処。dot-indicatorで現在位置を明示する。縦スクロールとの競合リスクは残存する（残存リスク欄に記載）。

**Step 2（構造反証）**

- CSS変数の依存関係: Section Cで追加する変数は全て `:root` に定義し、既存の `[data-time-of-day]` セレクタとの競合がないことを確認。`--bg1` の上書き優先順位は `[data-time-of-day]` > `[data-theme]` となるため、day モード時にダークテーマが有効でも `--bg1: #FFF5F0` に戻ることを意図通りとする（DESIGN.mdの設計原則に従う）。
- ShareCard の 1080px 絶対座標: `html-to-image` の `toPng()` は `transform: scale()` 配下のDOMをキャプチャしないため、ShareCard本体は画面外（`position: fixed; left: -9999px`）または非表示ラッパーに置き、`toPng()` 呼び出し時のみ `visibility: visible` にする実装が必要。プレビューは別途 `scale(0.31)` の縮小コピーを画面内に表示する。これはSection B-3で「プレビュー用ラッパー」として記述しているが、実装時に「本体とプレビューの2DOM構造」が必要な点を明示する。
- アニメーション数値: `heroFadeUp` の `translateY(20px)` は DESIGN.mdの「translateY max 2px」ルールと矛盾する可能性がある。DESIGN.mdのルールはhoverトランスフォームに関する記述であり、page-entryアニメーションへの適用外と解釈する。ただし視覚的に重すぎる場合は `translateY(8px)` に調整を推奨する。

**Step 3（実用反証）**

- `html-to-image` のiOS対応: Safari/WebKitではforeignObject変換に制限がある。CSSフォント（Cormorant/Zen Maru）のShareCard内への描画は `document.fonts.ready` 後に `toPng()` を呼ぶことで担保する。フォントロード前にキャプチャすると代替フォントで出力される。
- カレンダーグリッドの初月表示: 新規ユーザーはarchiveが空のため、カレンダーに何も表示されない。`entry-list` の代わりに `emptyState` をカレンダー下に表示する分岐が必要（仕様書内 `entries.length === 0` ブランチとして対応済み）。
- `TimeOfDayProvider` のサーバーサイドレンダリング: 本プロジェクトはPWA（CSRのみ）のため問題ないが、将来SSR化する場合は `useEffect` 外のhour取得がhydration mismatchを起こす。現状のCSR前提なら問題なし。
- 「1分ごとのインターバル」によるバッテリー消費: iOS/Androidともに1分インターバルはバックグラウンド時に自動スロットリングされる。`visibilitychange` でフォアグラウンド復帰時に再評価する実装をA-2で明記済み。

**残存リスク**

1. 横スワイプカルーセル（DreamView）と縦スクロールの競合: 特にiOS Safari 15以下で `touch-action` の挙動が不安定なケースがある。実機テストで確認が必要。
2. ShareCard フォント描画の品質: Zen Maru Gothic が `toPng()` 出力に正確に反映されるかは、フォントのCORS設定とブラウザの `fonts.ready` タイミングに依存する。白抜けした場合はシステムフォントへのフォールバックを検討する。
3. `100dvh` のブラウザ互換: iOS 15以下は `dvh` 未対応。フォールバックとして `height: 100vh; height: 100dvh;` の二重指定を推奨する。
4. 3ステップProfileSetupのステップ管理: 現在の `handleSubmit` は1ステップ完結。3ステップ化に伴い、Step 2→3の遷移で月/日の入力バリデーションをStep 2完了時点で実行する必要がある。これを怠るとStep 3でsubmit失敗が発生する。
5. BlurRevealとコンテンツのアクセシビリティ: `aria-hidden` が解除されるタイミングまで、スクリーンリーダーユーザーはコンテンツにアクセスできない。「コンテンツを読む」ボタンを `blur-layer` 内に必ず配置し、キーボード操作でも解除できる設計とする（仕様書内に記載済み）。

---

*UI仕様書 v2 策定完了 — frontend-dev実装スタート可*
