'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { shiftMonth } from '@/lib/utils/calendar';

function parseParam(raw: string | null, fallback: number, min: number, max: number) {
  const parsed = raw !== null ? Number(raw) : NaN;
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
}

export function useMonthNavigation(onChange?: () => void) {
  const now = new Date();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [year, setYear] = useState(() => parseParam(searchParams.get('year'), now.getFullYear(), 1970, 9999));
  const [month, setMonth] = useState(() => parseParam(searchParams.get('month'), now.getMonth() + 1, 1, 12));

  function navigate(nextYear: number, nextMonth: number) {
    setYear(nextYear);
    setMonth(nextMonth);

    const params = new URLSearchParams(searchParams.toString());
    params.set('year', String(nextYear));
    params.set('month', String(nextMonth));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });

    onChange?.();
  }

  function prevMonth() {
    const shifted = shiftMonth(year, month, -1);
    navigate(shifted.year, shifted.month);
  }

  function nextMonth() {
    const shifted = shiftMonth(year, month, 1);
    navigate(shifted.year, shifted.month);
  }

  return { year, month, prevMonth, nextMonth };
}
