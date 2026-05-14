import { useState, useEffect, type CSSProperties } from 'react';
import { HeroBlock } from '@/components/ui/HeroBlock';
import { RitualButton } from '@/components/ui/RitualButton';
import { CharaAvatar } from '@/components/ui/CharaAvatar';
import { CompatibilityCard } from '@/components/ui/CompatibilityCard';
import { SIGNS, getCharaIdBySign } from '@/data/signs';
import { getSafeDreamType } from '@/lib/contentFilter';
import {
  calculateCompatibility,
  getRankPrefix,
  type CompatibilityResult,
} from './compatibilityLogic';
import { track } from '@/lib/analytics';

interface AuraReceiverViewProps {
  /** URL から取得した送信者の charaId */
  fromCharaId: string;
}

export function AuraReceiverView({ fromCharaId }: AuraReceiverViewProps) {
  const [mySign, setMySign] = useState('');
  const [myGender, setMyGender] = useState<'female' | 'male'>('female');
  const [result, setResult] = useState<CompatibilityResult | null>(null);

  const fromChara = getSafeDreamType(fromCharaId);

  useEffect(() => {
    track('compatibility_link_open', {
      from_chara: fromCharaId,
      has_profile: false,
    });
  }, [fromCharaId]);

  const handleConfirm = () => {
    if (!mySign) return;
    const myCharaId = getCharaIdBySign(mySign, myGender);
    const r = calculateCompatibility(fromCharaId, myCharaId);
    setResult(r);
    track('compatibility_start', {
      my_sign: mySign,
      partner_sign: '(from-link)',
      via: 'share_link',
    });
    setTimeout(() => {
      track('compatibility_complete', {
        my_sign: mySign,
        partner_sign: '(from-link)',
        rank: r.rank,
        my_chara: myCharaId,
        partner_chara: fromCharaId,
      });
    }, 1200);
  };

  const sectionStyle: CSSProperties = {
    padding: '0 24px 32px',
  };

  const eyebrowStyle: CSSProperties = {
    fontFamily: 'var(--font-accent)',
    fontStyle: 'italic',
    fontSize: 11,
    color: 'var(--lavender)',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    margin: '24px 0 8px',
  };

  const h2Style: CSSProperties = {
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--t1)',
    margin: '0 0 8px',
    letterSpacing: '0.02em',
  };

  const fromInfoStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    marginBottom: 24,
  };

  const fieldStyle: CSSProperties = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: '14px 16px',
    marginBottom: 12,
  };

  const labelStyle: CSSProperties = {
    fontSize: 11,
    color: 'var(--t3)',
    letterSpacing: '0.06em',
    margin: '0 0 6px',
    fontWeight: 600,
  };

  const selectStyle: CSSProperties = {
    width: '100%',
    minHeight: 44,
    padding: '10px 12px',
    background: 'transparent',
    border: 'none',
    color: 'var(--t1)',
    fontSize: 15,
    fontFamily: 'var(--font-heading)',
    outline: 'none',
    cursor: 'pointer',
  };

  const genderToggleStyle: CSSProperties = {
    display: 'flex',
    gap: 8,
    marginBottom: 24,
  };

  const genderBtnStyle = (active: boolean): CSSProperties => ({
    flex: 1,
    minHeight: 44,
    padding: '10px 16px',
    borderRadius: 10,
    border: `1px solid ${active ? 'var(--rose)' : 'var(--border)'}`,
    background: active ? 'rgba(240, 128, 154, 0.12)' : 'transparent',
    color: active ? 'var(--rose)' : 'var(--t2)',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 200ms ease',
  });

  if (result) {
    return (
      <div className="slide-up">
        <section style={{ padding: '32px 24px', textAlign: 'center' }}>
          <p style={eyebrowStyle}>Aura Reading</p>
          <p
            style={{
              fontFamily: 'var(--font-accent)',
              fontStyle: 'italic',
              fontSize: 56,
              fontWeight: 300,
              margin: '0 0 4px',
              color:
                result.rank === 'best'
                  ? '#E8C068'
                  : result.rank === 'good'
                    ? '#B08ACF'
                    : '#F0809A',
            }}
          >
            {getRankPrefix(result.rank)}
          </p>
          <p
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--t1)',
              margin: '0 0 16px',
              letterSpacing: '0.06em',
            }}
          >
            {result.rankLabel}
          </p>
          <p style={{ fontSize: 14, color: 'var(--t2)', margin: '0 0 20px' }}>
            {result.pairTitle}
          </p>
          <p
            style={{
              fontSize: 14,
              color: 'var(--t1)',
              lineHeight: 1.9,
              margin: '0 0 32px',
            }}
          >
            {result.pairText}
          </p>

          <CompatibilityCard
            charaIdA={result.charaA?.id ?? ''}
            charaIdB={result.charaB?.id ?? ''}
            rank={result.rank}
            rankLabel={result.rankLabel}
            pairText={result.pairText}
            pairTitle={result.pairTitle}
          />

          <div style={{ height: 1, background: 'var(--border)', margin: '24px auto', maxWidth: 240 }} />

          <p style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 12 }}>
            あなたも自分の守護キャラを見つけてみる？
          </p>
          <button
            type="button"
            style={{
              minHeight: 48,
              padding: '12px 24px',
              background: 'linear-gradient(135deg, var(--rose), var(--pink))',
              border: 'none',
              borderRadius: 12,
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
            }}
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/';
              }
            }}
          >
            よるのことばを始める
          </button>
        </section>
      </div>
    );
  }

  return (
    <div>
      <HeroBlock
        english="A message from the stars"
        japanese="星があなたに届けた縁"
        align="center"
        size="hero"
        charaId={fromCharaId}
        charaSize={120}
      />

      <section style={sectionStyle}>
        <div style={fromInfoStyle}>
          <CharaAvatar id={fromCharaId} size={48} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, color: 'var(--t3)', margin: '0 0 4px' }}>
              FROM
            </p>
            <p style={{ fontSize: 13, color: 'var(--t2)', margin: 0, lineHeight: 1.6 }}>
              {fromChara?.name ?? '夜のひと'}の守護キャラが、
              <br />
              あなたとの相性を占っています
            </p>
          </div>
        </div>

        <p style={eyebrowStyle}>Compatibility Reading</p>
        <h2 style={h2Style}>あなたの星座を選んで</h2>

        <div style={fieldStyle}>
          <p style={labelStyle}>YOUR SIGN</p>
          <select
            value={mySign}
            onChange={(e) => setMySign(e.target.value)}
            style={selectStyle}
            aria-label="あなたの星座を選ぶ"
          >
            <option value="">星座を選んで</option>
            {SIGNS.map((s) => (
              <option key={s.k} value={s.k}>
                {s.icon} {s.k}
              </option>
            ))}
          </select>
        </div>

        <p style={{ ...labelStyle, margin: '16px 0 6px' }}>YOUR GENDER</p>
        <div style={genderToggleStyle}>
          <button
            type="button"
            style={genderBtnStyle(myGender === 'female')}
            onClick={() => setMyGender('female')}
          >
            女性
          </button>
          <button
            type="button"
            style={genderBtnStyle(myGender === 'male')}
            onClick={() => setMyGender('male')}
          >
            男性
          </button>
        </div>

        <RitualButton
          verb="結果を見る"
          onConfirm={handleConfirm}
          disabled={!mySign}
          fullWidth
        />
      </section>
    </div>
  );
}
