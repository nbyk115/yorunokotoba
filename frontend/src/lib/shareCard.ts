/**
 * Dream share-card image generation (pure canvas, zero npm dependency).
 *
 * Produces a vertical 1080x1920 PNG suitable for Instagram Stories / TikTok.
 * The user saves the generated image and posts it manually: there is no
 * programmatic posting API for those platforms.
 */

export interface ShareCardInput {
  /** Short headline phrase from the reading. */
  headline: string;
  /** Emoji that decorates the reading. */
  emoji: string;
  /** Prose "今日のメッセージ". */
  message: string;
}

const W = 1080;
const H = 1920;

/** Word-wrap helper for Japanese text (character-by-character). */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const lines: string[] = [];
  let current = '';
  for (const ch of text) {
    if (ch === '\n') {
      lines.push(current);
      current = '';
      continue;
    }
    const test = current + ch;
    if (ctx.measureText(test).width > maxWidth && current !== '') {
      lines.push(current);
      current = ch;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** Render the share card and return it as a PNG blob. */
export function renderShareCard(input: ShareCardInput): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('canvas unsupported'));
      return;
    }

    // Background gradient (rose -> lavender), matching the app hero card.
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#E8627C');
    bg.addColorStop(1, '#B08ACF');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Inner panel.
    const pad = 80;
    const panelX = pad;
    const panelY = 220;
    const panelW = W - pad * 2;
    const panelH = H - panelY - 260;
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, panelX, panelY, panelW, panelH, 48);
    ctx.fill();

    ctx.textAlign = 'center';
    const font = "'Zen Maru Gothic', 'Hiragino Maru Gothic Pro', 'BIZ UDGothic', sans-serif";

    // App name at the top of the image.
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `700 56px ${font}`;
    ctx.fillText('🌙 よるのことば', W / 2, 130);

    // Emoji.
    ctx.font = `400 140px ${font}`;
    ctx.fillText(input.emoji || '🌙', W / 2, panelY + 220);

    // Section label.
    ctx.fillStyle = '#B08ACF';
    ctx.font = `700 34px ${font}`;
    ctx.fillText('夢が伝えていること', W / 2, panelY + 320);

    // Headline (may wrap).
    ctx.fillStyle = '#3A2830';
    ctx.font = `700 52px ${font}`;
    const headlineLines = wrapText(ctx, input.headline, panelW - 160);
    let y = panelY + 400;
    for (const line of headlineLines) {
      ctx.fillText(line, W / 2, y);
      y += 70;
    }

    // Divider.
    y += 20;
    ctx.strokeStyle = 'rgba(58, 40, 48, 0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(panelX + 120, y);
    ctx.lineTo(panelX + panelW - 120, y);
    ctx.stroke();
    y += 70;

    // Today's message label.
    ctx.fillStyle = '#E8627C';
    ctx.font = `700 32px ${font}`;
    ctx.fillText('今日のメッセージ', W / 2, y);
    y += 70;

    // Message body (wrapped, line-limited so it never overflows the panel).
    ctx.fillStyle = 'rgba(58, 40, 48, 0.82)';
    ctx.font = `400 38px ${font}`;
    const bodyMaxY = panelY + panelH - 70;
    const messageLines = wrapText(ctx, input.message, panelW - 160);
    for (const line of messageLines) {
      if (y > bodyMaxY) break;
      ctx.fillText(line, W / 2, y);
      y += 60;
    }

    // Footer URL.
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `700 36px ${font}`;
    ctx.fillText('yorunokotoba.vercel.app', W / 2, H - 130);

    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('toBlob failed'));
    }, 'image/png');
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Trigger a browser download of the given blob. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
