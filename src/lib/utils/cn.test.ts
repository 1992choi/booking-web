import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('여러 클래스를 하나의 문자열로 합친다', () => {
    expect(cn('text-sm', 'font-bold')).toBe('text-sm font-bold');
  });

  it('조건부로 거짓인 값은 무시한다', () => {
    expect(cn('text-sm', false && 'hidden', undefined, 'font-bold')).toBe('text-sm font-bold');
  });

  it('충돌하는 Tailwind 유틸리티는 나중 값으로 병합한다', () => {
    expect(cn('font-semibold', 'font-medium')).toBe('font-medium');
    expect(cn('px-2 py-0.5', 'px-4')).toBe('py-0.5 px-4');
  });
});
