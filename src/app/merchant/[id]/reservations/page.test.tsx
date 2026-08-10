// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MerchantReservationsPage from './page';
import { renderWithQuery } from '@/lib/test-utils/renderWithQuery';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
  useRouter: () => ({ push: vi.fn() }),
}));

const getMerchantReservations = vi.fn();
vi.mock('@/lib/api/merchantReservations', () => ({
  getMerchantReservations: (...args: unknown[]) => getMerchantReservations(...args),
}));

const confirmReservation = vi.fn();
const cancelReservation = vi.fn();
vi.mock('@/lib/api/adminReservations', () => ({
  confirmReservation: (...args: unknown[]) => confirmReservation(...args),
  cancelReservation: (...args: unknown[]) => cancelReservation(...args),
}));

const reservation = {
  id: 100,
  resourceName: 'A동',
  headCount: 2,
  amount: 100000,
  status: 'PENDING' as const,
  startTime: '2024-05-01T09:00:00',
  endTime: '2024-05-01T10:00:00',
  userId: 5,
  userName: '홍길동',
};

beforeEach(() => {
  getMerchantReservations.mockReset();
  confirmReservation.mockReset();
  cancelReservation.mockReset();
});

describe('MerchantReservationsPage', () => {
  it('예약 목록을 불러와 보여준다', async () => {
    getMerchantReservations.mockResolvedValue({ content: [reservation] });
    renderWithQuery(<MerchantReservationsPage />);

    expect(await screen.findByText('A동')).toBeInTheDocument();
    expect(screen.getByText('홍길동')).toBeInTheDocument();
  });

  it('예약이 없으면 안내 문구를 보여준다', async () => {
    getMerchantReservations.mockResolvedValue({ content: [] });
    renderWithQuery(<MerchantReservationsPage />);

    expect(await screen.findByText('예약 내역이 없습니다.')).toBeInTheDocument();
  });

  it('불러오기 실패 시 에러 메시지를 보여준다', async () => {
    getMerchantReservations.mockRejectedValue(new Error('network error'));
    renderWithQuery(<MerchantReservationsPage />);

    expect(await screen.findByText('예약 목록을 불러오지 못했습니다.')).toBeInTheDocument();
  });

  it('확정 버튼을 누르면 confirmReservation을 호출한다', async () => {
    getMerchantReservations.mockResolvedValue({ content: [reservation] });
    confirmReservation.mockResolvedValue(undefined);
    renderWithQuery(<MerchantReservationsPage />);
    await screen.findByText('A동');

    const confirmButtons = screen.getAllByRole('button', { name: '확정' });
    await userEvent.click(confirmButtons[confirmButtons.length - 1]);

    await vi.waitFor(() => expect(confirmReservation).toHaveBeenCalledWith(100));
  });
});
