// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ReservationStatusBadge, ReservationSummaryRows } from './ReservationSummary';
import { formatDate, formatPrice, formatTime } from '@/lib/utils/format';

describe('ReservationStatusBadge', () => {
  it.each([
    ['PENDING', '대기 중'],
    ['CONFIRMED', '확정'],
    ['CANCELLED', '취소'],
  ] as const)('%s 상태는 "%s" 라벨을 보여준다', (status, label) => {
    render(<ReservationStatusBadge status={status} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });
});

describe('ReservationSummaryRows', () => {
  const startTime = '2024-05-01T09:00:00';
  const endTime = '2024-05-01T10:30:00';

  it('날짜·시간·인원·금액을 포맷해 보여준다', () => {
    render(
      <ReservationSummaryRows startTime={startTime} endTime={endTime} headCount={3} amount={150000} />
    );

    expect(screen.getByText(formatDate(startTime))).toBeInTheDocument();
    expect(screen.getByText(`${formatTime(startTime)} ~ ${formatTime(endTime)}`)).toBeInTheDocument();
    expect(screen.getByText('3명')).toBeInTheDocument();
    expect(screen.getByText(formatPrice(150000))).toBeInTheDocument();
  });
});
