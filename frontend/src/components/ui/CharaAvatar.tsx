/**
 * CharaAvatar  -  キャラクターアバター
 * Wave L1: float アニメーションは CSS keyframe に統一
 *   transform: translateY(0→-6px→0) / 4000ms ease-in-out infinite
 * レア度演出: rarity='SSR' のとき gold border を表示
 *
 * Wave L2: animate 用アニメーションを className prop で受け取る形に変更。
 *   animation インライン style を廃止（handoff §4 構造的解決方針準拠）。
 *   呼び出し元が styles.charaFloat クラスを floatClassName に渡すことで
 *   float-chara キーフレームが適用される。
 */
import type { DreamType } from '@/data/dreamTypes';
import { getCharaImage } from '@/assets/chara';

interface CharaAvatarProps {
  id: string;
  size?: number;
  /** @deprecated animate=true のみでは動作しない。floatClassName を使うこと */
  animate?: boolean;
  /** 浮遊アニメーション CSS クラス名。global.css の float-chara キーフレームを参照するクラスを渡す */
  floatClassName?: string;
  rarity?: DreamType['rarity'];
}

const RARITY_BORDER: Record<NonNullable<DreamType['rarity']>, string | undefined> = {
  N: undefined,
  R: '2px solid var(--rarity-r)',
  SR: '2px solid var(--rarity-sr)',
  SSR: '2px solid var(--rarity-ssr)',
};

export function CharaAvatar({ id, size = 80, animate = false, floatClassName, rarity }: CharaAvatarProps) {
  const src = getCharaImage(id);
  const border = rarity ? RARITY_BORDER[rarity] : undefined;
  // floatClassName が渡されていない場合のフォールバック:
  // animate=true のとき global.css の float-chara キーフレームをインライン style で参照する。
  // floatClassName が渡された場合はそちらを優先（HomeView 等インライン style 全廃が必要な画面）。
  const animationStyle = !floatClassName && animate ? 'float-chara 4000ms ease-in-out infinite' : undefined;

  if (!src) {
    return (
      <div
        className={floatClassName}
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
          animation: animationStyle,
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
      className={floatClassName}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover',
        border: border ?? 'none',
        animation: animationStyle,
      }}
    />
  );
}
