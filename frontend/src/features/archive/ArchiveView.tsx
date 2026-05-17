/**
 * ArchiveView  -  Wave L2 履歴画面
 *
 * handoff §2「履歴」情報設計に準拠:
 *   見せる: 日付順リスト、夢の内容が主役
 *   見せない: 過剰な装飾
 *
 * Wave L2 の役割（handoff §5）:
 *   ホーム/夢占い/星座占いで確立したカード/余白パターンを履歴画面へ波及。
 *   インライン style 全廃（handoff §4 構造的解決方針）。
 *   スタイルは ArchiveView.module.css に集約。
 *   lib/archive.ts のロジックは変更しない（UI のみ）。
 *
 * 廃止: インライン style 全て / <style> タグ注入 / onMouseDown/onMouseUp style 書き換え
 *
 * 識別性ゲート（断った平均値）:
 *   「月カレンダー主軸の手帳アプリ」を断った。
 *   日付順リストを主軸にし、カレンダーはオプション表示に降格。
 *   夢の内容（テキスト）が主役になるよう情報階層を設計。
 */
import { useMemo, useState } from 'react';
import { Share2, X } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { BackHeader } from '@/components/ui/BackHeader';
import { ShareCard } from '@/components/ui/ShareCard';
import { CharaAvatar } from '@/components/ui/CharaAvatar';
import { loadArchive, clearArchive, type ArchiveEntry } from '@/lib/archive';
import { getSafeDreamType } from '@/lib/contentFilter';
import { getCharaIdBySign } from '@/data/signs';
import type { UserProfile } from '@/lib/firestore';
import type { ViewKey } from '@/App';
import styles from './ArchiveView.module.css';

interface ArchiveViewProps {
  profile?: UserProfile | null;
  onNavigate?: (view: ViewKey) => void;
}

const themeLabels: Record<string, string> = {
  anx: '不安・解放',
  love: '恋愛・感情',
  free: '自由・飛翔',
  work: '成長・課題',
  mystery: '深層・謎',
};

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** 選択中エントリーの「再びシェア」用モーダル */
function ShareModal({
  entry,
  onClose,
}: {
  entry: ArchiveEntry;
  onClose: () => void;
}) {
  const type = getSafeDreamType(entry.typeId);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="再びシェア"
      className={styles.shareModalBackdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.shareModalContent}>
        <p className={styles.shareModalTitle}>再びシェア</p>
        <ShareCard
          title={type?.name ?? '夢診断'}
          subtitle={themeLabels[entry.themeKey] ?? entry.themeKey}
          body={entry.summary}
          charaId={type?.id}
          theme="rose"
        />
        <button
          type="button"
          onClick={onClose}
          className={styles.shareModalCloseButton}
        >
          閉じる
        </button>
      </div>
    </div>
  );
}

/**
 * 1エントリーカード
 * 情報階層: テーマ + 日付 > 夢の内容（entry.text）> シンボル > シェア
 * HomeView の dreamCardWrapper 構造: 左辺 2px gold line + overflow:hidden で角丸内に収める。
 */
function EntryCard({
  entry,
  onShareRequest,
}: {
  entry: ArchiveEntry;
  onShareRequest: (e: ArchiveEntry) => void;
}) {
  const type = getSafeDreamType(entry.typeId);

  const dateLabel = (() => {
    const d = new Date(entry.timestamp);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const w = WEEKDAYS[d.getDay()];
    return `${mm}/${dd}（${w}）`;
  })();

  return (
    <div className={styles.entryCardWrapper}>
      <div className={styles.entryCard}>
        {/* 1. ヘッダー: タイプ名（主タイトル）+ 日付 */}
        <div className={styles.entryCardHeader}>
          <p className={styles.entryTypeName}>
            {type?.name ?? '夢診断'}
          </p>
          <p className={styles.entryDateLabel}>
            {dateLabel}
          </p>
        </div>

        {/* 2. 夢の内容（主役: body サイズ / 5行クランプ） */}
        <p className={styles.entryDreamText}>
          {entry.text}
        </p>

        {/* 3. シンボル（二次情報: 小さく / lavender） */}
        <p className={styles.entrySymbols}>
          {entry.summary}
        </p>

        {/* 4. シェア（三次アクション: 下部右寄せ / 控えめ） */}
        <div className={styles.entryShareRow}>
          <button
            type="button"
            aria-label="再びシェア"
            onClick={() => onShareRequest(entry)}
            className={styles.entryShareButton}
          >
            <Icon icon={Share2} size={13} strokeWidth={1.75} />
            シェア
          </button>
        </div>
      </div>
    </div>
  );
}

export function ArchiveView({ profile, onNavigate }: ArchiveViewProps = {}) {
  const [entries, setEntries] = useState<ArchiveEntry[]>(() => loadArchive());

  // 月ナビゲーション state
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [shareTarget, setShareTarget] = useState<ArchiveEntry | null>(null);

  // 検索 state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThemes, setSelectedThemes] = useState<Set<string>>(() => new Set());

  const isSearching = searchQuery.trim().length > 0 || selectedThemes.size > 0;

  // 検索結果のフィルタリング（テキスト+タグ AND条件）
  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const q = searchQuery.trim().toLowerCase();
    return entries
      .filter((e) => {
        if (selectedThemes.size > 0 && !selectedThemes.has(e.themeKey)) return false;
        if (q.length > 0) {
          const haystack = `${e.text} ${e.summary}`.toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [entries, searchQuery, selectedThemes, isSearching]);

  const toggleTheme = (key: string) => {
    setSelectedThemes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedThemes(new Set());
  };

  // 現在表示月にエントリーがある日のSet
  const entryDays = useMemo(() => {
    const set = new Set<number>();
    for (const e of entries) {
      const d = new Date(e.timestamp);
      if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
        set.add(d.getDate());
      }
    }
    return set;
  }, [entries, viewYear, viewMonth]);

  // 選択日のエントリー一覧
  const selectedEntries = useMemo(() => {
    if (selectedDay === null) return [];
    return entries.filter((e) => {
      const d = new Date(e.timestamp);
      return (
        d.getFullYear() === viewYear &&
        d.getMonth() === viewMonth &&
        d.getDate() === selectedDay
      );
    });
  }, [entries, viewYear, viewMonth, selectedDay]);

  // カレンダー日付セルの生成
  const calendarCells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: Array<{
      day: number;
      isCurrentMonth: boolean;
    }> = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, isCurrentMonth: true });
    }
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, isCurrentMonth: false });
    }

    return cells;
  }, [viewYear, viewMonth]);

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === day;

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
    setSelectedDay(null);
  };

  const handleClear = () => {
    if (window.confirm('夢の記録を全部削除するよ。もとに戻せないよ。本当にいい？')) {
      clearArchive();
      setEntries([]);
      setSelectedDay(null);
    }
  };

  // 空状態
  if (entries.length === 0) {
    const guardianId = profile?.sign ? getCharaIdBySign(profile.sign, profile.gender) : undefined;
    return (
      <div className={styles.emptyRoot}>
        {guardianId && (
          <div className={styles.emptyCharaWrap}>
            <CharaAvatar id={guardianId} size={120} animate />
          </div>
        )}
        <div>
          <p className={styles.emptyTitle}>
            まだ夢の記録がないよ
          </p>
          <p className={styles.emptyDesc}>
            最初の夢を、記録してみて
          </p>
        </div>
        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('dream')}
            className={styles.emptyCtaButton}
          >
            夢をよみとく
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      {/* シェアモーダル */}
      {shareTarget && (
        <ShareModal
          entry={shareTarget}
          onClose={() => setShareTarget(null)}
        />
      )}

      <div className={styles.root}>
        {/* BackHeader */}
        <BackHeader onBack={() => history.back()} title="履歴" />

        {/* ページヘッダー: 件数表示 */}
        <header className={styles.pageHeader}>
          <p className={styles.entryCount}>{entries.length}件の夢の記録</p>
        </header>

        {/* 検索セクション（検索バー + テーマタグ） */}
        <div className={styles.searchSection}>
          <div className={styles.searchInputWrap}>
            <input
              type="search"
              aria-label="夢の記録を検索"
              placeholder="夢のことばで探す（例: 海・追われる）"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="検索をクリア"
                onClick={() => setSearchQuery('')}
                className={styles.searchClearButton}
              >
                <Icon icon={X} size={14} />
              </button>
            )}
          </div>

          {/* テーマタグチップ */}
          <div className={styles.themeChips}>
            {Object.entries(themeLabels).map(([key, label]) => {
              const active = selectedThemes.has(key);
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleTheme(key)}
                  className={`${styles.themeChip}${active ? ` ${styles.themeChipActive}` : ''}`}
                >
                  {label}
                </button>
              );
            })}
            {isSearching && (
              <button
                type="button"
                onClick={clearSearch}
                className={styles.themeChipClear}
              >
                すべて解除
              </button>
            )}
          </div>
        </div>

        {/* 検索結果リスト or 月カレンダー */}
        {isSearching ? (
          <div className={styles.searchResults}>
            <p className={styles.searchResultCount}>
              {searchResults.length}件の夢が見つかったよ
            </p>
            {searchResults.length === 0 ? (
              <div className={styles.noResultRoot}>
                <p className={styles.noResultTitle}>
                  その夢の記録は見つからなかったよ
                </p>
                <p className={styles.noResultDesc}>
                  別のことばや、テーマで探してみて
                </p>
              </div>
            ) : (
              <div className={styles.searchResultList}>
                {searchResults.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setShareTarget(entry)}
                    className={styles.searchResultCard}
                  >
                    <div className={styles.searchResultMeta}>
                      <span className={styles.searchResultTheme}>
                        {themeLabels[entry.themeKey] ?? entry.themeKey}
                      </span>
                      <span className={styles.searchResultDate}>
                        {new Date(entry.timestamp).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className={styles.searchResultText}>
                      {entry.text}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* 月ナビゲーション */}
            <div className={styles.monthHeader}>
              <button
                type="button"
                aria-label="前の月"
                onClick={handlePrevMonth}
                className={styles.monthNavButton}
              >
                ‹
              </button>
              <p className={styles.monthTitle}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </p>
              <button
                type="button"
                aria-label="次の月"
                onClick={handleNextMonth}
                className={styles.monthNavButton}
              >
                ›
              </button>
            </div>

            {/* 曜日ヘッダー */}
            <div className={styles.weekdayRow}>
              {WEEKDAYS.map((w) => (
                <span key={w} className={styles.weekdayLabel}>{w}</span>
              ))}
            </div>

            {/* カレンダーグリッド */}
            <div className={styles.calendarGrid}>
              {calendarCells.map((cell, i) => {
                const hasEntry = cell.isCurrentMonth && entryDays.has(cell.day);
                const isSelected = cell.isCurrentMonth && selectedDay === cell.day;
                const isTodayCell = cell.isCurrentMonth && isToday(cell.day);

                // CSS Module クラスを条件で合成
                const cellClasses = [
                  styles.calCell,
                  isTodayCell && styles.calCellToday,
                  hasEntry && styles.calCellHasEntry,
                  isSelected && styles.calCellSelected,
                  !cell.isCurrentMonth && styles.calCellOtherMonth,
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <button
                    key={`${cell.isCurrentMonth ? 'cur' : 'other'}-${i}`}
                    type="button"
                    onClick={() => {
                      if (!cell.isCurrentMonth || !hasEntry) return;
                      setSelectedDay(
                        selectedDay === cell.day ? null : cell.day,
                      );
                    }}
                    aria-label={
                      cell.isCurrentMonth
                        ? `${cell.day}日${hasEntry ? '（夢の記録あり）' : ''}`
                        : undefined
                    }
                    aria-pressed={isSelected}
                    className={cellClasses}
                    tabIndex={cell.isCurrentMonth && hasEntry ? 0 : -1}
                  >
                    {cell.day}
                    {/* エントリードット */}
                    {hasEntry && (
                      <span
                        aria-hidden="true"
                        className={styles.entryDot}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* 選択日 エントリーパネル */}
            {selectedDay !== null && (
              <div className={styles.entryPanel}>
                {selectedEntries.length > 0 ? (
                  selectedEntries.map((e) => (
                    <EntryCard
                      key={e.id}
                      entry={e}
                      onShareRequest={setShareTarget}
                    />
                  ))
                ) : (
                  <div className={styles.noEntryDay}>
                    この日は夢の記録がないよ
                  </div>
                )}
              </div>
            )}

            {/* 全削除ボタン */}
            <div className={styles.clearButtonWrap}>
              <Button variant="ghost" fullWidth onClick={handleClear}>
                夢の記録を全部削除
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
