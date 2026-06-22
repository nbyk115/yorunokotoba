import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ViewKey } from '@/App';

type FeatureKey = 'dream' | 'fortune';

interface PremiumCardProps {
  onNavigate: (view: ViewKey) => void;
  /** 表示する機能 key を絞り込む。省略時は全 2 件表示。 */
  features?: readonly FeatureKey[];
}

/**
 * プレミアム機能訴求カード。
 * 視覚要素を 3 つ (アイコン + 見出し + CTA) に絞り、改行を block 分割で完全制御。
 * DreamView / FortuneView の入力前・結果後で共用する。
 *
 * 設計指針 (佐藤裕介流の情報設計):
 * - 1 カード = 1 メッセージ
 * - 視覚要素 3 つまで (icon / title / CTA)
 * - 色味は gold ボーダーのみで「プレミアム感」を担保、内部は通常トークン
 * - 説明文は 2 文 block 分割で center 配置 (Hard Rule 16 ② 改行制御)
 */

interface PremiumFeature {
  readonly icon: string;
  readonly title: string;
  /** 2 文に分けて block 配置。一文中の改行を防ぐ (HR16 ②)。 */
  readonly descLines: readonly [string, string];
  readonly view: ViewKey;
}

const PREMIUM_FEATURES: readonly PremiumFeature[] = [
  {
    icon: '📈',
    title: '月ごとの夢の傾向分析',
    descLines: [
      '夢の記録を重ねると、',
      '今月の心のテーマが見えてくる。',
    ],
    view: 'dream',
  },
  {
    icon: '🔭',
    title: 'ホロスコープの深い分析',
    descLines: [
      '太陽星座の 4 層を、',
      '毎日違う角度から読み解くよ。',
    ],
    view: 'fortune',
  },
] as const;

export function PremiumCard({ onNavigate, features }: PremiumCardProps) {
  const displayFeatures = features
    ? features
        .map((v) => PREMIUM_FEATURES.find((f) => f.view === v))
        .filter((f): f is PremiumFeature => f !== undefined)
    : PREMIUM_FEATURES;

  return (
    <Card
      style={{
        border: '1px solid rgba(212, 168, 83, 0.45)',
        background: 'var(--card)',
      }}
    >
      {/* セクションラベル: 控えめに */}
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--gold)',
          letterSpacing: 2,
          textAlign: 'center',
          marginBottom: 'var(--sp-4)',
        }}
      >
        ✦ PREMIUM ✦
      </p>

      {/* 機能カード一覧 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--sp-3)',
          marginBottom: 'var(--sp-4)',
        }}
      >
        {displayFeatures.map((f) => (
          <div
            key={f.title}
            role="button"
            tabIndex={0}
            onClick={() => onNavigate(f.view)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onNavigate(f.view);
              }
            }}
            style={{
              padding: 'var(--sp-4)',
              borderRadius: 'var(--r-input)',
              background: 'var(--bg1)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {/* アイコン + 見出し: 1 行 nowrap で改行禁止 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>{f.icon}</span>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'var(--t1)',
                  whiteSpace: 'nowrap',
                }}
              >
                {f.title}
              </p>
            </div>
            {/* 説明: 2 文 block 分割で center 配置 (HR16 ② 完全準拠) */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                fontSize: 12,
                color: 'var(--t2)',
                lineHeight: 1.7,
                textAlign: 'center',
              }}
            >
              {f.descLines.map((line, i) => (
                <span key={i}>{line}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button variant="primary" onClick={() => onNavigate(displayFeatures[0]?.view ?? 'dream')} fullWidth>
        プレミアムをのぞく
      </Button>
    </Card>
  );
}
