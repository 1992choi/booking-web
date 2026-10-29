import { describe, expect, it } from 'vitest';
import { reservationStatusBadgeVariants } from './reservation';

describe('reservationStatusBadgeVariants', () => {
  it('상태별로 다른 배경/텍스트 색상 클래스를 반환한다', () => {
    expect(reservationStatusBadgeVariants({ status: 'PENDING' })).toContain('bg-yellow-50');
    expect(reservationStatusBadgeVariants({ status: 'CONFIRMED' })).toContain('bg-blue-50');
    expect(reservationStatusBadgeVariants({ status: 'CANCELLED' })).toContain('bg-gray-100');
  });

  it('size를 지정하지 않으면 sm(px-2 py-0.5)을 사용한다', () => {
    expect(reservationStatusBadgeVariants({ status: 'PENDING' })).toContain('px-2 py-0.5');
  });

  it('size를 md로 지정하면 더 큰 패딩을 사용한다', () => {
    expect(reservationStatusBadgeVariants({ status: 'PENDING', size: 'md' })).toContain('px-2.5 py-1');
  });
});
