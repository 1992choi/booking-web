import { describe, expect, it } from 'vitest';
import { paymentStatusBadgeVariants } from './payment';

describe('paymentStatusBadgeVariants', () => {
  it('상태별로 다른 배경/텍스트 색상 클래스를 반환한다', () => {
    expect(paymentStatusBadgeVariants({ status: 'PENDING' })).toContain('bg-yellow-50');
    expect(paymentStatusBadgeVariants({ status: 'COMPLETED' })).toContain('bg-green-50');
    expect(paymentStatusBadgeVariants({ status: 'FAILED' })).toContain('bg-red-50');
    expect(paymentStatusBadgeVariants({ status: 'REFUNDED' })).toContain('bg-gray-100');
  });

  it('공통 배지 스타일을 포함한다', () => {
    const className = paymentStatusBadgeVariants({ status: 'COMPLETED' });
    expect(className).toContain('rounded-full');
    expect(className).toContain('text-xs');
  });
});
