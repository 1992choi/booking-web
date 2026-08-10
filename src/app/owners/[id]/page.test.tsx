// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MerchantPublicDetailPage from './page';
import { useAuthStore } from '@/lib/store/auth';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
  usePathname: () => '/owners/1',
  useRouter: () => ({ push }),
}));

const getMerchant = vi.fn();
vi.mock('@/lib/api/merchants', () => ({
  getMerchant: (...args: unknown[]) => getMerchant(...args),
}));

const getAvailableTimes = vi.fn();
vi.mock('@/lib/api/resources', () => ({
  getAvailableTimes: (...args: unknown[]) => getAvailableTimes(...args),
}));

const createReservation = vi.fn();
vi.mock('@/lib/api/reservations', () => ({
  createReservation: (...args: unknown[]) => createReservation(...args),
}));

const getReviewsByMerchant = vi.fn();
const updateReview = vi.fn();
const deleteReview = vi.fn();
vi.mock('@/lib/api/reviews', () => ({
  getReviewsByMerchant: (...args: unknown[]) => getReviewsByMerchant(...args),
  updateReview: (...args: unknown[]) => updateReview(...args),
  deleteReview: (...args: unknown[]) => deleteReview(...args),
}));

const merchant = {
  id: 1,
  name: '한적한 펜션',
  phone: '010-1234-5678',
  type: 'PENSION' as const,
  resources: [
    { id: 10, merchantId: 1, name: 'A동', description: '조용한 방', price: 100000, maxCapacity: 4 },
  ],
};

const review = {
  id: 1,
  reservationId: 5,
  merchantId: 1,
  userId: 99,
  content: '좋았어요',
  createdAt: '2024-05-01T09:00:00',
  updatedAt: '2024-05-01T09:00:00',
};

function resetAuth() {
  useAuthStore.setState({
    accessToken: null,
    refreshToken: null,
    user: null,
    role: null,
    isAuthenticated: false,
  });
}

beforeEach(() => {
  push.mockClear();
  getMerchant.mockReset();
  getAvailableTimes.mockReset();
  createReservation.mockReset();
  getReviewsByMerchant.mockReset();
  getReviewsByMerchant.mockResolvedValue([]);
  resetAuth();
});

describe('MerchantPublicDetailPage', () => {
  it('업체 정보와 예약 대상을 보여준다', async () => {
    getMerchant.mockResolvedValue(merchant);

    render(<MerchantPublicDetailPage />);

    expect(await screen.findByText('한적한 펜션')).toBeInTheDocument();
    expect(screen.getByText('A동')).toBeInTheDocument();
  });

  it('불러오기 실패 시 에러 메시지를 보여준다', async () => {
    getMerchant.mockRejectedValue(new Error('network error'));

    render(<MerchantPublicDetailPage />);

    expect(await screen.findByText('업체 정보를 불러오지 못했습니다.')).toBeInTheDocument();
  });

  it('리뷰 목록을 보여준다', async () => {
    getMerchant.mockResolvedValue(merchant);
    getReviewsByMerchant.mockResolvedValue([review]);

    render(<MerchantPublicDetailPage />);

    expect(await screen.findByText('좋았어요')).toBeInTheDocument();
    expect(screen.getByText('이용 후기 (1)')).toBeInTheDocument();
  });

  it('비로그인 상태에서 예약을 시도하면 로그인 페이지로 이동한다', async () => {
    getMerchant.mockResolvedValue(merchant);
    getAvailableTimes.mockResolvedValue([
      { id: 100, startTime: '2024-05-01T09:00:00', endTime: '2024-05-01T10:00:00', status: 'OPEN' },
    ]);

    render(<MerchantPublicDetailPage />);
    await screen.findByText('A동');
    await userEvent.click(screen.getByText('예약 가능 시간 보기'));

    const slot = await screen.findByText('09:00 ~ 10:00');
    await userEvent.click(slot);
    await userEvent.click(screen.getByText('예약하기'));

    expect(push).toHaveBeenCalledWith('/login?redirect=%2Fowners%2F1');
    expect(createReservation).not.toHaveBeenCalled();
  });

  it('로그인 상태에서 시간을 선택하고 예약하면 createReservation을 호출한다', async () => {
    useAuthStore.setState({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      user: { id: 1, name: '홍길동', email: 'hong@example.com', phone: '010-1234-5678', role: 'USER', createdAt: '2024-01-01T00:00:00' },
      role: 'USER',
      isAuthenticated: true,
    });
    getMerchant.mockResolvedValue(merchant);
    getAvailableTimes.mockResolvedValue([
      { id: 100, startTime: '2024-05-01T09:00:00', endTime: '2024-05-01T10:00:00', status: 'OPEN' },
    ]);
    createReservation.mockResolvedValue(undefined);

    render(<MerchantPublicDetailPage />);
    await screen.findByText('A동');
    await userEvent.click(screen.getByText('예약 가능 시간 보기'));

    const slot = await screen.findByText('09:00 ~ 10:00');
    await userEvent.click(slot);
    await userEvent.click(screen.getByText('예약하기'));

    await vi.waitFor(() =>
      expect(createReservation).toHaveBeenCalledWith({ resourceId: 10, availableTimeIds: [100], headCount: 1 })
    );
  });
});
