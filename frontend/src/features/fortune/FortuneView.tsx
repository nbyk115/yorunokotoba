import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { generateFortune, type FortuneResult } from '@/logic/fortune';
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
          {profile.sign} · {profile.name}
        </p>
      </header>

      <Card
        style={{
          background: `linear-gradient(135deg, ${rankColors[result.rank]}22, transparent)`,
          borderLeft: `4px solid ${rankColors[result.rank]}`,
        }}
      >
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)' }}>今日の運勢</p>
        <h3 style={{ fontSize: 36, fontWeight: 700, color: rankColors[result.rank], marginTop: 4 }}>
          {result.rank}
        </h3>
        <p style={{ fontSize: 14, color: 'var(--t1)', marginTop: 8, lineHeight: 1.8 }}>
          {result.summary}
        </p>
        <div style={{ display: 'flex', gap: 16, marginTop: 'var(--sp-4)', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 140px' }}>
            <p style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 700 }}>🕐 ラッキータイム</p>
            <p style={{ fontSize: 13, color: 'var(--t1)', marginTop: 2 }}>{result.time}</p>
          </div>
          <div style={{ flex: '1 1 140px' }}>
            <p style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 700 }}>⚠️ 注意すること</p>
            <p style={{ fontSize: 13, color: 'var(--t1)', marginTop: 2 }}>{result.risk}</p>
          </div>
        </div>
      </Card>

      <Card>
        <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--lavender)', marginBottom: 10 }}>
          今日のあなた
        </h4>
        <p style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.9 }}>{result.personality.trait}</p>
      </Card>

      <Card>
        <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--rose)', marginBottom: 10 }}>💕 恋愛運</h4>
        <p style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.9 }}>{result.personality.love}</p>
        <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.8, marginTop: 10 }}>
          {result.dailyLove}
        </p>
      </Card>

      <Card>
        <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold)', marginBottom: 10 }}>⚡ 仕事運</h4>
        <p style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.9 }}>{result.personality.work}</p>
        <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.8, marginTop: 10 }}>
          {result.dailyWork}
        </p>
      </Card>

      <Card>
        <h4 style={{ fontSize: 14, fontWeight: 700, color: '#5BA87C', marginBottom: 10 }}>🌿 健康運</h4>
        <p style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.9 }}>{result.personality.health}</p>
        <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.8, marginTop: 10 }}>
          {result.dailyHealth}
        </p>
      </Card>

      <Card>
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
