import type { CSSProperties } from 'react';
import { Sparkles, Stars, BookOpen } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';
import { HeroBlock } from '@/components/ui/HeroBlock';
import { RitualButton } from '@/components/ui/RitualButton';
import { BlurReveal } from '@/components/ui/BlurReveal';
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

// 時間帯別 HeroBlock テキスト
const HERO_COPIES: Record<TimeOfDay, { en: string; jp: string }> = {
  'night-deep': {
    en: 'Late nights talk to themselves',
    jp: '眠れない夜は、ちょっとだけ自分と話そう',
  },
  dawn: {
    en: 'A quiet good morning',
    jp: 'おはよう。今日のあなた、どんな日にする？',
  },
  day: {
    en: 'Check in with yourself',
    jp: 'いま、自分の気持ち聞けてる？',
  },
  dusk: {
    en: 'A breath before the night',
    jp: '今日もおつかれさま。ひといきつこう',
  },
  night: {
    en: 'A little time for you',
    jp: '今夜は、自分のために少しだけ時間つくろう',
  },
};

// 時間帯別 greeting-section テキスト（ICP語彙: 「おつかれ」「深夜」）
function getGreeting(tod: TimeOfDay): string {
  if (tod === 'night-deep') return '深夜、おつかれさま';
  if (tod === 'dawn') return 'おはよう、今日も一日';
  if (tod === 'day') return 'こんにちは';
  if (tod === 'dusk') return 'こんばんは';
  return 'おやすみ前に';
}

// 深夜専用の名前呼びかけコピー（ICP語彙: 「おつかれ」「帰ってきたね」）
function getNightDeepSubCopy(name: string): string {
  return `おつかれ、${name}。今夜もよく帰ってきたね`;
}

// 月相アイコン（新月〜満月〜新月のサイクル約29.5日）
function getMoonPhaseEmoji(): string {
  const knownNewMoon = new Date('2000-01-06T18:14:00Z').getTime();
  const now = Date.now();
  const cycleMs = 29.530589 * 24 * 60 * 60 * 1000;
  const phase = ((now - knownNewMoon) % cycleMs) / cycleMs;
  const icons = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
  const idx = Math.round(phase * 8) % 8;
  return icons[idx] ?? '🌕';
}

// BlurReveal 内のチラ見せ占い結果プレビュー（ICP共感語彙）
const BLUR_PREVIEW_MESSAGES = [
  '今夜のよみとき、解放のほうを向いてる',
  '星があなたに言いたいことがある',
  '今夜のよみとき、いい流れが来てる',
  '夢の奥に、今のあなたへのメッセージが眠っている',
];

function getDailyBlurMessage(): string {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return BLUR_PREVIEW_MESSAGES[seed % BLUR_PREVIEW_MESSAGES.length] ?? BLUR_PREVIEW_MESSAGES[0]!;
}

// 夜のキャラIDは signs.ts の SIGN_GENDER_CHAR (12星座×2性別=24キャラ) から取得

export function HomeView({ profile, streak, onNavigate }: HomeViewProps) {
  const tod = useTimeOfDay();
  const heroCopy = HERO_COPIES[tod];
  const greeting = getGreeting(tod);
  const moonEmoji = getMoonPhaseEmoji();
  const blurMessage = getDailyBlurMessage();
  const charaId = getCharaIdBySign(profile.sign, profile.gender);
  const isNightDeep = tod === 'night-deep';

  const mainStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100dvh',
  };

  return (
    <div style={mainStyle}>
      {/* ヒーロー 100dvh */}
      <HeroBlock
        english={heroCopy.en}
        japanese={heroCopy.jp}
        subtitle={isNightDeep ? getNightDeepSubCopy(profile.name) : undefined}
        align="center"
        size="hero"
        charaId={charaId}
        charaSize={160}
      />

      {/* スクロール領域 */}
      <main style={{ flex: 1 }}>
        {/* greeting-section */}
        <section
          style={{
            marginTop: 0,
            padding: '32px 24px 0',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: 'var(--fs-caption)',
              fontWeight: 400,
              color: 'var(--t3)',
              letterSpacing: '0.08em',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {greeting}
          </p>
          <p
            style={{
              fontSize: 'var(--fs-h1)',
              fontWeight: 700,
              color: 'var(--t1)',
              letterSpacing: '0.04em',
              marginTop: 4,
              lineHeight: 1.3,
            }}
          >
            {profile.name}さん
          </p>
          <p
            style={{
              fontSize: 'var(--fs-caption)',
              fontWeight: 400,
              color: 'var(--t3)',
              marginTop: 4,
            }}
          >
            {/* 月相 + 星座 + 連続日数（極小表示）*/}
            {moonEmoji}{' '}
            {profile.sign}
            {streak.count > 0 && (
              <span
                style={{
                  fontSize: 'var(--fs-micro)',
                  color: 'var(--t3)',
                  marginLeft: 6,
                  opacity: 0.7,
                }}
                aria-label={`連続${streak.count}日`}
              >
                · {streak.count}日目
              </span>
            )}
          </p>
        </section>

        {/* dream-card（唯一の機能カード）*/}
        <article
          className="slide-up"
          style={{
            margin: 'clamp(12px, 4.3vw, 20px) clamp(12px, 4.3vw, 20px) 0',
            padding: 'clamp(16px, 5.3vw, 24px)',
            background: 'var(--card-primary)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border-primary)',
            borderRadius: 18,
            boxShadow: 'var(--shadow-card-primary)',
            animation: 'slideUp 450ms ease both',
            transition: 'transform 200ms ease, box-shadow 200ms ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
            (e.currentTarget as HTMLElement).style.boxShadow =
              '0 8px 32px rgba(180, 100, 120, 0.12)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow)';
          }}
          onMouseDown={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
          }}
        >
          {/* eyebrow */}
          <p
            style={{
              fontFamily: 'var(--font-accent)',
              fontSize: 'var(--fs-micro)',
              fontWeight: 700,
              color: 'var(--lavender)',
              letterSpacing: '0.12em',
              marginBottom: 8,
            }}
          >
            夢占い
          </p>

          {/* card-title（ICP語彙: 「夢」「読み解く」）*/}
          <h2
            style={{
              fontSize: 'var(--fs-h2)',
              fontWeight: 700,
              color: 'var(--t1)',
              lineHeight: 1.4,
              marginBottom: 8,
              margin: '0 0 8px',
            }}
          >
            今夜の夢を読み解く
          </h2>

          {/* card-body（ICP語彙: 「シンボル」「メッセージ」）*/}
          <p
            style={{
              fontSize: 'var(--fs-caption)',
              color: 'var(--t2)',
              lineHeight: 1.8,
              marginBottom: 16,
              margin: '0 0 16px',
            }}
          >
            見た夢をそのまま書いて。シンボルから今のあなたへのメッセージを読み解くよ。
          </p>

          {/* チラ見せ占い結果プレビュー（BlurReveal）*/}
          <BlurReveal
            initialBlur={4}
            revealOnTap
            style={{
              padding: '12px 14px',
              background: 'rgba(180, 100, 180, 0.06)',
              borderRadius: 10,
              marginBottom: 20,
              fontSize: 'var(--fs-caption)',
              color: 'var(--t2)',
              lineHeight: 1.6,
              letterSpacing: '0.02em',
              fontStyle: 'italic',
            }}
          >
            {blurMessage}
          </BlurReveal>

          {/* 主要CTAボタン（ICP共感語彙: 「扉をひらく」）*/}
          <RitualButton
            verb="今夜の夢をよみとく"
            onConfirm={() => onNavigate('dream')}
            fullWidth
          />
        </article>

        {/* scroll-indicator（他画面への誘導チップ）*/}
        <nav
          aria-label="他のページへ"
          style={{
            margin: '24px clamp(12px, 4.3vw, 20px) 0',
            display: 'flex',
            gap: 12,
            paddingBottom: 24,
          }}
        >
          {/* fortune-chip */}
          <button
            onClick={() => onNavigate('fortune')}
            style={chipStyle}
            onMouseEnter={(e) => applyChipHover(e, true)}
            onMouseLeave={(e) => applyChipHover(e, false)}
            onFocus={(e) => {
              (e.currentTarget as HTMLElement).style.outline = '2px solid var(--rose)';
              (e.currentTarget as HTMLElement).style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              (e.currentTarget as HTMLElement).style.outline = 'none';
            }}
          >
            <Icon icon={Sparkles} size={22} />
            <span
              style={{
                fontSize: 'var(--fs-caption)',
                fontWeight: 700,
                color: 'var(--t2)',
              }}
            >
              星座占い
            </span>
            <span
              style={{
                fontSize: 'var(--fs-caption)',
                color: 'var(--rose)',
                fontWeight: 600,
              }}
            >
              みる
            </span>
          </button>

          {/* aura-chip */}
          <button
            onClick={() => onNavigate('aura')}
            style={chipStyle}
            onMouseEnter={(e) => applyChipHover(e, true)}
            onMouseLeave={(e) => applyChipHover(e, false)}
            onFocus={(e) => {
              (e.currentTarget as HTMLElement).style.outline = '2px solid var(--rose)';
              (e.currentTarget as HTMLElement).style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              (e.currentTarget as HTMLElement).style.outline = 'none';
            }}
          >
            <Icon icon={Stars} size={22} />
            <span
              style={{
                fontSize: 'var(--fs-caption)',
                fontWeight: 700,
                color: 'var(--t2)',
              }}
            >
              相性診断
            </span>
            <span
              style={{
                fontSize: 'var(--fs-micro)',
                color: 'var(--gold)',
                fontWeight: 600,
              }}
            >
              無料でためす
            </span>
          </button>

          {/* archive-chip */}
          <button
            onClick={() => onNavigate('archive')}
            style={chipStyle}
            onMouseEnter={(e) => applyChipHover(e, true)}
            onMouseLeave={(e) => applyChipHover(e, false)}
            onFocus={(e) => {
              (e.currentTarget as HTMLElement).style.outline = '2px solid var(--rose)';
              (e.currentTarget as HTMLElement).style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              (e.currentTarget as HTMLElement).style.outline = 'none';
            }}
          >
            <Icon icon={BookOpen} size={22} />
            <span
              style={{
                fontSize: 'var(--fs-caption)',
                fontWeight: 700,
                color: 'var(--t2)',
              }}
            >
              夜の日記
            </span>
            <span
              style={{
                fontSize: 'var(--fs-caption)',
                color: 'var(--lavender)',
                fontWeight: 600,
              }}
            >
              しまう
            </span>
          </button>
        </nav>
      </main>
    </div>
  );
}

const chipStyle: CSSProperties = {
  flex: 1,
  padding: '16px 12px',
  background: 'var(--card-secondary)',
  border: '1px solid var(--border-secondary)',
  borderRadius: 14,
  textAlign: 'center',
  cursor: 'pointer',
  minHeight: 56,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
  transition: 'border-color 200ms ease, transform 200ms ease',
};

function applyChipHover(
  e: React.MouseEvent<HTMLButtonElement>,
  entering: boolean,
): void {
  const el = e.currentTarget as HTMLElement;
  el.style.borderColor = entering ? 'var(--rose)' : 'var(--border)';
  el.style.transform = entering ? 'translateY(-1px)' : 'translateY(0)';
}
