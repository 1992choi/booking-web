// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MerchantStatsPage from './page';
import { renderWithQuery } from '@/lib/test-utils/renderWithQuery';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
  useRouter: () => ({ push: vi.fn() }),
}));

const getMerchantDailyStats = vi.fn();
vi.mock('@/lib/api/merchants', () => ({
  getMerchantDailyStats: (...args: unknown[]) => getMerchantDailyStats(...args),
}));

const stats = [
  { statDate: '2024-05-10', confirmedCount: 3, cancelledCount: 1, totalRevenue: 300000 },
];

beforeEach(() => {
  getMerchantDailyStats.mockReset();
});

describe('MerchantStatsPage', () => {
  it('일별 매출 데이터를 보여준다', async () => {
    getMerchantDailyStats.mockResolvedValue(stats);
    renderWithQuery(<MerchantStatsPage />);

    expect(await screen.findByText('확정 3건')).toBeInTheDocument();
    expect(screen.getByText('취소 1건')).toBeInTheDocument();
    expect(screen.getAllByText('300,000원').length).toBeGreaterThan(0);
  });

  it('데이터가 없으면 안내 문구를 보여준다', async () => {
    getMerchantDailyStats.mockResolvedValue([]);
    renderWithQuery(<MerchantStatsPage />);

    expect(await screen.findByText('이 달의 매출 데이터가 없습니다.')).toBeInTheDocument();
  });

  it('불러오기 실패 시 에러 메시지를 보여준다', async () => {
    getMerchantDailyStats.mockRejectedValue(new Error('network error'));
    renderWithQuery(<MerchantStatsPage />);

    expect(await screen.findByText('매출 데이터를 불러오지 못했습니다.')).toBeInTheDocument();
  });

  it('월 이동 버튼을 누르면 다른 달을 조회한다', async () => {
    getMerchantDailyStats.mockResolvedValue([]);
    renderWithQuery(<MerchantStatsPage />);
    await screen.findByText('이 달의 매출 데이터가 없습니다.');

    const callsBefore = getMerchantDailyStats.mock.calls.length;
    await userEvent.click(screen.getByText('›'));

    await vi.waitFor(() => expect(getMerchantDailyStats.mock.calls.length).toBeGreaterThan(callsBefore));
  });
});
