import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ShareCard } from '@/components/ui/ShareCard';
import { CharaAvatar } from '@/components/ui/CharaAvatar';
import { loadArchive, clearArchive, type ArchiveEntry } from '@/lib/archive';
import { getDreamTypeById } from '@/data/dreamTypes';
import type { UserProfile } from '@/lib/firestore';

const SIGN_CHARA_MAP: Record<string, string> = {
  牡羊座: 'yume_kobuta',
  牡牛座: 'komorebi_shika',
  双子座: 'mori_risu',
  蟹座: 'ame_iruka',
  獅子座: 'taiyou_lion',
  乙女座: 'sakura_usagi',
  天秤座: 'hana_panda',
  蠍座: 'mayonaka_neko',
  射手座: 'kaze_uma',
  山羊座: 'hoshi_kuma',
  水瓶座: 'sora_unicorn',
  魚座: 'umi_rakko',
};

interface ArchiveViewProps {
  profile?: UserProfile | null;
  onNavigate?: (view: 'home' | 'dream' | 'fortune' | 'archive') => void;
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
  const type = getDreamTypeById(entry.typeId);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="再びシェア"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(10,8,16,0.88)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: 'var(--card)',
          borderRadius: 20,
          padding: '24px 20px',
          width: '100%',
          maxWidth: 400,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <p
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--t1)',
            letterSpacing: '0.05em',
          }}
        >
          再びシェア
        </p>
        <ShareCard
          title={type?.name ?? '夢診断'}
          subtitle={themeLabels[entry.themeKey] ?? entry.themeKey}
          body={entry.summary}
          charaId={type?.id}
          theme="rose"
        />
        <button
          onClick={onClose}
          style={{
            marginTop: 4,
            fontSize: 12,
            color: 'var(--t3)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            minHeight: 44,
            padding: '8px 16px',
          }}
        >
          閉じる
        </button>
      </div>
    </div>
  );
}

/** 1エントリーカード */
function EntryCard({
  entry,
  onShareRequest,
}: {
  entry: ArchiveEntry;
  onShareRequest: (e: ArchiveEntry) => void;
}) {
  const type = getDreamTypeById(entry.typeId);
  return (
    <div
      style={{
        padding: 16,
        background: 'var(--card)',
        borderRadius: 14,
        border: '1px solid var(--border)',
        marginBottom: 8,
        position: 'relative',
      }}
    >
      {/* 右上: 再びシェアボタン */}
      <button
        aria-label="再びシェア"
        onClick={() => onShareRequest(entry)}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--rose)',
          background: 'rgba(232,98,124,0.10)',
          border: '1px solid rgba(232,98,124,0.25)',
          borderRadius: 8,
          padding: '4px 10px',
          cursor: 'pointer',
          minHeight: 32,
          lineHeight: 1,
          letterSpacing: '0.04em',
        }}
      >
        再びシェア
      </button>

      {/* ヘッダー */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 8,
          paddingRight: 72, // シェアボタン分の余白
        }}
      >
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>
          {type?.name ?? '夢診断'}
        </p>
        <p style={{ fontSize: 11, color: 'var(--t3)' }}>
          {themeLabels[entry.themeKey] ?? entry.themeKey}
        </p>
      </div>

      {/* シンボル */}
      <p
        style={{
          fontSize: 12,
          color: 'var(--lavender)',
          fontWeight: 700,
          marginBottom: 4,
        }}
      >
        シンボル: {entry.summary}
      </p>

      {/* 本文（3行クランプ） */}
      <p
        style={{
          fontSize: 12,
          color: 'var(--t2)',
          lineHeight: 1.7,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          textOverflow: 'ellipsis',
        }}
      >
        {entry.text}
      </p>
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
    const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=日
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    // 前月の末尾日付
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: Array<{
      day: number;
      isCurrentMonth: boolean;
    }> = [];

    // 前月の埋め
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
    }
    // 当月
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, isCurrentMonth: true });
    }
    // 翌月の埋め（6行になるよう調整）
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
    if (window.confirm('この日記をしまうよ。すべての夜の記録が消えるよ。いい？')) {
      clearArchive();
      setEntries([]);
      setSelectedDay(null);
    }
  };

  // 空状態
  if (entries.length === 0) {
    const guardianId = profile?.sign ? SIGN_CHARA_MAP[profile.sign] : undefined;
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
          padding: '40px 24px',
          textAlign: 'center',
          gap: 24,
        }}
      >
        {guardianId && (
          <div style={{ width: 120, height: 120, opacity: 0.92 }}>
            <CharaAvatar id={guardianId} size={120} animate />
          </div>
        )}
        <div>
          <p
            style={{
              fontFamily: 'var(--font-accent)',
              fontStyle: 'italic',
              fontSize: 24,
              color: 'var(--t1)',
              lineHeight: 1.6,
              marginBottom: 8,
            }}
          >
            まだあなたの夜は、白紙のまま
          </p>
          <p style={{ fontSize: 13, color: 'var(--t3)', lineHeight: 1.7 }}>
            最初の1夜を、ここに。
          </p>
        </div>
        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('dream')}
            style={{
              minHeight: 52,
              padding: '14px 32px',
              borderRadius: 14,
              border: 'none',
              background: 'var(--grad)',
              color: '#fff',
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '0.04em',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(240, 128, 154, 0.28)',
              transition: 'transform 200ms ease, box-shadow 200ms ease',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            夢を、夜にあずける
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

      <div style={{ paddingBottom: 32 }}>
        {/* archive-hero */}
        <header
          style={{
            padding: '40px 24px 24px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-accent)',
              fontStyle: 'italic',
              fontSize: 13,
              color: 'var(--t3)',
              letterSpacing: '0.1em',
              margin: 0,
            }}
          >
            Dream Journal
          </p>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--t1)',
              letterSpacing: '0.04em',
              margin: '4px 0 8px',
            }}
          >
            夜の日記
          </h2>
          <p style={{ fontSize: 12, color: 'var(--t3)', margin: 0 }}>
            {entries.length}件の夢の記録
          </p>
        </header>

        {/* month-header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px 16px',
          }}
        >
          <button
            aria-label="前の月"
            onClick={handlePrevMonth}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--t1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 16,
              minHeight: 44,
              minWidth: 44,
            }}
          >
            ‹
          </button>

          <p
            style={{
              fontFamily: 'var(--font-accent)',
              fontStyle: 'italic',
              fontSize: 20,
              color: 'var(--t1)',
              margin: 0,
            }}
          >
            {MONTH_NAMES[viewMonth]} {viewYear}
          </p>

          <button
            aria-label="次の月"
            onClick={handleNextMonth}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--t1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 16,
              minHeight: 44,
              minWidth: 44,
            }}
          >
            ›
          </button>
        </div>

        {/* weekday-labels */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            padding: '0 16px 8px',
            textAlign: 'center',
          }}
        >
          {WEEKDAYS.map((w) => (
            <span
              key={w}
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--t3)',
                letterSpacing: '0.06em',
              }}
            >
              {w}
            </span>
          ))}
        </div>

        {/* calendar-grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 4,
            padding: '0 16px',
          }}
        >
          {calendarCells.map((cell, i) => {
            const hasEntry = cell.isCurrentMonth && entryDays.has(cell.day);
            const isSelected = cell.isCurrentMonth && selectedDay === cell.day;
            const isTodayCell = cell.isCurrentMonth && isToday(cell.day);

            // セルのスタイルを合成
            const cellStyle: React.CSSProperties = {
              aspectRatio: '1',
              borderRadius: '50%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              minHeight: 40,
              fontSize: 13,
              cursor: cell.isCurrentMonth && hasEntry ? 'pointer' : 'default',
              transition: 'background 200ms ease',
              border: isTodayCell ? '1.5px solid var(--lavender)' : 'none',
              background: isSelected ? 'var(--rose)' : 'transparent',
              color: isSelected
                ? '#fff'
                : isTodayCell
                  ? 'var(--lavender)'
                  : hasEntry
                    ? 'var(--t1)'
                    : 'var(--t2)',
              opacity: !cell.isCurrentMonth ? 0.4 : 1,
              pointerEvents: !cell.isCurrentMonth ? 'none' : 'auto',
              outline: 'none',
            };

            return (
              <button
                key={`${cell.isCurrentMonth ? 'cur' : 'other'}-${i}`}
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
                style={cellStyle}
                tabIndex={cell.isCurrentMonth && hasEntry ? 0 : -1}
              >
                {cell.day}
                {/* エントリードット */}
                {hasEntry && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      bottom: 4,
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      background: isSelected ? '#fff' : 'var(--rose)',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* entry-panel: 選択日のエントリー詳細 */}
        {selectedDay !== null && (
          <div
            style={{
              margin: '16px 16px 0',
              animation: 'slideUp 300ms ease both',
            }}
          >
            {selectedEntries.length > 0 ? (
              selectedEntries.map((e) => (
                <EntryCard
                  key={e.id}
                  entry={e}
                  onShareRequest={setShareTarget}
                />
              ))
            ) : (
              <div
                style={{
                  padding: '20px 16px',
                  textAlign: 'center',
                  fontSize: 13,
                  color: 'var(--t3)',
                }}
              >
                この日は夢の記録がないよ
              </div>
            )}
          </div>
        )}

        {/* clear-button */}
        <div style={{ margin: '16px 16px 32px' }}>
          <Button variant="ghost" fullWidth onClick={handleClear}>
            この日記をしまう（全削除）
          </Button>
        </div>
      </div>

      {/* slideUp アニメーション */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
