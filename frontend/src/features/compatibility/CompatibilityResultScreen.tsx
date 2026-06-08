/**
 * 相性診断 共通結果描画コンポーネント。
 * CompatibilityView（送信側）と CompatibilityReceiverView（受信側）から共有する。
 * シェアボタンの有無など差分は props で吸収。
 */
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CharaAvatar } from '@/components/ui/CharaAvatar';
import {
  getRankColor,
  getCompatibilityScore,
  getCompatibilityHint,
  getCompatibilityCaution,
  type CompatibilityResult,
} from './compatibilityLogic';
import { track } from '@/lib/analytics';
import type { ViewKey } from '@/App';

interface CompatibilityResultScreenProps {
  result: CompatibilityResult;
  /** 送信側のキャラID（シェアURL生成に使用）。未指定時はシェアボタン非表示 */
  shareCharaId?: string;
  /** 別の人と試すボタン押下時。未指定時はボタン非表示 */
  onReset?: () => void;
  /** 自分のキャラを知るボタン押下時。未指定時はボタン非表示 */
  onNavigate?: (view: ViewKey) => void;
  /** 受信側向けCTAボタン（無料で試してみる等）。未指定時は非表示 */
  onExit?: () => void;
}

/** スコアリングを視覚化するリングSVG */
function ScoreRing({
  score,
  color,
  size = 120,
}: {
  score: number;
  color: string;
  size?: number;
}) {
  const r = (size - 12) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--border)"
        strokeWidth={6}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  );
}

export function CompatibilityResultScreen({
  result,
  shareCharaId,
  onReset,
  onNavigate,
  onExit,
}: CompatibilityResultScreenProps) {
  const [copied, setCopied] = useState(false);

  const charaAId = result.charaA?.id ?? '';
  const charaBId = result.charaB?.id ?? '';
  const score = getCompatibilityScore(result.rank, charaAId, charaBId);
  const hint = getCompatibilityHint(result.rank, charaAId, charaBId);
  const caution = getCompatibilityCaution(result.rank, charaAId, charaBId);
  const rankColor = getRankColor(result.rank);

  async function handleShare() {
    if (!shareCharaId) return;
    const url = `${window.location.origin}${window.location.pathname}?compat=${encodeURIComponent(shareCharaId)}`;
    const text = `わたしとあなたの相性、見てみて💞 ${url}`;
    track('compatibility_share', { my_chara: shareCharaId, rank: result.rank });
    try {
      if (navigator.share) {
        await navigator.share({ title: 'よるのことば 相性診断', text, url });
        return;
      }
    } catch {
      /* share キャンセル or 非対応はコピーにフォールバック */
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard 非対応環境 */
    }
  }

  const rankEmoji =
    result.rank === 'best' ? '💖' : result.rank === 'good' ? '💫' : '🌱';

  const scoreDecoration =
    result.rank === 'best' ? '✨✨' : result.rank === 'good' ? '🌟' : '💪';

  return (
    <div
      className="slide-up"
      style={{
        padding: 'var(--sp-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-4)',
      }}
    >
      <header style={{ textAlign: 'center', marginBottom: 'var(--sp-3)' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--rose)' }}>
          💞 相性診断
        </h2>
        <p style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4 }}>無料の相性占い</p>
      </header>

      {/* ヒーローカード: アバター + スコアリング + rankLabel */}
      <Card className="slide-up-1" style={{ textAlign: 'center' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 16,
            marginBottom: 'var(--sp-4)',
          }}
        >
          {result.charaA && <CharaAvatar id={result.charaA.id} size={72} animate />}
          <span style={{ fontSize: 18, color: 'var(--t3)' }}>×</span>
          {result.charaB && <CharaAvatar id={result.charaB.id} size={72} animate />}
        </div>

        <div
          style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--sp-3)',
          }}
        >
          <ScoreRing score={score} color={rankColor} size={120} />
          <div
            style={{
              position: 'absolute',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              lineHeight: 1,
              gap: 2,
            }}
          >
            <span
              style={{
                fontSize: 48,
                fontWeight: 700,
                color: rankColor,
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-1px',
              }}
            >
              {score}
              <span style={{ fontSize: 22, fontWeight: 500 }}>%</span>
            </span>
          </div>
        </div>

        <p
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: rankColor,
            letterSpacing: 1,
            marginBottom: 4,
          }}
        >
          {rankEmoji} {result.rankLabel} {scoreDecoration}
        </p>
        <p style={{ fontSize: 14, color: 'var(--t1)', fontWeight: 700, marginTop: 4 }}>
          {result.pairTitle}
        </p>
      </Card>

      {/* ふたりの関係性 */}
      <Card className="slide-up-2" as="section">
        <h3
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--rose)',
            marginBottom: 8,
            letterSpacing: 0.5,
          }}
        >
          💫 ふたりの関係性
        </h3>
        <p style={{ fontSize: 14, color: 'var(--t1)', lineHeight: 1.9 }}>
          {result.pairText}
        </p>
      </Card>

      {/* 恋愛スタイル 2 枚 */}
      {result.charaA?.love && (
        <Card className="slide-up-2" as="section">
          <h3
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--t2)',
              marginBottom: 8,
              letterSpacing: 0.5,
            }}
          >
            💕 {result.charaA.name} の恋愛スタイル
          </h3>
          <p style={{ fontSize: 14, color: 'var(--t1)', lineHeight: 1.9 }}>
            {result.charaA.love}
          </p>
        </Card>
      )}

      {result.charaB?.love && (
        <Card className="slide-up-2" as="section">
          <h3
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--t2)',
              marginBottom: 8,
              letterSpacing: 0.5,
            }}
          >
            💕 {result.charaB.name} の恋愛スタイル
          </h3>
          <p style={{ fontSize: 14, color: 'var(--t1)', lineHeight: 1.9 }}>
            {result.charaB.love}
          </p>
        </Card>
      )}

      {/* 深まるヒント */}
      <Card className="slide-up-2" as="section">
        <h3
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--t2)',
            marginBottom: 8,
            letterSpacing: 0.5,
          }}
        >
          🌟 関係性が深まるヒント
        </h3>
        <p style={{ fontSize: 14, color: 'var(--t1)', lineHeight: 1.9 }}>
          {hint}
        </p>
      </Card>

      {/* 気をつけたいこと */}
      <Card className="slide-up-2" as="section">
        <h3
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--t2)',
            marginBottom: 8,
            letterSpacing: 0.5,
          }}
        >
          ⚡ 気をつけたいこと
        </h3>
        <p style={{ fontSize: 14, color: 'var(--t1)', lineHeight: 1.9 }}>
          {caution}
        </p>
      </Card>

      {/* シェアカード（送信側のみ） */}
      {shareCharaId && (
        <Card className="slide-up-2">
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>
            🔗 相手にも見てもらう
          </h3>
          <p
            style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.8, marginBottom: 'var(--sp-4)' }}
          >
            リンクを送ると、相手は自分の星座を選ぶだけでこの相性結果を見られるよ。
          </p>
          <Button variant="secondary" onClick={handleShare} fullWidth>
            {copied ? '✓ リンクをコピーしたよ' : '相性診断のリンクを送る'}
          </Button>
        </Card>
      )}

      {/* 受信側向け CTA */}
      {onExit && (
        <Card className="slide-up-2" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--t1)', fontWeight: 700, marginBottom: 6 }}>
            夢占いや星座占いも無料で試せるよ
          </p>
          <p
            style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.8, marginBottom: 'var(--sp-4)' }}
          >
            あなたのキャラがわかる自分診断もできるよ。
          </p>
          <Button onClick={onExit} fullWidth>
            無料で試してみる
          </Button>
        </Card>
      )}

      {/* 送信側ナビゲーションボタン */}
      {(onReset || onNavigate) && (
        <div style={{ display: 'flex', gap: 8 }}>
          {onReset && (
            <Button variant="secondary" onClick={onReset} style={{ flex: 1 }}>
              別の人と試す
            </Button>
          )}
          {onNavigate && (
            <Button
              variant="secondary"
              onClick={() => onNavigate('fortune')}
              style={{ flex: 1 }}
            >
              自分のキャラを知る
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
