// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MyReservationsPage from './page';
import { renderWithQuery } from '@/lib/test-utils/renderWithQuery';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const getMyReservations = vi.fn();
vi.mock('@/lib/api/reservations', () => ({
  getMyReservations: (...args: unknown[]) => getMyReservations(...args),
}));

const reservation = {
  id: 1,
  resourceName: 'A동',
  headCount: 2,
  amount: 100000,
  status: 'CONFIRMED' as const,
  startTime: '2024-05-01T09:00:00',
  endTime: '2024-05-01T10:00:00',
};

beforeEach(() => {
  getMyReservations.mockReset();
});

describe('MyReservationsPage', () => {
  it('예약 목록을 불러와 보여준다', async () => {
    getMyReservations.mockResolvedValue({ content: [reservation], page: 0, totalPages: 1 });
    renderWithQuery(<MyReservationsPage />);

    expect(await screen.findByText('A동')).toBeInTheDocument();
    expect(screen.queryByText('더 보기')).not.toBeInTheDocument();
  });

  it('예약이 없으면 안내 문구를 보여준다', async () => {
    getMyReservations.mockResolvedValue({ content: [], page: 0, totalPages: 0 });
    renderWithQuery(<MyReservationsPage />);

    expect(await screen.findByText('예약 내역이 없습니다.')).toBeInTheDocument();
  });

  it('불러오기 실패 시 에러 메시지를 보여준다', async () => {
    getMyReservations.mockRejectedValue(new Error('network error'));
    renderWithQuery(<MyReservationsPage />);

    expect(await screen.findByText('예약 목록을 불러오지 못했습니다.')).toBeInTheDocument();
  });

  it('다음 페이지가 있으면 더 보기 버튼으로 추가 로드한다', async () => {
    getMyReservations.mockResolvedValueOnce({ content: [reservation], page: 0, totalPages: 2 });
    renderWithQuery(<MyReservationsPage />);
    await screen.findByText('A동');

    getMyReservations.mockResolvedValueOnce({
      content: [{ ...reservation, id: 2, resourceName: 'B동' }],
      page: 1,
      totalPages: 2,
    });
    await userEvent.click(screen.getByText('더 보기'));

    expect(await screen.findByText('B동')).toBeInTheDocument();
    expect(screen.getByText('A동')).toBeInTheDocument();
  });
});
