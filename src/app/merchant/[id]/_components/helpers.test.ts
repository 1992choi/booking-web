import { describe, expect, it } from 'vitest';
import { availableTimeStatusBadgeVariants } from './helpers';

describe('availableTimeStatusBadgeVariants', () => {
  it('상태별로 다른 배경/텍스트 색상 클래스를 반환한다', () => {
    expect(availableTimeStatusBadgeVariants({ status: 'OPEN' })).toContain('bg-green-50');
    expect(availableTimeStatusBadgeVariants({ status: 'BLOCKED' })).toContain('bg-red-50');
  });
});
