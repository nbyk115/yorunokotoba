/**
 * DreamView  -  Wave L2 夢占い画面
 *
 * handoff §2「夢占い」情報設計に準拠:
 *   入力: textarea + 送信ボタン。過剰な演出ヘッダーを見せない（最小限構成）
 *   結果: テーマ + よみとき本文 + 今日のヒント + シェア。luckyNumber は表示しない。
 *
 * Wave L2 の役割（handoff §5）:
 *   ホーム画面で確立したカード/余白パターン（HomeView.module.css の構造）を踏襲。
 *   インライン style 全廃（handoff §4 構造的解決方針）。
 *   スタイルは DreamView.module.css に集約。
 *
 * シェアバグ修正（handoff §4 必須）:
 *   document.fonts.ready を await してからシェア画像生成。
 *   実装は ShareCard 内の toPngWithRetry で対応済み。
 *   生成失敗時は ShareCard の feedbackMessage で明示フィードバック。
 *
 * 廃止: luckyNumber 表示 / インライン style / <style> タグ注入
 *
 * 識別性ゲート（断った平均値）:
 *   「占い中...」の一般的ローディング文言を断った。
 *   「よみときを始めるよ」でキャラの視点から語りかけるトーンに合わせた。
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { BackHeader } from '@/components/ui/BackHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { CharaAvatar } from '@/components/ui/CharaAvatar';
import { RarityBadge } from '@/components/ui/RarityBadge';
import { ShareCard } from '@/components/ui/ShareCard';
import { analyzeDream, type DreamResult } from '@/logic/dream';
import { SIGNS } from '@/data/signs';
import { getCharaIdBySign } from '@/data/signs';
import { saveArchiveEntry } from '@/lib/archive';
import { track } from '@/lib/analytics';
import type { UserProfile } from '@/lib/firestore';
import styles from './DreamView.module.css';

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

    // history.pushState で iOS スワイプバック対応（handoff §2 + §4）
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

  // ────── ローディングフェーズ ──────
  // 送信後・結果表示前の 2 秒間にオーバーレイを表示する。
  // 入力フォームは loading=true の間もマウントされたままにし、
  // 上から loadingOverlay で覆う構成（アンマウント→再マウントのチラつき防止）。
  if (loading) {
    return (
      <div className={styles.loadingOverlay} aria-live="polite" aria-label="よみとき中">
        <div className={styles.loadingSpinner} aria-hidden="true" />
        <p className={styles.loadingText}>よみときを始めるよ</p>
      </div>
    );
  }

  // ────── 入力フェーズ ──────
  if (showInput && !result) {
    return (
      <div className={styles.inputRoot}>
        <BackHeader onBack={() => history.back()} title="夢占い" />

        {/* 説明エリア: ラベル + 見出し + サポートテキスト */}
        <div className={styles.inputIntro}>
          <p className={styles.inputLabel}>夢占い</p>
          <h2 className={styles.inputHeading}>今夜の夢を書いて</h2>
          <p className={styles.inputDesc}>見た夢をそのまま書いて。深層心理のヒントが出てくるよ。</p>
        </div>

        {/* 入力カード: HomeView の dreamCardWrapper と同じ左辺 gold line 構造 */}
        <div className={styles.inputCardWrapper}>
          <Card variant="primary" as="div" aria-label="夢の入力フォーム">
            <Textarea
              className="dreamTextarea"
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 500))}
              placeholder="空を飛んでいた…とか、知らない街にいた…とか"
              aria-label="見た夢を入力"
            />
            <p className={styles.charCount}>{text.length} / 500</p>
            <div className={styles.inputButtonWrap}>
              <Button
                variant="primary"
                onClick={handleConfirm}
                disabled={!text.trim()}
                fullWidth
              >
                占う
              </Button>
            </div>
          </Card>
        </div>

        <p className={styles.inputHint}>書いたら、あなたへのメッセージが出てくるよ</p>
      </div>
    );
  }

  // ────── 結果フェーズ ──────
  if (result) {
    // シェアカード用のラベルを生成（星座名 + 今日の日付）
    const signData = SIGNS[signIdx];
    const signName = signData ? signData.k : '';
    const today = new Date();
    const dateLabel = `${today.getMonth() + 1}.${today.getDate()}`;
    const signLabel = signName ? `${signName} · よるのことば` : 'よるのことば';

    return (
      <div ref={resultRef} className={styles.resultRoot}>
        <BackHeader onBack={handleReset} title="夢占い結果" />

        {/* キャラ + RarityBadge + テーマ名（情報設計 §2「テーマ」）*/}
        <div className={styles.resultHero}>
          <CharaAvatar id={charaId} size={96} animate rarity={result.type.rarity} />
          <div className={styles.rarityWrap}>
            <RarityBadge rarity={result.type.rarity} />
          </div>
          <h2 className={styles.themeHeading}>{result.theme.label}</h2>
        </div>

        {/* よみとき本文カード（主役）: HomeView の dreamCardWrapper 構造を踏襲 */}
        {/* handoff §2「よみとき本文」*/}
        <div className={styles.readingCardWrapper}>
          <Card
            variant="primary"
            as="article"
            aria-label="よみとき本文"
          >
            <p className={styles.readingLabel}>よみとき</p>
            <p className={styles.readingBody}>{result.mainReading.intro}</p>
          </Card>
        </div>

        {/* 今日のヒント（handoff §2「今日のヒント」）*/}
        <div className={styles.hintCardWrap}>
          <Card variant="secondary" as="section" aria-label="今日のヒント">
            <p className={styles.hintLabel}>今日のヒント</p>
            <p className={styles.hintBody}>{result.todayMessage}</p>
          </Card>
        </div>

        {/* シェアセクション（handoff §2「シェア」）
            ShareCard: document.fonts.ready 待機は ShareCard 内 toPngWithRetry で対応済み。
            失敗時フィードバックも ShareCard が担う（status='error' で明示メッセージ表示）。
            luckyNumber は表示しない（handoff §2 明示）。 */}
        <div className={styles.shareSection}>
          <ShareCard
            title={result.theme.label}
            subtitle={result.type.name}
            body={result.todayMessage}
            charaId={charaId}
            theme="rose"
            dateLabel={dateLabel}
            signLabel={signLabel}
          />

          {/* 別の夢をよみとくボタン */}
          <Button variant="ghost" onClick={handleReset} fullWidth>
            別の夢をよみとく
          </Button>
        </div>

        <p className={styles.disclaimer}>
          ※ 夢の解釈は登録された象徴辞典をもとに自動生成した娯楽コンテンツです。
        </p>
      </div>
    );
  }

  return null;
}
