// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useMonthNavigation } from './useMonthNavigation';

describe('useMonthNavigation', () => {
  it('현재 연/월로 초기화된다', () => {
    const now = new Date();
    const { result } = renderHook(() => useMonthNavigation());

    expect(result.current.year).toBe(now.getFullYear());
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

  it('월 이동 시 onChange 콜백을 호출한다', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useMonthNavigation(onChange));

    act(() => result.current.nextMonth());
    expect(onChange).toHaveBeenCalledTimes(1);

    act(() => result.current.prevMonth());
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});
