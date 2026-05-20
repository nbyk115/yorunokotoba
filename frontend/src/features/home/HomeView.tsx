import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CharaAvatar } from '@/components/ui/CharaAvatar';
import { InstallPrompt } from '@/components/InstallPrompt';
import { PremiumCard } from '@/components/PremiumCard';
import { DREAM_TYPES } from '@/data/dreamTypes';
import type { UserProfile } from '@/lib/firestore';
import type { ViewKey } from '@/App';

interface HomeViewProps {
  profile: UserProfile;
  onNavigate: (view: ViewKey) => void;
}


export function HomeView({ profile, onNavigate }: HomeViewProps) {
  const greeting = getGreeting();

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
            ぜんぶで24タイプ。あなたがどのキャラか、診断してみてね。
          </p>
          <div
            className="no-scrollbar"
            style={{
              display: 'flex',
              gap: 14,
              overflowX: 'auto',
              overflowY: 'visible',
              paddingTop: 24,
              paddingBottom: 24,
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {DREAM_TYPES.map((chara) => (
              <div
                key={chara.id}
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
              </div>
            ))}
          </div>
        </div>

        {/* Compatibility entry: also a horoscope-based reading, kept in this card */}
        <div
          style={{
            marginTop: 'var(--sp-5)',
            paddingTop: 'var(--sp-5)',
            borderTop: '1px solid var(--border)',
          }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--lavender)', marginBottom: 4 }}>
            💞 あの人との相性診断
          </h3>
          <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.7, marginBottom: 12 }}>
            気になるあの人と、ふたりの相性を星座でよみとくよ。結果はリンクで相手にも送れる。無料で何度でも試せるよ。
          </p>
          <Button variant="secondary" onClick={() => onNavigate('compatibility')} fullWidth>
            相性を診断する
          </Button>
        </div>
      </Card>

      <div className="slide-up-3">
        <PremiumCard onNavigate={onNavigate} />
      </div>

      <InstallPrompt />
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
