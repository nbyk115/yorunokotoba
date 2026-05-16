# Uptime Monitoring : UptimeRobot 設定手順（運営者向け）

> **目的**: 副業オーナーの運用負荷ゼロで死活監視 + Slack 自動通知
> **コスト**: ¥0（UptimeRobot Free プラン）
> **設定時間**: 約10分

---

## 1. UptimeRobot アカウント作成

1. https://uptimerobot.com/signUp にアクセス
2. メールアドレス + パスワードで登録（運営用 Gmail でOK）
3. 2段階認証を有効化（Settings → Security）

---

## 2. モニター追加（5分間隔・無料枠）

### a) 本体 PWA の死活監視
| 項目 | 値 |
|---|---|
| Monitor Type | HTTP(s) |
| Friendly Name | yorunokotoba（本体）|
| URL | `https://yorunokotoba.vercel.app/` |
| Monitoring Interval | 5 minutes |
| Monitor Timeout | 30 seconds |

### b) API health check
| 項目 | 値 |
|---|---|
| Monitor Type | HTTP(s) |
| Friendly Name | yorunokotoba API |
| URL | `https://yorunokotoba.vercel.app/api/subscription/checkout` |
| HTTP Method | POST |
| Monitoring Interval | 15 minutes |
| Expected Status Code | 401（認証なしリクエスト → unauthorized 返却で正常）|

### c) Webhook エンドポイント
| 項目 | 値 |
|---|---|
| Monitor Type | HTTP(s) |
| Friendly Name | yorunokotoba Webhook |
| URL | `https://yorunokotoba.vercel.app/api/webhooks/univapay` |
| HTTP Method | POST |
| Monitoring Interval | 15 minutes |
| Expected Status Code | 401（署名なし → 正常） |

---

## 3. Slack 通知設定

1. Slack Workspace で「**Incoming Webhooks**」アプリ追加
   - https://api.slack.com/messaging/webhooks
   - 通知用チャンネル作成（例: `#yorunokotoba-alerts`）
   - Webhook URL コピー
2. UptimeRobot Settings → Alert Contacts → Add New
   - Type: **Slack**
   - Webhook URL: 上記でコピーしたもの
   - Channel: `#yorunokotoba-alerts`
3. 各 Monitor の編集画面で「Alert Contacts To Notify」に追加

---

## 4. テスト

1. Monitor 追加後、ダッシュボードで「Up」表示を確認
2. 一時的に間違った URL に変更 → ダウン検知 → Slack 通知が来ることを確認
3. URL を戻す

---

## 5. 副業オーナーの運用負担

| 項目 | 月次工数 |
|---|---|
| 通常運用 | **0 分**（自動）|
| アラート対応 | 障害発生時のみ（想定 0-1 件/月）|

---

## 関連

- `docs/operations/error-monitoring.md` : Sentry エラー監視
- `.github/workflows/ci.yml` : CI 自動 typecheck/build
- `NORTH_STAR.md` : 月10時間運用上限の根拠
