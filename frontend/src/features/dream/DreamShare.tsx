import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { track } from '@/lib/analytics';
import { renderShareCard, downloadBlob } from '@/lib/shareCard';
import type { DreamResult } from '@/logic/dream';

/**
 * Share controls for a dream reading result.
 *
 * - Image save: generates a vertical share card PNG the user can download and
 *   post manually to Instagram Stories / TikTok (no direct-post API exists).
 * - OS share sheet: navigator.share() with a text + URL fallback to LINE.
 * - LINE share: opens the LINE share URL with the result text + link.
 */

const SHARE_URL = 'https://yorunokotoba.vercel.app/';

interface DreamShareProps {
  result: DreamResult;
}

export function DreamShare({ result }: DreamShareProps) {
  const [imageState, setImageState] = useState<'idle' | 'working' | 'done'>('idle');

  const shareText = `夢占いの結果: ${result.reading.headline}`;

  async function handleImageSave() {
    if (imageState === 'working') return;
    setImageState('working');
    try {
      const blob = await renderShareCard({
        headline: result.reading.headline,
        emoji: result.reading.emoji,
        message: result.todayMessage,
      });
      downloadBlob(blob, 'yorunokotoba-dream.png');
      track('image_save', { typeId: result.archive.typeId });
      setImageState('done');
    } catch {
      setImageState('idle');
    }
  }

  function handleOsShare() {
    if (navigator.share) {
      navigator
        .share({
          title: 'よるのことば',
          text: shareText,
          url: SHARE_URL,
        })
        .then(() => track('share_dream', { method: 'webshare' }))
        .catch(() => undefined);
    } else {
      // Fallback for browsers without the Web Share API: open LINE.
      openLineShare();
    }
  }

  function openLineShare() {
    const url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
      SHARE_URL,
    )}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    track('share_dream', { method: 'line' });
  }

  return (
    <Card className="slide-up">
      <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--lavender)', marginBottom: 8 }}>
        📤 結果をシェアする
      </h4>
      <p style={{ fontSize: 12, lineHeight: 1.9, color: 'var(--t2)', marginBottom: 'var(--sp-4)' }}>
        画像を保存すればインスタのストーリーや TikTok にも投稿できるよ。
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        <Button
          fullWidth
          onClick={handleImageSave}
          disabled={imageState === 'working'}
        >
          {imageState === 'working'
            ? '画像を作ってるよ…'
            : imageState === 'done'
              ? '✓ 画像を保存したよ'
              : '🖼 結果を画像で保存'}
        </Button>
        <Button variant="secondary" fullWidth onClick={handleOsShare}>
          📱 シェアする
        </Button>
        <Button variant="secondary" fullWidth onClick={openLineShare}>
          💬 LINEで送る
        </Button>
      </div>
    </Card>
  );
}
