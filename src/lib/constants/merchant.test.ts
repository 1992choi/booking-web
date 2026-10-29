import { describe, expect, it } from 'vitest';
import { merchantTypeBadgeVariants } from './merchant';

describe('merchantTypeBadgeVariants', () => {
  it('업체 유형별로 다른 배경/텍스트 색상 클래스를 반환한다', () => {
    expect(merchantTypeBadgeVariants({ type: 'PENSION' })).toContain('bg-blue-50');
    expect(merchantTypeBadgeVariants({ type: 'CLASS' })).toContain('bg-green-50');
    expect(merchantTypeBadgeVariants({ type: 'FACILITY' })).toContain('bg-purple-50');
  });

  it('공통 배지 스타일을 포함한다', () => {
    const className = merchantTypeBadgeVariants({ type: 'PENSION' });
    expect(className).toContain('rounded-full');
    expect(className).toContain('text-xs');
  });
});
