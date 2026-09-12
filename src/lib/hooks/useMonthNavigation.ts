import { useState } from 'react';
import { shiftMonth } from '@/lib/utils/calendar';

export function useMonthNavigation(onChange?: () => void) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  function prevMonth() {
    const shifted = shiftMonth(year, month, -1);
    setYear(shifted.year);
    setMonth(shifted.month);
    onChange?.();
  }

  function nextMonth() {
    const shifted = shiftMonth(year, month, 1);
    setYear(shifted.year);
    setMonth(shifted.month);
    onChange?.();
  }

  return { year, month, prevMonth, nextMonth };
}
