import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CharaAvatar } from '@/components/ui/CharaAvatar';
import { RarityBadge } from '@/components/ui/RarityBadge';
import { generateFortune, type FortuneResult } from '@/logic/fortune';
import { SIGNS } from '@/data/signs';
import { track } from '@/lib/analytics';
import type { UserProfile } from '@/lib/firestore';

interface FortuneViewProps {
  profile: UserProfile;
}

const rankColors: Record<string, string> = {
  大吉: '#D4A853',
  中吉: '#B08ACF',
  小吉: '#E8627C',
  吉: '#5BA87C',
  末吉: '#5A9AC0',
};

export function FortuneView({ profile }: FortuneViewProps) {
  const [result, setResult] = useState<FortuneResult | null>(null);

  useEffect(() => {
    track('fortune_start', { sign: profile.sign });
    const r = generateFortune(
      profile.name,
      profile.sign,
      profile.gender === 'male' ? 'male' : 'female',
      parseInt(profile.birthDay, 10) || undefined,
      parseInt(profile.birthMonth, 10) || undefined,
    );
    setResult(r);
    track('fortune_complete', { sign: profile.sign, rank: r.rank });
  }, [profile]);

  const signIcon = SIGNS.find((s) => s.k === profile.sign)?.icon ?? '✨';

  if (!result) {
    return (
      <div style={{ padding: 'var(--sp-6)', textAlign: 'center' }}>
        <p style={{ color: 'var(--t2)' }}>占いを準備中…</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      <header style={{ textAlign: 'center', marginBottom: 'var(--sp-3)' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--rose)' }}>✨ 今日の占い</h2>
        <p style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4 }}>
          {signIcon} {profile.sign} · {profile.name}
        </p>
      </header>

      {/* Hero rank card with character */}
      <div
        className="slide-up"
        style={{
          borderRadius: 'var(--r-card)',
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${rankColors[result.rank]}, ${rankColors[result.rank]}AA)`,
          color: '#fff',
          padding: 'var(--sp-6) var(--sp-5)',
          textAlign: 'center',
          position: 'relative',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
          }}
        >
          <RarityBadge rarity={result.type.rarity} />
        </div>

        <p style={{ fontSize: 11, fontWeight: 700, opacity: 0.85, letterSpacing: 2 }}>今日の運勢</p>
        <h3
          style={{
            fontSize: 48,
            fontWeight: 700,
            letterSpacing: 2,
            marginTop: 4,
            textShadow: '0 2px 12px rgba(0,0,0,0.25)',
          }}
        >
          {result.rank}
        </h3>

        <div style={{ margin: '12px auto 8px' }}>
          <CharaAvatar
            id={result.type.id}
            size={100}
            animate
            border="3px solid rgba(255,255,255,0.35)"
          />
        </div>

        <p style={{ fontSize: 14, fontWeight: 700, marginTop: 8 }}>{result.type.name}</p>
        <p style={{ fontSize: 11, opacity: 0.88, marginTop: 2 }}>{result.type.sub}</p>

        <p style={{ fontSize: 13, marginTop: 'var(--sp-4)', lineHeight: 1.9, textAlign: 'left', opacity: 0.96 }}>
          {result.summary}
        </p>

        <div style={{ display: 'flex', gap: 12, marginTop: 'var(--sp-4)', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 140px', textAlign: 'left' }}>
            <p style={{ fontSize: 10, opacity: 0.75, fontWeight: 700 }}>🕐 ラッキータイム</p>
            <p style={{ fontSize: 12, marginTop: 2, lineHeight: 1.6 }}>{result.time}</p>
          </div>
          <div style={{ flex: '1 1 140px', textAlign: 'left' }}>
            <p style={{ fontSize: 10, opacity: 0.75, fontWeight: 700 }}>⚠️ 注意すること</p>
            <p style={{ fontSize: 12, marginTop: 2, lineHeight: 1.6 }}>{result.risk}</p>
          </div>
        </div>
      </div>

      <Card className="slide-up-1">
        <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--lavender)', marginBottom: 10 }}>
          今日のあなた
        </h4>
        <p style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.9 }}>{result.personality.trait}</p>
      </Card>

      <Card className="slide-up-2">
        <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--rose)', marginBottom: 10 }}>💕 恋愛運</h4>
        <p style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.9 }}>{result.personality.love}</p>
        <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.8, marginTop: 10 }}>
          {result.dailyLove}
        </p>
      </Card>

      <Card className="slide-up-3">
        <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold)', marginBottom: 10 }}>⚡ 仕事運</h4>
        <p style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.9 }}>{result.personality.work}</p>
        <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.8, marginTop: 10 }}>
          {result.dailyWork}
        </p>
      </Card>

      <Card className="slide-up-4">
        <h4 style={{ fontSize: 14, fontWeight: 700, color: '#5BA87C', marginBottom: 10 }}>🌿 健康運</h4>
        <p style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.9 }}>{result.personality.health}</p>
        <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.8, marginTop: 10 }}>
          {result.dailyHealth}
        </p>
      </Card>

      <Card className="slide-up-5">
        <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold)', marginBottom: 10 }}>
          🎁 ラッキー3点
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 13, color: 'var(--t1)' }}>
            <strong style={{ color: result.lucky.color.hex }}>🎨 {result.lucky.color.v}</strong>
            <span style={{ color: 'var(--t2)', marginLeft: 8 }}>{result.lucky.color.reason}</span>
          </p>
          <p style={{ fontSize: 13, color: 'var(--t1)' }}>
            <strong>
              {result.lucky.item.e} {result.lucky.item.v}
            </strong>
            <span style={{ color: 'var(--t2)', marginLeft: 8 }}>{result.lucky.item.reason}</span>
          </p>
          <p style={{ fontSize: 13, color: 'var(--t1)' }}>
            <strong>🔢 ナンバー {result.lucky.num.v}</strong>
            <span style={{ color: 'var(--t2)', marginLeft: 8 }}>{result.lucky.num.reason}</span>
          </p>
        </div>
      </Card>

      <Button
        variant="secondary"
        fullWidth
        onClick={() => {
          if (navigator.share) {
            navigator
              .share({
                title: 'よるのことば',
                text: `${profile.sign}の今日の運勢: ${result.rank}`,
                url: window.location.href,
              })
              .catch(() => undefined);
            track('share_result', { method: 'webshare', type: result.type.id });
          }
        }}
      >
        シェア
      </Button>
    </div>
  );
}
