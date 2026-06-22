import { getCharaImage } from '@/assets/chara';

interface CharaAvatarProps {
  id: string;
  size?: number;
  /** Gentle vertical hovering (float) animation. */
  animate?: boolean;
  border?: string;
  /** Add twinkling sparkle accents around the avatar (SSR only). */
  sparkle?: boolean;
}

export function CharaAvatar({
  id,
  size = 80,
  animate = false,
  border,
  sparkle = false,
}: CharaAvatarProps) {
  const src = getCharaImage(id);

  const avatar = !src ? (
    <div
      className={animate ? 'chara-float' : undefined}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--bg1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.5,
        border: border ?? '1px solid var(--border)',
      }}
      aria-hidden="true"
    >
      🌙
    </div>
  ) : (
    <img alt=""
      src={src}
      width={size}
      height={size}
      loading="lazy"
      className={animate ? 'chara-float' : undefined}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover',
        border: border ?? 'none',
      }}
    />
  );

  if (sparkle) {
    return (
      <span className="chara-sparkle" aria-hidden="true">
        {avatar}
      </span>
    );
  }
  return avatar;
}
