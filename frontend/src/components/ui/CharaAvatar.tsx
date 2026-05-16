import { getCharaImage } from '@/assets/chara';

interface CharaAvatarProps {
  id: string;
  size?: number;
  animate?: boolean;
  border?: string;
}

export function CharaAvatar({ id, size = 80, animate = false, border }: CharaAvatarProps) {
  const src = getCharaImage(id);
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
          fontSize: size * 0.5,
          border: border ?? '1px solid var(--border)',
        }}
        aria-hidden="true"
      >
        🌙
      </div>
    );
  }
  return (
    <img alt=""
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
        animation: animate ? 'float-chara 6s ease-in-out infinite' : undefined,
      }}
    />
  );
}
