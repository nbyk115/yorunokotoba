import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CharaAvatar } from '@/components/ui/CharaAvatar';
import { SIGNS } from '@/data/signs';
import { getSignCharacter } from '@/logic/horoscope';
import {
  calculateCompatibility,
  getRankPrefix,
  getRankColor,
  type CompatibilityResult,
} from './compatibilityLogic';
import { track } from '@/lib/analytics';
import type { UserProfile } from '@/lib/firestore';
import type { ViewKey } from '@/App';

interface CompatibilityViewProps {
  profile: UserProfile;
  onNavigate: (view: ViewKey) => void;
}

type Stage = 'input' | 'result';

/**
 * 相性診断（送信側）。
 * 自分のキャラと相手のキャラの相性を診断し、結果を表示する。
 * 無料機能（プレミアムゲートなし）。
 */
export function CompatibilityView({ profile, onNavigate }: CompatibilityViewProps) {
  const [stage, setStage] = useState<Stage>('input');
  const [partnerSign, setPartnerSign] = useState('');
  const [result, setResult] = useState<CompatibilityResult | null>(null);

  const myChara = getSignCharacter(profile.sign);

  function handleConfirm() {
    if (!partnerSign) return;
    const partnerChara = getSignCharacter(partnerSign);
    const r = calculateCompatibility(myChara.id, partnerChara.id);
    setResult(r);
    setStage('result');
    track('compatibility_start', { my_sign: profile.sign, partner_sign: partnerSign });
    track('compatibility_complete', {
      my_sign: profile.sign,
      partner_sign: partnerSign,
      rank: r.rank,
      my_chara: myChara.id,
      partner_chara: partnerChara.id,
    });
  }

  function handleReset() {
    setStage('input');
    setResult(null);
    setPartnerSign('');
  }

  if (stage === 'result' && result) {
    return (
      <ResultScreen
        result={result}
        myCharaId={myChara.id}
        onReset={handleReset}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <InputScreen
      profile={profile}
      myCharaId={myChara.id}
      partnerSign={partnerSign}
      setPartnerSign={setPartnerSign}
      onConfirm={handleConfirm}
    />
  );
}

// ─────────────────────────────────────────────
// 入力ページ
// ─────────────────────────────────────────────

interface InputProps {
  profile: UserProfile;
  myCharaId: string;
  partnerSign: string;
  setPartnerSign: (s: string) => void;
  onConfirm: () => void;
}

function InputScreen({ profile, myCharaId, partnerSign, setPartnerSign, onConfirm }: InputProps) {
  return (
    <div
      className="slide-up"
      style={{ padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}
    >
      <header style={{ textAlign: 'center', marginBottom: 'var(--sp-3)' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--rose)' }}>💞 相性診断</h2>
        <p style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4 }}>
          星座でふたりの相性をよみとくよ
        </p>
      </header>

      <Card className="slide-up-1" style={{ textAlign: 'center' }}>
        <CharaAvatar id={myCharaId} size={84} animate />
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginTop: 8 }}>
          あなた: {profile.sign}
        </p>
        <p style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>
          {getSignCharacter(profile.sign).name}
        </p>
      </Card>

      <Card className="slide-up-2">
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>
          気になるあの人の星座
        </h3>
        <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.8, marginBottom: 'var(--sp-4)' }}>
          相手の星座を選んで、ふたりの相性を見てみよう。
        </p>
        <select
          value={partnerSign}
          onChange={(e) => setPartnerSign(e.target.value)}
          aria-label="相手の星座を選ぶ"
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

        <Button onClick={onConfirm} disabled={!partnerSign} fullWidth>
          相性を見てみる
        </Button>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// 結果ページ
// ─────────────────────────────────────────────

interface ResultProps {
  result: CompatibilityResult;
  myCharaId: string;
  onReset: () => void;
  onNavigate: (view: ViewKey) => void;
}

function ResultScreen({ result, myCharaId, onReset, onNavigate }: ResultProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}${window.location.pathname}?compat=${encodeURIComponent(
      myCharaId,
    )}`;
    const text = `わたしとあなたの相性、見てみて💞 ${url}`;
    track('compatibility_share', { my_chara: myCharaId, rank: result.rank });
    try {
      if (navigator.share) {
        await navigator.share({ title: 'よるのことば 相性診断', text, url });
        return;
      }
    } catch {
      /* share キャンセルや非対応はコピーにフォールバック */
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard 非対応環境 */
    }
  }

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

      <Card className="slide-up-2">
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>
          🔗 相手にも見てもらう
        </h3>
        <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.8, marginBottom: 'var(--sp-4)' }}>
          リンクを送ると、相手は自分の星座を選ぶだけでこの相性結果を見られるよ。
        </p>
        <Button variant="secondary" onClick={handleShare} fullWidth>
          {copied ? '✓ リンクをコピーしたよ' : '相性診断のリンクを送る'}
        </Button>
      </Card>

      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="secondary" onClick={onReset} style={{ flex: 1 }}>
          別の人と試す
        </Button>
        <Button variant="secondary" onClick={() => onNavigate('fortune')} style={{ flex: 1 }}>
          自分のキャラを知る
        </Button>
      </div>
    </div>
  );
}
