import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CharaAvatar } from '@/components/ui/CharaAvatar';
import { SIGNS } from '@/data/signs';
import { getSignCharacter } from '@/logic/horoscope';
import type { UserProfile } from '@/lib/firestore';
import type { ViewKey } from '@/App';

interface HomeViewProps {
  profile: UserProfile;
  onNavigate: (view: ViewKey) => void;
}

/**
 * The 12 sign-type characters shown in the "あなたはどのタイプ？" lineup.
 * One character per zodiac sign, deterministic (same as the
 * self-understanding reading outcome).
 */
function getTypeLineup() {
  return SIGNS.map((s) => ({ sign: s.k, chara: getSignCharacter(s.k) }));
}

export function HomeView({ profile, onNavigate }: HomeViewProps) {
  const greeting = getGreeting();
  const typeLineup = getTypeLineup();

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

      {/* Type lineup carousel: entry point to the self-understanding reading */}
      <div
        className="slide-up-3"
        role="button"
        tabIndex={0}
        onClick={() => onNavigate('fortune')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onNavigate('fortune');
          }
        }}
        style={{ cursor: 'pointer' }}
      >
        <Card>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--lavender)', marginBottom: 4 }}>
            あなたはどのタイプ？
          </h2>
          <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.7, marginBottom: 12 }}>
            あなたがどのタイプか、星座から診断できるよ。タップして自分のタイプを見てみて。
          </p>
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
            {typeLineup.map(({ sign, chara }) => (
              <div
                key={sign}
                style={{
                  flexShrink: 0,
                  width: 84,
                  textAlign: 'center',
                }}
              >
                <CharaAvatar id={chara.id} size={72} />
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
                  {chara.name}
                </p>
                <p style={{ fontSize: 9, color: 'var(--t3)', marginTop: 2 }}>{sign}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

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
