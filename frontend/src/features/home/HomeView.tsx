import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { UserProfile } from '@/lib/firestore';
import type { ViewKey } from '@/App';

interface HomeViewProps {
  profile: UserProfile;
  onNavigate: (view: ViewKey) => void;
}

export function HomeView({ profile, onNavigate }: HomeViewProps) {
  const greeting = getGreeting();
  return (
    <div style={{ padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      <header style={{ textAlign: 'center', marginBottom: 'var(--sp-3)' }}>
        <p style={{ fontSize: 12, color: 'var(--t2)' }}>{greeting}</p>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--rose)',
            letterSpacing: 1,
            marginTop: 4,
          }}
        >
          {profile.name}さん、こんばんは
        </h1>
        <p style={{ fontSize: 12, color: 'var(--t3)', marginTop: 4 }}>
          {profile.sign}
        </p>
      </header>

      <Card>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>
          🌙 今夜の夢を読み解く
        </h2>
        <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.8, marginBottom: 'var(--sp-4)' }}>
          見た夢をそのまま書いて。シンボルから今のあなたへのメッセージを読み解くよ。
        </p>
        <Button onClick={() => onNavigate('dream')} fullWidth>
          夢占いを始める
        </Button>
      </Card>

      <Card>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>
          ✨ 今日の運勢
        </h2>
        <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.8, marginBottom: 'var(--sp-4)' }}>
          {profile.sign}の今日のラッキーアイテム、注意点、行動指針が分かるよ。
        </p>
        <Button variant="secondary" onClick={() => onNavigate('fortune')} fullWidth>
          星座占いを見る
        </Button>
      </Card>

      <Card>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>
          📖 履歴を振り返る
        </h2>
        <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.8, marginBottom: 'var(--sp-4)' }}>
          過去に見た夢のパターンから、自分の傾向が見えてくる。
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
