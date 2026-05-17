/**
 * CharaAvatar  -  キャラクターアバター
 * Wave L1: float アニメーションは CSS keyframe に統一
 *   transform: translateY(0→-6px→0) / 4000ms ease-in-out infinite
 * レア度演出: rarity='SSR' のとき gold border を表示
 */
import type { DreamType } from '@/data/dreamTypes';
import { getCharaImage } from '@/assets/chara';

interface CharaAvatarProps {
  id: string;
  size?: number;
  animate?: boolean;
  rarity?: DreamType['rarity'];
}

const RARITY_BORDER: Record<NonNullable<DreamType['rarity']>, string | undefined> = {
  N: undefined,
  R: '2px solid var(--rarity-r)',
  SR: '2px solid var(--rarity-sr)',
  SSR: '2px solid var(--rarity-ssr)',
};

export function CharaAvatar({ id, size = 80, animate = false, rarity }: CharaAvatarProps) {
  const src = getCharaImage(id);
  const border = rarity ? RARITY_BORDER[rarity] : undefined;

  if (!src) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'var(--bg1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.4,
          border: border ?? '1px solid var(--border)',
          animation: animate ? 'float-chara 4000ms ease-in-out infinite' : undefined,
        }}
        aria-hidden="true"
      >
        🌙
      </div>
    );
  }
  return (
    <img
      alt=""
      src={src}
      width={size}
      height={size}
      loading="lazy"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover',
        border: border ?? 'none',
        animation: animate ? 'float-chara 4000ms ease-in-out infinite' : undefined,
      }}
    />
  );
}
