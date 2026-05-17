/**
 * CompatibilityView  -  Wave L1 骨格実装
 * 相性占い（無料機能）: Tinder 占星術 参考
 *
 * レイアウト:
 *   BackHeader → 自分/相手 星座Picker → Card primary（相性スコア）
 *   → StatBar×2 (Vibes/コミュニケーション) → エレメント構成 → ペアコメント
 *
 * 中身コピー・ロジックは Wave L2/L3。骨格のみ。
 */
import { useState } from 'react';
import { BackHeader } from '@/components/ui/BackHeader';
import { Card } from '@/components/ui/Card';
import { StatBar } from '@/components/ui/StatBar';
import { Button } from '@/components/ui/Button';
import { SIGNS } from '@/data/signs';

interface CompatibilityViewProps {
  onBack: () => void;
}

const SIGN_NAMES = SIGNS.map((s) => s.k);

const ELEMENT_MAP: Record<string, string> = {
  おひつじ座: '火', おうし座: '地', ふたご座: '風', かに座: '水',
  しし座: '火', おとめ座: '地', てんびん座: '風', さそり座: '水',
  いて座: '火', やぎ座: '地', みずがめ座: '風', うお座: '水',
};

export function CompatibilityView({ onBack }: CompatibilityViewProps) {
  const [mySign, setMySign] = useState(SIGN_NAMES[0] ?? 'おひつじ座');
  const [theirSign, setTheirSign] = useState(SIGN_NAMES[3] ?? 'かに座');
  const [result, setResult] = useState<null | { score: number; comment: string }>(null);

  function handleCheck() {
    // Wave L2 で本実装。骨格として決定論的スコアを返す
    const idx = (SIGN_NAMES.indexOf(mySign) + SIGN_NAMES.indexOf(theirSign)) % 5 + 1;
    setResult({
      score: idx,
      comment: 'ふたりの相性をよみとき中…Wave L2 で実装予定',
    });
  }

  const myElement = ELEMENT_MAP[mySign] ?? '不明';
  const theirElement = ELEMENT_MAP[theirSign] ?? '不明';

  return (
    <div style={{ paddingBottom: 40 }}>
      <BackHeader onBack={onBack} title="相性占い" />

      {/* 自分/相手 星座Picker */}
      <div style={{ padding: '16px 16px 0', display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <label
            htmlFor="my-sign"
            style={{ fontSize: 'var(--fs-caption)', color: 'var(--t3)', fontFamily: 'var(--font-heading)', display: 'block', marginBottom: 4 }}
          >
            あなたの星座
          </label>
          <select
            id="my-sign"
            value={mySign}
            onChange={(e) => setMySign(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--r-input)',
              border: '1.5px solid var(--border)',
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--t1)',
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--fs-body)',
              minHeight: 44,
            }}
          >
            {SIGN_NAMES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <span
          aria-hidden="true"
          style={{ color: 'var(--t3)', fontFamily: 'var(--font-accent)', fontSize: 'var(--fs-h2)', fontStyle: 'italic', flexShrink: 0 }}
        >
          &amp;
        </span>

        <div style={{ flex: 1 }}>
          <label
            htmlFor="their-sign"
            style={{ fontSize: 'var(--fs-caption)', color: 'var(--t3)', fontFamily: 'var(--font-heading)', display: 'block', marginBottom: 4 }}
          >
            相手の星座
          </label>
          <select
            id="their-sign"
            value={theirSign}
            onChange={(e) => setTheirSign(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--r-input)',
              border: '1.5px solid var(--border)',
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--t1)',
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--fs-body)',
              minHeight: 44,
            }}
          >
            {SIGN_NAMES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        <Button variant="primary" onClick={handleCheck} fullWidth>
          相性をみる
        </Button>
      </div>

      {result && (
        <>
          {/* 相性スコアカード（主役） */}
          <Card
            variant="primary"
            style={{ margin: '16px 16px 12px', borderLeft: 'var(--card-accent-line)' }}
          >
            <p
              style={{
                fontSize: 'var(--fs-card-label)',
                fontWeight: 700,
                color: 'var(--t3)',
                letterSpacing: 'var(--ls-card-label)',
                margin: '0 0 12px',
              }}
            >
              相性スコア
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <StatBar label="Vibes" value={result.score} colorToken="var(--rose)" />
              <StatBar label="会話" value={Math.min(5, result.score + 1)} colorToken="var(--lavender)" />
            </div>
          </Card>

          {/* エレメント構成 */}
          <Card variant="secondary" style={{ margin: '0 16px 12px' }}>
            <p
              style={{
                fontSize: 'var(--fs-caption)',
                fontWeight: 700,
                color: 'var(--t3)',
                margin: '0 0 8px',
                fontFamily: 'var(--font-heading)',
              }}
            >
              エレメント構成
            </p>
            <p style={{ fontSize: 'var(--fs-body)', color: 'var(--t1)', fontFamily: 'var(--font-heading)', margin: 0 }}>
              {mySign}（{myElement}） × {theirSign}（{theirElement}）
            </p>
          </Card>

          {/* ペアコメント */}
          <Card variant="secondary" style={{ margin: '0 16px 12px' }}>
            <p
              style={{
                fontSize: 'var(--fs-caption)',
                fontWeight: 700,
                color: 'var(--t3)',
                margin: '0 0 8px',
                fontFamily: 'var(--font-heading)',
              }}
            >
              ふたりへ
            </p>
            <p style={{ fontSize: 'var(--fs-body)', lineHeight: 1.9, color: 'var(--t1)', fontFamily: 'var(--font-heading)', margin: 0 }}>
              {result.comment}
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
