import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CharaAvatar } from '@/components/ui/CharaAvatar';
import { SIGNS, getSignIndex } from '@/data/signs';
import { PREFECTURES } from '@/data/prefectures';
import { getProfileCharacter } from '@/logic/horoscope';
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
 * 自分のフルプロフィールから決まるキャラと、相手の生年月日・性別・出生地から
 * 決まるキャラの相性を診断する。無料機能。
 */
export function CompatibilityView({ profile, onNavigate }: CompatibilityViewProps) {
  const [stage, setStage] = useState<Stage>('input');
  const [result, setResult] = useState<CompatibilityResult | null>(null);

  const myChara = getProfileCharacter(profile);

  function handleSubmit(partner: UserProfile) {
    const partnerChara = getProfileCharacter(partner);
    const r = calculateCompatibility(myChara.id, partnerChara.id);
    setResult(r);
    setStage('result');
    track('compatibility_start', { my_sign: profile.sign, partner_sign: partner.sign });
    track('compatibility_complete', {
      my_sign: profile.sign,
      partner_sign: partner.sign,
      rank: r.rank,
      my_chara: myChara.id,
      partner_chara: partnerChara.id,
    });
  }

  function handleReset() {
    setStage('input');
    setResult(null);
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
      myCharaName={myChara.name}
      onSubmit={handleSubmit}
    />
  );
}

// ─────────────────────────────────────────────
// 入力ページ
// ─────────────────────────────────────────────

interface InputProps {
  profile: UserProfile;
  myCharaId: string;
  myCharaName: string;
  onSubmit: (partner: UserProfile) => void;
}

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 'var(--r-input)',
  border: '1px solid var(--border)',
  background: 'var(--bg1)',
  fontSize: 15,
  color: 'var(--t1)',
  fontFamily: 'var(--font-heading)',
} as const;

function InputScreen({ profile, myCharaId, myCharaName, onSubmit }: InputProps) {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [prefecture, setPrefecture] = useState('');

  const m = parseInt(month, 10);
  const d = parseInt(day, 10);
  const ready = !!(year && m && d && gender && prefecture);

  const partnerSign = ready ? SIGNS[getSignIndex(m, d)]?.k ?? null : null;
  const partnerProfile: UserProfile | null =
    ready && partnerSign
      ? {
          name: '相手',
          sign: partnerSign,
          birthYear: year,
          birthMonth: month,
          birthDay: day,
          gender,
          prefecture,
        }
      : null;
  const partnerChara = partnerProfile ? getProfileCharacter(partnerProfile) : null;

  function handleConfirm() {
    if (partnerProfile) onSubmit(partnerProfile);
  }

  return (
    <div
      className="slide-up"
      style={{ padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}
    >
      <header style={{ textAlign: 'center', marginBottom: 'var(--sp-3)' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--rose)' }}>💞 相性診断</h2>
        <p style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4 }}>
          ふたりの誕生日・性別・出生地で深く相性をよみとくよ
        </p>
      </header>

      <Card className="slide-up-1" style={{ textAlign: 'center' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: partnerChara ? 24 : 0,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <CharaAvatar id={myCharaId} size={84} animate />
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>
              あなた: {profile.sign}
            </p>
            <p style={{ fontSize: 11, color: 'var(--t3)' }}>{myCharaName}</p>
          </div>
          {partnerChara && partnerSign && (
            <>
              <span style={{ fontSize: 20, color: 'var(--t3)' }}>×</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <CharaAvatar id={partnerChara.id} size={84} animate />
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>
                  相手: {partnerSign}
                </p>
                <p style={{ fontSize: 11, color: 'var(--t3)' }}>{partnerChara.name}</p>
              </div>
            </>
          )}
        </div>
      </Card>

      <Card className="slide-up-2">
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>
          気になるあの人のこと
        </h3>
        <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.8, marginBottom: 'var(--sp-4)' }}>
          生年月日・性別・出生地を入れて、ふたりの相性を深くよみとこう。
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>
              生年月日
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="年"
                style={inputStyle}
                min={1900}
                max={new Date().getFullYear()}
              />
              <input
                type="number"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                placeholder="月"
                style={inputStyle}
                min={1}
                max={12}
              />
              <input
                type="number"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                placeholder="日"
                style={inputStyle}
                min={1}
                max={31}
              />
            </div>
          </div>

          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>
              性別
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['female', 'male'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 'var(--r-input)',
                    border: `1px solid ${gender === g ? 'var(--rose)' : 'var(--border)'}`,
                    background: gender === g ? 'var(--rose)' : 'var(--card-solid)',
                    color: gender === g ? '#fff' : 'var(--t1)',
                    fontWeight: 700,
                    fontFamily: 'var(--font-heading)',
                    cursor: 'pointer',
                    minHeight: 44,
                  }}
                >
                  {g === 'female' ? '女性' : '男性'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>
              出生地（都道府県）
            </span>
            <select
              value={prefecture}
              onChange={(e) => setPrefecture(e.target.value)}
              aria-label="相手の出生地"
              style={{
                ...inputStyle,
                cursor: 'pointer',
                minHeight: 48,
              }}
            >
              <option value="">選んでね</option>
              {PREFECTURES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button onClick={handleConfirm} disabled={!ready} fullWidth style={{ marginTop: 'var(--sp-4)' }}>
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
