import { useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CharaAvatar } from '@/components/ui/CharaAvatar';
import { RarityBadge } from '@/components/ui/RarityBadge';
import { PremiumCard } from '@/components/PremiumCard';
import { getHoroscopeReading, getSignIcon, getProfileCharacter } from '@/logic/horoscope';
import { getDailySeed, makeSeededRandom } from '@/logic/hash';
import { track } from '@/lib/analytics';
import type { UserProfile } from '@/lib/firestore';
import type { ViewKey } from '@/App';

/**
 * Deterministic "people who fortuned today" count.
 * Same value all day, changes when the date rolls over.
 * Range is a natural-looking 1,200-3,600.
 */
function getDailyFortuneCount(): number {
  const rand = makeSeededRandom(getDailySeed(7));
  return 1200 + Math.floor(rand() * 2400);
}

/** Rarity flavor line shown with the character result. */
const RARITY_NOTE: Record<'N' | 'R' | 'SR' | 'SSR', string> = {
  SSR: '✨ 最高レアのタイプ。めったに出会えないよ',
  SR: '🌟 レアなタイプ。なかなか出会えないよ',
  R: '💫 ちょっとめずらしいタイプ',
  N: '🍀 親しみやすい定番タイプ',
};

interface FortuneViewProps {
  profile: UserProfile;
  onNavigate: (view: ViewKey) => void;
}

export function FortuneView({ profile, onNavigate }: FortuneViewProps) {
  const reading = useMemo(() => getHoroscopeReading(profile.sign), [profile.sign]);
  const character = useMemo(
    () => getProfileCharacter(profile),
    [profile.birthYear, profile.birthMonth, profile.birthDay, profile.gender, profile.prefecture],
  );
  const signIcon = getSignIcon(profile.sign);
  const fortuneCount = useMemo(() => getDailyFortuneCount(), []);

  useEffect(() => {
    track('fortune_start', { sign: profile.sign });
    track('fortune_complete', { sign: profile.sign });
  }, [profile.sign]);

  return (
    <div style={{ padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      <header style={{ textAlign: 'center', marginBottom: 'var(--sp-3)' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--rose)' }}>
          ✨ ホロスコープで自分を知る
        </h2>
        <p style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4 }}>
          {signIcon} {profile.sign} · {profile.name}さん
        </p>
      </header>

      {/* Social proof: deterministic daily count */}
      <p
        className="slide-up"
        style={{
          textAlign: 'center',
          fontSize: 12,
          color: 'var(--t2)',
          fontWeight: 700,
        }}
      >
        🌙 今日 {fortuneCount.toLocaleString('ja-JP')} 人が自分を知りました
      </p>

      {/* Hero card: sign essence headline */}
      <div
        className="slide-up"
        style={{
          borderRadius: 'var(--r-card)',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, var(--rose), var(--lavender))',
          color: '#fff',
          padding: 'var(--sp-6) var(--sp-5)',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        }}
      >
        <p style={{ fontSize: 11, fontWeight: 700, opacity: 0.85, letterSpacing: 2 }}>
          あなたの星座
        </p>
        <h3
          style={{
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: 1,
            marginTop: 6,
            textShadow: '0 2px 12px rgba(0,0,0,0.25)',
          }}
        >
          {signIcon} {profile.sign}
        </h3>
        <p style={{ fontSize: 14, fontWeight: 700, marginTop: 10, lineHeight: 1.7 }}>
          {reading.headline}
        </p>
        <p style={{ fontSize: 11, opacity: 0.88, marginTop: 6 }}>{reading.element}</p>
      </div>

      {/* Your type: the character that represents this person */}
      <Card className="slide-up-1">
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--lavender)',
            letterSpacing: 1.5,
            textAlign: 'center',
          }}
        >
          あなたのタイプ
        </p>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            marginTop: 12,
          }}
        >
          <CharaAvatar
            id={character.id}
            size={108}
            animate
            sparkle={character.rarity === 'SSR'}
            border="3px solid var(--lavender)"
          />
          <h3
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--rose)',
              marginTop: 4,
              textAlign: 'center',
            }}
          >
            {character.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <RarityBadge rarity={character.rarity} />
            <span style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 700 }}>
              {character.sub}
            </span>
          </div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              marginTop: 2,
              color:
                character.rarity === 'SSR' || character.rarity === 'SR'
                  ? 'var(--rose)'
                  : 'var(--t3)',
            }}
          >
            {RARITY_NOTE[character.rarity]}・このタイプは全体の{character.pct}
          </p>
          <p
            style={{
              fontSize: 13,
              color: 'var(--t1)',
              lineHeight: 1.9,
              marginTop: 6,
            }}
          >
            {character.desc}
          </p>
        </div>
      </Card>

      <Card className="slide-up-2">
        <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--lavender)', marginBottom: 10 }}>
          🌙 あなたの本質
        </h4>
        <p style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.9 }}>{reading.essence}</p>
      </Card>

      <Card className="slide-up-3">
        <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold)', marginBottom: 10 }}>
          ⭐ 生まれ持った強み
        </h4>
        <p style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.9 }}>{reading.strengths}</p>
      </Card>

      <Card className="slide-up-4">
        <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold)', marginBottom: 10 }}>
          🌱 伸びしろと成長のヒント
        </h4>
        <p style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.9 }}>{reading.growth}</p>
      </Card>

      <Card className="slide-up-5">
        <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--rose)', marginBottom: 10 }}>
          💕 人との関わり方
        </h4>
        <p style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.9 }}>{reading.relationship}</p>
      </Card>

      <Card className="slide-up-5">
        <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--lavender)', marginBottom: 10 }}>
          🧭 あなたの人生のテーマ
        </h4>
        <p style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.9 }}>{reading.lifeTheme}</p>
      </Card>

      <Card className="slide-up-5">
        <p style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.8 }}>
          このリーディングは生年月日から導いた太陽星座をもとにしています。出生時刻や出生地は使っていないため、ホロスコープ全体ではなく、太陽星座から見たあなたの基本的な性質をお伝えするものです。
        </p>
      </Card>

      <Button
        variant="secondary"
        fullWidth
        onClick={() => {
          if (navigator.share) {
            navigator
              .share({
                title: 'よるのことば',
                text: `${profile.sign}の自分を知るリーディング: ${reading.headline}`,
                url: window.location.href,
              })
              .catch(() => undefined);
            track('share_result', { method: 'webshare', type: profile.sign });
          }
        }}
      >
        シェア
      </Button>

      <PremiumCard onNavigate={onNavigate} />
    </div>
  );
}
