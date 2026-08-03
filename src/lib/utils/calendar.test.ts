import { describe, expect, it } from 'vitest';
import { buildCalendarGrid, shiftMonth, toDateKey } from './calendar';

describe('shiftMonth', () => {
  it('같은 해 안에서는 월만 이동한다', () => {
    expect(shiftMonth(2024, 6, 1)).toEqual({ year: 2024, month: 7 });
    expect(shiftMonth(2024, 6, -1)).toEqual({ year: 2024, month: 5 });
  });

  it('12월에서 다음 달로 이동하면 해가 넘어간다', () => {
    expect(shiftMonth(2024, 12, 1)).toEqual({ year: 2025, month: 1 });
  });

  it('1월에서 이전 달로 이동하면 해가 줄어든다', () => {
    expect(shiftMonth(2024, 1, -1)).toEqual({ year: 2023, month: 12 });
  });
});

describe('toDateKey', () => {
  it('한 자리 월/일을 0으로 패딩한다', () => {
    expect(toDateKey(2024, 1, 5)).toBe('2024-01-05');
  });

  it('두 자리 월/일은 그대로 사용한다', () => {
    expect(toDateKey(2024, 12, 25)).toBe('2024-12-25');
  });
});

describe('buildCalendarGrid', () => {
  it('모든 주는 7칸으로 채워진다', () => {
    const weeks = buildCalendarGrid(2024, 2);
    weeks.forEach((week) => expect(week).toHaveLength(7));
  });

  it('월 시작 요일만큼 첫 주 앞부분을 null로 채운다 (2024년 2월은 목요일 시작)', () => {
    const weeks = buildCalendarGrid(2024, 2);
    expect(weeks[0]).toEqual([null, null, null, null, 1, 2, 3]);
  });

  it('윤년 2월은 29일까지 채운다', () => {
    const weeks = buildCalendarGrid(2024, 2);
    const days = weeks.flat().filter((d): d is number => d !== null);
    expect(days).toEqual(Array.from({ length: 29 }, (_, i) => i + 1));
  });

  it('평년 2월은 28일까지 채운다', () => {
    const weeks = buildCalendarGrid(2023, 2);
    const days = weeks.flat().filter((d): d is number => d !== null);
    expect(days).toHaveLength(28);
  });

  it('마지막 주 남는 칸은 null로 패딩한다', () => {
    const weeks = buildCalendarGrid(2024, 2);
    const lastWeek = weeks[weeks.length - 1];
    const trailingNulls = lastWeek.filter((d) => d === null).length;
    expect(lastWeek).toHaveLength(7);
    // 2024-02-29 is a Thursday (index 4), so trailing 2 nulls (Fri, Sat)
    expect(trailingNulls).toBe(2);
  });
});
