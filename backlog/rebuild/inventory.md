# よるのことば Rebuild — Phase 0: 現状棚卸し

**作成日**: 2026-04-12
**根拠**: PR #20-#37 のバグ再発ループ・スクロール不能・月絵シェイク等の構造的不具合
**判断**: モノリシック `index.html` (649KB, 629行) を Vite + React 18 + TypeScript で再構築

---

## 1. 現在の技術スタック

| 項目 | 現状 | 問題点 |
|---|---|---|
| ビルドツール | なし（CDN直接） | バンドル最適化不可・TDZエラー多発 |
| フレームワーク | React 18.3.1（UMD/CDN） | インライン `React.createElement`（JSX未使用） |
| 言語 | 素のJS（型なし） | TDZ・未定義参照がランタイムまで見えない |
| スタイル | CSS variables 直書き | DESIGN.md準拠済み・維持価値あり |
| バックエンド | Firebase 10.12（compat） | 古いバージョン・compat layer |
| デプロイ | Vercel | 問題なし・維持 |
| PWA | `firebase-messaging-sw.js` 手書き | Workbox未使用 |

## 2. 保全必須の外部設定

### Firebase Config（絶対不変）
```js
apiKey: "AIzaSyAMSAW3ez0Hir2Guv4ibbuxUgzRTuS14PI"
authDomain: "yorunokotoba-5df51.firebaseapp.com"
projectId: "yorunokotoba-5df51"
storageBucket: "yorunokotoba-5df51.firebasestorage.app"
messagingSenderId: "133287391957"
appId: "1:133287391957:web:aafda69540c7359ba1a85c"
```

### Push通知 VAPID Key（絶対不変）
```
BMaXF44Ya4nZg-zfpfHKp6wr2gPRBlf3nkoCJ9z3CQxWmOGyOZFxLoSHYNCYrtHi0R0_mxW7u-mjTq5HpEaqDcw
```

### localStorage キー（全互換維持必須）
| キー | 用途 |
|---|---|
| `ynk_profile` | ユーザープロファイル（名前/星座/生年月日/性別/都道府県） |
| `ynk_ftue_done` | FTUE完了フラグ |
| `ynk_night_mode` | 夜モード (on/off) |
| `ynk_dream_archive` | 夢診断履歴 |
| `ynk_streak` | 連続利用日数 |
| `ynk_banner_dismissed` | バナー非表示フラグ |
| `ynk_push_token` | FCMトークン |
| `ynk_email_for_signin` | Email Link認証用（一時保存） |

## 3. 既存React コンポーネント

| コンポーネント | 責務 | 移植先 |
|---|---|---|
| `App` | ルートコンテナ・状態管理・ビュー切替 | `src/App.tsx` |
| `BottomTabBar` | 画面下タブナビ | `src/components/navigation/BottomTabBar.tsx` |
| `FtueOverlay` | 初回チュートリアル | `src/components/onboarding/FtueOverlay.tsx` |
| `Card` | 共通カード | `src/components/ui/Card.tsx` |
| `Tag` | 共通タグ | `src/components/ui/Tag.tsx` |
| `ExpandText` | 折りたたみテキスト | `src/components/ui/ExpandText.tsx` |
| `FortuneTypeCard` | 占い結果カード | `src/features/fortune/FortuneTypeCard.tsx` |
| `CharaAvatar` | キャラアバター表示 | `src/components/ui/CharaAvatar.tsx` |
| `CharacterCarousel` | キャラ一覧 | `src/features/character/CharacterCarousel.tsx` |
| `RarityBadge` | レアリティバッジ | `src/features/character/RarityBadge.tsx` |
| `LuckySection` | ラッキーアイテム表示 | `src/features/fortune/LuckySection.tsx` |
| `PremiumCTA` | プレミアム誘導 | `src/features/premium/PremiumCTA.tsx` |
| `PremiumTeaserCard` | プレミアム機能ティーザー | `src/features/premium/PremiumTeaserCard.tsx` |
| `StickyPremiumBar` | 固定プレミアムバー | `src/features/premium/StickyPremiumBar.tsx` |
| `TomorrowTeaser` | 翌日誘導 | `src/features/retention/TomorrowTeaser.tsx` |
| `Particles` | 背景パーティクル | `src/components/fx/Particles.tsx` |

## 4. ビュー（画面）

- `dream` — 夢診断モード
- `fortune` — 星座占いモード
- `love` — 相性占い（存在確認必要）
- `archive` — 履歴画面
- `home` — ホーム画面

## 5. 純粋ロジック（副作用なし・抽出対象）

| ロジック | 現状の場所 | 移植先 |
|---|---|---|
| 夢診断判定 | `App` 内インライン | `src/logic/dream.ts` |
| 星座占い計算 | `App` 内インライン | `src/logic/fortune.ts` |
| 相性判定 | `App` 内インライン | `src/logic/compatibility.ts` |
| ガチャレアリティ判定 | `FortuneTypeCard` 近辺 | `src/logic/rarity.ts` |
| 連続日数カウント | `App` 内 | `src/logic/streak.ts` |
| Canvas画像生成（シェア用） | `App` 内インライン | `src/logic/canvasShare.ts` |
| キャラ画像（base64） | `CHARA_IMAGES` 定数 | `src/assets/chara.ts` |

## 6. サイドエフェクト層

| 層 | 現状 | 移植先 |
|---|---|---|
| Firebase初期化 | `<script>` タグ内 | `src/lib/firebase.ts` |
| Firebase Auth | インライン | `src/lib/auth.ts` |
| Firestore | インライン | `src/lib/firestore.ts` |
| Messaging (Push) | インライン | `src/lib/messaging.ts` |
| GA4 gtag | `window.gtag` 直接呼び | `src/lib/analytics.ts` |

## 7. Analytics イベント（全28種）

`dream_start`, `dream_complete`, `fortune_start`, `fortune_complete`, `ftue_next`, `ftue_complete`, `profile_complete`, `paywall_view`, `soft_paywall_tap`, `deep_paywall_tap`, `compat_paywall_tap`, `letter_paywall_tap`, `banner_premium_tap`, `premium_cta_tap`, `sticky_cta_tap`, `teaser_cta_tap`, `checkout_open`, `subscription_cancel`, `image_save`, `share_result`, `share_dream`, `friend_invite_tap`, `push_prompt_dream_result`, `retention_teaser_tap`, `streak_update`, `streak_milestone`, `night_mode_toggle`, `exception`

→ 全て `src/lib/analytics.ts` の関数経由に集約して型安全化。

## 8. 認証機能

- Google Sign-In (Popup 方式 — Redirect からの移行済み)
- Email Link (パスワードレス)

## 9. PWA関連

- `manifest.json` — アイコン・テーマカラー・ショートカット
- `firebase-messaging-sw.js` — Service Worker（push通知）
- `icon-192.png`, `icon-512.png`
- `ogp.png` — OGP画像

## 10. SEO/構造化データ

- `schema.org` Organization / BreadcrumbList 埋め込み済み
- `sitemap.xml`, `robots.txt`
- OGP/Twitter Card

## 11. 法務ページ（HTML直書き・維持）

- `legal.html` — 特定商取引法
- `privacy.html` — プライバシーポリシー
- `terms.html` — 利用規約

→ これらは静的HTMLのまま temploraryに `public/` に配置して維持。後続Phaseで React化の是非判断。

## 12. 既知の不具合（rebuild で解決するべきもの）

| 不具合 | 発生箇所 | 原因仮説 |
|---|---|---|
| スクロール不能 | 全画面 | 単一HTML内の React状態破綻 or CSS fixed競合 |
| 月絵が高速シェイク | 夢診断結果画面 | breathe/shake アニメの重複適用 or state再レンダリングループ |
| 起動時フリーズ再発 | 初回起動 | Firebase初期化 + React mount タイミング競合 |
| TDZエラー | 複数箇所 | 単一スコープ内の変数参照順序 |
| SRIハッシュ不正 | CDN経由 | インラインスクリプトのハッシュ管理不能 |
| キャッシュスタック | Vercel | Service Worker キャッシュ名不変 |

→ **全てビルドツール導入＋コンポーネント分離で構造的に解決可能**。

## 13. Phase進行計画

| Phase | 内容 | 完了判定 |
|---|---|---|
| **0** ✅ | 本ドキュメント作成 | inventory.md コミット |
| **1** | Vite + React 18 + TS プロジェクト初期化 | `npm run dev` で空画面表示 |
| **2** | 純粋ロジック抽出（`src/logic/*.ts`） | 単体テスト通過 |
| **3** | Firebase 層分離（`src/lib/*.ts`） | Firebase接続確認 |
| **4** | UIコンポーネント分割（16個） | 全コンポーネント Storybook or Preview OK |
| **5** | スタイリング（CSS variables → tokens） | DESIGN.md準拠チェック |
| **6** | PWA + Service Worker 再設定 | プッシュ通知動作確認 |
| **7** | Vercel デプロイ切替 | 本番で動作確認 |
| **8** | Self-Pentesting（§8.8）実施 | セキュリティチェック通過 |

## 14. リスクと緩和策

| リスク | 緩和策 |
|---|---|
| 既存ユーザーの localStorage データ消失 | Phase 2で全キー互換レイヤー作成 |
| Firebase config 変更による認証切断 | Firebase config は一字一句変更禁止 |
| Service Worker キャッシュ残留で旧版維持 | SW名 `ynk-sw-v9` → `ynk-sw-v10` に変更 |
| SEO インデックス失効 | schema.org + sitemap.xml を完全保全 |
| Vercel ビルド失敗 | Phase 1 で最小構成 → 段階的に機能追加 |
| プッシュ通知の token 無効化 | 既存 token は継続使用可能 |

## 15. Surgical Change Principle 適用

- ✅ **rebuild = 最小変更ではない**が、モグラ叩きパッチこそが真の「大きな無駄変更」
- ✅ 既存機能は全保全（機能削除なし）
- ✅ 1 Phase = 1 PR の段階リリースで diff を限定
- ✅ Firebase config / localStorage キー / デプロイ先は不変
- ✅ 各Phaseごとに反証モード3段階を実施
