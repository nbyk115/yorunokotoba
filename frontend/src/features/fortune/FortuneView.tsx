import { useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getHoroscopeReading, getSignIcon } from '@/logic/horoscope';
import { track } from '@/lib/analytics';
import type { UserProfile } from '@/lib/firestore';

interface FortuneViewProps {
  profile: UserProfile;
}

export function FortuneView({ profile }: FortuneViewProps) {
  const reading = useMemo(() => getHoroscopeReading(profile.sign), [profile.sign]);
  const signIcon = getSignIcon(profile.sign);

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

      <Card className="slide-up-1">
        <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--lavender)', marginBottom: 10 }}>
          🌙 あなたの本質
        </h4>
        <p style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.9 }}>{reading.essence}</p>
      </Card>

      <Card className="slide-up-2">
        <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold)', marginBottom: 10 }}>
          ⭐ 生まれ持った強み
        </h4>
        <p style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.9 }}>{reading.strengths}</p>
      </Card>

      <Card className="slide-up-3">
        <h4 style={{ fontSize: 14, fontWeight: 700, color: '#5BA87C', marginBottom: 10 }}>
          🌱 伸びしろと成長のヒント
        </h4>
        <p style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.9 }}>{reading.growth}</p>
      </Card>

      <Card className="slide-up-4">
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
    </div>
  );
}
