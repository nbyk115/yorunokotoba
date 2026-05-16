/**
 * HomeView — Wave L1 骨格実装
 *
 * レイアウト:
 *   safe-area + 24px → 時間帯あいさつ（左寄せ 0 20px、H2、2行まで）
 *   32px 空け → キャラ 128px 浮遊（中央配置）
 *   24px 空け → 夢占いカード（主役、Card primary、左辺 2px gold line）
 *   28px 空け → 星座占い / これまでの記録 TextLink（中央 13px）
 *   flex-grow → bottom tab bar 56px
 *
 * 廃止: HeroBlock / RitualButton / BlurReveal
 */
import { Card } from '@/components/ui/Card';
import { TextLink } from '@/components/ui/TextLink';
import { CharaAvatar } from '@/components/ui/CharaAvatar';
import { useTimeOfDay } from '@/components/providers/TimeOfDayProvider';
import type { TimeOfDay } from '@/lib/timeOfDay';
import type { UserProfile } from '@/lib/firestore';
import type { ViewKey } from '@/App';
import type { StreakState } from '@/logic/streak';
import { getCharaIdBySign } from '@/data/signs';

interface HomeViewProps {
  profile: UserProfile;
  streak: StreakState;
  onNavigate: (view: ViewKey) => void;
}

// 時間帯あいさつ — 姉貴分の本音トーン (ICP §5-1)
// 識別性ゲート: 「万人向けポジティブ」を断った1行
const GREETING: Record<TimeOfDay, string> = {
  'night-deep': 'まだ起きてるんだ。…まあ、わたしもだけど',
  dawn: 'もう朝が来るね。眠れた?',
  day: 'ちょっと立ち止まってみて',
  dusk: '帰ってきたね。今夜もよく終わらせた',
  night: 'おつかれ。今夜もよく帰ってきたね',
};

export function HomeView({ profile, onNavigate }: HomeViewProps) {
  const tod = useTimeOfDay();
  const greeting = GREETING[tod];
  const charaId = getCharaIdBySign(profile.sign, profile.gender);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100dvh',
        padding: `env(safe-area-inset-top, 24px) 0 0`,
      }}
    >
      {/* 時間帯あいさつ */}
      <section
        style={{
          padding: '24px 20px 0',
          textAlign: 'left',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--fs-section)',
            fontWeight: 700,
            color: 'var(--t1)',
            letterSpacing: 'var(--ls-section)',
            lineHeight: 1.4,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {greeting}
        </h2>
      </section>

      {/* キャラクター 128px 浮遊 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: 32,
        }}
      >
        <CharaAvatar id={charaId} size={128} animate />
      </div>

      {/* 夢占いカード（主役） */}
      <Card
        variant="primary"
        as="article"
        style={{
          margin: '24px 16px 0',
          padding: 24,
          borderLeft: 'var(--card-accent-line)',
          boxShadow: 'var(--shadow-card-primary)',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--fs-card-label)',
            fontWeight: 700,
            color: 'var(--t3)',
            letterSpacing: 'var(--ls-card-label)',
            margin: '0 0 8px',
          }}
        >
          今夜の夢占い
        </p>
        <h3
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--fs-hero-jp)',
            fontWeight: 700,
            color: 'var(--t1)',
            lineHeight: 1.4,
            margin: '0 0 20px',
          }}
        >
          今夜の夢をよみとく
        </h3>
        {/* 控えめな rose のアフォーダンス（テキスト、塗りボタンにしない） */}
        <button
          type="button"
          onClick={() => onNavigate('dream')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--rose)',
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--fs-body)',
            fontWeight: 700,
            padding: '8px 0',
            minHeight: 44,
            letterSpacing: '0.04em',
          }}
        >
          ひらく →
        </button>
      </Card>

      {/* テキストリンク2点 */}
      <nav
        aria-label="他のページへ"
        style={{
          marginTop: 28,
          display: 'flex',
          justifyContent: 'center',
          gap: 4,
          alignItems: 'center',
        }}
      >
        <TextLink onClick={() => onNavigate('fortune')} colorToken="var(--t3)">
          星座占い
        </TextLink>
        <span
          aria-hidden="true"
          style={{ color: 'var(--t3)', fontSize: 'var(--fs-caption)' }}
        >
          ・
        </span>
        <TextLink onClick={() => onNavigate('archive')} colorToken="var(--t3)">
          これまでの記録
        </TextLink>
      </nav>

      {/* flex-grow spacer */}
      <div style={{ flex: 1 }} />
    </div>
  );
}
