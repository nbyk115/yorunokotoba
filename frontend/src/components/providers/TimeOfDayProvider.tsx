import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { getTimeOfDay, applyTimeOfDay, type TimeOfDay } from '@/lib/timeOfDay';

const TimeOfDayContext = createContext<TimeOfDay>('night');

/** 現在の TimeOfDay を返すフック。TimeOfDayProvider の子孫で呼ぶ。 */
export function useTimeOfDay(): TimeOfDay {
  return useContext(TimeOfDayContext);
}

interface TimeOfDayProviderProps {
  children: ReactNode;
}

/**
 * アプリ全体を囲むプロバイダ。
 * マウント時および1分ごとに時間帯を再判定し、
 * document.documentElement.dataset.timeOfDay を更新する。
 * Context 値も同期するので、子孫コンポーネントが useTimeOfDay() で参照可能。
 */
export function TimeOfDayProvider({ children }: TimeOfDayProviderProps) {
  const [tod, setTod] = useState<TimeOfDay>(() => {
    const initial = getTimeOfDay();
    applyTimeOfDay(initial);
    return initial;
  });

  useEffect(() => {
    const tick = () => {
      const next = getTimeOfDay();
      setTod((prev) => {
        if (prev !== next) {
          applyTimeOfDay(next);
          return next;
        }
        return prev;
      });
    };

    // 次の分の頭に合わせて起動し、以降は 60 秒ごとに実行する
    const now = new Date();
    const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const timeoutId = setTimeout(() => {
      tick();
      intervalId = setInterval(tick, 60_000);
    }, msToNextMinute);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId !== null) clearInterval(intervalId);
    };
  }, []);

  return (
    <TimeOfDayContext.Provider value={tod}>
      {children}
    </TimeOfDayContext.Provider>
  );
}
