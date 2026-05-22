import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CharaAvatar } from '@/components/ui/CharaAvatar';
import { SIGNS, getSignIndex } from '@/data/signs';
import { PREFECTURES } from '@/data/prefectures';
import { getProfileCharacter } from '@/logic/horoscope';
import { getDreamTypeById } from '@/data/dreamTypes';
import { calculateCompatibility, type CompatibilityResult } from './compatibilityLogic';
import { CompatibilityResultScreen } from './CompatibilityResultScreen';
import { track } from '@/lib/analytics';
import type { UserProfile } from '@/lib/firestore';

interface CompatibilityReceiverViewProps {
  /** URL から取得した送信者のキャラID */
  fromCharaId: string;
  /** 通常のアプリ画面に戻る */
  onExit: () => void;
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

/**
 * 相性診断（受信側）。
 * 共有リンクから開かれ、受け取った相手が自分の生年月日・性別・出生地を入れて
 * 送信者との相性結果を見る。キャラ決定はホロスコープ診断と同じ getProfileCharacter
 * に統一（星座のみの簡易割り当てはしない）。無料機能。
 */
export function CompatibilityReceiverView({ fromCharaId, onExit }: CompatibilityReceiverViewProps) {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [prefecture, setPrefecture] = useState('');
  const [result, setResult] = useState<CompatibilityResult | null>(null);

  const fromChara = getDreamTypeById(fromCharaId);

  useEffect(() => {
    track('compatibility_link_open', { from_chara: fromCharaId });
  }, [fromCharaId]);

  const m = parseInt(month, 10);
  const d = parseInt(day, 10);
  const ready = !!(year && m && d && gender && prefecture);
  const mySign = ready ? SIGNS[getSignIndex(m, d)]?.k ?? null : null;

  function handleConfirm() {
    if (!ready || !mySign) return;
    const myProfile: UserProfile = {
      name: 'あなた',
      sign: mySign,
      birthYear: year,
      birthMonth: month,
      birthDay: day,
      gender,
      prefecture,
    };
    const myChara = getProfileCharacter(myProfile);
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
    return <CompatibilityResultScreen result={result} onExit={onExit} />;
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
          あなたのことを教えて
        </h3>
        <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.8, marginBottom: 'var(--sp-4)' }}>
          生年月日・性別・出生地を入れると、ふたりの相性が見られるよ。
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
              aria-label="あなたの出生地"
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
          結果を見る
        </Button>
      </Card>
    </div>
  );
}
