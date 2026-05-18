import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CharaAvatar } from '@/components/ui/CharaAvatar';
import { SIGNS } from '@/data/signs';
import { getSignCharacter } from '@/logic/horoscope';
import { getDreamTypeById } from '@/data/dreamTypes';
import {
  calculateCompatibility,
  getRankPrefix,
  getRankColor,
  type CompatibilityResult,
} from './compatibilityLogic';
import { track } from '@/lib/analytics';

interface CompatibilityReceiverViewProps {
  /** URL から取得した送信者のキャラID */
  fromCharaId: string;
  /** 通常のアプリ画面に戻る */
  onExit: () => void;
}

/**
 * 相性診断（受信側）。
 * 共有リンクから開かれ、受け取った相手が自分の星座を選んで
 * 送信者との相性結果を見る。無料機能（プレミアムゲートなし）。
 */
export function CompatibilityReceiverView({ fromCharaId, onExit }: CompatibilityReceiverViewProps) {
  const [mySign, setMySign] = useState('');
  const [result, setResult] = useState<CompatibilityResult | null>(null);

  const fromChara = getDreamTypeById(fromCharaId);

  useEffect(() => {
    track('compatibility_link_open', { from_chara: fromCharaId });
  }, [fromCharaId]);

  function handleConfirm() {
    if (!mySign) return;
    const myChara = getSignCharacter(mySign);
    const r = calculateCompatibility(fromCharaId, myChara.id);
    setResult(r);
    track('compatibility_start', { my_sign: mySign, partner_sign: '(from-link)' });
    track('compatibility_complete', {
      my_sign: mySign,
      partner_sign: '(from-link)',
      rank: r.rank,
      my_chara: myChara.id,
      partner_chara: fromCharaId,
    });
  }

  if (result) {
    return (
      <div
        className="slide-up"
        style={{ padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}
      >
        <header style={{ textAlign: 'center', marginBottom: 'var(--sp-3)' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--rose)' }}>💞 相性診断</h2>
          <p style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4 }}>無料の相性占い</p>
        </header>

        <Card className="slide-up-1" style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
              marginBottom: 'var(--sp-4)',
            }}
          >
            {result.charaA && <CharaAvatar id={result.charaA.id} size={72} animate />}
            <span style={{ fontSize: 20, color: 'var(--t3)' }}>×</span>
            {result.charaB && <CharaAvatar id={result.charaB.id} size={72} animate />}
          </div>

          <p
            style={{
              fontSize: 40,
              fontWeight: 300,
              lineHeight: 1,
              color: getRankColor(result.rank),
            }}
          >
            {getRankPrefix(result.rank)}
          </p>
          <p
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--t1)',
              marginTop: 6,
              letterSpacing: 1,
            }}
          >
            {result.rankLabel}
          </p>
          <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 8 }}>{result.pairTitle}</p>

          <p
            style={{
              fontSize: 13,
              color: 'var(--t1)',
              lineHeight: 1.9,
              marginTop: 'var(--sp-4)',
              padding: '0 4px',
            }}
          >
            {result.pairText}
          </p>
        </Card>

        <Card className="slide-up-2" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.8, marginBottom: 'var(--sp-4)' }}>
            あなたの夢占いや星座占いもやってみる？
          </p>
          <Button onClick={onExit} fullWidth>
            よるのことばを始める
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="slide-up"
      style={{ padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}
    >
      <header style={{ textAlign: 'center', marginBottom: 'var(--sp-3)' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--rose)' }}>💞 相性診断</h2>
        <p style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4 }}>
          あの人から相性占いが届いたよ
        </p>
      </header>

      <Card className="slide-up-1">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <CharaAvatar id={fromCharaId} size={56} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 2 }}>送ってくれた人</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', lineHeight: 1.6 }}>
              {fromChara?.name ?? 'あの人'}が、あなたとの相性を調べてるよ
            </p>
          </div>
        </div>
      </Card>

      <Card className="slide-up-2">
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>
          あなたの星座を選んで
        </h3>
        <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.8, marginBottom: 'var(--sp-4)' }}>
          星座を選ぶだけで、ふたりの相性結果が見られるよ。
        </p>
        <select
          value={mySign}
          onChange={(e) => setMySign(e.target.value)}
          aria-label="あなたの星座を選ぶ"
          style={{
            width: '100%',
            minHeight: 48,
            padding: '12px 14px',
            borderRadius: 'var(--r-input)',
            background: 'var(--card-solid)',
            border: '1px solid var(--border)',
            color: 'var(--t1)',
            fontSize: 15,
            fontFamily: 'var(--font-heading)',
            cursor: 'pointer',
            marginBottom: 'var(--sp-4)',
          }}
        >
          <option value="">星座を選んで</option>
          {SIGNS.map((s) => (
            <option key={s.k} value={s.k}>
              {s.icon} {s.k}
            </option>
          ))}
        </select>

        <Button onClick={handleConfirm} disabled={!mySign} fullWidth>
          結果を見る
        </Button>
      </Card>
    </div>
  );
}
