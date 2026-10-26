// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMonthNavigation } from './useMonthNavigation';

const replace = vi.fn();
let searchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  usePathname: () => '/example',
  useRouter: () => ({ replace }),
  useSearchParams: () => searchParams,
}));

beforeEach(() => {
  replace.mockReset();
  searchParams = new URLSearchParams();
});

describe('useMonthNavigation', () => {
  it('현재 연/월로 초기화된다', () => {
    const now = new Date();
    const { result } = renderHook(() => useMonthNavigation());

    expect(result.current.year).toBe(now.getFullYear());
    expect(result.current.month).toBe(now.getMonth() + 1);
  });

  it('URL에 year/month 쿼리가 있으면 해당 값으로 초기화된다', () => {
    searchParams = new URLSearchParams('year=2024&month=5');
    const { result } = renderHook(() => useMonthNavigation());

    expect(result.current.year).toBe(2024);
    expect(result.current.month).toBe(5);
  });

  it('URL의 month가 범위를 벗어나면 현재 달로 초기화된다', () => {
    const now = new Date();
    searchParams = new URLSearchParams('year=2024&month=13');
    const { result } = renderHook(() => useMonthNavigation());

    expect(result.current.month).toBe(now.getMonth() + 1);
  });

  it('nextMonth를 호출하면 다음 달로 이동한다 (12월이면 해가 넘어간다)', () => {
    const { result } = renderHook(() => useMonthNavigation());
    const before = { year: result.current.year, month: result.current.month };

    act(() => result.current.nextMonth());

    const expected = before.month === 12
      ? { year: before.year + 1, month: 1 }
      : { year: before.year, month: before.month + 1 };
    expect(result.current.year).toBe(expected.year);
    expect(result.current.month).toBe(expected.month);
  });

  it('prevMonth를 호출하면 이전 달로 이동한다 (1월이면 해가 줄어든다)', () => {
    const { result } = renderHook(() => useMonthNavigation());
    const before = { year: result.current.year, month: result.current.month };

    act(() => result.current.prevMonth());

    const expected = before.month === 1
      ? { year: before.year - 1, month: 12 }
      : { year: before.year, month: before.month - 1 };
    expect(result.current.year).toBe(expected.year);
    expect(result.current.month).toBe(expected.month);
  });

  it('월 이동 시 URL의 year/month 쿼리를 갱신한다', () => {
    searchParams = new URLSearchParams('year=2024&month=5');
    const { result } = renderHook(() => useMonthNavigation());

    act(() => result.current.nextMonth());

    expect(replace).toHaveBeenLastCalledWith('/example?year=2024&month=6', { scroll: false });
  });

  it('월 이동 시 onChange 콜백을 호출한다', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useMonthNavigation(onChange));

    act(() => result.current.nextMonth());
    expect(onChange).toHaveBeenCalledTimes(1);

    act(() => result.current.prevMonth());
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});
