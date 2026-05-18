import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CharaAvatar } from '@/components/ui/CharaAvatar';
import { DREAM_TYPES } from '@/data/dreamTypes';
import { makeSeededRandom, getDailySeed } from '@/logic/hash';
import type { UserProfile } from '@/lib/firestore';
import type { ViewKey } from '@/App';

interface HomeViewProps {
  profile: UserProfile;
  onNavigate: (view: ViewKey) => void;
}

function pickDailyCharacters(count: number): typeof DREAM_TYPES {
  const rng = makeSeededRandom(getDailySeed(42));
  const arr = [...DREAM_TYPES];
  // Fisher-Yates shuffle using seeded RNG
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr.slice(0, count) as unknown as typeof DREAM_TYPES;
}

export function HomeView({ profile, onNavigate }: HomeViewProps) {
  const greeting = getGreeting();
  const todaysChars = pickDailyCharacters(6);

  return (
    <div
      className="slide-up"
      style={{ padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}
    >
      <header style={{ textAlign: 'center', marginBottom: 'var(--sp-3)' }}>
        <p style={{ fontSize: 12, color: 'var(--t2)' }}>{greeting}</p>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--rose)',
            letterSpacing: 1,
            marginTop: 4,
          }}
        >
          {profile.name}さん
        </h2>
        <p style={{ fontSize: 12, color: 'var(--t3)', marginTop: 4 }}>{profile.sign}</p>
      </header>

      <Card className="slide-up-1">
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>
          🌙 今夜の夢を読み解く
        </h2>
        <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.8, marginBottom: 'var(--sp-4)' }}>
          見た夢をそのまま書いて。今のあなたへのメッセージを読み解くよ。
        </p>
        <Button onClick={() => onNavigate('dream')} fullWidth>
          夢占いを始める
        </Button>
      </Card>

      <Card className="slide-up-2">
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>
          ✨ ホロスコープで自分を知る
        </h2>
        <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.8, marginBottom: 'var(--sp-4)' }}>
          {profile.sign}の生まれ持った性格、強み、伸びしろ、人生のテーマ。星座からほんとうの自分を深く知れるよ。
        </p>
        <Button variant="secondary" onClick={() => onNavigate('fortune')} fullWidth>
          自分を知るリーディングを見る
        </Button>
      </Card>

      {/* Character carousel */}
      <Card className="slide-up-3">
        <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--lavender)', marginBottom: 12 }}>
          今日出会えるかもしれないキャラ
        </h2>
        <div
          className="no-scrollbar"
          style={{
            display: 'flex',
            gap: 14,
            overflowX: 'auto',
            paddingBottom: 6,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {todaysChars.map((c) => (
            <div
              key={c.id}
              style={{
                flexShrink: 0,
                width: 84,
                textAlign: 'center',
              }}
            >
              <CharaAvatar id={c.id} size={72} />
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--t1)',
                  marginTop: 6,
                  lineHeight: 1.4,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {c.name}
              </p>
              <p style={{ fontSize: 9, color: 'var(--t3)', marginTop: 2 }}>{c.rarity}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="slide-up-4">
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>
          📖 履歴を振り返る
        </h2>
        <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.8, marginBottom: 'var(--sp-4)' }}>
          過去に見た夢の記録をいつでも読み返せるよ。月ごとの傾向分析はプレミアム機能。
        </p>
        <Button variant="ghost" onClick={() => onNavigate('archive')} fullWidth>
          履歴を見る
        </Button>
      </Card>
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return '深夜、おつかれさま';
  if (h < 11) return 'おはよう';
  if (h < 17) return 'こんにちは';
  if (h < 22) return 'こんばんは';
  return 'おやすみ前に';
}
