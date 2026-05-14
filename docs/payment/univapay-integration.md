# UnivaPay 統合仕様書（α版・架空実装スキャフォールド）

> **状態**: 雛形のみ実装。実 API 接続前のスペック検証用。
> **更新日**: 2026-05-14
> **背景**: Stripe 審査落ち → competitive-analyst 調査により UnivaPay を主軸採用

---

## 1. アーキテクチャ概観

```
[PWA Frontend]                    [Vercel Serverless]            [UnivaPay]
                                                                  
PremiumCTA ──startCheckout()──▶  POST /api/subscription/checkout
                                       │
                                       ├──▶ UnivaPay Checkout API
                                       │      ↓
                                       └──◀── checkoutUrl
                                       ↓
       ◀── { checkoutUrl } ─────────  
       
window.location = checkoutUrl  ─────────────────────────────▶  Hosted Page
                                                                    │
                                                                    │ ユーザー決済
                                                                    ▼
                                                                  Webhook
                                       POST /api/webhooks/univapay ◀┘
                                       │ HMAC-SHA256 署名検証
                                       │
                                       ├──▶ firebase-admin
                                       │      ↓ Firestore update
                                       │   users/{uid}.subscription
                                       │
                                       └──▶ 200 OK

[Firestore Realtime]  ──onSnapshot──▶  useSubscription() hook  ──▶ isPremium=true
```

---

## 2. 実装済みファイル（scaffold）

| ファイル | 役割 | 状態 |
|---|---|---|
| `frontend/src/lib/subscription.ts` | Subscription 型・useSubscription フック・startCheckout/cancel | ✅ 雛形完成 |
| `frontend/src/components/ui/PremiumCTA.tsx` | 課金CTAボタン・Checkout 起動 | ✅ 雛形完成 |
| `frontend/src/features/fortune/FortuneView.tsx` | useSubscription 連携 | ✅ 連携済 |
| `api/_shared/types.ts` | Vercel API 共通型 | ✅ 雛形完成 |
| `api/subscription/checkout.ts` | Checkout URL 生成 | 🚧 mock応答のみ |
| `api/subscription/mock-checkout.ts` | 開発用模擬決済画面 | ✅ 完成（本番削除予定）|
| `api/webhooks/univapay.ts` | Webhook 受信・Firestore 更新 | 🚧 ログのみ |

---

## 3. データモデル

### users/{uid}.subscription
```ts
interface Subscription {
  status: 'none' | 'active' | 'past_due' | 'canceled';
  plan: 'premium_monthly' | null;
  currentPeriodEnd: Timestamp | null;    // 期間末日（active な間のみ意味あり）
  univapaySubscriptionId: string | null; // UnivaPay 側 ID（解約・更新で参照）
}
```

### Premium 判定式
```ts
isPremium = subscription.status === 'active' && currentPeriodEnd > now
```

---

## 4. 🔺 未解決の重大ギャップ（着手前にブロッカー化する項目）

### G1. Auth 統合（最重要・ブロッカー）
**現状**: `frontend/src/lib/auth.ts` に Firebase Auth ヘルパは存在するが、App.tsx に組み込まれていない。アプリは localStorage のみで匿名運用。
**影響**: subscription を user に紐付ける UID が確定できない → 端末乗換・キャッシュクリアで Premium 紛失。
**対応案**:
- (A) Firebase Anonymous Auth を App.tsx 起動時に発火（最小工数 / UID は端末固有）
- (B) Google サインインを ProfileSetup 後に必須化（UX 摩擦増 / UID 永続）
- (C) Email link signin を Premium タップ時にのみ発火（UX良 / 実装中規模）
**推奨**: **(C) を S1 で実装**。匿名でも Premium 体験は可能だが、購入時のみログイン強制。
**現スキャフォールド**: PremiumCTA に `userId={null}` を渡すと内部で `guest_xxxx` ID を生成（localStorage 保存）。これは TODO(univapay) でマークされており本番運用不可。

### G2. UnivaPay 審査・契約
**現状**: UnivaPay 契約前。占い・スピリチュアル明示対応の確認は調査ベース。
**必要アクション**:
- パートナー経由（MyASP 等）の事前相談で初期/月額0円ルートを確保
- 申請時の業種記載: 「占い・スピリチュアルコンテンツ配信」
- 法務スキームC（`docs/security/legal-scheme-migration.md`）との整合確認 → legal-compliance-checker 必須

### G3. Checkout 方式の確定
**選択肢**:
- (a) UnivaPay Checkout（Hosted Page）→ PCI DSS スコープ縮小・実装最小
- (b) UnivaPay Widget（自社UI）→ UX 一貫性高い・PCI 要件あり
**推奨**: **(a) Hosted Page** 一択。PWA で PCI 範囲を背負わない。

### G4. Webhook 署名検証
UnivaPay の署名仕様確認待ち。一般的には HMAC-SHA256(secret, body) を `X-Univapay-Signature` ヘッダで検証。実装は `api/webhooks/univapay.ts` の TODO 箇所。

### G5. firebase-admin 初期化
Webhook から Firestore を更新するため、Vercel 環境変数に Service Account を設定する必要あり。
- `FIREBASE_SERVICE_ACCOUNT_JSON`（base64 推奨）
- リージョン: Vercel 側 `hnd1`、Firestore は asia-northeast1 推奨（レイテンシ）

### G6. 価格決定
| ソース | 価格 |
|---|---|
| 既存 UI（FortuneView）| **¥480/月** |
| strategy-lead 試算 | ¥980/月（ARPPU 仮定値）|
| competitive-analyst 試算 | ¥1,980/月（UnivaPay 推奨）|
| LINE占い・noteメンバーシップ事例 | ¥1,000〜¥1,500 が中央値 |

**意思決定待ち**: marketing-research（market-researcher）で価格弾力性調査推奨。S1 着手前に確定必須。

### G7. CSP（Content-Security-Policy）
`vercel.json` の CSP は `connect-src` に UnivaPay ドメインが含まれていない。Checkout 後の戻りリンクや Webhook 関連で許可ドメインが必要：
- `https://api.univapay.com`
- `https://checkout.univapay.com`
S1 着手時に CSP を追記する。

### G8. キャンセル動線
現状 `cancelSubscription()` の UI が無い。マイページ的な「サブスク管理」画面が必要。
- 法的要件: 特商法に基づき解約方法の明示が必要（legal-compliance-checker 確認）

### G9. iOS Safari の PWA 制約
- Safari の third-party cookie 制限により、UnivaPay Hosted Page → 戻りリダイレクト時にセッションが切れる可能性
- 検証必須：iOS Safari, Android Chrome, デスクトップ Chrome の3環境

---

## 5. S1（次スプリント）実装タスクの ToDo

優先順（上から順に対応）:

1. **G6 価格決定**（経営判断）
2. **G2 UnivaPay 事前相談** + 業種申請（外部待ち、並行進行）
3. **G1 Auth 統合**: Email link signin を Premium タップ時に発火（UX 設計：ux-designer）
4. **G3 Checkout API 実装**: `api/subscription/checkout.ts` のスタブを実 API 呼び出しに置換
5. **G4 Webhook 署名検証** + **G5 firebase-admin 初期化**: `api/webhooks/univapay.ts` を完成
6. **G7 CSP 更新**: `vercel.json` に UnivaPay ドメイン追加
7. **G8 キャンセル動線**: マイページ作成（ux-designer + frontend-dev）
8. **G9 3環境テスト**: iOS Safari / Android Chrome / Desktop Chrome
9. **法務確認**: legal-compliance-checker で特商法・スキームC整合
10. **mock-checkout 削除** + GA4 `purchase` イベント送信

---

## 6. 環境変数（Vercel Dashboard で設定）

| 変数 | 用途 | 取得元 |
|---|---|---|
| `UNIVAPAY_SECRET` | API認証 | UnivaPay 管理画面 |
| `UNIVAPAY_STORE_ID` | ストア識別 | UnivaPay 管理画面 |
| `UNIVAPAY_WEBHOOK_SECRET` | Webhook 署名検証 | UnivaPay 管理画面 |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | firebase-admin 初期化 | Firebase Console |

未設定時は `api/subscription/checkout.ts` が mock URL を返すため、開発フローは継続可能。

---

## 7. ローカル動作確認（架空実装）

```bash
# 1. Vercel CLI でローカル起動
cd /home/user/yorunokotoba
npx vercel dev

# 2. ブラウザで Premium CTA をタップ
# → /api/subscription/checkout が mock URL を返す
# → /api/subscription/mock-checkout 画面に遷移
# → 「決済完了をシミュレート」で /api/webhooks/univapay にPOST
# → ログに [univapay webhook] が出力される
```

> **注**: 実 Firestore 更新は webhook の TODO 箇所未実装のため、現状は subscription の状態変化はログのみ。UI 反映には G5（firebase-admin 統合）が必要。

---

## 8. 反証チェック結果

✅ **Step 1（自己反証）**:
- UnivaPay が後日アカウント停止する可能性 → S0 として note メンバーシップ並走を提案（決済導線冗長化）
- 「auth がない」状態で課金UIだけ用意することの違和感 → スキャフォールド段階では `guest_xxxx` で動かしギャップを可視化、本番投入前に G1 必須化
- 価格 ¥480 vs ¥1,980 の差 → market-researcher で確定（前提値で動かさない）

✅ **Step 2（構造反証）**:
- Vercel + Firestore + UnivaPay の三者連携は標準的なパターン（Stripe や Paddle でも同じ構造）→ 構造は妥当
- Webhook の冪等性: UnivaPay は同イベントを最大3回送信する仕様（要確認）→ subscription ID + event type で冪等化必要
- データ整合性: Firestore の subscription を SSoT とし、UnivaPay 側は参照元として扱う

✅ **Step 3（実用反証）**:
- 開発者がローカルで動作確認できる（mock-checkout 経由）→ チーム開発の摩擦を最小化
- 本番デプロイ時は `UNIVAPAY_*` 環境変数が未設定なら 501 を返す → 課金経路の誤動作を防止
- iOS Safari の戻りリンク問題は実機テスト必須

🔺 **残存リスク**:
- 暗号通貨・国際課金は未対応（β以降）
- UnivaPay 障害時のフォールバック（note 誘導）UI 未実装
- 課金 → コンテンツ解放までのレイテンシ（webhook 遅延時に「払ったのに見られない」UX問題）の許容秒数未定
- `subscription` フィールド追加に伴う Firestore Rules の更新が未着手（書込許可は webhook のみ）

---

## 9. 関連ドキュメント

- `docs/security/legal-scheme-migration.md` — 法務スキームC
- `docs/security/firestore-rules-deploy.md` — Firestore Rules
- `docs/growth-strategy/kpi-design.md` — MRR/CVR 目標
- `docs/strategy/market-research-and-strategy.md` — 市場戦略
- `ICP.md` — ターゲットペルソナ
