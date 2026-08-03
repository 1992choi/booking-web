import { describe, expect, it } from 'vitest';
import { formatDate, formatDateTime, formatPrice, formatTime, today } from './format';

describe('formatPrice', () => {
  it('천 단위 구분 기호와 "원"을 붙인다', () => {
    expect(formatPrice(1000)).toBe('1,000원');
  });

  it('0원도 처리한다', () => {
    expect(formatPrice(0)).toBe('0원');
  });
});

describe('formatTime', () => {
  it('타임존 없는 ISO 문자열을 KST 기준 24시간제 시:분으로 변환한다', () => {
    expect(formatTime('2024-01-15T10:30:00')).toBe('10:30');
  });

  it('공백으로 구분된 날짜/시간 문자열도 처리한다', () => {
    expect(formatTime('2024-01-15 10:30:00')).toBe('10:30');
  });

  it('밀리초가 포함된 문자열도 처리한다', () => {
    expect(formatTime('2024-01-15T10:30:00.123')).toBe('10:30');
  });

  it('viewer 타임존과 무관하게 항상 KST로 표시한다', () => {
    const originalTZ = process.env.TZ;
    process.env.TZ = 'America/New_York';
    expect(formatTime('2024-01-15T10:30:00')).toBe('10:30');
    process.env.TZ = originalTZ;
  });
});

describe('formatDate', () => {
  it('타임존 없는 ISO 문자열을 "년 월 일" 형식으로 변환한다', () => {
    expect(formatDate('2024-01-15T10:30:00')).toBe('2024년 1월 15일');
  });
});

describe('formatDateTime', () => {
  it('타임존 없는 ISO 문자열을 "월 일 시:분" 형식으로 변환한다', () => {
    expect(formatDateTime('2024-01-15T10:30:00')).toBe('1월 15일 10:30');
  });

  it('유효하지 않은 날짜 문자열은 그대로 반환한다', () => {
    expect(formatDateTime('invalid-date')).toBe('invalid-date');
  });
});

describe('today', () => {
  it('YYYY-MM-DD 형식의 오늘 날짜를 반환한다', () => {
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
