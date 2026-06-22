/**
 * GET /api/og?type=<dreamTypeId>
 *
 * @vercel/og (Node.js Serverless 版) で 1200x630 PNG の OG 画像を動的生成。
 * unstable_createNodejsStream を使い VercelRequest/VercelResponse パターンに統一。
 * 24 タイプ別に: タイプ色 / タイプ名 / サブタイトル / シグネチャ / Rarity バッジ を配置。
 *
 * 識別性ゲート (ICP §5-1): 「姉貴分の本音ワンライナー」をカードの焦点に置く。
 * 平均値 OG (「あなたを応援」「きっとうまくいく」系) は採用しない。
 *
 * フォント戦略: fetch で Zen Maru Gothic Bold を取得。
 * Cold start 遅延リスクは vercel.json maxDuration:10s でカバー。
 * fetch 失敗時は sans-serif フォールバックで画像生成を継続する。
 *
 * JSX 不使用: React を api/tsconfig に入れず、h() ファクトリ相当の関数で構成。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { unstable_createNodejsStream } from '@vercel/og';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDreamType, RARITY_LABEL } from './_shared/dreamTypeLookup.js';

// Zen Maru Gothic Bold - Google Fonts CDN (SIL OFL ライセンス)
const ZEN_FONT_URL =
  'https://fonts.gstatic.com/s/zenmarugothic/v15/' +
  'o-0XI4AWCsts5FTV3We8RvYg2B1pW5J4-K6yq0IWwvGMCSiY1r4TmqNP5pqvq7g.woff';

async function fetchFont(): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(ZEN_FONT_URL, {
      headers: { 'User-Agent': 'Vercel/og-generator' },
    });
    if (!res.ok) return null;
    return res.arrayBuffer();
  } catch {
    return null;
  }
}

/**
 * satori が受け取る React-element 互換オブジェクトを生成するヘルパー。
 * React を直接 import せずに済む (api/tsconfig に @types/react なし)。
 */
function h(
  type: string,
  props: Record<string, any> | null,
  ...children: any[]
): any {
  const flatChildren = children.flat().filter((c) => c != null);
  return {
    type,
    props: {
      ...(props ?? {}),
      children: flatChildren.length === 0 ? undefined : flatChildren.length === 1 ? flatChildren[0] : flatChildren,
    },
  };
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const typeParam = String(req.query.type ?? '').trim();
  const entry = typeParam ? getDreamType(typeParam) : undefined;

  const name = entry?.name ?? 'よるのことば';
  const sub = entry?.sub ?? '夢タイプ診断';
  const signature =
    entry?.signature ?? 'あなたのよるは、どんなかたちをしている？';
  const color = entry?.color ?? '#e8627c';
  const rarity = entry ? (RARITY_LABEL[entry.rarity] ?? entry.rarity) : '';

  // タイプ色 20% opacity でグラデーション背景
  const accentAlpha = `${color}33`;

  const fontData = await fetchFont();

  type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  const fonts: {
    data: ArrayBuffer;
    name: string;
    style?: 'normal' | 'italic';
    weight?: FontWeight;
  }[] = fontData
    ? [{ name: 'ZenMaruGothic', data: fontData, style: 'normal', weight: 700 }]
    : [];

  const fontFamily = fontData ? 'ZenMaruGothic, sans-serif' : 'sans-serif';

  const element = h(
    'div',
    {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        background: '#0d0b1a',
        fontFamily,
        position: 'relative',
        overflow: 'hidden',
        padding: '48px 64px',
      },
    },
    // 背景グラデーション
    h('div', {
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `radial-gradient(ellipse at 20% 30%, ${accentAlpha} 0%, transparent 60%)`,
      },
    }),
    // Rarity バッジ (存在する場合のみ)
    rarity
      ? h(
          'div',
          {
            style: {
              display: 'flex',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              padding: '4px 14px',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.10)',
              color: 'rgba(255,255,255,0.65)',
              marginBottom: '16px',
            },
          },
          rarity,
        )
      : null,
    // カラードット
    h('div', {
      style: {
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: color,
        border: '2px solid rgba(255,255,255,0.25)',
        marginBottom: '16px',
        display: 'flex',
      },
    }),
    // タイプ名
    h(
      'div',
      {
        style: {
          fontSize: '48px',
          fontWeight: 700,
          color: '#f0eaf8',
          letterSpacing: '-0.01em',
          lineHeight: 1.2,
          marginBottom: '6px',
          display: 'flex',
        },
      },
      name,
    ),
    // サブタイトル
    h(
      'div',
      {
        style: {
          fontSize: '20px',
          color: 'rgba(255,255,255,0.55)',
          marginBottom: '28px',
          letterSpacing: '0.02em',
          display: 'flex',
        },
      },
      sub,
    ),
    // シグネチャ (姉貴分ワンライナー) - カードの焦点
    h(
      'div',
      {
        style: {
          display: 'flex',
          alignSelf: 'stretch',
          fontSize: '26px',
          fontWeight: 700,
          color: 'rgba(255,255,255,0.92)',
          lineHeight: 1.7,
          background: 'rgba(255,255,255,0.06)',
          borderLeft: `4px solid ${color}`,
          borderRadius: '8px',
          padding: '18px 22px',
          letterSpacing: '0.01em',
        },
      },
      signature,
    ),
    // サイト名 (右下)
    h(
      'div',
      {
        style: {
          position: 'absolute',
          bottom: '32px',
          right: '48px',
          fontSize: '16px',
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: '0.06em',
          display: 'flex',
        },
      },
      'よるのことば',
    ),
  );

  const stream = await unstable_createNodejsStream(element, {
    width: 1200,
    height: 630,
    fonts,
  });

  res.setHeader('Content-Type', 'image/png');
  res.setHeader(
    'Cache-Control',
    'public, max-age=86400, stale-while-revalidate=604800',
  );
  res.status(200);
  stream.pipe(res);
}
