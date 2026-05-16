import type { CSSProperties } from 'react';
import { Sparkles, Stars, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { HeroBlock } from '@/components/ui/HeroBlock';
import { RitualButton } from '@/components/ui/RitualButton';
import { BlurReveal } from '@/components/ui/BlurReveal';
import { MoonPhaseIcon } from '@/components/ui/MoonPhaseIcon';
import { useTimeOfDay } from '@/components/providers/TimeOfDayProvider';
import type { TimeOfDay } from '@/lib/timeOfDay';
import type { UserProfile } from '@/lib/firestore';
import type { ViewKey } from '@/App';
import type { StreakState } from '@/logic/streak';
import { getCharaIdBySign } from '@/data/signs';
import { getMoonPhaseIndex } from '@/lib/moonPhase';

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

// BlurReveal 内のチラ見せ占い結果プレビュー（ICP共感語彙）
const BLUR_PREVIEW_MESSAGES = [
  '今夜のよみとき、解放のほうを向いてる',
  '今夜のよみとき、もう準備できてる',
  '今夜のよみとき、いい流れが来てる',
  '夢の奥に、今のあなたへのメッセージが眠っている',
];

function getDailyBlurMessage(): string {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return BLUR_PREVIEW_MESSAGES[seed % BLUR_PREVIEW_MESSAGES.length] ?? BLUR_PREVIEW_MESSAGES[0]!;
}

export function HomeView({ profile, streak, onNavigate }: HomeViewProps) {
  const tod = useTimeOfDay();
  const heroCopy = HERO_COPIES[tod];
  const greeting = getGreeting(tod);
  const moonPhaseIndex = getMoonPhaseIndex();
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
        charaSize={88}
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
          {/* greeting label - Zen Maru 400 caption / t3 */}
          <p
            style={{
              fontSize: 'var(--fs-caption)',
              fontWeight: 400,
              color: 'var(--t3)',
              letterSpacing: 'var(--ls-section)',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {greeting}
          </p>
          {/* ユーザー名 - Zen Maru 700 28px（PR4 ページ見出しスケール） */}
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--fs-page-h1)',
              fontWeight: 700,
              color: 'var(--t1)',
              letterSpacing: '0.02em',
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            {/* 月相 + 星座 + 連続日数（極小表示）*/}
            <MoonPhaseIcon phaseIndex={moonPhaseIndex} size={14} />{' '}
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

        {/*
          dream-card（画面の主役カード = variant primary）
          PR4: 上辺に金（--accent）の極細線、濃い黒影、backdrop-filter blur
          creative-playbook「1画面に主役1枚の原則」
        */}
        <Card
          variant="primary"
          as="article"
          className="slide-up"
          style={{
            margin: '20px 16px 0',
            padding: '24px',
            borderTop: 'none',
            animation: 'slideUp 450ms ease both',
            transition: 'transform 200ms ease, box-shadow 200ms ease',
            /* 上辺に金の極細線（inset で実現）*/
            boxShadow: 'inset 0 2px 0 var(--accent), 0 8px 28px rgba(0,0,0,0.32)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
          }}
          onMouseDown={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
          }}
        >
          {/* eyebrow - Zen Maru 700 / card-label スケール / t3 色 */}
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--fs-card-label)',
              fontWeight: 700,
              color: 'var(--text-low)',
              letterSpacing: 'var(--ls-card-label)',
              marginBottom: 8,
              margin: '0 0 8px',
            }}
          >
            夢占い
          </p>

          {/* card-title - Zen Maru 700 / section スケール */}
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--fs-section)',
              fontWeight: 700,
              color: 'var(--t1)',
              lineHeight: 1.4,
              letterSpacing: '0.04em',
              margin: '0 0 8px',
            }}
          >
            今夜の夢をよみとく
          </h2>

          {/* card-body - Zen Maru 400 15px / line-height 1.8 */}
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--fs-body)',
              fontWeight: 400,
              color: 'var(--t2)',
              lineHeight: 1.8,
              margin: '0 0 16px',
            }}
          >
            見た夢をそのまま書いて。シンボルから今のあなたへのメッセージをよみとくよ。
          </p>

          {/* チラ見せ占い結果プレビュー（BlurReveal）*/}
          <BlurReveal
            initialBlur={4}
            revealOnTap
            style={{
              padding: '12px 14px',
              background: 'rgba(201, 169, 97, 0.06)',
              borderRadius: 10,
              marginBottom: 20,
              fontSize: 'var(--fs-caption)',
              color: 'var(--t2)',
              lineHeight: 1.6,
              letterSpacing: '0.02em',
              fontStyle: 'italic',
              fontFamily: 'var(--font-accent)',
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
        </Card>

        {/*
          PR4: 下部の他画面誘導
          creative-playbook「箱で区切らず余白で区切る」
          枠線（box）を消してテキストリンク化。8pxグリッド余白で区切る。
        */}
        <nav
          aria-label="他のページへ"
          style={{
            margin: '32px 16px 0',
            paddingBottom: 32,
          }}
        >
          {/* セクション見出し - Zen Maru 700 / card-label / t3 */}
          <p
            style={{
              fontSize: 'var(--fs-card-label)',
              fontWeight: 700,
              color: 'var(--text-low)',
              letterSpacing: 'var(--ls-card-label)',
              marginBottom: 16,
              textAlign: 'center',
            }}
          >
            ほかにも
          </p>

          {/* テキストリンク3件 - 箱なし・余白区切り */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
            }}
          >
            {/* fortune link */}
            <NavTextLink
              icon={<Icon icon={Sparkles} size={16} color="var(--accent)" />}
              label="星座占い"
              action="みる"
              actionColor="var(--accent)"
              onClick={() => onNavigate('fortune')}
            />
            {/* divider */}
            <div aria-hidden="true" style={{ height: 1, background: 'var(--border)', margin: '0 0' }} />
            {/* aura link */}
            <NavTextLink
              icon={<Icon icon={Stars} size={16} color="var(--t3)" />}
              label="相性診断"
              action="みる"
              actionColor="var(--t2)"
              onClick={() => onNavigate('aura')}
            />
            {/* divider */}
            <div aria-hidden="true" style={{ height: 1, background: 'var(--border)', margin: '0 0' }} />
            {/* archive link */}
            <NavTextLink
              icon={<Icon icon={BookOpen} size={16} color="var(--t3)" />}
              label="これまでの記録"
              action="見る"
              actionColor="var(--t2)"
              onClick={() => onNavigate('archive')}
            />
          </div>
        </nav>
      </main>
    </div>
  );
}

// PR4: テキストリンクコンポーネント - 枠なし・余白区切り (creative-playbook「箱で区切らず余白で区切る」)
interface NavTextLinkProps {
  icon: React.ReactNode;
  label: string;
  action: string;
  actionColor: string;
  onClick: () => void;
}

function NavTextLink({ icon, label, action, actionColor, onClick }: NavTextLinkProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '16px 4px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'opacity 150ms ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.opacity = '0.72';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.opacity = '1';
      }}
      onFocus={(e) => {
        (e.currentTarget as HTMLElement).style.outline = '2px solid var(--rose)';
        (e.currentTarget as HTMLElement).style.outlineOffset = '2px';
      }}
      onBlur={(e) => {
        (e.currentTarget as HTMLElement).style.outline = 'none';
      }}
    >
      {/* icon */}
      <span aria-hidden="true" style={{ flexShrink: 0, lineHeight: 0 }}>
        {icon}
      </span>
      {/* label */}
      <span
        style={{
          flex: 1,
          fontSize: 'var(--fs-body)',
          fontWeight: 400,
          color: 'var(--t2)',
          letterSpacing: '0.02em',
        }}
      >
        {label}
      </span>
      {/* action - 小さく右寄せ */}
      <span
        style={{
          fontSize: 'var(--fs-caption)',
          fontWeight: 400,
          color: actionColor,
          letterSpacing: '0.04em',
        }}
      >
        {action}
      </span>
    </button>
  );
}
