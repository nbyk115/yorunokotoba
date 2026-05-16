import { useState, type CSSProperties } from 'react';
import { HeroBlock } from '@/components/ui/HeroBlock';
import { RitualButton } from '@/components/ui/RitualButton';
import { CompatibilityCard } from '@/components/ui/CompatibilityCard';
import { PremiumCTA } from '@/components/ui/PremiumCTA';
import { useCurrentUser } from '@/lib/auth';
import { SIGNS, getCharaIdBySign } from '@/data/signs';
import {
  calculateCompatibility,
  getRankPrefix,
  type CompatibilityResult,
} from './compatibilityLogic';
import { track } from '@/lib/analytics';
import type { UserProfile } from '@/lib/firestore';
import type { ViewKey } from '@/App';

interface AuraViewProps {
  profile: UserProfile;
  onNavigate: (view: ViewKey) => void;
}

type Stage = 'input' | 'result';

export function AuraView({ profile, onNavigate }: AuraViewProps) {
  const [stage, setStage] = useState<Stage>('input');
  const [partnerSign, setPartnerSign] = useState('');
  const [partnerGender, setPartnerGender] = useState<'female' | 'male'>('female');
  const [result, setResult] = useState<CompatibilityResult | null>(null);

  const myCharaId = getCharaIdBySign(profile.sign, profile.gender);

  const handleConfirm = () => {
    if (!partnerSign) return;
    const partnerCharaId = getCharaIdBySign(partnerSign, partnerGender);
    const r = calculateCompatibility(myCharaId, partnerCharaId);
    setResult(r);
    setStage('result');
    track('compatibility_start', {
      my_sign: profile.sign,
      partner_sign: partnerSign,
      via: 'direct',
    });
    // 結果表示完了タイミングで complete イベント
    setTimeout(() => {
      track('compatibility_complete', {
        my_sign: profile.sign,
        partner_sign: partnerSign,
        rank: r.rank,
        my_chara: myCharaId,
        partner_chara: partnerCharaId,
      });
    }, 1200);
  };

  const handleReset = () => {
    setStage('input');
    setResult(null);
    setPartnerSign('');
  };

  if (stage === 'result' && result) {
    return (
      <ResultScreen
        profile={profile}
        result={result}
        onReset={handleReset}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <InputScreen
      profile={profile}
      partnerSign={partnerSign}
      setPartnerSign={setPartnerSign}
      partnerGender={partnerGender}
      setPartnerGender={setPartnerGender}
      onConfirm={handleConfirm}
    />
  );
}

// ─────────────────────────────────────────────
// Screen 1: 入力ページ
// ─────────────────────────────────────────────

interface InputProps {
  profile: UserProfile;
  partnerSign: string;
  setPartnerSign: (s: string) => void;
  partnerGender: 'female' | 'male';
  setPartnerGender: (g: 'female' | 'male') => void;
  onConfirm: () => void;
}

function InputScreen({
  profile,
  partnerSign,
  setPartnerSign,
  partnerGender,
  setPartnerGender,
  onConfirm,
}: InputProps) {
  const myCharaId = getCharaIdBySign(profile.sign, profile.gender);

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

  const bodyStyle: CSSProperties = {
    fontSize: 13,
    color: 'var(--t2)',
    lineHeight: 1.8,
    margin: '0 0 24px',
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

  const valueStyle: CSSProperties = {
    fontSize: 15,
    color: 'var(--t1)',
    fontWeight: 700,
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

  return (
    <div>
      <HeroBlock
        english="How you two fit"
        japanese="あの人との相性、見てみる？"
        align="center"
        size="hero"
        charaId={myCharaId}
        charaSize={120}
      />

      <section style={sectionStyle}>
        <p style={eyebrowStyle}>相性占い</p>
        <h2 style={h2Style}>気になるあの人との相性</h2>
        <p style={bodyStyle}>
          星座でふたりの相性を診断するよ。
        </p>

        <div style={fieldStyle}>
          <p style={labelStyle}>自分の星座</p>
          <p style={valueStyle}>
            ✦ {profile.sign}
          </p>
        </div>

        <div style={fieldStyle}>
          <p style={labelStyle}>相手の星座</p>
          <select
            value={partnerSign}
            onChange={(e) => setPartnerSign(e.target.value)}
            style={selectStyle}
            aria-label="相手の星座を選ぶ"
          >
            <option value="">星座を選んで</option>
            {SIGNS.map((s) => (
              <option key={s.k} value={s.k}>
                {s.icon} {s.k}
              </option>
            ))}
          </select>
        </div>

        <p style={{ ...labelStyle, margin: '16px 0 6px' }}>相手の性別</p>
        <div style={genderToggleStyle}>
          <button
            type="button"
            style={genderBtnStyle(partnerGender === 'female')}
            onClick={() => setPartnerGender('female')}
          >
            女性
          </button>
          <button
            type="button"
            style={genderBtnStyle(partnerGender === 'male')}
            onClick={() => setPartnerGender('male')}
          >
            男性
          </button>
        </div>

        <RitualButton
          verb="相性を見てみる"
          onConfirm={onConfirm}
          disabled={!partnerSign}
          fullWidth
        />
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────
// Screen 2: 結果ページ
// ─────────────────────────────────────────────

interface ResultProps {
  profile: UserProfile;
  result: CompatibilityResult;
  onReset: () => void;
  onNavigate: (view: ViewKey) => void;
}

function ResultScreen({ profile, result, onReset, onNavigate }: ResultProps) {
  const { userId } = useCurrentUser();
  const myCharaId = getCharaIdBySign(profile.sign, profile.gender);

  const sectionStyle: CSSProperties = {
    padding: '32px 24px',
    textAlign: 'center',
  };

  const eyebrowStyle: CSSProperties = {
    fontFamily: 'var(--font-accent)',
    fontStyle: 'italic',
    fontSize: 11,
    color: 'var(--lavender)',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    margin: '0 0 12px',
  };

  const rankStyle: CSSProperties = {
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
  };

  const rankLabelStyle: CSSProperties = {
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--t1)',
    margin: '0 0 16px',
    letterSpacing: '0.06em',
  };

  const pairTitleStyle: CSSProperties = {
    fontSize: 14,
    color: 'var(--t2)',
    margin: '0 0 20px',
    letterSpacing: '0.04em',
  };

  const pairTextStyle: CSSProperties = {
    fontSize: 14,
    color: 'var(--t1)',
    lineHeight: 1.9,
    margin: '0 0 32px',
    padding: '0 8px',
  };

  const dividerStyle: CSSProperties = {
    height: 1,
    background: 'var(--border)',
    margin: '24px auto',
    maxWidth: 240,
  };

  const ghostBtnStyle: CSSProperties = {
    minHeight: 48,
    padding: '12px 24px',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 12,
    color: 'var(--t2)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    margin: '4px',
    fontFamily: 'var(--font-heading)',
  };

  return (
    <div className="slide-up">
      <section style={sectionStyle}>
        <p style={eyebrowStyle}>相性診断 · 無料</p>

        <p style={rankStyle}>{getRankPrefix(result.rank)}</p>
        <p style={rankLabelStyle}>{result.rankLabel}</p>
        <p style={pairTitleStyle}>{result.pairTitle}</p>

        <p style={pairTextStyle}>{result.pairText}</p>

        <CompatibilityCard
          charaIdA={result.charaA?.id ?? ''}
          charaIdB={result.charaB?.id ?? ''}
          rank={result.rank}
          rankLabel={result.rankLabel}
          pairText={result.pairText}
          pairTitle={result.pairTitle}
          signLabel={`${profile.sign} · ${profile.name}`}
          fromCharaId={myCharaId}
        />

        <div style={dividerStyle} aria-hidden="true" />

        {/* 感情ピーク時の課金導線（growth-hacker 提案） */}
        <div style={{ textAlign: 'left', padding: '0 8px' }}>
          <PremiumCTA
            source="aura_result"
            userId={userId}
            headline="ふたりの相性、もっと深く"
            description="キャラクターからのメッセージで、ふたりの相性をもっと深く読めるよ"
          />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginTop: 16 }}>
          <button
            type="button"
            style={ghostBtnStyle}
            onClick={onReset}
          >
            別の人と試す
          </button>
          <button
            type="button"
            style={ghostBtnStyle}
            onClick={() => onNavigate('fortune')}
          >
            自分のキャラクターをもっと知る
          </button>
        </div>
      </section>
    </div>
  );
}
