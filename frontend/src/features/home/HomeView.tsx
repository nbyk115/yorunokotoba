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
 * Premium features previewed on the home screen. This card is a generic
 * premium teaser (not a single-feature pitch): it lists every premium feature
 * so the home screen sells the whole upgrade, then routes to 'archive' where
 * the full premium teaser lives.
 */
const PREMIUM_FEATURES = [
  {
    icon: '📈',
    title: '月ごとの夢の傾向分析',
    desc: 'ためた夢の記録から、月ごとの心の傾向やくり返すパターンを読み解くよ。',
  },
  {
    icon: '🔭',
    title: 'ホロスコープの深い分析',
    desc: '無料の太陽星座リーディングより踏み込んだ、もっと詳しい自己分析が見られるよ。',
  },
] as const;

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
        <Button onClick={() => onNavigate('fortune')} fullWidth>
          ほんとうの自分を星から知る
        </Button>

        {/* Type lineup carousel: same destination as the CTA above */}
        <div
          style={{
            marginTop: 'var(--sp-5)',
            paddingTop: 'var(--sp-5)',
            borderTop: '1px solid var(--border)',
          }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--lavender)', marginBottom: 4 }}>
            あなたはどのタイプ？
          </h3>
          <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.7, marginBottom: 12 }}>
            12星座それぞれにキャラがいるよ。あなたがどのタイプか見てみて。
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
                role="button"
                tabIndex={0}
                onClick={() => onNavigate('fortune')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onNavigate('fortune');
                  }
                }}
                style={{
                  flexShrink: 0,
                  width: 84,
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                <CharaAvatar id={chara.id} size={72} animate sparkle={chara.rarity === 'SSR'} />
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
        </div>
      </Card>

      <Card
        className="slide-up-3"
        style={{
          background: 'linear-gradient(135deg, rgba(176, 138, 207, 0.10), rgba(232, 98, 124, 0.08))',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 18 }}>🔒</span>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>プレミアムで、もっと深く</h2>
        </div>
        <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.8, marginBottom: 'var(--sp-4)' }}>
          無料の占いより一歩踏み込んだ、あなただけの深いリーディング。プレミアムでこんなことができるよ。
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            marginBottom: 'var(--sp-4)',
          }}
        >
          {PREMIUM_FEATURES.map((f) => (
            <div
              key={f.title}
              style={{
                display: 'flex',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 'var(--r-button)',
                background: 'var(--card-solid)',
                border: '1px solid var(--border)',
              }}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }}>{f.icon}</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>{f.title}</p>
                <p style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.7, marginTop: 2 }}>
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Button variant="secondary" onClick={() => onNavigate('archive')} fullWidth>
          ✨ プレミアムを見る
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
