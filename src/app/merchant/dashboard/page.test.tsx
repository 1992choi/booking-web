// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MerchantDashboardPage from './page';
import { useAuthStore } from '@/lib/store/auth';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const getMerchants = vi.fn();
const getMyMerchants = vi.fn();
vi.mock('@/lib/api/merchants', () => ({
  getMerchants: (...args: unknown[]) => getMerchants(...args),
  getMyMerchants: (...args: unknown[]) => getMyMerchants(...args),
}));

function setRole(role: 'MERCHANT' | 'ADMIN') {
  useAuthStore.setState({
    accessToken: 'access-1',
    refreshToken: 'refresh-1',
    user: { id: 1, name: '김사장', email: 'kim@example.com', phone: '010-1234-5678', role, createdAt: '2024-01-01T00:00:00' },
    role,
    isAuthenticated: true,
  });
}

beforeEach(() => {
  getMerchants.mockReset();
  getMyMerchants.mockReset();
});

describe('MerchantDashboardPage', () => {
  it('MERCHANT는 본인 업체 목록을 조회하고 예약 관리 링크를 보여준다', async () => {
    setRole('MERCHANT');
    getMyMerchants.mockResolvedValue([{ id: 1, name: '한적한 펜션', type: 'PENSION' }]);

    render(<MerchantDashboardPage />);

    expect(await screen.findByText('한적한 펜션')).toBeInTheDocument();
    expect(screen.getByText('예약 관리')).toBeInTheDocument();
    expect(getMyMerchants).toHaveBeenCalled();
    expect(getMerchants).not.toHaveBeenCalled();
  });

  it('ADMIN은 전체 업체 목록을 조회하고 등록 링크는 숨긴다', async () => {
    setRole('ADMIN');
    getMerchants.mockResolvedValue([{ id: 1, name: '한적한 펜션', type: 'PENSION' }]);

    render(<MerchantDashboardPage />);

    expect(await screen.findByText('전체 등록 업체 목록입니다.')).toBeInTheDocument();
    expect(screen.queryByText('+ 업체 등록')).not.toBeInTheDocument();
    expect(getMerchants).toHaveBeenCalled();
  });

  it('목록이 비어 있으면 안내 문구를 보여준다', async () => {
    setRole('MERCHANT');
    getMyMerchants.mockResolvedValue([]);

    render(<MerchantDashboardPage />);

    expect(await screen.findByText('등록된 업체가 없습니다.')).toBeInTheDocument();
  });

  it('불러오기 실패 시 에러 메시지를 보여준다', async () => {
    setRole('MERCHANT');
    getMyMerchants.mockRejectedValue(new Error('network error'));

    render(<MerchantDashboardPage />);

    expect(await screen.findByText('업체 목록을 불러오지 못했습니다.')).toBeInTheDocument();
  });
});
