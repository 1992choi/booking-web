// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ReservationDetailPage from './page';
import { renderWithQuery } from '@/lib/test-utils/renderWithQuery';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
  useRouter: () => ({ push: vi.fn() }),
}));

const cancelReservation = vi.fn();
const getReservation = vi.fn();
vi.mock('@/lib/api/reservations', () => ({
  cancelReservation: (...args: unknown[]) => cancelReservation(...args),
  getReservation: (...args: unknown[]) => getReservation(...args),
}));

const getPayment = vi.fn();
const refund = vi.fn();
vi.mock('@/lib/api/payments', () => ({
  getPayment: (...args: unknown[]) => getPayment(...args),
  refund: (...args: unknown[]) => refund(...args),
}));

const createReview = vi.fn();
vi.mock('@/lib/api/reviews', () => ({
  createReview: (...args: unknown[]) => createReview(...args),
}));

const baseReservation = {
  id: 1,
  resourceName: 'A동',
  headCount: 2,
  amount: 100000,
  startTime: '2024-05-01T09:00:00',
  endTime: '2024-05-01T10:00:00',
};

beforeEach(() => {
  cancelReservation.mockReset();
  getReservation.mockReset();
  getPayment.mockReset();
  refund.mockReset();
  createReview.mockReset();
});

describe('ReservationDetailPage', () => {
  it('예약 정보를 보여준다', async () => {
    getReservation.mockResolvedValue({ ...baseReservation, status: 'PENDING' });
    getPayment.mockRejectedValue(new Error('no payment yet'));

    renderWithQuery(<ReservationDetailPage />);

    expect(await screen.findByText('A동')).toBeInTheDocument();
    expect(screen.getByText('2명')).toBeInTheDocument();
  });

  it('불러오기 실패 시 에러 메시지를 보여준다', async () => {
    getReservation.mockRejectedValue(new Error('network error'));
    getPayment.mockRejectedValue(new Error('no payment yet'));

    renderWithQuery(<ReservationDetailPage />);

    expect(await screen.findByText('예약 정보를 불러오지 못했습니다.')).toBeInTheDocument();
  });

  it('PENDING/CONFIRMED 상태에서는 예약 취소 버튼을 보여주고 클릭하면 취소된다', async () => {
    getReservation.mockResolvedValue({ ...baseReservation, status: 'CONFIRMED' });
    getPayment.mockRejectedValue(new Error('no payment yet'));
    cancelReservation.mockResolvedValue(undefined);

    renderWithQuery(<ReservationDetailPage />);
    await screen.findByText('A동');

    await userEvent.click(screen.getByRole('button', { name: '예약 취소' }));

    await vi.waitFor(() => expect(cancelReservation).toHaveBeenCalledWith(1));
    expect(await screen.findByText('취소')).toBeInTheDocument();
  });

  it('결제 완료 후 취소된 예약은 환불 요청 버튼을 보여준다', async () => {
    getReservation.mockResolvedValue({ ...baseReservation, status: 'CANCELLED' });
    getPayment.mockResolvedValue({ id: 1, reservationId: 1, amount: 100000, status: 'COMPLETED', createdAt: '2024-05-01T09:00:00' });

    renderWithQuery(<ReservationDetailPage />);

    expect(await screen.findByRole('button', { name: '환불 요청' })).toBeInTheDocument();
  });

  it('CONFIRMED 예약에서 리뷰를 등록할 수 있다', async () => {
    getReservation.mockResolvedValue({ ...baseReservation, status: 'CONFIRMED' });
    getPayment.mockRejectedValue(new Error('no payment yet'));
    createReview.mockResolvedValue(undefined);

    renderWithQuery(<ReservationDetailPage />);
    await screen.findByText('A동');

    await userEvent.type(screen.getByPlaceholderText('이용하신 소감을 남겨주세요.'), '좋았어요');
    await userEvent.click(screen.getByRole('button', { name: '리뷰 등록' }));

    await vi.waitFor(() => expect(createReview).toHaveBeenCalledWith({ reservationId: 1, content: '좋았어요' }));
    expect(await screen.findByText('리뷰가 등록되었습니다. 감사합니다!')).toBeInTheDocument();
  });
});
