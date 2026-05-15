# Error Monitoring — Sentry 設定手順（運営者向け）

> **目的**: 副業オーナーが Vercel ログを毎週見にいかなくて済むようにする
> **コスト**: ¥0（Sentry Free プラン: 5,000 events/月）
> **設定時間**: 約20分

---

## 1. Sentry プロジェクト作成

1. https://sentry.io/signup/ にアクセス
2. **Free プラン**で登録（クレジットカード不要）
3. 新規プロジェクト作成:
   - Platform: **React**
   - Project name: `yorunokotoba-frontend`
4. DSN（接続URL）をコピー
   - 形式: `https://xxxxx@oXXXX.ingest.sentry.io/XXXXX`

---

## 2. Vercel 環境変数に DSN 追加

```bash
# Vercel Dashboard → Settings → Environment Variables → Add
VITE_SENTRY_DSN=https://xxxxx@oXXXX.ingest.sentry.io/XXXXX
# Environment: Production のみ ✅
# Preview/Development は OFF（無料枠を本番だけで使う）
```

---

## 3. frontend に Sentry 統合（次の PR で実装予定）

```bash
cd frontend
npm install --save @sentry/react
```

`frontend/src/main.tsx` に追加:
```ts
import * as Sentry from '@sentry/react';

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    // 5,000 events/月の Free 枠を超えないようサンプリング
    sampleRate: 1.0, // ローンチ初期は全件、安定後 0.5 に
    tracesSampleRate: 0.0, // パフォーマンスは無効（無料枠保護）
    beforeSend(event) {
      // Premium 関連エラーは優先して送信
      return event;
    },
  });
}
```

`App.tsx` の `ErrorBoundary` を Sentry 連携:
```ts
componentDidCatch(err: Error) {
  trackException(err.message, true);
  Sentry.captureException(err); // 追加
}
```

---

## 4. Slack Alert Rule 設定

1. Sentry プロジェクト → **Alerts** → New Alert
2. **Issue Alert** を選択
3. 条件:
   - "A new issue is created" + "Issue is unresolved for 1 hour"
4. アクション: **Slack** → ワークスペース連携 → `#yorunokotoba-alerts` チャンネル選択

---

## 5. 副業オーナー向け閾値

| イベント数/月 | 状態 | 対応 |
|---|---|---|
| 〜500 | ⚪ 健全 | 何もしない |
| 500-3000 | 🟡 注意 | 月1回 Sentry ダッシュボード確認 |
| 3000-5000 | 🟠 警戒 | 上位 5 件の修正 PR 起票 |
| 5000 超 | 🔴 危険 | sampleRate を 0.5 に下げる + 緊急対応 |

---

## 6. 副業オーナーの運用負担

| 項目 | 月次工数 |
|---|---|
| 通常運用 | **0 分**（Slack 通知のみ）|
| 月次ダッシュボード確認 | 5 分 |
| エラー修正 | 障害発生時のみ |

---

## 関連

- `docs/operations/uptime-monitoring.md` — UptimeRobot 死活監視
- `frontend/src/main.tsx` — Sentry 初期化（次 PR で実装）
- `NORTH_STAR.md` — 月10時間運用上限の根拠
