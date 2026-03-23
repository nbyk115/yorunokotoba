# 「よるのことば」KPI設計書

> kpi-analyticsエージェント分析結果（2026年3月23日）

---

## 数値目標

| 指標 | 3ヶ月 | 6ヶ月 | 12ヶ月 |
|---|---|---|---|
| MRR | 48,000円 | 192,000円 | 576,000円 |
| MAU | 3,000 | 8,000 | 20,000 |
| DAU | 600 | 2,000 | 5,000 |
| CVR（無料→有料） | 2.0% | 3.0% | 4.0% |
| 有料ユーザー数 | 100 | 400 | 1,200 |
| チャーン率 | 12% | 8% | 6% |
| LTV | 4,000円 | 6,000円 | 8,000円 |

**ブレイクイーブン: 有料会員240名**

---

## KPIツリー

```
MRR
├── 有料ユーザー数
│   ├── 新規課金数
│   │   ├── MAU
│   │   │   ├── オーガニック流入（SEO/ASO）
│   │   │   ├── SNSシェア経由（share_result）
│   │   │   └── プッシュ通知経由復帰
│   │   ├── DAU
│   │   │   ├── FTUE完了率
│   │   │   ├── 占い実行率
│   │   │   └── セッション時間/頻度
│   │   └── CVR
│   │       ├── ペイウォール表示率
│   │       ├── チェックアウト開始率
│   │       └── チェックアウト完了率
│   └── 解約抑止
│       ├── プレミアム機能利用率
│       └── ストリーク7日以上継続率
└── ARPPU（480円/月）
```

---

## 追加すべきGA4イベント（P0）

### 課金ファネル完結
```javascript
// 課金完了（現在未実装・最重要）
gtag('event', 'purchase', {
  currency: 'JPY', value: 480,
  transaction_id: subscriptionId,
  items: [{ item_name: 'premium_monthly', price: 480 }]
});

// 無料トライアル開始
gtag('event', 'trial_start', { trial_duration: 7 });

// 解約
gtag('event', 'subscription_cancel', {
  tenure_months: monthsSinceSubscription
});
```

### リテンション
```javascript
// ストリーク達成
gtag('event', 'streak_milestone', {
  streak_count: streakCount, is_premium: isPremium
});

// プッシュ通知許可
gtag('event', 'push_permission', {
  result: 'granted' | 'denied'
});
```

---

## リテンション目標

| Day | 目標 | 業界平均 |
|---|---|---|
| Day 1 | 40% | 25-35% |
| Day 7 | 18% | 10-15% |
| Day 30 | 8% | 4-7% |

---

## 実装優先度

| 優先度 | アクション | 工数 |
|---|---|---|
| P0 | `purchase`イベント実装 | 0.5日 |
| P0 | GA4カスタムディメンション設定 | 0.5日 |
| P1 | リテンション系イベント追加 | 1日 |
| P1 | ペイウォール別CVR計測 | 0.5日 |
| P2 | ストリークマイルストーン実装 | 2日 |
| P3 | 年額プラン導入（ARPPU+40%） | 3日 |
| P3 | Looker Studioダッシュボード | 2日 |
