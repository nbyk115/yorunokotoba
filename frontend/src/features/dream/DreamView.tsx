/**
 * DreamView  -  Wave L1 骨格実装
 *
 * 入力: BackHeader → ラベル → Textarea → 占うButton
 * 結果: BackHeader → CharaAvatar+RarityBadge → テーマ名 → Card primary（よみとき本文）→ 今日のヒント小カード → シェアButton
 *
 * 廃止: RitualButton（→ Button primary）/ BlurReveal（→ 不使用）
 * 中身コピー・占いロジックは Wave L3。骨格のみ。
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { BackHeader } from '@/components/ui/BackHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { CharaAvatar } from '@/components/ui/CharaAvatar';
import { RarityBadge } from '@/components/ui/RarityBadge';
import { analyzeDream, type DreamResult } from '@/logic/dream';
import { SIGNS } from '@/data/signs';
import { getCharaIdBySign } from '@/data/signs';
import { saveArchiveEntry } from '@/lib/archive';
import { track } from '@/lib/analytics';
import type { UserProfile } from '@/lib/firestore';

interface DreamViewProps {
  profile: UserProfile;
}

export function DreamView({ profile }: DreamViewProps) {
  const [text, setText] = useState('');
  const [result, setResult] = useState<DreamResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(true);
  const resultRef = useRef<HTMLDivElement>(null);

  const signIdx = SIGNS.findIndex((s) => s.k === profile.sign);
  const charaId = getCharaIdBySign(profile.sign, profile.gender);

  const handleConfirm = useCallback(async () => {
    if (!text.trim()) return;
    track('dream_start', { length: text.length });
    setLoading(true);

    // history.pushState で iOS スワイプバック対応
    history.pushState({ view: 'dream-result' }, '');

    await new Promise((r) => setTimeout(r, 2000));
    const r = analyzeDream(text, signIdx);
    setResult(r);
    setShowInput(false);
    setLoading(false);
    track('dream_complete', { typeId: r.type.id, theme: r.theme.key });
    saveArchiveEntry({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      text: text.slice(0, 200),
      timestamp: Date.now(),
      typeId: r.type.id,
      themeKey: r.theme.key,
      summary: r.symbols.slice(0, 2).map((s) => s.word).join('・'),
    });
  }, [text, signIdx]);

  // popstate でスワイプバック → 入力フェーズに戻る
  useEffect(() => {
    function onPop() {
      if (result) {
        setResult(null);
        setShowInput(true);
      }
    }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [result]);

  function handleReset() {
    setText('');
    setResult(null);
    setShowInput(true);
  }

  // 入力フェーズ
  if (showInput && !result) {
    return (
      <div style={{ paddingBottom: 32 }}>
        <BackHeader onBack={() => history.back()} title="夢占い" />

        {/* ラベル + 説明 */}
        <div style={{ padding: '8px 20px 16px', textAlign: 'center' }}>
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--fs-caption)',
              fontWeight: 700,
              color: 'var(--t3)',
              letterSpacing: 'var(--ls-card-label)',
              margin: '0 0 8px',
            }}
          >
            夢占い
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--fs-h1)',
              fontWeight: 700,
              color: 'var(--t1)',
              letterSpacing: '0.04em',
              lineHeight: 1.3,
              margin: '0 0 8px',
            }}
          >
            今夜の夢を書いて
          </h2>
          <p style={{ fontSize: 'var(--fs-caption)', color: 'var(--t2)', lineHeight: 1.8, margin: 0 }}>
            見た夢をそのまま書いて。深層心理のヒントが出てくるよ。
          </p>
        </div>

        {/* Textarea + 占うButton */}
        <Card variant="primary" style={{ margin: '0 16px 16px' }}>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 500))}
            placeholder="空を飛んでいた…とか、知らない街にいた…とか"
            disabled={loading}
            style={{ width: '100%', boxSizing: 'border-box' }}
            aria-label="見た夢を入力"
          />
          <div style={{ textAlign: 'right', fontSize: 'var(--fs-micro)', color: 'var(--t3)', marginTop: 8 }}>
            {text.length} / 500
          </div>
          <div style={{ marginTop: 16 }}>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={!text.trim() || loading}
              fullWidth
            >
              {loading ? 'よみとき中…' : '占う'}
            </Button>
          </div>
        </Card>

        <p style={{ textAlign: 'center', fontSize: 'var(--fs-caption)', color: 'var(--t3)', padding: '0 24px' }}>
          書いたら、あなたへのメッセージが出てくるよ
        </p>

        <style>{`
          textarea::placeholder { color: rgba(246,236,238,0.30); }
        `}</style>
      </div>
    );
  }

  // 結果フェーズ
  if (result) {
    return (
      <div ref={resultRef} style={{ paddingBottom: 40 }}>
        <BackHeader onBack={handleReset} title="夢占い結果" />

        {/* CharaAvatar + RarityBadge */}
        <div style={{ textAlign: 'center', padding: '24px 20px 16px' }}>
          <CharaAvatar id={charaId} size={96} animate rarity={result.type.rarity} />
          <div style={{ marginTop: 12 }}>
            <RarityBadge rarity={result.type.rarity} />
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--fs-h1)',
              fontWeight: 700,
              color: 'var(--t1)',
              letterSpacing: '0.04em',
              margin: '12px 0 0',
            }}
          >
            {result.theme.label}
          </h2>
        </div>

        {/* よみとき本文カード（主役） */}
        <Card
          variant="primary"
          style={{
            margin: '0 16px 12px',
            borderLeft: 'var(--card-accent-line)',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--fs-card-label)',
              fontWeight: 700,
              color: 'var(--t3)',
              letterSpacing: 'var(--ls-card-label)',
              margin: '0 0 16px',
            }}
          >
            よみとき
          </p>
          <p
            style={{
              fontSize: 'var(--fs-fortune-body)',
              lineHeight: 'var(--lh-fortune-body)',
              color: 'var(--t1)',
              margin: 0,
            }}
          >
            {result.mainReading.intro}
          </p>
        </Card>

        {/* 今日のヒント小カード */}
        <Card variant="secondary" style={{ margin: '0 16px 24px' }}>
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--fs-caption)',
              fontWeight: 700,
              color: 'var(--rose)',
              margin: '0 0 8px',
            }}
          >
            今日のヒント
          </p>
          <p style={{ fontSize: 'var(--fs-body)', lineHeight: 1.9, color: 'var(--t1)', margin: 0 }}>
            {result.todayMessage}
          </p>
        </Card>

        {/* シェアButton + リセット */}
        <div style={{ margin: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Button
            variant="primary"
            onClick={() => track('share_dream', {})}
            fullWidth
          >
            シェアする
          </Button>
          <Button variant="ghost" onClick={handleReset} fullWidth>
            別の夢をよみとく
          </Button>
        </div>

        <p style={{ fontSize: 'var(--fs-micro)', color: 'var(--t3)', textAlign: 'center', margin: '16px 16px 4px', lineHeight: 1.6 }}>
          ※ 夢の解釈は登録された象徴辞典をもとに自動生成した娯楽コンテンツです。
        </p>
      </div>
    );
  }

  return null;
}
