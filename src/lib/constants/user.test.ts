import { describe, expect, it } from 'vitest';
import { roleBadgeVariants } from './user';

describe('roleBadgeVariants', () => {
  it('역할별로 다른 배경/텍스트 색상 클래스를 반환한다', () => {
    expect(roleBadgeVariants({ role: 'USER' })).toContain('bg-gray-100');
    expect(roleBadgeVariants({ role: 'MERCHANT' })).toContain('bg-blue-50');
    expect(roleBadgeVariants({ role: 'ADMIN' })).toContain('bg-purple-50');
  });
});
